/**
 * 境界反馈循环服务
 * ruflo层次分解 + thunderbolt反馈循环增强
 * 将多维修炼、宗门、因果、顿悟、多线程整合为完整反馈循环
 */

import { MultiRealmPipelineService } from './MultiRealmPipelineService.js';
import { KarmaService } from './KarmaService.js';
import { EpiphanyService } from './EpiphanyService.js';
import { ParallelCultivationService } from './ParallelCultivationService.js';
import { SectManagementService } from '../../sect/services/SectManagementService.js';

// 反馈循环阶段
export const FEEDBACK_STAGES = {
    CULTIVATION: 'cultivation',     // 修炼阶段
    BREAKTHROUGH: 'breakthrough',   // 突破阶段
    INTEGRATION: 'integration',      // 整合阶段
    ASCENSION: 'ascension'          // 飞升阶段
};

// 反馈强度等级
const FEEDBACK_INTENSITY = {
    WEAK: 1.0,
    NORMAL: 1.2,
    STRONG: 1.5,
    PERFECT: 2.0
};

export class RealmFeedbackService {
    constructor(gameState) {
        this.gameState = gameState;
        this.feedbackState = gameState.realmFeedback || this.initFeedbackState();
        
        // 集成各子系统
        this.pipeline = new MultiRealmPipelineService(gameState);
        this.karma = new KarmaService(gameState);
        this.epiphany = new EpiphanyService(gameState);
        this.parallel = new ParallelCultivationService(gameState);
        this.sect = new SectManagementService(gameState);
    }

    initFeedbackState() {
        const state = {
            currentStage: FEEDBACK_STAGES.CULTIVATION,
            cycleCount: 0,
            totalBreakthroughs: 0,
            feedbackMultiplier: 1.0,
            intensityLevel: 'NORMAL',
            
            // 各系统状态摘要
            systemStates: {
                multiRealm: { activeRealms: ['body'], syncMultiplier: 1.0 },
                karma: { totalKarma: 0, feedbackType: 'neutral' },
                epiphany: { active: false, multiplier: 1.0 },
                parallel: { threadCount: 0, activeCount: 0 },
                sect: { memberCount: 0, reputation: 0 }
            },
            
            // 循环历史
            cycleHistory: [],
            
            // 飞升条件
            ascensionRequirements: {
                minLevel: 10,
                minKarma: 500,
                minRealms: 5,
                minBreakthroughs: 20
            }
        };
        this.gameState.realmFeedback = state;
        return state;
    }

    init(gameState) {
        this.feedbackState = gameState.realmFeedback || this.initFeedbackState();
        this.pipeline.init(gameState);
        this.karma.init(gameState);
        this.epiphany.init(gameState);
        this.parallel.init(gameState);
        this.sect.init(gameState);
        this.syncSystemStates();
        return this;
    }

    /**
     * 同步各子系统状态到反馈循环
     */
    syncSystemStates() {
        const s = this.feedbackState.systemStates;
        
        if (this.gameState.multiRealm) {
            s.multiRealm = {
                activeRealms: this.gameState.multiRealm.activeRealms,
                syncMultiplier: this.gameState.multiRealm.syncMultiplier
            };
        }
        
        if (this.gameState.karma) {
            s.karma = {
                totalKarma: this.gameState.karma.totalKarma,
                feedbackType: this.karma.getFeedbackType()
            };
        }
        
        if (this.gameState.epiphany) {
            s.epiphany = {
                active: this.gameState.epiphany.triggered,
                multiplier: this.gameState.epiphany.multiplier
            };
        }
        
        if (this.gameState.parallelCultivation) {
            s.parallel = {
                threadCount: Object.keys(this.gameState.parallelCultivation.threads).length,
                activeCount: this.gameState.parallelCultivation.activeCount
            };
        }
        
        if (this.gameState.sect) {
            s.sect = {
                memberCount: Object.keys(this.gameState.sect.members).length,
                reputation: this.gameState.sect.reputation
            };
        }
    }

    /**
     * 计算综合反馈倍率
     * 各系统协同产生的增强效果
     */
    calculateCombinedMultiplier() {
        let multiplier = 1.0;
        
        // 同步修炼加成
        multiplier *= this.feedbackState.systemStates.multiRealm.syncMultiplier;
        
        // 因果加成
        multiplier *= this.karma.getCultivationModifier();
        
        // 顿悟加成
        multiplier *= this.feedbackState.systemStates.epiphany.active 
            ? this.feedbackState.systemStates.epiphany.multiplier 
            : 1.0;
        
        // 多线程并行加成
        const parallelThreads = this.feedbackState.systemStates.parallel.activeCount;
        if (parallelThreads > 0) {
            multiplier *= (1 + parallelThreads * 0.1);  // 每线程+10%
        }
        
        // 宗门加成 (有成员时)
        if (this.feedbackState.systemStates.sect.memberCount > 0) {
            multiplier *= 1.1;
        }
        
        // 强度等级修正
        multiplier *= FEEDBACK_INTENSITY[this.feedbackState.intensityLevel] || 1.0;
        
        return multiplier;
    }

    /**
     * 执行一个反馈循环周期
     */
    executeCycleTick(deltaTime) {
        this.syncSystemStates();
        
        const cycleStart = {
            stage: this.feedbackState.currentStage,
            multiplier: this.calculateCombinedMultiplier(),
            timestamp: Date.now()
        };
        
        // 根据当前阶段执行不同逻辑
        let stageResult = null;
        
        switch (this.feedbackState.currentStage) {
            case FEEDBACK_STAGES.CULTIVATION:
                stageResult = this.tickCultivationPhase(deltaTime);
                break;
            case FEEDBACK_STAGES.BREAKTHROUGH:
                stageResult = this.tickBreakthroughPhase(deltaTime);
                break;
            case FEEDBACK_STAGES.INTEGRATION:
                stageResult = this.tickIntegrationPhase(deltaTime);
                break;
            case FEEDBACK_STAGES.ASCENSION:
                stageResult = this.tickAscensionPhase(deltaTime);
                break;
        }
        
        // 更新循环历史
        cycleStart.result = stageResult;
        cycleStart.cycleCount = this.feedbackState.cycleCount;
        this.feedbackState.cycleHistory.push(cycleStart);
        
        // 限制历史长度
        if (this.feedbackState.cycleHistory.length > 50) {
            this.feedbackState.cycleHistory.shift();
        }
        
        this.feedbackState.cycleCount++;
        
        // 检查是否需要升级强度等级
        this.checkIntensityUpgrade();
        
        return {
            cycleCount: this.feedbackState.cycleCount,
            currentStage: this.feedbackState.currentStage,
            combinedMultiplier: this.calculateCombinedMultiplier(),
            stageResult
        };
    }

    /**
     * 修炼阶段tick
     */
    tickCultivationPhase(deltaTime) {
        // 多维修炼流水线tick
        const pipelineResult = this.pipeline.cultivateAll(deltaTime);
        
        // 检查是否触发突破
        const breakthroughs = pipelineResult.breakthroughs || 0;
        if (breakthroughs > 0) {
            this.feedbackState.currentStage = FEEDBACK_STAGES.BREAKTHROUGH;
        }
        
        return {
            phase: 'cultivation',
            progress: pipelineResult.results?.[0]?.progress || 0,
            breakthroughs
        };
    }

    /**
     * 突破阶段tick
     */
    tickBreakthroughPhase(deltaTime) {
        // 处理突破事件
        this.feedbackState.totalBreakthroughs++;
        
        // 突破后返回修炼阶段
        this.feedbackState.currentStage = FEEDBACK_STAGES.CULTIVATION;
        
        return {
            phase: 'breakthrough',
            totalBreakthroughs: this.feedbackState.totalBreakthroughs
        };
    }

    /**
     * 整合阶段tick
     */
    tickIntegrationPhase(deltaTime) {
        // 整合各系统产生的收益
        const combinedBonus = this.calculateCombinedMultiplier();
        
        return {
            phase: 'integration',
            combinedBonus
        };
    }

    /**
     * 飞升阶段tick
     */
    tickAscensionPhase(deltaTime) {
        // 检查飞升条件
        const canAscend = this.checkAscensionRequirements();
        
        return {
            phase: 'ascension',
            canAscend,
            requirements: this.feedbackState.ascensionRequirements
        };
    }

    /**
     * 检查强度等级升级
     */
    checkIntensityUpgrade() {
        const breakthroughs = this.feedbackState.totalBreakthroughs;
        const karma = this.feedbackState.systemStates.karma.totalKarma;
        const realms = this.feedbackState.systemStates.multiRealm.activeRealms.length;
        
        if (breakthroughs >= 50 && karma >= 1000 && realms >= 5) {
            this.feedbackState.intensityLevel = 'PERFECT';
        } else if (breakthroughs >= 30 && karma >= 500 && realms >= 4) {
            this.feedbackState.intensityLevel = 'STRONG';
        } else if (breakthroughs >= 10 && karma >= 100 && realms >= 2) {
            this.feedbackState.intensityLevel = 'NORMAL';
        } else {
            this.feedbackState.intensityLevel = 'WEAK';
        }
    }

    /**
     * 检查飞升条件
     */
    checkAscensionRequirements() {
        const req = this.feedbackState.ascensionRequirements;
        const current = {
            level: this.gameState.cultivation?.level || 0,
            karma: this.feedbackState.systemStates.karma.totalKarma,
            realms: this.feedbackState.systemStates.multiRealm.activeRealms.length,
            breakthroughs: this.feedbackState.totalBreakthroughs
        };
        
        const met = {
            level: current.level >= req.minLevel,
            karma: current.karma >= req.minKarma,
            realms: current.realms >= req.minRealms,
            breakthroughs: current.breakthroughs >= req.minBreakthroughs
        };
        
        return {
            canAscend: Object.values(met).every(v => v),
            requirements: req,
            current,
            met
        };
    }

    /**
     * 触发特殊事件（外部调用）
     */
    triggerSpecialEvent(eventType, data = {}) {
        switch (eventType) {
            case 'major_breakthrough':
                this.feedbackState.totalBreakthroughs += 5;
                this.feedbackState.intensityLevel = 'STRONG';
                break;
            case 'sect_formation':
                this.feedbackState.systemStates.sect.memberCount++;
                break;
            case 'karma_swing':
                this.feedbackState.systemStates.karma.totalKarma += data.delta || 0;
                break;
        }
        
        this.checkIntensityUpgrade();
        return { success: true, newMultiplier: this.calculateCombinedMultiplier() };
    }

    // ========== MCP工具 ==========

    /**
     * MCP: 执行循环tick
     */
    mcpTickFeedbackLoop({ deltaTime }) {
        const result = this.executeCycleTick(deltaTime);
        return { success: true, ...result };
    }

    /**
     * MCP: 获取反馈循环状态
     */
    mcpGetFeedbackStatus() {
        this.syncSystemStates();
        return {
            success: true,
            currentStage: this.feedbackState.currentStage,
            cycleCount: this.feedbackState.cycleCount,
            totalBreakthroughs: this.feedbackState.totalBreakthroughs,
            feedbackMultiplier: this.feedbackState.feedbackMultiplier,
            intensityLevel: this.feedbackState.intensityLevel,
            combinedMultiplier: this.calculateCombinedMultiplier(),
            systemStates: this.feedbackState.systemStates,
            ascensionStatus: this.checkAscensionRequirements()
        };
    }

    /**
     * MCP: 触发特殊事件
     */
    mcpTriggerEvent({ eventType, data }) {
        return this.triggerSpecialEvent(eventType, data);
    }

    /**
     * MCP: 获取循环历史
     */
    mcpGetCycleHistory({ limit = 10 }) {
        const history = this.feedbackState.cycleHistory.slice(-limit);
        return {
            success: true,
            history: history.map(h => ({
                cycle: h.cycleCount,
                stage: h.stage,
                multiplier: h.multiplier,
                timestamp: h.timestamp
            }))
        };
    }

    /**
     * MCP: 检查飞升条件
     */
    mcpCheckAscension() {
        return {
            success: true,
            ...this.checkAscensionRequirements()
        };
    }
}

export { RealmFeedbackService as default };
