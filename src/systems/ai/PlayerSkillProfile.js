/**
 * PlayerSkillProfile.js - 玩家技能画像
 * V958 P-20260614-011 Iteration 11/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (ruflo hierarchical decomposition):
 * - 追踪玩家各技能维度熟练度
 * - 计算综合技能等级
 * - 标记专精 vs 全才
 * - 推荐提升方向
 */

export const SKILL_CATEGORIES = ['cultivation', 'combat', 'craft', 'social', 'explore', 'alchemy', 'formation'];
export const PROFICIENCY_TIERS = ['novice', 'apprentice', 'adept', 'expert', 'master', 'grandmaster'];
export const DEFAULT_LEVEL_CAP = 100;

export class PlayerSkillProfile {
    constructor(config = {}) {
        this.config = {
            levelCap: config.levelCap !== undefined ? config.levelCap : DEFAULT_LEVEL_CAP,
            ...config,
        };
        this.profiles = new Map();      // playerId -> Map<skill, level/xp>
        this.specializations = new Map(); // playerId -> topSkill
        this.hooks = new Map();
        this.stats = { totalUpdates: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    initPlayer(playerId) {
        if (!this.profiles.has(playerId)) {
            this.profiles.set(playerId, new Map());
            for (const s of SKILL_CATEGORIES) this.profiles.get(playerId).set(s, { level: 0, xp: 0 });
        }
        return this.profiles.get(playerId);
    }

    addXP(playerId, skill, xp) {
        if (!playerId || !SKILL_CATEGORIES.includes(skill)) return null;
        if (typeof xp !== 'number' || xp < 0) return null;
        this.initPlayer(playerId);
        const profile = this.profiles.get(playerId).get(skill);
        profile.xp += xp;
        const newLevel = Math.min(this.config.levelCap, Math.floor(profile.xp / 100));
        const leveledUp = newLevel > profile.level;
        profile.level = newLevel;
        this.stats.totalUpdates++;
        this._updateSpecialization(playerId);
        if (leveledUp) this._emit('leveledUp', { playerId, skill, level: newLevel });
        return profile;
    }

    _updateSpecialization(playerId) {
        const profile = this.profiles.get(playerId);
        if (!profile) return;
        let topSkill = null, topLevel = -1;
        for (const [skill, data] of profile) {
            if (data.level > topLevel) { topLevel = data.level; topSkill = skill; }
        }
        if (topSkill) this.specializations.set(playerId, topSkill);
    }

    getLevel(playerId, skill) {
        const profile = this.profiles.get(playerId);
        if (!profile) return 0;
        return profile.get(skill)?.level || 0;
    }

    getProficiencyTier(playerId, skill) {
        const level = this.getLevel(playerId, skill);
        if (level >= 90) return 'grandmaster';
        if (level >= 70) return 'master';
        if (level >= 50) return 'expert';
        if (level >= 30) return 'adept';
        if (level >= 10) return 'apprentice';
        return 'novice';
    }

    getSpecialization(playerId) {
        return this.specializations.get(playerId) || null;
    }

    isGeneralist(playerId, threshold = 30) {
        const profile = this.profiles.get(playerId);
        if (!profile) return false;
        const skilled = [...profile.values()].filter(p => p.level >= threshold).length;
        return skilled >= 3;
    }

    recommendedSkills(playerId, count = 2) {
        const profile = this.profiles.get(playerId);
        if (!profile) return [];
        const sorted = [...profile.entries()].sort((a, b) => a[1].level - b[1].level);
        return sorted.slice(0, count).map(([skill]) => skill);
    }

    totalLevel(playerId) {
        const profile = this.profiles.get(playerId);
        if (!profile) return 0;
        return [...profile.values()].reduce((s, p) => s + p.level, 0);
    }

    getProfile(playerId) {
        return this.profiles.get(playerId) || null;
    }

    report(playerId) {
        const profile = this.profiles.get(playerId);
        if (!profile) return null;
        return {
            playerId,
            totalLevel: this.totalLevel(playerId),
            specialization: this.getSpecialization(playerId),
            isGeneralist: this.isGeneralist(playerId),
            skills: Object.fromEntries(
                [...profile.entries()].map(([s, d]) => [s, {
                    level: d.level, xp: d.xp,
                    tier: this.getProficiencyTier(playerId, s),
                }])
            ),
            recommended: this.recommendedSkills(playerId),
        };
    }

    reset() {
        this.profiles.clear();
        this.specializations.clear();
        this.stats = { totalUpdates: 0 };
    }
}
