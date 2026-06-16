/**
 * TradeHistory.js - 交易历史
 * V382 Iteration 7/9 Round 11
 */
export class TradeHistory {
    constructor(config = {}) {
        this.config = { maxEntries: config.maxEntries || 1000, ...config };
        this.entries = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEntries: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEntry', (ctx) => this.getEntry(ctx.entryId));
        this.registerTool('addEntry', (ctx) => this.addEntry(ctx));
    }

    addEntry(data) {
        const id = data.id || `e_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const entry = { entryId: id, traderId: data.traderId, action: data.action || 'trade', itemId: data.itemId, amount: data.amount || 0, price: data.price || 0, recordedAt: Date.now() };
        this.entries.set(id, entry);
        this.stats.totalEntries++;
        this._triggerHook('entryAdded', { entryId: id });
        return { success: true, entry };
    }

    getEntry(id) { return this.entries.get(id) ? { ...this.entries.get(id) } : null; }
    listEntries() { return Array.from(this.entries.values()).map(e => ({ ...e })); }
    listByTrader(traderId) { return Array.from(this.entries.values()).filter(e => e.traderId === traderId).map(e => ({ ...e })); }
    listByAction(action) { return Array.from(this.entries.values()).filter(e => e.action === action).map(e => ({ ...e })); }
    listByItem(itemId) { return Array.from(this.entries.values()).filter(e => e.itemId === itemId).map(e => ({ ...e })); }

    listByTimeRange(start, end) { return Array.from(this.entries.values()).filter(e => e.recordedAt >= start && e.recordedAt <= end).map(e => ({ ...e })); }

    calculateTotalAmount() { return Array.from(this.entries.values()).reduce((s, e) => s + e.amount, 0); }
    calculateTotalPrice() { return Array.from(this.entries.values()).reduce((s, e) => s + e.price, 0); }

    getTraderVolume(traderId) {
        return this.listByTrader(traderId).reduce((s, e) => s + e.price, 0);
    }

    findMostTradedItem() {
        const counts = {};
        for (const e of this.entries.values()) {
            if (e.itemId) counts[e.itemId] = (counts[e.itemId] || 0) + 1;
        }
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0][0] : null;
    }

    clearOldEntries(maxAge) {
        const cutoff = Date.now() - maxAge;
        let cleared = 0;
        for (const [id, e] of this.entries) {
            if (e.recordedAt < cutoff) { this.entries.delete(id); cleared++; }
        }
        return { success: true, cleared };
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
        if (this.stats.totalEntries < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxEntries += 200;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { entries: Array.from(this.entries.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.entries) this.entries = new Map(data.entries);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, entryCount: this.entries.size }; }
}