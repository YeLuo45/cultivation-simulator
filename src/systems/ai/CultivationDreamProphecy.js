/**
 * CultivationDreamProphecy.js - 修真梦境预言
 * V868 Iteration 2/30 Round 34
 */
export const PROPHECY_EVENTS = ['tribulation', 'opportunity', 'death', 'ascension'];
export const SYMBOL_LIBRARY = [
    'crane', 'tiger', 'dragon', 'phoenix', 'tortoise', 'snake', 'eagle', 'wolf', 'bear', 'deer',
    'lotus', 'plum', 'orchid', 'bamboo', 'chrysanthemum', 'peach', 'willow', 'pine', 'maple', 'wisteria'
];
export const ACCURACY_THRESHOLDS = { low: 0.3, medium: 0.6, high: 0.85 };

export class CultivationDreamProphecy {
    constructor(config = {}) {
        this.config = { maxProphecies: config.maxProphecies || 50, baseAccuracy: config.baseAccuracy ?? 0.5, symbolCount: config.symbolCount || 3, ...config };
        this.prophecies = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGenerated: 0, totalManifested: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getProphecy', (ctx) => this.getProphecy(ctx.prophecyId));
        this.registerTool('listByEvent', (ctx) => this.listByEvent(ctx.eventType));
    }

    generateProphecy(dreamId, eventType) {
        if (!PROPHECY_EVENTS.includes(eventType)) return { success: false, error: 'INVALID_EVENT' };
        const id = `prophecy_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const symbols = [];
        const used = new Set();
        for (let i = 0; i < this.config.symbolCount; i++) {
            let idx = Math.floor(Math.random() * SYMBOL_LIBRARY.length);
            let attempts = 0;
            while (used.has(idx) && attempts < 20) { idx = Math.floor(Math.random() * SYMBOL_LIBRARY.length); attempts++; }
            used.add(idx);
            symbols.push(SYMBOL_LIBRARY[idx]);
        }
        const prophecy = {
            id, dreamId, eventType, symbols,
            accuracy: Math.min(1, this.config.baseAccuracy + Math.random() * 0.2),
            manifested: false,
            decoded: false,
            generatedAt: Date.now()
        };
        this.prophecies.set(id, prophecy);
        this.stats.totalGenerated++;
        this._triggerHook('prophecyGenerated', { id, dreamId, eventType });
        return { success: true, prophecy };
    }

    getProphecy(id) { return this.prophecies.get(id) ? { ...this.prophecies.get(id) } : null; }
    listProphecies() { return Array.from(this.prophecies.values()).map(p => ({ ...p })); }
    listByEvent(eventType) { return Array.from(this.prophecies.values()).filter(p => p.eventType === eventType).map(p => ({ ...p })); }
    listByDream(dreamId) { return Array.from(this.prophecies.values()).filter(p => p.dreamId === dreamId).map(p => ({ ...p })); }
    listManifested() { return Array.from(this.prophecies.values()).filter(p => p.manifested).map(p => ({ ...p })); }

    decodeProphecy(prophecyId) {
        const prophecy = this.prophecies.get(prophecyId);
        if (!prophecy) return { success: false, error: 'PROPHECY_NOT_FOUND' };
        prophecy.decoded = true;
        prophecy.decodedAt = Date.now();
        let threshold = 'low';
        if (prophecy.accuracy >= ACCURACY_THRESHOLDS.high) threshold = 'high';
        else if (prophecy.accuracy >= ACCURACY_THRESHOLDS.medium) threshold = 'medium';
        prophecy.accuracyThreshold = threshold;
        this._triggerHook('prophecyDecoded', { prophecyId, threshold });
        return { success: true, threshold, symbols: prophecy.symbols };
    }

    manifestProphecy(prophecyId) {
        const prophecy = this.prophecies.get(prophecyId);
        if (!prophecy) return { success: false, error: 'PROPHECY_NOT_FOUND' };
        prophecy.manifested = true;
        prophecy.manifestedAt = Date.now();
        this.stats.totalManifested++;
        this._triggerHook('prophecyManifested', { prophecyId });
        return { success: true };
    }

    boostAccuracy(prophecyId, amount = 0.1) {
        const prophecy = this.prophecies.get(prophecyId);
        if (!prophecy) return { success: false, error: 'PROPHECY_NOT_FOUND' };
        prophecy.accuracy = Math.min(1, prophecy.accuracy + amount);
        return { success: true, accuracy: prophecy.accuracy };
    }

    addSymbol(prophecyId, symbol) {
        const prophecy = this.prophecies.get(prophecyId);
        if (!prophecy) return { success: false, error: 'PROPHECY_NOT_FOUND' };
        if (!SYMBOL_LIBRARY.includes(symbol)) return { success: false, error: 'INVALID_SYMBOL' };
        if (!prophecy.symbols.includes(symbol)) prophecy.symbols.push(symbol);
        return { success: true };
    }

    deleteProphecy(prophecyId) {
        if (!this.prophecies.has(prophecyId)) return { success: false, error: 'PROPHECY_NOT_FOUND' };
        this.prophecies.delete(prophecyId);
        this._triggerHook('prophecyDeleted', { prophecyId });
        return { success: true };
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

    toJSON() { return { prophecies: Array.from(this.prophecies.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.prophecies) this.prophecies = new Map(data.prophecies);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, prophecyCount: this.prophecies.size }; }
}
