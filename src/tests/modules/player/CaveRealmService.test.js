/**
 * CaveRealmService.test.js - TDD测试
 * V242 Direction D: 洞天福地系统测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
    CaveRealmService, 
    createCaveRealmService,
    CAVE_TIERS,
    CAVE_TIER_CONFIG,
    BLESSED_LAND_CONFIG,
    RESOURCE_TYPES
} from '../../../../src/domains/player/services/CaveRealmService.js';

// ===== 测试辅助函数 =====

/**
 * 创建测试用gameState
 */
function createTestGameState(overrides = {}) {
    return {
        spiritStones: 100000,
        qi: 1000,
        player: { name: '测试修士' },
        caveRealm: {
            hasCave: false,
            cave: null,
            blessedLands: [],
            resources: [],
            totalHarvests: 0,
            spiritBalance: 0,
            lastSpiritUpdate: Date.now()
        },
        ...overrides
    };
}

// ===== 测试套件 =====

describe('CaveRealmService', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createTestGameState();
        service = new CaveRealmService(gameState);
    });

    // ===== 常量验证测试 =====

    describe('常量配置', () => {
        it('CAVE_TIERS 应包含4个等级', () => {
            expect(CAVE_TIERS).toEqual(['小型', '中型', '大型', '巨型']);
        });

        it('CAVE_TIER_CONFIG 应包含所有等级的容量配置', () => {
            expect(Object.keys(CAVE_TIER_CONFIG).length).toBe(4);
            expect(CAVE_TIER_CONFIG['小型']).toEqual({
                capacity: 2,
                resourceSlots: 3,
                spiritBonus: 1.0,
                expandCost: 500,
                createCost: 200
            });
            expect(CAVE_TIER_CONFIG['中型'].capacity).toBe(5);
            expect(CAVE_TIER_CONFIG['大型'].capacity).toBe(10);
            expect(CAVE_TIER_CONFIG['巨型'].capacity).toBe(20);
        });

        it('BLESSED_LAND_CONFIG 应包含1-5级配置', () => {
            expect(Object.keys(BLESSED_LAND_CONFIG).length).toBe(5);
            expect(BLESSED_LAND_CONFIG[1]).toEqual({
                name: '福地初成',
                qiRegenBonus: 1.2,
                cultivationBonus: 5,
                expandCost: 300
            });
        });

        it('RESOURCE_TYPES 应包含所有资源类型', () => {
            expect(Object.keys(RESOURCE_TYPES).length).toBe(4);
            expect(RESOURCE_TYPES['spiritStone']).toEqual({
                name: '灵石',
                baseYield: 10,
                regenTime: 3600000
            });
            expect(RESOURCE_TYPES['qiCrystal']).toEqual({
                name: '灵气结晶',
                baseYield: 5,
                regenTime: 7200000
            });
            expect(RESOURCE_TYPES['essence']).toEqual({
                name: '精华',
                baseYield: 2,
                regenTime: 10800000
            });
            expect(RESOURCE_TYPES['mysticHerb']).toEqual({
                name: '灵草',
                baseYield: 3,
                regenTime: 5400000
            });
        });
    });

    // ===== 初始化测试 =====

    describe('init', () => {
        it('应初始化 caveRealm 状态', () => {
            service.init(gameState);
            expect(gameState.caveRealm).not.toBeNull();
            expect(gameState.caveRealm.hasCave).toBe(false);
            expect(gameState.caveRealm.cave).toBeNull();
        });

        it('已存在的 caveRealm 状态不应被覆盖', () => {
            gameState.caveRealm = {
                hasCave: true,
                cave: { id: 'test_123', name: '已有洞天' },
                realms: [{ id: 'test_123' }]
            };
            service.init(gameState);
            expect(gameState.caveRealm.hasCave).toBe(true);
            expect(gameState.caveRealm.cave.name).toBe('已有洞天');
        });

        it('realms 数组应被正确初始化', () => {
            service.init(gameState);
            expect(gameState.caveRealm.realms).toEqual([]);
        });

        it('blessedLands 数组应被正确初始化', () => {
            service.init(gameState);
            expect(gameState.caveRealm.blessedLands).toEqual([]);
        });

        it('resources 数组应被正确初始化', () => {
            service.init(gameState);
            expect(gameState.caveRealm.resources).toEqual([]);
        });

        it('应返回this以支持链式调用', () => {
            const result = service.init(gameState);
            expect(result).toBe(service);
        });
    });

    // ===== getMCPHandlers 测试 =====

    describe('getMCPHandlers', () => {
        it('应返回包含6个工具的处理器对象', () => {
            const handlers = service.getMCPHandlers();
            expect(Object.keys(handlers).length).toBe(6);
            expect(typeof handlers['cave.create']).toBe('function');
            expect(typeof handlers['cave.expand']).toBe('function');
            expect(typeof handlers['cave.resource']).toBe('function');
            expect(typeof handlers['cave.blessed']).toBe('function');
            expect(typeof handlers['cave.spirit']).toBe('function');
            expect(typeof handlers['cave.harvest']).toBe('function');
        });
    });

    // ===== TOOLS 静态属性测试 =====

    describe('static TOOLS', () => {
        it('应包含所有6个工具定义', () => {
            const tools = CaveRealmService.TOOLS;
            expect(Object.keys(tools).length).toBe(6);
            expect(tools['cave.create']).not.toBeNull();
            expect(tools['cave.expand']).not.toBeNull();
            expect(tools['cave.resource']).not.toBeNull();
            expect(tools['cave.blessed']).not.toBeNull();
            expect(tools['cave.spirit']).not.toBeNull();
            expect(tools['cave.harvest']).not.toBeNull();
        });

        it('每个工具定义应包含正确的schema', () => {
            const tools = CaveRealmService.TOOLS;
            expect(tools['cave.create'].inputSchema.properties.tier.enum).toEqual(['小型', '中型', '大型', '巨型']);
            expect(tools['cave.expand'].inputSchema.properties.targetTier.enum).toEqual(['小型', '中型', '大型', '巨型']);
        });
    });

    // ===== cave.create 测试 =====

    describe('mcpCreate - 创建洞天', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('应成功创建小型洞天', () => {
            const result = service.mcpCreate({
                name: '我的秘境',
                tier: '小型'
            });
            expect(result.success).toBe(true);
            expect(result.cave).not.toBeNull();
            expect(result.cave.name).toBe('我的秘境');
            expect(result.cave.tier).toBe('小型');
            expect(result.cave.capacity).toBe(2);
            expect(result.cave.resourceSlots).toBe(3);
        });

        it('应消耗灵石', () => {
            const initialStones = gameState.spiritStones;
            service.mcpCreate({ tier: '小型' });
            expect(gameState.spiritStones).toBe(initialStones - 200);
        });

        it('应更新gameState状态', () => {
            service.mcpCreate({ tier: '小型' });
            expect(gameState.caveRealm.hasCave).toBe(true);
            expect(gameState.caveRealm.cave).not.toBeNull();
            expect(gameState.caveRealm.realms.length).toBe(1);
        });

        it('无效tier应返回错误', () => {
            const result = service.mcpCreate({ tier: '超大' });
            expect(result.success).toBe(false);
            expect(result.error).toBe('无效的洞天规模');
            expect(result.validTiers).toEqual(CAVE_TIERS);
        });

        it('已存在洞天应返回错误', () => {
            service.mcpCreate({ tier: '小型' });
            const result = service.mcpCreate({ tier: '中型' });
            expect(result.success).toBe(false);
            expect(result.error).toBe('已存在洞天，请使用 cave.expand 扩展');
        });

        it('灵石不足应返回错误', () => {
            gameState.spiritStones = 100;
            const result = service.mcpCreate({ tier: '小型' });
            expect(result.success).toBe(false);
            expect(result.error).toBe('灵石不足');
            expect(result.required).toBe(200);
            expect(result.available).toBe(100);
        });

        it('默认tier应为小型', () => {
            const result = service.mcpCreate({});
            expect(result.success).toBe(true);
            expect(result.cave.tier).toBe('小型');
        });

        it('无name参数时应使用默认名称', () => {
            const result = service.mcpCreate({ tier: '中型' });
            expect(result.success).toBe(true);
            expect(result.cave.name).toBe('中型洞天');
        });
    });

    // ===== cave.expand 测试 =====

    describe('mcpExpand - 扩展洞天', () => {
        beforeEach(() => {
            service.init(gameState);
            service.mcpCreate({ tier: '小型' });
        });

        it('应成功扩展洞天到中型', () => {
            const result = service.mcpExpand({ targetTier: '中型' });
            expect(result.success).toBe(true);
            expect(result.expand.fromTier).toBe('小型');
            expect(result.expand.toTier).toBe('中型');
            expect(result.expand.newCapacity).toBe(5);
            expect(result.expand.newResourceSlots).toBe(6);
        });

        it('应消耗灵石', () => {
            const initialStones = gameState.spiritStones;
            service.mcpExpand({ targetTier: '中型' });
            expect(gameState.spiritStones).toBe(initialStones - 1500);
        });

        it('应更新洞天属性', () => {
            service.mcpExpand({ targetTier: '大型' });
            expect(gameState.caveRealm.cave.tier).toBe('大型');
            expect(gameState.caveRealm.cave.capacity).toBe(10);
            expect(gameState.caveRealm.cave.spiritBonus).toBe(1.6);
        });

        it('尚未创建洞天应返回错误', () => {
            gameState.caveRealm.hasCave = false;
            gameState.caveRealm.cave = null;
            const result = service.mcpExpand({ targetTier: '中型' });
            expect(result.success).toBe(false);
            expect(result.error).toBe('尚未创建洞天，请先使用 cave.create');
        });

        it('目标tier无效应返回错误', () => {
            const result = service.mcpExpand({ targetTier: '超级' });
            expect(result.success).toBe(false);
            expect(result.error).toBe('无效的目标规模');
        });

        it('目标tier小于等于当前tier应返回错误', () => {
            const result = service.mcpExpand({ targetTier: '小型' });
            expect(result.success).toBe(false);
            expect(result.error).toBe('目标规模必须大于当前规模');
            expect(result.currentTier).toBe('小型');
        });

        it('灵石不足应返回错误', () => {
            gameState.spiritStones = 500;
            const result = service.mcpExpand({ targetTier: '中型' });
            expect(result.success).toBe(false);
            expect(result.error).toBe('灵石不足');
            expect(result.shortfall).toBe(1000);
        });

        it('无targetTier参数应返回错误', () => {
            const result = service.mcpExpand({});
            expect(result.success).toBe(false);
            expect(result.error).toBe('无效的目标规模');
        });
    });

    // ===== cave.resource 测试 =====

    describe('mcpResource - 洞天资源', () => {
        beforeEach(() => {
            service.init(gameState);
            service.mcpCreate({ tier: '中型' });
        });

        it('应返回洞天资源信息', () => {
            const result = service.mcpResource({});
            expect(result.success).toBe(true);
            expect(result.cave).not.toBeNull();
            expect(result.cave.tier).toBe('中型');
            expect(result.resources).toEqual([]);
        });

        it('应返回可用的资源类型', () => {
            const result = service.mcpResource({});
            expect(result.availableTypes).toEqual(Object.keys(RESOURCE_TYPES));
        });

        it('尚未创建洞天应返回错误', () => {
            gameState.caveRealm.hasCave = false;
            gameState.caveRealm.cave = null;
            const result = service.mcpResource({});
            expect(result.success).toBe(false);
            expect(result.error).toBe('尚未创建洞天');
        });

        it('应正确计算资源槽位', () => {
            const result = service.mcpResource({});
            expect(result.cave.resourceSlotsUsed).toBe(0);
            expect(result.cave.resourceSlotsAvailable).toBe(6);
        });

        it('过滤特定资源类型应返回正确结果', () => {
            gameState.caveRealm.resources = [
                { id: 'r1', type: 'spiritStone', amount: 10, readyAt: Date.now() - 1000 },
                { id: 'r2', type: 'qiCrystal', amount: 5, readyAt: Date.now() - 1000 }
            ];
            const result = service.mcpResource({ resourceType: 'spiritStone' });
            expect(result.success).toBe(true);
            expect(result.resourceType).toBe('spiritStone');
            expect(result.count).toBe(1);
        });

        it('无效资源类型应返回错误', () => {
            const result = service.mcpResource({ resourceType: 'invalidType' });
            expect(result.success).toBe(false);
            expect(result.error).toBe('无效的资源类型');
        });

        it('资源应有正确的ready状态', () => {
            gameState.caveRealm.resources = [
                { id: 'r1', type: 'spiritStone', amount: 10, readyAt: Date.now() - 1000 },
                { id: 'r2', type: 'qiCrystal', amount: 5, readyAt: Date.now() + 10000 }
            ];
            const result = service.mcpResource({});
            expect(result.resources[0].isReady).toBe(true);
            expect(result.resources[1].isReady).toBe(false);
        });
    });

    // ===== cave.blessed 测试 =====

    describe('mcpBlessed - 福地增益', () => {
        beforeEach(() => {
            service.init(gameState);
            service.mcpCreate({ tier: '中型' });
        });

        it('应返回福地信息列表', () => {
            // 添加一个测试福地
            gameState.caveRealm.blessedLands = [
                {
                    id: 'bl1',
                    name: '测试福地',
                    level: 2,
                    qiRegenBonus: 1.5,
                    cultivationBonus: 10,
                    createdAt: Date.now()
                }
            ];
            const result = service.mcpBlessed({});
            expect(result.success).toBe(true);
            expect(result.totalBlessedLands).toBe(1);
            expect(result.totalQiRegenBonus).toBe(1.5);
            expect(result.totalCultivationBonus).toBe(10);
        });

        it('应正确累加多个福地增益', () => {
            gameState.caveRealm.blessedLands = [
                { id: 'bl1', name: '福地1', level: 1, qiRegenBonus: 1.2, cultivationBonus: 5, createdAt: Date.now() },
                { id: 'bl2', name: '福地2', level: 2, qiRegenBonus: 1.5, cultivationBonus: 10, createdAt: Date.now() }
            ];
            const result = service.mcpBlessed({});
            expect(result.totalQiRegenBonus).toBe(1.8); // 1.2 * 1.5
            expect(result.totalCultivationBonus).toBe(15); // 5 + 10
        });

        it('尚未创建洞天应返回错误', () => {
            gameState.caveRealm.hasCave = false;
            gameState.caveRealm.cave = null;
            const result = service.mcpBlessed({});
            expect(result.success).toBe(false);
            expect(result.error).toBe('尚未创建洞天');
        });

        it('查询特定福地应返回详细信息', () => {
            gameState.caveRealm.blessedLands = [
                { id: 'bl1', name: '测试福地', level: 3, qiRegenBonus: 1.8, cultivationBonus: 20, createdAt: Date.now() }
            ];
            const result = service.mcpBlessed({ blessedLandId: 'bl1' });
            expect(result.success).toBe(true);
            expect(result.blessedLand.id).toBe('bl1');
            expect(result.blessedLand.levelName).toBe('福地大成');
        });

        it('查询不存在的福地应返回错误', () => {
            gameState.caveRealm.blessedLands = [
                { id: 'bl1', name: '测试福地', level: 1, qiRegenBonus: 1.2, cultivationBonus: 5, createdAt: Date.now() }
            ];
            const result = service.mcpBlessed({ blessedLandId: 'nonexistent' });
            expect(result.success).toBe(false);
            expect(result.error).toBe('福地不存在');
        });

        it('应返回blessedLands数组', () => {
            gameState.caveRealm.blessedLands = [
                { id: 'bl1', name: '福地', level: 1, qiRegenBonus: 1.2, cultivationBonus: 5, createdAt: Date.now() }
            ];
            const result = service.mcpBlessed({});
            expect(Array.isArray(result.blessedLands)).toBe(true);
            expect(result.blessedLands[0].levelName).toBeDefined();
        });
    });

    // ===== cave.spirit 测试 =====

    describe('mcpSpirit - 灵气充盈', () => {
        beforeEach(() => {
            service.init(gameState);
            service.mcpCreate({ tier: '中型' });
        });

        it('应成功充盈灵气', () => {
            const result = service.mcpSpirit({ amount: 100 });
            expect(result.success).toBe(true);
            expect(result.spirit.added).toBe(130); // 100 * 1.3 (中型spiritBonus)
            expect(result.spirit.bonusMultiplier).toBe(1.3);
        });

        it('应更新spiritBalance', () => {
            service.mcpSpirit({ amount: 100 });
            expect(gameState.caveRealm.spiritBalance).toBe(130);
        });

        it('默认amount应为100', () => {
            const result = service.mcpSpirit({});
            expect(result.success).toBe(true);
            expect(result.spirit.added).toBe(130);
        });

        it('尚未创建洞天应返回错误', () => {
            gameState.caveRealm.hasCave = false;
            gameState.caveRealm.cave = null;
            const result = service.mcpSpirit({ amount: 100 });
            expect(result.success).toBe(false);
            expect(result.error).toBe('尚未创建洞天');
        });

        it('amount小于等于0应返回错误', () => {
            const result = service.mcpSpirit({ amount: 0 });
            expect(result.success).toBe(false);
            expect(result.error).toBe('灵气数量必须大于0');
        });

        it('amount为负数应返回错误', () => {
            const result = service.mcpSpirit({ amount: -50 });
            expect(result.success).toBe(false);
            expect(result.error).toBe('灵气数量必须大于0');
        });

        it('应包含currentQi信息', () => {
            gameState.qi = 500;
            const result = service.mcpSpirit({ amount: 100 });
            expect(result.spirit.currentQi).toBe(500);
        });

        it('大型洞天应有2.0灵气倍率', () => {
            service.mcpExpand({ targetTier: '大型' });
            const result = service.mcpSpirit({ amount: 100 });
            expect(result.spirit.added).toBe(200);
            expect(result.spirit.bonusMultiplier).toBe(2.0);
        });
    });

    // ===== cave.harvest 测试 =====

    describe('mcpHarvest - 收获资源', () => {
        beforeEach(() => {
            service.init(gameState);
            service.mcpCreate({ tier: '中型' });
        });

        it('应成功收获成熟的资源', () => {
            gameState.caveRealm.resources = [
                { id: 'r1', type: 'spiritStone', amount: 10, readyAt: Date.now() - 1000 },
                { id: 'r2', type: 'qiCrystal', amount: 5, readyAt: Date.now() - 1000 }
            ];
            const result = service.mcpHarvest({});
            expect(result.success).toBe(true);
            expect(result.harvested.length).toBe(2);
            expect(result.totalHarvests).toBe(2);
        });

        it('收获灵石应增加玩家灵石', () => {
            gameState.caveRealm.resources = [
                { id: 'r1', type: 'spiritStone', amount: 10, readyAt: Date.now() - 1000 }
            ];
            const initialStones = gameState.spiritStones;
            service.mcpHarvest({});
            expect(gameState.spiritStones).toBe(initialStones + 10);
        });

        it('收获灵气结晶应增加玩家灵气', () => {
            gameState.caveRealm.resources = [
                { id: 'r1', type: 'qiCrystal', amount: 5, readyAt: Date.now() - 1000 }
            ];
            const initialQi = gameState.qi;
            service.mcpHarvest({});
            expect(gameState.qi).toBe(initialQi + 50); // 5 * 10
        });

        it('应移除已收获的资源', () => {
            gameState.caveRealm.resources = [
                { id: 'r1', type: 'spiritStone', amount: 10, readyAt: Date.now() - 1000 }
            ];
            service.mcpHarvest({});
            expect(gameState.caveRealm.resources.length).toBe(0);
        });

        it('尚未创建洞天应返回错误', () => {
            gameState.caveRealm.hasCave = false;
            gameState.caveRealm.cave = null;
            const result = service.mcpHarvest({});
            expect(result.success).toBe(false);
            expect(result.error).toBe('尚未创建洞天');
        });

        it('无可收获资源应返回成功但无收获', () => {
            gameState.caveRealm.resources = [
                { id: 'r1', type: 'spiritStone', amount: 10, readyAt: Date.now() + 10000 }
            ];
            const result = service.mcpHarvest({});
            expect(result.success).toBe(true);
            expect(result.message).toBe('暂无可收获的资源');
            expect(result.harvested.length).toBe(0);
        });

        it('指定resourceId收获应只收获该资源', () => {
            gameState.caveRealm.resources = [
                { id: 'r1', type: 'spiritStone', amount: 10, readyAt: Date.now() - 1000 },
                { id: 'r2', type: 'qiCrystal', amount: 5, readyAt: Date.now() - 1000 }
            ];
            const result = service.mcpHarvest({ resourceId: 'r1' });
            expect(result.success).toBe(true);
            expect(result.harvested.length).toBe(1);
            expect(result.harvested[0].id).toBe('r1');
        });

        it('收获不存在的资源应返回错误', () => {
            gameState.caveRealm.resources = [
                { id: 'r1', type: 'spiritStone', amount: 10, readyAt: Date.now() - 1000 }
            ];
            const result = service.mcpHarvest({ resourceId: 'nonexistent' });
            expect(result.success).toBe(false);
            expect(result.error).toBe('资源不存在');
        });

        it('收获未成熟的资源应返回错误', () => {
            gameState.caveRealm.resources = [
                { id: 'r1', type: 'spiritStone', amount: 10, readyAt: Date.now() + 10000 }
            ];
            const result = service.mcpHarvest({ resourceId: 'r1' });
            expect(result.success).toBe(false);
            expect(result.error).toBe('资源尚未成熟');
            expect(result.readyAt).toBeDefined();
            expect(result.remainingMs).toBeGreaterThan(0);
        });

        it('应返回remainingResources数量', () => {
            gameState.caveRealm.resources = [
                { id: 'r1', type: 'spiritStone', amount: 10, readyAt: Date.now() - 1000 },
                { id: 'r2', type: 'qiCrystal', amount: 5, readyAt: Date.now() + 10000 }
            ];
            const result = service.mcpHarvest({});
            expect(result.remainingResources).toBe(1);
        });
    });

    // ===== createCaveRealmService 工厂函数测试 =====

    describe('createCaveRealmService', () => {
        it('应创建CaveRealmService实例', () => {
            const newService = createCaveRealmService(gameState);
            expect(newService).toBeInstanceOf(CaveRealmService);
        });

        it('实例应能正确初始化', () => {
            const newService = createCaveRealmService(gameState);
            newService.init(gameState);
            expect(gameState.caveRealm).not.toBeNull();
        });
    });

    // ===== 辅助方法测试 =====

    describe('辅助方法', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('generateResourceId应生成唯一ID', () => {
            const id1 = service.generateResourceId();
            const id2 = service.generateResourceId();
            expect(id1).not.toBe(id2);
            expect(id1.startsWith('resource_')).toBe(true);
        });

        it('calculateRegenTime应正确计算再生时间', () => {
            const regenTime = service.calculateRegenTime('spiritStone', 1.5);
            expect(regenTime).toBe(2400000); // 3600000 / 1.5
        });

        it('calculateRegenTime对无效资源类型应返回0', () => {
            const regenTime = service.calculateRegenTime('invalidType', 1.0);
            expect(regenTime).toBe(0);
        });
    });

    // ===== 边缘情况测试 =====

    describe('边缘情况', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('连续扩展洞天应正确累加', () => {
            service.mcpCreate({ tier: '小型' });
            service.mcpExpand({ targetTier: '中型' });
            service.mcpExpand({ targetTier: '大型' });
            expect(gameState.caveRealm.cave.tier).toBe('大型');
            expect(gameState.caveRealm.cave.capacity).toBe(10);
        });

        it('多次收获应正确累加totalHarvests', () => {
            gameState.caveRealm.resources = [
                { id: 'r1', type: 'spiritStone', amount: 10, readyAt: Date.now() - 1000 }
            ];
            service.mcpHarvest({});
            gameState.caveRealm.resources = [
                { id: 'r2', type: 'spiritStone', amount: 20, readyAt: Date.now() - 1000 }
            ];
            service.mcpHarvest({});
            expect(gameState.caveRealm.totalHarvests).toBe(2);
        });

        it('洞天满资源槽时mcpResource应正确显示', () => {
            // 中型洞天有6个资源槽
            const resources = [];
            for (let i = 0; i < 6; i++) {
                resources.push({ id: `r${i}`, type: 'spiritStone', amount: 10, readyAt: Date.now() - 1000 });
            }
            gameState.caveRealm.resources = resources;
            const result = service.mcpResource({});
            expect(result.cave.resourceSlotsUsed).toBe(6);
            expect(result.cave.resourceSlotsAvailable).toBe(0);
        });

        it('灵气充盈多次应累加spiritBalance', () => {
            service.mcpSpirit({ amount: 100 });
            service.mcpSpirit({ amount: 200 });
            expect(gameState.caveRealm.spiritBalance).toBe(130 + 260); // 100*1.3 + 200*1.3
        });

        it('收获历史harvestHistory应正确记录', () => {
            gameState.caveRealm.resources = [
                { id: 'r1', type: 'spiritStone', amount: 10, readyAt: Date.now() - 1000 }
            ];
            service.mcpHarvest({});
            expect(service.harvestHistory.length).toBe(1);
            expect(service.harvestHistory[0].id).toBe('r1');
        });
    });
});