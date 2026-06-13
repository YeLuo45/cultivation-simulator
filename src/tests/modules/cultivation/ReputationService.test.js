/**
 * ReputationService.test.js - 仙界声望+排行榜系统测试
 * V252: 仙界声望+排行榜系统
 * 覆盖率目标: ≥98%
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ReputationService,
  LeaderboardService,
  createReputationService,
  createLeaderboardService,
  REP_LEVELS,
  RANKING_TYPES
} from '../../../../src/domains/cultivation/services/ReputationService.js';

function createTestGameState() {
  return {
    player: { id: 'player1', name: '测试玩家', power: 5000, spiritStones: 10000, level: 50 },
    reputation: { score: 0, history: [] },
    rankings: { totalPower: [], beastPower: [], sectPower: [], spiritStone: [], level: [], lastSeasonReset: Date.now() }
  };
}

describe('ReputationService', () => {
  let gameState, service;

  beforeEach(() => {
    gameState = createTestGameState();
    service = createReputationService(gameState);
  });

  describe('声望增减', () => {
    it('应能增加声望', () => {
      const result = service.gainReputation(100, 'test');
      expect(result.success).toBe(true);
      expect(result.newRep).toBe(100);
    });

    it('应能减少声望', () => {
      gameState.reputation.score = 500;
      const result = service.loseReputation(100, 'test');
      expect(result.success).toBe(true);
      expect(result.newRep).toBe(400);
    });

    it('声望不能减少到0以下', () => {
      gameState.reputation.score = 50;
      service.loseReputation(100, 'test');
      expect(gameState.reputation.score).toBe(0);
    });

    it('负数声望应被拒绝', () => {
      const r1 = service.gainReputation(-100);
      const r2 = service.loseReputation(-100);
      expect(r1.success).toBe(false);
      expect(r2.success).toBe(false);
    });

    it('声望历史应记录', () => {
      service.gainReputation(100, 'battle');
      expect(gameState.reputation.history.length).toBeGreaterThan(0);
      expect(gameState.reputation.history[0].source).toBe('battle');
    });
  });

  describe('声望等级', () => {
    it('0声望应为无名之辈', () => {
      expect(service.getReputationLevel()).toBe(0);
    });

    it('足够声望应升级', () => {
      gameState.reputation.score = 600;
      expect(service.getReputationLevel()).toBe(2); // 修士
    });

    it('应获取声望信息', () => {
      gameState.reputation.score = 500;
      const info = service.getReputationInfo();
      expect(info.success).toBe(true);
      expect(info.name).toBe('真人');
      expect(info.progress).toBeGreaterThan(0);
    });

    it('仙帝等级应无下一级', () => {
      gameState.reputation.score = 20000000;
      const info = service.getReputationInfo();
      expect(info.name).toBe('仙帝');
      expect(info.nextLevelName).toBeUndefined();
    });
  });

  describe('常量', () => {
    it('应有10个声望等级', () => {
      expect(Object.keys(REP_LEVELS).length).toBe(10);
    });

    it('每个等级应有name和minRep', () => {
      for (const [lvl, data] of Object.entries(REP_LEVELS)) {
        expect(data.name).toBeDefined();
        expect(data.minRep).toBeDefined();
      }
    });

    it('应有5个榜单类型', () => {
      expect(RANKING_TYPES).toEqual(['totalPower', 'beastPower', 'sectPower', 'spiritStone', 'level']);
    });
  });
});

describe('LeaderboardService', () => {
  let gameState, service;

  beforeEach(() => {
    gameState = createTestGameState();
    service = createLeaderboardService(gameState);
  });

  describe('排名更新', () => {
    it('应能更新排名', () => {
      const result = service.updateRanking('totalPower', 5000);
      expect(result.success).toBe(true);
      expect(result.rank).toBe(1);
    });

    it('应更新现有玩家排名', () => {
      service.updateRanking('totalPower', 5000);
      const result = service.updateRanking('totalPower', 6000);
      expect(result.success).toBe(true);
      expect(result.value).toBe(6000);
    });

    it('未知类型应失败', () => {
      const result = service.updateRanking('unknown', 100);
      expect(result.success).toBe(false);
    });
  });

  describe('排名查询', () => {
    it('应能获取排行榜', () => {
      service.updateRanking('totalPower', 5000);
      service.updateRanking('totalPower', 6000);
      const result = service.getRankings('totalPower', 10);
      expect(result.success).toBe(true);
      expect(result.rankings.length).toBe(2);
      expect(result.rankings[0].value).toBe(6000); // 降序
    });

    it('应能获取我的排名', () => {
      service.updateRanking('totalPower', 5000);
      const result = service.getMyRank('totalPower');
      expect(result.success).toBe(true);
      expect(result.rank).toBe(1);
    });

    it('无排名应返回null', () => {
      const result = service.getMyRank('totalPower');
      expect(result.success).toBe(true);
      expect(result.rank).toBeNull();
    });

    it('应获取顶尖玩家', () => {
      for (let i = 0; i < 5; i++) {
        gameState.player.id = `p${i}`;
        gameState.player.name = `玩家${i}`;
        service.updateRanking('totalPower', (5 - i) * 1000);
      }
      const result = service.getTopPlayers('totalPower', 3);
      expect(result.success).toBe(true);
      expect(result.top.length).toBe(3);
      expect(result.top[0].value).toBe(5000);
    });
  });

  describe('赛季重置', () => {
    it('应能重置赛季', () => {
      service.updateRanking('totalPower', 5000);
      service.seasonReset();
      const result = service.getRankings('totalPower');
      expect(result.success).toBe(true);
      expect(result.rankings.length).toBe(0);
    });

    it('一个月内不能重置', () => {
      gameState.rankings.lastSeasonReset = Date.now();
      const result = service.seasonReset();
      expect(result.success).toBe(false);
    });
  });

  describe('边界', () => {
    it('空排行榜应正常处理', () => {
      const result = service.getRankings('level');
      expect(result.success).toBe(true);
      expect(result.rankings).toEqual([]);
    });

    it('limit参数应生效', () => {
      for (let i = 0; i < 10; i++) {
        gameState.player.id = `p${i}`;
        service.updateRanking('level', i + 1);
      }
      const result = service.getRankings('level', 5);
      expect(result.rankings.length).toBe(5);
    });
  });
});