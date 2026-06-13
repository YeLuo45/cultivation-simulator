/**
 * TribulationService.js - 天劫渡劫系统
 * V246 天劫渡劫系统 - 基于TRIBULATION_TIERS实现
 * 
 * 提供MCP工具:
 * - tribulation.check - 检查渡劫条件
 * - tribulation.prepare - 准备渡劫
 * - tribulation.execute - 执行渡劫
 * - tribulation.reward - 领取渡劫奖励
 */

// ===== 常量定义 =====

/**
 * 天劫等级配置
 * 雷劫: minRealm=10, baseSuccessRate=0.6
 * 风劫: minRealm=20, baseSuccessRate=0.5
 * 心魔劫: minRealm=30, baseSuccessRate=0.4
 * 道劫: minRealm=40, baseSuccessRate=0.3
 */
export const TRIBULATION_TIERS = {
    雷劫: {
        name: '雷劫',
        minRealm: 10,
        baseSuccessRate: 0.6,
        rewards: ['天雷精华'],
        damage: 100,
        description: '雷云凝聚，天雷降世'
    },
    风劫: {
        name: '风劫',
        minRealm: 20,
        baseSuccessRate: 0.5,
        rewards: ['风之精粹'],
        damage: 150,
        description: '飓风席卷，撕裂苍穹'
    },
    心魔劫: {
        name: '心魔劫',
        minRealm: 30,
        baseSuccessRate: 0.4,
        rewards: ['道心稳固'],
        damage: 200,
        description: '心魔丛生，考验道心'
    },
    道劫: {
        name: '道劫',
        minRealm: 40,
        baseSuccessRate: 0.3,
        rewards: ['大道之基'],
        damage: 300,
        description: '大道降临，天道考验'
    }
};

/**
 * 天劫状态
 */
export const TRIBULATION_STATES = {
    NONE: 'none',
    PREPARING: 'preparing',
    IN_PROGRESS: 'in_progress',
    SUCCESS: 'success',
    FAILED: 'failed'
};

/**
 * 天劫类型枚举值
 */
export const TRIBULATION_TYPE_NAMES = Object.keys(TRIBULATION_TIERS);

/**
 * 渡劫配置
 */
export const TRIBULATION_CONFIG = {
    // 准备渡劫消耗灵石基数
    prepareStoneCost: 1000,
    // 每级境界加成
    realmStoneMultiplier: 500,
    // 成功基础奖励
    baseRewardMultiplier: 1.0,
    // 失败惩罚比例
    failurePenalty: 0.5,
    // 渡劫记录最大保存数
    maxRecordSize: 100
};

/**
 * 天劫奖励类型
 */
export const TRIBULATION_REWARDS = {
    天雷精华: { type: 'attribute', effect: { attack: 20, defense: 10 } },
    风之精粹: { type: 'attribute', effect: { speed: 30, luck: 5 } },
    道心稳固: { type: 'attribute', effect: { spiritEnergy: 50, cultivationSpeed: 10 } },
    大道之基: { type: 'attribute', effect: { maxHp: 100, allAttributes: 5 } }
};

// ===== 服务类 =====

/**
 * 天劫渡劫服务类
 */
class TribulationService {
    constructor(gameState) {
        this.gameState = gameState;
        this.tribulationState = null;
    }

    /**
     * 初始化天劫系统
     * @param {Object} gameState - 游戏状态
     * @returns {Object} 初始化后的游戏状态
     */
    init(gameState) {
        if (!gameState.tribulation) {
            gameState.tribulation = {
                state: TRIBULATION_STATES.NONE,
                currentTier: null,
                targetRealm: null,
                progress: 0,
                damageAccumulated: 0,
                resistedAccumulated: 0,
                strikesTotal: 0,
                strikesCurrent: 0,
                history: [],
                acquiredRewards: [],
                successRateBonus: 0
            };
        }
        this.tribulationState = gameState.tribulation;
        
        // 确保tribulationRecord数组存在
        if (!gameState.tribulationRecord) {
            gameState.tribulationRecord = [];
        }
        
        return gameState;
    }

    /**
     * 获取可用的天劫类型列表
     * @param {Object} params - { realm?: number } 可选当前境界
     * @returns {Array} 可用天劫类型列表
     */
    getAvailableTribulations(params = {}) {
        const realm = params.realm ?? this.gameState.realm ?? 0;
        return TRIBULATION_TYPE_NAMES.filter(tierName => {
            const tier = TRIBULATION_TIERS[tierName];
            return realm >= tier.minRealm;
        });
    }

    /**
     * 计算渡劫成功率
     * @param {Object} params - { tierName?: string, equipment?: Object, elixirs?: Array }
     * @returns {Object} 成功率信息
     */
    calculateSuccessRate(params = {}) {
        const tierName = params.tierName ?? this.tribulationState?.currentTier;
        
        if (!tierName || !TRIBULATION_TIERS[tierName]) {
            return { success: false, error: '无效的天劫类型' };
        }

        const tier = TRIBULATION_TIERS[tierName];
        const gs = this.gameState;
        
        // 基础成功率
        let successRate = tier.baseSuccessRate;
        
        // 装备加成 (每件装备增加5%成功率)
        const equipmentBonus = ((params.equipment?.length ?? 0) * 0.05);
        
        // 丹药加成 (每个丹药增加3%成功率)
        const elixirBonus = ((params.elixirs?.length ?? 0) * 0.03);
        
        // 境界加成 (超过最低境界要求越多，成功率越高)
        const realmBonus = Math.max(0, ((gs.realm ?? 0) - tier.minRealm) * 0.02);
        
        // 功德加成 (每100点功德增加2%成功率)
        const meritBonus = ((gs.merit ?? 0) / 100) * 0.02;
        
        // 灵根加成 (天品灵根额外10%)
        const spiritRootBonus = ((gs.spiritRoot?.tier ?? 1) >= 5) ? 0.1 : 0;
        
        // 最终成功率
        const finalRate = Math.min(0.95, Math.max(0.05, 
            successRate + equipmentBonus + elixirBonus + realmBonus + meritBonus + spiritRootBonus
        ));

        return {
            success: true,
            tierName,
            baseRate: tier.baseSuccessRate,
            equipmentBonus,
            elixirBonus,
            realmBonus,
            meritBonus,
            spiritRootBonus,
            finalRate,
            bonuses: {
                equipment: equipmentBonus,
                elixir: elixirBonus,
                realm: realmBonus,
                merit: meritBonus,
                spiritRoot: spiritRootBonus
            }
        };
    }

    /**
     * 检查渡劫条件
     * @param {Object} params - { tierName?: string }
     * @returns {Object} 渡劫条件检查结果
     */
    checkRequirements(params = {}) {
        const tierName = params.tierName;
        
        // 如果没有指定类型，返回所有可用类型
        if (!tierName) {
            const available = this.getAvailableTribulations();
            return {
                success: true,
                availableTribulations: available,
                message: '可用天劫类型: ' + available.join(', ')
            };
        }

        if (!TRIBULATION_TIERS[tierName]) {
            return { success: false, error: '无效的天劫类型: ' + tierName };
        }

        const tier = TRIBULATION_TIERS[tierName];
        const gs = this.gameState;
        const requirements = [];

        // 1. 境界要求
        const realmMet = (gs.realm ?? 0) >= tier.minRealm;
        requirements.push({
            type: 'realm',
            desc: `境界达到${tier.minRealm}级`,
            met: realmMet,
            current: gs.realm ?? 0,
            required: tier.minRealm
        });

        // 2. 灵石要求
        const stoneCost = this.calculateStoneCost(tierName);
        const stonesMet = (gs.spiritStones ?? 0) >= stoneCost;
        requirements.push({
            type: 'spiritStones',
            desc: `拥有至少${stoneCost}灵石`,
            met: stonesMet,
            current: gs.spiritStones ?? 0,
            required: stoneCost
        });

        // 3. 天劫状态检查
        const stateMet = this.tribulationState?.state === TRIBULATION_STATES.NONE;
        requirements.push({
            type: 'state',
            desc: '当前无进行中的天劫',
            met: stateMet,
            current: this.tribulationState?.state ?? 'none',
            required: 'none'
        });

        // 计算满足条件数
        const metCount = requirements.filter(r => r.met).length;
        const allMet = metCount === requirements.length;

        return {
            success: true,
            canTribulate: allMet,
            tierName,
            tierInfo: tier,
            requirementsMet: metCount,
            requirementsTotal: requirements.length,
            requirements,
            successRate: this.calculateSuccessRate({ tierName })
        };
    }

    /**
     * 计算渡劫所需灵石
     * @param {string} tierName - 天劫类型名
     * @returns {number} 所需灵石
     */
    calculateStoneCost(tierName) {
        if (!TRIBULATION_TIERS[tierName]) return 0;
        const tier = TRIBULATION_TIERS[tierName];
        return TRIBULATION_CONFIG.prepareStoneCost + tier.minRealm * TRIBULATION_CONFIG.realmStoneMultiplier;
    }

    /**
     * 准备渡劫
     * @param {Object} params - { tierName: string }
     * @returns {Object} 准备结果
     */
    prepare(params = {}) {
        const tierName = params.tierName;

        if (!tierName) {
            return { success: false, error: '必须指定天劫类型' };
        }

        if (!TRIBULATION_TIERS[tierName]) {
            return { success: false, error: '无效的天劫类型: ' + tierName };
        }

        // 检查天劫是否进行中
        if (this.tribulationState?.state !== TRIBULATION_STATES.NONE) {
            return { 
                success: false, 
                error: '天劫正在进行中，无法再次准备',
                currentState: this.tribulationState.state 
            };
        }

        // 检查境界要求
        const tier = TRIBULATION_TIERS[tierName];
        if ((this.gameState.realm ?? 0) < tier.minRealm) {
            return { 
                success: false, 
                error: `境界不足，需要${tier.minRealm}级才能渡${tierName}`,
                required: tier.minRealm,
                current: this.gameState.realm ?? 0
            };
        }

        // 检查灵石
        const stoneCost = this.calculateStoneCost(tierName);
        if ((this.gameState.spiritStones ?? 0) < stoneCost) {
            return { 
                success: false, 
                error: `灵石不足，需要${stoneCost}灵石`,
                shortage: stoneCost - (this.gameState.spiritStones ?? 0)
            };
        }

        // 扣除灵石
        this.gameState.spiritStones -= stoneCost;

        // 设置渡劫状态
        const strikesTotal = this.getStrikesForTier(tierName);
        this.tribulationState.state = TRIBULATION_STATES.PREPARING;
        this.tribulationState.currentTier = tierName;
        this.tribulationState.targetRealm = this.gameState.realm;
        this.tribulationState.progress = 0;
        this.tribulationState.strikesTotal = strikesTotal;
        this.tribulationState.strikesCurrent = 0;
        this.tribulationState.damageAccumulated = 0;
        this.tribulationState.resistedAccumulated = 0;

        // 计算成功率
        const successRateInfo = this.calculateSuccessRate({ tierName });

        // 记录历史
        this.recordHistory('prepare', {
            tierName,
            stoneCost,
            successRate: successRateInfo.finalRate
        });

        return {
            success: true,
            action: 'tribulation.prepare',
            state: TRIBULATION_STATES.PREPARING,
            tierName,
            tierInfo: tier,
            stoneCost,
            strikesTotal,
            successRate: successRateInfo.finalRate,
            message: `准备渡${tierName}，共${strikesTotal}道天劫`
        };
    }

    /**
     * 获取天劫对应的雷击次数
     * @param {string} tierName - 天劫类型名
     * @returns {number} 雷击次数
     */
    getStrikesForTier(tierName) {
        const tierMap = {
            '雷劫': 3,
            '风劫': 5,
            '心魔劫': 7,
            '道劫': 9
        };
        return tierMap[tierName] ?? 3;
    }

    /**
     * 执行渡劫 (单次雷击)
     * @param {Object} params - { resisted?: boolean, useItem?: string }
     * @returns {Object} 渡劫结果
     */
    execute(params = {}) {
        if (this.tribulationState.state !== TRIBULATION_STATES.PREPARING &&
            this.tribulationState.state !== TRIBULATION_STATES.IN_PROGRESS) {
            return { success: false, error: '请先准备渡劫' };
        }

        // 如果是准备状态，开始执行
        if (this.tribulationState.state === TRIBULATION_STATES.PREPARING) {
            this.tribulationState.state = TRIBULATION_STATES.IN_PROGRESS;
        }

        const tierName = this.tribulationState.currentTier;
        const tier = TRIBULATION_TIERS[tierName];
        const resisted = params.resisted ?? false;

        // 更新雷击计数
        this.tribulationState.strikesCurrent++;
        const currentStrike = this.tribulationState.strikesCurrent;

        // 计算伤害
        if (!resisted) {
            const damage = tier.damage * (1 + (currentStrike - 1) * 0.2);
            this.tribulationState.damageAccumulated += damage;
        } else {
            this.tribulationState.resistedAccumulated++;
        }

        // 计算抵抗率
        const resistRate = this.tribulationState.resistedAccumulated / currentStrike;
        const successThreshold = 0.5; // 50%抵抗率视为成功

        // 检查是否完成
        if (currentStrike >= this.tribulationState.strikesTotal) {
            this.tribulationState.state = TRIBULATION_STATES.SUCCESS;
            const success = resistRate >= successThreshold;

            if (success) {
                return this.handleTribulationSuccess(resistRate);
            } else {
                return this.handleTribulationFailure();
            }
        }

        // 返回当前进度
        return {
            success: true,
            result: 'in_progress',
            strikeNumber: currentStrike,
            strikesTotal: this.tribulationState.strikesTotal,
            resisted,
            damage: resisted ? 0 : tier.damage * (1 + (currentStrike - 1) * 0.2),
            resistRate,
            progress: `${currentStrike}/${this.tribulationState.strikesTotal}`,
            message: `第${currentStrike}道${tierName}${resisted ? '抵抗成功' : '受到伤害'}`
        };
    }

    /**
     * 处理渡劫成功
     * @param {number} resistRate - 抵抗率
     * @returns {Object} 结果
     */
    handleTribulationSuccess(resistRate) {
        const tierName = this.tribulationState.currentTier;
        const tier = TRIBULATION_TIERS[tierName];

        // 计算奖励
        const rewardMultiplier = TRIBULATION_CONFIG.baseRewardMultiplier * (1 + resistRate);
        const rewards = this.calculateRewards(tierName, rewardMultiplier);

        // 更新状态
        this.tribulationState.state = TRIBULATION_STATES.SUCCESS;
        this.tribulationState.progress = 100;
        this.tribulationState.successRateBonus = Math.min(0.1, this.tribulationState.successRateBonus + 0.02);

        // 记录天劫通过
        this.recordTribulationPass(tierName, true, resistRate);

        // 记录历史
        this.recordHistory('success', {
            tierName,
            resistRate,
            rewards
        });

        return {
            success: true,
            result: 'success',
            message: `渡${tierName}成功！抵抗率${(resistRate * 100).toFixed(1)}%`,
            resistRate,
            tierName,
            rewards,
            tierBonus: tier.rewards
        };
    }

    /**
     * 处理渡劫失败
     * @returns {Object} 结果
     */
    handleTribulationFailure() {
        const tierName = this.tribulationState.currentTier;
        const tier = TRIBULATION_TIERS[tierName];
        const resistRate = this.tribulationState.resistedAccumulated / this.tribulationState.strikesTotal;

        // 更新状态
        this.tribulationState.state = TRIBULATION_STATES.FAILED;
        this.tribulationState.progress = 0;

        // 记录天劫失败
        this.recordTribulationPass(tierName, false, resistRate);

        // 记录历史
        this.recordHistory('failed', {
            tierName,
            resistRate,
            damageTaken: this.tribulationState.damageAccumulated
        });

        return {
            success: true,
            result: 'failed',
            message: `渡${tierName}失败！抵抗率${(resistRate * 100).toFixed(1)}%`,
            resistRate,
            damageTaken: this.tribulationState.damageAccumulated,
            penalty: `损失${Math.floor(this.tribulationState.damageAccumulated * TRIBULATION_CONFIG.failurePenalty)}灵石`
        };
    }

    /**
     * 计算渡劫奖励
     * @param {string} tierName - 天劫类型名
     * @param {number} rewardMultiplier - 奖励倍率
     * @returns {Object} 奖励信息
     */
    calculateRewards(tierName, rewardMultiplier = 1.0) {
        const tier = TRIBULATION_TIERS[tierName];
        const gs = this.gameState;

        // 基础奖励
        const baseSpiritStones = 1000 * rewardMultiplier;
        const baseCultivationXP = 500 * rewardMultiplier;
        const baseMerit = 100 * rewardMultiplier;

        // 奖励类型
        const rewardType = tier.rewards[0];

        return {
            spiritStones: Math.floor(baseSpiritStones),
            cultivationXP: Math.floor(baseCultivationXP),
            merit: Math.floor(baseMerit),
            rewardType,
            rewardEffect: TRIBULATION_REWARDS[rewardType]?.effect ?? {}
        };
    }

    /**
     * 记录天劫通过
     * @param {string} tierName - 天劫类型名
     * @param {boolean} success - 是否成功
     * @param {number} resistRate - 抵抗率
     */
    recordTribulationPass(tierName, success, resistRate) {
        this.gameState.tribulationRecord = this.gameState.tribulationRecord || [];
        
        this.gameState.tribulationRecord.push({
            tier: tierName,
            success,
            resistRate,
            timestamp: Date.now(),
            realm: this.gameState.realm
        });

        // 保持记录不超过最大保存数
        if (this.gameState.tribulationRecord.length > TRIBULATION_CONFIG.maxRecordSize) {
            this.gameState.tribulationRecord = this.gameState.tribulationRecord.slice(-TRIBULATION_CONFIG.maxRecordSize);
        }
    }

    /**
     * 记录历史事件
     * @param {string} action - 操作类型
     * @param {Object} details - 详情
     */
    recordHistory(action, details) {
        this.tribulationState.history = this.tribulationState.history || [];
        
        this.tribulationState.history.push({
            action,
            details,
            timestamp: Date.now()
        });

        // 保持历史记录不超过最大保存数
        if (this.tribulationState.history.length > TRIBULATION_CONFIG.maxRecordSize) {
            this.tribulationState.history = this.tribulationState.history.slice(-TRIBULATION_CONFIG.maxRecordSize);
        }
    }

    /**
     * 领取渡劫奖励
     * @param {Object} params - { rewardIndex?: number }
     * @returns {Object} 奖励领取结果
     */
    claimReward(params = {}) {
        if (this.tribulationState.state !== TRIBULATION_STATES.SUCCESS) {
            return { success: false, error: '渡劫未成功，无法领取奖励' };
        }

        const rewardIndex = params.rewardIndex;
        const tierName = this.tribulationState.currentTier;
        const tier = TRIBULATION_TIERS[tierName];
        const rewardMultiplier = 1.0 + (this.tribulationState.resistedAccumulated / this.tribulationState.strikesTotal) * 0.5;
        const rewards = this.calculateRewards(tierName, rewardMultiplier);

        // 领取灵石
        if (rewardIndex === undefined || rewardIndex === 0) {
            this.gameState.spiritStones = (this.gameState.spiritStones ?? 0) + rewards.spiritStones;
            this.tribulationState.acquiredRewards.push({
                type: 'spiritStones',
                amount: rewards.spiritStones,
                time: Date.now()
            });
        }

        // 领取修为
        if (rewardIndex === undefined || rewardIndex === 1) {
            this.gameState.cultivationXP = (this.gameState.cultivationXP ?? 0) + rewards.cultivationXP;
            this.tribulationState.acquiredRewards.push({
                type: 'cultivationXP',
                amount: rewards.cultivationXP,
                time: Date.now()
            });
        }

        // 领取功德
        if (rewardIndex === undefined || rewardIndex === 2) {
            this.gameState.merit = (this.gameState.merit ?? 0) + rewards.merit;
            this.tribulationState.acquiredRewards.push({
                type: 'merit',
                amount: rewards.merit,
                time: Date.now()
            });
        }

        // 领取特殊奖励
        if (rewardIndex === undefined || rewardIndex === 3) {
            const rewardType = rewards.rewardType;
            if (!this.tribulationState.acquiredRewards.find(r => r.type === rewardType)) {
                this.tribulationState.acquiredRewards.push({
                    type: rewardType,
                    effect: rewards.rewardEffect,
                    time: Date.now()
                });
            }
        }

        // 重置状态
        if (rewardIndex === undefined) {
            this.tribulationState.state = TRIBULATION_STATES.NONE;
            this.tribulationState.currentTier = null;
        }

        return {
            success: true,
            message: '奖励领取成功',
            rewards,
            acquiredRewards: this.tribulationState.acquiredRewards
        };
    }

    /**
     * 查询渡劫日志
     * @param {Object} params - { limit?: number }
     * @returns {Object} 渡劫日志
     */
    queryJournal(params = {}) {
        const limit = params.limit ?? 20;
        const history = this.tribulationState.history || [];
        const records = this.gameState.tribulationRecord || [];

        return {
            success: true,
            history: history.slice(-limit),
            records: records.slice(-limit),
            totalPassed: records.filter(r => r.success).length,
            totalFailed: records.filter(r => !r.success).length
        };
    }

    /**
     * 查询当前天劫状态
     * @returns {Object} 当前状态
     */
    queryStatus() {
        return {
            success: true,
            state: this.tribulationState.state,
            currentTier: this.tribulationState.currentTier,
            progress: this.tribulationState.progress,
            strikesCurrent: this.tribulationState.strikesCurrent,
            strikesTotal: this.tribulationState.strikesTotal,
            resistRate: this.tribulationState.strikesCurrent > 0
                ? this.tribulationState.resistedAccumulated / this.tribulationState.strikesCurrent
                : 0
        };
    }
}

// ===== 导出 =====

export { TribulationService };

export default TribulationService;