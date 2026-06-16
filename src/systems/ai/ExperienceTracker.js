/**
 * ExperienceTracker.js - NPC经验追踪器
 * V277 Iteration 1/9 - NPC Self-Evolution Engine Core
 * 
 * 核心机制：
 * 1. 追踪每个NPC的交互经验
 * 2. 实时更新行为评分
 * 3. 维护历史交互记录
 * 4. 裁剪旧记录保持性能
 */

/**
 * ExperienceTracker - 经验追踪器
 * 追踪每个NPC的交互经验，实时更新行为评分
 */
export class ExperienceTracker {
    /**
     * @param {number} maxRecords - 每个NPC最大记录数，默认100
     */
    constructor(maxRecords = 100) {
        this.maxRecords = maxRecords;
        this.records = new Map(); // npcId -> InteractionRecord[]
    }

    /**
     * 记录单次交互
     * @param {string} npcId - NPC ID
     * @param {Object} interaction - 交互数据 {type, playerAction, npcResponse, outcome: {success, satisfaction}}
     * @returns {Object} 记录结果
     */
    track(npcId, interaction) {
        if (!this.records.has(npcId)) {
            this.records.set(npcId, []);
        }

        const record = {
            id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            npcId,
            type: interaction.type || 'unknown',
            playerAction: interaction.playerAction || '',
            npcResponse: interaction.npcResponse || '',
            outcome: {
                success: interaction.outcome?.success ?? false,
                satisfaction: interaction.outcome?.satisfaction ?? 0.5
            },
            timestamp: Date.now()
        };

        const records = this.records.get(npcId);
        records.push(record);

        // 如果超过maxRecords，自动裁剪
        if (records.length > this.maxRecords) {
            this.prune(npcId);
        }

        return { success: true, record };
    }

    /**
     * 获取NPC统计信息
     * @param {string} npcId - NPC ID
     * @returns {Object} 统计信息 { totalInteractions, successRate, avgSatisfaction, adaptationLevel, lastInteraction }
     */
    getStats(npcId) {
        const records = this.records.get(npcId) || [];
        
        if (records.length === 0) {
            return {
                totalInteractions: 0,
                successRate: 0,
                avgSatisfaction: 0,
                adaptationLevel: 0,
                lastInteraction: null
            };
        }

        const totalInteractions = records.length;
        const successfulInteractions = records.filter(r => r.outcome.success).length;
        const successRate = successfulInteractions / totalInteractions;
        
        const totalSatisfaction = records.reduce((sum, r) => sum + r.outcome.satisfaction, 0);
        const avgSatisfaction = totalSatisfaction / totalInteractions;
        
        // adaptationLevel 基于成功率和交互次数计算 (1-10)
        const baseLevel = 1;
        const maxLevel = 10;
        const interactionBonus = Math.min(Math.floor(totalInteractions / 10), 5);
        const successBonus = Math.floor(successRate * 5);
        const adaptationLevel = Math.min(baseLevel + interactionBonus + successBonus, maxLevel);
        
        const lastInteraction = records[records.length - 1];

        return {
            totalInteractions,
            successRate: Math.round(successRate * 100) / 100,
            avgSatisfaction: Math.round(avgSatisfaction * 100) / 100,
            adaptationLevel,
            lastInteraction
        };
    }

    /**
     * 裁剪旧记录，保留最近maxRecords条
     * @param {string} npcId - NPC ID
     * @param {number} maxRecords - 最大记录数，默认构造函数的值
     * @returns {Object} 裁剪结果
     */
    prune(npcId, maxRecords = this.maxRecords) {
        const records = this.records.get(npcId) || [];
        
        if (records.length <= maxRecords) {
            return { success: true, pruned: 0 };
        }

        const pruned = records.length - maxRecords;
        this.records.set(npcId, records.slice(-maxRecords));
        
        return { success: true, pruned };
    }

    /**
     * 清空指定NPC记录
     * @param {string} npcId - NPC ID
     * @returns {Object} 清除结果
     */
    clear(npcId) {
        if (!this.records.has(npcId)) {
            return { success: false, reason: 'NPC not found' };
        }

        this.records.delete(npcId);
        return { success: true, cleared: true };
    }

    /**
     * 获取所有NPC ID列表
     * @returns {string[]} NPC ID数组
     */
    getAllNpcIds() {
        return Array.from(this.records.keys());
    }

    /**
     * 获取指定NPC的所有记录
     * @param {string} npcId - NPC ID
     * @returns {Object[]} 记录数组
     */
    getRecords(npcId) {
        return this.records.get(npcId) || [];
    }

    /**
     * 获取最近的N条记录
     * @param {string} npcId - NPC ID
     * @param {number} n - 记录数
     * @returns {Object[]} 记录数组
     */
    getRecentRecords(npcId, n = 10) {
        const records = this.records.get(npcId) || [];
        return records.slice(-n);
    }

    /**
     * 计算适配度分数 (0-1)
     * @param {string} npcId - NPC ID
     * @returns {number} 适配度分数
     */
    getAdaptationScore(npcId) {
        const stats = this.getStats(npcId);
        if (stats.totalInteractions === 0) return 0;
        
        // 综合成功率、满意度和交互次数
        const successWeight = 0.4;
        const satisfactionWeight = 0.4;
        const interactionWeight = 0.2;
        
        const interactionFactor = Math.min(stats.totalInteractions / 100, 1);
        
        return Math.round(
            (stats.successRate * successWeight + 
             stats.avgSatisfaction * satisfactionWeight + 
             interactionFactor * interactionWeight) * 100
        ) / 100;
    }
}

export default ExperienceTracker;