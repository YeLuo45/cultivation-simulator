/**
 * CultivationMarket.js - 修真市场
 * V538 Iteration 1/20 Round 22
 */
export class CultivationMarket {
    constructor(config = {}) {
        this.config = { maxMarkets: config.maxMarkets || 50, baseLiquidity: config.baseLiquidity || 20, ...config };
        this.markets = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMarkets: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMarket', (ctx) => this.getMarket(ctx.marketId));
        this.registerTool('openMarket', (ctx) => this.openMarket(ctx));
    }

    openMarket(data) {
        const id = data.id || `mkt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const market = { marketId: id, ownerId: data.ownerId, name: data.name || 'Mystic Market', type: data.type || 'regular', liquidity: data.liquidity !== undefined ? data.liquidity : this.config.baseLiquidity, goods: data.goods || [], level: 1, status: 'open', createdAt: Date.now() };
        this.markets.set(id, market);
        this.stats.totalMarkets++;
        this._triggerHook('marketOpened', { marketId: id });
        return { success: true, market };
    }

    getMarket(id) { return this.markets.get(id) ? { ...this.markets.get(id) } : null; }
    listMarkets() { return Array.from(this.markets.values()).map(m => ({ ...m })); }
    listByOwner(ownerId) { return Array.from(this.markets.values()).filter(m => m.ownerId === ownerId).map(m => ({ ...m })); }
    listOpen() { return Array.from(this.markets.values()).filter(m => m.status === 'open').map(m => ({ ...m })); }

    addGood(marketId, good) {
        const market = this.markets.get(marketId);
        if (!market) return { success: false, error: 'MARKET_NOT_FOUND' };
        market.goods.push(good);
        this._triggerHook('goodAdded', { marketId, good });
        return { success: true };
    }

    increaseLiquidity(marketId, amount = 5) {
        const market = this.markets.get(marketId);
        if (!market) return { success: false, error: 'MARKET_NOT_FOUND' };
        market.liquidity += amount;
        this._triggerHook('liquidityIncreased', { marketId, amount, newLiquidity: market.liquidity });
        return { success: true };
    }

    levelUpMarket(marketId) {
        const market = this.markets.get(marketId);
        if (!market) return { success: false, error: 'MARKET_NOT_FOUND' };
        market.level++;
        this._triggerHook('marketLeveledUp', { marketId, newLevel: market.level });
        return { success: true };
    }

    closeMarket(marketId) {
        const market = this.markets.get(marketId);
        if (!market) return { success: false, error: 'MARKET_NOT_FOUND' };
        market.status = 'closed';
        this._triggerHook('marketClosed', { marketId });
        return { success: true };
    }

    calculateMarketPower(marketId) {
        const market = this.markets.get(marketId);
        if (!market) return 0;
        return market.level * 100 + market.liquidity * 2 + market.goods.length * 30;
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
        if (this.stats.totalMarkets < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMarkets += 25;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { markets: Array.from(this.markets.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.markets) this.markets = new Map(data.markets);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, marketCount: this.markets.size }; }
}
