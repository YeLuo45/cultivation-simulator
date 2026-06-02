/**
 * DreamRecall - 梦境回忆
 * V268 梦境记忆系统核心回忆层
 *
 * 核心职责:
 *   - recall(): 获取 NPC 对该玩家的所有记忆，按时间倒序
 *   - getLastConversation(): 获取最近一次对话内容
 *   - hasDream(): 检查是否有记忆
 *   - getFamiliarityLevel(): 返回亲密度等级
 *
 * 亲密度等级:
 *   - stranger (陌生人): 0 条记忆
 *   - acquaintance (认识): 1-3 条记忆
 *   - familiar (熟悉): 4-9 条记忆
 *   - intimate (知己): 10+ 条记忆
 */

import { DreamMemoryStore } from './DreamMemoryStore.js';

export const FAMILIARITY = {
  STRANGER: 'stranger',      // 陌生人
  ACQUAINTANCE: 'acquaintance', // 认识
  FAMILIAR: 'familiar',     // 熟悉
  INTIMATE: 'intimate',     // 知己
};

const FAMILIARITY_THRESHOLDS = {
  [FAMILIARITY.STRANGER]: 0,
  [FAMILIARITY.ACQUAINTANCE]: 1,
  [FAMILIARITY.FAMILIAR]: 4,
  [FAMILIARITY.INTIMATE]: 10,
};

let _storeInstance = null;

export function getDreamStore() {
  if (!_storeInstance) {
    _storeInstance = new DreamMemoryStore();
  }
  return _storeInstance;
}

export function setDreamStore(store) {
  _storeInstance = store;
}

export class DreamRecall {
  constructor(store = null) {
    this._store = store || getDreamStore();
  }

  /**
   * 获取 NPC 对该玩家的所有记忆，按时间倒序
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @returns {Promise<Object[]>} 记忆列表
   */
  async recall(npcId, playerId) {
    const memories = await this._store.queryAll(npcId, playerId);
    // 按时间倒序（数据库已按 prev 顺序返回）
    return memories.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 获取最近一次对话内容
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @returns {Promise<Object|null>} 最近一次记忆或 null
   */
  async getLastConversation(npcId, playerId) {
    const memories = await this.recall(npcId, playerId);
    return memories.length > 0 ? memories[0] : null;
  }

  /**
   * 检查是否有记忆
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @returns {Promise<boolean>}
   */
  async hasDream(npcId, playerId) {
    const count = await this._store.getDreamCount(npcId, playerId);
    return count > 0;
  }

  /**
   * 获取记忆数量
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @returns {Promise<number>}
   */
  async getDreamCount(npcId, playerId) {
    return this._store.getDreamCount(npcId, playerId);
  }

  /**
   * 获取亲密度等级
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @returns {Promise<string>} FAMILIARITY 枚举值
   */
  async getFamiliarityLevel(npcId, playerId) {
    const count = await this.getDreamCount(npcId, playerId);
    return this._computeFamiliarity(count);
  }

  /**
   * 根据记忆数量计算亲密度等级
   * @param {number} count - 记忆数量
   * @returns {string} FAMILIARITY 枚举值
   */
  _computeFamiliarity(count) {
    if (count >= FAMILIARITY_THRESHOLDS[FAMILIARITY.INTIMATE]) {
      return FAMILIARITY.INTIMATE;
    }
    if (count >= FAMILIARITY_THRESHOLDS[FAMILIARITY.FAMILIAR]) {
      return FAMILIARITY.FAMILIAR;
    }
    if (count >= FAMILIARITY_THRESHOLDS[FAMILIARITY.ACQUAINTANCE]) {
      return FAMILIARITY.ACQUAINTANCE;
    }
    return FAMILIARITY.STRANGER;
  }

  /**
   * 根据记忆数量获取亲密度等级（静态版本）
   * @param {number} count - 记忆数量
   * @returns {string}
   */
  static computeFamiliarity(count) {
    if (count >= FAMILIARITY_THRESHOLDS[FAMILIARITY.INTIMATE]) {
      return FAMILIARITY.INTIMATE;
    }
    if (count >= FAMILIARITY_THRESHOLDS[FAMILIARITY.FAMILIAR]) {
      return FAMILIARITY.FAMILIAR;
    }
    if (count >= FAMILIARITY_THRESHOLDS[FAMILIARITY.ACQUAINTANCE]) {
      return FAMILIARITY.ACQUAINTANCE;
    }
    return FAMILIARITY.STRANGER;
  }

  /**
   * 获取亲密度描述文本
   * @param {string} level - FAMILIARITY 枚举值
   * @returns {string} 中文描述
   */
  static getFamiliarityText(level) {
    switch (level) {
      case FAMILIARITY.STRANGER: return '陌生人';
      case FAMILIARITY.ACQUAINTANCE: return '认识';
      case FAMILIARITY.FAMILIAR: return '熟悉';
      case FAMILIARITY.INTIMATE: return '知己';
      default: return '未知';
    }
  }

  /**
   * 获取某一段时间范围内的记忆
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @param {number} since - 开始时间戳
   * @param {number} until - 结束时间戳
   * @returns {Promise<Object[]>}
   */
  async getMemoriesInRange(npcId, playerId, since, until) {
    return this._store.query(npcId, playerId, since, until);
  }

  /**
   * 获取特定层级的记忆
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @param {number} layer - 层级 (0-3)
   * @returns {Promise<Object[]>}
   */
  async getMemoriesByLayer(npcId, playerId, layer) {
    return this._store.getByLayer(npcId, playerId, layer);
  }

  /**
   * 获取有特定情感标签的记忆
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @param {string} emotion - 情感标签
   * @returns {Promise<Object[]>}
   */
  async getMemoriesByEmotion(npcId, playerId, emotion) {
    const all = await this.recall(npcId, playerId);
    return all.filter(m => m.emotion === emotion);
  }

  /**
   * 获取包含特定关键词的记忆
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @param {string} keyword - 关键词
   * @returns {Promise<Object[]>}
   */
  async searchByKeyword(npcId, playerId, keyword) {
    const all = await this.recall(npcId, playerId);
    return all.filter(m =>
      (m.keywords || []).some(k => k.includes(keyword)) ||
      m.content.includes(keyword)
    );
  }

  /**
   * 获取关联的 DreamMemoryStore
   * @returns {DreamMemoryStore}
   */
  getStore() {
    return this._store;
  }
}