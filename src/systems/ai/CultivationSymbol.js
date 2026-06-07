/**
 * CultivationSymbol.js - 修真符号系统
 * V763 Iteration 26/30 Round 30 - Cultivation Symbol
 */

export class CultivationSymbol {
    constructor(config = {}) {
        this.config = { maxSymbols: config.maxSymbols || 20, baseClarity: config.baseClarity || 20, ...config };
        this.symbols = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSymbols: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSymbol', (ctx) => this.getSymbol(ctx.symbolId));
        this.registerTool('recruitSymbol', (ctx) => this.recruitSymbol(ctx));
    }

    recruitSymbol(data) {
        const id = data.symbolId || `sym_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const symbol = {
            symbolId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Symbol',
            type: data.type || 'geometric',
            clarity: data.clarity || this.config.baseClarity,
            lines: data.lines || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.symbols.set(id, symbol);
        this.stats.totalSymbols++;
        this._triggerHook('symbolRecruited', { symbolId: id });
        return { success: true, symbol };
    }

    getSymbol(id) { return this.symbols.get(id) ? { ...this.symbols.get(id) } : null; }
    listSymbols() { return Array.from(this.symbols.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.symbols.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.symbols.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addLine(symbolId, line) {
        const symbol = this.symbols.get(symbolId);
        if (!symbol) return { success: false, error: 'SYMBOL_NOT_FOUND' };
        symbol.lines.push(line);
        this._triggerHook('lineAdded', { symbolId, line });
        return { success: true, symbol: { ...symbol } };
    }

    raiseClarity(symbolId, amount = 5) {
        const symbol = this.symbols.get(symbolId);
        if (!symbol) return { success: false, error: 'SYMBOL_NOT_FOUND' };
        symbol.clarity += amount;
        this._triggerHook('clarityRaised', { symbolId, newClarity: symbol.clarity });
        return { success: true };
    }

    levelUpSymbol(symbolId) {
        const symbol = this.symbols.get(symbolId);
        if (!symbol) return { success: false, error: 'SYMBOL_NOT_FOUND' };
        symbol.level++;
        this._triggerHook('symbolLeveledUp', { symbolId, newLevel: symbol.level });
        return { success: true };
    }

    legendSymbol(symbolId) {
        const symbol = this.symbols.get(symbolId);
        if (!symbol) return { success: false, error: 'SYMBOL_NOT_FOUND' };
        symbol.status = 'legendary';
        this._triggerHook('symbolLegendized', { symbolId });
        return { success: true };
    }

    calculateSymbolValue(symbolId) {
        const symbol = this.symbols.get(symbolId);
        if (!symbol) return 0;
        return symbol.level * 100 + symbol.clarity * 2 + symbol.lines.length * 30;
    }

    listByType(type) { return Array.from(this.symbols.values()).filter(s => s.type === type).map(s => ({ ...s })); }
    listVeteran() { return Array.from(this.symbols.values()).filter(s => s.status === 'veteran').map(s => ({ ...s })); }

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
        if (this.stats.totalSymbols < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSymbols += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { symbols: Array.from(this.symbols.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.symbols) this.symbols = new Map(data.symbols);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, symbolCount: this.symbols.size }; }
}
