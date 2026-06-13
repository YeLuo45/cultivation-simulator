/**
 * MemoryConsolidation - 四层记忆整合
 * V268 梦境记忆系统核心整合层
 *
 * 核心职责:
 *   - L0 瞬时记忆: 当前会话内的对话缓存（内存）
 *   - L1 会话记忆: 会话结束时写入 IndexedDB（按 NPC 分组）
 *   - L2 天级记忆: 每日 00:00 触发压缩，相同关键词合并
 *   - L3 永久记忆: 手动标记重要的对话永久保留
 *
 * 设计来源: generic-agent-design L0-L4 分层内存
 */

import { DreamMemoryStore } from './DreamMemoryStore.js';

export const MEMORY_LAYER = {
  L0: 0,  // 瞬时记忆（内存）
  L1: 1,  // 会话记忆（IndexedDB）
  L2: 2,  // 天级记忆（压缩后）
  L3: 3,  // 永久记忆
};

export class MemoryConsolidation {
  constructor() {
    // L0 层: 内存缓存，结构: Map<npcId, DreamEntry[]>
    this._l0Store = new Map();

    // L1 层: 引用 DreamMemoryStore
    this._dreamStore = new DreamMemoryStore();

    // 统计
    this._stats = {
      l0Count: 0,
      l1Count: 0,
      l2Count: 0,
      l3Count: 0,
    };
  }

  /**
   * 添加 L0 瞬时记忆
   * @param {string} npcId - NPC ID
   * @param {object} entry - 记忆条目 { content, emotion, keywords }
   */
  addL0(npcId, entry) {
    if (!this._l0Store.has(npcId)) {
      this._l0Store.set(npcId, []);
    }
    const entries = this._l0Store.get(npcId);
    const l0Entry = {
      id: `l0_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      npcId,
      content: entry.content || '',
      emotion: entry.emotion || '',
      keywords: Array.isArray(entry.keywords) ? entry.keywords : [],
      timestamp: Date.now(),
      layer: MEMORY_LAYER.L0,
    };
    entries.push(l0Entry);
    this._stats.l0Count = entries.length;
    return l0Entry.id;
  }

  /**
   * 获取 NPC 的所有 L0 记忆
   * @param {string} npcId
   * @returns {object[]}
   */
  getL0Entries(npcId) {
    return this._l0Store.get(npcId) || [];
  }

  /**
   * 获取 L0 记忆数量
   * @param {string} npcId
   * @returns {number}
   */
  getL0Count(npcId) {
    return this._l0Store.get(npcId)?.length || 0;
  }

  /**
   * 将 L0 记忆 Flush 到 L1（会话结束）
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @param {string} sessionId - 会话 ID
   * @returns {Promise<number>} 写入的记忆条数
   */
  async flushL0ToL1(npcId, playerId, sessionId) {
    const l0Entries = this._l0Store.get(npcId) || [];
    let written = 0;

    for (const entry of l0Entries) {
      await this._dreamStore.saveWithSession(
        npcId,
        playerId,
        entry.content,
        entry.emotion,
        entry.keywords,
        sessionId
      );
      written++;
    }

    // 清空 L0
    this._l0Store.set(npcId, []);
    this._stats.l0Count = 0;
    this._stats.l1Count += written;

    return written;
  }

  /**
   * 压缩 L0 到 L2（天级压缩，合并相同关键词）
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @returns {Promise<number>} 压缩后的条数
   */
  async compressToL2(npcId, playerId) {
    // 获取所有 L1 记忆
    const l1Entries = await this._dreamStore.query(npcId, playerId, 0, Date.now());

    // 按关键词分组
    const keywordMap = new Map();
    for (const entry of l1Entries) {
      for (const kw of (entry.keywords || [])) {
        if (!keywordMap.has(kw)) {
          keywordMap.set(kw, []);
        }
        keywordMap.get(kw).push(entry);
      }
    }

    // 合并同一关键词的多条记忆（保留最新内容）
    let compressed = 0;
    for (const [keyword, entries] of keywordMap) {
      if (entries.length > 1) {
        // 保留最新的一条
        const latest = entries.sort((a, b) => b.timestamp - a.timestamp)[0];
        // 删除其他的
        for (let i = 1; i < entries.length; i++) {
          await this._dreamStore.delete(entries[i].id);
          compressed++;
        }
        // 标记保留的为 L2 层
        await this._dreamStore.updateLayer(latest.id, MEMORY_LAYER.L2);
      }
    }

    this._stats.l2Count += compressed;
    return compressed;
  }

  /**
   * 标记记忆为永久（L3）
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @param {string} memoryId - 记忆 ID
   * @returns {Promise<boolean>}
   */
  async markPermanent(npcId, playerId, memoryId) {
    const result = await this._dreamStore.markPermanent(npcId, playerId, memoryId);
    if (result) {
      this._stats.l3Count++;
    }
    return result;
  }

  /**
   * 获取统计信息
   * @returns {object}
   */
  getStats() {
    return {
      l0Count: this._stats.l0Count,
      l1Count: this._stats.l1Count,
      l2Count: this._stats.l2Count,
      l3Count: this._stats.l3Count,
    };
  }

  /**
   * 重置统计数据
   */
  resetStats() {
    this._stats = { l0Count: 0, l1Count: 0, l2Count: 0, l3Count: 0 };
  }

  /**
   * 清除所有 L0 缓存（不写入 L1）
   * @param {string} npcId - NPC ID
   */
  clearL0(npcId) {
    if (this._l0Store.has(npcId)) {
      this._l0Store.set(npcId, []);
      this._stats.l0Count = 0;
    }
  }

  /**
   * 清除所有 L0 缓存（所有 NPC）
   */
  clearAllL0() {
    this._l0Store.clear();
    this._stats.l0Count = 0;
  }
}
