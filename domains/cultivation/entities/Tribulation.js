// domains/cultivation/entities/Tribulation.js
// Tribulation entity - extracted from game.js
// Phase 3 DDD refactoring

/**
 * Tribulation entity representing tribulation state
 */
export class Tribulation {
  /**
   * @param {Object} tribulation - Tribulation object from gameState
   */
  constructor(tribulation) {
    this.tribulation = tribulation || {};
  }

  /**
   * Check if tribulation is in progress
   * @returns {boolean}
   */
  isInProgress() {
    return this.tribulation.inProgress || false;
  }

  /**
   * Get tribulation key
   * @returns {string} Tribulation key (e.g., '金丹初期雷劫')
   */
  getTribKey() {
    return this.tribulation.tribKey || '';
  }

  /**
   * Get current stage
   * @returns {number} Current stage (0-indexed)
   */
  getCurrentStage() {
    return this.tribulation.currentStage || 0;
  }

  /**
   * Get total stages
   * @returns {number} Total stages
   */
  getTotalStages() {
    return this.tribulation.totalStages || 0;
  }

  /**
   * Get preparations array
   * @returns {Array} Preparations ['阵法', '定神丹', '祈祷']
   */
  getPreparations() {
    return this.tribulation.preparations || [];
  }

  /**
   * Check if has a specific preparation
   * @param {string} prep - Preparation name
   * @returns {boolean}
   */
  hasPreparation(prep) {
    return this.getPreparations().includes(prep);
  }

  /**
   * Add a preparation
   * @param {string} prep - Preparation to add
   */
  addPreparation(prep) {
    if (!this.tribulation.preparations) {
      this.tribulation.preparations = [];
    }
    if (!this.hasPreparation(prep)) {
      this.tribulation.preparations.push(prep);
    }
  }

  /**
   * Get tribulation record array
   * @returns {Array} Tribulation record
   */
  getRecord() {
    return this.tribulation.record || [];
  }
}

export default Tribulation;
