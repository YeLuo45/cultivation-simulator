/**
 * RecommendationTracker.test.js - V973 Iter 26/30 - 目标 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { RecommendationTracker, RECOMMENDATION_STATUS } from '../../../systems/ai/RecommendationTracker.js';

describe('RecommendationTracker', () => {
    let t;
    beforeEach(() => { t = new RecommendationTracker(); });

    it('initializes with defaults', () => { expect(t.stats.total).toBe(0); });

    it('record creates recommendation', () => {
        const r = t.record('p1', 'try this');
        expect(r).not.toBeNull();
        expect(r.status).toBe('pending');
        expect(t.stats.total).toBe(1);
    });

    it('record rejects invalid input', () => {
        expect(t.record('', 'advice')).toBeNull();
        expect(t.record('p1', '')).toBeNull();
    });

    it('accept marks accepted', () => {
        const r = t.record('p1', 'advice');
        t.accept(r.id);
        expect(t.getRecommendation(r.id).status).toBe('accepted');
    });

    it('accept returns null for unknown', () => { expect(t.accept('ghost')).toBeNull(); });

    it('ignore marks ignored', () => {
        const r = t.record('p1', 'advice');
        t.ignore(r.id);
        expect(t.getRecommendation(r.id).status).toBe('ignored');
    });

    it('ignore returns null for unknown', () => { expect(t.ignore('ghost')).toBeNull(); });

    it('complete marks completed with outcome', () => {
        const r = t.record('p1', 'advice');
        t.complete(r.id, { improved: true });
        const rec = t.getRecommendation(r.id);
        expect(rec.status).toBe('completed');
        expect(rec.outcome.improved).toBe(true);
    });

    it('complete returns null for unknown', () => { expect(t.complete('ghost')).toBeNull(); });

    it('getRecommendation returns null for unknown', () => { expect(t.getRecommendation('ghost')).toBeNull(); });

    it('listPlayerRecs filters by status', () => {
        const r1 = t.record('p1', 'a1');
        t.record('p1', 'a2');
        t.accept(r1.id);
        expect(t.listPlayerRecs('p1', 'accepted').length).toBe(1);
        expect(t.listPlayerRecs('p1', 'pending').length).toBe(1);
    });

    it('acceptanceRate calculates', () => {
        const r1 = t.record('p1', 'a');
        const r2 = t.record('p1', 'b');
        t.accept(r1.id);
        t.ignore(r2.id);
        expect(t.acceptanceRate('p1')).toBe(0.5);
    });

    it('acceptanceRate for empty returns 0', () => { expect(t.acceptanceRate('p1')).toBe(0); });

    it('completionRate calculates', () => {
        const r1 = t.record('p1', 'a');
        t.accept(r1.id);
        t.complete(r1.id);
        expect(t.completionRate('p1')).toBe(1);
    });

    it('pendingCount counts pending', () => {
        t.record('p1', 'a');
        t.record('p1', 'b');
        expect(t.pendingCount('p1')).toBe(2);
    });

    it('caps at maxRecommendations', () => {
        const t2 = new RecommendationTracker({ maxRecommendations: 3 });
        for (let i = 0; i < 5; i++) t2.record('p1', `a${i}`);
        expect(t2.listPlayerRecs('p1').length).toBe(3);
    });

    it('report aggregates', () => {
        const r1 = t.record('p1', 'a');
        t.accept(r1.id);
        t.complete(r1.id);
        const rep = t.report('p1');
        expect(rep.total).toBe(1);
        expect(rep.acceptanceRate).toBe(1);
    });

    it('triggers hooks', () => {
        let recorded = false, accepted = false;
        t.registerHook('recorded', () => { recorded = true; });
        t.registerHook('accepted', () => { accepted = true; });
        const r = t.record('p1', 'a');
        t.accept(r.id);
        expect(recorded).toBe(true);
        expect(accepted).toBe(true);
    });

    it('reset clears', () => {
        t.record('p1', 'a');
        t.reset();
        expect(t.stats.total).toBe(0);
    });

    it('exposes RECOMMENDATION_STATUS', () => { expect(RECOMMENDATION_STATUS).toContain('pending'); });
});
