/**
 * Equipment Entity - 装备实体
 * 修炼游戏中的装备定义，包括武器、防具、饰品等
 */

class Equipment {
    constructor(config) {
        this.id = config.id || Date.now().toString();
        this.name = config.name || '未知装备';
        this.type = config.type || 'weapon'; // weapon/armor/accessory/heavenly
        this.quality = config.quality || 'common'; // common/rare/precious/legendary/ultimate
        this.slot = config.slot ?? 0; // 0=weapon, 1=armor, 2=accessory, 3=heavenly
        this.effect = config.effect || {};
        this.baseEffect = config.baseEffect || {};
        this.lawEffect = config.lawEffect || null; // 天道法则效果
        this.desc = config.desc || '';
        this.icon = config.icon || '⚔️';
        this.price = config.price || 100;
        this.star = config.star || 1; // 星级
        this.enhanced = config.enhanced || false;
        this.enhancementLevel = config.enhancementLevel || 0;
        this.evolutionReq = config.evolutionReq || null; // 进化需求 { item, star, stones }
        this.bound = config.bound || false; // 绑定状态
        this.permanent = config.permanent || false; // 永久装备
    }

    /**
     * 获取装备品质颜色
     */
    getQualityColor() {
        const colors = {
            'common': '#aaaaaa',
            'rare': '#00b894',
            'precious': '#6c5ce7',
            'legendary': '#fd79a8',
            'ultimate': '#fdcb6e'
        };
        return colors[this.quality] || colors.common;
    }

    /**
     * 获取装备品质名称
     */
    getQualityName() {
        const names = {
            'common': '凡品',
            'rare': '良品',
            'precious': '珍品',
            'legendary': '传说',
            'ultimate': '天道'
        };
        return names[this.quality] || '凡品';
    }

    /**
     * 获取装备槽位名称
     */
    getSlotName() {
        const slotNames = {
            0: '武器',
            1: '防具',
            2: '饰品',
            3: '天道'
        };
        return slotNames[this.slot] || '饰品';
    }

    /**
     * 计算装备基础属性加成
     */
    getBaseStats() {
        const stats = {};
        if (this.effect.type === 'attack' || this.effect.type === 'attackBonus') {
            stats.attackBonus = this.effect.value || 0;
        }
        if (this.effect.type === 'defense' || this.effect.type === 'defenseBonus') {
            stats.defenseBonus = this.effect.value || 0;
        }
        if (this.effect.hpBonus) {
            stats.hpBonus = this.effect.hpBonus;
        }
        if (this.effect.critBonus) {
            stats.critBonus = this.effect.critBonus;
        }
        return stats;
    }

    /**
     * 计算星级加成
     */
    getStarBonus() {
        const bonusPercent = (this.star - 1) * 0.1; // 每级+10%
        return {
            attack: bonusPercent,
            defense: bonusPercent,
            all: bonusPercent * 0.5
        };
    }

    /**
     * 获取强化加成
     */
    getEnhancementBonus() {
        if (!this.enhanced) return {};
        const bonus = this.enhancementLevel * 0.05; // 每级+5%
        return {
            attack: this.type === 'weapon' ? bonus : 0,
            defense: this.type === 'armor' ? bonus : 0,
            all: this.type === 'accessory' ? bonus : 0
        };
    }

    /**
     * 检查是否可以进化
     */
    canEvolve(currentStar, spiritStones) {
        if (!this.evolutionReq) return { can: false, reason: '此装备无法进化' };
        if (currentStar < this.evolutionReq.star) {
            return { can: false, reason: `需要星级${this.evolutionReq.star}才能进化` };
        }
        if (spiritStones < this.evolutionReq.stones) {
            return { can: false, reason: `需要${this.evolutionReq.stones}灵石才能进化` };
        }
        return { can: true };
    }

    /**
     * 强化装备
     */
    enhance() {
        if (this.enhanced) {
            this.enhancementLevel++;
        } else {
            this.enhanced = true;
            this.enhancementLevel = 1;
        }
        return { success: true, level: this.enhancementLevel };
    }

    /**
     * 获取完整描述
     */
    getFullDesc() {
        let desc = this.desc;
        if (this.star > 1) {
            desc += ` (+${this.star - 1}级)`;
        }
        if (this.enhanced) {
            desc += ` [强化+${this.enhancementLevel}]`;
        }
        if (this.lawEffect) {
            desc += `\n法则效果: ${this.lawEffect.desc}`;
        }
        return desc;
    }

    /**
     * 检查装备是否有天道法则效果
     */
    hasLawEffect() {
        return this.lawEffect && this.lawEffect.type !== undefined;
    }

    /**
     * 获取天道法则效果类型
     */
    getLawEffectType() {
        return this.lawEffect?.type || null;
    }

    /**
     * 序列化装备数据
     */
    serialize() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            quality: this.quality,
            slot: this.slot,
            effect: this.effect,
            baseEffect: this.baseEffect,
            lawEffect: this.lawEffect,
            desc: this.desc,
            icon: this.icon,
            price: this.price,
            star: this.star,
            enhanced: this.enhanced,
            enhancementLevel: this.enhancementLevel,
            evolutionReq: this.evolutionReq,
            bound: this.bound,
            permanent: this.permanent
        };
    }

    /**
     * 从保存数据恢复
     */
    static deserialize(data) {
        return new Equipment(data);
    }
}

// 装备类型常量
const EQUIPMENT_TYPES = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    ACCESSORY: 'accessory',
    HEAVENLY: 'heavenly'
};

// 装备槽位常量
const EQUIPMENT_SLOTS = {
    WEAPON: 0,
    ARMOR: 1,
    ACCESSORY: 2,
    HEAVENLY: 3
};

// 天道套装配置
const HEAVENLY_DAO_SET_BONUSES = {
    '天道套装': {
        pieces: ['天道剑·永恒', '天盾·不灭', '天命珠·轮回'],
        count: 3,
        stats: { attackPercent: 0.25, defensePercent: 0.25, all_stats: 0.10 },
        twoPiece: '攻击+25%，防御+25%',
        threePiece: '全属性+10%，解锁【天命】被动：每回合恢复1%最大生命',
        skill: '天命：受到致命伤害时，消耗天道气息复活，恢复30%生命，每日限一次'
    },
    '法则套装': {
        pieces: ['天罚令', '道种', '因果镜'],
        count: 3,
        stats: { tribulation_power: 0.30, cultivation_speed: 0.25, serendipity_rate: 0.20 },
        twoPiece: '渡劫+30%，修炼+25%',
        threePiece: '奇遇+20%，解锁【道法自然】被动：所有概率加成额外+15%',
        skill: '道法自然：所有概率触发效果提升15%，包括暴击、闪避、顿悟等'
    },
    '终极套装': {
        pieces: ['天道剑·永恒', '天盾·不灭', '天命珠·轮回', '天罚令', '道种', '因果镜'],
        count: 6,
        stats: { attackPercent: 0.30, defensePercent: 0.30, all_stats: 0.20, critPercent: 0.15 },
        twoPiece: '攻击+30%，防御+30%',
        threePiece: '全属性+20%，暴击+15%',
        sixPiece: '解锁【超脱】被动：渡劫必定成功，修炼速度翻倍，寿元无限制',
        skill: '超脱：免疫一切负面状态，寿元耗尽时自动进入轮回转世，保留全部属性加成'
    }
};

// 强化配置
const ENHANCE_CONFIG = {
    levels: [
        { cost: 100, bonus: 0.05, desc: '强化+1: 基础属性+5%' },
        { cost: 500, bonus: 0.10, desc: '强化+2: 基础属性+10%' },
        { cost: 2000, bonus: 0.15, desc: '强化+3: 基础属性+15%' },
        { cost: 5000, bonus: 0.20, desc: '强化+4: 基础属性+20%' },
        { cost: 10000, bonus: 0.30, desc: '强化+5: 基础属性+30%' }
    ],
    maxLevel: 5,
    stoneTypes: { common: 50, rare: 200, precious: 1000, legendary: 5000 }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        Equipment, 
        EQUIPMENT_TYPES, 
        EQUIPMENT_SLOTS, 
        HEAVENLY_DAO_SET_BONUSES,
        ENHANCE_CONFIG 
    };
}