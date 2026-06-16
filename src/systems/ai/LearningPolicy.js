/**
 * LearningPolicy.js - Adaptive Learning Policy Engine
 * V281 Iteration 5/9 - Self-Evolution Trigger & Learning Policy
 * 
 * 核心机制：
 * 1. 根据 NPC 表现动态调整学习参数
 * 2. 支持多种策略模式：EXPLORATIVE, CONSERVATIVE, AGGRESSIVE, BALANCED
 * 3. 基于反馈自动更新策略
 */

import { ExperienceTracker } from './ExperienceTracker.js';
import { IEREngine } from './IEREngine.js';
import { SkillCrystallization } from './SkillCrystallization.js';

/**
 * PolicyConfig - 策略配置
 */
class PolicyConfig {
    constructor(mode, params = {}) {
        this.mode = mode;
        this.learningRate = params.learningRate ?? 0.1;
        this.explorationRate = params.explorationRate ?? 0.2;
        this.adaptationRate = params.adaptationRate ?? 0.15;
        this.confidenceThreshold = params.confidenceThreshold ?? 0.6;
        this.maxRetries = params.maxRetries ?? 3;
        this.successWeight = params.successWeight ?? 0.4;
        this.failureWeight = params.failureWeight ?? 0.6;
    }

    toJSON() {
        return {
            mode: this.mode,
            learningRate: this.learningRate,
            explorationRate: this.explorationRate,
            adaptationRate: this.adaptationRate,
            confidenceThreshold: this.confidenceThreshold,
            maxRetries: this.maxRetries,
            successWeight: this.successWeight,
            failureWeight: this.failureWeight
        };
    }
}

/**
 * FeedbackEntry - 反馈条目
 */
class FeedbackEntry {
    constructor(npcId, type, value, context = {}) {
        this.id = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.npcId = npcId;
        this.type = type; // 'success', 'failure', 'plateau', 'breakthrough'
        this.value = value; // 0-1 score
        this.context = context;
        this.createdAt = Date.now();
    }

    toJSON() {
        return {
            id: this.id,
            npcId: this.npcId,
            type: this.type,
            value: this.value,
            context: this.context,
            createdAt: this.createdAt
        };
    }
}

/**
 * LearningPolicy - 自适应学习策略引擎
 * 
 * 根据 NPC 表现动态调整学习参数，支持多种策略模式
 */
export class LearningPolicy {
    /**
     * 预定义策略模式
     */
    static MODES = {
        /** 探索型：高探索率，尝试新方法 */
        EXPLORATIVE: 'EXPLORATIVE',
        
        /** 保守型：低探索率，稳定现有行为 */
        CONSERVATIVE: 'CONSERVATIVE',
        
        /** 激进型：快速适应，高学习率 */
        AGGRESSIVE: 'AGGRESSIVE',
        
        /** 平衡型：平衡探索和 exploitation */
        BALANCED: 'BALANCED'
    };

    /**
     * 内置策略配置模板
     */
    static MODE_CONFIGS = {
        'EXPLORATIVE': new PolicyConfig('EXPLORATIVE', {
            learningRate: 0.15,
            explorationRate: 0.4,
            adaptationRate: 0.2,
            confidenceThreshold: 0.4,
            maxRetries: 5,
            successWeight: 0.3,
            failureWeight: 0.7
        }),
        
        'CONSERVATIVE': new PolicyConfig('CONSERVATIVE', {
            learningRate: 0.05,
            explorationRate: 0.1,
            adaptationRate: 0.05,
            confidenceThreshold: 0.8,
            maxRetries: 2,
            successWeight: 0.6,
            failureWeight: 0.4
        }),
        
        'AGGRESSIVE': new PolicyConfig('AGGRESSIVE', {
            learningRate: 0.25,
            explorationRate: 0.3,
            adaptationRate: 0.3,
            confidenceThreshold: 0.5,
            maxRetries: 5,
            successWeight: 0.2,
            failureWeight: 0.8
        }),
        
        'BALANCED': new PolicyConfig('BALANCED', {
            learningRate: 0.1,
            explorationRate: 0.2,
            adaptationRate: 0.15,
            confidenceThreshold: 0.6,
            maxRetries: 3,
            successWeight: 0.4,
            failureWeight: 0.6
        })
    };

    /**
     * @param {Object} baseConfig - 基础配置 { mode, experienceTracker, ierEngine, skillCrystallization }
     */
    constructor(baseConfig = {}) {
        /** @type {Map<string, PolicyConfig>} */
        this.policies = new Map(); // npcId -> policy
        
        /** @type {Map<string, FeedbackEntry[]>} */
        this.feedbackHistory = new Map(); // npcId -> feedback[]
        
        this.baseConfig = baseConfig;
        
        /** @type {ExperienceTracker|null} */
        this.experienceTracker = baseConfig.experienceTracker || null;
        
        /** @type {IEREngine|null} */
        this.ierEngine = baseConfig.ierEngine || null;
        
        /** @type {SkillCrystallization|null} */
        this.skillCrystallization = baseConfig.skillCrystallization || null;
        
        /** 默认策略模式 */
        this.defaultMode = baseConfig.mode || LearningPolicy.MODES.BALANCED;
    }

    /**
     * 获取NPC的当前策略配置
     * @param {string} npcId - NPC ID
     * @returns {Object} 策略配置对象
     */
    getPolicy(npcId) {
        if (!this.policies.has(npcId)) {
            // 使用默认模式创建策略
            const defaultPolicy = LearningPolicy.MODE_CONFIGS[this.defaultMode] || 
                new PolicyConfig(this.defaultMode);
            this.policies.set(npcId, defaultPolicy);
        }
        
        return this.policies.get(npcId).toJSON();
    }

    /**
     * 获取NPC的策略模式
     * @param {string} npcId - NPC ID
     * @returns {string} 策略模式
     */
    getPolicyMode(npcId) {
        const policy = this.policies.get(npcId);
        return policy ? policy.mode : this.defaultMode;
    }

    /**
     * 设置NPC的策略模式
     * @param {string} npcId - NPC ID
     * @param {string} mode - 策略模式
     * @returns {Object} 设置结果
     */
    setPolicyMode(npcId, mode) {
        const template = LearningPolicy.MODE_CONFIGS[mode];
        if (!template) {
            return { 
                success: false, 
                reason: `Invalid mode: ${mode}. Available: ${Object.keys(LearningPolicy.MODES).join(', ')}` 
            };
        }
        
        this.policies.set(npcId, new PolicyConfig(mode, template.toJSON()));
        
        return { success: true, mode, policy: this.getPolicy(npcId) };
    }

    /**
     * 更新策略（基于进化反馈）
     * @param {string} npcId - NPC ID
     * @param {Object} feedback - 反馈对象 { type, value, context }
     * @returns {Object} 更新结果
     */
    updatePolicy(npcId, feedback) {
        // 记录反馈
        const entry = new FeedbackEntry(npcId, feedback.type, feedback.value, feedback.context);
        this._addFeedback(npcId, entry);
        
        // 获取或创建当前策略
        if (!this.policies.has(npcId)) {
            this.policies.set(npcId, LearningPolicy.MODE_CONFIGS[this.defaultMode] || 
                new PolicyConfig(this.defaultMode));
        }
        
        const policy = this.policies.get(npcId);
        const updates = {};
        
        // 基于反馈类型调整策略
        switch (feedback.type) {
            case 'success':
                this._adjustOnSuccess(policy, feedback, updates);
                break;
                
            case 'failure':
                this._adjustOnFailure(policy, feedback, updates);
                break;
                
            case 'plateau':
                this._adjustOnPlateau(policy, feedback, updates);
                break;
                
            case 'breakthrough':
                this._adjustOnBreakthrough(policy, feedback, updates);
                break;
                
            default:
                return { success: false, reason: `Unknown feedback type: ${feedback.type}` };
        }
        
        // 应用更新到策略
        Object.entries(updates).forEach(([key, value]) => {
            if (policy.hasOwnProperty(key)) {
                policy[key] = value;
            }
        });
        
        return {
            success: true,
            feedbackId: entry.id,
            updates: Object.keys(updates),
            newPolicy: policy.toJSON()
        };
    }

    /**
     * 成功反馈处理
     * @private
     */
    _adjustOnSuccess(policy, feedback, updates) {
        // 成功时降低探索率，增加置信度阈值
        const explorationDecay = 0.05;
        const confidenceBoost = 0.05;
        
        if (policy.explorationRate > 0.1) {
            updates.explorationRate = Math.max(0.05, policy.explorationRate - explorationDecay);
        }
        
        if (policy.confidenceThreshold < 0.9) {
            updates.confidenceThreshold = Math.min(0.95, policy.confidenceThreshold + confidenceBoost);
        }
        
        // 成功反馈增加成功率权重
        if (policy.successWeight < 0.8) {
            updates.successWeight = Math.min(0.8, policy.successWeight + 0.05);
            updates.failureWeight = Math.max(0.2, policy.failureWeight - 0.05);
        }
    }

    /**
     * 失败反馈处理
     * @private
     */
    _adjustOnFailure(policy, feedback, updates) {
        // 失败时增加探索率，降低置信度阈值
        const explorationBoost = 0.1;
        const confidenceDrop = 0.1;
        
        if (policy.explorationRate < 0.6) {
            updates.explorationRate = Math.min(0.7, policy.explorationRate + explorationBoost);
        }
        
        if (policy.confidenceThreshold > 0.3) {
            updates.confidenceThreshold = Math.max(0.2, policy.confidenceThreshold - confidenceDrop);
        }
        
        // 失败反馈增加失败权重
        if (policy.failureWeight < 0.8) {
            updates.failureWeight = Math.min(0.8, policy.failureWeight + 0.1);
            updates.successWeight = Math.max(0.2, policy.successWeight - 0.1);
        }
        
        // 增加学习率以加速适应
        if (policy.learningRate < 0.3) {
            updates.learningRate = Math.min(0.35, policy.learningRate + 0.05);
        }
    }

    /**
     * Plateau反馈处理
     * @private
     */
    _adjustOnPlateau(policy, feedback, updates) {
        // Plateau时中等探索率调整
        const explorationBoost = 0.15;
        const learningRateBoost = 0.05;
        
        if (policy.explorationRate < 0.5) {
            updates.explorationRate = Math.min(0.6, policy.explorationRate + explorationBoost);
        }
        
        if (policy.learningRate < 0.25) {
            updates.learningRate = Math.min(0.3, policy.learningRate + learningRateBoost);
        }
        
        // 降低置信度阈值以接受更多变化
        if (policy.confidenceThreshold > 0.4) {
            updates.confidenceThreshold = Math.max(0.3, policy.confidenceThreshold - 0.1);
        }
    }

    /**
     * Breakthrough反馈处理
     * @private
     */
    _adjustOnBreakthrough(policy, feedback, updates) {
        // Breakthrough时大幅增加学习率和探索率
        const explorationBoost = 0.2;
        const learningRateBoost = 0.1;
        
        if (policy.explorationRate < 0.7) {
            updates.explorationRate = Math.min(0.8, policy.explorationRate + explorationBoost);
        }
        
        if (policy.learningRate < 0.35) {
            updates.learningRate = Math.min(0.4, policy.learningRate + learningRateBoost);
        }
        
        // 提高成功权重
        if (policy.successWeight < 0.7) {
            updates.successWeight = Math.min(0.7, policy.successWeight + 0.15);
            updates.failureWeight = Math.max(0.3, policy.failureWeight - 0.15);
        }
    }

    /**
     * 添加反馈记录
     * @private
     */
    _addFeedback(npcId, entry) {
        if (!this.feedbackHistory.has(npcId)) {
            this.feedbackHistory.set(npcId, []);
        }
        
        const history = this.feedbackHistory.get(npcId);
        history.push(entry);
        
        // 保持最近100条反馈
        if (history.length > 100) {
            this.feedbackHistory.set(npcId, history.slice(-100));
        }
    }

    /**
     * 重置策略
     * @param {string} npcId - NPC ID
     * @param {string} mode - 可选的新的策略模式
     * @returns {Object} 重置结果
     */
    resetPolicy(npcId, mode = null) {
        const targetMode = mode || this.defaultMode;
        const template = LearningPolicy.MODE_CONFIGS[targetMode] || 
            new PolicyConfig(targetMode);
        
        this.policies.set(npcId, new PolicyConfig(targetMode, template.toJSON()));
        
        return { 
            success: true, 
            mode: targetMode,
            policy: this.getPolicy(npcId)
        };
    }

    /**
     * 获取NPC的反馈历史
     * @param {string} npcId - NPC ID
     * @param {number} limit - 返回最近N条记录
     * @returns {Object[]} 反馈数组
     */
    getFeedbackHistory(npcId, limit = 20) {
        const history = this.feedbackHistory.get(npcId) || [];
        return history.slice(-limit).map(f => f.toJSON());
    }

    /**
     * 基于ExperienceTracker stats自动生成反馈
     * @param {string} npcId - NPC ID
     * @returns {Object|null} 自动生成的反馈或null
     */
    generateAutoFeedback(npcId) {
        if (!this.experienceTracker) {
            return null;
        }
        
        const stats = this.experienceTracker.getStats(npcId);
        if (stats.totalInteractions < 10) {
            return null;
        }
        
        // 分析最近20条记录
        const recentRecords = this.experienceTracker.getRecentRecords(npcId, 20);
        const olderRecords = this.experienceTracker.getRecentRecords(npcId, 40).slice(0, 20);
        
        if (recentRecords.length < 10 || olderRecords.length === 0) {
            return null;
        }
        
        const recentSuccessRate = recentRecords.filter(r => r.outcome.success).length / recentRecords.length;
        const olderSuccessRate = olderRecords.filter(r => r.outcome.success).length / olderRecords.length;
        
        const diff = recentSuccessRate - olderSuccessRate;
        
        if (diff > 0.15) {
            return { type: 'breakthrough', value: diff, context: { recentSuccessRate, olderSuccessRate } };
        } else if (diff < -0.15) {
            return { type: 'failure', value: Math.abs(diff), context: { recentSuccessRate, olderSuccessRate } };
        } else if (Math.abs(diff) < 0.03) {
            return { type: 'plateau', value: 0.5, context: { recentSuccessRate, olderSuccessRate } };
        } else if (diff > 0) {
            return { type: 'success', value: diff, context: { recentSuccessRate, olderSuccessRate } };
        } else {
            return { type: 'failure', value: Math.abs(diff), context: { recentSuccessRate, olderSuccessRate } };
        }
    }

    /**
     * 建议策略切换
     * @param {string} npcId - NPC ID
     * @returns {Object} 建议结果 { suggested: boolean, mode, reason }
     */
    suggestModeChange(npcId) {
        if (!this.experienceTracker) {
            return { suggested: false, reason: 'No experience tracker available' };
        }
        
        const stats = this.experienceTracker.getStats(npcId);
        const currentMode = this.getPolicyMode(npcId);
        
        // 基于统计数据建议模式切换
        if (stats.successRate < 0.3 && currentMode !== LearningPolicy.MODES.AGGRESSIVE) {
            return { 
                suggested: true, 
                mode: LearningPolicy.MODES.AGGRESSIVE, 
                reason: 'Low success rate suggests aggressive learning' 
            };
        }
        
        if (stats.successRate > 0.7 && stats.avgSatisfaction > 0.7 && 
            currentMode !== LearningPolicy.MODES.CONSERVATIVE) {
            return { 
                suggested: true, 
                mode: LearningPolicy.MODES.CONSERVATIVE, 
                reason: 'High success rate suggests conservative approach' 
            };
        }
        
        if (stats.avgSatisfaction < 0.4 && currentMode !== LearningPolicy.MODES.EXPLORATIVE) {
            return { 
                suggested: true, 
                mode: LearningPolicy.MODES.EXPLORATIVE, 
                reason: 'Low satisfaction suggests explorative approach' 
            };
        }
        
        return { suggested: false, reason: 'Current mode is appropriate' };
    }

    /**
     * 获取所有NPC的策略摘要
     * @returns {Object[]} 策略摘要数组
     */
    getAllPoliciesSummary() {
        const summaries = [];
        
        this.policies.forEach((policy, npcId) => {
            summaries.push({
                npcId,
                mode: policy.mode,
                policy: policy.toJSON(),
                feedbackCount: (this.feedbackHistory.get(npcId) || []).length
            });
        });
        
        return summaries;
    }

    /**
     * 清除指定NPC的策略数据
     * @param {string} npcId - NPC ID
     * @returns {Object} 清除结果
     */
    clearPolicy(npcId) {
        const hadPolicy = this.policies.has(npcId);
        const hadFeedback = this.feedbackHistory.has(npcId);
        
        this.policies.delete(npcId);
        this.feedbackHistory.delete(npcId);
        
        return {
            success: true,
            cleared: {
                policy: hadPolicy,
                feedback: hadFeedback
            }
        };
    }

    /**
     * 获取所有可用的策略模式
     * @returns {string[]} 模式数组
     */
    getAvailableModes() {
        return Object.values(LearningPolicy.MODES);
    }

    /**
     * 批量应用建议的策略切换
     * @param {string[]} npcIds - NPC ID数组
     * @returns {Object} 应用结果
     */
    batchApplySuggestions(npcIds) {
        const results = [];
        
        for (const npcId of npcIds) {
            const suggestion = this.suggestModeChange(npcId);
            if (suggestion.suggested) {
                const result = this.setPolicyMode(npcId, suggestion.mode);
                results.push({ npcId, ...result, reason: suggestion.reason });
            }
        }
        
        return {
            success: true,
            applied: results.length,
            results
        };
    }
}

export default LearningPolicy;