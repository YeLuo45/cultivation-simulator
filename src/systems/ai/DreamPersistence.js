/**
 * DreamPersistence - 梦境记忆持久化层
 * V268 Iteration 4/9 - Dream Memory 持久化与跨会话恢复
 *
 * 核心职责:
 *   - localStorage 快速备份层
 *   - 跨会话数据恢复
 *   - 会话导出/导入功能
 *   - 自动清理过期数据
 *
 * 设计来源: generic-agent L2 天级持久化 + ruflo 状态恢复
 */

const DEFAULT_PLAYER_ID = 'player';

// localStorage keys
const BACKUP_KEY_PREFIX = 'dream_backup_';
const SESSION_KEY = 'dream_session_last_sync';
const BACKUP_VERSION = 'v1';

/**
 * 创建持久化管理器
 * @param {object} dreamStore - DreamMemoryStore 实例
 * @returns {DreamPersistence}
 */
export function createDreamPersistence(dreamStore) {
  return new DreamPersistence(dreamStore);
}

class DreamPersistence {
  constructor(dreamStore) {
    this._store = dreamStore;
  }

  // ===== 备份与恢复 =====

  /**
   * 备份到 localStorage
   * @param {string} npcId
   * @param {string} playerId
   * @returns {Promise<{success: boolean, count: number}>}
   */
  async backupToLocalStorage(npcId, playerId = DEFAULT_PLAYER_ID) {
    try {
      const dreams = await this._store.queryRecent(npcId, playerId, 100);
      const key = this._getBackupKey(npcId, playerId);

      const backup = {
        version: BACKUP_VERSION,
        timestamp: Date.now(),
        npcId,
        playerId,
        dreams,
      };

      localStorage.setItem(key, JSON.stringify(backup));

      return { success: true, count: dreams.length };
    } catch (err) {
      console.error('[DreamPersistence] backupToLocalStorage failed:', err);
      return { success: false, count: 0, error: err.message };
    }
  }

  /**
   * 从 localStorage 恢复
   * @param {string} npcId
   * @param {string} playerId
   * @returns {Promise<{dreams: object[], timestamp: number}|null>}
   */
  async restoreFromLocalStorage(npcId, playerId = DEFAULT_PLAYER_ID) {
    try {
      const key = this._getBackupKey(npcId, playerId);
      const raw = localStorage.getItem(key);

      if (!raw) return null;

      const backup = JSON.parse(raw);

      // 验证版本
      if (backup.version !== BACKUP_VERSION) {
        await this.clearBackup(npcId, playerId);
        return null;
      }

      return {
        dreams: backup.dreams || [],
        timestamp: backup.timestamp,
      };
    } catch (err) {
      console.error('[DreamPersistence] restoreFromLocalStorage failed:', err);
      return null;
    }
  }

  /**
   * 清除指定备份
   * @param {string} npcId
   * @param {string} playerId
   * @returns {Promise<void>}
   */
  async clearBackup(npcId, playerId = DEFAULT_PLAYER_ID) {
    const key = this._getBackupKey(npcId, playerId);
    localStorage.removeItem(key);
  }

  /**
   * 清除所有过期备份
   * @param {number} maxAgeMs - 最大保留时间（默认 7 天）
   * @returns {Promise<{cleared: number}>}
   */
  async clearStaleBackups(maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
    const cutoff = Date.now() - maxAgeMs;
    let cleared = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key.startsWith(BACKUP_KEY_PREFIX)) continue;

      try {
        const raw = localStorage.getItem(key);
        const backup = JSON.parse(raw);
        if (backup.timestamp < cutoff) {
          localStorage.removeItem(key);
          cleared++;
        }
      } catch {
        // 无效备份，清除
        localStorage.removeItem(key);
        cleared++;
      }
    }

    return { cleared };
  }

  // ===== 同步状态 =====

  /**
   * 记录最后同步时间
   */
  recordSync() {
    sessionStorage.setItem(SESSION_KEY, String(Date.now()));
  }

  /**
   * 获取最后同步时间
   * @returns {number|null}
   */
  getLastSync() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? parseInt(raw, 10) : null;
  }

  /**
   * 检查是否需要同步
   * @param {number} maxGapMs - 最大间隔（默认 5 分钟）
   * @returns {boolean}
   */
  needsSync(maxGapMs = 5 * 60 * 1000) {
    const lastSync = this.getLastSync();
    if (!lastSync) return true;
    return Date.now() - lastSync > maxGapMs;
  }

  // ===== 导出/导入 =====

  /**
   * 导出会话数据
   * @param {string} playerId
   * @returns {Promise<object>}
   */
  async exportSession(playerId = DEFAULT_PLAYER_ID) {
    // 收集所有 NPC 的备份
    const npcIds = this._getStoredNpcIds();
    const exports = {};

    for (const npcId of npcIds) {
      const backup = await this.restoreFromLocalStorage(npcId, playerId);
      if (backup && backup.dreams.length > 0) {
        exports[npcId] = backup;
      }
    }

    return {
      version: BACKUP_VERSION,
      exportedAt: Date.now(),
      playerId,
      exports,
    };
  }

  /**
   * 导入会话数据
   * @param {object} sessionData - 导出的会话数据
   * @returns {Promise<{imported: number, failed: number}>}
   */
  async importSession(sessionData) {
    if (!sessionData || sessionData.version !== BACKUP_VERSION) {
      return { imported: 0, failed: 0, error: 'Invalid session data version' };
    }

    const exports = sessionData.exports || {};
    let imported = 0;
    let failed = 0;

    for (const [npcId, backup] of Object.entries(exports)) {
      try {
        // 写入 IndexedDB
        for (const dream of backup.dreams || []) {
          await this._store.save(
            dream.npcId || npcId,
            dream.playerId || sessionData.playerId,
            dream.content,
            dream.sessionId,
            dream.emotion,
            dream.keywords
          );
        }
        imported++;
      } catch (err) {
        console.error(`[DreamPersistence] import failed for ${npcId}:`, err);
        failed++;
      }
    }

    return { imported, failed };
  }

  // ===== 私有方法 =====

  _getBackupKey(npcId, playerId) {
    return `${BACKUP_KEY_PREFIX}${npcId}_${playerId}`;
  }

  _getStoredNpcIds() {
    const npcIds = new Set();
    const prefix = BACKUP_KEY_PREFIX;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key.startsWith(prefix)) continue;

      // 解析 npcId_playerId
      const parts = key.slice(prefix.length).split('_');
      if (parts.length >= 1) {
        npcIds.add(parts[0]);
      }
    }

    return Array.from(npcIds);
  }
}
