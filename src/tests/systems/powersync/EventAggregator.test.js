/**
 * EventAggregator.test.js - 事件聚合器测试
 * V1170 Round 44 Iter 13/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    EventAggregator,
    AGGREGATOR_STATES,
} from '../../../systems/powersync/EventAggregator.js';

describe('EventAggregator', () => {
    let agg;
    beforeEach(() => { agg = new EventAggregator({ windowMs: 100, maxBatch: 5, dedupeWindowMs: 50, minIntervalMs: 0 }); });

    describe('exports', () => {
        it('should export AGGREGATOR_STATES', () => {
            expect(AGGREGATOR_STATES).toContain('idle');
            expect(AGGREGATOR_STATES).toContain('collecting');
        });
    });

    describe('constructor', () => {
        it('should start idle', () => {
            expect(agg.getState()).toBe('idle');
            expect(agg.size()).toBe(0);
        });
        it('should use defaults', () => {
            const x = new EventAggregator();
            expect(x.config.maxBatch).toBe(100);
            expect(x.config.windowMs).toBe(1000);
        });
    });

    describe('add', () => {
        it('should add an event', () => {
            const r = agg.add({ id: 'a' });
            expect(r.added).toBe(true);
            expect(agg.size()).toBe(1);
        });
        it('should auto-generate id when not provided', () => {
            agg.add({ msg: 'hi' });
            expect(agg.size()).toBe(1);
        });
        it('should dedupe duplicate ids', () => {
            agg.add({ id: 'a' });
            const r = agg.add({ id: 'a' });
            expect(r.added).toBe(false);
            expect(r.reason).toBe('duplicate');
            expect(agg.stats.deduped).toBe(1);
        });
        it('force override dedupe', () => {
            agg.add({ id: 'a' });
            const r = agg.add({ id: 'a' }, { force: true });
            expect(r.added).toBe(true);
        });
        it('should auto-flush when maxBatch reached', () => {
            for (let i = 0; i < 5; i++) agg.add({ id: `e${i}` });
            expect(agg.size()).toBe(0);
            expect(agg.stats.autoFlush).toBe(1);
        });
        it('should track added stat', () => {
            agg.add({ id: 'a' });
            agg.add({ id: 'b' });
            expect(agg.stats.added).toBe(2);
        });
        it('should change state to collecting', () => {
            agg.add({ id: 'a' });
            expect(agg.getState()).toBe('collecting');
        });
    });

    describe('flush', () => {
        it('should return empty when buffer empty', () => {
            const r = agg.flush();
            expect(r).toEqual([]);
        });
        it('should return all buffered events', () => {
            agg.add({ id: 'a' });
            agg.add({ id: 'b' });
            const batch = agg.flush();
            expect(batch.length).toBe(2);
            expect(batch[0].id).toBe('a');
        });
        it('should clear buffer', () => {
            agg.add({ id: 'a' });
            agg.flush();
            expect(agg.size()).toBe(0);
        });
        it('should track lastFlush timestamp', () => {
            agg.add({ id: 'a' });
            const before = Date.now();
            agg.flush();
            expect(agg.lastFlushTs()).toBeGreaterThanOrEqual(before);
        });
        it('should increment flushed stat', () => {
            agg.add({ id: 'a' });
            agg.flush();
            expect(agg.stats.flushed).toBe(1);
        });
    });

    describe('dedupe window', () => {
        it('should expire seen entries after dedupeWindowMs', () => {
            const a = new EventAggregator({ dedupeWindowMs: 10 });
            a.add({ id: 'x' });
            // simulate time passing: force-clear both dedupe seen and throttle map
            a.seen.set('x', Date.now() - 1000);
            a.lastEmitTs.set('x', Date.now() - 1000);
            a._pruneSeen(Date.now());
            const r = a.add({ id: 'x' });
            expect(r.added).toBe(true);
        });
    });

    describe('minInterval de-noise', () => {
        it('should throttle fast repeats', () => {
            const a = new EventAggregator({ minIntervalMs: 100 });
            a.add({ id: 'x' });
            const r = a.add({ id: 'x' });
            expect(r.added).toBe(false);
            expect(r.reason).toBe('throttled');
        });
        it('should not throttle after interval', async () => {
            const a = new EventAggregator({ minIntervalMs: 20, dedupeWindowMs: 0 });
            a.add({ id: 'x' });
            await new Promise(r => setTimeout(r, 30));
            const r = a.add({ id: 'x' });
            expect(r.added).toBe(true);
        });
    });

    describe('tick', () => {
        it('should auto-flush on window expiry', () => {
            agg.add({ id: 'a' });
            const r = agg.tick(Date.now() + 1000);
            expect(r.length).toBe(1);
            expect(agg.size()).toBe(0);
        });
        it('should not flush before window', () => {
            agg.add({ id: 'a' });
            const r = agg.tick(Date.now() + 10);
            expect(r.length).toBe(0);
            expect(agg.size()).toBe(1);
        });
        it('should return empty on empty buffer', () => {
            expect(agg.tick()).toEqual([]);
        });
    });

    describe('setters', () => {
        it('setWindow valid', () => {
            expect(agg.setWindow(500)).toBe(true);
            expect(agg.config.windowMs).toBe(500);
        });
        it('setWindow invalid', () => {
            expect(agg.setWindow(0)).toBe(false);
            expect(agg.setWindow('big')).toBe(false);
        });
        it('setMaxBatch valid', () => {
            expect(agg.setMaxBatch(50)).toBe(true);
            expect(agg.config.maxBatch).toBe(50);
        });
        it('setMaxBatch invalid', () => {
            expect(agg.setMaxBatch(-1)).toBe(false);
        });
        it('setMinInterval valid', () => {
            expect(agg.setMinInterval(100)).toBe(true);
        });
        it('setMinInterval invalid', () => {
            expect(agg.setMinInterval(-5)).toBe(false);
        });
    });

    describe('queries', () => {
        it('listBuffer returns copy', () => {
            agg.add({ id: 'a' });
            const b = agg.listBuffer();
            expect(b.length).toBe(1);
        });
        it('listSeen returns ids', () => {
            agg.add({ id: 'a' });
            expect(agg.listSeen()).toContain('a');
        });
        it('isFull', () => {
            expect(agg.isFull()).toBe(false);
            for (let i = 0; i < 5; i++) agg.add({ id: `e${i}` });
            expect(agg.isFull()).toBe(false); // auto-flushed
        });
        it('clear empties', () => {
            agg.add({ id: 'a' });
            agg.clear();
            expect(agg.size()).toBe(0);
            expect(agg.seen.size).toBe(0);
        });
    });

    describe('stats', () => {
        it('getStats includes all', () => {
            agg.add({ id: 'a' });
            const s = agg.getStats();
            expect(s.added).toBe(1);
            expect(s.size).toBe(1);
            expect(s.maxBatch).toBe(5);
        });
    });

    describe('hooks', () => {
        it('should emit added', () => {
            let captured = null;
            agg.registerHook('added', (e) => { captured = e; });
            agg.add({ id: 'a' });
            expect(captured.id).toBe('a');
        });
        it('should emit flushed', () => {
            let captured = null;
            agg.registerHook('flushed', (e) => { captured = e; });
            agg.add({ id: 'a' });
            agg.flush();
            expect(captured.count).toBe(1);
        });
        it('should emit deduped', () => {
            let fired = false;
            agg.registerHook('deduped', () => { fired = true; });
            agg.add({ id: 'a' });
            agg.add({ id: 'a' });
            expect(fired).toBe(true);
        });
        it('should emit throttled', () => {
            const a = new EventAggregator({ minIntervalMs: 100 });
            let fired = false;
            a.registerHook('throttled', () => { fired = true; });
            a.add({ id: 'x' });
            a.add({ id: 'x' });
            expect(fired).toBe(true);
        });
        it('hook errors swallowed', () => {
            agg.registerHook('added', () => { throw new Error('x'); });
            expect(() => agg.add({ id: 'a' })).not.toThrow();
        });
    });
});
