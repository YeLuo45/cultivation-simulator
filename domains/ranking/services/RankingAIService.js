// domains/ranking/services/RankingAIService.js
// Ranking AI Service - Phase 4 DDD refactoring

import { RANK_CONFIG, AI_OPPONENTS } from '../../shared/constants/combat.js';

/**
 * RankingAIService - handles AI opponent generation for ranking
 */
export class RankingAIService {
  /**
   * Generate AI opponents for ranking
   * @param {string} division - 'human', 'cultivation', or 'immortal'
   * @param {number} count - Number of opponents to generate
   * @param {number} playerRating - Player's current rating (optional, for rating variance)
   */
  generateOpponents(division, count = 10, playerRating = 1000) {
    const opponents = [];
    const usedNames = new Set();
    const names = AI_OPPONENTS[division];

    // Rating variance based on player rating
    const baseRating = playerRating;
    const ratingVariance = 200;

    for (let i = 0; i < count; i++) {
      let name;
      do {
        name = names[Math.floor(Math.random() * names.length)];
      } while (usedNames.has(name));
      usedNames.add(name);

      // Random rating within variance
      const variance = Math.floor(Math.random() * ratingVariance * 2) - ratingVariance;
      const opponentRating = Math.max(800, Math.min(2600, baseRating + variance));

      // Determine realm level based on division
      let realmLevel = 0;
      if (division === 'human') {
        realmLevel = Math.floor(Math.random() * 2);
      } else if (division === 'cultivation') {
        realmLevel = 2 + Math.floor(Math.random() * 2);
      } else {
        realmLevel = 4 + Math.floor(Math.random() * 2);
      }

      const realmNames = ['炼气期', '筑基期', '元婴期', '化神期', '大乘期', '渡劫期'];
      const stageNames = ['初期', '中期', '后期', '圆满'];

      const rankName = this._getRankName(opponentRating, division);

      opponents.push({
        id: 'ai_' + Date.now() + '_' + i,
        name: name,
        avatar: this._getOpponentAvatar(name),
        realm: realmLevel,
        realmName: realmNames[realmLevel] || '大乘期',
        stage: Math.floor(Math.random() * 4),
        stageName: stageNames[Math.floor(Math.random() * 4)],
        rating: opponentRating,
        wins: Math.floor(Math.random() * 100) + 50,
        losses: Math.floor(Math.random() * 50) + 20,
        rank: rankName
      });
    }

    // Sort by rating
    opponents.sort((a, b) => b.rating - a.rating);
    return opponents;
  }

  /**
   * Get rank name from rating
   */
  _getRankName(rating, division) {
    const ranks = RANK_CONFIG[division].ranks;
    let rankName = ranks[0].name;
    for (const rank of ranks) {
      if (rating >= rank.minRating) {
        rankName = rank.name;
      }
    }
    return rankName;
  }

  /**
   * Get opponent avatar based on name
   * Simple hash-based assignment for consistency
   */
  _getOpponentAvatar(name) {
    const avatarMap = {
      '青云子': '👴', '玄天': '🧙', '灵虚子': '👨‍🦳', '玉清子': '🧓',
      '天璇': '👩', '天玑': '👨', '天权': '🧔', '玉衡': '👱',
      '开阳': '👲', '摇光': '👳', '紫霞仙子': '👸', '青莲剑仙': '⚔️',
      '血魔老祖': '🧛', '九幽散人': '👤', '太虚真人': '🧙‍♂️', '虚无宗主': '👑',
      '万剑归宗': '⚔️', '九天玄女': '👩‍🦰', '太古魔尊': '😈', '天道子': '☀️',
      '轮回王': '💀', '不灭魔君': '👹', '仙盟盟主': '🦸', '天魔教教主': '👿',
      '万妖女王': '👸', '诸神黄昏': '⚡', '盘古始祖': '🧙', '鸿钧道祖': '☝️',
      '女娲娘娘': '👩', '伏羲圣皇': '👨', '神农氏': '🌿', '轩辕黄帝': '👑',
      '昊天上帝': '✨', '西王母': '👸', '东皇太一': '☀️', '帝俊': '🌟',
      '烛龙': '🐉', '应龙': '🐲'
    };
    return avatarMap[name] || '👤';
  }
}

export const rankingAIService = new RankingAIService();
export default rankingAIService;
