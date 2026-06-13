/**
 * LoopOptimizer.test.js - V975 Iter 28/30 - 目标 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { LoopOptimizer, PARAM_KEYS, DEFAULT_PARAMS } from '../../../systems/ai/LoopOptimizer.js';

describe('LoopOptimizer', () => {
    let o;
    beforeEach(() => { o = new LoopOptimizer(); });

    it('initializes with defaults', () => { expect(o.stats.totalOptimizations).toBe(0); });

    it('getParams returns defaults', () => {
        const p = o.getParams('p1');
        expect(p.acceptanceWeight).toBe(1.0);
    });

    it('setParam updates', () => {
        o.setParam('p1', 'acceptanceWeight', 1.5);
        expect(o.getParams('p1').acceptanceWeight).toBe(1.5);
    });

    it('setParam rejects invalid', () => { expect(o.setParam('p1', 'invalid', 1)).toBe(false); });

    it('optimize on low effectiveness', () => {
        o.optimize('p1', 0.1, 0.5);
        const p = o.getParams('p1');
        expect(p.effectivenessWeight).toBeGreaterThan(1.0);
    });

    it('optimize on high effectiveness', () => {
        o.optimize('p1', 0.8, 0.5);
        const p = o.getParams('p1');
        expect(p.adviceFrequency).toBeGreaterThan(0.5);
    });

    it('optimize on low acceptance', () => {
        o.optimize('p1', 0.5, 0.1);
        const p = o.getParams('p1');
        expect(p.acceptanceWeight).toBeLessThan(1.0);
    });

    it('optimize on high acceptance', () => {
        o.optimize('p1', 0.5, 0.8);
        const p = o.getParams('p1');
        expect(p.acceptanceWeight).toBeGreaterThan(1.0);
    });

    it('shouldAdvise returns boolean', () => {
        const r = o.shouldAdvise('p1');
        expect(typeof r).toBe('boolean');
    });

    it('resetParams restores defaults', () => {
        o.setParam('p1', 'acceptanceWeight', 2.0);
        o.resetParams('p1');
        expect(o.getParams('p1').acceptanceWeight).toBe(1.0);
    });

    it('listHistory returns history', () => {
        o.optimize('p1', 0.5, 0.5);
        expect(o.listHistory('p1').length).toBe(1);
    });

    it('listHistory for unknown returns []', () => { expect(o.listHistory('p1').length).toBe(0); });

    it('avgEffectiveness calculates', () => {
        o.optimize('p1', 0.3, 0.5);
        o.optimize('p1', 0.7, 0.5);
        expect(o.avgEffectiveness('p1')).toBe(0.5);
    });

    it('avgEffectiveness for empty returns 0', () => { expect(o.avgEffectiveness('p1')).toBe(0); });

    it('isImproving false for <2', () => { expect(o.isImproving('p1')).toBe(false); });

    it('isImproving true when last > first', () => {
        o.optimize('p1', 0.1, 0.5);
        o.optimize('p1', 0.8, 0.5);
        expect(o.isImproving('p1')).toBe(true);
    });

    it('caps history at 50', () => {
        for (let i = 0; i < 60; i++) o.optimize('p1', 0.5, 0.5);
        expect(o.listHistory('p1').length).toBe(50);
    });

    it('triggers optimized hook', () => {
        let called = false;
        o.registerHook('optimized', () => { called = true; });
        o.optimize('p1', 0.5, 0.5);
        expect(called).toBe(true);
    });

    it('report aggregates', () => {
        o.optimize('p1', 0.5, 0.5);
        const r = o.report('p1');
        expect(r.totalOptimizations).toBe(1);
    });

    it('reset clears', () => {
        o.optimize('p1', 0.5, 0.5);
        o.reset();
        expect(o.stats.totalOptimizations).toBe(0);
    });

    it('exposes PARAM_KEYS and DEFAULT_PARAMS', () => {
        expect(PARAM_KEYS).toContain('acceptanceWeight');
        expect(DEFAULT_PARAMS.adviceFrequency).toBe(0.5);
    });
});
