/**
 * DreamPersistence 单元测试
 * V268 Iteration 4/9 - Dream Memory 持久化与跨会话恢复
 *
 * 测试策略: mock localStorage/sessionStorage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage and sessionStorage
const mockLocalStorage = {};
const mockSessionStorage = {};

vi.stubGlobal('localStorage', {
  getItem: vi.fn((key) => mockLocalStorage[key] || null),
  setItem: vi.fn((key, value) => { mockLocalStorage[key] = value; }),
  removeItem: vi.fn((key) => { delete mockLocalStorage[key]; }),
  clear: vi.fn(() => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]); }),
  get length() { return Object.keys(mockLocalStorage).length; },
  key: vi.fn((i) => Object.keys(mockLocalStorage)[i] || null),
});

vi.stubGlobal('sessionStorage', {
  getItem: vi.fn((key) => mockSessionStorage[key] || null),
  setItem: vi.fn((key, value) => { mockSessionStorage[key] = value; }),
  removeItem: vi.fn((key) => { delete mockSessionStorage[key]; }),
  clear: vi.fn(() => { Object.keys(mockSessionStorage).forEach(k => delete mockSessionStorage[k]); }),
  key: vi.fn((i) => Object.keys(mockSessionStorage)[i] || null),
});

// Mock IndexedDB for DreamMemoryStore
vi.stubGlobal('indexedDB', {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    result: {
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          add: vi.fn(() => ({ onsuccess: null })),
          put: vi.fn(() => ({ onsuccess: null })),
          delete: vi.fn(() => ({ onsuccess: null })),
          get: vi.fn(() => ({ onsuccess: null, result: undefined })),
          openCursor: vi.fn(() => ({ onsuccess: null, result: null })),
          index: vi.fn(() => ({
            openCursor: vi.fn(() => ({ onsuccess: null, result: null })),
          })),
        })),
        oncomplete: null,
        onerror: null,
      })),
      close: vi.fn(),
      objectStoreNames: { contains: vi.fn(() => true) },
    },
  })),
  deleteDatabase: vi.fn(() => ({ onsuccess: null })),
});

vi.stubGlobal('IDBKeyRange', {
  bound: vi.fn(() => ({})),
  only: vi.fn(() => ({})),
  lowerBound: vi.fn(() => ({})),
  upperBound: vi.fn(() => ({})),
});

describe('DreamPersistence - 导出', () => {
  it('should export createDreamPersistence function', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    expect(typeof createDreamPersistence).toBe('function');
  });
});

describe('DreamPersistence - backupToLocalStorage', () => {
  it('should be a method on persistence instance', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = { queryRecent: vi.fn(() => Promise.resolve([])) };
    const persistence = createDreamPersistence(mockStore);
    expect(typeof persistence.backupToLocalStorage).toBe('function');
  });

  it('should return success result', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = { queryRecent: vi.fn(() => Promise.resolve([])) };
    const persistence = createDreamPersistence(mockStore);
    const result = await persistence.backupToLocalStorage('npc1', 'player1');
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('count');
  });
});

describe('DreamPersistence - restoreFromLocalStorage', () => {
  it('should be a method on persistence instance', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = {};
    const persistence = createDreamPersistence(mockStore);
    expect(typeof persistence.restoreFromLocalStorage).toBe('function');
  });

  it('should return null when no backup exists', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = {};
    const persistence = createDreamPersistence(mockStore);
    const result = await persistence.restoreFromLocalStorage('npc_nonexistent', 'player1');
    expect(result).toBeNull();
  });
});

describe('DreamPersistence - clearBackup', () => {
  it('should be a method on persistence instance', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = {};
    const persistence = createDreamPersistence(mockStore);
    expect(typeof persistence.clearBackup).toBe('function');
  });

  it('should return promise', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = {};
    const persistence = createDreamPersistence(mockStore);
    const result = persistence.clearBackup('npc1', 'player1');
    expect(result).toBeInstanceOf(Promise);
  });
});

describe('DreamPersistence - clearStaleBackups', () => {
  it('should be a method on persistence instance', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = {};
    const persistence = createDreamPersistence(mockStore);
    expect(typeof persistence.clearStaleBackups).toBe('function');
  });

  it('should return cleared count', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = {};
    const persistence = createDreamPersistence(mockStore);
    const result = await persistence.clearStaleBackups();
    expect(result).toHaveProperty('cleared');
  });
});

describe('DreamPersistence - recordSync/getLastSync', () => {
  it('should record and retrieve sync time', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = {};
    const persistence = createDreamPersistence(mockStore);

    persistence.recordSync();
    const lastSync = persistence.getLastSync();

    expect(lastSync).toBeDefined();
    expect(typeof lastSync).toBe('number');
  });

  it('should return null when never synced', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = {};
    // Clear sessionStorage
    Object.keys(mockSessionStorage).forEach(k => delete mockSessionStorage[k]);
    const persistence = createDreamPersistence(mockStore);
    const lastSync = persistence.getLastSync();
    expect(lastSync).toBeNull();
  });
});

describe('DreamPersistence - needsSync', () => {
  it('should return true when never synced', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = {};
    Object.keys(mockSessionStorage).forEach(k => delete mockSessionStorage[k]);
    const persistence = createDreamPersistence(mockStore);
    expect(persistence.needsSync()).toBe(true);
  });

  it('should return false when recently synced', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = {};
    const persistence = createDreamPersistence(mockStore);

    persistence.recordSync();
    expect(persistence.needsSync(60000)).toBe(false);
  });

  it('should accept custom maxGapMs', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = {};
    const persistence = createDreamPersistence(mockStore);

    // Manually set old timestamp
    const oldTime = Date.now() - 200000;
    mockSessionStorage['dream_session_last_sync'] = String(oldTime);

    expect(persistence.needsSync(60000)).toBe(true);
    expect(persistence.needsSync(300000)).toBe(false);
  });
});

describe('DreamPersistence - exportSession', () => {
  it('should be a method on persistence instance', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = {};
    const persistence = createDreamPersistence(mockStore);
    expect(typeof persistence.exportSession).toBe('function');
  });

  it('should return session data object', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = {};
    const persistence = createDreamPersistence(mockStore);
    const result = await persistence.exportSession('player1');
    expect(result).toHaveProperty('version');
    expect(result).toHaveProperty('exportedAt');
    expect(result).toHaveProperty('playerId');
    expect(result).toHaveProperty('exports');
  });
});

describe('DreamPersistence - importSession', () => {
  it('should be a method on persistence instance', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = {};
    const persistence = createDreamPersistence(mockStore);
    expect(typeof persistence.importSession).toBe('function');
  });

  it('should return error for invalid version', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = {};
    const persistence = createDreamPersistence(mockStore);
    const result = await persistence.importSession({ version: 'invalid' });
    expect(result).toHaveProperty('error');
  });

  it('should return imported/failed counts', async () => {
    const { createDreamPersistence } = await import('../../../systems/ai/DreamPersistence.js');
    const mockStore = {
      save: vi.fn(() => Promise.resolve()),
    };
    const persistence = createDreamPersistence(mockStore);
    const sessionData = {
      version: 'v1',
      playerId: 'player1',
      exports: {
        npc1: {
          dreams: [
            { content: 'Test dream', npcId: 'npc1', playerId: 'player1' },
          ],
        },
      },
    };
    const result = await persistence.importSession(sessionData);
    expect(result).toHaveProperty('imported');
    expect(result).toHaveProperty('failed');
  });
});