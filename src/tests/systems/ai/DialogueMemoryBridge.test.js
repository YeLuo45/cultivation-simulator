/**
 * DialogueMemoryBridge 单元测试
 * V268 Iteration 2/9 - Dream Memory UI 集成
 *
 * 测试策略: 只测 API 存在性和 Promise 返回类型
 * 详细行为测试需要完整 mock IndexedDB
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock IndexedDB before importing DialogueMemoryBridge
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

describe('DialogueMemoryBridge - 导出', () => {
  it('should export createDialogueMemoryBridge function', async () => {
    const { createDialogueMemoryBridge } = await import('../../../systems/ai/DialogueMemoryBridge.js');
    expect(typeof createDialogueMemoryBridge).toBe('function');
  });

  it('should export resetDialogueMemoryBridge function', async () => {
    const { resetDialogueMemoryBridge } = await import('../../../systems/ai/DialogueMemoryBridge.js');
    expect(typeof resetDialogueMemoryBridge).toBe('function');
  });
});

describe('DialogueMemoryBridge - createDialogueMemoryBridge', () => {
  it('should return bridge with required methods', async () => {
    const { createDialogueMemoryBridge, resetDialogueMemoryBridge } = await import('../../../systems/ai/DialogueMemoryBridge.js');
    resetDialogueMemoryBridge();
    const mockDialogueService = {};
    const bridge = createDialogueMemoryBridge(mockDialogueService);
    expect(typeof bridge.preloadMemories).toBe('function');
    expect(typeof bridge.archiveDialogue).toBe('function');
    expect(typeof bridge.getFamiliarityLabel).toBe('function');
    expect(typeof bridge.getMemoryOverview).toBe('function');
    expect(typeof bridge.searchMemories).toBe('function');
    expect(typeof bridge.getFamiliarityColor).toBe('function');
  });

  it('should return singleton on multiple calls', async () => {
    const { createDialogueMemoryBridge, resetDialogueMemoryBridge } = await import('../../../systems/ai/DialogueMemoryBridge.js');
    resetDialogueMemoryBridge();
    const mockDialogueService = {};
    const bridge1 = createDialogueMemoryBridge(mockDialogueService);
    const bridge2 = createDialogueMemoryBridge(mockDialogueService);
    expect(bridge1).toBe(bridge2);
  });

  it('should expose dreamStore', async () => {
    const { createDialogueMemoryBridge, resetDialogueMemoryBridge } = await import('../../../systems/ai/DialogueMemoryBridge.js');
    resetDialogueMemoryBridge();
    const bridge = createDialogueMemoryBridge({});
    expect(bridge.dreamStore).toBeDefined();
  });

  it('should expose dreamRecall', async () => {
    const { createDialogueMemoryBridge, resetDialogueMemoryBridge } = await import('../../../systems/ai/DialogueMemoryBridge.js');
    resetDialogueMemoryBridge();
    const bridge = createDialogueMemoryBridge({});
    expect(bridge.dreamRecall).toBeDefined();
  });
});

describe('DialogueMemoryBridge - preloadMemories', () => {
  it('should be async', async () => {
    const { createDialogueMemoryBridge, resetDialogueMemoryBridge } = await import('../../../systems/ai/DialogueMemoryBridge.js');
    resetDialogueMemoryBridge();
    const bridge = createDialogueMemoryBridge({});
    expect(bridge.preloadMemories('npc1', 'player1')).toBeInstanceOf(Promise);
  });
});

describe('DialogueMemoryBridge - archiveDialogue', () => {
  it('should be async', async () => {
    const { createDialogueMemoryBridge, resetDialogueMemoryBridge } = await import('../../../systems/ai/DialogueMemoryBridge.js');
    resetDialogueMemoryBridge();
    const bridge = createDialogueMemoryBridge({});
    expect(bridge.archiveDialogue('npc1', 'player1', 'Hello', 'Hi there')).toBeInstanceOf(Promise);
  });
});

describe('DialogueMemoryBridge - getFamiliarityLabel', () => {
  it('should be async', async () => {
    const { createDialogueMemoryBridge, resetDialogueMemoryBridge } = await import('../../../systems/ai/DialogueMemoryBridge.js');
    resetDialogueMemoryBridge();
    const bridge = createDialogueMemoryBridge({});
    expect(bridge.getFamiliarityLabel('npc1')).toBeInstanceOf(Promise);
  });
});

describe('DialogueMemoryBridge - getMemoryOverview', () => {
  it('should be async', async () => {
    const { createDialogueMemoryBridge, resetDialogueMemoryBridge } = await import('../../../systems/ai/DialogueMemoryBridge.js');
    resetDialogueMemoryBridge();
    const bridge = createDialogueMemoryBridge({});
    expect(bridge.getMemoryOverview('npc1')).toBeInstanceOf(Promise);
  });
});

describe('DialogueMemoryBridge - searchMemories', () => {
  it('should be async', async () => {
    const { createDialogueMemoryBridge, resetDialogueMemoryBridge } = await import('../../../systems/ai/DialogueMemoryBridge.js');
    resetDialogueMemoryBridge();
    const bridge = createDialogueMemoryBridge({});
    expect(bridge.searchMemories('npc1', 'player1', 'test')).toBeInstanceOf(Promise);
  });
});

describe('DialogueMemoryBridge - getFamiliarityColor', () => {
  it('should be async', async () => {
    const { createDialogueMemoryBridge, resetDialogueMemoryBridge } = await import('../../../systems/ai/DialogueMemoryBridge.js');
    resetDialogueMemoryBridge();
    const bridge = createDialogueMemoryBridge({});
    expect(bridge.getFamiliarityColor('npc1')).toBeInstanceOf(Promise);
  });
});