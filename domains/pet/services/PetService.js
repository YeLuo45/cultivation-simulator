// domains/pet/services/PetService.js
// Pet domain service - extracted from game.js
// Phase 3 DDD refactoring

import { 
  PET_TYPES, 
  PET_QUALITY_MULTIPLIERS,
  PET_FOOD_COST,
  PET_SUMMON_COST,
  PET_MAX_LEVEL,
  PET_EXP_NEEDED_PER_LEVEL,
  PET_MAX_LOYALTY,
  PET_MAX_HUNGER,
  PET_ADVANCEMENT_COSTS,
  PET_ADVANCEMENT_BONUS_PER_LEVEL,
  PET_MAX_ADVANCEMENT,
  PET_TRANSFORMATION_STAGES,
  PET_TRANSFORMATION_COSTS,
  PET_AWAKENING_SKILLS,
  PET_AWAKENING_COST,
  PET_AWAKENING_EXP_COST,
  PET_MAX_AWAKENED_SKILLS
} from '../../shared/constants/pet.js';

/**
 * PetService - handles pet lifecycle (summon, feed, evolve, advance, transform, dismiss)
 */
export class PetService {
  /**
   * Summon a random pet
   * @param {Object} gameState - Game state
   * @returns {Object} Result { success, message, pet }
   */
  summonRandom(gameState) {
    if (gameState.spiritStones < PET_SUMMON_COST) {
      return { success: false, message: '灵石不足！' };
    }
    if (gameState.pets.length >= 5) {
      return { success: false, message: '灵兽栏已满！' };
    }

    gameState.spiritStones -= PET_SUMMON_COST;

    // Determine quality based on realm and luck
    const realm = gameState.realm;
    const rand = Math.random();
    let quality;
    
    if (rand < 0.05 + realm * 0.01) {
      quality = 'legendary';
    } else if (rand < 0.15 + realm * 0.02) {
      quality = 'precious';
    } else if (rand < 0.35 + realm * 0.05) {
      quality = 'rare';
    } else {
      quality = 'common';
    }

    // Select random pet of that quality
    const availableTypes = Object.keys(PET_TYPES).filter(t => PET_TYPES[t].quality === quality);
    if (availableTypes.length === 0) {
      // Fall back to lower quality
      const lowerQuality = quality === 'legendary' ? 'precious' : quality === 'precious' ? 'rare' : 'common';
      const lowerTypes = Object.keys(PET_TYPES).filter(t => PET_TYPES[t].quality === lowerQuality);
      quality = lowerQuality;
    }
    
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)] || availableTypes[0];
    const typeData = PET_TYPES[type];
    const petNames = ['小', '青', '灵', '玉', '玄', '白', '紫', '金'];
    const name = petNames[Math.floor(Math.random() * petNames.length)] + type;

    const newPet = {
      type: type,
      name: name,
      quality: quality,
      level: 1,
      exp: 0,
      loyalty: 70,
      hunger: 80,
      advancement: 0,
      transformation: 0,
      awakenedSkills: []
    };

    gameState.pets.push(newPet);
    gameState.selectedPetIndex = gameState.pets.length - 1;

    const qualityName = quality === 'legendary' ? '神兽' : quality === 'precious' ? '珍兽' : quality === 'rare' ? '灵兽' : '凡兽';
    return { 
      success: true, 
      message: `恭喜！你在召唤中获得了${qualityName}${typeData.icon}${name}！`,
      pet: newPet
    };
  }

  /**
   * Summon pet by index (specific type selection)
   * @param {Object} gameState - Game state
   * @param {number} index - Pet type index
   * @returns {Object} Result { success, message, pet }
   */
  summonByIndex(gameState, index) {
    // This is for guaranteed summon - uses same logic but specific type
    return this.summonRandom(gameState);
  }

  /**
   * Feed a pet
   * @param {Object} gameState - Game state
   * @param {number} petIndex - Pet index in pets array
   * @returns {Object} Result { success, message }
   */
  feed(gameState, petIndex) {
    const pet = gameState.pets[petIndex];
    if (!pet) {
      return { success: false, message: '灵兽不存在！' };
    }

    if (gameState.spiritStones < PET_FOOD_COST) {
      return { success: false, message: '灵石不足！' };
    }

    gameState.spiritStones -= PET_FOOD_COST;
    pet.hunger = Math.min(PET_MAX_HUNGER, pet.hunger + 40);
    pet.loyalty = Math.min(PET_MAX_LOYALTY, pet.loyalty + 5);
    pet.exp += 10; // Feeding gives small exp

    return { success: true, message: `你喂养了${pet.name}，它很开心！` };
  }

  /**
   * Check if pet can evolve
   * @param {Object} pet - Pet object
   * @returns {boolean}
   */
  canEvolve(pet) {
    if (pet.quality === 'legendary') return false;
    const maxLevel = PET_MAX_LEVEL[pet.quality];
    return pet.level >= maxLevel;
  }

  /**
   * Evolve a pet
   * @param {Object} gameState - Game state
   * @param {number} petIndex - Pet index in pets array
   * @returns {Object} Result { success, message }
   */
  evolve(gameState, petIndex) {
    const pet = gameState.pets[petIndex];
    if (!pet) {
      return { success: false, message: '灵兽不存在！' };
    }

    if (!this.canEvolve(pet)) {
      return { success: false, message: '等级未满或已达到最高品质！' };
    }

    const evolutionMap = {
      'common': 'rare',
      'rare': 'precious',
      'precious': 'legendary'
    };
    const newQuality = evolutionMap[pet.quality];

    // Get new type of evolved quality
    const availableTypes = Object.keys(PET_TYPES).filter(t => PET_TYPES[t].quality === newQuality);
    if (availableTypes.length === 0) {
      return { success: false, message: '无法进化！' };
    }

    const oldType = pet.type;
    pet.type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    pet.quality = newQuality;
    pet.level = 1;
    pet.exp = 0;
    pet.loyalty = Math.min(PET_MAX_LOYALTY, pet.loyalty + 20);

    const qualityName = pet.quality === 'legendary' ? '神兽' : pet.quality === 'precious' ? '珍兽' : '灵兽';
    const typeData = PET_TYPES[pet.type];
    return { 
      success: true, 
      message: `恭喜！${oldType}进化为${qualityName}${typeData.icon}${pet.type}！属性大幅提升！`
    };
  }

  /**
   * Check if pet can advance
   * @param {Object} pet - Pet object
   * @param {number} spiritStones - Player's spirit stones
   * @returns {boolean}
   */
  canAdvance(pet, spiritStones) {
    if (!pet) return false;
    const currentAdv = pet.advancement || 0;
    if (currentAdv >= PET_MAX_ADVANCEMENT) return false;
    const cost = PET_ADVANCEMENT_COSTS[currentAdv];
    return spiritStones >= cost.stones && pet.exp >= cost.exp;
  }

  /**
   * Advance a pet
   * @param {Object} gameState - Game state
   * @param {number} petIndex - Pet index in pets array
   * @returns {Object} Result { success, message }
   */
  advance(gameState, petIndex) {
    const pet = gameState.pets[petIndex];
    if (!pet) {
      return { success: false, message: '灵兽不存在！' };
    }

    const currentAdv = pet.advancement || 0;
    if (currentAdv >= PET_MAX_ADVANCEMENT) {
      return { success: false, message: '已达到最大进阶等级！' };
    }

    const cost = PET_ADVANCEMENT_COSTS[currentAdv];
    if (gameState.spiritStones < cost.stones) {
      return { success: false, message: `灵石不足！需要${cost.stones}灵石` };
    }
    if (pet.exp < cost.exp) {
      return { success: false, message: `经验不足！需要${cost.exp}经验` };
    }

    gameState.spiritStones -= cost.stones;
    pet.exp -= cost.exp;
    pet.advancement = currentAdv + 1;

    return { 
      success: true, 
      message: `恭喜！${pet.name}进阶成功！已达到${currentAdv + 1}阶，属性提升${PET_ADVANCEMENT_BONUS_PER_LEVEL * 100}%！`
    };
  }

  /**
   * Check if pet can transform
   * @param {Object} pet - Pet object
   * @param {number} spiritStones - Player's spirit stones
   * @param {number} playerRealm - Player's realm
   * @returns {boolean}
   */
  canTransform(pet, spiritStones, playerRealm) {
    if (!pet) return false;
    const currentTrans = pet.transformation || 0;
    if (currentTrans >= 5) return false;
    const cost = PET_TRANSFORMATION_COSTS[currentTrans];
    return spiritStones >= cost.stones && playerRealm >= cost.realmMin;
  }

  /**
   * Transform a pet
   * @param {Object} gameState - Game state
   * @param {number} petIndex - Pet index in pets array
   * @returns {Object} Result { success, message }
   */
  transform(gameState, petIndex) {
    const pet = gameState.pets[petIndex];
    if (!pet) {
      return { success: false, message: '灵兽不存在！' };
    }

    const currentTrans = pet.transformation || 0;
    if (currentTrans >= 5) {
      return { success: false, message: '已达到最高化形境界！' };
    }

    const cost = PET_TRANSFORMATION_COSTS[currentTrans];
    if (gameState.spiritStones < cost.stones) {
      return { success: false, message: `灵石不足！需要${cost.stones}灵石` };
    }
    if (gameState.realm < cost.realmMin) {
      const realmNames = ['炼气', '筑基', '金丹', '元婴', '化神', '渡劫', '大乘'];
      return { success: false, message: `境界不足！需要${realmNames[cost.realmMin]}境界` };
    }

    gameState.spiritStones -= cost.stones;
    pet.transformation = currentTrans + 1;

    const nextStage = PET_TRANSFORMATION_STAGES[pet.transformation];
    return { 
      success: true, 
      message: `恭喜！${pet.name}成功化为${nextStage.icon}${nextStage.name}形态！属性大幅提升！`
    };
  }

  /**
   * Check if pet can awaken skill
   * @param {Object} pet - Pet object
   * @param {number} spiritStones - Player's spirit stones
   * @returns {boolean}
   */
  canAwakenSkill(pet, spiritStones) {
    if (!pet) return false;
    if ((pet.awakenedSkills || []).length >= PET_MAX_AWAKENED_SKILLS) return false;
    return spiritStones >= PET_AWAKENING_COST && pet.exp >= PET_AWAKENING_EXP_COST;
  }

  /**
   * Dismiss (release) a pet
   * @param {Object} gameState - Game state
   * @param {number} petIndex - Pet index in pets array
   * @returns {Object} Result { success, message }
   */
  dismiss(gameState, petIndex) {
    const pet = gameState.pets[petIndex];
    if (!pet) {
      return { success: false, message: '灵兽不存在！' };
    }

    // Adjust summoned pet index if needed
    if (gameState.summonedPet === petIndex) {
      gameState.summonedPet = null;
    } else if (gameState.summonedPet !== null && gameState.summonedPet > petIndex) {
      gameState.summonedPet--;
    }

    gameState.pets.splice(petIndex, 1);
    gameState.selectedPetIndex = undefined;

    return { success: true, message: `你释放了${pet.name}。` };
  }

  /**
   * Get pet quality name in Chinese
   * @param {string} quality - Quality key
   * @returns {string} Chinese quality name
   */
  getQualityName(quality) {
    const names = {
      common: '凡兽',
      rare: '灵兽',
      precious: '珍兽',
      legendary: '神兽'
    };
    return names[quality] || '凡兽';
  }
}

export const petService = new PetService();
export default petService;
