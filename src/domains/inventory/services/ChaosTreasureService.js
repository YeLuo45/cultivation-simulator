/**
 * ChaosTreasureService - 混沌灵宝系统
 * V237 Direction Y: 混沌灵宝系统 (claude-code/nanobot)
 * 
 * 灵宝类型：武器/防具/饰品/秘宝
 * 灵宝等级：凡/灵/仙/神/道
 * 灵宝属性：攻击/防御/生命/速度
 */

class ChaosTreasureService {
    constructor() {
        this.gameState = null;
        this.treasures = [];           // 玩家灵宝列表
        this.equippedTreasures = {};    // 已装备灵宝 { slot: treasure }
        this.resonancePairs = [];      // 共鸣对列表
        this.maxTreasures = 50;        // 最多保留50个灵宝
    }

    /**
     * 初始化灵宝系统
     */
    init(gameState) {
        this.gameState = gameState;
        
        if (!gameState.chaosTreasure) {
            gameState.chaosTreasure = {
                treasures: [],
                equippedTreasures: {},
                resonancePairs: [],
                totalRefined: 0,
                totalAwakened: 0,
                totalResonated: 0,
                totalStrengthened: 0
            };
        }
        
        this.treasures = gameState.chaosTreasure.treasures;
        this.equippedTreasures = gameState.chaosTreasure.equippedTreasures;
        this.resonancePairs = gameState.chaosTreasure.resonancePairs;
        
        return gameState;
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 获取灵宝类型枚举
     */
    getTreasureTypes() {
        return { ...TREASURE_TYPES };
    }

    /**
     * 获取灵宝等级枚举
     */
    getTreasureLevels() {
        return { ...TREASURE_LEVELS };
    }

    /**
     * 获取灵宝属性枚举
     */
    getTreasureAttributes() {
        return { ...TREASURE_ATTRIBUTES };
    }

    /**
     * 获取灵宝类型定义
     */
    getTreasureDefinition(type) {
        return TREASURE_DEFINITIONS[type];
    }

    /**
     * 获取灵宝等级定义
     */
    getLevelDefinition(level) {
        return LEVEL_DEFINITIONS[level];
    }

    /**
     * 计算灵宝基础属性
     */
    calculateBaseAttributes(treasure) {
        const def = TREASURE_DEFINITIONS[treasure.type];
        const levelIdx = this.getLevelIndex(treasure.level);
        const levelDef = LEVEL_DEFINITIONS[treasure.level];
        const baseMultiplier = levelDef?.multiplier || 1;
        
        const attrs = {};
        for (const attr of Object.keys(def.baseAttributes)) {
            attrs[attr] = Math.floor(def.baseAttributes[attr] * baseMultiplier * (1 + treasure.enhanceLevel * 0.1));
        }
        
        return attrs;
    }

    /**
     * 获取等级索引
     */
    getLevelIndex(level) {
        const levelMap = { '凡': 0, '灵': 1, '仙': 2, '神': 3, '道': 4 };
        return levelMap[level] ?? 0;
    }

    /**
     * 获取共鸣效果
     */
    getResonanceEffect(pair) {
        const def1 = TREASURE_DEFINITIONS[pair[0].type];
        const def2 = TREASURE_DEFINITIONS[pair[1].type];
        
        return RESONANCE_EFFECTS[`${def1.resonanceTag}+${def2.resonanceTag}`] || 
               RESONANCE_EFFECTS[`${def2.resonanceTag}+${def1.resonanceTag}`] ||
               { bonusAttribute: 'attack', bonusPercent: 0.05 };
    }

    /**
     * 计算总共鸣加成
     */
    calculateResonanceBonus() {
        let bonus = {
            attack: 0,
            defense: 0,
            life: 0,
            speed: 0
        };
        
        for (const pair of this.resonancePairs) {
            const effect = this.getResonanceEffect(pair);
            bonus[effect.bonusAttribute] += effect.bonusPercent;
        }
        
        return bonus;
    }

    /**
     * 炼制灵宝 (treasure.refine)
     */
    mcpRefine(params) {
        const { type, level = '凡', useStones = true } = params;
        
        // 验证类型
        if (!TREASURE_DEFINITIONS[type]) {
            return { success: false, error: `无效的灵宝类型: ${type}` };
        }
        
        // 验证等级
        if (!LEVEL_DEFINITIONS[level]) {
            return { success: false, error: `无效的灵宝等级: ${level}` };
        }
        
        // 检查材料/灵石
        const cost = this.getRefineCost(level);
        if (useStones) {
            if (this.gameState.player.spiritStones < cost) {
                return { success: false, error: `灵石不足，需要${cost}灵石` };
            }
            this.gameState.player.spiritStones -= cost;
        }
        
        // 计算成功率
        const successRate = this.getRefineSuccessRate(level);
        const success = Math.random() < successRate;
        
        if (!success) {
            this.gameState.chaosTreasure.totalRefined++;
            return {
                success: false,
                error: '炼制失败，灵宝破碎',
                materialsConsumed: true
            };
        }
        
        // 炼制成功
        const treasure = {
            id: this.generateId(),
            type: type,
            level: level,
            name: TREASURE_DEFINITIONS[type].name,
            description: TREASURE_DEFINITIONS[type].description,
            baseAttributes: TREASURE_DEFINITIONS[type].baseAttributes,
            enhanceLevel: 0,
            awakenLevel: 0,
            skills: [],
            resonanceSlots: TREASURE_DEFINITIONS[type].resonanceSlots,
            refineAt: Date.now()
        };
        
        this.treasures.push(treasure);
        this.gameState.chaosTreasure.totalRefined++;
        
        return {
            success: true,
            message: `炼制成功！获得${TREASURE_DEFINITIONS[type].name}`,
            treasure: this.formatTreasure(treasure),
            remainingTreasures: this.treasures.length
        };
    }

    /**
     * 灵宝觉醒 (treasure.awaken)
     */
    mcpAwaken(params) {
        const { treasureId } = params;
        
        const treasure = this.treasures.find(t => t.id === treasureId);
        if (!treasure) {
            return { success: false, error: `未找到ID为${treasureId}的灵宝` };
        }
        
        if (treasure.awakenLevel >= 3) {
            return { success: false, error: '灵宝已达最大觉醒等级' };
        }
        
        // 检查觉醒材料
        const cost = this.getAwakenCost(treasure.level, treasure.awakenLevel);
        if (this.gameState.player.spiritStones < cost) {
            return { success: false, error: `觉醒灵石不足，需要${cost}灵石` };
        }
        
        // 检查 karmaPoints
        const karmaCost = this.getAwakenKarmaCost(treasure.awakenLevel);
        if (this.gameState.player.karmaPoints < karmaCost) {
            return { success: false, error: `业力不足，需要${karmaCost}业力` };
        }
        
        // 扣除资源
        this.gameState.player.spiritStones -= cost;
        this.gameState.player.karmaPoints -= karmaCost;
        
        // 觉醒效果
        treasure.awakenLevel++;
        
        // 解锁技能
        const skill = this.awakenSkill(treasure);
        if (skill) {
            treasure.skills.push(skill);
        }
        
        this.gameState.chaosTreasure.totalAwakened++;
        
        return {
            success: true,
            message: `觉醒成功！灵宝解锁新技能`,
            treasure: this.formatTreasure(treasure),
            newSkill: skill,
            awakenLevel: treasure.awakenLevel
        };
    }

    /**
     * 查询灵宝 (treasure.query)
     */
    mcpQuery(params) {
        const { treasureId, listAll = false, filterType, filterLevel } = params;
        
        if (listAll) {
            let filtered = [...this.treasures];
            
            if (filterType) {
                filtered = filtered.filter(t => t.type === filterType);
            }
            if (filterLevel) {
                filtered = filtered.filter(t => t.level === filterLevel);
            }
            
            return {
                treasures: filtered.map(t => this.formatTreasure(t)),
                total: filtered.length,
                equipped: this.getEquippedList()
            };
        }
        
        if (treasureId) {
            const treasure = this.treasures.find(t => t.id === treasureId);
            if (!treasure) {
                return { success: false, error: `未找到ID为${treasureId}的灵宝` };
            }
            
            const attributes = this.calculateTreasureAttributes(treasure);
            const resonanceBonus = this.calculateResonanceBonus();
            
            return {
                treasure: this.formatTreasure(treasure),
                calculatedAttributes: attributes,
                resonanceBonus: resonanceBonus,
                isEquipped: this.isEquipped(treasureId)
            };
        }
        
        return {
            treasures: this.treasures.map(t => this.formatTreasure(t)),
            total: this.treasures.length,
            stats: this.getStats()
        };
    }

    /**
     * 装备灵宝 (treasure.equip)
     */
    mcpEquip(params) {
        const { treasureId, slot, unequip = false } = params;
        
        if (unequip) {
            return this.unequipTreasure(treasureId);
        }
        
        const treasure = this.treasures.find(t => t.id === treasureId);
        if (!treasure) {
            return { success: false, error: `未找到ID为${treasureId}的灵宝` };
        }
        
        // 验证槽位
        const validSlots = TREASURE_DEFINITIONS[treasure.type].slots;
        if (slot && !validSlots.includes(slot)) {
            return { success: false, error: `该灵宝无法装备到${slot}槽位` };
        }
        
        const targetSlot = slot || validSlots[0];
        
        // 检查槽位是否已被占用
        if (this.equippedTreasures[targetSlot]) {
            // 卸下原装备
            const oldTreasure = this.equippedTreasures[targetSlot];
            oldTreasure.equipped = false;
        }
        
        // 装备新灵宝
        this.equippedTreasures[targetSlot] = treasure;
        treasure.equippedSlot = targetSlot;
        
        return {
            success: true,
            message: `灵宝已装备到${targetSlot}`,
            treasure: this.formatTreasure(treasure),
            slot: targetSlot
        };
    }

    /**
     * 灵宝共鸣 (treasure.resonance)
     */
    mcpResonance(params) {
        const { treasureId1, treasureId2, removeResonance = false } = params;
        
        if (removeResonance) {
            return this.removeResonance(treasureId1, treasureId2);
        }
        
        const treasure1 = this.treasures.find(t => t.id === treasureId1);
        const treasure2 = this.treasures.find(t => t.id === treasureId2);
        
        if (!treasure1) {
            return { success: false, error: `未找到ID为${treasureId1}的灵宝` };
        }
        if (!treasure2) {
            return { success: false, error: `未找到ID为${treasureId2}的灵宝` };
        }
        
        if (treasureId1 === treasureId2) {
            return { success: false, error: '无法与自己共鸣' };
        }
        
        // 检查是否已有共鸣
        const existing = this.resonancePairs.find(
            p => (p[0].id === treasureId1 && p[1].id === treasureId2) ||
                 (p[0].id === treasureId2 && p[1].id === treasureId1)
        );
        if (existing) {
            return { success: false, error: '这两件灵宝已在共鸣状态' };
        }
        
        // 消耗灵石
        const cost = this.getResonanceCost();
        if (this.gameState.player.spiritStones < cost) {
            return { success: false, error: `共鸣灵石不足，需要${cost}灵石` };
        }
        this.gameState.player.spiritStones -= cost;
        
        // 建立共鸣
        this.resonancePairs.push([treasure1, treasure2]);
        treasure1.inResonance = true;
        treasure2.inResonance = true;
        
        const effect = this.getResonanceEffect([treasure1, treasure2]);
        this.gameState.chaosTreasure.totalResonated++;
        
        return {
            success: true,
            message: `共鸣建立成功！${effect.bonusAttribute}属性+${(effect.bonusPercent * 100).toFixed(0)}%`,
            pair: [
                this.formatTreasure(treasure1),
                this.formatTreasure(treasure2)
            ],
            effect: effect,
            resonancePairs: this.resonancePairs.length
        };
    }

    /**
     * 灵宝强化 (treasure.strengthen)
     */
    mcpStrengthen(params) {
        const { treasureId, autoIncrement = false } = params;
        
        const treasure = this.treasures.find(t => t.id === treasureId);
        if (!treasure) {
            return { success: false, error: `未找到ID为${treasureId}的灵宝` };
        }
        
        const maxLevel = 20;
        if (treasure.enhanceLevel >= maxLevel) {
            return { success: false, error: '灵宝已达最大强化等级' };
        }
        
        // 计算强化成功率
        const successRate = this.getStrengthenSuccessRate(treasure.enhanceLevel);
        const cost = this.getStrengthenCost(treasure.level, treasure.enhanceLevel);
        
        if (this.gameState.player.spiritStones < cost) {
            return { success: false, error: `强化灵石不足，需要${cost}灵石` };
        }
        this.gameState.player.spiritStones -= cost;
        
        this.gameState.chaosTreasure.totalStrengthened++;
        
        // 成功率判定
        const success = Math.random() < successRate;
        
        if (!success) {
            return {
                success: false,
                error: '强化失败，灵宝没有变化',
                enhanceLevel: treasure.enhanceLevel,
                costConsumed: cost
            };
        }
        
        // 强化成功
        if (autoIncrement) {
            treasure.enhanceLevel++;
        }
        
        const newAttributes = this.calculateTreasureAttributes(treasure);
        
        return {
            success: true,
            message: autoIncrement ? `强化成功！灵宝强化等级提升至${treasure.enhanceLevel}` : '强化成功！',
            treasure: this.formatTreasure(treasure),
            newAttributes: newAttributes,
            enhanceLevel: treasure.enhanceLevel
        };
    }

    // ==================== 内部方法 ====================

    /**
     * 获取炼制消耗
     */
    getRefineCost(level) {
        const costs = { '凡': 50, '灵': 200, '仙': 1000, '神': 5000, '道': 25000 };
        return costs[level] || 50;
    }

    /**
     * 获取炼制成功率
     */
    getRefineSuccessRate(level) {
        const rates = { '凡': 0.9, '灵': 0.7, '仙': 0.5, '神': 0.3, '道': 0.15 };
        return rates[level] || 0.9;
    }

    /**
     * 获取觉醒消耗
     */
    getAwakenCost(level, awakenLevel) {
        const baseCosts = { '凡': 100, '灵': 500, '仙': 2500, '神': 12500, '道': 62500 };
        return (baseCosts[level] || 100) * (awakenLevel + 1);
    }

    /**
     * 获取觉醒业力消耗
     */
    getAwakenKarmaCost(awakenLevel) {
        return (awakenLevel + 1) * 10;
    }

    /**
     * 获取共鸣消耗
     */
    getResonanceCost() {
        return 500;
    }

    /**
     * 获取强化消耗
     */
    getStrengthenCost(level, enhanceLevel) {
        const baseCosts = { '凡': 30, '灵': 150, '仙': 750, '神': 3750, '道': 18750 };
        return (baseCosts[level] || 30) * (enhanceLevel + 1);
    }

    /**
     * 获取强化成功率
     */
    getStrengthenSuccessRate(enhanceLevel) {
        if (enhanceLevel < 5) return 0.8;
        if (enhanceLevel < 10) return 0.6;
        if (enhanceLevel < 15) return 0.4;
        return 0.2;
    }

    /**
     * 觉醒技能
     */
    awakenSkill(treasure) {
        const skillTree = TREASURE_DEFINITIONS[treasure.type]?.skillTree;
        if (!skillTree || !skillTree[treasure.awakenLevel]) {
            return null;
        }
        return {
            id: this.generateId(),
            name: skillTree[treasure.awakenLevel].name,
            description: skillTree[treasure.awakenLevel].description,
            awakenLevel: treasure.awakenLevel,
            acquiredAt: Date.now()
        };
    }

    /**
     * 计算灵宝总属性
     */
    calculateTreasureAttributes(treasure) {
        const base = this.calculateBaseAttributes(treasure);
        const resonanceBonus = this.calculateResonanceBonus();
        
        // 觉醒加成
        const awakenBonus = treasure.awakenLevel * 0.15;
        
        const result = {};
        for (const attr of Object.keys(base)) {
            const bonus = resonanceBonus[attr] || 0;
            result[attr] = Math.floor(base[attr] * (1 + bonus + awakenBonus));
        }
        
        return result;
    }

    /**
     * 格式化灵宝输出
     */
    formatTreasure(treasure) {
        return {
            id: treasure.id,
            type: treasure.type,
            level: treasure.level,
            name: treasure.name,
            description: treasure.description,
            enhanceLevel: treasure.enhanceLevel,
            awakenLevel: treasure.awakenLevel,
            skills: treasure.skills || [],
            resonanceSlots: treasure.resonanceSlots,
            baseAttributes: treasure.baseAttributes,
            equippedSlot: treasure.equippedSlot || null,
            inResonance: treasure.inResonance || false,
            refineAt: treasure.refineAt
        };
    }

    /**
     * 获取已装备列表
     */
    getEquippedList() {
        return Object.entries(this.equippedTreasures).map(([slot, treasure]) => ({
            slot,
            treasure: this.formatTreasure(treasure)
        }));
    }

    /**
     * 检查灵宝是否已装备
     */
    isEquipped(treasureId) {
        return Object.values(this.equippedTreasures).some(t => t.id === treasureId);
    }

    /**
     * 卸下灵宝
     */
    unequipTreasure(treasureId) {
        for (const [slot, treasure] of Object.entries(this.equippedTreasures)) {
            if (treasure.id === treasureId) {
                delete this.equippedTreasures[slot];
                treasure.equippedSlot = null;
                return {
                    success: true,
                    message: `灵宝已从${slot}槽位卸下`,
                    treasure: this.formatTreasure(treasure)
                };
            }
        }
        return { success: false, error: '该灵宝未装备' };
    }

    /**
     * 移除共鸣
     */
    removeResonance(treasureId1, treasureId2) {
        const idx = this.resonancePairs.findIndex(
            p => (p[0].id === treasureId1 && p[1].id === treasureId2) ||
                 (p[0].id === treasureId2 && p[1].id === treasureId1)
        );
        
        if (idx === -1) {
            return { success: false, error: '未找到共鸣关系' };
        }
        
        const pair = this.resonancePairs.splice(idx, 1)[0];
        pair[0].inResonance = false;
        pair[1].inResonance = false;
        
        return {
            success: true,
            message: '共鸣已解除',
            remainingPairs: this.resonancePairs.length
        };
    }

    /**
     * 获取统计数据
     */
    getStats() {
        return {
            totalTreasures: this.treasures.length,
            maxTreasures: this.maxTreasures,
            totalRefined: this.gameState.chaosTreasure?.totalRefined || 0,
            totalAwakened: this.gameState.chaosTreasure?.totalAwakened || 0,
            totalResonated: this.gameState.chaosTreasure?.totalResonated || 0,
            totalStrengthened: this.gameState.chaosTreasure?.totalStrengthened || 0,
            resonancePairs: this.resonancePairs.length,
            equippedCount: Object.keys(this.equippedTreasures).length,
            treasuresByLevel: this.treasures.reduce((acc, t) => {
                acc[t.level] = (acc[t.level] || 0) + 1;
                return acc;
            }, {}),
            treasuresByType: this.treasures.reduce((acc, t) => {
                acc[t.type] = (acc[t.type] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

// ==================== 常量定义 ====================

// 灵宝类型
export const TREASURE_TYPES = {
    武器: '武器',
    防具: '防具',
    饰品: '饰品',
    秘宝: '秘宝'
};

// 灵宝等级
export const TREASURE_LEVELS = {
    凡: '凡',
    灵: '灵',
    仙: '仙',
    神: '神',
    道: '道'
};

// 灵宝属性
export const TREASURE_ATTRIBUTES = {
    攻击: 'attack',
    防御: 'defense',
    生命: 'life',
    速度: 'speed'
};

// 灵宝类型定义
const TREASURE_DEFINITIONS = {
    武器: {
        name: '混沌神兵',
        description: '蕴含混沌之力的神兵利器',
        slots: ['主手', '副手'],
        resonanceTag: 'attack',
        baseAttributes: { attack: 100, speed: 20 },
        resonanceSlots: 2,
        skillTree: {
            1: { name: '混沌斩', description: '攻击时有几率触发混沌斩击' },
            2: { name: '暴怒之锋', description: '攻击伤害提升15%' },
            3: { name: '终极混沌', description: '释放终极混沌斩' }
        }
    },
    防具: {
        name: '混沌护甲',
        description: '蕴含混沌之力的防御铠甲',
        slots: ['护甲', '护肩'],
        resonanceTag: 'defense',
        baseAttributes: { defense: 100, life: 200 },
        resonanceSlots: 2,
        skillTree: {
            1: { name: '混沌护盾', description: '受到伤害时有几率生成护盾' },
            2: { name: '反射之壁', description: '将10%伤害反射给攻击者' },
            3: { name: '终极不灭', description: '受到致命伤害时免疫一次' }
        }
    },
    饰品: {
        name: '混沌灵饰',
        description: '蕴含混沌之力的灵性饰品',
        slots: ['项链', '戒指', '手镯'],
        resonanceTag: 'life',
        baseAttributes: { life: 300, defense: 30 },
        resonanceSlots: 2,
        skillTree: {
            1: { name: '生命汲取', description: '攻击时吸取生命' },
            2: { name: '灵力涌动', description: '生命上限提升20%' },
            3: { name: '终极共生', description: '生命与灵力互相转化' }
        }
    },
    秘宝: {
        name: '混沌秘宝',
        description: '蕴含混沌之力的神秘宝物',
        slots: ['秘宝'],
        resonanceTag: 'speed',
        baseAttributes: { speed: 50, attack: 30 },
        resonanceSlots: 2,
        skillTree: {
            1: { name: '瞬移', description: '速度临时提升' },
            2: { name: '时间扭曲', description: '行动顺序提前' },
            3: { name: '终极时停', description: '使目标行动迟缓' }
        }
    }
};

// 等级定义
const LEVEL_DEFINITIONS = {
    凡: { name: '凡品', multiplier: 1.0 },
    灵: { name: '灵品', multiplier: 1.5 },
    仙: { name: '仙品', multiplier: 2.5 },
    神: { name: '神品', multiplier: 4.0 },
    道: { name: '道品', multiplier: 7.0 }
};

// 共鸣效果
const RESONANCE_EFFECTS = {
    'attack+defense': { bonusAttribute: 'defense', bonusPercent: 0.1 },
    'attack+life': { bonusAttribute: 'attack', bonusPercent: 0.08 },
    'attack+speed': { bonusAttribute: 'attack', bonusPercent: 0.12 },
    'defense+life': { bonusAttribute: 'defense', bonusPercent: 0.1 },
    'defense+speed': { bonusAttribute: 'defense', bonusPercent: 0.08 },
    'life+speed': { bonusAttribute: 'life', bonusPercent: 0.1 },
    'attack+attack': { bonusAttribute: 'attack', bonusPercent: 0.15 },
    'defense+defense': { bonusAttribute: 'defense', bonusPercent: 0.15 },
    'life+life': { bonusAttribute: 'life', bonusPercent: 0.15 },
    'speed+speed': { bonusAttribute: 'speed', bonusPercent: 0.15 }
};

// 导出类
export { ChaosTreasureService };

// 导出单例
export const chaosTreasureService = new ChaosTreasureService();

// 导出MCP工具处理器
export function createChaosTreasureMCPHandlers(gameState) {
    const service = new ChaosTreasureService();
    service.init(gameState);

    return {
        'treasure.refine': (params) => service.mcpRefine(params),
        'treasure.awaken': (params) => service.mcpAwaken(params),
        'treasure.query': (params) => service.mcpQuery(params),
        'treasure.equip': (params) => service.mcpEquip(params),
        'treasure.resonance': (params) => service.mcpResonance(params),
        'treasure.strengthen': (params) => service.mcpStrengthen(params)
    };
}

// 导出工具定义
export const CHAOS_TREASURE_TOOLS = {
    'treasure.refine': {
        name: 'treasure.refine',
        description: '炼制混沌灵宝',
        inputSchema: {
            type: 'object',
            properties: {
                type: { 
                    type: 'string', 
                    enum: ['武器', '防具', '饰品', '秘宝'],
                    description: '灵宝类型' 
                },
                level: { 
                    type: 'string', 
                    enum: ['凡', '灵', '仙', '神', '道'],
                    description: '灵宝等级',
                    default: '凡'
                },
                useStones: { type: 'boolean', description: '是否消耗灵石', default: true }
            },
            required: ['type']
        }
    },
    'treasure.awaken': {
        name: 'treasure.awaken',
        description: '灵宝觉醒，提升灵宝能力',
        inputSchema: {
            type: 'object',
            properties: {
                treasureId: { type: 'string', description: '灵宝ID' }
            },
            required: ['treasureId']
        }
    },
    'treasure.query': {
        name: 'treasure.query',
        description: '查询灵宝信息',
        inputSchema: {
            type: 'object',
            properties: {
                treasureId: { type: 'string', description: '灵宝ID' },
                listAll: { type: 'boolean', description: '列出所有灵宝' },
                filterType: { type: 'string', enum: ['武器', '防具', '饰品', '秘宝'], description: '按类型筛选' },
                filterLevel: { type: 'string', enum: ['凡', '灵', '仙', '神', '道'], description: '按等级筛选' }
            }
        }
    },
    'treasure.equip': {
        name: 'treasure.equip',
        description: '装备灵宝到角色',
        inputSchema: {
            type: 'object',
            properties: {
                treasureId: { type: 'string', description: '灵宝ID' },
                slot: { type: 'string', description: '装备槽位' },
                unequip: { type: 'boolean', description: '是否卸下', default: false }
            },
            required: ['treasureId']
        }
    },
    'treasure.resonance': {
        name: 'treasure.resonance',
        description: '灵宝共鸣，两件灵宝产生共鸣效果',
        inputSchema: {
            type: 'object',
            properties: {
                treasureId1: { type: 'string', description: '第一件灵宝ID' },
                treasureId2: { type: 'string', description: '第二件灵宝ID' },
                removeResonance: { type: 'boolean', description: '是否解除共鸣', default: false }
            }
        }
    },
    'treasure.strengthen': {
        name: 'treasure.strengthen',
        description: '强化灵宝，提升基础属性',
        inputSchema: {
            type: 'object',
            properties: {
                treasureId: { type: 'string', description: '灵宝ID' },
                autoIncrement: { type: 'boolean', description: '是否自动提升强化等级', default: false }
            },
            required: ['treasureId']
        }
    }
};