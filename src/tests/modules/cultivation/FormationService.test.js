/**
 * FormationService.test.js - 仙阵布设+护山大阵测试
 * V257: 仙阵布设+护山大阵
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createFormationService, FORMATION_TYPES, FORMATION_TIERS } from '../../../../src/domains/cultivation/services/FormationService.js';

function createTestGameState() {
  return {
    player: { id: 'p1', name: '测试玩家', spiritStones: 10000 },
    formations: { placed: {}, learned: [], energy: 0, activeFormation: null }
  };
}

describe('FormationService', () => {
  let gs, svc;
  beforeEach(() => { gs = createTestGameState(); svc = createFormationService(gs); });

  it('应能学习阵法', () => {
    const r = svc.learnFormation('防御', '精妙');
    expect(r.success).toBe(true);
    expect(gs.formations.learned.length).toBe(1);
  });

  it('无效阵法类型应失败', () => {
    expect(svc.learnFormation('无效', '基础').success).toBe(false);
  });

  it('应能布设阵法', () => {
    svc.learnFormation('防御', '基础');
    gs.player.spiritStones = 1000;
    const r = svc.placeFormation('防御', '山门');
    expect(r.success).toBe(true);
    expect(gs.formations.placed['山门']).toBeDefined();
  });

  it('灵石不足不能布设', () => {
    svc.learnFormation('防御', '基础');
    gs.player.spiritStones = 0;
    expect(svc.placeFormation('防御', '山门').success).toBe(false);
  });

  it('应能激活阵法', () => {
    svc.learnFormation('防御', '基础');
    gs.player.spiritStones = 1000;
    svc.placeFormation('防御', '山门');
    gs.formations.energy = 100;
    const r = svc.activateFormation('山门');
    expect(r.success).toBe(true);
    expect(gs.formations.activeFormation).toBe('山门');
  });

  it('能量不足不能激活', () => {
    svc.learnFormation('防御', '基础');
    gs.player.spiritStones = 1000;
    svc.placeFormation('防御', '山门');
    gs.formations.energy = 0;
    expect(svc.activateFormation('山门').success).toBe(false);
  });

  it('应能充能阵法', () => {
    gs.player.spiritStones = 1000;
    const r = svc.chargeFormation(100);
    expect(r.success).toBe(true);
    expect(gs.formations.energy).toBe(80);
  });

  it('灵石不足不能充能', () => {
    gs.player.spiritStones = 0;
    expect(svc.chargeFormation(100).success).toBe(false);
  });

  it('负数充能应被拒绝', () => {
    gs.player.spiritStones = 1000;
    expect(svc.chargeFormation(-100).success).toBe(false);
  });

  it('应能获取阵法效果', () => {
    svc.learnFormation('防御', '基础');
    gs.player.spiritStones = 1000;
    svc.placeFormation('防御', '山门');
    gs.formations.energy = 100;
    svc.activateFormation('山门');
    const r = svc.getFormationBonus('山门');
    expect(r.success).toBe(true);
    expect(r.bonus.defense).toBeGreaterThan(0);
  });

  it('未激活阵法应返回非活跃', () => {
    const r = svc.getFormationBonus('山门');
    expect(r.active).toBe(false);
  });

  it('应能列出已学习阵法', () => {
    svc.learnFormation('防御', '基础');
    svc.learnFormation('攻击', '精妙');
    const r = svc.listLearned();
    expect(r.learned.length).toBe(2);
  });

  it('应能列出已布设阵法', () => {
    svc.learnFormation('防御', '基础');
    gs.player.spiritStones = 1000;
    svc.placeFormation('防御', '山门');
    const r = svc.listPlaced();
    expect(r.placed['山门']).toBeDefined();
  });

  it('FORMATION_TYPES应有5种类型', () => {
    expect(Object.keys(FORMATION_TYPES)).toHaveLength(5);
  });

  it('FORMATION_TIERS应有5个等阶', () => {
    expect(Object.keys(FORMATION_TIERS)).toHaveLength(5);
  });
});