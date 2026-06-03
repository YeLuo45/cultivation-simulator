/**
 * DialogueMemoryBridge - NPCDialogueService 与 DreamMemoryStore 集成桥接
 * V268 Iteration 2/9 - Dream Memory UI 集成
 *
 * 核心职责:
 *   - NPCDialogueService 对话结束后同步到 DreamMemoryStore
 *   - NPCDialogueService 启动时从 DreamMemoryStore 加载记忆
 *   - 提供基于 Dream Memory 的上下文丰富
 *
 * 设计来源: nanobot-design MessageBus 事件驱动
 */

import { DreamMemoryStore } from './DreamMemoryStore.js';
import { DreamRecall, FAMILIARITY } from './DreamRecall.js';

let _bridgeInstance = null;

/**
 * 创建 DialogueMemoryBridge 单例
 * @param {object} dialogueService - NPCDialogueService 实例
 * @returns {DialogueMemoryBridge}
 */
export function createDialogueMemoryBridge(dialogueService) {
  if (_bridgeInstance) {
    return _bridgeInstance;
  }

  const dreamStore = new DreamMemoryStore();
  const dreamRecall = new DreamRecall();

  _bridgeInstance = new DialogueMemoryBridge(dialogueService, dreamStore, dreamRecall);
  return _bridgeInstance;
}

/**
 * 重置单例（用于测试）
 */
export function resetDialogueMemoryBridge() {
  _bridgeInstance = null;
}

class DialogueMemoryBridge {
  /**
   * @param {object} dialogueService - NPCDialogueService 实例
   * @param {DreamMemoryStore} dreamStore
   * @param {DreamRecall} dreamRecall
   */
  constructor(dialogueService, dreamStore, dreamRecall) {
    this._dialogueService = dialogueService;
    this._dreamStore = dreamStore;
    this._dreamRecall = dreamRecall;
  }

  // ===== 导出属性 =====

  get dreamStore() {
    return this._dreamStore;
  }

  get dreamRecall() {
    return this._dreamRecall;
  }

  // ===== 集成方法 =====

  /**
   * 对话开始前加载记忆到 NPCDialogueService
   * @param {string} npcId
   * @param {string} playerId
   * @returns {Promise<object>} { loadedCount, familiarity }
   */
  async preloadMemories(npcId, playerId = 'player') {
    // 从 IndexedDB 获取该 NPC 与玩家的所有记忆
    const memories = await this._dreamStore.queryAll(npcId, playerId);

    if (memories.length === 0) {
      return { loadedCount: 0, familiarity: FAMILIARITY.STRANGER };
    }

    // 计算亲密度
    const familiarity = await this._dreamRecall.getFamiliarityLevel(npcId, playerId);

    // 将 IndexedDB 的记忆注入到 NPCDialogueService 的内存中
    let loadedCount = 0;
    for (const mem of memories) {
      if (mem.type === 'interaction' || mem.type === 'dialogue') {
        // 只加载对话类记忆
        this._dialogueService.recordMemory(npcId, 'dream_memory', {
          content: mem.content,
          emotion: mem.emotion || '',
          keywords: mem.keywords || [],
        }, {
          importance: 0.7, // Dream memory 较高重要性
          timestamp: mem.timestamp,
        });
        loadedCount++;
      }
    }

    return { loadedCount, familiarity };
  }

  /**
   * 对话结束后归档到 DreamMemoryStore
   * @param {string} npcId
   * @param {string} playerId
   * @param {string} playerMessage
   * @param {string} npcResponse
   * @param {string} emotion
   * @param {string[]} keywords
   * @returns {Promise<object>}
   */
  async archiveDialogue(npcId, playerId, playerMessage, npcResponse, emotion = '', keywords = []) {
    // 收集 NPCDialogueService 当前的记忆
    const localMemories = this._dialogueService.getMemories(npcId);

    // 找最新的对话记忆
    const latestInteraction = localMemories
      .filter(m => m.type === 'interaction' || m.type === 'dream_memory')
      .slice(-1)[0];

    const content = latestInteraction
      ? latestInteraction.content.playerMessage + ' | ' + latestInteraction.content.npcResponse
      : playerMessage + ' | ' + npcResponse;

    const memoryId = await this._dreamStore.save(npcId, playerId, content, {
      type: 'dialogue',
      emotion,
      keywords,
    });

    return { memoryId, written: 1 };
  }

  /**
   * 获取 NPC 的亲密度等级描述
   * @param {string} npcId
   * @param {string} playerId
   * @returns {Promise<string>}
   */
  async getFamiliarityLabel(npcId, playerId = 'player') {
    const level = await this._dreamRecall.getFamiliarityLevel(npcId, playerId);
    const labelMap = {
      [FAMILIARITY.STRANGER]: '陌生',
      [FAMILIARITY.ACQUAINTANCE]: '相识',
      [FAMILIARITY.FAMILIAR]: '熟悉',
      [FAMILIARITY.INTIMATE]: '亲密',
    };
    return labelMap[level] || '陌生';
  }

  /**
   * 获取记忆概览（用于 UI 面板）
   * @param {string} npcId
   * @param {string} playerId
   * @param {number} limit
   * @returns {Promise<object>}
   */
  async getMemoryOverview(npcId, playerId = 'player', limit = 10) {
    const dreams = await this._dreamRecall.recall(npcId, playerId, limit);
    const familiarity = await this._dreamRecall.getFamiliarityLevel(npcId, playerId);
    const total = await this._dreamStore.getDreamCount(npcId, playerId);

    return {
      npcId,
      playerId,
      totalDreams: total,
      familiarity,
      familiarityLabel: await this.getFamiliarityLabel(npcId, playerId),
      recentDreams: dreams.slice(0, 5).map(d => ({
        content: d.content.substring(0, 80) + (d.content.length > 80 ? '...' : ''),
        timestamp: d.timestamp,
        emotion: d.emotion,
      })),
    };
  }

  /**
   * 搜索记忆
   * @param {string} npcId
   * @param {string} playerId
   * @param {string} keyword
   * @returns {Promise<object[]>}
   */
  async searchMemories(npcId, playerId, keyword) {
    return this._dreamRecall.searchByKeyword(npcId, playerId, keyword);
  }

  /**
   * 获取亲密度颜色（用于 UI）
   * @param {string} npcId
   * @param {string} playerId
   * @returns {Promise<string>} hex color
   */
  async getFamiliarityColor(npcId, playerId = 'player') {
    const level = await this._dreamRecall.getFamiliarityLevel(npcId, playerId);
    const colorMap = {
      [FAMILIARITY.STRANGER]: '#888888',
      [FAMILIARITY.ACQUAINTANCE]: '#4CAF50',
      [FAMILIARITY.FAMILIAR]: '#2196F3',
      [FAMILIARITY.INTIMATE]: '#9C27B0',
    };
    return colorMap[level] || '#888888';
  }
}