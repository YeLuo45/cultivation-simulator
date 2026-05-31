/**
 * TradeService.js - 仙界贸易系统
 * 仙界万界之间的贸易往来
 * 
 * MCP工具:
 * - trade.list(marketId) - 查看市场商品
 * - trade.buy(marketId, goodId, quantity) - 购买商品
 * - trade.sell(marketId, goodId, quantity) - 出售商品
 * - trade.transport(routeId, goods) - 运输商品
 * - trade.query() - 查询贸易状态
 */

const TRADE_STATES = {
  IDLE: 'IDLE',
  TRADING: 'TRADING',
  TRANSPORTING: 'TRANSPORTING'
};

const TRADE_DB_KEY = '_trade_db';

let _tradeDB = null;

function _initDB() {
  const existing = GameGlobal.getDB ? GameGlobal.getDB(TRADE_DB_KEY) : null;
  if (existing) {
    _tradeDB = existing;
  } else {
    _tradeDB = {
      state: TRADE_STATES.IDLE,
      playerMoney: 10000,
      inventory: [],
      transactions: [],
      routes: [],
      transportInProgress: null
    };
    if (GameGlobal.setDB) GameGlobal.setDB(TRADE_DB_KEY, _tradeDB);
  }
}

function _saveDB() {
  if (GameGlobal.setDB) GameGlobal.setDB(TRADE_DB_KEY, _tradeDB);
}

// 商品类型
const GOODS = {
  SPIRIT_STONE: { name: '灵石', basePrice: 1, volatility: 0.1 },
  ELIXIR: { name: '丹药', basePrice: 50, volatility: 0.3 },
  MANUAL: { name: '功法', basePrice: 200, volatility: 0.2 },
  WEAPON: { name: '法宝', basePrice: 500, volatility: 0.4 },
  MATERIAL: { name: '灵材', basePrice: 30, volatility: 0.25 },
  BEAST_CORE: { name: '兽核', basePrice: 100, volatility: 0.35 }
};

// 市场配置
const MARKETS = {
  '凡界市场': { level: 1, fee: 0.05, location: '凡界' },
  '灵界市场': { level: 10, fee: 0.08, location: '灵界' },
  '仙界市场': { level: 30, fee: 0.10, location: '仙界' },
  '神界市场': { level: 60, fee: 0.12, location: '神界' }
};

// 贸易路线
const ROUTES = {
  '凡界-灵界': { markets: ['凡界市场', '灵界市场'], cost: 100, risk: 0.1 },
  '灵界-仙界': { markets: ['灵界市场', '仙界市场'], cost: 500, risk: 0.2 },
  '仙界-神界': { markets: ['仙界市场', '神界市场'], cost: 2000, risk: 0.35 }
};

// 动态价格计算
function _calculatePrice(goodId, marketId) {
  const good = GOODS[goodId];
  if (!good) return null;
  const market = MARKETS[marketId];
  if (!market) return null;
  
  const levelMultiplier = 1 + (market.level * 0.05);
  const volatility = good.volatility * (Math.random() * 2 - 1);
  const price = Math.floor(good.basePrice * levelMultiplier * (1 + volatility));
  return Math.max(1, price);
}

// 查询市场
function listMarketGoods(marketId) {
  _initDB();
  
  if (!MARKETS[marketId]) {
    return { success: false, error: `市场 ${marketId} 不存在` };
  }
  
  const market = MARKETS[marketId];
  const playerLevel = GameGlobal.getPlayerAttribute ? GameGlobal.getPlayerAttribute('level') : 1;
  if (playerLevel < market.level) {
    return { success: false, error: `需要达到 ${market.level} 级才能进入此市场` };
  }
  
  const goodsList = Object.entries(GOODS).map(([id, config]) => {
    const price = _calculatePrice(id, marketId);
    const trend = Math.random() > 0.5 ? '涨' : '跌';
    return {
      id,
      name: config.name,
      price,
      trend,
      marketFee: (market.fee * 100).toFixed(0) + '%',
      stock: Math.floor(Math.random() * 100) + 10
    };
  });
  
  return {
    success: true,
    market: { id: marketId, name: marketId, fee: market.fee, location: market.location },
    goods: goodsList
  };
}

// 购买商品
function buyGoods(marketId, goodId, quantity) {
  _initDB();
  
  if (!MARKETS[marketId]) {
    return { success: false, error: `市场 ${marketId} 不存在` };
  }
  if (!GOODS[goodId]) {
    return { success: false, error: `商品 ${goodId} 不存在` };
  }
  if (!quantity || quantity <= 0) {
    return { success: false, error: '购买数量必须大于0' };
  }
  
  const price = _calculatePrice(goodId, marketId);
  const market = MARKETS[marketId];
  const totalCost = price * quantity * (1 + market.fee);
  
  if (_tradeDB.playerMoney < totalCost) {
    return { success: false, error: `灵石不足（需要 ${totalCost}，拥有 ${_tradeDB.playerMoney}）` };
  }
  
  _tradeDB.playerMoney -= totalCost;
  
  const existingItem = _tradeDB.inventory.find(i => i.goodId === goodId);
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.avgPrice = ((existingItem.avgPrice * (existingItem.quantity - quantity)) + (price * quantity)) / existingItem.quantity;
  } else {
    _tradeDB.inventory.push({
      goodId,
      name: GOODS[goodId].name,
      quantity,
      avgPrice: price,
      purchasedAt: Date.now()
    });
  }
  
  _tradeDB.transactions.push({
    type: 'BUY',
    goodId,
    quantity,
    price,
    totalCost,
    marketId,
    timestamp: Date.now()
  });
  
  _saveDB();
  
  return {
    success: true,
    message: `购买成功：${GOODS[goodId].name} x${quantity}，花费 ${totalCost} 灵石`,
    purchase: { goodId, name: GOODS[goodId].name, quantity, unitPrice: price, totalCost, marketFee: market.fee },
    remainingMoney: _tradeDB.playerMoney
  };
}

// 出售商品
function sellGoods(marketId, goodId, quantity) {
  _initDB();
  
  if (!MARKETS[marketId]) {
    return { success: false, error: `市场 ${marketId} 不存在` };
  }
  if (!GOODS[goodId]) {
    return { success: false, error: `商品 ${goodId} 不存在` };
  }
  
  const item = _tradeDB.inventory.find(i => i.goodId === goodId);
  if (!item || item.quantity < quantity) {
    return { success: false, error: `库存不足（拥有 ${item ? item.quantity : 0}，需要 ${quantity}）` };
  }
  
  const price = _calculatePrice(goodId, marketId);
  const market = MARKETS[marketId];
  const revenue = Math.floor(price * quantity * (1 - market.fee));
  
  _tradeDB.playerMoney += revenue;
  item.quantity -= quantity;
  if (item.quantity <= 0) {
    _tradeDB.inventory.splice(_tradeDB.inventory.indexOf(item), 1);
  }
  
  _tradeDB.transactions.push({
    type: 'SELL',
    goodId,
    quantity,
    price,
    revenue,
    marketId,
    timestamp: Date.now()
  });
  
  _saveDB();
  
  return {
    success: true,
    message: `出售成功：${GOODS[goodId].name} x${quantity}，获得 ${revenue} 灵石`,
    sale: { goodId, name: GOODS[goodId].name, quantity, unitPrice: price, revenue, marketFee: market.fee },
    totalMoney: _tradeDB.playerMoney
  };
}

// 运输商品
function transportGoods(routeId, goodId, quantity) {
  _initDB();
  
  if (!ROUTES[routeId]) {
    return { success: false, error: `路线 ${routeId} 不存在` };
  }
  
  const item = _tradeDB.inventory.find(i => i.goodId === goodId);
  if (!item || item.quantity < quantity) {
    return { success: false, error: `库存不足` };
  }
  
  const route = ROUTES[routeId];
  if (_tradeDB.playerMoney < route.cost) {
    return { success: false, error: `运输费用不足（需要 ${route.cost}，拥有 ${_tradeDB.playerMoney}）` };
  }
  
  // 扣除费用并开始运输
  _tradeDB.playerMoney -= route.cost;
  _tradeDB.transportInProgress = {
    routeId,
    goodId,
    quantity,
    startTime: Date.now(),
    cost: route.cost
  };
  _tradeDB.state = TRADE_STATES.TRANSPORTING;
  _saveDB();
  
  return {
    success: true,
    message: `运输开始：${GOODS[goodId].name} x${quantity}，${routeId}，费用 ${route.cost} 灵石`,
    transport: { routeId, goodId, name: GOODS[goodId].name, quantity, cost: route.cost, risk: (route.risk * 100).toFixed(0) + '%' },
    estimatedArrival: '下次查询时自动到达'
  };
}

// 查询贸易状态
function queryTradeStatus() {
  _initDB();
  
  const playerLevel = GameGlobal.getPlayerAttribute ? GameGlobal.getPlayerAttribute('level') : 1;
  const playerResources = GameGlobal.getPlayerAttribute ? GameGlobal.getPlayerAttribute('spiritStones') : 0;
  
  return {
    success: true,
    status: {
      state: _tradeDB.state,
      totalMoney: _tradeDB.playerMoney + playerResources,
      transactionCount: _tradeDB.transactions.length,
      inventoryCount: _tradeDB.inventory.length
    },
    inventory: _tradeDB.inventory.map(i => ({
      ...i,
      currentValue: Math.floor(i.avgPrice * (1 + Math.random() * 0.4 - 0.2))
    })),
    markets: Object.entries(MARKETS).map(([id, config]) => ({
      id,
      name: id,
      level: config.level,
      location: config.location,
      fee: (config.fee * 100).toFixed(0) + '%'
    })),
    routes: Object.entries(ROUTES).map(([id, config]) => ({
      id,
      name: id,
      markets: config.markets,
      cost: config.cost,
      risk: (config.risk * 100).toFixed(0) + '%'
    })),
    recentTransactions: _tradeDB.transactions.slice(-10).reverse()
  };
}

// MCP工具定义
const TRADE_MCP_TOOLS = [
  { name: 'trade.list', description: '查看市场商品', params: { marketId: 'string' } },
  { name: 'trade.buy', description: '购买商品', params: { marketId: 'string', goodId: 'string', quantity: 'number' } },
  { name: 'trade.sell', description: '出售商品', params: { marketId: 'string', goodId: 'string', quantity: 'number' } },
  { name: 'trade.transport', description: '运输商品到其他市场', params: { routeId: 'string', goodId: 'string', quantity: 'number' } },
  { name: 'trade.query', description: '查询贸易状态', params: {} }
];

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TradeService: { listMarketGoods, buyGoods, sellGoods, transportGoods, queryTradeStatus, TRADE_STATES, GOODS, MARKETS, ROUTES, TRADE_MCP_TOOLS } };
} else if (typeof GameGlobal !== 'undefined') {
  GameGlobal.TradeService = { listMarketGoods, buyGoods, sellGoods, transportGoods, queryTradeStatus, TRADE_STATES, GOODS, MARKETS, ROUTES, TRADE_MCP_TOOLS };
}