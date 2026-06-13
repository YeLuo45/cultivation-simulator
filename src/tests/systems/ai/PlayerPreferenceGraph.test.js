/**
 * PlayerPreferenceGraph.test.js - 玩家偏好图测试
 * V960 P-20260614-013 Iteration 13/30 Round 37 - 目标覆盖率 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerPreferenceGraph, PREFERENCE_CATEGORIES } from '../../../systems/ai/PlayerPreferenceGraph.js';

describe('PlayerPreferenceGraph', () => {
    let g;
    beforeEach(() => { g = new PlayerPreferenceGraph(); });

    it('initializes with defaults', () => {
        expect(g.preferences.size).toBe(0);
    });

    it('initPlayer creates preferences', () => {
        g.initPlayer('p1');
        const prefs = g.getPreferences('p1');
        expect(prefs.size).toBe(PREFERENCE_CATEGORIES.length);
    });

    it('recordPreference updates weight', () => {
        g.recordPreference('p1', 'pve', 5);
        expect(g.getWeight('p1', 'pve')).toBe(5);
    });

    it('recordPreference rejects invalid', () => {
        expect(g.recordPreference('', 'pve', 5)).toBeNull();
        expect(g.recordPreference('p1', 'invalid', 5)).toBeNull();
        expect(g.recordPreference('p1', 'pve', 'notnum')).toBeNull();
    });

    it('recordCoPreference adds correlation', () => {
        g.recordCoPreference('p1', 'pve', 'pvp');
        const rels = g.correlatedWith('p1', 'pve');
        expect(rels.length).toBeGreaterThan(0);
    });

    it('recordCoPreference rejects invalid', () => {
        expect(g.recordCoPreference('p1', 'invalid', 'pvp')).toBeNull();
        expect(g.recordCoPreference('p1', 'pve', 'pve')).toBeNull();
    });

    it('getWeight for unknown returns 0', () => {
        expect(g.getWeight('ghost', 'pve')).toBe(0);
    });

    it('topCategories returns highest', () => {
        g.recordPreference('p1', 'pve', 10);
        g.recordPreference('p1', 'pvp', 5);
        g.recordPreference('p1', 'craft', 2);
        const top = g.topCategories('p1', 2);
        expect(top[0]).toBe('pve');
        expect(top[1]).toBe('pvp');
    });

    it('topCategories for unknown returns []', () => {
        expect(g.topCategories('ghost')).toEqual([]);
    });

    it('dislikedCategories returns negative', () => {
        g.recordPreference('p1', 'pve', 5);
        g.recordPreference('p1', 'pvp', -3);
        const disliked = g.dislikedCategories('p1');
        expect(disliked).toContain('pvp');
    });

    it('correlatedWith returns sorted', () => {
        g.recordCoPreference('p1', 'pve', 'pvp');
        g.recordCoPreference('p1', 'pve', 'pvp');
        g.recordCoPreference('p1', 'pve', 'craft');
        const rels = g.correlatedWith('p1', 'pve');
        expect(rels[0].weight).toBeGreaterThanOrEqual(rels[1]?.weight || 0);
    });

    it('correlatedWith for unknown returns []', () => {
        expect(g.correlatedWith('ghost', 'pve')).toEqual([]);
    });

    it('recommendActivity returns top or correlated', () => {
        g.recordPreference('p1', 'pve', 10);
        expect(g.recommendActivity('p1')).toBe('pve');
    });

    it('recommendActivity for unknown returns null', () => {
        expect(g.recommendActivity('ghost')).toBeNull();
    });

    it('getRelations returns map', () => {
        g.recordCoPreference('p1', 'pve', 'pvp');
        expect(g.getRelations('p1')).not.toBeNull();
        expect(g.getRelations('ghost')).toBeNull();
    });

    it('report aggregates', () => {
        g.recordPreference('p1', 'pve', 5);
        const r = g.report('p1');
        expect(r.topCategories[0]).toBe('pve');
        expect(r.recommended).toBe('pve');
    });

    it('reset clears', () => {
        g.recordPreference('p1', 'pve', 5);
        g.reset();
        expect(g.preferences.size).toBe(0);
    });

    it('triggers preferenceUpdated hook', () => {
        let called = false;
        g.registerHook('preferenceUpdated', () => { called = true; });
        g.recordPreference('p1', 'pve', 5);
        expect(called).toBe(true);
    });

    it('exposes PREFERENCE_CATEGORIES', () => {
        expect(PREFERENCE_CATEGORIES).toContain('pve');
    });
});
