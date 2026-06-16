/**
 * DreamMemorySkillBridge.js - 梦境记忆与技能结晶化桥接层
 * V278 Iteration 2/9 - Skill Crystallization Module
 * 
 * 核心机制：
 * 1. 从DreamMemoryStore获取NPC×玩家对话记忆
 * 2. 转换为interaction records用于模式检测
 * 3. 使用SkillCrystallization检测重复模式并结晶化
 * 4. 管理已结晶技能的使用和反馈
 */

import { ExperienceTracker } from './ExperienceTracker.js';

/**
 * DreamMemorySkillBridge - 梦境记忆与技能结晶化桥接
 * 将梦境记忆中的重复模式自动触发技能结晶化
 */
export class DreamMemorySkillBridge {
    /**
     * @param {DreamMemoryStore} dreamMemoryStore - 梦境记忆存储实例
     * @param {SkillCrystallization} skillCrystallization - 技能结晶化实例
     */
    constructor(dreamMemoryStore, skillCrystallization) {
        this.dreamMemoryStore = dreamMemoryStore;
        this.skillCrystallization = skillCrystallization;
        this.experienceTracker = new ExperienceTracker();
        this.skillCrystallization.setExperienceTracker(this.experienceTracker);
        
        // 技能使用记录缓存: skillId -> { successCount, failureCount }
        this.skillUsageCache = new Map();
        
        // NPC×玩家 技能映射: key -> skillIds[]
        this.npcPlayerSkills = new Map();
    }

    /**
     * 同步梦境记忆到技能结晶化
     * @param {string} npcId - NPC ID
     * @param {string} playerId - 玩家 ID
     * @returns {Promise<Object>} { crystallizedSkills, patternsFound }
     */
    async syncAndCrystallize(npcId, playerId) {
        if (!this.dreamMemoryStore) {
            return { crystallizedSkills: 0, patternsFound: 0, error: 'No dream memory store' };
        }

        // 1. 从DreamMemoryStore获取npcId×playerId的所有对话记忆
        const memories = await this.dreamMemoryStore.queryAll(npcId, playerId);
        
        if (memories.length === 0) {
            return { crystallizedSkills: 0, patternsFound: 0 };
        }

        // 2. 转换为interaction records
        const interactions = this._convertMemoriesToInteractions(memories);
        
        // 3. 调用skillCrystallization.detectPattern()
        const pattern = this.skillCrystallization.detectPattern(interactions);
        let patternsFound = 0;
        let crystallizedSkills = 0;

        if (pattern) {
            patternsFound = 1;
            
            // 4. 达到阈值时调用skillCrystallization.crystallize()
            const result = this.skillCrystallization.crystallize(npcId, pattern);
            
            if (result.success) {
                crystallizedSkills = 1;
                
                // 更新npcPlayerSkills映射
                const key = this._getNpcPlayerKey(npcId, playerId);
                if (!this.npcPlayerSkills.has(key)) {
                    this.npcPlayerSkills.set(key, []);
                }
                
                // 检查是否已存在
                const existingIds = this.npcPlayerSkills.get(key);
                if (!existingIds.includes(result.skill.id)) {
                    existingIds.push(result.skill.id);
                }
                
                // 用记忆中的交互记录填充experienceTracker（用于autoTrigger）
                for (const mem of memories) {
                    this.experienceTracker.track(npcId, {
                        type: mem.emotion || 'dream',
                        playerAction: mem.content || '',
                        npcResponse: mem.keywords?.join(' ') || '',
                        outcome: { success: true, satisfaction: 0.7 }
                    });
                }
            }
        }

        return { crystallizedSkills, patternsFound };
    }

    /**
     * 获取NPC对玩家的可用技能
     * @param {string} npcId - NPC ID
     * @param {string} playerId - 玩家 ID
     * @returns {Object[]} 技能列表
     */
    getAvailableSkills(npcId, playerId) {
        const key = this._getNpcPlayerKey(npcId, playerId);
        const skillIds = this.npcPlayerSkills.get(key) || [];
        
        // 从skillCrystallization获取完整技能信息
        const allSkills = this.skillCrystallization.getSkillLibrary(npcId);
        
        // 过滤出属于该npc×player组合的技能
        return allSkills.filter(s => skillIds.includes(s.id));
    }

    /**
     * 记录技能使用结果
     * @param {string} npcId - NPC ID
     * @param {string} skillId - 技能 ID
     * @param {string} outcome - 'success'|'failure'
     * @returns {Object} 记录结果
     */
    recordSkillUsage(npcId, skillId, outcome) {
        const record = this.experienceTracker.track(npcId, {
            type: 'skill_usage',
            playerAction: skillId,
            npcResponse: outcome,
            outcome: {
                success: outcome === 'success',
                satisfaction: outcome === 'success' ? 1.0 : 0.0
            }
        });

        // 更新技能使用缓存
        if (!this.skillUsageCache.has(skillId)) {
            this.skillUsageCache.set(skillId, { successCount: 0, failureCount: 0 });
        }
        
        const cache = this.skillUsageCache.get(skillId);
        if (outcome === 'success') {
            cache.successCount++;
        } else {
            cache.failureCount++;
        }

        // 更新DreamMemoryStore中的关联置信度
        this._updateConfidenceInDreamStore(npcId, skillId, outcome);

        return record;
    }

    /**
     * 获取技能使用统计
     * @param {string} skillId - 技能 ID
     * @returns {Object} { successCount, failureCount, total, successRate }
     */
    getSkillUsageStats(skillId) {
        const cache = this.skillUsageCache.get(skillId) || { successCount: 0, failureCount: 0 };
        const total = cache.successCount + cache.failureCount;
        
        return {
            successCount: cache.successCount,
            failureCount: cache.failureCount,
            total,
            successRate: total > 0 ? cache.successCount / total : 0
        };
    }

    /**
     * 获取所有NPC×玩家组合的技能key列表
     * @returns {string[]} key列表
     */
    getAllNpcPlayerKeys() {
        return Array.from(this.npcPlayerSkills.keys());
    }

    /**
     * 将记忆转换为交互记录
     * @private
     * @param {Object[]} memories - 记忆数组
     * @returns {Object[]} 交互记录数组
     */
    _convertMemoriesToInteractions(memories) {
        return memories
            .filter(mem => mem.content || mem.emotion)
            .map(mem => ({
                type: mem.emotion || 'dream',
                playerAction: mem.content,
                npcResponse: mem.keywords?.join(' ') || '',
                outcome: {
                    success: true, // 梦境记忆默认都是正面交互
                    satisfaction: 0.7
                },
                timestamp: mem.timestamp
            }));
    }

    /**
     * 生成NPC×玩家组合的唯一key
     * @private
     */
    _getNpcPlayerKey(npcId, playerId) {
        return `${npcId}_${playerId}`;
    }

    /**
     * 更新梦境存储中的置信度
     * @private
     */
    _updateConfidenceInDreamStore(npcId, skillId, outcome) {
        // 这里可以与DreamMemoryStore联动更新记忆置信度
        // 但由于skillCrystallization本身不直接管理dreamMemoryStore的记录
        // 我们只是记录在缓存中供后续使用
    }

    /**
     * 清除桥接缓存（测试用）
     */
    clearCache() {
        this.skillUsageCache.clear();
        this.npcPlayerSkills.clear();
    }
}

export default DreamMemorySkillBridge;