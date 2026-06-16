/**
 * ImmortalChatService.test.js - 仙人社交+仙友互动系统测试
 * V253: 仙人社交+仙友互动
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createImmortalChatService, INTERACTION_TYPES, RELATION_LEVELS } from '../../../../src/domains/cultivation/services/ImmortalChatService.js';

function createTestGameState() {
  return {
    player: { id: 'p1', name: '测试玩家', spiritStones: 10000 },
    social: { friends: {}, relationPoints: {}, giftHistory: [], chatHistory: [] }
  };
}

describe('ImmortalChatService', () => {
  let gs, svc;
  beforeEach(() => { gs = createTestGameState(); svc = createImmortalChatService(gs); });

  it('应能添加仙友', () => {
    expect(svc.addFriend('p2', '道友A').success).toBe(true);
  });

  it('重复添加应失败', () => {
    svc.addFriend('p2', '道友A');
    expect(svc.addFriend('p2', '道友A').success).toBe(false);
  });

  it('应能删除仙友', () => {
    svc.addFriend('p2', '道友A');
    expect(svc.removeFriend('p2').success).toBe(true);
    expect(gs.social.friends.p2).toBeUndefined();
  });

  it('删除非仙友应失败', () => {
    expect(svc.removeFriend('p2').success).toBe(false);
  });

  it('应能互动增加亲密度', () => {
    svc.addFriend('p2', '道友A');
    const r = svc.interact('p2', '论道');
    expect(r.success).toBe(true);
    expect(r.points).toBe(3);
  });

  it('送礼应增加更多亲密度', () => {
    svc.addFriend('p2', '道友A');
    const r = svc.interact('p2', '送礼');
    expect(r.points).toBe(10);
  });

  it('切磋应增加亲密度', () => {
    svc.addFriend('p2', '道友A');
    expect(svc.interact('p2', '切磋').points).toBe(5);
  });

  it('应能赠送灵石', () => {
    svc.addFriend('p2', '道友A');
    const r = svc.sendGift('p2', 500);
    expect(r.success).toBe(true);
    expect(gs.player.spiritStones).toBe(9500);
  });

  it('灵石不足应不能赠送', () => {
    svc.addFriend('p2', '道友A');
    gs.player.spiritStones = 0;
    expect(svc.sendGift('p2', 100).success).toBe(false);
  });

  it('应能列出仙友', () => {
    svc.addFriend('p2', '道友A');
    svc.addFriend('p3', '道友B');
    const r = svc.getFriends();
    expect(r.friends.length).toBe(2);
  });

  it('亲密度达到阈值应升级关系', () => {
    svc.addFriend('p2', '道友A');
    for (let i = 0; i < 7; i++) svc.interact('p2', '论道');
    expect(gs.social.friends.p2.level).toBe('仙友');
  });

  it('100点亲密度应为道侣', () => {
    svc.addFriend('p2', '道友A');
    gs.social.relationPoints.p2 = 100;
    svc.interact('p2', '论道');
    expect(gs.social.friends.p2.level).toBe('道侣');
  });

  it('应能获取聊天历史', () => {
    const r = svc.getChatHistory(10);
    expect(r.success).toBe(true);
    expect(Array.isArray(r.history)).toBe(true);
  });

  it('所有互动类型应有效', () => {
    svc.addFriend('p2', '道友A');
    INTERACTION_TYPES.forEach(t => expect(svc.interact('p2', t).success).toBe(true));
  });

  it('无效互动类型应失败', () => {
    svc.addFriend('p2', '道友A');
    expect(svc.interact('p2', '无效').success).toBe(false);
  });

  it('RELATION_LEVELS应有5个等级', () => {
    expect(Object.keys(RELATION_LEVELS)).toHaveLength(5);
  });
});