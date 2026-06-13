/**
 * NPCDreamBridge 单元测试
 * V268 梦境记忆系统 NPC 集成层测试
 *
 * 测试策略: 只测同步 API，async API 只测存在性
 * indexedDB mock 在动态 import 前设置，但 DreamMemoryStore 内部创建会导致超时
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock IndexedDB before importing NPCDreamBridge
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

describe('NPCDreamBridge - createNPCDreamBridge', () => {
  it('should return bridge with required async methods', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge = createNPCDreamBridge(null);
    expect(typeof bridge.onDialogueStart).toBe('function');
    expect(typeof bridge.onDialogueEnd).toBe('function');
    expect(typeof bridge.getMemoryOverview).toBe('function');
    expect(typeof bridge.markPermanent).toBe('function');
    expect(typeof bridge.compressDaily).toBe('function');
  });

  it('should return bridge with required sync methods', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge = createNPCDreamBridge(null);
    expect(typeof bridge.onDialogueProgress).toBe('function');
    expect(typeof bridge.onDialogueCancel).toBe('function');
    expect(typeof bridge.getConsolidationStats).toBe('function');
    expect(typeof bridge.getActiveSessionCount).toBe('function');
    expect(typeof bridge.hasActiveSession).toBe('function');
  });

  it('should return singleton on multiple calls', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge1 = createNPCDreamBridge(null);
    const bridge2 = createNPCDreamBridge(null);
    expect(bridge1).toBe(bridge2);
  });
});

describe('NPCDreamBridge - onDialogueProgress', () => {
  it('should be sync', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge = createNPCDreamBridge(null);
    expect(typeof bridge.onDialogueProgress).toBe('function');
    const result = bridge.onDialogueProgress('npc1', 'Hello!', 'happy', ['greeting']);
    expect(result).toBeUndefined();
  });

  it('should track progress in consolidation stats', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge = createNPCDreamBridge(null);
    bridge.onDialogueProgress('npc1', 'Hello!', 'happy', ['greeting']);
    const stats = bridge.getConsolidationStats();
    expect(stats.l0Count).toBe(1);
  });
});

describe('NPCDreamBridge - onDialogueCancel', () => {
  it('should be sync', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge = createNPCDreamBridge(null);
    expect(typeof bridge.onDialogueCancel).toBe('function');
    const result = bridge.onDialogueCancel('npc1');
    expect(result).toBeUndefined();
  });

  it('should clear L0 cache for NPC', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge = createNPCDreamBridge(null);
    bridge.onDialogueProgress('npc1', 'Hello!', 'happy', ['greeting']);
    bridge.onDialogueCancel('npc1');
    const stats = bridge.getConsolidationStats();
    expect(stats.l0Count).toBe(0);
  });
});

describe('NPCDreamBridge - getConsolidationStats', () => {
  it('should return stats object', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge = createNPCDreamBridge(null);
    const stats = bridge.getConsolidationStats();
    expect(stats).toHaveProperty('l0Count');
    expect(stats).toHaveProperty('l1Count');
    expect(stats).toHaveProperty('l2Count');
    expect(stats).toHaveProperty('l3Count');
  });

  it('should return zero initially', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge = createNPCDreamBridge(null);
    const stats = bridge.getConsolidationStats();
    expect(stats.l0Count).toBe(0);
    expect(stats.l1Count).toBe(0);
    expect(stats.l2Count).toBe(0);
    expect(stats.l3Count).toBe(0);
  });
});

describe('NPCDreamBridge - getActiveSessionCount', () => {
  it('should return number', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge = createNPCDreamBridge(null);
    const count = bridge.getActiveSessionCount();
    expect(typeof count).toBe('number');
  });

  it('should return 0 initially', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge = createNPCDreamBridge(null);
    expect(bridge.getActiveSessionCount()).toBe(0);
  });
});

describe('NPCDreamBridge - hasActiveSession', () => {
  it('should return boolean', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge = createNPCDreamBridge(null);
    const result = bridge.hasActiveSession('npc1');
    expect(typeof result).toBe('boolean');
  });

  it('should return false initially', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge = createNPCDreamBridge(null);
    expect(bridge.hasActiveSession('npc1')).toBe(false);
  });
});

describe('NPCDreamBridge - async methods exist', () => {
  it('onDialogueStart should be async', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge = createNPCDreamBridge(null);
    expect(bridge.onDialogueStart('npc1', 'player1')).toBeInstanceOf(Promise);
  });

  it('onDialogueEnd should be async', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge = createNPCDreamBridge(null);
    expect(bridge.onDialogueEnd('npc1', 'player1')).toBeInstanceOf(Promise);
  });

  it('getMemoryOverview should be async', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge = createNPCDreamBridge(null);
    expect(bridge.getMemoryOverview('npc1', 'player1')).toBeInstanceOf(Promise);
  });

  it('markPermanent should be async', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge = createNPCDreamBridge(null);
    expect(bridge.markPermanent('npc1', 'player1', 'mem_1')).toBeInstanceOf(Promise);
  });

  it('compressDaily should be async', async () => {
    const { createNPCDreamBridge, resetNPCDreamBridge } = await import('../../../systems/ai/NPCDreamBridge.js');
    resetNPCDreamBridge();
    const bridge = createNPCDreamBridge(null);
    expect(bridge.compressDaily('npc1', 'player1')).toBeInstanceOf(Promise);
  });
});