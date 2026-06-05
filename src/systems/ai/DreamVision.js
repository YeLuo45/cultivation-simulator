/**
 * DreamVision.js - 梦境系统
 * V346 Iteration 7/9 Round 7
 */
export class DreamVision {
    constructor(config = {}) {
        this.config = { maxDreams: config.maxDreams || 200, ...config };
        this.dreams = new Map();
        this.cultivators = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDreams: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDream', (ctx) => this.getDream(ctx.dreamId));
        this.registerTool('listDreams', () => Array.from(this.dreams.values()).map(d => ({...d})));
    }

    registerCultivator(data) {
        const id = data.id || `cv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cultivator = { cultivatorId: id, name: data.name || 'Anonymous', dreamCount: 0 };
        this.cultivators.set(id, cultivator);
        return { success: true, cultivator };
    }

    getCultivator(id) { return this.cultivators.get(id) ? { ...this.cultivators.get(id) } : null; }

    dream(cultivatorId, theme, lucidity = 0.5) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        const id = `dr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const clarity = Math.min(1, lucidity + Math.random() * 0.5);
        const dream = { dreamId: id, cultivatorId, theme: theme || 'abstract', clarity, symbols: this._generateSymbols(theme, clarity), hadAt: Date.now() };
        this.dreams.set(id, dream);
        cultivator.dreamCount++;
        this.stats.totalDreams++;
        this._triggerHook('dreamHad', { cultivatorId, dreamId: id, clarity });
        return { success: true, dream };
    }

    _generateSymbols(theme, clarity) {
        const allSymbols = ['dragon', 'tiger', 'phoenix', 'turtle', 'snake', 'crane', 'tortoise', 'immortal'];
        const count = Math.max(1, Math.floor(clarity * 4));
        const shuffled = [...allSymbols].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    getDream(id) { return this.dreams.get(id) ? { ...this.dreams.get(id) } : null; }
    listDreams() { return Array.from(this.dreams.values()).map(d => ({ ...d })); }
    listDreamsByCultivator(cultivatorId) { return Array.from(this.dreams.values()).filter(d => d.cultivatorId === cultivatorId).map(d => ({ ...d })); }
    listDreamsByTheme(theme) { return Array.from(this.dreams.values()).filter(d => d.theme === theme).map(d => ({ ...d })); }

    interpret(dreamId) {
        const dream = this.dreams.get(dreamId);
        if (!dream) return { success: false, error: 'DREAM_NOT_FOUND' };
        const interpretation = dream.symbols.map(s => this._interpretSymbol(s)).join(' ');
        this._triggerHook('dreamInterpreted', { dreamId });
        return { success: true, interpretation };
    }

    _interpretSymbol(symbol) {
        const meanings = { dragon: 'power', tiger: 'courage', phoenix: 'rebirth', turtle: 'longevity', snake: 'wisdom', crane: 'transcendence', tortoise: 'stability', immortal: 'guidance' };
        return `${symbol}:${meanings[symbol] || 'unknown'}`;
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
        if (this.stats.totalDreams < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDreams += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { dreams: Array.from(this.dreams.entries()), cultivators: Array.from(this.cultivators.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.dreams) this.dreams = new Map(data.dreams);
        if (data.cultivators) this.cultivators = new Map(data.cultivators);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, dreamCount: this.dreams.size, cultivatorCount: this.cultivators.size }; }
}