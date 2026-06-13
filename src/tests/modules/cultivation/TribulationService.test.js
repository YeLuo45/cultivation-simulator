/**
 * TribulationService.test.js - TDD测试
 * V246 天劫渡劫系统测试
 * 
 * 测试覆盖率要求: ≥98%
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    TribulationService,
    TRIBULATION_TIERS,
    TRIBULATION_STATES,
    TRIBULATION_CONFIG,
    TRIBULATION_REWARDS,
    TRIBULATION_TYPE_NAMES
} from '../../../../src/domains/cultivation/services/TribulationService.js';

// ===== 测试辅助函数 =====

/**
 * 创建测试用gameState
 */
function createTestGameState(overrides = {}) {
    return {
        realm: 15,
        stage: 1,
        spiritRoot: { type: 'wood', tier: 4 },
        spiritStones: 50000,
        merit: 500,
        tribulation: null,
        tribulationRecord: [],
        cultivationXP: 0,
        player: {
            name: '测试修士',
            level: 50
        },
        ...overrides
    };
}

/**
 * 创建准备状态gameState
 */
function createPreparingGameState(overrides = {}) {
    return createTestGameState({
        tribulation: {
            state: TRIBULATION_STATES.PREPARING,
            currentTier: '雷劫',
            targetRealm: 15,
            progress: 0,
            strikesTotal: 3,
            strikesCurrent: 0,
            damageAccumulated: 0,
            resistedAccumulated: 0,
            history: [],
            acquiredRewards: [],
            successRateBonus: 0
        },
        ...overrides
    });
}

/**
 * 创建进行中状态gameState
 */
function createInProgressGameState(overrides = {}) {
    return createTestGameState({
        tribulation: {
            state: TRIBULATION_STATES.IN_PROGRESS,
            currentTier: '雷劫',
            targetRealm: 15,
            progress: 33,
            strikesTotal: 3,
            strikesCurrent: 1,
            damageAccumulated: 0,
            resistedAccumulated: 1,
            history: [
                { action: 'prepare', details: { tierName: '雷劫' }, timestamp: Date.now() - 1000 }
            ],
            acquiredRewards: [],
            successRateBonus: 0
        },
        ...overrides
    });
}

/**
 * 创建成功状态gameState
 */
function createSuccessGameState(overrides = {}) {
    return createTestGameState({
        tribulation: {
            state: TRIBULATION_STATES.SUCCESS,
            currentTier: '雷劫',
            targetRealm: 15,
            progress: 100,
            strikesTotal: 3,
            strikesCurrent: 3,
            damageAccumulated: 50,
            resistedAccumulated: 3,
            history: [
                { action: 'prepare', details: { tierName: '雷劫' }, timestamp: Date.now() - 5000 },
                { action: 'success', details: { tierName: '雷劫', resistRate: 1.0 }, timestamp: Date.now() }
            ],
            acquiredRewards: [],
            successRateBonus: 0.02
        },
        ...overrides
    });
}

// ===== 测试套件 =====

describe('TribulationService', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createTestGameState();
        service = new TribulationService(gameState);
    });

    // ===== 常量测试 =====

    describe('TRIBULATION_TIERS', () => {
        it('应包含4种天劫类型', () => {
            expect(Object.keys(TRIBULATION_TIERS)).toHaveLength(4);
        });

        it('雷劫应有正确的配置', () => {
            const tier = TRIBULATION_TIERS['雷劫'];
            expect(tier.name).toBe('雷劫');
            expect(tier.minRealm).toBe(10);
            expect(tier.baseSuccessRate).toBe(0.6);
            expect(tier.rewards).toContain('天雷精华');
            expect(tier.damage).toBe(100);
        });

        it('风劫应有正确的配置', () => {
            const tier = TRIBULATION_TIERS['风劫'];
            expect(tier.name).toBe('风劫');
            expect(tier.minRealm).toBe(20);
            expect(tier.baseSuccessRate).toBe(0.5);
            expect(tier.rewards).toContain('风之精粹');
            expect(tier.damage).toBe(150);
        });

        it('心魔劫应有正确的配置', () => {
            const tier = TRIBULATION_TIERS['心魔劫'];
            expect(tier.name).toBe('心魔劫');
            expect(tier.minRealm).toBe(30);
            expect(tier.baseSuccessRate).toBe(0.4);
            expect(tier.rewards).toContain('道心稳固');
            expect(tier.damage).toBe(200);
        });

        it('道劫应有正确的配置', () => {
            const tier = TRIBULATION_TIERS['道劫'];
            expect(tier.name).toBe('道劫');
            expect(tier.minRealm).toBe(40);
            expect(tier.baseSuccessRate).toBe(0.3);
            expect(tier.rewards).toContain('大道之基');
            expect(tier.damage).toBe(300);
        });

        it('每个天劫应有伤害值', () => {
            for (const tierName of Object.keys(TRIBULATION_TIERS)) {
                expect(TRIBULATION_TIERS[tierName].damage).toBeGreaterThan(0);
            }
        });
    });

    describe('TRIBULATION_STATES', () => {
        it('应包含所有状态', () => {
            expect(TRIBULATION_STATES.NONE).toBe('none');
            expect(TRIBULATION_STATES.PREPARING).toBe('preparing');
            expect(TRIBULATION_STATES.IN_PROGRESS).toBe('in_progress');
            expect(TRIBULATION_STATES.SUCCESS).toBe('success');
            expect(TRIBULATION_STATES.FAILED).toBe('failed');
        });
    });

    describe('TRIBULATION_REWARDS', () => {
        it('天雷精华应有正确效果', () => {
            const reward = TRIBULATION_REWARDS['天雷精华'];
            expect(reward.type).toBe('attribute');
            expect(reward.effect.attack).toBe(20);
            expect(reward.effect.defense).toBe(10);
        });

        it('风之精粹应有正确效果', () => {
            const reward = TRIBULATION_REWARDS['风之精粹'];
            expect(reward.type).toBe('attribute');
            expect(reward.effect.speed).toBe(30);
        });

        it('道心稳固应有正确效果', () => {
            const reward = TRIBULATION_REWARDS['道心稳固'];
            expect(reward.type).toBe('attribute');
            expect(reward.effect.spiritEnergy).toBe(50);
        });

        it('大道之基应有正确效果', () => {
            const reward = TRIBULATION_REWARDS['大道之基'];
            expect(reward.type).toBe('attribute');
            expect(reward.effect.maxHp).toBe(100);
        });
    });

    // ===== 初始化测试 =====

    describe('init', () => {
        it('应初始化tribulation状态', () => {
            const result = service.init(gameState);
            expect(gameState.tribulation).not.toBeNull();
            expect(gameState.tribulation.state).toBe(TRIBULATION_STATES.NONE);
            expect(gameState.tribulation.currentTier).toBeNull();
            expect(gameState.tribulation.strikesTotal).toBe(0);
            expect(gameState.tribulation.history).toEqual([]);
        });

        it('已存在的tribulation状态不应被覆盖', () => {
            gameState.tribulation = {
                state: TRIBULATION_STATES.IN_PROGRESS,
                currentTier: '风劫',
                targetRealm: 25,
                progress: 50,
                strikesTotal: 5,
                strikesCurrent: 2,
                damageAccumulated: 100,
                resistedAccumulated: 3,
                history: [{ action: 'test', details: {}, timestamp: Date.now() }],
                acquiredRewards: [{ type: 'spiritStones', amount: 1000 }],
                successRateBonus: 0.05
            };
            service.init(gameState);
            expect(gameState.tribulation.state).toBe(TRIBULATION_STATES.IN_PROGRESS);
            expect(gameState.tribulation.currentTier).toBe('风劫');
            expect(gameState.tribulation.progress).toBe(50);
        });

        it('应返回gameState引用', () => {
            const result = service.init(gameState);
            expect(result).toBe(gameState);
        });

        it('应初始化tribulationRecord数组', () => {
            delete gameState.tribulationRecord;
            service.init(gameState);
            expect(gameState.tribulationRecord).toEqual([]);
        });

        it('不应覆盖已存在的tribulationRecord', () => {
            gameState.tribulationRecord = [{ realm: 1, success: true }];
            service.init(gameState);
            expect(gameState.tribulationRecord).toHaveLength(1);
        });
    });

    // ===== getAvailableTribulations 测试 =====

    describe('getAvailableTribulations', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('realm=15时应只有雷劫可用', () => {
            gameState.realm = 15;
            const available = service.getAvailableTribulations();
            expect(available).toEqual(['雷劫']);
        });

        it('realm=25时应包含雷劫和风劫', () => {
            gameState.realm = 25;
            const available = service.getAvailableTribulations();
            expect(available).toContain('雷劫');
            expect(available).toContain('风劫');
        });

        it('realm=35时应包含雷劫、风劫和心魔劫', () => {
            gameState.realm = 35;
            const available = service.getAvailableTribulations();
            expect(available).toContain('雷劫');
            expect(available).toContain('风劫');
            expect(available).toContain('心魔劫');
        });

        it('realm=50时应包含所有天劫', () => {
            gameState.realm = 50;
            const available = service.getAvailableTribulations();
            expect(available).toContain('雷劫');
            expect(available).toContain('风劫');
            expect(available).toContain('心魔劫');
            expect(available).toContain('道劫');
        });

        it('realm=0时无天劫可用', () => {
            gameState.realm = 0;
            const available = service.getAvailableTribulations();
            expect(available).toHaveLength(0);
        });

        it('realm=9时无天劫可用', () => {
            gameState.realm = 9;
            const available = service.getAvailableTribulations();
            expect(available).toHaveLength(0);
        });

        it('realm=10时应只有雷劫可用', () => {
            gameState.realm = 10;
            const available = service.getAvailableTribulations();
            expect(available).toEqual(['雷劫']);
        });

        it('参数realm应覆盖gameState.realm', () => {
            gameState.realm = 5;
            const available = service.getAvailableTribulations({ realm: 50 });
            expect(available).toContain('道劫');
        });
    });

    // ===== calculateSuccessRate 测试 =====

    describe('calculateSuccessRate', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('雷劫基础成功率应为0.6', () => {
            const result = service.calculateSuccessRate({ tierName: '雷劫' });
            expect(result.baseRate).toBe(0.6);
        });

        it('风劫基础成功率应为0.5', () => {
            const result = service.calculateSuccessRate({ tierName: '风劫' });
            expect(result.baseRate).toBe(0.5);
        });

        it('心魔劫基础成功率应为0.4', () => {
            const result = service.calculateSuccessRate({ tierName: '心魔劫' });
            expect(result.baseRate).toBe(0.4);
        });

        it('道劫基础成功率应为0.3', () => {
            const result = service.calculateSuccessRate({ tierName: '道劫' });
            expect(result.baseRate).toBe(0.3);
        });

        it('装备应增加成功率', () => {
            const result = service.calculateSuccessRate({ tierName: '雷劫', equipment: [{}, {}, {}] });
            expect(result.equipmentBonus).toBe(0.15);
        });

        it('丹药应增加成功率', () => {
            const result = service.calculateSuccessRate({ tierName: '雷劫', elixirs: [{}, {}, {}, {}] });
            expect(result.elixirBonus).toBe(0.12);
        });

        it('境界超过最低要求应增加成功率', () => {
            gameState.realm = 20;
            const result = service.calculateSuccessRate({ tierName: '雷劫' });
            expect(result.realmBonus).toBe(0.2);
        });

        it('功德应增加成功率', () => {
            gameState.merit = 500;
            const result = service.calculateSuccessRate({ tierName: '雷劫' });
            expect(result.meritBonus).toBe(0.1);
        });

        it('天品灵根应额外增加10%成功率', () => {
            gameState.spiritRoot.tier = 5;
            const result = service.calculateSuccessRate({ tierName: '雷劫' });
            expect(result.spiritRootBonus).toBe(0.1);
        });

        it('无效天劫类型应返回错误', () => {
            const result = service.calculateSuccessRate({ tierName: '无效类型' });
            expect(result.success).toBe(false);
            expect(result.error).toContain('无效');
        });

        it('最终成功率不应超过0.95', () => {
            gameState.merit = 10000;
            gameState.spiritRoot.tier = 5;
            const result = service.calculateSuccessRate({ 
                tierName: '雷劫', 
                equipment: [{}, {}, {}, {}],
                elixirs: [{}, {}, {}, {}]
            });
            expect(result.finalRate).toBeLessThanOrEqual(0.95);
        });

        it('最终成功率不应低于0.05', () => {
            gameState.merit = 0;
            gameState.realm = 10;
            gameState.spiritRoot.tier = 1;
            const result = service.calculateSuccessRate({ tierName: '道劫' });
            expect(result.finalRate).toBeGreaterThanOrEqual(0.05);
        });
    });

    // ===== checkRequirements 测试 =====

    describe('checkRequirements', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('不指定类型时应返回可用天劫列表', () => {
            gameState.realm = 25;
            const result = service.checkRequirements();
            expect(result.success).toBe(true);
            expect(result.availableTribulations).toBeDefined();
            expect(result.availableTribulations).toContain('雷劫');
            expect(result.availableTribulations).toContain('风劫');
        });

        it('雷劫条件满足时应返回canTribulate=true', () => {
            gameState.realm = 15;
            const result = service.checkRequirements({ tierName: '雷劫' });
            expect(result.canTribulate).toBe(true);
        });

        it('境界不足时应返回canTribulate=false', () => {
            gameState.realm = 5;
            const result = service.checkRequirements({ tierName: '雷劫' });
            expect(result.canTribulate).toBe(false);
            const realmReq = result.requirements.find(r => r.type === 'realm');
            expect(realmReq.met).toBe(false);
        });

        it('灵石不足时应返回canTribulate=false', () => {
            gameState.spiritStones = 100;
            const result = service.checkRequirements({ tierName: '雷劫' });
            expect(result.canTribulate).toBe(false);
            const stoneReq = result.requirements.find(r => r.type === 'spiritStones');
            expect(stoneReq.met).toBe(false);
        });

        it('天劫进行中时应返回canTribulate=false', () => {
            gameState.tribulation.state = TRIBULATION_STATES.IN_PROGRESS;
            const result = service.checkRequirements({ tierName: '雷劫' });
            expect(result.canTribulate).toBe(false);
        });

        it('无效天劫类型应返回错误', () => {
            const result = service.checkRequirements({ tierName: '无效类型' });
            expect(result.success).toBe(false);
            expect(result.error).toContain('无效');
        });

        it('应返回详细的条件检查结果', () => {
            const result = service.checkRequirements({ tierName: '雷劫' });
            expect(result.requirements).toBeDefined();
            expect(result.requirements.length).toBe(3);
        });
    });

    // ===== calculateStoneCost 测试 =====

    describe('calculateStoneCost', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('雷劫基础成本应为1000 + 10*500 = 6000', () => {
            const cost = service.calculateStoneCost('雷劫');
            expect(cost).toBe(6000);
        });

        it('风劫基础成本应为1000 + 20*500 = 11000', () => {
            const cost = service.calculateStoneCost('风劫');
            expect(cost).toBe(11000);
        });

        it('心魔劫基础成本应为1000 + 30*500 = 16000', () => {
            const cost = service.calculateStoneCost('心魔劫');
            expect(cost).toBe(16000);
        });

        it('道劫基础成本应为1000 + 40*500 = 21000', () => {
            const cost = service.calculateStoneCost('道劫');
            expect(cost).toBe(21000);
        });

        it('无效类型成本应为0', () => {
            const cost = service.calculateStoneCost('无效类型');
            expect(cost).toBe(0);
        });
    });

    // ===== prepare 测试 =====

    describe('prepare', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('条件满足时应成功准备渡劫', () => {
            const result = service.prepare({ tierName: '雷劫' });
            expect(result.success).toBe(true);
            expect(result.action).toBe('tribulation.prepare');
            expect(result.state).toBe(TRIBULATION_STATES.PREPARING);
            expect(result.tierName).toBe('雷劫');
        });

        it('应扣除灵石', () => {
            const initialStones = gameState.spiritStones;
            service.prepare({ tierName: '雷劫' });
            expect(gameState.spiritStones).toBe(initialStones - service.calculateStoneCost('雷劫'));
        });

        it('雷劫应有3道天劫', () => {
            const result = service.prepare({ tierName: '雷劫' });
            expect(result.strikesTotal).toBe(3);
        });

        it('风劫应有5道天劫', () => {
            const result = service.prepare({ tierName: '风劫' });
            expect(result.strikesTotal).toBe(5);
        });

        it('心魔劫应有7道天劫', () => {
            const result = service.prepare({ tierName: '心魔劫' });
            expect(result.strikesTotal).toBe(7);
        });

        it('道劫应有9道天劫', () => {
            const result = service.prepare({ tierName: '道劫' });
            expect(result.strikesTotal).toBe(9);
        });

        it('未指定类型时应返回错误', () => {
            const result = service.prepare({});
            expect(result.success).toBe(false);
            expect(result.error).toContain('必须指定');
        });

        it('无效类型时应返回错误', () => {
            const result = service.prepare({ tierName: '无效类型' });
            expect(result.success).toBe(false);
            expect(result.error).toContain('无效');
        });

        it('境界不足时应返回错误', () => {
            gameState.realm = 5;
            const result = service.prepare({ tierName: '雷劫' });
            expect(result.success).toBe(false);
            expect(result.error).toContain('境界不足');
        });

        it('灵石不足时应返回错误', () => {
            gameState.spiritStones = 100;
            const result = service.prepare({ tierName: '雷劫' });
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });

        it('天劫进行中时应返回错误', () => {
            gameState.tribulation.state = TRIBULATION_STATES.IN_PROGRESS;
            const result = service.prepare({ tierName: '雷劫' });
            expect(result.success).toBe(false);
            expect(result.error).toContain('正在进行中');
        });
    });

    // ===== getStrikesForTier 测试 =====

    describe('getStrikesForTier', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('雷劫返回3', () => {
            expect(service.getStrikesForTier('雷劫')).toBe(3);
        });

        it('风劫返回5', () => {
            expect(service.getStrikesForTier('风劫')).toBe(5);
        });

        it('心魔劫返回7', () => {
            expect(service.getStrikesForTier('心魔劫')).toBe(7);
        });

        it('道劫返回9', () => {
            expect(service.getStrikesForTier('道劫')).toBe(9);
        });

        it('未知类型返回3', () => {
            expect(service.getStrikesForTier('未知')).toBe(3);
        });
    });

    // ===== execute 测试 =====

    describe('execute', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('准备状态应转换为进行中', () => {
            service.prepare({ tierName: '雷劫' });
            service.execute();
            expect(gameState.tribulation.state).toBe(TRIBULATION_STATES.IN_PROGRESS);
        });

        it('无进行中天劫时应返回错误', () => {
            const result = service.execute();
            expect(result.success).toBe(false);
            expect(result.error).toContain('请先准备');
        });

        it('抵抗成功时应增加抵抗计数', () => {
            service.prepare({ tierName: '雷劫' });
            service.execute({ resisted: true });
            expect(gameState.tribulation.resistedAccumulated).toBe(1);
        });

        it('抵抗失败时应累加伤害', () => {
            service.prepare({ tierName: '雷劫' });
            service.execute({ resisted: false });
            expect(gameState.tribulation.damageAccumulated).toBeGreaterThan(0);
        });

        it('应返回当前进度', () => {
            service.prepare({ tierName: '雷劫' });
            const result = service.execute();
            expect(result.strikeNumber).toBe(1);
            expect(result.strikesTotal).toBe(3);
            expect(result.progress).toBe('1/3');
        });

        it('完成所有雷击且抵抗率>=50%应成功', () => {
            service.prepare({ tierName: '雷劫' });
            for (let i = 1; i <= 3; i++) {
                service.execute({ resisted: true });
            }
            expect(gameState.tribulation.state).toBe(TRIBULATION_STATES.SUCCESS);
        });

        it('完成所有雷击但抵抗率<50%应失败', () => {
            service.prepare({ tierName: '雷劫' });
            for (let i = 1; i <= 3; i++) {
                service.execute({ resisted: false });
            }
            expect(gameState.tribulation.state).toBe(TRIBULATION_STATES.FAILED);
        });

        it('飞升成功后应包含奖励信息', () => {
            service.prepare({ tierName: '雷劫' });
            let result;
            for (let i = 1; i <= 3; i++) {
                result = service.execute({ resisted: true });
            }
            expect(result.result).toBe('success');
            expect(result.rewards).toBeDefined();
            expect(result.rewards.spiritStones).toBeGreaterThan(0);
            expect(result.rewards.cultivationXP).toBeGreaterThan(0);
            expect(result.tierBonus).toContain('天雷精华');
        });

        it('飞升失败后应包含惩罚信息', () => {
            service.prepare({ tierName: '雷劫' });
            let result;
            for (let i = 1; i <= 3; i++) {
                result = service.execute({ resisted: false });
            }
            expect(result.result).toBe('failed');
            expect(result.penalty).toBeDefined();
        });
    });

    // ===== handleTribulationSuccess 测试 =====

    describe('handleTribulationSuccess', () => {
        beforeEach(() => {
            service.init(gameState);
            service.prepare({ tierName: '雷劫' });
            gameState.tribulation.resistedAccumulated = 3;
            gameState.tribulation.strikesCurrent = 3;
            gameState.tribulation.strikesTotal = 3;
        });

        it('应更新状态为SUCCESS', () => {
            service.handleTribulationSuccess(1.0);
            expect(gameState.tribulation.state).toBe(TRIBULATION_STATES.SUCCESS);
        });

        it('应增加成功率加成', () => {
            const initialBonus = gameState.tribulation.successRateBonus;
            service.handleTribulationSuccess(1.0);
            expect(gameState.tribulation.successRateBonus).toBeGreaterThan(initialBonus);
        });

        it('抵抗率100%时应给予完整奖励', () => {
            const result = service.handleTribulationSuccess(1.0);
            expect(result.resistRate).toBe(1.0);
            expect(result.rewards.spiritStones).toBe(1000);
        });

        it('抵抗率50%时奖励应减半', () => {
            const result = service.handleTribulationSuccess(0.5);
            expect(result.rewards.spiritStones).toBe(500);
        });
    });

    // ===== handleTribulationFailure 测试 =====

    describe('handleTribulationFailure', () => {
        beforeEach(() => {
            service.init(gameState);
            service.prepare({ tierName: '雷劫' });
            gameState.tribulation.damageAccumulated = 200;
            gameState.tribulation.resistedAccumulated = 0;
            gameState.tribulation.strikesCurrent = 3;
            gameState.tribulation.strikesTotal = 3;
        });

        it('应更新状态为FAILED', () => {
            service.handleTribulationFailure();
            expect(gameState.tribulation.state).toBe(TRIBULATION_STATES.FAILED);
        });

        it('应返回失败信息', () => {
            const result = service.handleTribulationFailure();
            expect(result.result).toBe('failed');
            expect(result.damageTaken).toBe(200);
        });

        it('应包含惩罚信息', () => {
            const result = service.handleTribulationFailure();
            expect(result.penalty).toContain('损失');
        });
    });

    // ===== calculateRewards 测试 =====

    describe('calculateRewards', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('基础奖励应为1000灵石和500修为', () => {
            const rewards = service.calculateRewards('雷劫', 1.0);
            expect(rewards.spiritStones).toBe(1000);
            expect(rewards.cultivationXP).toBe(500);
            expect(rewards.merit).toBe(100);
        });

        it('倍率2时应双倍奖励', () => {
            const rewards = service.calculateRewards('雷劫', 2.0);
            expect(rewards.spiritStones).toBe(2000);
            expect(rewards.cultivationXP).toBe(1000);
        });

        it('雷劫应奖励天雷精华', () => {
            const rewards = service.calculateRewards('雷劫', 1.0);
            expect(rewards.rewardType).toBe('天雷精华');
        });

        it('风劫应奖励风之精粹', () => {
            const rewards = service.calculateRewards('风劫', 1.0);
            expect(rewards.rewardType).toBe('风之精粹');
        });

        it('心魔劫应奖励道心稳固', () => {
            const rewards = service.calculateRewards('心魔劫', 1.0);
            expect(rewards.rewardType).toBe('道心稳固');
        });

        it('道劫应奖励大道之基', () => {
            const rewards = service.calculateRewards('道劫', 1.0);
            expect(rewards.rewardType).toBe('大道之基');
        });
    });

    // ===== recordTribulationPass 测试 =====

    describe('recordTribulationPass', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('应添加渡劫记录', () => {
            service.recordTribulationPass('雷劫', true, 0.8);
            expect(gameState.tribulationRecord).toHaveLength(1);
            expect(gameState.tribulationRecord[0].tier).toBe('雷劫');
            expect(gameState.tribulationRecord[0].success).toBe(true);
        });

        it('应记录抵抗率', () => {
            service.recordTribulationPass('雷劫', true, 0.6);
            expect(gameState.tribulationRecord[0].resistRate).toBe(0.6);
        });

        it('应记录时间戳', () => {
            const before = Date.now();
            service.recordTribulationPass('雷劫', true, 1.0);
            const after = Date.now();
            expect(gameState.tribulationRecord[0].timestamp).toBeGreaterThanOrEqual(before);
            expect(gameState.tribulationRecord[0].timestamp).toBeLessThanOrEqual(after);
        });

        it('超过100条记录时应删除旧记录', () => {
            for (let i = 0; i < 105; i++) {
                service.recordTribulationPass('雷劫', true, 1.0);
            }
            expect(gameState.tribulationRecord.length).toBe(100);
        });
    });

    // ===== recordHistory 测试 =====

    describe('recordHistory', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('应添加历史记录', () => {
            service.recordHistory('prepare', { tierName: '雷劫' });
            expect(gameState.tribulation.history).toHaveLength(1);
        });

        it('应包含action和details', () => {
            service.recordHistory('success', { tierName: '雷劫', resistRate: 1.0 });
            expect(gameState.tribulation.history[0].action).toBe('success');
            expect(gameState.tribulation.history[0].details.tierName).toBe('雷劫');
        });

        it('超过100条记录时应删除旧记录', () => {
            for (let i = 0; i < 105; i++) {
                service.recordHistory('test', { index: i });
            }
            expect(gameState.tribulation.history.length).toBe(100);
        });
    });

    // ===== claimReward 测试 =====

    describe('claimReward', () => {
        beforeEach(() => {
            service.init(gameState);
            gameState.tribulation.state = TRIBULATION_STATES.SUCCESS;
            gameState.tribulation.currentTier = '雷劫';
            gameState.tribulation.resistedAccumulated = 3;
            gameState.tribulation.strikesTotal = 3;
            gameState.tribulation.acquiredRewards = [];
        });

        it('渡劫未成功时应返回错误', () => {
            gameState.tribulation.state = TRIBULATION_STATES.FAILED;
            const result = service.claimReward();
            expect(result.success).toBe(false);
            expect(result.error).toContain('无法领取');
        });

        it('应增加灵石', () => {
            const initialStones = gameState.spiritStones;
            service.claimReward();
            expect(gameState.spiritStones).toBeGreaterThan(initialStones);
        });

        it('应增加修为', () => {
            service.claimReward();
            expect(gameState.cultivationXP).toBeGreaterThan(0);
        });

        it('应增加功德', () => {
            service.claimReward();
            expect(gameState.merit).toBeGreaterThan(0);
        });

        it('应添加奖励到acquiredRewards', () => {
            service.claimReward();
            expect(gameState.tribulation.acquiredRewards.length).toBeGreaterThan(0);
        });

        it('应能指定领取特定奖励', () => {
            const initialCultivationXP = gameState.cultivationXP;
            service.claimReward({ rewardIndex: 1 });
            expect(gameState.cultivationXP).toBe(initialCultivationXP);
        });

        it('领取后应重置状态', () => {
            service.claimReward();
            expect(gameState.tribulation.state).toBe(TRIBULATION_STATES.NONE);
            expect(gameState.tribulation.currentTier).toBeNull();
        });
    });

    // ===== queryJournal 测试 =====

    describe('queryJournal', () => {
        beforeEach(() => {
            service.init(gameState);
            gameState.tribulation.history = [
                { action: 'prepare', details: { tierName: '雷劫' }, timestamp: Date.now() - 5000 },
                { action: 'success', details: { tierName: '雷劫' }, timestamp: Date.now() }
            ];
            gameState.tribulationRecord = [
                { tier: '雷劫', success: true, resistRate: 1.0, timestamp: Date.now() }
            ];
        });

        it('应返回历史记录', () => {
            const result = service.queryJournal();
            expect(result.success).toBe(true);
            expect(result.history).toHaveLength(2);
        });

        it('应返回渡劫记录', () => {
            const result = service.queryJournal();
            expect(result.records).toHaveLength(1);
        });

        it('limit参数应限制返回数量', () => {
            const result = service.queryJournal({ limit: 1 });
            expect(result.history.length).toBe(1);
        });

        it('应统计成功和失败次数', () => {
            const result = service.queryJournal();
            expect(result.totalPassed).toBe(1);
            expect(result.totalFailed).toBe(0);
        });
    });

    // ===== queryStatus 测试 =====

    describe('queryStatus', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('默认状态应正确返回', () => {
            const result = service.queryStatus();
            expect(result.success).toBe(true);
            expect(result.state).toBe(TRIBULATION_STATES.NONE);
            expect(result.currentTier).toBeNull();
        });

        it('准备状态应正确返回', () => {
            service.prepare({ tierName: '雷劫' });
            const result = service.queryStatus();
            expect(result.state).toBe(TRIBULATION_STATES.PREPARING);
            expect(result.currentTier).toBe('雷劫');
        });

        it('进行中状态应正确返回抵抗率', () => {
            service.prepare({ tierName: '雷劫' });
            service.execute({ resisted: true });
            service.execute({ resisted: false });
            const result = service.queryStatus();
            expect(result.state).toBe(TRIBULATION_STATES.IN_PROGRESS);
            expect(result.resistRate).toBeCloseTo(0.5);
        });
    });

    // ===== 边界条件测试 =====

    describe('边界条件', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('spiritStones为0或undefined时应有默认值', () => {
            gameState.spiritStones = 0;
            const result = service.checkRequirements({ tierName: '雷劫' });
            const stoneReq = result.requirements.find(r => r.type === 'spiritStones');
            expect(stoneReq.current).toBe(0);
        });

        it('merit为undefined时应有默认值', () => {
            gameState.merit = undefined;
            const result = service.calculateSuccessRate({ tierName: '雷劫' });
            expect(result.meritBonus).toBe(0);
        });

        it('realm为undefined时应有默认值', () => {
            gameState.realm = undefined;
            const result = service.getAvailableTribulations();
            expect(result).toHaveLength(0);
        });

        it('spiritRoot为undefined时应有默认值', () => {
            gameState.spiritRoot = undefined;
            const result = service.calculateSuccessRate({ tierName: '雷劫' });
            expect(result.spiritRootBonus).toBe(0);
        });
    });
});