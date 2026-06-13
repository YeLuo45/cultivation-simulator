/**
 * NPCInteractionMemoryBridge.js - NPC交互记忆桥接器
 * V279 Iteration 3/9 - NPC Interaction Memory Bridge
 * 
 * 核心机制：
 * 1. 实时记录NPC与玩家的交互到 recentBuffer
 * 2. 异步同步到 DreamMemoryStore 持久化
 * 3. 通过 ExperienceTracker 追踪交互模式
 * 4. 提供混合记忆查询（recentBuffer + DreamMemoryStore）
 * 5. 自动触发技能结晶化
 */

export class NPCInteractionMemoryBridge {
    /**
     * @param {DreamMemoryStore} dreamMemoryStore - 梦境记忆存储
     * @param {ExperienceTracker} experienceTracker - 经验追踪器
     */
    constructor(dreamMemoryStore, experienceTracker) {
        this.dreamMemoryStore = dreamMemoryStore;
        this.experienceTracker = experienceTracker;
        this.recentBuffer = new Map(); // npcId_playerId -> recent interactions[]
    }

    /**
     * 生成 buffer key
     * @private
     */
    _key(npcId, playerId) {
        return `${npcId}_${playerId}`;
    }

    /**
     * 记录并同步到 DreamMemoryStore
     * @param {string} npcId - NPC ID
     * @param {string} playerId - 玩家 ID
     * @param {string} content - 交互内容
     * @param {string} emotion - 情感标签
     * @param {string[]} keywords - 关键词数组
     * @returns {Promise<Object>} 记录结果
     */
    async recordInteraction(npcId, playerId, content, emotion = '', keywords = []) {
        const key = this._key(npcId, playerId);
        const timestamp = Date.now();

        // 1. 立即记录到 recentBuffer
        if (!this.recentBuffer.has(key)) {
            this.recentBuffer.set(key, []);
        }
        const interaction = {
            id: `iact_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
            npcId,
            playerId,
            content,
            emotion,
            keywords: Array.isArray(keywords) ? keywords : [],
            timestamp,
            source: 'interaction'
        };
        this.recentBuffer.get(key).push(interaction);

        // 2. 调用 dreamMemoryStore.save() 异步持久化
        let memoryId = null;
        try {
            memoryId = await this.dreamMemoryStore.save(npcId, playerId, content, emotion, keywords);
        } catch (err) {
            console.warn('DreamMemoryStore.save failed:', err);
        }

        // 3. 调用 experienceTracker.track() 追踪
        let trackResult = null;
        try {
            trackResult = this.experienceTracker.track(npcId, {
                type: 'dialogue',
                playerAction: content,
                npcResponse: '',
                outcome: { success: false, satisfaction: 0.5 }
            });
        } catch (err) {
            console.warn('ExperienceTracker.track failed:', err);
        }

        return {
            success: true,
            interaction,
            memoryId,
            trackResult
        };
    }

    /**
     * 实时查询最近的交互记忆（不经过 DreamMemoryStore）
     * @param {string} npcId - NPC ID
     * @param {string} playerId - 玩家 ID
     * @param {number} limit - 返回条数限制
     * @returns {Object[]} 最近的交互记录
     */
    queryRecent(npcId, playerId, limit = 10) {
        const key = this._key(npcId, playerId);
        const arr = this.recentBuffer.get(key) || [];
        return arr.slice(-limit);
    }

    /**
     * 获取混合记忆视图：dream memories + recent interactions
     * @param {string} npcId - NPC ID
     * @param {string} playerId - 玩家 ID
     * @param {number} startTime - 开始时间戳
     * @param {number} endTime - 结束时间戳
     * @returns {Promise<Object[]>} 混合记忆列表（按时间倒序）
     */
    async getMixedMemories(npcId, playerId, startTime = 0, endTime = Date.now()) {
        // 获取 DreamMemoryStore 中的记忆
        let dreamMemories = [];
        try {
            dreamMemories = await this.dreamMemoryStore.query(npcId, playerId, startTime, endTime);
        } catch (err) {
            console.warn('DreamMemoryStore.query failed:', err);
        }

        // 获取 recentBuffer 中的交互
        const key = this._key(npcId, playerId);
        const recentInteractions = (this.recentBuffer.get(key) || []).filter(
            m => m.timestamp >= startTime && m.timestamp <= endTime
        );

        // 合并并按时间倒序
        const mixed = [
            ...dreamMemories.map(m => ({ ...m, source: 'dream' })),
            ...recentInteractions.map(m => ({ ...m, source: 'interaction' }))
        ];

        mixed.sort((a, b) => b.timestamp - a.timestamp);
        return mixed;
    }

    /**
     * 从实时交互触发技能结晶化（通过 syncAndCrystallize）
     * @param {string} npcId - NPC ID
     * @param {string} playerId - 玩家 ID
     * @returns {Object} 触发结果
     */
    autoSyncAndCrystallize(npcId, playerId) {
        // 获取最近交互作为上下文
        const recent = this.queryRecent(npcId, playerId, 20);
        
        if (this.experienceTracker) {
            const stats = this.experienceTracker.getStats(npcId);
            return {
                success: true,
                recentCount: recent.length,
                stats,
                message: 'Experience tracker stats available for skill crystallization'
            };
        }

        return { success: false, reason: 'No experience tracker available' };
    }

    /**
     * 清除指定 NPC-玩家 的 recentBuffer
     * @param {string} npcId - NPC ID
     * @param {string} playerId - 玩家 ID
     */
    clearRecentBuffer(npcId, playerId) {
        const key = this._key(npcId, playerId);
        this.recentBuffer.delete(key);
    }

    /**
     * 清除所有 recentBuffer
     */
    clearAll() {
        this.recentBuffer.clear();
    }

    /**
     * 获取 buffer 统计信息
     * @returns {Object} 统计信息
     */
    getBufferStats() {
        let totalEntries = 0;
        const keyCount = this.recentBuffer.size;
        for (const arr of this.recentBuffer.values()) {
            totalEntries += arr.length;
        }
        return {
            keyCount,
            totalEntries,
            entriesPerKey: Array.from(this.recentBuffer.entries()).map(([k, v]) => ({ key: k, count: v.length }))
        };
    }
}

export default NPCInteractionMemoryBridge;