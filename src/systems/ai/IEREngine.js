/**
 * IEREngine.js - Iterative Experience Refinement Engine
 * V280 Iteration 4/9 - IER Experience Refinement Engine
 * 
 * 核心机制：
 * 1. Evaluate: 每次交互后检查 outcome(success/failure)
 * 2. Reflect: 若失败，分析失败原因，更新 behavior pattern
 * 3. Improve: 若连续失败，触发 SkillCrystallization 重构
 */

import { ExperienceTracker } from './ExperienceTracker.js';
import { SkillCrystallization } from './SkillCrystallization.js';

/**
 * RefinementRecord - 优化记录
 */
class RefinementRecord {
    constructor(npcId, interaction, evaluation, reflection, improvement) {
        this.id = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.npcId = npcId;
        this.interaction = interaction;
        this.evaluation = evaluation; // { outcome, success, reason }
        this.reflection = reflection; // { failedReasons, patternUpdate, analyzedAt }
        this.improvement = improvement; // { triggered, strategy, skillCrystallized, improvedAt }
        this.createdAt = Date.now();
    }

    toJSON() {
        return {
            id: this.id,
            npcId: this.npcId,
            interaction: this.interaction,
            evaluation: this.evaluation,
            reflection: this.reflection,
            improvement: this.improvement,
            createdAt: this.createdAt
        };
    }
}

/**
 * Strategy - 优化策略
 */
class Strategy {
    constructor(id, type, pattern, confidence = 0.5) {
        this.id = id;
        this.type = type; // 'avoid', 'prefer', 'new_approach'
        this.pattern = pattern;
        this.confidence = confidence;
        this.useCount = 0;
        this.lastUsed = null;
        this.createdAt = Date.now();
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            pattern: this.pattern,
            confidence: this.confidence,
            useCount: this.useCount,
            lastUsed: this.lastUsed,
            createdAt: this.createdAt
        };
    }
}

/**
 * IEREngine - 迭代经验优化引擎
 * 
 * 核心IE循环：
 * - Evaluate: 检查交互结果
 * - Reflect: 分析失败原因，更新行为模式
 * - Improve: 触发技能重构或策略更新
 */
export class IEREngine {
    /**
     * @param {ExperienceTracker} experienceTracker - 经验追踪器
     * @param {SkillCrystallization} skillCrystallization - 技能结晶化系统
     */
    constructor(experienceTracker, skillCrystallization) {
        this.experienceTracker = experienceTracker;
        this.skillCrystallization = skillCrystallization;
        this.refinementHistory = new Map(); // npcId -> RefinementRecord[]
        this.strategies = new Map(); // npcId -> Strategy[]
        this.consecutiveFailures = new Map(); // npcId -> failure count
        this.maxConsecutiveFailures = 3; // 连续失败阈值，触发重构
    }

    /**
     * 执行IE优化循环
     * @param {string} npcId - NPC ID
     * @param {Object} interactionRecord - 交互记录 {type, playerAction, npcResponse, outcome}
     * @returns {Object} { refined: boolean, reason: string, newStrategy: object }
     */
    async refine(npcId, interactionRecord) {
        // 1. Evaluate: 检查 outcome
        const evaluation = this._evaluate(interactionRecord);
        
        // 2. Reflect: 若失败，分析失败原因，更新 behavior pattern
        const reflection = this._reflect(npcId, interactionRecord, evaluation);
        
        // 3. Improve: 若连续失败，触发 SkillCrystallization 重构
        const improvement = this._improve(npcId, interactionRecord, evaluation, reflection);
        
        // 记录优化历史
        const record = new RefinementRecord(npcId, interactionRecord, evaluation, reflection, improvement);
        this._addRefinementRecord(npcId, record);
        
        return {
            refined: improvement.triggered,
            reason: this._buildReason(evaluation, reflection, improvement),
            newStrategy: improvement.strategy ? improvement.strategy.toJSON() : null
        };
    }

    /**
     * 评估交互结果
     * @private
     */
    _evaluate(interactionRecord) {
        const outcome = interactionRecord.outcome || {};
        const success = outcome.success ?? false;
        
        let reason = 'unknown';
        if (success) {
            reason = 'interaction_successful';
        } else {
            // 分析失败原因
            const satisfaction = outcome.satisfaction ?? 0;
            if (satisfaction < 0.3) {
                reason = 'low_satisfaction';
            } else if (satisfaction < 0.5) {
                reason = 'partial_failure';
            } else {
                reason = 'interaction_failed';
            }
        }
        
        return {
            outcome,
            success,
            reason,
            evaluatedAt: Date.now()
        };
    }

    /**
     * 反思失败原因
     * @private
     */
    _reflect(npcId, interactionRecord, evaluation) {
        const failedReasons = [];
        const patternUpdate = null;
        
        if (!evaluation.success) {
            // 分析失败原因
            const satisfaction = evaluation.outcome.satisfaction ?? 0;
            
            if (satisfaction < 0.3) {
                failedReasons.push('very_low_satisfaction');
            }
            if (satisfaction < 0.5) {
                failedReasons.push('below_average_satisfaction');
            }
            
            // 检查是否是新的失败模式
            failedReasons.push('pattern_mismatch');
            
            // 更新连续失败计数
            const currentCount = this.consecutiveFailures.get(npcId) || 0;
            this.consecutiveFailures.set(npcId, currentCount + 1);
        } else {
            // 成功则重置连续失败计数
            this.consecutiveFailures.set(npcId, 0);
        }
        
        return {
            failedReasons,
            patternUpdate,
            analyzedAt: Date.now()
        };
    }

    /**
     * 改进策略
     * @private
     */
    _improve(npcId, interactionRecord, evaluation, reflection) {
        let triggered = false;
        let strategy = null;
        let skillCrystallized = false;
        
        const consecutiveFailures = this.consecutiveFailures.get(npcId) || 0;
        
        // 检查是否需要触发改进
        if (!evaluation.success && consecutiveFailures >= this.maxConsecutiveFailures) {
            triggered = true;
            
            // 触发技能结晶化重构
            if (this.skillCrystallization) {
                const recentRecords = this.experienceTracker.getRecentRecords(npcId, 20);
                const pattern = this.skillCrystallization.detectPattern(recentRecords);
                
                if (pattern) {
                    const result = this.skillCrystallization.crystallize(npcId, pattern);
                    skillCrystallized = result.success;
                }
            }
            
            // 创建新的优化策略
            const strategyId = `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            strategy = new Strategy(
                strategyId,
                'new_approach',
                {
                    type: interactionRecord.type,
                    playerAction: interactionRecord.playerAction,
                    npcResponse: interactionRecord.npcResponse
                },
                0.5
            );
            
            if (!this.strategies.has(npcId)) {
                this.strategies.set(npcId, []);
            }
            this.strategies.get(npcId).push(strategy);
        }
        
        return {
            triggered,
            strategy,
            skillCrystallized,
            improvedAt: Date.now()
        };
    }

    /**
     * 添加优化记录
     * @private
     */
    _addRefinementRecord(npcId, record) {
        if (!this.refinementHistory.has(npcId)) {
            this.refinementHistory.set(npcId, []);
        }
        this.refinementHistory.get(npcId).push(record);
    }

    /**
     * 构建原因字符串
     * @private
     */
    _buildReason(evaluation, reflection, improvement) {
        if (evaluation.success) {
            return 'interaction_successful_no_refinement_needed';
        }
        
        if (improvement.triggered) {
            return 'consecutive_failures_triggered_refinement';
        }
        
        if (reflection.failedReasons.length > 0) {
            return `analysis_needed: ${reflection.failedReasons.join(', ')}`;
        }
        
        return 'no_immediate_improvement';
    }

    /**
     * 获取NPC的优化历史
     * @param {string} npcId - NPC ID
     * @returns {Object[]} 优化记录数组
     */
    getRefinementHistory(npcId) {
        const records = this.refinementHistory.get(npcId) || [];
        return records.map(r => r.toJSON());
    }

    /**
     * 获取NPC的优化建议
     * @param {string} npcId - NPC ID
     * @returns {Object[]} 建议数组
     */
    getSuggestions(npcId) {
        const suggestions = [];
        
        // 基于优化历史生成建议
        const records = this.refinementHistory.get(npcId) || [];
        const failedRecords = records.filter(r => !r.evaluation.success);
        
        if (failedRecords.length > 0) {
            // 分析失败模式
            const patternCounts = {};
            failedRecords.forEach(r => {
                const key = r.interaction.type || 'unknown';
                patternCounts[key] = (patternCounts[key] || 0) + 1;
            });
            
            // 生成建议
            Object.entries(patternCounts).forEach(([type, count]) => {
                suggestions.push({
                    type: 'behavior_adjustment',
                    targetType: type,
                    reason: `${count} failed interactions of type ${type}`,
                    priority: count > 2 ? 'high' : 'medium'
                });
            });
        }
        
        // 基于策略生成建议
        const strategies = this.strategies.get(npcId) || [];
        strategies.forEach(strategy => {
            if (strategy.useCount === 0) {
                suggestions.push({
                    type: 'strategy_unused',
                    strategyId: strategy.id,
                    reason: 'New strategy has not been applied yet',
                    priority: 'low'
                });
            }
        });
        
        return suggestions;
    }

    /**
     * 获取连续失败计数
     * @param {string} npcId - NPC ID
     * @returns {number} 连续失败次数
     */
    getConsecutiveFailures(npcId) {
        return this.consecutiveFailures.get(npcId) || 0;
    }

    /**
     * 重置连续失败计数
     * @param {string} npcId - NPC ID
     */
    resetConsecutiveFailures(npcId) {
        this.consecutiveFailures.set(npcId, 0);
    }

    /**
     * 应用策略
     * @param {string} npcId - NPC ID
     * @param {string} strategyId - 策略 ID
     * @returns {Object} 应用结果
     */
    applyStrategy(npcId, strategyId) {
        const strategies = this.strategies.get(npcId) || [];
        const strategy = strategies.find(s => s.id === strategyId);
        
        if (!strategy) {
            return { success: false, reason: 'Strategy not found' };
        }
        
        strategy.useCount++;
        strategy.lastUsed = Date.now();
        
        return {
            success: true,
            strategy: strategy.toJSON()
        };
    }

    /**
     * 获取NPC的所有策略
     * @param {string} npcId - NPC ID
     * @returns {Object[]} 策略数组
     */
    getStrategies(npcId) {
        const strategies = this.strategies.get(npcId) || [];
        return strategies.map(s => s.toJSON());
    }

    /**
     * 清除指定NPC的所有优化数据
     * @param {string} npcId - NPC ID
     * @returns {Object} 清除结果
     */
    clear(npcId) {
        const results = {
            refinementHistory: false,
            strategies: false,
            consecutiveFailures: false
        };
        
        if (this.refinementHistory.has(npcId)) {
            this.refinementHistory.delete(npcId);
            results.refinementHistory = true;
        }
        
        if (this.strategies.has(npcId)) {
            this.strategies.delete(npcId);
            results.strategies = true;
        }
        
        if (this.consecutiveFailures.has(npcId)) {
            this.consecutiveFailures.delete(npcId);
            results.consecutiveFailures = true;
        }
        
        return {
            success: true,
            cleared: results
        };
    }
}

export default IEREngine;