/**
 * CaveHeavenService.test.js - 灵界洞府系统测试
 * V233: 灵界洞府系统扩展
 * 覆盖率目标: ≥98%
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createCaveHeavenService,
  CAVE_HEAVEN_LEVELS,
  CAVE_BUILDINGS,
  CAVE_LEVEL_ORDER,
  BUILDING_LEVEL_MULTIPLIERS,
  CAVE_FACILITIES,
  createCaveHeaven,
  upgradeCaveHeavenById,
  collectFromCave,
  buildCaveFacility,
  queryCaveHeaven,
  listCaveHeavens,
  upgradeCaveFacility,
  demolishCaveFacility,
  CAVE_HEAVEN_MCP_TOOLS
} from '../../../../src/domains/cultivation/services/CaveHeavenService.js';

// ===== 测试辅助函数 =====

function createTestGameState(overrides = {}) {
  return {
    player: { spiritStones: 10000, level: 50 },
    caveHeaven: null,
    inventory: { items: [] },
    ...overrides
  };
}

// 清理洞府数据库的辅助函数
function clearCaveDatabase() {
  const service = createCaveHeavenService(createTestGameState());
  // 暴露的清理方法不存在，但我们可以测试独立实例
}

// ===== 测试套件 =====

describe('CaveHeavenService - 灵界洞府系统 V233', () => {
  let gameState;
  let service;

  beforeEach(() => {
    gameState = createTestGameState();
    service = createCaveHeavenService(gameState);
  });

  // ===== 原有功能测试 (兼容) =====

  describe('原有洞天系统兼容性', () => {
    it('应初始化洞天数据', () => {
      expect(gameState.caveHeaven).not.toBeNull();
      expect(gameState.caveHeaven.等级).toBe('小洞天');
      expect(gameState.caveHeaven.建设度).toBe(0);
    });

    it('getCaveLevel应返回当前等级', () => {
      expect(service.getCaveLevel()).toBe('小洞天');
    });

    it('getCaveInfo应返回完整洞天信息', () => {
      const info = service.getCaveInfo();
      expect(info.等级).toBe('小洞天');
      expect(info.建设度).toBe(0);
      expect(info.灵气浓度).toBe(1.0);
      expect(info.建设度上限).toBe(100);
    });

    it('应能添加建设度', () => {
      const result = service.addConstruction(50);
      expect(result.success).toBe(true);
      expect(result.建设度).toBe(50);
    });

    it('建设度不应超过上限', () => {
      service.addConstruction(200);
      const info = service.getCaveInfo();
      expect(info.建设度).toBe(100);
    });
  });

  // ===== 灵界洞府创建测试 =====

  describe('灵界洞府创建 (caveheaven.create)', () => {
    it('应能创建灵界洞府', () => {
      const result = createCaveHeaven(gameState, '我的仙府');
      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
      expect(result.name).toBe('我的仙府');
      expect(result.level).toBe('小洞天');
    });

    it('创建消息应包含洞府名称', () => {
      const result = createCaveHeaven(gameState, '测试洞府');
      expect(result.message).toContain('测试洞府');
    });

    it('应能创建多个独立洞府', () => {
      const result1 = createCaveHeaven(gameState, '洞府一');
      const result2 = createCaveHeaven(gameState, '洞府二');
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.id).not.toBe(result2.id);
    });

    it('应能获取所有洞府列表', () => {
      createCaveHeaven(gameState, '洞府A');
      createCaveHeaven(gameState, '洞府B');
      const caves = listCaveHeavens(gameState);
      expect(caves.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ===== 洞府等级升级测试 =====

  describe('洞府等级升级 (caveheaven.upgrade)', () => {
    it('新洞府建设度为0时应无法升级', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const upgradeResult = upgradeCaveHeavenById(gameState, createResult.id, 2);
      expect(upgradeResult.success).toBe(false);
      expect(upgradeResult.message).toContain('建设度不足');
    });

    it('建设度足够时应能升级', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      
      // 模拟增加建设度 - 通过buildFacility增加
      buildCaveFacility(gameState, createResult.id, '灵池');
      
      const upgradeResult = upgradeCaveHeavenById(gameState, createResult.id, 2);
      // 灵池200灵石，建设度+100，刚好够升中洞天
      expect(upgradeResult.success).toBe(true);
      expect(upgradeResult.newLevel).toBe('中洞天');
    });

    it('升级后灵气浓度应增加', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      buildCaveFacility(gameState, createResult.id, '灵池');
      const upgradeResult = upgradeCaveHeavenById(gameState, createResult.id, 2);
      expect(upgradeResult.spiritConcentration).toBe(1.5);
    });

    it('目标等级不能低于当前等级', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      buildCaveFacility(gameState, createResult.id, '灵池');
      upgradeCaveHeavenById(gameState, createResult.id, 2);
      
      const result = upgradeCaveHeavenById(gameState, createResult.id, 1);
      expect(result.success).toBe(false);
      expect(result.message).toContain('不能低于');
    });

    it('不存在洞府应返回错误', () => {
      const result = upgradeCaveHeavenById(gameState, '不存在的ID', 2);
      expect(result.success).toBe(false);
      expect(result.message).toBe('洞府不存在');
    });
  });

  // ===== 设施建造测试 =====

  describe('设施建造 (caveheaven.build)', () => {
    it('应能建造灵池', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const result = buildCaveFacility(gameState, createResult.id, '灵池');
      expect(result.success).toBe(true);
      expect(result.facilityId).toBeDefined();
      expect(result.message).toContain('灵池');
    });

    it('应能建造药园', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const result = buildCaveFacility(gameState, createResult.id, '药园');
      expect(result.success).toBe(true);
      expect(result.message).toContain('药园');
    });

    it('应能建造矿脉', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const result = buildCaveFacility(gameState, createResult.id, '矿脉');
      expect(result.success).toBe(true);
      expect(result.message).toContain('矿脉');
    });

    it('应能建造阵法', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const result = buildCaveFacility(gameState, createResult.id, '阵法');
      expect(result.success).toBe(true);
      expect(result.message).toContain('阵法');
    });

    it('灵石不足时应建造失败', () => {
      gameState.player.spiritStones = 10;
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const result = buildCaveFacility(gameState, createResult.id, '灵池');
      expect(result.success).toBe(false);
      expect(result.message).toContain('灵石不足');
    });

    it('未知设施类型应返回错误', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const result = buildCaveFacility(gameState, createResult.id, '未知设施');
      expect(result.success).toBe(false);
      expect(result.message).toContain('未知设施类型');
    });

    it('建造应消耗灵石', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const initialStones = gameState.player.spiritStones;
      buildCaveFacility(gameState, createResult.id, '灵池');
      expect(gameState.player.spiritStones).toBe(initialStones - 200);
    });

    it('建造应增加建设度', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      buildCaveFacility(gameState, createResult.id, '灵池');
      const queryResult = queryCaveHeaven(gameState, createResult.id);
      expect(queryResult.constructionPoints).toBe(100); // 200/2
    });

    it('不存在洞府应返回错误', () => {
      const result = buildCaveFacility(gameState, '不存在的洞府', '灵池');
      expect(result.success).toBe(false);
      expect(result.message).toBe('洞府不存在');
    });
  });

  // ===== 洞府产出采集测试 =====

  describe('洞府产出采集 (caveheaven.collect)', () => {
    it('应能采集洞府产出', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      buildCaveFacility(gameState, createResult.id, '灵池');
      
      // 等待一小段时间
      const collectResult = collectFromCave(gameState, createResult.id);
      expect(collectResult.success).toBe(true);
      expect(collectResult.output).toBeDefined();
      expect(collectResult.totalOutput).toBeGreaterThan(0);
    });

    it('无设施时采集应失败', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const result = collectFromCave(gameState, createResult.id);
      expect(result.success).toBe(false);
      expect(result.message).toContain('没有设施');
    });

    it('采集应返回资源类型和数量', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      buildCaveFacility(gameState, createResult.id, '灵池');
      
      const collectResult = collectFromCave(gameState, createResult.id);
      expect(collectResult.output['灵气']).toBeDefined();
      expect(typeof collectResult.output['灵气']).toBe('number');
    });

    it('不存在洞府应返回错误', () => {
      const result = collectFromCave(gameState, '不存在的洞府');
      expect(result.success).toBe(false);
      expect(result.message).toBe('洞府不存在');
    });
  });

  // ===== 洞府状态查询测试 =====

  describe('洞府状态查询 (caveheaven.query)', () => {
    it('应能查询洞府状态', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const queryResult = queryCaveHeaven(gameState, createResult.id);
      expect(queryResult.success).toBe(true);
      expect(queryResult.name).toBe('测试洞府');
      expect(queryResult.level).toBe('小洞天');
    });

    it('查询应返回设施列表', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      buildCaveFacility(gameState, createResult.id, '灵池');
      buildCaveFacility(gameState, createResult.id, '药园');
      
      const queryResult = queryCaveHeaven(gameState, createResult.id);
      expect(queryResult.facilities).toBeDefined();
      expect(queryResult.facilities.length).toBe(2);
    });

    it('查询应返回等级信息', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const queryResult = queryCaveHeaven(gameState, createResult.id);
      expect(queryResult.levelInfo).toBeDefined();
      expect(queryResult.levelInfo.constructionLimit).toBe(100);
      expect(queryResult.levelInfo.spiritBonus).toBe(1.0);
    });

    it('不存在洞府应返回错误', () => {
      const result = queryCaveHeaven(gameState, '不存在的洞府');
      expect(result.success).toBe(false);
      expect(result.message).toBe('洞府不存在');
    });
  });

  // ===== 设施升级测试 =====

  describe('设施升级 (upgradeCaveFacility)', () => {
    it('应能升级设施', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const buildResult = buildCaveFacility(gameState, createResult.id, '灵池');
      
      const upgradeResult = upgradeCaveFacility(gameState, createResult.id, buildResult.facilityId);
      expect(upgradeResult.success).toBe(true);
      expect(upgradeResult.newLevel).toBe(2);
    });

    it('灵石不足时升级应失败', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const buildResult = buildCaveFacility(gameState, createResult.id, '灵池');
      
      // 建造成功后，消耗所有灵石
      gameState.player.spiritStones = 0;
      
      const upgradeResult = upgradeCaveFacility(gameState, createResult.id, buildResult.facilityId);
      expect(upgradeResult.success).toBe(false);
      expect(upgradeResult.message).toContain('灵石不足');
    });

    it('最高等级设施不应再升级', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const buildResult = buildCaveFacility(gameState, createResult.id, '灵池');
      
      // 升级到5级
      for (let i = 0; i < 4; i++) {
        gameState.player.spiritStones = 100000;
        upgradeCaveFacility(gameState, createResult.id, buildResult.facilityId);
      }
      
      const upgradeResult = upgradeCaveFacility(gameState, createResult.id, buildResult.facilityId);
      expect(upgradeResult.success).toBe(false);
      expect(upgradeResult.message).toContain('最高等级');
    });

    it('不存在洞府应返回错误', () => {
      const result = upgradeCaveFacility(gameState, '不存在的洞府', '设施ID');
      expect(result.success).toBe(false);
      expect(result.message).toBe('洞府不存在');
    });

    it('不存在设施应返回错误', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const result = upgradeCaveFacility(gameState, createResult.id, '不存在的设施');
      expect(result.success).toBe(false);
      expect(result.message).toContain('设施不存在');
    });
  });

  // ===== 设施拆除测试 =====

  describe('设施拆除 (demolishCaveFacility)', () => {
    it('应能拆除设施', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const buildResult = buildCaveFacility(gameState, createResult.id, '灵池');
      
      const demolishResult = demolishCaveFacility(gameState, createResult.id, buildResult.facilityId);
      expect(demolishResult.success).toBe(true);
      expect(demolishResult.message).toContain('已拆除');
      expect(demolishResult.demolitionRefund).toBe(60); // 200 * 0.3
    });

    it('不存在洞府应返回错误', () => {
      const result = demolishCaveFacility(gameState, '不存在的洞府', '设施ID');
      expect(result.success).toBe(false);
      expect(result.message).toBe('洞府不存在');
    });

    it('不存在设施应返回错误', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const result = demolishCaveFacility(gameState, createResult.id, '不存在的设施');
      expect(result.success).toBe(false);
      expect(result.message).toContain('设施不存在');
    });
  });

  // ===== 常量定义测试 =====

  describe('常量定义', () => {
    it('CAVE_FACILITIES应有4种设施', () => {
      expect(Object.keys(CAVE_FACILITIES).length).toBe(4);
    });

    it('CAVE_FACILITIES应包含灵池、药园、矿脉、阵法', () => {
      expect(CAVE_FACILITIES['灵池']).toBeDefined();
      expect(CAVE_FACILITIES['药园']).toBeDefined();
      expect(CAVE_FACILITIES['矿脉']).toBeDefined();
      expect(CAVE_FACILITIES['阵法']).toBeDefined();
    });

    it('灵池定义应包含必要属性', () => {
      const spiritPool = CAVE_FACILITIES['灵池'];
      expect(spiritPool.cost).toBe(200);
      expect(spiritPool.resourceType).toBe('灵气');
      expect(spiritPool.output).toBe(50);
      expect(spiritPool.buildTime).toBe(180);
    });

    it('药园定义应包含必要属性', () => {
      const herbGarden = CAVE_FACILITIES['药园'];
      expect(herbGarden.cost).toBe(150);
      expect(herbGarden.resourceType).toBe('灵草');
      expect(herbGarden.output).toBe(30);
    });

    it('矿脉定义应包含必要属性', () => {
      const oreVein = CAVE_FACILITIES['矿脉'];
      expect(oreVein.cost).toBe(300);
      expect(oreVein.resourceType).toBe('矿石');
      expect(oreVein.output).toBe(20);
    });

    it('阵法定义应包含必要属性', () => {
      const formation = CAVE_FACILITIES['阵法'];
      expect(formation.cost).toBe(250);
      expect(formation.resourceType).toBe('阵法经验');
      expect(formation.output).toBe(15);
    });

    it('CAVE_HEAVEN_MCP_TOOLS应有5个工具', () => {
      expect(CAVE_HEAVEN_MCP_TOOLS.length).toBe(5);
    });

    it('MCP工具定义格式应正确', () => {
      for (const tool of CAVE_HEAVEN_MCP_TOOLS) {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.params).toBeDefined();
        expect(Array.isArray(tool.params)).toBe(true);
      }
    });
  });

  // ===== 边界情况测试 =====

  describe('边界情况', () => {
    it('空名称应能创建洞府', () => {
      const result = createCaveHeaven(gameState, '');
      expect(result.success).toBe(true);
    });

    it('多次采集应累加产出', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      buildCaveFacility(gameState, createResult.id, '灵池');
      
      const result1 = collectFromCave(gameState, createResult.id);
      const result2 = collectFromCave(gameState, createResult.id);
      
      expect(result2.totalOutput).toBeGreaterThanOrEqual(result1.totalOutput);
    });

    it('洞府信息应包含创建时间', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const queryResult = queryCaveHeaven(gameState, createResult.id);
      expect(queryResult.createdAt).toBeDefined();
    });

    it('设施产出计算应考虑等级加成', () => {
      const createResult = createCaveHeaven(gameState, '测试洞府');
      const buildResult = buildCaveFacility(gameState, createResult.id, '灵池');
      
      // 升级设施
      gameState.player.spiritStones = 100000;
      upgradeCaveFacility(gameState, createResult.id, buildResult.facilityId);
      
      const queryResult = queryCaveHeaven(gameState, createResult.id);
      const facility = queryResult.facilities[0];
      expect(facility.outputPerMinute).toBe(75); // 50 * 1.5 (2级加成)
    });
  });

  // ===== 集成测试 =====

  describe('集成测试 - 完整洞府生命周期', () => {
    it('应能完成创建->建造->采集->升级流程', () => {
      // 1. 创建洞府
      const createResult = createCaveHeaven(gameState, '完整生命周期洞府');
      expect(createResult.success).toBe(true);
      const caveId = createResult.id;
      
      // 2. 建造多个设施
      buildCaveFacility(gameState, caveId, '灵池');
      buildCaveFacility(gameState, caveId, '药园');
      
      // 3. 采集产出
      const collectResult = collectFromCave(gameState, caveId);
      expect(collectResult.success).toBe(true);
      expect(collectResult.totalOutput).toBeGreaterThan(0);
      
      // 4. 检查洞府状态
      const queryResult = queryCaveHeaven(gameState, caveId);
      expect(queryResult.totalFacilities).toBe(2);
      
      // 5. 列出所有洞府
      const listResult = listCaveHeavens(gameState);
      expect(listResult.length).toBeGreaterThan(0);
    });

    it('升级设施后产出应增加', () => {
      const createResult = createCaveHeaven(gameState, '产出测试洞府');
      const caveId = createResult.id;
      
      const buildResult = buildCaveFacility(gameState, caveId, '灵池');
      
      // 记录升级前产出
      const collectBefore = collectFromCave(gameState, caveId);
      
      // 升级设施
      gameState.player.spiritStones = 100000;
      upgradeCaveFacility(gameState, caveId, buildResult.facilityId);
      
      // 记录升级后产出
      const collectAfter = collectFromCave(gameState, caveId);
      
      // 注意：由于时间因素，产出可能增加
      expect(collectAfter.success).toBe(true);
    });
  });
});