/**
 * EmotionResonanceEngine.test.js
 * V287 Iteration 2/9 - EmotionResonanceEngine Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmotionResonanceEngine, RESONANCE_LEVELS } from '../../../systems/ai/EmotionResonanceEngine.js';

// Mock dependencies
const createMockExperienceTracker = () => ({
  getStats: vi.fn(),
  getRecords: vi.fn(),
  getRecentRecords: vi.fn(),
});

const createMockDreamEmotionAnalyzer = () => ({
  analyzeTrend: vi.fn(),
  calculateFamiliarityBonus: vi.fn(),
  aggregateEmotionKeywords: vi.fn(),
});

describe('EmotionResonanceEngine', () => {
  let engine;
  let mockExperienceTracker;
  let mockDreamEmotionAnalyzer;

  beforeEach(() => {
    mockExperienceTracker = createMockExperienceTracker();
    mockDreamEmotionAnalyzer = createMockDreamEmotionAnalyzer();
    engine = new EmotionResonanceEngine(mockExperienceTracker, mockDreamEmotionAnalyzer);
  });

  describe('constructor', () => {
    it('should create engine with experienceTracker and dreamEmotionAnalyzer', () => {
      expect(engine.experienceTracker).toBe(mockExperienceTracker);
      expect(engine.dreamEmotionAnalyzer).toBe(mockDreamEmotionAnalyzer);
      expect(engine.resonanceHistory).toBeInstanceOf(Map);
    });

    it('should initialize empty resonance history', () => {
      expect(engine.resonanceHistory.size).toBe(0);
    });
  });

  describe('calculateResonance', () => {
    it('should return near-zero resonance for new NPC', async () => {
      mockExperienceTracker.getStats.mockReturnValue({
        totalInteractions: 0,
        successRate: 0,
        avgSatisfaction: 0,
      });
      mockDreamEmotionAnalyzer.analyzeTrend.mockResolvedValue({
        trend: 'neutral',
        positive: 0,
        negative: 0,
        dominant: null,
      });
      mockDreamEmotionAnalyzer.calculateFamiliarityBonus.mockResolvedValue({
        familiarityBonus: 0,
        emotionCount: 0,
      });

      const result = await engine.calculateResonance('npc1', 'player1');

      expect(result.level).toBeLessThan(0.2);
      expect(result.factors).toHaveLength(3);
    });

    it('should calculate resonance based on interaction history', async () => {
      mockExperienceTracker.getStats.mockReturnValue({
        totalInteractions: 50,
        successRate: 0.8,
        avgSatisfaction: 0.9,
      });
      mockDreamEmotionAnalyzer.analyzeTrend.mockResolvedValue({
        trend: 'positive',
        positive: 8,
        negative: 2,
        dominant: 'joy',
      });
      mockDreamEmotionAnalyzer.calculateFamiliarityBonus.mockResolvedValue({
        familiarityBonus: 0.5,
        emotionCount: 10,
      });

      const result = await engine.calculateResonance('npc1', 'player1');

      expect(result.level).toBeGreaterThan(0);
      expect(result.dominantEmotion).toBe('joy');
      expect(result.factors.length).toBe(3);
    });

    it('should include all three resonance factors', async () => {
      mockExperienceTracker.getStats.mockReturnValue({
        totalInteractions: 30,
        successRate: 0.6,
        avgSatisfaction: 0.7,
      });
      mockDreamEmotionAnalyzer.analyzeTrend.mockResolvedValue({
        trend: 'positive',
        positive: 5,
        negative: 2,
        dominant: 'trust',
      });
      mockDreamEmotionAnalyzer.calculateFamiliarityBonus.mockResolvedValue({
        familiarityBonus: 0.3,
        emotionCount: 5,
      });

      const result = await engine.calculateResonance('npc1', 'player1');

      const factorNames = result.factors.map(f => f.name);
      expect(factorNames).toContain('interactionHistory');
      expect(factorNames).toContain('dreamEmotion');
      expect(factorNames).toContain('familiarity');
    });

    it('should handle dream analyzer being null', async () => {
      const engineWithoutDream = new EmotionResonanceEngine(mockExperienceTracker, null);

      mockExperienceTracker.getStats.mockReturnValue({
        totalInteractions: 10,
        successRate: 0.5,
        avgSatisfaction: 0.5,
      });

      const result = await engineWithoutDream.calculateResonance('npc1', 'player1');

      expect(result.level).toBeGreaterThanOrEqual(0);
      expect(result.error).toBeUndefined();
    });

    it('should cap resonance level at 1', async () => {
      mockExperienceTracker.getStats.mockReturnValue({
        totalInteractions: 200,
        successRate: 1.0,
        avgSatisfaction: 1.0,
      });
      mockDreamEmotionAnalyzer.analyzeTrend.mockResolvedValue({
        trend: 'positive',
        positive: 20,
        negative: 0,
        dominant: 'love',
      });
      mockDreamEmotionAnalyzer.calculateFamiliarityBonus.mockResolvedValue({
        familiarityBonus: 1,
        emotionCount: 50,
      });

      const result = await engine.calculateResonance('npc1', 'player1');

      expect(result.level).toBeLessThanOrEqual(1);
    });

    it('should return default dominant emotion when not available', async () => {
      mockExperienceTracker.getStats.mockReturnValue({
        totalInteractions: 5,
        successRate: 0.4,
        avgSatisfaction: 0.5,
      });
      mockDreamEmotionAnalyzer.analyzeTrend.mockResolvedValue({
        trend: 'neutral',
        positive: 0,
        negative: 0,
        dominant: null,
      });
      mockDreamEmotionAnalyzer.calculateFamiliarityBonus.mockResolvedValue({
        familiarityBonus: 0,
        emotionCount: 0,
      });

      const result = await engine.calculateResonance('npc1', 'player1');

      expect(result.dominantEmotion).toBeTruthy();
    });
  });

  describe('adjustResponse', () => {
    it('should add warm prefix and suffix for high resonance', () => {
      const baseResponse = { content: '你好', tone: 'neutral' };
      const result = engine.adjustResponse('npc1', baseResponse, 0.8);

      expect(result.resonanceAdjusted).toBe(true);
      expect(result.temperature).toBe(1.2);
      expect(result.content).toContain('你好');
    });

    it('should add cold prefix for low resonance', () => {
      const baseResponse = { content: '你好', tone: 'neutral' };
      const result = engine.adjustResponse('npc1', baseResponse, 0.2);

      expect(result.resonanceAdjusted).toBe(true);
      expect(result.temperature).toBe(0.8);
    });

    it('should not modify content for moderate resonance', () => {
      const baseResponse = { content: '你好', tone: 'neutral' };
      const result = engine.adjustResponse('npc1', baseResponse, 0.5);

      expect(result.content).toBe('你好');
      expect(result.temperature).toBe(1.0);
    });

    it('should set resonance level in response', () => {
      const baseResponse = { content: '测试', tone: 'neutral' };
      const result = engine.adjustResponse('npc1', baseResponse, 0.75);

      expect(result.resonanceLevel).toBe(0.75);
    });

    it('should clamp resonance level to 0-1 range', () => {
      const baseResponse = { content: '测试', tone: 'neutral' };
      
      const resultHigh = engine.adjustResponse('npc1', baseResponse, 1.5);
      expect(resultHigh.resonanceLevel).toBe(1);

      const resultLow = engine.adjustResponse('npc1', baseResponse, -0.5);
      expect(resultLow.resonanceLevel).toBe(0);
    });

    it('should preserve original response properties', () => {
      const baseResponse = { 
        content: '原始内容', 
        tone: 'friendly',
        customField: 'customValue'
      };
      const result = engine.adjustResponse('npc1', baseResponse, 0.6);

      expect(result.customField).toBe('customValue');
      expect(result.tone).toBe('friendly');
    });
  });

  describe('recordResonance', () => {
    it('should record resonance event successfully', () => {
      const result = engine.recordResonance('npc1', 'player1', 'joy', 0.8);

      expect(result.success).toBe(true);
      expect(result.event).toBeDefined();
      expect(result.event.npcId).toBe('npc1');
      expect(result.event.emotionType).toBe('joy');
      expect(result.event.intensity).toBe(0.8);
    });

    it('should store event in resonance history', () => {
      engine.recordResonance('npc1', 'player1', 'joy', 0.7);
      engine.recordResonance('npc1', 'player1', 'trust', 0.6);

      const history = engine.getResonanceHistory('npc1');
      expect(history.length).toBe(2);
    });

    it('should cap intensity to 0-1 range', () => {
      const result1 = engine.recordResonance('npc1', 'player1', 'joy', 1.5);
      expect(result1.event.intensity).toBe(1);

      const result2 = engine.recordResonance('npc1', 'player1', 'joy', -0.5);
      expect(result2.event.intensity).toBe(0);
    });

    it('should limit history to 100 events per NPC', () => {
      for (let i = 0; i < 120; i++) {
        engine.recordResonance('npc1', 'player1', 'joy', 0.5);
      }

      const history = engine.getResonanceHistory('npc1');
      expect(history.length).toBeLessThanOrEqual(100);
    });

    it('should generate unique event IDs', () => {
      const result1 = engine.recordResonance('npc1', 'player1', 'joy', 0.5);
      const result2 = engine.recordResonance('npc1', 'player1', 'trust', 0.6);

      expect(result1.event.id).not.toBe(result2.event.id);
    });
  });

  describe('getResonanceHistory', () => {
    it('should return empty array for unknown NPC', () => {
      const history = engine.getResonanceHistory('unknown_npc');
      expect(history).toEqual([]);
    });

    it('should return recent events in order', () => {
      engine.recordResonance('npc1', 'player1', 'joy', 0.5);
      engine.recordResonance('npc1', 'player1', 'trust', 0.6);
      engine.recordResonance('npc1', 'player1', 'love', 0.7);

      const history = engine.getResonanceHistory('npc1');
      expect(history.length).toBe(3);
      expect(history[0].emotionType).toBe('joy');
      expect(history[2].emotionType).toBe('love');
    });

    it('should respect limit parameter', () => {
      for (let i = 0; i < 10; i++) {
        engine.recordResonance('npc1', 'player1', 'joy', 0.5);
      }

      const history = engine.getResonanceHistory('npc1', 5);
      expect(history.length).toBe(5);
    });

    it('should default limit to 20', () => {
      for (let i = 0; i < 30; i++) {
        engine.recordResonance('npc1', 'player1', 'joy', 0.5);
      }

      const history = engine.getResonanceHistory('npc1');
      expect(history.length).toBe(20);
    });
  });

  describe('triggerResonanceLearning', () => {
    it('should return learning metrics for NPC with history', async () => {
      engine.recordResonance('npc1', 'player1', 'joy', 0.8);
      engine.recordResonance('npc1', 'player1', 'joy', 0.7);
      engine.recordResonance('npc1', 'player1', 'trust', 0.6);

      const result = await engine.triggerResonanceLearning('npc1');

      expect(result.success).toBe(true);
      expect(result.npcId).toBe('npc1');
      expect(result.metrics.resonanceCount).toBe(3);
      expect(result.metrics.dominantEmotion).toBe('joy');
    });

    it('should handle empty resonance history', async () => {
      const result = await engine.triggerResonanceLearning('npc1');

      expect(result.success).toBe(true);
      expect(result.metrics.resonanceCount).toBe(0);
    });

    it('should calculate resonance growth', async () => {
      // Older events with lower intensity
      for (let i = 0; i < 5; i++) {
        engine.recordResonance('npc1', 'player1', 'joy', 0.3);
      }
      // Recent events with higher intensity
      for (let i = 0; i < 5; i++) {
        engine.recordResonance('npc1', 'player1', 'joy', 0.8);
      }

      const result = await engine.triggerResonanceLearning('npc1');

      expect(result.metrics.resonanceGrowth).toBeGreaterThan(0);
    });

    it('should mark adaptation as needed for high intensity', async () => {
      for (let i = 0; i < 10; i++) {
        engine.recordResonance('npc1', 'player1', 'love', 0.7);
      }

      const result = await engine.triggerResonanceLearning('npc1');

      expect(result.metrics.adaptationNeeded).toBe(true);
    });

    it('should include growth metrics in learning result', async () => {
      // Older events with lower intensity
      for (let i = 0; i < 5; i++) {
        engine.recordResonance('npc1', 'player1', 'joy', 0.3);
      }
      // Recent events with higher intensity
      for (let i = 0; i < 5; i++) {
        engine.recordResonance('npc1', 'player1', 'joy', 0.8);
      }

      const result = await engine.triggerResonanceLearning('npc1');

      expect(result.success).toBe(true);
      expect(result.metrics.resonanceCount).toBe(10);
      expect(result.metrics.resonanceGrowth).toBeDefined();
    });
  });

  describe('RESONANCE_LEVELS constants', () => {
    it('should have correct level values', () => {
      expect(RESONANCE_LEVELS.NONE).toBe(0);
      expect(RESONANCE_LEVELS.WEAK).toBe(0.25);
      expect(RESONANCE_LEVELS.MODERATE).toBe(0.5);
      expect(RESONANCE_LEVELS.STRONG).toBe(0.75);
      expect(RESONANCE_LEVELS.DEEP).toBe(1.0);
    });
  });
});