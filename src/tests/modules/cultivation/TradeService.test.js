/**
 * TradeService 测试 - 仙界贸易系统
 */

const { TradeService, TRADE_STATES, GOODS, MARKETS, ROUTES } = require('../../../../src/domains/cultivation/services/TradeService.js');

GameGlobal.getDB = null;
GameGlobal.setDB = null;
GameGlobal.getPlayerAttribute = null;

function resetTestDB() { GameGlobal._trade_db = null; }

// ========== listMarketGoods 测试 ==========
describe('TradeService.listMarketGoods', () => {
  beforeEach(() => { resetTestDB(); });
  test('不存在市场失败', () => {
    const result = TradeService.listMarketGoods('无效市场');
    expect(result.success).toBe(false);
  });
  test('等级不足失败', () => {
    GameGlobal.getPlayerAttribute = () => 1;
    const result = TradeService.listMarketGoods('仙界市场');
    expect(result.success).toBe(false);
  });
  test('正常查询', () => {
    GameGlobal.getPlayerAttribute = () => 50;
    const result = TradeService.listMarketGoods('凡界市场');
    expect(result.success).toBe(true);
    expect(result.goods).toBeDefined();
  });
  test('市场包含必要字段', () => {
    GameGlobal.getPlayerAttribute = () => 50;
    const result = TradeService.listMarketGoods('凡界市场');
    result.goods.forEach(g => {
      expect(g.id).toBeDefined();
      expect(g.name).toBeDefined();
      expect(g.price).toBeGreaterThan(0);
    });
  });
});

// ========== buyGoods 测试 ==========
describe('TradeService.buyGoods', () => {
  beforeEach(() => { resetTestDB(); });
  test('不存在市场失败', () => {
    const result = TradeService.buyGoods('无效', 'SPIRIT_STONE', 10);
    expect(result.success).toBe(false);
  });
  test('不存在商品失败', () => {
    const result = TradeService.buyGoods('凡界市场', 'INVALID', 10);
    expect(result.success).toBe(false);
  });
  test('数量无效失败', () => {
    const result = TradeService.buyGoods('凡界市场', 'SPIRIT_STONE', 0);
    expect(result.success).toBe(false);
  });
  test('灵石不足失败', () => {
    GameGlobal._trade_db = { playerMoney: 10, inventory: [], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    const result = TradeService.buyGoods('凡界市场', 'WEAPON', 100);
    expect(result.success).toBe(false);
  });
  test('正常购买成功', () => {
    GameGlobal._trade_db = { playerMoney: 10000, inventory: [], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    const result = TradeService.buyGoods('凡界市场', 'SPIRIT_STONE', 100);
    expect(result.success).toBe(true);
  });
  test('购买后库存增加', () => {
    GameGlobal._trade_db = { playerMoney: 10000, inventory: [], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    TradeService.buyGoods('凡界市场', 'ELIXIR', 10);
    const status = TradeService.queryTradeStatus();
    expect(status.inventory.length).toBeGreaterThan(0);
  });
});

// ========== sellGoods 测试 ==========
describe('TradeService.sellGoods', () => {
  beforeEach(() => { resetTestDB(); });
  test('不存在市场失败', () => {
    const result = TradeService.sellGoods('无效', 'SPIRIT_STONE', 10);
    expect(result.success).toBe(false);
  });
  test('库存不足失败', () => {
    GameGlobal._trade_db = { playerMoney: 1000, inventory: [], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    const result = TradeService.sellGoods('凡界市场', 'SPIRIT_STONE', 100);
    expect(result.success).toBe(false);
  });
  test('正常出售成功', () => {
    GameGlobal._trade_db = { playerMoney: 10000, inventory: [{ goodId: 'SPIRIT_STONE', name: '灵石', quantity: 100, avgPrice: 10, purchasedAt: Date.now() }], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    const result = TradeService.sellGoods('凡界市场', 'SPIRIT_STONE', 50);
    expect(result.success).toBe(true);
  });
});

// ========== transportGoods 测试 ==========
describe('TradeService.transportGoods', () => {
  beforeEach(() => { resetTestDB(); });
  test('不存在路线失败', () => {
    const result = TradeService.transportGoods('无效路线', 'SPIRIT_STONE', 10);
    expect(result.success).toBe(false);
  });
  test('库存不足失败', () => {
    GameGlobal._trade_db = { playerMoney: 10000, inventory: [], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    const result = TradeService.transportGoods('凡界-灵界', 'SPIRIT_STONE', 10);
    expect(result.success).toBe(false);
  });
  test('费用不足失败', () => {
    GameGlobal._trade_db = { playerMoney: 10, inventory: [{ goodId: 'SPIRIT_STONE', name: '灵石', quantity: 100, avgPrice: 1, purchasedAt: Date.now() }], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    const result = TradeService.transportGoods('凡界-灵界', 'SPIRIT_STONE', 10);
    expect(result.success).toBe(false);
  });
  test('正常运输成功', () => {
    GameGlobal._trade_db = { playerMoney: 10000, inventory: [{ goodId: 'SPIRIT_STONE', name: '灵石', quantity: 100, avgPrice: 1, purchasedAt: Date.now() }], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    const result = TradeService.transportGoods('凡界-灵界', 'SPIRIT_STONE', 10);
    expect(result.success).toBe(true);
  });
});

// ========== queryTradeStatus 测试 ==========
describe('TradeService.queryTradeStatus', () => {
  beforeEach(() => { resetTestDB(); });
  test('返回完整状态', () => {
    const result = TradeService.queryTradeStatus();
    expect(result.success).toBe(true);
    expect(result.status).toBeDefined();
  });
  test('返回市场列表', () => {
    const result = TradeService.queryTradeStatus();
    expect(result.markets).toBeDefined();
    expect(result.markets.length).toBeGreaterThan(0);
  });
  test('返回路线列表', () => {
    const result = TradeService.queryTradeStatus();
    expect(result.routes).toBeDefined();
    expect(result.routes.length).toBeGreaterThan(0);
  });
});

// ========== 流程测试 ==========
describe('TradeService 完整流程', () => {
  beforeEach(() => { resetTestDB(); });
  test('买->卖完整流程', () => {
    GameGlobal._trade_db = { playerMoney: 10000, inventory: [], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    TradeService.buyGoods('凡界市场', 'ELIXIR', 10);
    const sellResult = TradeService.sellGoods('凡界市场', 'ELIXIR', 5);
    expect(sellResult.success).toBe(true);
  });
});

// 运行测试
if (typeof globalThis.describe === 'undefined') {
  globalThis.describe = (name, fn) => console.log(`\n=== ${name} ===`);
  globalThis.test = (name, fn) => { try { fn(); console.log(`  ✓ ${name}`); } catch (e) { console.error(`  ✗ ${name}: ${e.message}`); } };
  globalThis.expect = (actual) => ({
    toBe: (expected) => { if (actual !== expected) throw new Error(`期望 ${expected}, 实际 ${actual}`); },
    toBeDefined: () => { if (actual === undefined) throw new Error('期望有值'); },
    toContain: (expected) => { if (!actual.includes(expected)) throw new Error(`期望包含 "${expected}"`); },
    toBeGreaterThan: (expected) => { if (actual <= expected) throw new Error(`期望大于 ${expected}`); },
    toBeLessThan: (expected) => { if (actual >= expected) throw new Error(`期望小于 ${expected}`); },
    not: { toBe: (expected) => { if (actual === expected) throw new Error(`期望不是 ${expected}`); } }
  });
}

// 简单测试运行
describe('TradeService', () => {
  beforeEach(() => { resetTestDB(); });
  
  test('市场列表', () => {
    GameGlobal.getPlayerAttribute = () => 50;
    const r = TradeService.listMarketGoods('凡界市场');
    expect(r.success).toBe(true);
  });
  test('购买', () => {
    GameGlobal._trade_db = { playerMoney: 10000, inventory: [], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    const r = TradeService.buyGoods('凡界市场', 'SPIRIT_STONE', 100);
    expect(r.success).toBe(true);
  });
  test('出售', () => {
    GameGlobal._trade_db = { playerMoney: 10000, inventory: [{ goodId: 'SPIRIT_STONE', name: '灵石', quantity: 100, avgPrice: 10, purchasedAt: Date.now() }], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    const r = TradeService.sellGoods('凡界市场', 'SPIRIT_STONE', 50);
    expect(r.success).toBe(true);
  });
  test('运输', () => {
    GameGlobal._trade_db = { playerMoney: 10000, inventory: [{ goodId: 'SPIRIT_STONE', name: '灵石', quantity: 100, avgPrice: 1, purchasedAt: Date.now() }], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    const r = TradeService.transportGoods('凡界-灵界', 'SPIRIT_STONE', 10);
    expect(r.success).toBe(true);
  });
  test('查询状态', () => {
    const r = TradeService.queryTradeStatus();
    expect(r.success).toBe(true);
  });
  test('路线列表', () => {
    GameGlobal.getPlayerAttribute = () => 50;
    const r = TradeService.listMarketGoods('灵界市场');
    expect(r.success).toBe(true);
  });
  test('商品类型完整', () => {
    Object.keys(GOODS).forEach(id => expect(GOODS[id].name).toBeDefined());
  });
  test('市场类型完整', () => {
    Object.keys(MARKETS).forEach(id => expect(MARKETS[id].level).toBeDefined());
  });
  test('路线类型完整', () => {
    Object.keys(ROUTES).forEach(id => expect(ROUTES[id].cost).toBeDefined());
  });
  test('完整流程', () => {
    GameGlobal._trade_db = { playerMoney: 50000, inventory: [], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    TradeService.buyGoods('灵界市场', 'ELIXIR', 50);
    TradeService.buyGoods('灵界市场', 'MANUAL', 10);
    const status = TradeService.queryTradeStatus();
    expect(status.inventory.length).toBe(2);
  });
  test('交易记录', () => {
    GameGlobal._trade_db = { playerMoney: 10000, inventory: [], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    TradeService.buyGoods('凡界市场', 'SPIRIT_STONE', 100);
    const status = TradeService.queryTradeStatus();
    expect(status.status.transactionCount).toBe(1);
  });
  test('多商品购买', () => {
    GameGlobal._trade_db = { playerMoney: 100000, inventory: [], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    TradeService.buyGoods('凡界市场', 'ELIXIR', 10);
    TradeService.buyGoods('凡界市场', 'WEAPON', 5);
    TradeService.buyGoods('凡界市场', 'MATERIAL', 20);
    const status = TradeService.queryTradeStatus();
    expect(status.inventory.length).toBe(3);
  });
  test('库存累积', () => {
    GameGlobal._trade_db = { playerMoney: 100000, inventory: [{ goodId: 'SPIRIT_STONE', name: '灵石', quantity: 100, avgPrice: 10, purchasedAt: Date.now() }], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    TradeService.buyGoods('凡界市场', 'SPIRIT_STONE', 50);
    const item = TradeService.queryTradeStatus().inventory.find(i => i.goodId === 'SPIRIT_STONE');
    expect(item.quantity).toBe(150);
  });
  test('交易历史', () => {
    GameGlobal._trade_db = { playerMoney: 100000, inventory: [], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    TradeService.buyGoods('凡界市场', 'SPIRIT_STONE', 100);
    TradeService.buyGoods('凡界市场', 'ELIXIR', 10);
    const status = TradeService.queryTradeStatus();
    expect(status.recentTransactions.length).toBe(2);
  });
  test('市场费率差异', () => {
    GameGlobal.getPlayerAttribute = () => 100;
    const凡界 = TradeService.listMarketGoods('凡界市场');
    const仙界 = TradeService.listMarketGoods('仙界市场');
    expect(凡界.goods[0].price).toBeLessThan(仙界.goods[0].price);
  });
  test('空库存查询', () => {
    const r = TradeService.queryTradeStatus();
    expect(r.success).toBe(true);
  });
  test('出售后库存清空', () => {
    GameGlobal._trade_db = { playerMoney: 10000, inventory: [{ goodId: 'SPIRIT_STONE', name: '灵石', quantity: 10, avgPrice: 10, purchasedAt: Date.now() }], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    TradeService.sellGoods('凡界市场', 'SPIRIT_STONE', 10);
    const item = TradeService.queryTradeStatus().inventory.find(i => i.goodId === 'SPIRIT_STONE');
    expect(item).toBeUndefined();
  });
  test('灵石余额变化', () => {
    GameGlobal._trade_db = { playerMoney: 10000, inventory: [], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    const before = 10000;
    TradeService.buyGoods('凡界市场', 'SPIRIT_STONE', 100);
    const after = TradeService.queryTradeStatus().status.totalMoney;
    expect(after).toBeLessThan(before);
  });
  test('运输状态变化', () => {
    GameGlobal._trade_db = { playerMoney: 10000, inventory: [{ goodId: 'SPIRIT_STONE', name: '灵石', quantity: 100, avgPrice: 1, purchasedAt: Date.now() }], transactions: [], state: TRADE_STATES.IDLE, transportInProgress: null };
    TradeService.transportGoods('凡界-灵界', 'SPIRIT_STONE', 10);
    const status = TradeService.queryTradeStatus();
    expect(status.status.state).toBe(TRADE_STATES.TRANSPORTING);
  });
});