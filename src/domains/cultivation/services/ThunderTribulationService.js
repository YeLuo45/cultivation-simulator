/**
 * ThunderTribulationService.js - 天雷劫数系统
 * V241 Direction C: 天雷劫数系统 - thunderbolt/claude-code
 * 
 * 提供6个MCP工具:
 * - thunder.prepare - 准备渡劫
 * - thunder.execute - 执行渡劫
 * - thunder.bless - 天雷赐福
 * - thunder.mastery - 雷法精通
 * - thunder.absorb - 吸收雷劫
 * - thunder.journal - 渡劫日志
 */

import { CultivationService } from './CultivationService.js';

// ===== 常量定义 =====

/**
 * 天雷劫数等级 (1-9重)
 * 每三重劫数对应一个大境界突破
 */
export const THUNDER_TRIBULATION_LEVELS = {
    LEVEL_1: 1,  // 炼气突破筑基
    LEVEL_2: 2,
    LEVEL_3: 3,  // 筑基突破金丹
    LEVEL_4: 4,
    LEVEL_5: 5,  // 金丹突破元婴
    LEVEL_6: 6,
    LEVEL_7: 7,  // 元婴突破化神
    LEVEL_8: 8,
    LEVEL_9: 9   // 化神突破飞升
};

/**
 * 劫数状态
 */
export const TRIBULATION_STATES = {
    NONE: 'none',               // 未渡劫
    PREPARING: 'preparing',     // 准备中
    IN_PROGRESS: 'in_progress', // 渡劫中
    SUCCESS: 'success',        // 渡劫成功
    FAILED: 'failed',          // 渡劫失败
    BLESSED: 'blessed'          // 已获赐福
};

/**
 * 雷劫类型
 */
export const TRIBULATION_TYPES = {
    MINOR: 'minor',             // 小天劫
    MAJOR: 'major',             // 大天劫
    DIVINE_PUNISHMENT: 'divine_punishment'  // 天罚
};

/**
 * 天雷劫数系统配置
 */
export const THUNDER_TRIBULATION_CONFIG = {
    // 劫数等级与境界对应关系
    realmToTribulationLevel: {
        0: 1,  // 炼气→筑基需要1重劫
        1: 2,  // 筑基→金丹需要2重劫
        2: 3,  // 金丹→元婴需要3重劫
        3: 4,  // 元婴→化神需要4重劫
        4: 5,  // 化神→飞升需要5重劫
        5: 9   // 飞升后大圆满需要9重劫
    },
    
    // 渡劫基础成功率
    baseSuccessRate: 0.5,
    
    // 每重劫数增加的基础强度
    baseIntensityPerLevel: 100,
    
    // 功德抵消天罚系数
    meritOffsetFactor: 0.1,
    
    // 天雷赐福基础增益
    blessingBaseBonus: 0.1,
    
    // 雷法精通最大等级
    maxMasteryLevel: 9,
    
    // 吸收雷劫恢复比例
    absorbRecoveryRate: 0.3,
    
    // 渡劫消耗灵石基数
    tribulationStoneCost: 500
};

// ===== MCP工具定义 =====

export const THUNDER_TRIBULATION_TOOLS = {
    'thunder.prepare': {
        name: 'thunder.prepare',
        description: '准备渡劫，检测渡劫条件并设置渡劫目标',
        parameters: {
            type: 'object',
            properties: {
                targetRealm: {
                    type: 'number',
                    description: '目标境界 (0-5: 炼气、筑基、金丹、元婴、化神、飞升)'
                }
            }
        }
    },
    'thunder.execute': {
        name: 'thunder.execute',
        description: '执行渡劫，进行天雷洗礼',
        parameters: {
            type: 'object',
            properties: {
                useItems: {
                    type: 'boolean',
                    description: '是否使用道具辅助渡劫'
                }
            }
        }
    },
    'thunder.bless': {
        name: 'thunder.bless',
        description: '天雷赐福，将雷劫之力转化为修炼增益',
        parameters: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['cultivation', 'attribute', 'skill'],
                    description: '赐福类型'
                }
            }
        }
    },
    'thunder.mastery': {
        name: 'thunder.mastery',
        description: '雷法精通，提升雷法神通等级',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['query', 'upgrade', 'use'],
                    description: '雷法操作类型'
                }
            }
        }
    },
    'thunder.absorb': {
        name: 'thunder.absorb',
        description: '吸收雷劫，将天雷之力转化为自身灵力',
        parameters: {
            type: 'object',
            properties: {
                amount: {
                    type: 'number',
                    description: '吸收量 (1-100)'
                }
            }
        }
    },
    'thunder.journal': {
        name: 'thunder.journal',
        description: '渡劫日志，查看历史渡劫记录',
        parameters: {
            type: 'object',
            properties: {
                limit: {
                    type: 'number',
                    description: '返回记录数量'
                }
            }
        }
    }
};

// ===== 服务类 =====

/**
 * 天雷劫数服务类
 */
class ThunderTribulationService {
    constructor(gameState) {
        this.gameState = gameState;
        this.tribulationState = null;
    }

    /**
     * 初始化天雷劫数系统
     * @param {Object} gameState - 游戏状态
     * @returns {Object} 初始化后的游戏状态
     */
    init(gameState) {
        if (!gameState.thunderTribulation) {
            gameState.thunderTribulation = {
                // 渡劫状态
                state: TRIBULATION_STATES.NONE,
                
                // 当前劫数等级 (1-9)
                currentLevel: 0,
                
                // 目标境界
                targetRealm: null,
                
                // 天雷强度
                lightningIntensity: 0,
                
                // 雷击次数
                lightningCount: 0,
                
                // 渡劫进度 (0-100)
                progress: 0,
                
                // 历史记录
                history: [],
                
                // 雷法精通等级 (0-9)
                lightningMastery: 0,
                
                // 雷法神通列表
                lightningSkills: [],
                
                // 天雷赐福效果
                blessingEffects: [],
                
                // 累积天罚值
                divinePunishment: 0,
                
                // 功德值
                meritPoints: 0,
                
                // 最后渡劫时间
                lastTribulationTime: null,
                
                // 渡劫成功率加成
                successRateBonus: 0,
                
                // 已吸收雷劫能量
                absorbedEnergy: 0
            };
        }
        this.tribulationState = gameState.thunderTribulation;
        
        // 确保player有karmaPoints
        if (this.gameState.player && this.gameState.player.karmaPoints === undefined) {
            this.gameState.player.karmaPoints = 0;
        }
        
        return gameState;
    }

    /**
     * 记录历史事件
     */
    recordHistory(action, details) {
        if (!this.tribulationState.history) {
            this.tribulationState.history = [];
        }
        this.tribulationState.history.push({
            action,
            details,
            timestamp: Date.now()
        });
        // 保持历史记录不超过50条
        if (this.tribulationState.history.length > 50) {
            this.tribulationState.history = this.tribulationState.history.slice(-50);
        }
    }

    /**
     * 获取当前境界所需劫数等级
     */
    getRequiredTribulationLevel(targetRealm) {
        const realm = targetRealm !== undefined ? targetRealm : (this.gameState.realm || 0);
        return THUNDER_TRIBULATION_CONFIG.realmToTribulationLevel[realm] || 1;
    }

    /**
     * 计算渡劫成功率
     * 成功率 = (实力 + 功德) / (劫数 × 20)
     */
    calculateSuccessRate(params = {}) {
        const gs = this.gameState;
        const level = this.tribulationState.currentLevel || this.getRequiredTribulationLevel();
        
        // 实力基础值 (境界 × 100 + 修为进度)
        const realmPower = (gs.realm || 0) * 100;
        const cultivationPower = gs.cultivationProgress || 0;
        const basePower = realmPower + cultivationPower;
        
        // 功德值
        const merit = this.tribulationState.meritPoints || (gs.player?.karmaPoints || 0);
        
        // 天罚抵消
        const divinePunishment = this.tribulationState.divinePunishment || 0;
        const effectiveMerit = Math.max(0, merit - divinePunishment * THUNDER_TRIBULATION_CONFIG.meritOffsetFactor);
        
        // 最终成功率
        const successRate = (basePower + effectiveMerit) / (level * 20);
        
        return {
            basePower,
            merit: effectiveMerit,
            level,
            rawRate: successRate,
            finalRate: Math.min(0.95, Math.max(0.05, successRate + (this.tribulationState.successRateBonus || 0)))
        };
    }

    /**
     * 准备渡劫 (thunder.prepare)
     * @param {Object} params - 参数 { targetRealm: number }
     * @returns {Object} 准备结果
     */
    prepare(params = {}) {
        const gs = this.gameState;
        
        // 检查是否已有渡劫进行中
        if (this.tribulationState.state === TRIBULATION_STATES.IN_PROGRESS) {
            return {
                success: false,
                error: '渡劫正在进行中，无法再次准备',
                currentState: this.tribulationState.state
            };
        }
        
        if (this.tribulationState.state === TRIBULATION_STATES.PREPARING) {
            return {
                success: false,
                error: '渡劫已准备好，请执行渡劫',
                currentState: this.tribulationState.state
            };
        }
        
        // 确定目标境界
        const targetRealm = params.targetRealm !== undefined ? params.targetRealm : (gs.realm || 0) + 1;
        
        // 验证目标境界是否合理
        if (targetRealm < 0 || targetRealm > 5) {
            return {
                success: false,
                error: '无效的目标境界'
            };
        }
        
        if (targetRealm <= (gs.realm || 0)) {
            return {
                success: false,
                error: '目标境界必须高于当前境界'
            };
        }
        
        // 计算所需劫数等级
        const requiredLevel = this.getRequiredTribulationLevel(targetRealm);
        
        // 检查灵石是否足够
        const stoneCost = THUNDER_TRIBULATION_CONFIG.tribulationStoneCost * requiredLevel;
        if ((gs.player?.spiritStones || 0) < stoneCost) {
            return {
                success: false,
                error: `灵石不足，需要${stoneCost}灵石准备渡劫`,
                shortage: stoneCost - (gs.player?.spiritStones || 0)
            };
        }
        
        // 设置渡劫状态
        this.tribulationState.state = TRIBULATION_STATES.PREPARING;
        this.tribulationState.targetRealm = targetRealm;
        this.tribulationState.currentLevel = requiredLevel;
        this.tribulationState.lightningIntensity = THUNDER_TRIBULATION_CONFIG.baseIntensityPerLevel * requiredLevel;
        
        // 计算成功率
        const successRateInfo = this.calculateSuccessRate({ targetRealm });
        
        this.recordHistory('prepare', {
            targetRealm,
            requiredLevel,
            stoneCost,
            successRate: successRateInfo.finalRate
        });
        
        return {
            success: true,
            action: 'thunder.prepare',
            state: TRIBULATION_STATES.PREPARING,
            targetRealm,
            requiredLevel,
            lightningIntensity: this.tribulationState.lightningIntensity,
            stoneCost,
            successRate: successRateInfo.finalRate,
            message: `准备渡劫，目标：${this.getRealmName(targetRealm)}，需要${requiredLevel}重雷劫`
        };
    }

    /**
     * 执行渡劫 (thunder.execute)
     * @param {Object} params - 参数 { useItems: boolean }
     * @returns {Object} 渡劫结果
     */
    execute(params = {}) {
        const gs = this.gameState;
        
        // 检查是否准备好渡劫
        if (this.tribulationState.state !== TRIBULATION_STATES.PREPARING) {
            // 如果没有准备，自动准备
            if (this.tribulationState.state === TRIBULATION_STATES.NONE) {
                const prepResult = this.prepare(params);
                if (!prepResult.success) {
                    return prepResult;
                }
            } else {
                return {
                    success: false,
                    error: '请先准备渡劫',
                    currentState: this.tribulationState.state
                };
            }
        }
        
        // 扣除灵石
        const stoneCost = THUNDER_TRIBULATION_CONFIG.tribulationStoneCost * this.tribulationState.currentLevel;
        if ((gs.player?.spiritStones || 0) < stoneCost) {
            return {
                success: false,
                error: '灵石不足，渡劫失败',
                shortage: stoneCost - (gs.player?.spiritStones || 0)
            };
        }
        gs.player.spiritStones -= stoneCost;
        
        // 开始渡劫
        this.tribulationState.state = TRIBULATION_STATES.IN_PROGRESS;
        this.tribulationState.lightningCount = 0;
        this.tribulationState.progress = 0;
        
        // 计算成功率
        const successRateInfo = this.calculateSuccessRate();
        
        // 模拟雷击过程
        const maxLightning = this.tribulationState.currentLevel * 3; // 每重劫3道雷
        const passedLightning = [];
        
        for (let i = 0; i < maxLightning; i++) {
            // 每道雷有独立成功率
            const lightningSuccess = Math.random() < successRateInfo.finalRate;
            this.tribulationState.lightningCount++;
            this.tribulationState.progress = ((i + 1) / maxLightning) * 100;
            
            passedLightning.push({
                index: i + 1,
                intensity: this.tribulationState.lightningIntensity * (1 + i * 0.1),
                passed: lightningSuccess
            });
            
            if (!lightningSuccess) {
                // 渡劫失败
                this.tribulationState.state = TRIBULATION_STATES.FAILED;
                this.tribulationState.lastTribulationTime = Date.now();
                
                this.recordHistory('execute', {
                    targetRealm: this.tribulationState.targetRealm,
                    level: this.tribulationState.currentLevel,
                    lightningCount: this.tribulationState.lightningCount,
                    passedLightning: passedLightning.length,
                    result: 'failed'
                });
                
                return {
                    success: false,
                    action: 'thunder.execute',
                    state: TRIBULATION_STATES.FAILED,
                    message: `渡劫失败！第${i + 1}道天雷未能渡过`,
                    lightningCount: this.tribulationState.lightningCount,
                    progress: this.tribulationState.progress,
                    targetRealm: this.tribulationState.targetRealm,
                    failureReason: '天雷洗礼失败'
                };
            }
        }
        
        // 渡劫成功
        this.tribulationState.state = TRIBULATION_STATES.SUCCESS;
        this.tribulationState.lastTribulationTime = Date.now();
        
        // 更新玩家境界
        const oldRealm = gs.realm || 0;
        gs.realm = this.tribulationState.targetRealm;
        gs.stage = 0; // 境界突破后重置 stage
        gs.cultivationProgress = 0;
        
        // 增加雷法精通经验
        this.tribulationState.lightningMastery = Math.min(
            this.tribulationState.lightningMastery + 1,
            THUNDER_TRIBULATION_CONFIG.maxMasteryLevel
        );
        
        // 记录通过的雷劫
        this.recordHistory('execute', {
            targetRealm: this.tribulationState.targetRealm,
            level: this.tribulationState.currentLevel,
            lightningCount: this.tribulationState.lightningCount,
            passedLightning: passedLightning.length,
            result: 'success'
        });
        
        return {
            success: true,
            action: 'thunder.execute',
            state: TRIBULATION_STATES.SUCCESS,
            message: `渡劫成功！成功突破至${this.getRealmName(gs.realm)}`,
            realmProgress: {
                from: oldRealm,
                to: gs.realm,
                realmName: this.getRealmName(gs.realm)
            },
            lightningMastery: this.tribulationState.lightningMastery,
            lightningCount: this.tribulationState.lightningCount,
            progress: this.tribulationState.progress
        };
    }

    /**
     * 天雷赐福 (thunder.bless)
     * @param {Object} params - 参数 { type: 'cultivation'|'attribute'|'skill' }
     * @returns {Object} 赐福结果
     */
    bless(params = {}) {
        const gs = this.gameState;
        
        // 检查是否有渡劫成功记录
        if (this.tribulationState.state !== TRIBULATION_STATES.SUCCESS) {
            return {
                success: false,
                error: '需要先成功渡劫才能获得赐福'
            };
        }
        
        // 检查是否已领取赐福
        if (this.tribulationState.state === TRIBULATION_STATES.BLESSED) {
            return {
                success: false,
                error: '本次渡劫赐福已领取'
            };
        }
        
        const type = params.type || 'cultivation';
        
        let blessingEffect;
        const baseBonus = THUNDER_TRIBULATION_CONFIG.blessingBaseBonus;
        const levelBonus = (this.tribulationState.currentLevel || 1) * 0.05;
        
        switch (type) {
            case 'cultivation':
                // 修炼速度加成
                gs.cultivationProgress = (gs.cultivationProgress || 0) + 20 * (baseBonus + levelBonus);
                blessingEffect = {
                    type: 'cultivation',
                    name: '天雷淬体',
                    bonus: (baseBonus + levelBonus) * 100,
                    description: `修炼速度提升${((baseBonus + levelBonus) * 100).toFixed(0)}%`
                };
                break;
            case 'attribute':
                // 属性加成
                if (gs.player) {
                    gs.player.level = (gs.player.level || 1) + Math.floor(this.tribulationState.currentLevel || 1);
                }
                blessingEffect = {
                    type: 'attribute',
                    name: '天雷锻体',
                    bonus: (baseBonus + levelBonus) * 100,
                    description: `等级提升${Math.floor(this.tribulationState.currentLevel || 1)}级`
                };
                break;
            case 'skill':
                // 技能加成
                const skillBonus = baseBonus + levelBonus;
                blessingEffect = {
                    type: 'skill',
                    name: '雷法神通',
                    bonus: skillBonus * 100,
                    description: `雷法威力提升${(skillBonus * 100).toFixed(0)}%`
                };
                break;
            default:
                return {
                    success: false,
                    error: '无效的赐福类型'
                };
        }
        
        // 标记已领取赐福
        this.tribulationState.state = TRIBULATION_STATES.BLESSED;
        this.tribulationState.blessingEffects.push(blessingEffect);
        
        this.recordHistory('bless', {
            type,
            blessingEffect
        });
        
        return {
            success: true,
            action: 'thunder.bless',
            blessingEffect,
            message: `获得${blessingEffect.name}效果：${blessingEffect.description}`
        };
    }

    /**
     * 雷法精通 (thunder.mastery)
     * @param {Object} params - 参数 { action: 'query'|'upgrade'|'use' }
     * @returns {Object} 结果
     */
    mastery(params = {}) {
        const gs = this.gameState;
        const action = params.action || 'query';
        
        switch (action) {
            case 'query':
                return {
                    success: true,
                    action: 'thunder.mastery',
                    currentLevel: this.tribulationState.lightningMastery,
                    maxLevel: THUNDER_TRIBULATION_CONFIG.maxMasteryLevel,
                    skills: this.tribulationState.lightningSkills,
                    experienceProgress: this.getMasteryProgress()
                };
                
            case 'upgrade':
                // 检查是否渡劫成功
                if (this.tribulationState.state !== TRIBULATION_STATES.SUCCESS && 
                    this.tribulationState.state !== TRIBULATION_STATES.BLESSED) {
                    return {
                        success: false,
                        error: '需要先成功渡劫才能提升雷法精通'
                    };
                }
                
                // 检查是否达到最大等级
                if (this.tribulationState.lightningMastery >= THUNDER_TRIBULATION_CONFIG.maxMasteryLevel) {
                    return {
                        success: false,
                        error: '雷法精通已达到最大等级'
                    };
                }
                
                // 升级消耗灵石
                const upgradeCost = 1000 * (this.tribulationState.lightningMastery + 1);
                if ((gs.player?.spiritStones || 0) < upgradeCost) {
                    return {
                        success: false,
                        error: `升级需要${upgradeCost}灵石`,
                        shortage: upgradeCost - (gs.player?.spiritStones || 0)
                    };
                }
                
                gs.player.spiritStones -= upgradeCost;
                this.tribulationState.lightningMastery++;
                
                this.recordHistory('mastery_upgrade', {
                    newLevel: this.tribulationState.lightningMastery,
                    cost: upgradeCost
                });
                
                return {
                    success: true,
                    action: 'thunder.mastery',
                    newLevel: this.tribulationState.lightningMastery,
                    message: `雷法精通提升至${this.tribulationState.lightningMastery}级`
                };
                
            case 'use':
                // 检查雷法是否可用
                if (this.tribulationState.lightningMastery < 1) {
                    return {
                        success: false,
                        error: '雷法精通等级不足，无法使用雷法'
                    };
                }
                
                // 检查灵力是否足够
                const useCost = 50 * this.tribulationState.lightningMastery;
                if ((gs.player?.qi || 0) < useCost) {
                    return {
                        success: false,
                        error: `使用雷法需要${useCost}灵力`,
                        shortage: useCost - (gs.player?.qi || 0)
                    };
                }
                
                gs.player.qi -= useCost;
                
                // 计算雷法伤害
                const damage = 100 * this.tribulationState.lightningMastery;
                
                this.recordHistory('mastery_use', {
                    damage,
                    qiCost: useCost
                });
                
                return {
                    success: true,
                    action: 'thunder.mastery',
                    message: `施展雷法，造成${damage}伤害`,
                    damage,
                    qiSpent: useCost,
                    masteryLevel: this.tribulationState.lightningMastery
                };
                
            default:
                return {
                    success: false,
                    error: '无效的操作类型'
                };
        }
    }

    /**
     * 获取雷法精通进度
     */
    getMasteryProgress() {
        const current = this.tribulationState.lightningMastery;
        const max = THUNDER_TRIBULATION_CONFIG.maxMasteryLevel;
        return {
            current,
            max,
            percentage: (current / max) * 100
        };
    }

    /**
     * 吸收雷劫 (thunder.absorb)
     * @param {Object} params - 参数 { amount: number }
     * @returns {Object} 吸收结果
     */
    absorb(params = {}) {
        const gs = this.gameState;
        
        // 检查是否有可吸收的雷劫能量
        if (this.tribulationState.absorbedEnergy <= 0 && 
            this.tribulationState.state !== TRIBULATION_STATES.SUCCESS) {
            return {
                success: false,
                error: '当前没有可吸收的雷劫能量'
            };
        }
        
        const amount = Math.min(params.amount || 50, 100);
        const maxAbsorb = this.tribulationState.absorbedEnergy || 
            (THUNDER_TRIBULATION_CONFIG.absorbRecoveryRate * this.tribulationState.lightningIntensity);
        
        const actualAbsorb = Math.min(amount, maxAbsorb);
        
        // 恢复灵力
        const currentQi = gs.player?.qi || 0;
        const maxQi = 100 + (gs.realm || 0) * 50;
        const qiRecovery = actualAbsorb * THUNDER_TRIBULATION_CONFIG.absorbRecoveryRate;
        gs.player.qi = Math.min(currentQi + qiRecovery, maxQi);
        
        // 消耗吸收的能量
        this.tribulationState.absorbedEnergy = Math.max(0, (this.tribulationState.absorbedEnergy || 0) - actualAbsorb);
        
        this.recordHistory('absorb', {
            amount: actualAbsorb,
            qiRecovered: qiRecovery
        });
        
        return {
            success: true,
            action: 'thunder.absorb',
            amount: actualAbsorb,
            qiRecovered: qiRecovery,
            currentQi: gs.player.qi,
            maxQi,
            message: `吸收${actualAbsorb}雷劫能量，回复${qiRecovery.toFixed(1)}灵力`
        };
    }

    /**
     * 渡劫日志 (thunder.journal)
     * @param {Object} params - 参数 { limit: number }
     * @returns {Object} 日志结果
     */
    journal(params = {}) {
        const limit = params.limit || 10;
        const history = this.tribulationState.history || [];
        const recentHistory = history.slice(-limit).reverse();
        
        // 计算渡劫统计
        const stats = {
            totalTribulations: history.filter(h => h.action === 'execute').length,
            successfulTribulations: history.filter(h => h.action === 'execute' && h.details?.result === 'success').length,
            failedTribulations: history.filter(h => h.action === 'execute' && h.details?.result === 'failed').length,
            totalLightningAbsorbed: history
                .filter(h => h.action === 'absorb')
                .reduce((sum, h) => sum + (h.details?.amount || 0), 0),
            currentMastery: this.tribulationState.lightningMastery,
            highestLevel: this.getHighestTribulationLevel(history)
        };
        
        return {
            success: true,
            action: 'thunder.journal',
            stats,
            history: recentHistory.map(h => ({
                action: h.action,
                details: h.details,
                timestamp: h.timestamp,
                timeDesc: this.formatTimestamp(h.timestamp)
            }))
        };
    }

    /**
     * 获取最高渡劫等级
     */
    getHighestTribulationLevel(history) {
        if (!history || history.length === 0) return 0;
        return Math.max(...history
            .filter(h => h.details?.level)
            .map(h => h.details.level));
    }

    /**
     * 格式化时间戳
     */
    formatTimestamp(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
        return date.toLocaleDateString();
    }

    /**
     * 获取境界名称
     */
    getRealmName(realm) {
        const realms = ['炼气', '筑基', '金丹', '元婴', '化神', '飞升'];
        return realms[realm] || '未知';
    }

    /**
     * 获取MCP工具处理器
     * @param {Object} gameState - 游戏状态
     * @returns {Object} MCP处理器映射
     */
    static getMCPHandlers(gameState) {
        const service = new ThunderTribulationService(gameState);
        
        return {
            'thunder.prepare': (params) => service.prepare(params || {}),
            'thunder.execute': (params) => service.execute(params || {}),
            'thunder.bless': (params) => service.bless(params || {}),
            'thunder.mastery': (params) => service.mastery(params || {}),
            'thunder.absorb': (params) => service.absorb(params || {}),
            'thunder.journal': (params) => service.journal(params || {})
        };
    }
}

// ===== 导出 =====

export { ThunderTribulationService };
export default ThunderTribulationService;