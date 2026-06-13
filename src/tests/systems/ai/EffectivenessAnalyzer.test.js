/**
 * EffectivenessAnalyzer.test.js - V974 Iter 27/30 - 目标 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { EffectivenessAnalyzer, EFFECTIVENESS_LEVELS } from '../../../systems/ai/EffectivenessAnalyzer.js';

describe('EffectivenessAnalyzer', () => {
    let a;
    beforeEach(() => { a = new EffectivenessAnalyzer(); });

    it('initializes with defaults', () => { expect(a.stats.totalAnalyzed).toBe(0); });

    it('measure records entry', () => {
        const e = a.measure('p1', 'hint', 0.5, 0.7);
        expect(e.score).toBeCloseTo(0.4);
        expect(e.level).toBe('moderate');
    });

    it('measure rejects non-numeric', () => {
        expect(a.measure('p1', 'hint', 'x', 0.5)).toBeNull();
        expect(a.measure('p1', 'hint', 0.5, 'x')).toBeNull();
    });

    it('measure handles baseline=0', () => {
        const e = a.measure('p1', 'hint', 0, 5);
        expect(e.score).toBe(1.0);
        expect(e.level).toBe('excellent');
    });

    it('measure negative change', () => {
        const e = a.measure('p1', 'hint', 0.5, 0.3);
        expect(e.score).toBe(0);
        expect(e.level).toBe('none');
    });

    it('listMeasurements returns all', () => {
        a.measure('p1', 'hint', 0, 1);
        expect(a.listMeasurements('p1').length).toBe(1);
    });

    it('listMeasurements for unknown returns []', () => { expect(a.listMeasurements('p1').length).toBe(0); });

    it('averageEffectiveness calculates', () => {
        a.measure('p1', 'hint', 0, 1);
        a.measure('p1', 'quest', 0, 0.5);
        expect(a.averageEffectiveness('p1')).toBeGreaterThan(0);
    });

    it('averageEffectiveness for empty returns 0', () => { expect(a.averageEffectiveness('p1')).toBe(0); });

    it('effectivenessByIntervention groups', () => {
        a.measure('p1', 'hint', 0, 1);
        a.measure('p1', 'hint', 0, 0.5);
        a.measure('p1', 'quest', 0, 1);
        const grouped = a.effectivenessByIntervention('p1');
        expect(Object.keys(grouped).length).toBe(2);
    });

    it('recentTrend insufficient for <2', () => { expect(a.recentTrend('p1')).toBe('insufficient'); });

    it('recentTrend improving', () => {
        for (let i = 0; i < 5; i++) a.measure('p1', 'hint', 1, 1 + (i + 1) * 0.1);
        expect(a.recentTrend('p1')).toBe('improving');
    });

    it('recentTrend stable', () => {
        for (let i = 0; i < 5; i++) a.measure('p1', 'hint', 0, 0.5);
        expect(a.recentTrend('p1')).toBe('stable');
    });

    it('bestIntervention returns top', () => {
        a.measure('p1', 'hint', 0, 1);
        a.measure('p1', 'quest', 0, 0.5);
        expect(a.bestIntervention('p1')).toBe('hint');
    });

    it('bestIntervention for empty returns null', () => { expect(a.bestIntervention('p1')).toBeNull(); });

    it('isEffective checks threshold', () => {
        expect(a.isEffective(0.5)).toBe(true);
        expect(a.isEffective(0.1)).toBe(false);
    });

    it('caps history at 100', () => {
        for (let i = 0; i < 150; i++) a.measure('p1', 'hint', 0, 1);
        expect(a.listMeasurements('p1').length).toBeLessThanOrEqual(100);
    });

    it('triggers measured hook', () => {
        let called = false;
        a.registerHook('measured', () => { called = true; });
        a.measure('p1', 'hint', 0, 1);
        expect(called).toBe(true);
    });

    it('report aggregates', () => {
        a.measure('p1', 'hint', 0, 1);
        const r = a.report('p1');
        expect(r.totalMeasurements).toBe(1);
    });

    it('reset clears', () => {
        a.measure('p1', 'hint', 0, 1);
        a.reset();
        expect(a.measurements.size).toBe(0);
    });

    it('exposes EFFECTIVENESS_LEVELS', () => { expect(EFFECTIVENESS_LEVELS).toContain('excellent'); });
});
