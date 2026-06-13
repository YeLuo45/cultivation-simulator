/**
 * FailureRecoveryGuide.test.js - V970 Iter 23/30 - 目标 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { FailureRecoveryGuide, RECOVERY_STEPS, FAILURE_CATEGORIES } from '../../../systems/ai/FailureRecoveryGuide.js';

describe('FailureRecoveryGuide', () => {
    let g;
    beforeEach(() => { g = new FailureRecoveryGuide(); });

    it('initializes with defaults', () => { expect(g.stats.totalGuided).toBe(0); });

    it('registerStrategy adds valid', () => {
        expect(g.registerStrategy('timeout', [
            { step: 'rest', action: '休息一下', priority: 1 },
            { step: 'retry', action: '重试', priority: 2 },
        ])).toBe(true);
    });

    it('registerStrategy rejects invalid category', () => { expect(g.registerStrategy('invalid', [])).toBe(false); });
    it('registerStrategy rejects non-array steps', () => { expect(g.registerStrategy('timeout', null)).toBe(false); });
    it('registerStrategy rejects invalid step', () => {
        expect(g.registerStrategy('timeout', [{ step: 'invalid', action: 'x' }])).toBe(false);
    });

    it('getStrategy returns empty for unknown', () => { expect(g.getStrategy('timeout').length).toBe(0); });

    it('guideFor returns steps', () => {
        g.registerStrategy('timeout', [{ step: 'rest', action: '休息' }]);
        const steps = g.guideFor('p1', 'timeout');
        expect(steps.length).toBe(1);
        expect(g.stats.totalGuided).toBe(1);
    });

    it('guideFor returns empty for unknown', () => { expect(g.guideFor('p1', 'unknown').length).toBe(0); });

    it('nextStep returns next uncompleted', () => {
        const strat = [{ step: 'rest', action: 'a' }, { step: 'retry', action: 'b' }];
        expect(g.nextStep(strat, ['rest']).step).toBe('retry');
        expect(g.nextStep(strat, ['rest', 'retry'])).toBeNull();
    });

    it('record tracks outcomes', () => {
        g.record('p1', 'timeout', true);
        g.record('p1', 'timeout', false);
        expect(g.recoveryRate('p1')).toBe(0.5);
    });

    it('recoveryRate for empty returns 0', () => { expect(g.recoveryRate('p1')).toBe(0); });

    it('listStrategies returns entries', () => {
        g.registerStrategy('timeout', [{ step: 'rest' }]);
        expect(g.listStrategies().length).toBe(1);
    });

    it('listApplied returns player records', () => {
        g.record('p1', 'timeout', true);
        expect(g.listApplied('p1').length).toBe(1);
    });

    it('listApplied for unknown returns []', () => { expect(g.listApplied('p1').length).toBe(0); });

    it('recommendFor maps failure type', () => {
        expect(g.recommendFor('timeout')).toBe('rest');
        expect(g.recommendFor('resource')).toBe('replan');
        expect(g.recommendFor('decision')).toBe('assess');
        expect(g.recommendFor('execution')).toBe('retry');
        expect(g.recommendFor('unknown')).toBe('assess');
    });

    it('triggers guided hook', () => {
        let called = false;
        g.registerHook('guided', () => { called = true; });
        g.registerStrategy('timeout', [{ step: 'rest' }]);
        g.guideFor('p1', 'timeout');
        expect(called).toBe(true);
    });

    it('report aggregates', () => {
        g.registerStrategy('timeout', [{ step: 'rest' }]);
        g.guideFor('p1', 'timeout');
        g.record('p1', 'timeout', true);
        const r = g.report('p1');
        expect(r.recoveryRate).toBe(1);
    });

    it('reset clears', () => {
        g.registerStrategy('timeout', [{ step: 'rest' }]);
        g.reset();
        expect(g.strategies.size).toBe(0);
    });

    it('exposes RECOVERY_STEPS and FAILURE_CATEGORIES', () => {
        expect(RECOVERY_STEPS).toContain('rest');
        expect(FAILURE_CATEGORIES).toContain('timeout');
    });
});
