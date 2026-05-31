/**
 * AlchemyService.test.js - 仙药炼制+丹药系统测试
 * V256: 仙药炼制+丹药系统
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createAlchemyService, PILL_TIERS, HERB_TYPES, FURNACE_TIERS } from '../../../../src/domains/cultivation/services/AlchemyService.js';

function createTestGameState() {
  return {
    player: { id: 'p1', name: '测试玩家', spiritStones: 100000, exp: 0, alchemySkill: 5 },
    alchemy: {
      recipes: {
        '筑基丹': { ingredients: { '灵草': 5, '精华': 2 }, tier: '下品', effect: '增加修炼速度', baseSuccess: 0.8 }
      },
      inventory: { '灵草': { '灵草A': 20 }, '精华': { '精华A': 20 } },
      craftedPills: [],
      furnaceLevel: 1,
      totalCrafted: 0
    }
  };
}

describe('AlchemyService', () => {
  let gs, svc;
  beforeEach(() => { gs = createTestGameState(); svc = createAlchemyService(gs); });

  it('应能添加药材', () => {
    const r = svc.addHerb('灵草', '火灵草', 5);
    expect(r.success).toBe(true);
    expect(gs.alchemy.inventory['灵草']['火灵草']).toBe(5);
  });

  it('无效药材类型应失败', () => {
    expect(svc.addHerb('无效', '测试', 1).success).toBe(false);
  });

  it('应能炼制丹药', () => {
    const r = svc.craftPill('筑基丹');
    expect(r.success).toBe(true);
    expect(r.pillId).toBeDefined();
    expect(['下品', '中品', '上品', '极品', '神品']).toContain(r.tier);
  });

  it('药材不足应不能炼制', () => {
    gs.alchemy.inventory['灵草']['灵草A'] = 0;
    expect(svc.craftPill('筑基丹').success).toBe(false);
  });

  it('应能使用丹药', () => {
    svc.craftPill('筑基丹');
    const pillId = gs.alchemy.craftedPills[0].id;
    const r = svc.usePill(pillId);
    expect(r.success).toBe(true);
    expect(gs.alchemy.craftedPills.length).toBe(0);
  });

  it('不存在丹药不能使用', () => {
    expect(svc.usePill('nonexistent').success).toBe(false);
  });

  it('应能升级炉鼎', () => {
    const r = svc.upgradeFurnace();
    expect(r.success).toBe(true);
    expect(gs.alchemy.furnaceLevel).toBe(2);
  });

  it('灵石不足不能升级炉鼎', () => {
    gs.player.spiritStones = 0;
    expect(svc.upgradeFurnace().success).toBe(false);
  });

  it('已达最高炉鼎等级不能升级', () => {
    gs.alchemy.furnaceLevel = 4;
    gs.player.spiritStones = 100000;
    expect(svc.upgradeFurnace().success).toBe(false);
  });

  it('应能获取配方列表', () => {
    const r = svc.listRecipes();
    expect(r.success).toBe(true);
    expect(r.recipes.length).toBeGreaterThan(0);
  });

  it('应能获取药材背包', () => {
    const r = svc.getInventory();
    expect(r.success).toBe(true);
    expect(r.inventory['灵草']['灵草A']).toBe(20);
  });

  it('应能获取丹药列表', () => {
    svc.craftPill('筑基丹');
    const r = svc.listPills();
    expect(r.success).toBe(true);
    expect(r.pills.length).toBe(1);
  });

  it('应能获取炉鼎信息', () => {
    const r = svc.getFurnaceInfo();
    expect(r.success).toBe(true);
    expect(r.name).toBe('凡炉');
    expect(r.level).toBe(1);
  });

  it('PILL_TIERS应有5个等阶', () => {
    expect(Object.keys(PILL_TIERS)).toHaveLength(5);
  });

  it('HERB_TYPES应有5种类型', () => {
    expect(HERB_TYPES).toHaveLength(5);
  });

  it('FURNACE_TIERS应有4个等级', () => {
    expect(Object.keys(FURNACE_TIERS)).toHaveLength(4);
  });
});