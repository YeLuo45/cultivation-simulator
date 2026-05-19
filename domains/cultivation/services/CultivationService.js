// domains/cultivation/services/CultivationService.js
// Cultivation domain service - extracted from game.js
// Phase 3 DDD refactoring

import { REALM_REQUIREMENTS, CONFIG } from '../../shared/constants/cultivation.js';

/**
 * CultivationService - handles cultivation, breakthrough and related logic
 */
export class CultivationService {
  /**
   * Process cultivation action
   * @param {Object} gameState - Game state
   * @returns {Object} Result { gained, newQi, logType, logText }
   */
  cultivate(gameState) {
    const req = REALM_REQUIREMENTS[gameState.realm];
    let baseGain = 5 + Math.random() * 10 + gameState.realm * 3;
    
    // Apply spirit root speed bonus
    baseGain *= this.getSpiritRootSpeedBonus(gameState);
    
    // Apply constitution cultivate speed bonus
    if (gameState.activeEffects.constitution_bonuses && gameState.activeEffects.constitution_bonuses.cultivateSpeed) {
      baseGain *= (1 + gameState.activeEffects.constitution_bonuses.cultivateSpeed);
    }
    
    // Apply equipment and pill effects
    baseGain *= (1 + gameState.activeEffects.cultivate_speed);
    baseGain *= (1 + gameState.activeEffects.cultivate_qi_rate);
    baseGain *= (1 + gameState.activeEffects.all_stats);
    
    // Pet bonus (Qilin provides cultivate speed)
    const petCultBonus = this.getPetBonus(gameState, 'cultivate_speed');
    if (petCultBonus > 0) {
      baseGain *= (1 + petCultBonus);
    }
    
    const gain = Math.floor(baseGain);
    gameState.qi = Math.min(gameState.maxQi, gameState.qi + gain);
    gameState.cultivationProgress += gain;
    
    let logType = 'good';
    let logText = `修炼${gain}点灵气，感觉体内的灵力更加充沛。`;
    
    // Check stage advancement
    if (gameState.cultivationProgress >= req.stageThreshold[gameState.stage] && gameState.stage < 2) {
      gameState.stage++;
      logText = `修炼${gain}点灵气，境界突破到${CONFIG.stages[gameState.stage]}！`;
    } else if (gameState.cultivationProgress >= req.stageThreshold[2]) {
      logText = `修炼${gain}点灵气，${CONFIG.realms[gameState.realm]}期修炼圆满，可以尝试突破到下一个境界！`;
    }
    
    return { gained: gain, newQi: gameState.qi, logType, logText, shouldAdvance: gameState.stage };
  }

  /**
   * Process morning exercise (daily qi gain)
   * @param {Object} gameState - Game state
   * @returns {Object} Result { gainedQi, gainedMindset }
   */
  morningExercise(gameState) {
    const gain = Math.floor(2 + Math.random() * 5);
    gameState.qi = Math.min(gameState.maxQi, gameState.qi + gain);
    gameState.mindset = Math.min(100, gameState.mindset + 1);
    
    return { gainedQi: gain, gainedMindset: 1 };
  }

  /**
   * Process breakthrough (non-tribulation)
   * @param {Object} gameState - Game state
   * @returns {Object} Result { success, message }
   */
  breakthrough(gameState) {
    const req = REALM_REQUIREMENTS[gameState.realm];
    let chance = (gameState.mindset / 100) * (gameState.qi / req.breakthroughQi);
    
    // Apply breakthrough boost effects
    chance *= (1 + gameState.activeEffects.breakthrough_boost);
    chance *= (1 + gameState.activeEffects.all_stats);
    
    if (Math.random() < chance) {
      if (gameState.realm >= 4) {
        // Ascension to immortal realm
        if (gameState.realm === 4) {
          gameState.realm = 5;
          gameState.stage = 0;
          gameState.cultivationProgress = 0;
          gameState.maxQi = REALM_REQUIREMENTS[5].maxQi;
          gameState.qi = Math.floor(gameState.qi * 0.5);
          gameState.mindset = Math.max(0, gameState.mindset - 5);
          return { 
            success: true, 
            isAscension: true,
            message: `历经${gameState.days}天的修炼，你终于突破化神期，白日飞升！踏入天外天，探索诸天万界！`
          };
        }
        return { success: true, isAscension: false, message: '你的修为在飞升期继续精进！' };
      } else {
        // Normal breakthrough success
        gameState.realm++;
        gameState.stage = 0;
        gameState.cultivationProgress = 0;
        gameState.maxQi = REALM_REQUIREMENTS[gameState.realm].maxQi;
        gameState.qi = Math.floor(gameState.qi * 0.3);
        gameState.mindset = Math.max(0, gameState.mindset - 10);
        return { 
          success: true, 
          isAscension: false,
          newRealm: gameState.realm,
          message: `恭喜！突破到${CONFIG.realms[gameState.realm]}期！`
        };
      }
    } else {
      // Breakthrough failed
      gameState.qi = Math.floor(gameState.qi * 0.3);
      gameState.mindset = Math.max(0, gameState.mindset - 20);
      return { success: false, message: '突破失败，灵气反噬...' };
    }
  }

  /**
   * Get tribulation key for realm and stage
   * @param {number} realm - Realm index
   * @param {number} stage - Stage index
   * @returns {string} Tribulation key
   */
  getTribulationKey(realm, stage) {
    if (realm === 3) {
      if (stage === 0) return '金丹初期雷劫';
      if (stage === 1) return '金丹中期阴火';
      return '金丹后期风劫';
    }
    if (realm === 4) return '元婴心魔';
    return '化神飞升';
  }

  /**
   * Calculate tribulation success rate
   * @param {Object} gameState - Game state
   * @param {string} tribKey - Tribulation key
   * @param {Object} tribData - Tribulation data (TRIBULATIONS[tribKey])
   * @returns {number} Success rate (0-1)
   */
  calculateTribulationSuccess(gameState, tribKey, tribData) {
    let rate = tribData.baseRate;

    // Mindset bonus
    rate += (gameState.mindset / 100) * 0.2;

    // Transmigration buff
    if (gameState.hasTransmigrationBuff) {
      rate += 0.1;
    }

    // Equipment bonus
    const equipped = (gameState.equippedTreasures || []).filter(t => t);
    equipped.forEach(t => {
      if (t.effects) {
        t.effects.forEach(e => {
          if (e.type === '渡劫_damage_reduce') rate += e.value * 0.1;
          if (e.type === 'all_stats') rate += e.value * 0.5;
        });
      }
    });

    // Preparation bonus
    const preparations = gameState.tribulation?.preparations || [];
    if (preparations.includes('阵法')) rate += 0.15;
    if (preparations.includes('定神丹')) rate += 0.1;
    if (preparations.includes('祈祷')) rate += 0.1;

    // Realm penalty
    if (gameState.realm === 4) rate -= 0.1;
    if (gameState.realm === 5) rate -= 0.2;

    return Math.min(0.95, Math.max(0.05, rate));
  }

  /**
   * Get spirit root speed bonus
   * @param {Object} gameState - Game state
   * @returns {number} Speed bonus multiplier
   */
  getSpiritRootSpeedBonus(gameState) {
    if (!gameState.spiritRoot) return 1.0;
    const quality = gameState.spiritRoot.quality || '中品灵根';
    const bonuses = {
      '伪灵根': 0.6,
      '下品灵根': 0.8,
      '中品灵根': 1.0,
      '上品灵根': 1.3,
      '天灵根': 1.6,
      '混沌灵根': 2.0
    };
    return bonuses[quality] || 1.0;
  }

  /**
   * Get pet bonus for a specific type
   * @param {Object} gameState - Game state
   * @param {string} bonusType - Bonus type (cultivate_speed, attack, defense, etc.)
   * @returns {number} Bonus value
   */
  getPetBonus(gameState, bonusType) {
    if (!gameState.pets || gameState.pets.length === 0) return 0;
    
    let totalBonus = 0;
    const summonedIndex = gameState.summonedPet;
    
    gameState.pets.forEach((pet, index) => {
      if (index !== summonedIndex) return;
      if (!pet.awakenedSkills) return;
      
      pet.awakenedSkills.forEach(skill => {
        if (skill.desc && skill.desc.includes('修炼速度')) {
          totalBonus += 0.15; // Simplified: assumes 15% from Qilin
        }
      });
    });
    
    return totalBonus;
  }

  /**
   * Get random local event
   * @param {Object} gameState - Game state
   * @returns {Object} Event object
   */
  getRandomEvent(gameState) {
    const events = [
      {
        title: '🌿 发现灵草',
        description: '在山林间发现一株散发幽香的灵草，似乎可以服用增强灵气。',
        options: [
          { text: '小心采摘', risk: 'low', effects: { qi: 15, mindset: 0, spiritStones: 0 } },
          { text: '直接服用', risk: 'medium', effects: { qi: 35, mindset: -5, spiritStones: 0 } },
          { text: '连根拔起研究', risk: 'high', effects: { qi: 60, mindset: -15, spiritStones: 0 } }
        ]
      },
      {
        title: '⚔️ 遇到妖兽',
        description: '一只妖兽从林中窜出，眼中闪烁着凶光，似乎把你当成了猎物。',
        options: [
          { text: '悄悄绕行', risk: 'low', effects: { qi: 0, mindset: 5, spiritStones: 0 } },
          { text: '与之搏斗', risk: 'medium', effects: { qi: -20, mindset: -10, spiritStones: 30 } },
          { text: '全力击杀', risk: 'high', effects: { qi: -40, mindset: -25, spiritStones: 80 } }
        ]
      },
      {
        title: '🏯 废弃洞府',
        description: '前方有一座废弃的修士洞府，门口的石碑上刻着模糊的文字。',
        options: [
          { text: '谨慎探索', risk: 'low', effects: { qi: 10, mindset: 5, spiritStones: 50 } },
          { text: '直接进入', risk: 'medium', effects: { qi: 30, mindset: -5, spiritStones: 100 } },
          { text: '破门而入', risk: 'high', effects: { qi: 50, mindset: -15, spiritStones: 200 } }
        ]
      }
    ];
    
    return events[Math.floor(Math.random() * events.length)];
  }
}

export const cultivationService = new CultivationService();
export default cultivationService;
