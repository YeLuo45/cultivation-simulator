/**
 * InteractionBuffer.js - NPC交互缓冲器
 * V279 Iteration 3/9 - NPC Interaction Memory Bridge
 * 
 * 核心机制：
 * 1. 批量缓冲 NPC 交互记录
 * 2. 减少 IndexedDB 写入频率
 * 3. 自动定时 flush 到 DreamMemoryStore
 */

export class InteractionBuffer {
    /**
     * @param {number} flushIntervalMs - 自动 flush 间隔（毫秒），默认 5000
     */
    constructor(flushIntervalMs = 5000) {
        this.buffer = new Map(); // npcId_playerId -> interaction[]
        this.flushIntervalMs = flushIntervalMs;
        this.flushTimer = null;
    }

    /**
     * 生成 buffer key
     * @private
     */
    _key(npcId, playerId) {
        return `${npcId}_${playerId}`;
    }

    /**
     * 缓冲单次交互
     * @param {Object} interaction - 交互对象 { npcId, playerId, content, emotion, keywords, timestamp }
     */
    push(interaction) {
        const key = this._key(interaction.npcId, interaction.playerId);
        if (!this.buffer.has(key)) {
            this.buffer.set(key, []);
        }

        const entry = {
            ...interaction,
            id: interaction.id || `ibuf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: interaction.timestamp || Date.now()
        };

        this.buffer.get(key).push(entry);
        return entry;
    }

    /**
     * 批量写入 DreamMemoryStore
     * @param {DreamMemoryStore} dreamMemoryStore - 梦境记忆存储实例
     * @returns {Promise<Object>} flush 结果
     */
    async flush(dreamMemoryStore) {
        if (!dreamMemoryStore) {
            return { success: false, reason: 'No DreamMemoryStore provided' };
        }

        if (this.buffer.size === 0) {
            return { success: true, flushed: 0 };
        }

        const results = [];
        let flushedCount = 0;
        let errorCount = 0;

        for (const [key, interactions] of this.buffer.entries()) {
            if (interactions.length === 0) continue;

            const [npcId, playerId] = key.split('_');

            for (const interaction of interactions) {
                try {
                    await dreamMemoryStore.save(
                        npcId,
                        playerId,
                        interaction.content || '',
                        interaction.emotion || '',
                        interaction.keywords || []
                    );
                    flushedCount++;
                } catch (err) {
                    errorCount++;
                    results.push({ key, interaction, error: err.message });
                }
            }
        }

        // 清空 buffer
        this.buffer.clear();

        return {
            success: errorCount === 0,
            flushed: flushedCount,
            errors: errorCount,
            details: results
        };
    }

    /**
     * 获取指定 NPC-玩家 的 buffer 内容
     * @param {string} npcId - NPC ID
     * @param {string} playerId - 玩家 ID
     * @returns {Object[]} buffer 数组
     */
    getBuffer(npcId, playerId) {
        const key = this._key(npcId, playerId);
        return this.buffer.get(key) || [];
    }

    /**
     * 清除指定 NPC-玩家 的 buffer
     * @param {string} npcId - NPC ID
     * @param {string} playerId - 玩家 ID
     */
    clear(npcId, playerId) {
        const key = this._key(npcId, playerId);
        this.buffer.delete(key);
    }

    /**
     * 清除所有 buffer
     */
    clearAll() {
        this.buffer.clear();
    }

    /**
     * 启动自动 flush 定时器
     * @param {DreamMemoryStore} dreamMemoryStore - 梦境记忆存储实例
     */
    startAutoFlush(dreamMemoryStore) {
        this.stopAutoFlush();
        this.flushTimer = setInterval(() => {
            this.flush(dreamMemoryStore).catch(err => {
                console.warn('InteractionBuffer auto-flush error:', err);
            });
        }, this.flushIntervalMs);
    }

    /**
     * 停止自动 flush 定时器
     */
    stopAutoFlush() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
    }

    /**
     * 获取 buffer 统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        let totalEntries = 0;
        const keyCount = this.buffer.size;
        for (const arr of this.buffer.values()) {
            totalEntries += arr.length;
        }
        return {
            flushIntervalMs: this.flushIntervalMs,
            keyCount,
            totalEntries,
            entriesPerKey: Array.from(this.buffer.entries()).map(([k, v]) => ({ key: k, count: v.length }))
        };
    }

    /**
     * 判断是否有待 flush 的数据
     * @returns {boolean}
     */
    hasPendingData() {
        return this.buffer.size > 0;
    }
}

export default InteractionBuffer;