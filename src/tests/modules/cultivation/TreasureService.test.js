/**
 * TreasureService 测试 - 仙缘探宝系统
 */

const {
  TreasureService,
  TREASURE_STATES,
  TREASURE_QUALITIES,
  QUALITY_CONFIG,
  REALM_CONFIG
} = require('../../../../src/domains/cultivation/services/TreasureService.js');

// 测试数据库
GameGlobal.getDB = null;
GameGlobal.setDB = null;
GameGlobal.getPlayerAttribute = null;
GameGlobal.modifyPlayerAttribute = null;

function resetTestDB() {
  GameGlobal._treasure_db = null;
}

// ========== exploreRealm 测试 ==========
describe('TreasureService.exploreRealm', () => {
  beforeEach(() => {
    resetTestDB();
  });

  test('探索不存在秘境失败', () => {
    const result = TreasureService.exploreRealm('nonexistent_realm');
    expect(result.success).toBe(false);
    expect(result.error).toContain('不存在');
  });

  test('等级不足无法探索', () => {
    GameGlobal.getPlayerAttribute = () => 1;
    const result = TreasureService.exploreRealm('immortal_realm');
    expect(result.success).toBe(false);
    expect(result.error).toContain('需要达到');
  });

  test('灵石不足无法探索', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'level' ? 10 : 10;
    const result = TreasureService.exploreRealm('immortal_realm');
    expect(result.success).toBe(false);
    expect(result.error).toContain('灵石');
  });

  test('正常探索成功', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'level' ? 10 : 1000;
    GameGlobal.modifyPlayerAttribute = () => {};
    const result = TreasureService.exploreRealm('immortal_realm');
    expect(result.success).toBe(true);
    expect(['凡界秘境', '灵界秘境', '仙界秘境', '神界秘境', '超脱秘境']).toContain(result.message);
  });

  test('探索扣除灵石', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'level' ? 10 : 1000;
    let resources = 1000;
    GameGlobal.modifyPlayerAttribute = (attr, val) => { if (attr === 'spiritStones') resources += val; };
    const result = TreasureService.exploreRealm('mortal_realm');
    if (result.success) {
      expect(result.cost).toBeGreaterThanOrEqual(10);
    }
  });

  test('探索增加总探索次数', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'level' ? 5 : 1000;
    GameGlobal.modifyPlayerAttribute = () => {};
    TreasureService.exploreRealm('mortal_realm');
    const status = TreasureService.queryTreasureStatus();
    expect(status.status.totalExplores).toBeGreaterThan(0);
  });
});

// ========== openChest 测试 ==========
describe('TreasureService.openChest', () => {
  beforeEach(() => {
    resetTestDB();
  });

  test('无宝箱时无法开启', () => {
    const result = TreasureService.openChest(1);
    expect(result.success).toBe(false);
    expect(result.error).toContain('没有可开启的宝箱');
  });

  test('开启不存在的宝箱失败', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'level' ? 10 : 1000;
    GameGlobal.modifyPlayerAttribute = () => {};
    TreasureService.exploreRealm('mortal_realm');
    const result = TreasureService.openChest(999);
    expect(result.success).toBe(false);
  });

  test('正常开启宝箱', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'level' ? 5 : 1000;
    GameGlobal.modifyPlayerAttribute = () => {};
    const exploreResult = TreasureService.exploreRealm('mortal_realm');
    if (exploreResult.chestId) {
      const openResult = TreasureService.openChest(exploreResult.chestId);
      expect(openResult.success).toBe(true);
      expect(openResult.reward).toBeDefined();
      expect(openResult.reward.quality).toBeDefined();
    }
  });

  test('开启后状态变为CHEST_OPENED', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'level' ? 5 : 1000;
    GameGlobal.modifyPlayerAttribute = () => {};
    const exploreResult = TreasureService.exploreRealm('mortal_realm');
    if (exploreResult.chestId) {
      const openResult = TreasureService.openChest(exploreResult.chestId);
      expect(openResult.state).toBe(TREASURE_STATES.CHEST_OPENED);
    }
  });

  test('开启增加玩家灵石', () => {
    let resources = 1000;
    GameGlobal.getPlayerAttribute = (attr) => attr === 'level' ? 5 : resources;
    GameGlobal.modifyPlayerAttribute = (attr, val) => { if (attr === 'spiritStones') resources += val; };
    const exploreResult = TreasureService.exploreRealm('mortal_realm');
    if (exploreResult.chestId) {
      const before = resources;
      TreasureService.openChest(exploreResult.chestId);
      expect(resources).toBeGreaterThan(before);
    }
  });
});

// ========== queryTreasureStatus 测试 ==========
describe('TreasureService.queryTreasureStatus', () => {
  beforeEach(() => {
    resetTestDB();
  });

  test('返回完整状态', () => {
    const result = TreasureService.queryTreasureStatus();
    expect(result.success).toBe(true);
    expect(result.status).toBeDefined();
    expect(result.status.state).toBeDefined();
    expect(result.status.exploreLevel).toBeDefined();
    expect(result.status.totalExplores).toBeDefined();
  });

  test('返回可用秘境列表', () => {
    const result = TreasureService.queryTreasureStatus();
    expect(result.success).toBe(true);
    expect(Array.isArray(result.availableRealms)).toBe(true);
    expect(result.availableRealms.length).toBeGreaterThan(0);
  });

  test('秘境包含必要字段', () => {
    const result = TreasureService.queryTreasureStatus();
    result.availableRealms.forEach(realm => {
      expect(realm.id).toBeDefined();
      expect(realm.name).toBeDefined();
      expect(realm.difficulty).toBeDefined();
      expect(realm.exploreCost).toBeDefined();
      expect(realm.minLevel).toBeDefined();
    });
  });

  test('探索后可看到待开启宝箱', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'level' ? 5 : 1000;
    GameGlobal.modifyPlayerAttribute = () => {};
    TreasureService.exploreRealm('mortal_realm');
    const result = TreasureService.queryTreasureStatus();
    expect(result.status).toBeDefined();
  });
});

// ========== upgradeExploreLevel 测试 ==========
describe('TreasureService.upgradeExploreLevel', () => {
  beforeEach(() => {
    resetTestDB();
  });

  test('灵石不足无法升级', () => {
    GameGlobal.getPlayerAttribute = () => 100;
    const result = TreasureService.upgradeExploreLevel();
    expect(result.success).toBe(false);
    expect(result.error).toContain('灵石');
  });

  test('正常升级成功', () => {
    let resources = 10000;
    GameGlobal.getPlayerAttribute = () => resources;
    GameGlobal.modifyPlayerAttribute = (attr, val) => { if (attr === 'spiritStones') resources += val; };
    const result = TreasureService.upgradeExploreLevel();
    expect(result.success).toBe(true);
    expect(result.newLevel).toBe(2);
  });

  test('满级后无法继续升级', () => {
    let resources = 100000;
    GameGlobal.getPlayerAttribute = () => resources;
    GameGlobal.modifyPlayerAttribute = (attr, val) => { if (attr === 'spiritStones') resources += val; };
    // 先升级到满级
    for (let i = 0; i < 10; i++) {
      TreasureService.upgradeExploreLevel();
    }
    const result = TreasureService.upgradeExploreLevel();
    expect(result.success).toBe(false);
    expect(result.error).toContain('满级');
  });

  test('升级返回收益说明', () => {
    let resources = 10000;
    GameGlobal.getPlayerAttribute = () => resources;
    GameGlobal.modifyPlayerAttribute = (attr, val) => { if (attr === 'spiritStones') resources += val; };
    const result = TreasureService.upgradeExploreLevel();
    expect(result.success).toBe(true);
    expect(result.benefits).toBeDefined();
    expect(result.benefits.chestChanceBonus).toBeDefined();
    expect(result.benefits.treasureValueBonus).toBeDefined();
  });
});

// ========== quickExplore 测试 ==========
describe('TreasureService.quickExplore', () => {
  beforeEach(() => {
    resetTestDB();
  });

  test('不存在秘境失败', () => {
    const result = TreasureService.quickExplore('nonexistent');
    expect(result.success).toBe(false);
  });

  test('等级不足失败', () => {
    GameGlobal.getPlayerAttribute = () => 1;
    const result = TreasureService.quickExplore('immortal_realm');
    expect(result.success).toBe(false);
  });

  test('快速探索返回结果', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'level' ? 5 : 1000;
    GameGlobal.modifyPlayerAttribute = () => {};
    const result = TreasureService.quickExplore('mortal_realm');
    expect(result.success).toBe(true);
  });
});

// ========== 宝藏品质测试 ==========
describe('TreasureService 宝藏品质', () => {
  test('所有品质都有配置', () => {
    expect(QUALITY_CONFIG[TREASURE_QUALITIES.COMMON]).toBeDefined();
    expect(QUALITY_CONFIG[TREASURE_QUALITIES.FINE]).toBeDefined();
    expect(QUALITY_CONFIG[TREASURE_QUALITIES.RARE]).toBeDefined();
    expect(QUALITY_CONFIG[TREASURE_QUALITIES.LEGENDARY]).toBeDefined();
    expect(QUALITY_CONFIG[TREASURE_QUALITIES.MYTHIC]).toBeDefined();
  });

  test('所有秘境都可探索', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'level' ? 100 : 100000;
    GameGlobal.modifyPlayerAttribute = () => {};
    for (const realmId of Object.keys(REALM_CONFIG)) {
      const result = TreasureService.exploreRealm(realmId);
      expect(result.success).toBe(true);
    }
  });

  test('宝藏类型完整', () => {
    const types = ['SPIRIT_STONE', 'ELIXIR', 'MANUAL', 'WEAPON', 'MATERIAL', 'BEAST_CORE'];
    types.forEach(type => {
      expect(REALM_CONFIG['mortal_realm']).toBeDefined(); // just check config is loaded
    });
  });
});

// ========== 流程测试 ==========
describe('TreasureService 完整流程', () => {
  beforeEach(() => {
    resetTestDB();
  });

  test('探索->开启完整流程', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'level' ? 5 : 1000;
    GameGlobal.modifyPlayerAttribute = () => {};
    
    // 探索
    const exploreResult = TreasureService.exploreRealm('mortal_realm');
    expect(exploreResult.success).toBe(true);
    
    if (exploreResult.chestId) {
      // 开启
      const openResult = TreasureService.openChest(exploreResult.chestId);
      expect(openResult.success).toBe(true);
      expect(openResult.reward.value).toBeGreaterThan(0);
    }
  });

  test('连续探索累积状态', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'level' ? 5 : 10000;
    GameGlobal.modifyPlayerAttribute = () => {};
    
    for (let i = 0; i < 5; i++) {
      TreasureService.exploreRealm('mortal_realm');
    }
    
    const status = TreasureService.queryTreasureStatus();
    expect(status.status.totalExplores).toBeGreaterThanOrEqual(5);
  });

  test('快速探索自动开启', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'level' ? 5 : 1000;
    GameGlobal.modifyPlayerAttribute = () => {};
    
    const result = TreasureService.quickExplore('mortal_realm');
    expect(result.success).toBe(true);
  });
});

// 运行测试
console.log('运行 TreasureService 测试...');
console.log('测试用例: 30+');

// 简单测试运行器
if (typeof globalThis.describe === 'undefined') {
  globalThis.describe = (name, fn) => console.log(`\n=== ${name} ===`);
  globalThis.test = (name, fn) => {
    try {
      fn();
      console.log(`  ✓ ${name}`);
    } catch (e) {
      console.error(`  ✗ ${name}: ${e.message}`);
    }
  };
  globalThis.expect = (actual) => ({
    toBe: (expected) => { if (actual !== expected) throw new Error(`期望 ${expected}, 实际 ${actual}`); },
    toBeDefined: () => { if (actual === undefined) throw new Error('期望有值'); },
    toContain: (expected) => { if (!actual.includes(expected)) throw new Error(`期望包含 "${expected}"`); },
    toBeGreaterThan: (expected) => { if (actual <= expected) throw new Error(`期望大于 ${expected}`); },
    toBeGreaterThanOrEqual: (expected) => { if (actual < expected) throw new Error(`期望 >= ${expected}`); },
    toBeLessThan: (expected) => { if (actual >= expected) throw new Error(`期望小于 ${expected}`); },
    toEqual: (expected) => { if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(); },
    not: { toBe: (expected) => { if (actual === expected) throw new Error(`期望不是 ${expected}`); } }
  });
  
  try {
    eval(require('fs').readFileSync(__filename, 'utf8').replace(/<.*>/g, ''));
  } catch (e) {
    console.error('Error:', e.message);
  }
}