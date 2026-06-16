/**
 * RealmBreakthroughService.js - 境界层次突破系统
 * V260 方向A迭代2/9: ruflo层次分解 + thunderbolt pipeline
 * 
 * 提供MCP工具:
 * - realm.breakthrough - 执行境界突破
 * - realm.status - 查询境界状态
 * - realm.pipeline - 获取突破流水线状态
 */

// ===== 常量定义 =====

/**
 * 境界层次配置 (ruflo层次分解)
 * 共10个境界，每个境界有灵气阈值和突破成功率
 */
export const REALM_HIERARCHY = [
    { level: 0, name: '凡人', minSpiritEnergy: 0, baseSuccessRate: 1.0 },
    { level: 1, name: '炼气', minSpiritEnergy: 100, baseSuccessRate: 0.95 },
    { level: 2, name: '筑基', minSpiritEnergy: 500, baseSuccessRate: 0.90 },
    { level: 3, name: '金丹', minSpiritEnergy: 2000, baseSuccessRate: 0.85 },
    { level: 4, name: '元婴', minSpiritEnergy: 8000, baseSuccessRate: 0.80 },
    { level: 5, name: '化神', minSpiritEnergy: 30000, baseSuccessRate: 0.75 },
    { level: 6, name: '炼虚', minSpiritEnergy: 100000, baseSuccessRate: 0.70 },
    { level: 7, name: '合体', minSpiritEnergy: 300000, baseSuccessRate: 0.65 },
    { level: 8, name: '大乘', minSpiritEnergy: 800000, baseSuccessRate: 0.60 },
    { level: 9, name: '渡劫', minSpiritEnergy: 2000000, baseSuccessRate: 0.55 },
    { level: 10, name: '真仙', minSpiritEnergy: 0, baseSuccessRate: 1.0 }
];

/**
 * 突破流水线阶段 (thunderbolt pipeline)
 */
export const PIPELINE_STAGES = {
    ABSORB: 'absorb',           // 灵气吸收
    COMPRESS: 'compress',       // 丹田压缩
    CONDENSE: 'condense',       // 真元凝结
    TRANSFORM: 'transform',     // 境界转化
    BREAKTHROUGH: 'breakthrough' // 突破完成
};

/**
 * 突破状态
 */
export const BREAKTHROUGH_STATES = {
    IDLE: 'idle',               // 空闲
    ABSORBING: 'absorbing',     // 吸收中
    COMPRESSING: 'compressing', // 压缩中
    CONDENSING: 'condensing',    // 凝结中
    TRANSFORMING: 'transforming', // 转化中
    SUCCESS: 'success',         // 突破成功
    FAILED: 'failed'            // 突破失败
};

/**
 * 突破配置
 */
export const BREAKTHROUGH_CONFIG = {
    // 每阶段基础时间(毫秒)
    stageBaseTime: 1000,
    // 境界等级对时间的影响因子
    realmTimeMultiplier: 1.2,
    // 突破成功灵气消耗比例
    spiritConsumptionRatio: 0.8,
    // 突破失败灵气损失比例
    failureSpiritLoss: 0.3,
    // 最大历史记录数
    maxHistorySize: 50
};

// ===== 服务类 =====

/**
 * 境界层次突破服务类
 */
class RealmBreakthroughService {
    constructor(gameState) {
        this.gameState = gameState;
        this.pipelineState = null;
    }

    /**
     * 初始化境界突破系统
     * @param {Object} gameState - 游戏状态
     * @returns {Object} 初始化后的游戏状态
     */
    init(gameState) {
        if (!gameState.realmBreakthrough) {
            gameState.realmBreakthrough = {
                currentRealm: 0,
                spiritEnergy: 0,
                pipelineStage: BREAKTHROUGH_STATES.IDLE,
                pipelineProgress: 0,
                lastBreakthroughTime: null,
                history: [],
                totalBreakthroughs: 0,
                successCount: 0,
                failureCount: 0
            };
        } else {
            // Ensure required fields exist
            if (!gameState.realmBreakthrough.history) {
                gameState.realmBreakthrough.history = [];
            }
        }
        this.pipelineState = gameState.realmBreakthrough;
        return gameState;
    }

    /**
     * 获取当前境界信息
     * @returns {Object} 境界信息
     */
    getRealmInfo() {
        const realm = this.pipelineState.currentRealm;
        const realmData = REALM_HIERARCHY[realm] || REALM_HIERARCHY[0];
        return {
            level: realm,
            name: realmData.name,
            spiritEnergy: this.pipelineState.spiritEnergy,
            nextRealm: realm < REALM_HIERARCHY.length - 1 ? REALM_HIERARCHY[realm + 1] : null
        };
    }

    /**
     * 获取突破流水线状态 (thunderbolt pipeline)
     * @returns {Object} 流水线状态
     */
    getPipelineStatus() {
        return {
            stage: this.pipelineState.pipelineStage,
            progress: this.pipelineState.pipelineProgress,
            currentRealm: this.pipelineState.currentRealm,
            spiritEnergy: this.pipelineState.spiritEnergy
        };
    }

    /**
     * 计算突破成功率
     * @param {number} targetRealm - 目标境界
     * @returns {number} 成功率(0-1)
     */
    calculateSuccessRate(targetRealm) {
        if (targetRealm < 0 || targetRealm >= REALM_HIERARCHY.length) return 0;
        const targetData = REALM_HIERARCHY[targetRealm];
        const baseRate = targetData.baseSuccessRate;
        
        // 灵气充足度加成
        const required = targetData.minSpiritEnergy;
        const available = this.pipelineState.spiritEnergy;
        const spiritBonus = Math.min(0.1, (available / required) * 0.1);
        
        return Math.min(0.99, baseRate + spiritBonus);
    }

    /**
     * 执行突破流水线的一步 (thunderbolt pipeline机制)
     * @returns {Object} 执行结果
     */
    executePipelineStep() {
        const currentStage = this.pipelineState.pipelineStage;
        
        // 根据当前阶段执行相应操作
        switch (currentStage) {
            case BREAKTHROUGH_STATES.IDLE:
                return { stage: currentStage, message: '无进行中的突破' };
                
            case BREAKTHROUGH_STATES.ABSORBING:
                return this.processAbsorb();
                
            case BREAKTHROUGH_STATES.COMPRESSING:
                return this.processCompress();
                
            case BREAKTHROUGH_STATES.CONDENSING:
                return this.processCondense();
                
            case BREAKTHROUGH_STATES.TRANSFORMING:
                return this.processTransform();
                
            default:
                return { error: '未知阶段' };
        }
    }

    /**
     * 处理吸收阶段
     */
    processAbsorb() {
        const currentRealm = this.pipelineState.currentRealm;
        const realmData = REALM_HIERARCHY[currentRealm];
        const required = realmData.minSpiritEnergy;
        const available = this.pipelineState.spiritEnergy;
        
        if (available >= required * 0.5) {
            this.pipelineState.pipelineStage = BREAKTHROUGH_STATES.COMPRESSING;
            this.pipelineState.pipelineProgress = 25;
            return { 
                stage: BREAKTHROUGH_STATES.COMPRESSING, 
                progress: 25,
                message: '灵气吸收完成，进入压缩阶段' 
            };
        }
        
        return { 
            stage: BREAKTHROUGH_STAGES.ABSORB, 
            progress: Math.floor((available / required) * 100),
            message: '灵气吸收中...' 
        };
    }

    /**
     * 处理压缩阶段
     */
    processCompress() {
        this.pipelineState.pipelineStage = BREAKTHROUGH_STATES.CONDENSING;
        this.pipelineState.pipelineProgress = 50;
        return { 
            stage: BREAKTHROUGH_STATES.CONDENSING, 
            progress: 50,
            message: '灵气压缩完成，进入凝结阶段' 
        };
    }

    /**
     * 处理凝结阶段
     */
    processCondense() {
        this.pipelineState.pipelineStage = BREAKTHROUGH_STATES.TRANSFORMING;
        this.pipelineState.pipelineProgress = 75;
        return { 
            stage: BREAKTHROUGH_STATES.TRANSFORMING, 
            progress: 75,
            message: '真元凝结完成，进入转化阶段' 
        };
    }

    /**
     * 处理转化阶段并判定突破结果
     */
    processTransform() {
        const currentRealm = this.pipelineState.currentRealm;
        const targetRealm = currentRealm + 1;
        
        if (targetRealm >= REALM_HIERARCHY.length) {
            this.pipelineState.pipelineStage = BREAKTHROUGH_STATES.SUCCESS;
            this.pipelineState.pipelineProgress = 100;
            return { 
                stage: BREAKTHROUGH_STATES.SUCCESS, 
                progress: 100,
                message: '已达最高境界' 
            };
        }
        
        const successRate = this.calculateSuccessRate(targetRealm);
        const random = Math.random();
        const success = random < successRate;
        
        if (success) {
            this.pipelineState.currentRealm = targetRealm;
            const consumed = this.pipelineState.spiritEnergy * BREAKTHROUGH_CONFIG.spiritConsumptionRatio;
            this.pipelineState.spiritEnergy -= consumed;
            this.pipelineState.pipelineStage = BREAKTHROUGH_STATES.SUCCESS;
            this.pipelineState.pipelineProgress = 100;
            this.pipelineState.totalBreakthroughs++;
            this.pipelineState.successCount++;
            this.pipelineState.lastBreakthroughTime = Date.now();
            
            this.recordHistory('success', {
                fromRealm: currentRealm,
                toRealm: targetRealm,
                targetName: REALM_HIERARCHY[targetRealm].name,
                successRate
            });
            
            return {
                stage: BREAKTHROUGH_STATES.SUCCESS,
                progress: 100,
                message: `突破成功！晋升${REALM_HIERARCHY[targetRealm].name}`,
                newRealm: targetRealm
            };
        } else {
            const lost = this.pipelineState.spiritEnergy * BREAKTHROUGH_CONFIG.failureSpiritLoss;
            this.pipelineState.spiritEnergy -= lost;
            this.pipelineState.pipelineStage = BREAKTHROUGH_STATES.FAILED;
            this.pipelineState.totalBreakthroughs++;
            this.pipelineState.failureCount++;
            this.pipelineState.lastBreakthroughTime = Date.now();
            
            this.recordHistory('failed', {
                targetRealm,
                targetName: REALM_HIERARCHY[targetRealm].name,
                successRate,
                spiritLoss: lost
            });
            
            return {
                stage: BREAKTHROUGH_STATES.FAILED,
                progress: 100,
                message: '突破失败，灵根受损',
                spiritLoss: lost
            };
        }
    }

    /**
     * 开始突破流程 (thunderbolt pipeline启动)
     * @param {Object} params - { spiritEnergy?: number }
     * @returns {Object} 启动结果
     */
    startBreakthrough(params = {}) {
        const currentRealm = this.pipelineState.currentRealm;
        
        if (currentRealm >= REALM_HIERARCHY.length - 1) {
            return { success: false, message: '已达最高境界，无需突破' };
        }
        
        // 添加灵气
        if (params.spiritEnergy) {
            this.pipelineState.spiritEnergy += params.spiritEnergy;
        }
        
        const realmData = REALM_HIERARCHY[currentRealm];
        if (this.pipelineState.spiritEnergy < realmData.minSpiritEnergy) {
            return { 
                success: false, 
                message: `灵气不足，需要${realmData.minSpiritEnergy}点灵气才能突破至${REALM_HIERARCHY[currentRealm + 1].name}` 
            };
        }
        
        // 启动流水线 (thunderbolt pipeline)
        this.pipelineState.pipelineStage = BREAKTHROUGH_STATES.ABSORBING;
        this.pipelineState.pipelineProgress = 0;
        
        return {
            success: true,
            stage: BREAKTHROUGH_STATES.ABSORBING,
            message: '突破开始，灵气吸收阶段',
            currentRealm: currentRealm,
            targetRealm: currentRealm + 1,
            targetName: REALM_HIERARCHY[currentRealm + 1].name,
            successRate: this.calculateSuccessRate(currentRealm + 1)
        };
    }

    /**
     * 重置突破状态
     */
    resetPipeline() {
        this.pipelineState.pipelineStage = BREAKTHROUGH_STATES.IDLE;
        this.pipelineState.pipelineProgress = 0;
    }

    /**
     * 添加灵气
     * @param {number} amount - 灵气数量
     * @returns {Object} 添加结果
     */
    addSpiritEnergy(amount) {
        this.pipelineState.spiritEnergy += amount;
        return {
            success: true,
            added: amount,
            total: this.pipelineState.spiritEnergy
        };
    }

    /**
     * 记录历史
     */
    recordHistory(result, details) {
        if (!this.pipelineState.history) {
            this.pipelineState.history = [];
        }
        this.pipelineState.history.push({
            result,
            details,
            timestamp: Date.now()
        });
        // 保持历史记录不超过最大数量
        if (this.pipelineState.history.length > BREAKTHROUGH_CONFIG.maxHistorySize) {
            this.pipelineState.history.shift();
        }
    }

    /**
     * 获取历史记录
     * @param {number} limit - 返回记录数量
     * @returns {Array} 历史记录
     */
    getHistory(limit = 10) {
        const history = this.pipelineState.history || [];
        return history.slice(-limit);
    }

    // ========== MCP工具实现 ==========

    /**
     * MCP工具: realm.breakthrough - 执行境界突破
     */
    mcpRealmBreakthrough(params = {}) {
        const stage = this.pipelineState.pipelineStage;
        
        // 如果是空闲状态，启动新突破
        if (stage === BREAKTHROUGH_STATES.IDLE) {
            return this.startBreakthrough(params);
        }
        
        // 如果是进行中，执行流水线步骤
        if ([BREAKTHROUGH_STATES.ABSORBING, BREAKTHROUGH_STATES.COMPRESSING, 
             BREAKTHROUGH_STATES.CONDENSING, BREAKTHROUGH_STATES.TRANSFORMING].includes(stage)) {
            return this.executePipelineStep();
        }
        
        // 成功或失败状态，重置后可以开始新突破
        if (stage === BREAKTHROUGH_STATES.SUCCESS || stage === BREAKTHROUGH_STATES.FAILED) {
            this.resetPipeline();
            return this.startBreakthrough(params);
        }
        
        return { error: '未知状态' };
    }

    /**
     * MCP工具: realm.status - 查询境界状态
     */
    mcpRealmStatus() {
        return {
            success: true,
            ...this.getRealmInfo(),
            pipeline: this.getPipelineStatus(),
            stats: {
                totalBreakthroughs: this.pipelineState.totalBreakthroughs,
                successCount: this.pipelineState.successCount,
                failureCount: this.pipelineState.failureCount,
                successRate: this.pipelineState.totalBreakthroughs > 0 
                    ? (this.pipelineState.successCount / this.pipelineState.totalBreakthroughs * 100).toFixed(1) + '%'
                    : '0%'
            },
            history: this.getHistory(5)
        };
    }

    /**
     * MCP工具: realm.pipeline - 获取突破流水线状态
     */
    mcpRealmPipeline() {
        const status = this.getPipelineStatus();
        const stageInfoMap = {
            'absorbing': '灵气吸收阶段 - 从天地间汲取灵气',
            'compressing': '灵气压缩阶段 - 将灵气压缩至丹田',
            'condensing': '真元凝结阶段 - 凝结成丹',
            'transforming': '境界转化阶段 - 完成境界升华',
            'success': '突破成功',
            'failed': '突破失败',
            'idle': '空闲状态'
        };
        return {
            success: true,
            ...status,
            stageInfo: stageInfoMap[status.stage] || '未知',
            nextAction: status.stage === 'idle'
                ? '调用 realm.breakthrough 开始突破'
                : '继续调用 realm.breakthrough 执行突破步骤'
        };
    }
}

export { RealmBreakthroughService };