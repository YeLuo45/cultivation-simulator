/**
 * SpiritRootEntity.js - 灵根实体
 * 管理灵根相关数据
 */

/**
 * 灵根品质映射
 */
const TIER_MAP = {
    1: '凡品',
    2: '良品',
    3: '上品',
    4: '极品',
    5: '天品'
};

/**
 * 灵根类型
 */
const ROOT_TYPES = ['metal', 'wood', 'water', 'fire', 'earth', 'all'];

/**
 * 灵根类型中文名
 */
const ROOT_TYPE_NAMES = {
    metal: '金',
    wood: '木',
    water: '水',
    fire: '火',
    earth: '土',
    all: '全属性'
};

/**
 * 灵根属性加成表
 */
const TIER_BONUSES = {
    1: {},  // 凡品 - 无加成
    2: { cultivationSpeed: 10 },  // 良品 - 修炼速度+10%
    3: { cultivationSpeed: 20, attack: 10 },  // 上品 - 修炼速度+20%, 攻击+10
    4: { cultivationSpeed: 30, attack: 20, defense: 10 },  // 极品 - 修炼速度+30%, 攻击+20, 防御+10
    5: { cultivationSpeed: 50, attack: 30, defense: 20, critRate: 15 }  // 天品 - 修炼速度+50%, 攻击+30, 防御+20, 暴击率+15%
};

/**
 * 灵根实体类
 */
class SpiritRootEntity {
    constructor(data = {}) {
        // 灵根类型 (metal/wood/water/fire/earth/all)
        this.type = data.type || 'wood';
        
        // 灵根品级 (1-5: 凡品/良品/上品/极品/天品)
        this.tier = data.tier || 1;
        
        // 进化次数
        this.evolveCount = data.evolveCount || 0;
        
        // 当前灵根的经验/能量
        this.energy = data.energy || 0;
        this.maxEnergy = data.maxEnergy || 100;
        
        // 灵根亲和力 (影响特定功法)
        this.elementalAffinity = data.elementalAffinity || {
            metal: 0,
            wood: 0,
            water: 0,
            fire: 0,
            earth: 0
        };
        
        // 觉醒状态
        this.awakened = data.awakened || false;
        this.awakeningProgress = data.awakeningProgress || 0;
    }

    /**
     * 获取灵根类型中文名
     */
    getTypeName() {
        return ROOT_TYPE_NAMES[this.type] || '未知';
    }

    /**
     * 获取灵根品级中文名
     */
    getTierName() {
        return TIER_MAP[this.tier] || '凡品';
    }

    /**
     * 获取灵根完整名称
     */
    getFullName() {
        return `${this.getTierName()}${this.getTypeName()}灵根`;
    }

    /**
     * 是否满级
     */
    isMaxTier() {
        return this.tier >= 5;
    }

    /**
     * 获取属性加成
     */
    getBonuses() {
        return TIER_BONUSES[this.tier] || {};
    }

    /**
     * 获取进化所需灵石
     */
    getEvolveCost() {
        return this.tier * 500;
    }

    /**
     * 获取进化后品级名称
     */
    getNextTierName() {
        return TIER_MAP[this.tier + 1] || '已满级';
    }

    /**
     * 获取灵根能量百分比
     */
    getEnergyPercentage() {
        return (this.energy / this.maxEnergy * 100).toFixed(1);
    }

    /**
     * 获取元素亲和力摘要
     */
    getElementalAffinitySummary() {
        return { ...this.elementalAffinity };
    }

    /**
     * 获取灵根摘要
     */
    getSummary() {
        return {
            type: this.type,
            typeName: this.getTypeName(),
            tier: this.tier,
            tierName: getTierName(this.tier),
            fullName: this.getFullName(),
            isMaxTier: this.isMaxTier(),
            bonuses: this.getBonuses(),
            evolveCost: this.getEvolveCost(),
            nextTierName: this.getNextTierName(),
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            energyPercentage: this.getEnergyPercentage(),
            elementalAffinity: this.getElementalAffinitySummary(),
            awakened: this.awakened,
            awakeningProgress: this.awakeningProgress,
            evolveCount: this.evolveCount
        };
    }

    /**
     * 序列化 (用于保存)
     */
    serialize() {
        return {
            type: this.type,
            tier: this.tier,
            evolveCount: this.evolveCount,
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            elementalAffinity: { ...this.elementalAffinity },
            awakened: this.awakened,
            awakeningProgress: this.awakeningProgress
        };
    }
}

/**
 * 获取品级名称 (辅助函数)
 */
function getTierName(tier) {
    return TIER_MAP[tier] || '凡品';
}

// 导出
export { SpiritRootEntity, TIER_MAP, ROOT_TYPES, ROOT_TYPE_NAMES, TIER_BONUSES, getTierName };