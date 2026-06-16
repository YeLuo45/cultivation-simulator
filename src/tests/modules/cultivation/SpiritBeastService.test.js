/**
 * SpiritBeastService.test.js - TDD测试
 * V244: 仙宠进化系统测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
    SpiritBeastService,
    SPIRIT_BEAST_TIERS,
    TIER_ORDER,
    TIER_SKILLS,
    EVOLUTION_BRANCHES,
    EVOLUTION_ITEM_COSTS,
    SPIRIT_BEAST_BASE_STATS,
    createInitialSpiritBeastData,
    createSpiritBeast
} from '../../../../src/domains/cultivation/services/SpiritBeastService.js';

// ===== 测试辅助函数 =====

/**
 * 创建测试用gameState
 */
function createTestGameState(overrides = {}) {
    return {
        spiritBeastData: null,
        inventory: { items: [] },
        ...overrides
    };
}

// ===== 测试套件 =====

describe('SpiritBeastService', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createTestGameState();
        service = new SpiritBeastService(gameState);
    });

    // ===== 初始化测试 =====

    describe('initializeData', () => {
        it('应初始化spiritBeastData', () => {
            expect(gameState.spiritBeastData).not.toBeNull();
            expect(gameState.spiritBeastData.beasts).toEqual([]);
            expect(gameState.spiritBeastData.selectedBeastId).toBeNull();
            expect(gameState.spiritBeastData.totalBeastsOwned).toBe(0);
        });

        it('重复初始化不应覆盖已有数据', () => {
            service.acquireBeast('测试仙宠');
            service.initializeData();
            expect(gameState.spiritBeastData.beasts.length).toBe(1);
        });
    });

    // ===== 常量验证测试 =====

    describe('常量定义', () => {
        it('TIER_ORDER应有5个进化阶段', () => {
            expect(TIER_ORDER).toEqual(['幼年期', '成长期', '成熟期', '化形期', '神兽期']);
            expect(TIER_ORDER.length).toBe(5);
        });

        it('每个进化阶段应有正确的等级范围', () => {
            expect(SPIRIT_BEAST_TIERS['幼年期'].minLevel).toBe(1);
            expect(SPIRIT_BEAST_TIERS['幼年期'].maxLevel).toBe(10);
            expect(SPIRIT_BEAST_TIERS['成长期'].minLevel).toBe(11);
            expect(SPIRIT_BEAST_TIERS['成长期'].maxLevel).toBe(30);
            expect(SPIRIT_BEAST_TIERS['成熟期'].minLevel).toBe(31);
            expect(SPIRIT_BEAST_TIERS['成熟期'].maxLevel).toBe(60);
            expect(SPIRIT_BEAST_TIERS['化形期'].minLevel).toBe(61);
            expect(SPIRIT_BEAST_TIERS['化形期'].maxLevel).toBe(90);
            expect(SPIRIT_BEAST_TIERS['神兽期'].minLevel).toBe(91);
            expect(SPIRIT_BEAST_TIERS['神兽期'].maxLevel).toBe(999);
        });

        it('每个阶段应有进化材料', () => {
            for (const tier of TIER_ORDER) {
                expect(SPIRIT_BEAST_TIERS[tier].evolutionItems).toBeDefined();
                expect(Array.isArray(SPIRIT_BEAST_TIERS[tier].evolutionItems)).toBe(true);
            }
        });

        it('TIER_SKILLS每个阶段应有正确的技能', () => {
            expect(TIER_SKILLS['幼年期']).toEqual([]);
            expect(TIER_SKILLS['成长期']).toContain('灵视');
            expect(TIER_SKILLS['成熟期']).toContain('灵风');
            expect(TIER_SKILLS['化形期']).toContain('仙风');
            expect(TIER_SKILLS['神兽期']).toContain('神佑');
        });

        it('EVOLUTION_BRANCHES每个阶段应有2-3条分支', () => {
            for (const tier of TIER_ORDER.slice(0, -1)) { // 除了神兽期
                expect(EVOLUTION_BRANCHES[tier].length).toBeGreaterThanOrEqual(2);
                expect(EVOLUTION_BRANCHES[tier].length).toBeLessThanOrEqual(3);
            }
        });
    });

    // ===== 创建仙宠测试 =====

    describe('createSpiritBeast', () => {
        it('应创建具有正确默认值的仙宠', () => {
            const beast = createSpiritBeast('测试仙宠');
            
            expect(beast.id).toBeDefined();
            expect(beast.name).toBe('测试仙宠');
            expect(beast.tier).toBe('幼年期');
            expect(beast.level).toBe(1);
            expect(beast.exp).toBe(0);
            expect(beast.skills).toEqual([]);
            expect(beast.bloodlineRank).toBe('凡兽');
            expect(beast.bloodlineAwakened).toBe(false);
            expect(beast.bloodlineProgress).toBe(0);
            expect(beast.evolutionBranch).toBeNull();
        });

        it('应创建具有唯一ID', () => {
            const beast1 = createSpiritBeast('仙宠1');
            const beast2 = createSpiritBeast('仙宠2');
            expect(beast1.id).not.toBe(beast2.id);
        });

        it('应复制基础属性', () => {
            const beast = createSpiritBeast('测试仙宠');
            expect(beast.stats).toEqual(SPIRIT_BEAST_BASE_STATS);
        });
    });

    describe('createInitialSpiritBeastData', () => {
        it('应创建正确的初始数据结构', () => {
            const data = createInitialSpiritBeastData();
            
            expect(data.beasts).toEqual([]);
            expect(data.selectedBeastId).toBeNull();
            expect(data.totalBeastsOwned).toBe(0);
        });
    });

    // ===== 获得仙宠测试 =====

    describe('acquireBeast', () => {
        it('应成功获得仙宠', () => {
            const result = service.acquireBeast('小火狐');
            
            expect(result.success).toBe(true);
            expect(result.beast).toBeDefined();
            expect(result.beast.name).toBe('小火狐');
            expect(gameState.spiritBeastData.beasts.length).toBe(1);
            expect(gameState.spiritBeastData.totalBeastsOwned).toBe(1);
        });

        it('第一只仙宠应自动选中', () => {
            const result = service.acquireBeast('第一只');
            
            expect(result.success).toBe(true);
            expect(gameState.spiritBeastData.selectedBeastId).toBe(result.beast.id);
            expect(result.beast.isSelected).toBe(true);
        });

        it('应触发beastAcquired钩子', () => {
            let hookCalled = false;
            let capturedBeast = null;
            service.registerHook('beastAcquired', (data) => {
                hookCalled = true;
                capturedBeast = data.beast;
            });
            
            const result = service.acquireBeast('测试');
            
            expect(hookCalled).toBe(true);
            expect(capturedBeast.name).toBe('测试');
        });

        it('应支持指定类型', () => {
            const result = service.acquireBeast('力量熊', 'beast_type_b');
            expect(result.beast.type).toBe('beast_type_b');
        });
    });

    // ===== 选择仙宠测试 =====

    describe('selectBeast', () => {
        it('应成功选择仙宠', () => {
            const beast1 = service.acquireBeast('仙宠1').beast;
            const beast2 = service.acquireBeast('仙宠2').beast;
            
            const result = service.selectBeast(beast2.id);
            
            expect(result.success).toBe(true);
            expect(gameState.spiritBeastData.selectedBeastId).toBe(beast2.id);
            expect(beast2.isSelected).toBe(true);
            expect(beast1.isSelected).toBe(false);
        });

        it('选择不存在的仙宠应返回错误', () => {
            const result = service.selectBeast('non_existent_id');
            expect(result.success).toBe(false);
            expect(result.error).toBe('仙宠不存在');
        });
    });

    // ===== 进化测试 =====

    describe('canEvolve', () => {
        it('等级不足时应返回错误', () => {
            const beast = service.acquireBeast('测试').beast;
            beast.level = 5; // 幼年期需要10级
            
            const result = service.canEvolve(beast.id);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('等级不足');
            expect(result.requiredLevel).toBe(10);
        });

        it('材料不足时应返回错误', () => {
            const beast = service.acquireBeast('测试').beast;
            beast.level = 10;
            // 没有添加进化材料
            
            const result = service.canEvolve(beast.id);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('材料不足');
        });

        it('已到达最高阶段应返回错误', () => {
            const beast = service.acquireBeast('测试').beast;
            beast.tier = '神兽期';
            beast.level = 100;
            
            const result = service.canEvolve(beast.id);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('最高');
        });

        it('材料足够时应返回成功', () => {
            const beast = service.acquireBeast('测试').beast;
            beast.level = 10;
            gameState.inventory.items.push({ name: '灵兽蛋', quantity: 1 });
            
            const result = service.canEvolve(beast.id);
            
            expect(result.success).toBe(true);
        });

        it('成长期及以上需要选择分支', () => {
            const beast = service.acquireBeast('测试').beast;
            beast.level = 30;
            gameState.inventory.items.push(
                { name: '进化丹', quantity: 1 },
                { name: '灵草', quantity: 2 }
            );
            
            const result = service.canEvolve(beast.id);
            
            expect(result.success).toBe(false);
            expect(result.requiresBranch).toBe(true);
            expect(result.availableBranches).toBeDefined();
        });
    });

    describe('evolveBeast', () => {
        it('应成功进化仙宠', () => {
            const beast = service.acquireBeast('测试').beast;
            beast.level = 10;
            gameState.inventory.items.push({ name: '灵兽蛋', quantity: 1 });
            
            const result = service.evolveBeast(beast.id);
            
            expect(result.success).toBe(true);
            expect(result.beast.tier).toBe('成长期');
            expect(result.oldTier).toBe('幼年期');
            expect(result.newTier).toBe('成长期');
        });

        it('应消耗进化材料', () => {
            const beast = service.acquireBeast('测试').beast;
            beast.level = 10;
            gameState.inventory.items.push({ name: '灵兽蛋', quantity: 1 });
            
            service.evolveBeast(beast.id);
            
            const hasItem = gameState.inventory.items.some(item => item.name === '灵兽蛋');
            expect(hasItem).toBe(false);
        });

        it('应解锁新技能', () => {
            const beast = service.acquireBeast('测试').beast;
            beast.level = 10;
            gameState.inventory.items.push({ name: '灵兽蛋', quantity: 1 });
            
            const result = service.evolveBeast(beast.id);
            
            expect(result.unlockedSkills).toContain('灵视');
            expect(beast.skills).toContain('灵视');
        });

        it('应重置等级为新阶段最低等级', () => {
            const beast = service.acquireBeast('测试').beast;
            beast.level = 10;
            gameState.inventory.items.push({ name: '灵兽蛋', quantity: 1 });
            
            service.evolveBeast(beast.id);
            
            expect(beast.level).toBe(SPIRIT_BEAST_TIERS['成长期'].minLevel);
        });

        it('应触发beastEvolved钩子', () => {
            const beast = service.acquireBeast('测试').beast;
            beast.level = 10;
            gameState.inventory.items.push({ name: '灵兽蛋', quantity: 1 });
            
            let hookCalled = false;
            service.registerHook('beastEvolved', (data) => {
                hookCalled = true;
                expect(data.oldTier).toBe('幼年期');
                expect(data.newTier).toBe('成长期');
            });
            
            service.evolveBeast(beast.id);
            
            expect(hookCalled).toBe(true);
        });

        it('应应用进化分支属性', () => {
            const beast = service.acquireBeast('测试').beast;
            beast.level = 30;
            gameState.inventory.items.push(
                { name: '进化丹', quantity: 1 },
                { name: '灵草', quantity: 2 }
            );
            
            const result = service.evolveBeast(beast.id, 'fierce');
            
            expect(beast.evolutionBranch).toBe('fierce');
            expect(beast.stats.attack).toBeGreaterThan(SPIRIT_BEAST_BASE_STATS.attack);
        });

        it('条件不满足应返回错误', () => {
            const beast = service.acquireBeast('测试').beast;
            
            const result = service.evolveBeast(beast.id);
            
            expect(result.success).toBe(false);
        });
    });

    // ===== 经验值测试 =====

    describe('gainExp', () => {
        it('应增加经验值', () => {
            const beast = service.acquireBeast('测试').beast;
            
            const result = service.gainExp(beast.id, 50);
            
            expect(result.success).toBe(true);
            expect(result.expGained).toBe(50);
            expect(beast.exp).toBe(50);
        });

        it('经验足够时应升级', () => {
            const beast = service.acquireBeast('测试').beast;
            beast.expToNextLevel = 10;
            
            const result = service.gainExp(beast.id, 20);
            
            expect(result.leveledUp).toBe(true);
            expect(result.totalLevelsGained).toBe(2);
            expect(beast.level).toBe(3);
        });

        it('应触发beastLevelUp钩子', () => {
            const beast = service.acquireBeast('测试').beast;
            beast.expToNextLevel = 10;
            
            let hookCount = 0;
            service.registerHook('beastLevelUp', () => { hookCount++; });
            
            service.gainExp(beast.id, 30);
            
            expect(hookCount).toBe(3);
        });

        it('不存在的仙宠应返回错误', () => {
            const result = service.gainExp('non_existent', 50);
            expect(result.success).toBe(false);
            expect(result.error).toContain('不存在');
        });
    });

    // ===== 查询测试 =====

    describe('getBeastById', () => {
        it('应返回正确的仙宠', () => {
            const created = service.acquireBeast('测试').beast;
            
            const found = service.getBeastById(created.id);
            
            expect(found).toBeDefined();
            expect(found.name).toBe('测试');
        });

        it('不存在的ID应返回null', () => {
            const found = service.getBeastById('non_existent');
            expect(found).toBeNull();
        });
    });

    describe('getSelectedBeast', () => {
        it('无选中仙宠应返回null', () => {
            expect(service.getSelectedBeast()).toBeNull();
        });

        it('应返回选中的仙宠', () => {
            const beast = service.acquireBeast('测试').beast;
            
            expect(service.getSelectedBeast()).toEqual(beast);
        });
    });

    describe('getEvolutionInfo', () => {
        it('应返回完整的进化信息', () => {
            const beast = service.acquireBeast('测试').beast;
            
            const info = service.getEvolutionInfo(beast.id);
            
            expect(info.success).toBe(true);
            expect(info.currentTier).toBe('幼年期');
            expect(info.nextTier).toBe('成长期');
            expect(info.levelProgress).toBeDefined();
            expect(info.evolutionItems).toBeDefined();
            expect(info.itemCosts).toBeDefined();
        });

        it('最高阶段nextTier应为null', () => {
            const beast = service.acquireBeast('测试').beast;
            beast.tier = '神兽期';
            
            const info = service.getEvolutionInfo(beast.id);
            
            expect(info.nextTier).toBeNull();
        });
    });

    describe('getAllTiers', () => {
        it('应返回所有进化阶段', () => {
            const tiers = service.getAllTiers();
            
            expect(tiers.length).toBe(5);
            expect(tiers[0].name).toBe('幼年期');
            expect(tiers[4].name).toBe('神兽期');
        });
    });

    describe('getBeastPower', () => {
        it('应计算正确的战斗力', () => {
            const beast = service.acquireBeast('测试').beast;
            
            const power = service.getBeastPower(beast.id);
            
            expect(power).toBeGreaterThan(0);
        });

        it('进化阶段越高战斗力越高', () => {
            const beast1 = service.acquireBeast('仙宠1').beast;
            beast1.tier = '成长期';
            beast1.level = 15;
            
            const beast2 = service.acquireBeast('仙宠2').beast;
            beast2.tier = '幼年期';
            beast2.level = 5;
            
            expect(service.getBeastPower(beast1.id)).toBeGreaterThan(service.getBeastPower(beast2.id));
        });
    });

    describe('getBeastPowerRanking', () => {
        it('应返回战力排序', () => {
            service.acquireBeast('仙宠1');
            service.acquireBeast('仙宠2');
            
            const ranking = service.getBeastPowerRanking();
            
            expect(ranking.length).toBe(2);
            expect(ranking[0].power).toBeGreaterThanOrEqual(ranking[1].power);
        });
    });

    // ===== Hook系统测试 =====

    describe('Hook系统', () => {
        it('registerHook应成功注册钩子', () => {
            const result = service.registerHook('testHook', () => {});
            expect(result.success).toBe(true);
            expect(result.hookId).toBeDefined();
            expect(result.type).toBe('testHook');
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
            service.acquireBeast('测试');
            
            const data = service.serialize();
            
            expect(data.spiritBeastData).toBeDefined();
            expect(data.spiritBeastData.beasts.length).toBe(1);
        });
    });

    describe('deserialize', () => {
        it('应正确反序列化数据', () => {
            service.acquireBeast('仙宠1');
            service.acquireBeast('仙宠2');
            
            const savedData = service.serialize();
            
            // 创建新的service实例并反序列化
            const newGameState = createTestGameState();
            const newService = new SpiritBeastService(newGameState);
            newService.deserialize(savedData);
            
            expect(newGameState.spiritBeastData.beasts.length).toBe(2);
        });

        it('空数据不应报错', () => {
            const newGameState = createTestGameState();
            const newService = new SpiritBeastService(newGameState);
            
            newService.deserialize({});
            
            expect(newGameState.spiritBeastData).toBeDefined();
        });
    });
});