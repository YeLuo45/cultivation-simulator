/**
 * BehaviorLearner.js - NPC行为学习器
 * V277 Iteration 1/9 - NPC Self-Evolution Engine Core
 * 
 * 核心机制：
 * 1. 基于ExperienceTracker数据动态调整NPC行为策略
 * 2. 分析历史交互推断玩家偏好
 * 3. 生成最优响应建议
 */

import { ExperienceTracker } from './ExperienceTracker.js';

/**
 * BehaviorLearner - 行为学习器
 * 基于ExperienceTracker数据，动态调整NPC行为策略
 */
export class BehaviorLearner {
    /**
     * @param {ExperienceTracker} experienceTracker - 经验追踪器实例
     */
    constructor(experienceTracker) {
        this.experienceTracker = experienceTracker || new ExperienceTracker();
        this.learningPatterns = new Map(); // npcId -> LearningPattern
        this.responseCache = new Map(); // npcId -> cached responses
    }

    /**
     * 学习 - 分析历史推断玩家偏好，返回调整后的behaviorPattern
     * @param {string} npcId - NPC ID
     * @returns {Object} 调整后的behaviorPattern
     */
    learn(npcId) {
        const stats = this.experienceTracker.getStats(npcId);
        const records = this.experienceTracker.getRecords(npcId);

        if (records.length === 0) {
            return this._getDefaultBehaviorPattern();
        }

        // 分析玩家偏好
        const playerPreferences = this._analyzePlayerPreferences(records);
        
        // 分析成功模式
        const successPatterns = this._analyzeSuccessPatterns(records);
        
        // 构建学习模式
        const learningPattern = {
            playerPreferences,
            successPatterns,
            lastLearned: Date.now(),
            learnCount: (this.learningPatterns.get(npcId)?.learnCount || 0) + 1
        };
        this.learningPatterns.set(npcId, learningPattern);

        // 生成调整后的行为模式
        return this._generateBehaviorPattern(npcId, playerPreferences, successPatterns, stats);
    }

    /**
     * 基于学习到的模式生成最优响应文本
     * @param {string} npcId - NPC ID
     * @param {Object} context - 上下文 {type, playerAction, ...}
     * @returns {string} 建议的响应文本
     */
    suggestResponse(npcId, context) {
        const stats = this.experienceTracker.getStats(npcId);
        const records = this.experienceTracker.getRecords(npcId);
        
        // 基于历史成功响应模式生成建议
        if (records.length === 0) {
            return this._getDefaultResponse(context);
        }

        // 查找相似上下文的成功响应
        const similarRecords = this._findSimilarRecords(records, context);
        
        if (similarRecords.length > 0) {
            // 选择最成功的响应
            const bestRecord = this._selectBestResponse(similarRecords);
            return this._adaptResponse(bestRecord, context);
        }

        // 基于玩家偏好生成响应
        const learningPattern = this.learningPatterns.get(npcId);
        if (learningPattern?.playerPreferences) {
            return this._generatePreferenceBasedResponse(context, learningPattern.playerPreferences);
        }

        return this._getDefaultResponse(context);
    }

    /**
     * 获取适应度分数 (0-1)
     * @param {string} npcId - NPC ID
     * @returns {number} 适应度分数
     */
    getAdaptationScore(npcId) {
        return this.experienceTracker.getAdaptationScore(npcId);
    }

    /**
     * 重置学习状态
     * @param {string} npcId - NPC ID
     * @returns {Object} 重置结果
     */
    reset(npcId) {
        this.learningPatterns.delete(npcId);
        this.responseCache.delete(npcId);
        return { success: true, npcId };
    }

    /**
     * 获取学习模式详情
     * @param {string} npcId - NPC ID
     * @returns {Object|null} 学习模式
     */
    getLearningPattern(npcId) {
        return this.learningPatterns.get(npcId) || null;
    }

    /**
     * 分析玩家偏好
     * @private
     */
    _analyzePlayerPreferences(records) {
        const preferences = {
            likedTypes: {},      // type -> count
            likedActions: {},    // action -> count
            satisfactionByType: {}, // type -> avg satisfaction
            communicationStyle: 'neutral' // formal/casual/neutral
        };

        records.forEach(record => {
            // 按类型统计
            if (!preferences.likedTypes[record.type]) {
                preferences.likedTypes[record.type] = 0;
                preferences.satisfactionByType[record.type] = [];
            }
            preferences.likedTypes[record.type]++;
            preferences.satisfactionByType[record.type].push(record.outcome.satisfaction);

            // 按动作统计
            const action = record.playerAction?.toLowerCase() || '';
            if (!preferences.likedActions[action]) {
                preferences.likedActions[action] = { count: 0, totalSatisfaction: 0 };
            }
            preferences.likedActions[action].count++;
            preferences.likedActions[action].totalSatisfaction += record.outcome.satisfaction;
        });

        // 计算平均满意度
        Object.keys(preferences.satisfactionByType).forEach(type => {
            const arr = preferences.satisfactionByType[type];
            preferences.satisfactionByType[type] = arr.reduce((a, b) => a + b, 0) / arr.length;
        });

        // 确定最受欢迎的类型
        let maxType = null;
        let maxCount = 0;
        Object.entries(preferences.likedTypes).forEach(([type, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxType = type;
            }
        });
        preferences.preferredType = maxType;

        // 确定最喜欢的动作
        let maxAction = null;
        let maxSatisfaction = -1;
        Object.entries(preferences.likedActions).forEach(([action, data]) => {
            const avgSat = data.totalSatisfaction / data.count;
            if (avgSat > maxSatisfaction) {
                maxSatisfaction = avgSat;
                maxAction = action;
            }
        });
        preferences.preferredAction = maxAction;

        return preferences;
    }

    /**
     * 分析成功模式
     * @private
     */
    _analyzeSuccessPatterns(records) {
        const patterns = {
            successfulTypes: [],
            successfulResponses: [],
            avgSuccessRate: 0
        };

        const successfulRecords = records.filter(r => r.outcome.success);
        patterns.avgSuccessRate = records.length > 0 
            ? successfulRecords.length / records.length 
            : 0;

        // 成功的类型
        const typeCounts = {};
        successfulRecords.forEach(r => {
            typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
        });
        patterns.successfulTypes = Object.entries(typeCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([type]) => type);

        // 成功的响应
        patterns.successfulResponses = successfulRecords
            .map(r => r.npcResponse)
            .filter(Boolean);

        return patterns;
    }

    /**
     * 生成行为模式
     * @private
     */
    _generateBehaviorPattern(npcId, playerPreferences, successPatterns, stats) {
        const basePattern = {
            friendliness: this._calculateFriendliness(stats),
            taskSuccessRate: stats.successRate,
            dialoguePreference: playerPreferences.preferredType || 'neutral',
            adaptationScore: this.experienceTracker.getAdaptationScore(npcId),
            preferredInteractionType: playerPreferences.preferredType,
            recommendedResponseStyle: this._getRecommendedResponseStyle(playerPreferences)
        };

        return basePattern;
    }

    /**
     * 计算友好度
     * @private
     */
    _calculateFriendliness(stats) {
        // 基于成功率和满意度计算友好度
        const base = 0.5;
        const successBonus = stats.successRate * 0.3;
        const satisfactionBonus = stats.avgSatisfaction * 0.2;
        return Math.min(Math.max(base + successBonus + satisfactionBonus, 0), 1);
    }

    /**
     * 获取推荐的响应风格
     * @private
     */
    _getRecommendedResponseStyle(preferences) {
        // 基于玩家偏好确定响应风格
        const typeSats = preferences.satisfactionByType;
        let bestType = null;
        let bestSat = -1;
        
        Object.entries(typeSats).forEach(([type, sat]) => {
            if (sat > bestSat) {
                bestSat = sat;
                bestType = type;
            }
        });

        switch (bestType) {
            case 'trade': return 'persuasive';
            case 'chat': return 'friendly';
            case 'combat': return 'assertive';
            case 'task': return 'helpful';
            default: return 'neutral';
        }
    }

    /**
     * 查找相似记录
     * @private
     */
    _findSimilarRecords(records, context) {
        return records.filter(record => {
            if (context.type && record.type !== context.type) return false;
            if (context.playerAction) {
                const action = context.playerAction.toLowerCase();
                const recordAction = (record.playerAction || '').toLowerCase();
                if (!recordAction.includes(action) && !action.includes(recordAction)) return false;
            }
            return true;
        });
    }

    /**
     * 选择最佳响应
     * @private
     */
    _selectBestResponse(records) {
        return records.reduce((best, record) => {
            const bestScore = best.outcome.success ? 1 : 0;
            const recordScore = record.outcome.success ? 1 : 0;
            
            if (recordScore > bestScore) return record;
            if (recordScore < bestScore) return best;
            
            // 如果成功率相同，比较满意度
            return record.outcome.satisfaction > best.outcome.satisfaction ? record : best;
        }, records[0]);
    }

    /**
     * 适配响应
     * @private
     */
    _adaptResponse(bestRecord, context) {
        // 基于最佳记录和当前上下文生成响应
        let response = bestRecord.npcResponse || '';
        
        // 如果有特定动作，可以修改响应
        if (context.playerAction && !response.includes(context.playerAction)) {
            // 可以添加动作相关的响应变化
        }
        
        return response || this._getDefaultResponse(context);
    }

    /**
     * 基于偏好生成响应
     * @private
     */
    _generatePreferenceBasedResponse(context, preferences) {
        const style = this._getRecommendedResponseStyle(preferences);
        
        const responses = {
            persuasive: ['让我来帮你...', '这笔交易很划算...', '相信我...'],
            friendly: ['很高兴见到你！', '最近怎么样？', '有什么我可以帮你的？'],
            assertive: ['准备好了吗？', '让我来应对！', '这是我的方式...'],
            helpful: ['我来帮你完成任务', '这个任务交给我', '我会尽力而为'],
            neutral: ['好的', '我明白了', '可以']
        };

        const options = responses[style] || responses.neutral;
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * 获取默认响应
     * @private
     */
    _getDefaultResponse(context) {
        const typeResponses = {
            trade: '这笔交易看起来不错。',
            chat: '很高兴和你聊天。',
            combat: '准备好了战斗。',
            task: '我会尽力完成任务。',
            social: '很高兴认识你。'
        };
        return typeResponses[context?.type] || '好的，我明白了。';
    }

    /**
     * 获取默认行为模式
     * @private
     */
    _getDefaultBehaviorPattern() {
        return {
            friendliness: 0.5,
            taskSuccessRate: 0.5,
            dialoguePreference: 'neutral',
            adaptationScore: 0
        };
    }
}

export default BehaviorLearner;