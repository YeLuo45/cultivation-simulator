/**
 * EpiphanyService.js - 顿悟触发系统
 * V261 方向A迭代3/9: generic-agent目标驱动 + thunderbolt pipeline加速
 * 
 * 提供MCP工具:
 * - epiphany.trigger - 触发顿悟
 * - epiphany.status - 查询顿悟状态
 * - epiphany.insight - 积累悟道
 */

// ===== 常量定义 =====

/**
 * 顿悟类型配置 (generic-agent目标追求模式)
 */
export const EPIPHANY_TYPES = {
    CULTIVATION_INSIGHT: {
        id: 'cultivation_insight',
        name: '修炼顿悟',
        description: '修炼瓶颈突然贯通',
        minPlateauDays: 3,
        insightThreshold: 100,
        pipelineBoost: 4,  // 一次性完成4个阶段
        rewardMultiplier: 1.5
    },
    COMPREHENSION_BURST: {
        id: 'comprehension_burst',
        name: '领悟爆发',
        description: '功法理解突飞猛进',
        minPlateauDays: 5,
        insightThreshold: 200,
        pipelineBoost: 3,
        rewardMultiplier: 2.0
    },
    HEAVENLY_REVELATION: {
        id: 'heavenly_revelation',
        name: '天机显现',
        description: '天道奥秘直接传授',
        minPlateauDays: 10,
        insightThreshold: 500,
        pipelineBoost: 5,
        rewardMultiplier: 3.0
    }
};

/**
 * 顿悟状态
 */
export const EPIPHANY_STATES = {
    DORMANT: 'dormant',         // 休眠
    ACCUMULATING: 'accumulating', // 积累中
    TRIGGERED: 'triggered',     // 已触发
    PROCESSING: 'processing',   // 处理中
    COMPLETED: 'completed'      // 完成
};

/**
 * 顿悟配置
 */
export const EPIPHANY_CONFIG = {
    // 每次修炼获得的悟性
    insightPerCultivate: 5,
    // 每天自动获得的基础悟性
    dailyBaseInsight: 2,
    // 顿悟触发基础概率
    baseTriggerChance: 0.01,
    // 悟性溢出加成 (每超过threshold 100点 +1%触发率)
    insightOverflowBonus: 0.01,
    // 顿悟触发后流水线加速
    pipelineAcceleration: true,
    // 最大历史记录
    maxHistorySize: 30
};

// ===== 服务类 =====

class EpiphanyService {
    constructor(gameState) {
        this.gameState = gameState;
        this.epiphanyState = null;
    }

    /**
     * 初始化顿悟系统
     */
    init(gameState) {
        if (!gameState.epiphany) {
            gameState.epiphany = {
                state: EPIPHANY_STATES.DORMANT,
                insightPoints: 0,
                plateauDays: 0,
                totalEpiphanies: 0,
                currentEpiphanyType: null,
                insightHistory: [],
                epiphanyHistory: [],
                lastCultivateTime: null
            };
        }
        this.epiphanyState = gameState.epiphany;
        return gameState;
    }

    /**
     * 积累悟性 (generic-agent目标追求机制)
     * @param {Object} params - { amount?: number, reason?: string }
     * @returns {Object} 积累结果
     */
    accumulateInsight(params = {}) {
        const amount = params.amount || EPIPHANY_CONFIG.insightPerCultivate;
        const reason = params.reason || '修炼';
        
        this.epiphanyState.insightPoints += amount;
        this.epiphanyState.state = EPIPHANY_STATES.ACCUMULATING;
        
        // 记录历史
        this.epiphanyState.insightHistory.push({
            amount,
            reason,
            total: this.epiphanyState.insightPoints,
            timestamp: Date.now()
        });
        
        // 保持历史记录不超过最大数量
        if (this.epiphanyState.insightHistory.length > EPIPHANY_CONFIG.maxHistorySize) {
            this.epiphanyState.insightHistory.shift();
        }
        
        return {
            success: true,
            added: amount,
            total: this.epiphanyState.insightPoints,
            reason
        };
    }

    /**
     * 尝试触发顿悟 (generic-agent目标驱动)
     * @param {Object} params - { plateauDays?: number }
     * @returns {Object} 触发结果
     */
    tryTriggerEpiphany(params = {}) {
        const plateauDays = params.plateauDays || this.epiphanyState.plateauDays;
        const insight = this.epiphanyState.insightPoints;
        
        // 计算触发概率 (基于generic-agent目标追求模型)
        let triggerChance = EPIPHANY_CONFIG.baseTriggerChance;
        
        // 悟性加成
        const insightBonus = Math.floor(insight / 100) * EPIPHANY_CONFIG.insightOverflowBonus;
        triggerChance += insightBonus;
        
        // 瓶颈天数加成
        const plateauBonus = Math.min(0.1, plateauDays * 0.005);
        triggerChance += plateauBonus;
        
        // 决定触发哪种顿悟
        const epiphanyTypes = Object.values(EPIPHANY_TYPES);
        let triggeredType = null;
        
        for (const type of epiphanyTypes) {
            if (plateauDays >= type.minPlateauDays && insight >= type.insightThreshold) {
                // 越高级的顿悟触发概率越低
                const typeChance = triggerChance / (epiphanyTypes.indexOf(type) + 1);
                if (Math.random() < typeChance) {
                    triggeredType = type;
                    break;
                }
            }
        }
        
        if (triggeredType) {
            return this.triggerEpiphany(triggeredType);
        }
        
        return {
            success: false,
            message: '机缘未到，继续积累悟性',
            triggerChance: (triggerChance * 100).toFixed(2) + '%',
            insightNeeded: this.getInsightNeededForNextEpiphany()
        };
    }

    /**
     * 触发顿悟 (thunderbolt pipeline加速)
     */
    triggerEpiphany(type) {
        this.epiphanyState.state = EPIPHANY_STATES.TRIGGERED;
        this.epiphanyState.currentEpiphanyType = type.id;
        this.epiphanyState.totalEpiphanies++;
        
        return {
            success: true,
            type: type.id,
            name: type.name,
            description: type.description,
            message: `天降机缘！触发${type.name}！`,
            pipelineBoost: type.pipelineBoost,
            rewardMultiplier: type.rewardMultiplier
        };
    }

    /**
     * 处理顿悟效果 (thunderbolt pipeline加速)
     * @param {Object} params - { realmBreakthroughService?: Object }
     * @returns {Object} 处理结果
     */
    processEpiphany(params = {}) {
        if (this.epiphanyState.state !== EPIPHANY_STATES.TRIGGERED) {
            return { success: false, message: '当前没有待处理的顿悟' };
        }
        
        this.epiphanyState.state = EPIPHANY_STATES.PROCESSING;
        
        const typeId = this.epiphanyState.currentEpiphanyType;
        const type = Object.values(EPIPHANY_TYPES).find(t => t.id === typeId);
        
        if (!type) {
            return { success: false, message: '未知的顿悟类型' };
        }
        
        // 计算加速效果
        const boost = type.pipelineBoost;
        const multiplier = type.rewardMultiplier;
        
        // 消耗悟性
        this.epiphanyState.insightPoints = Math.max(0, 
            this.epiphanyState.insightPoints - type.insightThreshold);
        
        // 记录顿悟历史
        this.epiphanyState.epiphanyHistory.push({
            type: typeId,
            name: type.name,
            boost,
            multiplier,
            timestamp: Date.now()
        });
        
        // 重置状态
        this.epiphanyState.state = EPIPHANY_STATES.COMPLETED;
        this.epiphanyState.currentEpiphanyType = null;
        
        return {
            success: true,
            name: type.name,
            pipelineStagesSkipped: boost,
            rewardBonus: (multiplier - 1) * 100 + '%',
            message: `顿悟完成！突破阶段加速x${boost}，奖励翻倍！`
        };
    }

    /**
     * 获取下次顿悟所需悟性
     */
    getInsightNeededForNextEpiphany() {
        const epiphanyTypes = Object.values(EPIPHANY_TYPES);
        const currentInsight = this.epiphanyState.insightPoints;
        
        for (const type of epiphanyTypes) {
            if (currentInsight < type.insightThreshold) {
                return {
                    type: type.name,
                    needed: type.insightThreshold - currentInsight,
                    current: currentInsight
                };
            }
        }
        
        // 全部满足，返回最低的
        return {
            type: epiphanyTypes[0].name,
            needed: 0,
            current: currentInsight
        };
    }

    /**
     * 获取顿悟状态
     */
    getStatus() {
        return {
            state: this.epiphanyState.state,
            insightPoints: this.epiphanyState.insightPoints,
            plateauDays: this.epiphanyState.plateauDays,
            totalEpiphanies: this.epiphanyState.totalEpiphanies,
            currentEpiphany: this.epiphanyState.currentEpiphanyType,
            nextEpiphany: this.getInsightNeededForNextEpiphany(),
            recentInsight: this.epiphanyState.insightHistory.slice(-5)
        };
    }

    /**
     * 重置顿悟状态
     */
    reset() {
        if (this.epiphanyState.state === EPIPHANY_STATES.COMPLETED) {
            this.epiphanyState.state = EPIPHANY_STATES.DORMANT;
        }
    }

    // ========== MCP工具实现 ==========

    /**
     * MCP工具: epiphany.trigger - 触发顿悟
     */
    mcpEpiphanyTrigger(params = {}) {
        // 如果有待处理的顿悟，处理它
        if (this.epiphanyState.state === EPIPHANY_STATES.TRIGGERED) {
            return this.processEpiphany(params);
        }
        
        // 如果已完成，重置并尝试新顿悟
        if (this.epiphanyState.state === EPIPHANY_STATES.COMPLETED) {
            this.reset();
        }
        
        // 尝试触发顿悟
        return this.tryTriggerEpiphany(params);
    }

    /**
     * MCP工具: epiphany.insight - 积累悟性
     */
    mcpEpiphanyInsight(params = {}) {
        const result = this.accumulateInsight(params);
        return {
            success: true,
            ...result,
            nextHint: this.getInsightNeededForNextEpiphany()
        };
    }

    /**
     * MCP工具: epiphany.status - 查询顿悟状态
     */
    mcpEpiphanyStatus() {
        const status = this.getStatus();
        return {
            success: true,
            ...status,
            stateDescription: {
                [EPIPHANY_STATES.DORMANT]: '悟道休眠中',
                [EPIPHANY_STATES.ACCUMULATING]: '悟道积累中',
                [EPIPHANY_STATES.TRIGGERED]: '顿悟已触发！',
                [EPIPHANY_STATES.PROCESSING]: '顿悟处理中',
                [EPIPHANY_STATES.COMPLETED]: '顿悟已完成'
            }[status.state] || '未知',
            hint: status.state === EPIPHANY_STATES.ACCUMULATING 
                ? '继续修炼积累悟性，等待机缘触发顿悟'
                : status.state === EPIPHANY_STATES.TRIGGERED
                    ? '调用 epiphany.trigger 处理顿悟效果'
                    : '调用 epiphany.insight 积累悟性'
        };
    }
}

export { EpiphanyService };