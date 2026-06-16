/**
 * DreamEmotionAnalyzer - 梦境情感分析引擎
 * V268 Iteration 6/9 - Dream Memory 情感分析引擎
 *
 * 核心职责:
 *   - 情感标签提取与分析
 *   - 情感趋势跟踪
 *   - 情感对亲密度影响
 *   - 情感关键词聚合
 *
 * 设计来源: thunderbolt feedback loops + chatdev 角色情感
 */

const DEFAULT_PLAYER_ID = 'player';

// 情感类型常量
export const EMOTION_TYPES = {
  JOY: 'joy',
  SADNESS: 'sadness',
  ANGER: 'anger',
  FEAR: 'fear',
  SURPRISE: 'surprise',
  DISGUST: 'disgust',
  TRUST: 'trust',
  ANTICIPATION: 'anticipation',
  LOVE: 'love',
  REGRET: 'regret',
};

// 情感正面/负面分类
const POSITIVE_EMOTIONS = new Set([
  EMOTION_TYPES.JOY, EMOTION_TYPES.TRUST, EMOTION_TYPES.LOVE,
  EMOTION_TYPES.ANTICIPATION, EMOTION_TYPES.SURPRISE,
]);

const NEGATIVE_EMOTIONS = new Set([
  EMOTION_TYPES.SADNESS, EMOTION_TYPES.ANGER, EMOTION_TYPES.FEAR,
  EMOTION_TYPES.DISGUST, EMOTION_TYPES.REGRET,
]);

// 情感权重（影响亲密度）
const EMOTION_WEIGHTS = {
  [EMOTION_TYPES.JOY]: 1.2,
  [EMOTION_TYPES.LOVE]: 1.5,
  [EMOTION_TYPES.TRUST]: 1.3,
  [EMOTION_TYPES.SADNESS]: 0.8,
  [EMOTION_TYPES.ANGER]: 0.5,
  [EMOTION_TYPES.REGRET]: 0.7,
  [EMOTION_TYPES.FEAR]: 0.6,
  [EMOTION_TYPES.DISGUST]: 0.4,
  [EMOTION_TYPES.ANTICIPATION]: 1.0,
  [EMOTION_TYPES.SURPRISE]: 1.0,
};

// 情感到颜色的映射
const EMOTION_COLORS = {
  [EMOTION_TYPES.JOY]: '#FFD700',
  [EMOTION_TYPES.LOVE]: '#FF69B4',
  [EMOTION_TYPES.TRUST]: '#4CAF50',
  [EMOTION_TYPES.ANTICIPATION]: '#2196F3',
  [EMOTION_TYPES.SURPRISE]: '#9C27B0',
  [EMOTION_TYPES.SADNESS]: '#607D8B',
  [EMOTION_TYPES.ANGER]: '#F44336',
  [EMOTION_TYPES.FEAR]: '#795548',
  [EMOTION_TYPES.DISGUST]: '#8BC34A',
  [EMOTION_TYPES.REGRET]: '#9E9E9E',
};

/**
 * 创建情感分析器
 * @param {object} dreamStore - DreamMemoryStore 实例
 * @returns {DreamEmotionAnalyzer}
 */
export function createDreamEmotionAnalyzer(dreamStore) {
  return new DreamEmotionAnalyzer(dreamStore);
}

class DreamEmotionAnalyzer {
  constructor(dreamStore) {
    this._store = dreamStore;
  }

  // ===== 情感提取 =====

  /**
   * 从文本提取情感标签
   * @param {string} text - 文本内容
   * @returns {{emotions: string[], scores: object}}
   */
  extractEmotions(text) {
    if (!text || typeof text !== 'string') {
      return { emotions: [], scores: {} };
    }

    const textLower = text.toLowerCase();
    const emotions = [];
    const scores = {};

    // 关键词匹配
    const emotionKeywords = {
      [EMOTION_TYPES.JOY]: ['happy', 'joy', 'glad', 'pleased', 'delighted', '开心', '快乐', '高兴', '愉快', '欢笑'],
      [EMOTION_TYPES.SADNESS]: ['sad', 'unhappy', 'sorrow', 'grief', 'crying', '悲伤', '难过', '伤心', '哭泣', '痛苦'],
      [EMOTION_TYPES.ANGER]: ['angry', 'mad', 'furious', 'rage', '生气', '愤怒', '恼火', '气愤'],
      [EMOTION_TYPES.FEAR]: ['afraid', 'scared', 'fear', 'worried', '害怕', '恐惧', '担心', '畏惧'],
      [EMOTION_TYPES.LOVE]: ['love', 'adore', 'miss', 'care', '爱', '喜欢', '爱慕', '思念', '关心'],
      [EMOTION_TYPES.TRUST]: ['trust', 'believe', '依赖', '信任', '相信', '依靠'],
      [EMOTION_TYPES.ANTICIPATION]: ['hope', 'expect', 'look forward', '希望', '期待', '盼望', '期待'],
      [EMOTION_TYPES.SURPRISE]: ['surprised', 'amazed', 'shock', '惊讶', '震惊', '意外', '惊喜'],
      [EMOTION_TYPES.DISGUST]: ['disgusting', 'gross', '讨厌', '恶心', '厌恶', '反感'],
      [EMOTION_TYPES.REGRET]: ['regret', 'sorry', '后悔', '遗憾', '惋惜', '抱歉'],
    };

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (textLower.includes(keyword)) {
          score++;
        }
      }
      if (score > 0) {
        emotions.push(emotion);
        scores[emotion] = score;
      }
    }

    // 去重并排序
    return {
      emotions: [...new Set(emotions)],
      scores,
    };
  }

  /**
   * 获取主要情感
   * @param {string} text - 文本内容
   * @returns {string|null}
   */
  getPrimaryEmotion(text) {
    const { emotions, scores } = this.extractEmotions(text);
    if (emotions.length === 0) return null;

    let primary = emotions[0];
    let maxScore = scores[primary] || 0;

    for (const emotion of emotions) {
      if (scores[emotion] > maxScore) {
        maxScore = scores[emotion];
        primary = emotion;
      }
    }

    return primary;
  }

  // ===== 情感分析 =====

  /**
   * 分析情感趋势
   * @param {string} npcId
   * @param {string} playerId
   * @returns {Promise<{trend: string, positive: number, negative: number, dominant: string|null}>}
   */
  async analyzeTrend(npcId, playerId = DEFAULT_PLAYER_ID) {
    try {
      const dreams = await this._store.queryRecent(npcId, playerId, 20);

      let positive = 0;
      let negative = 0;
      const emotionCounts = {};

      for (const dream of dreams) {
        const emotion = dream.emotion;
        if (!emotion) continue;

        if (POSITIVE_EMOTIONS.has(emotion)) {
          positive++;
        } else if (NEGATIVE_EMOTIONS.has(emotion)) {
          negative++;
        }

        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      }

      let trend = 'neutral';
      if (positive > negative * 1.5) trend = 'positive';
      else if (negative > positive * 1.5) trend = 'negative';

      let dominant = null;
      let maxCount = 0;
      for (const [emotion, count] of Object.entries(emotionCounts)) {
        if (count > maxCount) {
          maxCount = count;
          dominant = emotion;
        }
      }

      return { trend, positive, negative, dominant };
    } catch (err) {
      return { trend: 'neutral', positive: 0, negative: 0, dominant: null, error: err.message };
    }
  }

  /**
   * 计算情感亲密度影响
   * @param {string} npcId
   * @param {string} playerId
   * @returns {Promise<{familiarityBonus: number, emotionCount: number}>}
   */
  async calculateFamiliarityBonus(npcId, playerId = DEFAULT_PLAYER_ID) {
    try {
      const dreams = await this._store.queryRecent(npcId, playerId, 20);

      let bonus = 0;
      for (const dream of dreams) {
        const emotion = dream.emotion;
        if (!emotion) continue;

        const weight = EMOTION_WEIGHTS[emotion] || 1.0;
        bonus += weight;
      }

      // 归一化到 [-1, 1] 范围
      const avgBonus = dreams.length > 0 ? bonus / dreams.length : 0;
      const familiarityBonus = Math.max(-1, Math.min(1, (avgBonus - 1) / 2));

      return {
        familiarityBonus,
        emotionCount: dreams.filter(d => d.emotion).length,
      };
    } catch (err) {
      return { familiarityBonus: 0, emotionCount: 0, error: err.message };
    }
  }

  /**
   * 聚合情感关键词
   * @param {string} npcId
   * @param {string} playerId
   * @returns {Promise<object>}
   */
  async aggregateEmotionKeywords(npcId, playerId = DEFAULT_PLAYER_ID) {
    try {
      const dreams = await this._store.queryRecent(npcId, playerId, 50);

      const keywordCounts = {};
      const emotionCounts = {};

      for (const dream of dreams) {
        // 统计情感
        const emotion = dream.emotion;
        if (emotion) {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        }

        // 统计关键词
        const keywords = dream.keywords || [];
        for (const keyword of keywords) {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        }
      }

      // 排序
      const topEmotions = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([emotion]) => emotion);

      const topKeywords = Object.entries(keywordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([keyword]) => keyword);

      return { topEmotions, topKeywords };
    } catch (err) {
      return { topEmotions: [], topKeywords: [], error: err.message };
    }
  }

  // ===== 工具方法 =====

  /**
   * 判断是否为正面情感
   * @param {string} emotion
   * @returns {boolean}
   */
  isPositive(emotion) {
    return POSITIVE_EMOTIONS.has(emotion);
  }

  /**
   * 判断是否为负面情感
   * @param {string} emotion
   * @returns {boolean}
   */
  isNegative(emotion) {
    return NEGATIVE_EMOTIONS.has(emotion);
  }

  /**
   * 获取情感权重
   * @param {string} emotion
   * @returns {number}
   */
  getEmotionWeight(emotion) {
    return EMOTION_WEIGHTS[emotion] || 1.0;
  }

  /**
   * 获取情感颜色
   * @param {string} emotion
   * @returns {string}
   */
  getEmotionColor(emotion) {
    return EMOTION_COLORS[emotion] || '#888888';
  }

  /**
   * 获取所有情感类型
   * @returns {string[]}
   */
  getAllEmotionTypes() {
    return Object.values(EMOTION_TYPES);
  }
}

export default DreamEmotionAnalyzer;
