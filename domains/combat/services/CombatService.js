// domains/combat/services/CombatService.js
// Combat domain service - Phase 4 DDD refactoring

import {
  ULTIMATE_SKILLS,
  TECHNIQUE_BONUS,
  TECHNIQUE_COLORS,
  TECHNIQUES,
  COMBAT_TREASURES,
  COMBAT_PILLS,
  ENHANCE_CONFIG,
  FIXED_OPPONENTS,
  MAX_ENERGY
} from '../../shared/constants/combat.js';

/**
 * CombatService - handles turn-based combat logic
 */
export class CombatService {
  constructor() {
    this.PVP_K = 32; // Rating change coefficient
    this.MAX_ENERGY = MAX_ENERGY;
  }

  /**
   * Initialize combat with an opponent
   */
  init(gameState, opponent) {
    const realmNames = ['炼气', '筑基', '金丹', '元婴', '化神'];
    const hpByRealm = { 0: 500, 1: 800, 2: 1000, 3: 2000, 4: 5000 };

    const playerWeapon = gameState.equippedTreasures[0];
    const playerArmor = gameState.equippedTreasures[1];

    let playerMaxHP = hpByRealm[gameState.realm] || 1000;
    let playerAttack = 80 + gameState.realm * 40;
    let playerDefense = 40 + gameState.realm * 20;
    let playerSpeed = 80 + gameState.realm * 15;
    let playerCritRate = 0.1 + gameState.realm * 0.03;
    let playerTechnique = this._getPlayerTechnique(gameState);

    // Apply weapon star bonuses
    if (playerWeapon && COMBAT_TREASURES[playerWeapon.name]) {
      const weaponData = COMBAT_TREASURES[playerWeapon.name];
      const star = playerWeapon.star || 1;
      const mult = ENHANCE_CONFIG.starMultipliers[star] || 1.0;
      const baseVal = weaponData.effect.attackBonus || 0;
      playerAttack = Math.floor(playerAttack * (1 + baseVal * mult));
      if (weaponData.effect.critBonus) {
        playerCritRate += weaponData.effect.critBonus * mult;
      }
    }

    // Apply armor star bonuses
    if (playerArmor && COMBAT_TREASURES[playerArmor.name]) {
      const armorData = COMBAT_TREASURES[playerArmor.name];
      const star = playerArmor.star || 1;
      const mult = ENHANCE_CONFIG.starMultipliers[star] || 1.0;
      const baseDef = armorData.effect.defenseBonus || 0;
      const baseHP = armorData.effect.hpBonus || 0;
      if (baseDef > 0) playerDefense = Math.floor(playerDefense * (1 + baseDef * mult));
      if (baseHP > 0) playerMaxHP = Math.floor(playerMaxHP * (1 + baseHP * mult));
    }

    // Apply constitution combat bonuses
    if (gameState.activeEffects.constitution_bonuses) {
      const cb = gameState.activeEffects.constitution_bonuses;
      if (cb.attack) playerAttack = Math.floor(playerAttack * (1 + cb.attack));
      if (cb.defense) playerDefense = Math.floor(playerDefense * (1 + cb.defense));
      if (cb.hpBonus) playerMaxHP = Math.floor(playerMaxHP * (1 + cb.hpBonus));
      if (cb.crit) playerCritRate += cb.crit;
      if (cb.dodge) playerSpeed += Math.floor(playerSpeed * cb.dodge);
    }

    // Apply all_stats bonus
    if (gameState.activeEffects.all_stats) {
      playerAttack = Math.floor(playerAttack * (1 + gameState.activeEffects.all_stats));
      playerDefense = Math.floor(playerDefense * (1 + gameState.activeEffects.all_stats));
      playerMaxHP = Math.floor(playerMaxHP * (1 + gameState.activeEffects.all_stats));
    }

    // Reset combat energy
    gameState.combatEnergy = 0;

    const combatState = {
      inProgress: true,
      round: 0,
      turn: playerSpeed >= opponent.speed ? 'player' : 'opponent',
      player: {
        name: '你',
        avatar: '🧑‍🎓',
        realm: gameState.realm,
        realmName: realmNames[gameState.realm] + '期',
        maxHP: playerMaxHP,
        hp: playerMaxHP,
        attack: playerAttack,
        defense: playerDefense,
        speed: playerSpeed,
        technique: playerTechnique,
        techniqueColor: TECHNIQUE_COLORS[playerTechnique],
        weapon: playerWeapon ? playerWeapon.name : null,
        weaponData: playerWeapon,
        armor: playerArmor ? playerArmor.name : null,
        armorData: playerArmor,
        critRate: playerCritRate,
        setBonuses: {},
        skills: [],
        accessories: [],
        counterEnergy: 0,
        inDefenseStance: false,
        skillLevels: {}
      },
      opponent: opponent,
      log: [],
      effects: {
        player: { defending: false, attackBoost: 0, defenseBoost: 0, ignoreDefense: false, burning: 0, frozen: 0 },
        opponent: { defending: false, attackBoost: 0, defenseBoost: 0, burning: 0, frozen: 0 }
      }
    };

    combatState.log.push({
      type: 'system',
      text: `战斗开始！${opponent.name}（${opponent.realmName}，功法：${opponent.technique}）`,
      round: 0
    });

    return combatState;
  }

  /**
   * Execute player attack
   */
  executeAttack(combatState, gameState) {
    const p = combatState.player;
    const o = combatState.opponent;
    const effects = combatState.effects.player;

    // Clear defense state
    effects.defending = false;
    combatState.player.inDefenseStance = false;

    // Calculate base damage
    let baseDamage = p.attack;
    baseDamage = Math.floor(baseDamage * (1 + effects.attackBoost));

    // Technique bonus
    let techniqueMultiplier = 1;
    if (TECHNIQUE_BONUS[p.technique].beats === o.technique) {
      techniqueMultiplier = 1.5;
      combatState.log.push({ type: 'system', text: `功法克制！伤害+50%`, round: combatState.round });
    } else if (TECHNIQUE_BONUS[p.technique].losesTo === o.technique) {
      techniqueMultiplier = 0.7;
      combatState.log.push({ type: 'system', text: `被功法克制！伤害-30%`, round: combatState.round });
    }
    baseDamage = Math.floor(baseDamage * techniqueMultiplier);

    // A4 set attack bonus
    if (p.attackPercent) {
      baseDamage = Math.floor(baseDamage * p.attackPercent);
    }

    // Defense reduction
    let finalDamage = baseDamage;
    if (!effects.ignoreDefense) {
      const defReduction = effects.defending ? o.defense * 1.5 : o.defense;
      finalDamage = Math.max(1, baseDamage - defReduction);
    }

    // Critical hit check
    const critRateWithSet = p.critRate + (p.critBonus || 0);
    const isCrit = Math.random() < critRateWithSet;
    if (isCrit) {
      finalDamage = Math.floor(finalDamage * 1.5);
      combatState.log.push({ type: 'player-action', actionType: 'critical', text: `💥暴击！`, round: combatState.round });
    }

    o.hp = Math.max(0, o.hp - finalDamage);

    // A4 set skills trigger
    if (p.skills && p.skills.includes('freezeAura') && Math.random() < 0.25) {
      combatState.effects.opponent.frozen = 2;
      combatState.log.push({ type: 'system', text: `❄️ 玄冰领域生效！敌人被冻结2回合！`, round: combatState.round });
    }
    if (p.skills && p.skills.includes('burnAura') && Math.random() < 0.30) {
      combatState.effects.opponent.burning = 3;
      combatState.log.push({ type: 'system', text: `🔥 烈焰领域生效！敌人被灼烧3回合！`, round: combatState.round });
    }
    if (p.skills && p.skills.includes('angelJudgment') && Math.random() < 0.20) {
      const healAmount = Math.floor(p.maxHP * 0.15);
      p.hp = Math.min(p.maxHP, p.hp + healAmount);
      combatState.log.push({ type: 'system', text: `👼 天使审判生效！恢复${healAmount}点生命！`, round: combatState.round });
    }

    const techniqueColor = TECHNIQUE_COLORS[p.technique];
    combatState.log.push({
      type: 'player-action',
      actionType: 'damage',
      text: `你施展<span style="color:${techniqueColor}">${p.technique}</span>，造成 <span style="color:#ff6666">${finalDamage}</span> 点伤害${isCrit ? '（暴击）' : ''}`,
      round: combatState.round
    });

    // Add combat energy
    this.addEnergy(gameState, 20);
    combatState.turn = 'opponent';

    return { victory: o.hp <= 0 };
  }

  /**
   * Execute player defend
   */
  executeDefend(combatState) {
    combatState.effects.player.defending = true;
    combatState.player.inDefenseStance = true;
    if (typeof combatState.player.counterEnergy === 'undefined') combatState.player.counterEnergy = 0;
    combatState.player.counterEnergy = Math.min(100, combatState.player.counterEnergy + 35);
    combatState.log.push({
      type: 'player-action',
      text: `🛡️ 防御姿态！反击能量+35（${combatState.player.counterEnergy}/100）`,
      round: combatState.round
    });

    combatState.turn = 'opponent';
  }

  /**
   * Execute player escape attempt
   */
  executeEscape(combatState, gameState) {
    const escapeChance = 0.4 + (gameState.activeEffects.escape || 0);
    const success = Math.random() < escapeChance;

    if (success) {
      const cost = Math.floor(gameState.spiritStones * 0.5);
      gameState.spiritStones -= cost;
      combatState.log.push({
        type: 'system',
        text: `逃跑成功！损失${cost}灵石`,
        round: combatState.round
      });
      combatState.turn = 'opponent';
      return { success: true, escaped: true };
    } else {
      combatState.log.push({
        type: 'system',
        text: '逃跑失败！被对方追击',
        round: combatState.round
      });
      const extraCost = Math.floor(gameState.spiritStones * 0.2);
      gameState.spiritStones -= extraCost;
      combatState.log.push({
        type: 'system',
        text: `被追击！额外损失${extraCost}灵石`,
        round: combatState.round
      });
      combatState.turn = 'opponent';
      return { success: false, escaped: false };
    }
  }

  /**
   * Execute opponent turn (AI)
   */
  executeOpponentTurn(combatState, gameState) {
    if (!combatState.inProgress || combatState.opponent.hp <= 0) return;

    combatState.round++;
    const p = combatState.player;
    const o = combatState.opponent;
    const effects = combatState.effects.opponent;

    // Clear defense state
    effects.defending = false;

    // Opponent AI: random action selection
    const rand = Math.random();
    let action = 'attack';
    if (rand < 0.1 && this._getItemCount(gameState, '回春丹') > 0 && o.hp < o.maxHP * 0.5) {
      action = 'heal';
    }

    if (action === 'heal') {
      // Use healing pill
      const idx = gameState.inventory.findIndex(i => i.name === '回春丹');
      if (idx !== -1) {
        gameState.inventory[idx].quantity--;
        if (gameState.inventory[idx].quantity <= 0) {
          gameState.inventory.splice(idx, 1);
        }
      }
      const heal = Math.floor(o.maxHP * 0.3);
      o.hp = Math.min(o.maxHP, o.hp + heal);
      combatState.log.push({
        type: 'opponent-action',
        actionType: 'heal',
        text: `${o.name}使用了回春丹，恢复${heal}生命`,
        round: combatState.round
      });
    } else {
      // Attack
      let baseDamage = o.attack;
      baseDamage = Math.floor(baseDamage * (1 + effects.attackBoost));

      // Technique bonus
      let techniqueMultiplier = 1;
      if (TECHNIQUE_BONUS[o.technique].beats === p.technique) {
        techniqueMultiplier = 1.5;
      } else if (TECHNIQUE_BONUS[o.technique].losesTo === p.technique) {
        techniqueMultiplier = 0.7;
      }
      baseDamage = Math.floor(baseDamage * techniqueMultiplier);

      // Player defense reduction
      let finalDamage = baseDamage;
      if (combatState.effects.player.defending) {
        finalDamage = Math.floor(baseDamage * 0.5);
      }
      finalDamage = Math.max(1, finalDamage - Math.floor(p.defense * (1 + combatState.effects.player.defenseBoost)));

      // Critical
      const isCrit = Math.random() < o.critRate;
      if (isCrit) {
        finalDamage = Math.floor(finalDamage * 1.5);
      }

      p.hp = Math.max(0, p.hp - finalDamage);
      combatState.effects.player.defending = false;

      const techniqueColor = TECHNIQUE_COLORS[o.technique];
      combatState.log.push({
        type: 'opponent-action',
        actionType: 'damage',
        text: `${o.name}施展<span style="color:${techniqueColor}">${o.technique}</span>，造成 <span style="color:#ff6666">${finalDamage}</span> 点伤害${isCrit ? '（暴击）' : ''}`,
        round: combatState.round
      });

      // A5 counter attack system
      if (combatState.player.counterEnergy >= 50 && !combatState.player.inDefenseStance) {
        const weaponData = combatState.player.weaponData || { name: '空手', star: 1 };
        const starMultiplier = ENHANCE_CONFIG.starMultipliers[weaponData.star] || 1;
        const baseWeaponDamage = 50;
        let counterDamage = Math.floor(baseWeaponDamage * p.attack * starMultiplier * 0.01);

        if (combatState.player.skills && combatState.player.skills.includes('玄武反击')) {
          counterDamage = Math.floor(counterDamage * 1.5);
          const healAmount = Math.floor(counterDamage * 0.15);
          combatState.player.hp = Math.min(combatState.player.maxHP, combatState.player.hp + healAmount);
          combatState.log.push({ type: 'system', text: `🐢 玄武反击！伤害+50%并恢复 ${healAmount} HP！`, round: combatState.round });
        }

        combatState.opponent.hp = Math.max(1, combatState.opponent.hp - counterDamage);
        combatState.player.counterEnergy -= 50;
        combatState.log.push({ type: 'player-action', text: `⚡ 反击！对敌人造成 ${counterDamage} 点伤害！（-${50}反击能量）`, round: combatState.round });
      }
    }

    return { defeat: p.hp <= 0 };
  }

  /**
   * End combat and process results
   */
  endCombat(gameState, combatState, result) {
    combatState.inProgress = false;
    const p = combatState.player;
    const o = combatState.opponent;

    let reward = 0;
    let penalty = 0;
    let honorChange = 0;
    let fameChange = 0;
    let realmDropChance = 0;

    if (result === 'win') {
      reward = Math.floor(o.maxHP * 0.5);
      gameState.spiritStones += reward;
      honorChange = 10;
      fameChange = 5;
      gameState.combat = gameState.combat || { wins: 0, losses: 0, honor: 0, fame: 0, battleHistory: [] };
      gameState.combat.wins++;
      gameState.combat.honor += honorChange;
      gameState.combat.fame += fameChange;
      combatState.log.push({
        type: 'system',
        text: `🎉 胜利！获得${reward}灵石，荣誉+${honorChange}，声望+${fameChange}`,
        round: combatState.round
      });
    } else if (result === 'lose') {
      penalty = Math.floor(gameState.spiritStones * 0.3);
      gameState.spiritStones -= penalty;
      honorChange = -5;
      fameChange = -3;
      realmDropChance = 0.1;
      gameState.combat = gameState.combat || { wins: 0, losses: 0, honor: 0, fame: 0, battleHistory: [] };
      gameState.combat.losses++;
      gameState.combat.honor = Math.max(0, gameState.combat.honor + honorChange);
      gameState.combat.fame = Math.max(0, gameState.combat.fame + fameChange);

      // Realm drop
      if (Math.random() < realmDropChance) {
        const oldRealm = gameState.realm;
        gameState.realm = Math.max(0, gameState.realm - 1);
        combatState.log.push({
          type: 'system',
          text: `💔 境界跌落！从${gameState.realms ? gameState.realms[oldRealm] : ['炼气', '筑基', '金丹', '元婴', '化神'][oldRealm]}期跌落到${gameState.realms ? gameState.realms[gameState.realm] : ['炼气', '筑基', '金丹', '元婴', '化神'][gameState.realm]}期`,
          round: combatState.round
        });
      }

      // Injury debuff: 3 battles with -20% stats
      gameState.combat.injured = true;
      gameState.combat.injuryEndDay = gameState.days + 3;
      combatState.log.push({
        type: 'system',
        text: `💔 重伤！未来3场战斗属性降低20%`,
        round: combatState.round
      });

      combatState.log.push({
        type: 'system',
        text: `😢 战败！损失${penalty}灵石，荣誉${honorChange}，声望${fameChange}`,
        round: combatState.round
      });
    }

    // Record battle history
    gameState.combat.battleHistory = gameState.combat.battleHistory || [];
    gameState.combat.battleHistory.unshift({
      opponent: o.name,
      result: result,
      reward: reward,
      penalty: penalty,
      day: gameState.days
    });
    if (gameState.combat.battleHistory.length > 50) {
      gameState.combat.battleHistory.pop();
    }

    return { reward, penalty, honorChange, fameChange };
  }

  /**
   * Start a combat challenge
   */
  startChallenge(gameState, difficulty, generateOpponentFn) {
    // Consume challenge scroll
    const idx = gameState.inventory.findIndex(i => i.name === '挑战状');
    if (idx !== -1) {
      gameState.inventory[idx].quantity--;
      if (gameState.inventory[idx].quantity <= 0) {
        gameState.inventory.splice(idx, 1);
      }
    }

    const opponent = generateOpponentFn(difficulty);
    return this.init(gameState, opponent);
  }

  /**
   * Select combat action
   */
  selectAction(action) {
    // Pure routing - actual execution done by other methods
    // This is kept for compatibility
    return action;
  }

  /**
   * Get current ultimate skills for player's weapon
   */
  getCurrentSkills(combatState) {
    const weaponData = combatState.player.weaponData || { name: '空手' };
    return ULTIMATE_SKILLS[weaponData.name] || ULTIMATE_SKILLS['空手'] || [];
  }

  /**
   * Execute ultimate skill
   */
  executeUltimate(combatState, skill) {
    const weaponData = combatState.player.weaponData || { name: '空手', star: 1 };
    const level = combatState.player.skillLevels ? (combatState.player.skillLevels[skill.id] || 1) : 1;
    const starMultiplier = ENHANCE_CONFIG.starMultipliers[weaponData.star] || 1.0;

    // Note: energy check should be done by caller
    combatState.round++;

    // Calculate base damage
    const baseAttack = combatState.player.attack;
    const levelMultiplier = 1 + (level - 1) * 0.2;
    let damage = Math.floor(baseAttack * skill.damage * levelMultiplier * starMultiplier);

    // Technique bonus
    if (TECHNIQUE_BONUS[combatState.player.technique].beats === combatState.opponent.technique) {
      damage = Math.floor(damage * 1.5);
    }

    const isCrit = Math.random() < combatState.player.critRate;
    if (isCrit) damage = Math.floor(damage * 1.5);

    let finalDamage = damage;
    if (!combatState.effects.player.ignoreDefense) {
      finalDamage = Math.max(1, damage - Math.floor(combatState.opponent.defense * 0.3));
    }
    combatState.opponent.hp = Math.max(0, combatState.opponent.hp - finalDamage);

    let logText = `⚡ ${weaponData.name} 发动 ${skill.name} Lv.${level}！造成 ${finalDamage} 伤害！${isCrit ? '（暴击）' : ''}`;

    // Apply skill effects
    if (skill.effects) {
      if (skill.effects.burn) {
        const chance = skill.effects.burn * levelMultiplier;
        if (Math.random() < chance) {
          combatState.opponent.burning = skill.effects.burnTurns || 3;
          logText += ` 🔥敌人被灼烧 ${combatState.opponent.burning} 回合！`;
        }
      }
      if (skill.effects.freeze) {
        const chance = skill.effects.freeze * levelMultiplier;
        if (Math.random() < chance) {
          combatState.opponent.frozen = skill.effects.freezeTurns || 2;
          logText += ` ❄️敌人被冻结 ${combatState.opponent.frozen} 回合！`;
        }
      }
      if (skill.effects.stun) {
        if (Math.random() < skill.effects.stun * levelMultiplier) {
          combatState.opponent.stunned = 1;
          logText += ` 💫敌人被眩晕 1 回合！`;
        }
      }
      if (skill.effects.defBoost) {
        combatState.effects.player.defenseBoost = (combatState.effects.player.defenseBoost || 0) + skill.effects.defBoost * levelMultiplier;
        logText += ` 🛡️防御提升 ${Math.round(skill.effects.defBoost * levelMultiplier * 100)}%！`;
      }
      if (skill.effects.drain) {
        const drainAmount = Math.floor(finalDamage * skill.effects.drain * levelMultiplier);
        combatState.player.hp = Math.min(combatState.player.maxHP, combatState.player.hp + drainAmount);
        logText += ` 💉吸取 ${drainAmount} HP！`;
      }
      if (skill.effects.trueDamage) {
        const trueDmg = Math.floor(finalDamage * skill.effects.trueDamage * levelMultiplier);
        combatState.opponent.hp = Math.max(0, combatState.opponent.hp - trueDmg);
        logText += ` ✨真实伤害 +${trueDmg}！`;
      }
    }

    combatState.log.push({
      type: 'player-action',
      actionType: 'ultimate',
      text: logText,
      round: combatState.round
    });

    combatState.turn = 'opponent';
    return { victory: combatState.opponent.hp <= 0 };
  }

  /**
   * Upgrade ultimate skill
   */
  upgradeUltimate(combatState, gameState, skillId, addLogFn) {
    const weaponData = combatState.player.weaponData || { name: '空手' };
    const skills = ULTIMATE_SKILLS[weaponData.name] || ULTIMATE_SKILLS['空手'] || [];
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return { success: false, error: '技能不存在' };

    const level = combatState.player.skillLevels ? (combatState.player.skillLevels[skillId] || 1) : 1;
    if (level >= skill.maxLevel) return { success: false, error: '已达最大等级' };

    const upgradeInfo = this._getSkillUpgradeCost(level);

    // Check spirit stones
    if ((gameState.stones || 0) < upgradeInfo.cost) {
      addLogFn(`升级${skill.name}需要${upgradeInfo.text}，灵石不足！`);
      return { success: false, error: '灵石不足' };
    }

    // Check materials
    if (upgradeInfo.tiancai && (gameState.materials['天材'] || 0) < upgradeInfo.tiancai) {
      addLogFn(`升级${skill.name}需要${upgradeInfo.text}，天材不足！`);
      return { success: false, error: '天材不足' };
    }
    if (upgradeInfo.hunyuan && (gameState.materials['混沌石'] || 0) < upgradeInfo.hunyuan) {
      addLogFn(`升级${skill.name}需要${upgradeInfo.text}，混沌石不足！`);
      return { success: false, error: '混沌石不足' };
    }

    // Deduct and upgrade
    gameState.stones -= upgradeInfo.cost;
    if (upgradeInfo.tiancai) gameState.materials['天材'] -= upgradeInfo.tiancai;
    if (upgradeInfo.hunyuan) gameState.materials['混沌石'] -= upgradeInfo.hunyuan;
    if (!combatState.player.skillLevels) combatState.player.skillLevels = {};
    combatState.player.skillLevels[skillId] = level + 1;

    return { success: true, newLevel: level + 1 };
  }

  /**
   * Select ultimate skill by index
   */
  selectUltimate(combatState, idx) {
    const weaponData = combatState.player.weaponData || { name: '空手' };
    const skills = ULTIMATE_SKILLS[weaponData.name] || ULTIMATE_SKILLS['空手'] || [];
    return skills[idx];
  }

  /**
   * Use combat treasure
   */
  useTreasure(combatState, gameState, name) {
    const treasure = COMBAT_TREASURES[name];
    if (!treasure) return;

    const idx = gameState.inventory.findIndex(i => i.name === name);
    if (idx !== -1) {
      gameState.inventory[idx].quantity--;
      if (gameState.inventory[idx].quantity <= 0) {
        gameState.inventory.splice(idx, 1);
      }
    }

    const effect = treasure.effect;
    let effectText = '';
    if (effect.attackBonus) {
      combatState.effects.player.attackBoost += effect.attackBonus;
      effectText = `${name}发动！攻击+${Math.round(effect.attackBonus * 100)}%`;
    } else if (effect.defenseBonus) {
      combatState.effects.player.defenseBoost += effect.defenseBonus;
      effectText = `${name}发动！防御+${Math.round(effect.defenseBonus * 100)}%`;
    } else if (effect.critBonus) {
      combatState.player.critRate += effect.critBonus;
      effectText = `${name}发动！暴击率+${Math.round(effect.critBonus * 100)}%`;
    } else if (effect.hpBonus) {
      const heal = Math.floor(combatState.player.maxHP * effect.hpBonus);
      combatState.player.hp = Math.min(combatState.player.maxHP, combatState.player.hp + heal);
      effectText = `${name}发动！生命+${heal}`;
    }

    combatState.log.push({ type: 'player-action', text: `你使用了${name}！${effectText}`, round: combatState.round });
    combatState.turn = 'opponent';
  }

  /**
   * Use combat pill
   */
  usePill(combatState, gameState, name) {
    const pill = COMBAT_PILLS[name];
    if (!pill) return;

    const idx = gameState.inventory.findIndex(i => i.name === name);
    if (idx !== -1) {
      gameState.inventory[idx].quantity--;
      if (gameState.inventory[idx].quantity <= 0) {
        gameState.inventory.splice(idx, 1);
      }
    }

    const effect = pill.effect;
    let effectText = '';

    if (effect.type === 'attackBoost') {
      combatState.effects.player.attackBoost += effect.value;
      effectText = `攻击+${Math.round(effect.value * 100)}%`;
    } else if (effect.type === 'defenseBoost') {
      combatState.effects.player.defenseBoost += effect.value;
      effectText = `防御+${Math.round(effect.value * 100)}%`;
    } else if (effect.type === 'ignoreDefense') {
      combatState.effects.player.ignoreDefense = true;
      effectText = '无视对方防御';
    } else if (effect.type === 'heal') {
      const heal = Math.floor(combatState.player.maxHP * effect.value);
      combatState.player.hp = Math.min(combatState.player.maxHP, combatState.player.hp + heal);
      effectText = `恢复${heal}生命`;
    }

    combatState.log.push({ type: 'player-action', text: `你使用了${name}！${effectText}`, round: combatState.round });
    combatState.turn = 'opponent';
  }

  /**
   * Get energy bar info
   */
  getEnergy(combatState) {
    const skills = this.getCurrentSkills(combatState);
    const minCost = skills.length > 0 ? Math.min(...skills.map(s => s.cost)) : 50;
    const energy = combatState.player.ultimateEnergy || 0;
    const pct = Math.min(100, (energy / minCost) * 100);
    const ready = energy >= minCost;
    return {
      current: energy,
      cost: minCost,
      pct,
      ready,
      skills
    };
  }

  /**
   * Add combat log message
   */
  addLog(combatState, message) {
    combatState.log.push({
      type: 'system',
      text: message,
      round: combatState.round
    });
  }

  /**
   * Add energy to player
   */
  addEnergy(gameState, amount) {
    gameState.combatEnergy = Math.min(this.MAX_ENERGY, (gameState.combatEnergy || 0) + amount);
    combatState.player.ultimateEnergy = gameState.combatEnergy;
  }

  // ========== Private helper methods ==========

  _getPlayerTechnique(gameState) {
    // This should be provided by gameState or a technique service
    return gameState.technique || TECHNIQUES[0];
  }

  _getItemCount(gameState, itemName) {
    const item = gameState.inventory.find(i => i.name === itemName);
    return item ? item.quantity : 0;
  }

  _getSkillUpgradeCost(level) {
    // Simplified cost calculation
    const costs = {
      1: { cost: 500, text: '500灵石' },
      2: { cost: 1000, text: '1000灵石' },
      3: { cost: 2000, text: '2000灵石' },
      4: { cost: 4000, text: '4000灵石' }
    };
    return costs[level] || costs[1];
  }
}

export const combatService = new CombatService();
export default combatService;
