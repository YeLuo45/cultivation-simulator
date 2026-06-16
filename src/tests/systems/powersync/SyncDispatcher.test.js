/**
 * SyncDispatcher.test.js - 多目的地派发器测试
 * V1169 Round 44 Iter 12/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    SyncDispatcher,
    ORDERING_MODES,
    DISPATCH_STATES,
} from '../../../systems/powersync/SyncDispatcher.js';

describe('SyncDispatcher', () => {
    let d;
    beforeEach(() => { d = new SyncDispatcher({ maxRetries: 2, retryDelayMs: 10 }); });

    describe('exports', () => {
        it('should export ORDERING_MODES', () => {
            expect(ORDERING_MODES).toContain('fifo');
            expect(ORDERING_MODES).toContain('lifo');
            expect(ORDERING_MODES).toContain('none');
        });
        it('should export DISPATCH_STATES', () => {
            expect(DISPATCH_STATES).toContain('sent');
            expect(DISPATCH_STATES).toContain('failed');
        });
    });

    describe('constructor', () => {
        it('should default fifo', () => {
            expect(d.getOrdering()).toBe('fifo');
        });
        it('should accept config', () => {
            const x = new SyncDispatcher({ ordering: 'lifo', maxRetries: 5 });
            expect(x.getOrdering()).toBe('lifo');
            expect(x.config.maxRetries).toBe(5);
        });
    });

    describe('targets', () => {
        it('addTarget valid', () => {
            expect(d.addTarget({ id: 'a', send: () => true })).toBe(true);
        });
        it('addTarget reject missing id', () => {
            expect(d.addTarget({ send: () => true })).toBe(false);
        });
        it('addTarget reject non-string id', () => {
            expect(d.addTarget({ id: 1, send: () => true })).toBe(false);
        });
        it('addTarget reject missing send', () => {
            expect(d.addTarget({ id: 'a' })).toBe(false);
        });
        it('removeTarget', () => {
            d.addTarget({ id: 'a', send: () => true });
            expect(d.removeTarget('a')).toBe(true);
            expect(d.removeTarget('a')).toBe(false);
        });
        it('listTargets', () => {
            d.addTarget({ id: 'a', send: () => true });
            d.addTarget({ id: 'b', send: () => true });
            expect(d.listTargets().length).toBe(2);
        });
        it('getTarget', () => {
            d.addTarget({ id: 'a', send: () => true });
            expect(d.getTarget('a').id).toBe('a');
            expect(d.getTarget('z')).toBeNull();
        });
        it('hasTarget', () => {
            d.addTarget({ id: 'a', send: () => true });
            expect(d.hasTarget('a')).toBe(true);
            expect(d.hasTarget('b')).toBe(false);
        });
        it('targetCount', () => {
            d.addTarget({ id: 'a', send: () => true });
            d.addTarget({ id: 'b', send: () => true });
            expect(d.targetCount()).toBe(2);
        });
    });

    describe('dispatch', () => {
        it('should fan-out to all targets', async () => {
            const r1 = [];
            const r2 = [];
            d.addTarget({ id: 'a', send: (p) => { r1.push(p); return true; } });
            d.addTarget({ id: 'b', send: (p) => { r2.push(p); return true; } });
            await d.dispatch({ x: 1 });
            expect(r1.length).toBe(1);
            expect(r2.length).toBe(1);
        });
        it('should increment dispatched stat', async () => {
            d.addTarget({ id: 'a', send: () => true });
            await d.dispatch({ x: 1 });
            expect(d.stats.dispatched).toBe(1);
        });
        it('should count sent', async () => {
            d.addTarget({ id: 'a', send: () => true });
            await d.dispatch({ x: 1 });
            expect(d.stats.sent).toBe(1);
        });
        it('should count failed when send returns false', async () => {
            d.addTarget({ id: 'a', send: () => false });
            await d.dispatch({ x: 1 });
            expect(d.stats.failed).toBe(1);
        });
        it('should count failed on throw', async () => {
            d.addTarget({ id: 'a', send: () => { throw new Error('boom'); } });
            await d.dispatch({ x: 1 });
            expect(d.stats.failed).toBe(1);
        });
        it('should enqueue retry on failure', async () => {
            d.addTarget({ id: 'a', send: () => false });
            await d.dispatch({ x: 1 });
            expect(d.retryCount()).toBe(1);
        });
        it('should skip retry when opts.retry=false', async () => {
            d.addTarget({ id: 'a', send: () => false });
            await d.dispatch({ x: 1 }, { retry: false });
            expect(d.retryCount()).toBe(0);
        });
        it('should record results per target', async () => {
            d.addTarget({ id: 'a', send: () => true });
            d.addTarget({ id: 'b', send: () => false });
            const e = await d.dispatch({ x: 1 });
            expect(e.results.length).toBe(2);
            expect(e.results.find(r => r.targetId === 'a').ok).toBe(true);
            expect(e.results.find(r => r.targetId === 'b').ok).toBe(false);
        });
    });

    describe('withOrdering', () => {
        it('fifo preserves order', () => {
            const r = d.withOrdering([1, 2, 3]);
            expect(r).toEqual([1, 2, 3]);
        });
        it('lifo reverses', () => {
            d.setOrdering('lifo');
            const r = d.withOrdering([1, 2, 3]);
            expect(r).toEqual([3, 2, 1]);
        });
        it('none preserves order', () => {
            d.setOrdering('none');
            const r = d.withOrdering([1, 2, 3]);
            expect(r).toEqual([1, 2, 3]);
        });
        it('invalid input returns empty', () => {
            expect(d.withOrdering(null)).toEqual([]);
        });
        it('setOrdering valid', () => {
            expect(d.setOrdering('lifo')).toBe(true);
            expect(d.getOrdering()).toBe('lifo');
        });
        it('setOrdering invalid', () => {
            expect(d.setOrdering('bogus')).toBe(false);
        });
        it('dispatch uses lifo order', async () => {
            d.setOrdering('lifo');
            const order = [];
            d.addTarget({ id: 'a', send: () => { order.push('a'); return true; } });
            d.addTarget({ id: 'b', send: () => { order.push('b'); return true; } });
            await d.dispatch({});
            expect(order).toEqual(['b', 'a']);
        });
    });

    describe('processRetries', () => {
        it('should process due retries', async () => {
            d.addTarget({ id: 'a', send: () => false });
            await d.dispatch({});
            const n = await d.processRetries();
            expect(n).toBe(1);
        });
        it('should succeed and remove on next attempt', async () => {
            let calls = 0;
            d.addTarget({ id: 'a', send: () => { calls++; return calls > 1; } });
            await d.dispatch({});
            await d.processRetries();
            expect(d.retryCount()).toBe(0);
            expect(d.stats.retried).toBe(1);
        });
        it('should drop after maxRetries', async () => {
            d.addTarget({ id: 'a', send: () => false });
            await d.dispatch({});
            await d.processRetries();
            await d.processRetries(Date.now() + 100000);
            await d.processRetries(Date.now() + 200000);
            expect(d.retryCount()).toBe(0);
        });
        it('should skip future-scheduled retries', async () => {
            d.addTarget({ id: 'a', send: () => false });
            await d.dispatch({});
            // first process will fail and reschedule with backoff
            await d.processRetries();
            expect(d.retryCount()).toBe(1); // still pending
            // now ask with a timestamp before the nextAt: should be 0
            const n = await d.processRetries(Date.now() - 1000000);
            expect(n).toBe(0);
        });
        it('should drop retry when target removed', async () => {
            d.addTarget({ id: 'a', send: () => false });
            await d.dispatch({});
            d.removeTarget('a');
            await d.processRetries();
            expect(d.retryCount()).toBe(0);
        });
    });

    describe('queries', () => {
        it('listHistory', async () => {
            d.addTarget({ id: 'a', send: () => true });
            await d.dispatch({});
            expect(d.listHistory().length).toBe(1);
        });
        it('listRetries returns copy', async () => {
            d.addTarget({ id: 'a', send: () => false });
            await d.dispatch({});
            const r = d.listRetries();
            expect(r.length).toBe(1);
        });
        it('clear resets', async () => {
            d.addTarget({ id: 'a', send: () => true });
            await d.dispatch({});
            d.clear();
            expect(d.targetCount()).toBe(0);
            expect(d.historyLength()).toBe(0);
        });
        it('getStats includes all', async () => {
            d.addTarget({ id: 'a', send: () => true });
            await d.dispatch({});
            const s = d.getStats();
            expect(s.dispatched).toBe(1);
            expect(s.targets).toBe(1);
        });
    });

    describe('hooks', () => {
        it('should emit targetAdded', () => {
            let fired = false;
            d.registerHook('targetAdded', () => { fired = true; });
            d.addTarget({ id: 'a', send: () => true });
            expect(fired).toBe(true);
        });
        it('should emit dispatched', async () => {
            let captured = null;
            d.registerHook('dispatched', (e) => { captured = e; });
            d.addTarget({ id: 'a', send: () => true });
            await d.dispatch({ x: 1 });
            expect(captured.payload.x).toBe(1);
        });
        it('hook errors swallowed', () => {
            d.registerHook('targetAdded', () => { throw new Error('x'); });
            expect(() => d.addTarget({ id: 'a', send: () => true })).not.toThrow();
        });
    });
});
