/**
 * DharmaFruitService - 轮回道果系统
 * V236 Direction X: 轮回道果系统 (generic-agent/ruflo)
 * 
 * 道果类型：法/道/体/神/心
 * 道果等级：初/中/高/圆满
 * 道果效果：属性加成/技能解锁
 */

import { RemembranceCrystal, CultivationInsight } from '../entities/Reincarnation.js';

// 道果类型枚举
export const DHARMA_TYPES = {
    法: '法',   // 法之道果
    道: '道',   // 道之道果
    体: '体',   // 体之道果
    神: '神',   // 神之道果
    心: '心'    // 心之道果
};

// 道果等级枚举
export const DHARMA_LEVELS = {
    初: '初',   // 初级
    中: '中',   // 中级
    高: '高',   // 高级
    圆满: '圆满' // 圆满级
};

// 道果定义
const DHARMA_FRUITS = {
    法: {
        name: '法之道果',
        description: '蕴含无上法门，修炼速度大幅提升',
        baseEffect: { cultivationSpeed: 0.1 },
        levelEffects: [
            { cultivationSpeed: 0.1 },
            { cultivationSpeed: 0.2 },
            { cultivationSpeed: 0.35 },
            { cultivationSpeed: 0.5 }
        ]
    },
    道: {
        name: '道之道果',
        description: '蕴含天地大道，对天道感悟加深',
        baseEffect: { tiandaoMerit: 1 },
        levelEffects: [
            { tiandaoMerit: 1 },
            { tiandaoMerit: 3 },
            { tiandaoMerit: 6 },
            { tiandaoMerit: 10 }
        ]
    },
    体: {
        name: '体之道果',
        description: '强化肉身，体力与防御提升',
        baseEffect: { defense: 0.1, maxEnergy: 10 },
        levelEffects: [
            { defense: 0.1, maxEnergy: 10 },
            { defense: 0.2, maxEnergy: 25 },
            { defense: 0.35, maxEnergy: 50 },
            { defense: 0.5, maxEnergy: 100 }
        ]
    },
    神: {
        name: '神之道果',
        description: '滋养神魂，神识与感知提升',
        baseEffect: { perception: 0.1, spiritDamage: 0.1 },
        levelEffects: [
            { perception: 0.1, spiritDamage: 0.1 },
            { perception: 0.2, spiritDamage: 0.2 },
            { perception: 0.35, spiritDamage: 0.35 },
            { perception: 0.5, spiritDamage: 0.5 }
        ]
    },
    心: {
        name: '心之道果',
        description: '淬炼道心，心境与奇遇提升',
        baseEffect: { serendipityChance: 0.05, karmaGood: 1 },
        levelEffects: [
            { serendipityChance: 0.05, karmaGood: 1 },
            { serendipityChance: 0.1, karmaGood: 3 },
            { serendipityChance: 0.2, karmaGood: 6 },
            { serendipityChance: 0.35, karmaGood: 10 }
        ]
    }
};

// 融合配方
const FUSION_RECIPES = {
    '法+道': { result: '道', bonus: { cultivationSpeed: 0.15 } },
    '法+体': { result: '体', bonus: { defense: 0.15 } },
    '法+神': { result: '神', bonus: { spiritDamage: 0.15 } },
    '法+心': { result: '心', bonus: { serendipityChance: 0.1 } },
    '道+体': { result: '体', bonus: { maxEnergy: 20 } },
    '道+神': { result: '神', bonus: { perception: 0.15 } },
    '道+心': { result: '心', bonus: { tiandaoMerit: 2 } },
    '体+神': { result: '神', bonus: { defense: 0.1, spiritDamage: 0.1 } },
    '体+心': { result: '心', bonus: { maxEnergy: 15, serendipityChance: 0.05 } },
    '神+心': { result: '神', bonus: { perception: 0.1, spiritDamage: 0.1 } }
};

class DharmaFruitService {
    constructor() {
        this.gameState = null;
        this.dharmaFruits = []; // 玩家道果列表
        this.maxFruits = 10;    // 最多保留10个道果（实际使用时通过传承机制管理）
        this.ultimateUnlocked = false; // 终极蜕变解锁状态
    }

    /**
     * 初始化道果系统
     */
    init(gameState) {
        this.gameState = gameState;
        
        if (!gameState.dharmaFruit) {
            gameState.dharmaFruit = {
                fruits: [],
                inheritedFruits: [],
                ultimateUnlocked: false,
                totalFruitsClaimed: 0,
                fruitsCombined: 0,
                lastReincarnationAt: null
            };
        }
        
        this.dharmaFruits = gameState.dharmaFruit.fruits;
        this.ultimateUnlocked = gameState.dharmaFruit.ultimateUnlocked;
        
        return gameState;
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return `df_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 获取道果等级索引
     */
    getLevelIndex(level) {
        const levelMap = { '初': 0, '中': 1, '高': 2, '圆满': 3 };
        return levelMap[level] ?? 0;
    }

    /**
     * 获取道果定义
     */
    getDharmaDefinition(type) {
        return DHARMA_FRUITS[type];
    }

    /**
     * 计算道果效果
     */
    calculateFruitEffects() {
        const effects = {
            cultivationSpeed: 0,
            tiandaoMerit: 0,
            defense: 0,
            maxEnergy: 0,
            perception: 0,
            spiritDamage: 0,
            serendipityChance: 0,
            karmaGood: 0
        };

        for (const fruit of this.dharmaFruits) {
            const def = DHARMA_FRUITS[fruit.type];
            if (def) {
                const levelIdx = this.getLevelIndex(fruit.level);
                const levelEffect = def.levelEffects[levelIdx];
                if (levelEffect) {
                    for (const [key, value] of Object.entries(levelEffect)) {
                        if (effects.hasOwnProperty(key)) {
                            effects[key] += value;
                        }
                    }
                }
            }
        }

        return effects;
    }

    /**
     * 检查是否满足终极蜕变条件
     */
    checkUltimateCondition() {
        if (this.ultimateUnlocked) {
            return { canTrigger: false, reason: '终极蜕变已解锁' };
        }

        // 检查是否所有5种道果都达到圆满
        const typeCount = {};
        for (const fruit of this.dharmaFruits) {
            if (!typeCount[fruit.type]) {
                typeCount[fruit.type] = { count: 0, maxLevel: false };
            }
            typeCount[fruit.type].count++;
            if (fruit.level === '圆满') {
                typeCount[fruit.type].maxLevel = true;
            }
        }

        const allTypes = Object.keys(DHARMA_TYPES);
        const hasAllTypes = allTypes.every(type => typeCount[type]?.count > 0);
        const allMaxLevel = allTypes.every(type => typeCount[type]?.maxLevel);

        if (hasAllTypes && allMaxLevel) {
            return { canTrigger: true, reason: '所有道果已达圆满，可触发终极蜕变' };
        }

        const missingTypes = allTypes.filter(type => !typeCount[type]?.count);
        const nonMaxTypes = allTypes.filter(type => !typeCount[type]?.maxLevel);

        return {
            canTrigger: false,
            reason: missingTypes.length > 0 
                ? `缺少道果类型: ${missingTypes.join(', ')}`
                : nonMaxTypes.length > 0 
                    ? `以下道果未达圆满: ${nonMaxTypes.join(', ')}`
                    : '条件未满足'
        };
    }

    // ==================== MCP 工具实现 ====================

    /**
     * dharma.fruit.claim - 领取道果
     * 轮回后可以领取新的道果
     */
    mcpFruitClaim(params = {}) {
        const { type, level = '初' } = params;

        // 参数验证
        if (!type || !DHARMA_TYPES[type]) {
            return { 
                success: false, 
                error: `无效的道果类型，有效值: ${Object.keys(DHARMA_TYPES).join(', ')}` 
            };
        }

        if (!DHARMA_LEVELS[level]) {
            return { 
                success: false, 
                error: `无效的道果等级，有效值: ${Object.keys(DHARMA_LEVELS).join(', ')}` 
            };
        }

        // 检查是否已拥有该类型道果
        const existingType = this.dharmaFruits.find(f => f.type === type);
        if (existingType) {
            return { 
                success: false, 
                error: `已拥有${DHARMA_FRUITS[type].name}，道果数量上限为${this.maxFruits}个` 
            };
        }

        // 检查数量限制
        if (this.dharmaFruits.length >= this.maxFruits) {
            return { 
                success: false, 
                error: `道果数量已达上限(${this.maxFruits}个)，请先融合或传承旧道果` 
            };
        }

        // 创建新道果
        const fruit = {
            id: this.generateId(),
            type: type,
            level: level,
            acquiredAt: Date.now(),
            effects: DHARMA_FRUITS[type].levelEffects[this.getLevelIndex(level)]
        };

        this.dharmaFruits.push(fruit);
        this.gameState.dharmaFruit.totalFruitsClaimed++;

        return {
            success: true,
            message: `成功领取${DHARMA_FRUITS[type].name}[${level}]`,
            fruit: {
                id: fruit.id,
                type: fruit.type,
                level: fruit.level,
                name: DHARMA_FRUITS[type].name,
                description: DHARMA_FRUITS[type].description,
                effects: fruit.effects
            },
            currentFruits: this.dharmaFruits.map(f => ({
                id: f.id,
                type: f.type,
                level: f.level,
                name: DHARMA_FRUITS[f.type].name
            })),
            totalClaimed: this.gameState.dharmaFruit.totalFruitsClaimed
        };
    }

    /**
     * dharma.fruit.inherit - 传承道果
     * 轮回时可以选择传承道果
     */
    mcpFruitInherit(params = {}) {
        const { fruitId, inheritLevel = '中' } = params;

        // 查找道果
        const fruit = this.dharmaFruits.find(f => f.id === fruitId);
        if (!fruit) {
            return { 
                success: false, 
                error: '未找到指定道果' 
            };
        }

        // 检查传承等级是否有效
        if (!DHARMA_LEVELS[inheritLevel]) {
            return { 
                success: false, 
                error: `无效的传承等级，有效值: ${Object.keys(DHARMA_LEVELS).join(', ')}` 
            };
        }

        // 计算传承后的等级
        const currentLevelIdx = this.getLevelIndex(fruit.level);
        const inheritLevelIdx = this.getLevelIndex(inheritLevel);
        
        if (inheritLevelIdx < currentLevelIdx) {
            return { 
                success: false, 
                error: `传承等级(${inheritLevel})不能低于当前等级(${fruit.level})` 
            };
        }

        // 执行传承
        const inheritedFruit = {
            id: this.generateId(),
            type: fruit.type,
            level: inheritLevel,
            inheritedFrom: fruit.id,
            inheritedAt: Date.now(),
            effects: DHARMA_FRUITS[fruit.type].levelEffects[inheritLevelIdx]
        };

        // 更新游戏状态
        this.gameState.dharmaFruit.inheritedFruits.push(inheritedFruit);
        
        // 从当前道果列表移除（如果需要）
        this.dharmaFruits = this.dharmaFruits.filter(f => f.id !== fruitId);

        return {
            success: true,
            message: `${DHARMA_FRUITS[fruit.type].name}已传承为[${inheritLevel}]级`,
            inheritedFruit: {
                id: inheritedFruit.id,
                type: inheritedFruit.type,
                level: inheritedFruit.level,
                name: DHARMA_FRUITS[inheritedFruit.type].name,
                effects: inheritedFruit.effects
            },
            remainingFruits: this.dharmaFruits.map(f => ({
                id: f.id,
                type: f.type,
                level: f.level,
                name: DHARMA_FRUITS[f.type].name
            }))
        };
    }

    /**
     * dharma.fruit.upgrade - 升级道果
     * 将道果从当前等级提升到下一等级
     */
    mcpFruitUpgrade(params = {}) {
        const { fruitId, useMerit = false } = params;

        // 查找道果
        const fruit = this.dharmaFruits.find(f => f.id === fruitId);
        if (!fruit) {
            return { 
                success: false, 
                error: '未找到指定道果' 
            };
        }

        // 检查是否已达圆满
        if (fruit.level === '圆满') {
            return { 
                success: false, 
                error: `${DHARMA_FRUITS[fruit.type].name}已达圆满等级，无法继续升级` 
            };
        }

        // 升级所需的天道功德（简化计算）
        const levelCosts = { '初': 10, '中': 30, '高': 60 };
        const currentLevelIdx = this.getLevelIndex(fruit.level);
        const cost = levelCosts[fruit.level];

        // 检查是否有足够天道功德
        if (useMerit) {
            const currentMerit = this.gameState.player?.karmaPoints || 0;
            if (currentMerit < cost) {
                return { 
                    success: false, 
                    error: `天道功德不足，需要${cost}点，当前${currentMerit}点` 
                };
            }
            this.gameState.player.karmaPoints -= cost;
        }

        // 执行升级
        const levels = ['初', '中', '高', '圆满'];
        fruit.level = levels[currentLevelIdx + 1];
        fruit.effects = DHARMA_FRUITS[fruit.type].levelEffects[currentLevelIdx + 1];
        fruit.upgradedAt = Date.now();

        return {
            success: true,
            message: `${DHARMA_FRUITS[fruit.type].name}已升级至[${fruit.level}]`,
            fruit: {
                id: fruit.id,
                type: fruit.type,
                level: fruit.level,
                name: DHARMA_FRUITS[fruit.type].name,
                effects: fruit.effects
            },
            totalEffects: this.calculateFruitEffects()
        };
    }

    /**
     * dharma.fruit.query - 查询道果状态
     * 查看当前所有道果及效果
     */
    mcpFruitQuery(params = {}) {
        const { fruitId, includeEffects = true } = params;

        if (fruitId) {
            // 查询特定道果
            const fruit = this.dharmaFruits.find(f => f.id === fruitId);
            if (!fruit) {
                return { 
                    success: false, 
                    error: '未找到指定道果' 
                };
            }

            return {
                success: true,
                fruit: {
                    id: fruit.id,
                    type: fruit.type,
                    level: fruit.level,
                    name: DHARMA_FRUITS[fruit.type].name,
                    description: DHARMA_FRUITS[fruit.type].description,
                    effects: fruit.effects,
                    acquiredAt: fruit.acquiredAt,
                    upgradedAt: fruit.upgradedAt
                },
                totalEffects: includeEffects ? this.calculateFruitEffects() : null,
                ultimateCondition: this.checkUltimateCondition()
            };
        }

        // 查询所有道果
        return {
            success: true,
            fruits: this.dharmaFruits.map(f => ({
                id: f.id,
                type: f.type,
                level: f.level,
                name: DHARMA_FRUITS[f.type].name,
                description: DHARMA_FRUITS[f.type].description,
                effects: includeEffects ? f.effects : null,
                acquiredAt: f.acquiredAt,
                upgradedAt: f.upgradedAt
            })),
            totalEffects: includeEffects ? this.calculateFruitEffects() : null,
            stats: {
                totalFruits: this.dharmaFruits.length,
                maxFruits: this.maxFruits,
                totalClaimed: this.gameState.dharmaFruit.totalFruitsClaimed,
                totalCombined: this.gameState.dharmaFruit.fruitsCombined,
                inheritedCount: this.gameState.dharmaFruit.inheritedFruits.length,
                ultimateUnlocked: this.ultimateUnlocked
            },
            ultimateCondition: this.checkUltimateCondition(),
            availableTypes: Object.keys(DHARMA_TYPES).filter(
                type => !this.dharmaFruits.some(f => f.type === type)
            )
        };
    }

    /**
     * dharma.transformation.trigger - 触发终极蜕变
     * 当所有道果都达到圆满时触发
     */
    mcpTransformationTrigger(params = {}) {
        const { force = false } = params;

        const condition = this.checkUltimateCondition();

        if (!condition.canTrigger) {
            if (!force) {
                return { 
                    success: false, 
                    error: `无法触发终极蜕变: ${condition.reason}` 
                };
            }
            // force模式需要消耗大量天道功德
            const meritCost = 500;
            const currentMerit = this.gameState.player?.karmaPoints || 0;
            if (currentMerit < meritCost) {
                return { 
                    success: false, 
                    error: `强制触发需要${meritCost}点天道功德，当前${currentMerit}点` 
                };
            }
            this.gameState.player.karmaPoints -= meritCost;
        }

        // 解锁终极蜕变
        this.ultimateUnlocked = true;
        this.gameState.dharmaFruit.ultimateUnlocked = true;

        // 计算终极加成
        const ultimateBonus = {
            cultivationSpeed: 1.0,      // 修炼速度翻倍
            allAttributes: 0.5,         // 全属性+50%
            serendipityChance: 0.5,     // 奇遇率+50%
            tiandaoMerit: 20,           // 天道功德+20
            maxEnergy: 200,             // 体力上限+200
            perception: 1.0,            // 感知翻倍
            spiritDamage: 1.0           // 神识伤害翻倍
        };

        // 应用终极加成到玩家属性
        if (this.gameState.player) {
            this.gameState.player.cultivationSpeedBonus = 
                (this.gameState.player.cultivationSpeedBonus || 0) + ultimateBonus.cultivationSpeed;
            this.gameState.player.serendipityChanceBonus = 
                (this.gameState.player.serendipityChanceBonus || 0) + ultimateBonus.serendipityChance;
            this.gameState.player.karmaPoints = 
                (this.gameState.player.karmaPoints || 0) + ultimateBonus.tiandaoMerit;
            this.gameState.player.maxEnergy = 
                (this.gameState.player.maxEnergy || 100) + ultimateBonus.maxEnergy;
        }

        return {
            success: true,
            message: '恭喜！终极蜕变已触发！您已化身为终极存在！',
            ultimateForm: {
                name: '终极形态',
                description: '所有道果圆满，化身终极存在',
                bonus: ultimateBonus,
                unlockedAt: Date.now()
            },
            playerBonuses: {
                cultivationSpeedBonus: ultimateBonus.cultivationSpeed,
                serendipityChanceBonus: ultimateBonus.serendipityChance,
                karmaPointsBonus: ultimateBonus.tiandaoMerit,
                maxEnergyBonus: ultimateBonus.maxEnergy,
                perceptionBonus: ultimateBonus.perception,
                spiritDamageBonus: ultimateBonus.spiritDamage
            },
            totalEffects: this.calculateFruitEffects()
        };
    }

    /**
     * dharma.fruit.combine - 融合道果
     * 将两个道果融合，产生新的道果或加成效果
     */
    mcpFruitCombine(params = {}) {
        const { fruitId1, fruitId2 } = params;

        // 参数验证
        if (!fruitId1 || !fruitId2) {
            return { 
                success: false, 
                error: '请提供两个道果的ID' 
            };
        }

        if (fruitId1 === fruitId2) {
            return { 
                success: false, 
                error: '请选择两个不同的道果进行融合' 
            };
        }

        // 查找道果
        const fruit1 = this.dharmaFruits.find(f => f.id === fruitId1);
        const fruit2 = this.dharmaFruits.find(f => f.id === fruitId2);

        if (!fruit1) {
            return { 
                success: false, 
                error: `未找到ID为${fruitId1}的道果` 
            };
        }

        if (!fruit2) {
            return { 
                success: false, 
                error: `未找到ID为${fruitId2}的道果` 
            };
        }

        // 查找融合配方
        const key1 = `${fruit1.type}+${fruit2.type}`;
        const key2 = `${fruit2.type}+${fruit1.type}`;
        const recipe = FUSION_RECIPES[key1] || FUSION_RECIPES[key2];

        if (!recipe) {
            return { 
                success: false, 
                error: `${DHARMA_FRUITS[fruit1.type].name}和${DHARMA_FRUITS[fruit2.type].name}无法融合` 
            };
        }

        // 执行融合
        const newFruit = {
            id: this.generateId(),
            type: recipe.result,
            level: '初',
            combinedFrom: [fruit1.id, fruit2.id],
            combinedAt: Date.now(),
            effects: DHARMA_FRUITS[recipe.result].levelEffects[0],
            bonusEffects: recipe.bonus
        };

        // 移除旧道果
        this.dharmaFruits = this.dharmaFruits.filter(
            f => f.id !== fruitId1 && f.id !== fruitId2
        );

        // 添加新道果
        this.dharmaFruits.push(newFruit);
        this.gameState.dharmaFruit.fruitsCombined++;

        return {
            success: true,
            message: `${DHARMA_FRUITS[fruit1.type].name}和${DHARMA_FRUITS[fruit2.type].name}融合成功！`,
            newFruit: {
                id: newFruit.id,
                type: newFruit.type,
                level: newFruit.level,
                name: DHARMA_FRUITS[newFruit.type].name,
                description: DHARMA_FRUITS[newFruit.type].description,
                effects: newFruit.effects,
                bonusEffects: newFruit.bonusEffects
            },
            remainingFruits: this.dharmaFruits.map(f => ({
                id: f.id,
                type: f.type,
                level: f.level,
                name: DHARMA_FRUITS[f.type].name
            })),
            totalEffects: this.calculateFruitEffects()
        };
    }

    /**
     * 获取道果统计信息
     */
    getStats() {
        return {
            totalFruits: this.dharmaFruits.length,
            maxFruits: this.maxFruits,
            totalClaimed: this.gameState.dharmaFruit?.totalFruitsClaimed || 0,
            totalCombined: this.gameState.dharmaFruit?.fruitsCombined || 0,
            inheritedCount: this.gameState.dharmaFruit?.inheritedFruits?.length || 0,
            ultimateUnlocked: this.ultimateUnlocked,
            fruitsByType: this.dharmaFruits.reduce((acc, f) => {
                acc[f.type] = (acc[f.type] || 0) + 1;
                return acc;
            }, {}),
            fruitsByLevel: this.dharmaFruits.reduce((acc, f) => {
                acc[f.level] = (acc[f.level] || 0) + 1;
                return acc;
            }, {})
        };
    }
};

// 导出类（命名导出，供测试使用）
export { DharmaFruitService };

// 导出单例
export const dharmaFruitService = new DharmaFruitService();

// 导出MCP工具处理器
export function createDharmaFruitMCPHandlers(gameState) {
    const service = new DharmaFruitService();
    service.init(gameState);

    return {
        'dharma.fruit.claim': (params) => service.mcpFruitClaim(params),
        'dharma.fruit.inherit': (params) => service.mcpFruitInherit(params),
        'dharma.fruit.upgrade': (params) => service.mcpFruitUpgrade(params),
        'dharma.fruit.query': (params) => service.mcpFruitQuery(params),
        'dharma.transformation.trigger': (params) => service.mcpTransformationTrigger(params),
        'dharma.fruit.combine': (params) => service.mcpFruitCombine(params)
    };
}

// 导出工具定义
export const DHARMA_FRUITS_TOOLS = {
    'dharma.fruit.claim': {
        name: 'dharma.fruit.claim',
        description: 'Claim a dharma fruit after reincarnation',
        inputSchema: {
            type: 'object',
            properties: {
                type: { 
                    type: 'string', 
                    enum: ['法', '道', '体', '神', '心'],
                    description: 'Dharma fruit type' 
                },
                level: { 
                    type: 'string', 
                    enum: ['初', '中', '高', '圆满'],
                    description: 'Dharma fruit level',
                    default: '初'
                }
            },
            required: ['type']
        }
    },
    'dharma.fruit.inherit': {
        name: 'dharma.fruit.inherit',
        description: 'Inherit a dharma fruit during reincarnation',
        inputSchema: {
            type: 'object',
            properties: {
                fruitId: { type: 'string', description: 'ID of the fruit to inherit' },
                inheritLevel: { 
                    type: 'string', 
                    enum: ['初', '中', '高', '圆满'],
                    description: 'Inheritance level',
                    default: '中'
                }
            },
            required: ['fruitId']
        }
    },
    'dharma.fruit.upgrade': {
        name: 'dharma.fruit.upgrade',
        description: 'Upgrade a dharma fruit to the next level',
        inputSchema: {
            type: 'object',
            properties: {
                fruitId: { type: 'string', description: 'ID of the fruit to upgrade' },
                useMerit: { type: 'boolean', description: 'Use tiandao merit for upgrade' }
            },
            required: ['fruitId']
        }
    },
    'dharma.fruit.query': {
        name: 'dharma.fruit.query',
        description: 'Query dharma fruit status and effects',
        inputSchema: {
            type: 'object',
            properties: {
                fruitId: { type: 'string', description: 'Specific fruit ID to query' },
                includeEffects: { type: 'boolean', description: 'Include effects in response', default: true }
            }
        }
    },
    'dharma.transformation.trigger': {
        name: 'dharma.transformation.trigger',
        description: 'Trigger ultimate transformation when all fruits reach max level',
        inputSchema: {
            type: 'object',
            properties: {
                force: { type: 'boolean', description: 'Force trigger (requires 500 merit)' }
            }
        }
    },
    'dharma.fruit.combine': {
        name: 'dharma.fruit.combine',
        description: 'Combine two dharma fruits to create a new one',
        inputSchema: {
            type: 'object',
            properties: {
                fruitId1: { type: 'string', description: 'ID of first fruit' },
                fruitId2: { type: 'string', description: 'ID of second fruit' }
            },
            required: ['fruitId1', 'fruitId2']
        }
    }
};