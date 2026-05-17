// Auto-generated module: combat.js
'use strict';

        // ===== calculateSetBonuses =====
        function calculateSetBonuses() {
            const equipped = [];
            if (combatState.player.weaponData) equipped.push(combatState.player.weaponData.name);
            if (combatState.player.armorData) equipped.push(combatState.player.armorData.name);
            if (combatState.player.accessories) {
                combatState.player.accessories.forEach(a => { if (a) equipped.push(a.name); });
            }
            const bonuses = {};
            const skills = [];
            for (const setName in SET_BONUSES) {
                const set = SET_BONUSES[setName];
                const matched = set.pieces.filter(p => equipped.includes(p));
                if (matched.length >= 2) {
                    bonuses[setName] = matched.length; // 2 or 3
                    if (matched.length === set.count && set.skill) skills.push(set.skill);
                }
            }
            combatState.player.setBonuses = bonuses;
            combatState.player.skills = skills;
            return bonuses;
        }

        // ===== recalculatePlayerStats =====
        function recalculatePlayerStats() {
            let attackBonus = 1.0, critBonus = 0, defenseBonus = 1.0, qiRegenBonus = 0;
            for (const setName in combatState.player.setBonuses) {
                const set = SET_BONUSES[setName];
                const count = combatState.player.setBonuses[setName];
                if (set.stats.attackPercent) attackBonus += set.stats.attackPercent * (count === 3 ? 1 : 0.5);
                if (set.stats.critPercent) critBonus += set.stats.critPercent * (count === 3 ? 1 : 0.5);
                if (set.stats.defensePercent) defenseBonus += set.stats.defensePercent * (count === 3 ? 1 : 0.5);
                if (set.stats.qiRegenPercent) qiRegenBonus += set.stats.qiRegenPercent * (count === 3 ? 1 : 0.5);
            }
            combatState.player.attackPercent = attackBonus;
            combatState.player.critBonus = critBonus;
            combatState.player.defensePercent = defenseBonus;
            combatState.player.qiRegenBonus = qiRegenBonus;
        }

        // ===== getCurrentUltimateSkills =====
        function getCurrentUltimateSkills() {
            const weaponData = combatState.player.weaponData || { name:'空手' };
            return ULTIMATE_SKILLS[weaponData.name] || ULTIMATE_SKILLS['空手'] || [];
        }

        // ===== getEnergyBar =====
        function getEnergyBar() {
            const skills = getCurrentUltimateSkills();
            // 找到最低cost的技能作为能量条参考
            const minCost = skills.length > 0 ? Math.min(...skills.map(s => s.cost)) : 50;
            const pct = Math.min(100, (combatEnergy / minCost) * 100);
            const ready = combatEnergy >= minCost;
            return {
                current: combatEnergy,
                cost: minCost,
                pct,
                ready,
                skills
            };
        }

        // ===== executeUltimateSkill =====
        function executeUltimateSkill(skill) {
            const weaponData = combatState.player.weaponData || { name:'空手', star:1 };
            const level = combatState.player.skillLevels ? (combatState.player.skillLevels[skill.id] || 1) : 1;
            const starMultiplier = ENHANCE_CONFIG && ENHANCE_CONFIG.starMultipliers ? (ENHANCE_CONFIG.starMultipliers[weaponData.star] || 1.0) : 1.0;

            if (combatEnergy < skill.cost) return;

            combatEnergy -= skill.cost;
            combatState.round++;

            // 计算基础伤害
            const baseAttack = typeof calculatePlayerAttack === 'function' ? calculatePlayerAttack() : combatState.player.attack;
            const levelMultiplier = 1 + (level - 1) * 0.2;
            let damage = Math.floor(baseAttack * skill.damage * levelMultiplier * starMultiplier);

            // 功法克制
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

            // 应用效果
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
                if (skill.effects.critBonus) {
                    combatState.effects.player.critBoostNext = (combatState.effects.player.critBoostNext || 0) + skill.effects.critBonus * levelMultiplier;
                    logText += ` 💥暴击率提升 ${Math.round(skill.effects.critBonus * levelMultiplier * 100)}%！`;
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
                if (skill.effects.healRate) {
                    const healPerTurn = Math.floor(combatState.player.maxHp * skill.effects.healRate * levelMultiplier);
                    combatState.effects.player.healRate = (combatState.effects.player.healRate || 0) + healPerTurn;
                    logText += ` 💚每回合恢复 ${healPerTurn} HP！`;
                }
                if (skill.effects.dmgReduce) {
                    combatState.effects.player.damageReduction = (combatState.effects.player.damageReduction || 0) + skill.effects.dmgReduce * levelMultiplier;
                    logText += ` 🛡️伤害减免 ${Math.round(skill.effects.dmgReduce * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.counterRate) {
                    combatState.effects.player.counterRate = (combatState.effects.player.counterRate || 0) + skill.effects.counterRate * levelMultiplier;
                    logText += ` ⚡反击率提升 ${Math.round(skill.effects.counterRate * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.speedReduce) {
                    combatState.opponent.speedReduce = (combatState.opponent.speedReduce || 0) + skill.effects.speedReduce * levelMultiplier;
                    logText += ` 🌪️敌人速度降低！`;
                }
                if (skill.effects.armorBreak) {
                    combatState.opponent.armorBroken = true;
                    logText += ` 💥敌人护甲破碎！`;
                }
                if (skill.effects.chain) {
                    if (combatState.opponent.hp > 0) {
                        const chainDmg = Math.floor(finalDamage * skill.effects.chain);
                        combatState.opponent.hp = Math.max(0, combatState.opponent.hp - chainDmg);
                        logText += ` ⛓️雷链传导，额外 ${chainDmg} 伤害！`;
                    }
                }
                if (skill.effects.fireResist) {
                    combatState.effects.player.fireResist = (combatState.effects.player.fireResist || 0) + skill.effects.fireResist;
                    logText += ` 🔥火抗提升！`;
                }
                if (skill.effects.fireDrain) {
                    combatState.effects.player.fireDrain = (combatState.effects.player.fireDrain || 0) + skill.effects.fireDrain;
                    logText += ` 🔥火焰吸收！`;
                }
                if (skill.effects.reflect) {
                    combatState.effects.player.reflect = (combatState.effects.player.reflect || 0) + skill.effects.reflect;
                    logText += ` 🔄伤害反射！`;
                }
                if (skill.effects.maxHpBoost) {
                    combatState.player.maxHP += Math.floor(combatState.player.maxHP * skill.effects.maxHpBoost);
                    combatState.player.hp = Math.min(combatState.player.hp, combatState.player.maxHP);
                    logText += ` ❤️最大HP提升！`;
                }
                if (skill.effects.cleanse) {
                    combatState.effects.player.cleanseStacks = (combatState.effects.player.cleanseStacks || 0) + skill.effects.cleanse;
                    logText += ` ✨净化负面状态！`;
                }
                if (skill.effects.invincible) {
                    combatState.effects.player.invincible = skill.effects.invincible;
                    logText += ` 👼无敌状态！`;
                }
                if (skill.effects.thunder) {
                    combatState.effects.player.thunderBonus = (combatState.effects.player.thunderBonus || 0) + skill.effects.thunder * levelMultiplier;
                    logText += ` ⚡雷法伤害+${Math.round(skill.effects.thunder * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.doubleHit) {
                    combatState.effects.player.doubleHit = (combatState.effects.player.doubleHit || 0) + skill.effects.doubleHit * levelMultiplier;
                    logText += ` ⚔️连击+${Math.round(skill.effects.doubleHit * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.pierce) {
                    combatState.effects.player.pierce = (combatState.effects.player.pierce || 0) + skill.effects.pierce * levelMultiplier;
                    logText += ` 🗡️穿刺+${Math.round(skill.effects.pierce * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.cleave) {
                    combatState.effects.player.cleave = (combatState.effects.player.cleave || 0) + skill.effects.cleave * levelMultiplier;
                    logText += ` 🌀顺劈+${Math.round(skill.effects.cleave * levelMultiplier * 100)}%！`;
                }
                if (skill.effects.freezeAura) {
                    combatState.effects.player.freezeAura = (combatState.effects.player.freezeAura || 0) + skill.effects.freezeAura * levelMultiplier;
                    logText += ` ❄️冰霜光环！`;
                }
                if (skill.effects.burnAura) {
                    combatState.effects.player.burnAura = (combatState.effects.player.burnAura || 0) + skill.effects.burnAura * levelMultiplier;
                    logText += ` 🔥灼烧光环！`;
                }
                if (skill.effects.curse) {
                    combatState.effects.opponent.curse = (combatState.effects.opponent.curse || 0) + skill.effects.curse * levelMultiplier;
                    logText += ` 💀诅咒！`;
                }
            }

            combatState.log.push({ type: 'player-action', actionType: 'ultimate', text: logText, round: combatState.round });
            combatState.turn = 'opponent';
            renderCombatArena();

            if (combatState.opponent.hp <= 0) {
                setTimeout(() => endCombat('win'), 500);
            } else {
                setTimeout(() => executeOpponentTurn(), 1000);
            }
        }

        // ===== generateOpponent =====
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

        // ===== openCombat =====
        function openCombat() {
            renderCombatHome();
            document.getElementById('combatModal').classList.add('active');
        }

        // ===== closeCombat =====
        function closeCombat() {
            document.getElementById('combatModal').classList.remove('active');
            combatState.inProgress = false;
        }

        // ===== renderCombatHome =====
        function renderCombatHome() {
            const wins = gameState.combat?.wins || 0;
            const losses = gameState.combat?.losses || 0;
            const honor = gameState.combat?.honor || 0;
            const fame = gameState.combat?.fame || 0;
            const total = wins + losses;

            let html = `
                <div class="honor-display">
                    <div class="honor-stats">
                        <div class="honor-stat">
                            <div class="honor-stat-value">${honor}</div>
                            <div class="honor-stat-label">荣誉点</div>
                        </div>
                        <div class="honor-stat">
                            <div class="honor-stat-value">${fame}</div>
                            <div class="honor-stat-label">声望</div>
                        </div>
                        <div class="honor-stat">
                            <div class="honor-stat-value">${wins}</div>
                            <div class="honor-stat-label">胜</div>
                        </div>
                        <div class="honor-stat">
                            <div class="honor-stat-value">${losses}</div>
                            <div class="honor-stat-label">负</div>
                        </div>
                    </div>
                </div>
                <div class="challenge-cost">
                    挑战消耗：<span>挑战状 ×1</span> | 当前拥有：<span>${getItemCount('挑战状')}张</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:15px;">
                    <button class="combat-action-btn" onclick="startCombatChallenge('easy')" ${getItemCount('挑战状') < 1 ? 'disabled' : ''}>
                        <div style="font-size:1.2em">🟢 初级挑战</div>
                        <div style="font-size:0.8em;color:#aaa">境界低于你</div>
                    </button>
                    <button class="combat-action-btn" onclick="startCombatChallenge('normal')" ${getItemCount('挑战状') < 1 ? 'disabled' : ''}>
                        <div style="font-size:1.2em">🟡 中级挑战</div>
                        <div style="font-size:0.8em;color:#aaa">境界相当</div>
                    </button>
                    <button class="combat-action-btn" onclick="startCombatChallenge('hard')" ${getItemCount('挑战状') < 1 ? 'disabled' : ''}>
                        <div style="font-size:1.2em">🔴 高级挑战</div>
                        <div style="font-size:0.8em;color:#aaa">境界高于你</div>
                    </button>
                </div>
                <h3 style="color:#ffd700;margin:15px 0 10px;">历史战绩</h3>
                <div class="battle-history" id="battleHistory">
            `;

            const history = gameState.combat?.battleHistory || [];
            if (history.length === 0) {
                html += '<p style="text-align:center;color:#888;padding:20px;">暂无战绩记录</p>';
            } else {
                history.slice(0, 10).forEach(record => {
                    const resultClass = record.result === 'win' ? 'win' : 'lose';
                    const resultText = record.result === 'win' ? '胜' : '负';
                    html += `
                        <div class="battle-record ${resultClass}">
                            <div class="battle-record-info">
                                <span class="battle-record-result ${resultClass}">${resultText}</span>
                                <span class="battle-record-opponent">vs ${record.opponent}</span>
                            </div>
                            <span class="battle-record-reward">${record.result === 'win' ? '+' + record.reward : '-' + record.penalty}灵石</span>
                        </div>
                    `;
                });
            }
            html += '</div><button class="close-btn" onclick="closeCombat()">关闭</button>';
            document.getElementById('combatContent').innerHTML = html;
        }

        // ===== getItemCount =====
        function getItemCount(name) {
            const item = gameState.inventory.find(i => i.name === name);
            return item ? item.quantity : 0;
        }

        // ===== startCombatChallenge =====
        function startCombatChallenge(difficulty) {
            if (getItemCount('挑战状') < 1) {
                alert('挑战状不足！请在商店购买。');
                return;
            }

            // 消耗挑战状
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

        // ===== initCombat =====
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

            // 应用装备星级加成
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
            
            // V7 应用体质战斗效果
            if (gameState.activeEffects.constitution_bonuses) {
                const cb = gameState.activeEffects.constitution_bonuses;
                if (cb.attack) playerAttack = Math.floor(playerAttack * (1 + cb.attack));
                if (cb.defense) playerDefense = Math.floor(playerDefense * (1 + cb.defense));
                if (cb.hpBonus) playerMaxHP = Math.floor(playerMaxHP * (1 + cb.hpBonus));
                if (cb.crit) playerCritRate += cb.crit;
                if (cb.dodge) playerSpeed += Math.floor(playerSpeed * cb.dodge);
            }
            // 应用all_stats加成
            if (gameState.activeEffects.all_stats) {
                playerAttack = Math.floor(playerAttack * (1 + gameState.activeEffects.all_stats));
                playerDefense = Math.floor(playerDefense * (1 + gameState.activeEffects.all_stats));
                playerMaxHP = Math.floor(playerMaxHP * (1 + gameState.activeEffects.all_stats));
            }

            combatEnergy = 0; // 重置必杀技能量

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
                    weaponData: playerWeapon, // 完整对象含星级
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

            // A4 套装共鸣加成
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

        // ===== renderUltimateEnergyBar =====
        function renderUltimateEnergyBar() {
            const info = getEnergyBar();
            const readyClass = info.ready ? 'energy-ready' : '';
            const skillName = info.skills.length > 0 ? info.skills[0].name.substring(0,3) : '绝技';
            return `
                <div class="ultimate-energy-bar" style="margin-top:5px;">
                    <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;">
                        <span style="font-size:0.75em;color:#ffd700;">⚡ ${skillName}</span>
                        <span style="font-size:0.7em;color:#aaa;margin-left:auto;">${info.current}/${info.cost}</span>
                    </div>
                    <div style="background:rgba(0,0,0,0.4);border-radius:4px;height:8px;overflow:hidden;">
                        <div class="energy-fill ${readyClass}" style="width:${info.pct}%;background:${info.ready ? '#ffd700' : '#555'};height:100%;border-radius:4px;transition:width 0.3s;"></div>
                    </div>
                </div>
            `;
        }

        // ===== renderCounterEnergyBar =====
        function renderCounterEnergyBar() {
            const energy = combatState.player.counterEnergy || 0;
            const max = 100;
            const pct = (energy / max) * 100;
            const ready = energy >= 50;
            const color = ready ? '#ffeb3b' : '#888888';
            const glow = ready ? 'box-shadow: 0 0 8px #ffeb3b;' : '';
            return `
                <div style="margin-top:4px;display:flex;align-items:center;gap:6px;">
                    <span style="font-size:11px;color:#aaa;">⚡反击</span>
                    <div style="flex:1;height:8px;background:#333;border-radius:4px;overflow:hidden;">
                        <div style="width:${pct}%;height:100%;background:${color};${glow}transition:width 0.3s,background 0.3s;"></div>
                    </div>
                    <span style="font-size:10px;color:#888;">${energy}/${max}</span>
                </div>
            `;
        }

        // ===== addCombatLog =====
        function addCombatLog(message) {
            if (!gameState.combatLogHistory) gameState.combatLogHistory = [];
            const time = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
            gameState.combatLogHistory.push({time, message});
            if (gameState.combatLogHistory.length > 100) gameState.combatLogHistory.shift();
        }

        // ===== addEventLog =====
        function addEventLog(message, type='normal') {
            const colors = { normal:'#ccc', success:'#00ff88', warning:'#ff9800', danger:'#f44336' };
            const color = colors[type] || colors.normal;
            // 通过addLog系统记录
            addLog(type === 'success' ? 'good' : type === 'danger' ? 'bad' : type, '提示', message);
        }

        // ===== showCombatLogHistory =====
        function showCombatLogHistory() {
            const history = gameState.combatLogHistory || [];
            let html = '<div style="padding:12px;background:#1a1a2e;border-radius:8px;max-height:400px;overflow-y:auto;">';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
            html += '<b style="color:#ffd700;font-size:14px;">⚔️ 战斗日志历史</b>';
            html += `<span style="color:#888;font-size:11px;">${history.length}条记录</span>`;
            html += '</div>';
            if (history.length === 0) {
                html += '<div style="color:#666;text-align:center;padding:20px;">暂无记录</div>';
            } else {
                history.forEach(entry => {
                    html += `<div style="margin-bottom:6px;padding:6px;background:#252540;border-radius:4px;font-size:12px;">`;
                    html += `<span style="color:#666;font-size:10px;">[${entry.time}]</span> `;
                    html += `<span style="color:#ccc;">${entry.message}</span>`;
                    html += '</div>';
                });
            }
            html += '<div style="margin-top:10px;display:flex;gap:8px;">';
            html += `<button onclick="clearCombatLogHistory()" style="flex:1;padding:8px;background:#333;color:#aaa;border:1px solid #555;border-radius:4px;cursor:pointer;">清空</button>`;
            html += `<button onclick="closeModal()" style="flex:1;padding:8px;background:#444;color:#ccc;border:none;border-radius:4px;cursor:pointer;">关闭</button>`;
            html += '</div></div>';
            showModal(html);
        }

        // ===== clearCombatLogHistory =====
        function clearCombatLogHistory() {
            gameState.combatLogHistory = [];
            addEventLog('⚠️ 战斗日志已清空', 'warning');
            closeModal();
        }

        // ===== showEventLogHistory =====
        function showEventLogHistory() {
            const history = gameState.eventLogHistory || [];
            let html = '<div style="padding:12px;background:#1a1a2e;border-radius:8px;max-height:400px;overflow-y:auto;">';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
            html += '<b style="color:#ffd700;font-size:14px;">📜 事件日志历史</b>';
            html += `<span style="color:#888;font-size:11px;">${history.length}条记录</span>`;
            html += '</div>';
            if (history.length === 0) {
                html += '<div style="color:#666;text-align:center;padding:20px;">暂无记录</div>';
            } else {
                history.slice().reverse().forEach(entry => {
                    const colors = { good:'#00ff88', bad:'#f44336', neutral:'#ccc', negative:'#f44336', warning:'#ff9800', welcome:'#ffd700' };
                    const color = colors[entry.type] || '#ccc';
                    html += `<div style="margin-bottom:6px;padding:6px;background:#252540;border-radius:4px;font-size:12px;">`;
                    html += `<span style="color:#666;font-size:10px;">[${entry.time}] 第${entry.day}天</span> `;
                    html += `<span style="color:${color};">${entry.title}</span> `;
                    html += `<span style="color:#aaa;">${entry.text}</span>`;
                    html += '</div>';
                });
            }
            html += '<div style="margin-top:10px;display:flex;gap:8px;">';
            html += `<button onclick="clearEventLogHistory()" style="flex:1;padding:8px;background:#333;color:#aaa;border:1px solid #555;border-radius:4px;cursor:pointer;">清空</button>`;
            html += `<button onclick="closeModal()" style="flex:1;padding:8px;background:#444;color:#ccc;border:none;border-radius:4px;cursor:pointer;">关闭</button>`;
            html += '</div></div>';
            showModal(html);
        }

        // ===== clearEventLogHistory =====
        function clearEventLogHistory() {
            gameState.eventLogHistory = [];
            addLog('warning', '日志清空', '事件日志已清空');
            closeModal();
        }

        // ===== renderCombatArena =====
        function renderCombatArena() {
            const p = combatState.player;
            const o = combatState.opponent;
            const pHpPercent = (p.hp / p.maxHP) * 100;
            const oHpPercent = (o.hp / o.maxHP) * 100;
            const pHpClass = pHpPercent <= 25 ? 'low' : pHpPercent <= 50 ? 'medium' : '';
            const oHpClass = oHpPercent <= 25 ? 'low' : oHpPercent <= 50 ? 'medium' : '';

            let html = `
                <div class="combat-arena">
                    <div class="combatants">
                        <div class="combatant player">
                            <div class="combatant-header">
                                <span class="combatant-avatar">${p.avatar}</span>
                                <div class="combatant-info">
                                    <div class="combatant-name">${p.name}</div>
                                    <div class="combatant-realm">${p.realmName} | ${p.technique}</div>
                                </div>
                            </div>
                            <div class="combatant-hp-bar">
                                <div class="combatant-hp-fill ${pHpClass}" style="width:${pHpPercent}%">
                                    ${p.hp}/${p.maxHP}
                                </div>
                            </div>
                            <div class="combatant-stats">
                                <span class="combatant-stat"><span class="icon">⚔️</span>${p.attack}</span>
                                <span class="combatant-stat"><span class="icon">🛡️</span>${p.defense}</span>
                                <span class="combatant-stat"><span class="icon">💨</span>${p.speed}</span>
                                <span class="combatant-stat"><span class="icon">💥</span>${Math.round(p.critRate * 100)}%</span>
                            </div>
                            <div style="display:flex;gap:8px;align-items:center;">
                                <div style="flex:1;">${renderUltimateEnergyBar()}</div>
                                <div style="flex:1;">${renderCounterEnergyBar()}</div>
                            </div>
                            <div class="combatant-effects">
                                ${p.weapon ? `<span class="combat-effect">${p.weapon}</span>` : ''}
                                ${p.armor ? `<span class="combat-effect">${p.armor}</span>` : ''}
                            </div>
                        </div>
                        <div class="combatant opponent">
                            <div class="combatant-header">
                                <span class="combatant-avatar">${o.avatar}</span>
                                <div class="combatant-info">
                                    <div class="combatant-name">${o.name}</div>
                                    <div class="combatant-realm">${o.realmName} | ${o.technique}</div>
                                </div>
                            </div>
                            <div class="combatant-hp-bar">
                                <div class="combatant-hp-fill ${oHpClass}" style="width:${oHpPercent}%">
                                    ${o.hp}/${o.maxHP}
                                </div>
                            </div>
                            <div class="combatant-stats">
                                <span class="combatant-stat"><span class="icon">⚔️</span>${o.attack}</span>
                                <span class="combatant-stat"><span class="icon">🛡️</span>${o.defense}</span>
                                <span class="combatant-stat"><span class="icon">💨</span>${o.speed}</span>
                                <span class="combatant-stat"><span class="icon">💥</span>${Math.round(o.critRate * 100)}%</span>
                            </div>
                            <div class="combatant-effects">
                                ${o.weapon ? `<span class="combat-effect">${o.weapon}</span>` : ''}
                                ${o.armor ? `<span class="combat-effect">${o.armor}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="combat-log" style="height:120px;overflow-y:auto;padding:8px;background:#111;border-radius:4px;font-size:12px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <span style="color:#ffd700;font-size:11px;">⚔️ 战斗日志</span>
                            <button onclick="showCombatLogHistory()" style="padding:2px 8px;background:#333;color:#888;border:1px solid #444;border-radius:3px;cursor:pointer;font-size:10px;">历史</button>
                        </div>
                        ${combatState.log.slice(-8).map(entry => `
                            <div class="combat-log-entry ${entry.type} ${entry.actionType || ''}">${entry.text}</div>
                        `).join('')}
                    </div>
                </div>
            `;

            if (combatState.turn === 'player' && combatState.inProgress) {
                html += renderPlayerActions();
            } else if (!combatState.inProgress) {
                html += renderCombatResult();
            } else {
                html += '<div style="text-align:center;padding:20px;color:#aaa;">对方行动中...</div>';
            }

            document.getElementById('combatContent').innerHTML = html;
        }

        // ===== renderPlayerActions =====
        function renderPlayerActions() {
            const info = getEnergyBar();
            const canUltimate = info.ready;
            return `
                <div class="combat-actions">
                    <button class="combat-action-btn attack" onclick="selectCombatAction('attack')">
                        ⚔️ 攻击
                    </button>
                    <button class="combat-action-btn defend" onclick="selectCombatAction('defend')">
                        🛡️ 防御
                    </button>
                    <button class="combat-action-btn ultimate" onclick="showUltimateSkillPanel()" ${canUltimate ? '' : 'disabled'}>
                        ⚡ 必杀技 ${canUltimate ? '' : `(${info.current}/${info.cost})`}
                    </button>
                    <button class="combat-action-btn" onclick="selectCombatAction('treasure')">
                        🔮 法宝
                    </button>
                    <button class="combat-action-btn" onclick="selectCombatAction('pill')">
                        💊 丹药
                    </button>
                    <button class="combat-action-btn escape" onclick="selectCombatAction('escape')">
                        🏃 逃跑
                    </button>
                    <button class="combat-action-btn" onclick="selectCombatAction('technique')">
                        📖 功法
                    </button>
                </div>
            `;
        }

        // ===== selectCombatAction =====
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

        // ===== showTreasureMenu =====
        function showTreasureMenu() {
            const availableTreasures = [];
            for (const item of gameState.inventory) {
                if (COMBAT_TREASURES[item.name]) {
                    availableTreasures.push(item);
                }
            }

            let html = '<div class="combat-submenu">';
            if (availableTreasures.length === 0) {
                html += '<p style="grid-column:span 2;text-align:center;color:#888;padding:20px;">背包中没有可用法宝</p>';
            } else {
                availableTreasures.forEach(item => {
                    const treasure = COMBAT_TREASURES[item.name];
                    html += `
                        <button class="combat-submenu-btn" onclick="useCombatTreasure('${item.name}')">
                            ${treasure.icon} ${item.name}
                            <div style="font-size:0.8em;color:#aaa">${treasure.desc}</div>
                        </button>
                    `;
                });
            }
            html += '<button class="combat-submenu-btn" onclick="renderCombatArena()" style="grid-column:span 2;">返回</button></div>';
            document.getElementById('combatContent').innerHTML = document.getElementById('combatContent').innerHTML.replace(renderPlayerActions(), html);
        }

        // ===== useCombatTreasure =====
        function useCombatTreasure(name) {
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
            renderCombatArena();

            setTimeout(() => executeOpponentTurn(), 1000);
        }

        // ===== showPillMenu =====
        function showPillMenu() {
            let html = '<div class="combat-submenu">';
            let hasPills = false;

            for (const [name, pill] of Object.entries(COMBAT_PILLS)) {
                if (getItemCount(name) > 0) {
                    hasPills = true;
                    html += `
                        <button class="combat-submenu-btn" onclick="useCombatPill('${name}')">
                            ${pill.icon} ${name}
                            <div style="font-size:0.8em;color:#aaa">${pill.desc}</div>
                        </button>
                    `;
                }
            }

            if (!hasPills) {
                html += '<p style="grid-column:span 2;text-align:center;color:#888;padding:20px;">背包中没有战斗丹药</p>';
            }
            html += '<button class="combat-submenu-btn" onclick="renderCombatArena()" style="grid-column:span 2;">返回</button></div>';
            document.getElementById('combatContent').innerHTML = document.getElementById('combatContent').innerHTML.replace(renderPlayerActions(), html);
        }

        // ===== useCombatPill =====
        function useCombatPill(name) {
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

            combatState.log.push({ type: 'player-action', text: `你服用了${name}！${effectText}`, round: combatState.round });
            combatState.turn = 'opponent';
            renderCombatArena();

            setTimeout(() => executeOpponentTurn(), 1000);
        }

        // ===== showTechniqueInfo =====
        function showTechniqueInfo() {
            const p = combatState.player;
            const o = combatState.opponent;
            const myTechnique = p.technique;
            const oppTechnique = o.technique;

            let克制关系 = '';
            if (TECHNIQUE_BONUS[myTechnique].beats === oppTechnique) {
                克制关系 = `你的${myTechnique}克制对方的${oppTechnique}，伤害+50%`;
            } else if (TECHNIQUE_BONUS[myTechnique].losesTo === oppTechnique) {
                克制关系 = `对方的${oppTechnique}克制你的${myTechnique}，伤害-30%`;
            } else {
                克制关系 = '功法无克制关系';
            }

            const html = `
                <div class="combat-submenu">
                    <div style="grid-column:span 2;text-align:center;padding:20px;background:rgba(0,0,0,0.3);border-radius:10px;">
                        <p style="color:${p.techniqueColor};font-size:1.2em;margin-bottom:10px;">你的功法：${myTechnique}</p>
                        <p style="color:${o.techniqueColor};font-size:1.2em;margin-bottom:10px;">对方功法：${oppTechnique}</p>
                        <p style="color:#ffd700;margin-top:15px;">${克制关系}</p>
                    </div>
                    <button class="combat-submenu-btn" onclick="renderCombatArena()" style="grid-column:span 2;">返回</button>
                </div>
            `;
            document.getElementById('combatContent').innerHTML = document.getElementById('combatContent').innerHTML.replace(renderPlayerActions(), html);
        }

        // ===== executePlayerAttack =====
        function executePlayerAttack() {
            const p = combatState.player;
            const o = combatState.opponent;
            const effects = combatState.effects.player;

            // 清除防御状态
            effects.defending = false;
            combatState.player.inDefenseStance = false;

            // 计算伤害
            let baseDamage = p.attack;
            baseDamage = Math.floor(baseDamage * (1 + effects.attackBoost));

            // 功法相克
            let techniqueMultiplier = 1;
            if (TECHNIQUE_BONUS[p.technique].beats === o.technique) {
                techniqueMultiplier = 1.5;
                combatState.log.push({ type: 'system', text: `功法克制！伤害+50%`, round: combatState.round });
            } else if (TECHNIQUE_BONUS[p.technique].losesTo === o.technique) {
                techniqueMultiplier = 0.7;
                combatState.log.push({ type: 'system', text: `被功法克制！伤害-30%`, round: combatState.round });
            }
            baseDamage = Math.floor(baseDamage * techniqueMultiplier);

            // A4 套装攻击加成
            if (p.attackPercent) {
                baseDamage = Math.floor(baseDamage * p.attackPercent);
            }

            // 防御减伤
            let finalDamage = baseDamage;
            if (!effects.ignoreDefense) {
                const defReduction = effects.defending ? o.defense * 1.5 : o.defense;
                finalDamage = Math.max(1, baseDamage - defReduction);
            }

            // 暴击判定
            const critRateWithSet = p.critRate + (p.critBonus || 0);
            const isCrit = Math.random() < critRateWithSet;
            if (isCrit) {
                finalDamage = Math.floor(finalDamage * 1.5);
                combatState.log.push({ type: 'player-action', actionType: 'critical', text: `💥暴击！`, round: combatState.round });
            }

            o.hp = Math.max(0, o.hp - finalDamage);

            // A4 套装技能触发
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

            addEnergy(20); // 攻击积蓄能量
            combatState.turn = 'opponent';
            renderCombatArena();

            if (o.hp <= 0) {
                setTimeout(() => endCombat('win'), 500);
            } else {
                setTimeout(() => executeOpponentTurn(), 1000);
            }
        }

        // ===== executePlayerDefend =====
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

        // ===== executePlayerEscape =====
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

        // ===== executeOpponentTurn =====

        // ===== V33 战斗AI学习系统 =====

        // AI工具注册表（类似ruflo hooks模式）
        const COMBAT_AI_TOOLS = {
            // 攻击工具
            heavyAttack: {
                name: '重击',
                weight: 1.0,
                trigger: 'player_defending',
                description: '对防御中的玩家造成更多伤害'
            },
            quickAttack: {
                name: '快攻',
                weight: 1.0,
                trigger: 'player_low_hp',
                description: '玩家血量低时快速结束战斗'
            },
            spellAttack: {
                name: '技法攻击',
                weight: 1.0,
                trigger: 'player_spell_cooldown',
                description: '趁玩家技能冷却时攻击'
            },
            ultimateSkill: {
                name: '大招',
                weight: 0.5,
                trigger: 'energy_full',
                description: '能量充足时释放大招'
            },
            // 防守工具
            heal: {
                name: '使用丹药',
                weight: 1.0,
                trigger: 'hp_below_50',
                description: '血量低于50%时使用丹药'
            },
            defend: {
                name: '防御',
                weight: 1.0,
                trigger: 'player_high_aggression',
                description: '玩家进攻强烈时防御'
            },
            counter: {
                name: '反击',
                weight: 1.0,
                trigger: 'player_attack_pattern',
                description: '识破玩家攻击规律后反击'
            },
            // 破防工具
            techniqueBreak: {
                name: '破功',
                weight: 1.0,
                trigger: 'player_technique_active',
                description: '破除玩家功法加成'
            },
            armorBreak: {
                name: '破甲',
                weight: 1.2,
                trigger: 'player_defense_high',
                description: '针对高防御玩家'
            }
        };

        // ===== recordPlayerAction =====
        function recordPlayerAction(actionType, detail = {}) {
            if (!gameState.combatProfile) return;
            
            const profile = gameState.combatProfile;
            profile.totalBattles++;
            profile.lastCombatDay = gameState.days;
            
            // 记录行动模式
            const existing = profile.playerPatterns.find(p => p.action === actionType);
            if (existing) {
                existing.count++;
                existing.lastUsed = gameState.days;
            } else {
                profile.playerPatterns.push({
                    action: actionType,
                    count: 1,
                    lastUsed: gameState.days,
                    detail: detail
                });
            }
            
            // 记录特殊模式
            if (actionType === 'defend') {
                profile.defenseFrequency = (profile.defenseFrequency * (profile.totalBattles - 1) + 1) / profile.totalBattles;
            }
            if (actionType === 'ultimate') {
                profile.attackTiming.push('ultimate');
            }
            if (actionType === 'attack' && detail.weaponType) {
                profile.preferredDistance = detail.weaponType;
            }
        }

        // ===== analyzePlayerProfile =====
        function analyzePlayerProfile() {
            const profile = gameState.combatProfile;
            if (!profile || profile.totalBattles < 3) return null;
            
            // 计算各模式占比
            const total = profile.playerPatterns.reduce((sum, p) => sum + p.count, 0);
            const patterns = profile.playerPatterns.map(p => ({
                ...p,
                ratio: p.count / total
            }));
            
            // 判断玩家风格
            const defenseRatio = profile.defenseFrequency;
            const ultimateCount = profile.attackTiming.filter(t => t === 'ultimate').length;
            
            let style = 'balanced';
            if (defenseRatio > 0.6) style = 'defensive';
            else if (defenseRatio < 0.2 && ultimateCount > profile.totalBattles * 0.4) style = 'aggressive';
            
            // 检测弱点
            const weaknesses = [];
            const attackPatterns = patterns.filter(p => p.action === 'attack');
            if (attackPatterns.length > 0) {
                // 玩家经常使用某种攻击
                const commonAttack = attackPatterns.reduce((a, b) => a.count > b.count ? a : b);
                if (commonAttack.ratio > 0.4) {
                    weaknesses.push('attack_predictable'); // 攻击可预测
                }
            }
            
            return {
                style: style,
                patterns: patterns,
                weaknesses: weaknesses,
                defenseRatio: defenseRatio,
                spellUsageRate: profile.spellUsageRate
            };
        }

        // ===== getAdjustedToolWeights =====
        function getAdjustedToolWeights() {
            const profile = gameState.combatProfile;
            const analysis = analyzePlayerProfile();
            
            // 复制基础权重
            const weights = {};
            for (const tool in COMBAT_AI_TOOLS) {
                weights[tool] = COMBAT_AI_TOOLS[tool].weight;
            }
            
            if (!analysis) return weights;
            
            // 根据玩家风格调整权重
            if (analysis.defenseRatio > 0.5) {
                // 玩家爱防御 → 提高破防工具权重
                weights.heavyAttack *= 1.4;
                weights.armorBreak *= 1.3;
                weights.techniqueBreak *= 1.2;
            }
            
            if (analysis.weaknesses.includes('attack_predictable')) {
                // 玩家攻击可预测 → 提高反击权重
                weights.counter *= 1.5;
                weights.defend *= 0.7; // 少防御，多等反击机会
            }
            
            // 检查玩家使用大招的时机
            const ultimateCount = profile.attackTiming.filter(t => t === 'ultimate').length;
            if (ultimateCount > profile.totalBattles * 0.3) {
                // 玩家爱用大招 → 提高打断能力
                weights.techniqueBreak *= 1.3;
            }
            
            return weights;
        }

        // ===== selectBestAI tool =====
        function selectBestAITool(opponentHp, playerHp, playerDefending, playerEffects) {
            const weights = getAdjustedToolWeights();
            const tools = Object.keys(weights);
            
            // 计算每个工具的适用度
            const scores = tools.map(tool => {
                let score = weights[tool];
                const toolDef = COMBAT_AI_TOOLS[tool];
                
                // 根据触发条件调整
                if (toolDef.trigger === 'player_defending' && playerDefending) {
                    score *= 2;
                }
                if (toolDef.trigger === 'hp_below_50' && opponentHp < opponent.maxHP * 0.5) {
                    score *= 1.8;
                }
                if (toolDef.trigger === 'player_high_aggression' && playerEffects.attacking) {
                    score *= 1.5;
                }
                if (toolDef.trigger === 'energy_full' && combatEnergy >= 80) {
                    score *= 1.3;
                }
                
                return { tool, score, name: toolDef.name };
            });
            
            // 按分数排序
            scores.sort((a, b) => b.score - a.score);
            
            return scores[0];
        }

        // ===== executeOpponentTurn with AI Learning =====
        const originalExecuteOpponentTurn = executeOpponentTurn;
        function executeOpponentTurn() {
            if (!combatState.inProgress || combatState.opponent.hp <= 0) return;
            
            combatState.round++;
            const p = combatState.player;
            const o = combatState.opponent;
            const effects = combatState.effects.opponent;
            
            // 显示AI思考状态
            showAIThinking();
            
            // 清除防御状态
            effects.defending = false;
            
            // V33: AI工具选择（基于玩家画像）
            const aiDecision = selectBestAITool(o.hp, p.hp, p.defending, p.effects || {});
            
            // 记录玩家行动（事后学习）
            if (combatState.turn === 'player') {
                // 玩家刚行动过，记录该行动
                const lastAction = combatState.log[combatState.log.length - 1];
                if (lastAction && lastAction.type === 'player-action') {
                    if (lastAction.actionType === 'attack') {
                        recordPlayerAction('attack', { damage: lastAction.damage });
                    } else if (lastAction.actionType === 'defend') {
                        recordPlayerAction('defend');
                    } else if (lastAction.actionType === 'ultimate') {
                        recordPlayerAction('ultimate');
                    }
                }
            }
            
            // 根据AI决策选择行动
            let action = 'attack';
            let actionDetail = '';
            
            if (aiDecision && aiDecision.tool === 'heal') {
                action = 'heal';
                actionDetail = '使用丹药';
            } else if (aiDecision && aiDecision.tool === 'defend') {
                action = 'defend';
                actionDetail = '防御';
            } else if (aiDecision && aiDecision.tool === 'counter') {
                action = 'counter';
                actionDetail = '反击';
            }
            
            // 如果hp低且有回春丹，优先治疗
            if (o.hp < o.maxHP * 0.4 && getItemCount('回春丹') > 0 && Math.random() < 0.6) {
                action = 'heal';
                actionDetail = '紧急治疗';
            }
            
            if (action === 'heal') {
                // 使用回春丹
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
                    text: `${o.name}使用了回春丹，恢复${heal}生命 (AI分析:${aiDecision?.name || '攻击'})`,
                    round: combatState.round
                });
            } else if (action === 'defend') {
                effects.defending = true;
                combatState.log.push({
                    type: 'opponent-action',
                    actionType: 'defend',
                    text: `${o.name}进入防御姿态 (AI识破玩家进攻模式)`,
                    round: combatState.round
                });
            } else if (action === 'counter') {
                // 反击 - 先记录，等玩家攻击后触发
                combatState.log.push({
                    type: 'opponent-action',
                    actionType: 'counter_setup',
                    text: `${o.name}识破玩家攻击规律，准备反击`,
                    round: combatState.round
                });
                // 直接攻击，但标记为反击
                let baseDamage = o.attack;
                baseDamage = Math.floor(baseDamage * 1.3); // 反击加成
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
                finalDamage = Math.max(1, finalDamage - Math.floor(p.defense * 0.5));
                
                p.hp = Math.max(0, p.hp - finalDamage);
                combatState.effects.player.defending = false;
                
                const techniqueColor = TECHNIQUE_COLORS[o.technique];
                combatState.log.push({
                    type: 'opponent-action',
                    actionType: 'damage',
                    text: `${o.name}施展<span style="color:${techniqueColor}">${o.technique}</span>，造成 <span style="color:#ff6666">${finalDamage}</span> 点伤害（反击）`,
                    round: combatState.round
                });
            } else {
                // 普通攻击
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
            }
            
            // 检查玩家是否死亡
            if (p.hp <= 0) {
                setTimeout(() => endCombat('lose'), 500);
            } else {
                combatState.turn = 'player';
                renderCombatArena();
            }
        }

        // ===== showAIThinking =====
        function showAIThinking() {
            const analysis = analyzePlayerProfile();
            if (!analysis) return;
            
            // 在对手血条附近显示AI状态
            const aiStatusEl = document.getElementById('aiThinkingStatus');
            if (aiStatusEl) {
                let statusText = '';
                if (analysis.style === 'defensive') {
                    statusText = '📊 分析中: 玩家偏防守，启用破防策略...';
                } else if (analysis.style === 'aggressive') {
                    statusText = '📊 分析中: 玩家进攻猛烈，等待反击时机...';
                } else {
                    statusText = '📊 分析中: 玩家风格均衡，保持平衡策略...';
                }
                aiStatusEl.textContent = statusText;
                aiStatusEl.style.display = 'block';
                
                // 3秒后隐藏
                setTimeout(() => {
                    if (aiStatusEl) aiStatusEl.style.display = 'none';
                }, 3000);
            }
        }

        // ===== learnFromCombat =====
        function learnFromCombat(result) {
            const profile = gameState.combatProfile;
            if (!profile) return;
            
            if (result === 'win') {
                profile.winsAgainst++;
            }
            
            // 战后分析
            const analysis = analyzePlayerProfile();
            if (analysis) {
                // 显示学习报告
                setTimeout(() => {
                    showLearningReport(analysis);
                }, 1000);
            }
        }

        // ===== showLearningReport =====
        function showLearningReport(analysis) {
            const report = `
                <div style="padding:20px;text-align:center">
                    <div style="font-size:24px;color:#2196f3;margin-bottom:15px">🧠 AI对战报告</div>
                    <div style="background:rgba(33,150,243,0.1);padding:15px;border-radius:8px;text-align:left;margin-bottom:15px">
                        <div style="color:#ffd700">📈 观察到的玩家风格:</div>
                        <div style="color:#fff;margin-top:8px">战斗风格: <span style="color:${
                            analysis.style === 'defensive' ? '#4caf50' : 
                            analysis.style === 'aggressive' ? '#f44336' : '#2196f3'
                        }">${analysis.style === 'defensive' ? '防守型' : analysis.style === 'aggressive' ? '进攻型' : '平衡型'}</span></div>
                        <div style="color:#fff">防御频率: ${(analysis.defenseRatio * 100).toFixed(0)}%</div>
                        <div style="color:#fff">弱点检测: ${analysis.weaknesses.length > 0 ? '攻击可预测' : '无明显弱点'}</div>
                    </div>
                    <div style="color:#aaa;font-size:12px">AI已根据您的风格调整策略</div>
                    <button onclick="closeModal('modalNormal')" style="margin-top:15px;padding:8px 20px;background:#444;color:#fff;border:none;border-radius:6px;cursor:pointer">确定</button>
                </div>
            `;
            
            const modal = document.getElementById('modalNormal');
            if (modal) {
                modal.innerHTML = report;
                modal.classList.remove('hidden');
            }
        }

        // ===== endCombat =====
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

                // 境界跌落
                if (Math.random() < realmDropChance) {
                    const oldRealm = gameState.realm;
                    gameState.realm = Math.max(0, gameState.realm - 1);
                    combatState.log.push({
                        type: 'system',
                        text: `💔 境界跌落！从${CONFIG.realms[oldRealm]}期跌落到${CONFIG.realms[gameState.realm]}期`,
                        round: combatState.round
                    });
                }

                // 重伤debuff：3场内属性-20%
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

            // 记录战斗历史
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

            // V33: 触发AI学习
            learnFromCombat(result);

            saveGame();
            renderCombatArena();
        }

        // ===== renderCombatResult =====
        function renderCombatResult() {
            const result = combatState.opponent.hp <= 0 ? 'win' : (combatState.player.hp <= 0 ? 'lose' : 'escape');
            const o = combatState.opponent;
            let reward = 0;
            let penalty = 0;

            if (result === 'win') {
                reward = Math.floor(o.maxHP * 0.5);
            } else if (result === 'lose') {
                penalty = Math.floor(gameState.spiritStones / 0.7 * 0.3) || Math.floor(gameState.spiritStones * 0.3);
            }

            const resultTitle = result === 'win' ? '🎉 胜利！' : result === 'lose' ? '💔 战败' : '🏃 逃跑';
            const resultClass = result === 'win' ? 'win' : result === 'lose' ? 'lose' : 'escape';

            return `
                <div class="combat-result ${resultClass}">
                    <h2>${resultTitle}</h2>
                    <div class="combat-result-stats">
                        <div class="combat-result-stat">
                            <div class="value">${combatState.round}</div>
                            <div class="label">回合数</div>
                        </div>
                        <div class="combat-result-stat">
                            <div class="value" style="color:${result === 'win' ? '#4caf50' : '#ff6666'}">${result === 'win' ? '+' + reward : '-' + penalty}</div>
                            <div class="label">灵石</div>
                        </div>
                    </div>
                    <button class="btn btn-combat" onclick="renderCombatHome()" style="margin-top:20px;">返回斗法界面</button>
                    <button class="close-btn" onclick="closeCombat()">关闭</button>
                </div>
            `;
        }

