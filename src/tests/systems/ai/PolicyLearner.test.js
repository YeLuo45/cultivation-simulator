/**
 * PolicyLearner.test.js - V976 Iter 29/30 - 目标 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { PolicyLearner, POLICY_TYPES } from '../../../systems/ai/PolicyLearner.js';

describe('PolicyLearner', () => {
    let l;
    beforeEach(() => { l = new PolicyLearner(); });

    it('initializes with defaults', () => { expect(l.stats.totalUpdates).toBe(0); });

    it('recordOutcome updates policy', () => {
        l.recordOutcome('p1', 'aggressive', 0.8);
        expect(l.stats.totalUpdates).toBe(1);
    });

    it('recordOutcome rejects invalid policy', () => { expect(l.recordOutcome('p1', 'invalid', 0.5)).toBeNull(); });
    it('recordOutcome rejects non-numeric reward', () => { expect(l.recordOutcome('p1', 'aggressive', 'x')).toBeNull(); });

    it('bestPolicy returns null for no data', () => { expect(l.bestPolicy('p1')).toBeNull(); });

    it('bestPolicy after data', () => {
        l.recordOutcome('p1', 'aggressive', 0.8);
        l.recordOutcome('p1', 'conservative', 0.3);
        expect(l.bestPolicy('p1')).toBe('aggressive');
    });

    it('applyPolicy sets applied', () => {
        l.applyPolicy('p1', 'balanced');
        expect(l.getAppliedPolicy('p1')).toBe('balanced');
    });

    it('applyPolicy rejects invalid', () => { expect(l.applyPolicy('p1', 'invalid')).toBe(false); });

    it('autoApply uses best', () => {
        l.recordOutcome('p1', 'aggressive', 0.9);
        l.recordOutcome('p1', 'conservative', 0.3);
        expect(l.autoApply('p1')).toBe('aggressive');
    });

    it('getAppliedPolicy for unknown returns null', () => { expect(l.getAppliedPolicy('p1')).toBeNull(); });

    it('getScores returns all policies', () => {
        l.recordOutcome('p1', 'aggressive', 0.5);
        const scores = l.getScores('p1');
        expect(scores.aggressive).toBeDefined();
    });

    it('getScores initializes policies', () => {
        const scores = l.getScores('p1');
        expect(Object.keys(scores).length).toBe(3);
    });

    it('shouldExplore returns boolean', () => {
        expect(typeof l.shouldExplore('p1')).toBe('boolean');
    });

    it('choosePolicy returns valid', () => {
        l.recordOutcome('p1', 'aggressive', 0.8);
        const p = l.choosePolicy('p1', 0);
        expect(POLICY_TYPES).toContain(p);
    });

    it('choosePolicy with high epsilon may return random', () => {
        const p = l.choosePolicy('p1', 1.0);
        expect(POLICY_TYPES).toContain(p);
    });

    it('hasLearned false initially', () => { expect(l.hasLearned('p1')).toBe(false); });

    it('hasLearned true after data', () => {
        l.recordOutcome('p1', 'aggressive', 0.5);
        expect(l.hasLearned('p1')).toBe(true);
    });

    it('report aggregates', () => {
        l.recordOutcome('p1', 'aggressive', 0.5);
        l.applyPolicy('p1', 'aggressive');
        const r = l.report('p1');
        expect(r.applied).toBe('aggressive');
    });

    it('triggers updated hook', () => {
        let called = false;
        l.registerHook('updated', () => { called = true; });
        l.recordOutcome('p1', 'aggressive', 0.5);
        expect(called).toBe(true);
    });

    it('reset clears', () => {
        l.recordOutcome('p1', 'aggressive', 0.5);
        l.reset();
        expect(l.stats.totalUpdates).toBe(0);
    });

    it('exposes POLICY_TYPES', () => { expect(POLICY_TYPES).toContain('balanced'); });
});
