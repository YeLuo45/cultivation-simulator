/**
 * AscensionService.js - 飞升系统
 * V230 Direction R: 飞升系统 - generic-agent/thunderbolt反馈回路
 * 
 * 提供6个MCP工具:
 * - ascension.requirements.check - 检查飞升条件
 * - ascension.initiate - 发起飞升
 * - ascension.tribulation.execute - 执行天道考验
 * - ascension.reward.claim - 领取飞升奖励
 * - ascension.realm.query - 查询仙界境界
 * - ascension.blessing.list - 列出仙界赐福
 */

import { CultivationService } from './CultivationService.js';

// 仙界境界定义
export const IMMORTAL_REALMS = {
    0: { name: '地仙', tier: 1, attributeBonus: 1.5, requiredMerit: 0 },
    1: { name: '天仙', tier: 2, attributeBonus: 1.8, requiredMerit: 500 },
    2: { name: '金仙', tier: 3, attributeBonus: 2.0, requiredMerit: 1500 },
    3: { name: '大罗金仙', tier: 4, attributeBonus: 2.5, requiredMerit: 5000 },
    4: { name: '准圣', tier: 5, attributeBonus: 3.0, requiredMerit: 15000 },
    5: { name: '圣人', tier: 6, attributeBonus: 4.0, requiredMerit: 50000 }
};

// 飞升条件配置
export const ASCENSION_REQUIREMENTS = {
    minRealm: 5, // 化神巅峰 (realm=5)
    minKarma: 500, // 功德值要求
    minSpiritRootTier: 4, // 灵根要求 (极品以上)
    minTribulationRecord: 1, // 必须通过过天劫
    minSpiritStones: 10000 // 飞升消耗灵石
};

// 仙界赐福类型
export const DIVINE_BLESSINGS = {
    immortalBody: {
        name: '仙灵之体',
        effect: { maxHp: 500, defense: 100 },
        description: '获得仙人体质，气血和防御大幅提升'
    },
    immortalSoul: {
        name: '仙魂',
        effect: { spiritEnergy: 200, cultivationSpeed: 30 },
        description: '灵魂蜕变为仙魂，灵力容量和修炼速度提升'
    },
    immortalAura: {
        name: '仙威',
        effect: { attack: 150, luck: 20 },
        description: '散发仙威，攻击力和运气提升'
    },
    immortalDestiny: {
        name: '仙缘',
        effect: { serendipityChance: 15, spiritStonesBonus: 25 },
        description: '仙缘深厚，奇遇概率和灵石获取提升'
    },
    immortalWisdom: {
        name: '仙智',
        effect: { masteryBonus: 50, insightChance: 20 },
        description: '智慧通达，元素精通和顿悟概率提升'
    },
    immortalVitality: {
        name: '仙寿',
        effect: { maxAge: 500, healthRegen: 10 },
        description: '寿命大幅延长，恢复能力增强'
    }
};

// 天道考验配置
export const DIVINE_TRIBULATION = {
    strikesTotal: 9, // 多重天劫(9道)
    baseDamage: 300,
    damageIncreasePerStrike: 50,
    resistThreshold: 0.6, // 抵抗阈值60%
    rewardBase: 1000,
    meritBase: 100
};

/**
 * 创建飞升服务实例
 * @param {Object} gameState - 游戏状态
 * @param {Object} reincarnationService - 轮回服务(用于获取karma)
 * @returns {Object} 飞升服务实例
 */
function createAscensionService(gameState, reincarnationService) {
    return new AscensionService(gameState, reincarnationService);
}

/**
 * 飞升服务类
 */
class AscensionService {
    constructor(gameState, reincarnationService) {
        this.gameState = gameState;
        this.reincarnationService = reincarnationService;
        this.ascensionState = null;
    }

    /**
     * 初始化飞升系统
     */
    init(gameState) {
        if (!gameState.ascension) {
            gameState.ascension = {
                ascended: false,
                immortalRealm: null,
                immortalTier: 0,
                ascensionTime: null,
                tribulationActive: false,
                tribulationProgress: 0,
                tribulationDamageTaken: 0,
                tribulationResisted: 0,
                blessings: [],
                claimedRewards: [],
                totalMerit: 0,
                pendingRewards: null
            };
        }
        this.ascensionState = gameState.ascension;
        return gameState;
    }

    /**
     * 获取玩家功德值 (从轮回服务获取)
     */
    getKarma() {
        if (this.reincarnationService && this.reincarnationService.reincarnation) {
            const karmaGood = this.reincarnationService.reincarnation.karmaGood || 0;
            const karmaBad = this.reincarnationService.reincarnation.karmaBad || 0;
            return karmaGood - karmaBad;
        }
        return this.gameState.reincarnation?.totalKarma || 0;
    }

    /**
     * 获取天劫通过记录
     */
    getTribulationRecord() {
        return this.gameState.tribulationRecord || [];
    }

    /**
     * 检查飞升条件
     * @param {Object} params - 可选参数
     * @returns {Object} 飞升条件检查结果
     */
    checkRequirements(params = {}) {
        const gs = this.gameState;
        const requirements = [];

        // 1. 境界要求 (化神巅峰 realm=5)
        const realmMet = (gs.realm || 0) >= ASCENSION_REQUIREMENTS.minRealm;
        requirements.push({
            type: 'realm',
            desc: `境界达到化神巅峰 (realm≥${ASCENSION_REQUIREMENTS.minRealm})`,
            met: realmMet,
            current: gs.realm || 0,
            required: ASCENSION_REQUIREMENTS.minRealm
        });

        // 2. 功德值要求
        const karma = this.getKarma();
        const karmaMet = karma >= ASCENSION_REQUIREMENTS.minKarma;
        requirements.push({
            type: 'karma',
            desc: `功德值达到${ASCENSION_REQUIREMENTS.minKarma}`,
            met: karmaMet,
            current: karma,
            required: ASCENSION_REQUIREMENTS.minKarma
        });

        // 3. 灵根要求 (极品以上 tier≥4)
        const spiritRootTier = gs.spiritRoot?.tier || 1;
        const spiritRootMet = spiritRootTier >= ASCENSION_REQUIREMENTS.minSpiritRootTier;
        const TIER_MAP = { 1: '凡品', 2: '良品', 3: '上品', 4: '极品', 5: '天品' };
        requirements.push({
            type: 'spiritRoot',
            desc: `灵根达到极品以上 (tier≥${ASCENSION_REQUIREMENTS.minSpiritRootTier})`,
            met: spiritRootMet,
            current: spiritRootTier,
            currentName: TIER_MAP[spiritRootTier] || '未知',
            required: ASCENSION_REQUIREMENTS.minSpiritRootTier,
            requiredName: TIER_MAP[ASCENSION_REQUIREMENTS.minSpiritRootTier]
        });

        // 4. 天劫通过记录
        const tribRecord = this.getTribulationRecord();
        const tribPassed = tribRecord.filter(t => t.success).length >= ASCENSION_REQUIREMENTS.minTribulationRecord;
        requirements.push({
            type: 'tribulation',
            desc: `通过至少${ASCENSION_REQUIREMENTS.minTribulationRecord}次天劫`,
            met: tribPassed,
            current: tribRecord.filter(t => t.success).length,
            required: ASCENSION_REQUIREMENTS.minTribulationRecord
        });

        // 5. 灵石要求
        const spiritStonesMet = (gs.spiritStones || 0) >= ASCENSION_REQUIREMENTS.minSpiritStones;
        requirements.push({
            type: 'spiritStones',
            desc: `拥有至少${ASCENSION_REQUIREMENTS.minSpiritStones}灵石`,
            met: spiritStonesMet,
            current: gs.spiritStones || 0,
            required: ASCENSION_REQUIREMENTS.minSpiritStones
        });

        // 6. 仙界赐福(已完成飞升后检查)
        const ascensionStatus = this.queryAscensionStatus();

        // 计算满足条件数
        const metCount = requirements.filter(r => r.met).length;
        const allMet = metCount === requirements.length;

        return {
            success: true,
            canAscend: allMet,
            requirementsMet: metCount,
            requirementsTotal: requirements.length,
            requirements: requirements,
            ascensionStatus: ascensionStatus
        };
    }

    /**
     * 发起飞升
     * @param {Object} params - 可选参数 { confirm: boolean }
     * @returns {Object} 飞升结果
     */
    initiateAscension(params = {}) {
        // 检查是否已飞升
        if (this.ascensionState.ascended) {
            return {
                success: false,
                error: '你已经飞升过了，无法再次飞升'
            };
        }

        // 检查条件
        const reqCheck = this.checkRequirements();
        if (!reqCheck.canAscend) {
            const unmet = reqCheck.requirements.filter(r => !r.met).map(r => r.desc);
            return {
                success: false,
                error: '飞升条件未满足',
                unmetRequirements: unmet,
                requirementsCheck: reqCheck
            };
        }

        // 扣除灵石
        const cost = ASCENSION_REQUIREMENTS.minSpiritStones;
        if ((this.gameState.spiritStones || 0) < cost) {
            return {
                success: false,
                error: '灵石不足，无法飞升'
            };
        }
        this.gameState.spiritStones -= cost;

        // 开启天道考验
        this.ascensionState.tribulationActive = true;
        this.ascensionState.tribulationProgress = 0;
        this.ascensionState.tribulationDamageTaken = 0;
        this.ascensionState.tribulationResisted = 0;

        return {
            success: true,
            message: '飞升仪式开始，天道考验降临！',
            tribulationInfo: {
                strikesTotal: DIVINE_TRIBULATION.strikesTotal,
                baseDamage: DIVINE_TRIBULATION.baseDamage,
                resistThreshold: DIVINE_TRIBULATION.resistThreshold,
                message: '九道天劫将依次降临，需抵抗至少60%方可飞升成功'
            },
            costDeducted: cost
        };
    }

    /**
     * 执行天道考验
     * @param {Object} params - { strikeNumber?: number, damage?: number, resisted?: boolean }
     * @returns {Object} 天劫执行结果
     */
    executeTribulation(params = {}) {
        if (!this.ascensionState.tribulationActive) {
            return {
                success: false,
                error: '天道考验未激活'
            };
        }

        const strikeNumber = params.strikeNumber ?? this.ascensionState.tribulationProgress + 1;
        const damage = params.damage ?? DIVINE_TRIBULATION.baseDamage + (strikeNumber - 1) * DIVINE_TRIBULATION.damageIncreasePerStrike;
        const resisted = params.resisted ?? false;

        // 更新进度
        this.ascensionState.tribulationProgress = strikeNumber;
        if (!resisted) {
            this.ascensionState.tribulationDamageTaken += damage;
        } else {
            this.ascensionState.tribulationResisted = (this.ascensionState.tribulationResisted || 0) + 1;
        }

        // 计算抵抗率
        const resistRate = this.ascensionState.tribulationResisted / strikeNumber;
        const tribulationComplete = strikeNumber >= DIVINE_TRIBULATION.strikesTotal;

        // 检查是否完成
        if (tribulationComplete) {
            this.ascensionState.tribulationActive = false;
            const success = resistRate >= DIVINE_TRIBULATION.resistThreshold;

            if (success) {
                // 飞升成功
                this.ascensionState.ascended = true;
                this.ascensionState.immortalRealm = 0; // 地仙
                this.ascensionState.immortalTier = IMMORTAL_REALMS[0].tier;
                this.ascensionState.ascensionTime = Date.now();

                // 计算奖励
                const merit = DIVINE_TRIBULATION.meritBase * (1 + resistRate);
                const rewards = this.calculateRewards(resistRate);
                this.ascensionState.pendingRewards = rewards;

                return {
                    success: true,
                    result: 'success',
                    message: '恭喜飞升成功！踏入仙界，成为地仙！',
                    resistRate: (resistRate * 100).toFixed(1) + '%',
                    meritGained: Math.floor(merit),
                    pendingRewards: rewards
                };
            } else {
                // 飞升失败
                return {
                    success: true,
                    result: 'failed',
                    message: '飞升失败！抵抗率不足，需更强的实力',
                    resistRate: (resistRate * 100).toFixed(1) + '%',
                    requiredRate: (DIVINE_TRIBULATION.resistThreshold * 100).toFixed(1) + '%',
                    damageTaken: this.ascensionState.tribulationDamageTaken
                };
            }
        }

        // 返回当前进度
        return {
            success: true,
            result: 'in_progress',
            strikeNumber: strikeNumber,
            damage: damage,
            resisted: resisted,
            progress: `${strikeNumber}/${DIVINE_TRIBULATION.strikesTotal}`,
            resistRate: (resistRate * 100).toFixed(1) + '%',
            damageTaken: this.ascensionState.tribulationDamageTaken,
            message: `第${strikeNumber}道天劫降临，${resisted ? '成功抵抗' : '受到' + damage + '点伤害'}`
        };
    }

    /**
     * 计算飞升奖励
     */
    calculateRewards(resistRate) {
        const tier = this.ascensionState?.immortalTier || 1;
        const realmInfo = Object.values(IMMORTAL_REALMS).find(r => r.tier === tier) || IMMORTAL_REALMS[0];
        const bonusMultiplier = realmInfo.attributeBonus;

        return {
            spiritStones: Math.floor(DIVINE_TRIBULATION.rewardBase * bonusMultiplier * (1 + resistRate)),
            cultivationXp: Math.floor(5000 * bonusMultiplier * (1 + resistRate)),
            merit: Math.floor(DIVINE_TRIBULATION.meritBase * (1 + resistRate)),
            blessings: this.selectRandomBlessings(Math.floor(2 + resistRate * 3))
        };
    }

    /**
     * 随机选择赐福
     */
    selectRandomBlessings(count) {
        const allBlessings = Object.entries(DIVINE_BLESSINGS).map(([key, value]) => ({
            type: key,
            ...value
        }));

        // 根据抵抗率决定赐福数量
        const selected = [];
        const shuffled = allBlessings.sort(() => Math.random() - 0.5);

        for (let i = 0; i < Math.min(count, shuffled.length); i++) {
            selected.push(shuffled[i]);
        }

        return selected;
    }

    /**
     * 领取飞升奖励
     * @param {Object} params - { rewardIndex?: number } (可选指定领取哪个奖励，全部领取则不传)
     * @returns {Object} 奖励领取结果
     */
    claimReward(params = {}) {
        if (!this.ascensionState?.ascended) {
            return {
                success: false,
                error: '尚未飞升，无法领取奖励'
            };
        }

        const pendingRewards = this.ascensionState.pendingRewards;
        if (!pendingRewards) {
            return {
                success: false,
                error: '没有可领取的奖励'
            };
        }

        const rewardIndex = params.rewardIndex;

        // 领取灵石奖励
        if (rewardIndex === undefined || rewardIndex === 0) {
            this.gameState.spiritStones = (this.gameState.spiritStones || 0) + pendingRewards.spiritStones;
            this.ascensionState.claimedRewards.push({
                type: 'spiritStones',
                amount: pendingRewards.spiritStones,
                time: Date.now()
            });
        }

        // 领取修为奖励
        if (rewardIndex === undefined || rewardIndex === 1) {
            this.gameState.cultivationXP = (this.gameState.cultivationXP || 0) + pendingRewards.cultivationXp;
            this.ascensionState.claimedRewards.push({
                type: 'cultivationXp',
                amount: pendingRewards.cultivationXp,
                time: Date.now()
            });
        }

        // 领取赐福
        if (rewardIndex === undefined || rewardIndex === 2) {
            for (const blessing of pendingRewards.blessings) {
                if (!this.ascensionState.blessings.find(b => b.type === blessing.type)) {
                    this.ascensionState.blessings.push({
                        ...blessing,
                        acquiredAt: Date.now()
                    });
                }
            }
            this.ascensionState.claimedRewards.push({
                type: 'blessings',
                count: pendingRewards.blessings.length,
                time: Date.now()
            });
        }

        // 记录功德
        if (rewardIndex === undefined || rewardIndex === 3) {
            this.ascensionState.totalMerit += pendingRewards.merit;
            this.ascensionState.claimedRewards.push({
                type: 'merit',
                amount: pendingRewards.merit,
                time: Date.now()
            });

            // 更新轮回服务中的功德记录
            if (this.reincarnationService) {
                this.reincarnationService.recordKarma('good', pendingRewards.merit);
            }
        }

        const claimed = this.ascensionState.claimedRewards.filter(c => c.type !== 'blessings' || c.count !== undefined);
        const remaining = rewardIndex !== undefined ? [0, 1, 2, 3].filter(i => i !== rewardIndex) : [];

        // 清除已领取奖励
        if (rewardIndex === undefined) {
            this.ascensionState.pendingRewards = null;
        }

        return {
            success: true,
            message: '奖励领取成功',
            claimed: this.ascensionState.claimedRewards.slice(-5),
            totalMerit: this.ascensionState.totalMerit,
            currentBlessings: this.ascensionState.blessings
        };
    }

    /**
     * 查询仙界境界
     * @param {Object} params - { detailed?: boolean }
     * @returns {Object} 仙界境界信息
     */
    queryRealm(params = {}) {
        if (!this.ascensionState?.ascended) {
            return {
                success: true,
                ascended: false,
                message: '尚未飞升，仍为人界修士'
            };
        }

        const realmIndex = this.ascensionState.immortalRealm;
        const realmInfo = IMMORTAL_REALMS[realmIndex] || IMMORTAL_REALMS[0];

        const result = {
            success: true,
            ascended: true,
            realm: realmIndex,
            realmName: realmInfo.name,
            tier: realmInfo.tier,
            attributeBonus: realmInfo.attributeBonus,
            ascensionTime: this.ascensionState.ascensionTime,
            totalMerit: this.ascensionState.totalMerit
        };

        if (params.detailed) {
            // 计算下一境界信息
            const nextRealmIndex = realmIndex + 1;
            const nextRealmInfo = IMMORTAL_REALMS[nextRealmIndex];

            result.nextRealm = nextRealmInfo ? {
                name: nextRealmInfo.name,
                tier: nextRealmInfo.tier,
                requiredMerit: nextRealmInfo.requiredMerit,
                attributeBonus: nextRealmInfo.attributeBonus,
                meritNeeded: nextRealmInfo.requiredMerit - this.ascensionState.totalMerit
            } : null;

            result.currentBonuses = this.calculateCurrentBonuses();
            result.blessingsCount = this.ascensionState.blessings.length;
        }

        return result;
    }

    /**
     * 计算当前属性加成
     */
    calculateCurrentBonuses() {
        const bonuses = {};
        const attributeBonus = (IMMORTAL_REALMS[this.ascensionState.immortalRealm] || IMMORTAL_REALMS[0]).attributeBonus;

        for (const blessing of this.ascensionState.blessings) {
            if (DIVINE_BLESSINGS[blessing.type]) {
                for (const [attr, value] of Object.entries(DIVINE_BLESSINGS[blessing.type].effect)) {
                    bonuses[attr] = (bonuses[attr] || 0) + value * attributeBonus;
                }
            }
        }

        return bonuses;
    }

    /**
     * 列出仙界赐福
     * @param {Object} params - { filter?: string, showAll?: boolean }
     * @returns {Object} 赐福列表
     */
    listBlessings(params = {}) {
        const filter = params.filter;
        const showAll = params.showAll || false;

        const allBlessings = Object.entries(DIVINE_BLESSINGS).map(([type, info]) => ({
            type,
            ...info,
            acquired: false,
            acquiredAt: null
        }));

        // 标记已获得的赐福
        for (const acquired of this.ascensionState.blessings) {
            const found = allBlessings.find(b => b.type === acquired.type);
            if (found) {
                found.acquired = true;
                found.acquiredAt = acquired.acquiredAt;
            }
        }

        // 过滤
        let filtered = allBlessings;
        if (filter) {
            filtered = allBlessings.filter(b =>
                b.name.includes(filter) ||
                b.description.includes(filter) ||
                b.type.includes(filter)
            );
        }

        const acquired = filtered.filter(b => b.acquired);
        const available = filtered.filter(b => !b.acquired);

        return {
            success: true,
            total: filtered.length,
            acquired: acquired.length,
            available: available.length,
            blessings: showAll ? filtered : available,
            acquiredBlessings: acquired,
            availableBlessings: available
        };
    }

    /**
     * 查询飞升状态摘要
     */
    queryAscensionStatus() {
        return {
            ascended: this.ascensionState?.ascended || false,
            immortalRealm: this.ascensionState?.immortalRealm,
            immortalRealmName: IMMORTAL_REALMS[this.ascensionState?.immortalRealm]?.name || null,
            tribulationActive: this.ascensionState?.tribulationActive || false,
            tribulationProgress: this.ascensionState?.tribulationProgress || 0,
            blessingsCount: this.ascensionState?.blessings?.length || 0,
            totalMerit: this.ascensionState?.totalMerit || 0,
            claimedRewardsCount: this.ascensionState?.claimedRewards?.length || 0
        };
    }

    /**
     * 升级仙界境界 (需要足够功德)
     * @param {Object} params - { targetRealm?: number }
     * @returns {Object} 升级结果
     */
    upgradeRealm(params = {}) {
        if (!this.ascensionState?.ascended) {
            return {
                success: false,
                error: '尚未飞升，无法升级境界'
            };
        }

        const currentRealm = this.ascensionState.immortalRealm;
        const targetRealm = params.targetRealm ?? currentRealm + 1;

        if (targetRealm > 5) {
            return {
                success: false,
                error: '已是最高境界'
            };
        }

        const targetRealmInfo = IMMORTAL_REALMS[targetRealm];
        if (!targetRealmInfo) {
            return {
                success: false,
                error: '无效的境界'
            };
        }

        const meritRequired = targetRealmInfo.requiredMerit;
        const currentMerit = this.ascensionState.totalMerit;

        if (currentMerit < meritRequired) {
            return {
                success: false,
                error: '功德不足',
                required: meritRequired,
                current: currentMerit,
                shortfall: meritRequired - currentMerit
            };
        }

        // 扣除功德并升级
        this.ascensionState.totalMerit -= meritRequired;
        this.ascensionState.immortalRealm = targetRealm;
        this.ascensionState.immortalTier = targetRealmInfo.tier;

        return {
            success: true,
            message: `境界提升至${targetRealmInfo.name}！`,
            newRealm: targetRealm,
            newRealmName: targetRealmInfo.name,
            newTier: targetRealmInfo.tier,
            attributeBonus: targetRealmInfo.attributeBonus,
            remainingMerit: this.ascensionState.totalMerit
        };
    }

    // ===== MCP工具接口 =====

    /**
     * MCP: ascension.requirements.check
     */
    mcpRequirementsCheck(params = {}) {
        return this.checkRequirements(params);
    }

    /**
     * MCP: ascension.initiate
     */
    mcpInitiate(params = {}) {
        return this.initiateAscension(params);
    }

    /**
     * MCP: ascension.tribulation.execute
     */
    mcpTribulationExecute(params = {}) {
        return this.executeTribulation(params);
    }

    /**
     * MCP: ascension.reward.claim
     */
    mcpRewardClaim(params = {}) {
        return this.claimReward(params);
    }

    /**
     * MCP: ascension.realm.query
     */
    mcpRealmQuery(params = {}) {
        return this.queryRealm(params);
    }

    /**
     * MCP: ascension.blessing.list
     */
    mcpBlessingList(params = {}) {
        return this.listBlessings(params);
    }

    /**
     * 序列化飞升状态
     */
    serialize() {
        return {
            ascension: this.ascensionState,
            pendingRewards: this.ascensionState?.pendingRewards
        };
    }

    /**
     * 反序列化飞升状态
     */
    deserialize(data) {
        if (data?.ascension) {
            this.gameState.ascension = data.ascension;
            this.ascensionState = data.ascension;
        }
    }
}

export { AscensionService, createAscensionService };

// 全局单例实例
let _ascensionServiceInstance = null;

/**
 * 获取飞升服务单例
 * @param {Object} gameState - 游戏状态
 * @param {Object} reincarnationService - 轮回服务
 * @returns {AscensionService}
 */
function getAscensionService(gameState, reincarnationService) {
    if (!_ascensionServiceInstance) {
        _ascensionServiceInstance = new AscensionService(gameState, reincarnationService);
    } else {
        // 更新引用
        _ascensionServiceInstance.gameState = gameState;
        _ascensionServiceInstance.reincarnationService = reincarnationService;
    }
    return _ascensionServiceInstance;
}

export { getAscensionService };