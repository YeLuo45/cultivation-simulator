/**
 * NPCDreamBridge - NPC 梦境记忆集成桥接
 * V268 梦境记忆系统 NPC 集成层
 *
 * 核心职责:
 *   - 对话结束时自动归档到 DreamMemoryStore
 *   - 对话开始时触发 DreamRecall.recall()
 *   - 提供 NPC 记忆状态面板数据
 *
 * 设计来源: nanobot-design MessageBus 事件驱动
 */

import { DreamMemoryStore } from './DreamMemoryStore.js';
import { DreamRecall, FAMILIARITY } from './DreamRecall.js';
import { MemoryConsolidation } from './MemoryConsolidation.js';

let _bridgeInstance = null;

export function createNPCDreamBridge(gameState) {
  if (_bridgeInstance) {
    return _bridgeInstance;
  }

  const dreamStore = new DreamMemoryStore();
  const dreamRecall = new DreamRecall(gameState);
  const memoryConsolidation = new MemoryConsolidation();

  // 当前活跃的会话映射: npcId -> sessionId
  const _activeSessions = new Map();

  class NPCDreamBridge {
    constructor() {
      this._dreamStore = dreamStore;
      this._dreamRecall = dreamRecall;
      this._memoryConsolidation = memoryConsolidation;
      this._gameState = gameState;
    }

    /**
     * 开始对话 - 触发回忆
     * @param {string} npcId - NPC ID
     * @param {string} playerId - 玩家 ID
     * @returns {Promise<object>} 回忆结果 { hasDream, familiarity, lastConversation }
     */
    async onDialogueStart(npcId, playerId) {
      // 生成会话 ID
      const sessionId = `session_${Date.now()}_${npcId}_${playerId}`;
      _activeSessions.set(npcId, sessionId);

      // 触发回忆
      const familiarity = await this._dreamRecall.getFamiliarityLevel(npcId, playerId);
      const hasDream = await this._dreamRecall.hasDream(npcId, playerId);
      const lastConversation = hasDream
        ? await this._dreamRecall.getLastConversation(npcId, playerId)
        : null;

      return {
        sessionId,
        familiarity,
        hasDream,
        lastConversation,
        familiarityLabel: this._getFamiliarityLabel(familiarity),
      };
    }

    /**
     * 对话进行中 - 添加瞬时记忆（L0）
     * @param {string} npcId - NPC ID
     * @param {string} content - 对话内容
     * @param {string} emotion - 情感标签
     * @param {string[]} keywords - 关键词
     */
    onDialogueProgress(npcId, content, emotion = '', keywords = []) {
      // 只添加到 L0，不写入 IndexedDB
      this._memoryConsolidation.addL0(npcId, { content, emotion, keywords });
    }

    /**
     * 结束对话 - 归档会话记忆（L0 → L1）
     * @param {string} npcId - NPC ID
     * @param {string} playerId - 玩家 ID
     * @returns {Promise<object>} 归档结果
     */
    async onDialogueEnd(npcId, playerId) {
      const sessionId = _activeSessions.get(npcId);
      _activeSessions.delete(npcId);

      if (!sessionId) {
        return { written: 0, sessionId: null };
      }

      // L0 → L1
      const written = await this._memoryConsolidation.flushL0ToL1(npcId, playerId, sessionId);

      return { written, sessionId };
    }

    /**
     * 取消对话 - 清除 L0 缓存
     * @param {string} npcId - NPC ID
     */
    onDialogueCancel(npcId) {
      this._memoryConsolidation.clearL0(npcId);
      _activeSessions.delete(npcId);
    }

    /**
     * 获取 NPC 对玩家的记忆概览
     * @param {string} npcId - NPC ID
     * @param {string} playerId - 玩家 ID
     * @returns {Promise<object>}
     */
    async getMemoryOverview(npcId, playerId) {
      const familiarity = await this._dreamRecall.getFamiliarityLevel(npcId, playerId);
      const totalDreams = await this._dreamStore.getDreamCount(npcId, playerId);
      const recentDreams = await this._dreamRecall.recall(npcId, playerId, 10);

      return {
        npcId,
        playerId,
        familiarity,
        familiarityLabel: this._getFamiliarityLabel(familiarity),
        totalDreams,
        recentDreams: recentDreams.slice(0, 3).map(d => ({
          content: d.content.substring(0, 50) + (d.content.length > 50 ? '...' : ''),
          timestamp: d.timestamp,
        })),
      };
    }

    /**
     * 标记对话为永久记忆（L3）
     * @param {string} npcId - NPC ID
     * @param {string} playerId - 玩家 ID
     * @param {string} memoryId - 记忆 ID
     * @returns {Promise<boolean>}
     */
    async markPermanent(npcId, playerId, memoryId) {
      return this._memoryConsolidation.markPermanent(npcId, playerId, memoryId);
    }

    /**
     * 压缩天级记忆（L1 → L2）
     * @param {string} npcId - NPC ID
     * @param {string} playerId - 玩家 ID
     * @returns {Promise<number>}
     */
    async compressDaily(npcId, playerId) {
      return this._memoryConsolidation.compressToL2(npcId, playerId);
    }

    /**
     * 获取记忆整合统计
     * @returns {object}
     */
    getConsolidationStats() {
      return this._memoryConsolidation.getStats();
    }

    /**
     * 获取亲密度标签
     * @param {string} familiarity - FAMILIARITY enum 值
     * @returns {string}
     */
    _getFamiliarityLabel(familiarity) {
      const labels = {
        [FAMILIARITY.STRANGER]: '陌生人',
        [FAMILIARITY.ACQUAINTANCE]: '认识',
        [FAMILIARITY.FAMILIAR]: '熟悉',
        [FAMILIARITY.INTIMATE]: '知己',
      };
      return labels[familiarity] || '未知';
    }

    /**
     * 获取当前活跃会话数
     * @returns {number}
     */
    getActiveSessionCount() {
      return _activeSessions.size;
    }

    /**
     * 检查 NPC 是否有活跃会话
     * @param {string} npcId
     * @returns {boolean}
     */
    hasActiveSession(npcId) {
      return _activeSessions.has(npcId);
    }
  }

  _bridgeInstance = new NPCDreamBridge();
  return _bridgeInstance;
}

/**
 * 重置桥接单例（用于测试）
 */
export function resetNPCDreamBridge() {
  _bridgeInstance = null;
}
