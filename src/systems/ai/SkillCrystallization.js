/**
 * SkillCrystallization.js - NPC技能结晶化系统
 * V277 Iteration 1/9 - NPC Self-Evolution Engine Core
 * 
 * 核心机制：
 * 1. 检测连续3次以上相同的成功行为模式
 * 2. 将模式固化为可复用技能
 * 3. 技能可以被回忆和使用
 */

import { ExperienceTracker } from './ExperienceTracker.js';

/**
 * Skill - 结晶化技能
 */
class Skill {
    constructor(id, pattern, confidence = 0.5) {
        this.id = id;
        this.pattern = pattern; // { type, playerAction, npcResponse }
        this.useCount = 0;
        this.lastUsed = null;
        this.confidence = confidence;
        this.createdAt = Date.now();
    }

    toJSON() {
        return {
            id: this.id,
            pattern: this.pattern,
            useCount: this.useCount,
            lastUsed: this.lastUsed,
            confidence: this.confidence,
            createdAt: this.createdAt
        };
    }
}

/**
 * SkillCrystallization - 技能结晶化系统
 * generic-agent-style: 遇到重复模式 → 固化为可复用技能
 */
export class SkillCrystallization {
    constructor() {
        this.skills = new Map(); // npcId -> Skill[]
        this.experienceTracker = null;
        this.patternHistory = new Map(); // npcId -> pattern[] (用于检测连续模式)
    }

    /**
     * 设置经验追踪器（用于autoTrigger）
     * @param {ExperienceTracker} tracker - 经验追踪器实例
     */
    setExperienceTracker(tracker) {
        this.experienceTracker = tracker;
    }

    /**
     * 检测连续3次以上相同的成功行为模式
     * @param {Object[]} interactions - 交互记录数组
     * @returns {Object|null} 检测到的模式或null
     */
    detectPattern(interactions) {
        if (!interactions || interactions.length < 3) {
            return null;
        }

        // 查找连续3次以上相同的成功行为模式
        let consecutiveCount = 1;
        let consecutivePattern = null;

        for (let i = 1; i < interactions.length; i++) {
            const prev = interactions[i - 1];
            const curr = interactions[i];

            // 检查是否是连续的成功交互
            if (!prev.outcome?.success || !curr.outcome?.success) {
                consecutiveCount = 1;
                consecutivePattern = null;
                continue;
            }

            // 检查模式是否相同
            const patternMatch = this._comparePatterns(prev, curr);
            
            if (patternMatch) {
                if (consecutivePattern === null) {
                    // 开始新的连续序列
                    consecutiveCount = 2;
                    consecutivePattern = this._extractPattern(prev);
                } else {
                    consecutiveCount++;
                }

                // 连续3次以上返回模式
                if (consecutiveCount >= 3) {
                    return {
                        ...consecutivePattern,
                        consecutiveCount,
                        confidence: Math.min(consecutiveCount / 10, 1) // 置信度基于连续次数
                    };
                }
            } else {
                consecutiveCount = 1;
                consecutivePattern = null;
            }
        }

        return null;
    }

    /**
     * 将模式固化为技能
     * @param {string} npcId - NPC ID
     * @param {Object} pattern - 模式对象
     * @returns {Object} 结晶结果
     */
    crystallize(npcId, pattern) {
        if (!pattern || !pattern.type) {
            return { success: false, reason: 'Invalid pattern' };
        }

        if (!this.skills.has(npcId)) {
            this.skills.set(npcId, []);
        }

        const skills = this.skills.get(npcId);

        // 检查是否已存在相同模式的技能
        const existingSkill = skills.find(s => 
            s.pattern.type === pattern.type && 
            s.pattern.playerAction === pattern.playerAction
        );

        if (existingSkill) {
            // 更新现有技能的置信度
            existingSkill.confidence = Math.min(existingSkill.confidence + 0.1, 1);
            return { success: true, skill: existingSkill, isUpdate: true };
        }

        // 创建新技能
        const skillId = `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const skill = new Skill(skillId, {
            type: pattern.type,
            playerAction: pattern.playerAction,
            npcResponse: pattern.npcResponse
        }, pattern.confidence || 0.5);

        skills.push(skill);

        return { success: true, skill: skill.toJSON(), isUpdate: false };
    }

    /**
     * 回忆指定技能，useCount++
     * @param {string} npcId - NPC ID
     * @param {string} skillId - 技能 ID
     * @returns {Object} 回忆结果
     */
    recallSkill(npcId, skillId) {
        const skills = this.skills.get(npcId) || [];
        const skill = skills.find(s => s.id === skillId);

        if (!skill) {
            return { success: false, reason: 'Skill not found' };
        }

        skill.useCount++;
        skill.lastUsed = Date.now();

        return { 
            success: true, 
            skill: skill.toJSON(),
            triggered: true
        };
    }

    /**
     * 返回该NPC所有已结晶技能
     * @param {string} npcId - NPC ID
     * @returns {Object[]} 技能数组
     */
    getSkillLibrary(npcId) {
        const skills = this.skills.get(npcId) || [];
        return skills.map(s => s.toJSON());
    }

    /**
     * 当detectPattern匹配时自动recallSkill
     * @param {string} npcId - NPC ID
     * @param {Object} context - 当前上下文
     * @returns {Object} 自动触发结果
     */
    autoTrigger(npcId, context) {
        if (!this.experienceTracker) {
            return { success: false, reason: 'No experience tracker set' };
        }

        // 获取最近的交互记录
        const records = this.experienceTracker.getRecentRecords(npcId, 20);
        
        // 检测模式
        const pattern = this.detectPattern(records);
        
        if (!pattern) {
            return { success: false, triggered: false, reason: 'No pattern detected' };
        }

        // 查找匹配的技能
        const skills = this.skills.get(npcId) || [];
        const matchedSkill = skills.find(s => 
            s.pattern.type === pattern.type && 
            s.pattern.playerAction === pattern.playerAction
        );

        if (!matchedSkill) {
            // 自动结晶新技能
            const result = this.crystallize(npcId, pattern);
            if (result.success) {
                return {
                    success: true,
                    triggered: true,
                    autoCrystallized: true,
                    skill: result.skill
                };
            }
            return { success: false, triggered: false };
        }

        // 回忆技能
        return this.recallSkill(npcId, matchedSkill.id);
    }

    /**
     * 检查模式是否匹配
     * @private
     */
    _comparePatterns(record1, record2) {
        if (record1.type !== record2.type) return false;
        if (record1.playerAction !== record2.playerAction) return false;
        return true;
    }

    /**
     * 提取模式
     * @private
     */
    _extractPattern(record) {
        return {
            type: record.type,
            playerAction: record.playerAction,
            npcResponse: record.npcResponse
        };
    }

    /**
     * 清除指定NPC的所有技能
     * @param {string} npcId - NPC ID
     * @returns {Object} 清除结果
     */
    clearSkills(npcId) {
        if (!this.skills.has(npcId)) {
            return { success: false, reason: 'NPC not found' };
        }
        this.skills.delete(npcId);
        return { success: true, cleared: true };
    }

    /**
     * 获取技能统计
     * @param {string} npcId - NPC ID
     * @returns {Object} 统计信息
     */
    getSkillStats(npcId) {
        const skills = this.skills.get(npcId) || [];
        if (skills.length === 0) {
            return {
                totalSkills: 0,
                totalUses: 0,
                avgConfidence: 0,
                mostUsedSkill: null
            };
        }

        const totalUses = skills.reduce((sum, s) => sum + s.useCount, 0);
        const avgConfidence = skills.reduce((sum, s) => sum + s.confidence, 0) / skills.length;
        const mostUsedSkill = skills.reduce((max, s) => s.useCount > max.useCount ? s : max, skills[0]);

        return {
            totalSkills: skills.length,
            totalUses,
            avgConfidence: Math.round(avgConfidence * 100) / 100,
            mostUsedSkill: mostUsedSkill ? mostUsedSkill.id : null
        };
    }
}

export default SkillCrystallization;