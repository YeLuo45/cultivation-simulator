/**
 * OfflineBuffer.test.js - 离线写前日志测试
 * V1171 Round 44 Iter 14/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    OfflineBuffer,
    BUFFER_STATES,
} from '../../../systems/powersync/OfflineBuffer.js';

describe('OfflineBuffer', () => {
    let buf;
    beforeEach(() => { buf = new OfflineBuffer({ maxEntries: 10, flushBatchSize: 3 }); });

    describe('exports', () => {
        it('should export BUFFER_STATES', () => {
            expect(BUFFER_STATES).toContain('empty');
            expect(BUFFER_STATES).toContain('partial');
            expect(BUFFER_STATES).toContain('full');
            expect(BUFFER_STATES).toContain('draining');
        });
    });

    describe('constructor', () => {
        it('should start empty', () => {
            expect(buf.size()).toBe(0);
            expect(buf.getState()).toBe('empty');
        });
        it('should use defaults', () => {
            const x = new OfflineBuffer();
            expect(x.config.maxEntries).toBe(1000);
            expect(x.config.flushBatchSize).toBe(50);
        });
    });

    describe('write', () => {
        it('should write a payload', () => {
            const e = buf.write({ data: 1 });
            expect(e.payload.data).toBe(1);
            expect(buf.size()).toBe(1);
        });
        it('should reject when full', () => {
            const small = new OfflineBuffer({ maxEntries: 2 });
            small.write({ a: 1 });
            small.write({ a: 2 });
            const r = small.write({ a: 3 });
            expect(r).toBeNull();
            expect(small.stats.dropped).toBe(1);
        });
        it('should reject duplicate id', () => {
            buf.write({ a: 1 }, { id: 'x' });
            const r = buf.write({ a: 2 }, { id: 'x' });
            expect(r).toBeNull();
        });
        it('should track written stat', () => {
            buf.write({ a: 1 });
            buf.write({ a: 2 });
            expect(buf.stats.written).toBe(2);
        });
        it('should transition to partial state', () => {
            buf.write({ a: 1 });
            expect(buf.getState()).toBe('partial');
        });
        it('should transition to full state', () => {
            for (let i = 0; i < 10; i++) buf.write({ a: i });
            expect(buf.getState()).toBe('full');
        });
    });

    describe('flush', () => {
        it('should return zero on empty', async () => {
            const r = await buf.flush(async () => true);
            expect(r.flushed).toBe(0);
        });
        it('should reject non-function writer', async () => {
            buf.write({ a: 1 });
            const r = await buf.flush('not fn');
            expect(r.flushed).toBe(0);
        });
        it('should flush all entries successfully', async () => {
            buf.write({ a: 1 });
            buf.write({ a: 2 });
            const writer = async () => true;
            const r = await buf.flush(writer);
            expect(r.flushed).toBe(2);
            expect(buf.size()).toBe(0);
        });
        it('should not delete on failed flush', async () => {
            buf.write({ a: 1 });
            const r = await buf.flush(async () => false);
            expect(r.failed).toBe(1);
            expect(buf.size()).toBe(1);
        });
        it('should catch writer errors', async () => {
            buf.write({ a: 1 });
            const r = await buf.flush(async () => { throw new Error('boom'); });
            expect(r.failed).toBe(1);
            expect(buf.size()).toBe(1);
        });
        it('should process in batches', async () => {
            for (let i = 0; i < 7; i++) buf.write({ a: i });
            const r = await buf.flush(async () => true);
            expect(r.flushed).toBe(7);
        });
        it('should stop on first batch failure', async () => {
            for (let i = 0; i < 7; i++) buf.write({ a: i });
            const r = await buf.flush(async () => false);
            expect(r.flushed).toBe(0);
            expect(r.failed).toBe(3); // batchSize=3
        });
        it('should pass entry to writer', async () => {
            let captured = null;
            buf.write({ data: 'hello' });
            await buf.flush(async (e) => { captured = e; return true; });
            expect(captured.payload.data).toBe('hello');
        });
        it('should update drained count', async () => {
            buf.write({ a: 1 });
            await buf.flush(async () => true);
            expect(buf.drainedCount()).toBe(1);
        });
        it('should record history', async () => {
            buf.write({ a: 1 });
            await buf.flush(async () => true);
            expect(buf.listHistory().length).toBe(1);
        });
        it('should increment attempts on failure', async () => {
            buf.write({ a: 1 });
            await buf.flush(async () => false);
            const e = buf.peek()[0];
            expect(e.attempts).toBe(1);
        });
    });

    describe('capacity', () => {
        it('capacity used/total', () => {
            buf.write({ a: 1 });
            const c = buf.capacity();
            expect(c.used).toBe(1);
            expect(c.total).toBe(10);
        });
        it('isFull', () => {
            expect(buf.isFull()).toBe(false);
            for (let i = 0; i < 10; i++) buf.write({ a: i });
            expect(buf.isFull()).toBe(true);
        });
        it('isEmpty', () => {
            expect(buf.isEmpty()).toBe(true);
            buf.write({ a: 1 });
            expect(buf.isEmpty()).toBe(false);
        });
    });

    describe('queries', () => {
        it('peek returns copy', () => {
            buf.write({ a: 1 });
            const p = buf.peek();
            expect(p.length).toBe(1);
        });
        it('peek with n', () => {
            for (let i = 0; i < 5; i++) buf.write({ a: i });
            expect(buf.peek(3).length).toBe(3);
        });
        it('get by id', () => {
            const e = buf.write({ a: 1 });
            expect(buf.get(e.id).payload.a).toBe(1);
        });
        it('get unknown', () => {
            expect(buf.get('nope')).toBeNull();
        });
        it('listAll', () => {
            buf.write({ a: 1 });
            buf.write({ a: 2 });
            expect(buf.listAll().length).toBe(2);
        });
        it('remove by id', () => {
            const e = buf.write({ a: 1 });
            expect(buf.remove(e.id)).toBe(true);
            expect(buf.size()).toBe(0);
        });
        it('remove unknown', () => {
            expect(buf.remove('nope')).toBe(false);
        });
        it('clear empties', () => {
            buf.write({ a: 1 });
            buf.clear();
            expect(buf.size()).toBe(0);
        });
        it('clearHistory', () => {
            buf.write({ a: 1 });
            buf.flush(async () => true);
            buf.clearHistory();
            expect(buf.listHistory().length).toBe(0);
        });
    });

    describe('setters', () => {
        it('setMaxEntries valid', () => {
            expect(buf.setMaxEntries(20)).toBe(true);
            expect(buf.config.maxEntries).toBe(20);
        });
        it('setMaxEntries invalid', () => {
            expect(buf.setMaxEntries(0)).toBe(false);
        });
        it('setFlushBatchSize valid', () => {
            expect(buf.setFlushBatchSize(10)).toBe(true);
        });
        it('setFlushBatchSize invalid', () => {
            expect(buf.setFlushBatchSize(-1)).toBe(false);
        });
    });

    describe('stats', () => {
        it('getStats includes all', async () => {
            buf.write({ a: 1 });
            await buf.flush(async () => true);
            const s = buf.getStats();
            expect(s.flushed).toBe(1);
            expect(s.drained).toBe(1);
            expect(s.capacity.total).toBe(10);
        });
    });

    describe('hooks', () => {
        it('should emit written', () => {
            let captured = null;
            buf.registerHook('written', (e) => { captured = e; });
            buf.write({ a: 1 });
            expect(captured.payload.a).toBe(1);
        });
        it('should emit flushed', async () => {
            let captured = null;
            buf.registerHook('flushed', (e) => { captured = e; });
            buf.write({ a: 1 });
            await buf.flush(async () => true);
            expect(captured.payload.a).toBe(1);
        });
        it('should emit flushFailed', async () => {
            let fired = false;
            buf.registerHook('flushFailed', () => { fired = true; });
            buf.write({ a: 1 });
            await buf.flush(async () => false);
            expect(fired).toBe(true);
        });
        it('should emit dropped when full', () => {
            const small = new OfflineBuffer({ maxEntries: 1 });
            small.write({ a: 1 });
            let captured = null;
            small.registerHook('dropped', (e) => { captured = e; });
            small.write({ a: 2 });
            expect(captured.reason).toBe('full');
        });
        it('hook errors swallowed', () => {
            buf.registerHook('written', () => { throw new Error('x'); });
            expect(() => buf.write({ a: 1 })).not.toThrow();
        });
    });
});
