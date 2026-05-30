/**
 * CaveHeavenService.test.js - 仙府洞天+洞府经营系统测试
 * V245: 仙府洞天+洞府经营
 * 覆盖率目标: ≥98%
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CaveHeavenService,
  createCaveHeavenService,
  CAVE_HEAVEN_LEVELS,
  CAVE_BUILDINGS,
  CAVE_LEVEL_ORDER,
  BUILDING_LEVEL_MULTIPLIERS,
  getCaveHeavenInfo,
  upgradeCaveHeaven,
  buildCaveBuilding,
  upgradeCaveBuilding,
  listCaveBuildings,
  getCaveOutput,
  addCaveConstruction
} from '../../../../src/domains/cultivation/services/CaveHeavenService.js';

// ===== 测试辅助函数 =====

function createTestGameState(overrides = {}) {
  return {
    player: { spiritStones: 1000, level: 1 },
    caveHeaven: null,
    ...overrides
  };
}

// ===== 测试套件 =====

describe('CaveHeavenService', () => {
  let gameState;
  let service;

  beforeEach(() => {
    gameState = createTestGameState();
    service = createCaveHeavenService(gameState);
  });

  // ===== 初始化测试 =====

  describe('初始化', () => {
    it('应初始化洞天数据', () => {
      expect(gameState.caveHeaven).not.toBeNull();
      expect(gameState.caveHeaven.等级).toBe('小洞天');
      expect(gameState.caveHeaven.建设度).toBe(0);
    });

    it('应初始化建筑对象', () => {
      expect(gameState.caveHeaven.建筑).toBeDefined();
      expect(typeof gameState.caveHeaven.建筑).toBe('object');
    });
  });

  // ===== 洞天等级系统测试 =====

  describe('洞天等级系统', () => {
    it('getCaveLevel应返回当前等级', () => {
      expect(service.getCaveLevel()).toBe('小洞天');
    });

    it('getCaveInfo应返回完整洞天信息', () => {
      const info = service.getCaveInfo();
      expect(info.等级).toBe('小洞天');
      expect(info.建设度).toBe(0);
      expect(info.灵气浓度).toBe(1.0);
      expect(info.建设度上限).toBe(100);
      expect(info.灵气加成).toBe(1.0);
    });

    it('应正确计算洞天升级条件', () => {
      const result = service.canUpgradeCaveHeaven();
      expect(result.canUpgrade).toBe(false);
      expect(result.reason).toContain('建设度不足');
    });
  });

  // ===== 洞天升级测试 =====

  describe('洞天升级', () => {
    it('建设度不足时升级应失败', () => {
      const result = service.upgradeCaveHeaven();
      expect(result.success).toBe(false);
      expect(result.message).toContain('建设度不足');
    });

    it('达到升级条件后应能升级', () => {
      service.addConstruction(100);
      const result = service.upgradeCaveHeaven();
      expect(result.success).toBe(true);
      expect(result.newLevel).toBe('中洞天');
    });

    it('升级后灵气加成应正确更新', () => {
      service.addConstruction(100);
      service.upgradeCaveHeaven();
      expect(gameState.caveHeaven.灵气浓度).toBe(1.5);
      expect(gameState.caveHeaven.等级).toBe('中洞天');
    });

    it('最高等级洞天不应再升级', () => {
      // 跳过到天府
      gameState.caveHeaven.等级 = '天府';
      const result = service.upgradeCaveHeaven();
      expect(result.success).toBe(false);
      expect(result.message).toContain('最高');
    });

    it('升级历史应正确记录', () => {
      service.addConstruction(100);
      service.upgradeCaveHeaven();
      expect(gameState.caveHeaven.升级历史.length).toBe(1);
      expect(gameState.caveHeaven.升级历史[0].from).toBe('小洞天');
      expect(gameState.caveHeaven.升级历史[0].to).toBe('中洞天');
    });
  });

  // ===== 建筑系统测试 =====

  describe('建筑系统', () => {
    it('应能建造修炼室', () => {
      const result = service.buildBuilding('修炼室');
      expect(result.success).toBe(true);
      expect(result.buildingId).toBeDefined();
      expect(result.剩余灵石).toBe(950);
    });

    it('灵石不足时应建造失败', () => {
      gameState.player.spiritStones = 10;
      const result = service.buildBuilding('丹房');
      expect(result.success).toBe(false);
      expect(result.message).toContain('灵石不足');
    });

    it('应能建造所有类型建筑', () => {
      for (const buildingType of Object.keys(CAVE_BUILDINGS)) {
        const result = service.buildBuilding(buildingType);
        expect(result.success).toBe(true);
      }
    });

    it('未知建筑类型应抛出错误', () => {
      expect(() => service.buildBuilding('未知建筑')).toThrow('未知建筑类型');
    });
  });

  // ===== 建筑升级测试 =====

  describe('建筑升级', () => {
    it('应能升级建筑', () => {
      service.buildBuilding('修炼室');
      const buildings = service.listBuildings();
      const buildingId = buildings[0].id;
      
      const result = service.upgradeBuilding(buildingId);
      expect(result.success).toBe(true);
      expect(result.newLevel).toBe(2);
    });

    it('灵石不足时应升级失败', () => {
      service.buildBuilding('修炼室');
      gameState.player.spiritStones = 0;
      const buildings = service.listBuildings();
      const buildingId = buildings[0].id;
      
      const result = service.upgradeBuilding(buildingId);
      expect(result.success).toBe(false);
      expect(result.message).toContain('灵石不足');
    });

    it('建筑不存在时应返回错误', () => {
      const result = service.upgradeBuilding('不存在的建筑');
      expect(result.success).toBe(false);
      expect(result.message).toContain('不存在');
    });

    it('最高等级建筑不应再升级', () => {
      service.buildBuilding('修炼室');
      const buildings = service.listBuildings();
      const buildingId = buildings[0].id;
      
      // 升级到5级
      for (let i = 0; i < 4; i++) {
        service.upgradeBuilding(buildingId);
        gameState.player.spiritStones = 10000; // 重置灵石
      }
      
      const result = service.upgradeBuilding(buildingId);
      expect(result.success).toBe(false);
      expect(result.message).toContain('最高等级');
    });
  });

  // ===== 建筑列表测试 =====

  describe('建筑列表', () => {
    it('应正确列出所有建筑', () => {
      service.buildBuilding('修炼室');
      service.buildBuilding('丹房');
      
      const buildings = service.listBuildings();
      expect(buildings.length).toBe(2);
    });

    it('建筑信息应包含产出量', () => {
      service.buildBuilding('修炼室');
      
      const buildings = service.listBuildings();
      expect(buildings[0].产出量).toBe(10);
    });
  });

  // ===== 总产出计算测试 =====

  describe('总产出计算', () => {
    it('应正确计算总产出', () => {
      service.buildBuilding('修炼室');
      service.buildBuilding('灵草园');
      
      const output = service.calculateTotalOutput();
      expect(output['灵气']).toBe(10);
      expect(output['灵草']).toBe(15);
    });

    it('无建筑时应返回空对象', () => {
      const output = service.calculateTotalOutput();
      expect(Object.keys(output).length).toBe(0);
    });

    it('建筑升级后产出应增加', () => {
      service.buildBuilding('修炼室');
      const buildings = service.listBuildings();
      const buildingId = buildings[0].id;
      service.upgradeBuilding(buildingId);
      
      const output = service.calculateTotalOutput();
      expect(output['灵气']).toBe(15); // 10 * 1.5
    });
  });

  // ===== 建设度测试 =====

  describe('建设度', () => {
    it('应能添加建设度', () => {
      const result = service.addConstruction(50);
      expect(result.success).toBe(true);
      expect(result.建设度).toBe(50);
    });

    it('建设度不应超过上限', () => {
      service.addConstruction(200);
      const info = service.getCaveInfo();
      expect(info.建设度).toBe(100); // 小洞天上限
    });

    it('多次添加应累加', () => {
      service.addConstruction(30);
      service.addConstruction(20);
      expect(gameState.caveHeaven.建设度).toBe(50);
    });
  });

  // ===== 常量测试 =====

  describe('常量定义', () => {
    it('CAVE_HEAVEN_LEVELS应有5个等级', () => {
      expect(Object.keys(CAVE_HEAVEN_LEVELS).length).toBe(5);
    });

    it('CAVE_BUILDINGS应有5种建筑', () => {
      expect(Object.keys(CAVE_BUILDINGS).length).toBe(5);
    });

    it('CAVE_LEVEL_ORDER长度应匹配', () => {
      expect(CAVE_LEVEL_ORDER.length).toBe(5);
    });

    it('BUILDING_LEVEL_MULTIPLIERS应有5级', () => {
      expect(Object.keys(BUILDING_LEVEL_MULTIPLIERS).length).toBe(5);
    });
  });

  // ===== MCP工具测试 =====

  describe('MCP工具', () => {
    it('getCaveHeavenInfo应返回洞天信息', () => {
      const info = getCaveHeavenInfo(gameState);
      expect(info.等级).toBe('小洞天');
    });

    it('addCaveConstruction应能添加建设度', () => {
      const result = addCaveConstruction(gameState, 50);
      expect(result.success).toBe(true);
    });

    it('listCaveBuildings应返回建筑列表', () => {
      service.buildBuilding('修炼室');
      const buildings = listCaveBuildings(gameState);
      expect(buildings.length).toBe(1);
    });

    it('getCaveOutput应返回产出', () => {
      service.buildBuilding('修炼室');
      const output = getCaveOutput(gameState);
      expect(output['灵气']).toBe(10);
    });
  });

  // ===== 边界测试 =====

  describe('边界情况', () => {
    it('空建筑对象应正常处理', () => {
      const output = service.calculateTotalOutput();
      expect(Object.keys(output).length).toBe(0);
    });

    it('负建设度不应添加', () => {
      gameState.caveHeaven.建设度 = 50;
      service.addConstruction(-10);
      expect(gameState.caveHeaven.建设度).toBe(50);
    });
  });
});