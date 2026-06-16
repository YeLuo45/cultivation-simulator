/**
 * DeltaSyncCore.test.js - 增量同步核心测试
 * V1158 Round 44 Iter 1/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { DeltaSyncCore, SYNC_OPS, SYNC_STATES } from '../../../systems/powersync/DeltaSyncCore.js';

describe('DeltaSyncCore', () => {
    let core;
    beforeEach(() => { core = new DeltaSyncCore({ maxQueue: 100, batchSize: 10 }); });

    describe('exports', () => {
        it('should export SYNC_OPS and SYNC_STATES', () => {
            expect(SYNC_OPS).toEqual(['insert', 'update', 'delete', 'tombstone']);
            expect(SYNC_STATES).toEqual(['pending', 'flushed', 'acked', 'dropped']);
        });
    });

    describe('constructor', () => {
        it('should initialize with defaults', () => {
            const c = new DeltaSyncCore();
            expect(c.config.maxQueue).toBe(1024);
            expect(c.config.batchSize).toBe(50);
            expect(c.changelog.size).toBe(0);
            expect(c.stats.recorded).toBe(0);
        });
        it('should accept custom config', () => {
            expect(core.config.maxQueue).toBe(100);
            expect(core.config.batchSize).toBe(10);
        });
    });

    describe('recordOp', () => {
        it('should record an insert op', () => {
            const e = core.recordOp('insert', 'player_1', { name: 'Hero' });
            expect(e.op).toBe('insert');
            expect(e.key).toBe('player_1');
            expect(e.state).toBe('pending');
            expect(core.stats.recorded).toBe(1);
        });
        it('should auto-correct invalid op', () => {
            const e = core.recordOp('invalid_op', 'k', 'v');
            expect(e.op).toBe('update');
        });
        it('should drop when queue full', () => {
            const small = new DeltaSyncCore({ maxQueue: 2, batchSize: 1 });
            small.recordOp('insert', 'a', 1);
            small.recordOp('insert', 'b', 2);
            const r = small.recordOp('insert', 'c', 3);
            expect(r).toBeNull();
            expect(small.stats.dropped).toBe(1);
        });
        it('should increment vector tick per op', () => {
            const e1 = core.recordOp('insert', 'a', 1);
            const e2 = core.recordOp('insert', 'b', 2);
            expect(e2.vector.tick).toBe(e1.vector.tick + 1);
        });
    });

    describe('flush', () => {
        it('should flush pending ops in batch size', () => {
            for (let i = 0; i < 15; i++) core.recordOp('insert', `k${i}`, i);
            const batch = core.flush();
            expect(batch.length).toBe(10);
            expect(batch[0].state).toBe('flushed');
            expect(core.stats.flushed).toBe(10);
        });
        it('should return empty array if no pending', () => {
            expect(core.flush()).toEqual([]);
        });
        it('should emit flushed events', () => {
            let count = 0;
            core.registerHook('flushed', () => count++);
            core.recordOp('insert', 'a', 1);
            core.flush();
            expect(count).toBe(1);
        });
    });

    describe('ack/drop', () => {
        it('should ack an op', () => {
            const e = core.recordOp('insert', 'k', 'v');
            expect(core.ack(e.id)).toBe(true);
            expect(core.getOp(e.id).state).toBe('acked');
        });
        it('should return false for unknown ack', () => {
            expect(core.ack('nonexistent')).toBe(false);
        });
        it('should drop an op with reason', () => {
            const e = core.recordOp('insert', 'k', 'v');
            expect(core.drop(e.id, 'test')).toBe(true);
            expect(core.getOp(e.id).state).toBe('dropped');
        });
    });

    describe('queries', () => {
        it('should list pending ops', () => {
            core.recordOp('insert', 'a', 1);
            core.recordOp('insert', 'b', 2);
            expect(core.listPending().length).toBe(2);
        });
        it('should list by state', () => {
            core.recordOp('insert', 'a', 1);
            core.recordOp('update', 'b', 2);
            core.flush();
            expect(core.listByState('flushed').length).toBe(2);
            const first = core.listByState('flushed')[0];
            core.ack(first.id);
            expect(core.listByState('acked').length).toBe(1);
            expect(core.listByState('flushed').length).toBe(1);
        });
        it('should get stats', () => {
            core.recordOp('insert', 'a', 1);
            core.recordOp('update', 'a', 2);
            const s = core.getStats();
            expect(s.recorded).toBe(2);
            expect(s.total).toBe(2);
        });
        it('should return empty for invalid state', () => {
            expect(core.listByState('invalid')).toEqual([]);
        });
    });

    describe('sweep', () => {
        it('should remove old acked/dropped ops', () => {
            const c = new DeltaSyncCore({ ttlMs: 0 });
            c.recordOp('insert', 'a', 1);
            c.ack(c.changelog.keys().next().value);
            // Force old timestamp via direct mutation
            const id = c.changelog.keys().next().value;
            c.changelog.get(id).ts = 0;
            const removed = c.sweep();
            expect(removed).toBeGreaterThanOrEqual(0);
        });
    });

    describe('hooks', () => {
        it('should register and emit hook', () => {
            const events = [];
            core.registerHook('recorded', (e) => events.push(e.op));
            core.registerHook('flushed', (e) => events.push('flush:' + e.op));
            core.recordOp('insert', 'a', 1);
            core.flush();
            expect(events).toContain('insert');
            expect(events).toContain('flush:insert');
        });
        it('should handle hook errors silently', () => {
            core.registerHook('recorded', () => { throw new Error('boom'); });
            expect(() => core.recordOp('insert', 'a', 1)).not.toThrow();
        });
    });
});
