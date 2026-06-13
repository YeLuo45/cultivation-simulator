/**
 * EmotionBridge.js - 情感桥接器
 * V287 Iteration 2/9 - Emotion Bridge
 * 
 * 核心职责:
 *   - 同步梦境情感到共鸣引擎
 *   - 获取融合的 NPC 情感状态
 * 
 * 设计来源: DreamEmotionAnalyzer + EmotionResonanceEngine 桥接
 */

import { EMOTION_TYPES } from './DreamEmotionAnalyzer.js';

/**
 * EmotionBridge - 情感桥接器
 * 桥接 DreamEmotionAnalyzer 和 EmotionResonanceEngine
 */
export class EmotionBridge {
  /**
   * @param {DreamEmotionAnalyzer} emotionAnalyzer - 情感分析器
   * @param {EmotionResonanceEngine} resonanceEngine - 共鸣引擎
   */
  constructor(emotionAnalyzer, resonanceEngine) {
    this.emotionAnalyzer = emotionAnalyzer;
    this.resonanceEngine = resonanceEngine;
    this._syncCache = new Map(); // npcId -> last sync timestamp
  }

  /**
   * 同步梦境情感到共鸣引擎
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @returns {Promise<Object>} 同步结果
   */
  async syncDreamEmotionToResonance(npcId, playerId = 'player') {
    try {
      if (!this.emotionAnalyzer) {
        return { success: false, reason: 'No emotion analyzer available' };
      }

      // 获取梦境情感趋势
      const trend = await this.emotionAnalyzer.analyzeTrend(npcId, playerId);

      // 获取熟悉度加成
      const familiarity = await this.emotionAnalyzer.calculateFamiliarityBonus(npcId, playerId);

      // 获取关键词聚合
      const keywords = await this.emotionAnalyzer.aggregateEmotionKeywords(npcId, playerId);

      // 将梦境情感转换为共鸣事件
      if (trend.dominant) {
        // 根据情感趋势计算强度
        const intensity = this._trendToIntensity(trend.trend, familiarity.familiarityBonus);
        this.resonanceEngine.recordResonance(npcId, playerId, trend.dominant, intensity);
      }

      // 更新同步缓存
      this._syncCache.set(npcId, {
        lastSync: Date.now(),
        trend,
        familiarity,
        keywords,
      });

      return {
        success: true,
        npcId,
        playerId,
        trend,
        familiarity,
        keywords,
        syncedEmotions: trend.dominant ? [trend.dominant] : [],
      };
    } catch (error) {
      return {
        success: false,
        npcId,
        error: error.message,
      };
    }
  }

  /**
   * 获取融合的 NPC 情感状态
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @returns {Promise<Object>} 融合后的情感状态
   */
  async getNPCEmotionState(npcId, playerId = 'player') {
    try {
      // 计算共鸣强度
      const resonance = await this.resonanceEngine.calculateResonance(npcId, playerId);

      // 获取梦境情感趋势
      const dreamTrend = this.emotionAnalyzer
        ? await this.emotionAnalyzer.analyzeTrend(npcId, playerId)
        : { trend: 'neutral', positive: 0, negative: 0, dominant: null };

      // 获取共鸣历史
      const resonanceHistory = this.resonanceEngine.getResonanceHistory(npcId, 10);

      // 获取熟悉的关键词
      const keywords = this.emotionAnalyzer
        ? await this.emotionAnalyzer.aggregateEmotionKeywords(npcId, playerId)
        : { topEmotions: [], topKeywords: [] };

      // 融合状态
      const emotionState = {
        npcId,
        playerId,
        resonanceLevel: resonance.level,
        dominantEmotion: resonance.dominantEmotion || dreamTrend.dominant,
        dreamTrend: dreamTrend.trend,
        dreamPositive: dreamTrend.positive,
        dreamNegative: dreamTrend.negative,
        recentResonance: resonanceHistory.length,
        avgIntensity: this._calculateAvgIntensity(resonanceHistory),
        resonanceGrowth: this._calculateGrowth(resonanceHistory),
        topEmotions: keywords.topEmotions,
        topKeywords: keywords.topKeywords,
        lastSync: this._syncCache.get(npcId)?.lastSync || null,
        // 情绪温度 (综合判断)
        temperature: this._determineTemperature(resonance.level, dreamTrend.trend),
      };

      return {
        success: true,
        state: emotionState,
      };
    } catch (error) {
      return {
        success: false,
        npcId,
        error: error.message,
      };
    }
  }

  // ===== 私有方法 =====

  /**
   * 将趋势转换为强度
   * @private
   */
  _trendToIntensity(trend, familiarityBonus) {
    let baseIntensity = 0.5;

    if (trend === 'positive') {
      baseIntensity = 0.7;
    } else if (trend === 'negative') {
      baseIntensity = 0.3;
    }

    // 结合熟悉度加成
    const adjustedIntensity = baseIntensity + (familiarityBonus * 0.2);
    return Math.max(0, Math.min(1, adjustedIntensity));
  }

  /**
   * 计算平均强度
   * @private
   */
  _calculateAvgIntensity(events) {
    if (events.length === 0) return 0;
    const sum = events.reduce((acc, e) => acc + e.intensity, 0);
    return Math.round((sum / events.length) * 100) / 100;
  }

  /**
   * 计算增长趋势
   * @private
   */
  _calculateGrowth(events) {
    if (events.length < 2) return 0;

    const half = Math.floor(events.length / 2);
    const recent = events.slice(half);
    const older = events.slice(0, half);

    const recentAvg = recent.reduce((sum, e) => sum + e.intensity, 0) / recent.length;
    const olderAvg = older.reduce((sum, e) => sum + e.intensity, 0) / older.length;

    return Math.round((recentAvg - olderAvg) * 100) / 100;
  }

  /**
   * 判断情绪温度
   * @private
   */
  _determineTemperature(resonanceLevel, dreamTrend) {
    if (resonanceLevel >= 0.75 || dreamTrend === 'positive') {
      return 'warm';
    } else if (resonanceLevel >= 0.5 || dreamTrend === 'neutral') {
      return 'neutral';
    }
    return 'cold';
  }
}

export default EmotionBridge;