/**
 * EvolutionTrigger.js - NPC Self-Evolution Auto Trigger
 * V281 Iteration 5/9 - Self-Evolution Trigger & Learning Policy
 * 
 * 核心机制：
 * 1. 注册触发条件 (HIGH_FAILURE_RATE, LEARNING_PLATEAU, SKILL_MATURE, etc.)
 * 2. 检查并触发进化事件
 * 3. 自动调用 IEREngine 和 SkillCrystallization
 */

import { ExperienceTracker } from './ExperienceTracker.js';
import { IEREngine } from './IEREngine.js';
import { SkillCrystallization } from './SkillCrystallization.js';

/**
 * TriggerCondition - 触发条件接口
 */
class TriggerCondition {
    constructor(id, name, evaluator) {
        this.id = id;
        this.name = name;
        this.evaluator = evaluator; // (experienceTracker, ierEngine, skillCrystallization, npcId) => boolean
    }

    evaluate(experienceTracker, ierEngine, skillCrystallization, npcId) {
        return this.evaluator(experienceTracker, ierEngine, skillCrystallization, npcId);
    }
}

/**
 * TriggerAction - 触发动作
 */
class TriggerAction {
    constructor(id, name, handler) {
        this.id = id;
        this.name = name;
        this.handler = handler; // async (npcId, context) => result
    }

    async execute(npcId, context) {
        return this.handler(npcId, context);
    }
}

/**
 * EvolutionTrigger - 自动进化触发器
 * 
 * 管理 NPC 的自动触发条件和动作，当条件满足时自动触发进化事件
 */
export class EvolutionTrigger {
    /**
     * 预定义触发条件类型
     */
    static CONDITIONS = {
        /** 高失败率：连续失败超过阈值 */
        HIGH_FAILURE_RATE: 'HIGH_FAILURE_RATE',
        
        /** 学习 plateau：成功率停滞不前 */
        LEARNING_PLATEAU: 'LEARNING_PLATEAU',
        
        /** 技能成熟：连续3次相同成功行为 */
        SKILL_MATURE: 'SKILL_MATURE',
        
        /** 低适配度：适配度分数低于阈值 */
        LOW_ADAPTATION: 'LOW_ADAPTATION',
        
        /** 高交互量：交互次数超过阈值 */
        HIGH_INTERACTION_COUNT: 'HIGH_INTERACTION_COUNT',
        
        /** 技能未使用：已结晶技能长期未使用 */
        SKILL_UNUSED: 'SKILL_UNUSED',
        
        /** 进化建议存在：IEREngine有未应用的优化建议 */
        HAS_SUGGESTIONS: 'HAS_SUGGESTIONS',
        
        /** 连续成功：连续成功次数超过阈值 */
        CONSECUTIVE_SUCCESS: 'CONSECUTIVE_SUCCESS'
    };

    /**
     * @param {ExperienceTracker} experienceTracker - 经验追踪器
     * @param {IEREngine} ierEngine - IER引擎
     * @param {SkillCrystallization} skillCrystallization - 技能结晶化系统
     */
    constructor(experienceTracker, ierEngine, skillCrystallization) {
        this.experienceTracker = experienceTracker;
        this.ierEngine = ierEngine;
        this.skillCrystallization = skillCrystallization;
        
        /** @type {Map<string, Array<{condition: TriggerCondition, action: TriggerAction}>>} */
        this.triggers = new Map(); // npcId -> { condition, action }[]
        
        /** @type {Map<string, Array<Object>>} */
        this.triggerHistory = new Map(); // npcId -> triggered events history
        
        /** @type {Map<string, number>} */
        this.lastTriggerTime = new Map(); // npcId -> last triggered timestamp
        
        /** 触发冷却时间（ms） */
        this.cooldown = 60000; // 1分钟冷却
        
        this._initBuiltInConditions();
    }

    /**
     * 初始化内置触发条件
     * @private
     */
    _initBuiltInConditions() {
        this.builtInConditions = new Map();
        
        // HIGH_FAILURE_RATE: 连续失败 >= 3
        this.builtInConditions.set('HIGH_FAILURE_RATE', new TriggerCondition(
            'HIGH_FAILURE_RATE',
            'High Failure Rate',
            (expTracker, ierEngine, skillCryst, npcId) => {
                const failures = ierEngine.getConsecutiveFailures(npcId);
                return failures >= 3;
            }
        ));
        
        // LEARNING_PLATEAU: 成功率在最近20条记录中变化 < 5%
        this.builtInConditions.set('LEARNING_PLATEAU', new TriggerCondition(
            'LEARNING_PLATEAU',
            'Learning Plateau',
            (expTracker, ierEngine, skillCryst, npcId) => {
                const stats = expTracker.getStats(npcId);
                if (stats.totalInteractions < 20) return false;
                
                const recentRecords = expTracker.getRecentRecords(npcId, 20);
                const olderRecords = expTracker.getRecentRecords(npcId, 40).slice(0, 20);
                
                const recentSuccess = recentRecords.filter(r => r.outcome.success).length / 20;
                const olderSuccess = olderRecords.filter(r => r.outcome.success).length / Math.max(olderRecords.length, 1);
                
                return Math.abs(recentSuccess - olderSuccess) < 0.05;
            }
        ));
        
        // SKILL_MATURE: 检测到连续3次相同成功行为
        this.builtInConditions.set('SKILL_MATURE', new TriggerCondition(
            'SKILL_MATURE',
            'Skill Mature',
            (expTracker, ierEngine, skillCryst, npcId) => {
                const records = expTracker.getRecentRecords(npcId, 10);
                const pattern = skillCryst.detectPattern(records);
                return pattern !== null;
            }
        ));
        
        // LOW_ADAPTATION: 适配度分数 < 0.3
        this.builtInConditions.set('LOW_ADAPTATION', new TriggerCondition(
            'LOW_ADAPTATION',
            'Low Adaptation',
            (expTracker, ierEngine, skillCryst, npcId) => {
                const score = expTracker.getAdaptationScore(npcId);
                return score < 0.3;
            }
        ));
        
        // HIGH_INTERACTION_COUNT: 交互次数 >= 50
        this.builtInConditions.set('HIGH_INTERACTION_COUNT', new TriggerCondition(
            'HIGH_INTERACTION_COUNT',
            'High Interaction Count',
            (expTracker, ierEngine, skillCryst, npcId) => {
                const stats = expTracker.getStats(npcId);
                return stats.totalInteractions >= 50;
            }
        ));
        
        // SKILL_UNUSED: 技能超过10分钟未使用
        this.builtInConditions.set('SKILL_UNUSED', new TriggerCondition(
            'SKILL_UNUSED',
            'Skill Unused',
            (expTracker, ierEngine, skillCryst, npcId) => {
                const skills = skillCryst.getSkillLibrary(npcId);
                if (skills.length === 0) return false;
                
                const now = Date.now();
                const unusedThreshold = 10 * 60 * 1000; // 10 minutes
                
                return skills.some(skill => {
                    if (skill.lastUsed === null) return true; // Never used
                    return (now - skill.lastUsed) > unusedThreshold;
                });
            }
        ));
        
        // HAS_SUGGESTIONS: IEREngine有未应用的建议
        this.builtInConditions.set('HAS_SUGGESTIONS', new TriggerCondition(
            'HAS_SUGGESTIONS',
            'Has Suggestions',
            (expTracker, ierEngine, skillCryst, npcId) => {
                const suggestions = ierEngine.getSuggestions(npcId);
                return suggestions.length > 0;
            }
        ));
        
        // CONSECUTIVE_SUCCESS: 连续成功 >= 5
        this.builtInConditions.set('CONSECUTIVE_SUCCESS', new TriggerCondition(
            'CONSECUTIVE_SUCCESS',
            'Consecutive Success',
            (expTracker, ierEngine, skillCryst, npcId) => {
                const records = expTracker.getRecentRecords(npcId, 10);
                let consecutive = 0;
                for (let i = records.length - 1; i >= 0; i--) {
                    if (records[i].outcome.success) {
                        consecutive++;
                    } else {
                        break;
                    }
                }
                return consecutive >= 5;
            }
        ));
    }

    /**
     * 注册触发条件
     * @param {string} npcId - NPC ID
     * @param {string|TriggerCondition} condition - 条件ID或条件对象
     * @param {Function} action - 动作处理函数 async (npcId, context) => result
     * @returns {Object} 注册结果
     */
    registerTrigger(npcId, condition, action) {
        let triggerCondition;
        
        if (typeof condition === 'string') {
            // 字符串条件ID，查找内置条件
            const builtIn = this.builtInConditions.get(condition);
            if (!builtIn) {
                return { 
                    success: false, 
                    reason: `Unknown condition: ${condition}. Available: ${Array.from(this.builtInConditions.keys()).join(', ')}` 
                };
            }
            triggerCondition = builtIn;
        } else if (condition instanceof TriggerCondition) {
            triggerCondition = condition;
        } else {
            return { success: false, reason: 'Invalid condition type' };
        }
        
        let triggerAction;
        if (typeof action === 'function') {
            triggerAction = new TriggerAction(
                `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                'custom_action',
                action
            );
        } else if (action instanceof TriggerAction) {
            triggerAction = action;
        } else {
            return { success: false, reason: 'Invalid action type' };
        }
        
        if (!this.triggers.has(npcId)) {
            this.triggers.set(npcId, []);
        }
        
        this.triggers.get(npcId).push({
            condition: triggerCondition,
            action: triggerAction
        });
        
        return { 
            success: true, 
            npcId, 
            conditionId: triggerCondition.id,
            actionId: triggerAction.id
        };
    }

    /**
     * 注册内置条件（使用预定义动作）
     * @param {string} npcId - NPC ID
     * @param {string} conditionId - 条件ID
     * @returns {Object} 注册结果
     */
    registerBuiltInTrigger(npcId, conditionId) {
        const builtInAction = this._getBuiltInAction(conditionId);
        return this.registerTrigger(npcId, conditionId, builtInAction);
    }

    /**
     * 获取内置动作
     * @private
     */
    _getBuiltInAction(conditionId) {
        const actions = {
            'HIGH_FAILURE_RATE': async (npcId) => {
                // 触发IEREngine refine
                const records = this.experienceTracker.getRecentRecords(npcId, 10);
                if (records.length > 0) {
                    const lastRecord = records[records.length - 1];
                    return await this.ierEngine.refine(npcId, {
                        type: lastRecord.type,
                        playerAction: lastRecord.playerAction,
                        npcResponse: lastRecord.npcResponse,
                        outcome: lastRecord.outcome
                    });
                }
                return { success: false, reason: 'No records' };
            },
            
            'LEARNING_PLATEAU': async (npcId) => {
                // 重置IEREngine连续失败计数
                this.ierEngine.resetConsecutiveFailures(npcId);
                return { success: true, action: 'reset_consecutive_failures' };
            },
            
            'SKILL_MATURE': async (npcId) => {
                // 触发技能自动结晶
                const records = this.experienceTracker.getRecentRecords(npcId, 20);
                const pattern = this.skillCrystallization.detectPattern(records);
                if (pattern) {
                    return this.skillCrystallization.crystallize(npcId, pattern);
                }
                return { success: false, reason: 'No pattern detected' };
            },
            
            'LOW_ADAPTATION': async (npcId) => {
                // 获取IEREngine建议并返回
                const suggestions = this.ierEngine.getSuggestions(npcId);
                return { success: true, suggestions };
            },
            
            'HIGH_INTERACTION_COUNT': async (npcId) => {
                // 触发IEREngine refine
                const records = this.experienceTracker.getRecentRecords(npcId, 10);
                if (records.length > 0) {
                    const lastRecord = records[records.length - 1];
                    return await this.ierEngine.refine(npcId, {
                        type: lastRecord.type,
                        playerAction: lastRecord.playerAction,
                        npcResponse: lastRecord.npcResponse,
                        outcome: lastRecord.outcome
                    });
                }
                return { success: false, reason: 'No records' };
            },
            
            'SKILL_UNUSED': async (npcId) => {
                // 返回未使用的技能列表
                const skills = this.skillCrystallization.getSkillLibrary(npcId);
                const now = Date.now();
                const unusedThreshold = 10 * 60 * 1000;
                const unused = skills.filter(s => 
                    s.lastUsed === null || (now - s.lastUsed) > unusedThreshold
                );
                return { success: true, unusedSkills: unused.map(s => s.id) };
            },
            
            'HAS_SUGGESTIONS': async (npcId) => {
                // 返回IEREngine建议
                const suggestions = this.ierEngine.getSuggestions(npcId);
                return { success: true, suggestions };
            },
            
            'CONSECUTIVE_SUCCESS': async (npcId) => {
                // 触发技能autoTrigger
                return this.skillCrystallization.autoTrigger(npcId, {});
            }
        };
        
        return actions[conditionId] || (async () => ({ success: false, reason: 'No built-in action' }));
    }

    /**
     * 检查并触发进化事件
     * @param {string} npcId - NPC ID
     * @returns {Object} 触发结果 { triggered: boolean, conditions: string[], results: Object[] }
     */
    async checkAndTrigger(npcId) {
        // 检查冷却时间
        const lastTime = this.lastTriggerTime.get(npcId) || 0;
        if (Date.now() - lastTime < this.cooldown) {
            return { 
                triggered: false, 
                reason: 'cooldown_active',
                cooldownRemaining: this.cooldown - (Date.now() - lastTime)
            };
        }
        
        const triggerList = this.triggers.get(npcId) || [];
        if (triggerList.length === 0) {
            return { triggered: false, reason: 'no_triggers_registered' };
        }
        
        const triggeredConditions = [];
        const results = [];
        
        for (const { condition, action } of triggerList) {
            const met = condition.evaluate(
                this.experienceTracker, 
                this.ierEngine, 
                this.skillCrystallization, 
                npcId
            );
            
            if (met) {
                triggeredConditions.push(condition.id);
                
                try {
                    const result = await action.execute(npcId, {
                        timestamp: Date.now(),
                        condition: condition.id
                    });
                    results.push({
                        conditionId: condition.id,
                        actionId: action.id,
                        result
                    });
                } catch (error) {
                    results.push({
                        conditionId: condition.id,
                        actionId: action.id,
                        error: error.message
                    });
                }
            }
        }
        
        if (triggeredConditions.length > 0) {
            this.lastTriggerTime.set(npcId, Date.now());
            
            // 记录到历史
            if (!this.triggerHistory.has(npcId)) {
                this.triggerHistory.set(npcId, []);
            }
            this.triggerHistory.get(npcId).push({
                timestamp: Date.now(),
                conditions: triggeredConditions,
                results
            });
        }
        
        return {
            triggered: triggeredConditions.length > 0,
            conditions: triggeredConditions,
            results
        };
    }

    /**
     * 获取NPC的触发历史
     * @param {string} npcId - NPC ID
     * @param {number} limit - 返回最近N条记录
     * @returns {Object[]} 历史记录数组
     */
    getTriggerHistory(npcId, limit = 10) {
        const history = this.triggerHistory.get(npcId) || [];
        return history.slice(-limit);
    }

    /**
     * 获取NPC的注册触发器列表
     * @param {string} npcId - NPC ID
     * @returns {Object[]} 触发器列表
     */
    getRegisteredTriggers(npcId) {
        const triggerList = this.triggers.get(npcId) || [];
        return triggerList.map(t => ({
            conditionId: t.condition.id,
            conditionName: t.condition.name,
            actionId: t.action.id,
            actionName: t.action.name
        }));
    }

    /**
     * 清除指定NPC的所有触发器
     * @param {string} npcId - NPC ID
     * @returns {Object} 清除结果
     */
    clearTriggers(npcId) {
        const hadTriggers = this.triggers.has(npcId);
        this.triggers.delete(npcId);
        this.triggerHistory.delete(npcId);
        this.lastTriggerTime.delete(npcId);
        
        return { 
            success: true, 
            cleared: hadTriggers 
        };
    }

    /**
     * 设置冷却时间
     * @param {number} cooldown - 冷却时间（ms）
     */
    setCooldown(cooldown) {
        this.cooldown = cooldown;
    }

    /**
     * 创建自定义条件
     * @param {string} id - 条件ID
     * @param {string} name - 条件名称
     * @param {Function} evaluator - 评估函数
     * @returns {TriggerCondition} 触发条件对象
     */
    createCondition(id, name, evaluator) {
        return new TriggerCondition(id, name, evaluator);
    }

    /**
     * 创建自定义动作
     * @param {string} id - 动作ID
     * @param {string} name - 动作名称
     * @param {Function} handler - 处理函数
     * @returns {TriggerAction} 触发动作对象
     */
    createAction(id, name, handler) {
        return new TriggerAction(id, name, handler);
    }

    /**
     * 获取所有可用的内置条件ID
     * @returns {string[]} 条件ID数组
     */
    getAvailableConditions() {
        return Array.from(this.builtInConditions.keys());
    }
}

export default EvolutionTrigger;