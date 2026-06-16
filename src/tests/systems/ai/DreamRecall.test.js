/**
 * DreamRecall 单元测试
 * V268 梦境记忆系统回忆层测试
 *
 * 测试策略: 纯函数测试 + 直接注入 mock store
 * 每个测试显式创建 DreamRecall 实例，不依赖全局状态
 * 不测试无参数构造函数（会尝试访问 indexedDB）
 */

import { describe, it, expect, vi } from 'vitest';

describe('DreamRecall - FAMILIARITY 常量', () => {
  it('should export all familiarity levels', async () => {
    const { FAMILIARITY } = await import('../../../systems/ai/DreamRecall.js');
    expect(FAMILIARITY.STRANGER).toBe('stranger');
    expect(FAMILIARITY.ACQUAINTANCE).toBe('acquaintance');
    expect(FAMILIARITY.FAMILIAR).toBe('familiar');
    expect(FAMILIARITY.INTIMATE).toBe('intimate');
  });
});

describe('DreamRecall - API 存在性', () => {
  it('should export DreamRecall class', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    expect(typeof DreamRecall).toBe('function');
  });
});

describe('DreamRecall - 构造函数', () => {
  it('should create instance with custom store', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const mockStore = {};
    const recall = new DreamRecall(mockStore);
    expect(recall).toBeDefined();
    expect(recall.getStore()).toBe(mockStore);
  });
});

describe('DreamRecall - recall', () => {
  it('should have recall method', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const recall = new DreamRecall({ queryAll: () => Promise.resolve([]) });
    expect(typeof recall.recall).toBe('function');
  });

  it('should be async', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const recall = new DreamRecall({ queryAll: () => Promise.resolve([]) });
    expect(recall.recall('npc1', 'player1')).toBeInstanceOf(Promise);
  });

  it('should call store.queryAll', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const mockStore = { queryAll: vi.fn(() => Promise.resolve([])) };
    const recall = new DreamRecall(mockStore);
    await recall.recall('npc1', 'player1');
    expect(mockStore.queryAll).toHaveBeenCalledWith('npc1', 'player1');
  });

  it('should return array', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const mockStore = { queryAll: () => Promise.resolve([]) };
    const recall = new DreamRecall(mockStore);
    const results = await recall.recall('npc1', 'player1');
    expect(Array.isArray(results)).toBe(true);
  });

  it('should sort by timestamp descending', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const mockStore = {
      queryAll: () => Promise.resolve([
        { id: '1', timestamp: 1000 },
        { id: '2', timestamp: 3000 },
        { id: '3', timestamp: 2000 },
      ]),
    };
    const recall = new DreamRecall(mockStore);
    const results = await recall.recall('npc1', 'player1');
    expect(results[0].id).toBe('2'); // timestamp 3000 first
    expect(results[1].id).toBe('3'); // timestamp 2000 second
    expect(results[2].id).toBe('1'); // timestamp 1000 third
  });
});

describe('DreamRecall - getLastConversation', () => {
  it('should have getLastConversation method', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const recall = new DreamRecall({ queryAll: () => Promise.resolve([]) });
    expect(typeof recall.getLastConversation).toBe('function');
  });

  it('should be async', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const recall = new DreamRecall({ queryAll: () => Promise.resolve([]) });
    expect(recall.getLastConversation('npc1', 'player1')).toBeInstanceOf(Promise);
  });

  it('should return null when no dreams', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const mockStore = { queryAll: () => Promise.resolve([]) };
    const recall = new DreamRecall(mockStore);
    const result = await recall.getLastConversation('npc1', 'player1');
    expect(result).toBeNull();
  });

  it('should return latest dream', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const mockStore = {
      queryAll: () => Promise.resolve([
        { id: '1', content: 'old', timestamp: 1000 },
        { id: '2', content: 'new', timestamp: 2000 },
      ]),
    };
    const recall = new DreamRecall(mockStore);
    const result = await recall.getLastConversation('npc1', 'player1');
    expect(result.content).toBe('new');
  });
});

describe('DreamRecall - hasDream', () => {
  it('should have hasDream method', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const recall = new DreamRecall({ getDreamCount: () => Promise.resolve(0) });
    expect(typeof recall.hasDream).toBe('function');
  });

  it('should be async', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const recall = new DreamRecall({ getDreamCount: () => Promise.resolve(0) });
    expect(recall.hasDream('npc1', 'player1')).toBeInstanceOf(Promise);
  });

  it('should return false when no dreams', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const mockStore = { getDreamCount: () => Promise.resolve(0) };
    const recall = new DreamRecall(mockStore);
    const result = await recall.hasDream('npc1', 'player1');
    expect(result).toBe(false);
  });

  it('should return true when has dreams', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const mockStore = { getDreamCount: () => Promise.resolve(1) };
    const recall = new DreamRecall(mockStore);
    const result = await recall.hasDream('npc1', 'player1');
    expect(result).toBe(true);
  });
});

describe('DreamRecall - getFamiliarityLevel', () => {
  it('should have getFamiliarityLevel method', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const recall = new DreamRecall({ getDreamCount: () => Promise.resolve(0) });
    expect(typeof recall.getFamiliarityLevel).toBe('function');
  });

  it('should be async', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const mockStore = { getDreamCount: () => Promise.resolve(0) };
    const recall = new DreamRecall(mockStore);
    expect(recall.getFamiliarityLevel('npc1', 'player1')).toBeInstanceOf(Promise);
  });

  it('should return STRANGER for 0 dreams', async () => {
    const { DreamRecall, FAMILIARITY } = await import('../../../systems/ai/DreamRecall.js');
    const mockStore = { getDreamCount: () => Promise.resolve(0) };
    const recall = new DreamRecall(mockStore);
    const result = await recall.getFamiliarityLevel('npc1', 'player1');
    expect(result).toBe(FAMILIARITY.STRANGER);
  });

  it('should return ACQUAINTANCE for 1-3 dreams', async () => {
    const { DreamRecall, FAMILIARITY } = await import('../../../systems/ai/DreamRecall.js');
    const mockStore = { getDreamCount: () => Promise.resolve(1) };
    const recall = new DreamRecall(mockStore);
    const result = await recall.getFamiliarityLevel('npc1', 'player1');
    expect(result).toBe(FAMILIARITY.ACQUAINTANCE);
  });

  it('should return FAMILIAR for 4-9 dreams', async () => {
    const { DreamRecall, FAMILIARITY } = await import('../../../systems/ai/DreamRecall.js');
    const mockStore = { getDreamCount: () => Promise.resolve(4) };
    const recall = new DreamRecall(mockStore);
    const result = await recall.getFamiliarityLevel('npc1', 'player1');
    expect(result).toBe(FAMILIARITY.FAMILIAR);
  });

  it('should return INTIMATE for 10+ dreams', async () => {
    const { DreamRecall, FAMILIARITY } = await import('../../../systems/ai/DreamRecall.js');
    const mockStore = { getDreamCount: () => Promise.resolve(10) };
    const recall = new DreamRecall(mockStore);
    const result = await recall.getFamiliarityLevel('npc1', 'player1');
    expect(result).toBe(FAMILIARITY.INTIMATE);
  });
});

describe('DreamRecall - getMemoriesByEmotion', () => {
  it('should have getMemoriesByEmotion method', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const recall = new DreamRecall({ queryAll: () => Promise.resolve([]) });
    expect(typeof recall.getMemoriesByEmotion).toBe('function');
  });

  it('should filter by emotion', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const mockStore = {
      queryAll: () => Promise.resolve([
        { id: '1', emotion: 'happy', content: 'happy memory' },
        { id: '2', emotion: 'sad', content: 'sad memory' },
        { id: '3', emotion: 'happy', content: 'another happy' },
      ]),
    };
    const recall = new DreamRecall(mockStore);
    const results = await recall.getMemoriesByEmotion('npc1', 'player1', 'happy');
    expect(results.length).toBe(2);
    expect(results.every(m => m.emotion === 'happy')).toBe(true);
  });
});

describe('DreamRecall - searchByKeyword', () => {
  it('should have searchByKeyword method', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const recall = new DreamRecall({ queryAll: () => Promise.resolve([]) });
    expect(typeof recall.searchByKeyword).toBe('function');
  });

  it('should search in keywords', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const mockStore = {
      queryAll: () => Promise.resolve([
        { id: '1', keywords: ['fire', 'attack'], content: 'fire attack' },
        { id: '2', keywords: ['ice', 'defense'], content: 'ice defense' },
        { id: '3', keywords: ['fire', 'heal'], content: 'fire heal' },
      ]),
    };
    const recall = new DreamRecall(mockStore);
    const results = await recall.searchByKeyword('npc1', 'player1', 'fire');
    expect(results.length).toBe(2);
  });

  it('should search in content', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const mockStore = {
      queryAll: () => Promise.resolve([
        { id: '1', keywords: ['fire', 'attack'], content: 'fire attack' },
        { id: '2', keywords: ['ice', 'defense'], content: 'ice defense' },
      ]),
    };
    const recall = new DreamRecall(mockStore);
    const results = await recall.searchByKeyword('npc1', 'player1', 'attack');
    expect(results.length).toBe(1);
  });
});

describe('DreamRecall - getStore', () => {
  it('should return the store', async () => {
    const { DreamRecall } = await import('../../../systems/ai/DreamRecall.js');
    const customStore = {};
    const recall = new DreamRecall(customStore);
    expect(recall.getStore()).toBe(customStore);
  });
});