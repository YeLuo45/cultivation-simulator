/**
 * PlayerFrustrationGauge.test.js - 玩家挫败感测量测试
 * V962 P-20260614-015 Iteration 15/30 Round 37 - 目标覆盖率 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerFrustrationGauge, FRUSTRATION_THRESHOLDS } from '../../../systems/ai/PlayerFrustrationGauge.js';

describe('PlayerFrustrationGauge', () => {
    let g;
    beforeEach(() => { g = new PlayerFrustrationGauge(); });

    it('initializes with defaults', () => {
        expect(g.levels.size).toBe(0);
    });

    it('addFrustration increases level', () => {
        g.addFrustration('p1', 'failure');
        expect(g.getLevel('p1')).toBe(2.0);
    });

    it('addFrustration caps at 100', () => {
        for (let i = 0; i < 100; i++) g.addFrustration('p1', 'quit_attempt', 5);
        expect(g.getLevel('p1')).toBe(100);
    });

    it('addFrustration triggers intervention on high level', () => {
        let called = false;
        g.registerHook('intervention', () => { called = true; });
        for (let i = 0; i < 30; i++) g.addFrustration('p1', 'quit_attempt');
        expect(called).toBe(true);
    });

    it('decayFrustration decreases level', () => {
        g.addFrustration('p1', 'failure', 5);
        const before = g.getLevel('p1');
        g.decayFrustration('p1', 2);
        expect(g.getLevel('p1')).toBeLessThan(before);
    });

    it('decayFrustration does not go below 0', () => {
        g.decayFrustration('p1', 100);
        expect(g.getLevel('p1')).toBe(0);
    });

    it('getSeverity maps level', () => {
        g.addFrustration('p1', 'quit_attempt', 10);
        const severity = g.getSeverity('p1');
        expect(['mild', 'moderate', 'severe', 'critical']).toContain(severity);
    });

    it('getSeverity none for 0', () => {
        expect(g.getSeverity('p1')).toBe('none');
    });

    it('isInterventionNeeded for moderate', () => {
        for (let i = 0; i < 30; i++) g.addFrustration('p1', 'failure');
        expect(g.isInterventionNeeded('p1')).toBe(true);
    });

    it('isInterventionNeeded false for low', () => {
        g.addFrustration('p1', 'failure', 2);
        expect(g.isInterventionNeeded('p1')).toBe(false);
    });

    it('shouldSuggestBreak for severe', () => {
        for (let i = 0; i < 50; i++) g.addFrustration('p1', 'failure');
        expect(g.shouldSuggestBreak('p1')).toBe(true);
    });

    it('shouldSuggestBreak false for low', () => {
        g.addFrustration('p1', 'failure', 2);
        expect(g.shouldSuggestBreak('p1')).toBe(false);
    });

    it('getHistory returns events', () => {
        g.addFrustration('p1', 'failure');
        g.decayFrustration('p1');
        const h = g.getHistory('p1');
        expect(h.length).toBe(2);
    });

    it('getHistory for unknown returns []', () => {
        expect(g.getHistory('ghost').length).toBe(0);
    });

    it('report aggregates', () => {
        g.addFrustration('p1', 'failure', 5);
        const r = g.report('p1');
        expect(r.level).toBeGreaterThan(0);
        expect(r.totalEvents).toBe(1);
    });

    it('reset clears', () => {
        g.addFrustration('p1', 'failure');
        g.reset();
        expect(g.levels.size).toBe(0);
    });

    it('addFrustration with custom factor', () => {
        g.addFrustration('p1', 'unknown_factor', 5);
        expect(g.getLevel('p1')).toBe(5);  // unknown factor uses default 1.0
    });

    it('caps history at 100 events', () => {
        const g2 = new PlayerFrustrationGauge();
        for (let i = 0; i < 150; i++) g2.addFrustration('p1', 'failure');
        expect(g2.getHistory('p1').length).toBeLessThanOrEqual(100);
    });

    it('exposes FRUSTRATION_THRESHOLDS', () => {
        expect(FRUSTRATION_THRESHOLDS.moderate).toBe(50);
    });
});
