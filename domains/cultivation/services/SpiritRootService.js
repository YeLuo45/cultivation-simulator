// domains/cultivation/services/SpiritRootService.js
// SpiritRoot domain service - extracted from game.js
// Phase 3 DDD refactoring

import { SPIRIT_ROOT_QUALITIES, FIVE_ELEMENT_TECHNIQUES } from '../../shared/constants/cultivation.js';

/**
 * SpiritRootService - handles spirit root generation and refresh
 */
export class SpiritRootService {
  /**
   * Generate a random spirit root
   * @returns {Object} New spirit root object
   */
  generateRandom() {
    const rand = Math.random() * 100;
    let cumulative = 0;
    let selectedQuality = '中品灵根';
    
    for (const [quality, data] of Object.entries(SPIRIT_ROOT_QUALITIES)) {
      cumulative += data.weight;
      if (rand < cumulative) {
        selectedQuality = quality;
        break;
      }
    }
    
    // Generate random five element affinity
    const affinity = {
      metal: Math.floor(Math.random() * 40) + 10,
      wood: Math.floor(Math.random() * 40) + 10,
      water: Math.floor(Math.random() * 40) + 10,
      fire: Math.floor(Math.random() * 40) + 10,
      earth: Math.floor(Math.random() * 40) + 10
    };
    
    // Normalize to 100 total
    const total = affinity.metal + affinity.wood + affinity.water + affinity.fire + affinity.earth;
    const scale = 100 / total;
    for (const el in affinity) {
      affinity[el] = Math.floor(affinity[el] * scale);
    }
    
    // Random resonance 0-10
    const resonance = Math.floor(Math.random() * 11);
    
    return {
      quality: selectedQuality,
      affinity: affinity,
      resonance: resonance,
      lastRefreshDay: 0
    };
  }

  /**
   * Get spirit root bonus
   * @param {Object} spiritRoot - Spirit root object
   * @param {string} bonusType - Bonus type (speedBonus, bottleneckBonus, tribulationBonus)
   * @returns {number} Bonus value
   */
  getBonus(spiritRoot, bonusType) {
    if (!spiritRoot) return 0;
    const quality = spiritRoot.quality || '中品灵根';
    const qualityData = SPIRIT_ROOT_QUALITIES[quality];
    if (!qualityData) return 0;
    return qualityData[bonusType] || 0;
  }

  /**
   * Get speed bonus from spirit root
   * @param {Object} spiritRoot - Spirit root object
   * @returns {number} Speed bonus multiplier
   */
  getSpeedBonus(spiritRoot) {
    return this.getBonus(spiritRoot, 'speedBonus');
  }

  /**
   * Get bottleneck bonus from spirit root
   * @param {Object} spiritRoot - Spirit root object
   * @returns {number} Bottleneck bonus
   */
  getBottleneckBonus(spiritRoot) {
    return this.getBonus(spiritRoot, 'bottleneckBonus');
  }

  /**
   * Get tribulation bonus from spirit root
   * @param {Object} spiritRoot - Spirit root object
   * @returns {number} Tribulation bonus
   */
  getTribulationBonus(spiritRoot) {
    return this.getBonus(spiritRoot, 'tribulationBonus');
  }

  /**
   * Refresh spirit root (with or without chaos pill)
   * @param {Object} gameState - Game state
   * @param {boolean} withChaos - Use chaos pill for guaranteed chaos spirit root
   * @returns {Object} Result { success, message }
   */
  refresh(gameState, withChaos = false) {
    const cost = withChaos ? 50000 : 10000;
    
    if (gameState.spiritStones < cost) {
      return { success: false, message: `灵石不足！需要 ${cost} 灵石` };
    }
    
    if (withChaos && gameState.realm < 4) {
      return { success: false, message: '需要化神期才能使用混沌丹！' };
    }
    
    if (withChaos) {
      // Chaos pill guarantees chaos spirit root
      gameState.spiritRoot = {
        quality: '混沌灵根',
        affinity: {
          metal: 20, wood: 20, water: 20, fire: 20, earth: 20
        },
        resonance: 10,
        lastRefreshDay: gameState.days
      };
    } else {
      gameState.spiritRoot = this.generateRandom();
      gameState.spiritRoot.lastRefreshDay = gameState.days;
    }
    
    gameState.spiritStones -= cost;
    
    return {
      success: true,
      message: `使用${withChaos ? '混沌丹' : '洗髓丹'}重塑灵根，新的灵根为：${gameState.spiritRoot.quality}！`,
      spiritRoot: gameState.spiritRoot
    };
  }

  /**
   * Get five element bonus for a specific element
   * @param {Object} spiritRoot - Spirit root object
   * @param {string} element - Element name (金/木/水/火/土)
   * @returns {number} Bonus value
   */
  getFiveElementBonus(spiritRoot, element) {
    if (!spiritRoot || !spiritRoot.affinity) return 0;
    
    const affinity = spiritRoot.affinity[element.toLowerCase()];
    if (!affinity) return 0;
    
    const tech = FIVE_ELEMENT_TECHNIQUES[element];
    if (!tech) return 0;
    
    if (affinity >= tech.threshold) {
      return tech.bonusValue;
    }
    return 0;
  }

  /**
   * Get highest element bonus
   * @param {Object} spiritRoot - Spirit root object
   * @returns {Object|null} { element, technique, affinity } or null
   */
  getHighestElementBonus(spiritRoot) {
    if (!spiritRoot || !spiritRoot.affinity) return null;
    
    let best = null;
    let bestValue = 0;
    
    for (const [element, tech] of Object.entries(FIVE_ELEMENT_TECHNIQUES)) {
      const affinity = spiritRoot.affinity[element.toLowerCase()];
      if (affinity >= tech.threshold && tech.bonusValue > bestValue) {
        best = element;
        bestValue = tech.bonusValue;
      }
    }
    
    return best ? { 
      element: best, 
      technique: FIVE_ELEMENT_TECHNIQUES[best], 
      affinity: spiritRoot.affinity[best.toLowerCase()] 
    } : null;
  }
}

export const spiritRootService = new SpiritRootService();
export default spiritRootService;
