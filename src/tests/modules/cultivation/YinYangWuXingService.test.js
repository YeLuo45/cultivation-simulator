/**
 * YinYangWuXingService.test.js - TDD测试
 * V240 Direction B: 阴阳五行系统测试
 * 
 * 测试覆盖率要求: ≥98%
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    YinYangWuXingService,
    createYinYangWuXingService,
    getYinYangWuXingService,
    FIVE_ELEMENTS,
    WUXING_GENERATION,
    WUXING_CONQUEST,
    YIN_YANG_STATES,
    YIN_YANG_WUXING_CONFIG,
    YIN_YANG_WUXING_TOOLS
} from '../../../../src/domains/cultivation/services/YinYangWuXingService.js';

// ===== 测试辅助函数 =====

/**
 * 创建测试用gameState
 */
function createTestGameState(overrides = {}) {
    return {
        realm: 3,
        stage: 1,
        spiritRoot: { type: 'wood', tier: 3 },
        spiritStones: 5000,
        spiritEnergy: 1000,
        cultivationProgress: 50,
        qi: 100,
        playerStatus: {},
        yinYangWuXing: null,
        ...overrides
    };
}

/**
 * 创建平衡状态gameState
 */
function createBalancedGameState(overrides = {}) {
    return createTestGameState({
        yinYangWuXing: {
            yin: 50,
            yang: 50,
            fiveElements: {
                metal: 20,
                wood: 20,
                water: 20,
                fire: 20,
                earth: 20
            },
            affinity: {
                metal: 3,
                wood: 3,
                water: 3,
                fire: 3,
                earth: 3
            },
            cycleState: { active: false, currentElement: null, rounds: 0, lastCycleTime: null },
            resonateState: { active: false, chain: [], bonus: 0 },
            history: []
        },
        ...overrides
    });
}

/**
 * 创建失衡状态gameState
 */
function createImbalancedGameState(overrides = {}) {
    return createTestGameState({
        yinYangWuXing: {
            yin: 80,
            yang: 30,
            fiveElements: {
                metal: 10,
                wood: 50,
                water: 10,
                fire: 10,
                earth: 10
            },
            affinity: {
                metal: 0,
                wood: 5,
                water: 0,
                fire: 0,
                earth: 0
            },
            cycleState: { active: false, currentElement: null, rounds: 0, lastCycleTime: null },
            resonateState: { active: false, chain: [], bonus: 0 },
            history: []
        },
        ...overrides
    });
}

// ===== 测试套件 =====

describe('YinYangWuXingService', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createTestGameState();
        service = new YinYangWuXingService(gameState);
    });

    // ===== 初始化测试 =====

    describe('init', () => {
        it('应初始化yinYangWuXing状态', () => {
            const result = service.init(gameState);
            expect(gameState.yinYangWuXing).not.toBeNull();
            expect(gameState.yinYangWuXing.yin).toBe(50);
            expect(gameState.yinYangWuXing.yang).toBe(50);
            expect(gameState.yinYangWuXing.fiveElements).toBeDefined();
            expect(gameState.yinYangWuXing.affinity).toBeDefined();
            expect(gameState.yinYangWuXing.history).toEqual([]);
        });

        it('已存在的yinYangWuXing状态不应被覆盖', () => {
            gameState.yinYangWuXing = {
                yin: 70,
                yang: 40,
                fiveElements: { metal: 30, wood: 40, water: 20, fire: 10, earth: 5 },
                affinity: { metal: 2, wood: 4, water: 1, fire: 0, earth: 0 },
                cycleState: { active: true, currentElement: 'wood', rounds: 2, lastCycleTime: Date.now() },
                resonateState: { active: true, chain: ['wood', 'fire'], bonus: 50 },
                history: [{ action: 'test', details: {}, timestamp: Date.now() }]
            };
            service.init(gameState);
            expect(gameState.yinYangWuXing.yin).toBe(70);
            expect(gameState.yinYangWuXing.yang).toBe(40);
            expect(gameState.yinYangWuXing.fiveElements.metal).toBe(30);
            expect(gameState.yinYangWuXing.resonateState.active).toBe(true);
        });

        it('应返回gameState引用', () => {
            const result = service.init(gameState);
            expect(result).toBe(gameState);
        });

        it('应初始化spiritRoot如果不存在', () => {
            delete gameState.spiritRoot;
            service.init(gameState);
            expect(gameState.spiritRoot).toBeDefined();
            expect(gameState.spiritRoot.type).toBe('wood');
        });

        it('五行强度初始值应为10', () => {
            service.init(gameState);
            for (const element of Object.keys(gameState.yinYangWuXing.fiveElements)) {
                expect(gameState.yinYangWuXing.fiveElements[element]).toBe(10);
            }
        });

        it('亲和等级初始值应为0', () => {
            service.init(gameState);
            for (const element of Object.keys(gameState.yinYangWuXing.affinity)) {
                expect(gameState.yinYangWuXing.affinity[element]).toBe(0);
            }
        });
    });

    // ===== getYinYangStatus 测试 =====

    describe('getYinYangStatus', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('阴阳差值<=10时状态为balanced', () => {
            gameState.yinYangWuXing.yin = 50;
            gameState.yinYangWuXing.yang = 55;
            const status = service.getYinYangStatus();
            expect(status.state).toBe(YIN_YANG_STATES.BALANCED);
        });

        it('阴>阳时状态为yin_excess', () => {
            gameState.yinYangWuXing.yin = 80;
            gameState.yinYangWuXing.yang = 30;
            const status = service.getYinYangStatus();
            expect(status.state).toBe(YIN_YANG_STATES.YIN_EXCESS);
        });

        it('阳>阴时状态为yang_excess', () => {
            gameState.yinYangWuXing.yin = 20;
            gameState.yinYangWuXing.yang = 80;
            const status = service.getYinYangStatus();
            expect(status.state).toBe(YIN_YANG_STATES.YANG_EXCESS);
        });

        it('应返回yin、yang、diff值', () => {
            gameState.yinYangWuXing.yin = 70;
            gameState.yinYangWuXing.yang = 40;
            const status = service.getYinYangStatus();
            expect(status.yin).toBe(70);
            expect(status.yang).toBe(40);
            expect(status.diff).toBe(30);
        });

        it('应返回状态描述', () => {
            gameState.yinYangWuXing.yin = 80;
            gameState.yinYangWuXing.yang = 30;
            const status = service.getYinYangStatus();
            expect(status.stateDesc).toBeDefined();
            expect(typeof status.stateDesc).toBe('string');
        });
    });

    // ===== getFiveElementsStatus 测试 =====

    describe('getFiveElementsStatus', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('应返回五个元素的状态', () => {
            const status = service.getFiveElementsStatus();
            expect(status.elements).toBeDefined();
            expect(status.elements.metal).toBeDefined();
            expect(status.elements.wood).toBeDefined();
            expect(status.elements.water).toBeDefined();
            expect(status.elements.fire).toBeDefined();
            expect(status.elements.earth).toBeDefined();
        });

        it('应计算total值', () => {
            gameState.yinYangWuXing.fiveElements = { metal: 10, wood: 20, water: 30, fire: 40, earth: 50 };
            const status = service.getFiveElementsStatus();
            expect(status.total).toBe(150);
        });

        it('应计算平均值', () => {
            gameState.yinYangWuXing.fiveElements = { metal: 10, wood: 20, water: 30, fire: 40, earth: 50 };
            const status = service.getFiveElementsStatus();
            expect(status.average).toBe('30.0');
        });

        it('应识别最强和最弱元素', () => {
            gameState.yinYangWuXing.fiveElements = { metal: 10, wood: 50, water: 30, fire: 40, earth: 20 };
            const status = service.getFiveElementsStatus();
            expect(status.strongest.element).toBe('wood');
            expect(status.strongest.value).toBe(50);
            expect(status.weakest.element).toBe('metal');
            expect(status.weakest.value).toBe(10);
        });

        it('应返回balance状态', () => {
            gameState.yinYangWuXing.fiveElements = { metal: 20, wood: 20, water: 20, fire: 20, earth: 20 };
            const status = service.getFiveElementsStatus();
            expect(status.balance).toBe('balanced');
        });

        it('标准差>30应返回severe_imbalance', () => {
            gameState.yinYangWuXing.fiveElements = { metal: 5, wood: 80, water: 5, fire: 5, earth: 5 };
            const status = service.getFiveElementsStatus();
            expect(status.balance).toBe('severe_imbalance');
        });
    });

    // ===== wuxing.analyze 测试 =====

    describe('wuxing.analyze', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('成功分析五行属性', () => {
            const result = service.analyze();
            expect(result.success).toBe(true);
            expect(result.action).toBe('wuxing.analyze');
            expect(result.yinYang).toBeDefined();
            expect(result.fiveElements).toBeDefined();
            expect(result.generation).toBeDefined();
            expect(result.conquest).toBeDefined();
        });

        it('应包含相生关系分析', () => {
            const result = service.analyze();
            expect(result.generation.chains).toBeDefined();
            expect(Array.isArray(result.generation.chains)).toBe(true);
            expect(result.generation.chains.length).toBe(5); // 5个元素都有相生关系
        });

        it('应包含相克关系分析', () => {
            const result = service.analyze();
            expect(result.conquest.conflicts).toBeDefined();
            expect(Array.isArray(result.conquest.conflicts)).toBe(true);
            expect(result.conquest.conflicts.length).toBe(5); // 5个元素都有相克关系
        });

        it('应计算修炼加成', () => {
            const result = service.analyze();
            expect(result.cultivationBonus).toBeDefined();
            expect(result.cultivationBonus.value).toBeDefined();
            expect(result.cultivationBonus.description).toBeDefined();
        });

        it('detail=true时应返回详细信息', () => {
            const result = service.analyze({ detail: true });
            expect(result.detailedAnalysis).toBeDefined();
            expect(result.detailedAnalysis.spiritRootInfluence).toBeDefined();
            expect(result.detailedAnalysis.recommendedElements).toBeDefined();
            expect(result.detailedAnalysis.warning).toBeDefined();
        });

        it('应记录历史', () => {
            service.analyze();
            expect(gameState.yinYangWuXing.history.length).toBeGreaterThan(0);
            expect(gameState.yinYangWuXing.history[0].action).toBe('analyze');
        });

        it('相生链healthy判断正确', () => {
            gameState.yinYangWuXing.fiveElements = { metal: 20, wood: 40, water: 20, fire: 20, earth: 20 };
            const result = service.analyze();
            // wood生火，ratio=40/20=2.0，healthy
            const woodToFire = result.generation.chains.find(c => c.from === 'wood' && c.to === 'fire');
            expect(woodToFire.healthy).toBe(true);
        });

        it('相克overwhelming判断正确', () => {
            gameState.yinYangWuXing.fiveElements = { metal: 80, wood: 10, water: 20, fire: 20, earth: 20 };
            const result = service.analyze();
            // 金克木，80/10=8 > 2.0，overwhelming
            const metalToWood = result.conquest.conflicts.find(c => c.from === 'metal' && c.to === 'wood');
            expect(metalToWood.overwhelming).toBe(true);
        });
    });

    // ===== wuxing.balance 测试 =====

    describe('wuxing.balance', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('成功调和阴阳', () => {
            gameState.yinYangWuXing.yin = 80;
            gameState.yinYangWuXing.yang = 30;
            gameState.spiritEnergy = 1000;
            const result = service.balance({ intensity: 5 });
            expect(result.success).toBe(true);
            expect(result.action).toBe('wuxing.balance');
        });

        it('调和后阴阳差值减小', () => {
            gameState.yinYangWuXing.yin = 80;
            gameState.yinYangWuXing.yang = 30;
            gameState.spiritEnergy = 1000;
            const result = service.balance({ intensity: 5 });
            expect(result.after.diff).toBeLessThan(result.before.diff);
        });

        it('灵力不足时返回错误', () => {
            gameState.yinYangWuXing.yin = 80;
            gameState.yinYangWuXing.yang = 30;
            gameState.spiritEnergy = 10;
            const result = service.balance({ intensity: 5 });
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵力不足');
        });

        it('消耗灵力', () => {
            gameState.yinYangWuXing.yin = 80;
            gameState.yinYangWuXing.yang = 30;
            gameState.spiritEnergy = 1000;
            service.balance({ intensity: 5 });
            expect(gameState.spiritEnergy).toBeLessThan(1000);
        });

        it('阴盛阳衰时减少阴增加阳', () => {
            gameState.yinYangWuXing.yin = 80;
            gameState.yinYangWuXing.yang = 30;
            gameState.spiritEnergy = 1000;
            service.balance({ intensity: 5 });
            expect(gameState.yinYangWuXing.yin).toBeLessThan(80);
            expect(gameState.yinYangWuXing.yang).toBeGreaterThan(30);
        });

        it('阳盛阴衰时减少阳增加阴', () => {
            gameState.yinYangWuXing.yin = 30;
            gameState.yinYangWuXing.yang = 80;
            gameState.spiritEnergy = 1000;
            service.balance({ intensity: 5 });
            expect(gameState.yinYangWuXing.yang).toBeLessThan(80);
            expect(gameState.yinYangWuXing.yin).toBeGreaterThan(30);
        });

        it('平衡后状态变为balanced', () => {
            gameState.yinYangWuXing.yin = 65;
            gameState.yinYangWuXing.yang = 35;
            gameState.spiritEnergy = 1000;
            const result = service.balance({ intensity: 10 });
            expect(result.newState).toBe(YIN_YANG_STATES.BALANCED);
        });

        it('应记录历史', () => {
            gameState.yinYangWuXing.yin = 80;
            gameState.yinYangWuXing.yang = 30;
            gameState.spiritEnergy = 1000;
            service.balance({ intensity: 5 });
            expect(gameState.yinYangWuXing.history.some(h => h.action === 'balance')).toBe(true);
        });

        it('默认intensity为5', () => {
            gameState.yinYangWuXing.yin = 70;
            gameState.yinYangWuXing.yang = 40;
            gameState.spiritEnergy = 1000;
            const result = service.balance({});
            expect(result.success).toBe(true);
        });
    });

    // ===== wuxing.imbue 测试 =====

    describe('wuxing.imbue', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('成功灌注元素', () => {
            gameState.spiritEnergy = 1000;
            const result = service.imbue({ element: 'fire', amount: 20 });
            expect(result.success).toBe(true);
            expect(result.action).toBe('wuxing.imbue');
            expect(result.element).toBe('fire');
            expect(result.amount).toBe(20);
        });

        it('灌注后元素强度增加', () => {
            gameState.spiritEnergy = 1000;
            const oldValue = gameState.yinYangWuXing.fiveElements.fire;
            service.imbue({ element: 'fire', amount: 20 });
            expect(gameState.yinYangWuXing.fiveElements.fire).toBe(oldValue + 20);
        });

        it('灵力不足时返回错误', () => {
            gameState.spiritEnergy = 10;
            const result = service.imbue({ element: 'fire', amount: 20 });
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵力不足');
        });

        it('无效元素返回错误', () => {
            gameState.spiritEnergy = 1000;
            const result = service.imbue({ element: 'invalid', amount: 20 });
            expect(result.success).toBe(false);
            expect(result.error).toContain('无效的');
        });

        it('高亲和等级减少消耗', () => {
            gameState.yinYangWuXing.affinity.fire = 5;
            gameState.spiritEnergy = 1000;
            const result = service.imbue({ element: 'fire', amount: 10 });
            expect(result.affinityBonus).toBeDefined();
        });

        it('可能触发相生', () => {
            gameState.spiritEnergy = 1000;
            gameState.yinYangWuXing.fiveElements = { metal: 10, wood: 10, water: 10, fire: 10, earth: 10 };
            const result = service.imbue({ element: 'metal', amount: 30 });
            // 金生水，可能触发
            expect(result.generation).toBeDefined();
        });

        it('元素强度不超过100', () => {
            gameState.spiritEnergy = 1000;
            gameState.yinYangWuXing.fiveElements.fire = 90;
            service.imbue({ element: 'fire', amount: 20 });
            expect(gameState.yinYangWuXing.fiveElements.fire).toBeLessThanOrEqual(100);
        });

        it('默认amount为10', () => {
            gameState.spiritEnergy = 1000;
            const result = service.imbue({ element: 'wood' });
            expect(result.amount).toBe(10);
        });
    });

    // ===== wuxing.resonate 测试 =====

    describe('wuxing.resonate', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('成功激发五行共鸣', () => {
            gameState.spiritEnergy = 500;
            const result = service.resonate({ element: 'wood' });
            expect(result.success).toBe(true);
            expect(result.action).toBe('wuxing.resonate');
        });

        it('共鸣链正确计算', () => {
            gameState.spiritEnergy = 500;
            const result = service.resonate({ element: 'wood' });
            // 木→火→土→金→水
            expect(result.chain).toContain('wood');
            expect(result.chain).toContain('fire');
            expect(result.chain.length).toBeGreaterThan(1);
        });

        it('灵力不足返回错误', () => {
            gameState.spiritEnergy = 10;
            const result = service.resonate({ element: 'wood' });
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵力不足');
        });

        it('无效元素返回错误', () => {
            gameState.spiritEnergy = 500;
            const result = service.resonate({ element: 'invalid' });
            expect(result.success).toBe(false);
        });

        it('消耗灵力', () => {
            gameState.spiritEnergy = 500;
            service.resonate({ element: 'wood' });
            expect(gameState.spiritEnergy).toBe(500 - YIN_YANG_WUXING_CONFIG.resonateCost);
        });

        it('增加修炼进度', () => {
            gameState.spiritEnergy = 500;
            gameState.cultivationProgress = 50;
            const result = service.resonate({ element: 'wood' });
            expect(gameState.cultivationProgress).toBeGreaterThan(50);
        });

        it('更新共鸣状态', () => {
            gameState.spiritEnergy = 500;
            service.resonate({ element: 'wood' });
            expect(gameState.yinYangWuXing.resonateState.active).toBe(true);
            expect(gameState.yinYangWuXing.resonateState.chain).toBeDefined();
        });

        it('应记录历史', () => {
            gameState.spiritEnergy = 500;
            service.resonate({ element: 'wood' });
            expect(gameState.yinYangWuXing.history.some(h => h.action === 'resonate')).toBe(true);
        });

        it('返回共鸣链描述', () => {
            gameState.spiritEnergy = 500;
            const result = service.resonate({ element: 'wood' });
            expect(result.chainDescription).toBeDefined();
            expect(result.chainDescription).toContain('木');
        });

        it('共鸣后返回bonus值', () => {
            gameState.spiritEnergy = 500;
            const result = service.resonate({ element: 'wood' });
            expect(result.bonus).toBeGreaterThan(0);
        });
    });

    // ===== wuxing.cycle 测试 =====

    describe('wuxing.cycle', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('成功驱动五行轮转', () => {
            gameState.spiritEnergy = 1000;
            const result = service.cycle({ rounds: 2 });
            expect(result.success).toBe(true);
            expect(result.action).toBe('wuxing.cycle');
        });

        it('周数必须在1-5之间', () => {
            gameState.spiritEnergy = 1000;
            const result1 = service.cycle({ rounds: 0 });
            expect(result1.success).toBe(false);
            const result2 = service.cycle({ rounds: 6 });
            expect(result2.success).toBe(false);
        });

        it('灵力不足返回错误', () => {
            gameState.spiritEnergy = 10;
            const result = service.cycle({ rounds: 2 });
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵力不足');
        });

        it('消耗灵力', () => {
            gameState.spiritEnergy = 1000;
            service.cycle({ rounds: 2 });
            expect(gameState.spiritEnergy).toBeLessThan(1000);
        });

        it('凝聚灵气', () => {
            gameState.spiritEnergy = 1000;
            gameState.qi = 100;
            service.cycle({ rounds: 2 });
            expect(gameState.qi).toBeGreaterThan(100);
        });

        it('从最弱元素开始轮转', () => {
            gameState.spiritEnergy = 1000;
            gameState.yinYangWuXing.fiveElements = { metal: 5, wood: 50, water: 10, fire: 10, earth: 10 };
            const result = service.cycle({ rounds: 1 });
            expect(result.startElement).toBe('metal');
        });

        it('轮转结果包含每个回合详情', () => {
            gameState.spiritEnergy = 1000;
            const result = service.cycle({ rounds: 3 });
            expect(result.cycleResults).toBeDefined();
            expect(result.cycleResults.length).toBe(3);
        });

        it('更新轮转状态', () => {
            gameState.spiritEnergy = 1000;
            service.cycle({ rounds: 2 });
            expect(gameState.yinYangWuXing.cycleState.active).toBe(true);
            expect(gameState.yinYangWuXing.cycleState.rounds).toBe(2);
        });

        it('应记录历史', () => {
            gameState.spiritEnergy = 1000;
            service.cycle({ rounds: 2 });
            expect(gameState.yinYangWuXing.history.some(h => h.action === 'cycle')).toBe(true);
        });

        it('返回总消耗和总产出', () => {
            gameState.spiritEnergy = 1000;
            const result = service.cycle({ rounds: 2 });
            expect(result.totalConsumed).toBeDefined();
            expect(result.totalGenerated).toBeDefined();
            expect(result.qiGained).toBeDefined();
        });

        it('默认rounds为1', () => {
            gameState.spiritEnergy = 1000;
            const result = service.cycle({});
            expect(result.rounds).toBe(1);
        });
    });

    // ===== wuxing.affinity 测试 =====

    describe('wuxing.affinity', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('成功提升元素亲和', () => {
            gameState.spiritEnergy = 1000;
            gameState.spiritStones = 1000;
            const result = service.affinity({ element: 'fire', level: 1 });
            expect(result.success).toBe(true);
            expect(result.action).toBe('wuxing.affinity');
        });

        it('亲和等级提升', () => {
            gameState.spiritEnergy = 1000;
            gameState.spiritStones = 1000;
            gameState.yinYangWuXing.affinity.fire = 2;
            service.affinity({ element: 'fire', level: 1 });
            expect(gameState.yinYangWuXing.affinity.fire).toBe(3);
        });

        it('灵力不足返回错误', () => {
            gameState.spiritEnergy = 10;
            gameState.spiritStones = 1000;
            const result = service.affinity({ element: 'fire', level: 1 });
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵力不足');
        });

        it('灵石不足返回错误', () => {
            gameState.spiritEnergy = 1000;
            gameState.spiritStones = 10;
            const result = service.affinity({ element: 'fire', level: 1 });
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });

        it('无效元素返回错误', () => {
            gameState.spiritEnergy = 1000;
            gameState.spiritStones = 1000;
            const result = service.affinity({ element: 'invalid', level: 1 });
            expect(result.success).toBe(false);
        });

        it('等级无效返回错误', () => {
            gameState.spiritEnergy = 1000;
            gameState.spiritStones = 1000;
            const result1 = service.affinity({ element: 'fire', level: 0 });
            expect(result1.success).toBe(false);
            const result2 = service.affinity({ element: 'fire', level: 4 });
            expect(result2.success).toBe(false);
        });

        it('已达上限返回错误', () => {
            gameState.spiritEnergy = 1000;
            gameState.spiritStones = 1000;
            gameState.yinYangWuXing.affinity.fire = 9;
            const result = service.affinity({ element: 'fire', level: 1 });
            expect(result.success).toBe(false);
            expect(result.error).toContain('已达上限');
        });

        it('消耗灵力', () => {
            gameState.spiritEnergy = 1000;
            gameState.spiritStones = 1000;
            service.affinity({ element: 'fire', level: 1 });
            expect(gameState.spiritEnergy).toBeLessThan(1000);
        });

        it('消耗灵石', () => {
            gameState.spiritEnergy = 1000;
            gameState.spiritStones = 1000;
            service.affinity({ element: 'fire', level: 1 });
            expect(gameState.spiritStones).toBeLessThan(1000);
        });

        it('应记录历史', () => {
            gameState.spiritEnergy = 1000;
            gameState.spiritStones = 1000;
            service.affinity({ element: 'fire', level: 1 });
            expect(gameState.yinYangWuXing.history.some(h => h.action === 'affinity')).toBe(true);
        });

        it('返回新旧亲和等级', () => {
            gameState.spiritEnergy = 1000;
            gameState.spiritStones = 1000;
            gameState.yinYangWuXing.affinity.fire = 2;
            const result = service.affinity({ element: 'fire', level: 1 });
            expect(result.oldAffinity).toBe(2);
            expect(result.newAffinity).toBe(3);
        });

        it('默认level为1', () => {
            gameState.spiritEnergy = 1000;
            gameState.spiritStones = 1000;
            const result = service.affinity({ element: 'wood' });
            expect(result.level).toBe(1);
        });
    });

    // ===== 辅助方法测试 =====

    describe('辅助方法', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        describe('getYinYangStateDesc', () => {
            it('返回正确描述', () => {
                expect(service.getYinYangStateDesc(YIN_YANG_STATES.BALANCED)).toBe('阴阳平衡');
                expect(service.getYinYangStateDesc(YIN_YANG_STATES.YIN_EXCESS)).toBe('阴盛阳衰');
                expect(service.getYinYangStateDesc(YIN_YANG_STATES.YANG_EXCESS)).toBe('阳盛阴衰');
            });
        });

        describe('calculateFiveElementsBalance', () => {
            it('标准差<=5返回balanced', () => {
                const elements = { metal: 20, wood: 20, water: 20, fire: 20, earth: 20 };
                expect(service.calculateFiveElementsBalance(elements)).toBe('balanced');
            });

            it('标准差>30返回severe_imbalance', () => {
                const elements = { metal: 5, wood: 80, water: 5, fire: 5, earth: 5 };
                expect(service.calculateFiveElementsBalance(elements)).toBe('severe_imbalance');
            });
        });

        describe('calculateResonanceChain', () => {
            it('木生成正确的相生链', () => {
                const chain = service.calculateResonanceChain('wood');
                expect(chain[0]).toBe('wood');
                expect(chain[chain.length - 1]).toBe('water');
            });

            it('链长度不超过5', () => {
                const chain = service.calculateResonanceChain('metal');
                expect(chain.length).toBeLessThanOrEqual(5);
            });
        });

        describe('getChainDescription', () => {
            it('返回中文描述', () => {
                const desc = service.getChainDescription(['metal', 'water', 'wood']);
                expect(desc).toContain('金');
                expect(desc).toContain('水');
                expect(desc).toContain('木');
            });
        });

        describe('getSpiritRootInfluence', () => {
            it('返回灵根影响', () => {
                const influence = service.getSpiritRootInfluence();
                expect(influence).toBeDefined();
                expect(influence.type).toBe('wood');
            });

            it('无灵根时返回null', () => {
                delete gameState.spiritRoot;
                const influence = service.getSpiritRootInfluence();
                expect(influence).toBeNull();
            });
        });

        describe('getRecommendedElements', () => {
            it('返回推荐元素', () => {
                gameState.yinYangWuXing.affinity = { metal: 6, wood: 0, water: 0, fire: 0, earth: 0 };
                const recommendations = service.getRecommendedElements();
                expect(Array.isArray(recommendations)).toBe(true);
            });
        });

        describe('getWarning', () => {
            it('阴阳严重失衡时返回警告', () => {
                gameState.yinYangWuXing.yin = 90;
                gameState.yinYangWuXing.yang = 10;
                const warnings = service.getWarning();
                expect(warnings.length).toBeGreaterThan(0);
            });
        });

        describe('recordHistory', () => {
            it('记录历史事件', () => {
                service.recordHistory('test_action', { detail: 'test' });
                expect(gameState.yinYangWuXing.history.length).toBe(1);
                expect(gameState.yinYangWuXing.history[0].action).toBe('test_action');
            });

            it('历史记录不超过50条', () => {
                for (let i = 0; i < 60; i++) {
                    service.recordHistory(`action_${i}`, {});
                }
                expect(gameState.yinYangWuXing.history.length).toBeLessThanOrEqual(50);
            });
        });
    });

    // ===== 常量测试 =====

    describe('常量', () => {
        it('FIVE_ELEMENTS包含5个元素', () => {
            expect(Object.keys(FIVE_ELEMENTS).length).toBe(5);
        });

        it('WUXING_GENERATION相生关系正确', () => {
            expect(WUXING_GENERATION.metal).toBe('water');
            expect(WUXING_GENERATION.wood).toBe('fire');
            expect(WUXING_GENERATION.water).toBe('wood');
            expect(WUXING_GENERATION.fire).toBe('earth');
            expect(WUXING_GENERATION.earth).toBe('metal');
        });

        it('WUXING_CONQUEST相克关系正确', () => {
            expect(WUXING_CONQUEST.metal).toBe('wood');
            expect(WUXING_CONQUEST.wood).toBe('earth');
            expect(WUXING_CONQUEST.earth).toBe('water');
            expect(WUXING_CONQUEST.water).toBe('fire');
            expect(WUXING_CONQUEST.fire).toBe('metal');
        });

        it('YIN_YANG_STATES包含4个状态', () => {
            expect(Object.keys(YIN_YANG_STATES).length).toBe(4);
        });

        it('YIN_YANG_WUXING_CONFIG配置正确', () => {
            expect(YIN_YANG_WUXING_CONFIG.affinityRange.max).toBe(9);
            expect(YIN_YANG_WUXING_CONFIG.resonateCost).toBe(100);
            expect(YIN_YANG_WUXING_CONFIG.cycleCost).toBe(150);
        });

        it('YIN_YANG_WUXING_TOOLS包含6个工具', () => {
            expect(Object.keys(YIN_YANG_WUXING_TOOLS).length).toBe(6);
            expect(YIN_YANG_WUXING_TOOLS['wuxing.analyze']).toBeDefined();
            expect(YIN_YANG_WUXING_TOOLS['wuxing.balance']).toBeDefined();
            expect(YIN_YANG_WUXING_TOOLS['wuxing.imbue']).toBeDefined();
            expect(YIN_YANG_WUXING_TOOLS['wuxing.resonate']).toBeDefined();
            expect(YIN_YANG_WUXING_TOOLS['wuxing.cycle']).toBeDefined();
            expect(YIN_YANG_WUXING_TOOLS['wuxing.affinity']).toBeDefined();
        });
    });

    // ===== 工厂函数测试 =====

    describe('工厂函数', () => {
        it('createYinYangWuXingService返回服务实例', () => {
            const svc = createYinYangWuXingService(gameState);
            expect(svc).toBeInstanceOf(YinYangWuXingService);
        });

        it('getYinYangWuXingService初始化并返回服务', () => {
            const svc = getYinYangWuXingService(gameState);
            expect(svc).toBeInstanceOf(YinYangWuXingService);
            expect(gameState.yinYangWuXing).toBeDefined();
        });

        it('getMCPHandlers返回正确的处理器映射', () => {
            const handlers = YinYangWuXingService.getMCPHandlers(gameState);
            expect(handlers['wuxing.analyze']).toBeDefined();
            expect(handlers['wuxing.balance']).toBeDefined();
            expect(handlers['wuxing.imbue']).toBeDefined();
            expect(handlers['wuxing.resonate']).toBeDefined();
            expect(handlers['wuxing.cycle']).toBeDefined();
            expect(handlers['wuxing.affinity']).toBeDefined();
        });

        it('MCP处理器可正常调用', () => {
            const handlers = YinYangWuXingService.getMCPHandlers(gameState);
            const result = handlers['wuxing.analyze']({});
            expect(result.success).toBe(true);
        });
    });
});