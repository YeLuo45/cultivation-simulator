/**
 * DreamEmotionAnalyzer 单元测试
 * V268 Iteration 6/9 - Dream Memory 情感分析引擎
 *
 * 测试策略: 测试情感提取和分析逻辑
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createDreamEmotionAnalyzer, EMOTION_TYPES } from '../../../systems/ai/DreamEmotionAnalyzer.js';

// Mock IndexedDB
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

describe('DreamEmotionAnalyzer - 导出', () => {
  it('should export createDreamEmotionAnalyzer function', async () => {
    expect(typeof createDreamEmotionAnalyzer).toBe('function');
  });

  it('should export EMOTION_TYPES constant', async () => {
    expect(EMOTION_TYPES).toBeDefined();
    expect(typeof EMOTION_TYPES).toBe('object');
  });
});

describe('DreamEmotionAnalyzer - 实例方法', () => {
  it('should create analyzer instance', async () => {
    const analyzer = createDreamEmotionAnalyzer({});
    expect(analyzer).toBeDefined();
  });

  it('should have extractEmotions method', async () => {
    const analyzer = createDreamEmotionAnalyzer({});
    expect(typeof analyzer.extractEmotions).toBe('function');
  });

  it('should have getPrimaryEmotion method', async () => {
    const analyzer = createDreamEmotionAnalyzer({});
    expect(typeof analyzer.getPrimaryEmotion).toBe('function');
  });

  it('should have analyzeTrend method', async () => {
    const analyzer = createDreamEmotionAnalyzer({});
    expect(typeof analyzer.analyzeTrend).toBe('function');
  });

  it('should have calculateFamiliarityBonus method', async () => {
    const analyzer = createDreamEmotionAnalyzer({});
    expect(typeof analyzer.calculateFamiliarityBonus).toBe('function');
  });

  it('should have aggregateEmotionKeywords method', async () => {
    const analyzer = createDreamEmotionAnalyzer({});
    expect(typeof analyzer.aggregateEmotionKeywords).toBe('function');
  });

  it('should have utility methods', async () => {
    const analyzer = createDreamEmotionAnalyzer({});
    expect(typeof analyzer.isPositive).toBe('function');
    expect(typeof analyzer.isNegative).toBe('function');
    expect(typeof analyzer.getEmotionWeight).toBe('function');
    expect(typeof analyzer.getEmotionColor).toBe('function');
    expect(typeof analyzer.getAllEmotionTypes).toBe('function');
  });
});

describe('DreamEmotionAnalyzer - extractEmotions', () => {
  it('should extract joy emotion', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    const result = analyzer.extractEmotions('I am so happy and joyful today');
    expect(result.emotions).toContain('joy');
  });

  it('should extract sadness emotion', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    const result = analyzer.extractEmotions('I feel sad and sorrowful');
    expect(result.emotions).toContain('sadness');
  });

  it('should extract love emotion', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    const result = analyzer.extractEmotions('I love you so much');
    expect(result.emotions).toContain('love');
  });

  it('should extract multiple emotions', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    const result = analyzer.extractEmotions('I am happy but also a bit sad');
    expect(result.emotions).toContain('joy');
    expect(result.emotions).toContain('sadness');
  });

  it('should handle empty text', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    const result = analyzer.extractEmotions('');
    expect(result.emotions).toEqual([]);
  });

  it('should handle null text', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    const result = analyzer.extractEmotions(null);
    expect(result.emotions).toEqual([]);
  });

  it('should handle text without emotions', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    const result = analyzer.extractEmotions('This is a normal sentence with nothing special');
    expect(result.emotions).toEqual([]);
  });

  it('should return scores for found emotions', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    const result = analyzer.extractEmotions('I am happy and joyful');
    expect(result.scores).toHaveProperty('joy');
    expect(result.scores.joy).toBeGreaterThan(0);
  });
});

describe('DreamEmotionAnalyzer - getPrimaryEmotion', () => {
  it('should return primary emotion', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    const result = analyzer.getPrimaryEmotion('I am happy and joyful');
    expect(result).toBe('joy');
  });

  it('should return null for text without emotions', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    const result = analyzer.getPrimaryEmotion('Just a normal day');
    expect(result).toBeNull();
  });

  it('should return null for empty text', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    const result = analyzer.getPrimaryEmotion('');
    expect(result).toBeNull();
  });
});

describe('DreamEmotionAnalyzer - utility methods', () => {
  it('isPositive should return true for positive emotions', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    expect(analyzer.isPositive('joy')).toBe(true);
    expect(analyzer.isPositive('love')).toBe(true);
    expect(analyzer.isPositive('trust')).toBe(true);
  });

  it('isNegative should return true for negative emotions', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    expect(analyzer.isNegative('sadness')).toBe(true);
    expect(analyzer.isNegative('anger')).toBe(true);
    expect(analyzer.isNegative('fear')).toBe(true);
  });

  it('getEmotionWeight should return weight for known emotions', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    expect(analyzer.getEmotionWeight('joy')).toBe(1.2);
    expect(analyzer.getEmotionWeight('love')).toBe(1.5);
    expect(analyzer.getEmotionWeight('anger')).toBe(0.5);
  });

  it('getEmotionWeight should return 1.0 for unknown emotions', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    expect(analyzer.getEmotionWeight('unknown')).toBe(1.0);
  });

  it('getEmotionColor should return color for known emotions', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    expect(analyzer.getEmotionColor('joy')).toBe('#FFD700');
    expect(analyzer.getEmotionColor('love')).toBe('#FF69B4');
  });

  it('getEmotionColor should return default for unknown emotions', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    expect(analyzer.getEmotionColor('unknown')).toBe('#888888');
  });

  it('getAllEmotionTypes should return all emotion types', () => {
    const analyzer = createDreamEmotionAnalyzer({});
    const types = analyzer.getAllEmotionTypes();
    expect(types).toContain('joy');
    expect(types).toContain('sadness');
    expect(types).toContain('love');
    expect(types.length).toBe(10);
  });
});

describe('DreamEmotionAnalyzer - analyzeTrend', () => {
  it('should be async', async () => {
    const analyzer = createDreamEmotionAnalyzer({
      queryRecent: vi.fn(() => Promise.resolve([])),
    });
    expect(analyzer.analyzeTrend('npc1')).toBeInstanceOf(Promise);
  });

  it('should return trend object', async () => {
    const analyzer = createDreamEmotionAnalyzer({
      queryRecent: vi.fn(() => Promise.resolve([])),
    });
    const result = await analyzer.analyzeTrend('npc1');
    expect(result).toHaveProperty('trend');
    expect(result).toHaveProperty('positive');
    expect(result).toHaveProperty('negative');
    expect(result).toHaveProperty('dominant');
  });
});

describe('DreamEmotionAnalyzer - calculateFamiliarityBonus', () => {
  it('should be async', async () => {
    const analyzer = createDreamEmotionAnalyzer({
      queryRecent: vi.fn(() => Promise.resolve([])),
    });
    expect(analyzer.calculateFamiliarityBonus('npc1')).toBeInstanceOf(Promise);
  });

  it('should return familiarity bonus object', async () => {
    const analyzer = createDreamEmotionAnalyzer({
      queryRecent: vi.fn(() => Promise.resolve([])),
    });
    const result = await analyzer.calculateFamiliarityBonus('npc1');
    expect(result).toHaveProperty('familiarityBonus');
    expect(result).toHaveProperty('emotionCount');
  });
});

describe('DreamEmotionAnalyzer - aggregateEmotionKeywords', () => {
  it('should be async', async () => {
    const analyzer = createDreamEmotionAnalyzer({
      queryRecent: vi.fn(() => Promise.resolve([])),
    });
    expect(analyzer.aggregateEmotionKeywords('npc1')).toBeInstanceOf(Promise);
  });

  it('should return aggregation object', async () => {
    const analyzer = createDreamEmotionAnalyzer({
      queryRecent: vi.fn(() => Promise.resolve([])),
    });
    const result = await analyzer.aggregateEmotionKeywords('npc1');
    expect(result).toHaveProperty('topEmotions');
    expect(result).toHaveProperty('topKeywords');
  });
});