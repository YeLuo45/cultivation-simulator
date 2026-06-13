/**
 * PriceDiscovery.js - 价格发现
 * V378 Iteration 3/9 Round 11
 */
export class PriceDiscovery {
    constructor(config = {}) {
        this.config = { maxItems: config.maxItems || 200, ...config };
        this.items = new Map();
        this.priceHistory = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPriceUpdates: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getItem', (ctx) => this.getItem(ctx.itemId));
        this.registerTool('recordPrice', (ctx) => this.recordPrice(ctx.itemId, ctx.price));
    }

    addItem(data) {
        const id = data.id || `it_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const item = { itemId: id, name: data.name || 'Item', basePrice: data.basePrice || 100, currentPrice: data.currentPrice || data.basePrice || 100, history: [], createdAt: Date.now() };
        this.items.set(id, item);
        return { success: true, item };
    }

    getItem(id) { return this.items.get(id) ? { ...this.items.get(id) } : null; }
    listItems() { return Array.from(this.items.values()).map(i => ({ ...i })); }

    recordPrice(itemId, price) {
        const item = this.items.get(itemId);
        if (!item) return { success: false, error: 'ITEM_NOT_FOUND' };
        item.currentPrice = price;
        item.history.push({ price, at: Date.now() });
        this.stats.totalPriceUpdates++;
        this._triggerHook('priceUpdated', { itemId, price });
        return { success: true, item: { ...item } };
    }

    getPriceHistory(itemId) {
        const item = this.items.get(itemId);
        return item ? [...item.history] : null;
    }

    calculateAverage(itemId) {
        const item = this.items.get(itemId);
        if (!item || item.history.length === 0) return null;
        return item.history.reduce((s, h) => s + h.price, 0) / item.history.length;
    }

    calculateVolatility(itemId) {
        const item = this.items.get(itemId);
        if (!item || item.history.length < 2) return 0;
        const avg = this.calculateAverage(itemId);
        const variance = item.history.reduce((s, h) => s + Math.pow(h.price - avg, 2), 0) / item.history.length;
        return Math.sqrt(variance);
    }

    calculateTrend(itemId) {
        const item = this.items.get(itemId);
        if (!item || item.history.length < 2) return 'neutral';
        const recent = item.history.slice(-3);
        const first = recent[0].price;
        const last = recent[recent.length - 1].price;
        if (last > first * 1.1) return 'rising';
        if (last < first * 0.9) return 'falling';
        return 'neutral';
    }

    findCheapestAbove(threshold) { return this.listItems().filter(i => i.currentPrice > threshold).sort((a, b) => a.currentPrice - b.currentPrice); }
    findExpensiveBelow(threshold) { return this.listItems().filter(i => i.currentPrice < threshold).sort((a, b) => b.currentPrice - a.currentPrice); }

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
        if (this.stats.totalPriceUpdates < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxItems += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { items: Array.from(this.items.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.items) this.items = new Map(data.items);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, itemCount: this.items.size }; }
}