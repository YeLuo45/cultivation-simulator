/**
 * CombatService - 战斗服务
 * Core combat operations: initCombat, executePlayerAttack, executePlayerDefend, executeOpponentTurn, endCombat
 */

import { combatState, combatEnergy } from '../entities/CombatState.js';

/**
 * Initialize combat with an opponent
 */
function initCombat(opponent) {
    const realmNames = ['炼气', '筑基', '金丹', '元婴', '化神'];
    const hpByRealm = { 0: 500, 1: 800, 2: 1000, 3: 2000, 4: 5000 };

    const playerWeapon = gameState.equippedTreasures[0];
    const playerArmor = gameState.equippedTreasures[1];

    let playerMaxHP = hpByRealm[gameState.realm] || 1000;
    let playerAttack = 80 + gameState.realm * 40;
    let playerDefense = 40 + gameState.realm * 20;
    let playerSpeed = 80 + gameState.realm * 15;
    let playerCritRate = 0.1 + gameState.realm * 0.03;
    let playerTechnique = getPlayerTechnique();

    // Apply equipment star bonuses
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
    if (playerArmor && COMBAT_TREASURES[playerArmor.name]) {
        const armorData = COMBAT_TREASURES[playerArmor.name];
        const star = playerArmor.star || 1;
        const mult = ENHANCE_CONFIG.starMultipliers[star] || 1.0;
        const baseDef = armorData.effect.defenseBonus || 0;
        const baseHP = armorData.effect.hpBonus || 0;
        if (baseDef > 0) playerDefense = Math.floor(playerDefense * (1 + baseDef * mult));
        if (baseHP > 0) playerMaxHP = Math.floor(playerMaxHP * (1 + baseHP * mult));
    }

    // V7 Apply constitution combat effects
    if (gameState.activeEffects.constitution_bonuses) {
        const cb = gameState.activeEffects.constitution_bonuses;
        if (cb.attack) playerAttack = Math.floor(playerAttack * (1 + cb.attack));
        if (cb.defense) playerDefense = Math.floor(playerDefense * (1 + cb.defense));
        if (cb.hpBonus) playerMaxHP = Math.floor(playerMaxHP * (1 + cb.hpBonus));
        if (cb.crit) playerCritRate += cb.crit;
        if (cb.dodge) playerSpeed += Math.floor(playerSpeed * cb.dodge);
    }
    if (gameState.activeEffects.all_stats) {
        playerAttack = Math.floor(playerAttack * (1 + gameState.activeEffects.all_stats));
        playerDefense = Math.floor(playerDefense * (1 + gameState.activeEffects.all_stats));
        playerMaxHP = Math.floor(playerMaxHP * (1 + gameState.activeEffects.all_stats));
    }

    combatEnergy = 0;

    combatState = {
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

    calculateSetBonuses();
    recalculatePlayerStats();

    combatState.log.push({
        type: 'system',
        text: `战斗开始！${opponent.name}（${opponent.realmName}，功法：${opponent.technique}）`,
        round: 0
    });

    if (combatState.turn === 'opponent') {
        setTimeout(() => executeOpponentTurn(), 1000);
    }
}

/**
 * Generate an opponent based on difficulty
 */
function generateOpponent(difficulty) {
    const playerRealm = gameState.realm;
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

/**
 * Start a combat challenge
 */
function startCombatChallenge(difficulty) {
    if (getItemCount('挑战状') < 1) {
        alert('挑战状不足！请在商店购买。');
        return;
    }

    const idx = gameState.inventory.findIndex(i => i.name === '挑战状');
    if (idx !== -1) {
        gameState.inventory[idx].quantity--;
        if (gameState.inventory[idx].quantity <= 0) {
            gameState.inventory.splice(idx, 1);
        }
    }

    const opponent = generateOpponent(difficulty);
    initCombat(opponent);
    renderCombatArena();
}

/**
 * Execute player attack
 */
function executePlayerAttack() {
    const p = combatState.player;
    const o = combatState.opponent;
    const effects = combatState.effects.player;

    effects.defending = false;
    combatState.player.inDefenseStance = false;

    let baseDamage = p.attack;
    baseDamage = Math.floor(baseDamage * (1 + effects.attackBoost));

    let techniqueMultiplier = 1;
    if (TECHNIQUE_BONUS[p.technique].beats === o.technique) {
        techniqueMultiplier = 1.5;
        combatState.log.push({ type: 'system', text: `功法克制！伤害+50%`, round: combatState.round });
    } else if (TECHNIQUE_BONUS[p.technique].losesTo === o.technique) {
        techniqueMultiplier = 0.7;
        combatState.log.push({ type: 'system', text: `被功法克制！伤害-30%`, round: combatState.round });
    }
    baseDamage = Math.floor(baseDamage * techniqueMultiplier);

    if (p.attackPercent) {
        baseDamage = Math.floor(baseDamage * p.attackPercent);
    }

    let finalDamage = baseDamage;
    if (!effects.ignoreDefense) {
        const defReduction = effects.defending ? o.defense * 1.5 : o.defense;
        finalDamage = Math.max(1, baseDamage - defReduction);
    }

    const critRateWithSet = p.critRate + (p.critBonus || 0);
    const isCrit = Math.random() < critRateWithSet;
    if (isCrit) {
        finalDamage = Math.floor(finalDamage * 1.5);
        combatState.log.push({ type: 'player-action', actionType: 'critical', text: `💥暴击！`, round: combatState.round });
    }

    o.hp = Math.max(0, o.hp - finalDamage);

    // A4 Set aura effects
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

    addEnergy(20);
    combatState.turn = 'opponent';
    renderCombatArena();

    if (o.hp <= 0) {
        setTimeout(() => endCombat('win'), 500);
    } else {
        setTimeout(() => executeOpponentTurn(), 1000);
    }
}

/**
 * Execute player defend
 */
function executePlayerDefend() {
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
    renderCombatArena();
    setTimeout(() => executeOpponentTurn(), 1000);
}

/**
 * Execute player escape
 */
function executePlayerEscape() {
    const escapeChance = 0.4 + gameState.activeEffects.escape;
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
        renderCombatArena();
        setTimeout(() => endCombat('escape'), 500);
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
        renderCombatArena();
        setTimeout(() => executeOpponentTurn(), 1000);
    }
}

/**
 * Execute opponent's turn
 */
function executeOpponentTurn() {
    if (!combatState.inProgress || combatState.opponent.hp <= 0) return;

    combatState.round++;
    const p = combatState.player;
    const o = combatState.opponent;
    const effects = combatState.effects.opponent;

    effects.defending = false;

    const rand = Math.random();
    let action = 'attack';
    if (rand < 0.1 && getItemCount('回春丹') > 0 && o.hp < o.maxHP * 0.5) {
        action = 'heal';
    }

    if (action === 'heal') {
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
        let baseDamage = o.attack;
        baseDamage = Math.floor(baseDamage * (1 + effects.attackBoost));

        let techniqueMultiplier = 1;
        if (TECHNIQUE_BONUS[o.technique].beats === p.technique) {
            techniqueMultiplier = 1.5;
        } else if (TECHNIQUE_BONUS[o.technique].losesTo === p.technique) {
            techniqueMultiplier = 0.7;
        }
        baseDamage = Math.floor(baseDamage * techniqueMultiplier);

        let finalDamage = baseDamage;
        if (combatState.effects.player.defending) {
            finalDamage = Math.floor(baseDamage * 0.5);
        }
        finalDamage = Math.max(1, finalDamage - Math.floor(p.defense * (1 + combatState.effects.player.defenseBoost)));

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

        // Counter attack system (A5)
        if (combatState.player.counterEnergy >= 50 && !combatState.player.inDefenseStance) {
            const weaponData = combatState.player.weaponData || { name: '空手', star: 1 };
            const starMultiplier = ENHANCE_CONFIG.starMultipliers[weaponData.star] || 1;
            let counterDamage = Math.floor(50 * p.attack * starMultiplier * 0.01);

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

    renderCombatArena();

    if (p.hp <= 0) {
        setTimeout(() => endCombat('lose'), 500);
    } else {
        combatState.turn = 'player';
        renderCombatArena();
    }
}

/**
 * End combat and handle results
 */
function endCombat(result) {
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

        if (Math.random() < realmDropChance) {
            const oldRealm = gameState.realm;
            gameState.realm = Math.max(0, gameState.realm - 1);
            combatState.log.push({
                type: 'system',
                text: `💔 境界跌落！从${CONFIG.realms[oldRealm]}期跌落到${CONFIG.realms[gameState.realm]}期`,
                round: combatState.round
            });
        }

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

    if (typeof callPluginHook === 'function') {
        if (result === 'win') {
            callPluginHook('onBattleWin', { opponent: o.name, reward, day: gameState.days });
        }
        callPluginHook('onBattleEnd', { result, opponent: o.name, reward, penalty, day: gameState.days });
    }

    saveGame();
    renderCombatArena();
}

/**
 * Add combat energy
 */
function addEnergy(amount) {
    combatEnergy += amount;
}

/**
 * Get item count from inventory
 */
function getItemCount(name) {
    const item = gameState.inventory.find(i => i.name === name);
    return item ? item.quantity : 0;
}

/**
 * Select combat action
 */
function selectCombatAction(action) {
    if (action === 'attack') {
        executePlayerAttack();
    } else if (action === 'defend') {
        executePlayerDefend();
    } else if (action === 'escape') {
        executePlayerEscape();
    } else if (action === 'treasure') {
        showTreasureMenu();
    } else if (action === 'pill') {
        showPillMenu();
    } else if (action === 'technique') {
        showTechniqueInfo();
    }
}

export {
    initCombat,
    generateOpponent,
    startCombatChallenge,
    executePlayerAttack,
    executePlayerDefend,
    executePlayerEscape,
    executeOpponentTurn,
    endCombat,
    addEnergy,
    getItemCount,
    selectCombatAction
};