/**
 * CosmicCycleService.js - 天道意志终极系统
 * V238 Direction Z: 天道意志终极系统 (thunderbolt/ruflo - 最终轮9/9)
 * 
 * 核心机制：
 * 1. COSMIC_CYCLE (宇宙轮回) - 宇宙轮回周期管理
 * 2. WORLD_EVOLUTION (世界演化) - 世界等级和演化
 * 3. HEAVEN_JUDGMENT (天道裁决) - 天道对玩家的最终裁决
 * 4. LEGACY_INHERIT (传承遗产) - 轮回时传承遗产
 * 5. ULTIMATE_HEAVEN (终极天道) - 连接所有系统
 * 
 * 6个MCP工具：
 * - cosmic.cycle.query - 查询宇宙轮回状态
 * - cosmic.world.evolve - 触发世界演化
 * - cosmic.heaven.judge - 天道裁决
 * - cosmic.blessing.grant - 天道赐福
 * - cosmic.reset.execute - 执行宇宙重置
 * - cosmic.legacy.inherit - 传承遗产
 */

// ===== 配置常量 =====

const COSMIC_CONFIG = {
    // 轮回周期 (ms) - 一个宇宙轮回
    CYCLE_DURATION: 1000 * 60 * 60 * 24 * 365, // 1年虚拟时间
    
    // 世界等级范围
    WORLD_LEVEL_RANGE: { min: 1, max: 100 },
    
    // 裁决阈值
    JUDGMENT_THRESHOLD: {
        BLESSED: 10000,    // 大善人
        RIGHTEOUS: 5000,  // 正道
        NEUTRAL: 0,       // 中立
        EVIL: -5000,      // 邪道
        DAMNED: -10000    // 大恶人
    },
    
    // 传承保留比例
    LEGACY_RETENTION_RATIO: 0.5,
    
    // 最大遗产数量
    MAX_LEGACY_ITEMS: 10,
    
    // 赐福最大数量
    MAX_COSMIC_BLESSINGS: 5,
    
    // 重置冷却 (ms)
    RESET_COOLDOWN: 1000 * 60 * 60 * 24 * 30 // 30天
};

const CYCLE_PHASES = {
    CREATION: 'creation',     // 创世期
    EVOLUTION: 'evolution',   // 演化期
    FLORAGE: 'florage',       // 繁荣期
    DECAY: 'decay',           // 衰败期
    RENEWAL: 'renewal'        // 新生期
};

const WORLD_EVOLUTION_STAGES = {
    PRIMORDIAL: 'primordial',       // 混沌
    FORMING: 'forming',             // 成形
    STABLE: 'stable',               // 稳定
    FLOURISHING: 'flourishing',     // 繁荣
    TRANSENDING: 'transending',    // 飞升
    CELESTIAL: 'celestial'         // 天界
};

const JUDGMENT_TYPES = {
    BLESSING: 'blessing',           // 天道赐福裁决
    PUNISHMENT: 'punishment',      // 天道惩罚裁决
    TRIAL: 'trial',                 // 天道考验
    ASCENSION: 'ascension'         // 飞升裁决
};

const LEGACY_TYPES = {
    CULTIVATION: 'cultivation',     // 修为传承
    MERIT: 'merit',                 // 功德传承
    TREASURE: 'treasure',          // 灵宝传承
    WISDOM: 'wisdom'                // 智慧传承
};

// ===== 宇宙轮回 =====

/**
 * CosmicCycle - 宇宙轮回对象
 */
class CosmicCycle {
    constructor(options = {}) {
        this.id = `cycle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.cycleNumber = options.cycleNumber || 1;
        this.startTime = options.startTime || Date.now();
        this.endTime = options.endTime || (this.startTime + COSMIC_CONFIG.CYCLE_DURATION);
        this.currentPhase = options.currentPhase || CYCLE_PHASES.CREATION;
        this.worldLevel = options.worldLevel || 1;
        this.completed = false;
        this.completedAt = null;
        this.events = [];
    }
    
    /**
     * 获取已过时间 (ms)
     */
    getElapsedTime() {
        return Date.now() - this.startTime;
    }
    
    /**
     * 获取剩余时间 (ms)
     */
    getRemainingTime() {
        return Math.max(0, this.endTime - Date.now());
    }
    
    /**
     * 获取进度 (0-1)
     */
    getProgress() {
        const elapsed = this.getElapsedTime();
        const total = COSMIC_CONFIG.CYCLE_DURATION;
        return Math.min(1, elapsed / total);
    }
    
    /**
     * 更新阶段
     */
    updatePhase() {
        const progress = this.getProgress();
        
        if (progress < 0.2) {
            this.currentPhase = CYCLE_PHASES.CREATION;
        } else if (progress < 0.4) {
            this.currentPhase = CYCLE_PHASES.EVOLUTION;
        } else if (progress < 0.7) {
            this.currentPhase = CYCLE_PHASES.FLORAGE;
        } else if (progress < 0.9) {
            this.currentPhase = CYCLE_PHASES.DECAY;
        } else {
            this.currentPhase = CYCLE_PHASES.RENEWAL;
        }
        
        return this.currentPhase;
    }
    
    /**
     * 完成轮回
     */
    complete() {
        this.completed = true;
        this.completedAt = Date.now();
        return { success: true, cycleNumber: this.cycleNumber };
    }
    
    /**
     * 添加事件
     */
    addEvent(type, description, data = {}) {
        this.events.push({
            type,
            description,
            data,
            timestamp: Date.now()
        });
    }
}

// ===== 世界演化 =====

/**
 * WorldEvolution - 世界演化对象
 */
class WorldEvolution {
    constructor(options = {}) {
        this.id = `evolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.stage = options.stage || WORLD_EVOLUTION_STAGES.PRIMORDIAL;
        this.level = options.level || 1;
        this.experience = options.experience || 0;
        this.requiredExperience = options.requiredExperience || 1000;
        this.meritBonus = options.meritBonus || 1.0;
        this.cultivationSpeedBonus = options.cultivationSpeedBonus || 1.0;
        this.blessingPower = options.blessingPower || 1.0;
        this.lastEvolutionAt = options.lastEvolutionAt || Date.now();
        this.evolved = false;
    }
    
    /**
     * 增加经验
     */
    addExperience(amount) {
        this.experience += amount;
        this.lastEvolutionAt = Date.now();
        
        if (this.experience >= this.requiredExperience && this.level < COSMIC_CONFIG.WORLD_LEVEL_RANGE.max) {
            return this.evolve();
        }
        
        return { evolved: false, experience: this.experience };
    }
    
    /**
     * 进化
     */
    evolve() {
        this.level++;
        this.experience = 0;
        this.requiredExperience = Math.floor(this.requiredExperience * 1.5);
        this.evolved = true;
        
        // 更新阶段
        const stages = Object.values(WORLD_EVOLUTION_STAGES);
        const currentIndex = stages.indexOf(this.stage);
        if (currentIndex < stages.length - 1) {
            this.stage = stages[currentIndex + 1];
        }
        
        // 更新加成
        this.meritBonus = 1 + (this.level * 0.1);
        this.cultivationSpeedBonus = 1 + (this.level * 0.05);
        this.blessingPower = 1 + (this.level * 0.2);
        
        return {
            evolved: true,
            level: this.level,
            stage: this.stage,
            bonuses: {
                meritBonus: this.meritBonus,
                cultivationSpeedBonus: this.cultivationSpeedBonus,
                blessingPower: this.blessingPower
            }
        };
    }
    
    /**
     * 获取升级进度 (0-1)
     */
    getUpgradeProgress() {
        return Math.min(1, this.experience / this.requiredExperience);
    }
}

// ===== 天道裁决 =====

/**
 * HeavenJudgment - 天道裁决对象
 */
class HeavenJudgment {
    constructor(type, description, options = {}) {
        this.id = `judgment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.type = type;
        this.description = description;
        this.targetPlayerId = options.targetPlayerId || null;
        this.karmaValue = options.karmaValue || 0;
        this.meritValue = options.meritValue || 0;
        this.result = options.result || null; // blessing/punishment/trial
        this.executed = false;
        this.executedAt = null;
        this.effects = options.effects || {};
        this.createdAt = Date.now();
    }
    
    /**
     * 执行裁决
     */
    execute() {
        if (this.executed) {
            return { success: false, error: 'Judgment already executed' };
        }
        
        this.executed = true;
        this.executedAt = Date.now();
        
        // 根据karma值确定结果
        const karma = this.karmaValue;
        
        if (karma >= COSMIC_CONFIG.JUDGMENT_THRESHOLD.BLESSED) {
            this.result = JUDGMENT_TYPES.BLESSING;
        } else if (karma <= COSMIC_CONFIG.JUDGMENT_THRESHOLD.DAMNED) {
            this.result = JUDGMENT_TYPES.PUNISHMENT;
        } else if (karma >= COSMIC_CONFIG.JUDGMENT_THRESHOLD.RIGHTEOUS) {
            this.result = JUDGMENT_TYPES.ASCENSION;
        } else if (karma <= COSMIC_CONFIG.JUDGMENT_THRESHOLD.EVIL) {
            this.result = JUDGMENT_TYPES.TRIAL;
        } else {
            this.result = Math.random() > 0.5 ? JUDGMENT_TYPES.BLESSING : JUDGMENT_TYPES.TRIAL;
        }
        
        return {
            success: true,
            result: this.result,
            effects: this.effects
        };
    }
}

// ===== 宇宙赐福 =====

/**
 * CosmicBlessing - 宇宙级赐福
 */
class CosmicBlessing {
    constructor(type, title, description, options = {}) {
        this.id = `cosmic_blessing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.type = type;
        this.title = title;
        this.description = description;
        this.power = options.power || 1.0;
        this.duration = options.duration || COSMIC_CONFIG.CYCLE_DURATION;
        this.grantedAt = Date.now();
        this.grantedBy = options.grantedBy || '天道';
        this.targetPlayerId = options.targetPlayerId || null;
        this.claimed = false;
        this.claimedAt = null;
        this.effects = options.effects || {};
    }
    
    /**
     * 是否已过期
     */
    isExpired() {
        return Date.now() > (this.grantedAt + this.duration);
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
        return { success: true, effects: this.effects };
    }
}

// ===== 传承遗产 =====

/**
 * LegacyInheritance - 传承遗产对象
 */
class LegacyInheritance {
    constructor(type, name, description, options = {}) {
        this.id = `legacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.type = type;
        this.name = name;
        this.description = description;
        this.value = options.value || 1;
        this.quality = options.quality || '普通';
        this.rarity = options.rarity || 'common';
        this.retentionRatio = options.retentionRatio || COSMIC_CONFIG.LEGACY_RETENTION_RATIO;
        this.preserved = options.preserved || false;
        this.sourceCycle = options.sourceCycle || 1;
        this.createdAt = Date.now();
    }
    
    /**
     * 获取传承值
     */
    getInheritedValue() {
        return Math.floor(this.value * this.retentionRatio);
    }
    
    /**
     * 激活传承
     */
    activate() {
        this.preserved = true;
        return {
            success: true,
            inheritedValue: this.getInheritedValue()
        };
    }
}

// ===== 天道意志终极服务 =====

/**
 * CosmicCycleService - 天道意志终极系统服务
 */
class CosmicCycleService {
    constructor() {
        this.gameState = null;
        this.currentCycle = null;
        this.worldEvolution = null;
        this.judgments = [];
        this.cosmicBlessings = [];
        this.legacies = [];
        this.lastResetTime = null;
        this.totalCycles = 0;
    }
    
    /**
     * 初始化服务
     */
    init(gameState) {
        this.gameState = gameState;
        
        // 初始化宇宙轮回系统
        if (!gameState.cosmic) {
            gameState.cosmic = {
                currentCycle: null,
                worldEvolution: null,
                judgments: [],
                cosmicBlessings: [],
                legacies: [],
                lastResetTime: null,
                totalCycles: 0
            };
        }
        
        // 恢复状态
        this.currentCycle = gameState.cosmic.currentCycle;
        this.worldEvolution = gameState.cosmic.worldEvolution;
        this.judgments = gameState.cosmic.judgments || [];
        this.cosmicBlessings = gameState.cosmic.cosmicBlessings || [];
        this.legacies = gameState.cosmic.legacies || [];
        this.lastResetTime = gameState.cosmic.lastResetTime;
        this.totalCycles = gameState.cosmic.totalCycles || 0;
        
        // 如果没有当前轮回，创建一个
        if (!this.currentCycle || this.currentCycle.completed) {
            this.startNewCycle();
        }
        
        // 如果没有世界演化，创建一个
        if (!this.worldEvolution) {
            this.worldEvolution = new WorldEvolution();
            this.saveState();
        }
        
        console.log('[CosmicCycle] 天道意志终极系统初始化完成');
        return { success: true };
    }
    
    /**
     * 保存状态到游戏状态
     */
    saveState() {
        if (!this.gameState) return;
        
        this.gameState.cosmic = {
            currentCycle: this.currentCycle,
            worldEvolution: this.worldEvolution,
            judgments: this.judgments,
            cosmicBlessings: this.cosmicBlessings,
            legacies: this.legacies,
            lastResetTime: this.lastResetTime,
            totalCycles: this.totalCycles
        };
    }
    
    // ===== 轮回管理 =====
    
    /**
     * 开始新轮回
     */
    startNewCycle() {
        if (this.currentCycle && !this.currentCycle.completed) {
            // 完成当前轮回
            this.currentCycle.complete();
        }
        
        this.totalCycles++;
        
        this.currentCycle = new CosmicCycle({
            cycleNumber: this.totalCycles,
            startTime: Date.now()
        });
        
        this.saveState();
        
        console.log(`[CosmicCycle] 宇宙轮回 #${this.totalCycles} 开始`);
        
        return {
            success: true,
            cycle: this.getCycleInfo()
        };
    }
    
    /**
     * 获取轮回信息
     */
    getCycleInfo() {
        if (!this.currentCycle) return null;
        
        return {
            id: this.currentCycle.id,
            cycleNumber: this.currentCycle.cycleNumber,
            startTime: this.currentCycle.startTime,
            endTime: this.currentCycle.endTime,
            currentPhase: this.currentCycle.currentPhase,
            worldLevel: this.currentCycle.worldLevel,
            progress: this.currentCycle.getProgress(),
            elapsedTime: this.currentCycle.getElapsedTime(),
            remainingTime: this.currentCycle.getRemainingTime(),
            completed: this.currentCycle.completed,
            events: this.currentCycle.events.slice(-10) // 最近10个事件
        };
    }
    
    /**
     * 更新轮回阶段
     */
    updateCyclePhase() {
        if (!this.currentCycle || this.currentCycle.completed) {
            return { success: false, error: 'No active cycle' };
        }
        
        const oldPhase = this.currentCycle.currentPhase;
        const newPhase = this.currentCycle.updatePhase();
        
        if (oldPhase !== newPhase) {
            this.currentCycle.addEvent('phase_change', `轮回阶段从 ${oldPhase} 变为 ${newPhase}`);
            this.saveState();
        }
        
        return {
            success: true,
            oldPhase,
            newPhase,
            progress: this.currentCycle.getProgress()
        };
    }
    
    // ===== 世界演化管理 =====
    
    /**
     * 获取世界演化信息
     */
    getWorldEvolutionInfo() {
        if (!this.worldEvolution) {
            this.worldEvolution = new WorldEvolution();
        }
        
        return {
            id: this.worldEvolution.id,
            stage: this.worldEvolution.stage,
            level: this.worldEvolution.level,
            experience: this.worldEvolution.experience,
            requiredExperience: this.worldEvolution.requiredExperience,
            upgradeProgress: this.worldEvolution.getUpgradeProgress(),
            bonuses: {
                meritBonus: this.worldEvolution.meritBonus,
                cultivationSpeedBonus: this.worldEvolution.cultivationSpeedBonus,
                blessingPower: this.worldEvolution.blessingPower
            },
            lastEvolutionAt: this.worldEvolution.lastEvolutionAt
        };
    }
    
    /**
     * 触发世界演化
     */
    triggerWorldEvolution(options = {}) {
        if (!this.worldEvolution) {
            this.worldEvolution = new WorldEvolution();
        }
        
        const experienceAmount = options.experience || 100;
        const result = this.worldEvolution.addExperience(experienceAmount);
        
        this.currentCycle?.addEvent('world_evolution', `世界演化触发，获得 ${experienceAmount} 经验`, result);
        this.saveState();
        
        return {
            success: true,
            evolution: this.getWorldEvolutionInfo(),
            result
        };
    }
    
    // ===== 天道裁决 =====
    
    /**
     * 执行天道裁决
     */
    executeJudgment(options = {}) {
        const karmaValue = options.karmaValue || this.gameState?.player?.karmaPoints || 0;
        const meritValue = options.meritValue || 0;
        
        const judgment = new HeavenJudgment(
            options.type || JUDGMENT_TYPES.TRIAL,
            options.description || '天道对玩家的裁决',
            {
                targetPlayerId: options.targetPlayerId,
                karmaValue,
                meritValue,
                effects: options.effects || {}
            }
        );
        
        const executeResult = judgment.execute();
        this.judgments.push(judgment);
        
        // 应用裁决效果
        if (executeResult.success) {
            this.applyJudgmentEffect(judgment);
        }
        
        this.currentCycle?.addEvent('judgment', `天道裁决: ${judgment.result}`, executeResult);
        this.saveState();
        
        return {
            success: true,
            judgment: {
                id: judgment.id,
                type: judgment.type,
                result: judgment.result,
                karmaValue: judgment.karmaValue,
                executed: judgment.executed
            },
            executeResult
        };
    }
    
    /**
     * 应用裁决效果
     */
    applyJudgmentEffect(judgment) {
        if (!this.gameState) return;
        
        const result = judgment.result;
        const effects = judgment.effects;
        
        switch (result) {
            case JUDGMENT_TYPES.BLESSING:
                // 赐福效果
                this.gameState.player.qi = (this.gameState.player.qi || 0) + (effects.qiBonus || 100);
                this.gameState.cultivationXP = (this.gameState.cultivationXP || 0) + (effects.cultivationBonus || 500);
                this.grantCosmicBlessing({
                    type: 'judgment_blessing',
                    title: '天道恩赐',
                    description: '因你的善行，天道赐予你无上恩典',
                    power: effects.power || 2.0,
                    effects: effects
                });
                break;
                
            case JUDGMENT_TYPES.PUNISHMENT:
                // 惩罚效果
                this.gameState.player.qi = Math.max(0, (this.gameState.player.qi || 0) - (effects.qiPenalty || 50));
                this.gameState.cultivationXP = Math.max(0, (this.gameState.cultivationXP || 0) - (effects.cultivationPenalty || 200));
                break;
                
            case JUDGMENT_TYPES.TRIAL:
                // 考验效果 - 添加一个特殊任务
                this.grantCosmicBlessing({
                    type: 'trial',
                    title: '天道考验',
                    description: '天道对你进行考验，完成后可获得丰厚奖励',
                    power: 1.5,
                    effects: effects
                });
                break;
                
            case JUDGMENT_TYPES.ASCENSION:
                // 飞升裁决 - 给予特殊buff
                this.gameState.blessings = this.gameState.blessings || [];
                this.gameState.blessings.push({
                    name: '飞升机缘',
                    description: '天道认可你的修行',
                    duration: COSMIC_CONFIG.CYCLE_DURATION,
                    effect: { cultivationSpeed: 2.0 }
                });
                break;
        }
    }
    
    /**
     * 获取裁决列表
     */
    listJudgments(options = {}) {
        let result = [...this.judgments];
        
        if (options.type) {
            result = result.filter(j => j.type === options.type);
        }
        
        if (options.result) {
            result = result.filter(j => j.result === options.result);
        }
        
        if (options.executed !== undefined) {
            result = result.filter(j => j.executed === options.executed);
        }
        
        return {
            success: true,
            judgments: result.map(j => ({
                id: j.id,
                type: j.type,
                description: j.description,
                result: j.result,
                karmaValue: j.karmaValue,
                executed: j.executed,
                executedAt: j.executedAt,
                createdAt: j.createdAt
            })),
            total: result.length
        };
    }
    
    // ===== 宇宙赐福 =====
    
    /**
     * 授予宇宙赐福
     */
    grantCosmicBlessing(options = {}) {
        if (this.cosmicBlessings.length >= COSMIC_CONFIG.MAX_COSMIC_BLESSINGS) {
            // 移除最旧的已过期赐福
            this.cosmicBlessings = this.cosmicBlessings.filter(b => !b.isExpired());
            if (this.cosmicBlessings.length >= COSMIC_CONFIG.MAX_COSMIC_BLESSINGS) {
                this.cosmicBlessings.shift(); // 移除最旧的
            }
        }
        
        const blessing = new CosmicBlessing(
            options.type || 'general',
            options.title || '天道赐福',
            options.description || '天道的恩赐',
            {
                power: options.power || 1.0,
                duration: options.duration,
                grantedBy: options.grantedBy || '天道',
                targetPlayerId: options.targetPlayerId,
                effects: options.effects || {}
            }
        );
        
        this.cosmicBlessings.push(blessing);
        this.currentCycle?.addEvent('blessing', `授予宇宙赐福: ${blessing.title}`);
        this.saveState();
        
        return {
            success: true,
            blessing: {
                id: blessing.id,
                type: blessing.type,
                title: blessing.title,
                power: blessing.power,
                grantedAt: blessing.grantedAt
            }
        };
    }
    
    /**
     * 领取宇宙赐福
     */
    claimCosmicBlessing(blessingId) {
        const blessing = this.cosmicBlessings.find(b => b.id === blessingId);
        
        if (!blessing) {
            return { success: false, error: 'Blessing not found' };
        }
        
        const claimResult = blessing.claim();
        
        if (claimResult.success) {
            // 应用赐福效果
            if (this.gameState && blessing.effects) {
                if (blessing.effects.qiBonus) {
                    this.gameState.player.qi = (this.gameState.player.qi || 0) + blessing.effects.qiBonus;
                }
                if (blessing.effects.cultivationBonus) {
                    this.gameState.cultivationXP = (this.gameState.cultivationXP || 0) + blessing.effects.cultivationBonus;
                }
                if (blessing.effects.meritBonus) {
                    this.gameState.player.karmaPoints = (this.gameState.player.karmaPoints || 0) + blessing.effects.meritBonus;
                }
            }
            
            this.saveState();
        }
        
        return claimResult;
    }
    
    /**
     * 获取宇宙赐福列表
     */
    listCosmicBlessings(options = {}) {
        let result = [...this.cosmicBlessings];
        
        // 过滤已过期的
        if (!options.includeExpired) {
            result = result.filter(b => !b.isExpired());
        }
        
        // 过滤已领取的
        if (!options.includeClaimed) {
            result = result.filter(b => !b.claimed);
        }
        
        if (options.type) {
            result = result.filter(b => b.type === options.type);
        }
        
        return {
            success: true,
            blessings: result.map(b => ({
                id: b.id,
                type: b.type,
                title: b.title,
                description: b.description,
                power: b.power,
                duration: b.duration,
                grantedAt: b.grantedAt,
                grantedBy: b.grantedBy,
                claimed: b.claimed,
                claimedAt: b.claimedAt,
                effects: b.effects,
                isExpired: b.isExpired()
            })),
            total: result.length
        };
    }
    
    // ===== 宇宙重置 =====
    
    /**
     * 执行宇宙重置
     */
    executeReset(options = {}) {
        // 检查冷却
        if (this.lastResetTime) {
            const timeSinceReset = Date.now() - this.lastResetTime;
            if (timeSinceReset < COSMIC_CONFIG.RESET_COOLDOWN) {
                const remainingCooldown = COSMIC_CONFIG.RESET_COOLDOWN - timeSinceReset;
                return {
                    success: false,
                    error: 'Reset cooldown active',
                    remainingCooldown
                };
            }
        }
        
        const forceReset = options.force || false;
        const preserveLegacy = options.preserveLegacy !== false; // 默认保留传承
        
        // 保存遗产
        if (preserveLegacy) {
            this.preserveLegacy();
        }
        
        // 完成当前轮回
        if (this.currentCycle) {
            this.currentCycle.complete();
        }
        
        // 重置游戏状态
        const resetResult = {
            previousCycle: this.totalCycles,
            legaciesPreserved: preserveLegacy ? this.legacies.length : 0,
            blessingsReset: this.cosmicBlessings.length,
            judgmentsReset: this.judgments.length
        };
        
        // 开始新轮回
        this.startNewCycle();
        
        // 更新重置时间
        this.lastResetTime = Date.now();
        
        // 清空临时数据
        this.cosmicBlessings = [];
        this.judgments = [];
        
        this.saveState();
        
        return {
            success: true,
            reset: resetResult,
            newCycle: this.getCycleInfo()
        };
    }
    
    /**
     * 获取重置冷却时间
     */
    getResetCooldown() {
        if (!this.lastResetTime) {
            return { onCooldown: false, remainingTime: 0 };
        }
        
        const timeSinceReset = Date.now() - this.lastResetTime;
        const remaining = Math.max(0, COSMIC_CONFIG.RESET_COOLDOWN - timeSinceReset);
        
        return {
            onCooldown: remaining > 0,
            remainingTime: remaining,
            lastResetTime: this.lastResetTime
        };
    }
    
    // ===== 传承遗产 =====
    
    /**
     * 保留遗产
     */
    preserveLegacy() {
        if (!this.gameState) return { success: false, error: 'No game state' };
        
        const legacyItems = [];
        
        // 传承修为
        const cultivationXP = this.gameState.cultivationXP || 0;
        if (cultivationXP > 0) {
            const legacy = new LegacyInheritance(
                LEGACY_TYPES.CULTIVATION,
                '修为传承',
                '前世修行所积累的修为',
                {
                    value: cultivationXP,
                    quality: cultivationXP > 10000 ? '极品' : '上品',
                    rarity: cultivationXP > 10000 ? 'legendary' : 'rare',
                    sourceCycle: this.totalCycles
                }
            );
            legacy.activate();
            this.legacies.push(legacy);
            legacyItems.push(legacy);
        }
        
        // 传承功德
        const merit = this.gameState.player?.karmaPoints || 0;
        if (merit > 0) {
            const legacy = new LegacyInheritance(
                LEGACY_TYPES.MERIT,
                '功德传承',
                '前世行善积攒的功德',
                {
                    value: merit,
                    quality: merit > 5000 ? '极品' : '上品',
                    rarity: merit > 5000 ? 'legendary' : 'rare',
                    sourceCycle: this.totalCycles
                }
            );
            legacy.activate();
            this.legacies.push(legacy);
            legacyItems.push(legacy);
        }
        
        // 传承背包物品
        const inventory = this.gameState.inventory?.items || [];
        const valuableItems = inventory.filter(item => item.quality === '极品' || item.quality === '上品');
        for (const item of valuableItems.slice(0, COSMIC_CONFIG.MAX_LEGACY_ITEMS - this.legacies.length)) {
            const legacy = new LegacyInheritance(
                LEGACY_TYPES.TREASURE,
                item.name,
                item.description || '珍贵宝物',
                {
                    value: 1,
                    quality: item.quality,
                    rarity: item.quality === '极品' ? 'legendary' : 'rare',
                    sourceCycle: this.totalCycles
                }
            );
            legacy.activate();
            this.legacies.push(legacy);
            legacyItems.push(legacy);
        }
        
        // 限制遗产数量
        if (this.legacies.length > COSMIC_CONFIG.MAX_LEGACY_ITEMS) {
            this.legacies = this.legacies.slice(-COSMIC_CONFIG.MAX_LEGACY_ITEMS);
        }
        
        this.saveState();
        
        return {
            success: true,
            preservedCount: legacyItems.length,
            legacies: legacyItems.map(l => ({
                id: l.id,
                type: l.type,
                name: l.name,
                inheritedValue: l.getInheritedValue()
            }))
        };
    }
    
    /**
     * 继承遗产
     */
    inheritLegacy(legacyId) {
        const legacy = this.legacies.find(l => l.id === legacyId);
        
        if (!legacy) {
            return { success: false, error: 'Legacy not found' };
        }
        
        if (!legacy.preserved) {
            return { success: false, error: 'Legacy not preserved' };
        }
        
        if (!this.gameState) {
            return { success: false, error: 'No game state' };
        }
        
        const inheritedValue = legacy.getInheritedValue();
        
        // 应用传承效果
        switch (legacy.type) {
            case LEGACY_TYPES.CULTIVATION:
                this.gameState.cultivationXP = (this.gameState.cultivationXP || 0) + inheritedValue;
                break;
            case LEGACY_TYPES.MERIT:
                this.gameState.player.karmaPoints = (this.gameState.player.karmaPoints || 0) + inheritedValue;
                break;
            case LEGACY_TYPES.TREASURE:
                this.gameState.inventory = this.gameState.inventory || { items: [] };
                this.gameState.inventory.items.push({
                    name: legacy.name,
                    type: 'equipment',
                    quantity: 1,
                    quality: legacy.quality,
                    description: legacy.description
                });
                break;
            case LEGACY_TYPES.WISDOM:
                // 智慧传承 - 提升天赋
                this.gameState.player.level = (this.gameState.player.level || 1) + 1;
                break;
        }
        
        // 从遗产列表移除（只可继承一次）
        this.legacies = this.legacies.filter(l => l.id !== legacyId);
        this.saveState();
        
        return {
            success: true,
            inherited: {
                type: legacy.type,
                name: legacy.name,
                inheritedValue
            }
        };
    }
    
    /**
     * 获取遗产列表
     */
    listLegacies(options = {}) {
        let result = [...this.legacies];
        
        if (options.type) {
            result = result.filter(l => l.type === options.type);
        }
        
        if (options.preserved !== undefined) {
            result = result.filter(l => l.preserved === options.preserved);
        }
        
        return {
            success: true,
            legacies: result.map(l => ({
                id: l.id,
                type: l.type,
                name: l.name,
                description: l.description,
                value: l.value,
                quality: l.quality,
                rarity: l.rarity,
                retentionRatio: l.retentionRatio,
                inheritedValue: l.getInheritedValue(),
                preserved: l.preserved,
                sourceCycle: l.sourceCycle,
                createdAt: l.createdAt
            })),
            total: result.length
        };
    }
    
    // ===== MCP工具实现 =====
    
    /**
     * cosmic.cycle.query - 查询宇宙轮回状态
     */
    mcpCycleQuery(params = {}) {
        const cycleInfo = this.getCycleInfo();
        const evolutionInfo = this.getWorldEvolutionInfo();
        const cooldown = this.getResetCooldown();
        
        return {
            success: true,
            cycle: cycleInfo,
            worldEvolution: evolutionInfo,
            resetCooldown: cooldown,
            totalCycles: this.totalCycles
        };
    }
    
    /**
     * cosmic.world.evolve - 触发世界演化
     */
    mcpWorldEvolve(params = {}) {
        return this.triggerWorldEvolution({
            experience: params?.experience || 100
        });
    }
    
    /**
     * cosmic.heaven.judge - 天道裁决
     */
    mcpHeavenJudge(params = {}) {
        return this.executeJudgment({
            type: params?.type,
            description: params?.description,
            karmaValue: params?.karmaValue,
            meritValue: params?.meritValue,
            effects: params?.effects
        });
    }
    
    /**
     * cosmic.blessing.grant - 天道赐福
     */
    mcpBlessingGrant(params = {}) {
        return this.grantCosmicBlessing({
            type: params?.type || 'general',
            title: params?.title || '天道赐福',
            description: params?.description,
            power: params?.power || 1.0,
            duration: params?.duration,
            effects: params?.effects
        });
    }
    
    /**
     * cosmic.reset.execute - 执行宇宙重置
     */
    mcpResetExecute(params = {}) {
        return this.executeReset({
            force: params?.force || false,
            preserveLegacy: params?.preserveLegacy !== false
        });
    }
    
    /**
     * cosmic.legacy.inherit - 传承遗产
     */
    mcpLegacyInherit(params = {}) {
        if (!params?.legacyId) {
            // 返回可继承的遗产列表
            const legacies = this.listLegacies({ preserved: true });
            return {
                success: true,
                available: legacies.legacies,
                total: legacies.total
            };
        }
        
        return this.inheritLegacy(params.legacyId);
    }
}

// ===== MCP工具定义 =====

export const COSMIC_CYCLE_TOOLS = {
    'cosmic.cycle.query': {
        name: 'cosmic.cycle.query',
        description: 'Query the current cosmic cycle status, world evolution state, and reset cooldown',
        inputSchema: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    'cosmic.world.evolve': {
        name: 'cosmic.world.evolve',
        description: 'Trigger world evolution to gain experience and potentially level up the world',
        inputSchema: {
            type: 'object',
            properties: {
                experience: { type: 'number', description: 'Experience amount to add', default: 100 }
            },
            required: []
        }
    },
    'cosmic.heaven.judge': {
        name: 'cosmic.heaven.judge',
        description: 'Execute heaven judgment on a player based on their karma',
        inputSchema: {
            type: 'object',
            properties: {
                type: { type: 'string', description: 'Judgment type' },
                description: { type: 'string', description: 'Judgment description' },
                karmaValue: { type: 'number', description: 'Karma value for judgment' },
                meritValue: { type: 'number', description: 'Merit value for judgment' },
                effects: { type: 'object', description: 'Effects to apply' }
            },
            required: []
        }
    },
    'cosmic.blessing.grant': {
        name: 'cosmic.blessing.grant',
        description: 'Grant a cosmic blessing to the player',
        inputSchema: {
            type: 'object',
            properties: {
                type: { type: 'string', description: 'Blessing type' },
                title: { type: 'string', description: 'Blessing title' },
                description: { type: 'string', description: 'Blessing description' },
                power: { type: 'number', description: 'Blessing power multiplier', default: 1.0 },
                duration: { type: 'number', description: 'Blessing duration in ms' },
                effects: { type: 'object', description: 'Blessing effects' }
            },
            required: []
        }
    },
    'cosmic.reset.execute': {
        name: 'cosmic.reset.execute',
        description: 'Execute a cosmic reset to start a new cycle (requires cooldown)',
        inputSchema: {
            type: 'object',
            properties: {
                force: { type: 'boolean', description: 'Force reset even with penalties', default: false },
                preserveLegacy: { type: 'boolean', description: 'Preserve legacies for next cycle', default: true }
            },
            required: []
        }
    },
    'cosmic.legacy.inherit': {
        name: 'cosmic.legacy.inherit',
        description: 'Inherit a preserved legacy from previous cycles',
        inputSchema: {
            type: 'object',
            properties: {
                legacyId: { type: 'string', description: 'Legacy ID to inherit (omit to list available legacies)' }
            },
            required: []
        }
    }
};

/**
 * 创建MCP处理器
 */
export function createCosmicCycleMCPHandlers(gameState) {
    const service = new CosmicCycleService();
    service.init(gameState);
    
    return {
        'cosmic.cycle.query': (params) => service.mcpCycleQuery(params),
        'cosmic.world.evolve': (params) => service.mcpWorldEvolve(params),
        'cosmic.heaven.judge': (params) => service.mcpHeavenJudge(params),
        'cosmic.blessing.grant': (params) => service.mcpBlessingGrant(params),
        'cosmic.reset.execute': (params) => service.mcpResetExecute(params),
        'cosmic.legacy.inherit': (params) => service.mcpLegacyInherit(params)
    };
}

// ===== 导出 =====

export { 
    CosmicCycleService,
    CosmicCycle,
    WorldEvolution,
    HeavenJudgment,
    CosmicBlessing,
    LegacyInheritance,
    COSMIC_CONFIG,
    CYCLE_PHASES,
    WORLD_EVOLUTION_STAGES,
    JUDGMENT_TYPES,
    LEGACY_TYPES
};

// 默认导出服务实例
export const cosmicCycleService = new CosmicCycleService();