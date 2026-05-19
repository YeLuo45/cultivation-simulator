// domains/cultivation/entities/Player.js
// Player entity - extracted from game.js
// Phase 3 DDD refactoring

/**
 * Player entity representing cultivator state
 */
export class Player {
  /**
   * @param {Object} gameState - Game state object
   */
  constructor(gameState) {
    this.gameState = gameState;
  }

  /**
   * Get current realm index
   * @returns {number} Realm index
   */
  getRealm() {
    return this.gameState.realm || 0;
  }

  /**
   * Get current stage index
   * @returns {number} Stage index
   */
  getStage() {
    return this.gameState.stage || 0;
  }

  /**
   * Get current qi
   * @returns {number} Current qi
   */
  getQi() {
    return this.gameState.qi || 0;
  }

  /**
   * Get maximum qi
   * @returns {number} Max qi
   */
  getMaxQi() {
    return this.gameState.maxQi || 100;
  }

  /**
   * Get cultivation progress
   * @returns {number} Cultivation progress
   */
  getCultivationProgress() {
    return this.gameState.cultivationProgress || 0;
  }

  /**
   * Get mindset value
   * @returns {number} Mindset (0-100)
   */
  getMindset() {
    return this.gameState.mindset || 50;
  }

  /**
   * Get spirit stones count
   * @returns {number} Spirit stones
   */
  getSpiritStones() {
    return this.gameState.spiritStones || 0;
  }

  /**
   * Get days count
   * @returns {number} Days
   */
  getDays() {
    return this.gameState.days || 1;
  }

  /**
   * Get spirit root
   * @returns {Object} Spirit root object
   */
  getSpiritRoot() {
    return this.gameState.spiritRoot || null;
  }

  /**
   * Get active effects
   * @returns {Object} Active effects
   */
  getActiveEffects() {
    return this.gameState.activeEffects || {};
  }

  /**
   * Get constitutions array
   * @returns {Array} Constitutions
   */
  getConstitutions() {
    return this.gameState.constitutions || [];
  }

  /**
   * Check if has transmigration buff
   * @returns {boolean}
   */
  hasTransmigrationBuff() {
    return this.gameState.hasTransmigrationBuff || false;
  }

  /**
   * Get equipped treasures
   * @returns {Array} Equipped treasures
   */
  getEquippedTreasures() {
    return this.gameState.equippedTreasures || [];
  }
}

export default Player;
