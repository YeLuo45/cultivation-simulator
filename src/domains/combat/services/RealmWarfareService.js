/**
 * RealmWarfareService.js - 万界战争系统
 * V234 Direction V: 万界战争系统 - generic-agent自我进化 + nanobot mesh协调
 * 
 * 提供6个MCP工具:
 * - war.declare - 宣战
 * - war.army.recruit - 招募军队
 * - war.strategy.set - 设置战略
 * - war.execute - 执行战斗
 * - war.result.claim - 领取战利品
 * - war.alliance.support - 请求联盟支援
 */

import { createImmortalSect } from '../../sect/services/ImmortalSectService.js';

// 万界战争配置
export const REALM_WARFARE_CONFIG = {
    declareCost: 100000,              // 宣战消耗灵石
    preparePhaseDuration: 3600000,    // 准备期1小时 (ms)
    warPhaseDuration: 7200000,        // 战争进行期2小时 (ms)
    executePhaseDuration: 1800000,   // 执行期30分钟 (ms)
    maxArmySize: 1000,               // 最大军队规模
    maxSoldiersPerType: 400,         // 每种兵种最大数量
    victoryRewardMultiplier: 1.5,     // 战胜奖励倍率
    defeatPenaltyMultiplier: 0.5,     // 战败惩罚倍率
    allianceSupportCost: 50000,      // 请求联盟支援消耗
    armyTypes: ['infantry', 'cavalry', 'archer', 'mage', 'guardian'],  // 兵种类型
    strategyTypes: ['aggressive', 'defensive', 'balanced', 'guerrilla', 'siege'],  // 战略类型
    unitStats: {
        infantry: { attack: 10, defense: 15, speed: 5, cost: 100 },
        cavalry: { attack: 20, defense: 10, speed: 25, cost: 300 },
        archer: { attack: 15, defense: 5, speed: 10, cost: 200 },
        mage: { attack: 30, defense: 5, speed: 8, cost: 500 },
        guardian: { attack: 5, defense: 30, speed: 3, cost: 400 }
    }
};

// 兵种相克表 (攻方优势系数)
export const UNIT_COUNTER_TABLE = {
    infantry: { beats: 'cavalry', weakTo: 'archer', multiplier: 1.5 },
    cavalry: { beats: 'archer', weakTo: 'infantry', multiplier: 1.3 },
    archer: { beats: 'mage', weakTo: 'cavalry', multiplier: 1.4 },
    mage: { beats: 'guardian', weakTo: 'infantry', multiplier: 1.2 },
    guardian: { beats: 'archer', weakTo: 'mage', multiplier: 1.3 }
};

// 战争状态枚举
export const WAR_STATES = {
    NONE: 'none',
    PREPARING: 'preparing',     // 准备期
    EXECUTING: 'executing',     // 执行期
    ENDED: 'ended'             // 已结束
};

/**
 * 创建战争记录
 * @param {string} attackerId - 攻击方宗门ID
 * @param {string} defenderId - 防守方宗门ID
 * @param {string} attackerName - 攻击方宗门名称
 * @param {string} defenderName - 防守方宗门名称
 */
export function createWarRecord(attackerId, defenderId, attackerName, defenderName) {
    return {
        uid: 'war_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        attacker: {
            sectId: attackerId,
            name: attackerName,
            troops: { infantry: 0, cavalry: 0, archer: 0, mage: 0, guardian: 0 },
            strategy: null,
            morale: 100,
            casualties: { infantry: 0, cavalry: 0, archer: 0, mage: 0, guardian: 0 }
        },
        defender: {
            sectId: defenderId,
            name: defenderName,
            troops: { infantry: 0, cavalry: 0, archer: 0, mage: 0, guardian: 0 },
            strategy: null,
            morale: 100,
            casualties: { infantry: 0, cavalry: 0, archer: 0, mage: 0, guardian: 0 }
        },
        state: WAR_STATES.PREPARING,
        declareTime: Date.now(),
        prepareEndTime: Date.now() + REALM_WARFARE_CONFIG.preparePhaseDuration,
        executeStartTime: null,
        executeEndTime: null,
        winner: null,
        rewards: {
            spiritStones: 0,
            pills: 0,
            techniques: 0,
            territory: null
        },
        battleLog: []
    };
}

/**
 * 创建军队单位
 * @param {string} type - 兵种类型
 * @param {number} count - 数量
 */
export function createArmyUnit(type, count) {
    const stats = REALM_WARFARE_CONFIG.unitStats[type];
    if (!stats) return null;
    
    return {
        type: type,
        count: count,
        attack: stats.attack * count,
        defense: stats.defense * count,
        speed: stats.speed,
        cost: stats.cost * count
    };
}

/**
 * 创建RealmWarfareService
 * @param {Object} gameState - 游戏状态
 * @returns {Object} 万界战争服务实例
 */
export function createRealmWarfareService(gameState) {
    return new RealmWarfareService(gameState);
}

/**
 * 万界战争服务类
 */
class RealmWarfareService {
    constructor(gameState) {
        this.gameState = gameState;
        this.wars = new Map();          // 战争记录集合
        this.playerWarId = null;        // 玩家当前参与的战争ID
    }

    /**
     * 初始化万界战争系统
     */
    init(gameState) {
        if (!gameState.realmWarfare) {
            gameState.realmWarfare = {
                wars: [],                    // 所有战争记录
                playerWarId: null,            // 玩家当前参与的战争ID
                totalWarsDeclared: 0,        // 总宣战次数
                totalVictories: 0,           // 总胜利次数
                totalDefeats: 0,             // 总失败次数
                claimedRewards: []           // 已领取的奖励记录
            };
        }
        this.wars = gameState.realmWarfare;
        return gameState;
    }

    /**
     * 检查玩家是否已飞升
     */
    isPlayerAscended() {
        return this.gameState.ascension?.ascended === true;
    }

    /**
     * 获取玩家当前仙界宗门
     */
    getPlayerSect() {
        if (!this.wars.playerSectId) return null;
        return this.gameState.immortalSects?.sects?.find(
            s => s.uid === this.gameState.immortalSects.playerSectId
        );
    }

    /**
     * 获取玩家所在仙界宗门
     */
    getPlayerImmortalSect() {
        if (!this.gameState.immortalSects?.playerSectId) return null;
        return this.gameState.immortalSects.sects.find(
            s => s.uid === this.gameState.immortalSects.playerSectId
        );
    }

    /**
     * 获取玩家当前参与的战争
     */
    getPlayerWar() {
        if (!this.wars.playerWarId) return null;
        return this.wars.wars.find(w => w.uid === this.wars.playerWarId);
    }

    /**
     * 计算军队总战力
     * @param {Object} troops - 军队编制 {infantry, cavalry, archer, mage, guardian}
     */
    calculateArmyPower(troops) {
        let totalPower = 0;
        for (const [type, count] of Object.entries(troops)) {
            const stats = REALM_WARFARE_CONFIG.unitStats[type];
            if (stats) {
                totalPower += stats.attack * count + stats.defense * count * 0.5;
            }
        }
        return Math.floor(totalPower);
    }

    /**
     * 获取战略对战斗力的影响
     * @param {string} strategy - 战略类型
     * @param {boolean} isAttacker - 是否为攻方
     */
    getStrategyBonus(strategy, isAttacker) {
        const bonuses = {
            aggressive: { attackBonus: 1.3, defenseBonus: 0.8, speedBonus: 1.2 },
            defensive: { attackBonus: 0.8, defenseBonus: 1.4, speedBonus: 0.9 },
            balanced: { attackBonus: 1.0, defenseBonus: 1.0, speedBonus: 1.0 },
            guerrilla: { attackBonus: 1.1, defenseBonus: 0.7, speedBonus: 1.5 },
            siege: { attackBonus: 1.5, defenseBonus: 0.6, speedBonus: 0.5 }
        };
        
        const bonus = bonuses[strategy] || bonuses.balanced;
        return bonus;
    }

    /**
     * 计算兵种相克效果
     * @param {string} attackerType - 攻击方兵种
     * @param {string} defenderType - 防守方兵种
     * @param {number} baseDamage - 基础伤害
     */
    calculateCounterBonus(attackerType, defenderType, baseDamage) {
        const counter = UNIT_COUNTER_TABLE[attackerType];
        if (counter && counter.beats === defenderType) {
            return baseDamage * counter.multiplier;
        }
        if (counter && counter.weakTo === defenderType) {
            return baseDamage / counter.multiplier;
        }
        return baseDamage;
    }

    // ========== MCP 工具实现 ==========

    /**
     * war.declare - 宣战
     * @param {Object} params - { targetSectId: string }
     */
    mcpWarDeclare(params = {}) {
        const { targetSectId } = params;

        // 检查飞升状态
        if (!this.isPlayerAscended()) {
            return {
                success: false,
                error: '尚未飞升，无法参与万界战争'
            };
        }

        // 检查是否已有宗门
        const playerSect = this.getPlayerImmortalSect();
        if (!playerSect) {
            return {
                success: false,
                error: '你未加入任何仙界宗门'
            };
        }

        // 检查是否已有参与的战争
        if (this.wars.playerWarId) {
            const existingWar = this.getPlayerWar();
            if (existingWar && existingWar.state !== WAR_STATES.ENDED) {
                return {
                    success: false,
                    error: '你已参与一场战争，请等待当前战争结束'
                };
            }
        }

        // 验证目标宗门
        if (!targetSectId) {
            return {
                success: false,
                error: '请指定目标宗门ID'
            };
        }

        const targetSect = this.gameState.immortalSects?.sects?.find(
            s => s.uid === targetSectId
        );
        if (!targetSect) {
            return {
                success: false,
                error: '目标仙界宗门不存在'
            };
        }

        // 不能对自己宣战
        if (targetSectId === playerSect.uid) {
            return {
                success: false,
                error: '不能对自己的宗门宣战'
            };
        }

        // 检查敌对关系
        if (playerSect.enemies?.includes(targetSectId)) {
            return {
                success: false,
                error: '该宗门已在敌对名单中，请先解除敌对关系'
            };
        }

        // 检查灵石
        const cost = REALM_WARFARE_CONFIG.declareCost;
        if ((this.gameState.spiritStones || 0) < cost) {
            return {
                success: false,
                error: `灵石不足，需要 ${cost} 灵石来宣战`
            };
        }

        // 检查宗门资源是否足够发动战争
        const sectResources = playerSect.resources?.spiritStones || 0;
        if (sectResources < cost * 0.5) {
            return {
                success: false,
                error: '宗门资源不足，无法支撑战争'
            };
        }

        // 扣除灵石
        this.gameState.spiritStones -= cost;

        // 创建战争记录
        const war = createWarRecord(
            playerSect.uid, targetSectId,
            playerSect.name, targetSect.name
        );

        // 设置防守方初始兵力（基于宗门规模）
        const defenderScale = targetSect.sectLevel * 0.3 + 0.5;
        war.defender.troops = {
            infantry: Math.floor(100 * defenderScale),
            cavalry: Math.floor(50 * defenderScale),
            archer: Math.floor(30 * defenderScale),
            mage: Math.floor(20 * defenderScale),
            guardian: Math.floor(25 * defenderScale)
        };

        // 添加到战争列表
        this.wars.wars.push(war);
        this.wars.playerWarId = war.uid;
        this.wars.totalWarsDeclared++;

        // 设置敌对关系
        if (!playerSect.enemies) playerSect.enemies = [];
        playerSect.enemies.push(targetSectId);
        if (!targetSect.enemies) targetSect.enemies = [];
        targetSect.enemies.push(playerSect.uid);

        // 添加战争日志
        war.battleLog.push({
            timestamp: Date.now(),
            type: 'system',
            message: `${playerSect.name} 向 ${targetSect.name} 宣战！`
        });

        return {
            success: true,
            message: `向「${targetSect.name}」宣战成功！`,
            war: {
                uid: war.uid,
                attacker: war.attacker.name,
                defender: war.defender.name,
                state: war.state,
                prepareEndTime: war.prepareEndTime,
                costDeducted: cost
            }
        };
    }

    /**
     * war.army.recruit - 招募军队
     * @param {Object} params - { unitType: string, count: number }
     */
    mcpArmyRecruit(params = {}) {
        const { unitType, count } = params;

        // 检查参与战争
        const war = this.getPlayerWar();
        if (!war) {
            return {
                success: false,
                error: '你当前没有参与任何战争'
            };
        }

        // 检查是否在准备期
        if (war.state !== WAR_STATES.PREPARING) {
            return {
                success: false,
                error: `战争已进入${war.state}阶段，无法招募军队`
            };
        }

        // 验证兵种类型
        if (!REALM_WARFARE_CONFIG.armyTypes.includes(unitType)) {
            return {
                success: false,
                error: `无效的兵种类型，可选: ${REALM_WARFARE_CONFIG.armyTypes.join(', ')}`
            };
        }

        // 验证数量
        if (!count || count <= 0) {
            return {
                success: false,
                error: '招募数量必须大于0'
            };
        }

        const maxPerType = REALM_WARFARE_CONFIG.maxSoldiersPerType;
        if (count > maxPerType) {
            return {
                success: false,
                error: `单种兵种最多招募 ${maxPerType} 名`
            };
        }

        // 获取玩家宗门
        const playerSect = this.getPlayerImmortalSect();
        if (!playerSect) {
            return {
                success: false,
                error: '你未加入任何仙界宗门'
            };
        }

        // 检查军队规模上限
        const currentTotal = Object.values(war.attacker.troops).reduce((a, b) => a + b, 0);
        if (currentTotal + count > REALM_WARFARE_CONFIG.maxArmySize) {
            return {
                success: false,
                error: `军队总规模不能超过 ${REALM_WARFARE_CONFIG.maxArmySize} 人，当前: ${currentTotal}`
            };
        }

        // 计算招募费用
        const unitStats = REALM_WARFARE_CONFIG.unitStats[unitType];
        const totalCost = unitStats.cost * count;

        // 检查玩家灵石是否足够
        if ((this.gameState.spiritStones || 0) < totalCost) {
            return {
                success: false,
                error: `灵石不足，需要 ${totalCost} 灵石招募 ${count} 名${unitType}`
            };
        }

        // 扣除灵石
        this.gameState.spiritStones -= totalCost;

        // 招募军队
        war.attacker.troops[unitType] = (war.attacker.troops[unitType] || 0) + count;

        // 添加战争日志
        war.battleLog.push({
            timestamp: Date.now(),
            type: 'recruit',
            message: `招募 ${count} 名${unitType}，消耗 ${totalCost} 灵石`
        });

        const totalArmy = Object.values(war.attacker.troops).reduce((a, b) => a + b, 0);
        const armyPower = this.calculateArmyPower(war.attacker.troops);

        return {
            success: true,
            message: `成功招募 ${count} 名${unitType}！`,
            recruitment: {
                unitType: unitType,
                count: count,
                cost: totalCost,
                totalTroops: war.attacker.troops
            },
            armyStatus: {
                totalSize: totalArmy,
                power: armyPower,
                troops: war.attacker.troops
            }
        };
    }

    /**
     * war.strategy.set - 设置战略
     * @param {Object} params - { strategyType: string }
     */
    mcpStrategySet(params = {}) {
        const { strategyType } = params;

        // 检查参与战争
        const war = this.getPlayerWar();
        if (!war) {
            return {
                success: false,
                error: '你当前没有参与任何战争'
            };
        }

        // 检查是否在准备期
        if (war.state !== WAR_STATES.PREPARING) {
            return {
                success: false,
                error: `战争已进入${war.state}阶段，无法设置战略`
            };
        }

        // 验证战略类型
        if (!REALM_WARFARE_CONFIG.strategyTypes.includes(strategyType)) {
            return {
                success: false,
                error: `无效的战略类型，可选: ${REALM_WARFARE_CONFIG.strategyTypes.join(', ')}`
            };
        }

        // 获取玩家宗门
        const playerSect = this.getPlayerImmortalSect();
        if (!playerSect) {
            return {
                success: false,
                error: '你未加入任何仙界宗门'
            };
        }

        // 判断是攻方还是守方
        const isAttacker = war.attacker.sectId === playerSect.uid;
        const targetSide = isAttacker ? war.attacker : war.defender;

        // 设置战略
        targetSide.strategy = strategyType;

        // 添加战争日志
        war.battleLog.push({
            timestamp: Date.now(),
            type: 'strategy',
            message: `${targetSide.name} 设置战略: ${strategyType}`
        });

        // 计算战略加成
        const bonus = this.getStrategyBonus(strategyType, isAttacker);

        return {
            success: true,
            message: `战略已设置为「${strategyType}」`,
            strategy: {
                type: strategyType,
                side: isAttacker ? 'attacker' : 'defender',
                bonuses: {
                    attackBonus: bonus.attackBonus,
                    defenseBonus: bonus.defenseBonus,
                    speedBonus: bonus.speedBonus
                }
            }
        };
    }

    /**
     * war.execute - 执行战斗
     * @param {Object} params - { warId?: string }
     */
    mcpWarExecute(params = {}) {
        const { warId } = params;

        // 获取战争
        let war;
        if (warId) {
            war = this.wars.wars.find(w => w.uid === warId);
        } else {
            war = this.getPlayerWar();
        }

        if (!war) {
            return {
                success: false,
                error: '未找到战争记录'
            };
        }

        // 获取玩家宗门
        const playerSect = this.getPlayerImmortalSect();
        if (!playerSect) {
            return {
                success: false,
                error: '你未加入任何仙界宗门'
            };
        }

        // 检查玩家是否是战争参与方
        const isParticipant = war.attacker.sectId === playerSect.uid || 
                             war.defender.sectId === playerSect.uid;
        if (!isParticipant) {
            return {
                success: false,
                error: '你不是这场战争的参与方'
            };
        }

        // 检查是否已结束
        if (war.state === WAR_STATES.ENDED) {
            return {
                success: false,
                error: '战争已结束'
            };
        }

        // 检查是否在执行期
        if (war.state === WAR_STATES.EXECUTING) {
            return {
                success: false,
                error: '战斗正在执行中'
            };
        }

        // 检查准备期是否结束
        if (war.state === WAR_STATES.PREPARING && Date.now() < war.prepareEndTime) {
            const remaining = Math.ceil((war.prepareEndTime - Date.now()) / 60000);
            return {
                success: false,
                error: `准备期还未结束，还需 ${remaining} 分钟`
            };
        }

        // 进入执行阶段
        war.state = WAR_STATES.EXECUTING;
        war.executeStartTime = Date.now();
        war.executeEndTime = Date.now() + REALM_WARFARE_CONFIG.executePhaseDuration;

        // 计算双方战力
        const attackerPower = this.calculateArmyPower(war.attacker.troops);
        const defenderPower = this.calculateArmyPower(war.defender.troops);

        // 应用战略加成
        let attackerBonus = 1.0;
        let defenderBonus = 1.0;
        if (war.attacker.strategy) {
            attackerBonus = this.getStrategyBonus(war.attacker.strategy, true);
        }
        if (war.defender.strategy) {
            defenderBonus = this.getStrategyBonus(war.defender.strategy, false);
        }

        const effectiveAttackerPower = Math.floor(attackerPower * attackerBonus);
        const effectiveDefenderPower = Math.floor(defenderPower * defenderBonus);

        // 计算伤亡
        const totalPower = effectiveAttackerPower + effectiveDefenderPower;
        const attackerRatio = effectiveAttackerPower / totalPower;
        const defenderRatio = effectiveDefenderPower / totalPower;

        // 计算损失（基于战力比例）
        const baseLossRate = 0.2;
        let attackerLosses = {};
        let defenderLosses = {};

        for (const type of REALM_WARFARE_CONFIG.armyTypes) {
            const attackerCount = war.attacker.troops[type] || 0;
            const defenderCount = war.defender.troops[type] || 0;

            // 攻击方损失
            attackerLosses[type] = Math.floor(attackerCount * baseLossRate * defenderRatio);
            war.attacker.casualties[type] = attackerLosses[type];
            war.attacker.troops[type] = Math.max(0, attackerCount - attackerLosses[type]);

            // 防守方损失
            defenderLosses[type] = Math.floor(defenderCount * baseLossRate * attackerRatio);
            war.defender.casualties[type] = defenderLosses[type];
            war.defender.troops[type] = Math.max(0, defenderCount - defenderLosses[type]);
        }

        // 更新士气
        war.attacker.morale = Math.max(20, 100 - (attackerRatio * 100));
        war.defender.morale = Math.max(20, 100 - (defenderRatio * 100));

        // 添加战斗日志
        war.battleLog.push({
            timestamp: Date.now(),
            type: 'battle',
            message: `战斗开始！攻方战力: ${effectiveAttackerPower}，守方战力: ${effectiveDefenderPower}`
        });

        war.battleLog.push({
            timestamp: Date.now(),
            type: 'casualties',
            message: `攻击方损失: ${Object.values(attackerLosses).reduce((a, b) => a + b, 0)} 人`
        });

        war.battleLog.push({
            timestamp: Date.now(),
            type: 'casualties',
            message: `防守方损失: ${Object.values(defenderLosses).reduce((a, b) => a + b, 0)} 人`
        });

        // 确定胜负
        const isAttacker = war.attacker.sectId === playerSect.uid;
        let winner;
        let reward;

        if (effectiveAttackerPower > effectiveDefenderPower * 1.2) {
            winner = 'attacker';
            war.winner = war.attacker.sectId;
            war.attacker.morale = 100;
            war.defender.morale = 30;

            // 计算奖励
            reward = this.calculateRewards(war, 'attacker');
            war.rewards = reward;

            // 增加胜利次数
            if (isAttacker) {
                this.wars.totalVictories++;
            } else {
                this.wars.totalDefeats++;
            }
        } else if (effectiveDefenderPower > effectiveAttackerPower * 1.2) {
            winner = 'defender';
            war.winner = war.defender.sectId;
            war.defender.morale = 100;
            war.attacker.morale = 30;

            // 计算奖励（守方奖励较少）
            reward = this.calculateRewards(war, 'defender');
            war.rewards = reward;

            if (isAttacker) {
                this.wars.totalDefeats++;
            } else {
                this.wars.totalVictories++;
            }
        } else {
            // 势均力敌，战争继续
            winner = 'draw';
            war.battleLog.push({
                timestamp: Date.now(),
                type: 'system',
                message: '双方势均力敌，战斗陷入僵局！'
            });
        }

        return {
            success: true,
            message: winner === 'draw' ? '战斗陷入僵局！' : `战斗结束，${winner === 'attacker' ? war.attacker.name : war.defender.name}获胜！`,
            battleResult: {
                warId: war.uid,
                winner: winner,
                attackerPower: effectiveAttackerPower,
                defenderPower: effectiveDefenderPower,
                attackerLosses: attackerLosses,
                defenderLosses: defenderLosses,
                attackerMorale: war.attacker.morale,
                defenderMorale: war.defender.morale,
                remainingTroops: {
                    attacker: war.attacker.troops,
                    defender: war.defender.troops
                },
                rewards: war.rewards
            }
        };
    }

    /**
     * 计算战争奖励
     * @param {Object} war - 战争记录
     * @param {string} winnerSide - 获胜方 'attacker' or 'defender'
     */
    calculateRewards(war, winnerSide) {
        const loserSide = winnerSide === 'attacker' ? 'defender' : 'attacker';
        const loserTroops = war[loserSide].troops;
        const loserPower = this.calculateArmyPower(loserTroops);

        const baseReward = Math.floor(loserPower * 0.5);
        const multiplier = REALM_WARFARE_CONFIG.victoryRewardMultiplier;

        return {
            spiritStones: Math.floor(baseReward * multiplier * 0.6),
            pills: Math.floor(baseReward * multiplier * 0.2),
            techniques: Math.floor(baseReward * multiplier * 0.1),
            territory: null
        };
    }

    /**
     * war.result.claim - 领取战利品
     * @param {Object} params - { warId?: string }
     */
    mcpResultClaim(params = {}) {
        const { warId } = params;

        // 获取战争
        let war;
        if (warId) {
            war = this.wars.wars.find(w => w.uid === warId);
        } else {
            war = this.getPlayerWar();
        }

        if (!war) {
            return {
                success: false,
                error: '未找到战争记录'
            };
        }

        // 检查战争是否已结束
        if (war.state !== WAR_STATES.ENDED) {
            return {
                success: false,
                error: '战争尚未结束，无法领取战利品'
            };
        }

        // 获取玩家宗门
        const playerSect = this.getPlayerImmortalSect();
        if (!playerSect) {
            return {
                success: false,
                error: '你未加入任何仙界宗门'
            };
        }

        // 检查玩家是否是战争参与方
        const isParticipant = war.attacker.sectId === playerSect.uid || 
                             war.defender.sectId === playerSect.uid;
        if (!isParticipant) {
            return {
                success: false,
                error: '你不是这场战争的参与方'
            };
        }

        // 判断输赢
        const isWinner = war.winner === playerSect.uid;

        if (!isWinner) {
            return {
                success: false,
                error: '你输掉了这场战争，无法领取战利品'
            };
        }

        // 检查是否已领取
        if (this.wars.claimedRewards?.includes(war.uid)) {
            return {
                success: false,
                error: '你已经领取过这场战争的战利品'
            };
        }

        // 检查是否有奖励
        if (!war.rewards || (war.rewards.spiritStones === 0 && war.rewards.pills === 0)) {
            return {
                success: false,
                error: '这场战争没有可领取的战利品'
            };
        }

        // 领取奖励
        const claimed = {
            spiritStones: war.rewards.spiritStones || 0,
            pills: war.rewards.pills || 0,
            techniques: war.rewards.techniques || 0
        };

        // 添加到玩家宗门资源
        playerSect.resources.spiritStones = (playerSect.resources.spiritStones || 0) + claimed.spiritStones;
        playerSect.resources.pills = (playerSect.resources.pills || 0) + claimed.pills;
        playerSect.resources.techniques = (playerSect.resources.techniques || 0) + claimed.techniques;

        // 添加灵石到玩家个人
        this.gameState.spiritStones = (this.gameState.spiritStones || 0) + Math.floor(claimed.spiritStones * 0.3);

        // 记录已领取
        if (!this.wars.claimedRewards) this.wars.claimedRewards = [];
        this.wars.claimedRewards.push(war.uid);

        // 添加战争日志
        war.battleLog.push({
            timestamp: Date.now(),
            type: 'claim',
            message: `${playerSect.name} 领取战利品: 灵石${claimed.spiritStones}，丹药${claimed.pills}，功法${claimed.techniques}`
        });

        return {
            success: true,
            message: '成功领取战利品！',
            claimed: {
                warId: war.uid,
                spiritStones: claimed.spiritStones,
                pills: claimed.pills,
                techniques: claimed.techniques,
                personalBonus: Math.floor(claimed.spiritStones * 0.3)
            },
            sectResources: playerSect.resources
        };
    }

    /**
     * war.alliance.support - 请求联盟支援
     * @param {Object} params - { warId?: string }
     */
    mcpAllianceSupport(params = {}) {
        const { warId } = params;

        // 检查飞升状态
        if (!this.isPlayerAscended()) {
            return {
                success: false,
                error: '尚未飞升，无法请求联盟支援'
            };
        }

        // 获取玩家宗门
        const playerSect = this.getPlayerImmortalSect();
        if (!playerSect) {
            return {
                success: false,
                error: '你未加入任何仙界宗门'
            };
        }

        // 检查联盟
        if (!playerSect.alliances || playerSect.alliances.length === 0) {
            return {
                success: false,
                error: '你的宗门没有结盟，无法请求支援'
            };
        }

        // 获取战争
        let war;
        if (warId) {
            war = this.wars.wars.find(w => w.uid === warId);
        } else {
            war = this.getPlayerWar();
        }

        if (!war) {
            return {
                success: false,
                error: '未找到战争记录'
            };
        }

        // 检查是否是战争参与方
        const isParticipant = war.attacker.sectId === playerSect.uid || 
                             war.defender.sectId === playerSect.uid;
        if (!isParticipant) {
            return {
                success: false,
                error: '你不是这场战争的参与方'
            };
        }

        // 检查是否在准备期
        if (war.state !== WAR_STATES.PREPARING) {
            return {
                success: false,
                error: `战争已进入${war.state}阶段，无法请求支援`
            };
        }

        // 检查灵石
        const cost = REALM_WARFARE_CONFIG.allianceSupportCost;
        if ((this.gameState.spiritStones || 0) < cost) {
            return {
                success: false,
                error: `灵石不足，需要 ${cost} 灵石请求联盟支援`
            };
        }

        // 查找参战的盟军
        const alliedSects = [];
        for (const allianceId of playerSect.alliances) {
            const alliedSect = this.gameState.immortalSects?.sects?.find(s => s.uid === allianceId);
            if (alliedSect) {
                // 检查盟军是否也参与了这场战争
                const isInWar = war.attacker.sectId === allianceId || war.defender.sectId === allianceId;
                if (isInWar) {
                    // 判断是否是同一阵营
                    const playerSide = war.attacker.sectId === playerSect.uid ? 'attacker' : 'defender';
                    const allySide = war.attacker.sectId === allianceId ? 'attacker' : 'defender';
                    if (playerSide === allySide) {
                        alliedSects.push({
                            uid: alliedSect.uid,
                            name: alliedSect.name,
                            troops: { infantry: 0, cavalry: 0, archer: 0, mage: 0, guardian: 0 },
                            supportPower: 0
                        });
                    }
                }
            }
        }

        if (alliedSects.length === 0) {
            return {
                success: false,
                error: '没有盟军参与这场战争'
            };
        }

        // 扣除灵石
        this.gameState.spiritStones -= cost;

        // 计算支援兵力
        const isAttacker = war.attacker.sectId === playerSect.uid;
        const targetSide = isAttacker ? war.attacker : war.defender;

        for (const allied of alliedSects) {
            // 盟军贡献20%兵力
            const supportScale = 0.2;
            const baseTroops = {
                infantry: 50,
                cavalry: 30,
                archer: 20,
                mage: 10,
                guardian: 15
            };

            for (const type of REALM_WARFARE_CONFIG.armyTypes) {
                const contributed = Math.floor(baseTroops[type] * supportScale);
                allied.troops[type] = contributed;
                allied.supportPower += this.calculateArmyPower({ [type]: contributed });
                targetSide.troops[type] = (targetSide.troops[type] || 0) + contributed;
            }
        }

        // 添加战争日志
        war.battleLog.push({
            timestamp: Date.now(),
            type: 'alliance',
            message: `${playerSect.name} 请求联盟支援，获得 ${alliedSects.length} 个盟军支援`
        });

        return {
            success: true,
            message: `成功请求 ${alliedSects.length} 个盟军支援！`,
            support: {
                cost: cost,
                alliedSects: alliedSects.map(a => ({
                    name: a.name,
                    troops: a.troops,
                    supportPower: a.supportPower
                })),
                totalSupportPower: alliedSects.reduce((sum, a) => sum + a.supportPower, 0)
            }
        };
    }

    /**
     * 获取战争列表
     * @param {Object} params - { state?: string, limit?: number }
     */
    mcpWarList(params = {}) {
        const { state, limit = 50 } = params;

        let wars = this.wars.wars;

        if (state) {
            wars = wars.filter(w => w.state === state);
        }

        // 按时间排序（最新的在前）
        wars = wars.sort((a, b) => b.declareTime - a.declareTime).slice(0, limit);

        return {
            success: true,
            wars: wars.map(w => ({
                uid: w.uid,
                attacker: w.attacker.name,
                defender: w.defender.name,
                state: w.state,
                declareTime: w.declareTime,
                winner: w.winner,
                attackerPower: this.calculateArmyPower(w.attacker.troops),
                defenderPower: this.calculateArmyPower(w.defender.troops)
            })),
            totalCount: this.wars.wars.length
        };
    }

    /**
     * 获取战争详情
     * @param {Object} params - { warId: string }
     */
    mcpWarDetail(params = {}) {
        const { warId } = params;

        const war = this.wars.wars.find(w => w.uid === warId);
        if (!war) {
            return {
                success: false,
                error: '未找到战争记录'
            };
        }

        return {
            success: true,
            war: {
                uid: war.uid,
                attacker: {
                    sectId: war.attacker.sectId,
                    name: war.attacker.name,
                    troops: war.attacker.troops,
                    strategy: war.attacker.strategy,
                    morale: war.attacker.morale,
                    casualties: war.attacker.casualties,
                    power: this.calculateArmyPower(war.attacker.troops)
                },
                defender: {
                    sectId: war.defender.sectId,
                    name: war.defender.name,
                    troops: war.defender.troops,
                    strategy: war.defender.strategy,
                    morale: war.defender.morale,
                    casualties: war.defender.casualties,
                    power: this.calculateArmyPower(war.defender.troops)
                },
                state: war.state,
                declareTime: war.declareTime,
                prepareEndTime: war.prepareEndTime,
                executeStartTime: war.executeStartTime,
                executeEndTime: war.executeEndTime,
                winner: war.winner,
                rewards: war.rewards,
                battleLog: war.battleLog
            }
        };
    }
}

// 导出单例方法（兼容旧API）
let serviceInstance = null;

export function getRealmWarfareService(gameState) {
    if (!serviceInstance) {
        serviceInstance = createRealmWarfareService(gameState);
    }
    return serviceInstance;
}