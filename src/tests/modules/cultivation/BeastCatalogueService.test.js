/**
 * BeastCatalogueService.test.js - 仙宠图鉴+收集系统测试
 * V255: 仙宠图鉴+收集系统
 * 覆盖率目标: ≥98%
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createBeastCatalogueService, BEAST_RARITIES, ELEMENT_TYPES, BEAST_CATEGORIES } from '../../../../src/domains/cultivation/services/BeastCatalogueService.js';

function createTestGameState() {
  return {
    player: { id: 'p1', name: '测试玩家', spiritStones: 10000, exp: 0 },
    beastCatalogue: { discovered: [], owned: {}, unlockedElements: [], categoryProgress: {}, totalDiscovered: 0, totalOwned: 0 }
  };
}

describe('BeastCatalogueService', () => {
  let gs, svc;
  beforeEach(() => { gs = createTestGameState(); svc = createBeastCatalogueService(gs); });

  // ===== 图鉴发现 =====
  describe('图鉴发现', () => {
    it('应能记录发现新仙宠', () => {
      const r = svc.discoverBeast('b001', '小火狐', '普通', '火', '走兽');
      expect(r.success).toBe(true);
      expect(r.newlyDiscovered).toBe(true);
      expect(gs.beastCatalogue.discovered).toContain('b001');
    });

    it('重复发现应标记newlyDiscovered=false', () => {
      svc.discoverBeast('b001', '小火狐', '普通', '火', '走兽');
      const r = svc.discoverBeast('b001', '小火狐', '普通', '火', '走兽');
      expect(r.newlyDiscovered).toBe(false);
      expect(r.newlyObtained).toBe(false);
    });

    it('应正确累加总数', () => {
      svc.discoverBeast('b001', '小火狐', '普通', '火', '走兽');
      svc.discoverBeast('b002', '雷雀', '稀有', '雷', '飞禽');
      expect(gs.beastCatalogue.totalDiscovered).toBe(2);
    });

    it('应更新分类进度', () => {
      svc.discoverBeast('b001', '小火狐', '普通', '火', '走兽');
      expect(gs.beastCatalogue.categoryProgress['走兽'].discovered).toBe(1);
    });

    it('无效稀有度应失败', () => {
      expect(svc.discoverBeast('b001', '测试', '无效', '火', '走兽').success).toBe(false);
    });

    it('无效元素应失败', () => {
      expect(svc.discoverBeast('b001', '测试', '普通', '无效', '走兽').success).toBe(false);
    });

    it('无效分类应失败', () => {
      expect(svc.discoverBeast('b001', '测试', '普通', '火', '无效').success).toBe(false);
    });
  });

  // ===== 图鉴查询 =====
  describe('图鉴查询', () => {
    beforeEach(() => {
      svc.discoverBeast('b001', '小火狐', '普通', '火', '走兽');
      svc.discoverBeast('b002', '雷雀', '稀有', '雷', '飞禽');
      svc.discoverBeast('b003', '神龙', '传说', '雷', '神兽');
    });

    it('应能获取图鉴概览', () => {
      const r = svc.getCatalogueOverview();
      expect(r.success).toBe(true);
      expect(r.totalDiscovered).toBe(3);
      expect(r.totalOwned).toBe(3);
    });

    it('应能获取仙宠详情', () => {
      const r = svc.getBeastDetails('b001');
      expect(r.success).toBe(true);
      expect(r.name).toBe('小火狐');
      expect(r.rarity).toBe('普通');
      expect(r.level).toBe(1);
      expect(r.stars).toBe(1);
    });

    it('查询不存在的仙宠应失败', () => {
      expect(svc.getBeastDetails('nonexistent').success).toBe(false);
    });

    it('应能按元素查询', () => {
      const r = svc.getBeastsByElement('雷');
      expect(r.success).toBe(true);
      expect(r.count).toBe(2);
    });

    it('应能按稀有度查询', () => {
      const r = svc.getBeastsByRarity('传说');
      expect(r.success).toBe(true);
      expect(r.count).toBe(1);
    });

    it('应能按分类查询', () => {
      const r = svc.getBeastsByCategory('飞禽');
      expect(r.success).toBe(true);
      expect(r.count).toBe(1);
    });
  });

  // ===== 收集奖励 =====
  describe('收集奖励', () => {
    it('应能解锁元素奖励', () => {
      for (let i = 0; i < 5; i++) {
        svc.discoverBeast(`b_fire_${i}`, `火元素${i}`, '普通', '火', '走兽');
      }
      const r = svc.unlockElementReward('火');
      expect(r.success).toBe(true);
      expect(gs.beastCatalogue.unlockedElements).toContain('火');
    });

    it('元素已解锁应失败', () => {
      gs.beastCatalogue.unlockedElements.push('火');
      expect(svc.unlockElementReward('火').success).toBe(false);
    });

    it('仙宠不足5种应失败', () => {
      for (let i = 0; i < 3; i++) {
        svc.discoverBeast(`b_fire_${i}`, `火元素${i}`, '普通', '火', '走兽');
      }
      expect(svc.unlockElementReward('火').success).toBe(false);
    });

    it('应能领取里程碑奖励', () => {
      svc.discoverBeast('b001', '小火狐', '普通', '火', '走兽');
      const r = svc.claimCollectionMilestone('first_beast');
      expect(r.success).toBe(true);
      expect(gs.player.exp).toBe(100);
    });

    it('仙宠不足应不能领取', () => {
      expect(svc.claimCollectionMilestone('five_beasts').success).toBe(false);
    });

    it('已领取应不能重复领取', () => {
      svc.discoverBeast('b001', '小火狐', '普通', '火', '走兽');
      svc.claimCollectionMilestone('first_beast');
      expect(svc.claimCollectionMilestone('first_beast').success).toBe(false);
    });
  });

  // ===== 仙宠培养 =====
  describe('仙宠培养', () => {
    beforeEach(() => {
      svc.discoverBeast('b001', '小火狐', '普通', '火', '走兽');
    });

    it('应能升级仙宠', () => {
      gs.player.spiritStones = 1000;
      const r = svc.levelUpBeast('b001');
      expect(r.success).toBe(true);
      expect(gs.beastCatalogue.owned['b001'].level).toBe(2);
    });

    it('灵石不足应不能升级', () => {
      gs.player.spiritStones = 0;
      expect(svc.levelUpBeast('b001').success).toBe(false);
    });

    it('应能升星仙宠', () => {
      gs.player.spiritStones = 1000;
      const r = svc.starUpBeast('b001');
      expect(r.success).toBe(true);
      expect(gs.beastCatalogue.owned['b001'].stars).toBe(2);
    });

    it('灵石不足应不能升星', () => {
      gs.player.spiritStones = 0;
      expect(svc.starUpBeast('b001').success).toBe(false);
    });

    it('已达5星不能再升', () => {
      gs.player.spiritStones = 10000;
      gs.beastCatalogue.owned['b001'].stars = 5;
      expect(svc.starUpBeast('b001').success).toBe(false);
    });
  });

  // ===== 列表查询 =====
  describe('列表查询', () => {
    it('应能列出所有仙宠', () => {
      svc.discoverBeast('b001', '小火狐', '普通', '火', '走兽');
      svc.discoverBeast('b002', '雷雀', '传说', '雷', '飞禽');
      const r = svc.listOwnedBeasts();
      expect(r.success).toBe(true);
      expect(r.count).toBe(2);
      expect(r.beasts[0].rarity).toBe('传说'); // 按稀有度降序
    });
  });

  // ===== 常量验证 =====
  describe('常量验证', () => {
    it('应有4种稀有度', () => {
      expect(Object.keys(BEAST_RARITIES)).toHaveLength(4);
    });

    it('应有10种元素', () => {
      expect(ELEMENT_TYPES).toHaveLength(10);
    });

    it('应有6种分类', () => {
      expect(BEAST_CATEGORIES).toHaveLength(6);
    });
  });
});