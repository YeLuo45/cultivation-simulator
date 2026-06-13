/**
 * Reincarnation Entity - 轮回实体
 * 管理轮回系统的数据结构和状态
 */

class Reincarnation {
    constructor(config) {
        this.times = config.times || 0;
        this.totalKarma = config.totalKarma || 0;
        this.bonuses = config.bonuses || [];
        this.karmaGood = config.karmaGood || 0;
        this.karmaBad = config.karmaBad || 0;
        this.currentLife = config.currentLife || null;
        this.pastLives = config.pastLives || [];
        this.realmAtDeath = config.realmAtDeath || 0;
        this.ageAtDeath = config.ageAtDeath || 0;
        this.causeOfDeath = config.causeOfDeath || 'unknown';
        this.retainedSkills = config.retainedSkills || [];
        this.retainedItems = config.retainedItems || [];
        this.soulAge = config.soulAge || 0;
        this.reincarnationBonus = config.reincarnationBonus || {};
    }

    /**
     * 获取轮回次数
     */
    getTimes() {
        return this.times;
    }

    /**
     * 获取总因果
     */
    getTotalKarma() {
        return this.totalKarma;
    }

    /**
     * 计算净因果
     */
    getNetKarma() {
        return this.karmaGood - this.karmaBad;
    }

    /**
     * 获取轮回加成
     */
    getBonus() {
        const bonus = {
            cultivationSpeed: 0,
            attack: 0,
            defense: 0,
            spiritStones: 0,
            serendipityChance: 0
        };

        for (const b of this.bonuses) {
            if (b.type === 'cultivationSpeed') bonus.cultivationSpeed += b.value;
            if (b.type === 'attack') bonus.attack += b.value;
            if (b.type === 'defense') bonus.defense += b.value;
            if (b.type === 'spiritStones') bonus.spiritStones += b.value;
            if (b.type === 'serendipityChance') bonus.serendipityChance += b.value;
        }

        return bonus;
    }

    /**
     * 添加轮回记录
     */
    addReincarnationRecord(causeOfDeath, realmAtDeath, ageAtDeath, karmaBalance) {
        const record = {
            time: Date.now(),
            times: this.times,
            causeOfDeath,
            realmAtDeath,
            ageAtDeath,
            karmaBalance,
            bonusesGained: []
        };

        this.pastLives.push(record);
        return record;
    }

    /**
     * 计算下一次轮回的加成
     */
    calculateNextLifeBonus() {
        const netKarma = this.getNetKarma();
        const bonuses = [];

        // 每次轮回获得基础属性加成
        bonuses.push({
            type: 'cultivationSpeed',
            value: Math.min(0.5, this.times * 0.05),
            desc: '修炼速度+5%/次'
        });

        // 根据因果值给予额外加成
        if (netKarma > 100) {
            bonuses.push({
                type: 'attack',
                value: 0.1,
                desc: '攻击+10%'
            });
        }
        if (netKarma > 500) {
            bonuses.push({
                type: 'defense',
                value: 0.1,
                desc: '防御+10%'
            });
        }
        if (netKarma > 1000) {
            bonuses.push({
                type: 'serendipityChance',
                value: 0.05,
                desc: '奇遇+5%'
            });
        }

        // 高境界轮回获得额外加成
        if (this.realmAtDeath >= 3) {
            bonuses.push({
                type: 'spiritStones',
                value: 0.2,
                desc: '灵石获取+20%'
            });
        }

        return bonuses;
    }

    /**
     * 执行轮回
     */
    reincarnate(gameState) {
        // 记录当前生命信息
        this.addReincarnationRecord(
            this.causeOfDeath,
            gameState.realm || 0,
            gameState.age || gameState.days || 0,
            this.getNetKarma()
        );

        // 累加轮回次数
        this.times++;

        // 计算并应用加成
        const newBonuses = this.calculateNextLifeBonus();
        this.bonuses.push(...newBonuses);

        // 重置境界
        gameState.realm = 0;
        gameState.stage = 0;
        gameState.qi = 0;
        gameState.maxQi = 100;
        gameState.cultivationProgress = 0;

        // 保留部分物品
        const retainedItems = this.retainedItems.filter(item => {
            return item.type === 'treasure' && item.permanent;
        });
        gameState.inventory = retainedItems;

        // 记录轮回信息
        const record = {
            time: Date.now(),
            bonus: 'realm_reset',
            times: this.times
        };
        this.bonuses.push(record);

        return {
            success: true,
            times: this.times,
            bonuses: newBonuses,
            message: `轮回转世完成！已轮回数: ${this.times}`
        };
    }

    /**
     * 检查是否可以保留物品到下一世
     */
    canRetainItem(item) {
        return item.type === 'treasure' && item.permanent;
    }

    /**
     * 添加保留物品
     */
    addRetainedItem(item) {
        if (this.canRetainItem(item)) {
            this.retainedItems.push(item);
        }
    }

    /**
     * 获取轮回统计
     */
    getStats() {
        return {
            times: this.times,
            totalKarma: this.totalKarma,
            netKarma: this.getNetKarma(),
            karmaGood: this.karmaGood,
            karmaBad: this.karmaBad,
            soulAge: this.soulAge,
            bonusesCount: this.bonuses.length,
            pastLivesCount: this.pastLives.length
        };
    }

    /**
     * 获取轮回加成描述
     */
    getBonusDescriptions() {
        const bonus = this.getBonus();
        const descriptions = [];

        if (bonus.cultivationSpeed > 0) {
            descriptions.push(`修炼速度+${Math.round(bonus.cultivationSpeed * 100)}%`);
        }
        if (bonus.attack > 0) {
            descriptions.push(`攻击+${Math.round(bonus.attack * 100)}%`);
        }
        if (bonus.defense > 0) {
            descriptions.push(`防御+${Math.round(bonus.defense * 100)}%`);
        }
        if (bonus.spiritStones > 0) {
            descriptions.push(`灵石+${Math.round(bonus.spiritStones * 100)}%`);
        }
        if (bonus.serendipityChance > 0) {
            descriptions.push(`奇遇+${Math.round(bonus.serendipityChance * 100)}%`);
        }

        return descriptions;
    }

    /**
     * 序列化
     */
    serialize() {
        return {
            times: this.times,
            totalKarma: this.totalKarma,
            bonuses: this.bonuses,
            karmaGood: this.karmaGood,
            karmaBad: this.karmaBad,
            currentLife: this.currentLife,
            pastLives: this.pastLives,
            realmAtDeath: this.realmAtDeath,
            ageAtDeath: this.ageAtDeath,
            causeOfDeath: this.causeOfDeath,
            retainedSkills: this.retainedSkills,
            retainedItems: this.retainedItems,
            soulAge: this.soulAge,
            reincarnationBonus: this.reincarnationBonus
        };
    }

    /**
     * 从保存数据恢复
     */
    static deserialize(data) {
        return new Reincarnation(data);
    }
}

// 轮回原因配置
const REINCARNATION_CAUSES = {
    '寿元耗尽': { desc: '自然寿终', karmaModifier: 0 },
    '渡劫失败': { desc: '天劫致死', karmaModifier: -50 },
    '走火入魔': { desc: '修炼失控', karmaModifier: -30 },
    '仇家追杀': { desc: '被敌所杀', karmaModifier: -20 },
    '意外事故': { desc: '意外身亡', karmaModifier: 0 },
    '自愿转世': { desc: '主动轮回', karmaModifier: 10 },
    '天罚': { desc: '天道惩罚', karmaModifier: -100 }
};

// 轮回品质对应加成
const REINCARNATION_QUALITY_BONUSES = {
    '凡品': { cultivationSpeed: 0.05, attack: 0, defense: 0 },
    '良品': { cultivationSpeed: 0.10, attack: 0.05, defense: 0.05 },
    '珍品': { cultivationSpeed: 0.15, attack: 0.10, defense: 0.10 },
    '上品': { cultivationSpeed: 0.20, attack: 0.15, defense: 0.15 },
    '极品': { cultivationSpeed: 0.30, attack: 0.20, defense: 0.20 }
};

// ===== Direction M: 悟道境轮回系统 =====
// L0-L4 记忆层定义 (generic-agent 记忆分层)
const MEMORY_LAYERS = {
    L0_META: {
        name: 'L0元记忆',
        desc: '永久保留：悟道次数/轮回次数',
        retention: 1.0, // 100% 保留
        priority: 'critical'
    },
    L1_INDEX: {
        name: 'L1索引',
        desc: '保留成就解锁状态',
        retention: 1.0,
        priority: 'high'
    },
    L2_GLOBAL: {
        name: 'L2全局',
        desc: '保留人物属性趋势',
        retention: 0.8,
        priority: 'medium'
    },
    L3_SOP: {
        name: 'L3 SOP',
        desc: '保留顿悟结晶技能 (CULTIVATION_INSIGHT)',
        retention: 0.6,
        priority: 'medium'
    },
    L4_SESSION: {
        name: 'L4会话',
        desc: '重置',
        retention: 0,
        priority: 'low'
    }
};

// REMEMBRANCE_CRYSTAL 品质等级
const CRYSTAL_QUALITY = {
    '凡品': { multiplier: 1.0, desc: '普通品质' },
    '良品': { multiplier: 1.5, desc: '优良品质' },
    '珍品': { multiplier: 2.0, desc: '传说品质' },
    '上品': { multiplier: 3.0, desc: '神话品质' },
    '极品': { multiplier: 5.0, desc: '逆天品质' }
};

// 顿悟来源类型
const INSIGHT_SOURCES = {
    'breakthrough': { desc: '突破境界触发', karmaBonus: 50 },
    'alchemy': { desc: '炼制丹药触发', karmaBonus: 30 },
    'serendipity': { desc: '奇遇触发', karmaBonus: 40 },
    'meditation': { desc: '冥想触发', karmaBonus: 20 },
    'combat': { desc: '战斗顿悟', karmaBonus: 25 }
};

// REMEMBRANCE_CRYSTAL 数据结构
class RemembranceCrystal {
    constructor(config = {}) {
        this.id = config.id || `crystal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.quality = config.quality || '凡品';
        this.createdAt = config.createdAt || Date.now();
        this.source = config.source || 'unknown'; // 顿悟来源
        this.sourceDesc = config.sourceDesc || '';
        
        // 保留的属性
        this.preservedAttributes = {
            cultivationBase: config.preservedAttributes?.cultivationBase || 0,
            karma: config.preservedAttributes?.karma || 0,
            skills: config.preservedAttributes?.skills || [],
            insights: config.preservedAttributes?.insights || [],
            bonuses: config.preservedAttributes?.bonuses || []
        };
        
        // 结晶状态
        this.used = config.used || false;
        this.usedAt = config.usedAt || null;
        this.appliedTo = config.appliedTo || null; // 应用到的 reincarnation times
    }

    /**
     * 获取结晶品质信息
     */
    getQualityInfo() {
        return CRYSTAL_QUALITY[this.quality] || CRYSTAL_QUALITY['凡品'];
    }

    /**
     * 获取结晶效果倍率
     */
    getMultiplier() {
        return this.getQualityInfo().multiplier;
    }

    /**
     * 应用结晶
     */
    apply() {
        if (this.used) {
            return { success: false, reason: '结晶已被使用' };
        }
        this.used = true;
        this.usedAt = Date.now();
        return { success: true, message: '结晶已应用' };
    }

    /**
     * 序列化
     */
    serialize() {
        return {
            id: this.id,
            quality: this.quality,
            createdAt: this.createdAt,
            source: this.source,
            sourceDesc: this.sourceDesc,
            preservedAttributes: this.preservedAttributes,
            used: this.used,
            usedAt: this.usedAt,
            appliedTo: this.appliedTo
        };
    }

    /**
     * 从保存数据恢复
     */
    static deserialize(data) {
        return new RemembranceCrystal(data);
    }
}

// CULTIVATION_INSIGHT 数据结构
class CultivationInsight {
    constructor(config = {}) {
        this.id = config.id || `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.type = config.type || 'unknown';
        this.desc = config.desc || '';
        this.source = config.source || 'unknown';
        this.awakenedAt = config.awakenedAt || Date.now();
        this.effect = config.effect || {};
        this.layer = config.layer || 'L3_SOP'; // 属于 L3 SOP 记忆层
    }

    /**
     * 获取来源描述
     */
    getSourceDesc() {
        return INSIGHT_SOURCES[this.source]?.desc || '未知来源';
    }

    /**
     * 序列化
     */
    serialize() {
        return {
            id: this.id,
            type: this.type,
            desc: this.desc,
            source: this.source,
            awakenedAt: this.awakenedAt,
            effect: this.effect,
            layer: this.layer
        };
    }

    /**
     * 从保存数据恢复
     */
    static deserialize(data) {
        return new CultivationInsight(data);
    }
}

// 导出
export { 
    Reincarnation, 
    REINCARNATION_CAUSES, 
    REINCARNATION_QUALITY_BONUSES,
    MEMORY_LAYERS,
    CRYSTAL_QUALITY,
    INSIGHT_SOURCES,
    RemembranceCrystal,
    CultivationInsight
};