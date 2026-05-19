// domains/combat/services/CombatAIService.js
// Combat AI Service - Phase 4 DDD refactoring

import {
  TECHNIQUES,
  TECHNIQUE_COLORS,
  COMBAT_TREASURES,
  FIXED_OPPONENTS
} from '../../shared/constants/combat.js';

/**
 * CombatAIService - handles enemy AI generation for combat
 */
export class CombatAIService {
  /**
   * Generate an opponent based on difficulty
   * @param {number} playerRealm - Player's current realm (0-4)
   * @param {string} difficulty - 'easy', 'normal', or 'hard'
   */
  generate(playerRealm, difficulty) {
    let targetRealm = playerRealm;
    if (difficulty === 'easy') targetRealm = Math.max(0, playerRealm - 1);
    else if (difficulty === 'normal') targetRealm = playerRealm;
    else if (difficulty === 'hard') targetRealm = Math.min(4, playerRealm + 1);

    const realmNames = ['炼气', '筑基', '金丹', '元婴', '化神'];
    const stages = ['初期', '中期', '后期'];
    const stage = Math.floor(Math.random() * 3);

    const hpByRealm = { 0: 500, 1: 800, 2: 1000, 3: 2000, 4: 5000 };
    const baseHp = hpByRealm[targetRealm] || 1000;
    const baseAttack = 80 + targetRealm * 40;
    const baseDefense = 40 + targetRealm * 20;
    const baseSpeed = 80 + targetRealm * 15;

    const technique = TECHNIQUES[Math.floor(Math.random() * 4)];
    const treasures = Object.keys(COMBAT_TREASURES);
    const weapon = treasures.filter(t => COMBAT_TREASURES[t].type === 'weapon');
    const armor = treasures.filter(t => COMBAT_TREASURES[t].type === 'armor');

    const opponentFixed = FIXED_OPPONENTS[Math.floor(Math.random() * FIXED_OPPONENTS.length)];
    const name = difficulty === 'normal' ? opponentFixed.name : `${opponentFixed.name}（${['初级', '中级', '高级'][difficulty === 'easy' ? 0 : difficulty === 'normal' ? 1 : 2]}）`;

    return {
      name: name,
      avatar: opponentFixed.avatar,
      realm: targetRealm,
      realmName: realmNames[targetRealm] + '期' + stages[stage],
      maxHP: baseHp,
      hp: baseHp,
      attack: baseAttack,
      defense: baseDefense,
      speed: baseSpeed,
      technique: technique,
      techniqueColor: TECHNIQUE_COLORS[technique],
      weapon: weapon[Math.floor(Math.random() * weapon.length)],
      armor: armor[Math.floor(Math.random() * armor.length)],
      critRate: 0.1 + targetRealm * 0.03
    };
  }
}

export const combatAIService = new CombatAIService();
export default combatAIService;
