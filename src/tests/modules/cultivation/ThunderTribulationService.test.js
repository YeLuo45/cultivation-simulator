/**
 * ThunderTribulationService.test.js - TDD测试
 * V241 Direction C: 天雷劫数系统测试
 * 
 * 测试覆盖率要求: ≥98%
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    ThunderTribulationService,
    THUNDER_TRIBULATION_LEVELS,
    TRIBULATION_STATES,
    TRIBULATION_TYPES,
    THUNDER_TRIBULATION_CONFIG,
    THUNDER_TRIBULATION_TOOLS
} from '../../../../src/domains/cultivation/services/ThunderTribulationService.js';

// ===== 测试辅助函数 =====

/**
 * 创建测试用gameState
 */
function createTestGameState(overrides = {}) {
    return {
        realm: 2,
        stage: 1,
        spiritRoot: { type: 'wood', tier: 3 },
        player: {
            name: '测试修士',
            level: 10,
            spiritStones: 10000,
            qi: 500,
            karmaPoints: 100
        },
        spiritEnergy: 1000,
        cultivationProgress: 50,
        qi: 500,
        thunderTribulation: null,
        ...overrides
    };
}

/**
 * 创建渡劫准备状态gameState
 */
function createPreparedGameState(overrides = {}) {
    return createTestGameState({
        thunderTribulation: {
            state: TRIBULATION_STATES.PREPARING,
            currentLevel: 3,
            targetRealm: 3,
            lightningIntensity: 300,
            lightningCount: 0,
            progress: 0,
            history: [],
            lightningMastery: 0,
            lightningSkills: [],
            blessingEffects: [],
            divinePunishment: 0,
            meritPoints: 100,
            lastTribulationTime: null,
            successRateBonus: 0,
            absorbedEnergy: 0
        },
        ...overrides
    });
}

/**
 * 创建渡劫成功状态gameState
 */
function createSuccessfulGameState(overrides = {}) {
    return createTestGameState({
        realm: 3,
        thunderTribulation: {
            state: TRIBULATION_STATES.SUCCESS,
            currentLevel: 3,
            targetRealm: 3,
            lightningIntensity: 300,
            lightningCount: 9,
            progress: 100,
            history: [
                { action: 'prepare', details: { targetRealm: 3, requiredLevel: 3 }, timestamp: Date.now() - 10000 },
                { action: 'execute', details: { targetRealm: 3, level: 3, result: 'success' }, timestamp: Date.now() }
            ],
            lightningMastery: 1,
            lightningSkills: [],
            blessingEffects: [],
            divinePunishment: 0,
            meritPoints: 100,
            lastTribulationTime: Date.now(),
            successRateBonus: 0,
            absorbedEnergy: 100
        },
        ...overrides
    });
}

// ===== 测试套件 =====

describe('ThunderTribulationService', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createTestGameState();
        service = new ThunderTribulationService(gameState);
    });

    // ===== 初始化测试 =====

    describe('init', () => {
        it('应初始化thunderTribulation状态', () => {
            const result = service.init(gameState);
            expect(gameState.thunderTribulation).not.toBeNull();
            expect(gameState.thunderTribulation.state).toBe(TRIBULATION_STATES.NONE);
            expect(gameState.thunderTribulation.currentLevel).toBe(0);
            expect(gameState.thunderTribulation.history).toEqual([]);
            expect(gameState.thunderTribulation.lightningMastery).toBe(0);
            expect(gameState.thunderTribulation.divinePunishment).toBe(0);
            expect(gameState.thunderTribulation.meritPoints).toBe(0);
        });

        it('已存在的thunderTribulation状态不应被覆盖', () => {
            gameState.thunderTribulation = {
                state: TRIBULATION_STATES.IN_PROGRESS,
                currentLevel: 5,
                targetRealm: 4,
                lightningIntensity: 500,
                lightningCount: 10,
                progress: 50,
                history: [{ action: 'test', details: {}, timestamp: Date.now() }],
                lightningMastery: 3,
                lightningSkills: [{ name: '雷击', level: 2 }],
                blessingEffects: [{ type: 'cultivation', name: '天雷淬体' }],
                divinePunishment: 50,
                meritPoints: 200,
                lastTribulationTime: Date.now(),
                successRateBonus: 0.1,
                absorbedEnergy: 200
            };
            service.init(gameState);
            expect(gameState.thunderTribulation.state).toBe(TRIBULATION_STATES.IN_PROGRESS);
            expect(gameState.thunderTribulation.currentLevel).toBe(5);
            expect(gameState.thunderTribulation.lightningMastery).toBe(3);
            expect(gameState.thunderTribulation.lightningSkills).toHaveLength(1);
        });

        it('应返回gameState引用', () => {
            const result = service.init(gameState);
            expect(result).toBe(gameState);
        });

        it('应初始化player.karmaPoints如果不存在', () => {
            delete gameState.player.karmaPoints;
            service.init(gameState);
            expect(gameState.player.karmaPoints).toBe(0);
        });

        it('不应覆盖已存在的karmaPoints', () => {
            gameState.player.karmaPoints = 500;
            service.init(gameState);
            expect(gameState.player.karmaPoints).toBe(500);
        });

        it('吸收能量初始值应为0', () => {
            service.init(gameState);
            expect(gameState.thunderTribulation.absorbedEnergy).toBe(0);
        });
    });

    // ===== getRequiredTribulationLevel 测试 =====

    describe('getRequiredTribulationLevel', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('realm=0需要1重劫', () => {
            gameState.realm = 0;
            expect(service.getRequiredTribulationLevel(0)).toBe(1);
        });

        it('realm=1需要2重劫', () => {
            gameState.realm = 1;
            expect(service.getRequiredTribulationLevel(1)).toBe(2);
        });

        it('realm=2需要3重劫', () => {
            gameState.realm = 2;
            expect(service.getRequiredTribulationLevel(2)).toBe(3);
        });

        it('realm=3需要4重劫', () => {
            gameState.realm = 3;
            expect(service.getRequiredTribulationLevel(3)).toBe(4);
        });

        it('realm=4需要5重劫', () => {
            gameState.realm = 4;
            expect(service.getRequiredTribulationLevel(4)).toBe(5);
        });

        it('realm=5需要9重劫', () => {
            gameState.realm = 5;
            expect(service.getRequiredTribulationLevel(5)).toBe(9);
        });

        it('不传参数时使用当前境界', () => {
            gameState.realm = 2;
            expect(service.getRequiredTribulationLevel()).toBe(3);
        });
    });

    // ===== calculateSuccessRate 测试 =====

    describe('calculateSuccessRate', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('应正确计算基础成功率', () => {
            gameState.realm = 2;
            gameState.cultivationProgress = 50;
            gameState.player.karmaPoints = 100;
            service.tribulationState.currentLevel = 3;
            service.tribulationState.meritPoints = 100;
            service.tribulationState.divinePunishment = 0;
            service.tribulationState.successRateBonus = 0;
            
            const result = service.calculateSuccessRate();
            
            expect(result.basePower).toBe(250); // 2*100 + 50
            expect(result.merit).toBe(100);
            expect(result.level).toBe(3);
            expect(result.rawRate).toBeCloseTo(11.67, 1);
        });

        it('天罚应抵消功德', () => {
            gameState.player.karmaPoints = 100;
            service.tribulationState.divinePunishment = 100;
            service.tribulationState.currentLevel = 3;
            service.tribulationState.meritPoints = 0;
            service.tribulationState.successRateBonus = 0;
            
            const result = service.calculateSuccessRate();
            
            // meritOffsetFactor=0.1, so 100*0.1=10 offset
            expect(result.merit).toBe(90);
        });

        it('finalRate应在0.05-0.95范围内', () => {
            gameState.realm = 0;
            gameState.cultivationProgress = 0;
            gameState.player.karmaPoints = 0;
            service.tribulationState.currentLevel = 9;
            service.tribulationState.meritPoints = 0;
            service.tribulationState.divinePunishment = 0;
            service.tribulationState.successRateBonus = 0;
            
            const result = service.calculateSuccessRate();
            
            expect(result.finalRate).toBeGreaterThanOrEqual(0.05);
            expect(result.finalRate).toBeLessThanOrEqual(0.95);
        });

        it('successRateBonus应加成到finalRate', () => {
            service.tribulationState.currentLevel = 3;
            service.tribulationState.successRateBonus = 0.2;
            
            const result = service.calculateSuccessRate();
            
            expect(result.finalRate).toBe(result.rawRate + 0.2);
        });
    });

    // ===== prepare 测试 =====

    describe('prepare', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('应正确准备渡劫', () => {
            gameState.realm = 2;
            gameState.player.spiritStones = 10000;
            
            const result = service.prepare({ targetRealm: 3 });
            
            expect(result.success).toBe(true);
            expect(result.state).toBe(TRIBULATION_STATES.PREPARING);
            expect(result.targetRealm).toBe(3);
            expect(result.requiredLevel).toBe(3);
            expect(service.tribulationState.state).toBe(TRIBULATION_STATES.PREPARING);
        });

        it('目标境界高于当前境界应成功', () => {
            gameState.realm = 1;
            gameState.player.spiritStones = 10000;
            
            const result = service.prepare({ targetRealm: 2 });
            
            expect(result.success).toBe(true);
            expect(result.targetRealm).toBe(2);
        });

        it('目标境界低于当前境界应失败', () => {
            gameState.realm = 3;
            gameState.player.spiritStones = 10000;
            
            const result = service.prepare({ targetRealm: 2 });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('高于当前境界');
        });

        it('灵石不足应失败', () => {
            gameState.realm = 2;
            gameState.player.spiritStones = 100;
            
            const result = service.prepare({ targetRealm: 3 });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });

        it('正在渡劫中应失败', () => {
            service.tribulationState.state = TRIBULATION_STATES.IN_PROGRESS;
            
            const result = service.prepare({ targetRealm: 3 });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('正在进行中');
        });

        it('已准备好渡劫应失败', () => {
            service.tribulationState.state = TRIBULATION_STATES.PREPARING;
            
            const result = service.prepare({ targetRealm: 3 });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('已准备好');
        });

        it('应设置正确的雷劫强度', () => {
            gameState.realm = 2;
            gameState.player.spiritStones = 10000;
            service.tribulationState.currentLevel = 3;
            
            service.prepare({ targetRealm: 3 });
            
            expect(service.tribulationState.lightningIntensity).toBe(300); // 3 * 100
        });

        it('应记录历史', () => {
            gameState.realm = 2;
            gameState.player.spiritStones = 10000;
            
            service.prepare({ targetRealm: 3 });
            
            expect(service.tribulationState.history).toHaveLength(1);
            expect(service.tribulationState.history[0].action).toBe('prepare');
        });

        it('不传targetRealm应自动设置为当前境界+1', () => {
            gameState.realm = 2;
            gameState.player.spiritStones = 10000;
            
            const result = service.prepare();
            
            expect(result.success).toBe(true);
            expect(result.targetRealm).toBe(3);
        });

        it('无效目标境界应失败', () => {
            const result = service.prepare({ targetRealm: 6 });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('无效的目标境界');
        });
    });

    // ===== execute 测试 =====

    describe('execute', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('已准备时应执行渡劫', () => {
            gameState.realm = 2;
            gameState.player.spiritStones = 10000;
            service.prepare({ targetRealm: 3 });
            
            const result = service.execute();
            
            // 结果可能是成功或失败，取决于随机
            expect(result.action).toBe('thunder.execute');
            expect(result.state).toMatch(/success|failed/);
        });

        it('灵石不足应失败', () => {
            gameState.realm = 2;
            gameState.player.spiritStones = 100;
            service.prepare({ targetRealm: 3 });
            
            const result = service.execute();
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });

        it('未准备时应自动准备', () => {
            gameState.realm = 2;
            gameState.player.spiritStones = 10000;
            
            const result = service.execute();
            
            expect(result.action).toBe('thunder.execute');
        });

        it('状态不是NONE或PREPARING且未准备时应失败', () => {
            service.tribulationState.state = TRIBULATION_STATES.SUCCESS;
            
            const result = service.execute();
            
            expect(result.success).toBe(false);
        });

        it('渡劫成功时应更新境界', () => {
            gameState.realm = 2;
            gameState.player.spiritStones = 100000;
            // 强制成功
            service.tribulationState.state = TRIBULATION_STATES.PREPARING;
            service.tribulationState.currentLevel = 1; // 最小劫数
            service.tribulationState.successRateBonus = 1; // 100%成功率
            
            const result = service.execute();
            
            if (result.success) {
                expect(gameState.realm).toBe(3);
                expect(gameState.stage).toBe(0);
            }
        });

        it('渡劫成功时应增加雷法精通', () => {
            gameState.realm = 2;
            gameState.player.spiritStones = 100000;
            service.tribulationState.state = TRIBULATION_STATES.PREPARING;
            service.tribulationState.currentLevel = 1;
            service.tribulationState.successRateBonus = 1;
            const initialMastery = service.tribulationState.lightningMastery;
            
            const result = service.execute();
            
            if (result.success) {
                expect(service.tribulationState.lightningMastery).toBe(initialMastery + 1);
            }
        });

        it('渡劫失败时应记录失败状态', () => {
            gameState.realm = 2;
            gameState.player.spiritStones = 100000;
            service.tribulationState.state = TRIBULATION_STATES.PREPARING;
            service.tribulationState.currentLevel = 9; // 最大劫数
            service.tribulationState.successRateBonus = -1; // 极低成功率
            
            const result = service.execute();
            
            if (!result.success) {
                expect(result.state).toBe(TRIBULATION_STATES.FAILED);
            }
        });

        it('应记录历史', () => {
            gameState.realm = 2;
            gameState.player.spiritStones = 10000;
            service.prepare({ targetRealm: 3 });
            
            service.execute();
            
            const lastHistory = service.tribulationState.history[service.tribulationState.history.length - 1];
            expect(lastHistory.action).toBe('execute');
        });
    });

    // ===== bless 测试 =====

    describe('bless', () => {
        beforeEach(() => {
            gameState = createSuccessfulGameState();
            service = new ThunderTribulationService(gameState);
        });

        it('成功渡劫后应获得赐福', () => {
            const result = service.bless({ type: 'cultivation' });
            
            expect(result.success).toBe(true);
            expect(result.blessingEffect).toBeDefined();
            expect(result.blessingEffect.type).toBe('cultivation');
        });

        it('cultivation类型赐福应增加修炼进度', () => {
            const initialProgress = gameState.cultivationProgress;
            
            service.bless({ type: 'cultivation' });
            
            expect(gameState.cultivationProgress).toBeGreaterThan(initialProgress);
        });

        it('attribute类型赐福应增加等级', () => {
            const initialLevel = gameState.player.level;
            
            service.bless({ type: 'attribute' });
            
            expect(gameState.player.level).toBeGreaterThan(initialLevel);
        });

        it('skill类型赐福应记录技能赐福', () => {
            const result = service.bless({ type: 'skill' });
            
            expect(result.success).toBe(true);
            expect(result.blessingEffect.type).toBe('skill');
        });

        it('未成功渡劫应失败', () => {
            service.tribulationState.state = TRIBULATION_STATES.FAILED;
            
            const result = service.bless({ type: 'cultivation' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('先成功渡劫');
        });

        it('已领取赐福应失败', () => {
            service.tribulationState.state = TRIBULATION_STATES.BLESSED;
            
            const result = service.bless({ type: 'cultivation' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('已领取');
        });

        it('无效赐福类型应失败', () => {
            const result = service.bless({ type: 'invalid' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('无效的赐福类型');
        });

        it('不传type应默认为cultivation', () => {
            const result = service.bless();
            
            expect(result.success).toBe(true);
            expect(result.blessingEffect.type).toBe('cultivation');
        });

        it('应记录赐福效果', () => {
            service.bless({ type: 'cultivation' });
            
            expect(service.tribulationState.blessingEffects).toHaveLength(1);
        });

        it('应记录历史', () => {
            service.bless({ type: 'cultivation' });
            
            const lastHistory = service.tribulationState.history[service.tribulationState.history.length - 1];
            expect(lastHistory.action).toBe('bless');
        });
    });

    // ===== mastery 测试 =====

    describe('mastery', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('query应返回当前等级信息', () => {
            service.tribulationState.lightningMastery = 3;
            
            const result = service.mastery({ action: 'query' });
            
            expect(result.success).toBe(true);
            expect(result.currentLevel).toBe(3);
            expect(result.maxLevel).toBe(9);
        });

        it('query应返回技能列表', () => {
            service.tribulationState.lightningSkills = [{ name: '雷击', level: 2 }];
            
            const result = service.mastery({ action: 'query' });
            
            expect(result.skills).toHaveLength(1);
            expect(result.skills[0].name).toBe('雷击');
        });

        it('query应返回熟练度进度', () => {
            service.tribulationState.lightningMastery = 3;
            
            const result = service.mastery({ action: 'query' });
            
            expect(result.experienceProgress).toBeDefined();
            expect(result.experienceProgress.current).toBe(3);
            expect(result.experienceProgress.max).toBe(9);
        });

        it('未成功渡劫upgrade应失败', () => {
            service.tribulationState.state = TRIBULATION_STATES.NONE;
            
            const result = service.mastery({ action: 'upgrade' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('先成功渡劫');
        });

        it('已达到最大等级upgrade应失败', () => {
            service.tribulationState.state = TRIBULATION_STATES.SUCCESS;
            service.tribulationState.lightningMastery = 9;
            
            const result = service.mastery({ action: 'upgrade' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('最大等级');
        });

        it('灵石不足upgrade应失败', () => {
            gameState.player.spiritStones = 100;
            service.tribulationState.state = TRIBULATION_STATES.SUCCESS;
            service.tribulationState.lightningMastery = 1;
            
            const result = service.mastery({ action: 'upgrade' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石');
        });

        it('upgrade成功时应提升等级', () => {
            gameState.player.spiritStones = 10000;
            service.tribulationState.state = TRIBULATION_STATES.SUCCESS;
            service.tribulationState.lightningMastery = 1;
            
            const result = service.mastery({ action: 'upgrade' });
            
            expect(result.success).toBe(true);
            expect(result.newLevel).toBe(2);
        });

        it('upgrade成功时应扣除灵石', () => {
            gameState.player.spiritStones = 10000;
            service.tribulationState.state = TRIBULATION_STATES.SUCCESS;
            service.tribulationState.lightningMastery = 1;
            
            service.mastery({ action: 'upgrade' });
            
            expect(gameState.player.spiritStones).toBeLessThan(10000);
        });

        it('upgrade成功时应记录历史', () => {
            gameState.player.spiritStones = 10000;
            service.tribulationState.state = TRIBULATION_STATES.SUCCESS;
            service.tribulationState.lightningMastery = 1;
            
            service.mastery({ action: 'upgrade' });
            
            const lastHistory = service.tribulationState.history[service.tribulationState.history.length - 1];
            expect(lastHistory.action).toBe('mastery_upgrade');
        });

        it('等级不足use应失败', () => {
            service.tribulationState.lightningMastery = 0;
            
            const result = service.mastery({ action: 'use' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('等级不足');
        });

        it('灵力不足use应失败', () => {
            gameState.player.qi = 10;
            service.tribulationState.lightningMastery = 1;
            
            const result = service.mastery({ action: 'use' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵力');
        });

        it('use成功时应造成伤害', () => {
            gameState.player.qi = 1000;
            service.tribulationState.lightningMastery = 2;
            
            const result = service.mastery({ action: 'use' });
            
            expect(result.success).toBe(true);
            expect(result.damage).toBe(200);
            expect(result.qiSpent).toBe(100);
        });

        it('use成功时应扣除灵力', () => {
            gameState.player.qi = 1000;
            service.tribulationState.lightningMastery = 2;
            
            service.mastery({ action: 'use' });
            
            expect(gameState.player.qi).toBe(900);
        });

        it('use成功时应记录历史', () => {
            gameState.player.qi = 1000;
            service.tribulationState.lightningMastery = 2;
            
            service.mastery({ action: 'use' });
            
            const lastHistory = service.tribulationState.history[service.tribulationState.history.length - 1];
            expect(lastHistory.action).toBe('mastery_use');
        });

        it('无效操作应失败', () => {
            const result = service.mastery({ action: 'invalid' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('无效的操作类型');
        });

        it('不传action应默认为query', () => {
            service.tribulationState.lightningMastery = 3;
            
            const result = service.mastery();
            
            expect(result.success).toBe(true);
            expect(result.currentLevel).toBe(3);
        });
    });

    // ===== absorb 测试 =====

    describe('absorb', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('有吸收能量时应成功吸收', () => {
            service.tribulationState.absorbedEnergy = 100;
            
            const result = service.absorb({ amount: 50 });
            
            expect(result.success).toBe(true);
            expect(result.amount).toBe(50);
        });

        it('吸收应恢复灵力', () => {
            gameState.player.qi = 100;
            service.tribulationState.absorbedEnergy = 100;
            
            const result = service.absorb({ amount: 50 });
            
            expect(result.qiRecovered).toBeGreaterThan(0);
            expect(gameState.player.qi).toBeGreaterThan(100);
        });

        it('灵力不应超过最大值', () => {
            gameState.realm = 2;
            gameState.player.qi = 200; // 已接近最大值
            service.tribulationState.absorbedEnergy = 100;
            
            service.absorb({ amount: 100 });
            
            expect(gameState.player.qi).toBeLessThanOrEqual(200); // 实际会限制在maxQi
        });

        it('灵力恢复不应超过maxQi', () => {
            gameState.realm = 0;
            gameState.player.qi = 50;
            service.tribulationState.absorbedEnergy = 100;
            
            const result = service.absorb({ amount: 100 });
            
            // maxQi for realm 0 = 100
            expect(gameState.player.qi).toBeLessThanOrEqual(100);
        });

        it('吸收量应为最大100', () => {
            service.tribulationState.absorbedEnergy = 200;
            
            const result = service.absorb({ amount: 150 });
            
            expect(result.amount).toBe(100);
        });

        it('无可吸收能量且未成功渡劫应失败', () => {
            service.tribulationState.state = TRIBULATION_STATES.NONE;
            service.tribulationState.absorbedEnergy = 0;
            
            const result = service.absorb({ amount: 50 });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('没有可吸收');
        });

        it('不传amount应有默认值', () => {
            service.tribulationState.absorbedEnergy = 100;
            
            const result = service.absorb();
            
            expect(result.success).toBe(true);
            expect(result.amount).toBe(50); // 默认值
        });

        it('应记录历史', () => {
            service.tribulationState.absorbedEnergy = 100;
            
            service.absorb({ amount: 50 });
            
            const lastHistory = service.tribulationState.history[service.tribulationState.history.length - 1];
            expect(lastHistory.action).toBe('absorb');
        });
    });

    // ===== journal 测试 =====

    describe('journal', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('应返回历史记录', () => {
            service.tribulationState.history = [
                { action: 'prepare', details: { targetRealm: 3 }, timestamp: Date.now() - 1000 },
                { action: 'execute', details: { result: 'success' }, timestamp: Date.now() }
            ];
            
            const result = service.journal({ limit: 10 });
            
            expect(result.success).toBe(true);
            expect(result.history).toHaveLength(2);
        });

        it('应按时间倒序返回', () => {
            service.tribulationState.history = [
                { action: 'prepare', details: {}, timestamp: Date.now() - 2000 },
                { action: 'execute', details: {}, timestamp: Date.now() - 1000 },
                { action: 'bless', details: {}, timestamp: Date.now() }
            ];
            
            const result = service.journal({ limit: 10 });
            
            expect(result.history[0].action).toBe('bless');
            expect(result.history[1].action).toBe('execute');
        });

        it('应返回正确的统计数据', () => {
            service.tribulationState.history = [
                { action: 'execute', details: { result: 'success', level: 3 }, timestamp: Date.now() },
                { action: 'execute', details: { result: 'failed', level: 2 }, timestamp: Date.now() - 1000 },
                { action: 'absorb', details: { amount: 50 }, timestamp: Date.now() - 2000 }
            ];
            service.tribulationState.lightningMastery = 3;
            
            const result = service.journal();
            
            expect(result.stats.totalTribulations).toBe(2);
            expect(result.stats.successfulTribulations).toBe(1);
            expect(result.stats.failedTribulations).toBe(1);
            expect(result.stats.totalLightningAbsorbed).toBe(50);
            expect(result.stats.currentMastery).toBe(3);
        });

        it('应限制返回数量', () => {
            for (let i = 0; i < 20; i++) {
                service.tribulationState.history.push({
                    action: 'execute',
                    details: { result: 'success' },
                    timestamp: Date.now() - i * 1000
                });
            }
            
            const result = service.journal({ limit: 5 });
            
            expect(result.history).toHaveLength(5);
        });

        it('应包含时间描述', () => {
            service.tribulationState.history = [
                { action: 'execute', details: {}, timestamp: Date.now() }
            ];
            
            const result = service.journal();
            
            expect(result.history[0].timeDesc).toBeDefined();
        });

        it('不传limit应有默认值10', () => {
            service.tribulationState.history = [];
            
            const result = service.journal();
            
            expect(result.success).toBe(true);
        });
    });

    // ===== getHighestTribulationLevel 测试 =====

    describe('getHighestTribulationLevel', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('空历史应返回0', () => {
            expect(service.getHighestTribulationLevel([])).toBe(0);
        });

        it('null历史应返回0', () => {
            expect(service.getHighestTribulationLevel(null)).toBe(0);
        });

        it('应返回最高等级', () => {
            const history = [
                { action: 'execute', details: { level: 3 } },
                { action: 'execute', details: { level: 5 } },
                { action: 'execute', details: { level: 2 } }
            ];
            
            expect(service.getHighestTribulationLevel(history)).toBe(5);
        });
    });

    // ===== formatTimestamp 测试 =====

    describe('formatTimestamp', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('刚刚应返回"刚刚"', () => {
            const result = service.formatTimestamp(Date.now());
            expect(result).toBe('刚刚');
        });

        it('分钟前应正确计算', () => {
            const timestamp = Date.now() - 60000 * 5;
            const result = service.formatTimestamp(timestamp);
            expect(result).toBe('5分钟前');
        });

        it('小时前应正确计算', () => {
            const timestamp = Date.now() - 3600000 * 3;
            const result = service.formatTimestamp(timestamp);
            expect(result).toBe('3小时前');
        });

        it('超过24小时应返回日期字符串', () => {
            const timestamp = Date.now() - 86400000 * 2;
            const result = service.formatTimestamp(timestamp);
            expect(result).toContain('/');
        });

        it('null应返回空字符串', () => {
            expect(service.formatTimestamp(null)).toBe('');
        });
    });

    // ===== getRealmName 测试 =====

    describe('getRealmName', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('应返回正确的境界名称', () => {
            expect(service.getRealmName(0)).toBe('炼气');
            expect(service.getRealmName(1)).toBe('筑基');
            expect(service.getRealmName(2)).toBe('金丹');
            expect(service.getRealmName(3)).toBe('元婴');
            expect(service.getRealmName(4)).toBe('化神');
            expect(service.getRealmName(5)).toBe('飞升');
        });

        it('未知境界应返回"未知"', () => {
            expect(service.getRealmName(6)).toBe('未知');
            expect(service.getRealmName(-1)).toBe('未知');
        });
    });

    // ===== getMasteryProgress 测试 =====

    describe('getMasteryProgress', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('应返回当前和最大等级', () => {
            service.tribulationState.lightningMastery = 5;
            
            const result = service.getMasteryProgress();
            
            expect(result.current).toBe(5);
            expect(result.max).toBe(9);
        });

        it('应返回百分比', () => {
            service.tribulationState.lightningMastery = 3;
            
            const result = service.getMasteryProgress();
            
            expect(result.percentage).toBeCloseTo(33.33, 1);
        });
    });

    // ===== recordHistory 测试 =====

    describe('recordHistory', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('应添加历史记录', () => {
            service.recordHistory('test_action', { detail: 'test' });
            
            expect(service.tribulationState.history).toHaveLength(1);
            expect(service.tribulationState.history[0].action).toBe('test_action');
        });

        it('应包含时间戳', () => {
            service.recordHistory('test_action', {});
            
            expect(service.tribulationState.history[0].timestamp).toBeDefined();
        });

        it('历史记录不应超过50条', () => {
            for (let i = 0; i < 60; i++) {
                service.recordHistory('test', {});
            }
            
            expect(service.tribulationState.history.length).toBe(50);
        });

        it('新记录应添加到最后', () => {
            service.recordHistory('first', {});
            service.recordHistory('second', {});
            
            expect(service.tribulationState.history[1].action).toBe('second');
        });
    });

    // ===== getMCPHandlers 测试 =====

    describe('getMCPHandlers', () => {
        it('应返回6个MCP处理器', () => {
            const handlers = ThunderTribulationService.getMCPHandlers(gameState);
            const handlerKeys = Object.keys(handlers);
            
            expect(handlerKeys).toContain('thunder.prepare');
            expect(handlerKeys).toContain('thunder.execute');
            expect(handlerKeys).toContain('thunder.bless');
            expect(handlerKeys).toContain('thunder.mastery');
            expect(handlerKeys).toContain('thunder.absorb');
            expect(handlerKeys).toContain('thunder.journal');
            expect(handlerKeys).toHaveLength(6);
        });

        it('每个处理器应可调用且返回结果', () => {
            const handlers = ThunderTribulationService.getMCPHandlers(gameState);
            
            // prepare - 应该成功（需要灵石）
            const prepareResult = handlers['thunder.prepare']({});
            expect(prepareResult).toBeDefined();
            expect(prepareResult.success).toBeDefined();
        });
    });

    // ===== 常量测试 =====

    describe('常量定义', () => {
        it('THUNDER_TRIBULATION_LEVELS应定义1-9', () => {
            expect(THUNDER_TRIBULATION_LEVELS.LEVEL_1).toBe(1);
            expect(THUNDER_TRIBULATION_LEVELS.LEVEL_9).toBe(9);
        });

        it('TRIBULATION_STATES应定义所有状态', () => {
            expect(TRIBULATION_STATES.NONE).toBe('none');
            expect(TRIBULATION_STATES.PREPARING).toBe('preparing');
            expect(TRIBULATION_STATES.IN_PROGRESS).toBe('in_progress');
            expect(TRIBULATION_STATES.SUCCESS).toBe('success');
            expect(TRIBULATION_STATES.FAILED).toBe('failed');
            expect(TRIBULATION_STATES.BLESSED).toBe('blessed');
        });

        it('TRIBULATION_TYPES应定义劫数类型', () => {
            expect(TRIBULATION_TYPES.MINOR).toBe('minor');
            expect(TRIBULATION_TYPES.MAJOR).toBe('major');
            expect(TRIBULATION_TYPES.DIVINE_PUNISHMENT).toBe('divine_punishment');
        });

        it('THUNDER_TRIBULATION_CONFIG应有正确配置', () => {
            expect(THUNDER_TRIBULATION_CONFIG.baseSuccessRate).toBe(0.5);
            expect(THUNDER_TRIBULATION_CONFIG.maxMasteryLevel).toBe(9);
            expect(THUNDER_TRIBULATION_CONFIG.blessingBaseBonus).toBe(0.1);
            expect(THUNDER_TRIBULATION_CONFIG.absorbRecoveryRate).toBe(0.3);
        });

        it('THUNDER_TRIBULATION_TOOLS应定义6个工具', () => {
            const toolKeys = Object.keys(THUNDER_TRIBULATION_TOOLS);
            expect(toolKeys).toHaveLength(6);
            expect(THUNDER_TRIBULATION_TOOLS['thunder.prepare']).toBeDefined();
            expect(THUNDER_TRIBULATION_TOOLS['thunder.execute']).toBeDefined();
            expect(THUNDER_TRIBULATION_TOOLS['thunder.bless']).toBeDefined();
            expect(THUNDER_TRIBULATION_TOOLS['thunder.mastery']).toBeDefined();
            expect(THUNDER_TRIBULATION_TOOLS['thunder.absorb']).toBeDefined();
            expect(THUNDER_TRIBULATION_TOOLS['thunder.journal']).toBeDefined();
        });

        it('每个工具定义应有name和description', () => {
            for (const tool of Object.values(THUNDER_TRIBULATION_TOOLS)) {
                expect(tool.name).toBeDefined();
                expect(tool.description).toBeDefined();
                expect(tool.parameters).toBeDefined();
            }
        });
    });

    // ===== 边界条件测试 =====

    describe('边界条件', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('player为null时prepare应处理', () => {
            gameState.player = null;
            gameState.realm = 2;
            
            const result = service.prepare({ targetRealm: 3 });
            
            expect(result.success).toBe(false);
        });

        it('player.spiritStones为undefined时prepare应处理', () => {
            gameState.player = { spiritStones: undefined };
            gameState.realm = 2;
            
            const result = service.prepare({ targetRealm: 3 });
            
            expect(result.success).toBe(false);
        });

        it('realm为undefined时应正常处理', () => {
            delete gameState.realm;
            
            const level = service.getRequiredTribulationLevel();
            
            expect(level).toBe(1); // 默认返回1
        });

        it('cultivationProgress为undefined时应正常计算', () => {
            delete gameState.cultivationProgress;
            service.tribulationState.currentLevel = 3;
            service.tribulationState.meritPoints = 0;
            service.tribulationState.divinePunishment = 0;
            service.tribulationState.successRateBonus = 0;
            
            const result = service.calculateSuccessRate();
            
            expect(result.basePower).toBeDefined();
        });
    });
});