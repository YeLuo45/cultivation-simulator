/**
 * 多维修炼流水线服务
 * 允许玩家同时在多个境界层次修炼，通过调度器分配修炼时间
 * 设计系统：nanobot(分布式mesh) + thunderbolt(pipeline/feedback)
 */

import { RealmBreakthroughService } from './RealmBreakthroughService.js';
import { EpiphanyService } from './EpiphanyService.js';
import { KarmaService } from './KarmaService.js';

// 境界层次定义
export const REALM_STAGES = ['body', 'qi', 'spirit', 'soul', 'celestial'];

// 每层境界的修炼效率基数
const REALM_EFFICIENCY = {
    body: 1.0,
    qi: 1.2,
    spirit: 1.5,
    soul: 1.8,
    celestial: 2.0
};

// 同步修炼加成配置
const SYNC_BONUS = {
    two_realms: 1.2,      // 两境同步 +20%
    three_realms: 1.5,    // 三境同步 +50%
    four_realms: 2.0,     // 四境同步 +100%
    five_realms: 3.0      // 五境同步 +200%
};

/**
 * 多维修炼调度器
 * 管理多个境界层次的并行修炼
 */
export class MultiRealmPipelineService {
    constructor(gameState) {
        this.gameState = gameState;
        this.realmState = gameState.multiRealm || this.initRealmState();
        this.realmBreakthrough = new RealmBreakthroughService(gameState);
        this.epiphany = new EpiphanyService(gameState);
        this.karma = new KarmaService(gameState);
    }

    initRealmState() {
        const state = {
            activeRealms: ['body'],  // 默认从肉身境开始
            realmProgress: {
                body: { progress: 0, stage: 0, efficiency: 1.0, lastCultivateTime: null },
                qi: { progress: 0, stage: 0, efficiency: 1.2, lastCultivateTime: null },
                spirit: { progress: 0, stage: 0, efficiency: 1.5, lastCultivateTime: null },
                soul: { progress: 0, stage: 0, efficiency: 1.8, lastCultivateTime: null },
                celestial: { progress: 0, stage: 0, efficiency: 2.0, lastCultivateTime: null }
            },
            syncMultiplier: 1.0,
            lastSyncTime: null,
            pipelineStages: {}  // 流水线阶段
        };
        this.gameState.multiRealm = state;
        return state;
    }

    init(gameState) {
        this.realmState = gameState.multiRealm || this.initRealmState();
        this.realmBreakthrough.init(gameState);
        this.epiphany.init(gameState);
        this.karma.init(gameState);
        return this;
    }

    /**
     * 激活一个境界层次
     */
    activateRealm(realm) {
        if (!REALM_STAGES.includes(realm)) {
            return { success: false, error: `未知境界: ${realm}` };
        }
        if (this.realmState.activeRealms.includes(realm)) {
            return { success: false, error: `${realm}境界已在修炼中` };
        }
        if (this.realmState.activeRealms.length >= 5) {
            return { success: false, error: '已达最大境界数量限制(5)' };
        }

        this.realmState.activeRealms.push(realm);
        this.updateSyncMultiplier();
        
        return {
            success: true,
            activeRealms: this.realmState.activeRealms,
            syncMultiplier: this.realmState.syncMultiplier
        };
    }

    /**
     * 停用一个境界层次
     */
    deactivateRealm(realm) {
        const idx = this.realmState.activeRealms.indexOf(realm);
        if (idx === -1) {
            return { success: false, error: `${realm}境界未在修炼中` };
        }
        if (this.realmState.activeRealms.length <= 1) {
            return { success: false, error: '至少保留一个活跃境界' };
        }

        this.realmState.activeRealms.splice(idx, 1);
        this.updateSyncMultiplier();
        
        return {
            success: true,
            activeRealms: this.realmState.activeRealms,
            syncMultiplier: this.realmState.syncMultiplier
        };
    }

    /**
     * 更新同步修炼加成
     */
    updateSyncMultiplier() {
        const count = this.realmState.activeRealms.length;
        if (count >= 5) this.realmState.syncMultiplier = SYNC_BONUS.five_realms;
        else if (count >= 4) this.realmState.syncMultiplier = SYNC_BONUS.four_realms;
        else if (count >= 3) this.realmState.syncMultiplier = SYNC_BONUS.three_realms;
        else if (count >= 2) this.realmState.syncMultiplier = SYNC_BONUS.two_realms;
        else this.realmState.syncMultiplier = 1.0;
    }

    /**
     * 单次修炼调度
     * @param {number} duration - 修炼时长（毫秒）
     * @param {object} options - 修炼选项
     */
    cultivate(duration, options = {}) {
        const { realm = 'body', useEpiphany = false, useKarma = false } = options;
        
        if (!this.realmState.activeRealms.includes(realm)) {
            return { success: false, error: `${realm}境界未激活` };
        }

        const realmInfo = this.realmState.realmProgress[realm];
        const baseEfficiency = REALM_EFFICIENCY[realm] || 1.0;
        
        // 计算修炼进度增量
        const baseProgress = duration / 1000; // 每秒1点基础进度
        const efficiencyBonus = baseEfficiency * realmInfo.efficiency;
        const syncBonus = this.realmState.syncMultiplier;
        const karmaBonus = useKarma ? this.karma.getCultivationModifier() : 1.0;
        
        const totalProgress = baseProgress * efficiencyBonus * syncBonus * karmaBonus;

        // 更新境界进度
        realmInfo.progress += totalProgress;
        realmInfo.lastCultivateTime = Date.now();

        // 处理顿悟加成
        let epiphanyBonus = 0;
        if (useEpiphany) {
            epiphanyBonus = this.epiphany.triggerEpiphany({ type: 'realm_cultivation', realm }) || 0;
        }

        // 计算是否触发突破
        const breakthroughThreshold = this.getBreakthroughThreshold(realm, realmInfo.stage);
        let breakthroughTriggered = false;
        let breakthroughResult = null;

        if (realmInfo.progress >= breakthroughThreshold) {
            breakthroughTriggered = true;
            realmInfo.progress -= breakthroughThreshold;
            realmInfo.stage++;
            breakthroughResult = this.realmBreakthrough.startBreakthrough(realm, realmInfo.stage);
        }

        // 更新流水线阶段
        this.updatePipelineStage(realm);

        return {
            success: true,
            realm,
            progress: realmInfo.progress,
            stage: realmInfo.stage,
            progressGained: totalProgress,
            epiphanyBonus,
            syncMultiplier: this.realmState.syncMultiplier,
            breakthroughTriggered,
            breakthroughResult,
            activeRealms: this.realmState.activeRealms
        };
    }

    /**
     * 多境界同步修炼
     * 同时在所有活跃境界修炼
     */
    cultivateAll(duration, options = {}) {
        const results = [];
        const epiphanyUsed = options.useEpiphany || false;
        const karmaUsed = options.useKarma || false;

        for (const realm of this.realmState.activeRealms) {
            const result = this.cultivate(duration, {
                realm,
                useEpiphany: epiphanyUsed,
                useKarma: karmaUsed
            });
            results.push(result);
        }

        // 检查是否有境界突破
        const breakthroughs = results.filter(r => r.breakthroughTriggered);
        
        return {
            success: true,
            results,
            activeRealmCount: this.realmState.activeRealms.length,
            syncMultiplier: this.realmState.syncMultiplier,
            breakthroughs: breakthroughs.length,
            breakthroughDetails: breakthroughs
        };
    }

    /**
     * 获取突破阈值
     */
    getBreakthroughThreshold(realm, stage) {
        const baseThresholds = {
            body: 100, qi: 200, spirit: 400, soul: 800, celestial: 1600
        };
        return (baseThresholds[realm] || 100) * Math.pow(2, stage);
    }

    /**
     * 更新流水线阶段
     */
    updatePipelineStage(realm) {
        const progress = this.realmState.realmProgress[realm].progress;
        const threshold = this.getBreakthroughThreshold(realm, this.realmState.realmProgress[realm].stage);
        const progressRatio = progress / threshold;

        let stageName = 'absorption';
        if (progressRatio >= 0.8) stageName = 'breakthrough_imminent';
        else if (progressRatio >= 0.5) stageName = 'circulation';
        else if (progressRatio >= 0.2) stageName = 'refinement';
        
        this.realmState.pipelineStages[realm] = {
            name: stageName,
            progressRatio: Math.min(progressRatio, 1.0),
            updatedAt: Date.now()
        };
    }

    /**
     * 获取所有境界状态
     */
    getAllRealmStatus() {
        return this.realmState.activeRealms.map(realm => {
            const info = this.realmState.realmProgress[realm];
            const pipeline = this.realmState.pipelineStages[realm] || { name: 'absorption', progressRatio: 0 };
            const threshold = this.getBreakthroughThreshold(realm, info.stage);
            return {
                realm,
                progress: info.progress,
                stage: info.stage,
                efficiency: info.efficiency,
                pipelineStage: pipeline.name,
                progressToNext: `${info.progress.toFixed(1)}/${threshold}`,
                progressRatio: (info.progress / threshold * 100).toFixed(1) + '%'
            };
        });
    }

    /**
     * 调度境界修炼优先级
     * 根据各境界进度自动分配修炼时间
     */
    autoSchedule(duration, options = {}) {
        const { priority = 'balanced' } = options;
        const realms = [...this.realmState.activeRealms];
        
        if (priority === 'balanced') {
            // 均衡分配
            const perRealm = duration / realms.length;
            return this.cultivateAll(perRealm, options);
        } else if (priority === 'weakest') {
            // 优先补强弱境界
            realms.sort((a, b) => {
                const aProgress = this.realmState.realmProgress[a].progress;
                const bProgress = this.realmState.realmProgress[b].progress;
                const aThreshold = this.getBreakthroughThreshold(a, this.realmState.realmProgress[a].stage);
                const bThreshold = this.getBreakthroughThreshold(b, this.realmState.realmProgress[b].stage);
                return (aProgress / aThreshold) - (bProgress / bThreshold);
            });
            
            let remaining = duration;
            const results = [];
            for (const realm of realms) {
                const allocated = Math.min(remaining, duration * 0.4);
                results.push(this.cultivate(allocated, { realm, ...options }));
                remaining -= allocated;
                if (remaining <= 0) break;
            }
            return { success: true, results, strategy: 'weakest' };
        }
        
        return { success: false, error: '未知调度策略' };
    }

    // ========== MCP工具实现 ==========

    /**
     * MCP工具：激活境界
     */
    mcpActivateRealm({ realm }) {
        const result = this.activateRealm(realm);
        return {
            success: result.success,
            message: result.success 
                ? `${realm}境界已激活，当前同步加成: x${result.syncMultiplier}`
                : result.error,
            activeRealms: result.activeRealms,
            syncMultiplier: result.syncMultiplier
        };
    }

    /**
     * MCP工具：停用境界
     */
    mcpDeactivateRealm({ realm }) {
        const result = this.deactivateRealm(realm);
        return {
            success: result.success,
            message: result.success
                ? `${realm}境界已停用，当前同步加成: x${result.syncMultiplier}`
                : result.error,
            activeRealms: result.activeRealms,
            syncMultiplier: result.syncMultiplier
        };
    }

    /**
     * MCP工具：修炼单个境界
     */
    mcpCultivateRealm({ duration, realm, useEpiphany, useKarma }) {
        const result = this.cultivate(duration, { realm, useEpiphany, useKarma });
        if (!result.success) return result;
        
        return {
            success: true,
            message: `${realm}境界修炼完成，进度+${result.progressGained.toFixed(2)}`,
            realm: result.realm,
            progress: result.progress,
            stage: result.stage,
            syncMultiplier: result.syncMultiplier,
            breakthroughTriggered: result.breakthroughTriggered,
            breakthrough: result.breakthroughResult,
            activeRealms: result.activeRealms
        };
    }

    /**
     * MCP工具：同步修炼所有境界
     */
    mcpCultivateAll({ duration, useEpiphany, useKarma }) {
        const result = this.cultivateAll(duration, { useEpiphany, useKarma });
        return {
            success: true,
            message: `同步修炼完成，${result.activeRealmCount}境同修，触发${result.breakthroughs}次突破`,
            activeRealmCount: result.activeRealmCount,
            syncMultiplier: result.syncMultiplier,
            results: result.results.map(r => ({
                realm: r.realm,
                progressGained: r.progressGained.toFixed(2),
                breakthrough: r.breakthroughTriggered
            })),
            breakthroughs: result.breakthroughDetails
        };
    }

    /**
     * MCP工具：获取境界状态
     */
    mcpGetRealmStatus() {
        const status = this.getAllRealmStatus();
        return {
            success: true,
            activeRealms: this.realmState.activeRealms,
            syncMultiplier: this.realmState.syncMultiplier,
            realms: status
        };
    }

    /**
     * MCP工具：自动调度修炼
     */
    mcpAutoSchedule({ duration, priority, useEpiphany, useKarma }) {
        const result = this.autoSchedule(duration, { priority, useEpiphany, useKarma });
        if (!result.success) return result;
        
        return {
            success: true,
            message: `自动调度(${priority})完成`,
            strategy: result.strategy || 'balanced',
            results: result.results?.map(r => ({
                realm: r.realm,
                progressGained: r.progressGained?.toFixed(2)
            })) || []
        };
    }
}

export { MultiRealmPipelineService as default };
