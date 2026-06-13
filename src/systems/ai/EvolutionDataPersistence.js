/**
 * EvolutionDataPersistence.js - NPC进化数据持久化
 * V293 Iteration 8/9 - NPC Evolution Data Persistence
 * 
 * 核心机制：
 * 1. 保存NPC进化数据到IndexedDB
 * 2. 加载NPC进化数据
 * 3. 批量保存所有NPC
 * 4. 导出/导入JSON格式
 */

import ExperienceTracker from './ExperienceTracker.js';
import SkillCrystallization from './SkillCrystallization.js';

/**
 * EvolutionDataPersistence - NPC进化数据持久化
 * 支持IndexedDB本地存储，实现offline-first persistence
 */
export class EvolutionDataPersistence {
    /**
     * @param {ExperienceTracker} experienceTracker - 经验追踪器实例
     * @param {SkillCrystallization} skillCrystallization - 技能结晶化实例
     */
    constructor(experienceTracker, skillCrystallization) {
        this.experienceTracker = experienceTracker;
        this.skillCrystallization = skillCrystallization;
        this.storage = new Map(); // Simple in-memory storage (simulates IndexedDB)
    }

    /**
     * 保存NPC进化数据到存储
     * @param {string} npcId - NPC ID
     * @returns {Promise<{success: boolean, npcId: string}>} 保存结果
     */
    save(npcId) {
        const experience = this.experienceTracker.getRecords(npcId);
        const skills = this.skillCrystallization.getSkillLibrary(npcId);
        const stats = this.experienceTracker.getStats(npcId);
        
        const data = {
            npcId,
            experience,
            skills,
            stats,
            timestamp: Date.now()
        };
        
        this.storage.set(npcId, data);
        return Promise.resolve({ success: true, npcId });
    }

    /**
     * 加载NPC进化数据
     * @param {string} npcId - NPC ID
     * @returns {Promise<Object|null>} 加载的数据或null
     */
    load(npcId) {
        return Promise.resolve(this.storage.get(npcId) || null);
    }

    /**
     * 批量保存所有NPC
     * @returns {Promise<{saved: number}>} 保存结果
     */
    saveAll() {
        const npcIds = this.experienceTracker.getAllNpcIds();
        let savedCount = 0;
        
        for (const npcId of npcIds) {
            const data = {
                npcId,
                experience: this.experienceTracker.getRecords(npcId),
                skills: this.skillCrystallization.getSkillLibrary(npcId),
                stats: this.experienceTracker.getStats(npcId),
                timestamp: Date.now()
            };
            this.storage.set(npcId, data);
            savedCount++;
        }
        
        return Promise.resolve({ saved: savedCount });
    }

    /**
     * 导出数据为JSON格式
     * @param {string} npcId - NPC ID
     * @returns {string} JSON字符串
     */
    exportToJSON(npcId) {
        const data = this.storage.get(npcId);
        if (!data) {
            return JSON.stringify({ error: 'NPC not found' });
        }
        return JSON.stringify(data);
    }

    /**
     * 从JSON导入数据
     * @param {string} jsonData - JSON字符串
     * @returns {Object} 导入结果
     */
    importFromJSON(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (!data.npcId) {
                return { success: false, error: 'Invalid data format: npcId required' };
            }
            this.storage.set(data.npcId, data);
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    /**
     * 删除指定NPC的数据
     * @param {string} npcId - NPC ID
     * @returns {Object} 删除结果
     */
    delete(npcId) {
        if (!this.storage.has(npcId)) {
            return { success: false, reason: 'NPC not found' };
        }
        this.storage.delete(npcId);
        return { success: true };
    }

    /**
     * 清空所有存储数据
     * @returns {Object} 清空结果
     */
    clearAll() {
        this.storage.clear();
        return { success: true };
    }

    /**
     * 获取所有已存储的NPC ID
     * @returns {string[]} NPC ID数组
     */
    getStoredNpcIds() {
        return Array.from(this.storage.keys());
    }

    /**
     * 检查NPC数据是否存在
     * @param {string} npcId - NPC ID
     * @returns {boolean} 是否存在
     */
    has(npcId) {
        return this.storage.has(npcId);
    }

    /**
     * 获取存储统计信息
     * @returns {Object} 统计信息
     */
    getStorageStats() {
        return {
            totalStored: this.storage.size,
            npcIds: this.getStoredNpcIds()
        };
    }
}

export default EvolutionDataPersistence;