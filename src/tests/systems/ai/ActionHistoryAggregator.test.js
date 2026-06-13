/**
 * ActionHistoryAggregator.test.js - 行动历史聚合器测试
 * V950 P-20260614-003 Iteration 3/30 Round 37 - 目标覆盖率 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ActionHistoryAggregator, AGGREGATION_WINDOWS } from '../../../systems/ai/ActionHistoryAggregator.js';

describe('ActionHistoryAggregator', () => {
    let a;
    beforeEach(() => { a = new ActionHistoryAggregator(); });

    it('initializes with defaults', () => {
        expect(a.actions.size).toBe(0);
        expect(a.config.defaultWindow).toBe('day');
    });

    it('records action', () => {
        const x = a.record('p1', 'cultivate', 'success');
        expect(x.playerId).toBe('p1');
        expect(a.stats.totalRecorded).toBe(1);
    });

    it('rejects invalid input', () => {
        expect(a.record('', 'cultivate')).toBeNull();
        expect(a.record('p1', '')).toBeNull();
    });

    it('aggregates by day window', () => {
        a.record('p1', 'cultivate', 'success');
        a.record('p1', 'combat', 'failure');
        const r = a.aggregate('p1', 'day');
        const days = Object.keys(r);
        expect(days.length).toBeGreaterThan(0);
        const totalCount = days.reduce((s, d) => s + r[d].count, 0);
        expect(totalCount).toBe(2);
    });

    it('aggregates by hour window', () => {
        a.record('p1', 'cultivate', 'success');
        const r = a.aggregate('p1', 'hour');
        expect(Object.keys(r).length).toBeGreaterThan(0);
    });

    it('aggregates by week window', () => {
        a.record('p1', 'cultivate', 'success');
        const r = a.aggregate('p1', 'week');
        expect(Object.keys(r).length).toBeGreaterThan(0);
    });

    it('aggregates by month window', () => {
        a.record('p1', 'cultivate', 'success');
        const r = a.aggregate('p1', 'month');
        expect(Object.keys(r).length).toBeGreaterThan(0);
    });

    it('returns empty for unknown player', () => {
        expect(a.aggregate('ghost', 'day')).toEqual({});
    });

    it('uses default window if not specified', () => {
        a.record('p1', 'cultivate');
        const r = a.aggregate('p1');
        expect(Object.keys(r).length).toBeGreaterThan(0);
    });

    it('maintains chain and detects pattern', () => {
        a.record('p1', 'cultivate');
        a.record('p1', 'combat');
        a.record('p1', 'cultivate');
        const chain = a.getChain('p1');
        expect(chain.length).toBe(3);
        const pat = a.findPattern('p1', 2);
        expect(pat.signature).toBe('combat->cultivate');
    });

    it('returns null pattern for short chain', () => {
        a.record('p1', 'cultivate');
        expect(a.findPattern('p1', 5)).toBeNull();
    });

    it('caps chain at maxLength', () => {
        const a2 = new ActionHistoryAggregator({ chainMaxLength: 3 });
        for (let i = 0; i < 10; i++) a2.record('p1', 'cultivate');
        expect(a2.getChain('p1').length).toBe(3);
    });

    it('report returns comprehensive stats', () => {
        a.record('p1', 'cultivate');
        a.record('p1', 'cultivate');
        const r = a.report('p1');
        expect(r.totalActions).toBe(2);
        expect(r.totalDays).toBeGreaterThan(0);
        expect(r.currentChainLength).toBe(2);
    });

    it('gets action by id', () => {
        const x = a.record('p1', 'cultivate');
        expect(a.getAction(x.id).id).toBe(x.id);
        expect(a.getAction('ghost')).toBeNull();
    });

    it('reset clears state', () => {
        a.record('p1', 'cultivate');
        a.reset();
        expect(a.actions.size).toBe(0);
    });

    it('triggers recorded hook', () => {
        let called = false;
        a.registerHook('recorded', () => { called = true; });
        a.record('p1', 'cultivate');
        expect(called).toBe(true);
    });

    it('exposes AGGREGATION_WINDOWS', () => {
        expect(AGGREGATION_WINDOWS).toContain('day');
    });

    it('uses custom config values', () => {
        const a2 = new ActionHistoryAggregator({ defaultWindow: 'hour', chainMaxLength: 5 });
        expect(a2.config.defaultWindow).toBe('hour');
    });

    it('aggregate with custom window', () => {
        a.record('p1', 'cultivate');
        const r = a.aggregate('p1', 'hour');
        expect(Object.keys(r).length).toBeGreaterThan(0);
    });
});
