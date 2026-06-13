/**
 * MarketMaker.js - 做市商
 * V379 Iteration 4/9 Round 11
 */
export class MarketMaker {
    constructor(config = {}) {
        this.config = { maxMarkets: config.maxMarkets || 50, baseSpread: config.baseSpread || 0.1, ...config };
        this.markets = new Map();
        this.quotes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalQuotes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMarket', (ctx) => this.getMarket(ctx.marketId));
        this.registerTool('createMarket', (ctx) => this.createMarket(ctx));
    }

    createMarket(data) {
        const id = data.id || `mkt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const market = { marketId: id, itemId: data.itemId, bidPrice: 100, askPrice: 110, spread: this.config.baseSpread, createdAt: Date.now() };
        this.markets.set(id, market);
        this._triggerHook('marketCreated', { marketId: id });
        return { success: true, market };
    }

    getMarket(id) { return this.markets.get(id) ? { ...this.markets.get(id) } : null; }
    listMarkets() { return Array.from(this.markets.values()).map(m => ({ ...m })); }
    listByItem(itemId) { return Array.from(this.markets.values()).filter(m => m.itemId === itemId).map(m => ({ ...m })); }

    provideQuote(marketId, bid, ask) {
        const market = this.markets.get(marketId);
        if (!market) return { success: false, error: 'MARKET_NOT_FOUND' };
        market.bidPrice = bid;
        market.askPrice = ask;
        market.spread = (ask - bid) / ask;
        const id = `qt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const quote = { quoteId: id, marketId, bid, ask, spread: market.spread, providedAt: Date.now() };
        this.quotes.set(id, quote);
        this.stats.totalQuotes++;
        this._triggerHook('quoteProvided', { marketId, bid, ask });
        return { success: true, quote };
    }

    executeMarketBuy(marketId) {
        const market = this.markets.get(marketId);
        if (!market) return { success: false, error: 'MARKET_NOT_FOUND' };
        return { success: true, price: market.askPrice, side: 'buy' };
    }

    executeMarketSell(marketId) {
        const market = this.markets.get(marketId);
        if (!market) return { success: false, error: 'MARKET_NOT_FOUND' };
        return { success: true, price: market.bidPrice, side: 'sell' };
    }

    listQuotes() { return Array.from(this.quotes.values()).map(q => ({ ...q })); }
    listQuotesByMarket(marketId) { return Array.from(this.quotes.values()).filter(q => q.marketId === marketId).map(q => ({ ...q })); }

    calculateMidPrice(marketId) {
        const market = this.markets.get(marketId);
        if (!market) return null;
        return (market.bidPrice + market.askPrice) / 2;
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
        if (this.stats.totalQuotes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMarkets += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { markets: Array.from(this.markets.entries()), quotes: Array.from(this.quotes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.markets) this.markets = new Map(data.markets);
        if (data.quotes) this.quotes = new Map(data.quotes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, marketCount: this.markets.size }; }
}