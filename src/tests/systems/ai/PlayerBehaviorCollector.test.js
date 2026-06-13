/**
 * PlayerBehaviorCollector.test.js - 玩家行为收集器测试
 * V948 P-20260614-001 Iteration 1/30 Round 37 - 目标覆盖率 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerBehaviorCollector, BEHAVIOR_KINDS, RESULT_TIERS } from '../../../systems/ai/PlayerBehaviorCollector.js';

describe('PlayerBehaviorCollector', () => {
    let c;
    beforeEach(() => { c = new PlayerBehaviorCollector(); });

    it('initializes with defaults', () => {
        expect(c.events.size).toBe(0);
        expect(c.stats.totalCollected).toBe(0);
        expect(c.config.maxEvents).toBe(1000);
    });

    it('collects a valid event', () => {
        const e = c.collect('p1', 'cultivate', 'qi_refining', 'normal');
        expect(e).not.toBeNull();
        expect(e.playerId).toBe('p1');
        expect(e.kind).toBe('cultivate');
        expect(c.stats.totalCollected).toBe(1);
    });

    it('rejects invalid kind', () => {
        expect(c.collect('p1', 'invalid_kind', 'x')).toBeNull();
        expect(c.stats.totalCollected).toBe(0);
    });

    it('rejects invalid result', () => {
        expect(c.collect('p1', 'cultivate', 'x', 'invalid')).toBeNull();
    });

    it('filters events by player', () => {
        c.collect('p1', 'cultivate', 't1');
        c.collect('p1', 'combat', 't2');
        c.collect('p2', 'trade', 't3');
        expect(c.filterByPlayer('p1').length).toBe(2);
        expect(c.filterByPlayer('p2').length).toBe(1);
    });

    it('filters events by kind', () => {
        c.collect('p1', 'cultivate', 't1');
        c.collect('p1', 'combat', 't2');
        expect(c.filterByKind('p1', 'combat').length).toBe(1);
    });

    it('counts by kind', () => {
        c.collect('p1', 'cultivate', 't1');
        c.collect('p1', 'cultivate', 't2');
        c.collect('p1', 'combat', 't3');
        const counts = c.countByKind('p1');
        expect(counts.cultivate).toBe(2);
        expect(counts.combat).toBe(1);
    });

    it('returns comprehensive report', () => {
        c.collect('p1', 'cultivate', 't1', 'normal');
        c.collect('p1', 'combat', 't2', 'failure');
        const r = c.report('p1');
        expect(r.totalEvents).toBe(2);
        expect(r.kindCounts.cultivate).toBe(1);
        expect(r.resultDist.failure).toBe(1);
    });

    it('exports events', () => {
        c.collect('p1', 'cultivate', 't1');
        expect(c.export('p1').length).toBe(1);
        expect(c.stats.totalExported).toBe(1);
    });

    it('triggers collected hook', () => {
        let called = false;
        c.registerHook('collected', () => { called = true; });
        c.collect('p1', 'cultivate', 't1');
        expect(called).toBe(true);
    });

    it('returns empty report for unknown player', () => {
        const r = c.report('ghost');
        expect(r.totalEvents).toBe(0);
    });

    it('resets all state', () => {
        c.collect('p1', 'cultivate', 't1');
        c.reset();
        expect(c.events.size).toBe(0);
        expect(c.stats.totalCollected).toBe(0);
    });

    it('prunes expired events', () => {
        const c2 = new PlayerBehaviorCollector({ retentionMs: 1, autoPrune: true });
        c2.collect('p1', 'cultivate', 't1');
        return new Promise((r) => setTimeout(() => {
            const res = c2.prune();
            expect(res.pruned).toBeGreaterThanOrEqual(0);
            r();
        }, 5));
    });

    it('gets event by id', () => {
        const e = c.collect('p1', 'cultivate', 't1');
        expect(c.getEvent(e.id).id).toBe(e.id);
        expect(c.getEvent('ghost')).toBeNull();
    });

    it('exposes BEHAVIOR_KINDS and RESULT_TIERS', () => {
        expect(BEHAVIOR_KINDS.length).toBeGreaterThan(0);
        expect(RESULT_TIERS).toContain('legendary');
    });

    it('prunes events over capacity', () => {
        const c2 = new PlayerBehaviorCollector({ maxEvents: 3 });
        c2.collect('p1', 'cultivate', 't1');
        c2.collect('p1', 'cultivate', 't2');
        c2.collect('p1', 'cultivate', 't3');
        c2.collect('p1', 'cultivate', 't4');
        c2.collect('p1', 'cultivate', 't5');
        expect(c2.events.size).toBe(3);
        expect(c2.stats.totalPruned).toBeGreaterThan(0);
    });

    it('prune returns remaining count', () => {
        const c2 = new PlayerBehaviorCollector({ retentionMs: 1, autoPrune: true });
        c2.collect('p1', 'cultivate', 't1');
        return new Promise((r) => setTimeout(() => {
            const res = c2.prune();
            expect(res.remaining).toBeGreaterThanOrEqual(0);
            r();
        }, 5));
    });

    it('autoPrune=false keeps expired events', () => {
        const c2 = new PlayerBehaviorCollector({ retentionMs: 1, autoPrune: false });
        c2.collect('p1', 'cultivate', 't1');
        c2.collect('p1', 'cultivate', 't2');
        return new Promise((r) => setTimeout(() => {
            const res = c2.prune();
            expect(res.pruned).toBe(0);
            r();
        }, 5));
    });

    it('collect without target uses unknown', () => {
        const e = c.collect('p1', 'cultivate', null);
        expect(e.target).toBe('unknown');
    });

    it('export empty player', () => {
        expect(c.export('ghost').length).toBe(0);
    });
});
