/**
 * EmotionBridge.test.js
 * V287 Iteration 2/9 - EmotionBridge Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmotionBridge } from '../../../systems/ai/EmotionBridge.js';

// Mock dependencies
const createMockEmotionAnalyzer = () => ({
  analyzeTrend: vi.fn(),
  calculateFamiliarityBonus: vi.fn(),
  aggregateEmotionKeywords: vi.fn(),
});

const createMockResonanceEngine = () => ({
  calculateResonance: vi.fn(),
  recordResonance: vi.fn(),
  getResonanceHistory: vi.fn(),
});

describe('EmotionBridge', () => {
  let bridge;
  let mockEmotionAnalyzer;
  let mockResonanceEngine;

  beforeEach(() => {
    mockEmotionAnalyzer = createMockEmotionAnalyzer();
    mockResonanceEngine = createMockResonanceEngine();
    bridge = new EmotionBridge(mockEmotionAnalyzer, mockResonanceEngine);
  });

  describe('constructor', () => {
    it('should create bridge with emotionAnalyzer and resonanceEngine', () => {
      expect(bridge.emotionAnalyzer).toBe(mockEmotionAnalyzer);
      expect(bridge.resonanceEngine).toBe(mockResonanceEngine);
    });

    it('should initialize sync cache', () => {
      expect(bridge._syncCache).toBeInstanceOf(Map);
    });
  });

  describe('syncDreamEmotionToResonance', () => {
    it('should sync dream emotions to resonance engine', async () => {
      mockEmotionAnalyzer.analyzeTrend.mockResolvedValue({
        trend: 'positive',
        positive: 10,
        negative: 2,
        dominant: 'joy',
      });
      mockEmotionAnalyzer.calculateFamiliarityBonus.mockResolvedValue({
        familiarityBonus: 0.5,
        emotionCount: 8,
      });
      mockEmotionAnalyzer.aggregateEmotionKeywords.mockResolvedValue({
        topEmotions: ['joy', 'trust'],
        topKeywords: ['开心', '朋友'],
      });
      mockResonanceEngine.recordResonance.mockReturnValue({ success: true });

      const result = await bridge.syncDreamEmotionToResonance('npc1', 'player1');

      expect(result.success).toBe(true);
      expect(result.trend.trend).toBe('positive');
      expect(result.syncedEmotions).toContain('joy');
      expect(mockResonanceEngine.recordResonance).toHaveBeenCalled();
    });

    it('should return failure when emotion analyzer is missing', async () => {
      const bridgeWithoutAnalyzer = new EmotionBridge(null, mockResonanceEngine);

      const result = await bridgeWithoutAnalyzer.syncDreamEmotionToResonance('npc1', 'player1');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('No emotion analyzer available');
    });

    it('should record resonance with correct intensity', async () => {
      mockEmotionAnalyzer.analyzeTrend.mockResolvedValue({
        trend: 'positive',
        positive: 8,
        negative: 1,
        dominant: 'love',
      });
      mockEmotionAnalyzer.calculateFamiliarityBonus.mockResolvedValue({
        familiarityBonus: 0.3,
        emotionCount: 5,
      });
      mockEmotionAnalyzer.aggregateEmotionKeywords.mockResolvedValue({
        topEmotions: ['love', 'joy'],
        topKeywords: [],
      });
      mockResonanceEngine.recordResonance.mockReturnValue({ success: true });

      await bridge.syncDreamEmotionToResonance('npc1', 'player1');

      expect(mockResonanceEngine.recordResonance).toHaveBeenCalledWith(
        'npc1',
        'player1',
        'love',
        expect.any(Number)
      );
    });

    it('should update sync cache after syncing', async () => {
      mockEmotionAnalyzer.analyzeTrend.mockResolvedValue({
        trend: 'neutral',
        positive: 0,
        negative: 0,
        dominant: null,
      });
      mockEmotionAnalyzer.calculateFamiliarityBonus.mockResolvedValue({
        familiarityBonus: 0,
        emotionCount: 0,
      });
      mockEmotionAnalyzer.aggregateEmotionKeywords.mockResolvedValue({
        topEmotions: [],
        topKeywords: [],
      });

      await bridge.syncDreamEmotionToResonance('npc1', 'player1');

      expect(bridge._syncCache.has('npc1')).toBe(true);
      expect(bridge._syncCache.get('npc1').lastSync).toBeTruthy();
    });

    it('should handle negative trend correctly', async () => {
      mockEmotionAnalyzer.analyzeTrend.mockResolvedValue({
        trend: 'negative',
        positive: 2,
        negative: 10,
        dominant: 'sadness',
      });
      mockEmotionAnalyzer.calculateFamiliarityBonus.mockResolvedValue({
        familiarityBonus: -0.2,
        emotionCount: 5,
      });
      mockEmotionAnalyzer.aggregateEmotionKeywords.mockResolvedValue({
        topEmotions: ['sadness'],
        topKeywords: [],
      });
      mockResonanceEngine.recordResonance.mockReturnValue({ success: true });

      const result = await bridge.syncDreamEmotionToResonance('npc1', 'player1');

      expect(result.success).toBe(true);
      expect(result.trend.trend).toBe('negative');
    });

    it('should not record resonance when no dominant emotion', async () => {
      mockEmotionAnalyzer.analyzeTrend.mockResolvedValue({
        trend: 'neutral',
        positive: 0,
        negative: 0,
        dominant: null,
      });
      mockEmotionAnalyzer.calculateFamiliarityBonus.mockResolvedValue({
        familiarityBonus: 0,
        emotionCount: 0,
      });
      mockEmotionAnalyzer.aggregateEmotionKeywords.mockResolvedValue({
        topEmotions: [],
        topKeywords: [],
      });

      await bridge.syncDreamEmotionToResonance('npc1', 'player1');

      expect(mockResonanceEngine.recordResonance).not.toHaveBeenCalled();
    });

    it('should handle exceptions gracefully', async () => {
      mockEmotionAnalyzer.analyzeTrend.mockRejectedValue(new Error('Analyzer error'));

      const result = await bridge.syncDreamEmotionToResonance('npc1', 'player1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Analyzer error');
    });
  });

  describe('getNPCEmotionState', () => {
    it('should return fused emotion state', async () => {
      mockResonanceEngine.calculateResonance.mockResolvedValue({
        level: 0.75,
        dominantEmotion: 'joy',
        factors: [],
      });
      mockEmotionAnalyzer.analyzeTrend.mockResolvedValue({
        trend: 'positive',
        positive: 10,
        negative: 2,
        dominant: 'joy',
      });
      mockResonanceEngine.getResonanceHistory.mockReturnValue([
        { emotionType: 'joy', intensity: 0.8 },
        { emotionType: 'trust', intensity: 0.6 },
      ]);
      mockEmotionAnalyzer.aggregateEmotionKeywords.mockResolvedValue({
        topEmotions: ['joy', 'trust'],
        topKeywords: ['开心', '朋友'],
      });

      const result = await bridge.getNPCEmotionState('npc1', 'player1');

      expect(result.success).toBe(true);
      expect(result.state.resonanceLevel).toBe(0.75);
      expect(result.state.dominantEmotion).toBe('joy');
      expect(result.state.dreamTrend).toBe('positive');
      expect(result.state.temperature).toBe('warm');
    });

    it('should handle null emotion analyzer', async () => {
      const bridgeWithoutAnalyzer = new EmotionBridge(null, mockResonanceEngine);
      mockResonanceEngine.calculateResonance.mockResolvedValue({
        level: 0.5,
        dominantEmotion: 'trust',
        factors: [],
      });
      mockResonanceEngine.getResonanceHistory.mockReturnValue([]);

      const result = await bridgeWithoutAnalyzer.getNPCEmotionState('npc1', 'player1');

      expect(result.success).toBe(true);
      expect(result.state.resonanceLevel).toBe(0.5);
    });

    it('should calculate average intensity from resonance history', async () => {
      mockResonanceEngine.calculateResonance.mockResolvedValue({
        level: 0.6,
        dominantEmotion: 'trust',
        factors: [],
      });
      mockEmotionAnalyzer.analyzeTrend.mockResolvedValue({
        trend: 'neutral',
        positive: 0,
        negative: 0,
        dominant: null,
      });
      mockResonanceEngine.getResonanceHistory.mockReturnValue([
        { emotionType: 'joy', intensity: 0.8 },
        { emotionType: 'trust', intensity: 0.4 },
      ]);
      mockEmotionAnalyzer.aggregateEmotionKeywords.mockResolvedValue({
        topEmotions: [],
        topKeywords: [],
      });

      const result = await bridge.getNPCEmotionState('npc1', 'player1');

      expect(result.state.avgIntensity).toBe(0.6);
    });

    it('should determine warm temperature for high resonance', async () => {
      mockResonanceEngine.calculateResonance.mockResolvedValue({
        level: 0.85,
        dominantEmotion: 'love',
        factors: [],
      });
      mockEmotionAnalyzer.analyzeTrend.mockResolvedValue({
        trend: 'positive',
        positive: 5,
        negative: 1,
        dominant: 'love',
      });
      mockResonanceEngine.getResonanceHistory.mockReturnValue([]);
      mockEmotionAnalyzer.aggregateEmotionKeywords.mockResolvedValue({
        topEmotions: [],
        topKeywords: [],
      });

      const result = await bridge.getNPCEmotionState('npc1', 'player1');

      expect(result.state.temperature).toBe('warm');
    });

    it('should determine cold temperature for low resonance', async () => {
      mockResonanceEngine.calculateResonance.mockResolvedValue({
        level: 0.2,
        dominantEmotion: 'fear',
        factors: [],
      });
      mockEmotionAnalyzer.analyzeTrend.mockResolvedValue({
        trend: 'negative',
        positive: 1,
        negative: 8,
        dominant: 'fear',
      });
      mockResonanceEngine.getResonanceHistory.mockReturnValue([]);
      mockEmotionAnalyzer.aggregateEmotionKeywords.mockResolvedValue({
        topEmotions: [],
        topKeywords: [],
      });

      const result = await bridge.getNPCEmotionState('npc1', 'player1');

      expect(result.state.temperature).toBe('cold');
    });

    it('should include top emotions and keywords in state', async () => {
      mockResonanceEngine.calculateResonance.mockResolvedValue({
        level: 0.5,
        dominantEmotion: 'trust',
        factors: [],
      });
      mockEmotionAnalyzer.analyzeTrend.mockResolvedValue({
        trend: 'neutral',
        positive: 0,
        negative: 0,
        dominant: null,
      });
      mockResonanceEngine.getResonanceHistory.mockReturnValue([]);
      mockEmotionAnalyzer.aggregateEmotionKeywords.mockResolvedValue({
        topEmotions: ['joy', 'anticipation'],
        topKeywords: ['期待', '希望'],
      });

      const result = await bridge.getNPCEmotionState('npc1', 'player1');

      expect(result.state.topEmotions).toEqual(['joy', 'anticipation']);
      expect(result.state.topKeywords).toEqual(['期待', '希望']);
    });

    it('should handle resonance calculation errors', async () => {
      mockResonanceEngine.calculateResonance.mockRejectedValue(new Error('Calculation error'));

      const result = await bridge.getNPCEmotionState('npc1', 'player1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Calculation error');
    });

    it('should default playerId to "player"', async () => {
      mockResonanceEngine.calculateResonance.mockResolvedValue({
        level: 0.5,
        dominantEmotion: 'trust',
        factors: [],
      });
      mockEmotionAnalyzer.analyzeTrend.mockResolvedValue({
        trend: 'neutral',
        positive: 0,
        negative: 0,
        dominant: null,
      });
      mockResonanceEngine.getResonanceHistory.mockReturnValue([]);
      mockEmotionAnalyzer.aggregateEmotionKeywords.mockResolvedValue({
        topEmotions: [],
        topKeywords: [],
      });

      const result = await bridge.getNPCEmotionState('npc1');

      expect(result.state.playerId).toBe('player');
    });

    it('should include recent resonance count in state', async () => {
      mockResonanceEngine.calculateResonance.mockResolvedValue({
        level: 0.6,
        dominantEmotion: 'trust',
        factors: [],
      });
      mockEmotionAnalyzer.analyzeTrend.mockResolvedValue({
        trend: 'neutral',
        positive: 0,
        negative: 0,
        dominant: null,
      });
      mockResonanceEngine.getResonanceHistory.mockReturnValue([
        { intensity: 0.5 },
        { intensity: 0.6 },
        { intensity: 0.7 },
      ]);
      mockEmotionAnalyzer.aggregateEmotionKeywords.mockResolvedValue({
        topEmotions: [],
        topKeywords: [],
      });

      const result = await bridge.getNPCEmotionState('npc1', 'player1');

      expect(result.state.recentResonance).toBe(3);
    });
  });
});