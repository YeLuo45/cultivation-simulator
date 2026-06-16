/**
 * ConflictResolver.test.js - 冲突解决器测试
 * V1161 Round 44 Iter 4/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ConflictResolver, STRATEGIES, RESOLVE_MODES } from '../../../systems/powersync/ConflictResolver.js';

describe('ConflictResolver', () => {
    let cr;
    beforeEach(() => { cr = new ConflictResolver(); });

    describe('exports', () => {
        it('should export STRATEGIES', () => {
            expect(STRATEGIES).toContain('lww');
            expect(STRATEGIES).toContain('set');
            expect(STRATEGIES).toContain('max');
            expect(STRATEGIES).toContain('min');
            expect(STRATEGIES).toContain('custom');
        });
        it('should export RESOLVE_MODES', () => {
            expect(RESOLVE_MODES).toContain('two-way');
            expect(RESOLVE_MODES).toContain('three-way');
        });
    });

    describe('constructor', () => {
        it('should register built-in strategies', () => {
            expect(cr.hasStrategy('lww')).toBe(true);
            expect(cr.hasStrategy('set')).toBe(true);
            expect(cr.hasStrategy('max')).toBe(true);
            expect(cr.hasStrategy('min')).toBe(true);
        });
        it('should accept default strategy', () => {
            const c = new ConflictResolver({ defaultStrategy: 'max' });
            expect(c.config.defaultStrategy).toBe('max');
        });
    });

    describe('LWW strategy', () => {
        it('should pick local when newer', () => {
            const local = { value: 'a', ts: 200 };
            const remote = { value: 'b', ts: 100 };
            const r = cr.resolve(local, remote, 'lww');
            expect(r.winner.value).toBe('a');
            expect(r.strategy).toBe('lww');
        });
        it('should pick remote when newer', () => {
            const local = { value: 'a', ts: 50 };
            const remote = { value: 'b', ts: 100 };
            const r = cr.resolve(local, remote, 'lww');
            expect(r.winner.value).toBe('b');
        });
        it('should detect conflict when values differ', () => {
            const local = { value: 'a', ts: 200 };
            const remote = { value: 'b', ts: 100 };
            const r = cr.resolve(local, remote, 'lww');
            expect(r.hasConflict).toBe(true);
        });
        it('should not detect conflict when values match', () => {
            const local = { value: 'a', ts: 200 };
            const remote = { value: 'a', ts: 100 };
            const r = cr.resolve(local, remote, 'lww');
            expect(r.hasConflict).toBe(false);
        });
        it('should use default strategy when none specified', () => {
            const local = { value: 'a', ts: 200 };
            const remote = { value: 'b', ts: 100 };
            const r = cr.resolve(local, remote);
            expect(r.strategy).toBe('lww');
        });
    });

    describe('SET strategy', () => {
        it('should union two arrays', () => {
            const local = { value: ['a', 'b'] };
            const remote = { value: ['b', 'c'] };
            const r = cr.resolve(local, remote, 'set');
            expect(r.winner.value).toContain('a');
            expect(r.winner.value).toContain('b');
            expect(r.winner.value).toContain('c');
        });
        it('should handle single values', () => {
            const local = { value: 'x' };
            const remote = { value: 'y' };
            const r = cr.resolve(local, remote, 'set');
            expect(r.winner.value).toContain('x');
            expect(r.winner.value).toContain('y');
        });
        it('should produce deduped set', () => {
            const local = { value: ['a', 'a', 'b'] };
            const remote = { value: ['b', 'c', 'c'] };
            const r = cr.resolve(local, remote, 'set');
            expect(r.winner.value.length).toBe(3);
        });
    });

    describe('MAX/MIN strategy', () => {
        it('MAX picks higher number', () => {
            const local = { value: 5 };
            const remote = { value: 10 };
            const r = cr.resolve(local, remote, 'max');
            expect(r.winner.value).toBe(10);
        });
        it('MIN picks lower number', () => {
            const local = { value: 5 };
            const remote = { value: 10 };
            const r = cr.resolve(local, remote, 'min');
            expect(r.winner.value).toBe(5);
        });
        it('MAX returns local on equal', () => {
            const local = { value: 5 };
            const remote = { value: 5 };
            const r = cr.resolve(local, remote, 'max');
            expect(r.winner.value).toBe(5);
        });
        it('MIN with non-number falls back to local', () => {
            const local = { value: 'foo' };
            const remote = { value: 10 };
            const r = cr.resolve(local, remote, 'min');
            expect(r.winner.value).toBe('foo');
        });
    });

    describe('CUSTOM strategy', () => {
        it('should use registered custom resolver', () => {
            cr.registerStrategy('custom1', (l, r) => ({ value: `merged(${l.value},${r.value})` }));
            const r = cr.resolve({ value: 'a' }, { value: 'b' }, 'custom1');
            expect(r.winner.value).toBe('merged(a,b)');
        });
        it('should support three-way merge', () => {
            cr.registerStrategy('merge3', (l, r, b) => ({ value: `local=${l.value},base=${b.value}` }));
            const r = cr.resolve({ value: 'L' }, { value: 'R' }, 'merge3', { value: 'B' });
            expect(r.winner.value).toBe('local=L,base=B');
        });
        it('should reject invalid name', () => {
            const ok = cr.registerStrategy(null, () => ({}));
            expect(ok).toBe(false);
        });
        it('should reject non-function', () => {
            const ok = cr.registerStrategy('bad', 'not a function');
            expect(ok).toBe(false);
        });
    });

    describe('error cases', () => {
        it('should throw on unknown strategy', () => {
            expect(() => cr.resolve({ value: 1 }, { value: 2 }, 'nope')).toThrow();
        });
        it('should unregister strategy', () => {
            cr.registerStrategy('temp', () => ({}));
            expect(cr.unregisterStrategy('temp')).toBe(true);
            expect(cr.hasStrategy('temp')).toBe(false);
        });
    });

    describe('queries', () => {
        it('listStrategies returns all', () => {
            const list = cr.listStrategies();
            expect(list).toContain('lww');
            expect(list.length).toBeGreaterThanOrEqual(4);
        });
        it('getStats tracks resolutions', () => {
            cr.resolve({ value: 'a' }, { value: 'b' }, 'lww');
            cr.resolve({ value: 1 }, { value: 2 }, 'max');
            const s = cr.getStats();
            expect(s.resolved).toBe(2);
        });
    });

    describe('hooks', () => {
        it('should emit resolved hook', () => {
            let captured = null;
            cr.registerHook('resolved', (p) => { captured = p; });
            cr.resolve({ value: 'a' }, { value: 'b' }, 'lww');
            expect(captured.strategy).toBe('lww');
        });
        it('should handle hook errors silently', () => {
            cr.registerHook('resolved', () => { throw new Error('boom'); });
            expect(() => cr.resolve({ value: 'a' }, { value: 'b' }, 'lww')).not.toThrow();
        });
        it('should support multiple resolved listeners', () => {
            let count = 0;
            cr.registerHook('resolved', () => count++);
            cr.registerHook('resolved', () => count++);
            cr.resolve({ value: 'a' }, { value: 'b' }, 'lww');
            expect(count).toBe(2);
        });
        it('should track conflict in stats', () => {
            cr.resolve({ value: 'a' }, { value: 'b' }, 'lww');
            cr.resolve({ value: 1 }, { value: 2 }, 'max');
            const s = cr.getStats();
            expect(s.conflicts).toBe(2);
        });
        it('result should have timestamp', () => {
            const r = cr.resolve({ value: 'a' }, { value: 'b' }, 'lww');
            expect(typeof r.ts).toBe('number');
        });
        it('should return null local without throwing', () => {
            const r = cr.resolve(null, { value: 'b' }, 'lww');
            expect(r.winner.value).toBe('b');
        });
    });
});
