/**
 * EmotionResonanceEngine.js - NPC情感共鸣引擎
 * V287 Iteration 2/9 - NPC Emotional Resonance Engine
 * 
 * 核心职责:
 *   - 基于交互历史和梦境情感计算共鸣强度
 *   - 根据共鸣强度调整 NPC 响应
 *   - 记录情感共鸣事件
 *   - 触发情感共鸣学习
 * 
 * 设计来源: DreamEmotionAnalyzer + ExperienceTracker 融合
 */

import { EMOTION_TYPES } from './DreamEmotionAnalyzer.js';

// 共鸣等级常量
export const RESONANCE_LEVELS = {
  NONE: 0,
  WEAK: 0.25,
  MODERATE: 0.5,
  STRONG: 0.75,
  DEEP: 1.0,
};

// 响应温度调整系数
const RESPONSE_TEMPERATURE = {
  WARM: 1.2,
  NEUTRAL: 1.0,
  COLD: 0.8,
};

// 情感共鸣因子权重
const RESONANCE_FACTORS = {
  interactionHistory: 0.4,
  dreamEmotion: 0.35,
  familiarity: 0.25,
};

/**
 * EmotionResonanceEngine - 情感共鸣引擎
 * 计算 NPC 对玩家的情感共鸣强度，并据此调整 NPC 响应
 */
export class EmotionResonanceEngine {
  /**
   * @param {ExperienceTracker} experienceTracker - 经验追踪器
   * @param {DreamEmotionAnalyzer} dreamEmotionAnalyzer - 梦境情感分析器
   */
  constructor(experienceTracker, dreamEmotionAnalyzer) {
    this.experienceTracker = experienceTracker;
    this.dreamEmotionAnalyzer = dreamEmotionAnalyzer;
    this.resonanceHistory = new Map(); // npcId -> resonance events
  }

  /**
   * 计算 NPC 对玩家的情感共鸣强度
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @returns {Promise<{level: number, dominantEmotion: string, factors: Array}>} 共鸣强度信息
   */
  async calculateResonance(npcId, playerId) {
    try {
      const factors = [];
      let totalScore = 0;

      // 1. 基于交互历史计算共鸣因子
      const interactionFactor = await this._calculateInteractionResonance(npcId, playerId);
      factors.push({
        name: 'interactionHistory',
        score: interactionFactor,
        weight: RESONANCE_FACTORS.interactionHistory,
      });
      totalScore += interactionFactor * RESONANCE_FACTORS.interactionHistory;

      // 2. 基于梦境情感计算共鸣因子
      const dreamFactor = await this._calculateDreamEmotionResonance(npcId, playerId);
      factors.push({
        name: 'dreamEmotion',
        score: dreamFactor.score,
        weight: RESONANCE_FACTORS.dreamEmotion,
        dominantEmotion: dreamFactor.dominantEmotion,
      });
      totalScore += dreamFactor.score * RESONANCE_FACTORS.dreamEmotion;

      // 3. 基于熟悉度计算共鸣因子
      const familiarityFactor = this._calculateFamiliarityResonance(npcId, playerId);
      factors.push({
        name: 'familiarity',
        score: familiarityFactor,
        weight: RESONANCE_FACTORS.familiarity,
      });
      totalScore += familiarityFactor * RESONANCE_FACTORS.familiarity;

      // 归一化到 [0, 1]
      const level = Math.max(0, Math.min(1, totalScore));

      // 确定主导情感
      const dominantEmotion = dreamFactor.dominantEmotion || this._getDefaultDominantEmotion(level);

      return {
        level: Math.round(level * 100) / 100,
        dominantEmotion,
        factors,
      };
    } catch (error) {
      return {
        level: 0,
        dominantEmotion: EMOTION_TYPES.JOY,
        factors: [],
        error: error.message,
      };
    }
  }

  /**
   * 根据共鸣强度调整 NPC 响应
   * @param {string} npcId - NPC ID
   * @param {string} baseResponse - 基础响应
   * @param {number} resonanceLevel - 共鸣等级 (0-1)
   * @returns {Object} 调整后的响应
   */
  adjustResponse(npcId, baseResponse, resonanceLevel) {
    const level = Math.max(0, Math.min(1, resonanceLevel));

    // 确定温度系数
    let temperature;
    if (level >= RESONANCE_LEVELS.STRONG) {
      temperature = RESPONSE_TEMPERATURE.WARM;
    } else if (level >= RESONANCE_LEVELS.MODERATE) {
      temperature = RESPONSE_TEMPERATURE.NEUTRAL;
    } else {
      temperature = RESPONSE_TEMPERATURE.COLD;
    }

    // 调整词汇
    const adjustedContent = this._adjustTone(baseResponse.content || '', level, temperature);
    const adjustedTone = this._adjustToneDetail(baseResponse.tone || 'neutral', level);

    return {
      ...baseResponse,
      content: adjustedContent,
      tone: adjustedTone,
      resonanceLevel: level,
      temperature,
      resonanceAdjusted: true,
    };
  }

  /**
   * 记录情感共鸣事件
   * @param {string} npcId - NPC ID
   * @param {string} playerId - 玩家 ID
   * @param {string} emotionType - 情感类型
   * @param {number} intensity - 情感强度 (0-1)
   * @returns {Object} 记录结果
   */
  recordResonance(npcId, playerId, emotionType, intensity) {
    if (!this.resonanceHistory.has(npcId)) {
      this.resonanceHistory.set(npcId, []);
    }

    const event = {
      id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      npcId,
      playerId,
      emotionType,
      intensity: Math.max(0, Math.min(1, intensity)),
      resonanceLevel: this._intensityToResonanceLevel(intensity),
      timestamp: Date.now(),
    };

    const events = this.resonanceHistory.get(npcId);
    events.push(event);

    // 保持最多100条记录
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }

    return { success: true, event };
  }

  /**
   * 获取共鸣历史
   * @param {string} npcId - NPC ID
   * @param {number} limit - 返回记录数限制
   * @returns {Array} 共鸣历史事件
   */
  getResonanceHistory(npcId, limit = 20) {
    const events = this.resonanceHistory.get(npcId) || [];
    return events.slice(-limit);
  }

  /**
   * 触发情感共鸣学习
   * @param {string} npcId - NPC ID
   * @returns {Promise<Object>} 学习结果
   */
  async triggerResonanceLearning(npcId) {
    try {
      // 获取最近的共鸣事件
      const recentEvents = this.getResonanceHistory(npcId, 10);

      // 分析共鸣模式
      const patterns = this._analyzeResonancePatterns(recentEvents);

      // 计算学习指标
      const learningMetrics = {
        resonanceCount: recentEvents.length,
        dominantEmotion: patterns.dominantEmotion,
        emotionalDiversity: patterns.diversity,
        avgIntensity: patterns.avgIntensity,
        resonanceGrowth: this._calculateResonanceGrowth(npcId),
        adaptationNeeded: patterns.avgIntensity > 0.6,
      };

      return {
        success: true,
        npcId,
        metrics: learningMetrics,
        patterns,
        timestamp: Date.now(),
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
   * 计算交互共鸣因子
   * @private
   */
  async _calculateInteractionResonance(npcId, playerId) {
    try {
      const stats = this.experienceTracker.getStats(npcId);
      if (stats.totalInteractions === 0) return 0;

      // 基于成功率和满意度计算
      const successFactor = stats.successRate;
      const satisfactionFactor = stats.avgSatisfaction;
      const interactionFactor = Math.min(stats.totalInteractions / 50, 1);

      return (successFactor * 0.5 + satisfactionFactor * 0.3 + interactionFactor * 0.2);
    } catch {
      return 0;
    }
  }

  /**
   * 计算梦境情感共鸣因子
   * @private
   */
  async _calculateDreamEmotionResonance(npcId, playerId) {
    try {
      if (!this.dreamEmotionAnalyzer) {
        return { score: 0, dominantEmotion: null };
      }

      const trend = await this.dreamEmotionAnalyzer.analyzeTrend(npcId, playerId);
      const familiarity = await this.dreamEmotionAnalyzer.calculateFamiliarityBonus(npcId, playerId);

      // 计算共鸣分数
      let score = 0;
      if (trend.trend === 'positive') {
        score += 0.4;
      } else if (trend.trend === 'negative') {
        score -= 0.2;
      }

      // 熟悉度加成
      score += (familiarity.familiarityBonus + 1) * 0.3;

      // 情感数量加成
      score += Math.min(familiarity.emotionCount / 20, 1) * 0.3;

      return {
        score: Math.max(0, Math.min(1, score)),
        dominantEmotion: trend.dominant,
      };
    } catch {
      return { score: 0, dominantEmotion: null };
    }
  }

  /**
   * 计算熟悉度共鸣因子
   * @private
   */
  _calculateFamiliarityResonance(npcId, playerId) {
    try {
      const stats = this.experienceTracker.getStats(npcId);
      const interactionCount = stats.totalInteractions;

      // 随交互次数增加而增加，但有上限
      const baseFamiliarity = Math.min(interactionCount / 100, 1);
      const satisfactionBonus = stats.avgSatisfaction * 0.3;

      return Math.max(0, Math.min(1, baseFamiliarity + satisfactionBonus));
    } catch {
      return 0;
    }
  }

  /**
   * 获取默认主导情感
   * @private
   */
  _getDefaultDominantEmotion(level) {
    if (level >= RESONANCE_LEVELS.STRONG) {
      return EMOTION_TYPES.LOVE;
    } else if (level >= RESONANCE_LEVELS.MODERATE) {
      return EMOTION_TYPES.JOY;
    }
    return EMOTION_TYPES.TRUST;
  }

  /**
   * 调整语气
   * @private
   */
  _adjustTone(content, level, temperature) {
    if (!content) return content;

    // 高共鸣时添加更温暖的词汇
    if (level >= RESONANCE_LEVELS.STRONG) {
      const warmPrefixes = ['我很高兴', '真开心', '太好了', '亲爱的'];
      const warmSuffixes = ['呢', '呀', '哦', '～'];
      const prefix = warmPrefixes[Math.floor(Math.random() * warmPrefixes.length)];
      const suffix = warmSuffixes[Math.floor(Math.random() * warmSuffixes.length)];
      return `${prefix}，${content}${suffix}`;
    }
    // 低共鸣时添加更冷淡的词汇
    else if (level < RESONANCE_LEVELS.MODERATE) {
      const coldPrefixes = ['嗯', '是吗', '好吧', '随便'];
      const prefix = coldPrefixes[Math.floor(Math.random() * coldPrefixes.length)];
      return `${prefix}，${content}`;
    }

    return content;
  }

  /**
   * 调整语气细节
   * @private
   */
  _adjustToneDetail(tone, level) {
    if (level >= RESONANCE_LEVELS.STRONG) {
      return tone === 'neutral' ? 'warm' : tone;
    } else if (level < RESONANCE_LEVELS.MODERATE) {
      return tone === 'neutral' ? 'cold' : tone;
    }
    return tone;
  }

  /**
   * 将强度转换为共鸣等级
   * @private
   */
  _intensityToResonanceLevel(intensity) {
    if (intensity >= 0.8) return RESONANCE_LEVELS.DEEP;
    if (intensity >= 0.6) return RESONANCE_LEVELS.STRONG;
    if (intensity >= 0.4) return RESONANCE_LEVELS.MODERATE;
    if (intensity >= 0.2) return RESONANCE_LEVELS.WEAK;
    return RESONANCE_LEVELS.NONE;
  }

  /**
   * 分析共鸣模式
   * @private
   */
  _analyzeResonancePatterns(events) {
    if (events.length === 0) {
      return { dominantEmotion: null, diversity: 0, avgIntensity: 0 };
    }

    const emotionCounts = {};
    let totalIntensity = 0;

    for (const event of events) {
      emotionCounts[event.emotionType] = (emotionCounts[event.emotionType] || 0) + 1;
      totalIntensity += event.intensity;
    }

    // 主导情感
    let dominantEmotion = null;
    let maxCount = 0;
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion;
      }
    }

    // 多样性 (不同情感类型数量)
    const diversity = Object.keys(emotionCounts).length;

    // 平均强度
    const avgIntensity = totalIntensity / events.length;

    return { dominantEmotion, diversity, avgIntensity };
  }

  /**
   * 计算共鸣增长率
   * @private
   */
  _calculateResonanceGrowth(npcId) {
    const events = this.resonanceHistory.get(npcId) || [];
    if (events.length < 2) return 0;

    // 比较前半和后半的平均强度
    const half = Math.floor(events.length / 2);
    const recentEvents = events.slice(half);
    const olderEvents = events.slice(0, half);

    const recentAvg = recentEvents.reduce((sum, e) => sum + e.intensity, 0) / recentEvents.length;
    const olderAvg = olderEvents.reduce((sum, e) => sum + e.intensity, 0) / olderEvents.length;

    return recentAvg - olderAvg;
  }
}

export default EmotionResonanceEngine;