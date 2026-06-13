/**
 * DailyQuestService.test.js - 每日任务+成就奖励系统测试
 * V254: 每日任务+成就奖励系统
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createDailyQuestService, createAchievementService, QUEST_TYPES, ACHIEVEMENT_TIERS } from '../../../../src/domains/cultivation/services/DailyQuestService.js';

function createTestGameState() {
  return {
    player: { id: 'p1', name: '测试玩家', exp: 0, spiritStones: 0 },
    dailyQuests: { quests: [], lastReset: 0, streak: 0, completedIds: [] },
    achievements: { list: {}, totalAchieved: 0 }
  };
}

describe('DailyQuestService', () => {
  let gs, svc;
  beforeEach(() => { gs = createTestGameState(); svc = createDailyQuestService(gs); });

  it('应能生成每日任务', () => {
    const r = svc.generateDailyQuests();
    expect(r.success).toBe(true);
    expect(r.quests.length).toBe(5);
  });

  it('同一天不应重复生成', () => {
    svc.generateDailyQuests();
    const r2 = svc.generateDailyQuests();
    expect(r2.message).toContain('已生成');
  });

  it('应能更新任务进度', () => {
    svc.generateDailyQuests();
    const r = svc.updateQuestProgress('击杀', 5);
    expect(r.success).toBe(true);
  });

  it('任务完成时应标记', () => {
    svc.generateDailyQuests();
    const q = gs.dailyQuests.quests[0];
    q.progress = q.target - 1;
    svc.updateQuestProgress(q.type, 1);
    expect(q.completed).toBe(true);
  });

  it('应能领取奖励', () => {
    svc.generateDailyQuests();
    const q = gs.dailyQuests.quests[0];
    q.completed = true;
    q.claimed = false;
    const r = svc.claimQuestReward(q.id);
    expect(r.success).toBe(true);
    expect(gs.player.exp).toBeGreaterThan(0);
  });

  it('未完成任务不能领奖', () => {
    svc.generateDailyQuests();
    const q = gs.dailyQuests.quests[0];
    q.completed = false;
    expect(svc.claimQuestReward(q.id).success).toBe(false);
  });

  it('已领取不能重复领取', () => {
    svc.generateDailyQuests();
    const q = gs.dailyQuests.quests[0];
    q.completed = true;
    q.claimed = true;
    expect(svc.claimQuestReward(q.id).success).toBe(false);
  });

  it('应能获取任务列表', () => {
    svc.generateDailyQuests();
    const r = svc.getDailyQuests();
    expect(r.success).toBe(true);
    expect(r.quests.length).toBe(5);
    expect(r.completedCount).toBe(0);
  });
});

describe('AchievementService', () => {
  let gs, svc;
  beforeEach(() => { gs = createTestGameState(); svc = createAchievementService(gs); });

  it('应能注册成就', () => {
    svc.registerAchievement('first_kill', '首杀', '击败第一名敌人', '铜', 1, { exp: 100, spiritStones: 50 });
    expect(gs.achievements.list['first_kill']).toBeDefined();
  });

  it('应能更新进度', () => {
    svc.registerAchievement('test', '测试', '测试', '银', 10, { exp: 100, spiritStones: 50 });
    svc.updateAchievementProgress('test', 5);
    expect(gs.achievements.list['test'].progress).toBe(5);
  });

  it('达到条件应自动完成', () => {
    svc.registerAchievement('test', '测试', '测试', '金', 10, { exp: 100, spiritStones: 50 });
    svc.updateAchievementProgress('test', 10);
    expect(gs.achievements.list['test'].achieved).toBe(true);
    expect(gs.player.exp).toBe(100);
  });

  it('应能获取成就信息', () => {
    svc.registerAchievement('test', '测试', '测试', '铜', 10, { exp: 100, spiritStones: 50 });
    const r = svc.getAchievementInfo('test');
    expect(r.success).toBe(true);
    expect(r.progressPercent).toBe(0);
  });

  it('应能列出所有成就', () => {
    svc.registerAchievement('a1', '成就1', 'desc1', '铜', 5, { exp: 50, spiritStones: 25 });
    svc.registerAchievement('a2', '成就2', 'desc2', '银', 10, { exp: 100, spiritStones: 50 });
    const r = svc.getAllAchievements();
    expect(r.achievements.length).toBe(2);
  });

  it('ACHIEVEMENT_TIERS应有4个等级', () => {
    expect(Object.keys(ACHIEVEMENT_TIERS)).toHaveLength(4);
  });

  it('QUEST_TYPES应有6种任务', () => {
    expect(QUEST_TYPES).toHaveLength(6);
  });
});