/**
 * BadgeService - 徽章服务
 * 处理徽章相关的业务逻辑
 */

const { Badge, BadgeRarity, BadgeType, BADGE_POOL, RARITY_ORDER } = require('../entities/Badge');

// 最大装备徽章数量
const MAX_EQUIPPED_BADGES = 3;

// 徽章状态初始化器版本映射
const BADGE_STATE_INITIALIZERS = {
    V114: '_initBadgeState',
    V137: '_initBadgeState',
    V155: '_initBadgeStateV2',
    V165: '_initBadgeStateV3',
    V175: '_initBadgeStateV4',
    V185: '_initBadgeStateV5',
    V195: '_initBadgeStateV6',
    V203: '_initBadgeStateV7',
};

/**
 * BadgeService Class
 */
class BadgeService {
    constructor(gameState) {
        this.gs = gameState;
    }

    /**
     * 初始化徽章状态 (V114/V137基础版)
     */
    _initBadgeState() {
        if (!this.gs.badge) {
            this.gs.badge = {
                badges: [...BADGE_POOL].map(b => ({ ...b, obtained: false, equipped: false, obtainedAt: null })),
                equippedBadges: []
            };
        }
        return this.gs.badge;
    }

    /**
     * 初始化徽章状态V2 (V155)
     */
    _initBadgeStateV2() {
        if (!this.gs.badgeV2) {
            this.gs.badgeV2 = {
                badges: [...BADGE_POOL].map(b => ({ ...b, obtained: false, equipped: false, obtainedAt: null })),
                totalBadges: 0,
                equippedBadges: []
            };
            this.gs.badgeV2.totalBadges = this.gs.badgeV2.badges.length;
        }
        return this.gs.badgeV2;
    }

    /**
     * 初始化徽章状态V3 (V165)
     */
    _initBadgeStateV3() {
        if (!this.gs.badgeV3) {
            this.gs.badgeV3 = {
                badges: [...BADGE_POOL].map(b => ({
                    ...b,
                    obtained: false,
                    equipped: false,
                    obtainedAt: null
                })),
                totalBadges: 0,
                equippedBadges: []
            };
            this.gs.badgeV3.totalBadges = this.gs.badgeV3.badges.length;
        }
        return this.gs.badgeV3;
    }

    /**
     * 初始化徽章状态V6 (V195)
     */
    _initBadgeStateV6() {
        if (!this.gs.badgeV6) {
            this.gs.badgeV6 = {
                badges: [
                    { id: 'badge_first_login_v6', name: '初入仙途v6', description: '首次登录游戏', rarity: 'common', obtained: false, equipped: false, obtainedAt: null },
                    { id: 'badge_realm_qi_v6', name: '炼气期修士v6', description: '境界达到炼气期', rarity: 'common', obtained: false, equipped: false, obtainedAt: null },
                    { id: 'badge_realm_zhu_v6', name: '筑基期修士v6', description: '境界达到筑基期', rarity: 'rare', obtained: false, equipped: false, obtainedAt: null },
                    { id: 'badge_realm_jin_v6', name: '金丹期修士v6', description: '境界达到金丹期', rarity: 'rare', obtained: false, equipped: false, obtainedAt: null },
                    { id: 'badge_realm_yuan_v6', name: '元婴期修士v6', description: '境界达到元婴期', rarity: 'epic', obtained: false, equipped: false, obtainedAt: null },
                    { id: 'badge_spirit_rich_v6', name: '灵气充裕v6', description: '累计获得1000灵气', rarity: 'common', obtained: false, equipped: false, obtainedAt: null },
                    { id: 'badge_battle_master_v6', name: '战斗达人v6', description: '完成100次战斗', rarity: 'rare', obtained: false, equipped: false, obtainedAt: null },
                    { id: 'badge_quest_master_v6', name: '任务达人v6', description: '完成50个任务', rarity: 'rare', obtained: false, equipped: false, obtainedAt: null },
                    { id: 'badge_signin_30_v6', name: '签到之星v6', description: '累计签到30天', rarity: 'epic', obtained: false, equipped: false, obtainedAt: null },
                    { id: 'badge_wealth_v6', name: '富甲一方v6', description: '累计获得10000灵石', rarity: 'rare', obtained: false, equipped: false, obtainedAt: null },
                    { id: 'badge_legend_v6', name: '传说修士v6', description: '累计获得50000灵石', rarity: 'legendary', obtained: false, equipped: false, obtainedAt: null },
                    { id: 'badge_rare_collector_v6', name: '稀有收藏家v6', description: '收集5个稀有徽章', rarity: 'epic', obtained: false, equipped: false, obtainedAt: null }
                ],
                totalBadges: 0,
                equippedBadges: []
            };
            this.gs.badgeV6.totalBadges = this.gs.badgeV6.badges.length;
        }
        return this.gs.badgeV6;
    }

    /**
     * 获取徽章列表 (V114/V137基础版)
     */
    mcpBadgeList() {
        try {
            const badge = this._initBadgeState();
            return {
                success: true,
                badges: badge.badges,
                total: badge.badges.length,
                equippedCount: badge.equippedBadges.length
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 装备徽章 (V114/V137基础版)
     */
    mcpBadgeEquip(badgeId) {
        try {
            const badge = this._initBadgeState();
            const b = badge.badges.find(b => b.id === badgeId);
            if (!b) return { error: '徽章不存在' };
            if (!b.obtained) return { error: '徽章未获取，无法装备' };
            if (b.equipped) {
                // 卸下
                b.equipped = false;
                badge.equippedBadges = badge.equippedBadges.filter(id => id !== badgeId);
                return { success: true, badgeId, equipped: false };
            }
            // 装备
            if (badge.equippedBadges.length >= MAX_EQUIPPED_BADGES) {
                return { error: '最多只能装备' + MAX_EQUIPPED_BADGES + '个徽章' };
            }
            b.equipped = true;
            badge.equippedBadges.push(badgeId);
            return { success: true, badgeId, equipped: true };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 卸下徽章 (V114/V137基础版)
     */
    mcpBadgeUnequip() {
        try {
            const badge = this._initBadgeState();
            const equipped = badge.badges.find(b => b.equipped);
            if (!equipped) return { error: '没有装备的徽章' };
            equipped.equipped = false;
            badge.equippedBadges = badge.equippedBadges.filter(id => id !== equipped.id);
            return { success: true, badgeId: equipped.id };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 获取徽章列表V2 (V155)
     */
    mcpBadgeListV2() {
        try {
            const badgeV2 = this._initBadgeStateV2();
            return {
                success: true,
                badges: badgeV2.badges.map(b => ({
                    id: b.id,
                    name: b.name,
                    description: b.description,
                    rarity: b.rarity,
                    effect: b.effect,
                    obtained: b.obtained,
                    equipped: b.equipped
                })),
                totalBadges: badgeV2.totalBadges,
                equippedCount: badgeV2.equippedBadges.length
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 装备徽章V2 (V155)
     */
    mcpBadgeEquipV2(badgeId) {
        try {
            const badgeV2 = this._initBadgeStateV2();
            const b = badgeV2.badges.find(b => b.id === badgeId);
            if (!b) return { error: '徽章不存在' };
            if (!b.obtained) return { error: '徽章未获取，无法装备' };
            if (b.equipped) {
                b.equipped = false;
                badgeV2.equippedBadges = badgeV2.equippedBadges.filter(id => id !== badgeId);
                return { success: true, badgeId, equipped: false };
            }
            if (badgeV2.equippedBadges.length >= MAX_EQUIPPED_BADGES) {
                return { error: '最多只能装备' + MAX_EQUIPPED_BADGES + '个徽章' };
            }
            b.equipped = true;
            badgeV2.equippedBadges.push(badgeId);
            return { success: true, badgeId, equipped: true };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 卸下徽章V2 (V155)
     */
    mcpBadgeUnequipV2(badgeId) {
        try {
            const badgeV2 = this._initBadgeStateV2();
            if (badgeId) {
                const b = badgeV2.badges.find(b => b.id === badgeId);
                if (!b) return { error: '徽章不存在' };
                b.equipped = false;
                badgeV2.equippedBadges = badgeV2.equippedBadges.filter(id => id !== badgeId);
                return { success: true, badgeId };
            }
            // 卸下所有
            for (const b of badgeV2.badges) {
                if (b.equipped) b.equipped = false;
            }
            badgeV2.equippedBadges = [];
            return { success: true };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 获取徽章列表V3 (V165)
     */
    mcpBadgeListV3() {
        try {
            const badgeV3 = this._initBadgeStateV3();
            return {
                success: true,
                badges: badgeV3.badges.map(b => ({
                    id: b.id,
                    name: b.name,
                    description: b.description,
                    rarity: b.rarity,
                    effect: b.effect,
                    obtained: b.obtained,
                    equipped: b.equipped,
                    obtainedAt: b.obtainedAt
                })),
                totalBadges: badgeV3.totalBadges,
                obtainedCount: badgeV3.badges.filter(b => b.obtained).length,
                equippedCount: badgeV3.equippedBadges.length
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 装备徽章V3 (V165)
     */
    mcpBadgeEquipV3(badgeId) {
        try {
            const badgeV3 = this._initBadgeStateV3();
            const b = badgeV3.badges.find(b => b.id === badgeId);
            if (!b) return { error: '徽章不存在' };
            if (!b.obtained) return { error: '徽章未获取，无法装备' };
            if (b.equipped) {
                b.equipped = false;
                badgeV3.equippedBadges = badgeV3.equippedBadges.filter(id => id !== badgeId);
                return { success: true, badgeId, equipped: false, equippedBadges: badgeV3.equippedBadges };
            }
            if (badgeV3.equippedBadges.length >= MAX_EQUIPPED_BADGES) {
                return { error: '最多只能装备' + MAX_EQUIPPED_BADGES + '个徽章，请先卸下一个' };
            }
            b.equipped = true;
            badgeV3.equippedBadges.push(badgeId);
            return { success: true, badgeId, equipped: true, equippedBadges: badgeV3.equippedBadges };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 获取徽章列表V6 (V195/V203)
     */
    mcpBadgeListV6(filter = 'all') {
        try {
            const badgeV6 = this._initBadgeStateV6();
            let badges = badgeV6.badges;
            if (filter === 'obtained') {
                badges = badges.filter(b => b.obtained);
            } else if (filter === 'equipped') {
                badges = badges.filter(b => b.equipped);
            }
            const obtainedCount = badgeV6.badges.filter(b => b.obtained).length;
            const equippedCount = badgeV6.badges.filter(b => b.equipped).length;
            return {
                success: true,
                badges: badges.map(b => ({
                    id: b.id,
                    name: b.name,
                    description: b.description,
                    rarity: b.rarity,
                    obtained: b.obtained,
                    equipped: b.equipped,
                    obtainedAt: b.obtainedAt
                })),
                totalBadges: badgeV6.totalBadges,
                obtainedCount,
                equippedCount
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 装备徽章V6 (V195/V203)
     */
    mcpBadgeEquipV6(badgeId) {
        try {
            const badgeV6 = this._initBadgeStateV6();
            if (!badgeId) return { error: '请指定徽章ID' };
            const badge = badgeV6.badges.find(b => b.id === badgeId);
            if (!badge) return { error: '徽章不存在' };
            if (!badge.obtained) return { error: '徽章未获取，无法装备' };
            if (badge.equipped) {
                // 卸下
                badge.equipped = false;
                badgeV6.equippedBadges = badgeV6.equippedBadges.filter(id => id !== badgeId);
                return { success: true, badgeId, equipped: false, equippedBadges: badgeV6.equippedBadges };
            }
            // 装备（最多3个）
            if (badgeV6.equippedBadges.length >= MAX_EQUIPPED_BADGES) {
                return { error: '最多只能装备' + MAX_EQUIPPED_BADGES + '个徽章，请先卸下一个' };
            }
            badge.equipped = true;
            badgeV6.equippedBadges.push(badgeId);
            return { success: true, badgeId, equipped: true, equippedBadges: badgeV6.equippedBadges };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 徽章展示V8 (V213)
     */
    mcpBadgeShowV8(badgeId) {
        try {
            const badgeV6 = this._initBadgeStateV6();
            if (!badgeId) return { error: '请指定徽章ID' };
            const badge = badgeV6.badges.find(b => b.id === badgeId);
            if (!badge) return { error: '徽章不存在' };
            return {
                success: true,
                badge: {
                    id: badge.id,
                    name: badge.name,
                    description: badge.description,
                    rarity: badge.rarity,
                    effect: badge.effect,
                    obtained: badge.obtained,
                    equipped: badge.equipped
                },
                message: badge.obtained ? badge.name + ' - ' + badge.effect : '徽章未获取'
            };
        } catch (e) { return { error: e.message }; }
    }

    /**
     * 授予徽章（内部方法，用于成就奖励等）
     */
    grantBadge(badgeId) {
        const badgeV6 = this._initBadgeStateV6();
        const badge = badgeV6.badges.find(b => b.id === badgeId);
        if (!badge) return { success: false, message: '徽章不存在' };
        if (badge.obtained) return { success: false, message: '徽章已获取' };
        
        badge.obtained = true;
        badge.obtainedAt = new Date().toISOString();
        
        return { success: true, badgeId, message: '获得徽章: ' + badge.name };
    }

    /**
     * 获取已装备徽章的效果加成
     */
    getEquippedBadgeEffects() {
        const badgeV6 = this._initBadgeStateV6();
        const equippedBadges = badgeV6.badges.filter(b => b.equipped);
        
        const effects = {
            statBonus: {},
            spiritBonus: 0,
            stoneBonus: 0,
            battleStatBonus: 0,
            critRateBonus: 0,
            cultivationSpeedBonus: 0
        };
        
        for (const badge of equippedBadges) {
            if (badge.effectType === 'stat_bonus' && badge.stats) {
                for (const [stat, value] of Object.entries(badge.stats)) {
                    effects.statBonus[stat] = (effects.statBonus[stat] || 0) + value;
                }
            }
            if (badge.effectType === 'spirit_rate') effects.spiritBonus += badge.effectValue || 0;
            if (badge.effectType === 'stone_rate') effects.stoneBonus += badge.effectValue || 0;
            if (badge.effectType === 'battle_stat') effects.battleStatBonus += badge.effectValue || 0;
            if (badge.effectType === 'crit_rate') effects.critRateBonus += badge.effectValue || 0;
            if (badge.effectType === 'cultivation_speed') effects.cultivationSpeedBonus += badge.effectValue || 0;
        }
        
        return effects;
    }

    /**
     * 获取徽章统计信息
     */
    getBadgeStats() {
        const badgeV6 = this._initBadgeStateV6();
        const badges = badgeV6.badges;
        
        const stats = {
            total: badges.length,
            obtained: badges.filter(b => b.obtained).length,
            equipped: badges.filter(b => b.equipped).length,
            byRarity: {}
        };
        
        const rarities = Object.values(BadgeRarity);
        for (const rarity of rarities) {
            const rarityBadges = badges.filter(b => b.rarity === rarity);
            stats.byRarity[rarity] = {
                total: rarityBadges.length,
                obtained: rarityBadges.filter(b => b.obtained).length
            };
        }
        
        return stats;
    }

    /**
     * 检查是否满足稀有收藏家成就条件
     */
    checkRareCollectorAchievement() {
        const badgeV6 = this._initBadgeStateV6();
        const rareObtained = badgeV6.badges.filter(b => b.rarity === 'rare' && b.obtained).length;
        return rareObtained >= 5;
    }
}

export {
    BadgeService,
    MAX_EQUIPPED_BADGES,
    BADGE_STATE_INITIALIZERS,
};