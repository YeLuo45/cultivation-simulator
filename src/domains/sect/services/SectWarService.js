/**
 * SectWarService.js - 宗门大战系统
 * V247: 仙盟系统+宗门大战
 * 
 * 提供宗门宣战/应战机制、战报生成、战斗奖励系统
 */

import { createSect, SECT_CONFIG } from '../entities/Sect.js';

// 宗门大战配置常量
export const SECT_WAR_CONFIG = {
    // 宣战消耗灵石
    declareWarCost: 5000,
    // 应战消耗灵石
    acceptWarCost: 2000,
    // 战斗持续时间(回合)
    battleDuration: 10,
    // 备战时间(回合)
    preparationTime: 3,
    // 最低参战成员数
    minBattleMembers: 3,
    // 冷却时间(天)
    cooldownDays: 7
};

// 宗门大战结果配置
export const SECT_WAR_OUTCOMES = {
    victory: {
        rewards: {
            spiritStones: 1000,
            contribution: 500,
            territory: 1
        },
        reputationChange: 20,
        title: '大胜'
    },
    defeat: {
        rewards: {
            spiritStones: 200,
            contribution: 100
        },
        reputationChange: -10,
        title: '战败'
    },
    draw: {
        rewards: {
            spiritStones: 500,
            contribution: 250
        },
        reputationChange: 0,
        title: '平局'
    }
};

// 宗门等级对应的战斗力加成
export const SECT_LEVEL_COMBAT_BONUS = {
    1: { attack: 1.0, defense: 1.0, income: 1.0 },
    2: { attack: 1.1, defense: 1.1, income: 1.1 },
    3: { attack: 1.2, defense: 1.2, income: 1.2 },
    4: { attack: 1.3, defense: 1.3, income: 1.3 },
    5: { attack: 1.5, defense: 1.5, income: 1.5 },
    6: { attack: 1.7, defense: 1.7, income: 1.7 },
    7: { attack: 1.9, defense: 1.9, income: 1.9 },
    8: { attack: 2.1, defense: 2.1, income: 2.1 },
    9: { attack: 2.3, defense: 2.3, income: 2.3 },
    10: { attack: 2.5, defense: 2.5, income: 2.5 }
};

// 仙盟等级配置 (1-10级)
export const IMMORTAL_SECT_LEVELS = {
    1: { memberLimit: 10, skillBonus: 1.05 },
    2: { memberLimit: 15, skillBonus: 1.08 },
    3: { memberLimit: 20, skillBonus: 1.10 },
    4: { memberLimit: 25, skillBonus: 1.12 },
    5: { memberLimit: 50, skillBonus: 1.25 },
    6: { memberLimit: 70, skillBonus: 1.30 },
    7: { memberLimit: 100, skillBonus: 1.35 },
    8: { memberLimit: 150, skillBonus: 1.40 },
    9: { memberLimit: 180, skillBonus: 1.45 },
    10: { memberLimit: 200, skillBonus: 1.50 }
};

// 仙盟职位配置
export const IMMORTAL_SECT_POSITIONS = ['盟主', '副盟主', '长老', '精英', '弟子'];

// 仙盟技能配置
export const IMMORTAL_SECT_SKILLS = {
    cultivation: { name: '修炼加成', bonus: 0.10, cost: 1000 },
    spiritStones: { name: '灵石加成', bonus: 0.15, cost: 1200 },
    combat: { name: '战力加成', bonus: 0.20, cost: 1500 }
};

// 仙盟成员贡献度记录
export function createSectMemberContribution(memberUid, contribution = 0, rank = '弟子') {
    return {
        uid: memberUid,
        contribution: contribution,
        rank: rank,
        totalContributed: 0,
        weeklyContributed: 0,
        joinDate: Date.now(),
        lastActiveDay: 0
    };
}

/**
 * 创建宗门大战服务
 * @param {Object} gameState - 游戏状态
 * @returns {SectWarService} 宗门大战服务实例
 */
export function createSectWarService(gameState) {
    return new SectWarService(gameState);
}

/**
 * 仙盟服务类
 */
class SectWarService {
    constructor(gameState) {
        this.gameState = gameState;
        this.warRecords = new Map(); // warId -> war record
        this.playerWarSects = new Map(); // playerId -> sectId
    }

    /**
     * 初始化宗门大战系统
     */
    init(gameState) {
        if (!gameState.sectWars) {
            gameState.sectWars = {
                wars: [],              // 所有大战记录
                pendingWars: [],       // 待应战的大战
                warHistory: [],         // 战斗历史
                territories: [],        // 宗门地盘
                cooldowns: {}           // 冷却记录 {sectId: lastWarDay}
            };
        }
        if (!gameState.immortalSect) {
            gameState.immortalSect = {
                name: null,
                level: 1,
                members: [],
                skills: {
                    cultivation: 0,
                    spiritStones: 0,
                    combat: 0
                },
                contributions: {},
                foundedAt: null,
                leaderId: null
            };
        }
        return gameState;
    }

    /**
     * 获取玩家所在宗门
     */
    getPlayerSect() {
        return this.gameState.sect || null;
    }

    /**
     * 获取玩家仙盟
     */
    getPlayerImmortalSect() {
        return this.gameState.immortalSect.name ? this.gameState.immortalSect : null;
    }

    // ========== 仙盟系统 ==========

    /**
     * 创建仙盟 (玩家建立自己的仙界宗门)
     * @param {string} name - 仙盟名称
     * @returns {Object} 创建结果
     */
    createImmortalSect(name) {
        const player = this.gameState.player;
        const realm = this.gameState.realm;

        // 检查境界要求 (元婴期 realm >= 4)
        if (realm < 4) {
            return {
                success: false,
                error: '需要元婴期以上才能创建仙盟'
            };
        }

        // 检查名称
        if (!name || name.trim().length < 2) {
            return {
                success: false,
                error: '仙盟名称至少需要2个字符'
            };
        }

        if (name.length > 20) {
            return {
                success: false,
                error: '仙盟名称不能超过20个字符'
            };
        }

        // 检查是否已有仙盟
        if (this.gameState.immortalSect.name) {
            return {
                success: false,
                error: '你已创建或加入了仙盟，无法再次创建'
            };
        }

        // 检查灵石
        const createCost = SECT_CONFIG.createCost || 10000;
        if ((this.gameState.spiritStones || 0) < createCost) {
            return {
                success: false,
                error: `灵石不足，需要 ${createCost} 灵石创建仙盟`
            };
        }

        // 扣除灵石
        this.gameState.spiritStones -= createCost;

        // 创建仙盟
        const immortalSect = this.gameState.immortalSect;
        immortalSect.name = name;
        immortalSect.level = 1;
        immortalSect.leaderId = player?.uid || 'player';
        immortalSect.foundedAt = Date.now();
        immortalSect.members = [{
            uid: player?.uid || 'player',
            role: '盟主',
            joinedAt: Date.now(),
            contribution: 0,
            isElite: false
        }];
        immortalSect.skills = {
            cultivation: 0,
            spiritStones: 0,
            combat: 0
        };
        immortalSect.contributions = {};
        immortalSect.contributions[player?.uid || 'player'] = {
            contribution: 0,
            rank: '盟主',
            totalContributed: 0
        };

        return {
            success: true,
            message: `仙盟「${name}」创建成功！`,
            sect: this.getImmortalSectInfo()
        };
    }

    /**
     * 加入仙盟
     * @param {string} sectId - 仙盟ID
     * @returns {Object} 加入结果
     */
    joinImmortalSect(sectId) {
        const player = this.gameState.player;
        const immortalSect = this.gameState.immortalSect;

        // 检查是否已有仙盟
        if (immortalSect.name) {
            return {
                success: false,
                error: '你已创建或加入了仙盟'
            };
        }

        // 查找目标仙盟 (这里简化处理，实际应该从仙盟列表中查找)
        if (!sectId || sectId.length < 3) {
            return {
                success: false,
                error: '无效的仙盟ID'
            };
        }

        // 检查灵石
        const joinCost = 5000;
        if ((this.gameState.spiritStones || 0) < joinCost) {
            return {
                success: false,
                error: `灵石不足，需要 ${joinCost} 灵石加入仙盟`
            };
        }

        // 扣除灵石
        this.gameState.spiritStones -= joinCost;

        // 加入仙盟 (简化版，sectId作为仙盟名称)
        const targetSectName = sectId;
        immortalSect.name = targetSectName;
        immortalSect.level = 1;
        immortalSect.leaderId = 'other_leader';
        immortalSect.foundedAt = Date.now();
        immortalSect.members = [{
            uid: player?.uid || 'player',
            role: '弟子',
            joinedAt: Date.now(),
            contribution: 0,
            isElite: false
        }];
        immortalSect.skills = { cultivation: 0, spiritStones: 0, combat: 0 };
        immortalSect.contributions = {};
        immortalSect.contributions[player?.uid || 'player'] = {
            contribution: 0,
            rank: '弟子',
            totalContributed: 0
        };

        return {
            success: true,
            message: `成功加入仙盟「${targetSectName}」！`,
            sect: this.getImmortalSectInfo()
        };
    }

    /**
     * 离开仙盟
     * @returns {Object} 离开结果
     */
    leaveImmortalSect() {
        const player = this.gameState.player;
        const immortalSect = this.gameState.immortalSect;

        if (!immortalSect.name) {
            return {
                success: false,
                error: '你未加入任何仙盟'
            };
        }

        const playerUid = player?.uid || 'player';
        const member = immortalSect.members.find(m => m.uid === playerUid);

        if (member && member.role === '盟主') {
            return {
                success: false,
                error: '盟主无法离开仙盟，请先转让盟主之位或解散仙盟'
            };
        }

        // 移除成员
        immortalSect.members = immortalSect.members.filter(m => m.uid !== playerUid);
        delete immortalSect.contributions[playerUid];

        return {
            success: true,
            message: '已离开仙盟'
        };
    }

    /**
     * 任命仙盟成员职位
     * @param {string} targetUid - 目标成员UID
     * @param {string} newRank - 新职位
     * @returns {Object} 任命结果
     */
    assignImmortalSectRank(targetUid, newRank) {
        const immortalSect = this.gameState.immortalSect;
        const player = this.gameState.player;

        if (!immortalSect.name) {
            return { success: false, error: '你未加入任何仙盟' };
        }

        if (immortalSect.leaderId !== (player?.uid || 'player')) {
            return { success: false, error: '只有盟主才能任命职位' };
        }

        if (!IMMORTAL_SECT_POSITIONS.includes(newRank)) {
            return { success: false, error: '无效的职位' };
        }

        const targetMember = immortalSect.members.find(m => m.uid === targetUid);
        if (!targetMember) {
            return { success: false, error: '未找到该成员' };
        }

        targetMember.role = newRank;
        if (immortalSect.contributions[targetUid]) {
            immortalSect.contributions[targetUid].rank = newRank;
        }

        return {
            success: true,
            message: `已将 ${targetMember.role} 任命为 ${newRank}`,
            member: targetMember
        };
    }

    /**
     * 获取仙盟信息
     * @returns {Object} 仙盟信息
     */
    getImmortalSectInfo() {
        const immortalSect = this.gameState.immortalSect;
        if (!immortalSect.name) return null;

        const levelConfig = IMMORTAL_SECT_LEVELS[immortalSect.level] || IMMORTAL_SECT_LEVELS[1];
        const totalContribution = Object.values(immortalSect.contributions || {})
            .reduce((sum, c) => sum + (c.totalContributed || 0), 0);

        return {
            name: immortalSect.name,
            level: immortalSect.level,
            leaderId: immortalSect.leaderId,
            memberCount: immortalSect.members.length,
            memberLimit: levelConfig.memberLimit,
            skillBonus: levelConfig.skillBonus,
            skills: immortalSect.skills,
            members: immortalSect.members,
            totalContribution: totalContribution,
            foundedAt: immortalSect.foundedAt
        };
    }

    /**
     * 升级仙盟
     * @returns {Object} 升级结果
     */
    upgradeImmortalSect() {
        const immortalSect = this.gameState.immortalSect;

        if (!immortalSect.name) {
            return { success: false, error: '你未加入任何仙盟' };
        }

        const currentLevel = immortalSect.level;
        if (currentLevel >= 10) {
            return { success: false, error: '仙盟已达到最高等级' };
        }

        const nextLevel = currentLevel + 1;
        const upgradeCosts = { 2: 5000, 3: 10000, 4: 20000, 5: 40000, 6: 60000, 7: 80000, 8: 100000, 9: 150000, 10: 200000 };
        const cost = upgradeCosts[nextLevel] || 50000;

        if ((this.gameState.spiritStones || 0) < cost) {
            return { success: false, error: `灵石不足，需要 ${cost} 灵石升级` };
        }

        this.gameState.spiritStones -= cost;
        immortalSect.level = nextLevel;

        return {
            success: true,
            message: `仙盟升级为 ${nextLevel} 级！`,
            newLevel: nextLevel
        };
    }

    /**
     * 学习仙盟技能
     * @param {string} skillType - 技能类型 (cultivation/spiritStones/combat)
     * @returns {Object} 学习结果
     */
    learnImmortalSectSkill(skillType) {
        const immortalSect = this.gameState.immortalSect;

        if (!immortalSect.name) {
            return { success: false, error: '你未加入任何仙盟' };
        }

        const skill = IMMORTAL_SECT_SKILLS[skillType];
        if (!skill) {
            return { success: false, error: '无效的技能类型' };
        }

        const currentLevel = immortalSect.skills[skillType] || 0;
        if (currentLevel >= 5) {
            return { success: false, error: '该技能已达到最高等级' };
        }

        const cost = skill.cost * (currentLevel + 1);
        if ((this.gameState.spiritStones || 0) < cost) {
            return { success: false, error: `灵石不足，需要 ${cost} 灵石学习技能` };
        }

        this.gameState.spiritStones -= cost;
        immortalSect.skills[skillType] = currentLevel + 1;

        return {
            success: true,
            message: `${skill.name}升级为 ${currentLevel + 1} 级！`,
            skillLevel: currentLevel + 1
        };
    }

    /**
     * 贡献灵石到仙盟
     * @param {number} amount - 贡献数量
     * @returns {Object} 贡献结果
     */
    contributeToImmortalSect(amount) {
        const immortalSect = this.gameState.immortalSect;
        const player = this.gameState.player;

        if (!immortalSect.name) {
            return { success: false, error: '你未加入任何仙盟' };
        }

        if (!amount || amount <= 0) {
            return { success: false, error: '贡献数量必须大于0' };
        }

        if ((this.gameState.spiritStones || 0) < amount) {
            return { success: false, error: '灵石不足' };
        }

        this.gameState.spiritStones -= amount;

        const playerUid = player?.uid || 'player';
        if (!immortalSect.contributions[playerUid]) {
            immortalSect.contributions[playerUid] = { contribution: 0, rank: '弟子', totalContributed: 0 };
        }
        immortalSect.contributions[playerUid].contribution += amount;
        immortalSect.contributions[playerUid].totalContributed += amount;

        const member = immortalSect.members.find(m => m.uid === playerUid);
        if (member) {
            member.contribution += amount;
        }

        return {
            success: true,
            message: `贡献 ${amount} 灵石成功！`,
            totalContribution: immortalSect.contributions[playerUid].totalContributed
        };
    }

    /**
     * 获取仙盟成员列表
     * @returns {Array} 成员列表
     */
    getImmortalSectMembers() {
        const immortalSect = this.gameState.immortalSect;
        if (!immortalSect.name) return [];

        return immortalSect.members.map(m => ({
            uid: m.uid,
            role: m.role,
            contribution: m.contribution,
            isElite: m.isElite,
            joinedAt: m.joinedAt,
            totalContributed: immortalSect.contributions[m.uid]?.totalContributed || 0
        }));
    }

    // ========== 宗门大战系统 ==========

    /**
     * 宣战
     * @param {string} targetSectId - 目标宗门ID
     * @returns {Object} 宣战结果
     */
    declareWar(targetSectId) {
        const playerSect = this.getPlayerSect();

        if (!playerSect || !playerSect.name) {
            return {
                success: false,
                error: '你还没有创建宗门，无法宣战'
            };
        }

        if (!targetSectId) {
            return {
                success: false,
                error: '请指定目标宗门'
            };
        }

        // 检查冷却
        const sectWars = this.gameState.sectWars;
        const lastWarDay = sectWars.cooldowns[playerSect.name] || 0;
        if (this.gameState.days - lastWarDay < SECT_WAR_CONFIG.cooldownDays) {
            return {
                success: false,
                error: `宣战冷却中，还需等待 ${SECT_WAR_CONFIG.cooldownDays - (this.gameState.days - lastWarDay)} 天`
            };
        }

        // 检查灵石
        if ((this.gameState.spiritStones || 0) < SECT_WAR_CONFIG.declareWarCost) {
            return {
                success: false,
                error: `灵石不足，需要 ${SECT_WAR_CONFIG.declareWarCost} 灵石宣战`
            };
        }

        // 检查成员数量
        const activeDisciples = (playerSect.disciples || []).filter(d => d.status !== 'dispatched');
        if (activeDisciples.length < SECT_WAR_CONFIG.minBattleMembers) {
            return {
                success: false,
                error: `至少需要 ${SECT_WAR_CONFIG.minBattleMembers} 名弟子才能宣战`
            };
        }

        // 扣除灵石
        this.gameState.spiritStones -= SECT_WAR_CONFIG.declareWarCost;

        // 创建大战记录
        const warId = 'war_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const warRecord = {
            warId: warId,
            attacker: {
                sectId: playerSect.name,
                sectName: playerSect.name,
                sectLevel: playerSect.level,
                disciples: activeDisciples.map(d => ({
                    uid: d.uid,
                    name: d.name,
                    realm: d.realm,
                    attack: d.attack || 5,
                    defense: d.defense || 3,
                    maxHp: d.maxHp || 30
                })),
                power: this.calculateSectPower(playerSect)
            },
            defender: {
                sectId: targetSectId,
                sectName: '敌方宗门',
                sectLevel: 1,
                disciples: [],
                power: 0
            },
            status: 'pending', // pending -> accepted -> preparing -> active -> finished
            declaredAt: Date.now(),
            preparationEndDay: this.gameState.days + SECT_WAR_CONFIG.preparationTime,
            battleEndDay: 0,
            rounds: [],
            result: null,
            rewards: null
        };

        sectWars.wars.push(warRecord);
        sectWars.pendingWars.push(warId);

        return {
            success: true,
            message: `向 ${targetSectId} 宣战成功！`,
            warId: warId,
            preparationDays: SECT_WAR_CONFIG.preparationTime
        };
    }

    /**
     * 应战
     * @param {string} warId - 大战ID
     * @returns {Object} 应战结果
     */
    acceptWar(warId) {
        const playerSect = this.getPlayerSect();
        const sectWars = this.gameState.sectWars;

        if (!playerSect || !playerSect.name) {
            return { success: false, error: '你还没有创建宗门，无法应战' };
        }

        const warRecord = sectWars.wars.find(w => w.warId === warId);
        if (!warRecord) {
            return { success: false, error: '大战记录不存在' };
        }

        if (warRecord.status !== 'pending') {
            return { success: false, error: '大战状态已变更，无法应战' };
        }

        // 检查灵石
        if ((this.gameState.spiritStones || 0) < SECT_WAR_CONFIG.acceptWarCost) {
            return {
                success: false,
                error: `灵石不足，需要 ${SECT_WAR_CONFIG.acceptWarCost} 灵石应战`
            };
        }

        // 检查成员数量
        const activeDisciples = (playerSect.disciples || []).filter(d => d.status !== 'dispatched');
        if (activeDisciples.length < SECT_WAR_CONFIG.minBattleMembers) {
            return {
                success: false,
                error: `至少需要 ${SECT_WAR_CONFIG.minBattleMembers} 名弟子才能应战`
            };
        }

        // 扣除灵石
        this.gameState.spiritStones -= SECT_WAR_CONFIG.acceptWarCost;

        // 更新大战记录
        warRecord.defender.sectId = playerSect.name;
        warRecord.defender.sectName = playerSect.name;
        warRecord.defender.sectLevel = playerSect.level;
        warRecord.defender.disciples = activeDisciples.map(d => ({
            uid: d.uid,
            name: d.name,
            realm: d.realm,
            attack: d.attack || 5,
            defense: d.defense || 3,
            maxHp: d.maxHp || 30
        }));
        warRecord.defender.power = this.calculateSectPower(playerSect);
        warRecord.status = 'preparing';

        // 移除待应战记录
        sectWars.pendingWars = sectWars.pendingWars.filter(id => id !== warId);

        return {
            success: true,
            message: '应战成功！备战开始！',
            warId: warId,
            battleStartDay: warRecord.preparationEndDay
        };
    }

    /**
     * 拒绝应战
     * @param {string} warId - 大战ID
     * @returns {Object} 拒绝结果
     */
    rejectWar(warId) {
        const sectWars = this.gameState.sectWars;
        const warRecord = sectWars.wars.find(w => w.warId === warId);

        if (!warRecord) {
            return { success: false, error: '大战记录不存在' };
        }

        if (warRecord.status !== 'pending') {
            return { success: false, error: '大战状态已变更' };
        }

        // 移除待应战记录
        sectWars.pendingWars = sectWars.pendingWars.filter(id => id !== warId);
        warRecord.status = 'rejected';
        warRecord.result = 'defender_rejected';

        return {
            success: true,
            message: '已拒绝应战'
        };
    }

    /**
     * 计算宗门战斗力
     * @param {Object} sect - 宗门对象
     * @returns {number} 战斗力
     */
    calculateSectPower(sect) {
        if (!sect || !sect.disciples) return 0;

        const levelBonus = SECT_LEVEL_COMBAT_BONUS[sect.level] || SECT_LEVEL_COMBAT_BONUS[1];
        let totalPower = 0;

        sect.disciples.forEach(d => {
            const realmPower = (d.realm || 0) * 10;
            const attackPower = d.attack || 5;
            const defensePower = d.defense || 3;
            const hpPower = (d.maxHp || 30) * 0.5;
            totalPower += realmPower + attackPower + defensePower + hpPower;
        });

        return Math.floor(totalPower * levelBonus.attack);
    }

    /**
     * 开始战斗 (每日自动调用)
     * @param {string} warId - 大战ID
     * @returns {Object} 战斗结果
     */
    startBattle(warId) {
        const sectWars = this.gameState.sectWars;
        const warRecord = sectWars.wars.find(w => w.warId === warId);

        if (!warRecord) {
            return { success: false, error: '大战记录不存在' };
        }

        if (warRecord.status !== 'preparing') {
            return { success: false, error: '大战不在备战状态' };
        }

        if (this.gameState.days < warRecord.preparationEndDay) {
            return {
                success: false,
                error: `备战尚未结束，还需等待 ${warRecord.preparationEndDay - this.gameState.days} 天`
            };
        }

        // 开始战斗
        warRecord.status = 'active';
        warRecord.battleEndDay = this.gameState.days + SECT_WAR_CONFIG.battleDuration;

        // 生成第一轮战斗
        const initialRound = this.generateBattleRound(warRecord, 0);
        warRecord.rounds.push(initialRound);

        return {
            success: true,
            message: '战斗开始！',
            warId: warId,
            currentRound: 0,
            attackerStatus: initialRound.attacker,
            defenderStatus: initialRound.defender
        };
    }

    /**
     * 生成战斗回合
     * @param {Object} warRecord - 大战记录
     * @param {number} roundNum - 回合数
     * @returns {Object} 回合结果
     */
    generateBattleRound(warRecord, roundNum) {
        const attacker = warRecord.attacker;
        const defender = warRecord.defender;

        const attackerPower = attacker.power * (1 + roundNum * 0.1);
        const defenderPower = defender.power * (1 + roundNum * 0.1);

        // 计算伤害
        const attackerDamage = Math.floor(attackerPower * (0.8 + Math.random() * 0.4));
        const defenderDamage = Math.floor(defenderPower * (0.8 + Math.random() * 0.4));

        // 随机选择攻击目标
        const attackerTargetIdx = Math.floor(Math.random() * defender.disciples.length);
        const defenderTargetIdx = Math.floor(Math.random() * attacker.disciples.length);

        const attackerTarget = defender.disciples[attackerTargetIdx];
        const defenderTarget = attacker.disciples[defenderTargetIdx];

        // 应用伤害
        if (attackerTarget) {
            attackerTarget.currentHp = (attackerTarget.currentHp || attackerTarget.maxHp) - Math.floor(attackerDamage / 3);
        }
        if (defenderTarget) {
            defenderTarget.currentHp = (defenderTarget.currentHp || defenderTarget.maxHp) - Math.floor(defenderDamage / 3);
        }

        // 判断本回合胜负
        let roundResult = 'draw';
        if (attackerDamage > defenderDamage * 1.2) roundResult = 'attacker_win';
        else if (defenderDamage > attackerDamage * 1.2) roundResult = 'defender_win';

        return {
            round: roundNum,
            attackerDamage: attackerDamage,
            defenderDamage: defenderDamage,
            attackerTarget: attackerTarget?.name || '未知目标',
            defenderTarget: defenderTarget?.name || '未知目标',
            result: roundResult,
            timestamp: Date.now()
        };
    }

    /**
     * 结束战斗并计算结果
     * @param {string} warId - 大战ID
     * @returns {Object} 战斗结果
     */
    finishBattle(warId) {
        const sectWars = this.gameState.sectWars;
        const warRecord = sectWars.wars.find(w => w.warId === warId);

        if (!warRecord) {
            return { success: false, error: '大战记录不存在' };
        }

        if (warRecord.status !== 'active') {
            return { success: false, error: '大战不在战斗状态' };
        }

        // 统计战斗回合
        const attackerWins = warRecord.rounds.filter(r => r.result === 'attacker_win').length;
        const defenderWins = warRecord.rounds.filter(r => r.result === 'defender_win').length;
        const totalRounds = warRecord.rounds.length;

        // 计算最终结果
        let outcome;
        if (attackerWins > defenderWins) {
            outcome = 'victory';
        } else if (defenderWins > attackerWins) {
            outcome = 'defeat';
        } else {
            outcome = 'draw';
        }

        warRecord.status = 'finished';
        warRecord.result = outcome;
        warRecord.finishedAt = Date.now();

        // 计算奖励
        const outcomeConfig = SECT_WAR_OUTCOMES[outcome];
        warRecord.rewards = { ...outcomeConfig.rewards };

        // 更新冷却
        sectWars.cooldowns[warRecord.attacker.sectName] = this.gameState.days;

        // 添加战报
        const battleReport = this.generateBattleReport(warRecord);
        sectWars.warHistory.push(battleReport);

        return {
            success: true,
            message: `战斗结束，结果：${outcomeConfig.title}`,
            outcome: outcome,
            rewards: warRecord.rewards,
            report: battleReport
        };
    }

    /**
     * 生成战斗报告
     * @param {Object} warRecord - 大战记录
     * @returns {Object} 战斗报告
     */
    generateBattleReport(warRecord) {
        const outcome = warRecord.result;
        const outcomeConfig = SECT_WAR_OUTCOMES[outcome] || SECT_WAR_OUTCOMES.draw;

        const rounds = warRecord.rounds.map(r => ({
            round: r.round,
            result: r.result,
            attackerDamage: r.attackerDamage,
            defenderDamage: r.defenderDamage
        }));

        return {
            warId: warRecord.warId,
            attacker: {
                sectName: warRecord.attacker.sectName,
                sectLevel: warRecord.attacker.sectLevel,
                power: warRecord.attacker.power
            },
            defender: {
                sectName: warRecord.defender.sectName,
                sectLevel: warRecord.defender.sectLevel,
                power: warRecord.defender.power
            },
            outcome: outcome,
            title: outcomeConfig.title,
            reputationChange: outcomeConfig.reputationChange,
            rewards: warRecord.rewards,
            rounds: rounds,
            totalRounds: warRecord.rounds.length,
            timestamp: warRecord.finishedAt || Date.now()
        };
    }

    /**
     * 获取待应战的大战列表
     * @returns {Array} 待应战列表
     */
    getPendingWars() {
        const sectWars = this.gameState.sectWars;
        return sectWars.pendingWars.map(warId => {
            const war = sectWars.wars.find(w => w.warId === warId);
            if (!war) return null;
            return {
                warId: war.warId,
                attacker: war.attacker.sectName,
                declaredAt: war.declaredAt,
                preparationEndDay: war.preparationEndDay
            };
        }).filter(w => w !== null);
    }

    /**
     * 获取大战详情
     * @param {string} warId - 大战ID
     * @returns {Object} 大战详情
     */
    getWarDetails(warId) {
        const sectWars = this.gameState.sectWars;
        const warRecord = sectWars.wars.find(w => w.warId === warId);
        if (!warRecord) return null;

        return {
            warId: warRecord.warId,
            attacker: {
                sectName: warRecord.attacker.sectName,
                sectLevel: warRecord.attacker.sectLevel,
                power: warRecord.attacker.power,
                disciples: warRecord.attacker.disciples.length
            },
            defender: {
                sectName: warRecord.defender.sectName,
                sectLevel: warRecord.defender.sectLevel,
                power: warRecord.defender.power,
                disciples: warRecord.defender.disciples.length
            },
            status: warRecord.status,
            result: warRecord.result,
            declaredAt: warRecord.declaredAt,
            preparationEndDay: warRecord.preparationEndDay,
            battleEndDay: warRecord.battleEndDay,
            rounds: warRecord.rounds
        };
    }

    /**
     * 获取战斗历史
     * @param {number} limit - 返回数量限制
     * @returns {Array} 战斗历史
     */
    getWarHistory(limit = 10) {
        const sectWars = this.gameState.sectWars;
        return sectWars.warHistory.slice(-limit);
    }

    /**
     * 执行每日战斗回合
     * @returns {Object} 执行结果
     */
    processDailyWarTick() {
        const sectWars = this.gameState.sectWars;
        const activeWars = sectWars.wars.filter(w => w.status === 'active');
        const results = [];

        for (const war of activeWars) {
            // 检查战斗是否结束
            if (this.gameState.days >= war.battleEndDay) {
                const finishResult = this.finishBattle(war.warId);
                results.push(finishResult);
                continue;
            }

            // 生成新的战斗回合
            const currentRound = war.rounds.length;
            const newRound = this.generateBattleRound(war, currentRound);
            war.rounds.push(newRound);

            results.push({
                success: true,
                warId: war.warId,
                round: currentRound,
                result: newRound
            });
        }

        return {
            processedWars: activeWars.length,
            results: results
        };
    }
}

export default {
    createSectWarService,
    SectWarService,
    SECT_WAR_CONFIG,
    SECT_WAR_OUTCOMES,
    SECT_LEVEL_COMBAT_BONUS,
    IMMORTAL_SECT_LEVELS,
    IMMORTAL_SECT_POSITIONS,
    IMMORTAL_SECT_SKILLS,
    createSectMemberContribution
};