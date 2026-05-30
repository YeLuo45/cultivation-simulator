/**
 * BloodlineService.js - 血脉天赋系统
 * V244: 仙宠进化+血脉系统
 * 
 * 功能：
 * 1. 血脉等级 (凡兽/灵兽/仙兽/神兽)
 * 2. 血脉觉醒: 消耗血脉精华觉醒血脉之力
 * 3. 血脉天赋: 每种血脉有专属天赋加成
 * 4. 血脉共鸣: 同类血脉仙宠可产生共鸣效果
 */

// ===== 常量定义 =====

/**
 * 血脉等级定义
 */
export const BLOODLINE_RANKS = {
    '凡兽': { 
        multiplier: 1.0, 
        bonusSkills: [],
        awakeningCost: 0,
        requiredProgress: 0,
        rankIndex: 0
    },
    '灵兽': { 
        multiplier: 1.5, 
        bonusSkills: ['灵视'],
        awakeningCost: 50,
        requiredProgress: 100,
        rankIndex: 1
    },
    '仙兽': { 
        multiplier: 2.0, 
        bonusSkills: ['灵视', '仙风'],
        awakeningCost: 200,
        requiredProgress: 500,
        rankIndex: 2
    },
    '神兽': { 
        multiplier: 3.0, 
        bonusSkills: ['灵视', '仙风', '神佑'],
        awakeningCost: 1000,
        requiredProgress: 2000,
        rankIndex: 3
    }
};

/**
 * 血脉等级顺序
 */
export const BLOODLINE_ORDER = ['凡兽', '灵兽', '仙兽', '神兽'];

/**
 * 血脉类型
 */
export const BLOODLINE_TYPES = {
    '火焰血脉': { element: 'fire', bonus: { attack: 15, critRate: 2 } },
    '寒冰血脉': { element: 'water', bonus: { defense: 15, health: 20 } },
    '雷霆血脉': { element: 'thunder', bonus: { attack: 10, agility: 10 } },
    '大地血脉': { element: 'earth', bonus: { health: 30, defense: 10 } },
    '风灵血脉': { element: 'wind', bonus: { agility: 15, critRate: 3 } },
    '自然血脉': { element: 'wood', bonus: { spiritual: 20, health: 15 } }
};

/**
 * 血脉精华道具名
 */
export const BLOODLINE_ESSENCE_ITEM = '血脉精华';

/**
 * 觉醒道具
 */
export const AWAKENING_ITEMS = {
    '灵兽': '灵兽血脉石',
    '仙兽': '仙兽血脉石',
    '神兽': '神兽血脉石'
};

// ===== BloodlineService 类 =====

/**
 * 血脉天赋服务类
 */
class BloodlineService {
    constructor(gameState) {
        this.gameState = gameState;
        this.hooks = new Map();
        this.hookIdCounter = 0;
        
        // 初始化数据
        this.initializeData();
    }

    /**
     * 初始化血脉数据
     */
    initializeData() {
        if (!this.gameState.bloodlineData) {
            this.gameState.bloodlineData = {
                bloodlineEssence: 0,      // 血脉精华数量
                totalEssenceEarned: 0,    // 累计获得血脉精华
                resonancePairs: []        // 共鸣配对
            };
        }
    }

    /**
     * 获取血脉数据
     */
    getBloodlineData() {
        return this.gameState.bloodlineData;
    }

    /**
     * 获得血脉精华
     * @param {number} amount - 数量
     * @param {string} reason - 原因
     */
    gainBloodlineEssence(amount, reason = 'reward') {
        const data = this.getBloodlineData();
        data.bloodlineEssence += amount;
        data.totalEssenceEarned += amount;
        
        this.triggerHook('bloodlineEssenceGained', {
            amount,
            reason,
            totalEssence: data.bloodlineEssence,
            totalEarned: data.totalEssenceEarned
        });
        
        return {
            success: true,
            gained: amount,
            reason,
            totalEssence: data.bloodlineEssence,
            totalEarned: data.totalEssenceEarned
        };
    }

    /**
     * 消耗血脉精华
     * @param {number} amount - 数量
     */
    consumeBloodlineEssence(amount) {
        const data = this.getBloodlineData();
        if (data.bloodlineEssence < amount) {
            return {
                success: false,
                error: '血脉精华不足',
                required: amount,
                available: data.bloodlineEssence
            };
        }
        
        data.bloodlineEssence -= amount;
        return { success: true, consumed: amount, remaining: data.bloodlineEssence };
    }

    /**
     * 检查仙宠是否可以觉醒
     * @param {string} beastId - 仙宠ID
     */
    canAwaken(beastId) {
        const beast = this.getBeastById(beastId);
        if (!beast) {
            return { success: false, error: '仙宠不存在' };
        }
        
        if (beast.bloodlineAwakened) {
            return { success: false, error: '血脉已觉醒' };
        }
        
        // 检查是否已达当前血脉等级上限
        const currentRank = BLOODLINE_RANKS[beast.bloodlineRank];
        if (currentRank.rankIndex >= BLOODLINE_ORDER.length - 1) {
            return { success: false, error: '已达最高血脉等级' };
        }
        
        // 检查血脉进度
        if (beast.bloodlineProgress < currentRank.requiredProgress) {
            return {
                success: false,
                error: '血脉进度不足',
                required: currentRank.requiredProgress,
                current: beast.bloodlineProgress
            };
        }
        
        // 检查血脉精华
        const data = this.getBloodlineData();
        if (data.bloodlineEssence < currentRank.awakeningCost) {
            return {
                success: false,
                error: '血脉精华不足',
                required: currentRank.awakeningCost,
                available: data.bloodlineEssence
            };
        }
        
        return { success: true };
    }

    /**
     * 觉醒仙宠血脉
     * @param {string} beastId - 仙宠ID
     * @param {string} bloodlineType - 血脉类型 (可选)
     */
    awakenBloodline(beastId, bloodlineType = null) {
        // 检查是否可以觉醒
        const canResult = this.canAwaken(beastId);
        if (!canResult.success) {
            return canResult;
        }
        
        const beast = this.getBeastById(beastId);
        const currentRank = BLOODLINE_RANKS[beast.bloodlineRank];
        const nextRankName = BLOODLINE_ORDER[currentRank.rankIndex + 1];
        const nextRank = BLOODLINE_RANKS[nextRankName];
        
        // 消耗血脉精华
        const consumeResult = this.consumeBloodlineEssence(currentRank.awakeningCost);
        if (!consumeResult.success) {
            return consumeResult;
        }
        
        // 执行觉醒
        const oldRank = beast.bloodlineRank;
        beast.bloodlineRank = nextRankName;
        beast.bloodlineAwakened = true;
        beast.bloodlineProgress = 0;
        
        // 设置血脉类型
        if (bloodlineType && BLOODLINE_TYPES[bloodlineType]) {
            beast.bloodlineType = bloodlineType;
            Object.assign(beast.stats, BLOODLINE_TYPES[bloodlineType].bonus);
        } else if (!beast.bloodlineType) {
            // 默认选择第一个血脉类型
            beast.bloodlineType = Object.keys(BLOODLINE_TYPES)[0];
            Object.assign(beast.stats, BLOODLINE_TYPES[beast.bloodlineType].bonus);
        }
        
        // 解锁血脉技能
        const newSkills = nextRank.bonusSkills;
        const unlockedSkills = newSkills.filter(skill => !beast.skills.includes(skill));
        beast.skills.push(...unlockedSkills);
        
        // 触发视觉反馈钩子
        this.triggerHook('bloodlineAwakened', {
            beast,
            oldRank,
            newRank: nextRankName,
            unlockedSkills,
            bloodlineType: beast.bloodlineType
        });
        
        return {
            success: true,
            beast,
            oldRank,
            newRank: nextRankName,
            unlockedSkills,
            bloodlineType: beast.bloodlineType,
            newMultiplier: nextRank.multiplier
        };
    }

    /**
     * 增加血脉进度
     * @param {string} beastId - 仙宠ID
     * @param {number} amount - 进度值
     */
    addBloodlineProgress(beastId, amount) {
        const beast = this.getBeastById(beastId);
        if (!beast) return { success: false, error: '仙宠不存在' };
        
        const currentRank = BLOODLINE_RANKS[beast.bloodlineRank];
        const maxProgress = currentRank.requiredProgress;
        
        const oldProgress = beast.bloodlineProgress;
        beast.bloodlineProgress = Math.min(beast.bloodlineProgress + amount, maxProgress);
        const actualAdded = beast.bloodlineProgress - oldProgress;
        
        return {
            success: true,
            added: actualAdded,
            currentProgress: beast.bloodlineProgress,
            maxProgress,
            percentage: Math.round((beast.bloodlineProgress / maxProgress) * 100)
        };
    }

    /**
     * 获取仙宠血脉信息
     * @param {string} beastId - 仙宠ID
     */
    getBeastBloodlineInfo(beastId) {
        const beast = this.getBeastById(beastId);
        if (!beast) return { success: false, error: '仙宠不存在' };
        
        const currentRank = BLOODLINE_RANKS[beast.bloodlineRank];
        const currentRankIndex = currentRank.rankIndex;
        const nextRankName = currentRankIndex < BLOODLINE_ORDER.length - 1 
            ? BLOODLINE_ORDER[currentRankIndex + 1] 
            : null;
        
        return {
            success: true,
            beastId,
            bloodlineRank: beast.bloodlineRank,
            bloodlineType: beast.bloodlineType || null,
            bloodlineAwakened: beast.bloodlineAwakened,
            bloodlineProgress: beast.bloodlineProgress,
            maxProgress: currentRank.requiredProgress,
            progressPercentage: Math.round((beast.bloodlineProgress / currentRank.requiredProgress) * 100),
            multiplier: currentRank.multiplier,
            bonusSkills: currentRank.bonusSkills,
            nextRank: nextRankName,
            nextRankMultiplier: nextRankName ? BLOODLINE_RANKS[nextRankName].multiplier : null,
            nextRankSkills: nextRankName ? BLOODLINE_RANKS[nextRankName].bonusSkills : [],
            awakeningCost: nextRankName ? BLOODLINE_RANKS[nextRankName].awakeningCost : null,
            availableBloodlineTypes: Object.keys(BLOODLINE_TYPES)
        };
    }

    /**
     * 检查血脉共鸣
     * @param {string} beastId1 - 仙宠ID1
     * @param {string} beastId2 - 仙宠ID2
     */
    checkResonance(beastId1, beastId2) {
        const beast1 = this.getBeastById(beastId1);
        const beast2 = this.getBeastById(beastId2);
        
        if (!beast1 || !beast2) {
            return { success: false, error: '仙宠不存在' };
        }
        
        // 检查是否有相同的血脉类型
        if (beast1.bloodlineType !== beast2.bloodlineType) {
            return {
                success: true,
                hasResonance: false,
                reason: '血脉类型不同'
            };
        }
        
        // 检查是否都已觉醒
        if (!beast1.bloodlineAwakened || !beast2.bloodlineAwakened) {
            return {
                success: true,
                hasResonance: false,
                reason: '有仙宠血脉未觉醒'
            };
        }
        
        // 计算共鸣加成
        const rank1 = BLOODLINE_RANKS[beast1.bloodlineRank].rankIndex;
        const rank2 = BLOODLINE_RANKS[beast2.bloodlineRank].rankIndex;
        const resonanceBonus = (rank1 + 1) * (rank2 + 1) * 0.1;
        
        return {
            success: true,
            hasResonance: true,
            bloodlineType: beast1.bloodlineType,
            resonanceBonus,
            resonanceDescription: `${beast1.bloodlineType}共鸣: 全属性+${Math.round(resonanceBonus * 100)}%`
        };
    }

    /**
     * 建立血脉共鸣配对
     * @param {string} beastId1 - 仙宠ID1
     * @param {string} beastId2 - 仙宠ID2
     */
    createResonancePair(beastId1, beastId2) {
        // 检查是否可以共鸣
        const checkResult = this.checkResonance(beastId1, beastId2);
        if (!checkResult.success) {
            return checkResult;
        }
        
        if (!checkResult.hasResonance) {
            return {
                success: false,
                error: checkResult.reason
            };
        }
        
        const data = this.getBloodlineData();
        
        // 检查是否已存在配对
        const existingPair = data.resonancePairs.find(
            p => (p.beastId1 === beastId1 && p.beastId2 === beastId2) ||
                 (p.beastId1 === beastId2 && p.beastId2 === beastId1)
        );
        
        if (existingPair) {
            return { success: false, error: '共鸣配对已存在' };
        }
        
        const pairId = `resonance_${Date.now()}`;
        data.resonancePairs.push({
            pairId,
            beastId1,
            beastId2,
            bloodlineType: checkResult.bloodlineType,
            bonus: checkResult.resonanceBonus,
            createdAt: Date.now()
        });
        
        this.triggerHook('resonanceCreated', {
            pairId,
            beastId1,
            beastId2,
            bloodlineType: checkResult.bloodlineType,
            bonus: checkResult.resonanceBonus
        });
        
        return {
            success: true,
            pairId,
            bonus: checkResult.resonanceBonus,
            description: checkResult.resonanceDescription
        };
    }

    /**
     * 移除血脉共鸣配对
     * @param {string} pairId - 配对ID
     */
    removeResonancePair(pairId) {
        const data = this.getBloodlineData();
        const pairIndex = data.resonancePairs.findIndex(p => p.pairId === pairId);
        
        if (pairIndex === -1) {
            return { success: false, error: '共鸣配对不存在' };
        }
        
        const removedPair = data.resonancePairs.splice(pairIndex, 1)[0];
        
        this.triggerHook('resonanceRemoved', removedPair);
        
        return { success: true, removedPair };
    }

    /**
     * 获取所有共鸣配对
     */
    getAllResonancePairs() {
        return this.getBloodlineData().resonancePairs;
    }

    /**
     * 计算共鸣总加成
     */
    calculateTotalResonanceBonus() {
        const pairs = this.getAllResonancePairs();
        return pairs.reduce((total, pair) => total + pair.bonus, 0);
    }

    /**
     * 获取仙宠属性 (带血脉加成)
     * @param {string} beastId - 仙宠ID
     */
    getBeastStatsWithBloodline(beastId) {
        const beast = this.getBeastById(beastId);
        if (!beast) return null;
        
        const baseStats = { ...beast.stats };
        const rank = BLOODLINE_RANKS[beast.bloodlineRank];
        const resonanceBonus = this.calculateTotalResonanceBonus();
        
        // 应用血脉倍率
        const multiplier = rank.multiplier * (1 + resonanceBonus);
        
        const enhancedStats = {};
        for (const [stat, value] of Object.entries(baseStats)) {
            enhancedStats[stat] = Math.floor(value * multiplier);
        }
        
        enhancedStats._multiplier = multiplier;
        enhancedStats._bloodlineRank = beast.bloodlineRank;
        enhancedStats._resonanceBonus = resonanceBonus;
        
        return enhancedStats;
    }

    /**
     * 辅助方法：获取仙宠
     * @param {string} beastId - 仙宠ID
     */
    getBeastById(beastId) {
        return this.gameState.spiritBeastData?.beasts.find(b => b.id === beastId) || null;
    }

    // ===== Hook系统 =====

    /**
     * 注册钩子
     * @param {string} type - 钩子类型
     * @param {function} callback - 回调函数
     */
    registerHook(type, callback) {
        const hookId = ++this.hookIdCounter;
        this.hooks.set(hookId, { type, callback, enabled: true });
        return { success: true, hookId, type };
    }

    /**
     * 注销钩子
     * @param {number} hookId - 钩子ID
     */
    unregisterHook(hookId) {
        if (!this.hooks.has(hookId)) {
            return { success: false, error: '钩子不存在' };
        }
        this.hooks.delete(hookId);
        return { success: true };
    }

    /**
     * 触发钩子
     * @param {string} type - 钩子类型
     * @param {object} data - 数据
     */
    triggerHook(type, data) {
        const triggeredIds = [];
        for (const [hookId, hook] of this.hooks) {
            if (hook.type === type && hook.enabled) {
                hook.callback(data);
                triggeredIds.push(hookId);
            }
        }
        return triggeredIds;
    }

    /**
     * 列出所有钩子
     */
    listHooks() {
        return Array.from(this.hooks.entries()).map(([id, h]) => ({
            id,
            type: h.type,
            enabled: h.enabled
        }));
    }

    // ===== 序列化 =====

    /**
     * 序列化数据
     */
    serialize() {
        return {
            bloodlineData: this.gameState.bloodlineData
        };
    }

    /**
     * 反序列化数据
     * @param {object} data - 序列化数据
     */
    deserialize(data) {
        if (data.bloodlineData) {
            this.gameState.bloodlineData = data.bloodlineData;
        }
    }
}

export default BloodlineService;
export { BloodlineService };