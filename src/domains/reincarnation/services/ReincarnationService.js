/**
 * ReincarnationService - 轮回服务
 * 管理轮回系统的主要逻辑
 */

class ReincarnationService {
    constructor() {
        this.reincarnation = null;
    }

    /**
     * 初始化轮回系统
     */
    init(gameState) {
        if (!gameState.reincarnation) {
            gameState.reincarnation = {
                times: 0,
                totalKarma: 0,
                bonuses: [],
                karmaGood: 0,
                karmaBad: 0,
                pastLives: [],
                realmAtDeath: 0,
                ageAtDeath: 0,
                causeOfDeath: 'unknown',
                retainedSkills: [],
                retainedItems: [],
                soulAge: 0,
                reincarnationBonus: {}
            };
        }
        this.reincarnation = gameState.reincarnation;
        return gameState;
    }

    /**
     * 获取轮回统计
     */
    getStats() {
        return {
            times: this.reincarnation.times,
            totalKarma: this.reincarnation.totalKarma,
            netKarma: (this.reincarnation.karmaGood || 0) - (this.reincarnation.karmaBad || 0),
            karmaGood: this.reincarnation.karmaGood || 0,
            karmaBad: this.reincarnation.karmaBad || 0,
            soulAge: this.reincarnation.soulAge || 0,
            bonusesCount: this.reincarnation.bonuses?.length || 0,
            pastLivesCount: this.reincarnation.pastLives?.length || 0
        };
    }

    /**
     * 预览下一次轮回的加成
     */
    preview() {
        const karmaRequired = (this.reincarnation.times || 0) * 100;
        const nextRealm = (this.reincarnation.times || 0) + 1;
        return {
            nextRealm,
            karmaRequired,
            potentialBonuses: this.calculatePotentialBonuses()
        };
    }

    /**
     * 计算潜在加成
     */
    calculatePotentialBonuses() {
        const bonuses = [];
        const times = this.reincarnation.times || 0;

        // 基础加成
        bonuses.push({
            type: 'cultivationSpeed',
            value: Math.min(0.5, times * 0.05),
            desc: `修炼速度+${Math.round(Math.min(50, times * 5))}%`
        });

        // 因果加成
        const netKarma = (this.reincarnation.karmaGood || 0) - (this.reincarnation.karmaBad || 0);
        if (netKarma > 100) {
            bonuses.push({ type: 'attack', value: 0.1, desc: '攻击+10%' });
        }
        if (netKarma > 500) {
            bonuses.push({ type: 'defense', value: 0.1, desc: '防御+10%' });
        }
        if (netKarma > 1000) {
            bonuses.push({ type: 'serendipityChance', value: 0.05, desc: '奇遇+5%' });
        }

        // 境界加成
        if (this.reincarnation.realmAtDeath >= 3) {
            bonuses.push({ type: 'spiritStones', value: 0.2, desc: '灵石+20%' });
        }

        return bonuses;
    }

    /**
     * 执行轮回
     */
    doReincarnate(gameState) {
        const reincarnation = gameState.reincarnation;

        // 记录当前生命信息
        const record = {
            time: Date.now(),
            times: reincarnation.times,
            causeOfDeath: reincarnation.causeOfDeath || 'unknown',
            realmAtDeath: gameState.realm || 0,
            ageAtDeath: gameState.age || gameState.days || 0,
            karmaBalance: (reincarnation.karmaGood || 0) - (reincarnation.karmaBad || 0),
            bonusesGained: []
        };

        reincarnation.pastLives = reincarnation.pastLives || [];
        reincarnation.pastLives.push(record);

        // 累加轮回次数
        reincarnation.times = (reincarnation.times || 0) + 1;

        // 计算新加成
        const newBonuses = this.calculateNewBonuses(reincarnation);
        reincarnation.bonuses = reincarnation.bonuses || [];
        reincarnation.bonuses.push(...newBonuses);

        // 重置角色状态
        gameState.realm = 1;
        gameState.stage = 1;
        gameState.qi = 0;
        gameState.maxQi = 100;
        gameState.cultivationProgress = 0;
        gameState.mindset = 50;

        // 保留物品处理
        const retainedItems = (reincarnation.retainedItems || []).filter(item =>
            item && item.type === 'treasure' && item.permanent
        );
        gameState.inventory = retainedItems;

        // 记录轮回
        const reincRecord = {
            time: Date.now(),
            bonus: 'realm_reset',
            times: reincarnation.times
        };
        reincarnation.bonuses.push(reincRecord);

        return {
            success: true,
            times: reincarnation.times,
            bonuses: newBonuses,
            message: `轮回转世完成！已轮回数: ${reincarnation.times}`
        };
    }

    /**
     * 计算新加成
     */
    calculateNewBonuses(reincarnation) {
        const bonuses = [];
        const times = reincarnation.times || 0;

        // 基础属性加成
        bonuses.push({
            type: 'cultivationSpeed',
            value: Math.min(0.5, times * 0.05),
            desc: `修炼速度+${Math.round(Math.min(50, times * 5))}%`
        });

        // 因果加成
        const netKarma = (reincarnation.karmaGood || 0) - (reincarnation.karmaBad || 0);
        if (netKarma > 100) {
            bonuses.push({ type: 'attack', value: 0.1, desc: '攻击+10%' });
        }
        if (netKarma > 500) {
            bonuses.push({ type: 'defense', value: 0.1, desc: '防御+10%' });
        }
        if (netKarma > 1000) {
            bonuses.push({ type: 'serendipityChance', value: 0.05, desc: '奇遇+5%' });
        }

        // 高境界加成
        if (reincarnation.realmAtDeath >= 3) {
            bonuses.push({ type: 'spiritStones', value: 0.2, desc: '灵石+20%' });
        }

        return bonuses;
    }

    /**
     * 记录因果
     */
    recordKarma(type, amount) {
        const reincarnation = this.reincarnation;
        reincarnation.karmaGood = reincarnation.karmaGood || 0;
        reincarnation.karmaBad = reincarnation.karmaBad || 0;

        if (type === 'good') {
            reincarnation.karmaGood += amount;
        } else if (type === 'bad') {
            reincarnation.karmaBad += amount;
        }

        reincarnation.totalKarma = reincarnation.karmaGood - reincarnation.karmaBad;

        return {
            success: true,
            karmaGood: reincarnation.karmaGood,
            karmaBad: reincarnation.karmaBad,
            netKarma: reincarnation.totalKarma
        };
    }

    /**
     * 应用轮回加成到游戏状态
     */
    applyBonusesToGameState(gameState) {
        const bonuses = this.reincarnation.bonuses || [];
        
        for (const bonus of bonuses) {
            switch (bonus.type) {
                case 'cultivationSpeed':
                    gameState.activeEffects.cultivate_speed += bonus.value;
                    break;
                case 'attack':
                    gameState.activeEffects.attack += bonus.value;
                    break;
                case 'defense':
                    gameState.activeEffects.defense += bonus.value;
                    break;
                case 'spiritStones':
                    // 金币加成会在获取时计算
                    gameState.reincarnationBonus = gameState.reincarnationBonus || {};
                    gameState.reincarnationBonus.spiritStones = bonus.value;
                    break;
                case 'serendipityChance':
                    gameState.activeEffects.serendipity_boost += bonus.value;
                    break;
            }
        }

        return gameState;
    }

    /**
     * 获取轮回加成描述
     */
    getBonusDescriptions() {
        const bonuses = this.reincarnation.bonuses || [];
        const descriptions = [];

        for (const bonus of bonuses) {
            if (bonus.desc) {
                descriptions.push(bonus.desc);
            } else {
                switch (bonus.type) {
                    case 'cultivationSpeed':
                        descriptions.push(`修炼速度+${Math.round(bonus.value * 100)}%`);
                        break;
                    case 'attack':
                        descriptions.push(`攻击+${Math.round(bonus.value * 100)}%`);
                        break;
                    case 'defense':
                        descriptions.push(`防御+${Math.round(bonus.value * 100)}%`);
                        break;
                    case 'spiritStones':
                        descriptions.push(`灵石+${Math.round(bonus.value * 100)}%`);
                        break;
                    case 'serendipityChance':
                        descriptions.push(`奇遇+${Math.round(bonus.value * 100)}%`);
                        break;
                }
            }
        }

        return descriptions;
    }

    /**
     * 检查轮回条件
     */
    canReincarnate(gameState) {
        // 检查是否满足轮回条件
        const karmaRequired = this.reincarnation.times * 100;
        const netKarma = (this.reincarnation.karmaGood || 0) - (this.reincarnation.karmaBad || 0);

        if (netKarma < karmaRequired) {
            return {
                can: false,
                reason: `因果不足，需要 ${karmaRequired} 点，当前 ${netKarma} 点`
            };
        }

        return { can: true };
    }

    /**
     * 设置死亡原因
     */
    setCauseOfDeath(cause) {
        this.reincarnation.causeOfDeath = cause;
        return { success: true, cause };
    }

    /**
     * 添加保留技能
     */
    addRetainedSkill(skill) {
        const skills = this.reincarnation.retainedSkills || [];
        if (!skills.find(s => s.id === skill.id)) {
            skills.push(skill);
        }
        return { success: true, skillsCount: skills.length };
    }

    /**
     * 添加保留物品
     */
    addRetainedItem(item) {
        const items = this.reincarnation.retainedItems || [];
        if (item && item.type === 'treasure' && item.permanent) {
            if (!items.find(i => i.id === item.id)) {
                items.push(item);
            }
        }
        return { success: true, itemsCount: items.length };
    }

    /**
     * 获取过去生世信息
     */
    getPastLives(limit = 10) {
        const pastLives = this.reincarnation.pastLives || [];
        return pastLives.slice(-limit).reverse();
    }

    /**
     * MCP: 轮回统计
     */
    mcpStats() {
        return this.getStats();
    }

    /**
     * MCP: 预览轮回
     */
    mcpPreview() {
        return this.preview();
    }

    /**
     * MCP: 执行轮回
     */
    mcpReincarnate(gameState) {
        return this.doReincarnate(gameState);
    }
}

// 天道轮回配置
const CELESTIAL_REINCARNATION_CONFIG = {
    maxLives: 9, // 最大轮回次数
    karmaThresholds: {
        // 轮回品质阈值
        '凡品': 0,
        '良品': 100,
        '珍品': 300,
        '上品': 600,
        '极品': 1000
    },
    qualityBonuses: {
        // 不同品质的加成
        '凡品': { cultivationSpeed: 0.05, attack: 0, defense: 0 },
        '良品': { cultivationSpeed: 0.10, attack: 0.05, defense: 0.05 },
        '珍品': { cultivationSpeed: 0.15, attack: 0.10, defense: 0.10 },
        '上品': { cultivationSpeed: 0.20, attack: 0.15, defense: 0.15 },
        '极品': { cultivationSpeed: 0.30, attack: 0.20, defense: 0.20 }
    }
};

// 轮回事件
const REINCARNATION_EVENTS = {
    '魂魄觉醒': {
        desc: '回忆起前世记忆片段',
        effect: (state) => {
            state.reincarnation.soulAge += 1;
            return { success: true, message: '魂魄年龄+1' };
        }
    },
    '因果清算': {
        desc: '清算前世因果',
        effect: (state) => {
            const netKarma = state.reincarnation.karmaGood - state.reincarnation.karmaBad;
            if (netKarma > 0) {
                state.activeEffects.cultivate_speed += 0.1;
                return { success: true, message: '善缘感应，修炼+10%' };
            } else {
                state.activeEffects.cultivate_speed -= 0.05;
                return { success: true, message: '恶缘纠缠，修炼-5%' };
            }
        }
    },
    '轮回印记': {
        desc: '身上出现轮回印记',
        effect: (state) => {
            state.reincarnation.reincarnationBonus.serendipityBoost = 0.15;
            return { success: true, message: '奇遇+15%' };
        }
    }
};

// 导出单例
const reincarnationService = new ReincarnationService();

export { 
    ReincarnationService, 
    reincarnationService,
    CELESTIAL_REINCARNATION_CONFIG,
    REINCARNATION_EVENTS
};