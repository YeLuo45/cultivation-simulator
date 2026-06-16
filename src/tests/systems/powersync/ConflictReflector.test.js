/**
 * ConflictReflector.test.js - 冲突反思器测试
 * V1183 Round 45 Iter 27/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    ConflictReflector,
    ROOT_CAUSE_HYPOTHESES,
    FIX_KINDS,
    CONFLICT_TYPES,
} from '../../../systems/powersync/ConflictReflector.js';

describe('ConflictReflector', () => {
    let r;
    beforeEach(() => { r = new ConflictReflector({ windowMs: 60000, hotKeyThreshold: 3 }); });

    describe('exports', () => {
        it('ROOT_CAUSE_HYPOTHESES contains 3 causes', () => {
            expect(ROOT_CAUSE_HYPOTHESES).toContain('frequent_update');
            expect(ROOT_CAUSE_HYPOTHESES).toContain('divergent_base');
            expect(ROOT_CAUSE_HYPOTHESES).toContain('clock_skew');
        });
        it('FIX_KINDS contains lww/crdt/vector_clock', () => {
            expect(FIX_KINDS).toContain('use_lww');
            expect(FIX_KINDS).toContain('enable_crdt');
            expect(FIX_KINDS).toContain('add_vector_clock');
        });
        it('CONFLICT_TYPES contains write_write', () => {
            expect(CONFLICT_TYPES).toContain('write_write');
        });
    });

    describe('constructor', () => {
        it('starts empty', () => {
            expect(r.conflicts.length).toBe(0);
            expect(r.stats.recorded).toBe(0);
        });
        it('accepts custom config', () => {
            const x = new ConflictReflector({ windowMs: 1000, hotKeyThreshold: 10 });
            expect(x.config.windowMs).toBe(1000);
            expect(x.config.hotKeyThreshold).toBe(10);
        });
    });

    describe('recordConflict', () => {
        it('records valid conflict', () => {
            expect(r.recordConflict({ key: 'k1', type: 'write_write' })).toBe(true);
            expect(r.conflicts.length).toBe(1);
        });
        it('rejects non-object', () => {
            expect(r.recordConflict(null)).toBe(false);
            expect(r.recordConflict('x')).toBe(false);
        });
        it('fills default type', () => {
            r.recordConflict({ key: 'k' });
            expect(r.conflicts[0].type).toBe('write_write');
        });
        it('fills default key', () => {
            r.recordConflict({});
            expect(r.conflicts[0].key).toBe('<unknown>');
        });
        it('fills default ts', () => {
            r.recordConflict({ key: 'k' });
            expect(typeof r.conflicts[0].ts).toBe('number');
            expect(r.conflicts[0].ts).toBeGreaterThan(0);
        });
        it('preserves custom ts', () => {
            r.recordConflict({ key: 'k', ts: 12345 });
            expect(r.conflicts[0].ts).toBe(12345);
        });
        it('increments stats.recorded', () => {
            r.recordConflict({ key: 'a' });
            r.recordConflict({ key: 'b' });
            expect(r.stats.recorded).toBe(2);
        });
        it('emits recorded event', () => {
            let captured = null;
            r.registerHook('recorded', (e) => { captured = e; });
            r.recordConflict({ key: 'k', type: 'write_write' });
            expect(captured.key).toBe('k');
        });
    });

    describe('recordBatch', () => {
        it('records array', () => {
            const n = r.recordBatch([
                { key: 'a' }, { key: 'b' }, null, { key: 'c' },
            ]);
            expect(n).toBe(3);
            expect(r.conflicts.length).toBe(3);
        });
        it('rejects non-array', () => {
            expect(r.recordBatch('x')).toBe(0);
            expect(r.recordBatch(null)).toBe(0);
        });
    });

    describe('analyze', () => {
        it('returns full shape', () => {
            for (let i = 0; i < 5; i++) r.recordConflict({ key: 'hot' });
            const a = r.analyze();
            expect(a).toHaveProperty('rate');
            expect(a).toHaveProperty('total');
            expect(a).toHaveProperty('hotspots');
            expect(a).toHaveProperty('rootCauses');
            expect(a).toHaveProperty('fixes');
            expect(a).toHaveProperty('byType');
        });
        it('detects hotspots above threshold', () => {
            for (let i = 0; i < 4; i++) r.recordConflict({ key: 'hot' });
            r.recordConflict({ key: 'cold' });
            const a = r.analyze();
            expect(a.hotspots.length).toBe(1);
            expect(a.hotspots[0].key).toBe('hot');
        });
        it('no hotspots when below threshold', () => {
            for (let i = 0; i < 2; i++) r.recordConflict({ key: 'a' });
            const a = r.analyze();
            expect(a.hotspots.length).toBe(0);
        });
        it('rate is conflicts per second', () => {
            for (let i = 0; i < 60; i++) r.recordConflict({ key: 'a' });
            const a = r.analyze();
            expect(a.rate).toBe(1); // 60 per 60s
        });
        it('byType counts types', () => {
            r.recordConflict({ key: 'a', type: 'write_write' });
            r.recordConflict({ key: 'a', type: 'update_update' });
            r.recordConflict({ key: 'a', type: 'write_write' });
            const a = r.analyze();
            expect(a.byType.write_write).toBe(2);
            expect(a.byType.update_update).toBe(1);
        });
        it('updates stats.hotspots', () => {
            for (let i = 0; i < 4; i++) r.recordConflict({ key: 'hot' });
            r.analyze();
            expect(r.stats.hotspots).toBe(1);
        });
    });

    describe('getConflictsByKey', () => {
        it('filters by key', () => {
            r.recordConflict({ key: 'a' });
            r.recordConflict({ key: 'b' });
            r.recordConflict({ key: 'a' });
            const list = r.getConflictsByKey('a');
            expect(list.length).toBe(2);
        });
        it('empty for unknown key', () => {
            expect(r.getConflictsByKey('zzz').length).toBe(0);
        });
    });

    describe('countByKey', () => {
        it('returns count', () => {
            r.recordConflict({ key: 'a' });
            r.recordConflict({ key: 'a' });
            r.recordConflict({ key: 'a' });
            expect(r.countByKey('a')).toBe(3);
        });
    });

    describe('getRootCause heuristic', () => {
        it('frequent_update when all same type', () => {
            r.recordConflict({ key: 'a', type: 'write_write' });
            r.recordConflict({ key: 'a', type: 'write_write' });
            r.recordConflict({ key: 'a', type: 'write_write' });
            expect(r.getRootCause('a')).toBe('frequent_update');
        });
        it('clock_skew when many types but few conflicts', () => {
            r.recordConflict({ key: 'a', type: 'write_write' });
            r.recordConflict({ key: 'a', type: 'update_update' });
            expect(r.getRootCause('a')).toBe('clock_skew');
        });
        it('divergent_base when many types and many conflicts', () => {
            for (let i = 0; i < 3; i++) r.recordConflict({ key: 'a', type: 'write_write' });
            for (let i = 0; i < 3; i++) r.recordConflict({ key: 'a', type: 'update_update' });
            expect(r.getRootCause('a')).toBe('divergent_base');
        });
        it('null for unknown key', () => {
            expect(r.getRootCause('zzz')).toBeNull();
        });
    });

    describe('suggestFix mapping', () => {
        it('frequent_update → use_lww', () => {
            for (let i = 0; i < 3; i++) r.recordConflict({ key: 'a', type: 'write_write' });
            expect(r.suggestFix('a')).toBe('use_lww');
        });
        it('clock_skew → add_vector_clock', () => {
            r.recordConflict({ key: 'a', type: 'write_write' });
            r.recordConflict({ key: 'a', type: 'update_update' });
            expect(r.suggestFix('a')).toBe('add_vector_clock');
        });
        it('divergent_base → enable_crdt', () => {
            for (let i = 0; i < 3; i++) r.recordConflict({ key: 'a', type: 'write_write' });
            for (let i = 0; i < 3; i++) r.recordConflict({ key: 'a', type: 'update_update' });
            expect(r.suggestFix('a')).toBe('enable_crdt');
        });
        it('null for unknown key', () => {
            expect(r.suggestFix('zzz')).toBeNull();
        });
    });

    describe('queries', () => {
        it('listKeys returns unique keys', () => {
            r.recordConflict({ key: 'a' });
            r.recordConflict({ key: 'b' });
            r.recordConflict({ key: 'a' });
            const keys = r.listKeys();
            expect(keys.length).toBe(2);
            expect(keys).toContain('a');
            expect(keys).toContain('b');
        });
        it('listConflicts returns copy', () => {
            r.recordConflict({ key: 'a' });
            const list = r.listConflicts();
            list.length = 0;
            expect(r.conflicts.length).toBe(1);
        });
    });

    describe('config setters', () => {
        it('setHotKeyThreshold valid', () => {
            expect(r.setHotKeyThreshold(10)).toBe(true);
            expect(r.config.hotKeyThreshold).toBe(10);
        });
        it('setHotKeyThreshold invalid', () => {
            expect(r.setHotKeyThreshold(0)).toBe(false);
            expect(r.setHotKeyThreshold(-1)).toBe(false);
        });
        it('setWindowMs valid', () => {
            expect(r.setWindowMs(30000)).toBe(true);
        });
        it('setWindowMs invalid', () => {
            expect(r.setWindowMs(0)).toBe(false);
            expect(r.setWindowMs(-1)).toBe(false);
        });
    });

    describe('getStats', () => {
        it('returns aggregate', () => {
            r.recordConflict({ key: 'a' });
            r.recordConflict({ key: 'b' });
            const s = r.getStats();
            expect(s.recorded).toBe(2);
            expect(s.stored).toBe(2);
            expect(s.uniqueKeys).toBe(2);
        });
    });

    describe('reset', () => {
        it('clears conflicts and stats', () => {
            r.recordConflict({ key: 'a' });
            r.recordConflict({ key: 'b' });
            r.reset();
            expect(r.conflicts.length).toBe(0);
            expect(r.stats.recorded).toBe(0);
        });
    });

    describe('hooks', () => {
        it('hook errors swallowed', () => {
            r.registerHook('recorded', () => { throw new Error('x'); });
            expect(() => r.recordConflict({ key: 'a' })).not.toThrow();
        });
    });
});
