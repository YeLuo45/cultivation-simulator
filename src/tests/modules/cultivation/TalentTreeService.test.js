/**
 * TalentTreeService.test.js - TDD测试
 * V224 Direction P: 灵根天赋系统测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
    TalentTreeService, 
    TALENT_BRANCHES, 
    BRANCH_NAMES, 
    MASTERY_ELEMENTS, 
    MASTERY_LEVELS,
    MASTERY_LEVEL_NAMES,
    MASTERY_EFFECT_MULTIPLIERS,
    LAYER_EFFECTS,
    POINTS_PER_LAYER,
    TALENT_RESET_ITEM,
    createInitialTalentData,
    createInitialMasteryData
} from '../../../../src/domains/cultivation/services/TalentTreeService.js';

// ===== 测试辅助函数 =====

/**
 * 创建测试用gameState
 */
function createTestGameState(overrides = {}) {
    return {
        spiritRoot: { type: 'wood', tier: 1 },
        realm: 0,
        talentData: null,
        masteryData: null,
        inventory: { items: [] },
        ...overrides
    };
}

// ===== 测试套件 =====

describe('TalentTreeService', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createTestGameState();
        service = new TalentTreeService(gameState);
    });

    // ===== 初始化测试 =====

    describe('initializeData', () => {
        it('应初始化talentData', () => {
            expect(gameState.talentData).not.toBeNull();
            expect(gameState.talentData.talentPoints).toBe(0);
            expect(gameState.talentData.talentTree).toBeDefined();
        });

        it('应初始化所有4个天赋分支', () => {
            for (const branch of TALENT_BRANCHES) {
                expect(gameState.talentData.talentTree[branch]).toBeDefined();
                expect(gameState.talentData.talentTree[branch].points).toBe(0);
                expect(gameState.talentData.talentTree[branch].layers).toBe(0);
            }
        });

        it('应初始化masteryData', () => {
            expect(gameState.masteryData).not.toBeNull();
            expect(gameState.masteryData.mastery).toBeDefined();
        });

        it('应初始化所有6种元素精通', () => {
            for (const element of MASTERY_ELEMENTS) {
                expect(gameState.masteryData.mastery[element]).toBeDefined();
                expect(gameState.masteryData.mastery[element].level).toBe(0);
                expect(gameState.masteryData.mastery[element].exp).toBe(0);
            }
        });
    });

    // ===== 天赋点获取测试 =====

    describe('gainTalentPoints', () => {
        it('应增加可用天赋点', () => {
            const result = service.gainTalentPoints(5, 'levelup');
            expect(result.success).toBe(true);
            expect(result.gained).toBe(5);
            expect(result.availablePoints).toBe(5);
        });

        it('应累加累计获得天赋点', () => {
            service.gainTalentPoints(3, 'levelup');
            service.gainTalentPoints(5, 'breakthrough');
            expect(gameState.talentData.totalTalentPointsEarned).toBe(8);
        });

        it('应触发talentPointsGained钩子', () => {
            let hookCalled = false;
            service.registerHook('talentPointsGained', (data) => {
                hookCalled = true;
                expect(data.amount).toBe(5);
            });
            service.gainTalentPoints(5, 'levelup');
            expect(hookCalled).toBe(true);
        });
    });

    describe('consumeTalentPoints', () => {
        it('应消耗天赋点', () => {
            service.gainTalentPoints(10);
            const result = service.consumeTalentPoints(3);
            expect(result.success).toBe(true);
            expect(result.consumed).toBe(3);
            expect(result.remaining).toBe(7);
        });

        it('天赋点不足时应返回错误', () => {
            const result = service.consumeTalentPoints(100);
            expect(result.success).toBe(false);
            expect(result.error).toBe('天赋点不足');
        });
    });

    // ===== 天赋分配测试 =====

    describe('allocateTalent', () => {
        beforeEach(() => {
            service.gainTalentPoints(20); // 提供足够的测试点
        });

        it('应成功分配第1层天赋', () => {
            const result = service.allocateTalent('attack', 1);
            expect(result.success).toBe(true);
            expect(result.branch).toBe('attack');
            expect(result.layer).toBe(1);
            expect(result.pointsUsed).toBe(1);
            expect(gameState.talentData.talentTree.attack.layers).toBe(1);
        });

        it('应成功分配多层天赋', () => {
            service.allocateTalent('attack', 1);
            const result = service.allocateTalent('attack', 2);
            expect(result.success).toBe(true);
            expect(result.layer).toBe(2);
            expect(result.pointsUsed).toBe(2);
        });

        it('无效分支应返回错误', () => {
            const result = service.allocateTalent('invalid', 1);
            expect(result.success).toBe(false);
            expect(result.error).toContain('无效分支');
        });

        it('层数超出范围应返回错误', () => {
            const result1 = service.allocateTalent('attack', 0);
            expect(result1.success).toBe(false);

            const result2 = service.allocateTalent('attack', 6);
            expect(result2.success).toBe(false);
        });

        it('重复分配已解锁层应返回错误', () => {
            service.allocateTalent('attack', 1);
            const result = service.allocateTalent('attack', 1);
            expect(result.success).toBe(false);
            expect(result.error).toContain('已解锁');
        });

        it('未满足前置条件应返回错误', () => {
            service.allocateTalent('attack', 1);
            const result = service.allocateTalent('attack', 3);
            expect(result.success).toBe(false);
            expect(result.error).toContain('必须先解锁');
        });

        it('天赋点不足应返回错误', () => {
            // Give exactly 2 points, which is enough for layer 1 (cost 1) but not layer 3 (cost 3)
            service.gainTalentPoints(2);
            service.allocateTalent('attack', 1); // uses 1 point, now have 1
            const result = service.allocateTalent('attack', 2); // needs 2 points, but we only have 1
            expect(result.success).toBe(false);
            expect(result.error).toContain('天赋点不足');
        });

        it('应触发talentAllocated钩子', () => {
            let hookCalled = false;
            service.registerHook('talentAllocated', (data) => {
                hookCalled = true;
                expect(data.branch).toBe('attack');
                expect(data.layer).toBe(1);
            });
            service.allocateTalent('attack', 1);
            expect(hookCalled).toBe(true);
        });
    });

    // ===== 天赋重置测试 =====

    describe('resetTalentTree', () => {
        beforeEach(() => {
            service.gainTalentPoints(20);
            service.allocateTalent('attack', 2);
            service.allocateTalent('defense', 1);
        });

        it('没有洗髓丹时应返回错误', () => {
            const result = service.resetTalentTree(false);
            expect(result.success).toBe(false);
            expect(result.error).toContain('洗髓丹');
        });

        it('有洗髓丹时应成功重置', () => {
            gameState.inventory.items.push({ name: TALENT_RESET_ITEM });
            const result = service.resetTalentTree(true);
            expect(result.success).toBe(true);
            expect(result.itemConsumed).toBe(true);
        });

        it('重置后应清空所有天赋', () => {
            gameState.inventory.items.push({ name: TALENT_RESET_ITEM });
            service.resetTalentTree(true);
            expect(gameState.talentData.talentTree.attack.layers).toBe(0);
            expect(gameState.talentData.talentTree.attack.points).toBe(0);
            expect(gameState.talentData.talentTree.defense.layers).toBe(0);
        });

        it('应触发talentReset钩子', () => {
            let hookCalled = false;
            gameState.inventory.items.push({ name: TALENT_RESET_ITEM });
            service.registerHook('talentReset', () => {
                hookCalled = true;
            });
            service.resetTalentTree(true);
            expect(hookCalled).toBe(true);
        });
    });

    // ===== 天赋查询测试 =====

    describe('queryTalentTree', () => {
        it('应返回完整天赋树状态', () => {
            service.gainTalentPoints(15);
            service.allocateTalent('attack', 1); // 1 point, leaves 14
            service.allocateTalent('attack', 2); // 2 points, leaves 12
            
            const result = service.queryTalentTree();
            expect(result.success).toBe(true);
            expect(result.availablePoints).toBe(12);
            expect(result.tree.attack).toBeDefined();
            expect(result.tree.attack.layers).toBe(2);
            expect(result.tree.attack.effects.length).toBe(2);
        });

        it('应包含每个分支的名称和下一层信息', () => {
            const result = service.queryTalentTree();
            for (const branch of TALENT_BRANCHES) {
                expect(result.tree[branch].name).toBe(BRANCH_NAMES[branch]);
                expect(result.tree[branch].nextLayerCost).not.toBeNull();
            }
        });

        it('满级后下一层信息应为null', () => {
            service.gainTalentPoints(100);
            // Allocate all 5 layers sequentially
            service.allocateTalent('attack', 1);
            service.allocateTalent('attack', 2);
            service.allocateTalent('attack', 3);
            service.allocateTalent('attack', 4);
            service.allocateTalent('attack', 5);
            
            const result = service.queryTalentTree();
            expect(result.tree.attack.nextLayerCost).toBeNull();
            expect(result.tree.attack.nextLayerEffect).toBeNull();
        });
    });

    // ===== 元素精通测试 =====

    describe('gainMasteryExp', () => {
        it('应增加元素经验', () => {
            const result = service.gainMasteryExp('fire', 50);
            expect(result.success).toBe(true);
            expect(result.expGained).toBe(50);
            expect(result.currentExp).toBe(50);
        });

        it('无效元素应返回错误', () => {
            const result = service.gainMasteryExp('invalid', 50);
            expect(result.success).toBe(false);
        });

        it('经验足够时应自动升级', () => {
            const result = service.gainMasteryExp('fire', 150);
            expect(result.leveledUp).toBe(true);
            expect(result.currentLevel).toBe(1);
            expect(result.currentLevelName).toBe(MASTERY_LEVEL_NAMES.apprentice); // level 1 = apprentice
        });

        it('应触发masteryLevelUp钩子', () => {
            let hookCalled = false;
            service.registerHook('masteryLevelUp', (data) => {
                hookCalled = true;
                expect(data.element).toBe('fire');
            });
            service.gainMasteryExp('fire', 150);
            expect(hookCalled).toBe(true);
        });
    });

    describe('upgradeMastery', () => {
        it('应成功升级精通', () => {
            service.gainMasteryExp('fire', 50); // 50 exp, stays at level 0
            service.gameState.masteryData.mastery.fire.exp = 300; // Manually set exp to 300
            const result = service.upgradeMastery('fire'); // Should upgrade from level 0 to level 1
            expect(result.success).toBe(true);
            expect(result.newLevel).toBe(1);
        });

        it('经验不足应返回错误', () => {
            service.gainMasteryExp('fire', 50);
            const result = service.upgradeMastery('fire');
            expect(result.success).toBe(false);
            expect(result.error).toContain('经验值不足');
        });

        it('已达最高级应返回错误', () => {
            service.gainMasteryExp('fire', 2000);
            service.upgradeMastery('fire');
            service.upgradeMastery('fire');
            service.upgradeMastery('fire');
            service.upgradeMastery('fire');
            service.upgradeMastery('fire');
            const result = service.upgradeMastery('fire');
            expect(result.success).toBe(false);
            expect(result.error).toContain('最高');
        });

        it('无效元素应返回错误', () => {
            const result = service.upgradeMastery('invalid');
            expect(result.success).toBe(false);
        });
    });

    describe('queryMastery', () => {
        it('应返回指定元素的精通状态', () => {
            service.gainMasteryExp('water', 150);
            const result = service.queryMastery('water');
            expect(result.success).toBe(true);
            expect(result.element).toBe('water');
            expect(result.level).toBe(1);
        });

        it('应返回所有元素精通状态', () => {
            const result = service.queryMastery();
            expect(result.success).toBe(true);
            expect(result.mastery).toBeDefined();
            for (const element of MASTERY_ELEMENTS) {
                expect(result.mastery[element]).toBeDefined();
                expect(result.mastery[element].name).toBeDefined();
            }
        });

        it('无效元素应返回错误', () => {
            const result = service.queryMastery('invalid');
            expect(result.success).toBe(false);
        });
    });

    // ===== Hook系统测试 =====

    describe('registerHook', () => {
        it('应成功注册钩子', () => {
            const result = service.registerHook('testHook', () => {});
            expect(result.success).toBe(true);
            expect(result.hookId).toBeDefined();
            expect(result.type).toBe('testHook');
        });

        it('应返回唯一的hookId', () => {
            const result1 = service.registerHook('test', () => {});
            const result2 = service.registerHook('test', () => {});
            expect(result1.hookId).not.toBe(result2.hookId);
        });
    });

    describe('unregisterHook', () => {
        it('应成功注销存在的钩子', () => {
            const { hookId } = service.registerHook('test', () => {});
            const result = service.unregisterHook(hookId);
            expect(result.success).toBe(true);
        });

        it('不存在的钩子应返回错误', () => {
            const result = service.unregisterHook(9999);
            expect(result.success).toBe(false);
        });
    });

    describe('triggerHook', () => {
        it('应触发匹配的钩子', () => {
            let callCount = 0;
            service.registerHook('testTrigger', () => { callCount++; });
            service.registerHook('testTrigger', () => { callCount++; });
            service.triggerHook('testTrigger', {});
            expect(callCount).toBe(2);
        });

        it('不应触发不匹配的钩子', () => {
            let called = false;
            service.registerHook('otherType', () => { called = true; });
            service.triggerHook('differentType', {});
            expect(called).toBe(false);
        });

        it('应返回被触发的钩子ID列表', () => {
            const { hookId } = service.registerHook('counted', () => {});
            const triggered = service.triggerHook('counted', {});
            expect(triggered).toContain(hookId);
        });
    });

    describe('listHooks', () => {
        it('应返回所有已注册钩子', () => {
            service.registerHook('type1', () => {});
            service.registerHook('type2', () => {});
            const hooks = service.listHooks();
            expect(hooks.length).toBe(2);
        });
    });

    // ===== 工具方法测试 =====

    describe('calculateTalentPointsReward', () => {
        it('应根据灵根品级和境界计算奖励', () => {
            gameState.spiritRoot.tier = 3;
            gameState.realm = 2;
            // tier * 2 + realm = 3 * 2 + 2 = 8
            expect(service.calculateTalentPointsReward()).toBe(8);
        });
    });

    describe('getAllBonuses', () => {
        it('应返回所有天赋加成', () => {
            service.gainTalentPoints(20);
            service.allocateTalent('attack', 1);
            service.allocateTalent('defense', 1); // Only 1 layer for defense
            
            const bonuses = service.getAllBonuses();
            expect(bonuses.attack).toBeGreaterThan(0);
            expect(bonuses.defense).toBeGreaterThan(0);
        });

        it('应包含灵根基础加成', () => {
            gameState.spiritRoot.tier = 3;
            const bonuses = service.getAllBonuses();
            // 上品灵根有 cultivationSpeed +20 和 attack +10
            expect(bonuses.cultivationSpeed).toBe(20);
        });
    });

    describe('getMasteryMultiplier', () => {
        it('应返回正确的精通倍率', () => {
            service.gainMasteryExp('fire', 600); // 600 exp -> level 3 (expert, 2.0x)
            expect(service.getMasteryMultiplier('fire')).toBe(MASTERY_EFFECT_MULTIPLIERS.expert);
        });

        it('无效元素应返回1.0', () => {
            expect(service.getMasteryMultiplier('invalid')).toBe(1.0);
        });
    });

    // ===== 序列化测试 =====

    describe('serialize', () => {
        it('应正确序列化数据', () => {
            service.gainTalentPoints(10);
            service.gainMasteryExp('fire', 100);
            
            const data = service.serialize();
            expect(data.talentData).toBeDefined();
            expect(data.masteryData).toBeDefined();
            expect(data.talentData.talentPoints).toBe(10);
        });
    });

    describe('deserialize', () => {
        it('应正确反序列化数据', () => {
            gameState.talentData = null;
            gameState.masteryData = null;
            
            const savedData = {
                talentData: createInitialTalentData(),
                masteryData: createInitialMasteryData(),
                hookIdCounter: 5
            };
            savedData.talentData.talentPoints = 15;
            savedData.talentData.talentTree.attack.layers = 3;
            
            service.deserialize(savedData);
            
            expect(gameState.talentData.talentPoints).toBe(15);
            expect(gameState.talentData.talentTree.attack.layers).toBe(3);
            expect(service.hookIdCounter).toBe(5);
        });
    });
});

// ===== 常量测试 =====

describe('TalentTreeService Constants', () => {
    describe('TALENT_BRANCHES', () => {
        it('应包含4个分支', () => {
            expect(TALENT_BRANCHES).toHaveLength(4);
            expect(TALENT_BRANCHES).toContain('attack');
            expect(TALENT_BRANCHES).toContain('defense');
            expect(TALENT_BRANCHES).toContain('cultivation');
            expect(TALENT_BRANCHES).toContain('perception');
        });
    });

    describe('MASTERY_ELEMENTS', () => {
        it('应包含6种元素', () => {
            expect(MASTERY_ELEMENTS).toHaveLength(6);
            expect(MASTERY_ELEMENTS).toContain('metal');
            expect(MASTERY_ELEMENTS).toContain('wood');
            expect(MASTERY_ELEMENTS).toContain('water');
            expect(MASTERY_ELEMENTS).toContain('fire');
            expect(MASTERY_ELEMENTS).toContain('earth');
            expect(MASTERY_ELEMENTS).toContain('thunder');
        });
    });

    describe('MASTERY_LEVELS', () => {
        it('应包含6个等级', () => {
            expect(MASTERY_LEVELS).toHaveLength(6);
            expect(MASTERY_LEVELS).toContain('novice');
            expect(MASTERY_LEVELS).toContain('apprentice');
            expect(MASTERY_LEVELS).toContain('journeyman');
            expect(MASTERY_LEVELS).toContain('expert');
            expect(MASTERY_LEVELS).toContain('master');
            expect(MASTERY_LEVELS).toContain('grandmaster');
        });
    });

    describe('LAYER_EFFECTS', () => {
        it('每个分支应有5层效果', () => {
            for (const branch of TALENT_BRANCHES) {
                expect(LAYER_EFFECTS[branch]).toHaveLength(5);
            }
        });
    });

    describe('POINTS_PER_LAYER', () => {
        it('应有5层所需点数', () => {
            expect(POINTS_PER_LAYER).toHaveLength(5);
            expect(POINTS_PER_LAYER[0]).toBe(1);
            expect(POINTS_PER_LAYER[4]).toBe(5);
        });
    });
});

// ===== 创建初始数据测试 =====

describe('createInitialTalentData', () => {
    it('应创建正确结构', () => {
        const data = createInitialTalentData();
        expect(data.talentTree).toBeDefined();
        expect(data.talentPoints).toBe(0);
        expect(data.totalTalentPointsEarned).toBe(0);
    });
});

describe('createInitialMasteryData', () => {
    it('应创建正确结构', () => {
        const data = createInitialMasteryData();
        expect(data.mastery).toBeDefined();
        expect(data.lastUpdateTime).toBeDefined();
    });
});