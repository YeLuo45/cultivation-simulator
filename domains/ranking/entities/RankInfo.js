// domains/ranking/entities/RankInfo.js
// Ranking Info entity - Phase 4 DDD refactoring

/**
 * RankInfo entity - represents player ranking information
 */
export class RankInfo {
  constructor(data = {}) {
    this.rank = data.rank || '凡人';
    this.icon = data.icon || '👤';
    this.division = data.division || null;
    this.rankIndex = data.rankIndex || 0;
    this.nextRank = data.nextRank || null;
    this.rating = data.rating || 1000;
    this.wins = data.wins || 0;
    this.losses = data.losses || 0;
    this.streak = data.streak || 0;
    this.bestStreak = data.bestStreak || 0;
  }

  /**
   * Get win rate
   */
  getWinRate() {
    const total = this.wins + this.losses;
    return total > 0 ? (this.wins / total * 100).toFixed(1) : '0.0';
  }

  /**
   * Check if ranking is at max level
   */
  isMaxRank() {
    return this.nextRank === null;
  }
}

export default RankInfo;
