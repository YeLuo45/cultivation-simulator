/**
 * DreamMemoryPanel - 梦境记忆 UI 面板
 * V268 Iteration 3/9 - Dream Memory UI 面板集成
 *
 * 核心职责:
 *   - 显示 NPC 亲密度等级（颜色 + 文字）
 *   - 显示最近的梦境记忆列表
 *   - 显示总记忆数量
 *   - 提供记忆搜索功能
 *
 * 设计来源: nanobot-design 分布式面板 + thunderbolt-design 反馈循环
 */

import { createDialogueMemoryBridge } from '../systems/ai/DialogueMemoryBridge.js';
import { NPCCollaboration } from '../systems/ai/NPCCollaboration.js';

// 默认玩家 ID
const DEFAULT_PLAYER_ID = 'player';

/**
 * 创建梦境记忆面板
 * @param {object} gameState - 游戏状态
 * @returns {DreamMemoryPanel}
 */
export function createDreamMemoryPanel(gameState) {
  return new DreamMemoryPanel(gameState);
}

class DreamMemoryPanel {
  constructor(gameState) {
    this._gameState = gameState;
    this._bridge = createDialogueMemoryBridge(null); // 无需 dialogueService 只需 bridge
    this._currentNpcId = null;
    this._panelElement = null;
  }

  // ===== 属性 =====

  get element() {
    return this._panelElement;
  }

  get npcId() {
    return this._currentNpcId;
  }

  // ===== 核心方法 =====

  /**
   * 渲染面板到指定容器
   * @param {string|HTMLElement} container - 容器选择器或元素
   * @param {string} npcId - NPC ID
   * @returns {Promise<HTMLElement>}
   */
  async render(container, npcId) {
    this._currentNpcId = npcId;

    // 获取记忆概览
    const overview = await this._bridge.getMemoryOverview(npcId, DEFAULT_PLAYER_ID, 10);

    // 创建面板元素
    const panel = this._createPanelElement(overview);
    this._panelElement = panel;

    // 插入容器
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (container) {
      container.appendChild(panel);
    }

    return panel;
  }

  /**
   * 更新面板显示
   * @param {string} npcId - NPC ID
   * @returns {Promise<void>}
   */
  async update(npcId) {
    if (npcId !== this._currentNpcId) {
      this._currentNpcId = npcId;
    }

    if (!this._panelElement) return;

    const overview = await this._bridge.getMemoryOverview(npcId, DEFAULT_PLAYER_ID, 10);
    this._updatePanelContent(overview);
  }

  /**
   * 移除面板
   */
  remove() {
    if (this._panelElement && this._panelElement.parentNode) {
      this._panelElement.parentNode.removeChild(this._panelElement);
      this._panelElement = null;
    }
    this._currentNpcId = null;
  }

  /**
   * 获取亲密度颜色
   * @param {string} npcId
   * @returns {Promise<string>} hex 颜色
   */
  async getFamiliarityColor(npcId) {
    return this._bridge.getFamiliarityColor(npcId, DEFAULT_PLAYER_ID);
  }

  /**
   * 获取亲密度文字标签
   * @param {string} npcId
   * @returns {Promise<string>}
   */
  async getFamiliarityLabel(npcId) {
    return this._bridge.getFamiliarityLabel(npcId, DEFAULT_PLAYER_ID);
  }

  /**
   * 搜索记忆
   * @param {string} npcId
   * @param {string} keyword
   * @returns {Promise<object[]>}
   */
  async search(npcId, keyword) {
    return this._bridge.searchMemories(npcId, DEFAULT_PLAYER_ID, keyword);
  }

  // ===== 私有方法 =====

  _createPanelElement(overview) {
    const panel = document.createElement('div');
    panel.className = 'dream-memory-panel';
    panel.innerHTML = this._getPanelHTML(overview);
    return panel;
  }

  _updatePanelContent(overview) {
    if (!this._panelElement) return;

    // 更新亲密度
    const favBadge = this._panelElement.querySelector('.dm-familiarity-badge');
    if (favBadge) {
      favBadge.textContent = overview.familiarityLabel;
      favBadge.style.backgroundColor = this._getFamiliarityHex(overview.familiarity);
    }

    // 更新总记忆数
    const totalEl = this._panelElement.querySelector('.dm-total-count');
    if (totalEl) {
      totalEl.textContent = overview.totalDreams;
    }

    // 更新记忆列表
    const listEl = this._panelElement.querySelector('.dm-recent-list');
    if (listEl) {
      listEl.innerHTML = this._getRecentDreamsHTML(overview.recentDreams);
    }
  }

  _getPanelHTML(overview) {
    const favColor = this._getFamiliarityHex(overview.familiarity);

    return `
      <div class="dm-header">
        <span class="dm-title">梦境记忆</span>
        <span class="dm-familiarity-badge" style="background-color: ${favColor}">${overview.familiarityLabel}</span>
      </div>
      <div class="dm-stats">
        <span class="dm-stat">
          <span class="dm-stat-label">总记忆</span>
          <span class="dm-total-count">${overview.totalDreams}</span>
        </span>
      </div>
      <div class="dm-recent">
        <span class="dm-section-title">最近记忆</span>
        <div class="dm-recent-list">${this._getRecentDreamsHTML(overview.recentDreams)}</div>
      </div>
    `;
  }

  _getRecentDreamsHTML(recentDreams) {
    if (!recentDreams || recentDreams.length === 0) {
      return '<div class="dm-empty">暂无记忆</div>';
    }

    return recentDreams.map(dream => `
      <div class="dm-dream-item" data-timestamp="${dream.timestamp || 0}">
        <span class="dm-dream-content">${this._escapeHtml(dream.content)}</span>
        ${dream.emotion ? `<span class="dm-dream-emotion">${this._escapeHtml(dream.emotion)}</span>` : ''}
      </div>
    `).join('');
  }

  _getFamiliarityHex(familiarity) {
    const colorMap = {
      0: '#888888', // STRANGER
      1: '#4CAF50', // ACQUAINTANCE
      2: '#2196F3', // FAMILIAR
      3: '#9C27B0', // INTIMATE
    };
    return colorMap[familiarity] || '#888888';
  }

  _escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

/**
 * 全局样式（注入到 head）
 */
export function injectDreamMemoryStyles() {
  if (document.getElementById('dream-memory-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'dream-memory-styles';
  styles.textContent = `
    .dream-memory-panel {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 1px solid #0f3460;
      border-radius: 8px;
      padding: 12px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #e0e0e0;
      min-width: 200px;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .dm-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #0f3460;
    }
    .dm-title {
      font-size: 14px;
      font-weight: 600;
      color: #a0c4ff;
    }
    .dm-familiarity-badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
      color: white;
      font-weight: 500;
    }
    .dm-stats {
      margin-bottom: 10px;
    }
    .dm-stat {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }
    .dm-stat-label {
      color: #888;
    }
    .dm-total-count {
      color: #a0c4ff;
      font-weight: 600;
    }
    .dm-section-title {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .dm-recent-list {
      margin-top: 6px;
      max-height: 150px;
      overflow-y: auto;
    }
    .dm-dream-item {
      padding: 6px 8px;
      margin: 4px 0;
      background: rgba(255,255,255,0.05);
      border-radius: 4px;
      font-size: 12px;
    }
    .dm-dream-content {
      color: #c0c0c0;
      word-break: break-word;
    }
    .dm-dream-emotion {
      display: inline-block;
      margin-left: 6px;
      font-size: 10px;
      color: #ffd700;
      background: rgba(255,215,0,0.1);
      padding: 1px 4px;
      border-radius: 3px;
    }
    .dm-empty {
      color: #555;
      font-size: 12px;
      text-align: center;
      padding: 10px;
    }
  `;
  document.head.appendChild(styles);
}
