/**
 * ReincarnationService 测试 - 天道轮回系统
 */

const {
  ReincarnationService,
  REINC_STATES,
  KARMA_STATES,
  BLESSING_TYPES
} = require('../../../../src/domains/cultivation/services/ReincarnationService.js');

// 测试数据库
GameGlobal.getDB = null;
GameGlobal.setDB = null;
GameGlobal.getPlayerAttribute = null;

function resetTestDB() {
  GameGlobal._reinc_db = null;
  GameGlobal._reinc_counter = null;
}

// ========== queryReincarnationStatus 测试 ==========
describe('ReincarnationService.queryReincarnationStatus', () => {
  beforeEach(() => { resetTestDB(); });

  test('返回完整状态', () => {
    const result = ReincarnationService.queryReincarnationStatus();
    expect(result.success).toBe(true);
    expect(result.status).toBeDefined();
    expect(result.status.state).toBeDefined();
  });

  test('初始状态为ALIVE', () => {
    const result = ReincarnationService.queryReincarnationStatus();
    expect(result.status.state).toBe(REINC_STATES.ALIVE);
  });

  test('返回karma配置信息', () => {
    const result = ReincarnationService.queryReincarnationStatus();
    expect(result.karmaStateInfo).toBeDefined();
    expect(result.karmaStateInfo[KARMA_STATES.NEUTRAL]).toBeDefined();
  });
});

// ========== queryKarma 测试 ==========
describe('ReincarnationService.queryKarma', () => {
  beforeEach(() => { resetTestDB(); });

  test('返回因果信息', () => {
    const result = ReincarnationService.queryKarma();
    expect(result.success).toBe(true);
    expect(result.karma).toBeDefined();
    expect(result.karma.points).toBeDefined();
    expect(result.karma.state).toBeDefined();
  });

  test('返回轮回次数', () => {
    const result = ReincarnationService.queryKarma();
    expect(result.reincarnationCount).toBeDefined();
  });

  test('中立状态描述正确', () => {
    const result = ReincarnationService.queryKarma();
    expect(result.karma.stateName).toBe('中立');
  });
});

// ========== performReincarnation 测试 ==========
describe('ReincarnationService.performReincarnation', () => {
  beforeEach(() => { resetTestDB(); });

  test('寿元未尽无法轮回', () => {
    GameGlobal.getPlayerAttribute = () => 30;
    const result = ReincarnationService.performReincarnation();
    expect(result.success).toBe(false);
    expect(result.error).toContain('寿元未尽');
  });

  test('正常轮回成功', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'age' ? 100 : attr === 'level' ? 50 : 1;
    const result = ReincarnationService.performReincarnation();
    expect(result.success).toBe(true);
    expect(result.reincarnationCount).toBe(1);
  });

  test('轮回增加计数', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'age' ? 100 : 50;
    ReincarnationService.performReincarnation();
    const status = ReincarnationService.queryReincarnationStatus();
    expect(status.status.reincarnationCount).toBe(1);
  });

  test('轮回保存前世信息', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'age' ? 100 : 50;
    const result = ReincarnationService.performReincarnation();
    expect(result.previousLife).toBeDefined();
    expect(result.previousLife.age).toBe(100);
  });

  test('轮回后状态为REBORN', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'age' ? 100 : 50;
    ReincarnationService.performReincarnation();
    const status = ReincarnationService.queryReincarnationStatus();
    expect(status.status.state).toBe(REINC_STATES.REBORN);
  });
});

// ========== grantReincarnationBlessing 测试 ==========
describe('ReincarnationService.grantReincarnationBlessing', () => {
  beforeEach(() => { resetTestDB(); });

  test('发放祝福成功', () => {
    const result = ReincarnationService.grantReincarnationBlessing('MEMORY_INHERIT');
    expect(result.success).toBe(true);
    expect(result.blessing).toBeDefined();
    expect(result.blessing.name).toBe('记忆传承');
  });

  test('不指定类型随机发放', () => {
    const result = ReincarnationService.grantReincarnationBlessing();
    expect(result.success).toBe(true);
    expect(result.blessing).toBeDefined();
  });

  test('无效祝福类型失败', () => {
    const result = ReincarnationService.grantReincarnationBlessing('INVALID_TYPE');
    expect(result.success).toBe(false);
  });

  test('祝福包含价值', () => {
    const result = ReincarnationService.grantReincarnationBlessing('TALENT_BOOST');
    expect(result.success).toBe(true);
    expect(result.blessing.value).toBeGreaterThan(0);
  });
});

// ========== spendKarma 测试 ==========
describe('ReincarnationService.spendKarma', () => {
  beforeEach(() => { resetTestDB(); });

  test('因果值不足失败', () => {
    const result = ReincarnationService.spendKarma(1000);
    expect(result.success).toBe(false);
    expect(result.error).toContain('不足');
  });

  test('正常消耗因果', () => {
    // 先增加因果
    ReincarnationService.gainKarma(500, '测试');
    const result = ReincarnationService.spendKarma(200);
    expect(result.success).toBe(true);
    expect(result.remainingKarma).toBe(300);
  });

  test('消耗后状态更新', () => {
    ReincarnationService.gainKarma(500, '测试');
    ReincarnationService.spendKarma(200);
    const result = ReincarnationService.queryKarma();
    expect(result.karma.points).toBe(300);
  });
});

// ========== gainKarma 测试 ==========
describe('ReincarnationService.gainKarma', () => {
  beforeEach(() => { resetTestDB(); });

  test('正常增加因果', () => {
    const result = ReincarnationService.gainKarma(100, '测试善行');
    expect(result.success).toBe(true);
    expect(result.totalKarma).toBe(100);
  });

  test('大量因果升级状态', () => {
    ReincarnationService.gainKarma(1000, '大善举');
    const result = ReincarnationService.queryKarma();
    expect([KARMA_STATES.VIRTUE, KARMA_STATES.HIGH_VIRTUE]).toContain(result.karma.state);
  });

  test('大量负因果降级状态', () => {
    ReincarnationService.gainKarma(-1000, '大恶行');
    const result = ReincarnationService.queryKarma();
    expect([KARMA_STATES.SIN, KARMA_STATES.HEAVY_SIN]).toContain(result.karma.state);
  });
});

// ========== 流程测试 ==========
describe('ReincarnationService 完整流程', () => {
  beforeEach(() => { resetTestDB(); });

  test('轮回->祝福->因果完整流程', () => {
    // 1. 查询状态
    const initStatus = ReincarnationService.queryReincarnationStatus();
    expect(initStatus.success).toBe(true);
    
    // 2. 增加因果
    ReincarnationService.gainKarma(500, '积累功德');
    
    // 3. 发放祝福
    ReincarnationService.grantReincarnationBlessing('TALENT_BOOST');
    
    // 4. 执行轮回
    GameGlobal.getPlayerAttribute = (attr) => attr === 'age' ? 100 : 50;
    const reincResult = ReincarnationService.performReincarnation();
    expect(reincResult.success).toBe(true);
    
    // 5. 查询因果
    const karmaResult = ReincarnationService.queryKarma();
    expect(karmaResult.success).toBe(true);
  });

  test('多次轮回累积', () => {
    GameGlobal.getPlayerAttribute = (attr) => attr === 'age' ? 100 : 50;
    
    for (let i = 0; i < 3; i++) {
      ReincarnationService.performReincarnation();
    }
    
    const status = ReincarnationService.queryReincarnationStatus();
    expect(status.status.reincarnationCount).toBe(3);
  });
});

// ========== 边界测试 ==========
describe('ReincarnationService 边界条件', () => {
  beforeEach(() => { resetTestDB(); });

  test('极端因果值处理', () => {
    ReincarnationService.gainKarma(10000, '超大善行');
    const result = ReincarnationService.queryKarma();
    expect(result.karma.state).toBe(KARMA_STATES.HIGH_VIRTUE);
  });

  test('负极端因果值处理', () => {
    ReincarnationService.gainKarma(-10000, '超大恶行');
    const result = ReincarnationService.queryKarma();
    expect(result.karma.state).toBe(KARMA_STATES.HEAVY_SIN);
  });

  test('祝福类型完整', () => {
    Object.keys(BLESSING_TYPES).forEach(type => {
      const result = ReincarnationService.grantReincarnationBlessing(type);
      expect(result.success).toBe(true);
    });
  });
});

// 运行测试
if (typeof globalThis.describe === 'undefined') {
  globalThis.describe = (name, fn) => console.log(`\n=== ${name} ===`);
  globalThis.test = (name, fn) => {
    try { fn(); console.log(`  ✓ ${name}`); }
    catch (e) { console.error(`  ✗ ${name}: ${e.message}`); }
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