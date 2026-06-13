/**
 * TimeOnTaskAnalyzer.test.js - 任务时长分析器测试
 * V952 P-20260614-005 Iteration 5/30 Round 37 - 目标覆盖率 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { TimeOnTaskAnalyzer, TASK_CATEGORIES } from '../../../systems/ai/TimeOnTaskAnalyzer.js';

describe('TimeOnTaskAnalyzer', () => {
    let t;
    beforeEach(() => { t = new TimeOnTaskAnalyzer(); });

    it('initializes with defaults', () => {
        expect(t.tasks.size).toBe(0);
        expect(t.config.maxTasks).toBe(500);
    });

    it('tracks a task', () => {
        const task = t.trackTask('p1', 'cultivate', 1000);
        expect(task.durationMs).toBe(1000);
        expect(t.stats.totalTracked).toBe(1);
    });

    it('rejects invalid input', () => {
        expect(t.trackTask('', 'cultivate', 1000)).toBeNull();
        expect(t.trackTask('p1', 'invalid', 1000)).toBeNull();
        expect(t.trackTask('p1', 'cultivate', -1)).toBeNull();
        expect(t.trackTask('p1', 'cultivate', 'notanumber')).toBeNull();
    });

    it('returns category stats', () => {
        t.trackTask('p1', 'cultivate', 1000);
        t.trackTask('p1', 'cultivate', 2000);
        t.trackTask('p1', 'cultivate', 3000);
        const s = t.getCategoryStats('p1', 'cultivate');
        expect(s.count).toBe(3);
        expect(s.avgMs).toBe(2000);
        expect(s.minMs).toBe(1000);
        expect(s.maxMs).toBe(3000);
    });

    it('returns empty stats for unknown player', () => {
        const s = t.getCategoryStats('ghost', 'cultivate');
        expect(s.count).toBe(0);
    });

    it('detects anomalies', () => {
        t.trackTask('p1', 'cultivate', 1000);
        t.trackTask('p1', 'cultivate', 1100);
        t.trackTask('p1', 'cultivate', 900);
        t.trackTask('p1', 'cultivate', 10000);  // anomaly
        const anomalies = t.detectAnomalies('p1', 'cultivate');
        expect(anomalies.length).toBe(1);
        expect(anomalies[0].durationMs).toBe(10000);
    });

    it('returns empty anomalies for too few samples', () => {
        t.trackTask('p1', 'cultivate', 1000);
        expect(t.detectAnomalies('p1', 'cultivate').length).toBe(0);
    });

    it('triggers anomaly hook', () => {
        let called = false;
        t.registerHook('anomaly', () => { called = true; });
        t.trackTask('p1', 'cultivate', 1000);
        t.trackTask('p1', 'cultivate', 1100);
        t.trackTask('p1', 'cultivate', 900);
        t.trackTask('p1', 'cultivate', 10000);
        expect(called).toBe(true);
    });

    it('computes efficiency score', () => {
        t.trackTask('p1', 'cultivate', 30000);
        t.trackTask('p1', 'combat', 30000);
        const score = t.efficiencyScore('p1');
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(1);
    });

    it('returns 1.0 efficiency for no data', () => {
        expect(t.efficiencyScore('ghost')).toBe(1.0);
    });

    it('returns 0 efficiency for very long tasks', () => {
        t.trackTask('p1', 'cultivate', 700000);  // > 10 min
        const score = t.efficiencyScore('p1');
        expect(score).toBeLessThanOrEqual(0.01);
    });

    it('report aggregates all categories', () => {
        t.trackTask('p1', 'cultivate', 1000);
        t.trackTask('p1', 'combat', 2000);
        const r = t.report('p1');
        expect(r.totalCount).toBe(2);
        expect(r.byCategory.cultivate).toBeDefined();
        expect(r.byCategory.combat).toBeDefined();
        expect(r.efficiencyScore).toBeGreaterThanOrEqual(0);
    });

    it('gets task by id', () => {
        const task = t.trackTask('p1', 'cultivate', 1000);
        expect(t.getTask(task.id).id).toBe(task.id);
        expect(t.getTask('ghost')).toBeNull();
    });

    it('reset clears state', () => {
        t.trackTask('p1', 'cultivate', 1000);
        t.reset();
        expect(t.tasks.size).toBe(0);
    });

    it('caps tasks at maxTasks', () => {
        const t2 = new TimeOnTaskAnalyzer({ maxTasks: 3 });
        for (let i = 0; i < 5; i++) t2.trackTask('p1', 'cultivate', 1000);
        expect(t2.getCategoryStats('p1', 'cultivate').count).toBe(3);
    });

    it('exposes TASK_CATEGORIES', () => {
        expect(TASK_CATEGORIES).toContain('cultivate');
        expect(TASK_CATEGORIES).toContain('combat');
    });

    it('uses custom config values', () => {
        const t2 = new TimeOnTaskAnalyzer({ maxTasks: 10, anomalyMultiplier: 3.0 });
        expect(t2.config.maxTasks).toBe(10);
        expect(t2.config.anomalyMultiplier).toBe(3.0);
    });

    it('detectAnomalies returns empty for unknown player', () => {
        expect(t.detectAnomalies('ghost', 'cultivate').length).toBe(0);
    });

    it('efficiencyScore for player with one category', () => {
        t.trackTask('p1', 'cultivate', 30000);
        const s = t.efficiencyScore('p1');
        expect(s).toBeGreaterThan(0);
    });

    it('anomaly with custom multiplier', () => {
        const t2 = new TimeOnTaskAnalyzer({ anomalyMultiplier: 1.5 });
        t2.trackTask('p1', 'cultivate', 1000);
        t2.trackTask('p1', 'cultivate', 1100);
        t2.trackTask('p1', 'cultivate', 900);
        t2.trackTask('p1', 'cultivate', 2000);
        expect(t2.detectAnomalies('p1', 'cultivate').length).toBeGreaterThan(0);
    });
});
