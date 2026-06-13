/**
 * DreamMemoryStore - IndexedDB 梦境记忆存储
 * V268 梦境记忆系统核心存储层
 *
 * 数据结构:
 *   DreamMemory = {
 *     id, npcId, playerId, content, emotion, keywords,
 *     timestamp, sessionId, archived, layer, permanent
 *   }
 *
 * 存储结构:
 *   - IndexedDB: cultivation_dreams
 *   - Store: dreams
 *   - Indexes: [npcId+playerId+timestamp], [npcId+playerId], [sessionId]
 */

const DB_NAME = 'cultivation_dreams';
const DB_VERSION = 1;
const STORE_NAME = 'dreams';

let _db = null;

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (_db) {
      resolve(_db);
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      _db = req.result;
      resolve(_db);
    };
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('npcPlayerTime', ['npcId', 'playerId', 'timestamp'], { unique: false });
        store.createIndex('npcPlayer', ['npcId', 'playerId'], { unique: false });
        store.createIndex('sessionId', 'sessionId', { unique: false });
      }
    };
  });
}

function closeDatabase() {
  if (_db) {
    _db.close();
    _db = null;
  }
}

let _idCounter = 0;
function generateId() {
  _idCounter += 1;
  return `dream_${Date.now()}_${_idCounter}`;
}

export class DreamMemoryStore {
  constructor() {
    this._dbPromise = openDatabase();
  }

  /**
   * 保存单条梦境记忆
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @param {string} content - 记忆内容
   * @param {string} emotion - 情感标签
   * @param {string[]} keywords - 关键词数组
   * @returns {Promise<string>} 记忆 ID
   */
  async save(npcId, playerId, content, emotion = '', keywords = []) {
    const db = await this._dbPromise;
    const id = generateId();
    const memory = {
      id,
      npcId,
      playerId,
      content,
      emotion,
      keywords: Array.isArray(keywords) ? keywords : [],
      timestamp: Date.now(),
      sessionId: null,
      archived: false,
      layer: 0,
      permanent: false,
    };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).add(memory);
      tx.oncomplete = () => resolve(id);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * 保存带会话 ID 的梦境记忆
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @param {string} content - 记忆内容
   * @param {string} emotion - 情感标签
   * @param {string[]} keywords - 关键词数组
   * @param {string} sessionId - 会话 ID
   * @returns {Promise<string>} 记忆 ID
   */
  async saveWithSession(npcId, playerId, content, emotion = '', keywords = [], sessionId) {
    const db = await this._dbPromise;
    const id = generateId();
    const memory = {
      id,
      npcId,
      playerId,
      content,
      emotion,
      keywords: Array.isArray(keywords) ? keywords : [],
      timestamp: Date.now(),
      sessionId,
      archived: false,
      layer: 0,
      permanent: false,
    };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).add(memory);
      tx.oncomplete = () => resolve(id);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * 按条件查询记忆
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @param {number} since - 开始时间戳
   * @param {number} until - 结束时间戳
   * @returns {Promise<Object[]>} 记忆列表
   */
  async query(npcId, playerId, since = 0, until = Date.now()) {
    const db = await this._dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('npcPlayerTime');
      const range = IDBKeyRange.bound([npcId, playerId, since], [npcId, playerId, until]);
      const results = [];
      const req = index.openCursor(range);
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        }
      };
      tx.oncomplete = () => resolve(results);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * 查询某个 NPC 对某个玩家的所有记忆（不限时间）
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @returns {Promise<Object[]>} 记忆列表（按时间倒序）
   */
  async queryAll(npcId, playerId) {
    const db = await this._dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('npcPlayer');
      const range = IDBKeyRange.only([npcId, playerId]);
      const results = [];
      const req = index.openCursor(range, 'prev');
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        }
      };
      tx.oncomplete = () => resolve(results);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * 归档整个会话
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @param {string} sessionId - 会话 ID
   * @returns {Promise<number>} 归档的记忆条数
   */
  async archiveSession(npcId, playerId, sessionId) {
    const db = await this._dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('sessionId');
      const range = IDBKeyRange.only(sessionId);
      let count = 0;
      const req = index.openCursor(range);
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          const mem = cursor.value;
          if (mem.npcId === npcId && mem.playerId === playerId) {
            mem.archived = true;
            cursor.update(mem);
            count++;
          }
          cursor.continue();
        }
      };
      tx.oncomplete = () => resolve(count);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * 获取记忆条数
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @returns {Promise<number>} 记忆条数
   */
  async getDreamCount(npcId, playerId) {
    const memories = await this.queryAll(npcId, playerId);
    return memories.length;
  }

  /**
   * 获取指定层级的记忆
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @param {number} layer - 记忆层级 (0-3)
   * @returns {Promise<Object[]>} 记忆列表
   */
  async getByLayer(npcId, playerId, layer) {
    const all = await this.queryAll(npcId, playerId);
    return all.filter(m => m.layer === layer);
  }

  /**
   * 标记记忆为永久
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @param {string} memoryId - 记忆 ID
   * @returns {Promise<boolean>} 是否成功
   */
  async markPermanent(npcId, playerId, memoryId) {
    const db = await this._dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(memoryId);
      req.onsuccess = () => {
        const mem = req.result;
        if (!mem || mem.npcId !== npcId || mem.playerId !== playerId) {
          resolve(false);
          return;
        }
        mem.permanent = true;
        mem.layer = 3;
        store.put(mem);
      };
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * 更新记忆层级
   * @param {string} memoryId - 记忆 ID
   * @param {number} layer - 新层级
   * @returns {Promise<boolean>} 是否成功
   */
  async updateLayer(memoryId, layer) {
    const db = await this._dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(memoryId);
      req.onsuccess = () => {
        const mem = req.result;
        if (!mem) { resolve(false); return; }
        mem.layer = layer;
        store.put(mem);
      };
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * 删除记忆
   * @param {string} memoryId - 记忆 ID
   * @returns {Promise<boolean>} 是否成功
   */
  async delete(memoryId) {
    const db = await this._dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(memoryId);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * 清除所有记忆（测试用）
   */
  async clearAll() {
    const db = await this._dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * 获取数据库实例（用于测试）
   */
  getDB() {
    return _db;
  }
}

/**
 * 重置数据库连接（测试用）
 */
export function resetDreamDB() {
  closeDatabase();
  _db = null;
}