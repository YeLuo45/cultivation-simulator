/**
 * ChaosTreasureService Test Suite
 * TDD测试 - 覆盖率≥95%，通过率100%
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// 导入被测试的服务和常量
import { 
    ChaosTreasureService,
    chaosTreasureService, 
    createChaosTreasureMCPHandlers,
    CHAOS_TREASURE_TOOLS,
    TREASURE_TYPES,
    TREASURE_LEVELS,
    TREASURE_ATTRIBUTES
} from '../../../domains/inventory/services/ChaosTreasureService.js';

describe('ChaosTreasureService', () => {
    let mockGameState;
    let service;

    // 创建模拟游戏状态
    function createMockGameState() {
        return {
            player: {
                name: '修士',
                level: 1,
                spiritStones: 100000,
                karmaPoints: 1000,
                attack: 100,
                defense: 100,
                life: 1000,
                speed: 50
            },
            chaosTreasure: {
                treasures: [],
                equippedTreasures: {},
                resonancePairs: [],
                totalRefined: 0,
                totalAwakened: 0,
                totalResonated: 0,
                totalStrengthened: 0
            }
        };
    }

    let mockDateValue = 0;
    
    beforeEach(() => {
        mockGameState = createMockGameState();
        service = new ChaosTreasureService();
        service.init(mockGameState);
        // Mock Math.random and Date.now to ensure deterministic behavior
        mockDateValue = 0;
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        vi.spyOn(Date, 'now').mockImplementation(() => {
            mockDateValue += 1;
            return 1780160001943 + mockDateValue;
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('常量验证', () => {
        it('TREASURE_TYPES 包含4种灵宝类型', () => {
            expect(Object.keys(TREASURE_TYPES)).toHaveLength(4);
            expect(TREASURE_TYPES.武器).toBe('武器');
            expect(TREASURE_TYPES.防具).toBe('防具');
            expect(TREASURE_TYPES.饰品).toBe('饰品');
            expect(TREASURE_TYPES.秘宝).toBe('秘宝');
        });

        it('TREASURE_LEVELS 包含5个等级', () => {
            expect(Object.keys(TREASURE_LEVELS)).toHaveLength(5);
            expect(TREASURE_LEVELS.凡).toBe('凡');
            expect(TREASURE_LEVELS.灵).toBe('灵');
            expect(TREASURE_LEVELS.仙).toBe('仙');
            expect(TREASURE_LEVELS.神).toBe('神');
            expect(TREASURE_LEVELS.道).toBe('道');
        });

        it('TREASURE_ATTRIBUTES 包含4种属性', () => {
            expect(Object.keys(TREASURE_ATTRIBUTES)).toHaveLength(4);
            expect(TREASURE_ATTRIBUTES.攻击).toBe('attack');
            expect(TREASURE_ATTRIBUTES.防御).toBe('defense');
            expect(TREASURE_ATTRIBUTES.生命).toBe('life');
            expect(TREASURE_ATTRIBUTES.速度).toBe('speed');
        });

        it('CHAOS_TREASURE_TOOLS 包含6个工具', () => {
            expect(Object.keys(CHAOS_TREASURE_TOOLS)).toHaveLength(6);
            expect(CHAOS_TREASURE_TOOLS['treasure.refine']).toBeDefined();
            expect(CHAOS_TREASURE_TOOLS['treasure.awaken']).toBeDefined();
            expect(CHAOS_TREASURE_TOOLS['treasure.query']).toBeDefined();
            expect(CHAOS_TREASURE_TOOLS['treasure.equip']).toBeDefined();
            expect(CHAOS_TREASURE_TOOLS['treasure.resonance']).toBeDefined();
            expect(CHAOS_TREASURE_TOOLS['treasure.strengthen']).toBeDefined();
        });
    });

    describe('init - 初始化', () => {
        it('应正确初始化灵宝系统', () => {
            expect(service.gameState).toBeDefined();
            expect(service.treasures).toEqual([]);
            expect(service.equippedTreasures).toEqual({});
            expect(service.resonancePairs).toEqual([]);
        });

        it('应正确初始化已存在的灵宝数据', () => {
            const existingTreasure = {
                id: 'ct_test_1',
                type: '武器',
                level: '灵',
                name: '混沌神兵',
                enhanceLevel: 2,
                awakenLevel: 1,
                skills: []
            };
            mockGameState.chaosTreasure.treasures.push(existingTreasure);
            
            const newService = new ChaosTreasureService();
            newService.init(mockGameState);
            
            expect(newService.treasures).toHaveLength(1);
            expect(newService.treasures[0].id).toBe('ct_test_1');
        });

        it('如果游戏状态没有chaosTreasure字段应创建', () => {
            delete mockGameState.chaosTreasure;
            service.init(mockGameState);
            
            expect(mockGameState.chaosTreasure).toBeDefined();
            expect(mockGameState.chaosTreasure.treasures).toEqual([]);
            expect(mockGameState.chaosTreasure.equippedTreasures).toEqual({});
        });
    });

    describe('generateId - ID生成', () => {
        it('应生成唯一ID', () => {
            const id1 = service.generateId();
            const id2 = service.generateId();
            
            expect(id1).toBeTruthy();
            expect(id2).toBeTruthy();
            expect(id1.startsWith('ct_')).toBe(true);
            expect(id2.startsWith('ct_')).toBe(true);
            expect(id1).not.toBe(id2);
        });
    });

    describe('getTreasureTypes/Lvels/Attributes - 枚举获取', () => {
        it('getTreasureTypes 应返回类型枚举副本', () => {
            const types = service.getTreasureTypes();
            expect(types).toEqual(TREASURE_TYPES);
            expect(types).not.toBe(TREASURE_TYPES);
        });

        it('getTreasureLevels 应返回等级枚举副本', () => {
            const levels = service.getTreasureLevels();
            expect(levels).toEqual(TREASURE_LEVELS);
            expect(levels).not.toBe(TREASURE_LEVELS);
        });

        it('getTreasureAttributes 应返回属性枚举副本', () => {
            const attrs = service.getTreasureAttributes();
            expect(attrs).toEqual(TREASURE_ATTRIBUTES);
            expect(attrs).not.toBe(TREASURE_ATTRIBUTES);
        });
    });

    describe('getTreasureDefinition - 灵宝定义获取', () => {
        it('应返回武器定义', () => {
            const def = service.getTreasureDefinition('武器');
            expect(def.name).toBe('混沌神兵');
            expect(def.baseAttributes).toEqual({ attack: 100, speed: 20 });
            expect(def.resonanceTag).toBe('attack');
        });

        it('应返回防具定义', () => {
            const def = service.getTreasureDefinition('防具');
            expect(def.name).toBe('混沌护甲');
            expect(def.baseAttributes).toEqual({ defense: 100, life: 200 });
        });

        it('应返回饰品定义', () => {
            const def = service.getTreasureDefinition('饰品');
            expect(def.name).toBe('混沌灵饰');
            expect(def.baseAttributes).toEqual({ life: 300, defense: 30 });
        });

        it('应返回秘宝定义', () => {
            const def = service.getTreasureDefinition('秘宝');
            expect(def.name).toBe('混沌秘宝');
            expect(def.baseAttributes).toEqual({ speed: 50, attack: 30 });
        });

        it('无效类型应返回undefined', () => {
            expect(service.getTreasureDefinition('无效')).toBeUndefined();
        });
    });

    describe('getLevelIndex - 等级索引', () => {
        it('应正确转换各等级到索引', () => {
            expect(service.getLevelIndex('凡')).toBe(0);
            expect(service.getLevelIndex('灵')).toBe(1);
            expect(service.getLevelIndex('仙')).toBe(2);
            expect(service.getLevelIndex('神')).toBe(3);
            expect(service.getLevelIndex('道')).toBe(4);
        });

        it('未知等级应返回0', () => {
            expect(service.getLevelIndex('未知')).toBe(0);
        });
    });

    describe('calculateBaseAttributes - 基础属性计算', () => {
        it('应正确计算凡品灵宝属性', () => {
            const treasure = {
                type: '武器',
                level: '凡',
                enhanceLevel: 0
            };
            const attrs = service.calculateBaseAttributes(treasure);
            expect(attrs.attack).toBe(100);
            expect(attrs.speed).toBe(20);
        });

        it('应正确计算灵品灵宝属性（带1.5倍率）', () => {
            const treasure = {
                type: '防具',
                level: '灵',
                enhanceLevel: 0
            };
            const attrs = service.calculateBaseAttributes(treasure);
            expect(attrs.defense).toBe(150); // 100 * 1.5
            expect(attrs.life).toBe(300);    // 200 * 1.5
        });

        it('应正确计算强化加成', () => {
            const treasure = {
                type: '饰品',
                level: '凡',
                enhanceLevel: 5
            };
            const attrs = service.calculateBaseAttributes(treasure);
            expect(attrs.life).toBe(450); // 300 * (1 + 5*0.1) = 450
            expect(attrs.defense).toBe(45); // 30 * (1 + 5*0.1) = 45
        });
    });

    describe('mcpRefine - 炼制灵宝', () => {
        it('应成功炼制凡品武器', () => {
            const result = service.mcpRefine({ type: '武器', level: '凡' });
            
            expect(result.success).toBe(true);
            expect(result.treasure).toBeDefined();
            expect(result.treasure.type).toBe('武器');
            expect(result.treasure.level).toBe('凡');
            expect(service.treasures).toHaveLength(1);
        });

        it('应扣除灵石', () => {
            const initialStones = mockGameState.player.spiritStones;
            service.mcpRefine({ type: '武器', level: '凡' });
            
            expect(mockGameState.player.spiritStones).toBe(initialStones - 50);
        });

        it('灵石不足应返回错误', () => {
            mockGameState.player.spiritStones = 10;
            const result = service.mcpRefine({ type: '武器', level: '凡' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });

        it('无效类型应返回错误', () => {
            const result = service.mcpRefine({ type: '无效类型', level: '凡' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('无效的灵宝类型');
        });

        it('无效等级应返回错误', () => {
            const result = service.mcpRefine({ type: '武器', level: '无效等级' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('无效的灵宝等级');
        });

        it('useStones=false 应不消耗灵石', () => {
            const initialStones = mockGameState.player.spiritStones;
            service.mcpRefine({ type: '武器', level: '凡', useStones: false });
            
            expect(mockGameState.player.spiritStones).toBe(initialStones);
        });

        it('炼制后统计数据应更新', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            
            expect(mockGameState.chaosTreasure.totalRefined).toBe(1);
        });
    });

    describe('mcpAwaken - 灵宝觉醒', () => {
        it('应成功觉醒灵宝', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            
            const result = service.mcpAwaken({ treasureId: treasure.id });
            
            expect(result.success).toBe(true);
            expect(result.treasure.awakenLevel).toBe(1);
        });

        it('应解锁技能', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            
            service.mcpAwaken({ treasureId: treasure.id });
            
            expect(treasure.skills.length).toBeGreaterThan(0);
        });

        it('应扣除灵石和业力', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            const initialStones = mockGameState.player.spiritStones;
            const initialKarma = mockGameState.player.karmaPoints;
            
            service.mcpAwaken({ treasureId: treasure.id });
            
            expect(mockGameState.player.spiritStones).toBeLessThan(initialStones);
            expect(mockGameState.player.karmaPoints).toBeLessThan(initialKarma);
        });

        it('未找到灵宝应返回错误', () => {
            const result = service.mcpAwaken({ treasureId: 'invalid_id' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('未找到');
        });

        it('已达最大觉醒等级应返回错误', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            treasure.awakenLevel = 3;
            
            const result = service.mcpAwaken({ treasureId: treasure.id });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('最大觉醒等级');
        });

        it('业力不足应返回错误', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            mockGameState.player.karmaPoints = 0;
            
            const result = service.mcpAwaken({ treasureId: treasure.id });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('业力不足');
        });
    });

    describe('mcpQuery - 查询灵宝', () => {
        beforeEach(() => {
            // Mock已经设置，无需useStones: false
            service.mcpRefine({ type: '武器', level: '凡' });
            service.mcpRefine({ type: '防具', level: '灵' });
        });

        it('应返回所有灵宝列表', () => {
            const result = service.mcpQuery({});
            
            expect(result.treasures).toHaveLength(2);
            expect(result.total).toBe(2);
        });

        it('应返回统计数据', () => {
            const result = service.mcpQuery({});
            
            expect(result.stats).toBeDefined();
            expect(result.stats.totalTreasures).toBe(2);
        });

        it('应能按类型筛选', () => {
            const result = service.mcpQuery({ listAll: true, filterType: '武器' });
            
            expect(result.treasures).toHaveLength(1);
            expect(result.treasures[0].type).toBe('武器');
        });

        it('应能按等级筛选', () => {
            const result = service.mcpQuery({ listAll: true, filterLevel: '灵' });
            
            expect(result.treasures).toHaveLength(1);
            expect(result.treasures[0].level).toBe('灵');
        });

        it('应返回指定灵宝详情', () => {
            const treasure = service.treasures[0];
            const result = service.mcpQuery({ treasureId: treasure.id });
            
            expect(result.treasure).toBeDefined();
            expect(result.treasure.id).toBe(treasure.id);
            expect(result.calculatedAttributes).toBeDefined();
        });

        it('应显示共鸣加成', () => {
            const treasure = service.treasures[0];
            const result = service.mcpQuery({ treasureId: treasure.id });
            
            expect(result.resonanceBonus).toBeDefined();
        });

        it('未找到灵宝应返回错误', () => {
            const result = service.mcpQuery({ treasureId: 'invalid_id' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('未找到');
        });

        it('应显示已装备列表', () => {
            service.mcpEquip({ treasureId: service.treasures[0].id });
            const result = service.mcpQuery({ listAll: true });
            
            expect(result.equipped).toHaveLength(1);
        });
    });

    describe('mcpEquip - 装备灵宝', () => {
        it('应成功装备灵宝', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            
            const result = service.mcpEquip({ treasureId: treasure.id });
            
            expect(result.success).toBe(true);
            expect(result.slot).toBe('主手');
            expect(result.treasure.equippedSlot).toBe('主手');
        });

        it('应支持指定槽位', () => {
            service.mcpRefine({ type: '饰品', level: '凡' });
            const treasure = service.treasures[0];
            
            const result = service.mcpEquip({ treasureId: treasure.id, slot: '项链' });
            
            expect(result.success).toBe(true);
            expect(result.slot).toBe('项链');
        });

        it('无效槽位应返回错误', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            
            const result = service.mcpEquip({ treasureId: treasure.id, slot: '项链' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('无法装备到');
        });

        it('应能卸下灵宝', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            service.mcpEquip({ treasureId: treasure.id });
            
            const result = service.mcpEquip({ treasureId: treasure.id, unequip: true });
            
            expect(result.success).toBe(true);
            expect(service.equippedTreasures['主手']).toBeUndefined();
        });

        it('装备时应替换原装备', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            service.mcpRefine({ type: '武器', level: '灵' });
            const treasure1 = service.treasures[0];
            const treasure2 = service.treasures[1];
            
            service.mcpEquip({ treasureId: treasure1.id, slot: '主手' });
            const result = service.mcpEquip({ treasureId: treasure2.id, slot: '主手' });
            
            expect(result.success).toBe(true);
            expect(service.equippedTreasures['主手'].id).toBe(treasure2.id);
        });

        it('未找到灵宝应返回错误', () => {
            const result = service.mcpEquip({ treasureId: 'invalid_id' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('未找到');
        });
    });

    describe('mcpResonance - 灵宝共鸣', () => {
        it('应成功建立共鸣', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            service.mcpRefine({ type: '防具', level: '凡' });
            const treasure1 = service.treasures[0];
            const treasure2 = service.treasures[1];
            
            const result = service.mcpResonance({ treasureId1: treasure1.id, treasureId2: treasure2.id });
            
            expect(result.success).toBe(true);
            expect(result.effect).toBeDefined();
            expect(result.effect.bonusAttribute).toBe('defense');
        });

        it('应消耗灵石', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            service.mcpRefine({ type: '防具', level: '凡' });
            const treasure1 = service.treasures[0];
            const treasure2 = service.treasures[1];
            const initialStones = mockGameState.player.spiritStones;
            
            service.mcpResonance({ treasureId1: treasure1.id, treasureId2: treasure2.id });
            
            expect(mockGameState.player.spiritStones).toBe(initialStones - 500);
        });

        it('灵石不足应返回错误', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            service.mcpRefine({ type: '防具', level: '凡' });
            mockGameState.player.spiritStones = 100;
            
            const result = service.mcpResonance({ 
                treasureId1: service.treasures[0].id, 
                treasureId2: service.treasures[1].id 
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });

        it('与自己共鸣应返回错误', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            
            const result = service.mcpResonance({ 
                treasureId1: treasure.id, 
                treasureId2: treasure.id 
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('无法与自己共鸣');
        });

        it('已有共鸣应返回错误', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            service.mcpRefine({ type: '防具', level: '凡' });
            const treasure1 = service.treasures[0];
            const treasure2 = service.treasures[1];
            
            service.mcpResonance({ treasureId1: treasure1.id, treasureId2: treasure2.id });
            const result = service.mcpResonance({ treasureId1: treasure1.id, treasureId2: treasure2.id });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('已在共鸣状态');
        });

        it('应能解除共鸣', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            service.mcpRefine({ type: '防具', level: '凡' });
            const treasure1 = service.treasures[0];
            const treasure2 = service.treasures[1];
            service.mcpResonance({ treasureId1: treasure1.id, treasureId2: treasure2.id });
            
            const result = service.mcpResonance({ 
                treasureId1: treasure1.id, 
                treasureId2: treasure2.id,
                removeResonance: true 
            });
            
            expect(result.success).toBe(true);
            expect(service.resonancePairs).toHaveLength(0);
        });

        it('未找到灵宝应返回错误', () => {
            const result = service.mcpResonance({ treasureId1: 'invalid', treasureId2: 'invalid2' });
            
            expect(result.success).toBe(false);
        });
    });

    describe('mcpStrengthen - 灵宝强化', () => {
        it('应成功强化灵宝', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            
            const result = service.mcpStrengthen({ treasureId: treasure.id, autoIncrement: true });
            
            expect(result.success).toBe(true);
            expect(result.enhanceLevel).toBe(1);
        });

        it('应消耗灵石', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            const initialStones = mockGameState.player.spiritStones;
            
            service.mcpStrengthen({ treasureId: treasure.id });
            
            expect(mockGameState.player.spiritStones).toBeLessThan(initialStones);
        });

        it('灵石不足应返回错误', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            mockGameState.player.spiritStones = 0;
            
            const result = service.mcpStrengthen({ treasureId: treasure.id });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });

        it('已达最大强化等级应返回错误', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            treasure.enhanceLevel = 20;
            
            const result = service.mcpStrengthen({ treasureId: treasure.id });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('最大强化等级');
        });

        it('未找到灵宝应返回错误', () => {
            const result = service.mcpStrengthen({ treasureId: 'invalid' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('未找到');
        });

        it('autoIncrement=false 时不应提升等级', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            
            service.mcpStrengthen({ treasureId: treasure.id, autoIncrement: false });
            
            expect(treasure.enhanceLevel).toBe(0);
        });

        it('强化后应更新属性', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            
            service.mcpStrengthen({ treasureId: treasure.id, autoIncrement: true });
            
            expect(treasure.enhanceLevel).toBe(1);
        });
    });

    describe('getResonanceEffect - 共鸣效果', () => {
        it('应返回正确的共鸣效果', () => {
            const treasure1 = { type: '武器' };
            const treasure2 = { type: '防具' };
            
            const effect = service.getResonanceEffect([treasure1, treasure2]);
            
            expect(effect.bonusAttribute).toBe('defense');
            expect(effect.bonusPercent).toBe(0.1);
        });
    });

    describe('calculateResonanceBonus - 共鸣加成计算', () => {
        it('应正确计算共鸣加成', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            service.mcpRefine({ type: '防具', level: '凡' });
            service.mcpResonance({ 
                treasureId1: service.treasures[0].id, 
                treasureId2: service.treasures[1].id 
            });
            
            const bonus = service.calculateResonanceBonus();
            
            expect(bonus.defense).toBe(0.1);
        });
    });

    describe('getRefineCost - 炼制消耗', () => {
        it('各等级应有正确的消耗', () => {
            expect(service.getRefineCost('凡')).toBe(50);
            expect(service.getRefineCost('灵')).toBe(200);
            expect(service.getRefineCost('仙')).toBe(1000);
            expect(service.getRefineCost('神')).toBe(5000);
            expect(service.getRefineCost('道')).toBe(25000);
        });
    });

    describe('getRefineSuccessRate - 炼制成功率', () => {
        it('各等级应有正确的成功率', () => {
            expect(service.getRefineSuccessRate('凡')).toBe(0.9);
            expect(service.getRefineSuccessRate('灵')).toBe(0.7);
            expect(service.getRefineSuccessRate('仙')).toBe(0.5);
            expect(service.getRefineSuccessRate('神')).toBe(0.3);
            expect(service.getRefineSuccessRate('道')).toBe(0.15);
        });
    });

    describe('getStrengthenCost - 强化消耗', () => {
        it('应正确计算强化消耗', () => {
            expect(service.getStrengthenCost('凡', 0)).toBe(30);
            expect(service.getStrengthenCost('凡', 5)).toBe(180);
            expect(service.getStrengthenCost('灵', 0)).toBe(150);
        });
    });

    describe('getStrengthenSuccessRate - 强化成功率', () => {
        it('应正确计算强化成功率', () => {
            expect(service.getStrengthenSuccessRate(0)).toBe(0.8);
            expect(service.getStrengthenSuccessRate(5)).toBe(0.6);
            expect(service.getStrengthenSuccessRate(10)).toBe(0.4);
            expect(service.getStrengthenSuccessRate(15)).toBe(0.2);
        });
    });

    describe('calculateTreasureAttributes - 计算灵宝总属性', () => {
        it('应包含基础属性和共鸣加成', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            service.mcpRefine({ type: '防具', level: '凡' });
            service.mcpResonance({ 
                treasureId1: treasure.id, 
                treasureId2: service.treasures[1].id 
            });
            
            const attrs = service.calculateTreasureAttributes(treasure);
            
            expect(attrs.attack).toBeDefined();
            expect(attrs.speed).toBeDefined();
        });
    });

    describe('formatTreasure - 格式化灵宝', () => {
        it('应返回正确的格式化对象', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            
            const formatted = service.formatTreasure(treasure);
            
            expect(formatted.id).toBe(treasure.id);
            expect(formatted.type).toBe('武器');
            expect(formatted.level).toBe('凡');
            expect(formatted.name).toBe('混沌神兵');
            expect(formatted.enhanceLevel).toBe(0);
            expect(formatted.awakenLevel).toBe(0);
        });
    });

    describe('isEquipped - 检查装备状态', () => {
        it('已装备应返回true', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            service.mcpEquip({ treasureId: treasure.id });
            
            expect(service.isEquipped(treasure.id)).toBe(true);
        });

        it('未装备应返回false', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            const treasure = service.treasures[0];
            
            expect(service.isEquipped(treasure.id)).toBe(false);
        });
    });

    describe('getEquippedList - 获取已装备列表', () => {
        it('应返回已装备灵宝列表', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            service.mcpEquip({ treasureId: service.treasures[0].id });
            
            const list = service.getEquippedList();
            
            expect(list).toHaveLength(1);
            expect(list[0].slot).toBe('主手');
        });
    });

    describe('getStats - 统计数据', () => {
        it('应返回正确的统计数据', () => {
            service.mcpRefine({ type: '武器', level: '凡' });
            service.mcpRefine({ type: '防具', level: '灵' });
            
            const stats = service.getStats();
            
            expect(stats.totalTreasures).toBe(2);
            expect(stats.maxTreasures).toBe(50);
            expect(stats.treasuresByType.武器).toBe(1);
            expect(stats.treasuresByLevel.凡).toBe(1);
            expect(stats.treasuresByLevel.灵).toBe(1);
        });
    });

    describe('createChaosTreasureMCPHandlers - MCP处理器创建', () => {
        it('应返回6个工具处理器', () => {
            const handlers = createChaosTreasureMCPHandlers(mockGameState);
            
            expect(Object.keys(handlers)).toHaveLength(6);
            expect(handlers['treasure.refine']).toBeDefined();
            expect(handlers['treasure.awaken']).toBeDefined();
            expect(handlers['treasure.query']).toBeDefined();
            expect(handlers['treasure.equip']).toBeDefined();
            expect(handlers['treasure.resonance']).toBeDefined();
            expect(handlers['treasure.strengthen']).toBeDefined();
        });

        it('各处理器应正确执行', () => {
            const handlers = createChaosTreasureMCPHandlers(mockGameState);
            
            const refineResult = handlers['treasure.refine']({ type: '武器', level: '凡' });
            expect(refineResult.success).toBe(true);
            
            const queryResult = handlers['treasure.query']({});
            expect(queryResult.total).toBe(1);
        });
    });

    describe('工具定义验证', () => {
        it('treasure.refine 应有正确的输入模式', () => {
            const tool = CHAOS_TREASURE_TOOLS['treasure.refine'];
            expect(tool.name).toBe('treasure.refine');
            expect(tool.inputSchema.properties.type.enum).toContain('武器');
            expect(tool.inputSchema.required).toContain('type');
        });

        it('treasure.awaken 应有正确的输入模式', () => {
            const tool = CHAOS_TREASURE_TOOLS['treasure.awaken'];
            expect(tool.name).toBe('treasure.awaken');
            expect(tool.inputSchema.required).toContain('treasureId');
        });

        it('treasure.query 应有正确的输入模式', () => {
            const tool = CHAOS_TREASURE_TOOLS['treasure.query'];
            expect(tool.name).toBe('treasure.query');
            expect(tool.inputSchema.properties.listAll.type).toBe('boolean');
        });

        it('treasure.equip 应支持 unequip 参数', () => {
            const tool = CHAOS_TREASURE_TOOLS['treasure.equip'];
            expect(tool.inputSchema.properties.unequip.type).toBe('boolean');
        });

        it('treasure.resonance 应支持 removeResonance 参数', () => {
            const tool = CHAOS_TREASURE_TOOLS['treasure.resonance'];
            expect(tool.inputSchema.properties.removeResonance.type).toBe('boolean');
        });

        it('treasure.strengthen 应支持 autoIncrement 参数', () => {
            const tool = CHAOS_TREASURE_TOOLS['treasure.strengthen'];
            expect(tool.inputSchema.properties.autoIncrement.type).toBe('boolean');
        });
    });

    describe('单例导出验证', () => {
        it('chaosTreasureService 应是 ChaosTreasureService 实例', () => {
            expect(chaosTreasureService).toBeInstanceOf(ChaosTreasureService);
        });
    });
});