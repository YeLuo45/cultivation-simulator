/**
 * DreamMemoryMCPService - 梦境记忆 MCP 服务
 * V268 Iteration 5/9 - Dream Memory MCP Server 集成
 *
 * 核心职责:
 *   - 提供 dream.* 系列 MCP 工具
 *   - 与游戏状态集成
 *
 * MCP 工具列表:
 *   - dream.save: 保存梦境记忆
 *   - dream.query: 查询梦境记忆
 *   - dream.getOverview: 获取记忆概览
 *   - dream.search: 搜索记忆
 *   - dream.getFamiliarity: 获取亲密度
 *   - dream.listRecent: 列出最近记忆
 */

import { createDreamMemoryStore } from '../ai/DreamMemoryStore.js';
import { createDreamRecall } from '../ai/DreamRecall.js';
import { createDialogueMemoryBridge } from '../ai/DialogueMemoryBridge.js';
import { createDreamPersistence } from '../ai/DreamPersistence.js';

let _instance = null;

/**
 * 创建 MCP 服务单例
 * @param {object} gameState - 游戏状态
 * @returns {DreamMemoryMCPService}
 */
export function createDreamMemoryMCPService(gameState) {
  if (!_instance) {
    _instance = new DreamMemoryMCPService(gameState);
  }
  return _instance;
}

/**
 * 获取 MCP 工具定义
 */
export const DREAM_MEMORY_MCP_TOOLS = {
  'dream.save': {
    description: '保存梦境记忆',
    parameters: {
      type: 'object',
      properties: {
        npcId: { type: 'string', description: 'NPC ID' },
        playerId: { type: 'string', description: '玩家 ID', default: 'player' },
        content: { type: 'string', description: '记忆内容' },
        sessionId: { type: 'string', description: '会话 ID' },
        emotion: { type: 'string', description: '情感标签' },
        keywords: { type: 'array', items: { type: 'string' }, description: '关键词' },
      },
      required: ['npcId', 'content'],
    },
  },
  'dream.query': {
    description: '查询梦境记忆',
    parameters: {
      type: 'object',
      properties: {
        npcId: { type: 'string', description: 'NPC ID' },
        playerId: { type: 'string', description: '玩家 ID', default: 'player' },
        limit: { type: 'number', description: '返回数量', default: 10 },
      },
      required: ['npcId'],
    },
  },
  'dream.getOverview': {
    description: '获取记忆概览',
    parameters: {
      type: 'object',
      properties: {
        npcId: { type: 'string', description: 'NPC ID' },
        playerId: { type: 'string', description: '玩家 ID', default: 'player' },
        limit: { type: 'number', description: '最近记忆数量', default: 10 },
      },
      required: ['npcId'],
    },
  },
  'dream.search': {
    description: '搜索记忆',
    parameters: {
      type: 'object',
      properties: {
        npcId: { type: 'string', description: 'NPC ID' },
        playerId: { type: 'string', description: '玩家 ID', default: 'player' },
        keyword: { type: 'string', description: '搜索关键词' },
      },
      required: ['npcId', 'keyword'],
    },
  },
  'dream.getFamiliarity': {
    description: '获取亲密度',
    parameters: {
      type: 'object',
      properties: {
        npcId: { type: 'string', description: 'NPC ID' },
        playerId: { type: 'string', description: '玩家 ID', default: 'player' },
      },
      required: ['npcId'],
    },
  },
  'dream.listRecent': {
    description: '列出最近记忆',
    parameters: {
      type: 'object',
      properties: {
        npcId: { type: 'string', description: 'NPC ID' },
        playerId: { type: 'string', description: '玩家 ID', default: 'player' },
        limit: { type: 'number', description: '返回数量', default: 5 },
      },
      required: ['npcId'],
    },
  },
};

class DreamMemoryMCPService {
  constructor(gameState) {
    this._gameState = gameState;
    // Lazy initialization to avoid IndexedDB access during construction
    this._store = null;
    this._recall = null;
    this._bridge = null;
    this._persistence = null;
  }

  _ensureInitialized() {
    if (!this._store) {
      this._store = createDreamMemoryStore(this._gameState);
      this._recall = createDreamRecall(this._store);
      this._bridge = createDialogueMemoryBridge(null);
      this._persistence = createDreamPersistence(this._store);
    }
  }

  // ===== MCP 工具实现 =====

  /**
   * MCP: dream.save
   */
  async dreamSave(params = {}) {
    this._ensureInitialized();
    const { npcId, playerId = 'player', content, sessionId, emotion, keywords } = params;
    try {
      const result = await this._bridge.archiveDialogue(npcId, playerId, content, '', emotion, keywords);
      return { success: true, memoryId: result.memoryId };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * MCP: dream.query
   */
  async dreamQuery(params = {}) {
    this._ensureInitialized();
    const { npcId, playerId = 'player', limit = 10 } = params;
    try {
      const dreams = await this._recall.getRecentDreams(npcId, playerId, limit);
      return { success: true, dreams };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * MCP: dream.getOverview
   */
  async dreamGetOverview(params = {}) {
    this._ensureInitialized();
    const { npcId, playerId = 'player', limit = 10 } = params;
    try {
      const overview = await this._bridge.getMemoryOverview(npcId, playerId, limit);
      return { success: true, ...overview };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * MCP: dream.search
   */
  async dreamSearch(params = {}) {
    this._ensureInitialized();
    const { npcId, playerId = 'player', keyword } = params;
    try {
      const results = await this._bridge.searchMemories(npcId, playerId, keyword);
      return { success: true, results };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * MCP: dream.getFamiliarity
   */
  async dreamGetFamiliarity(params = {}) {
    this._ensureInitialized();
    const { npcId, playerId = 'player' } = params;
    try {
      const label = await this._bridge.getFamiliarityLabel(npcId, playerId);
      const color = await this._bridge.getFamiliarityColor(npcId, playerId);
      const level = await this._recall.getFamiliarityLevel(npcId, playerId);
      return { success: true, familiarity: level, label, color };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * MCP: dream.listRecent
   */
  async dreamListRecent(params = {}) {
    this._ensureInitialized();
    const { npcId, playerId = 'player', limit = 5 } = params;
    try {
      const dreams = await this._recall.getRecentDreams(npcId, playerId, limit);
      return {
        success: true,
        dreams: dreams.map(d => ({
          content: d.content,
          emotion: d.emotion,
          timestamp: d.timestamp,
        })),
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // ===== 生命周期 =====

  /**
   * 初始化服务
   */
  async init(gameState) {
    this._gameState = gameState;
    return this;
  }

  /**
   * 导出工具定义
   */
  getToolDefinitions() {
    return DREAM_MEMORY_MCP_TOOLS;
  }
}

export default DreamMemoryMCPService;
