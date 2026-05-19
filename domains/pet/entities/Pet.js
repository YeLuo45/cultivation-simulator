// domains/pet/entities/Pet.js
// Pet entity - extracted from game.js
// Phase 3 DDD refactoring

import { PET_TYPES, PET_MAX_LEVEL, PET_QUALITY_MULTIPLIERS } from '../../shared/constants/pet.js';

/**
 * Pet entity representing a pet spirit beast
 */
export class Pet {
  /**
   * @param {Object} pet - Pet object from gameState
   */
  constructor(pet) {
    this.pet = pet || {};
  }

  /**
   * Get pet type name
   * @returns {string} Pet type
   */
  getType() {
    return this.pet.type || '';
  }

  /**
   * Get pet name
   * @returns {string} Pet name
   */
  getName() {
    return this.pet.name || '';
  }

  /**
   * Get pet quality
   * @returns {string} Quality (common, rare, precious, legendary)
   */
  getQuality() {
    return this.pet.quality || 'common';
  }

  /**
   * Get pet level
   * @returns {number} Level
   */
  getLevel() {
    return this.pet.level || 1;
  }

  /**
   * Get pet experience
   * @returns {number} Experience
   */
  getExp() {
    return this.pet.exp || 0;
  }

  /**
   * Get pet loyalty
   * @returns {number} Loyalty (0-100)
   */
  getLoyalty() {
    return this.pet.loyalty || 0;
  }

  /**
   * Get pet hunger
   * @returns {number} Hunger (0-100)
   */
  getHunger() {
    return this.pet.hunger || 0;
  }

  /**
   * Get advancement level
   * @returns {number} Advancement level (0-5)
   */
  getAdvancement() {
    return this.pet.advancement || 0;
  }

  /**
   * Get transformation stage
   * @returns {number} Transformation stage (0-5)
   */
  getTransformation() {
    return this.pet.transformation || 0;
  }

  /**
   * Get awakened skills
   * @returns {Array} Awakened skills array
   */
  getAwakenedSkills() {
    return this.pet.awakenedSkills || [];
  }

  /**
   * Get pet type data from constants
   * @returns {Object} Pet type data
   */
  getTypeData() {
    return PET_TYPES[this.getType()] || {};
  }

  /**
   * Get pet icon
   * @returns {string} Emoji icon
   */
  getIcon() {
    const typeData = this.getTypeData();
    return typeData.icon || '🐾';
  }

  /**
   * Get max level for this quality
   * @returns {number} Max level
   */
  getMaxLevel() {
    const quality = this.getQuality();
    return PET_MAX_LEVEL[quality] || 20;
  }

  /**
   * Get quality multiplier
   * @returns {number} Multiplier
   */
  getQualityMultiplier() {
    const quality = this.getQuality();
    return PET_QUALITY_MULTIPLIERS[quality] || 1.0;
  }

  /**
   * Get current stats (with level and quality bonuses applied)
   * @returns {Object} Stats { attack, defense, hp }
   */
  getStats() {
    const typeData = this.getTypeData();
    const baseStats = typeData.baseStats || { attack: 5, defense: 3, hp: 30 };
    const multiplier = this.getQualityMultiplier();
    const levelBonus = 1 + (this.getLevel() - 1) * 0.1;
    const advBonus = 1 + this.getAdvancement() * 0.1;
    const transBonus = 1 + this.getTransformation() * 0.15;
    
    return {
      attack: Math.floor(baseStats.attack * multiplier * levelBonus * advBonus * transBonus),
      defense: Math.floor(baseStats.defense * multiplier * levelBonus * advBonus * transBonus),
      hp: Math.floor(baseStats.hp * multiplier * levelBonus * advBonus * transBonus)
    };
  }

  /**
   * Check if pet can evolve (level at max for quality)
   * @returns {boolean}
   */
  canEvolve() {
    if (this.getQuality() === 'legendary') return false;
    return this.getLevel() >= this.getMaxLevel();
  }

  /**
   * Check if pet can advance
   * @param {number} spiritStones - Player's spirit stones
   * @param {Array} advCosts - Advancement costs array
   * @param {number} maxAdv - Max advancement level
   * @returns {boolean}
   */
  canAdvance(spiritStones, advCosts, maxAdv) {
    const currentAdv = this.getAdvancement();
    if (currentAdv >= maxAdv) return false;
    const cost = advCosts[currentAdv];
    return spiritStones >= cost.stones && this.getExp() >= cost.exp;
  }

  /**
   * Check if pet can transform
   * @param {number} spiritStones - Player's spirit stones
   * @param {number} playerRealm - Player's realm
   * @param {Array} transCosts - Transformation costs array
   * @returns {boolean}
   */
  canTransform(spiritStones, playerRealm, transCosts) {
    const currentTrans = this.getTransformation();
    if (currentTrans >= 5) return false;
    const cost = transCosts[currentTrans];
    return spiritStones >= cost.stones && playerRealm >= cost.realmMin;
  }

  /**
   * Check if pet can awaken skill
   * @param {number} spiritStones - Player's spirit stones
   * @param {number} awakeningCost - Awakening cost
   * @param {number} expCost - Experience cost
   * @param {number} maxSkills - Max awakened skills
   * @returns {boolean}
   */
  canAwakenSkill(spiritStones, awakeningCost, expCost, maxSkills) {
    if (this.getAwakenedSkills().length >= maxSkills) return false;
    return spiritStones >= awakeningCost && this.getExp() >= expCost;
  }
}

export default Pet;
