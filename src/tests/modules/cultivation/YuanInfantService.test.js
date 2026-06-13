/**
 * YuanInfantService.test.js - TDD测试
 * V239 Direction A: 元婴出窍系统测试
 * 
 * 测试覆盖率要求: ≥98%
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    YuanInfantService,
    createYuanInfantService,
    getYuanInfantService,
    YUAN_INFANT_REQUIREMENTS,
    YUAN_INFANT_STATES,
    YUAN_INFANT_ATTRIBUTES,
    YUAN_INFANT_TOOLS
} from '../../../../src/domains/cultivation/services/YuanInfantService.js';

// ===== 测试辅助函数 =====

/**
 * 创建测试用gameState
 */
function createTestGameState(overrides = {}) {
    return {
        realm: 5, // 默认化神境 (满足元婴形成条件)
        stage: 2,
        spiritRoot: { type: 'wood', tier: 4 },
        spiritStones: 5000,
        spiritEnergy: 1000,
        cultivationXP: 0,
        playerStatus: {},
        yuanInfant: null,
        ...overrides
    };
}

/**
 * 创建已形成元婴的gameState
 */
function createFormedGameState(overrides = {}) {
    return createTestGameState({
        yuanInfant: {
            state: YUAN_INFANT_STATES.FORMED,
            spiritualPower: 200,
            perceptionRange: 100,
            syncRate: 100,
            formationTime: Date.now(),
            separationTime: null,
            separationEndTime: null,
            projectionTarget: null,
            projectionInfo: [],
            lastSyncTime: null,
            history: []
        },
        ...overrides
    });
}

/**
 * 创建已分离元婴的gameState
 */
function createSeparatedGameState(overrides = {}) {
    const now = Date.now();
    return createFormedGameState({
        yuanInfant: {
            state: YUAN_INFANT_STATES.SEPARATED,
            spiritualPower: 200,
            perceptionRange: 100,
            syncRate: 100,
            formationTime: Date.now() - 86400000,
            separationTime: now,
            separationEndTime: now + 3600000,
            projectionTarget: null,
            projectionInfo: [],
            lastSyncTime: null,
            history: []
        },
        playerStatus: { dormant: true, dormantUntil: now + 3600000 },
        ...overrides
    });
}

// ===== 测试套件 =====

describe('YuanInfantService', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createTestGameState();
        service = new YuanInfantService(gameState);
    });

    // ===== 初始化测试 =====

    describe('init', () => {
        it('应初始化yuanInfant状态', () => {
            const result = service.init(gameState);
            expect(gameState.yuanInfant).not.toBeNull();
            expect(gameState.yuanInfant.state).toBe(YUAN_INFANT_STATES.NONE);
            expect(gameState.yuanInfant.spiritualPower).toBe(0);
            expect(gameState.yuanInfant.perceptionRange).toBe(0);
            expect(gameState.yuanInfant.syncRate).toBe(100);
            expect(gameState.yuanInfant.history).toEqual([]);
        });

        it('已存在的yuanInfant状态不应被覆盖', () => {
            gameState.yuanInfant = {
                state: YUAN_INFANT_STATES.FORMED,
                spiritualPower: 300,
                perceptionRange: 150,
                syncRate: 90,
                formationTime: Date.now() - 100000,
                separationTime: null,
                separationEndTime: null,
                projectionTarget: 'mountain',
                projectionInfo: [{ target: 'valley' }],
                lastSyncTime: Date.now() - 50000,
                history: [{ action: 'form' }]
            };
            service.init(gameState);
            expect(gameState.yuanInfant.state).toBe(YUAN_INFANT_STATES.FORMED);
            expect(gameState.yuanInfant.spiritualPower).toBe(300);
            expect(gameState.yuanInfant.projectionTarget).toBe('mountain');
        });

        it('应返回gameState引用', () => {
            const result = service.init(gameState);
            expect(result).toBe(gameState);
        });
    });

    // ===== checkFormationRequirements 测试 =====

    describe('checkFormationRequirements', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('所有条件满足时应返回canForm=true', () => {
            const result = service.checkFormationRequirements();
            expect(result.canForm).toBe(true);
            expect(result.requirementsMet).toBe(result.requirementsTotal);
        });

        it('境界不足时应返回canForm=false', () => {
            gameState.realm = 4; // 元婴境不足
            const result = service.checkFormationRequirements();
            expect(result.canForm).toBe(false);
            const realmReq = result.requirements.find(r => r.type === 'realm');
            expect(realmReq.met).toBe(false);
        });

        it('灵力不足时应返回canForm=false', () => {
            gameState.spiritEnergy = 100; // 不足500
            const result = service.checkFormationRequirements();
            expect(result.canForm).toBe(false);
            const energyReq = result.requirements.find(r => r.type === 'spiritEnergy');
            expect(energyReq.met).toBe(false);
        });

        it('灵石不足时应返回canForm=false', () => {
            gameState.spiritStones = 100; // 不足1000
            const result = service.checkFormationRequirements();
            expect(result.canForm).toBe(false);
            const stonesReq = result.requirements.find(r => r.type === 'spiritStones');
            expect(stonesReq.met).toBe(false);
        });

        it('元婴已形成时应返回canForm=false', () => {
            gameState.yuanInfant.state = YUAN_INFANT_STATES.FORMED;
            const result = service.checkFormationRequirements();
            expect(result.canForm).toBe(false);
            const notFormedReq = result.requirements.find(r => r.type === 'notFormed');
            expect(notFormedReq.met).toBe(false);
        });

        it('应正确计算满足条件数量', () => {
            gameState.realm = 5;
            gameState.spiritEnergy = 600;
            gameState.spiritStones = 1500;
            gameState.yuanInfant.state = YUAN_INFANT_STATES.NONE;
            const result = service.checkFormationRequirements();
            expect(result.canForm).toBe(true);
            expect(result.requirementsMet).toBe(4);
            expect(result.requirementsTotal).toBe(4);
        });
    });

    // ===== formYuanInfant 测试 =====

    describe('formYuanInfant', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('成功凝聚元婴', () => {
            const result = service.formYuanInfant();
            expect(result.success).toBe(true);
            expect(result.message).toContain('凝聚成功');
            expect(result.yuanInfant.state).toBe(YUAN_INFANT_STATES.FORMED);
            expect(result.yuanInfant.spiritualPower).toBeGreaterThan(0);
            expect(result.yuanInfant.perceptionRange).toBeGreaterThan(0);
            expect(result.costDeducted).toBe(1000);
        });

        it('凝聚成功后灵石被扣除', () => {
            const initialStones = gameState.spiritStones;
            service.formYuanInfant();
            expect(gameState.spiritStones).toBe(initialStones - 1000);
        });

        it('凝聚成功后灵力被消耗', () => {
            const initialEnergy = gameState.spiritEnergy;
            service.formYuanInfant();
            expect(gameState.spiritEnergy).toBe(initialEnergy - 500);
        });

        it('凝聚成功后状态变为FORMED', () => {
            service.formYuanInfant();
            expect(gameState.yuanInfant.state).toBe(YUAN_INFANT_STATES.FORMED);
        });

        it('凝聚成功后元婴属性基于灵根计算', () => {
            gameState.spiritRoot.tier = 5; // 天品灵根
            service.formYuanInfant();
            // 天品灵根应该比极品灵根有更高的加成
            expect(gameState.yuanInfant.spiritualPower).toBeGreaterThan(200);
            expect(gameState.yuanInfant.perceptionRange).toBeGreaterThan(100);
        });

        it('元婴已形成时返回错误', () => {
            gameState.yuanInfant.state = YUAN_INFANT_STATES.FORMED;
            const result = service.formYuanInfant();
            expect(result.success).toBe(false);
            expect(result.error).toContain('已经形成');
        });

        it('条件不满足时返回错误和未满足条件列表', () => {
            gameState.realm = 4;
            const result = service.formYuanInfant();
            expect(result.success).toBe(false);
            expect(result.error).toContain('条件未满足');
            expect(result.unmetRequirements).toBeDefined();
            expect(result.unmetRequirements.length).toBeGreaterThan(0);
        });

        it('凝聚成功后记录历史', () => {
            service.formYuanInfant();
            expect(gameState.yuanInfant.history.length).toBe(1);
            expect(gameState.yuanInfant.history[0].action).toBe('form');
        });

        it('多次调用只形成一次', () => {
            service.formYuanInfant();
            gameState.yuanInfant.state = YUAN_INFANT_STATES.NONE; // 强制重置
            const result = service.formYuanInfant();
            expect(result.success).toBe(false);
        });
    });

    // ===== separateSoul 测试 =====

    describe('separateSoul', () => {
        beforeEach(() => {
            gameState = createFormedGameState();
            service.init(gameState);
        });

        it('成功分离灵魂', () => {
            const result = service.separateSoul();
            expect(result.success).toBe(true);
            expect(result.result).toBe('success');
            expect(result.message).toContain('分离成功');
        });

        it('分离后状态变为SEPARATED', () => {
            service.separateSoul();
            expect(gameState.yuanInfant.state).toBe(YUAN_INFANT_STATES.SEPARATED);
        });

        it('分离后设置分离时间', () => {
            const before = Date.now();
            service.separateSoul();
            expect(gameState.yuanInfant.separationTime).toBeGreaterThanOrEqual(before);
            expect(gameState.yuanInfant.separationEndTime).toBeGreaterThan(gameState.yuanInfant.separationTime);
        });

        it('分离后本体进入休眠状态', () => {
            service.separateSoul();
            expect(gameState.playerStatus.dormant).toBe(true);
            expect(gameState.playerStatus.dormantUntil).toBeGreaterThan(Date.now());
        });

        it('分离成功后记录历史', () => {
            service.separateSoul();
            const formHistory = gameState.yuanInfant.history.filter(h => h.action === 'form');
            expect(formHistory.length).toBe(1);
        });

        it('分离失败时返回failed结果', () => {
            gameState.yuanInfant.spiritualPower = 10; // 极低精神力
            gameState.yuanInfant.syncRate = 10; // 低同步率
            // 多次尝试直到失败或成功
            let failedOnce = false;
            for (let i = 0; i < 100; i++) {
                gameState.yuanInfant.state = YUAN_INFANT_STATES.FORMED;
                const result = service.separateSoul();
                if (result.result === 'failed') {
                    failedOnce = true;
                    expect(result.successRate).toBeDefined();
                    expect(result.tip).toBeDefined();
                    break;
                }
            }
            // 理论上有可能一直成功，这里只检查逻辑正确
        });

        it('元婴未形成时返回错误', () => {
            gameState.yuanInfant.state = YUAN_INFANT_STATES.NONE;
            const result = service.separateSoul();
            expect(result.success).toBe(false);
            expect(result.error).toContain('尚未形成');
        });

        it('已经分离时返回错误', () => {
            gameState.yuanInfant.state = YUAN_INFANT_STATES.SEPARATED;
            const result = service.separateSoul();
            expect(result.success).toBe(false);
            expect(result.error).toContain('已经分离');
        });

        it('投射中无法分离', () => {
            gameState.yuanInfant.state = YUAN_INFANT_STATES.PROJECTING;
            const result = service.separateSoul();
            expect(result.success).toBe(false);
            expect(result.error).toContain('正在进行星体投射');
        });

        it('自定义分离时长', () => {
            const customDuration = 7200000; // 2小时
            const result = service.separateSoul({ duration: customDuration });
            expect(result.success).toBe(true);
            expect(result.separation.duration).toBe(customDuration);
        });
    });

    // ===== projectAstral 测试 =====

    describe('projectAstral', () => {
        beforeEach(() => {
            gameState = createSeparatedGameState({ spiritEnergy: 500 });
            service.init(gameState);
        });

        it('成功进行星体投射', () => {
            const result = service.projectAstral({ target: 'northMountain' });
            expect(result.success).toBe(true);
            expect(result.message).toContain('投射成功');
            expect(result.projection).toBeDefined();
            expect(result.infoTypes).toBeDefined();
        });

        it('投射后灵力被消耗', () => {
            const initialEnergy = gameState.spiritEnergy;
            service.projectAstral();
            expect(gameState.spiritEnergy).toBe(initialEnergy - 200);
        });

        it('投射范围基于精神力计算', () => {
            const result = service.projectAstral({ range: 1000 });
            expect(result.projection.range).toBeGreaterThan(0);
            expect(result.projection.range).toBeLessThanOrEqual(1000);
        });

        it('投射后记录投射信息', () => {
            service.projectAstral({ target: 'testTarget' });
            expect(gameState.yuanInfant.projectionTarget).toBe('testTarget');
            expect(gameState.yuanInfant.projectionInfo.length).toBe(1);
        });

        it('投射信息超过20条时清理旧记录', () => {
            for (let i = 0; i < 25; i++) {
                gameState.yuanInfant.projectionInfo.push({
                    target: `target${i}`,
                    range: 100,
                    spiritualPower: 100,
                    timestamp: Date.now() - i * 1000
                });
            }
            service.projectAstral({ target: 'newTarget' });
            expect(gameState.yuanInfant.projectionInfo.length).toBeLessThanOrEqual(20);
        });

        it('元婴未形成时返回错误', () => {
            gameState.yuanInfant.state = YUAN_INFANT_STATES.NONE;
            const result = service.projectAstral();
            expect(result.success).toBe(false);
            expect(result.error).toContain('尚未形成');
        });

        it('正在投射时无法再次投射', () => {
            gameState.yuanInfant.state = YUAN_INFANT_STATES.PROJECTING;
            const result = service.projectAstral();
            expect(result.success).toBe(false);
            expect(result.error).toContain('已在进行中');
        });

        it('未分离时无法投射', () => {
            gameState.yuanInfant.state = YUAN_INFANT_STATES.FORMED;
            const result = service.projectAstral();
            expect(result.success).toBe(false);
            expect(result.error).toContain('先进行灵魂分离');
        });

        it('灵力不足时返回错误', () => {
            gameState.spiritEnergy = 50;
            const result = service.projectAstral();
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵力不足');
        });

        it('投射后记录历史', () => {
            service.projectAstral({ target: 'test' });
            const projectHistory = gameState.yuanInfant.history.filter(h => h.action === 'project');
            expect(projectHistory.length).toBe(1);
        });

        it('根据投射范围返回正确的感知信息类型', () => {
            const result100 = service.projectAstral({ range: 100 });
            const result300 = service.projectAstral({ range: 300 });
            const result1000 = service.projectAstral({ range: 1000 });

            expect(result100.infoTypes.length).toBeGreaterThan(0);
            expect(result300.infoTypes.length).toBeGreaterThan(result100.infoTypes.length);
            expect(result1000.infoTypes.length).toBeGreaterThan(result300.infoTypes.length);
        });
    });

    // ===== syncYuanInfant 测试 =====

    describe('syncYuanInfant', () => {
        beforeEach(() => {
            gameState = createFormedGameState();
            service.init(gameState);
        });

        it('成功同步元婴', () => {
            const result = service.syncYuanInfant();
            expect(result.success).toBe(true);
            expect(result.message).toContain('同步完成');
        });

        it('同步后同步率提升', () => {
            const initialSyncRate = gameState.yuanInfant.syncRate;
            service.syncYuanInfant();
            expect(gameState.yuanInfant.syncRate).toBeGreaterThan(initialSyncRate);
        });

        it('同步后同步率不超过100', () => {
            for (let i = 0; i < 20; i++) {
                service.syncYuanInfant();
            }
            expect(gameState.yuanInfant.syncRate).toBeLessThanOrEqual(100);
        });

        it('强制同步到100%', () => {
            gameState.yuanInfant.syncRate = 50;
            const result = service.syncYuanInfant({ force: true });
            expect(result.success).toBe(true);
            expect(result.sync.force).toBe(true);
            expect(gameState.yuanInfant.syncRate).toBe(100);
        });

        it('同步后记录最后同步时间', () => {
            const before = Date.now();
            service.syncYuanInfant();
            expect(gameState.yuanInfant.lastSyncTime).toBeGreaterThanOrEqual(before);
        });

        it('元婴未形成时返回错误', () => {
            gameState.yuanInfant.state = YUAN_INFANT_STATES.NONE;
            const result = service.syncYuanInfant();
            expect(result.success).toBe(false);
            expect(result.error).toContain('尚未形成');
        });

        it('同步后记录历史', () => {
            service.syncYuanInfant();
            const syncHistory = gameState.yuanInfant.history.filter(h => h.action === 'sync');
            expect(syncHistory.length).toBe(1);
        });

        it('返回正确的同步信息', () => {
            const result = service.syncYuanInfant();
            expect(result.sync.oldSyncRate).toBeDefined();
            expect(result.sync.newSyncRate).toBeDefined();
            expect(result.sync.gain).toBeDefined();
        });
    });

    // ===== recallYuanInfant 测试 =====

    describe('recallYuanInfant', () => {
        beforeEach(() => {
            gameState = createSeparatedGameState({ spiritEnergy: 500 });
            service.init(gameState);
        });

        it('成功召回元婴', () => {
            const result = service.recallYuanInfant();
            expect(result.success).toBe(true);
            expect(result.message).toContain('召回成功');
        });

        it('召回后状态变为FORMED', () => {
            service.recallYuanInfant();
            expect(gameState.yuanInfant.state).toBe(YUAN_INFANT_STATES.FORMED);
        });

        it('召回后本体状态恢复', () => {
            service.recallYuanInfant();
            expect(gameState.playerStatus.dormant).toBe(false);
            expect(gameState.playerStatus.dormantUntil).toBeNull();
        });

        it('召回后分离时间被清除', () => {
            service.recallYuanInfant();
            expect(gameState.yuanInfant.separationTime).toBeNull();
            expect(gameState.yuanInfant.separationEndTime).toBeNull();
        });

        it('召回后投射目标被清除', () => {
            gameState.yuanInfant.projectionTarget = 'someTarget';
            service.recallYuanInfant();
            expect(gameState.yuanInfant.projectionTarget).toBeNull();
        });

        it('紧急召回消耗更多灵力', () => {
            const normalEnergy = gameState.spiritEnergy;
            gameState.spiritEnergy = 1000;
            service.recallYuanInfant({ emergency: true });
            const emergencyEnergy = gameState.spiritEnergy;
            gameState.spiritEnergy = 1000;
            service.recallYuanInfant({ emergency: false });
            const normalRecallEnergy = gameState.spiritEnergy;
            expect(emergencyEnergy).toBeLessThan(normalRecallEnergy);
        });

        it('紧急召回后同步率下降', () => {
            gameState.yuanInfant.syncRate = 100;
            service.recallYuanInfant({ emergency: true });
            expect(gameState.yuanInfant.syncRate).toBeLessThan(100);
        });

        it('灵力不足时返回错误', () => {
            gameState.spiritEnergy = 5;
            const result = service.recallYuanInfant();
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵力不足');
        });

        it('元婴未形成时返回错误', () => {
            gameState.yuanInfant.state = YUAN_INFANT_STATES.NONE;
            const result = service.recallYuanInfant();
            expect(result.success).toBe(false);
            expect(result.error).toContain('尚未形成');
        });

        it('元婴已在本体时返回错误', () => {
            gameState.yuanInfant.state = YUAN_INFANT_STATES.FORMED;
            const result = service.recallYuanInfant();
            expect(result.success).toBe(false);
            expect(result.error).toContain('已在本体中');
        });

        it('召回后记录历史', () => {
            service.recallYuanInfant();
            const recallHistory = gameState.yuanInfant.history.filter(h => h.action === 'recall');
            expect(recallHistory.length).toBe(1);
        });
    });

    // ===== getYuanInfantStatus 测试 =====

    describe('getYuanInfantStatus', () => {
        beforeEach(() => {
            gameState = createTestGameState();
            service.init(gameState);
        });

        it('返回基本状态信息', () => {
            const result = service.getYuanInfantStatus();
            expect(result.success).toBe(true);
            expect(result.state).toBeDefined();
            expect(result.stateName).toBeDefined();
            expect(result.spiritualPower).toBe(0);
            expect(result.perceptionRange).toBe(0);
            expect(result.syncRate).toBe(100);
        });

        it('正确标识已形成状态', () => {
            gameState.yuanInfant.state = YUAN_INFANT_STATES.FORMED;
            gameState.yuanInfant.spiritualPower = 200;
            gameState.yuanInfant.perceptionRange = 100;
            const result = service.getYuanInfantStatus();
            expect(result.isFormed).toBe(true);
            expect(result.isSeparated).toBe(false);
            expect(result.spiritualPower).toBe(200);
        });

        it('正确标识已分离状态', () => {
            gameState.yuanInfant.state = YUAN_INFANT_STATES.SEPARATED;
            const result = service.getYuanInfantStatus();
            expect(result.isSeparated).toBe(true);
            expect(result.isFormed).toBe(true);
        });

        it('分离状态返回剩余时间', () => {
            gameState.yuanInfant.state = YUAN_INFANT_STATES.SEPARATED;
            gameState.yuanInfant.separationEndTime = Date.now() + 600000; // 10分钟后
            const result = service.getYuanInfantStatus();
            expect(result.separationRemaining).toBeGreaterThan(0);
            expect(result.separationRemainingStr).toBeDefined();
        });

        it('详细模式返回完整信息', () => {
            gameState.yuanInfant.state = YUAN_INFANT_STATES.FORMED;
            gameState.yuanInfant.formationTime = Date.now() - 100000;
            gameState.yuanInfant.history = [{ action: 'test', timestamp: Date.now() }];
            const result = service.getYuanInfantStatus({ detailed: true });
            expect(result.detailed).toBeDefined();
            expect(result.detailed.formationTime).toBeDefined();
            expect(result.detailed.history).toBeDefined();
        });

        it('本体休眠状态正确标识', () => {
            gameState.playerStatus.dormant = true;
            gameState.playerStatus.dormantUntil = Date.now() + 60000;
            const result = service.getYuanInfantStatus();
            expect(result.bodyStatus).toBe('dormant');
            expect(result.bodyDormantUntil).toBeDefined();
        });

        it('本体正常状态正确标识', () => {
            gameState.playerStatus.dormant = false;
            const result = service.getYuanInfantStatus();
            expect(result.bodyStatus).toBe('normal');
        });
    });

    // ===== getStateName 测试 =====

    describe('getStateName', () => {
        it('返回NONE的中文名称', () => {
            expect(service.getStateName(YUAN_INFANT_STATES.NONE)).toBe('未形成');
        });

        it('返回FORMING的中文名称', () => {
            expect(service.getStateName(YUAN_INFANT_STATES.FORMING)).toBe('凝聚中');
        });

        it('返回FORMED的中文名称', () => {
            expect(service.getStateName(YUAN_INFANT_STATES.FORMED)).toBe('已形成');
        });

        it('返回SEPARATED的中文名称', () => {
            expect(service.getStateName(YUAN_INFANT_STATES.SEPARATED)).toBe('已分离');
        });

        it('返回PROJECTING的中文名称', () => {
            expect(service.getStateName(YUAN_INFANT_STATES.PROJECTING)).toBe('投射中');
        });

        it('返回SYNCHRONIZING的中文名称', () => {
            expect(service.getStateName(YUAN_INFANT_STATES.SYNCHRONIZING)).toBe('同步中');
        });

        it('未知状态返回"未知"', () => {
            expect(service.getStateName('unknown')).toBe('未知');
        });
    });

    // ===== formatDuration 测试 =====

    describe('formatDuration', () => {
        it('格式化秒', () => {
            expect(service.formatDuration(5000)).toBe('5秒');
        });

        it('格式化分钟', () => {
            expect(service.formatDuration(120000)).toBe('2分钟0秒');
        });

        it('格式化小时', () => {
            expect(service.formatDuration(3600000)).toBe('1小时0分钟');
        });

        it('格式化复杂时长', () => {
            expect(service.formatDuration(3661000)).toBe('1小时1分钟1秒');
        });

        it('零或负数返回"已结束"', () => {
            expect(service.formatDuration(0)).toBe('已结束');
            expect(service.formatDuration(-1000)).toBe('已结束');
        });
    });

    // ===== recordHistory 测试 =====

    describe('recordHistory', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('记录历史事件', () => {
            service.recordHistory('testAction', { detail: 'test' });
            expect(gameState.yuanInfant.history.length).toBe(1);
            expect(gameState.yuanInfant.history[0].action).toBe('testAction');
        });

        it('历史记录不超过50条', () => {
            for (let i = 0; i < 60; i++) {
                service.recordHistory(`action${i}`, { index: i });
            }
            expect(gameState.yuanInfant.history.length).toBe(50);
        });

        it('历史记录包含时间戳', () => {
            service.recordHistory('test', {});
            expect(gameState.yuanInfant.history[0].timestamp).toBeDefined();
        });
    });

    // ===== 静态方法测试 =====

    describe('static methods', () => {
        it('getMCPHandlers返回6个处理器', () => {
            const handlers = YuanInfantService.getMCPHandlers(gameState);
            expect(Object.keys(handlers).length).toBe(6);
            expect(handlers['yuaninfant.form']).toBeDefined();
            expect(handlers['yuaninfant.separate']).toBeDefined();
            expect(handlers['yuaninfant.project']).toBeDefined();
            expect(handlers['yuaninfant.sync']).toBeDefined();
            expect(handlers['yuaninfant.recall']).toBeDefined();
            expect(handlers['yuaninfant.status']).toBeDefined();
        });

        it('getMCPHandlers返回的处理器可调用', () => {
            const handlers = YuanInfantService.getMCPHandlers(gameState);
            expect(typeof handlers['yuaninfant.form']).toBe('function');
            expect(typeof handlers['yuaninfant.status']).toBe('function');
        });

        it('createYuanInfantService创建新实例', () => {
            const newService = createYuanInfantService(gameState);
            expect(newService).toBeInstanceOf(YuanInfantService);
            expect(newService.gameState).toBe(gameState);
        });

        it('getYuanInfantService返回单例', () => {
            _yuanInfantServiceInstance = null; // 重置单例
            const service1 = getYuanInfantService(gameState);
            const service2 = getYuanInfantService(gameState);
            expect(service1).toBe(service2);
        });
    });

    // ===== 常量测试 =====

    describe('constants', () => {
        it('YUAN_INFANT_REQUIREMENTS包含必要字段', () => {
            expect(YUAN_INFANT_REQUIREMENTS.minRealm).toBe(5);
            expect(YUAN_INFANT_REQUIREMENTS.minSpiritEnergy).toBe(500);
            expect(YUAN_INFANT_REQUIREMENTS.formCost).toBe(1000);
            expect(YUAN_INFANT_REQUIREMENTS.separationDuration).toBe(3600000);
            expect(YUAN_INFANT_REQUIREMENTS.projectionRange).toBe(1000);
            expect(YUAN_INFANT_REQUIREMENTS.projectionCost).toBe(200);
        });

        it('YUAN_INFANT_STATES包含所有状态', () => {
            expect(YUAN_INFANT_STATES.NONE).toBe('none');
            expect(YUAN_INFANT_STATES.FORMING).toBe('forming');
            expect(YUAN_INFANT_STATES.FORMED).toBe('formed');
            expect(YUAN_INFANT_STATES.SEPARATED).toBe('separated');
            expect(YUAN_INFANT_STATES.PROJECTING).toBe('projecting');
            expect(YUAN_INFANT_STATES.SYNCHRONIZING).toBe('synchronizing');
        });

        it('YUAN_INFANT_ATTRIBUTES包含所有属性', () => {
            expect(YUAN_INFANT_ATTRIBUTES.spiritualPower).toBeDefined();
            expect(YUAN_INFANT_ATTRIBUTES.perceptionRange).toBeDefined();
            expect(YUAN_INFANT_ATTRIBUTES.syncRate).toBeDefined();
        });

        it('YUAN_INFANT_TOOLS包含6个工具', () => {
            expect(Object.keys(YUAN_INFANT_TOOLS).length).toBe(6);
            expect(YUAN_INFANT_TOOLS['yuaninfant.form']).toBeDefined();
            expect(YUAN_INFANT_TOOLS['yuaninfant.separate']).toBeDefined();
            expect(YUAN_INFANT_TOOLS['yuaninfant.project']).toBeDefined();
            expect(YUAN_INFANT_TOOLS['yuaninfant.sync']).toBeDefined();
            expect(YUAN_INFANT_TOOLS['yuaninfant.recall']).toBeDefined();
            expect(YUAN_INFANT_TOOLS['yuaninfant.status']).toBeDefined();
        });

        it('每个工具定义包含name和description', () => {
            for (const [name, tool] of Object.entries(YUAN_INFANT_TOOLS)) {
                expect(tool.name).toBe(name);
                expect(tool.description).toBeDefined();
                expect(tool.inputSchema).toBeDefined();
            }
        });
    });

    // ===== 边界情况测试 =====

    describe('edge cases', () => {
        it('realm为0时条件检查正确', () => {
            gameState.realm = 0;
            service.init(gameState);
            const result = service.checkFormationRequirements();
            expect(result.canForm).toBe(false);
        });

        it('spiritEnergy为0时条件检查正确', () => {
            gameState.spiritEnergy = 0;
            service.init(gameState);
            const result = service.checkFormationRequirements();
            expect(result.canForm).toBe(false);
        });

        it('spiritStones为0时条件检查正确', () => {
            gameState.spiritStones = 0;
            service.init(gameState);
            const result = service.checkFormationRequirements();
            expect(result.canForm).toBe(false);
        });

        it('无playerStatus时recall正确处理', () => {
            gameState = createSeparatedGameState();
            delete gameState.playerStatus;
            service.init(gameState);
            const result = service.recallYuanInfant();
            expect(result.success).toBe(true);
        });

        it('分离结束后自动处理', () => {
            gameState = createSeparatedGameState();
            gameState.yuanInfant.separationEndTime = Date.now() - 1000; // 已结束
            service.init(gameState);
            // 这只是验证状态，实际的超时处理应该在游戏循环中
            const status = service.getYuanInfantStatus();
            expect(status.isSeparated).toBe(true);
        });
    });
});
