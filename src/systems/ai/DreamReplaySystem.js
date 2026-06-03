/**
 * DreamReplaySystem - 梦境记忆回溯系统
 * V268 Iteration 7/9 - Dream Memory 记忆回溯系统
 *
 * 核心职责:
 *   - 梦境回放与重温
 *   - 记忆触发器机制
 *   - 梦境链（Dream Chain）管理
 *   - 时间旅行式记忆浏览
 *
 * 设计来源: ruflo 状态恢复 + generic-agent L3 永久层
 */

const DEFAULT_PLAYER_ID = 'player';

// 记忆回放状态
const REPLAY_STATES = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  COMPLETED: 'completed',
};

/**
 * 创建回溯系统
 * @param {object} dreamStore - DreamMemoryStore 实例
 * @param {object} dreamRecall - DreamRecall 实例
 * @returns {DreamReplaySystem}
 */
export function createDreamReplaySystem(dreamStore, dreamRecall) {
  return new DreamReplaySystem(dreamStore, dreamRecall);
}

class DreamReplaySystem {
  constructor(dreamStore, dreamRecall) {
    this._store = dreamStore;
    this._recall = dreamRecall;
    this._replayState = REPLAY_STATES.IDLE;
    this._currentDreams = [];
    this._currentIndex = 0;
    this._listeners = {};
  }

  // ===== 回放控制 =====

  /**
   * 开始回放
   * @param {string} npcId
   * @param {string} playerId
   * @param {object} options - 回放选项
   * @returns {Promise<{success: boolean, dreams: object[]}>}
   */
  async startReplay(npcId, playerId = DEFAULT_PLAYER_ID, options = {}) {
    try {
      const { limit = 10, reverse = false } = options;

      const dreams = await this._recall.getRecentDreams(npcId, playerId, limit);

      if (dreams.length === 0) {
        return { success: false, dreams: [], reason: 'No dreams found' };
      }

      this._currentDreams = reverse ? [...dreams].reverse() : dreams;
      this._currentIndex = 0;
      this._replayState = REPLAY_STATES.PLAYING;

      this._emit('replayStart', { npcId, dreamCount: dreams.length });

      return { success: true, dreams: this._currentDreams };
    } catch (err) {
      return { success: false, dreams: [], reason: err.message };
    }
  }

  /**
   * 暂停回放
   */
  pauseReplay() {
    if (this._replayState === REPLAY_STATES.PLAYING) {
      this._replayState = REPLAY_STATES.PAUSED;
      this._emit('replayPause', { index: this._currentIndex });
    }
  }

  /**
   * 继续回放
   */
  resumeReplay() {
    if (this._replayState === REPLAY_STATES.PAUSED) {
      this._replayState = REPLAY_STATES.PLAYING;
      this._emit('replayResume', { index: this._currentIndex });
    }
  }

  /**
   * 停止回放
   */
  stopReplay() {
    this._replayState = REPLAY_STATES.IDLE;
    this._currentDreams = [];
    this._currentIndex = 0;
    this._emit('replayStop', {});
  }

  /**
   * 获取当前记忆
   * @returns {object|null}
   */
  getCurrentDream() {
    if (this._currentIndex < this._currentDreams.length) {
      return this._currentDreams[this._currentIndex];
    }
    return null;
  }

  /**
   * 前进到下一个记忆
   * @returns {object|null}
   */
  nextDream() {
    if (this._currentIndex < this._currentDreams.length - 1) {
      this._currentIndex++;
      const dream = this.getCurrentDream();
      this._emit('dreamChange', { dream, index: this._currentIndex });
      return dream;
    } else {
      this._replayState = REPLAY_STATES.COMPLETED;
      this._emit('replayComplete', { totalDreams: this._currentDreams.length });
      return null;
    }
  }

  /**
   * 后退到上一个记忆
   * @returns {object|null}
   */
  previousDream() {
    if (this._currentIndex > 0) {
      this._currentIndex--;
      const dream = this.getCurrentDream();
      this._emit('dreamChange', { dream, index: this._currentIndex });
      return dream;
    }
    return null;
  }

  /**
   * 跳转到指定索引
   * @param {number} index
   * @returns {object|null}
   */
  seekTo(index) {
    if (index >= 0 && index < this._currentDreams.length) {
      this._currentIndex = index;
      const dream = this.getCurrentDream();
      this._emit('dreamChange', { dream, index: this._currentIndex });
      return dream;
    }
    return null;
  }

  // ===== 记忆链管理 =====

  /**
   * 创建梦境链
   * @param {string} chainId - 链 ID
   * @param {string[]} dreamIds - 梦境 ID 列表
   * @returns {Promise<{success: boolean}>}
   */
  async createDreamChain(chainId, dreamIds) {
    try {
      const dreams = [];
      for (const id of dreamIds) {
        const dream = await this._store.getById(id);
        if (dream) dreams.push(dream);
      }

      const chain = {
        id: chainId,
        dreams,
        createdAt: Date.now(),
        currentIndex: 0,
      };

      // 保存到 IndexedDB
      await this._saveChain(chain);

      return { success: true, chain };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * 获取梦境链
   * @param {string} chainId
   * @returns {Promise<object|null>}
   */
  async getDreamChain(chainId) {
    try {
      const chain = await this._loadChain(chainId);
      return chain;
    } catch (err) {
      return null;
    }
  }

  /**
   * 删除梦境链
   * @param {string} chainId
   * @returns {Promise<void>}
   */
  async deleteDreamChain(chainId) {
    try {
      await this._deleteChain(chainId);
    } catch (err) {
      // 忽略错误
    }
  }

  /**
   * 获取所有梦境链
   * @returns {Promise<object[]>}
   */
  async listDreamChains() {
    try {
      return await this._listChains();
    } catch (err) {
      return [];
    }
  }

  // ===== 记忆触发器 =====

  /**
   * 设置记忆触发器
   * @param {string} triggerId - 触发器 ID
   * @param {object} trigger - 触发器配置
   * @returns {void}
   */
  setTrigger(triggerId, trigger) {
    this._triggers = this._triggers || {};
    this._triggers[triggerId] = {
      ...trigger,
      active: true,
      createdAt: Date.now(),
    };
  }

  /**
   * 移除触发器
   * @param {string} triggerId
   */
  removeTrigger(triggerId) {
    if (this._triggers && this._triggers[triggerId]) {
      delete this._triggers[triggerId];
    }
  }

  /**
   * 检查触发器
   * @param {string} npcId
   * @param {string} playerId
   * @returns {Promise<object[]>} - 触发的记忆列表
   */
  async checkTriggers(npcId, playerId = DEFAULT_PLAYER_ID) {
    if (!this._triggers) return [];

    const triggered = [];
    const currentTime = Date.now();

    for (const [id, trigger] of Object.entries(this._triggers)) {
      if (!trigger.active) continue;

      // 检查时间条件
      if (trigger.afterTime && currentTime < trigger.afterTime) continue;

      // 检查关键词条件
      if (trigger.keywords && trigger.keywords.length > 0) {
        const dreams = await this._recall.getRecentDreams(npcId, playerId, 20);
        const hasMatch = dreams.some(d =>
          trigger.keywords.some(kw =>
            d.content && d.content.includes(kw)
          )
        );
        if (!hasMatch) continue;
      }

      // 触发成功
      triggered.push({ triggerId: id, trigger });
      this._emit('triggerActivated', { triggerId: id, trigger });
    }

    return triggered;
  }

  /**
   * 获取当前回放状态
   * @returns {string}
   */
  getReplayState() {
    return this._replayState;
  }

  /**
   * 获取回放进度
   * @returns {{current: number, total: number, percentage: number}}
   */
  getReplayProgress() {
    if (this._currentDreams.length === 0) {
      return { current: 0, total: 0, percentage: 0 };
    }
    return {
      current: this._currentIndex + 1,
      total: this._currentDreams.length,
      percentage: Math.round((this._currentIndex / this._currentDreams.length) * 100),
    };
  }

  // ===== 事件系统 =====

  /**
   * 注册事件监听器
   * @param {string} event
   * @param {function} callback
   */
  on(event, callback) {
    this._listeners[event] = this._listeners[event] || [];
    this._listeners[event].push(callback);
  }

  /**
   * 移除事件监听器
   * @param {string} event
   * @param {function} callback
   */
  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  }

  _emit(event, data) {
    if (!this._listeners[event]) return;
    for (const callback of this._listeners[event]) {
      try {
        callback(data);
      } catch (err) {
        // 忽略事件回调错误
      }
    }
  }

  // ===== 私有方法 =====

  async _saveChain(chain) {
    // 实现chain持久化 - 使用localStorage作为简单存储
    const chains = this._getChainsStorage();
    chains[chain.id] = chain;
    localStorage.setItem('dream_chains', JSON.stringify(chains));
  }

  async _loadChain(chainId) {
    const chains = this._getChainsStorage();
    return chains[chainId] || null;
  }

  async _deleteChain(chainId) {
    const chains = this._getChainsStorage();
    delete chains[chainId];
    localStorage.setItem('dream_chains', JSON.stringify(chains));
  }

  async _listChains() {
    const chains = this._getChainsStorage();
    return Object.values(chains);
  }

  _getChainsStorage() {
    try {
      const raw = localStorage.getItem('dream_chains');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
}

export default DreamReplaySystem;
