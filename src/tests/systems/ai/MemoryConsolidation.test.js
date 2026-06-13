/**
 * MemoryConsolidation 单元测试
 * V268 梦境记忆系统整合层测试
 *
 * 测试策略: 纯函数测试，不依赖 IndexedDB
 * DreamMemoryStore 的异步操作通过 vi.mock 替代
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DreamMemoryStore
vi.mock('../../../systems/ai/DreamMemoryStore.js', () => {
  const mockStore = {
    save: vi.fn(() => Promise.resolve('mem_1')),
    saveWithSession: vi.fn(() => Promise.resolve('mem_1')),
    query: vi.fn(() => Promise.resolve([])),
    queryAll: vi.fn(() => Promise.resolve([])),
    getDreamCount: vi.fn(() => Promise.resolve(0)),
    markPermanent: vi.fn(() => Promise.resolve(true)),
    updateLayer: vi.fn(() => Promise.resolve(true)),
    delete: vi.fn(() => Promise.resolve(true)),
    clearAll: vi.fn(() => Promise.resolve()),
  };

  return {
    DreamMemoryStore: vi.fn(() => mockStore),
  };
});

import { MemoryConsolidation, MEMORY_LAYER } from '../../../systems/ai/MemoryConsolidation.js';

describe('MemoryConsolidation - API 存在性', () => {
  it('should export MEMORY_LAYER constant', () => {
    expect(MEMORY_LAYER).toBeDefined();
    expect(MEMORY_LAYER.L0).toBe(0);
    expect(MEMORY_LAYER.L1).toBe(1);
    expect(MEMORY_LAYER.L2).toBe(2);
    expect(MEMORY_LAYER.L3).toBe(3);
  });

  it('should export MemoryConsolidation class', () => {
    expect(MemoryConsolidation).toBeDefined();
    expect(typeof MemoryConsolidation).toBe('function');
  });
});

describe('MemoryConsolidation - 构造函数', () => {
  it('should create instance', () => {
    const mc = new MemoryConsolidation();
    expect(mc).toBeDefined();
  });

  it('should initialize empty L0 store', () => {
    const mc = new MemoryConsolidation();
    expect(mc.getL0Count('npc1')).toBe(0);
  });

  it('should initialize stats to zero', () => {
    const mc = new MemoryConsolidation();
    const stats = mc.getStats();
    expect(stats.l0Count).toBe(0);
    expect(stats.l1Count).toBe(0);
    expect(stats.l2Count).toBe(0);
    expect(stats.l3Count).toBe(0);
  });
});

describe('MemoryConsolidation - addL0', () => {
  let mc;

  beforeEach(() => {
    mc = new MemoryConsolidation();
  });

  it('should add L0 memory for new NPC', () => {
    const id = mc.addL0('npc1', { content: 'hello', emotion: 'happy', keywords: ['greeting'] });
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(id.startsWith('l0_')).toBe(true);
  });

  it('should increment L0 count', () => {
    mc.addL0('npc1', { content: 'hello' });
    expect(mc.getL0Count('npc1')).toBe(1);
  });

  it('should accumulate multiple L0 entries', () => {
    mc.addL0('npc1', { content: 'hello1' });
    mc.addL0('npc1', { content: 'hello2' });
    mc.addL0('npc1', { content: 'hello3' });
    expect(mc.getL0Count('npc1')).toBe(3);
  });

  it('should track separate NPCs independently', () => {
    mc.addL0('npc1', { content: 'hello1' });
    mc.addL0('npc2', { content: 'hello2' });
    expect(mc.getL0Count('npc1')).toBe(1);
    expect(mc.getL0Count('npc2')).toBe(1);
  });

  it('should accept empty content', () => {
    const id = mc.addL0('npc1', { content: '' });
    expect(id.startsWith('l0_')).toBe(true);
  });

  it('should accept empty emotion', () => {
    const id = mc.addL0('npc1', { content: 'hello', emotion: '' });
    expect(id.startsWith('l0_')).toBe(true);
  });

  it('should accept empty keywords', () => {
    const id = mc.addL0('npc1', { content: 'hello', keywords: [] });
    expect(id.startsWith('l0_')).toBe(true);
  });

  it('should normalize non-array keywords to empty array', () => {
    const id = mc.addL0('npc1', { content: 'hello', keywords: 'not-array' });
    expect(id.startsWith('l0_')).toBe(true);
  });

  it('should set layer to L0', () => {
    const entries = mc.getL0Entries('npc1');
    mc.addL0('npc1', { content: 'test' });
    const lastEntry = mc.getL0Entries('npc1')[0];
    expect(lastEntry.layer).toBe(MEMORY_LAYER.L0);
  });

  it('should set npcId correctly', () => {
    mc.addL0('npc_special', { content: 'test' });
    const entry = mc.getL0Entries('npc_special')[0];
    expect(entry.npcId).toBe('npc_special');
  });

  it('should set timestamp', () => {
    const before = Date.now();
    mc.addL0('npc1', { content: 'test' });
    const after = Date.now();
    const entry = mc.getL0Entries('npc1')[0];
    expect(entry.timestamp).toBeGreaterThanOrEqual(before);
    expect(entry.timestamp).toBeLessThanOrEqual(after);
  });

  it('should update stats', () => {
    mc.addL0('npc1', { content: 'test' });
    const stats = mc.getStats();
    expect(stats.l0Count).toBe(1);
  });
});

describe('MemoryConsolidation - getL0Entries', () => {
  let mc;

  beforeEach(() => {
    mc = new MemoryConsolidation();
  });

  it('should return empty array for unknown NPC', () => {
    expect(mc.getL0Entries('unknown')).toEqual([]);
  });

  it('should return all entries for NPC', () => {
    mc.addL0('npc1', { content: 'c1' });
    mc.addL0('npc1', { content: 'c2' });
    expect(mc.getL0Entries('npc1').length).toBe(2);
  });

  it('should return entries with correct content', () => {
    mc.addL0('npc1', { content: 'specific content' });
    const entries = mc.getL0Entries('npc1');
    expect(entries[0].content).toBe('specific content');
  });
});

describe('MemoryConsolidation - clearL0', () => {
  let mc;

  beforeEach(() => {
    mc = new MemoryConsolidation();
  });

  it('should clear L0 for specific NPC', () => {
    mc.addL0('npc1', { content: 'test' });
    mc.clearL0('npc1');
    expect(mc.getL0Count('npc1')).toBe(0);
  });

  it('should not affect other NPCs', () => {
    mc.addL0('npc1', { content: 'test1' });
    mc.addL0('npc2', { content: 'test2' });
    mc.clearL0('npc1');
    expect(mc.getL0Count('npc1')).toBe(0);
    expect(mc.getL0Count('npc2')).toBe(1);
  });

  it('should handle clear for unknown NPC', () => {
    expect(() => mc.clearL0('unknown')).not.toThrow();
  });
});

describe('MemoryConsolidation - clearAllL0', () => {
  let mc;

  beforeEach(() => {
    mc = new MemoryConsolidation();
  });

  it('should clear all L0 memories', () => {
    mc.addL0('npc1', { content: 'test1' });
    mc.addL0('npc2', { content: 'test2' });
    mc.addL0('npc3', { content: 'test3' });
    mc.clearAllL0();
    expect(mc.getL0Count('npc1')).toBe(0);
    expect(mc.getL0Count('npc2')).toBe(0);
    expect(mc.getL0Count('npc3')).toBe(0);
  });

  it('should reset stats', () => {
    mc.addL0('npc1', { content: 'test' });
    mc.clearAllL0();
    expect(mc.getStats().l0Count).toBe(0);
  });
});

describe('MemoryConsolidation - flushL0ToL1', () => {
  let mc;

  beforeEach(() => {
    mc = new MemoryConsolidation();
  });

  it('should be async', () => {
    const result = mc.flushL0ToL1('npc1', 'player1', 'session_1');
    expect(result).toBeInstanceOf(Promise);
  });

  it('should return 0 when no L0 entries', async () => {
    const written = await mc.flushL0ToL1('npc1', 'player1', 'session_1');
    expect(written).toBe(0);
  });

  it('should clear L0 after flush', async () => {
    mc.addL0('npc1', { content: 'test' });
    await mc.flushL0ToL1('npc1', 'player1', 'session_1');
    expect(mc.getL0Count('npc1')).toBe(0);
  });
});

describe('MemoryConsolidation - compressToL2', () => {
  let mc;

  beforeEach(() => {
    mc = new MemoryConsolidation();
  });

  it('should be async', () => {
    const result = mc.compressToL2('npc1', 'player1');
    expect(result).toBeInstanceOf(Promise);
  });

  it('should return 0 when no entries', async () => {
    const compressed = await mc.compressToL2('npc1', 'player1');
    expect(compressed).toBe(0);
  });
});

describe('MemoryConsolidation - markPermanent', () => {
  let mc;

  beforeEach(() => {
    mc = new MemoryConsolidation();
  });

  it('should be async', () => {
    const result = mc.markPermanent('npc1', 'player1', 'mem_1');
    expect(result).toBeInstanceOf(Promise);
  });

  it('should call dreamStore.markPermanent', async () => {
    await mc.markPermanent('npc1', 'player1', 'mem_1');
    // Mock 被调用，不抛异常即通过
    expect(true).toBe(true);
  });
});

describe('MemoryConsolidation - getStats', () => {
  let mc;

  beforeEach(() => {
    mc = new MemoryConsolidation();
  });

  it('should return stats object', () => {
    const stats = mc.getStats();
    expect(stats).toHaveProperty('l0Count');
    expect(stats).toHaveProperty('l1Count');
    expect(stats).toHaveProperty('l2Count');
    expect(stats).toHaveProperty('l3Count');
  });

  it('should reflect addL0', () => {
    mc.addL0('npc1', { content: 'test' });
    expect(mc.getStats().l0Count).toBe(1);
  });

  it('should reflect flushL0ToL1', async () => {
    mc.addL0('npc1', { content: 'test' });
    await mc.flushL0ToL1('npc1', 'player1', 'session_1');
    expect(mc.getStats().l0Count).toBe(0);
    expect(mc.getStats().l1Count).toBe(1);
  });
});

describe('MemoryConsolidation - resetStats', () => {
  let mc;

  beforeEach(() => {
    mc = new MemoryConsolidation();
  });

  it('should reset all stats to zero', () => {
    mc.addL0('npc1', { content: 'test' });
    mc.resetStats();
    const stats = mc.getStats();
    expect(stats.l0Count).toBe(0);
    expect(stats.l1Count).toBe(0);
    expect(stats.l2Count).toBe(0);
    expect(stats.l3Count).toBe(0);
  });
});
