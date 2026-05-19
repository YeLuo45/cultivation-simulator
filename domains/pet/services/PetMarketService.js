// domains/pet/services/PetMarketService.js
// Pet market service - extracted from game.js
// Phase 3 DDD refactoring

import { PET_TYPES } from '../../shared/constants/pet.js';

/**
 * PetMarketService - handles pet market purchases
 */
export class PetMarketService {
  /**
   * Buy a pet from market
   * @param {Object} gameState - Game state
   * @param {string} type - Pet type name
   * @param {number} price - Purchase price
   * @returns {Object} Result { success, message, pet }
   */
  buy(gameState, type, price) {
    if (gameState.spiritStones < price) {
      return { success: false, message: '灵石不足！' };
    }
    if (gameState.pets.length >= 5) {
      return { success: false, message: '灵兽栏已满！' };
    }

    gameState.spiritStones -= price;
    const typeData = PET_TYPES[type];
    if (!typeData) {
      return { success: false, message: '宠物类型不存在！' };
    }

    const quality = typeData.quality;
    const petNames = ['小', '青', '灵', '玉', '玄', '白', '紫', '金'];
    const name = petNames[Math.floor(Math.random() * petNames.length)] + type;

    const newPet = {
      type: type,
      name: name,
      quality: quality,
      level: 1,
      exp: 0,
      loyalty: 80,
      hunger: 80,
      advancement: 0,
      transformation: 0,
      awakenedSkills: []
    };

    gameState.pets.push(newPet);
    gameState.selectedPetIndex = gameState.pets.length - 1;

    return { 
      success: true, 
      message: `你购买了${typeData.icon}${name}！`,
      pet: newPet
    };
  }

  /**
   * Get market price for a pet type
   * @param {string} type - Pet type name
   * @returns {number} Price in spirit stones
   */
  getMarketPrice(type) {
    const typeData = PET_TYPES[type];
    if (!typeData) return 0;

    const basePrices = {
      common: 500,
      rare: 1500,
      precious: 5000,
      legendary: 20000
    };

    return basePrices[typeData.quality] || 500;
  }
}

export const petMarketService = new PetMarketService();
export default petMarketService;
