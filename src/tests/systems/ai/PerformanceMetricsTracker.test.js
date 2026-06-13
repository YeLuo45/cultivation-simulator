/**
 * PerformanceMetricsTracker.test.js - 性能指标追踪器测试
 * V951 P-20260614-004 Iteration 4/30 Round 37 - 目标覆盖率 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { PerformanceMetricsTracker, METRIC_KINDS } from '../../../systems/ai/PerformanceMetricsTracker.js';

describe('PerformanceMetricsTracker', () => {
    let t;
    beforeEach(() => { t = new PerformanceMetricsTracker(); });

    it('initializes with defaults', () => {
        expect(t.samples.size).toBe(0);
        expect(t.config.windowSize).toBe(20);
    });

    it('records a sample', () => {
        const s = t.record('p1', 'cultivate', true, 1000, 50);
        expect(s.playerId).toBe('p1');
        expect(t.stats.totalSamples).toBe(1);
    });

    it('rejects invalid input', () => {
        expect(t.record('', 'cultivate', true)).toBeNull();
        expect(t.record('p1', 'invalid', true)).toBeNull();
    });

    it('computes player metrics', () => {
        t.record('p1', 'cultivate', true, 1000, 50);
        t.record('p1', 'cultivate', false, 2000, 0);
        const m = t.getPlayerMetrics('p1', 'cultivate');
        expect(m.count).toBe(2);
        expect(m.successRate).toBe(0.5);
        expect(m.avgValue).toBe(25);
    });

    it('computes global metrics', () => {
        t.record('p1', 'cultivate', true, 1000, 100);
        t.record('p2', 'cultivate', false, 2000, 0);
        const m = t.getGlobalMetrics('cultivate');
        expect(m.count).toBe(2);
    });

    it('returns empty stats for unknown player', () => {
        const m = t.getPlayerMetrics('ghost', 'cultivate');
        expect(m.count).toBe(0);
    });

    it('compares player to global', () => {
        t.record('p1', 'cultivate', true, 1000, 100);
        t.record('p2', 'cultivate', false, 2000, 50);
        const c = t.compareToGlobal('p1', 'cultivate');
        expect(c.deltaSuccessRate).toBeGreaterThan(0);
        expect(c.relativePerformance).toBeGreaterThan(0);
    });

    it('returns default compare when no data', () => {
        const c = t.compareToGlobal('p1', 'cultivate');
        expect(c.relativePerformance).toBe(1);
    });

    it('detects trend improving', () => {
        for (let i = 0; i < 5; i++) t.record('p1', 'cultivate', true, 1000, 10);
        for (let i = 0; i < 5; i++) t.record('p1', 'cultivate', true, 1000, 50);
        expect(t.getTrend('p1', 'cultivate')).toBe('improving');
    });

    it('detects trend declining', () => {
        for (let i = 0; i < 5; i++) t.record('p1', 'cultivate', true, 1000, 100);
        for (let i = 0; i < 5; i++) t.record('p1', 'cultivate', true, 1000, 10);
        expect(t.getTrend('p1', 'cultivate')).toBe('declining');
    });

    it('returns insufficient trend for too few samples', () => {
        t.record('p1', 'cultivate', true, 1000, 50);
        expect(t.getTrend('p1', 'cultivate')).toBe('insufficient');
    });

    it('returns stable trend', () => {
        for (let i = 0; i < 10; i++) t.record('p1', 'cultivate', true, 1000, 50);
        expect(t.getTrend('p1', 'cultivate')).toBe('stable');
    });

    it('report aggregates all kinds', () => {
        t.record('p1', 'cultivate', true, 1000, 50);
        const r = t.report('p1');
        expect(r.byKind.cultivate.count).toBe(1);
        expect(r.trends.cultivate).toBe('insufficient');
    });

    it('gets sample by id', () => {
        const s = t.record('p1', 'cultivate', true, 1000, 50);
        expect(t.getSample(s.id).id).toBe(s.id);
        expect(t.getSample('ghost')).toBeNull();
    });

    it('reset clears all', () => {
        t.record('p1', 'cultivate', true, 1000, 50);
        t.reset();
        expect(t.samples.size).toBe(0);
    });

    it('caps samples at sampleLimit', () => {
        const t2 = new PerformanceMetricsTracker({ sampleLimit: 3 });
        for (let i = 0; i < 5; i++) t2.record('p1', 'cultivate', true, 1000, 50);
        expect(t2.getPlayerMetrics('p1', 'cultivate').count).toBe(3);
    });

    it('exposes METRIC_KINDS', () => {
        expect(METRIC_KINDS).toContain('cultivate');
    });

    it('uses custom config values', () => {
        const t2 = new PerformanceMetricsTracker({ windowSize: 5, sampleLimit: 50, trendThreshold: 0.2 });
        expect(t2.config.windowSize).toBe(5);
    });

    it('getGlobalMetrics returns empty for unknown kind', () => {
        const m = t.getGlobalMetrics('cultivate');
        expect(m.count).toBe(0);
    });

    it('compareToGlobal with player data only', () => {
        t.record('p1', 'cultivate', true, 1000, 100);
        const c = t.compareToGlobal('p1', 'cultivate');
        expect(c.relativePerformance).toBeGreaterThan(0);
    });

    it('compareToGlobal returns 1 when global avgValue is 0', () => {
        t.record('p1', 'cultivate', true, 1000, 100);
        t.record('p2', 'cultivate', false, 1000, 0);
        const c = t.compareToGlobal('p1', 'cultivate');
        expect(c.relativePerformance).toBeGreaterThan(0);
    });

    it('getTrend returns stable when early avgValue is 0', () => {
        for (let i = 0; i < 5; i++) t.record('p1', 'cultivate', true, 1000, 0);
        for (let i = 0; i < 5; i++) t.record('p1', 'cultivate', true, 1000, 50);
        expect(t.getTrend('p1', 'cultivate')).toBe('stable');
    });

    it('covers all public methods', () => {
        t.record('p1', 'cultivate', true, 1000, 50);
        t.getPlayerMetrics('p1', 'cultivate');
        t.getGlobalMetrics('cultivate');
        t.compareToGlobal('p1', 'cultivate');
        t.getTrend('p1', 'cultivate');
        t.getSample('ghost');
        t.report('p1');
        t.reset();
        const t3 = new PerformanceMetricsTracker();
        t3.record('p1', 'cultivate', true, 1000, 50);
        let called = false;
        t3.registerHook('recorded', () => { called = true; });
        t3.record('p1', 'cultivate', true, 1000, 50);
        expect(called).toBe(true);
    });
});
