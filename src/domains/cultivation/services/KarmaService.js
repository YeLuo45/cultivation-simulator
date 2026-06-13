/**
 * KarmaService.js - 因果反馈系统
 * V262 方向A迭代4/9: claude-code反馈循环 + nanobot mesh + chatdev角色专业化
 * 
 * 提供MCP工具:
 * - karma.action - 执行善恶行为
 * - karma.status - 查询因果状态
 * - karma.feedback - 获取因果反馈
 */

// ===== 常量定义 =====

/**
 * 因果类型 (claude-code反馈循环)
 */
export const KARMA_TYPES = {
    GOOD: 'good',
    NEUTRAL: 'neutral',
    BAD: 'bad'
};

/**
 * 行为配置
 */
export const KARMA_ACTIONS = {
    // 善行
    HELP_WEAK: { type: 'good', points: 10, label: '帮助弱者' },
    DONATE: { type: 'good', points: 5, label: '施舍灵石' },
    FORGIVE: { type: 'good', points: 8, label: '宽恕他人' },
    MENTOR: { type: 'good', points: 12, label: '指导后辈' },
    SAVE_LIFE: { type: 'good', points: 20, label: '救死扶伤' },
    
    // 恶行
    ROB: { type: 'bad', points: -10, label: '抢劫' },
    BETRAY: { type: 'bad', points: -15, label: '背叛' },
    CURSE: { type: 'bad', points: -8, label: '诅咒' },
    EXPLOIT: { type: 'bad', points: -12, label: '剥削' },
    KILL: { type: 'bad', points: -20, label: '杀生' },
    
    // 中性
    TRADE: { type: 'neutral', points: 1, label: '公平交易' },
    REST: { type: 'neutral', points: 0, label: '休息' },
    STUDY: { type: 'neutral', points: 2, label: '学习' }
};

/**
 * 因果等级 (claude-code反馈等级)
 */
export const KARMA_RANKS = [
    { name: '大恶', threshold: -100, color: '#8B0000', bonus: -0.2 },
    { name: '恶', threshold: -50, color: '#CD5C5C', bonus: -0.1 },
    { name: '小恶', threshold: -20, color: '#F08080', bonus: -0.05 },
    { name: '普通人', threshold: 20, color: '#808080', bonus: 0 },
    { name: '小善', threshold: 50, color: '#90EE90', bonus: 0.05 },
    { name: '善', threshold: 100, color: '#32CD32', bonus: 0.1 },
    { name: '大善', threshold: Infinity, color: '#006400', bonus: 0.2 }
];

/**
 * 因果反馈效果
 */
export const KARMA_FEEDBACK = {
    // 灵气修炼反馈
    cultivationSpeed: { good: 1.2, neutral: 1.0, bad: 0.8 },
    // 奇遇概率反馈
    serendipityChance: { good: 1.3, neutral: 1.0, bad: 0.7 },
    // 境界突破反馈
    breakthroughBonus: { good: 0.1, neutral: 0, bad: -0.1 },
    // 敌人出现概率
    enemyAppearChance: { good: 0.5, neutral: 1.0, bad: 2.0 },
    // 贵人相助概率
    benefactorChance: { good: 1.5, neutral: 1.0, bad: 0.3 }
};

/**
 * 因果配置
 */
export const KARMA_CONFIG = {
    maxKarma: 200,
    minKarma: -200,
    historyMaxSize: 50,
    feedbackUpdateInterval: 1000
};

// ===== 服务类 =====

class KarmaService {
    constructor(gameState) {
        this.gameState = gameState;
        this.karmaState = null;
    }

    /**
     * 初始化因果系统
     */
    init(gameState) {
        if (!gameState.karma) {
            gameState.karma = {
                totalKarma: 0,
                goodDeeds: 0,
                badDeeds: 0,
                karmaRank: '普通人',
                lastActionTime: null,
                feedbackMultiplier: 1.0,
                history: [],
                cumulativeEffects: {
                    serendipityBonus: 0,
                    cultivationBonus: 0,
                    enemyEncounters: 0,
                    benefactorHelps: 0
                }
            };
        }
        this.karmaState = gameState.karma;
        return gameState;
    }

    /**
     * 执行因果行为 (claude-code反馈循环)
     * @param {Object} params - { actionId: string, target?: string }
     * @returns {Object} 行为结果
     */
    executeAction(params = {}) {
        const { actionId, target } = params;
        
        // 获取行为配置
        const actionConfig = KARMA_ACTIONS[actionId];
        if (!actionConfig) {
            return { success: false, message: `未知行为: ${actionId}` };
        }
        
        // 计算因果值变化
        const karmaChange = actionConfig.points;
        const oldRank = this.getRank(this.karmaState.totalKarma);
        
        this.karmaState.totalKarma = Math.max(
            KARMA_CONFIG.minKarma,
            Math.min(KARMA_CONFIG.maxKarma, this.karmaState.totalKarma + karmaChange)
        );
        
        // 更新统计
        if (actionConfig.type === 'good') {
            this.karmaState.goodDeeds++;
        } else if (actionConfig.type === 'bad') {
            this.karmaState.badDeeds++;
        }
        
        // 更新等级
        const newRank = this.getRank(this.karmaState.totalKarma);
        this.karmaState.karmaRank = newRank.name;
        
        // 记录历史
        this.karmaState.history.push({
            actionId,
            actionLabel: actionConfig.label,
            type: actionConfig.type,
            points: karmaChange,
            totalKarma: this.karmaState.totalKarma,
            rank: newRank.name,
            timestamp: Date.now()
        });
        
        // 保持历史记录不超过最大数量
        if (this.karmaState.history.length > KARMA_CONFIG.historyMaxSize) {
            this.karmaState.history.shift();
        }
        
        this.karmaState.lastActionTime = Date.now();
        
        // 计算反馈效果 (claude-code反馈循环)
        this.updateFeedback();
        
        // 返回结果
        return {
            success: true,
            action: actionConfig.label,
            type: actionConfig.type,
            karmaChange,
            totalKarma: this.karmaState.totalKarma,
            rank: newRank,
            rankChanged: oldRank.name !== newRank.name,
            feedback: this.getFeedbackSummary()
        };
    }

    /**
     * 获取因果等级
     */
    getRank(karma) {
        for (const rank of KARMA_RANKS) {
            if (karma < rank.threshold) {
                return rank;
            }
        }
        return KARMA_RANKS[KARMA_RANKS.length - 1];
    }

    /**
     * 更新因果反馈效果 (claude-code反馈循环机制)
     */
    updateFeedback() {
        const rank = this.getRank(this.karmaState.totalKarma);
        const feedbackType = this.getFeedbackType();
        
        this.karmaState.feedbackMultiplier = 1 + rank.bonus;
        
        // 更新累计效果
        const karmaVal = this.karmaState.totalKarma;
        
        // 奇遇加成 (基于善恶度)
        this.karmaState.cumulativeEffects.serendipityBonus = 
            (KARMA_FEEDBACK.serendipityChance[feedbackType] - 1) * 100;
        
        // 修炼加成
        this.karmaState.cumulativeEffects.cultivationBonus = 
            (KARMA_FEEDBACK.cultivationSpeed[feedbackType] - 1) * 100;
        
        // 敌人遭遇
        this.karmaState.cumulativeEffects.enemyEncounters = 
            Math.floor(KARMA_FEEDBACK.enemyAppearChance[feedbackType] * 10) / 10;
        
        // 贵人相助
        this.karmaState.cumulativeEffects.benefactorHelps = 
            Math.floor(KARMA_FEEDBACK.benefactorChance[feedbackType] * 10) / 10;
    }

    /**
     * 获取反馈类型
     */
    getFeedbackType() {
        if (this.karmaState.totalKarma > 20) return 'good';
        if (this.karmaState.totalKarma < -20) return 'bad';
        return 'neutral';
    }

    /**
     * 获取反馈摘要
     */
    getFeedbackSummary() {
        const type = this.getFeedbackType();
        const effects = this.karmaState.cumulativeEffects;
        
        return {
            type,
            cultivationSpeed: (KARMA_FEEDBACK.cultivationSpeed[type] * 100).toFixed(0) + '%',
            serendipityChance: (KARMA_FEEDBACK.serendipityChance[type] * 100).toFixed(0) + '%',
            breakthroughBonus: KARMA_FEEDBACK.breakthroughBonus[type] > 0 
                ? '+' + (KARMA_FEEDBACK.breakthroughBonus[type] * 100).toFixed(0) + '%'
                : (KARMA_FEEDBACK.breakthroughBonus[type] * 100).toFixed(0) + '%',
            enemyAppearRate: (KARMA_FEEDBACK.enemyAppearChance[type] * 100).toFixed(0) + '%',
            benefactorChance: (KARMA_FEEDBACK.benefactorChance[type] * 100).toFixed(0) + '%'
        };
    }

    /**
     * 获取因果状态
     */
    getStatus() {
        const type = this.getFeedbackType();
        return {
            totalKarma: this.karmaState.totalKarma,
            rank: this.karmaState.karmaRank,
            goodDeeds: this.karmaState.goodDeeds,
            badDeeds: this.karmaState.badDeeds,
            feedbackType: type,
            feedbackMultiplier: this.karmaState.feedbackMultiplier,
            cumulativeEffects: { ...this.karmaState.cumulativeEffects },
            recentActions: this.karmaState.history.slice(-5)
        };
    }

    /**
     * 获取因果历史
     */
    getHistory(limit = 10) {
        return this.karmaState.history.slice(-limit);
    }

    /**
     * 获取因果对修炼的影响 (用于其他系统调用)
     */
    getCultivationModifier() {
        return KARMA_FEEDBACK.cultivationSpeed[this.getFeedbackType()];
    }

    /**
     * 获取因果对奇遇的影响
     */
    getSerendipityModifier() {
        return KARMA_FEEDBACK.serendipityChance[this.getFeedbackType()];
    }

    // ========== MCP工具实现 ==========

    /**
     * MCP工具: karma.action - 执行善恶行为
     */
    mcpKarmaAction(params = {}) {
        return this.executeAction(params);
    }

    /**
     * MCP工具: karma.status - 查询因果状态
     */
    mcpKarmaStatus() {
        const status = this.getStatus();
        const rank = this.getRank(status.totalKarma);
        
        return {
            success: true,
            ...status,
            rankInfo: {
                name: rank.name,
                color: rank.color,
                threshold: rank.threshold === Infinity ? 'MAX' : rank.threshold
            },
            feedback: this.getFeedbackSummary(),
            hint: status.feedbackType === 'good' 
                ? '善有善报，修炼速度+20%，奇遇概率+30%'
                : status.feedbackType === 'bad'
                    ? '恶有恶报，修炼速度-20%，敌人出现概率+100%'
                    : '普通状态，无额外加成'
        };
    }

    /**
     * MCP工具: karma.feedback - 获取因果反馈
     */
    mcpKarmaFeedback() {
        return {
            success: true,
            currentKarma: this.karmaState.totalKarma,
            feedback: this.getFeedbackSummary(),
            effects: {
                cultivationSpeedBonus: (this.getCultivationModifier() - 1) * 100,
                serendipityBonus: (this.getSerendipityModifier() - 1) * 100,
                enemyMultiplier: KARMA_FEEDBACK.enemyAppearChance[this.getFeedbackType()],
                benefactorMultiplier: KARMA_FEEDBACK.benefactorChance[this.getFeedbackType()]
            },
            advice: this.getFeedbackType() === 'good' 
                ? '继续保持善行，将获得更多机缘'
                : this.getFeedbackType() === 'bad'
                    ? '多行善事可化解恶缘，提升修炼效率'
                    : '行善可提升修为，作恶将招致恶果'
        };
    }
}

export { KarmaService };