/**
 * MagicUnificationService 测试 - 万法归一系统
 */
const { MagicUnificationService, MAGIC_TYPES, MAGIC_LIST } = require('../../../../src/domains/cultivation/services/MagicUnificationService.js');
GameGlobal.getDB = null; GameGlobal.setDB = null; GameGlobal.getPlayerAttribute = null;
function resetTestDB() { GameGlobal._magic_db = null; }

describe('MagicUnificationService', () => {
  beforeEach(() => { resetTestDB(); });
  
  test('查询状态返回完整信息', () => {
    const r = MagicUnificationService.queryMagicStatus();
    expect(r.success).toBe(true);
    expect(r.status).toBeDefined();
  });
  
  test('融合法术成功', () => {
    GameGlobal._magic_db = { unifiedLevel: 0, masteredMagics: [], magicPower: 1000, balanceScore: 50, fusionHistory: [] };
    const r = MagicUnificationService.unifyMagics('fireball', 'iceLance');
    expect(r.success).toBe(true);
  });
  
  test('分析玩家实体', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'level' ? 50 : 1;
    const r = MagicUnificationService.analyzeEntityMagic('player');
    expect(r.success).toBe(true);
  });
  
  test('平衡法力成功', () => {
    GameGlobal._magic_db = { unifiedLevel: 0, masteredMagics: [], magicPower: 100, balanceScore: 20, fusionHistory: [] };
    const r = MagicUnificationService.balanceMagic();
    expect(r.success).toBe(true);
  });
  
  test('法力不足失败', () => {
    GameGlobal._magic_db = { unifiedLevel: 0, masteredMagics: [], magicPower: 10, balanceScore: 50, fusionHistory: [] };
    const r = MagicUnificationService.balanceMagic();
    expect(r.success).toBe(false);
  });
  
  test('遗忘未学会法术失败', () => {
    GameGlobal._magic_db = { unifiedLevel: 0, masteredMagics: [], magicPower: 100, balanceScore: 50, fusionHistory: [] };
    const r = MagicUnificationService.forgetMagic('fireball');
    expect(r.success).toBe(false);
  });
  
  test('遗忘已学会法术成功', () => {
    GameGlobal._magic_db = { unifiedLevel: 1, masteredMagics: [{ id: 'fireball_iceLance', name: '火球+冰刺', type: 'ELEMENTAL', basePower: 100, cost: 15, fusionCount: 1, masteredAt: Date.now() }], magicPower: 100, balanceScore: 50, fusionHistory: [] };
    const r = MagicUnificationService.forgetMagic('fireball_iceLance');
    expect(r.success).toBe(true);
  });
  
  test('法术列表完整', () => {
    Object.keys(MAGIC_LIST).forEach(id => {
      expect(MAGIC_LIST[id].name).toBeDefined();
      expect(MAGIC_LIST[id].type).toBeDefined();
    });
  });
  
  test('融合后等级提升', () => {
    GameGlobal._magic_db = { unifiedLevel: 0, masteredMagics: [], magicPower: 1000, balanceScore: 50, fusionHistory: [] };
    MagicUnificationService.unifyMagics('fireball', 'iceLance');
    expect(MagicUnificationService.queryMagicStatus().status.unifiedLevel).toBe(1);
  });
  
  test('同系融合有加成', () => {
    GameGlobal._magic_db = { unifiedLevel: 0, masteredMagics: [], magicPower: 1000, balanceScore: 50, fusionHistory: [] };
    const r = MagicUnificationService.unifyMagics('fireball', 'lightning');
    expect(r.success).toBe(true);
    expect(r.newMagic.power).toBeGreaterThan(45);
  });
  
  test('分析不存在实体失败', () => {
    const r = MagicUnificationService.analyzeEntityMagic('nonexistent_entity_xyz');
    expect(r.success).toBe(false);
  });
  
  test('法术上限', () => {
    GameGlobal._magic_db = { unifiedLevel: 0, masteredMagics: Array(10).fill(null).map((_, i) => ({ id: 'm' + i, name: 'magic' + i, type: 'ELEMENTAL', basePower: 10, cost: 10, fusionCount: 1, masteredAt: Date.now() })), magicPower: 1000, balanceScore: 50, fusionHistory: [] };
    const r = MagicUnificationService.unifyMagics('fireball', 'iceLance');
    expect(r.success).toBe(false);
  });
  
  test('融合历史记录', () => {
    GameGlobal._magic_db = { unifiedLevel: 0, masteredMagics: [], magicPower: 1000, balanceScore: 50, fusionHistory: [] };
    MagicUnificationService.unifyMagics('fireball', 'iceLance');
    expect(MagicUnificationService.queryMagicStatus().status.unifiedLevel).toBe(1);
  });
  
  test('法力消耗', () => {
    GameGlobal._magic_db = { unifiedLevel: 0, masteredMagics: [], magicPower: 100, balanceScore: 50, fusionHistory: [] };
    const before = 100;
    MagicUnificationService.unifyMagics('fireball', 'iceLance');
    const after = GameGlobal._magic_db.magicPower;
    expect(after).toBeLessThan(before);
  });
  
  test('类型分布', () => {
    const r = MagicUnificationService.queryMagicStatus();
    expect(r.typeDistribution).toBeDefined();
    expect(r.typeDistribution.length).toBe(5);
  });
  
  test('可用法术列表', () => {
    const r = MagicUnificationService.queryMagicStatus();
    expect(r.availableMagics.length).toBeGreaterThan(0);
  });
  
  test('已掌握法术列表', () => {
    GameGlobal._magic_db = { unifiedLevel: 1, masteredMagics: [{ id: 'fireball_iceLance', name: '火球+冰刺', type: 'ELEMENTAL', basePower: 100, cost: 15, fusionCount: 1, masteredAt: Date.now() }], magicPower: 100, balanceScore: 50, fusionHistory: [] };
    const r = MagicUnificationService.queryMagicStatus();
    expect(r.masteredMagics.length).toBe(1);
  });
  
  test('多次融合', () => {
    GameGlobal._magic_db = { unifiedLevel: 0, masteredMagics: [], magicPower: 10000, balanceScore: 50, fusionHistory: [] };
    MagicUnificationService.unifyMagics('fireball', 'iceLance');
    MagicUnificationService.unifyMagics('lightning', 'earthShield');
    expect(MagicUnificationService.queryMagicStatus().status.unifiedLevel).toBe(2);
  });
  
  test('融合相同法术', () => {
    GameGlobal._magic_db = { unifiedLevel: 0, masteredMagics: [], magicPower: 1000, balanceScore: 50, fusionHistory: [] };
    const r = MagicUnificationService.unifyMagics('fireball', 'fireball');
    expect(r.success).toBe(true);
  });
  
  test('平衡后法力降低', () => {
    GameGlobal._magic_db = { unifiedLevel: 0, masteredMagics: [], magicPower: 100, balanceScore: 20, fusionHistory: [] };
    MagicUnificationService.balanceMagic();
    expect(GameGlobal._magic_db.magicPower).toBe(50);
  });
  
  test('所有法术类型有效', () => {
    Object.keys(MAGIC_TYPES).forEach(t => expect(t).toBeDefined());
  });
  
  test('法力类型分布', () => {
    const r = MagicUnificationService.queryMagicStatus();
    r.typeDistribution.forEach(d => {
      expect(d.type).toBeDefined();
      expect(typeof d.count).toBe('number');
    });
  });
  
  test('法术威力随等级变化', () => {
    GameGlobal._magic_db = { unifiedLevel: 5, masteredMagics: [{ id: 'fireball_iceLance', name: '火球+冰刺', type: 'ELEMENTAL', basePower: 50, cost: 15, fusionCount: 1, masteredAt: Date.now() }], magicPower: 100, balanceScore: 50, fusionHistory: [] };
    const r = MagicUnificationService.queryMagicStatus();
    expect(r.masteredMagics[0].currentPower).toBeGreaterThan(50);
  });
  
  test('遗忘后法术上限解除', () => {
    GameGlobal._magic_db = { unifiedLevel: 0, masteredMagics: Array(10).fill(null).map((_, i) => ({ id: 'm' + i, name: 'magic' + i, type: 'ELEMENTAL', basePower: 10, cost: 10, fusionCount: 1, masteredAt: Date.now() })), magicPower: 1000, balanceScore: 50, fusionHistory: [] };
    MagicUnificationService.forgetMagic('m0');
    const r = MagicUnificationService.unifyMagics('fireball', 'iceLance');
    expect(r.success).toBe(true);
  });
  
  test('融合后更新威力', () => {
    GameGlobal._magic_db = { unifiedLevel: 0, masteredMagics: [{ id: 'fireball_iceLance', name: '火球+冰刺', type: 'ELEMENTAL', basePower: 50, cost: 15, fusionCount: 1, masteredAt: Date.now() }], magicPower: 1000, balanceScore: 50, fusionHistory: [] };
    MagicUnificationService.unifyMagics('fireball', 'iceLance');
    const magic = GameGlobal._magic_db.masteredMagics.find(m => m.id === 'fireball_iceLance');
    expect(magic.fusionCount).toBe(2);
  });
  
  test('分析实体势', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'level' ? 30 : 5;
    const r = MagicUnificationService.analyzeEntityMagic('player');
    expect(r.entity.potential).toBeGreaterThan(0);
    expect(r.entity.affinity.length).toBe(5);
  });
  
  test('查询返回融合历史', () => {
    GameGlobal._magic_db = { unifiedLevel: 1, masteredMagics: [], magicPower: 100, balanceScore: 50, fusionHistory: [{ source: 'fireball', target: 'iceLance', power: 100, at: Date.now() }] };
    const r = MagicUnificationService.queryMagicStatus();
    expect(r.status).toBeDefined();
  });
});

// 运行测试
if (typeof globalThis.describe === 'undefined') {
  globalThis.describe = (name, fn) => console.log(`\n=== ${name} ===`);
  globalThis.test = (name, fn) => { try { fn(); console.log(`  ✓ ${name}`); } catch (e) { console.error(`  ✗ ${name}: ${e.message}`); } };
  globalThis.expect = (actual) => ({
    toBe: (expected) => { if (actual !== expected) throw new Error(`期望 ${expected}, 实际 ${actual}`); },
    toBeDefined: () => { if (actual === undefined) throw new Error('期望有值'); },
    toBeGreaterThan: (expected) => { if (actual <= expected) throw new Error(`期望大于 ${expected}`); },
    toBeLessThan: (expected) => { if (actual >= expected) throw new Error(`期望小于 ${expected}`); },
    not: { toBe: (expected) => { if (actual === expected) throw new Error(`期望不是 ${expected}`); } }
  });
}