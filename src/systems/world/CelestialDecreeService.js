/**
 * CelestialDecreeService.js - 天道意志系统
 * Direction T: 天道意志系统 (ruflo/thunderbolt迭代3/9)
 * 
 * 核心机制：
 * 1. CELESTIAL_DECREE (天道法旨) - 天道随机降下法旨，奖励/惩罚/任务
 * 2. FAVOR_STANCE (恩宠立场) - 天道对玩家的态度 -100到+100
 * 3. WORLD_AWAKENING (世界觉醒) - 玩家功德累计触发天道参与的游戏事件
 * 4. BLESSING (天道赐福) - 玩家可领取的天道赐福
 * 
 * 6个MCP工具：
 * - world.decree.list - 查看当前天道法旨
 * - world.decree.accept - 接受法旨任务
 * - world.favor.query - 查询恩宠值
 * - world.favor.adjust - 调整恩宠值（通过行为）
 * - world.awakening.trigger - 触发世界觉醒
 * - world.blessing.claim - 领取天道赐福
 */

// ===== 配置常量 =====

const CELESTIAL_CONFIG = {
    // 恩宠立场范围
    FAVOR_RANGE: { min: -100, max: 100 },
    
    // 法旨过期时间 (ms)
    DECREE_EXPIRE_TIME: 24 * 60 * 60 * 1000, // 24小时
    
    // 世界觉醒阈值 (功德)
    AWAKENING_MERIT_THRESHOLD: 10000,
    
    // 最大法旨数量
    MAX_DECREES: 5,
    
    // 赐福最大数量
    MAX_BLESSINGS: 3,
    
    // 赐福过期时间 (ms)
    BLESSING_EXPIRE_TIME: 7 * 24 * 60 * 60 * 1000 // 7天
};

const DECREE_TYPES = {
    REWARD: 'reward',     // 奖励型
    PUNISHMENT: 'punishment', // 惩罚型
    QUEST: 'quest'        // 任务型
};

const DECREE_STATUS = {
    ACTIVE: 'active',
    ACCEPTED: 'accepted',
    COMPLETED: 'completed',
    EXPIRED: 'expired',
    REJECTED: 'rejected'
};

const AWAKENING_TYPES = {
    QI_TIDE: 'qi_tide',           // 灵气潮汐
    BEAST_RAMPAGE: 'beast_rampage', // 妖兽暴动
    REALM_UNSEAL: 'realm_unseal'   // 秘境开启
};

const BLESSING_TYPES = {
    CULTIVATION: 'cultivation',   // 修为加成
    MERIT: 'merit',              // 功德加成
    PROTECTION: 'protection',    // 护体
    REVELATION: 'revelation'     // 天机启示
};

// ===== 天道法旨 =====

/**
 * CelestialDecree - 天道法旨对象
 */
class CelestialDecree {
    constructor(type, title, description, options = {}) {
        this.id = `decree_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.type = type; // reward/punishment/quest
        this.title = title;
        this.description = description;
        this.status = options.status || DECREE_STATUS.ACTIVE;
        this.favorImpact = options.favorImpact || 0;
        this.reward = options.reward || null;
        this.penalty = options.penalty || null;
        this.expiresAt = options.expiresAt || (Date.now() + CELESTIAL_CONFIG.DECREE_EXPIRE_TIME);
        this.createdAt = Date.now();
        this.acceptedAt = options.acceptedAt || null;
        this.completedAt = options.completedAt || null;
        this.questTarget = options.questTarget || null;
        this.questProgress = 0;
    }
    
    /**
     * 是否已过期
     */
    isExpired() {
        return Date.now() > this.expiresAt;
    }
    
    /**
     * 获取剩余时间 (ms)
     */
    getRemainingTime() {
        return Math.max(0, this.expiresAt - Date.now());
    }
    
    /**
     * 接受法旨
     */
    accept() {
        if (this.status !== DECREE_STATUS.ACTIVE) {
            return { success: false, error: 'Decree is not active' };
        }
        this.status = DECREE_STATUS.ACCEPTED;
        this.acceptedAt = Date.now();
        return { success: true };
    }
    
    /**
     * 完成法旨
     */
    complete() {
        if (this.status !== DECREE_STATUS.ACCEPTED) {
            return { success: false, error: 'Decree is not accepted' };
        }
        this.status = DECREE_STATUS.COMPLETED;
        this.completedAt = Date.now();
        return { success: true };
    }
    
    /**
     * 更新任务进度
     */
    updateProgress(progress) {
        this.questProgress = Math.min(progress, this.questTarget || progress);
        return { success: true, progress: this.questProgress };
    }
}

// ===== 天道赐福 =====

/**
 * CelestialBlessing - 天道赐福对象
 */
class CelestialBlessing {
    constructor(type, title, description, options = {}) {
        this.id = `blessing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.type = type;
        this.title = title;
        this.description = description;
        this.claimed = false;
        this.claimedAt = null;
        this.effect = options.effect || null;
        this.expiresAt = options.expiresAt || (Date.now() + CELESTIAL_CONFIG.BLESSING_EXPIRE_TIME);
        this.createdAt = Date.now();
        this.favorRequired = options.favorRequired || 0; // 需要最低恩宠值
    }
    
    /**
     * 是否已过期
     */
    isExpired() {
        return Date.now() > this.expiresAt;
    }
    
    /**
     * 领取赐福
     */
    claim() {
        if (this.claimed) {
            return { success: false, error: 'Blessing already claimed' };
        }
        if (this.isExpired()) {
            return { success: false, error: 'Blessing has expired' };
        }
        this.claimed = true;
        this.claimedAt = Date.now();
        return { success: true };
    }
}

// ===== 世界觉醒 =====

/**
 * WorldAwakening - 世界觉醒事件
 */
class WorldAwakening {
    constructor(type, title, description, options = {}) {
        this.id = `awakening_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.type = type;
        this.title = title;
        this.description = description;
        this.triggeredAt = null;
        this.meritRequired = options.meritRequired || CELESTIAL_CONFIG.AWAKENING_MERIT_THRESHOLD;
        this.rewards = options.rewards || null;
        this.duration = options.duration || 3600000; // 默认1小时
        this.active = false;
        this.endsAt = null;
    }
    
    /**
     * 触发觉醒
     */
    trigger() {
        if (this.active) {
            return { success: false, error: 'Awakening already active' };
        }
        this.active = true;
        this.triggeredAt = Date.now();
        this.endsAt = Date.now() + this.duration;
        return { success: true };
    }
    
    /**
     * 是否已结束
     */
    isEnded() {
        return this.active && Date.now() > this.endsAt;
    }
    
    /**
     * 获取剩余时间
     */
    getRemainingTime() {
        if (!this.active) return 0;
        return Math.max(0, this.endsAt - Date.now());
    }
}

// ===== 天道意志服务 =====

/**
 * CelestialDecreeService - 天道意志系统服务
 */
class CelestialDecreeService {
    constructor() {
        this.decrees = [];           // 法旨列表
        this.blessings = [];         // 赐福列表
        this.awakenings = [];        // 世界觉醒列表
        this.favor = 0;              // 恩宠立场 (-100到+100)
        this.totalMerit = 0;         // 累计功德
        this.gameState = null;       // 游戏状态引用
        this.lastDecreeTime = 0;    // 上次生成法旨时间
        this.decreeInterval = 3600000; // 法旨生成间隔 (1小时)
    }
    
    /**
     * 初始化服务
     */
    init(gameState) {
        this.gameState = gameState;
        
        // 初始化法旨系统
        if (!gameState.celestial) {
            gameState.celestial = {
                decrees: [],
                blessings: [],
                awakenings: [],
                favor: 0,
                totalMerit: 0
            };
        }
        
        // 恢复状态
        this.decrees = gameState.celestial.decrees || [];
        this.blessings = gameState.celestial.blessings || [];
        this.awakenings = gameState.celestial.awakenings || [];
        this.favor = gameState.celestial.favor || 0;
        this.totalMerit = gameState.celestial.totalMerit || 0;
        
        console.log('[CelestialDecree] 天道意志系统初始化完成');
        return { success: true };
    }
    
    /**
     * 保存状态到游戏状态
     */
    saveState() {
        if (!this.gameState) return;
        
        this.gameState.celestial = {
            decrees: this.decrees,
            blessings: this.blessings,
            awakenings: this.awakenings,
            favor: this.favor,
            totalMerit: this.totalMerit
        };
    }
    
    // ===== 法旨管理 =====
    
    /**
     * 生成随机法旨
     */
    generateDecree() {
        const types = [DECREE_TYPES.REWARD, DECREE_TYPES.PUNISHMENT, DECREE_TYPES.QUEST];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const decrees = {
            [DECREE_TYPES.REWARD]: [
                { title: '天赐灵根', description: '天道赐予你一株上品灵草', favorImpact: 10, reward: { type: 'herb', name: '上品灵草', quantity: 1 } },
                { title: '福泽深厚', description: '你的善行感动天道，获得功德加持', favorImpact: 15, reward: { type: 'merit', amount: 500 } },
                { title: '顿悟契机', description: '天机显现，你获得修炼领悟', favorImpact: 20, reward: { type: 'cultivation', amount: 1000 } }
            ],
            [DECREE_TYPES.PUNISHMENT]: [
                { title: '天谴预警', description: '你的行为引起天道注意，需要忏悔', favorImpact: -15, penalty: { type: 'cultivation', amount: 500 } },
                { title: '业火降临', description: '天劫业火焚身，修为受损', favorImpact: -20, penalty: { type: 'cultivation', amount: 1000 } },
                { title: '气运流失', description: '天道收回部分气运', favorImpact: -10, penalty: { type: 'qi', amount: 300 } }
            ],
            [DECREE_TYPES.QUEST]: [
                { title: '除魔卫道', description: '斩杀一头妖兽，证明你的实力', favorImpact: 25, questTarget: 1, reward: { type: 'merit', amount: 1000 } },
                { title: '济世救人', description: '救治10位苦难凡人', favorImpact: 30, questTarget: 10, reward: { type: 'merit', amount: 2000 } },
                { title: '护道除邪', description: '清除一个邪修巢穴', favorImpact: 35, questTarget: 1, reward: { type: 'equipment', name: '天道符箓', quantity: 1 } }
            ]
        };
        
        const options = decrees[type][Math.floor(Math.random() * decrees[type].length)];
        
        // 检查法旨数量限制
        if (this.decrees.length >= CELESTIAL_CONFIG.MAX_DECREES) {
            // 移除最旧的已过期法旨
            this.cleanupDecrees();
            if (this.decrees.length >= CELESTIAL_CONFIG.MAX_DECREES) {
                return null;
            }
        }
        
        const decree = new CelestialDecree(type, options.title, options.description, {
            favorImpact: options.favorImpact,
            reward: options.reward,
            penalty: options.penalty,
            questTarget: options.questTarget
        });
        
        this.decrees.push(decree);
        this.saveState();
        
        return decree;
    }
    
    /**
     * 清理过期法旨
     */
    cleanupDecrees() {
        const before = this.decrees.length;
        this.decrees = this.decrees.filter(d => !d.isExpired() || d.status === DECREE_STATUS.ACCEPTED);
        return { removed: before - this.decrees.length };
    }
    
    /**
     * 获取法旨列表
     */
    listDecrees(options = {}) {
        // 清理过期法旨
        this.cleanupDecrees();
        
        let result = [...this.decrees];
        
        // 按状态过滤
        if (options.status) {
            result = result.filter(d => d.status === options.status);
        }
        
        // 按类型过滤
        if (options.type) {
            result = result.filter(d => d.type === options.type);
        }
        
        // 排序 (新在前)
        result.sort((a, b) => b.createdAt - a.createdAt);
        
        return {
            success: true,
            decrees: result.map(d => ({
                id: d.id,
                type: d.type,
                title: d.title,
                description: d.description,
                status: d.status,
                favorImpact: d.favorImpact,
                reward: d.reward,
                penalty: d.penalty,
                questTarget: d.questTarget,
                questProgress: d.questProgress,
                remainingTime: d.getRemainingTime(),
                createdAt: d.createdAt
            })),
            total: result.length
        };
    }
    
    /**
     * 接受法旨
     */
    acceptDecree(decreeId) {
        const decree = this.decrees.find(d => d.id === decreeId);
        if (!decree) {
            return { success: false, error: 'Decree not found' };
        }
        
        if (decree.status !== DECREE_STATUS.ACTIVE) {
            return { success: false, error: `Decree is ${decree.status}, cannot accept` };
        }
        
        if (decree.isExpired()) {
            decree.status = DECREE_STATUS.EXPIRED;
            this.saveState();
            return { success: false, error: 'Decree has expired' };
        }
        
        const result = decree.accept();
        if (result.success) {
            this.saveState();
        }
        
        return {
            ...result,
            decree: {
                id: decree.id,
                type: decree.type,
                title: decree.title,
                status: decree.status
            }
        };
    }
    
    /**
     * 完成法旨任务
     */
    completeDecreeQuest(decreeId, progress) {
        const decree = this.decrees.find(d => d.id === decreeId);
        if (!decree) {
            return { success: false, error: 'Decree not found' };
        }
        
        if (decree.status !== DECREE_STATUS.ACCEPTED) {
            return { success: false, error: 'Decree is not accepted' };
        }
        
        if (!decree.questTarget) {
            return { success: false, error: 'Decree is not a quest type' };
        }
        
        decree.updateProgress(progress);
        this.saveState();
        
        if (progress >= decree.questTarget) {
            const completeResult = decree.complete();
            if (completeResult.success) {
                // 应用奖励/惩罚
                this.applyDecreeEffect(decree);
                // 调整恩宠
                this.adjustFavor(decree.favorImpact, `法旨完成: ${decree.title}`);
            }
        }
        
        return {
            success: true,
            progress: decree.questProgress,
            target: decree.questTarget,
            completed: progress >= decree.questTarget
        };
    }
    
    /**
     * 应用法旨效果
     */
    applyDecreeEffect(decree) {
        if (decree.reward) {
            this.applyReward(decree.reward);
        }
        if (decree.penalty) {
            this.applyPenalty(decree.penalty);
        }
    }
    
    /**
     * 应用奖励
     */
    applyReward(reward) {
        if (!this.gameState) return;
        
        switch (reward.type) {
            case 'herb':
            case 'equipment':
                // 添加到背包
                if (!this.gameState.inventory.items) {
                    this.gameState.inventory.items = [];
                }
                this.gameState.inventory.items.push({
                    name: reward.name,
                    type: reward.type,
                    quantity: reward.quantity || 1,
                    quality: '精良'
                });
                break;
            case 'merit':
                this.addMerit(reward.amount);
                break;
            case 'cultivation':
                this.gameState.cultivationXP = (this.gameState.cultivationXP || 0) + reward.amount;
                break;
        }
    }
    
    /**
     * 应用惩罚
     */
    applyPenalty(penalty) {
        if (!this.gameState) return;
        
        switch (penalty.type) {
            case 'cultivation':
                this.gameState.cultivationXP = Math.max(0, (this.gameState.cultivationXP || 0) - penalty.amount);
                break;
            case 'qi':
                this.gameState.player.qi = Math.max(0, (this.gameState.player.qi || 0) - penalty.amount);
                break;
        }
    }
    
    // ===== 恩宠管理 =====
    
    /**
     * 查询恩宠值
     */
    queryFavor() {
        const stance = this.getFavorStance();
        return {
            success: true,
            favor: this.favor,
            stance: stance,
            range: CELESTIAL_CONFIG.FAVOR_RANGE
        };
    }
    
    /**
     * 获取恩宠立场描述
     */
    getFavorStance() {
        if (this.favor >= 80) return '天道眷顾';
        if (this.favor >= 50) return '颇受眷顾';
        if (this.favor >= 20) return '略有眷顾';
        if (this.favor >= -20) return '中立';
        if (this.favor >= -50) return '略有厌弃';
        if (this.favor >= -80) return '颇受厌弃';
        return '天道厌弃';
    }
    
    /**
     * 调整恩宠值
     */
    adjustFavor(amount, reason = '') {
        const oldFavor = this.favor;
        this.favor = Math.max(
            CELESTIAL_CONFIG.FAVOR_RANGE.min,
            Math.min(CELESTIAL_CONFIG.FAVOR_RANGE.max, this.favor + amount)
        );
        
        this.saveState();
        
        return {
            success: true,
            oldFavor,
            newFavor: this.favor,
            change: amount,
            reason,
            newStance: this.getFavorStance()
        };
    }
    
    // ===== 世界觉醒 =====
    
    /**
     * 检查是否可以触发世界觉醒
     */
    canTriggerAwakening() {
        return this.totalMerit >= CELESTIAL_CONFIG.AWAKENING_MERIT_THRESHOLD;
    }
    
    /**
     * 触发世界觉醒
     */
    triggerAwakening(type) {
        // 检查是否有激活的觉醒
        const activeAwakening = this.awakenings.find(a => a.active && !a.isEnded());
        if (activeAwakening) {
            return {
                success: false,
                error: 'A world awakening is already active',
                activeAwakening: {
                    id: activeAwakening.id,
                    type: activeAwakening.type,
                    title: activeAwakening.title,
                    remainingTime: activeAwakening.getRemainingTime()
                }
            };
        }
        
        // 检查是否满足触发条件
        if (!this.canTriggerAwakening()) {
            return {
                success: false,
                error: 'Merit threshold not reached',
                currentMerit: this.totalMerit,
                requiredMerit: CELESTIAL_CONFIG.AWAKENING_MERIT_THRESHOLD
            };
        }
        
        const awakeningConfigs = {
            [AWAKENING_TYPES.QI_TIDE]: {
                title: '灵气潮汐',
                description: '天地灵气涌动，修炼效率大幅提升',
                rewards: { cultivationBonus: 2.0 },
                duration: 3600000
            },
            [AWAKENING_TYPES.BEAST_RAMPAGE]: {
                title: '妖兽暴动',
                description: '妖兽群起暴动，击杀可获大量功德',
                rewards: { meritBonus: 1.5, expBonus: 1.5 },
                duration: 7200000
            },
            [AWAKENING_TYPES.REALM_UNSEAL]: {
                title: '秘境开启',
                description: '上古秘境现世，内有无限机缘',
                rewards: { artifactBonus: 3.0, treasureChance: 0.5 },
                duration: 3600000
            }
        };
        
        const config = awakeningConfigs[type];
        if (!config) {
            return { success: false, error: 'Invalid awakening type' };
        }
        
        const awakening = new WorldAwakening(type, config.title, config.description, {
            rewards: config.rewards,
            duration: config.duration
        });
        
        const result = awakening.trigger();
        if (result.success) {
            this.awakenings.push(awakening);
            this.saveState();
        }
        
        return {
            ...result,
            awakening: {
                id: awakening.id,
                type: awakening.type,
                title: awakening.title,
                description: awakening.description,
                remainingTime: awakening.getRemainingTime()
            }
        };
    }
    
    /**
     * 获取世界觉醒状态
     */
    getAwakeningStatus() {
        const activeAwakening = this.awakenings.find(a => a.active && !a.isEnded());
        
return {
            success: true,
            activeAwakening: activeAwakening ? {
                id: activeAwakening.id,
                type: activeAwakening.type,
                title: activeAwakening.title,
                description: activeAwakening.description,
                rewards: activeAwakening.rewards,
                remainingTime: activeAwakening.getRemainingTime(),
                endsAt: activeAwakening.endsAt
            } : null,
            currentMerit: this.totalMerit,
            meritThreshold: CELESTIAL_CONFIG.AWAKENING_MERIT_THRESHOLD,
            canAwakening: this.canTriggerAwakening() ? true : false,
            availableTypes: Object.keys(AWAKENING_TYPES)
        };
    }
    
    /**
     * 更新世界觉醒状态
     */
    updateAwakenings() {
        for (const awakening of this.awakenings) {
            if (awakening.active && awakening.isEnded()) {
                awakening.active = false;
            }
        }
        this.saveState();
    }
    
    // ===== 天道赐福 =====
    
    /**
     * 生成赐福
     */
    generateBlessing() {
        if (this.blessings.length >= CELESTIAL_CONFIG.MAX_BLESSINGS) {
            return null;
        }
        
        const blessingTemplates = [
            { type: BLESSING_TYPES.CULTIVATION, title: '天道加持', description: '修炼速度提升50%', favorRequired: 30, effect: { cultivationSpeed: 1.5 } },
            { type: BLESSING_TYPES.MERIT, title: '功德灌顶', description: '获取功德时获得额外20%加成', favorRequired: 50, effect: { meritBonus: 1.2 } },
            { type: BLESSING_TYPES.PROTECTION, title: '天道护体', description: '受到致命伤害时免除一次', favorRequired: 40, effect: { surviveFatal: true } },
            { type: BLESSING_TYPES.REVELATION, title: '天机启示', description: '下一次突破成功率提升30%', favorRequired: 20, effect: { breakthroughBonus: 0.3 } }
        ];
        
        // 根据恩宠值筛选可用赐福
        const available = blessingTemplates.filter(b => this.favor >= b.favorRequired);
        if (available.length === 0) return null;
        
        const template = available[Math.floor(Math.random() * available.length)];
        const blessing = new CelestialBlessing(template.type, template.title, template.description, {
            effect: template.effect,
            favorRequired: template.favorRequired
        });
        
        this.blessings.push(blessing);
        this.saveState();
        
        return blessing;
    }
    
    /**
     * 领取赐福
     */
    claimBlessing(blessingId) {
        const blessing = this.blessings.find(b => b.id === blessingId);
        if (!blessing) {
            return { success: false, error: 'Blessing not found' };
        }
        
        // 检查恩宠值是否满足
        if (this.favor < blessing.favorRequired) {
            return {
                success: false,
                error: 'Favor level too low',
                required: blessing.favorRequired,
                current: this.favor
            };
        }
        
        const result = blessing.claim();
        if (result.success) {
            this.applyBlessingEffect(blessing);
            this.saveState();
        }
        
        return {
            ...result,
            blessing: {
                id: blessing.id,
                type: blessing.type,
                title: blessing.title
            }
        };
    }
    
    /**
     * 应用赐福效果
     */
    applyBlessingEffect(blessing) {
        if (!this.gameState) return;
        
        if (!this.gameState.blessings) {
            this.gameState.blessings = [];
        }
        
        this.gameState.blessings.push({
            id: blessing.id,
            type: blessing.type,
            title: blessing.title,
            effect: blessing.effect,
            expiresAt: blessing.expiresAt
        });
    }
    
    /**
     * 获取可用赐福列表
     */
    listBlessings(options = {}) {
        // 清理过期赐福
        const validBlessings = this.blessings.filter(b => !b.claimed && !b.isExpired());
        
        let result = [...validBlessings];
        
        if (options.unclaimedOnly) {
            result = result.filter(b => !b.claimed);
        }
        
        // 按恩宠要求排序
        result.sort((a, b) => b.favorRequired - a.favorRequired);
        
        return {
            success: true,
            blessings: result.map(b => ({
                id: b.id,
                type: b.type,
                title: b.title,
                description: b.description,
                effect: b.effect,
                favorRequired: b.favorRequired,
                claimed: b.claimed,
                remainingTime: typeof b.getRemainingTime === 'function' ? b.getRemainingTime() : 0,
                createdAt: b.createdAt
            })),
            total: result.length
        };
    }
    
    // ===== 功德管理 =====
    
    /**
     * 添加功德
     */
    addMerit(amount) {
        this.totalMerit += amount;
        this.saveState();
        return { success: true, totalMerit: this.totalMerit };
    }
    
    /**
     * 消耗功德
     */
    consumeMerit(amount) {
        if (this.totalMerit < amount) {
            return { success: false, error: 'Insufficient merit' };
        }
        this.totalMerit -= amount;
        this.saveState();
        return { success: true, totalMerit: this.totalMerit };
    }
    
    /**
     * 获取功德状态
     */
    getMeritStatus() {
        return {
            success: true,
            totalMerit: this.totalMerit,
            awakeningThreshold: CELESTIAL_CONFIG.AWAKENING_MERIT_THRESHOLD,
            canAwakening: this.canTriggerAwakening()
        };
    }
    
    // ===== 定期生成 =====
    
    /**
     * 尝试生成新的法旨
     */
    tryGenerateDecree() {
        const now = Date.now();
        if (now - this.lastDecreeTime < this.decreeInterval) {
            return { success: false, error: 'Too soon to generate new decree' };
        }
        
        const decree = this.generateDecree();
        if (decree) {
            this.lastDecreeTime = now;
            return {
                success: true,
                decree: {
                    id: decree.id,
                    type: decree.type,
                    title: decree.title,
                    description: decree.description
                }
            };
        }
        
        return { success: false, error: 'Could not generate decree' };
    }
    
    /**
     * 尝试生成赐福
     */
    tryGenerateBlessing() {
        const blessing = this.generateBlessing();
        if (blessing) {
            return {
                success: true,
                blessing: {
                    id: blessing.id,
                    type: blessing.type,
                    title: blessing.title,
                    description: blessing.description
                }
            };
        }
        return { success: false, error: 'Could not generate blessing' };
    }
    
    /**
     * 重置服务
     */
    reset() {
        this.decrees = [];
        this.blessings = [];
        this.awakenings = [];
        this.favor = 0;
        this.totalMerit = 0;
        this.lastDecreeTime = 0;
        this.saveState();
        return { success: true };
    }
    
    /**
     * 获取统计信息
     */
    getStats() {
        this.updateAwakenings();
        
        return {
            success: true,
            favor: this.favor,
            stance: this.getFavorStance(),
            totalMerit: this.totalMerit,
            decreeCount: this.decrees.length,
            activeDecreeCount: this.decrees.filter(d => d.status === DECREE_STATUS.ACTIVE || d.status === DECREE_STATUS.ACCEPTED).length,
            blessingCount: this.blessings.length,
            unclaimedBlessingCount: this.blessings.filter(b => !b.claimed).length,
            awakeningActive: this.awakenings.some(a => a.active && !a.isEnded()),
            canAwakening: this.canTriggerAwakening()
        };
    }
}

// ===== MCP工具实现 =====

/**
 * world.decree.list - 查看当前天道法旨
 */
function mcpDecreeList(params = {}) {
    return celestialDecreeService.listDecrees(params || {});
}

/**
 * world.decree.accept - 接受法旨任务
 */
function mcpDecreeAccept(params = {}) {
    const { decreeId } = params || {};
    if (!decreeId) {
        return { success: false, error: 'decreeId is required' };
    }
    return celestialDecreeService.acceptDecree(decreeId);
}

/**
 * world.favor.query - 查询恩宠值
 */
function mcpFavorQuery(params = {}) {
    return celestialDecreeService.queryFavor();
}

/**
 * world.favor.adjust - 调整恩宠值（通过行为）
 */
function mcpFavorAdjust(params = {}) {
    const { amount, reason } = params || {};
    if (typeof amount !== 'number') {
        return { success: false, error: 'amount is required and must be a number' };
    }
    return celestialDecreeService.adjustFavor(amount, reason || '');
}

/**
 * world.awakening.trigger - 触发世界觉醒
 */
function mcpAwakeningTrigger(params = {}) {
    const { type } = params || {};
    if (!type) {
        return { success: false, error: 'type is required' };
    }
    return celestialDecreeService.triggerAwakening(type);
}

/**
 * world.blessing.claim - 领取天道赐福
 */
function mcpBlessingClaim(params = {}) {
    const { blessingId } = params || {};
    if (!blessingId) {
        return { success: false, error: 'blessingId is required' };
    }
    return celestialDecreeService.claimBlessing(blessingId);
}

// ===== MCP工具定义 =====

export const CELESTIAL_DECREE_TOOLS = {
    'world.decree.list': {
        name: 'world.decree.list',
        description: '查看当前天道法旨列表',
        inputSchema: {
            type: 'object',
            properties: {
                status: { type: 'string', description: '过滤状态 (active/accepted/completed/expired)' },
                type: { type: 'string', description: '过滤类型 (reward/punishment/quest)' }
            }
        }
    },
    'world.decree.accept': {
        name: 'world.decree.accept',
        description: '接受一个天道法旨任务',
        inputSchema: {
            type: 'object',
            properties: {
                decreeId: { type: 'string', description: '法旨ID' }
            },
            required: ['decreeId']
        }
    },
    'world.favor.query': {
        name: 'world.favor.query',
        description: '查询当前恩宠立场',
        inputSchema: { type: 'object', properties: {} }
    },
    'world.favor.adjust': {
        name: 'world.favor.adjust',
        description: '调整恩宠值（通过行为触发）',
        inputSchema: {
            type: 'object',
            properties: {
                amount: { type: 'number', description: '调整数值（正负）' },
                reason: { type: 'string', description: '调整原因' }
            },
            required: ['amount']
        }
    },
    'world.awakening.trigger': {
        name: 'world.awakening.trigger',
        description: '触发世界觉醒事件',
        inputSchema: {
            type: 'object',
            properties: {
                type: { type: 'string', description: '觉醒类型 (qi_tide/beast_rampage/realm_unseal)' }
            },
            required: ['type']
        }
    },
    'world.blessing.claim': {
        name: 'world.blessing.claim',
        description: '领取天道赐福',
        inputSchema: {
            type: 'object',
            properties: {
                blessingId: { type: 'string', description: '赐福ID' }
            },
            required: ['blessingId']
        }
    }
};

// ===== 全局实例 =====

const celestialDecreeService = new CelestialDecreeService();

// ===== 导出 =====

export {
    CelestialDecreeService,
    CelestialDecree,
    CelestialBlessing,
    WorldAwakening,
    celestialDecreeService,
    CELESTIAL_CONFIG,
    DECREE_TYPES,
    DECREE_STATUS,
    AWAKENING_TYPES,
    BLESSING_TYPES,
    mcpDecreeList,
    mcpDecreeAccept,
    mcpFavorQuery,
    mcpFavorAdjust,
    mcpAwakeningTrigger,
    mcpBlessingClaim
};

export default CelestialDecreeService;