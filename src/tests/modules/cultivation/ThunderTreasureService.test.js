/**
 * ThunderTreasureService.test.js - 天雷异宝+法宝进阶系统测试
 * V251: 天雷异宝+法宝进阶
 * 覆盖率目标: ≥98%
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ThunderTreasureService,
  createThunderTreasureService,
  createArtifactService,
  TREASURE_TYPES,
  ARTIFACT_TIERS
} from '../../../../src/domains/cultivation/services/ThunderTreasureService.js';

function createTestGameState() {
  return {
    player: { id: 'player1', name: '测试玩家', spiritStones: 50000, level: 60, spirit: 5000 },
    treasures: { discovered: [], bound: {}, thunderEnergy: 0 },
    artifacts: { forged: [], bound: {} }
  };
}

describe('ThunderTreasureService', () => {
  let gameState;
  let service;

  beforeEach(() => {
    gameState = createTestGameState();
    service = createThunderTreasureService(gameState);
  });

  describe('异宝发现', () => {
    it('应能发现新的天雷异宝', () => {
      const result = service.discoverTreasure();
      expect(result.success).toBe(true);
      expect(result.treasure).toBeDefined();
    });

    it('已发现异宝再次发现应返回碎片', () => {
      service.discoverTreasure();
      const result = service.discoverTreasure();
      expect(result.success).toBe(true);
      expect(result.type).toBe('fragment');
      expect(result.fragmentCount).toBe(5);
    });

    it('应能列出所有异宝', () => {
      service.discoverTreasure();
      const result = service.listTreasures();
      expect(result.success).toBe(true);
      expect(result.discovered.length).toBeGreaterThan(0);
    });

    it('应能吸收雷劫能量', () => {
      service.discoverTreasure();
      const treasure = Object.keys(gameState.treasures.bound)[0];
      const result = service.absorbThunder(treasure, 1000);
      expect(result.success).toBe(true);
      expect(result.absorbAmount).toBeGreaterThan(0);
    });

    it('未绑定异宝不能吸收能量', () => {
      const result = service.absorbThunder('天雷珠', 1000);
      expect(result.success).toBe(false);
      expect(result.message).toContain('未绑定');
    });

    it('负数能量应被拒绝', () => {
      service.discoverTreasure();
      const treasure = Object.keys(gameState.treasures.bound)[0];
      const result = service.absorbThunder(treasure, -100);
      expect(result.success).toBe(false);
    });
  });

  describe('异宝进阶', () => {
    it('应能进行异宝进阶', () => {
      service.discoverTreasure();
      gameState.treasures.thunderEnergy = 1000;
      const treasure = Object.keys(gameState.treasures.bound)[0];
      const result = service.enhanceTreasure(treasure);
      expect(result.success).toBe(true);
      expect(result.powerIncrease).toBeGreaterThan(0);
    });

    it('能量不足应不能进阶', () => {
      service.discoverTreasure();
      gameState.treasures.thunderEnergy = 0;
      const treasure = Object.keys(gameState.treasures.bound)[0];
      const result = service.enhanceTreasure(treasure);
      expect(result.success).toBe(false);
      expect(result.message).toContain('能量不足');
    });

    it('应能获取异宝属性', () => {
      service.discoverTreasure();
      const treasure = Object.keys(gameState.treasures.bound)[0];
      const result = service.getTreasureStats(treasure);
      expect(result.success).toBe(true);
      expect(result.power).toBeDefined();
      expect(result.awakenLevel).toBe(0);
    });
  });

  describe('异宝觉醒', () => {
    it('应能进行异宝觉醒', () => {
      service.discoverTreasure();
      gameState.treasures.thunderEnergy = 10000;
      const treasure = Object.keys(gameState.treasures.bound)[0];
      const result = service.awakenTreasure(treasure);
      expect(result.success).toBe(true);
      expect(result.newAwakenLevel).toBe(1);
    });

    it('最高觉醒等级不能再觉醒', () => {
      service.discoverTreasure();
      gameState.treasures.thunderEnergy = 100000;
      const treasure = Object.keys(gameState.treasures.bound)[0];
      gameState.treasures.bound[treasure].awakenLevel = 5;
      const result = service.awakenTreasure(treasure);
      expect(result.success).toBe(false);
      expect(result.message).toContain('最高');
    });

    it('能量不足应不能觉醒', () => {
      service.discoverTreasure();
      gameState.treasures.thunderEnergy = 0;
      const treasure = Object.keys(gameState.treasures.bound)[0];
      const result = service.awakenTreasure(treasure);
      expect(result.success).toBe(false);
    });
  });

  describe('常量验证', () => {
    it('应有5种异宝类型', () => {
      expect(Object.keys(TREASURE_TYPES).length).toBe(5);
    });

    it('每个异宝应有basePower和absorbRate', () => {
      for (const [name, data] of Object.entries(TREASURE_TYPES)) {
        expect(data.basePower).toBeGreaterThan(0);
        expect(data.absorbRate).toBeGreaterThan(0);
        expect(data.awakenBonus).toBeGreaterThan(1);
      }
    });

    it('应有5个法宝等阶', () => {
      expect(Object.keys(ARTIFACT_TIERS).length).toBe(5);
    });

    it('每个等阶应有power和upgradeCost', () => {
      for (const [tier, data] of Object.entries(ARTIFACT_TIERS)) {
        expect(data.power).toBeGreaterThan(0);
        expect(data.upgradeCost).toBeDefined();
        expect(data.requiredLevel).toBeGreaterThan(0);
      }
    });
  });
});

describe('ArtifactService', () => {
  let gameState;
  let service;

  beforeEach(() => {
    gameState = createTestGameState();
    service = createArtifactService(gameState);
  });

  describe('法宝炼制', () => {
    it('应能炼制法宝', () => {
      const result = service.forgeArtifact('天雷剑');
      expect(result.success).toBe(true);
      expect(result.tier).toBe('凡品');
    });

    it('灵石不足不能炼制', () => {
      gameState.player.spiritStones = 0;
      const result = service.forgeArtifact('天雷剑');
      expect(result.success).toBe(false);
      expect(result.message).toContain('灵石不足');
    });
  });

  describe('法宝升级', () => {
    it('应能升级法宝', () => {
      service.forgeArtifact('天雷剑');
      const artifactId = Object.keys(gameState.artifacts.bound)[0];
      gameState.player.level = 10;
      gameState.player.spiritStones = 500;
      const result = service.upgradeArtifact(artifactId);
      expect(result.success).toBe(true);
      expect(result.newTier).toBe('灵品');
    });

    it('境界不足不能升级', () => {
      service.forgeArtifact('天雷剑');
      const artifactId = Object.keys(gameState.artifacts.bound)[0];
      gameState.player.level = 1;
      gameState.player.spiritStones = 5000;
      const result = service.upgradeArtifact(artifactId);
      expect(result.success).toBe(false);
      expect(result.message).toContain('境界不足');
    });

    it('灵石不足不能升级', () => {
      service.forgeArtifact('天雷剑');
      const artifactId = Object.keys(gameState.artifacts.bound)[0];
      gameState.player.level = 50;
      gameState.player.spiritStones = 0;
      const result = service.upgradeArtifact(artifactId);
      expect(result.success).toBe(false);
    });

    it('最高等阶不能升级', () => {
      service.forgeArtifact('天雷剑');
      const artifactId = Object.keys(gameState.artifacts.bound)[0];
      gameState.artifacts.bound[artifactId].tier = '先天至宝';
      gameState.player.spiritStones = 100000;
      const result = service.upgradeArtifact(artifactId);
      expect(result.success).toBe(false);
    });
  });

  describe('灵气注入', () => {
    it('应能注入灵气', () => {
      service.forgeArtifact('天雷剑');
      const artifactId = Object.keys(gameState.artifacts.bound)[0];
      const result = service.infuseSpirit(artifactId, 100);
      expect(result.success).toBe(true);
      expect(result.newSpirit).toBe(100);
    });

    it('灵气不足不能注入', () => {
      service.forgeArtifact('天雷剑');
      const artifactId = Object.keys(gameState.artifacts.bound)[0];
      gameState.player.spirit = 0;
      const result = service.infuseSpirit(artifactId, 100);
      expect(result.success).toBe(false);
    });

    it('负数灵气应被拒绝', () => {
      service.forgeArtifact('天雷剑');
      const artifactId = Object.keys(gameState.artifacts.bound)[0];
      const result = service.infuseSpirit(artifactId, -100);
      expect(result.success).toBe(false);
    });
  });

  describe('法宝绑定', () => {
    it('应能绑定法宝', () => {
      service.forgeArtifact('天雷剑');
      const artifactId = Object.keys(gameState.artifacts.bound)[0];
      const result = service.bindArtifact(artifactId);
      expect(result.success).toBe(true);
      expect(gameState.artifacts.bound[artifactId].bound).toBe(true);
    });

    it('已绑定法宝不能再绑定', () => {
      service.forgeArtifact('天雷剑');
      const artifactId = Object.keys(gameState.artifacts.bound)[0];
      service.bindArtifact(artifactId);
      const result = service.bindArtifact(artifactId);
      expect(result.success).toBe(false);
    });
  });

  describe('法宝共鸣', () => {
    it('至少2件绑定法宝才能共鸣', () => {
      service.forgeArtifact('天雷剑');
      const result = service.artifactResonance();
      expect(result.success).toBe(false);
      expect(result.message).toContain('至少2件');
    });

    it('应能触发法宝共鸣', () => {
      service.forgeArtifact('天雷剑');
      service.forgeArtifact('雷神刀');
      const ids = Object.keys(gameState.artifacts.bound);
      service.bindArtifact(ids[0]);
      service.bindArtifact(ids[1]);
      const result = service.artifactResonance();
      expect(result.success).toBe(true);
      expect(result.resonanceBonus).toBeGreaterThan(0);
    });
  });

  describe('列表查询', () => {
    it('应能列出所有法宝', () => {
      service.forgeArtifact('天雷剑');
      service.forgeArtifact('雷神刀');
      const result = service.listArtifacts();
      expect(result.success).toBe(true);
      expect(result.artifacts.length).toBe(2);
    });
  });
});