/**
 * SectService.test.js - 仙盟系统测试
 * V247: 仙盟系统+宗门大战
 * 覆盖率目标: ≥98%
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SectService,
  createSectService,
  SECT_LEVELS,
  SECT_POSITIONS,
  POSITION_RANK,
  SECT_SKILLS
} from '../../../../src/domains/cultivation/services/SectService.js';

// ===== 测试辅助函数 =====

function createTestGameState(overrides = {}) {
  return {
    player: { id: 'player1', name: '测试玩家', spiritStones: 10000, level: 50 },
    sect: {
      id: null,
      name: null,
      level: 1,
      leaderId: null,
      members: {},
      skills: {},
      contribution: {},
      contributionHistory: [],
      resources: { spiritStones: 0, contribution: 0 }
    },
    ...overrides
  };
}

// ===== 测试套件 =====

describe('SectService', () => {
  let gameState;
  let service;

  beforeEach(() => {
    gameState = createTestGameState();
    service = createSectService(gameState);
  });

  // ===== 仙盟创建测试 =====

  describe('仙盟创建', () => {
    it('应能成功创建仙盟', () => {
      const result = service.createSect('测试仙盟');
      expect(result.success).toBe(true);
      expect(result.message).toContain('测试仙盟');
      expect(gameState.sect.id).toBeDefined();
      expect(gameState.sect.name).toBe('测试仙盟');
      expect(gameState.sect.level).toBe(1);
    });

    it('创建仙盟应消耗灵石', () => {
      const initialStones = gameState.player.spiritStones;
      service.createSect('测试仙盟');
      expect(gameState.player.spiritStones).toBe(initialStones - 5000);
    });

    it('已加入仙盟时不应再创建', () => {
      service.createSect('测试仙盟');
      const result = service.createSect('另一个仙盟');
      expect(result.success).toBe(false);
      expect(result.message).toContain('已在仙盟中');
    });

    it('灵石不足时不应创建', () => {
      gameState.player.spiritStones = 100;
      const result = service.createSect('测试仙盟');
      expect(result.success).toBe(false);
      expect(result.message).toContain('灵石不足');
    });

    it('创建者应自动成为盟主', () => {
      service.createSect('测试仙盟');
      expect(gameState.sect.members['player1'].position).toBe('盟主');
    });

    it('创建者应获得初始贡献度', () => {
      service.createSect('测试仙盟');
      expect(gameState.sect.contribution['player1']).toBe(1000);
    });
  });

  // ===== 加入/退出仙盟测试 =====

  describe('加入/退出仙盟', () => {
    it('应能加入已有仙盟', () => {
      service.createSect('测试仙盟');
      gameState.player = { id: 'player2', name: '新玩家', spiritStones: 1000 };
      
      const result = service.joinSect('sect_123', '测试仙盟');
      expect(result.success).toBe(true);
      expect(gameState.sect.members['player2']).toBeDefined();
      expect(gameState.sect.members['player2'].position).toBe('弟子');
    });

    it('加入仙盟应消耗灵石', () => {
      service.createSect('测试仙盟');
      gameState.player = { id: 'player2', name: '新玩家', spiritStones: 500 };
      
      service.joinSect('sect_123', '测试仙盟');
      expect(gameState.player.spiritStones).toBe(400); // 500 - 100
    });

    it('已在仙盟中不应再加入', () => {
      service.createSect('测试仙盟');
      const result = service.joinSect('sect_123', '测试仙盟');
      expect(result.success).toBe(false);
      expect(result.message).toContain('已在仙盟中');
    });

    it('仙盟人数已满时不应加入', () => {
      service.createSect('测试仙盟');
      gameState.sect.level = 1; // 限制10人
      for (let i = 0; i < 10; i++) {
        gameState.sect.members[`member${i}`] = { id: `member${i}`, name: `成员${i}`, position: '弟子' };
        gameState.sect.contribution[`member${i}`] = 0;
      }
      
      gameState.player = { id: 'newplayer', name: '新玩家', spiritStones: 1000 };
      const result = service.joinSect('sect_123', '测试仙盟');
      expect(result.success).toBe(false);
      expect(result.message).toContain('人数已满');
    });

    it('盟主退出应被拒绝', () => {
      service.createSect('测试仙盟');
      const result = service.leaveSect();
      expect(result.success).toBe(false);
      expect(result.message).toContain('盟主无法退出');
    });

    it('非盟主应能退出仙盟', () => {
      service.createSect('测试仙盟');
      gameState.sect.members['player2'] = { id: 'player2', name: '成员2', position: '弟子', totalContribution: 0, lastActive: Date.now() };
      gameState.player = { id: 'player2', name: '成员2', spiritStones: 1000 };
      
      const result = service.leaveSect();
      expect(result.success).toBe(true);
      expect(gameState.sect.members['player2']).toBeUndefined();
    });
  });

  // ===== 成员管理测试 =====

  describe('成员管理', () => {
    it('长老以上可修改成员职位', () => {
      service.createSect('测试仙盟');
      gameState.sect.members['player2'] = { id: 'player2', name: '成员2', position: '弟子', totalContribution: 0, lastActive: Date.now() };
      gameState.sect.contribution['player2'] = 0;
      
      const result = service.changeMemberPosition('player2', '长老');
      expect(result.success).toBe(true);
      expect(gameState.sect.members['player2'].position).toBe('长老');
    });

    it('弟子不能修改职位', () => {
      service.createSect('测试仙盟');
      gameState.sect.members['player1'].position = '弟子';
      
      const result = service.changeMemberPosition('player2', '精英');
      expect(result.success).toBe(false);
      expect(result.message).toContain('权限不足');
    });

    it('不能授予高于自身职位的级别', () => {
      service.createSect('测试仙盟');
      gameState.sect.members['player1'].position = '长老';
      gameState.sect.members['player2'] = { id: 'player2', name: '成员2', position: '弟子', totalContribution: 0, lastActive: Date.now() };
      gameState.sect.contribution['player2'] = 0;
      
      const result = service.changeMemberPosition('player2', '副盟主');
      expect(result.success).toBe(false);
      expect(result.message).toContain('无法授予高于自身职位');
    });

    it('不能修改不存在的成员', () => {
      service.createSect('测试仙盟');
      const result = service.changeMemberPosition('nonexistent', '长老');
      expect(result.success).toBe(false);
      expect(result.message).toContain('成员不存在');
    });
  });

  // ===== 贡献度系统测试 =====

  describe('贡献度系统', () => {
    it('捐献灵石应增加贡献度', () => {
      service.createSect('测试仙盟');
      const result = service.donateContributions(1000);
      expect(result.success).toBe(true);
      expect(result.contributionGain).toBe(100); // 1000/10
      expect(gameState.sect.contribution['player1']).toBe(1100); // 1000创建奖励 + 100捐献
    });

    it('灵石不足时捐献应失败', () => {
      service.createSect('测试仙盟');
      gameState.player.spiritStones = 50;
      const result = service.donateContributions(100);
      expect(result.success).toBe(false);
      expect(result.message).toContain('灵石不足');
    });

    it('未加入仙盟不能捐献', () => {
      const result = service.donateContributions(100);
      expect(result.success).toBe(false);
      expect(result.message).toContain('未加入仙盟');
    });

    it('贡献历史应正确记录', () => {
      service.createSect('测试仙盟');
      service.donateContributions(500);
      expect(gameState.sect.contributionHistory.length).toBeGreaterThan(0);
    });

    it('应能获取个人贡献度', () => {
      service.createSect('测试仙盟');
      const result = service.getMyContribution();
      expect(result.success).toBe(true);
      expect(result.contribution).toBe(1000);
    });
  });

  // ===== 仙盟技能测试 =====

  describe('仙盟技能', () => {
    it('应能学习仙盟技能', () => {
      service.createSect('测试仙盟');
      service.donateContributions(5000); // 增加贡献度
      gameState.sect.contribution['player1'] = 6000;
      
      const result = service.learnSectSkill('修炼加成');
      expect(result.success).toBe(true);
      expect(gameState.sect.skills['修炼加成']).toBeDefined();
    });

    it('贡献度不足不能学习技能', () => {
      service.createSect('测试仙盟');
      const result = service.learnSectSkill('修炼加成');
      expect(result.success).toBe(false);
      expect(result.message).toContain('贡献度不足');
    });

    it('已学习技能不能重复学习', () => {
      service.createSect('测试仙盟');
      gameState.sect.contribution['player1'] = 10000;
      service.learnSectSkill('修炼加成');
      
      const result = service.learnSectSkill('修炼加成');
      expect(result.success).toBe(false);
      expect(result.message).toContain('已学习');
    });

    it('应能获取技能加成', () => {
      service.createSect('测试仙盟');
      gameState.sect.contribution['player1'] = 20000;
      service.learnSectSkill('修炼加成');
      service.learnSectSkill('灵石加成');
      
      const bonuses = service.getSkillBonuses();
      expect(bonuses.cultivationSpeed).toBe(0.1);
      expect(bonuses.spiritStoneBonus).toBe(0.15);
    });

    it('未加入仙盟不能学习技能', () => {
      const result = service.learnSectSkill('修炼加成');
      expect(result.success).toBe(false);
      expect(result.message).toContain('未加入仙盟');
    });
  });

  // ===== 仙盟升级测试 =====

  describe('仙盟升级', () => {
    it('应能升级仙盟', () => {
      service.createSect('测试仙盟');
      gameState.sect.resources.spiritStones = 1000;
      
      const result = service.upgradeSect();
      expect(result.success).toBe(true);
      expect(gameState.sect.level).toBe(2);
    });

    it('资源不足时不能升级', () => {
      service.createSect('测试仙盟');
      gameState.sect.resources.spiritStones = 0;
      
      const result = service.upgradeSect();
      expect(result.success).toBe(false);
      expect(result.message).toContain('资源不足');
    });

    it('已达最高等级不能升级', () => {
      service.createSect('测试仙盟');
      gameState.sect.level = 10;
      gameState.sect.resources.spiritStones = 1000000;
      
      const result = service.upgradeSect();
      expect(result.success).toBe(false);
      expect(result.message).toContain('最高等级');
    });

    it('未加入仙盟不能升级', () => {
      const result = service.upgradeSect();
      expect(result.success).toBe(false);
      expect(result.message).toContain('未加入仙盟');
    });
  });

  // ===== 查询接口测试 =====

  describe('查询接口', () => {
    it('应能获取仙盟信息', () => {
      service.createSect('测试仙盟');
      const info = service.getSectInfo();
      expect(info.success).toBe(true);
      expect(info.inSect).toBe(true);
      expect(info.name).toBe('测试仙盟');
      expect(info.level).toBe(1);
      expect(info.memberCount).toBe(1);
    });

    it('未加入仙盟时getSectInfo应返回inSect=false', () => {
      const info = service.getSectInfo();
      expect(info.success).toBe(true);
      expect(info.inSect).toBe(false);
    });

    it('应能获取成员列表', () => {
      service.createSect('测试仙盟');
      gameState.sect.members['player2'] = { id: 'player2', name: '成员2', position: '长老', totalContribution: 500, lastActive: Date.now() };
      
      const result = service.listMembers();
      expect(result.success).toBe(true);
      expect(result.members.length).toBe(2);
      expect(result.members[0].position).toBe('盟主'); // 按职位排序
    });

    it('应能获取贡献度排名', () => {
      service.createSect('测试仙盟');
      gameState.sect.contribution['player1'] = 1000;
      gameState.sect.members['player2'] = { id: 'player2', name: '成员2', position: '弟子', totalContribution: 2000, lastActive: Date.now() };
      gameState.sect.contribution['player2'] = 2000;
      
      const result = service.getContributionRankings();
      expect(result.success).toBe(true);
      expect(result.rankings[0].playerId).toBe('player2');
      expect(result.rankings[0].contribution).toBe(2000);
    });

    it('应能获取贡献历史', () => {
      service.createSect('测试仙盟');
      service.donateContributions(500);
      
      const result = service.getContributionHistory(10);
      expect(result.success).toBe(true);
      expect(result.history.length).toBeGreaterThan(0);
    });
  });

  // ===== 常量测试 =====

  describe('常量定义', () => {
    it('SECT_LEVELS应有10个等级', () => {
      expect(Object.keys(SECT_LEVELS).length).toBe(10);
    });

    it('SECT_POSITIONS应有5个职位', () => {
      expect(SECT_POSITIONS).toEqual(['盟主', '副盟主', '长老', '精英', '弟子']);
    });

    it('POSITION_RANK应正确排序', () => {
      expect(POSITION_RANK['盟主']).toBe(5);
      expect(POSITION_RANK['弟子']).toBe(1);
      expect(POSITION_RANK['盟主']).toBeGreaterThan(POSITION_RANK['长老']);
    });

    it('SECT_SKILLS应有5种技能', () => {
      expect(Object.keys(SECT_SKILLS).length).toBe(5);
    });

    it('每个等级应有memberLimit和skillBonus', () => {
      for (let i = 1; i <= 10; i++) {
        expect(SECT_LEVELS[i].memberLimit).toBeDefined();
        expect(SECT_LEVELS[i].skillBonus).toBeDefined();
        expect(SECT_LEVELS[i].upgradeCost).toBeDefined();
      }
    });
  });

  // ===== 边界测试 =====

  describe('边界情况', () => {
    it('空成员列表应正常处理', () => {
      service.createSect('测试仙盟');
      gameState.sect.members = {};
      
      const result = service.listMembers();
      expect(result.members.length).toBe(0);
    });

    it('负数捐献应被忽略', () => {
      service.createSect('测试仙盟');
      gameState.player.spiritStones = 1000;
      service.donateContributions(-100);
      expect(gameState.player.spiritStones).toBe(1000);
    });

    it('零捐献应被忽略', () => {
      service.createSect('测试仙盟');
      const before = gameState.sect.contribution['player1'];
      service.donateContributions(0);
      expect(gameState.sect.contribution['player1']).toBe(before);
    });

    it('不存在的技能学习应失败', () => {
      service.createSect('测试仙盟');
      gameState.sect.contribution['player1'] = 10000;
      const result = service.learnSectSkill('不存在的技能');
      expect(result.success).toBe(false);
      expect(result.message).toContain('未知技能');
    });
  });
});