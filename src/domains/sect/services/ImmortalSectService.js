/**
 * ImmortalSectService.js - 仙界宗门系统
 * V231 Direction S: 仙界宗门系统 - chatdev多角色协调 + nanobot mesh
 * 
 * 提供6个MCP工具:
 * - sect.immortal.create - 创建仙界宗门
 * - sect.immortal.join - 加入仙界宗门
 * - sect.immortal.resource.list - 查看宗门资源
 * - sect.immortal.trade.execute - 执行宗门间交易
 * - sect.immortal.disciple.promote - 晋升精英弟子
 * - sect.immortal.alliance.form - 形成宗门联盟
 */

import { createSect, SECT_CONFIG } from '../entities/Sect.js';

// 仙界宗门等级配置
export const IMMORTAL_SECT_CONFIG = {
    createCost: 50000,           // 创建仙界宗门消耗灵石
    joinCost: 10000,            // 加入仙界宗门消耗灵石
    maxSectLevel: 5,            // 最高5星宗门
    resourceTypes: ['spiritStones', 'pills', 'techniques', 'merit'], // 资源类型
    tradeTaxRate: 0.05,         // 交易税率5%
    eliteDiscipleLimit: 10,     // 每宗门最多10名精英弟子
    allianceMaxSects: 5         // 联盟最多5个宗门
};

// 仙界宗门数据结构
export function createImmortalSect(name, founderId) {
    return {
        uid: 'ims_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: name,
        founder: founderId,
        sectLevel: 1,                                    // 1-5星
        members: [{
            uid: founderId,
            role: 'founder',
            joinedAt: Date.now(),
            contribution: 0,
            isElite: false
        }],
        resources: {
            spiritStones: 0,
            pills: 0,
            techniques: 0,
            merit: 0
        },
        eliteDisciples: [],                               // 精英弟子UID列表
        alliances: [],                                   // 结盟宗门UID列表
        enemies: [],                                     // 敌对宗门UID列表
        createdAt: Date.now(),
        reputation: 100,
        activeTrades: []                                 // 进行中的交易
    };
}

// 精英弟子数据结构
export function createEliteDisciple(discipleInfo) {
    return {
        uid: 'eld_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        originalUid: discipleInfo.uid,
        name: discipleInfo.name,
        realm: discipleInfo.realm || 6,                  // 默认地仙境界
        talentIndex: discipleInfo.talentIndex || 3,
        specialSkills: [],                               // 特殊技能
        cultivationSpeed: 1.0,
        combatPower: 0,
        promotedAt: Date.now(),
        contribution: 0
    };
}

/**
 * 创建ImmortalSectService
 * @param {Object} gameState - 游戏状态
 * @returns {Object} 仙界宗门服务实例
 */
export function createImmortalSectService(gameState) {
    return new ImmortalSectService(gameState);
}

/**
 * 仙界宗门服务类
 */
class ImmortalSectService {
    constructor(gameState) {
        this.gameState = gameState;
        this.immortalSects = new Map();    // 仙界宗门集合
        this.playerSectId = null;          // 玩家所在仙界宗门ID
    }

    /**
     * 初始化仙界宗门系统
     */
    init(gameState) {
        if (!gameState.immortalSects) {
            gameState.immortalSects = {
                sects: [],                   // 所有仙界宗门列表
                playerSectId: null,          // 玩家所在的仙界宗门ID
                tradeHistory: [],            // 交易历史
                allianceRecords: []          // 结盟记录
            };
        }
        this.immortalSects = gameState.immortalSects;
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
        if (!this.immortalSects.playerSectId) return null;
        return this.immortalSects.sects.find(s => s.uid === this.immortalSects.playerSectId);
    }

    // ========== MCP 工具实现 ==========

    /**
     * sect.immortal.create - 创建仙界宗门
     * @param {Object} params - { name: string }
     */
    mcpCreate(params = {}) {
        const { name } = params;

        // 检查飞升状态
        if (!this.isPlayerAscended()) {
            return {
                success: false,
                error: '尚未飞升，无法创建仙界宗门'
            };
        }

        // 检查是否已有仙界宗门
        if (this.immortalSects.playerSectId) {
            return {
                success: false,
                error: '你已加入仙界宗门，无法再次创建'
            };
        }

        // 检查宗门名称
        if (!name || name.trim().length < 2) {
            return {
                success: false,
                error: '宗门名称至少需要2个字符'
            };
        }

        if (name.length > 20) {
            return {
                success: false,
                error: '宗门名称不能超过20个字符'
            };
        }

        // 检查灵石
        const cost = IMMORTAL_SECT_CONFIG.createCost;
        if ((this.gameState.spiritStones || 0) < cost) {
            return {
                success: false,
                error: `灵石不足，需要 ${cost} 灵石来创建仙界宗门`
            };
        }

        // 扣除灵石
        this.gameState.spiritStones -= cost;

        // 创建仙界宗门
        const sect = createImmortalSect(name, this.gameState.player?.uid || 'player');
        sect.founder = this.gameState.player?.name || '宗主';
        
        this.immortalSects.sects.push(sect);
        this.immortalSects.playerSectId = sect.uid;

        return {
            success: true,
            message: `仙界宗门「${name}」创建成功！`,
            sect: {
                uid: sect.uid,
                name: sect.name,
                sectLevel: sect.sectLevel,
                founder: sect.founder,
                memberCount: sect.members.length,
                resources: sect.resources
            },
            costDeducted: cost
        };
    }

    /**
     * sect.immortal.join - 加入仙界宗门
     * @param {Object} params - { sectId: string }
     */
    mcpJoin(params = {}) {
        const { sectId } = params;

        // 检查飞升状态
        if (!this.isPlayerAscended()) {
            return {
                success: false,
                error: '尚未飞升，无法加入仙界宗门'
            };
        }

        // 检查是否已有仙界宗门
        if (this.immortalSects.playerSectId) {
            return {
                success: false,
                error: '你已加入仙界宗门'
            };
        }

        // 查找目标宗门
        const targetSect = this.immortalSects.sects.find(s => s.uid === sectId);
        if (!targetSect) {
            return {
                success: false,
                error: '仙界宗门不存在'
            };
        }

        // 检查宗门是否满员
        const maxMembers = IMMORTAL_SECT_CONFIG.maxSectLevel * 10; // 每星10人
        if (targetSect.members.length >= maxMembers) {
            return {
                success: false,
                error: '该宗门人数已满'
            };
        }

        // 扣除加入费用
        const cost = IMMORTAL_SECT_CONFIG.joinCost;
        if ((this.gameState.spiritStones || 0) < cost) {
            return {
                success: false,
                error: `灵石不足，需要 ${cost} 灵石加入宗门`
            };
        }
        this.gameState.spiritStones -= cost;

        // 加入宗门
        const playerInfo = {
            uid: this.gameState.player?.uid || 'player',
            role: 'member',
            joinedAt: Date.now(),
            contribution: 0,
            isElite: false
        };
        targetSect.members.push(playerInfo);
        this.immortalSects.playerSectId = sectId;

        return {
            success: true,
            message: `成功加入仙界宗门「${targetSect.name}」！`,
            sect: {
                uid: targetSect.uid,
                name: targetSect.name,
                sectLevel: targetSect.sectLevel,
                memberCount: targetSect.members.length,
                resources: targetSect.resources
            },
            costDeducted: cost
        };
    }

    /**
     * sect.immortal.resource.list - 查看宗门资源
     * @param {Object} params - { sectId?: string }
     */
    mcpResourceList(params = {}) {
        const { sectId } = params;

        // 获取宗门（玩家自己的或指定的）
        let sect;
        if (sectId) {
            sect = this.immortalSects.sects.find(s => s.uid === sectId);
        } else {
            sect = this.getPlayerSect();
        }

        if (!sect) {
            return {
                success: false,
                error: '未找到仙界宗门'
            };
        }

        // 计算今日产出
        const dailyIncome = this.calculateDailyIncome(sect);

        // 获取交易历史
        const recentTrades = this.immortalSects.tradeHistory
            .filter(t => t.sectId === sect.uid)
            .slice(-10);

        return {
            success: true,
            sect: {
                uid: sect.uid,
                name: sect.name,
                sectLevel: sect.sectLevel,
                resources: sect.resources,
                dailyIncome: dailyIncome,
                memberCount: sect.members.length,
                eliteDiscipleCount: sect.eliteDisciples.length,
                allianceCount: sect.alliances.length,
                reputation: sect.reputation
            },
            recentTrades: recentTrades
        };
    }

    /**
     * 计算宗门每日产出
     */
    calculateDailyIncome(sect) {
        const memberCount = sect.members.length;
        const eliteCount = sect.eliteDisciples.length;
        const levelBonus = sect.sectLevel * 0.2 + 1;

        return {
            spiritStones: Math.floor(100 * memberCount * levelBonus),
            pills: Math.floor(5 * eliteCount * levelBonus),
            techniques: Math.floor(1 * memberCount * levelBonus),
            merit: Math.floor(10 * memberCount * levelBonus)
        };
    }

    /**
     * sect.immortal.trade.execute - 执行宗门间交易
     * @param {Object} params - { targetSectId, resourceType, amount, price }
     */
    mcpTradeExecute(params = {}) {
        const { targetSectId, resourceType, amount, price } = params;

        // 检查玩家是否在仙界宗门中
        const playerSect = this.getPlayerSect();
        if (!playerSect) {
            return {
                success: false,
                error: '你未加入任何仙界宗门'
            };
        }

        // 验证交易参数
        if (!targetSectId) {
            return {
                success: false,
                error: '请指定目标宗门ID'
            };
        }

        if (!IMMORTAL_SECT_CONFIG.resourceTypes.includes(resourceType)) {
            return {
                success: false,
                error: `无效的资源类型，可选: ${IMMORTAL_SECT_CONFIG.resourceTypes.join(', ')}`
            };
        }

        if (!amount || amount <= 0) {
            return {
                success: false,
                error: '交易数量必须大于0'
            };
        }

        if (!price || price <= 0) {
            return {
                success: false,
                error: '交易价格必须大于0'
            };
        }

        // 查找目标宗门
        const targetSect = this.immortalSects.sects.find(s => s.uid === targetSectId);
        if (!targetSect) {
            return {
                success: false,
                error: '目标仙界宗门不存在'
            };
        }

        // 检查敌对关系
        if (playerSect.enemies.includes(targetSectId)) {
            return {
                success: false,
                error: '与该宗门处于敌对状态，无法交易'
            };
        }

        // 检查自己宗门是否有足够资源
        const playerResource = playerSect.resources[resourceType] || 0;
        if (playerResource < amount) {
            return {
                success: false,
                error: `${resourceType} 不足，当前拥有 ${playerResource}`
            };
        }

        // 计算税额
        const tax = Math.floor(price * IMMORTAL_SECT_CONFIG.tradeTaxRate);
        const totalCost = price + tax;

        // 扣除资源（从卖方）
        playerSect.resources[resourceType] -= amount;

        // 添加交易记录
        const tradeRecord = {
            id: 'trd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            sectId: playerSect.uid,
            targetSectId: targetSectId,
            resourceType: resourceType,
            amount: amount,
            price: price,
            tax: tax,
            timestamp: Date.now(),
            status: 'pending'
        };
        this.immortalSects.tradeHistory.push(tradeRecord);

        return {
            success: true,
            message: `向「${targetSect.name}」发起${resourceType}交易请求`,
            trade: {
                id: tradeRecord.id,
                resourceType: resourceType,
                amount: amount,
                price: price,
                tax: tax,
                totalCost: totalCost,
                status: 'pending'
            },
            remainingResource: playerSect.resources[resourceType]
        };
    }

    /**
     * sect.immortal.disciple.promote - 晋升精英弟子
     * @param {Object} params - { discipleUid: string }
     */
    mcpDisciplePromote(params = {}) {
        const { discipleUid } = params;

        // 获取玩家宗门
        const playerSect = this.getPlayerSect();
        if (!playerSect) {
            return {
                success: false,
                error: '你未加入任何仙界宗门'
            };
        }

        // 检查精英弟子数量限制
        if (playerSect.eliteDisciples.length >= IMMORTAL_SECT_CONFIG.eliteDiscipleLimit) {
            return {
                success: false,
                error: `精英弟子数量已达上限（${IMMORTAL_SECT_CONFIG.eliteDiscipleLimit}名）`
            };
        }

        // 在凡界宗门中查找弟子
        const mortalSect = this.gameState.sect;
        if (!mortalSect || !mortalSect.disciples) {
            return {
                success: false,
                error: '凡界宗门不存在或无弟子'
            };
        }

        const disciple = mortalSect.disciples.find(d => d.uid === discipleUid);
        if (!disciple) {
            return {
                success: false,
                error: '未找到该弟子'
            };
        }

        // 检查是否已是精英弟子
        if (playerSect.eliteDisciples.find(e => e.originalUid === discipleUid)) {
            return {
                success: false,
                error: '该弟子已经是精英弟子'
            };
        }

        // 检查弟子境界（需要金丹以上 realm>=2）
        if ((disciple.realm || 0) < 2) {
            return {
                success: false,
                error: '弟子境界过低，需要金丹期以上才能晋升精英'
            };
        }

        // 创建精英弟子
        const eliteDisciple = createEliteDisciple({
            uid: disciple.uid,
            name: disciple.name,
            realm: disciple.realm,
            talentIndex: disciple.talentIndex || 1
        });

        // 分配特殊技能
        eliteDisciple.specialSkills = this.assignSpecialSkills(eliteDisciple);

        playerSect.eliteDisciples.push(eliteDisciple);

        return {
            success: true,
            message: `${disciple.name}晋升为精英弟子！`,
            eliteDisciple: {
                uid: eliteDisciple.uid,
                name: eliteDisciple.name,
                realm: eliteDisciple.realm,
                specialSkills: eliteDisciple.specialSkills,
                promotedAt: eliteDisciple.promotedAt
            },
            eliteDiscipleCount: playerSect.eliteDisciples.length
        };
    }

    /**
     * 分配特殊技能
     */
    assignSpecialSkills(disciple) {
        const skillPool = [
            { id: 'spiritShield', name: '灵力护盾', effect: 'defense +30%' },
            { id: 'quickStrike', name: '疾风斩', effect: 'attack +25%' },
            { id: 'meditation', name: '入定', effect: 'cultivationSpeed +20%' },
            { id: 'eyeOfTruth', name: '洞察之眼', effect: 'perception +35%' },
            { id: 'swiftFoot', name: '缩地术', effect: 'evasion +30%' },
            { id: 'alchemyTalent', name: '炼丹天赋', effect: 'pillQuality +25%' }
        ];

        // 根据资质分配1-3个技能
        const skillCount = Math.min(3, Math.floor((disciple.talentIndex || 1) / 2) + 1);
        const selected = [];
        const shuffled = skillPool.sort(() => Math.random() - 0.5);

        for (let i = 0; i < skillCount; i++) {
            selected.push(shuffled[i]);
        }

        return selected;
    }

    /**
     * sect.immortal.alliance.form - 形成宗门联盟
     * @param {Object} params - { targetSectId: string }
     */
    mcpAllianceForm(params = {}) {
        const { targetSectId } = params;

        // 获取玩家宗门
        const playerSect = this.getPlayerSect();
        if (!playerSect) {
            return {
                success: false,
                error: '你未加入任何仙界宗门'
            };
        }

        // 查找目标宗门
        const targetSect = this.immortalSects.sects.find(s => s.uid === targetSectId);
        if (!targetSect) {
            return {
                success: false,
                error: '目标仙界宗门不存在'
            };
        }

        // 不能和自己结盟
        if (targetSectId === playerSect.uid) {
            return {
                success: false,
                error: '无法与自己结盟'
            };
        }

        // 检查是否已是盟友
        if (playerSect.alliances.includes(targetSectId)) {
            return {
                success: false,
                error: '已是盟友'
            };
        }

        // 检查是否敌对
        if (playerSect.enemies.includes(targetSectId)) {
            return {
                success: false,
                error: '与该宗门处于敌对状态，无法结盟'
            };
        }

        // 检查联盟数量限制
        if (playerSect.alliances.length >= IMMORTAL_SECT_CONFIG.allianceMaxSects) {
            return {
                success: false,
                error: `盟友数量已达上限（${IMMORTAL_SECT_CONFIG.allianceMaxSects}个宗门）`
            };
        }

        if (targetSect.alliances.length >= IMMORTAL_SECT_CONFIG.allianceMaxSects) {
            return {
                success: false,
                error: '对方宗门盟友数已达上限'
            };
        }

        // 建立双向结盟
        playerSect.alliances.push(targetSectId);
        targetSect.alliances.push(playerSect.uid);

        // 记录结盟
        const allianceRecord = {
            id: 'al_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            sectId: playerSect.uid,
            targetSectId: targetSectId,
            formedAt: Date.now(),
            type: 'mutual'
        };
        this.immortalSects.allianceRecords.push(allianceRecord);

        // 增加双方 reputation
        playerSect.reputation += 50;
        targetSect.reputation += 50;

        return {
            success: true,
            message: `与「${targetSect.name}」成功结盟！`,
            alliance: {
                id: allianceRecord.id,
                sectName: playerSect.name,
                targetSectName: targetSect.name,
                formedAt: allianceRecord.formedAt
            },
            playerAllianceCount: playerSect.alliances.length,
            targetAllianceCount: targetSect.alliances.length
        };
    }

    /**
     * 获取所有仙界宗门列表（用于MCP工具注册）
     */
    getAllSects() {
        return this.immortalSects.sects.map(s => ({
            uid: s.uid,
            name: s.name,
            sectLevel: s.sectLevel,
            memberCount: s.members.length,
            reputation: s.reputation
        }));
    }

    /**
     * 获取玩家的精英弟子列表
     */
    getEliteDisciples() {
        const playerSect = this.getPlayerSect();
        if (!playerSect) return [];
        return playerSect.eliteDisciples;
    }

    /**
     * 列出所有可用的MCP工具处理器
     */
    getMCPHandlers() {
        return {
            'sect.immortal.create': (params) => this.mcpCreate(params),
            'sect.immortal.join': (params) => this.mcpJoin(params),
            'sect.immortal.resource.list': (params) => this.mcpResourceList(params),
            'sect.immortal.trade.execute': (params) => this.mcpTradeExecute(params),
            'sect.immortal.disciple.promote': (params) => this.mcpDisciplePromote(params),
            'sect.immortal.alliance.form': (params) => this.mcpAllianceForm(params)
        };
    }
}

// 默认导出
export default {
    createImmortalSectService,
    IMMORTAL_SECT_CONFIG,
    createImmortalSect,
    createEliteDisciple
};