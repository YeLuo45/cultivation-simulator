/**
 * GoalRecommender.test.js - V969 Iter 22/30 - 目标 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { GoalRecommender, GOAL_CATEGORIES } from '../../../systems/ai/GoalRecommender.js';

describe('GoalRecommender', () => {
    let g;
    beforeEach(() => { g = new GoalRecommender(); });

    it('initializes with defaults', () => { expect(g.goalCount()).toBe(0); });

    it('addGoal adds valid', () => {
        expect(g.addGoal({ id: 'g1', category: 'cultivate', weight: 1.0 })).toBe(true);
    });

    it('addGoal rejects invalid', () => {
        expect(g.addGoal(null)).toBe(false);
        expect(g.addGoal({})).toBe(false);
        expect(g.addGoal({ id: 'g1', category: 'invalid' })).toBe(false);
    });

    it('getGoal returns null for unknown', () => { expect(g.getGoal('ghost')).toBeNull(); });

    it('listGoals returns all', () => {
        g.addGoal({ id: 'g1', category: 'cultivate' });
        g.addGoal({ id: 'g2', category: 'combat' });
        expect(g.listGoals().length).toBe(2);
    });

    it('recommend returns top N', () => {
        g.addGoal({ id: 'g1', category: 'cultivate', weight: 1.0 });
        g.addGoal({ id: 'g2', category: 'combat', weight: 2.0 });
        const list = g.recommend('p1', {}, 1);
        expect(list[0].id).toBe('g2');
    });

    it('recommend returns empty for no goals', () => { expect(g.recommend('p1').length).toBe(0); });

    it('recommend respects profile preferences', () => {
        g.addGoal({ id: 'g1', category: 'cultivate', weight: 1.0 });
        g.addGoal({ id: 'g2', category: 'combat', weight: 1.0 });
        const list = g.recommend('p1', { preferences: { cultivate: 100 } }, 1);
        expect(list[0].id).toBe('g1');
    });

    it('recommend filters by min level', () => {
        g.addGoal({ id: 'g1', category: 'cultivate', weight: 1.0, requirements: { minLevel: 10 } });
        g.addGoal({ id: 'g2', category: 'combat', weight: 1.0 });
        const list = g.recommend('p1', { level: 5 });
        expect(list.length).toBe(1);
    });

    it('accept assigns goal', () => {
        g.addGoal({ id: 'g1', category: 'cultivate' });
        expect(g.accept('p1', 'g1').goalId).toBe('g1');
    });

    it('accept returns null for unknown', () => { expect(g.accept('p1', 'ghost')).toBeNull(); });

    it('complete marks done', () => {
        g.addGoal({ id: 'g1', category: 'cultivate' });
        g.accept('p1', 'g1');
        expect(g.complete('p1', 'g1')).toBe(true);
    });

    it('complete returns false for unknown', () => {
        expect(g.complete('p1', 'g1')).toBe(false);
    });

    it('isCompleted checks status', () => {
        g.addGoal({ id: 'g1', category: 'cultivate' });
        g.accept('p1', 'g1');
        g.complete('p1', 'g1');
        expect(g.isCompleted('p1', 'g1')).toBe(true);
    });

    it('listAssignments returns all', () => {
        g.addGoal({ id: 'g1', category: 'cultivate' });
        g.accept('p1', 'g1');
        expect(g.listAssignments('p1').length).toBe(1);
    });

    it('progress calculates', () => {
        g.addGoal({ id: 'g1', category: 'cultivate' });
        g.addGoal({ id: 'g2', category: 'combat' });
        g.accept('p1', 'g1');
        g.accept('p1', 'g2');
        g.complete('p1', 'g1');
        expect(g.progress('p1')).toBe(0.5);
    });

    it('progress for empty returns 0', () => { expect(g.progress('p1')).toBe(0); });

    it('report aggregates', () => {
        g.addGoal({ id: 'g1', category: 'cultivate' });
        g.accept('p1', 'g1');
        const r = g.report('p1');
        expect(r.totalAssigned).toBe(1);
    });

    it('reset clears', () => {
        g.addGoal({ id: 'g1', category: 'cultivate' });
        g.reset();
        expect(g.goalCount()).toBe(0);
    });

    it('exposes GOAL_CATEGORIES', () => { expect(GOAL_CATEGORIES).toContain('cultivate'); });
});
