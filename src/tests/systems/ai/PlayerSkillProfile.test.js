/**
 * PlayerSkillProfile.test.js - 玩家技能画像测试
 * V958 P-20260614-011 Iteration 11/30 Round 37 - 目标覆盖率 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerSkillProfile, SKILL_CATEGORIES, PROFICIENCY_TIERS } from '../../../systems/ai/PlayerSkillProfile.js';

describe('PlayerSkillProfile', () => {
    let p;
    beforeEach(() => { p = new PlayerSkillProfile(); });

    it('initializes with defaults', () => {
        expect(p.profiles.size).toBe(0);
        expect(p.config.levelCap).toBe(100);
    });

    it('initPlayer creates profile', () => {
        const profile = p.initPlayer('p1');
        expect(profile.size).toBe(SKILL_CATEGORIES.length);
    });

    it('addXP increases level', () => {
        p.addXP('p1', 'cultivation', 250);
        expect(p.getLevel('p1', 'cultivation')).toBe(2);
    });

    it('rejects invalid input', () => {
        expect(p.addXP('', 'cultivation', 100)).toBeNull();
        expect(p.addXP('p1', 'invalid', 100)).toBeNull();
        expect(p.addXP('p1', 'cultivation', -1)).toBeNull();
    });

    it('caps at levelCap', () => {
        const p2 = new PlayerSkillProfile({ levelCap: 5 });
        p2.addXP('p1', 'cultivation', 10000);
        expect(p2.getLevel('p1', 'cultivation')).toBe(5);
    });

    it('triggers leveledUp hook', () => {
        let called = false;
        p.registerHook('leveledUp', () => { called = true; });
        p.addXP('p1', 'cultivation', 100);
        expect(called).toBe(true);
    });

    it('getProficiencyTier maps level', () => {
        const p2 = new PlayerSkillProfile();
        p2.addXP('p1', 'cultivation', 9000);
        expect(p2.getProficiencyTier('p1', 'cultivation')).toBe('grandmaster');
    });

    it('getProficiencyTier novice for low level', () => {
        expect(p.getProficiencyTier('p1', 'cultivation')).toBe('novice');
    });

    it('updates specialization', () => {
        p.addXP('p1', 'cultivation', 500);
        p.addXP('p1', 'combat', 100);
        expect(p.getSpecialization('p1')).toBe('cultivation');
    });

    it('isGeneralist true for multiple skills', () => {
        p.addXP('p1', 'cultivation', 3000);
        p.addXP('p1', 'combat', 3000);
        p.addXP('p1', 'craft', 3000);
        expect(p.isGeneralist('p1')).toBe(true);
    });

    it('isGeneralist false for low skills', () => {
        p.addXP('p1', 'cultivation', 100);
        expect(p.isGeneralist('p1')).toBe(false);
    });

    it('recommendedSkills returns lowest first', () => {
        p.addXP('p1', 'cultivation', 5000);
        p.addXP('p1', 'combat', 5000);
        const recs = p.recommendedSkills('p1', 3);
        expect(recs.length).toBe(3);
        expect(recs).not.toContain('cultivation');
        expect(recs).not.toContain('combat');
    });

    it('totalLevel sums all', () => {
        p.addXP('p1', 'cultivation', 200);
        p.addXP('p1', 'combat', 300);
        expect(p.totalLevel('p1')).toBe(5);
    });

    it('getLevel for unknown returns 0', () => {
        expect(p.getLevel('ghost', 'cultivation')).toBe(0);
    });

    it('getSpecialization for unknown returns null', () => {
        expect(p.getSpecialization('ghost')).toBeNull();
    });

    it('getProfile returns profile', () => {
        p.addXP('p1', 'cultivation', 100);
        const profile = p.getProfile('p1');
        expect(profile).not.toBeNull();
    });

    it('getProfile for unknown returns null', () => {
        expect(p.getProfile('ghost')).toBeNull();
    });

    it('report aggregates all skills', () => {
        p.addXP('p1', 'cultivation', 100);
        const r = p.report('p1');
        expect(r.skills.cultivation.level).toBe(1);
        expect(r.recommended.length).toBeGreaterThan(0);
    });

    it('report for unknown returns null', () => {
        expect(p.report('ghost')).toBeNull();
    });

    it('reset clears', () => {
        p.addXP('p1', 'cultivation', 100);
        p.reset();
        expect(p.profiles.size).toBe(0);
    });

    it('exposes SKILL_CATEGORIES and PROFICIENCY_TIERS', () => {
        expect(SKILL_CATEGORIES).toContain('cultivation');
        expect(PROFICIENCY_TIERS).toContain('grandmaster');
    });
});
