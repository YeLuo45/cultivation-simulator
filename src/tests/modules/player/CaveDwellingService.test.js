/**
 * CaveDwellingService.test.js - TDD测试
 * V233 Direction U: 灵界洞府系统测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
    CaveDwellingService, 
    createCaveDwellingService,
    CAVE_LOCATIONS,
    CAVE_SCALES,
    CAVE_LEVEL_CONFIG,
    LOCATION_BLESSING_CONFIG
} from '../../../../src/domains/player/services/CaveDwellingService.js';

// ===== 测试辅助函数 =====

/**
 * 创建测试用gameState
 */
function createTestGameState(overrides = {}) {
    return {
        spiritStones: 100000,
        player: { name: '测试修士' },
        residence: {
            hasResidence: false,
            residence: null,
            upgradeLevel: 0,
            location: null,
            scale: null,
            builtAt: null,
            lastVisitAt: null,
            totalBlessings: 0,
            visitors: [],
            tradeOffers: [],
            residences: []
        },
        ...overrides
    };
}

// ===== 测试套件 =====

describe('CaveDwellingService', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createTestGameState();
        service = new CaveDwellingService(gameState);
    });

    // ===== 常量验证测试 =====

    describe('常量配置', () => {
        it('CAVE_LOCATIONS 应包含5个位置', () => {
            expect(CAVE_LOCATIONS).toEqual(['秘境', '仙山', '海底', '深渊', '云端']);
        });

        it('CAVE_SCALES 应包含4个规模', () => {
            expect(CAVE_SCALES).toEqual(['小型', '中型', '大型', '洞天']);
        });

        it('CAVE_LEVEL_CONFIG 应包含1-5级配置', () => {
            expect(Object.keys(CAVE_LEVEL_CONFIG).length).toBe(5);
            expect(CAVE_LEVEL_CONFIG[1]).toEqual({
                name: '初成',
                cultivationBonus: 5,
                spiritStoneCost: 500,
                materials: expect.arrayContaining(['灵石x100', '灵木x20'])
            });
        });

        it('LOCATION_BLESSING_CONFIG 应包含所有位置的加成配置', () => {
            expect(Object.keys(LOCATION_BLESSING_CONFIG).length).toBe(5);
            expect(LOCATION_BLESSING_CONFIG['秘境']).toEqual({
                primaryBonus: 'serendipity',
                secondaryBonus: 'cultivation',
                cultivationBonus: 1.5,
                serendipityBonus: 2.0,
                description: '秘境洞府 - 奇遇加成'
            });
        });
    });

    // ===== 初始化测试 =====

    describe('init', () => {
        it('应初始化 residence 状态', () => {
            const result = service.init(gameState);
            expect(gameState.residence).not.toBeNull();
            expect(gameState.residence.hasResidence).toBe(false);
        });

        it('已存在的 residence 状态不应被覆盖', () => {
            gameState.residence = {
                hasResidence: true,
                residence: { id: 'test_123', name: '已有洞府' },
                residences: [{ id: 'test_123' }]
            };
            service.init(gameState);
            expect(gameState.residence.hasResidence).toBe(true);
            expect(gameState.residence.residence.name).toBe('已有洞府');
        });

        it('residences 数组应被正确初始化', () => {
            service.init(gameState);
            expect(gameState.residence.residences).toEqual([]);
        });
    });

    // ===== residence.build 测试 =====

    describe('mcpBuild - 建造洞府', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('应成功建造洞府', () => {
            const result = service.mcpBuild({
                location: '秘境',
                scale: '中型'
            });
            expect(result.success).toBe(true);
            expect(result.residence).not.toBeNull();
            expect(result.residence.location).toBe('秘境');
            expect(result.residence.scale).toBe('中型');
            expect(result.residence.level).toBe(1);
        });

        it('无效位置应返回错误', () => {
            const result = service.mcpBuild({
                location: '无效位置',
                scale: '中型'
            });
            expect(result.success).toBe(false);
            expect(result.error).toBe('无效的洞府位置');
            expect(result.validLocations).toEqual(CAVE_LOCATIONS);
        });

        it('无效规模应返回错误', () => {
            const result = service.mcpBuild({
                location: '秘境',
                scale: '超大'
            });
            expect(result.success).toBe(false);
            expect(result.error).toBe('无效的洞府规模');
        });

        it('灵石不足应返回错误', () => {
            gameState.spiritStones = 100;
            const result = service.mcpBuild({
                location: '秘境',
                scale: '中型'
            });
            expect(result.success).toBe(false);
            expect(result.error).toBe('灵石不足');
        });

        it('建造后 gameState.residence 应更新', () => {
            service.mcpBuild({
                location: '仙山',
                scale: '大型'
            });
            expect(gameState.residence.hasResidence).toBe(true);
            expect(gameState.residence.location).toBe('仙山');
            expect(gameState.residence.scale).toBe('大型');
        });

        it('可使用自定义名称', () => {
            const result = service.mcpBuild({
                location: '海底',
                scale: '小型',
                customName: '我的海底宫殿'
            });
            expect(result.residence.name).toBe('我的海底宫殿');
        });

        it('建造后灵石应扣除', () => {
            const initialStones = gameState.spiritStones;
            service.mcpBuild({
                location: '秘境',
                scale: '小型'
            });
            expect(gameState.spiritStones).toBe(initialStones - CAVE_LEVEL_CONFIG[1].spiritStoneCost);
        });
    });

    // ===== residence.upgrade 测试 =====

    describe('mcpUpgrade - 升级洞府', () => {
        beforeEach(() => {
            service.init(gameState);
            service.mcpBuild({ location: '秘境', scale: '中型' });
        });

        it('应成功升级洞府', () => {
            const result = service.mcpUpgrade({});
            expect(result.success).toBe(true);
            expect(result.upgrade.fromLevel).toBe(1);
            expect(result.upgrade.toLevel).toBe(2);
        });

        it('未建造洞府应返回错误', () => {
            gameState.residence.hasResidence = false;
            const result = service.mcpUpgrade({});
            expect(result.success).toBe(false);
            expect(result.error).toBe('尚未建造洞府');
        });

        it('已最高级应返回错误', () => {
            // 直接设置为5级
            gameState.residence.residence.level = 5;
            gameState.residence.upgradeLevel = 5;
            const result = service.mcpUpgrade({});
            expect(result.success).toBe(false);
            expect(result.error).toBe('洞府已达到最高等级(5级)');
        });

        it('灵石不足应返回错误', () => {
            gameState.spiritStones = 100;
            const result = service.mcpUpgrade({});
            expect(result.success).toBe(false);
            expect(result.error).toBe('灵石不足');
            expect(result.shortfall).toBeGreaterThan(0);
        });

        it('升级后 levelConfig 应更新', () => {
            service.mcpUpgrade({});
            expect(gameState.residence.residence.level).toBe(2);
            expect(gameState.residence.upgradeLevel).toBe(2);
        });
    });

    // ===== residence.query 测试 =====

    describe('mcpQuery - 查询洞府状态', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('未建造洞府应返回 hasResidence=false', () => {
            const result = service.mcpQuery({});
            expect(result.hasResidence).toBe(false);
        });

        it('已建造洞府应返回完整信息', () => {
            service.mcpBuild({ location: '仙山', scale: '大型' });
            const result = service.mcpQuery({});
            expect(result.hasResidence).toBe(true);
            expect(result.residence).not.toBeNull();
            expect(result.residence.location).toBe('仙山');
            expect(result.residence.scale).toBe('大型');
        });

        it('detailed=true时应返回详细信息', () => {
            service.mcpBuild({ location: '秘境', scale: '中型' });
            const result = service.mcpQuery({ detailed: true });
            expect(result.detailed).not.toBeNull();
            expect(result.detailed.nextLevelUpgrade).not.toBeNull();
        });

        it('detailed=true时应包含下一级升级信息', () => {
            service.mcpBuild({ location: '秘境', scale: '中型' });
            const result = service.mcpQuery({ detailed: true });
            expect(result.detailed.nextLevelUpgrade.level).toBe(2);
            expect(result.detailed.nextLevelUpgrade.cost).toBe(CAVE_LEVEL_CONFIG[2].spiritStoneCost);
        });

        it('5级洞府 detailed 不应有下一级升级信息', () => {
            service.mcpBuild({ location: '秘境', scale: '中型' });
            gameState.residence.residence.level = 5;
            const result = service.mcpQuery({ detailed: true });
            expect(result.detailed.nextLevelUpgrade).toBeNull();
        });
    });

    // ===== residence.blessing 测试 =====

    describe('mcpBlessing - 获取洞府加成', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('未建造洞府应返回错误', () => {
            const result = service.mcpBlessing({});
            expect(result.success).toBe(false);
            expect(result.error).toBe('尚未建造洞府');
        });

        it('已建造洞府应返回加成信息', () => {
            service.mcpBuild({ location: '秘境', scale: '中型' });
            const result = service.mcpBlessing({});
            expect(result.success).toBe(true);
            expect(result.blessings).not.toBeNull();
            expect(result.blessings.cultivation).not.toBeNull();
        });

        it('可查询特定类型加成', () => {
            service.mcpBuild({ location: '秘境', scale: '中型' });
            const result = service.mcpBlessing({ type: 'cultivation' });
            expect(result.success).toBe(true);
            expect(result.blessing.bonus).toBeGreaterThan(0);
        });

        it('应返回所有加成类型', () => {
            service.mcpBuild({ location: '秘境', scale: '中型' });
            const result = service.mcpBlessing({});
            expect(result.blessings.cultivation).not.toBeNull();
            expect(result.blessings.location).not.toBeNull();
            expect(result.blessings.total).not.toBeNull();
        });
    });

    // ===== residence.visit 测试 =====

    describe('mcpVisit - 拜访他人洞府', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('应成功拜访洞府', () => {
            const result = service.mcpVisit({ hostId: 'npc_001', hostName: '神秘修士' });
            expect(result.success).toBe(true);
            expect(result.visit.hostId).toBe('npc_001');
        });

        it('应返回拜访奖励', () => {
            const result = service.mcpVisit({});
            expect(result.rewards).not.toBeNull();
            expect(result.rewards.spiritStones).toBeGreaterThanOrEqual(0);
        });

        it('拜访记录应被保存', () => {
            service.mcpBuild({ location: '秘境', scale: '中型' });
            const initialVisits = gameState.residence.residence.totalVisits || 0;
            service.mcpVisit({});
            expect(gameState.residence.residence.totalVisits).toBe(initialVisits + 1);
        });

        it('应返回消息提示', () => {
            const result = service.mcpVisit({ hostName: '张三' });
            expect(result.message).toContain('张三');
        });
    });

    // ===== residence.trade 测试 =====

    describe('mcpTrade - 洞府资源交易', () => {
        beforeEach(() => {
            service.init(gameState);
            service.mcpBuild({ location: '秘境', scale: '中型' });
        });

        it('未建造洞府应返回错误', () => {
            gameState.residence.hasResidence = false;
            const result = service.mcpTrade({ resourceType: 'spiritStones', amount: 10, price: 100 });
            expect(result.success).toBe(false);
            expect(result.error).toBe('尚未建造洞府，无法进行交易');
        });

        it('无效资源类型应返回错误', () => {
            const result = service.mcpTrade({ resourceType: 'invalid', amount: 10, price: 100 });
            expect(result.success).toBe(false);
            expect(result.error).toBe('无效的交易资源类型');
        });

        it('list action 应返回挂单列表', () => {
            const result = service.mcpTrade({ action: 'list' });
            expect(result.success).toBe(true);
            expect(result.action).toBe('list');
            expect(Array.isArray(result.offers)).toBe(true);
        });

        it('amount <= 0 应返回错误', () => {
            const result = service.mcpTrade({ resourceType: 'spiritStones', amount: 0, price: 100 });
            expect(result.success).toBe(false);
            expect(result.error).toBe('交易数量必须大于0');
        });

        it('price <= 0 应返回错误', () => {
            const result = service.mcpTrade({ resourceType: 'spiritStones', amount: 10, price: 0 });
            expect(result.success).toBe(false);
            expect(result.error).toBe('交易价格必须大于0');
        });

        it('execute action 应执行交易', () => {
            const result = service.mcpTrade({
                action: 'execute',
                resourceType: 'materials',
                amount: 5,
                price: 100
            });
            expect(result.success).toBe(true);
            expect(result.trade).not.toBeNull();
        });

        it('execute 时灵石不足应返回错误', () => {
            gameState.spiritStones = 50;
            const result = service.mcpTrade({
                action: 'execute',
                resourceType: 'spiritStones',
                amount: 10,
                price: 100
            });
            expect(result.success).toBe(false);
            expect(result.error).toBe('灵石不足');
        });

        it('默认 action 应创建交易挂单', () => {
            const result = service.mcpTrade({
                resourceType: 'pills',
                amount: 20,
                price: 50
            });
            expect(result.success).toBe(true);
            expect(result.offer).not.toBeNull();
            expect(result.offer.resourceType).toBe('pills');
        });
    });

    // ===== 辅助方法测试 =====

    describe('calculateBlessing', () => {
        it('应正确计算洞府加成', () => {
            const blessing = service.calculateBlessing('秘境', '中型', 1);
            expect(blessing.cultivationBonus).toBeGreaterThan(0);
            expect(blessing.serendipityBonus).toBe(2.0);
        });

        it('不同规模应有不同加成系数', () => {
            const small = service.calculateBlessing('秘境', '小型', 1);
            const large = service.calculateBlessing('秘境', '大型', 1);
            expect(large.cultivationBonus).toBeGreaterThan(small.cultivationBonus);
        });

        it('不同位置应有不同加成类型', () => {
            const 秘境 = service.calculateBlessing('秘境', '中型', 1);
            const 海底 = service.calculateBlessing('海底', '中型', 1);
            expect(秘境.serendipityBonus).toBe(2.0);
            expect(海底.qiBonus).toBe(2.0);
        });
    });

    describe('calculateCombinedBonus', () => {
        it('应返回综合加成值', () => {
            const residence = {
                blessings: { cultivationBonus: 10 }
            };
            const locationConfig = { cultivationBonus: 1.5 };
            const combined = service.calculateCombinedBonus(residence, locationConfig);
            expect(combined).toBe(15);
        });
    });

    // ===== getMCPHandlers 测试 =====

    describe('getMCPHandlers', () => {
        it('应返回6个MCP工具处理器', () => {
            const handlers = service.getMCPHandlers();
            const handlerNames = Object.keys(handlers);
            expect(handlerNames).toContain('residence.build');
            expect(handlerNames).toContain('residence.upgrade');
            expect(handlerNames).toContain('residence.query');
            expect(handlerNames).toContain('residence.blessing');
            expect(handlerNames).toContain('residence.visit');
            expect(handlerNames).toContain('residence.trade');
            expect(handlerNames.length).toBe(6);
        });

        it('每个处理器都应是函数', () => {
            const handlers = service.getMCPHandlers();
            for (const handler of Object.values(handlers)) {
                expect(typeof handler).toBe('function');
            }
        });
    });

    // ===== createCaveDwellingService 工厂函数测试 =====

    describe('createCaveDwellingService', () => {
        it('应创建并初始化服务实例', () => {
            const newService = createCaveDwellingService(gameState);
            expect(newService).toBeInstanceOf(CaveDwellingService);
            expect(gameState.residence).not.toBeNull();
        });
    });

    // ===== 边界条件测试 =====

    describe('边界条件', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('重复建造洞府应覆盖旧洞府', () => {
            service.mcpBuild({ location: '秘境', scale: '小型' });
            const firstResidence = gameState.residence.residence;
            
            service.mcpBuild({ location: '仙山', scale: '大型' });
            const secondResidence = gameState.residence.residence;
            
            expect(secondResidence.id).not.toBe(firstResidence.id);
            expect(secondResidence.location).toBe('仙山');
        });

        it('连续升级应正确累加', () => {
            service.mcpBuild({ location: '秘境', scale: '中型' });
            
            service.mcpUpgrade({});
            expect(gameState.residence.residence.level).toBe(2);
            
            service.mcpUpgrade({});
            expect(gameState.residence.residence.level).toBe(3);
        });

        it('多次拜访应有累积奖励', () => {
            service.mcpBuild({ location: '秘境', scale: '中型' });
            gameState.residence.residence.level = 3;
            
            const result1 = service.mcpVisit({});
            const result2 = service.mcpVisit({});
            
            expect(result2.rewards.spiritStones).toBeGreaterThanOrEqual(result1.rewards.spiritStones);
        });

        it('多次挂单应有多个offer', () => {
            service.mcpBuild({ location: '秘境', scale: '中型' });
            
            service.mcpTrade({ resourceType: 'spiritStones', amount: 10, price: 100 });
            service.mcpTrade({ resourceType: 'pills', amount: 5, price: 200 });
            
            const result = service.mcpTrade({ action: 'list' });
            expect(result.success).toBe(true);
            expect(result.offers).toBeDefined();
            expect(result.offers.length).toBeGreaterThanOrEqual(2);
        });
    });
});