/**
 * ConflictAdvisor.test.js - 冲突建议 Agent 测试
 * V1179 Round 44 Iter 22/30
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    ConflictAdvisor,
    ADVISOR_STRATEGIES,
    CONFLICT_KINDS,
} from '../../../systems/powersync/ConflictAdvisor.js';

describe('ConflictAdvisor', () => {
    let a;
    beforeEach(() => { a = new ConflictAdvisor(); });

    describe('exports', () => {
        it('ADVISOR_STRATEGIES includes lww/merge/custom/manual', () => {
            expect(ADVISOR_STRATEGIES).toContain('lww');
            expect(ADVISOR_STRATEGIES).toContain('merge');
            expect(ADVISOR_STRATEGIES).toContain('manual');
        });
        it('CONFLICT_KINDS includes kinds', () => {
            expect(CONFLICT_KINDS).toContain('identical');
            expect(CONFLICT_KINDS).toContain('diverged');
            expect(CONFLICT_KINDS).toContain('local_only');
            expect(CONFLICT_KINDS).toContain('remote_only');
            expect(CONFLICT_KINDS).toContain('both_new');
        });
    });

    describe('constructor', () => {
        it('starts empty', () => {
            expect(a.history.length).toBe(0);
            expect(a.stats.analyzed).toBe(0);
        });
        it('accepts config', () => {
            const x = new ConflictAdvisor({ lwwThreshold: 0.7, minConfidence: 0.8 });
            expect(x.config.lwwThreshold).toBe(0.7);
            expect(x.config.minConfidence).toBe(0.8);
        });
    });

    describe('analyze - identical', () => {
        it('returns lww when same value', () => {
            const r = a.analyze({ value: 1, ts: 100 }, { value: 1, ts: 200 });
            expect(r.kind).toBe('identical');
            expect(r.strategy).toBe('lww');
            expect(r.confidence).toBe(1.0);
        });
        it('accepts flat {localValue, remoteValue}', () => {
            const r = a.analyze({ localValue: 'x', localTs: 100 }, { remoteValue: 'x', remoteTs: 200 });
            expect(r.kind).toBe('identical');
        });
    });

    describe('analyze - diverged', () => {
        it('local newer picks local', () => {
            const r = a.analyze({ value: 1, ts: 200 }, { value: 2, ts: 100 });
            expect(r.strategy).toBe('lww');
            expect(r.reason).toBe('local_newer');
            expect(r.winner.value).toBe(1);
        });
        it('remote newer picks remote', () => {
            const r = a.analyze({ value: 1, ts: 100 }, { value: 2, ts: 200 });
            expect(r.strategy).toBe('lww');
            expect(r.reason).toBe('remote_newer');
            expect(r.winner.value).toBe(2);
        });
        it('same timestamp -> manual', () => {
            const r = a.analyze({ value: 1, ts: 100 }, { value: 2, ts: 100 });
            expect(r.strategy).toBe('manual');
        });
        it('close-in-time primitives -> manual', () => {
            const r = a.analyze({ value: 1, ts: 100 }, { value: 2, ts: 150 });
            expect(r.strategy).toBe('manual');
            expect(r.reason).toBe('concurrent_primitives_close_in_time');
        });
        it('large ts gap -> high confidence LWW', () => {
            const r = a.analyze({ value: 1, ts: 1000000 }, { value: 2, ts: 100 });
            expect(r.strategy).toBe('lww');
            expect(r.confidence).toBeGreaterThan(0.8);
        });
    });

    describe('analyze - missing sides', () => {
        it('local only -> take local', () => {
            const r = a.analyze({ value: 1, ts: 100 }, null);
            expect(r.kind).toBe('local_only');
            expect(r.winner.value).toBe(1);
        });
        it('remote only -> take remote', () => {
            const r = a.analyze(null, { value: 2, ts: 100 });
            expect(r.kind).toBe('remote_only');
            expect(r.winner.value).toBe(2);
        });
        it('both null', () => {
            const r = a.analyze(null, null);
            expect(r.kind).toBe('identical');
        });
    });

    describe('analyze - with base', () => {
        it('both changed from base -> both_new', () => {
            const r = a.analyze(
                { value: 1, ts: 200 },
                { value: 2, ts: 100 },
                { value: 0, ts: 50 }
            );
            expect(r.kind).toBe('both_new');
        });
        it('only local changed -> local_only', () => {
            const r = a.analyze(
                { value: 1, ts: 200 },
                { value: 0, ts: 100 },
                { value: 0, ts: 50 }
            );
            expect(r.kind).toBe('local_only');
        });
        it('only remote changed -> remote_only', () => {
            const r = a.analyze(
                { value: 0, ts: 200 },
                { value: 2, ts: 100 },
                { value: 0, ts: 50 }
            );
            expect(r.kind).toBe('remote_only');
        });
        it('identical to base', () => {
            const r = a.analyze(
                { value: 0, ts: 200 },
                { value: 0, ts: 100 },
                { value: 0, ts: 50 }
            );
            expect(r.kind).toBe('identical');
        });
    });

    describe('analyze - stat counters', () => {
        it('increments analyzed', () => {
            a.analyze({ value: 1, ts: 100 }, { value: 1, ts: 100 });
            a.analyze({ value: 1, ts: 200 }, { value: 2, ts: 100 });
            expect(a.stats.analyzed).toBe(2);
        });
    });

    describe('recommendStrategy', () => {
        it('low confidence -> manual fallback', () => {
            const x = new ConflictAdvisor({ minConfidence: 0.95 });
            const r = x.recommendStrategy({ localValue: 1, remoteValue: 2, localTs: 200, remoteTs: 100 });
            expect(r.strategy).toBe('manual');
            expect(r.reason).toContain('low_confidence');
        });
        it('with base available -> merge', () => {
            const r = a.recommendStrategy({
                localValue: 1, remoteValue: 2,
                baseValue: 0, localTs: 200000, remoteTs: 100
            });
            expect(r.strategy).toBe('merge');
        });
        it('identical -> lww', () => {
            const r = a.recommendStrategy({ localValue: 1, remoteValue: 1, localTs: 100, remoteTs: 200 });
            expect(r.strategy).toBe('lww');
        });
        it('increments recommended stat', () => {
            a.recommendStrategy({ localValue: 1, remoteValue: 1, localTs: 100, remoteTs: 200 });
            expect(a.stats.recommended).toBe(1);
        });
    });

    describe('recordDecision', () => {
        it('adds to history', () => {
            a.recordDecision({ localValue: 1, remoteValue: 2 }, { strategy: 'lww' });
            expect(a.history.length).toBe(1);
            expect(a.stats.recorded).toBe(1);
        });
        it('preserves conflict + decision', () => {
            a.recordDecision({ localValue: 1, remoteValue: 2 }, { strategy: 'merge' });
            const h = a.getHistory()[0];
            expect(h.decision.strategy).toBe('merge');
        });
        it('multiple records', () => {
            a.recordDecision({ localValue: 1, remoteValue: 2 }, { strategy: 'lww' });
            a.recordDecision({ localValue: 3, remoteValue: 4 }, { strategy: 'merge' });
            expect(a.getHistory().length).toBe(2);
        });
        it('returns the entry', () => {
            const e = a.recordDecision({ localValue: 1, remoteValue: 2 }, { strategy: 'lww' });
            expect(e.ts).toBeGreaterThan(0);
        });
    });

    describe('history / clear', () => {
        it('getHistory returns copy', () => {
            a.recordDecision({}, {});
            const h = a.getHistory();
            h.length = 0;
            expect(a.history.length).toBe(1);
        });
        it('clearHistory returns count', () => {
            a.recordDecision({}, {});
            a.recordDecision({}, {});
            const n = a.clearHistory();
            expect(n).toBe(2);
            expect(a.history.length).toBe(0);
        });
    });

    describe('config setters', () => {
        it('setLwwThreshold valid', () => {
            expect(a.setLwwThreshold(0.3)).toBe(true);
        });
        it('setLwwThreshold invalid', () => {
            expect(a.setLwwThreshold(-1)).toBe(false);
            expect(a.setLwwThreshold(1.5)).toBe(false);
            expect(a.setLwwThreshold('x')).toBe(false);
        });
        it('setMinConfidence valid', () => {
            expect(a.setMinConfidence(0.8)).toBe(true);
        });
        it('setMinConfidence invalid', () => {
            expect(a.setMinConfidence(2)).toBe(false);
        });
    });

    describe('stats', () => {
        it('getStats aggregates', () => {
            a.analyze({ value: 1, ts: 100 }, { value: 1, ts: 100 });
            a.recordDecision({}, { strategy: 'lww' });
            const s = a.getStats();
            expect(s.analyzed).toBe(1);
            expect(s.recorded).toBe(1);
            expect(s.historySize).toBe(1);
        });
    });

    describe('confidence bounds', () => {
        it('lww confidence never exceeds 1.0', () => {
            const r = a.analyze({ value: 1, ts: 99999999 }, { value: 2, ts: 0 });
            expect(r.confidence).toBeLessThanOrEqual(1.0);
        });
        it('lww confidence never below threshold', () => {
            const r = a.analyze({ value: 1, ts: 1 }, { value: 2, ts: 0 });
            expect(r.confidence).toBeGreaterThanOrEqual(0.5);
        });
        it('identical confidence = 1.0', () => {
            const r = a.analyze({ value: 'x', ts: 100 }, { value: 'x', ts: 200 });
            expect(r.confidence).toBe(1.0);
        });
    });

    describe('hooks', () => {
        it('emits analyzed', () => {
            let captured = null;
            a.registerHook('analyzed', (e) => { captured = e; });
            a.analyze({ value: 1, ts: 100 }, { value: 1, ts: 100 });
            expect(captured.kind).toBe('identical');
        });
        it('emits recommended', () => {
            let captured = null;
            a.registerHook('recommended', (e) => { captured = e; });
            a.recommendStrategy({ localValue: 1, remoteValue: 1, localTs: 100, remoteTs: 200 });
            expect(captured.strategy).toBe('lww');
        });
        it('emits recorded', () => {
            let n = 0;
            a.registerHook('recorded', () => n++);
            a.recordDecision({}, { strategy: 'lww' });
            expect(n).toBe(1);
        });
        it('hook errors swallowed', () => {
            a.registerHook('analyzed', () => { throw new Error('x'); });
            expect(() => a.analyze({ value: 1, ts: 100 }, { value: 1, ts: 100 })).not.toThrow();
        });
    });
});
