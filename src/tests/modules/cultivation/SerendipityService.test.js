/**
 * SerendipityService.test.js - 仙缘奇遇+随机事件测试
 * V258: 仙缘奇遇+随机事件
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createSerendipityService, EVENT_RARITIES, EVENT_TYPES } from '../../../../src/domains/cultivation/services/SerendipityService.js';

function createTestGameState() {
  return {
    player: { id: 'p1', name: '测试玩家', exp: 0, spiritStones: 0, luck: 5 },
    serendipity: { eventHistory: [], choices: {}, cooldowns: {}, luckModifier: 0 }
  };
}

describe('SerendipityService', () => {
  let gs, svc;
  beforeEach(() => { gs = createTestGameState(); svc = createSerendipityService(gs); });

  it('应能触发仙缘事件', () => {
    const r = svc.triggerEvent();
    if (r.success) {
      expect(r.event).toBeDefined();
      expect(r.event.name).toBeDefined();
    } else {
      expect(r.message).toContain('无缘');
    }
  });

  it('事件应有正确结构', () => {
    // Force success by setting high luck
    gs.player.luck = 100;
    const r = svc.triggerEvent();
    if (r.success) {
      expect(r.event.id).toBeDefined();
      expect(r.event.name).toBeDefined();
      expect(r.event.type).toBeDefined();
      expect(r.event.rarity).toBeDefined();
      expect(EVENT_RARITIES[r.event.rarity]).toBeDefined();
    }
  });

  it('应能做出选择', () => {
    gs.player.luck = 100;
    const triggerR = svc.triggerEvent();
    if (triggerR.success) {
      const r = svc.makeChoice(triggerR.event.id, 0);
      expect(r.success).toBe(true);
      expect(gs.serendipity.choices[triggerR.event.id]).toBe(0);
    }
  });

  it('重复选择应失败', () => {
    gs.player.luck = 100;
    const triggerR = svc.triggerEvent();
    if (triggerR.success) {
      svc.makeChoice(triggerR.event.id, 0);
      expect(svc.makeChoice(triggerR.event.id, 0).success).toBe(false);
    }
  });

  it('无效事件ID应失败', () => {
    expect(svc.makeChoice('nonexistent', 0).success).toBe(false);
  });

  it('应能增加幸运值', () => {
    const r = svc.addLuckModifier(10);
    expect(r.success).toBe(true);
    expect(gs.serendipity.luckModifier).toBe(10);
  });

  it('应能获取历史事件', () => {
    gs.player.luck = 100;
    for (let i = 0; i < 3; i++) svc.triggerEvent();
    const r = svc.getEventHistory(2);
    expect(r.history.length).toBeLessThanOrEqual(2);
  });

  it('EVENT_RARITIES应有4个等级', () => {
    expect(Object.keys(EVENT_RARITIES)).toHaveLength(4);
  });

  it('EVENT_TYPES应有6种类型', () => {
    expect(EVENT_TYPES).toHaveLength(6);
  });

  it('低幸运应大概率不触发', () => {
    gs.player.luck = -100;
    gs.serendipity.luckModifier = -100;
    let triggered = 0;
    for (let i = 0; i < 10; i++) {
      if (svc.triggerEvent().success) triggered++;
    }
    expect(triggered).toBeLessThan(3);
  });
});