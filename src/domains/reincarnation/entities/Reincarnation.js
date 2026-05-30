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

// 导出
export { Reincarnation, REINCARNATION_CAUSES, REINCARNATION_QUALITY_BONUSES };