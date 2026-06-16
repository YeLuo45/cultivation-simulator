/**
 * SyncQueue.test.js - 同步队列测试
 * V1162 Round 44 Iter 5/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { SyncQueue, PRIORITIES } from '../../../systems/powersync/SyncQueue.js';

describe('SyncQueue', () => {
    let q;
    beforeEach(() => { q = new SyncQueue({ maxSize: 10 }); });

    describe('exports', () => {
        it('should export PRIORITIES', () => {
            expect(PRIORITIES).toContain('high');
            expect(PRIORITIES).toContain('medium');
            expect(PRIORITIES).toContain('low');
        });
    });

    describe('constructor', () => {
        it('should initialize empty', () => {
            expect(q.size()).toBe(0);
            expect(q.isFull()).toBe(false);
        });
        it('should accept custom config', () => {
            const x = new SyncQueue({ maxSize: 5, defaultPriority: 'high' });
            expect(x.config.maxSize).toBe(5);
        });
    });

    describe('enqueue', () => {
        it('should enqueue with default priority', () => {
            const e = q.enqueue({ id: 1 });
            expect(e.priority).toBe('medium');
            expect(e.item.id).toBe(1);
        });
        it('should enqueue with high priority', () => {
            const e = q.enqueue({ id: 1 }, 'high');
            expect(e.priority).toBe('high');
        });
        it('should fallback to default for invalid priority', () => {
            const e = q.enqueue({ id: 1 }, 'urgent');
            expect(e.priority).toBe('medium');
        });
        it('should reject when full', () => {
            const small = new SyncQueue({ maxSize: 2 });
            small.enqueue({ id: 1 });
            small.enqueue({ id: 2 });
            const r = small.enqueue({ id: 3 });
            expect(r).toBeNull();
            expect(small.stats.rejected).toBe(1);
        });
        it('should track by id', () => {
            const e = q.enqueue({ id: 1 });
            expect(q.get(e.id)).toBeTruthy();
        });
    });

    describe('dequeue', () => {
        it('should return null on empty queue', () => {
            expect(q.dequeue()).toBeNull();
        });
        it('should return high first', () => {
            q.enqueue({ tag: 'low' }, 'low');
            q.enqueue({ tag: 'high' }, 'high');
            q.enqueue({ tag: 'med' }, 'medium');
            const e = q.dequeue();
            expect(e.item.tag).toBe('high');
        });
        it('should be FIFO within same priority', () => {
            q.enqueue({ tag: 'a' }, 'high');
            q.enqueue({ tag: 'b' }, 'high');
            expect(q.dequeue().item.tag).toBe('a');
            expect(q.dequeue().item.tag).toBe('b');
        });
        it('should pick medium when no high', () => {
            q.enqueue({ tag: 'low' }, 'low');
            q.enqueue({ tag: 'med' }, 'medium');
            expect(q.dequeue().item.tag).toBe('med');
        });
        it('should pick low when no high/medium', () => {
            q.enqueue({ tag: 'low1' }, 'low');
            q.enqueue({ tag: 'low2' }, 'low');
            expect(q.dequeue().item.tag).toBe('low1');
        });
        it('should skip entries with future retryAt', () => {
            q.enqueue({ tag: 'a' });
            const first = q.dequeue();
            q.retry(first.id, 1000);
            q.enqueue({ tag: 'b' });
            // retry-scheduled entry is in head of 'medium', so dequeue should pick 'b'
            // because b is in the same priority queue, but retry pushed to head
            const next = q.dequeue();
            expect(next.item.tag).toBe('b');
        });
    });

    describe('backpressure', () => {
        it('should report isFull when at capacity', () => {
            const small = new SyncQueue({ maxSize: 1 });
            small.enqueue({ id: 1 });
            expect(small.isFull()).toBe(true);
        });
        it('should not be full when below capacity', () => {
            const small = new SyncQueue({ maxSize: 3 });
            small.enqueue({ id: 1 });
            expect(small.isFull()).toBe(false);
        });
    });

    describe('retry', () => {
        it('should re-queue an item by id', () => {
            q.enqueue({ id: 1 });
            const e = q.dequeue();
            const ok = q.retry(e.id, 0);
            expect(ok).toBe(true);
            expect(q.size()).toBe(1);
        });
        it('should increment attempts', () => {
            const e = q.enqueue({ id: 1 });
            const d = q.dequeue();
            q.retry(d.id);
            const entry = q.get(d.id);
            expect(entry.attempts).toBe(1);
        });
        it('should return false for unknown id', () => {
            expect(q.retry('fake_id')).toBe(false);
        });
        it('should track retried stat', () => {
            const d = q.enqueue({ id: 1 });
            q.dequeue();
            q.retry(d.id);
            expect(q.stats.retried).toBe(1);
        });
    });

    describe('queries', () => {
        it('listAll should return all entries', () => {
            q.enqueue({ id: 1 });
            q.enqueue({ id: 2 });
            expect(q.listAll().length).toBe(2);
        });
        it('listByPriority should filter', () => {
            q.enqueue({ id: 1 }, 'high');
            q.enqueue({ id: 2 }, 'low');
            expect(q.listByPriority('high').length).toBe(1);
        });
        it('listByPriority with invalid', () => {
            expect(q.listByPriority('urgent').length).toBe(0);
        });
        it('remove should delete by id', () => {
            const e = q.enqueue({ id: 1 });
            expect(q.remove(e.id)).toBe(true);
            expect(q.size()).toBe(0);
        });
        it('clear should empty everything', () => {
            q.enqueue({ id: 1 });
            q.enqueue({ id: 2 });
            q.clear();
            expect(q.size()).toBe(0);
        });
    });

    describe('hooks', () => {
        it('should emit enqueued', () => {
            let count = 0;
            q.registerHook('enqueued', () => count++);
            q.enqueue({ id: 1 });
            q.enqueue({ id: 2 });
            expect(count).toBe(2);
        });
        it('should emit dequeued', () => {
            let captured = null;
            q.registerHook('dequeued', (e) => { captured = e; });
            q.enqueue({ id: 1 });
            q.dequeue();
            expect(captured.item.id).toBe(1);
        });
        it('should handle hook errors silently', () => {
            q.registerHook('enqueued', () => { throw new Error('boom'); });
            expect(() => q.enqueue({ id: 1 })).not.toThrow();
        });
    });

    describe('stats', () => {
        it('getStats returns enqueued/dequeued/retried', () => {
            q.enqueue({ id: 1 });
            q.dequeue();
            const s = q.getStats();
            expect(s.enqueued).toBe(1);
            expect(s.dequeued).toBe(1);
        });
        it('getStats includes byPriority breakdown', () => {
            q.enqueue({ id: 1 }, 'high');
            q.enqueue({ id: 2 }, 'medium');
            q.enqueue({ id: 3 }, 'low');
            const s = q.getStats();
            expect(s.byPriority.high).toBe(1);
            expect(s.byPriority.medium).toBe(1);
            expect(s.byPriority.low).toBe(1);
        });
    });
});
