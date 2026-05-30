/**
 * Badge Entity - 徽章实体
 * 徽章系统核心数据模型
 */

// 徽章稀有度
const BadgeRarity = {
    COMMON: 'common',       // 普通
    UNCOMMON: 'uncommon',   // 不普通
    RARE: 'rare',           // 稀有
    EPIC: 'epic',           // 史诗
    LEGENDARY: 'legendary', // 传说
    MYTHIC: 'mythic',       // 神级
};

// 徽章稀有度颜色
const RARITY_COLORS = {
    common: '#999999',
    uncommon: '#00ff00',
    rare: '#0066ff',
    epic: '#ff00ff',
    legendary: '#ff8800',
    mythic: '#ffff00',
};

// 徽章稀有度显示名称
const RARITY_NAMES = {
    common: '普通',
    uncommon: '不普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
    mythic: '神级',
};

// 徽章类型
const BadgeType = {
    ACHIEVEMENT: 'achievement',  // 成就徽章
    RANK: 'rank',                // 等级徽章
    SPECIAL: 'special',          // 特殊徽章
    SEASON: 'season',            // 赛季徽章
    EVENT: 'event',              // 活动徽章
};

// 最大装备数量
const MAX_EQUIPPED_BADGES = 3;

/**
 * Badge Entity Class
 */
class Badge {
    constructor(data = {}) {
        // 基本信息
        this.id = data.id || '';
        this.name = data.name || '徽章';
        this.description = data.description || '';
        this.type = data.type || BadgeType.ACHIEVEMENT;
        
        // 稀有度
        this.rarity = data.rarity || BadgeRarity.COMMON;
        this.color = data.color || RARITY_COLORS[this.rarity] || RARITY_COLORS.common;
        
        // 效果
        this.effect = data.effect || '';
        this.effectType = data.effectType || 'stat_bonus';
        this.effectValue = data.effectValue || 0;
        
        // 状态
        this.obtained = data.obtained || false;
        this.equipped = data.equipped || false;
        this.obtainedAt = data.obtainedAt || null;
        
        // 图标
        this.icon = data.icon || 'badge';
        
        // 来源
        this.source = data.source || '';  // 对应成就ID或来源描述
        this.sourceType = data.sourceType || 'achievement'; // achievement, purchase, event
        
        // 属性加成
        this.stats = data.stats || {};
        
        // 排序
        this.sortOrder = data.sortOrder || 0;
    }

    /**
     * 获取稀有度显示名称
     */
    getRarityName() {
        return RARITY_NAMES[this.rarity] || '普通';
    }

    /**
     * 检查是否可以装备
     */
    canEquip() {
        return this.obtained && !this.equipped;
    }

    /**
     * 检查是否可以卸下
     */
    canUnequip() {
        return this.equipped;
    }

    /**
     * 装备徽章
     */
    equip() {
        if (!this.obtained) {
            return { success: false, message: '徽章未获取，无法装备' };
        }
        if (this.equipped) {
            return { success: false, message: '徽章已装备' };
        }
        this.equipped = true;
        return { success: true, message: '装备成功' };
    }

    /**
     * 卸下徽章
     */
    unequip() {
        if (!this.equipped) {
            return { success: false, message: '徽章未装备，无法卸下' };
        }
        this.equipped = false;
        return { success: true, message: '卸下成功' };
    }

    /**
     * 获取装备加成
     */
    getEquippedBonus() {
        if (!this.equipped) return null;
        return {
            effect: this.effect,
            effectType: this.effectType,
            effectValue: this.effectValue,
            stats: this.stats
        };
    }

    /**
     * 转换为JSON对象
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            type: this.type,
            rarity: this.rarity,
            color: this.color,
            effect: this.effect,
            effectType: this.effectType,
            effectValue: this.effectValue,
            obtained: this.obtained,
            equipped: this.equipped,
            obtainedAt: this.obtainedAt,
            icon: this.icon,
            source: this.source,
            sourceType: this.sourceType,
            stats: this.stats,
            sortOrder: this.sortOrder
        };
    }

    /**
     * 从JSON创建实例
     */
    static fromJSON(json) {
        return new Badge(json);
    }
}

// 徽章池定义
const BADGE_POOL = [
    // 普通徽章
    { id: 'badge_first_login', name: '初入仙途', description: '首次登录游戏', rarity: BadgeRarity.COMMON, effect: '登录灵石+10', effectType: 'spirit_bonus', effectValue: 10 },
    { id: 'badge_realm_qi', name: '炼气期修士', description: '境界达到炼气期', rarity: BadgeRarity.COMMON, effect: '灵气获取+5%', effectType: 'spirit_rate', effectValue: 0.05 },
    
    // 稀有徽章
    { id: 'badge_realm_zhu', name: '筑基期修士', description: '境界达到筑基期', rarity: BadgeRarity.RARE, effect: '灵石获取+5%', effectType: 'stone_rate', effectValue: 0.05 },
    { id: 'badge_realm_jin', name: '金丹期修士', description: '境界达到金丹期', rarity: BadgeRarity.RARE, effect: '战斗属性+10%', effectType: 'battle_stat', effectValue: 0.1 },
    { id: 'badge_battle_master', name: '战斗达人', description: '完成100次战斗', rarity: BadgeRarity.RARE, effect: '暴击率+5%', effectType: 'crit_rate', effectValue: 0.05 },
    { id: 'badge_quest_master', name: '任务达人', description: '完成50个任务', rarity: BadgeRarity.RARE, effect: '任务奖励+10%', effectType: 'quest_reward', effectValue: 0.1 },
    { id: 'badge_spirit_rich', name: '灵气充裕', description: '累计获得1000灵气', rarity: BadgeRarity.RARE, effect: '灵气上限+100', effectType: 'spirit_cap', effectValue: 100 },
    { id: 'badge_wealth', name: '富甲一方', description: '累计获得10000灵石', rarity: BadgeRarity.RARE, effect: '商店折扣+5%', effectType: 'shop_discount', effectValue: 0.05 },
    
    // 史诗徽章
    { id: 'badge_realm_yuan', name: '元婴期修士', description: '境界达到元婴期', rarity: BadgeRarity.EPIC, effect: '修炼速度+15%', effectType: 'cultivation_speed', effectValue: 0.15 },
    { id: 'badge_signin_30', name: '签到之星', description: '累计签到30天', rarity: BadgeRarity.EPIC, effect: '每日登录奖励翻倍', effectType: 'login_double', effectValue: 2 },
    { id: 'badge_rare_collector', name: '稀有收藏家', description: '收集5个稀有徽章', rarity: BadgeRarity.EPIC, effect: '稀有奖励+20%', effectType: 'rare_bonus', effectValue: 0.2 },
    
    // 传说徽章
    { id: 'badge_legend', name: '传说修士', description: '累计获得50000灵石', rarity: BadgeRarity.LEGENDARY, effect: '全体属性+20%', effectType: 'all_stat', effectValue: 0.2 },
    { id: 'badge_arena_king', name: '竞技之王', description: '竞技场排名第一', rarity: BadgeRarity.LEGENDARY, effect: 'PVP伤害+30%', effectType: 'pvp_damage', effectValue: 0.3 },
    { id: 'badge_pet_master', name: '驭兽大师', description: '收集全部宠物类型', rarity: BadgeRarity.LEGENDARY, effect: '宠物属性+25%', effectType: 'pet_stat', effectValue: 0.25 },
    
    // 神级徽章
    { id: 'badge_divine_cultivator', name: '飞升成仙', description: '境界达到飞升', rarity: BadgeRarity.MYTHIC, effect: '全部属性+50%', effectType: 'all_stat', effectValue: 0.5 },
    { id: 'badge_immortal', name: '不朽者', description: '连续登录100天', rarity: BadgeRarity.MYTHIC, effect: '离线收益+100%', effectType: 'offline_income', effectValue: 1.0 },
];

// 徽章效果类型
const BADGE_EFFECT_TYPES = {
    STAT_BONUS: 'stat_bonus',
    SPIRIT_BONUS: 'spirit_bonus',
    SPIRIT_RATE: 'spirit_rate',
    STONE_RATE: 'stone_rate',
    BATTLE_STAT: 'battle_stat',
    CRIT_RATE: 'crit_rate',
    QUEST_REWARD: 'quest_reward',
    SPIRIT_CAP: 'spirit_cap',
    SHOP_DISCOUNT: 'shop_discount',
    CULTIVATION_SPEED: 'cultivation_speed',
    LOGIN_DOUBLE: 'login_double',
    RARE_BONUS: 'rare_bonus',
    PVP_DAMAGE: 'pvp_damage',
    PET_STAT: 'pet_stat',
    ALL_STAT: 'all_stat',
    OFFLINE_INCOME: 'offline_income',
};

// 稀有度排序
const RARITY_ORDER = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
    mythic: 6,
};

module.exports = {
    Badge,
    BadgeRarity,
    BadgeType,
    RARITY_COLORS,
    RARITY_NAMES,
    MAX_EQUIPPED_BADGES,
    BADGE_POOL,
    BADGE_EFFECT_TYPES,
    RARITY_ORDER,
};