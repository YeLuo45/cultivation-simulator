/**
 * TradingCore.js - 交易核心
 * V376 Iteration 1/9 Round 11 - Trading Core
 *
 * 融合6大设计系统:
 * - generic-agent: 交易自循环
 * - chatdev: 交易角色协调
 * - nanobot: 交易mesh
 * - claude-code: 交易分析工具
 * - thunderbolt: 交易持久化
 * - ruflo: 交易Hook
 */

export class TradingCore {
    constructor(config = {}) {
        this.config = { maxTraders: config.maxTraders || 100, baseFeeRate: config.baseFeeRate || 0.05, ...config };
        this.traders = new Map();
        this.trades = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTrades: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTrader', (ctx) => this.getTrader(ctx.traderId));
        this.registerTool('listTraders', () => Array.from(this.traders.values()).map(t => ({...t})));
    }

    registerTrader(data) {
        const id = data.id || `tr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const trader = { traderId: id, name: data.name || 'Trader', balance: data.balance !== undefined ? data.balance : 1000, inventory: data.inventory || {}, createdAt: Date.now() };
        this.traders.set(id, trader);
        this._triggerHook('traderRegistered', { traderId: id });
        return { success: true, trader };
    }

    getTrader(id) { return this.traders.get(id) ? { ...this.traders.get(id) } : null; }
    listTraders() { return Array.from(this.traders.values()).map(t => ({ ...t })); }
    listByBalance(min) { return Array.from(this.traders.values()).filter(t => t.balance >= min).map(t => ({ ...t })); }

    executeTrade(buyerId, sellerId, itemId, price) {
        const buyer = this.traders.get(buyerId);
        const seller = this.traders.get(sellerId);
        if (!buyer || !seller) return { success: false, error: 'TRADER_NOT_FOUND' };
        if (buyerId === sellerId) return { success: false, error: 'SELF_TRADE' };
        if (buyer.balance < price) return { success: false, error: 'INSUFFICIENT_FUNDS' };
        const fee = Math.floor(price * this.config.baseFeeRate);
        buyer.balance -= price;
        seller.balance += (price - fee);
        buyer.inventory[itemId] = (buyer.inventory[itemId] || 0) + 1;
        seller.inventory[itemId] = (seller.inventory[itemId] || 0) - 1;
        const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const trade = { tradeId: id, buyerId, sellerId, itemId, price, fee, executedAt: Date.now() };
        this.trades.set(id, trade);
        this.stats.totalTrades++;
        this._triggerHook('tradeExecuted', { tradeId: id, price });
        return { success: true, trade, buyer: { ...buyer }, seller: { ...seller } };
    }

    getTrade(id) { return this.trades.get(id) ? { ...this.trades.get(id) } : null; }
    listTrades() { return Array.from(this.trades.values()).map(t => ({ ...t })); }
    listByBuyer(buyerId) { return Array.from(this.trades.values()).filter(t => t.buyerId === buyerId).map(t => ({ ...t })); }
    listBySeller(sellerId) { return Array.from(this.trades.values()).filter(t => t.sellerId === sellerId).map(t => ({ ...t })); }
    listByItem(itemId) { return Array.from(this.trades.values()).filter(t => t.itemId === itemId).map(t => ({ ...t })); }

    calculateVolume() { return Array.from(this.trades.values()).reduce((s, t) => s + t.price, 0); }
    calculateVolumeByItem(itemId) {
        return Array.from(this.trades.values()).filter(t => t.itemId === itemId).reduce((s, t) => s + t.price, 0);
    }

    registerTool(name, handler) { this.tools.set(name, { name, handler }); }
    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try { return { success: true, result: tool.handler(context || {}) }; }
        catch (e) { return { success: false, error: e.message }; }
    }
    listTools() { return Array.from(this.tools.keys()); }

    registerHook(event, handler) {
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(handler);
        return () => { const arr = this.hooks.get(event); if (arr) { const idx = arr.indexOf(handler); if (idx >= 0) arr.splice(idx, 1); } };
    }
    _triggerHook(event, data) {
        const handlers = this.hooks.get(event);
        if (!handlers) return;
        for (const h of handlers) { try { h(data); } catch (e) {} }
    }

    autoEvolve() {
        if (this.stats.totalTrades < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTraders += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { traders: Array.from(this.traders.entries()), trades: Array.from(this.trades.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.traders) this.traders = new Map(data.traders);
        if (data.trades) this.trades = new Map(data.trades);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, traderCount: this.traders.size, tradeCount: this.trades.size }; }
}