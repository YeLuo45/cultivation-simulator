/**
 * 修仙游戏完整生态整合服务
 * V267 方向A迭代9/9: 六设计系统融合
 * 
 * 整合所有子系统，提供统一游戏循环
 * - nanobot: 多维修炼mesh
 * - thunderbolt: 反馈pipeline
 * - chatdev: 宗门角色专业化
 * - claude-code: 因果反馈循环
 * - generic-agent: 多线程自主目标
 * - ruflo: 层次分解
 */

import { RealmFeedbackService } from './RealmFeedbackService.js';
import { MultiRealmPipelineService } from './MultiRealmPipelineService.js';
import { KarmaService } from './KarmaService.js';
import { EpiphanyService } from './EpiphanyService.js';
import { ParallelCultivationService } from './ParallelCultivationService.js';
import { RealmBreakthroughService } from './RealmBreakthroughService.js';
import { SectManagementService } from '../../sect/services/SectManagementService.js';

// 游戏阶段
export const GAME_PHASES = {
    STARTUP: 'startup',
    CULTIVATING: 'cultivating',
    SECT_PHASE: 'sect_phase',
    COMBAT: 'combat',
    ASCENSION: 'ascension',
    ENDGAME: 'endgame'
};

export class CultivationEcosystemService {
    constructor(gameState) {
        this.gameState = gameState;
        this.ecosystem = gameState.ecosystem || this.initEcosystem();
        
        // 初始化所有子系统
        this.realmFeedback = new RealmFeedbackService(gameState);
        this.multiRealm = new MultiRealmPipelineService(gameState);
        this.karma = new KarmaService(gameState);
        this.epiphany = new EpiphanyService(gameState);
        this.parallel = new ParallelCultivationService(gameState);
        this.breakthrough = new RealmBreakthroughService(gameState);
        this.sect = new SectManagementService(gameState);
    }

    initEcosystem() {
        const state = {
            phase: GAME_PHASES.STARTUP,
            tickCount: 0,
            totalPlayTime: 0,
            
            // 玩家核心属性
            player: {
                name: '修仙者',
                level: 1,
                experience: 0,
                spiritStones: 100,
                cultivationSpeed: 1.0,
                maxEnergy: 100,
                energy: 100
            },
            
            // 系统统计
            stats: {
                totalCultivationTime: 0,
                totalBreakthroughs: 0,
                totalKarmaEarned: 0,
                epiphaniesTriggered: 0,
                missionsCompleted: 0,
                sectsJoined: 0
            },
            
            // 成就系统
            achievements: [],
            
            // 存档状态
            saveSlots: [null, null, null],
            lastSaveTime: null
        };
        
        this.gameState.ecosystem = state;
        return state;
    }

    init(gameState) {
        this.ecosystem = gameState.ecosystem || this.initEcosystem();
        this.realmFeedback.init(gameState);
        this.multiRealm.init(gameState);
        this.karma.init(gameState);
        this.epiphany.init(gameState);
        this.parallel.init(gameState);
        this.breakthrough.init(gameState);
        this.sect.init(gameState);
        
        // 如果是新游戏，设置初始阶段
        if (this.ecosystem.phase === GAME_PHASES.STARTUP) {
            this.ecosystem.phase = GAME_PHASES.CULTIVATING;
        }
        
        return this;
    }

    /**
     * 主游戏循环tick
     */
    gameTick(deltaTime) {
        this.ecosystem.tickCount++;
        this.ecosystem.totalPlayTime += deltaTime;
        
        const results = [];
        
        // 根据当前阶段执行不同的游戏逻辑
        switch (this.ecosystem.phase) {
            case GAME_PHASES.CULTIVATING:
                results.push(...this.tickCultivation(deltaTime));
                break;
            case GAME_PHASES.SECT_PHASE:
                results.push(...this.tickSectPhase(deltaTime));
                break;
            case GAME_PHASES.COMBAT:
                results.push(...this.tickCombat(deltaTime));
                break;
            case GAME_PHASES.ASCENSION:
                results.push(...this.tickAscension(deltaTime));
                break;
        }
        
        // 更新玩家能量自然恢复
        this.updateEnergy(deltaTime);
        
        // 检查阶段转换
        this.checkPhaseTransition();
        
        return {
            tickCount: this.ecosystem.tickCount,
            phase: this.ecosystem.phase,
            player: this.ecosystem.player,
            results
        };
    }

    /**
     * 修炼阶段tick
     */
    tickCultivation(deltaTime) {
        const results = [];
        
        // 1. 多维修炼流水线
        const pipelineResult = this.multiRealm.cultivateAll(deltaTime);
        results.push({ system: 'multiRealm', ...pipelineResult });
        
        // 2. 多线程并行修炼
        const parallelResult = this.parallel.scheduleAll(deltaTime);
        results.push({ system: 'parallel', threadsUpdated: parallelResult.length });
        
        // 3. 反馈循环更新
        const feedbackResult = this.realmFeedback.executeCycleTick(deltaTime);
        results.push({ system: 'feedback', ...feedbackResult });
        
        // 4. 经验值获取
        const expGain = this.calculateExpGain(deltaTime, pipelineResult);
        this.ecosystem.player.experience += expGain;
        this.ecosystem.stats.totalCultivationTime += deltaTime;
        
        // 5. 境界突破检测
        if (this.ecosystem.player.experience >= this.getLevelRequirement()) {
            this.levelUp();
        }
        
        return results;
    }

    /**
     * 宗门阶段tick
     */
    tickSectPhase(deltaTime) {
        const results = [];
        // 宗门任务tick
        results.push({ system: 'sect', message: '宗门阶段进行中' });
        return results;
    }

    /**
     * 战斗阶段tick
     */
    tickCombat(deltaTime) {
        return [{ system: 'combat', message: '战斗阶段' }];
    }

    /**
     * 飞升阶段tick
     */
    tickAscension(deltaTime) {
        const ascension = this.realmFeedback.checkAscensionRequirements();
        return [{ system: 'ascension', ...ascension }];
    }

    /**
     * 计算经验值获取
     */
    calculateExpGain(deltaTime, pipelineResult) {
        const baseExp = deltaTime / 1000;  // 每秒1点基础经验
        
        // 多维修炼加成
        const realmBonus = this.ecosystem.player.cultivationSpeed;
        
        // 反馈循环加成
        const feedbackMultiplier = this.realmFeedback.calculateCombinedMultiplier();
        
        return baseExp * realmBonus * feedbackMultiplier;
    }

    /**
     * 升级
     */
    levelUp() {
        const requirement = this.getLevelRequirement();
        this.ecosystem.player.experience -= requirement;
        this.ecosystem.player.level++;
        
        // 升级加成
        this.ecosystem.player.cultivationSpeed *= 1.1;
        
        return { levelUp: true, newLevel: this.ecosystem.player.level };
    }

    /**
     * 获取升级所需经验
     */
    getLevelRequirement() {
        return Math.floor(100 * Math.pow(1.5, this.ecosystem.player.level - 1));
    }

    /**
     * 更新能量
     */
    updateEnergy(deltaTime) {
        // 每秒恢复1点能量
        const recovery = deltaTime / 1000;
        this.ecosystem.player.energy = Math.min(
            this.ecosystem.maxEnergy,
            this.ecosystem.player.energy + recovery
        );
    }

    /**
     * 消耗能量
     */
    consumeEnergy(amount) {
        if (this.ecosystem.player.energy < amount) {
            return { success: false, error: '能量不足' };
        }
        this.ecosystem.player.energy -= amount;
        return { success: true, remaining: this.ecosystem.player.energy };
    }

    /**
     * 检查阶段转换
     */
    checkPhaseTransition() {
        const player = this.ecosystem.player;
        
        // 从 startup 转换
        if (this.ecosystem.phase === GAME_PHASES.STARTUP) {
            this.ecosystem.phase = GAME_PHASES.CULTIVATING;
        }
        
        // 检查是否应该进入宗门阶段
        if (this.ecosystem.phase === GAME_PHASES.CULTIVATING && 
            player.level >= 3 && 
            Object.keys(this.gameState.sect?.members || {}).length > 0) {
            this.ecosystem.phase = GAME_PHASES.SECT_PHASE;
        }
        
        // 检查是否应该进入飞升阶段
        if (this.ecosystem.phase === GAME_PHASES.CULTIVATING && 
            this.realmFeedback.feedbackState.totalBreakthroughs >= 20) {
            this.ecosystem.phase = GAME_PHASES.ASCENSION;
        }
    }

    /**
     * 触发顿悟
     */
    triggerEpiphany(type = 'general') {
        const result = this.epiphany.triggerEpiphany({ type });
        if (result && result.triggered) {
            this.ecosystem.stats.epiphaniesTriggered++;
        }
        return result;
    }

    /**
     * 记录善行
     */
    recordGoodDeed(description) {
        return this.karma.mcpKarmaAction({ action: 'good', description });
    }

    /**
     * 记录恶行
     */
    recordBadDeed(description) {
        return this.karma.mcpKarmaAction({ action: 'bad', description });
    }

    /**
     * 添加灵石
     */
    addSpiritStones(amount) {
        this.ecosystem.player.spiritStones += amount;
        return { success: true, balance: this.ecosystem.player.spiritStones };
    }

    /**
     * 消耗灵石
     */
    spendSpiritStones(amount) {
        if (this.ecosystem.player.spiritStones < amount) {
            return { success: false, error: '灵石不足' };
        }
        this.ecosystem.player.spiritStones -= amount;
        return { success: true, remaining: this.ecosystem.player.spiritStones };
    }

    /**
     * 解锁成就
     */
    unlockAchievement(achievementId, name) {
        if (this.ecosystem.achievements.includes(achievementId)) {
            return { success: false, message: '成就已解锁' };
        }
        this.ecosystem.achievements.push(achievementId);
        return { success: true, achievement: name };
    }

    /**
     * 保存游戏
     */
    saveGame(slot = 0) {
        const saveData = JSON.parse(JSON.stringify({
            ecosystem: this.ecosystem,
            cultivation: this.gameState.cultivation,
            karma: this.gameState.karma,
            epiphany: this.gameState.epiphany,
            multiRealm: this.gameState.multiRealm,
            parallelCultivation: this.gameState.parallelCultivation,
            sect: this.gameState.sect,
            realmFeedback: this.gameState.realmFeedback,
            timestamp: Date.now()
        }));
        
        this.ecosystem.saveSlots[slot] = saveData;
        this.ecosystem.lastSaveTime = Date.now();
        
        return { success: true, slot, timestamp: this.ecosystem.lastSaveTime };
    }

    /**
     * 加载游戏
     */
    loadGame(slot = 0) {
        const saveData = this.ecosystem.saveSlots[slot];
        if (!saveData) {
            return { success: false, error: '存档不存在' };
        }
        
        // 恢复状态
        Object.assign(this.gameState, saveData);
        this.init(this.gameState);
        
        return { success: true, slot, timestamp: saveData.timestamp };
    }

    // ========== MCP工具 ==========

    /**
     * MCP: 执行游戏tick
     */
    mcpGameTick({ deltaTime }) {
        const result = this.gameTick(deltaTime);
        return { success: true, ...result };
    }

    /**
     * MCP: 获取完整游戏状态
     */
    mcpGetGameStatus() {
        return {
            success: true,
            phase: this.ecosystem.phase,
            tickCount: this.ecosystem.tickCount,
            player: this.ecosystem.player,
            stats: this.ecosystem.stats,
            achievements: this.ecosystem.achievements,
            multiRealm: this.multiRealm.mcpGetRealmStatus(),
            karma: this.karma.mcpKarmaStatus(),
            epiphany: this.epiphany.mcpEpiphanyStatus(),
            parallel: this.parallel.mcpGetAllThreads(),
            sect: this.sect.mcpGetSectStatus(),
            feedback: this.realmFeedback.mcpGetFeedbackStatus()
        };
    }

    /**
     * MCP: 执行修炼
     */
    mcpCultivate({ duration, useEpiphany, useKarma }) {
        const result = this.multiRealm.mcpCultivateAll({ duration, useEpiphany, useKarma });
        return { success: true, ...result };
    }

    /**
     * MCP: 触发顿悟
     */
    mcpTriggerEpiphany({ type }) {
        return this.triggerEpiphany(type);
    }

    /**
     * MCP: 记录善行
     */
    mcpRecordGoodDeed({ description }) {
        return this.recordGoodDeed(description);
    }

    /**
     * MCP: 记录恶行
     */
    mcpRecordBadDeed({ description }) {
        return this.recordBadDeed(description);
    }

    /**
     * MCP: 创建宗门
     */
    mcpCreateSect({ name }) {
        this.ecosystem.phase = GAME_PHASES.SECT_PHASE;
        this.sect.sectState.name = name;
        return { success: true, sectName: name };
    }

    /**
     * MCP: 保存游戏
     */
    mcpSaveGame({ slot }) {
        return this.saveGame(slot);
    }

    /**
     * MCP: 加载游戏
     */
    mcpLoadGame({ slot }) {
        return this.loadGame(slot);
    }

    /**
     * MCP: 解锁成就
     */
    mcpUnlockAchievement({ achievementId, name }) {
        return this.unlockAchievement(achievementId, name);
    }

    /**
     * MCP: 获取玩家状态
     */
    mcpGetPlayer() {
        return {
            success: true,
            player: this.ecosystem.player,
            levelProgress: `${this.ecosystem.player.experience}/${this.getLevelRequirement()}`,
            levelRatio: (this.ecosystem.player.experience / this.getLevelRequirement() * 100).toFixed(1) + '%'
        };
    }
}

export { CultivationEcosystemService as default };
