/**
 * CultivationL1AchievementIndex.js - 修真L1成就索引
 * V889 P-20260613-063 Iteration 2/30 Round 35
 *
 * 修真L0-L4分层记忆传承系统：L1成就索引层(generic-agent L0-L4分层框架第2层)
 * - 核心 API: unlockAchievement / queryAchievementStatus / indexAchievements
 * - 数据结构: { id, playerId, achievementId, achievementName, category, tier, unlockedAt, points }
 * - 配置: ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_TIERS, MAX_ACHIEVEMENTS_PER_PLAYER, DEFAULT_POINTS_PER_TIER
 * - 业务: unlockAchievement 不可重复解锁；不同 tier 给不同 points；indexAchievements 按 category 分组
 */

export const ACHIEVEMENT_CATEGORIES = ['combat', 'cultivation', 'social', 'exploration'];
export const ACHIEVEMENT_CATEGORY_COUNT = 4;

export const ACHIEVEMENT_TIERS = ['bronze', 'silver', 'gold', 'platinum'];
export const ACHIEVEMENT_TIER_COUNT = 4;

export const DEFAULT_POINTS_PER_TIER = {
    bronze: 10,
    silver: 25,
    gold: 50,
    platinum: 100,
};
export const DEFAULT_POINTS_PER_TIER_COUNT = 4;

export const MAX_ACHIEVEMENTS_PER_PLAYER = 100;

export const L1_LAYER = 'L1';

export const ACHIEVEMENT_CATALOG = {
    first_step: { name: '初入仙途', category: 'cultivation', tier: 'bronze' },
    qi_sense: { name: '感知灵气', category: 'cultivation', tier: 'bronze' },
    breakthrough_qi: { name: '突破练气', category: 'cultivation', tier: 'silver' },
    foundation: { name: '筑基成功', category: 'cultivation', tier: 'gold' },
    golden_core: { name: '凝结金丹', category: 'cultivation', tier: 'platinum' },
    first_combat_win: { name: '首战告捷', category: 'combat', tier: 'bronze' },
    kill_100: { name: '百战余生', category: 'combat', tier: 'silver' },
    kill_1000: { name: '千战封神', category: 'combat', tier: 'gold' },
    duel_master: { name: '决斗大师', category: 'combat', tier: 'platinum' },
    first_friend: { name: '初识道友', category: 'social', tier: 'bronze' },
    sect_member: { name: '拜入宗门', category: 'social', tier: 'silver' },
    sect_elder: { name: '宗门长老', category: 'social', tier: 'gold' },
    sect_master: { name: '一派之祖', category: 'social', tier: 'platinum' },
    first_realm: { name: '初探秘境', category: 'exploration', tier: 'bronze' },
    realm_explorer: { name: '秘境探索者', category: 'exploration', tier: 'silver' },
    realm_conqueror: { name: '秘境征服者', category: 'exploration', tier: 'gold' },
    realm_legend: { name: '秘境传说', category: 'exploration', tier: 'platinum' },
};
export const ACHIEVEMENT_CATALOG_SIZE = Object.keys(ACHIEVEMENT_CATALOG).length;

export const ACHIEVEMENT_INDEX_SCORE_FACTOR = 0.01;

export const INVALID_PLAYER_ID = 'INVALID_PLAYER_ID';
export const INVALID_ACHIEVEMENT_ID = 'INVALID_ACHIEVEMENT_ID';
export const INVALID_CATEGORY = 'INVALID_CATEGORY';
export const INVALID_TIER = 'INVALID_TIER';
export const UNKNOWN_ACHIEVEMENT = 'UNKNOWN_ACHIEVEMENT';
export const DUPLICATE_ACHIEVEMENT = 'DUPLICATE_ACHIEVEMENT';
export const PLAYER_FULL = 'PLAYER_FULL';
export const ACHIEVEMENT_NOT_FOUND = 'ACHIEVEMENT_NOT_FOUND';
export const INVALID_TOOL_NAME = 'INVALID_TOOL_NAME';
export const INVALID_HANDLER = 'INVALID_HANDLER';
export const UNKNOWN_TOOL = 'UNKNOWN_TOOL';
export const TOOL_EXECUTION_ERROR = 'TOOL_EXECUTION_ERROR';
export const INVALID_EVENT_NAME = 'INVALID_EVENT_NAME';
export const EVENT_NOT_REGISTERED = 'EVENT_NOT_REGISTERED';
export const HANDLER_NOT_FOUND = 'HANDLER_NOT_FOUND';
export const INVALID_DATA = 'INVALID_DATA';
export const INVALID_NAME = 'INVALID_NAME';

export class CultivationL1AchievementIndex {
    constructor(config = {}) {
        this.config = {
            maxAchievementsPerPlayer: config.maxAchievementsPerPlayer !== undefined ? config.maxAchievementsPerPlayer : MAX_ACHIEVEMENTS_PER_PLAYER,
            allowDuplicates: config.allowDuplicates !== undefined ? config.allowDuplicates : false,
            defaultCategory: config.defaultCategory !== undefined ? config.defaultCategory : 'cultivation',
            defaultTier: config.defaultTier !== undefined ? config.defaultTier : 'bronze',
            ...config,
        };
        this.achievements = new Map();
        this.playerAchievements = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = {
            totalUnlocked: 0,
            totalQueried: 0,
            totalIndexed: 0,
            totalPoints: 0,
            evolutionCount: 0,
            byCategory: { combat: 0, cultivation: 0, social: 0, exploration: 0 },
            byTier: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
        };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('unlock', (ctx) => this.unlockAchievement(ctx.playerId, ctx.achievementId, ctx.overrides));
        this.registerTool('query', (ctx) => this.queryAchievementStatus(ctx.playerId, ctx.achievementId));
        this.registerTool('index', (ctx) => this.indexAchievements(ctx.playerId));
        this.registerTool('listByTier', (ctx) => this.listByTier(ctx.tier));
    }

    _bumpCounter(map, key) {
        return (map[key] ?? 0) + 1;
    }

    _genId() {
        return `ach_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    _resolveAchievement(achievementId, overrides) {
        const ov = (overrides !== undefined && overrides !== null && typeof overrides === 'object') ? overrides : {};
        const catalog = ACHIEVEMENT_CATALOG[achievementId];
        const name = ov.name !== undefined ? ov.name : (catalog ? catalog.name : achievementId);
        const category = ov.category !== undefined ? ov.category : (catalog ? catalog.category : this.config.defaultCategory);
        const tier = ov.tier !== undefined ? ov.tier : (catalog ? catalog.tier : this.config.defaultTier);
        return { name, category, tier };
    }

    _computePoints(tier) {
        return DEFAULT_POINTS_PER_TIER[tier] !== undefined ? DEFAULT_POINTS_PER_TIER[tier] : 0;
    }

    _hasAchievement(playerId, achievementId) {
        if (!this.playerAchievements.has(playerId)) return false;
        const list = this.playerAchievements.get(playerId);
        for (const id of list) {
            if (this.achievements.has(id)) {
                if (this.achievements.get(id).achievementId === achievementId) return true;
            }
        }
        return false;
    }

    _findAchievementId(playerId, achievementId) {
        if (!this.playerAchievements.has(playerId)) return null;
        const list = this.playerAchievements.get(playerId);
        for (const id of list) {
            if (this.achievements.has(id)) {
                if (this.achievements.get(id).achievementId === achievementId) return id;
            }
        }
        return null;
    }

    _validateCategory(category) {
        return ACHIEVEMENT_CATEGORIES.includes(category);
    }

    _validateTier(tier) {
        return ACHIEVEMENT_TIERS.includes(tier);
    }

    _validateName(name) {
        return typeof name === 'string' && name.length > 0;
    }

    _cloneAchievement(achievement) {
        return { ...achievement };
    }

    unlockAchievement(playerId, achievementId, overrides) {
        if (typeof playerId !== 'string' || playerId.length === 0) {
            return { success: false, error: INVALID_PLAYER_ID };
        }
        if (typeof achievementId !== 'string' || achievementId.length === 0) {
            return { success: false, error: INVALID_ACHIEVEMENT_ID };
        }

        const ov = (overrides !== undefined && overrides !== null && typeof overrides === 'object') ? overrides : null;
        if (ov !== null) {
            if (ov.category !== undefined && !this._validateCategory(ov.category)) {
                return { success: false, error: INVALID_CATEGORY };
            }
            if (ov.tier !== undefined && !this._validateTier(ov.tier)) {
                return { success: false, error: INVALID_TIER };
            }
            if (ov.name !== undefined && !this._validateName(ov.name)) {
                return { success: false, error: INVALID_NAME };
            }
        }

        if (!this.config.allowDuplicates && this._hasAchievement(playerId, achievementId)) {
            return { success: false, error: DUPLICATE_ACHIEVEMENT };
        }

        if (this.playerAchievements.has(playerId) && this.playerAchievements.get(playerId).length >= this.config.maxAchievementsPerPlayer) {
            return { success: false, error: PLAYER_FULL };
        }

        const resolved = this._resolveAchievement(achievementId, ov);
        const points = this._computePoints(resolved.tier);
        const id = this._genId();
        const unlockedAt = Date.now();

        const achievement = {
            id,
            playerId,
            achievementId,
            achievementName: resolved.name,
            category: resolved.category,
            tier: resolved.tier,
            unlockedAt,
            points,
        };

        this.achievements.set(id, achievement);
        if (!this.playerAchievements.has(playerId)) {
            this.playerAchievements.set(playerId, []);
        }
        this.playerAchievements.get(playerId).push(id);

        this.stats.totalUnlocked += 1;
        this.stats.totalPoints += points;
        this.stats.byCategory[resolved.category] = this._bumpCounter(this.stats.byCategory, resolved.category);
        this.stats.byTier[resolved.tier] = this._bumpCounter(this.stats.byTier, resolved.tier);

        this._triggerHook('onUnlock', { achievement });
        return { success: true, achievement: this._cloneAchievement(achievement) };
    }

    queryAchievementStatus(playerId, achievementId) {
        this.stats.totalQueried += 1;
        if (typeof playerId !== 'string' || playerId.length === 0) {
            return { unlocked: false, error: INVALID_PLAYER_ID };
        }
        if (typeof achievementId !== 'string' || achievementId.length === 0) {
            return { unlocked: false, error: INVALID_ACHIEVEMENT_ID };
        }
        const id = this._findAchievementId(playerId, achievementId);
        if (id === null) return { unlocked: false, achievementId, points: 0 };
        const achievement = this.achievements.get(id);
        return {
            unlocked: true,
            achievementId,
            achievement: this._cloneAchievement(achievement),
            points: achievement.points,
        };
    }

    indexAchievements(playerId) {
        this.stats.totalIndexed += 1;
        if (typeof playerId !== 'string' || playerId.length === 0) {
            return { byCategory: {}, byTier: {}, total: 0 };
        }
        const byCategory = {
            combat: [],
            cultivation: [],
            social: [],
            exploration: [],
        };
        const byTier = {
            bronze: [],
            silver: [],
            gold: [],
            platinum: [],
        };

        if (!this.playerAchievements.has(playerId)) {
            return { byCategory, byTier, total: 0, totalPoints: 0 };
        }

        const ids = this.playerAchievements.get(playerId);
        let totalPoints = 0;
        for (const id of ids) {
            if (!this.achievements.has(id)) continue;
            const ach = this.achievements.get(id);
            const cloned = this._cloneAchievement(ach);
            if (byCategory[ach.category] !== undefined) byCategory[ach.category].push(cloned);
            if (byTier[ach.tier] !== undefined) byTier[ach.tier].push(cloned);
            totalPoints += ach.points;
        }

        return { byCategory, byTier, total: ids.length, totalPoints };
    }

    getAchievement(achievementInternalId) {
        if (!this.achievements.has(achievementInternalId)) return null;
        return this._cloneAchievement(this.achievements.get(achievementInternalId));
    }

    listByPlayer(playerId) {
        if (!this.playerAchievements.has(playerId)) return [];
        const ids = this.playerAchievements.get(playerId);
        return ids
            .map(id => this.achievements.get(id))
            .filter(a => a !== undefined)
            .map(a => this._cloneAchievement(a));
    }

    listByCategory(category) {
        if (!this._validateCategory(category)) return [];
        return Array.from(this.achievements.values())
            .filter(a => a.category === category)
            .map(a => this._cloneAchievement(a));
    }

    listByTier(tier) {
        if (!this._validateTier(tier)) return [];
        return Array.from(this.achievements.values())
            .filter(a => a.tier === tier)
            .map(a => this._cloneAchievement(a));
    }

    listByCategoryForPlayer(playerId, category) {
        if (!this._validateCategory(category)) return [];
        return this.listByPlayer(playerId).filter(a => a.category === category);
    }

    listByTierForPlayer(playerId, tier) {
        if (!this._validateTier(tier)) return [];
        return this.listByPlayer(playerId).filter(a => a.tier === tier);
    }

    getAchievementStats(playerId) {
        const list = this.listByPlayer(playerId);
        const totalPoints = list.reduce((sum, a) => sum + a.points, 0);
        const byCategory = { combat: 0, cultivation: 0, social: 0, exploration: 0 };
        const byTier = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
        for (const a of list) {
            byCategory[a.category] = this._bumpCounter(byCategory, a.category);
            byTier[a.tier] = this._bumpCounter(byTier, a.tier);
        }
        const indexScore = Math.min(1, totalPoints * ACHIEVEMENT_INDEX_SCORE_FACTOR);
        return {
            playerId,
            total: list.length,
            totalPoints,
            indexScore,
            byCategory,
            byTier,
        };
    }

    deleteAchievement(achievementInternalId) {
        if (!this.achievements.has(achievementInternalId)) return { success: false, error: ACHIEVEMENT_NOT_FOUND };
        const ach = this.achievements.get(achievementInternalId);
        const playerId = ach.playerId;
        if (this.playerAchievements.has(playerId)) {
            const list = this.playerAchievements.get(playerId);
            const idx = list.indexOf(achievementInternalId);
            if (idx !== -1) list.splice(idx, 1);
        }
        this.achievements.delete(achievementInternalId);
        return { success: true };
    }

    registerTool(name, handler) {
        if (typeof name !== 'string' || name.length === 0) {
            return { success: false, error: INVALID_TOOL_NAME };
        }
        if (typeof handler !== 'function') {
            return { success: false, error: INVALID_HANDLER };
        }
        this.tools.set(name, handler);
        return { success: true };
    }

    executeTool(name, context) {
        if (!this.tools.has(name)) {
            return { success: false, error: UNKNOWN_TOOL };
        }
        const handler = this.tools.get(name);
        const ctx = (context !== undefined && context !== null) ? context : {};
        try {
            const result = handler(ctx);
            return { success: true, result };
        } catch (e) {
            return { success: false, error: TOOL_EXECUTION_ERROR, message: e.message };
        }
    }

    registerHook(event, handler) {
        if (typeof event !== 'string' || event.length === 0) {
            return { success: false, error: INVALID_EVENT_NAME };
        }
        if (typeof handler !== 'function') {
            return { success: false, error: INVALID_HANDLER };
        }
        if (!this.hooks.has(event)) {
            this.hooks.set(event, []);
        }
        this.hooks.get(event).push(handler);
        return { success: true };
    }

    _triggerHook(event, data) {
        if (!this.hooks.has(event)) return;
        for (const handler of this.hooks.get(event)) {
            try {
                handler(data);
            } catch (e) {
                // silent error handling
            }
        }
    }

    unregisterHook(event, handler) {
        if (!this.hooks.has(event)) return { success: false, error: EVENT_NOT_REGISTERED };
        const handlers = this.hooks.get(event);
        const idx = handlers.indexOf(handler);
        if (idx === -1) return { success: false, error: HANDLER_NOT_FOUND };
        handlers.splice(idx, 1);
        return { success: true };
    }

    toJSON() {
        return {
            config: { ...this.config },
            achievements: Array.from(this.achievements.entries()),
            playerAchievements: Array.from(this.playerAchievements.entries()),
            stats: { ...this.stats },
        };
    }

    fromJSON(data) {
        if (!data || typeof data !== 'object') return { success: false, error: INVALID_DATA };
        if (data.config) {
            this.config = { ...this.config, ...data.config };
        }
        if (data.achievements && Array.isArray(data.achievements)) {
            this.achievements = new Map(data.achievements);
        }
        if (data.playerAchievements && Array.isArray(data.playerAchievements)) {
            this.playerAchievements = new Map(data.playerAchievements);
        }
        if (data.stats) {
            this.stats = { ...this.stats, ...data.stats };
        }
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            totalAchievements: this.achievements.size,
            totalPlayers: this.playerAchievements.size,
        };
    }

    autoEvolve() {
        this.stats.evolutionCount += 1;
        this._triggerHook('onEvolve', { stats: this.stats });
        return { success: true, evolutionCount: this.stats.evolutionCount };
    }

    reset() {
        this.achievements.clear();
        this.playerAchievements.clear();
        this.hooks.clear();
        this.stats = {
            totalUnlocked: 0,
            totalQueried: 0,
            totalIndexed: 0,
            totalPoints: 0,
            evolutionCount: 0,
            byCategory: { combat: 0, cultivation: 0, social: 0, exploration: 0 },
            byTier: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
        };
        this._registerDefaultTools();
        return { success: true };
    }
}