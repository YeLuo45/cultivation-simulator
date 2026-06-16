/**
 * ElixirDistilling.js - 灵液蒸馏
 * V504 Iteration 6/20 Round 20
 */
export class ElixirDistilling {
    constructor(config = {}) {
        this.config = { maxElixirs: config.maxElixirs || 200, basePurity: config.basePurity || 30, ...config };
        this.elixirs = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalElixirs: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getElixir', (ctx) => this.getElixir(ctx.elixirId));
        this.registerTool('distillElixir', (ctx) => this.distillElixir(ctx));
    }

    distillElixir(data) {
        const id = data.elixirId || `el_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const elixir = { elixirId: id, distillerId: data.distillerId || 'unknown', name: data.name || 'unnamed', type: data.type || 'water', purity: data.purity || this.config.basePurity, herbs: data.herbs || [], status: 'brewing', distilledAt: Date.now() };
        this.elixirs.set(id, elixir);
        this.stats.totalElixirs++;
        this._triggerHook('elixirDistilled', { elixirId: id });
        return { success: true, elixir };
    }

    getElixir(id) { return this.elixirs.get(id) ? { ...this.elixirs.get(id) } : null; }
    listElixirs() { return Array.from(this.elixirs.values()).map(e => ({ ...e })); }
    listByDistiller(distillerId) { return Array.from(this.elixirs.values()).filter(e => e.distillerId === distillerId).map(e => ({ ...e })); }
    listPreserved() { return Array.from(this.elixirs.values()).filter(e => e.status === 'preserved').map(e => ({ ...e })); }

    addHerb(elixirId, herb) {
        const elixir = this.elixirs.get(elixirId);
        if (!elixir) return { success: false, error: 'ELIXIR_NOT_FOUND' };
        elixir.herbs.push(herb);
        this._triggerHook('herbAdded', { elixirId, herb });
        return { success: true };
    }

    purifyElixir(elixirId, amount = 5) {
        const elixir = this.elixirs.get(elixirId);
        if (!elixir) return { success: false, error: 'ELIXIR_NOT_FOUND' };
        elixir.purity = Math.min(100, elixir.purity + amount);
        this._triggerHook('elixirPurified', { elixirId, purity: elixir.purity });
        return { success: true };
    }

    preserveElixir(elixirId) {
        const elixir = this.elixirs.get(elixirId);
        if (!elixir) return { success: false, error: 'ELIXIR_NOT_FOUND' };
        elixir.status = 'preserved';
        this._triggerHook('elixirPreserved', { elixirId });
        return { success: true };
    }

    calculateElixirQuality(elixirId) {
        const elixir = this.elixirs.get(elixirId);
        if (!elixir) return 0;
        return elixir.purity * 10 + elixir.herbs.length * 3;
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
        if (this.stats.totalElixirs < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxElixirs += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { elixirs: Array.from(this.elixirs.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.elixirs) this.elixirs = new Map(data.elixirs);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, elixirCount: this.elixirs.size }; }
}
