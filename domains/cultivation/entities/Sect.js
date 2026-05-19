// domains/cultivation/entities/Sect.js
// Sect entity - extracted from game.js
// Phase 3 DDD refactoring

import { SECT_CONFIG } from '../../shared/constants/cultivation.js';

/**
 * Sect entity representing sect state
 */
export class Sect {
  /**
   * @param {Object} sect - Sect object from gameState
   */
  constructor(sect) {
    this.sect = sect || {};
  }

  /**
   * Check if player is in a sect
   * @returns {boolean}
   */
  hasSect() {
    return this.sect.name && this.sect.name.length > 0;
  }

  /**
   * Get sect name
   * @returns {string} Sect name
   */
  getName() {
    return this.sect.name || '';
  }

  /**
   * Get sect level
   * @returns {number} Sect level (1-3)
   */
  getLevel() {
    return this.sect.level || 1;
  }

  /**
   * Get sect disciples
   * @returns {Array} Disciples array
   */
  getDisciples() {
    return this.sect.disciples || [];
  }

  /**
   * Get sect resources
   * @returns {Object} Resources {spiritStones, reputation}
   */
  getResources() {
    return {
      spiritStones: this.sect.spiritStones || 0,
      reputation: this.sect.reputation || 0
    };
  }

  /**
   * Get sect contribution shop
   * @returns {Array} Contribution shop items
   */
  getContributionShop() {
    return this.sect.contributionShop || [];
  }

  /**
   * Get player disciple record
   * @param {string} playerUid - Player uid
   * @returns {Object|null} Player disciple record
   */
  getPlayerDisciple(playerUid) {
    const disciples = this.getDisciples();
    return disciples.find(d => d.uid === playerUid) || null;
  }

  /**
   * Get player contribution points
   * @param {string} playerUid - Player uid
   * @returns {number} Contribution points
   */
  getPlayerContribution(playerUid) {
    const disciple = this.getPlayerDisciple(playerUid);
    return disciple ? disciple.contribution || 0 : 0;
  }

  /**
   * Get sect config
   * @returns {Object} SECT_CONFIG
   */
  static getConfig() {
    return SECT_CONFIG;
  }
}

export default Sect;
