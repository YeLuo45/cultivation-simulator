// domains/cultivation/entities/SpiritRoot.js
// SpiritRoot entity - extracted from game.js
// Phase 3 DDD refactoring

import { SPIRIT_ROOT_QUALITIES } from '../../shared/constants/cultivation.js';

/**
 * SpiritRoot entity representing spirit root quality and attributes
 */
export class SpiritRoot {
  /**
   * @param {Object} spiritRoot - Spirit root object from gameState
   */
  constructor(spiritRoot) {
    this.spiritRoot = spiritRoot || {};
  }

  /**
   * Get quality name
   * @returns {string} Quality name
   */
  getQuality() {
    return this.spiritRoot.quality || '中品灵根';
  }

  /**
   * Get quality data from constants
   * @returns {Object} Quality data
   */
  getQualityData() {
    return SPIRIT_ROOT_QUALITIES[this.getQuality()] || SPIRIT_ROOT_QUALITIES['中品灵根'];
  }

  /**
   * Get five element affinity
   * @returns {Object} Affinity object {metal, wood, water, fire, earth}
   */
  getAffinity() {
    return this.spiritRoot.affinity || {
      metal: 20,
      wood: 20,
      water: 20,
      fire: 20,
      earth: 20
    };
  }

  /**
   * Get resonance value (0-10)
   * @returns {number} Resonance
   */
  getResonance() {
    return this.spiritRoot.resonance || 0;
  }

  /**
   * Get last refresh day
   * @returns {number} Last refresh day
   */
  getLastRefreshDay() {
    return this.spiritRoot.lastRefreshDay || 0;
  }

  /**
   * Calculate speed bonus from spirit root
   * @returns {number} Speed bonus multiplier
   */
  getSpeedBonus() {
    const qualityData = this.getQualityData();
    return qualityData.speedBonus || 1.0;
  }

  /**
   * Calculate bottleneck bonus
   * @returns {number} Bottleneck bonus
   */
  getBottleneckBonus() {
    const qualityData = this.getQualityData();
    return qualityData.bottleneckBonus || 0;
  }

  /**
   * Calculate tribulation bonus
   * @returns {number} Tribulation bonus
   */
  getTribulationBonus() {
    const qualityData = this.getQualityData();
    return qualityData.tribulationBonus || 0;
  }

  /**
   * Get quality grade (0-5)
   * @returns {number} Grade
   */
  getGrade() {
    const qualityData = this.getQualityData();
    return qualityData.grade || 2;
  }
}

export default SpiritRoot;
