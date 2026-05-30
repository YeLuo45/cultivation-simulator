/**
 * YuanInfantService.js - 元婴出窍系统
 * V239 Direction A: 元婴出窍系统 - generic-agent/chatdev
 * 
 * 提供6个MCP工具:
 * - yuaninfant.form - 凝聚元婴
 * - yuaninfant.separate - 灵魂分离
 * - yuaninfant.project - 星体投射
 * - yuaninfant.sync - 同步元婴
 * - yuaninfant.recall - 召回元婴
 * - yuaninfant.status - 查询元婴状态
 */

import { CultivationService } from './CultivationService.js';

// ===== 常量定义 =====

/**
 * 元婴境界配置
 * realm=5 (化神境) 是形成元婴的最低要求
 */
export const YUAN_INFANT_REQUIREMENTS = {
    minRealm: 5,                    // 化神境 (realm=5)
    minSpiritEnergy: 500,           // 最低灵力要求
    formCost: 1000,                 // 凝聚元婴消耗
    separationDuration: 3600000,   // 分离持续时间 (1小时)
    projectionRange: 1000,          // 投射范围 (里)
    projectionCost: 200            // 投射消耗灵力
};

/**
 * 元婴状态
 */
export const YUAN_INFANT_STATES = {
    NONE: 'none',           // 未形成
    FORMING: 'forming',     // 凝聚中
    FORMED: 'formed',       // 已形成
    SEPARATED: 'separated', // 已分离
    PROJECTING: 'projecting', // 星体投射中
    SYNCHRONIZING: 'synchronizing' // 同步中
};

/**
 * 元婴属性配置
 */
export const YUAN_INFANT_ATTRIBUTES = {
    spiritualPower: { name: '精神力', base: 100, growth: 20 },
    perceptionRange: { name: '感知范围', base: 50, growth: 10 },
    syncRate: { name: '同步率', base: 100, growth: 0 }
};

// ===== 服务类 =====

/**
 * 元婴出窍服务类
 */
class YuanInfantService {
    constructor(gameState) {
        this.gameState = gameState;
        this.yuanInfantState = null;
    }

    /**
     * 初始化元婴系统
     * @param {Object} gameState - 游戏状态
     * @returns {Object} 初始化后的游戏状态
     */
    init(gameState) {
        if (!gameState.yuanInfant) {
            gameState.yuanInfant = {
                state: YUAN_INFANT_STATES.NONE,
                spiritualPower: 0,
                perceptionRange: 0,
                syncRate: 100,
                formationTime: null,
                separationTime: null,
                separationEndTime: null,
                projectionTarget: null,
                projectionInfo: [],
                lastSyncTime: null,
                history: []
            };
        }
        this.yuanInfantState = gameState.yuanInfant;
        return gameState;
    }

    /**
     * 记录历史事件
     */
    recordHistory(action, details) {
        if (!this.yuanInfantState.history) {
            this.yuanInfantState.history = [];
        }
        this.yuanInfantState.history.push({
            action,
            details,
            timestamp: Date.now()
        });
        // 保持历史记录不超过50条
        if (this.yuanInfantState.history.length > 50) {
            this.yuanInfantState.history = this.yuanInfantState.history.slice(-50);
        }
    }

    /**
     * 检查是否满足凝聚元婴条件
     * @returns {Object} 条件检查结果
     */
    checkFormationRequirements() {
        const gs = this.gameState;
        const requirements = [];

        // 1. 境界要求 (化神境 realm=5)
        const realmMet = (gs.realm || 0) >= YUAN_INFANT_REQUIREMENTS.minRealm;
        requirements.push({
            type: 'realm',
            desc: `境界达到化神境 (realm≥${YUAN_INFANT_REQUIREMENTS.minRealm})`,
            met: realmMet,
            current: gs.realm || 0,
            required: YUAN_INFANT_REQUIREMENTS.minRealm
        });

        // 2. 灵力要求
        const spiritEnergyMet = (gs.spiritEnergy || 0) >= YUAN_INFANT_REQUIREMENTS.minSpiritEnergy;
        requirements.push({
            type: 'spiritEnergy',
            desc: `灵力达到${YUAN_INFANT_REQUIREMENTS.minSpiritEnergy}`,
            met: spiritEnergyMet,
            current: gs.spiritEnergy || 0,
            required: YUAN_INFANT_REQUIREMENTS.minSpiritEnergy
        });

        // 3. 灵石消耗
        const spiritStonesMet = (gs.spiritStones || 0) >= YUAN_INFANT_REQUIREMENTS.formCost;
        requirements.push({
            type: 'spiritStones',
            desc: `拥有至少${YUAN_INFANT_REQUIREMENTS.formCost}灵石`,
            met: spiritStonesMet,
            current: gs.spiritStones || 0,
            required: YUAN_INFANT_REQUIREMENTS.formCost
        });

        // 4. 元婴尚未形成
        const notFormed = this.yuanInfantState.state === YUAN_INFANT_STATES.NONE;
        requirements.push({
            type: 'notFormed',
            desc: '元婴尚未形成',
            met: notFormed,
            current: this.yuanInfantState.state,
            required: YUAN_INFANT_STATES.NONE
        });

        const metCount = requirements.filter(r => r.met).length;
        const allMet = metCount === requirements.length;

        return {
            success: true,
            canForm: allMet,
            requirementsMet: metCount,
            requirementsTotal: requirements.length,
            requirements
        };
    }

    /**
     * 凝聚元婴 (yuaninfant.form)
     * @param {Object} params - 可选参数
     * @returns {Object} 凝聚结果
     */
    formYuanInfant(params = {}) {
        // 检查是否已形成
        if (this.yuanInfantState.state !== YUAN_INFANT_STATES.NONE) {
            return {
                success: false,
                error: '元婴已经形成，无法再次凝聚',
                currentState: this.yuanInfantState.state
            };
        }

        // 检查条件
        const reqCheck = this.checkFormationRequirements();
        if (!reqCheck.canForm) {
            const unmet = reqCheck.requirements.filter(r => !r.met).map(r => r.desc);
            return {
                success: false,
                error: '凝聚元婴条件未满足',
                unmetRequirements: unmet,
                requirementsCheck: reqCheck
            };
        }

        // 扣除灵石
        const cost = YUAN_INFANT_REQUIREMENTS.formCost;
        this.gameState.spiritStones -= cost;

        // 设置元婴状态为凝聚中
        this.yuanInfantState.state = YUAN_INFANT_STATES.FORMING;

        // 计算元婴属性 (基于境界和灵根)
        const realm = this.gameState.realm || 5;
        const spiritRootTier = this.gameState.spiritRoot?.tier || 1;
        const baseSp = YUAN_INFANT_ATTRIBUTES.spiritualPower.base + realm * YUAN_INFANT_ATTRIBUTES.spiritualPower.growth;
        const basePr = YUAN_INFANT_ATTRIBUTES.perceptionRange.base + realm * YUAN_INFANT_ATTRIBUTES.perceptionRange.growth;

        this.yuanInfantState.spiritualPower = Math.floor(baseSp * (1 + spiritRootTier * 0.1));
        this.yuanInfantState.perceptionRange = Math.floor(basePr * (1 + spiritRootTier * 0.1));
        this.yuanInfantState.syncRate = YUAN_INFANT_ATTRIBUTES.syncRate.base;
        this.yuanInfantState.formationTime = Date.now();

        // 消耗灵力
        this.gameState.spiritEnergy = Math.max(0, (this.gameState.spiritEnergy || 0) - YUAN_INFANT_REQUIREMENTS.minSpiritEnergy);

        // 记录历史
        this.recordHistory('form', {
            spiritualPower: this.yuanInfantState.spiritualPower,
            perceptionRange: this.yuanInfantState.perceptionRange,
            cost
        });

        return {
            success: true,
            message: '元婴凝聚成功！恭喜踏入元婴境！',
            yuanInfant: {
                state: YUAN_INFANT_STATES.FORMED,
                spiritualPower: this.yuanInfantState.spiritualPower,
                perceptionRange: this.yuanInfantState.perceptionRange,
                syncRate: this.yuanInfantState.syncRate,
                formationTime: this.yuanInfantState.formationTime
            },
            costDeducted: cost
        };
    }

    /**
     * 灵魂分离 (yuaninfant.separate)
     * @param {Object} params - { duration?: number } 分离持续时间(ms)
     * @returns {Object} 分离结果
     */
    separateSoul(params = {}) {
        // 检查元婴是否已形成
        if (this.yuanInfantState.state === YUAN_INFANT_STATES.NONE) {
            return {
                success: false,
                error: '元婴尚未形成，无法进行灵魂分离'
            };
        }

        // 检查是否正在分离
        if (this.yuanInfantState.state === YUAN_INFANT_STATES.SEPARATED) {
            return {
                success: false,
                error: '元婴已经分离，请先召回'
            };
        }

        // 检查是否正在投射
        if (this.yuanInfantState.state === YUAN_INFANT_STATES.PROJECTING) {
            return {
                success: false,
                error: '正在进行星体投射，请先结束投射'
            };
        }

        const duration = params.duration || YUAN_INFANT_REQUIREMENTS.separationDuration;
        const now = Date.now();

        // 计算分离成功率 (基于精神力和同步率)
        const spiritualPower = this.yuanInfantState.spiritualPower || 100;
        const baseSuccessRate = 0.7 + (spiritualPower / 1000);
        const syncRate = (this.yuanInfantState.syncRate || 100) / 100;
        const successRate = Math.min(0.95, baseSuccessRate * syncRate);

        // 随机决定是否成功
        const roll = Math.random();
        const success = roll < successRate;

        if (!success) {
            // 失败，元婴暂时无法分离
            this.recordHistory('separate_failed', {
                successRate: (successRate * 100).toFixed(1) + '%',
                roll: (roll * 100).toFixed(1) + '%'
            });

            return {
                success: true,
                result: 'failed',
                message: '灵魂分离失败！精神力不足以支撑分离',
                successRate: (successRate * 100).toFixed(1) + '%',
                tip: '提升精神力或同步率后可再次尝试'
            };
        }

        // 分离成功
        this.yuanInfantState.state = YUAN_INFANT_STATES.SEPARATED;
        this.yuanInfantState.separationTime = now;
        this.yuanInfantState.separationEndTime = now + duration;

        // 本体进入休眠状态
        this.gameState.playerStatus = this.gameState.playerStatus || {};
        this.gameState.playerStatus.dormant = true;
        this.gameState.playerStatus.dormantUntil = now + duration;

        this.recordHistory('separate', {
            duration,
            spiritualPower,
            syncRate: this.yuanInfantState.syncRate
        });

        return {
            success: true,
            result: 'success',
            message: '灵魂分离成功！元婴已出窍',
            separation: {
                startTime: now,
                endTime: now + duration,
                duration,
                spiritualPower,
                syncRate: this.yuanInfantState.syncRate
            },
            warning: '本体进入休眠状态，请及时召回元婴'
        };
    }

    /**
     * 星体投射 (yuaninfant.project)
     * @param {Object} params - { target?: string, range?: number }
     * @returns {Object} 投射结果
     */
    projectAstral(params = {}) {
        // 检查元婴是否已形成
        if (this.yuanInfantState.state === YUAN_INFANT_STATES.NONE) {
            return {
                success: false,
                error: '元婴尚未形成，无法进行星体投射'
            };
        }

        // 检查是否正在投射
        if (this.yuanInfantState.state === YUAN_INFANT_STATES.PROJECTING) {
            return {
                success: false,
                error: '星体投射已在进行中'
            };
        }

        // 检查是否正在分离 (分离状态才能投射)
        if (this.yuanInfantState.state !== YUAN_INFANT_STATES.SEPARATED) {
            return {
                success: false,
                error: '需要先进行灵魂分离才能进行星体投射'
            };
        }

        // 检查灵力是否足够
        const cost = YUAN_INFANT_REQUIREMENTS.projectionCost;
        if ((this.gameState.spiritEnergy || 0) < cost) {
            return {
                success: false,
                error: '灵力不足，无法进行星体投射'
            };
        }

        const target = params.target || 'unknown';
        const range = params.range || YUAN_INFANT_REQUIREMENTS.projectionRange;
        const spiritualPower = this.yuanInfantState.spiritualPower || 100;

        // 计算投射范围 (精神力越高，范围越大)
        const actualRange = Math.floor(range * (spiritualPower / 100));

        // 消耗灵力
        this.gameState.spiritEnergy = Math.max(0, (this.gameState.spiritEnergy || 0) - cost);

        // 记录投射信息
        const projectionInfo = {
            target,
            range: actualRange,
            spiritualPower,
            timestamp: Date.now()
        };
        this.yuanInfantState.projectionTarget = target;
        this.yuanInfantState.projectionInfo.push(projectionInfo);

        // 保持投射信息不超过20条
        if (this.yuanInfantState.projectionInfo.length > 20) {
            this.yuanInfantState.projectionInfo = this.yuanInfantState.projectionInfo.slice(-20);
        }

        this.recordHistory('project', projectionInfo);

        // 获取感知信息类型
        const infoTypes = this.getProjectionInfoTypes(actualRange);

        return {
            success: true,
            message: `星体投射成功！感知范围${actualRange}里`,
            projection: {
                target,
                range: actualRange,
                spiritualPower,
                infoTypes,
                timestamp: projectionInfo.timestamp
            },
            infoTypes
        };
    }

    /**
     * 根据投射范围获取可感知的信息类型
     */
    getProjectionInfoTypes(range) {
        const types = [];
        if (range >= 100) types.push({ type: 'basic', desc: '基础环境感知' });
        if (range >= 300) types.push({ type: 'spiritual', desc: '灵力波动感知' });
        if (range >= 500) types.push({ type: 'creatures', desc: '生物气息感知' });
        if (range >= 800) types.push({ type: 'treasures', desc: '灵宝药材感知' });
        if (range >= 1000) types.push({ type: 'secrets', desc: '隐藏信息感知' });
        return types;
    }

    /**
     * 同步元婴 (yuaninfant.sync)
     * @param {Object} params - { force?: boolean }
     * @returns {Object} 同步结果
     */
    syncYuanInfant(params = {}) {
        // 检查元婴是否已形成
        if (this.yuanInfantState.state === YUAN_INFANT_STATES.NONE) {
            return {
                success: false,
                error: '元婴尚未形成，无法进行同步'
            };
        }

        const force = params.force || false;
        const currentSyncRate = this.yuanInfantState.syncRate || 100;
        const spiritualPower = this.yuanInfantState.spiritualPower || 100;

        // 计算同步率提升 (基于精神力)
        const baseGain = 5 + Math.floor(spiritualPower / 50);
        const newSyncRate = force ? 100 : Math.min(100, currentSyncRate + baseGain);

        const oldSyncRate = this.yuanInfantState.syncRate;
        this.yuanInfantState.syncRate = newSyncRate;
        this.yuanInfantState.lastSyncTime = Date.now();

        this.recordHistory('sync', {
            oldSyncRate,
            newSyncRate,
            force,
            spiritualPower
        });

        return {
            success: true,
            message: force ? '强制同步完成，元婴与本体完全同步' : '同步完成，同步率提升',
            sync: {
                oldSyncRate,
                newSyncRate,
                gain: newSyncRate - oldSyncRate,
                force,
                spiritualPower
            }
        };
    }

    /**
     * 召回元婴 (yuaninfant.recall)
     * @param {Object} params - { emergency?: boolean }
     * @returns {Object} 召回结果
     */
    recallYuanInfant(params = {}) {
        // 检查元婴是否已形成
        if (this.yuanInfantState.state === YUAN_INFANT_STATES.NONE) {
            return {
                success: false,
                error: '元婴尚未形成，无法召回'
            };
        }

        // 检查是否已回归本体
        if (this.yuanInfantState.state === YUAN_INFANT_STATES.FORMED) {
            return {
                success: false,
                error: '元婴已在本体中，无需召回'
            };
        }

        const emergency = params.emergency || false;
        const previousState = this.yuanInfantState.state;

        // 计算召回消耗
        const syncRate = this.yuanInfantState.syncRate || 100;
        const spiritualPower = this.yuanInfantState.spiritualPower || 100;
        const recallCost = emergency ? Math.floor(spiritualPower * 0.3) : Math.floor(spiritualPower * 0.1);

        // 检查灵力是否足够 (紧急召回消耗更多)
        if ((this.gameState.spiritEnergy || 0) < recallCost) {
            return {
                success: false,
                error: '灵力不足，无法召回元婴',
                required: recallCost,
                current: this.gameState.spiritEnergy || 0
            };
        }

        // 消耗灵力
        this.gameState.spiritEnergy = Math.max(0, (this.gameState.spiritEnergy || 0) - recallCost);

        // 恢复本体状态
        if (this.gameState.playerStatus) {
            this.gameState.playerStatus.dormant = false;
            this.gameState.playerStatus.dormantUntil = null;
        }

        // 更新元婴状态
        this.yuanInfantState.state = YUAN_INFANT_STATES.FORMED;
        this.yuanInfantState.separationTime = null;
        this.yuanInfantState.separationEndTime = null;
        this.yuanInfantState.projectionTarget = null;

        // 紧急召回会有惩罚
        if (emergency) {
            const penalty = Math.floor(syncRate * 0.1);
            this.yuanInfantState.syncRate = Math.max(50, this.yuanInfantState.syncRate - penalty);
        }

        this.recordHistory('recall', {
            previousState,
            emergency,
            cost: recallCost,
            syncRateAfter: this.yuanInfantState.syncRate
        });

        return {
            success: true,
            message: emergency ? '紧急召回完成！元婴已返回本体' : '元婴召回成功，已返回本体',
            recall: {
                previousState,
                emergency,
                cost: recallCost,
                syncRate: this.yuanInfantState.syncRate,
                penalty: emergency ? '同步率下降' : '无'
            }
        };
    }

    /**
     * 查询元婴状态 (yuaninfant.status)
     * @param {Object} params - { detailed?: boolean }
     * @returns {Object} 状态信息
     */
    getYuanInfantStatus(params = {}) {
        const detailed = params.detailed || false;
        const state = this.yuanInfantState;

        const result = {
            success: true,
            state: state.state,
            stateName: this.getStateName(state.state),
            spiritualPower: state.spiritualPower || 0,
            perceptionRange: state.perceptionRange || 0,
            syncRate: state.syncRate || 100,
            isSeparated: state.state === YUAN_INFANT_STATES.SEPARATED,
            isProjecting: state.state === YUAN_INFANT_STATES.PROJECTING,
            isFormed: state.state !== YUAN_INFANT_STATES.NONE
        };

        if (detailed) {
            result.detailed = {
                formationTime: state.formationTime,
                separationTime: state.separationTime,
                separationEndTime: state.separationEndTime,
                lastSyncTime: state.lastSyncTime,
                projectionTarget: state.projectionTarget,
                projectionInfoCount: (state.projectionInfo || []).length,
                historyCount: (state.history || []).length,
                history: state.history?.slice(-10) || []
            };
        }

        // 如果正在分离，添加剩余时间
        if (state.state === YUAN_INFANT_STATES.SEPARATED && state.separationEndTime) {
            const remaining = Math.max(0, state.separationEndTime - Date.now());
            result.separationRemaining = remaining;
            result.separationRemainingStr = this.formatDuration(remaining);
        }

        // 如果本体处于休眠状态
        if (this.gameState.playerStatus?.dormant) {
            result.bodyStatus = 'dormant';
            result.bodyDormantUntil = this.gameState.playerStatus.dormantUntil;
        } else {
            result.bodyStatus = 'normal';
        }

        return result;
    }

    /**
     * 获取状态名称
     */
    getStateName(state) {
        const names = {
            [YUAN_INFANT_STATES.NONE]: '未形成',
            [YUAN_INFANT_STATES.FORMING]: '凝聚中',
            [YUAN_INFANT_STATES.FORMED]: '已形成',
            [YUAN_INFANT_STATES.SEPARATED]: '已分离',
            [YUAN_INFANT_STATES.PROJECTING]: '投射中',
            [YUAN_INFANT_STATES.SYNCHRONIZING]: '同步中'
        };
        return names[state] || '未知';
    }

    /**
     * 格式化时长
     */
    formatDuration(ms) {
        if (ms <= 0) return '已结束';
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours}小时${minutes % 60}分钟`;
        }
        if (minutes > 0) {
            return `${minutes}分钟${seconds % 60}秒`;
        }
        return `${seconds}秒`;
    }

    /**
     * 获取MCP工具处理器
     * @param {Object} gameState - 游戏状态
     * @returns {Object} MCP工具处理器映射
     */
    static getMCPHandlers(gameState) {
        const service = new YuanInfantService(gameState);
        service.init(gameState);

        return {
            'yuaninfant.form': (params) => service.formYuanInfant(params),
            'yuaninfant.separate': (params) => service.separateSoul(params),
            'yuaninfant.project': (params) => service.projectAstral(params),
            'yuaninfant.sync': (params) => service.syncYuanInfant(params),
            'yuaninfant.recall': (params) => service.recallYuanInfant(params),
            'yuaninfant.status': (params) => service.getYuanInfantStatus(params)
        };
    }
}

// ===== MCP工具定义 =====

/**
 * 元婴出窍系统MCP工具定义
 */
export const YUAN_INFANT_TOOLS = {
    'yuaninfant.form': {
        name: 'yuaninfant.form',
        description: '凝聚元婴 - 将灵魂凝聚成元婴形态 (需要达到化神境)',
        inputSchema: {
            type: 'object',
            properties: {},
            description: '无参数'
        }
    },
    'yuaninfant.separate': {
        name: 'yuaninfant.separate',
        description: '灵魂分离 - 将元婴从本体中分离出去进行探索',
        inputSchema: {
            type: 'object',
            properties: {
                duration: {
                    type: 'number',
                    description: '分离持续时间(毫秒)，默认1小时'
                }
            }
        }
    },
    'yuaninfant.project': {
        name: 'yuaninfant.project',
        description: '星体投射 - 元婴出窍后进行远程感知投射',
        inputSchema: {
            type: 'object',
            properties: {
                target: {
                    type: 'string',
                    description: '投射目标区域描述'
                },
                range: {
                    type: 'number',
                    description: '投射范围(里)，默认1000'
                }
            }
        }
    },
    'yuaninfant.sync': {
        name: 'yuaninfant.sync',
        description: '同步元婴 - 提升元婴与本体的同步率',
        inputSchema: {
            type: 'object',
            properties: {
                force: {
                    type: 'boolean',
                    description: '强制同步到100%'
                }
            }
        }
    },
    'yuaninfant.recall': {
        name: 'yuaninfant.recall',
        description: '召回元婴 - 将分离的元婴召回本体',
        inputSchema: {
            type: 'object',
            properties: {
                emergency: {
                    type: 'boolean',
                    description: '紧急召回(消耗更多灵力但更快)'
                }
            }
        }
    },
    'yuaninfant.status': {
        name: 'yuaninfant.status',
        description: '查询元婴状态 - 获取元婴当前状态详情',
        inputSchema: {
            type: 'object',
            properties: {
                detailed: {
                    type: 'boolean',
                    description: '返回详细信息'
                }
            }
        }
    }
};

/**
 * 创建元婴服务实例
 * @param {Object} gameState - 游戏状态
 * @returns {YuanInfantService}
 */
function createYuanInfantService(gameState) {
    return new YuanInfantService(gameState);
}

/**
 * 获取元婴服务单例
 */
let _yuanInfantServiceInstance = null;

function getYuanInfantService(gameState) {
    if (!_yuanInfantServiceInstance) {
        _yuanInfantServiceInstance = new YuanInfantService(gameState);
    } else {
        _yuanInfantServiceInstance.gameState = gameState;
    }
    return _yuanInfantServiceInstance;
}

export { YuanInfantService, createYuanInfantService, getYuanInfantService };
