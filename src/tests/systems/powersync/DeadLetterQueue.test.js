/**
 * DeadLetterQueue.test.js - 死信队列测试
 * V1177 Round 44 Iter 20/30
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeadLetterQueue } from '../../../systems/powersync/DeadLetterQueue.js';

describe('DeadLetterQueue', () => {
    let dlq;
    beforeEach(() => { dlq = new DeadLetterQueue({ maxSize: 10, alertThreshold: 0.8 }); });

    describe('constructor', () => {
        it('should default maxSize 500', () => {
            const x = new DeadLetterQueue();
            expect(x.maxSize).toBe(500);
        });
        it('should default alertThreshold 0.8', () => {
            const x = new DeadLetterQueue();
            expect(x.alertThreshold).toBe(0.8);
        });
        it('should accept custom config', () => {
            const x = new DeadLetterQueue({ maxSize: 5, alertThreshold: 0.5 });
            expect(x.maxSize).toBe(5);
            expect(x.alertThreshold).toBe(0.5);
        });
        it('should start empty', () => {
            expect(dlq.size).toBe(0);
        });
    });

    describe('push', () => {
        it('should add item and return id', () => {
            const id = dlq.push({ x: 1 }, 'failed');
            expect(typeof id).toBe('string');
            expect(dlq.size).toBe(1);
        });
        it('should default reason to unknown', () => {
            const id = dlq.push({ x: 1 });
            expect(dlq.get(id).reason).toBe('unknown');
        });
        it('should record ts', () => {
            const id = dlq.push({ x: 1 });
            expect(typeof dlq.get(id).ts).toBe('number');
        });
        it('should clone item to avoid mutation', () => {
            const item = { x: 1 };
            const id = dlq.push(item, 'r');
            item.x = 999;
            expect(dlq.get(id).item.x).toBe(1);
        });
        it('should handle non-object items', () => {
            const id = dlq.push('string-item', 'r');
            expect(dlq.get(id).item).toBe('string-item');
        });
        it('should handle null items', () => {
            const id = dlq.push(null, 'r');
            expect(dlq.get(id).item).toBeNull();
        });
        it('should increment pushed stat', () => {
            dlq.push({}, 'r');
            dlq.push({}, 'r');
            expect(dlq.stats.pushed).toBe(2);
        });
    });

    describe('capacity', () => {
        it('should drop oldest when at capacity', () => {
            const x = new DeadLetterQueue({ maxSize: 3 });
            const id1 = x.push({ n: 1 }, 'r');
            x.push({ n: 2 }, 'r');
            x.push({ n: 3 }, 'r');
            x.push({ n: 4 }, 'r');
            expect(x.size).toBe(3);
            expect(x.get(id1)).toBeNull();
        });
        it('should track dropped stat', () => {
            const x = new DeadLetterQueue({ maxSize: 2 });
            x.push({}, 'r');
            x.push({}, 'r');
            x.push({}, 'r');
            expect(x.stats.dropped).toBe(1);
        });
    });

    describe('get', () => {
        it('should return entry with cloned item', () => {
            const id = dlq.push({ x: 1 }, 'r');
            const e = dlq.get(id);
            expect(e.item.x).toBe(1);
            // mutating returned item should not affect stored
            e.item.x = 999;
            expect(dlq.get(id).item.x).toBe(1);
        });
        it('should return null for unknown', () => {
            expect(dlq.get('nope')).toBeNull();
        });
    });

    describe('list', () => {
        beforeEach(() => {
            dlq.push({ n: 1 }, 'timeout');
            dlq.push({ n: 2 }, 'network');
            dlq.push({ n: 3 }, 'timeout');
        });
        it('should list all items', () => {
            expect(dlq.list().length).toBe(3);
        });
        it('should filter by reason', () => {
            const r = dlq.list({ reason: 'timeout' });
            expect(r.length).toBe(2);
        });
        it('should filter by since', () => {
            const r = dlq.list({ since: Date.now() + 100000 });
            expect(r.length).toBe(0);
        });
        it('should return cloned items', () => {
            const r = dlq.list();
            r[0].item.x = 999;
            expect(dlq.list()[0].item.x).not.toBe(999);
        });
    });

    describe('replay', () => {
        it('should call handler and remove on success', async () => {
            const id = dlq.push({ x: 1 }, 'r');
            const handler = vi.fn(async () => true);
            const r = await dlq.replay(id, handler);
            expect(r.ok).toBe(true);
            expect(handler).toHaveBeenCalledTimes(1);
            expect(dlq.get(id)).toBeNull();
        });
        it('should pass item to handler', async () => {
            const id = dlq.push({ x: 1 }, 'r');
            let received = null;
            await dlq.replay(id, async (item) => { received = item; return true; });
            expect(received.x).toBe(1);
        });
        it('should not remove when handler returns false', async () => {
            const id = dlq.push({ x: 1 }, 'r');
            const r = await dlq.replay(id, async () => false);
            expect(r.ok).toBe(false);
            expect(dlq.get(id)).not.toBeNull();
        });
        it('should not remove when handler throws', async () => {
            const id = dlq.push({ x: 1 }, 'r');
            const r = await dlq.replay(id, async () => { throw new Error('x'); });
            expect(r.ok).toBe(false);
            expect(dlq.get(id)).not.toBeNull();
        });
        it('should return not_found for unknown id', async () => {
            const r = await dlq.replay('nope', async () => true);
            expect(r.ok).toBe(false);
            expect(r.reason).toBe('not_found');
        });
        it('should return invalid_handler for non-function', async () => {
            const id = dlq.push({ x: 1 }, 'r');
            const r = await dlq.replay(id, 'nope');
            expect(r.ok).toBe(false);
            expect(r.reason).toBe('invalid_handler');
        });
        it('should increment replayed stat on success', async () => {
            const id = dlq.push({ x: 1 }, 'r');
            await dlq.replay(id, async () => true);
            expect(dlq.stats.replayed).toBe(1);
        });
        it('should increment replayFailures stat on fail', async () => {
            const id = dlq.push({ x: 1 }, 'r');
            await dlq.replay(id, async () => false);
            expect(dlq.stats.replayFailures).toBe(1);
        });
        it('should support sync handler returning true', async () => {
            const id = dlq.push({ x: 1 }, 'r');
            const r = await dlq.replay(id, () => true);
            expect(r.ok).toBe(true);
        });
    });

    describe('remove', () => {
        it('should remove by id', () => {
            const id = dlq.push({ x: 1 }, 'r');
            expect(dlq.remove(id)).toBe(true);
            expect(dlq.get(id)).toBeNull();
        });
        it('should return false for unknown', () => {
            expect(dlq.remove('nope')).toBe(false);
        });
        it('should increment removed stat', () => {
            const id = dlq.push({ x: 1 }, 'r');
            dlq.remove(id);
            expect(dlq.stats.removed).toBe(1);
        });
    });

    describe('clear', () => {
        it('should clear all', () => {
            dlq.push({ x: 1 }, 'r');
            dlq.push({ x: 2 }, 'r');
            expect(dlq.clear()).toBe(2);
            expect(dlq.size).toBe(0);
        });
        it('should return 0 when empty', () => {
            expect(dlq.clear()).toBe(0);
        });
        it('should reset alert state', () => {
            const x = new DeadLetterQueue({ maxSize: 5, alertThreshold: 0.5 });
            for (let i = 0; i < 5; i++) x.push({}, 'r');
            expect(x.isAlerting()).toBe(true);
            x.clear();
            expect(x.isAlerting()).toBe(false);
        });
    });

    describe('alertLevel / isAlerting', () => {
        it('alertLevel should be 0 when empty', () => {
            expect(dlq.alertLevel).toBe(0);
        });
        it('alertLevel should be size/maxSize', () => {
            const x = new DeadLetterQueue({ maxSize: 10, alertThreshold: 0.5 });
            x.push({}, 'r');
            x.push({}, 'r');
            x.push({}, 'r');
            expect(x.alertLevel).toBeCloseTo(0.3);
        });
        it('isAlerting false when below threshold', () => {
            const x = new DeadLetterQueue({ maxSize: 10, alertThreshold: 0.8 });
            x.push({}, 'r');
            expect(x.isAlerting()).toBe(false);
        });
        it('isAlerting true when at/above threshold', () => {
            const x = new DeadLetterQueue({ maxSize: 10, alertThreshold: 0.8 });
            for (let i = 0; i < 8; i++) x.push({}, 'r');
            expect(x.isAlerting()).toBe(true);
        });
        it('isAlerting at exact threshold', () => {
            const x = new DeadLetterQueue({ maxSize: 5, alertThreshold: 0.6 });
            for (let i = 0; i < 3; i++) x.push({}, 'r');
            expect(x.isAlerting()).toBe(true);
        });
        it('should emit alert when crossing threshold', () => {
            const x = new DeadLetterQueue({ maxSize: 5, alertThreshold: 0.6 });
            let alertPayload = null;
            x.registerHook('alert', (p) => { alertPayload = p; });
            x.push({}, 'r');
            x.push({}, 'r');
            x.push({}, 'r');
            expect(alertPayload).not.toBeNull();
            expect(alertPayload.level).toBeGreaterThanOrEqual(0.6);
        });
        it('should not re-emit alert on subsequent pushes while still alerting', () => {
            const x = new DeadLetterQueue({ maxSize: 5, alertThreshold: 0.6 });
            let count = 0;
            x.registerHook('alert', () => { count++; });
            for (let i = 0; i < 5; i++) x.push({}, 'r');
            expect(count).toBe(1);
        });
    });

    describe('hooks', () => {
        it('should emit pushed', () => {
            let captured = null;
            dlq.registerHook('pushed', (p) => { captured = p; });
            dlq.push({ x: 1 }, 'r');
            expect(captured.item.x).toBe(1);
        });
        it('should emit dropped when at capacity', () => {
            const x = new DeadLetterQueue({ maxSize: 2 });
            let dropped = null;
            x.registerHook('dropped', (p) => { dropped = p; });
            x.push({}, 'r');
            x.push({}, 'r');
            x.push({}, 'r');
            expect(dropped).not.toBeNull();
        });
        it('should emit replayed on successful replay', async () => {
            let captured = null;
            dlq.registerHook('replayed', (p) => { captured = p; });
            const id = dlq.push({ x: 1 }, 'r');
            await dlq.replay(id, async () => true);
            expect(captured.id).toBe(id);
        });
        it('should emit removed', () => {
            let captured = null;
            dlq.registerHook('removed', (p) => { captured = p; });
            const id = dlq.push({ x: 1 }, 'r');
            dlq.remove(id);
            expect(captured.id).toBe(id);
        });
        it('should emit cleared', () => {
            let captured = null;
            dlq.registerHook('cleared', (p) => { captured = p; });
            dlq.push({ x: 1 }, 'r');
            dlq.clear();
            expect(captured.count).toBe(1);
        });
        it('should swallow hook errors', () => {
            dlq.registerHook('pushed', () => { throw new Error('x'); });
            expect(() => dlq.push({ x: 1 }, 'r')).not.toThrow();
        });
    });

    describe('getStats', () => {
        it('should include alert state', () => {
            const x = new DeadLetterQueue({ maxSize: 5, alertThreshold: 0.5 });
            for (let i = 0; i < 3; i++) x.push({}, 'r');
            const s = x.getStats();
            expect(s.size).toBe(3);
            expect(s.maxSize).toBe(5);
            expect(s.alerting).toBe(true);
            expect(s.alertLevel).toBeGreaterThanOrEqual(0.5);
        });
    });
});
