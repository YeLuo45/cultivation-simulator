/**
 * BloodlineService.test.js - TDD测试
 * V244: 血脉天赋系统测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
    BloodlineService,
    BLOODLINE_RANKS,
    BLOODLINE_ORDER,
    BLOODLINE_TYPES,
    BLOODLINE_ESSENCE_ITEM,
    AWAKENING_ITEMS
} from '../../../../src/domains/cultivation/services/BloodlineService.js';

// ===== 测试辅助函数 =====

/**
 * 创建测试用gameState
 */
function createTestGameState(overrides = {}) {
    return {
        spiritBeastData: {
            beasts: [],
            selectedBeastId: null,
            totalBeastsOwned: 0
        },
        bloodlineData: null,
        inventory: { items: [] },
        ...overrides
    };
}

/**
 * 创建测试用仙宠
 */
function createTestBeast(gameState, overrides = {}) {
    const beast = {
        id: `beast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: '测试仙宠',
        type: 'beast_type_a',
        tier: '幼年期',
        level: 1,
        exp: 0,
        expToNextLevel: 100,
        skills: [],
        bloodlineRank: '凡兽',
        bloodlineAwakened: false,
        bloodlineProgress: 0,
        bloodlineType: null,
        stats: {
            attack: 5,
            defense: 5,
            health: 50,
            spiritual: 10,
            agility: 8,
            critRate: 1
        },
        evolutionBranch: null,
        isSelected: false,
        createdAt: Date.now(),
        ...overrides
    };
    
    gameState.spiritBeastData.beasts.push(beast);
    return beast;
}

// ===== 测试套件 =====

describe('BloodlineService', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createTestGameState();
        service = new BloodlineService(gameState);
    });

    // ===== 初始化测试 =====

    describe('initializeData', () => {
        it('应初始化bloodlineData', () => {
            expect(gameState.bloodlineData).not.toBeNull();
            expect(gameState.bloodlineData.bloodlineEssence).toBe(0);
            expect(gameState.bloodlineData.totalEssenceEarned).toBe(0);
            expect(gameState.bloodlineData.resonancePairs).toEqual([]);
        });

        it('重复初始化不应覆盖已有数据', () => {
            service.gainBloodlineEssence(100);
            service.initializeData();
            expect(gameState.bloodlineData.bloodlineEssence).toBe(100);
        });
    });

    // ===== 常量验证测试 =====

    describe('常量定义', () => {
        it('BLOODLINE_ORDER应有4个血脉等级', () => {
            expect(BLOODLINE_ORDER).toEqual(['凡兽', '灵兽', '仙兽', '神兽']);
            expect(BLOODLINE_ORDER.length).toBe(4);
        });

        it('血脉倍率应递增', () => {
            expect(BLOODLINE_RANKS['凡兽'].multiplier).toBe(1.0);
            expect(BLOODLINE_RANKS['灵兽'].multiplier).toBe(1.5);
            expect(BLOODLINE_RANKS['仙兽'].multiplier).toBe(2.0);
            expect(BLOODLINE_RANKS['神兽'].multiplier).toBe(3.0);
        });

        it('每个血脉等级应有正确的技能', () => {
            expect(BLOODLINE_RANKS['凡兽'].bonusSkills).toEqual([]);
            expect(BLOODLINE_RANKS['灵兽'].bonusSkills).toContain('灵视');
            expect(BLOODLINE_RANKS['仙兽'].bonusSkills).toContain('仙风');
            expect(BLOODLINE_RANKS['神兽'].bonusSkills).toContain('神佑');
        });

        it('每个血脉等级应有正确的觉醒费用', () => {
            expect(BLOODLINE_RANKS['凡兽'].awakeningCost).toBe(0);
            expect(BLOODLINE_RANKS['灵兽'].awakeningCost).toBe(50);
            expect(BLOODLINE_RANKS['仙兽'].awakeningCost).toBe(200);
            expect(BLOODLINE_RANKS['神兽'].awakeningCost).toBe(1000);
        });

        it('每个血脉等级应有正确的进度要求', () => {
            expect(BLOODLINE_RANKS['凡兽'].requiredProgress).toBe(0);
            expect(BLOODLINE_RANKS['灵兽'].requiredProgress).toBe(100);
            expect(BLOODLINE_RANKS['仙兽'].requiredProgress).toBe(500);
            expect(BLOODLINE_RANKS['神兽'].requiredProgress).toBe(2000);
        });

        it('应有6种血脉类型', () => {
            expect(Object.keys(BLOODLINE_TYPES)).toHaveLength(6);
            expect(BLOODLINE_TYPES['火焰血脉']).toBeDefined();
            expect(BLOODLINE_TYPES['寒冰血脉']).toBeDefined();
            expect(BLOODLINE_TYPES['雷霆血脉']).toBeDefined();
            expect(BLOODLINE_TYPES['大地血脉']).toBeDefined();
            expect(BLOODLINE_TYPES['风灵血脉']).toBeDefined();
            expect(BLOODLINE_TYPES['自然血脉']).toBeDefined();
        });

        it('每种血脉类型应有元素和加成', () => {
            for (const [name, config] of Object.entries(BLOODLINE_TYPES)) {
                expect(config.element).toBeDefined();
                expect(config.bonus).toBeDefined();
                expect(config.bonus.attack || config.bonus.defense || config.bonus.health || 
                       config.bonus.spiritual || config.bonus.agility).toBeDefined();
            }
        });
    });

    // ===== 血脉精华测试 =====

    describe('gainBloodlineEssence', () => {
        it('应增加血脉精华', () => {
            const result = service.gainBloodlineEssence(100, 'battle');
            
            expect(result.success).toBe(true);
            expect(result.gained).toBe(100);
            expect(gameState.bloodlineData.bloodlineEssence).toBe(100);
        });

        it('应累加累计获得量', () => {
            service.gainBloodlineEssence(50);
            service.gainBloodlineEssence(30);
            
            expect(gameState.bloodlineData.totalEssenceEarned).toBe(80);
        });

        it('应触发钩子', () => {
            let hookCalled = false;
            service.registerHook('bloodlineEssenceGained', (data) => {
                hookCalled = true;
                expect(data.amount).toBe(50);
            });
            
            service.gainBloodlineEssence(50);
            
            expect(hookCalled).toBe(true);
        });
    });

    describe('consumeBloodlineEssence', () => {
        it('应消耗血脉精华', () => {
            service.gainBloodlineEssence(100);
            
            const result = service.consumeBloodlineEssence(30);
            
            expect(result.success).toBe(true);
            expect(result.consumed).toBe(30);
            expect(result.remaining).toBe(70);
        });

        it('不足时应返回错误', () => {
            const result = service.consumeBloodlineEssence(100);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('不足');
        });
    });

    // ===== 血脉觉醒测试 =====

    describe('canAwaken', () => {
        let beast;

        beforeEach(() => {
            beast = createTestBeast(gameState);
        });

        it('血脉进度不足时应返回错误', () => {
            service.gainBloodlineEssence(100);
            
            const result = service.canAwaken(beast.id);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('进度不足');
        });

        it('血脉精华不足时应返回错误', () => {
            beast.bloodlineProgress = 100;
            
            const result = service.canAwaken(beast.id);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('精华不足');
        });

        it('血脉已觉醒应返回错误', () => {
            beast.bloodlineAwakened = true;
            beast.bloodlineProgress = 100;
            service.gainBloodlineEssence(50);
            
            const result = service.canAwaken(beast.id);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('已觉醒');
        });

        it('已达最高血脉等级应返回错误', () => {
            beast.bloodlineRank = '神兽';
            beast.bloodlineProgress = 2000;
            service.gainBloodlineEssence(1000);
            
            const result = service.canAwaken(beast.id);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('最高');
        });

        it('所有条件满足时应返回成功', () => {
            beast.bloodlineProgress = 100;
            service.gainBloodlineEssence(50);
            
            const result = service.canAwaken(beast.id);
            
            expect(result.success).toBe(true);
        });
    });

    describe('awakenBloodline', () => {
        let beast;

        beforeEach(() => {
            beast = createTestBeast(gameState);
            beast.bloodlineProgress = 100;
            service.gainBloodlineEssence(50);
        });

        it('应成功觉醒血脉', () => {
            const result = service.awakenBloodline(beast.id);
            
            expect(result.success).toBe(true);
            expect(result.beast.bloodlineRank).toBe('灵兽');
            expect(result.beast.bloodlineAwakened).toBe(true);
        });

        it('应消耗血脉精华', () => {
            service.awakenBloodline(beast.id);
            
            expect(gameState.bloodlineData.bloodlineEssence).toBe(0);
        });

        it('应解锁血脉技能', () => {
            const result = service.awakenBloodline(beast.id);
            
            expect(result.unlockedSkills).toContain('灵视');
            expect(beast.skills).toContain('灵视');
        });

        it('应重置血脉进度', () => {
            service.awakenBloodline(beast.id);
            
            expect(beast.bloodlineProgress).toBe(0);
        });

        it('应触发bloodlineAwakened钩子', () => {
            let hookCalled = false;
            service.registerHook('bloodlineAwakened', (data) => {
                hookCalled = true;
                expect(data.oldRank).toBe('凡兽');
                expect(data.newRank).toBe('灵兽');
            });
            
            service.awakenBloodline(beast.id);
            
            expect(hookCalled).toBe(true);
        });

        it('应应用血脉类型加成', () => {
            const result = service.awakenBloodline(beast.id, '火焰血脉');
            
            expect(beast.bloodlineType).toBe('火焰血脉');
            expect(beast.stats.attack).toBeGreaterThan(5);
        });

        it('条件不满足应返回错误', () => {
            // 消耗掉精华
            gameState.bloodlineData.bloodlineEssence = 0;
            
            const result = service.awakenBloodline(beast.id);
            
            expect(result.success).toBe(false);
        });
    });

    // ===== 血脉进度测试 =====

    describe('addBloodlineProgress', () => {
        let beast;

        beforeEach(() => {
            beast = createTestBeast(gameState);
        });

        it('应增加血脉进度', () => {
            const result = service.addBloodlineProgress(beast.id, 30);
            
            expect(result.success).toBe(true);
            expect(result.added).toBe(30);
            expect(beast.bloodlineProgress).toBe(30);
        });

        it('不应超过最大值', () => {
            const result = service.addBloodlineProgress(beast.id, 200);
            
            expect(beast.bloodlineProgress).toBeLessThanOrEqual(100);
        });

        it('应返回正确的信息', () => {
            const result = service.addBloodlineProgress(beast.id, 30);
            
            expect(result.currentProgress).toBe(30);
            expect(result.maxProgress).toBe(100);
            expect(result.percentage).toBe(30);
        });

        it('不存在的仙宠应返回错误', () => {
            const result = service.addBloodlineProgress('non_existent', 30);
            
            expect(result.success).toBe(false);
        });
    });

    // ===== 血脉信息查询测试 =====

    describe('getBeastBloodlineInfo', () => {
        let beast;

        beforeEach(() => {
            beast = createTestBeast(gameState);
        });

        it('应返回完整的血脉信息', () => {
            const info = service.getBeastBloodlineInfo(beast.id);
            
            expect(info.success).toBe(true);
            expect(info.bloodlineRank).toBe('凡兽');
            expect(info.multiplier).toBe(1.0);
            expect(info.nextRank).toBe('灵兽');
            expect(info.availableBloodlineTypes).toHaveLength(6);
        });

        it('神兽期应无下一等级', () => {
            beast.bloodlineRank = '神兽';
            
            const info = service.getBeastBloodlineInfo(beast.id);
            
            expect(info.nextRank).toBeNull();
            expect(info.nextRankMultiplier).toBeNull();
        });
    });

    // ===== 血脉共鸣测试 =====

    describe('checkResonance', () => {
        let beast1, beast2;

        beforeEach(() => {
            beast1 = createTestBeast(gameState, { name: '仙宠1' });
            beast2 = createTestBeast(gameState, { name: '仙宠2' });
        });

        it('血脉类型不同应无共鸣', () => {
            beast1.bloodlineType = '火焰血脉';
            beast2.bloodlineType = '寒冰血脉';
            beast1.bloodlineAwakened = true;
            beast2.bloodlineAwakened = true;
            
            const result = service.checkResonance(beast1.id, beast2.id);
            
            expect(result.success).toBe(true);
            expect(result.hasResonance).toBe(false);
        });

        it('有仙宠未觉醒应无共鸣', () => {
            beast1.bloodlineType = '火焰血脉';
            beast2.bloodlineType = '火焰血脉';
            beast1.bloodlineAwakened = true;
            // beast2未觉醒
            
            const result = service.checkResonance(beast1.id, beast2.id);
            
            expect(result.hasResonance).toBe(false);
        });

        it('满足条件应有共鸣', () => {
            beast1.bloodlineType = '火焰血脉';
            beast2.bloodlineType = '火焰血脉';
            beast1.bloodlineAwakened = true;
            beast2.bloodlineAwakened = true;
            beast1.bloodlineRank = '灵兽';
            beast2.bloodlineRank = '灵兽';
            
            const result = service.checkResonance(beast1.id, beast2.id);
            
            expect(result.hasResonance).toBe(true);
            expect(result.bloodlineType).toBe('火焰血脉');
            expect(result.resonanceBonus).toBeGreaterThan(0);
        });

        it('共鸣加成应与血脉等级相关', () => {
            beast1.bloodlineType = '火焰血脉';
            beast2.bloodlineType = '火焰血脉';
            beast1.bloodlineAwakened = true;
            beast2.bloodlineAwakened = true;
            beast1.bloodlineRank = '神兽';
            beast2.bloodlineRank = '神兽';
            
            const result = service.checkResonance(beast1.id, beast2.id);
            
            // 神兽等级更高，共鸣加成更高
            expect(result.resonanceBonus).toBeGreaterThan(0);
        });
    });

    describe('createResonancePair', () => {
        let beast1, beast2;

        beforeEach(() => {
            beast1 = createTestBeast(gameState, { name: '仙宠1' });
            beast2 = createTestBeast(gameState, { name: '仙宠2' });
            beast1.bloodlineType = '火焰血脉';
            beast2.bloodlineType = '火焰血脉';
            beast1.bloodlineAwakened = true;
            beast2.bloodlineAwakened = true;
        });

        it('应成功创建共鸣配对', () => {
            const result = service.createResonancePair(beast1.id, beast2.id);
            
            expect(result.success).toBe(true);
            expect(result.pairId).toBeDefined();
            expect(result.bonus).toBeGreaterThan(0);
        });

        it('不应创建重复配对', () => {
            service.createResonancePair(beast1.id, beast2.id);
            
            const result = service.createResonancePair(beast1.id, beast2.id);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('已存在');
        });

        it('应触发resonanceCreated钩子', () => {
            let hookCalled = false;
            service.registerHook('resonanceCreated', () => {
                hookCalled = true;
            });
            
            service.createResonancePair(beast1.id, beast2.id);
            
            expect(hookCalled).toBe(true);
        });

        it('无法共鸣应返回错误', () => {
            beast2.bloodlineType = '寒冰血脉';
            
            const result = service.createResonancePair(beast1.id, beast2.id);
            
            expect(result.success).toBe(false);
        });
    });

    describe('removeResonancePair', () => {
        it('应成功移除共鸣配对', () => {
            const beast1 = createTestBeast(gameState, { name: '仙宠1' });
            const beast2 = createTestBeast(gameState, { name: '仙宠2' });
            beast1.bloodlineType = '火焰血脉';
            beast2.bloodlineType = '火焰血脉';
            beast1.bloodlineAwakened = true;
            beast2.bloodlineAwakened = true;
            
            const { pairId } = service.createResonancePair(beast1.id, beast2.id);
            
            const result = service.removeResonancePair(pairId);
            
            expect(result.success).toBe(true);
        });

        it('不存在的配对应返回错误', () => {
            const result = service.removeResonancePair('non_existent');
            
            expect(result.success).toBe(false);
        });
    });

    // ===== 共鸣加成计算测试 =====

    describe('calculateTotalResonanceBonus', () => {
        it('应返回所有配对加成的总和', () => {
            const beast1 = createTestBeast(gameState, { name: '仙宠1' });
            const beast2 = createTestBeast(gameState, { name: '仙宠2' });
            const beast3 = createTestBeast(gameState, { name: '仙宠3' });
            
            beast1.bloodlineType = '火焰血脉';
            beast2.bloodlineType = '火焰血脉';
            beast3.bloodlineType = '火焰血脉';
            beast1.bloodlineAwakened = true;
            beast2.bloodlineAwakened = true;
            beast3.bloodlineAwakened = true;
            
            service.createResonancePair(beast1.id, beast2.id);
            service.createResonancePair(beast1.id, beast3.id);
            
            const total = service.calculateTotalResonanceBonus();
            
            expect(total).toBeGreaterThan(0);
        });
    });

    describe('getBeastStatsWithBloodline', () => {
        it('应返回带血脉加成的属性', () => {
            const beast = createTestBeast(gameState);
            beast.bloodlineRank = '灵兽';
            beast.bloodlineAwakened = true;
            
            const stats = service.getBeastStatsWithBloodline(beast.id);
            
            expect(stats._multiplier).toBe(1.5);
            expect(stats._bloodlineRank).toBe('灵兽');
        });

        it('应包含共鸣加成', () => {
            const beast1 = createTestBeast(gameState, { name: '仙宠1' });
            const beast2 = createTestBeast(gameState, { name: '仙宠2' });
            
            beast1.bloodlineType = '火焰血脉';
            beast2.bloodlineType = '火焰血脉';
            beast1.bloodlineAwakened = true;
            beast2.bloodlineAwakened = true;
            
            service.createResonancePair(beast1.id, beast2.id);
            
            const stats = service.getBeastStatsWithBloodline(beast1.id);
            
            expect(stats._resonanceBonus).toBeGreaterThan(0);
        });

        it('不存在的仙宠应返回null', () => {
            const stats = service.getBeastStatsWithBloodline('non_existent');
            expect(stats).toBeNull();
        });
    });

    // ===== Hook系统测试 =====

    describe('Hook系统', () => {
        it('registerHook应成功注册钩子', () => {
            const result = service.registerHook('testHook', () => {});
            expect(result.success).toBe(true);
            expect(result.hookId).toBeDefined();
        });

        it('unregisterHook应成功注销钩子', () => {
            const { hookId } = service.registerHook('test', () => {});
            const result = service.unregisterHook(hookId);
            expect(result.success).toBe(true);
        });

        it('不存在的钩子注销应返回错误', () => {
            const result = service.unregisterHook(9999);
            expect(result.success).toBe(false);
        });

        it('triggerHook应触发匹配的钩子', () => {
            let count = 0;
            service.registerHook('count', () => { count++; });
            service.registerHook('count', () => { count++; });
            
            service.triggerHook('count', {});
            
            expect(count).toBe(2);
        });

        it('不匹配的钩子不应被触发', () => {
            let called = false;
            service.registerHook('other', () => { called = true; });
            
            service.triggerHook('different', {});
            
            expect(called).toBe(false);
        });

        it('listHooks应返回所有钩子', () => {
            service.registerHook('type1', () => {});
            service.registerHook('type2', () => {});
            
            const hooks = service.listHooks();
            
            expect(hooks.length).toBe(2);
        });
    });

    // ===== 序列化测试 =====

    describe('serialize', () => {
        it('应正确序列化数据', () => {
            service.gainBloodlineEssence(100);
            
            const data = service.serialize();
            
            expect(data.bloodlineData).toBeDefined();
            expect(data.bloodlineData.bloodlineEssence).toBe(100);
        });
    });

    describe('deserialize', () => {
        it('应正确反序列化数据', () => {
            service.gainBloodlineEssence(100);
            
            const savedData = service.serialize();
            
            const newGameState = createTestGameState();
            const newService = new BloodlineService(newGameState);
            newService.deserialize(savedData);
            
            expect(newGameState.bloodlineData.bloodlineEssence).toBe(100);
        });

        it('空数据不应报错', () => {
            const newGameState = createTestGameState();
            const newService = new BloodlineService(newGameState);
            
            newService.deserialize({});
            
            expect(newGameState.bloodlineData).toBeDefined();
        });
    });
});