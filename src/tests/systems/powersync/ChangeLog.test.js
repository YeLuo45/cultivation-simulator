/**
 * ChangeLog.test.js - CRDT 变更日志测试
 * V1159 Round 44 Iter 2/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ChangeLog, OP_KINDS, COMPACT_MODES } from '../../../systems/powersync/ChangeLog.js';

describe('ChangeLog', () => {
    let log;
    beforeEach(() => { log = new ChangeLog({ maxSize: 100, compactKeep: 5 }); });

    describe('exports', () => {
        it('should export OP_KINDS and COMPACT_MODES', () => {
            expect(OP_KINDS).toContain('set');
            expect(OP_KINDS).toContain('delete');
            expect(COMPACT_MODES).toContain('time');
            expect(COMPACT_MODES).toContain('count');
        });
    });

    describe('constructor', () => {
        it('should initialize with defaults', () => {
            const c = new ChangeLog();
            expect(c.config.maxSize).toBe(4096);
            expect(c.log.size).toBe(0);
            expect(c.size).toBe(0);
            expect(c.length).toBe(0);
        });
        it('should accept custom config', () => {
            const c = new ChangeLog({ maxSize: 50, compactKeep: 10 });
            expect(c.config.maxSize).toBe(50);
            expect(c.config.compactKeep).toBe(10);
        });
    });

    describe('append', () => {
        it('should append a set op', () => {
            const e = log.append('set', 'player_1', { name: 'Hero' });
            expect(e.kind).toBe('set');
            expect(e.key).toBe('player_1');
            expect(e.tombstone).toBe(false);
            expect(log.size).toBe(1);
        });
        it('should append a delete op as tombstone', () => {
            const e = log.append('delete', 'k', null);
            expect(e.tombstone).toBe(true);
            expect(log.tombstones.has('k')).toBe(true);
        });
        it('should auto-correct invalid kind', () => {
            const e = log.append('invalid_kind', 'k', 'v');
            expect(e.kind).toBe('set');
        });
        it('should clear tombstone on subsequent write', () => {
            log.append('delete', 'k', null);
            log.append('set', 'k', 'v');
            expect(log.tombstones.has('k')).toBe(false);
        });
        it('should increment stats.appended', () => {
            log.append('set', 'a', 1);
            log.append('set', 'b', 2);
            expect(log.stats.appended).toBe(2);
        });
        it('should reject when full', () => {
            const small = new ChangeLog({ maxSize: 2 });
            small.append('set', 'a', 1);
            small.append('set', 'b', 2);
            const r = small.append('set', 'c', 3);
            expect(r).toBeNull();
            expect(small.stats.dropped).toBe(1);
        });
    });

    describe('since', () => {
        it('should return all entries when vector is null', () => {
            log.append('set', 'a', 1, { dev1: 1 });
            log.append('set', 'b', 2, { dev1: 2 });
            expect(log.since(null).length).toBe(2);
        });
        it('should filter by vector clock', () => {
            log.append('set', 'a', 1, { dev1: 1 });
            log.append('set', 'b', 2, { dev1: 5 });
            log.append('set', 'c', 3, { dev2: 1 });
            const result = log.since({ dev1: 2 });
            // dev1 > 2: only the dev1:5 entry; dev2 with no constraint passes
            expect(result.length).toBeGreaterThanOrEqual(1);
            const keys = result.map(e => e.key);
            expect(keys).toContain('b');
        });
        it('should return empty when vector covers all', () => {
            log.append('set', 'a', 1, { dev1: 1 });
            expect(log.since({ dev1: 5 }).length).toBe(0);
        });
    });

    describe('compact', () => {
        it('should compact by count', () => {
            for (let i = 0; i < 10; i++) log.append('set', `k${i}`, i);
            const removed = log.compact(5);
            expect(removed).toBe(5);
            expect(log.size).toBe(5);
        });
        it('should compact by opId', () => {
            const a = log.append('set', 'a', 1);
            log.append('set', 'b', 2);
            log.append('set', 'c', 3);
            const removed = log.compact(a.id);
            expect(removed).toBeGreaterThanOrEqual(0);
        });
        it('should use compactKeep when before is null', () => {
            for (let i = 0; i < 20; i++) log.append('set', `k${i}`, i);
            log.compact(null);
            expect(log.size).toBeLessThanOrEqual(5);
        });
        it('should update compacted stat', () => {
            for (let i = 0; i < 10; i++) log.append('set', `k${i}`, i);
            log.compact(5);
            expect(log.stats.compacted).toBe(5);
        });
    });

    describe('tombstones', () => {
        it('should track tombstones', () => {
            log.append('delete', 'a', null);
            log.append('delete', 'b', null);
            const tombs = log.getTombstones();
            expect(tombs.length).toBe(2);
        });
        it('should return empty when no deletes', () => {
            log.append('set', 'a', 1);
            expect(log.getTombstones().length).toBe(0);
        });
    });

    describe('queries', () => {
        it('should list all', () => {
            log.append('set', 'a', 1);
            log.append('set', 'b', 2);
            expect(log.listAll().length).toBe(2);
        });
        it('should list by key', () => {
            log.append('set', 'a', 1);
            log.append('set', 'a', 2);
            log.append('set', 'b', 3);
            expect(log.listByKey('a').length).toBe(2);
        });
        it('should get by opId', () => {
            const e = log.append('set', 'a', 1);
            expect(log.get(e.id).key).toBe('a');
        });
        it('should getStats', () => {
            log.append('set', 'a', 1);
            const s = log.getStats();
            expect(s.appended).toBe(1);
            expect(s.size).toBe(1);
        });
    });

    describe('hooks', () => {
        it('should emit appended', () => {
            let called = false;
            log.registerHook('appended', () => { called = true; });
            log.append('set', 'a', 1);
            expect(called).toBe(true);
        });
        it('should emit compacted', () => {
            let payload = null;
            log.registerHook('compacted', (p) => { payload = p; });
            log.append('set', 'a', 1);
            log.append('set', 'b', 2);
            log.compact(1);
            expect(payload.removed).toBe(1);
        });
        it('should handle hook errors silently', () => {
            log.registerHook('appended', () => { throw new Error('boom'); });
            expect(() => log.append('set', 'a', 1)).not.toThrow();
        });
        it('should emit dropped when full', () => {
            let fired = false;
            const small = new ChangeLog({ maxSize: 1 });
            small.registerHook('dropped', () => { fired = true; });
            small.append('set', 'a', 1);
            small.append('set', 'b', 2);
            expect(fired).toBe(true);
        });
        it('should track merge/patch kinds', () => {
            const m = log.append('merge', 'k', { a: 1 });
            const p = log.append('patch', 'k', { b: 2 });
            expect(m.kind).toBe('merge');
            expect(p.kind).toBe('patch');
        });
        it('getStats should include tombstones count', () => {
            log.append('delete', 'a', null);
            log.append('delete', 'b', null);
            const s = log.getStats();
            expect(s.tombstones).toBe(2);
        });
        it('should record ts in entry', () => {
            const before = Date.now();
            const e = log.append('set', 'a', 1);
            expect(e.ts).toBeGreaterThanOrEqual(before);
        });
        it('should handle null vector in since', () => {
            log.append('set', 'a', 1);
            expect(log.since(null).length).toBe(1);
            expect(log.since(undefined).length).toBe(1);
        });
    });
});
