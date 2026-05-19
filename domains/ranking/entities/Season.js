// domains/ranking/entities/Season.js
// Season entity - Phase 4 DDD refactoring

/**
 * Season entity - represents a ranking season
 */
export class Season {
  constructor(data = {}) {
    this.id = data.id || 1;
    this.name = data.name || '第一赛季';
    this.startDay = data.startDay || 1;
    this.endDay = data.endDay || 30;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.rewards = data.rewards || {};
  }

  /**
   * Check if season has ended
   */
  hasEnded(currentDay) {
    return currentDay > this.endDay;
  }

  /**
   * Get remaining days
   */
  getRemainingDays(currentDay) {
    return Math.max(0, this.endDay - currentDay);
  }
}

export default Season;
