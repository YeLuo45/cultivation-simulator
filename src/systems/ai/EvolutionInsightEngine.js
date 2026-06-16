/**
 * EvolutionInsightEngine.js - NPC进化洞察引擎
 * V278 Iteration 2/9 - Skill Crystallization Module
 * 
 * 核心机制：
 * 1. 基于ExperienceTracker数据分析NPC进化状态
 * 2. 生成单NPC和全宗门的进化洞察报告
 * 3. 基于已结晶技能预测玩家下一步行为
 */

import { ExperienceTracker } from './ExperienceTracker.js';

/**
 * EvolutionInsightEngine - NPC进化洞察引擎
 * 基于已结晶技能和历史交互，生成NPC进化洞察报告
 */
export class EvolutionInsightEngine {
    /**
     * @param {ExperienceTracker} experienceTracker - 经验追踪器实例
     * @param {SkillCrystallization} skillCrystallization - 技能结晶化实例
     */
    constructor(experienceTracker, skillCrystallization) {
        this.experienceTracker = experienceTracker;
        this.skillCrystallization = skillCrystallization;
        
        // 进化阈值配置
        this.thresholds = {
            novice: { interactions: 0, skills: 0 },
            learning: { interactions: 10, skills: 1 },
            adapted: { interactions: 30, skills: 3 },
            master: { interactions: 100, skills: 5 }
        };
    }

    /**
     * 生成单NPC的进化洞察
     * @param {string} npcId - NPC ID
     * @returns {Object} { evolutionStage, dominantPatterns, recommendedFocus, confidence }
     */
    generateInsight(npcId) {
        const stats = this.experienceTracker.getStats(npcId);
        const skills = this.skillCrystallization.getSkillLibrary(npcId);
        const skillStats = this.skillCrystallization.getSkillStats(npcId);
        
        // 确定进化阶段
        const evolutionStage = this._determineEvolutionStage(stats, skills);
        
        // 识别主导模式
        const dominantPatterns = this._identifyDominantPatterns(npcId, skills);
        
        // 推荐专注方向
        const recommendedFocus = this._determineRecommendedFocus(npcId, stats, skills, evolutionStage);
        
        // 计算置信度
        const confidence = this._calculateConfidence(stats, skills);

        return {
            evolutionStage,
            dominantPatterns,
            recommendedFocus,
            confidence,
            details: {
                totalInteractions: stats.totalInteractions,
                skillCount: skills.length,
                successRate: stats.successRate,
                avgSatisfaction: stats.avgSatisfaction,
                adaptationLevel: stats.adaptationLevel,
                mostUsedSkill: skillStats.mostUsedSkill,
                avgSkillConfidence: skillStats.avgConfidence
            }
        };
    }

    /**
     * 生成宗门所有NPC的集体洞察
     * @returns {Object} 各NPC进化状态对比
     */
    generateSectInsights() {
        const allNpcIds = this.experienceTracker.getAllNpcIds();
        
        const insights = allNpcIds.map(npcId => ({
            npcId,
            ...this.generateInsight(npcId)
        }));

        // 宗门级别的统计分析
        const sectStats = this._calculateSectStats(insights);

        return {
            npcInsights: insights,
            sectStats,
            summary: this._generateSectSummary(insights, sectStats)
        };
    }

    /**
     * 预测玩家下一步行为
     * @param {string} npcId - NPC ID
     * @returns {Object} { predictedAction, confidence, basedOnSkills }
     */
    predictPlayerBehavior(npcId) {
        const skills = this.skillCrystallization.getSkillLibrary(npcId);
        const records = this.experienceTracker.getRecords(npcId);
        
        if (skills.length === 0 || records.length === 0) {
            return {
                predictedAction: null,
                confidence: 0,
                basedOnSkills: []
            };
        }

        // 基于已结晶技能和最近历史预测
        const recentRecords = this.experienceTracker.getRecentRecords(npcId, 10);
        
        // 统计最近玩家行为
        const actionCounts = {};
        const typeCounts = {};
        
        recentRecords.forEach(record => {
            const action = record.playerAction || 'unknown';
            actionCounts[action] = (actionCounts[action] || 0) + 1;
            typeCounts[record.type] = (typeCounts[record.type] || 0) + 1;
        });

        // 找到最频繁的行为
        let mostFrequentAction = null;
        let maxActionCount = 0;
        Object.entries(actionCounts).forEach(([action, count]) => {
            if (count > maxActionCount) {
                maxActionCount = count;
                mostFrequentAction = action;
            }
        });

        // 找到最频繁的类型
        let mostFrequentType = null;
        let maxTypeCount = 0;
        Object.entries(typeCounts).forEach(([type, count]) => {
            if (count > maxTypeCount) {
                maxTypeCount = count;
                mostFrequentType = type;
            }
        });

        // 获取基于该行为的技能
        const basedOnSkills = skills
            .filter(s => s.pattern.playerAction === mostFrequentAction)
            .map(s => s.id);

        // 计算预测置信度
        const confidence = this._calculatePredictionConfidence(
            recentRecords.length,
            maxActionCount,
            skills.length
        );

        return {
            predictedAction: mostFrequentAction,
            predictedType: mostFrequentType,
            confidence,
            basedOnSkills,
            basedOnRecords: recentRecords.length
        };
    }

    /**
     * 确定进化阶段
     * @private
     */
    _determineEvolutionStage(stats, skills) {
        const { thresholds } = this;
        
        if (stats.totalInteractions >= thresholds.master.interactions && 
            skills.length >= thresholds.master.skills) {
            return 'master';
        }
        if (stats.totalInteractions >= thresholds.adapted.interactions && 
            skills.length >= thresholds.adapted.skills) {
            return 'adapted';
        }
        if (stats.totalInteractions >= thresholds.learning.interactions || 
            skills.length >= thresholds.learning.skills) {
            return 'learning';
        }
        return 'novice';
    }

    /**
     * 识别主导模式
     * @private
     */
    _identifyDominantPatterns(npcId, skills) {
        if (skills.length === 0) return [];
        
        // 按使用次数和置信度排序
        const sortedSkills = [...skills].sort((a, b) => {
            const scoreA = a.useCount * a.confidence;
            const scoreB = b.useCount * b.confidence;
            return scoreB - scoreA;
        });

        // 返回前3个主导模式
        return sortedSkills.slice(0, 3).map(s => ({
            skillId: s.id,
            patternType: s.pattern.type,
            playerAction: s.pattern.playerAction,
            confidence: s.confidence,
            useCount: s.useCount
        }));
    }

    /**
     * 确定推荐专注方向
     * @private
     */
    _determineRecommendedFocus(npcId, stats, skills, evolutionStage) {
        // 基于进化阶段和当前状态推荐
        if (evolutionStage === 'novice') {
            if (stats.totalInteractions < 5) {
                return '增加与玩家的交互次数';
            }
            return '学习基本的对话模式';
        }
        
        if (evolutionStage === 'learning') {
            if (skills.length < 2) {
                return '巩固已学到的技能模式';
            }
            return '扩展技能多样性';
        }
        
        if (evolutionStage === 'adapted') {
            if (stats.successRate < 0.7) {
                return '提高交互成功率';
            }
            return '深化高级技能';
        }
        
        // master阶段
        if (stats.avgSatisfaction < 0.8) {
            return '提升玩家满意度';
        }
        return '探索创新交互方式';
    }

    /**
     * 计算洞察置信度
     * @private
     */
    _calculateConfidence(stats, skills) {
        // 综合考虑交互数量、技能数量和成功率
        const interactionFactor = Math.min(stats.totalInteractions / 50, 1) * 0.3;
        const skillFactor = Math.min(skills.length / 5, 1) * 0.3;
        const successFactor = stats.successRate * 0.4;
        
        return Math.round((interactionFactor + skillFactor + successFactor) * 100) / 100;
    }

    /**
     * 计算预测置信度
     * @private
     */
    _calculatePredictionConfidence(recordCount, maxActionCount, skillCount) {
        if (recordCount === 0) return 0;
        
        // 基于记录数量和技能数量
        const recordFactor = Math.min(recordCount / 10, 1) * 0.4;
        const repetitionFactor = Math.min(maxActionCount / 5, 1) * 0.3;
        const skillFactor = Math.min(skillCount / 3, 1) * 0.3;
        
        return Math.round((recordFactor + repetitionFactor + skillFactor) * 100) / 100;
    }

    /**
     * 计算宗门统计数据
     * @private
     */
    _calculateSectStats(insights) {
        if (insights.length === 0) {
            return {
                totalNpcs: 0,
                avgConfidence: 0,
                stageDistribution: { novice: 0, learning: 0, adapted: 0, master: 0 },
                avgSkillsPerNpc: 0
            };
        }
        
        const stageDist = { novice: 0, learning: 0, adapted: 0, master: 0 };
        let totalConfidence = 0;
        let totalSkills = 0;
        
        insights.forEach(insight => {
            totalConfidence += insight.confidence;
            totalSkills += insight.details.skillCount;
            stageDist[insight.evolutionStage]++;
        });
        
        return {
            totalNpcs: insights.length,
            avgConfidence: Math.round(totalConfidence / insights.length * 100) / 100,
            stageDistribution: stageDist,
            avgSkillsPerNpc: Math.round(totalSkills / insights.length * 100) / 100
        };
    }

    /**
     * 生成宗门总结
     * @private
     */
    _generateSectSummary(insights, sectStats) {
        const masteredNpcs = insights.filter(i => i.evolutionStage === 'master').length;
        const adaptedNpcs = insights.filter(i => i.evolutionStage === 'adapted').length;
        
        if (masteredNpcs === insights.length) {
            return '整个宗门已达到大师级别，具备高度智能的交互能力。';
        }
        if (adaptedNpcs > insights.length / 2) {
            return '宗门多数NPC已适应玩家行为模式，具备较好的交互智能。';
        }
        if (sectStats.avgSkillsPerNpc < 1) {
            return '宗门NPC仍处于学习阶段，需要更多交互来发展技能。';
        }
        return '宗门NPC正在逐步学习和适应玩家的交互模式。';
    }

    /**
     * 更新进化阈值配置
     * @param {Object} newThresholds - 新的阈值配置
     */
    updateThresholds(newThresholds) {
        this.thresholds = { ...this.thresholds, ...newThresholds };
    }
}

export default EvolutionInsightEngine;