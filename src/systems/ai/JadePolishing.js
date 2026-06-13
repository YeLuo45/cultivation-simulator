/**
 * JadePolishing.js - 玉石抛光系统
 * V517 Iteration 19/20 Round 20
 */
export class JadePolishing {
    constructor(config = {}) {
        this.config = { maxJades: config.maxJades || 200, baseLuster: config.baseLuster || 20, ...config };
        this.jades = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalJades: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getJade', (ctx) => this.getJade(ctx.jadeId));
        this.registerTool('startPolishing', (ctx) => this.startPolishing(ctx));
    }

    startPolishing(data) {
        const id = data.id || `jad_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const jade = {
            jadeId: id,
            polisherId: data.polisherId || 'unknown_polisher',
            name: data.name || 'unnamed_jade',
            type: data.type || 'imperial',
            luster: data.luster || this.config.baseLuster,
            grits: data.grits || [],
            polish: data.polish || 0,
            status: data.status || 'rough',
            createdAt: Date.now()
        };
        this.jades.set(id, jade);
        this.stats.totalJades++;
        this._triggerHook('polishingStarted', { jadeId: id });
        return { success: true, jade };
    }

    getJade(id) { return this.jades.get(id) ? { ...this.jades.get(id) } : null; }
    listJades() { return Array.from(this.jades.values()).map(j => ({ ...j })); }
    listByPolisher(polisherId) { return Array.from(this.jades.values()).filter(j => j.polisherId === polisherId).map(j => ({ ...j })); }
    listMastered() { return Array.from(this.jades.values()).filter(j => j.status === 'mastered').map(j => ({ ...j })); }

    addGrit(jadeId, grit) {
        const jade = this.jades.get(jadeId);
        if (!jade) return { success: false, error: 'JADE_NOT_FOUND' };
        jade.grits.push(grit);
        if (jade.grits.length >= 5) jade.status = 'smooth';
        this._triggerHook('gritAdded', { jadeId, grit });
        return { success: true };
    }

    increaseLuster(jadeId, amount = 5) {
        const jade = this.jades.get(jadeId);
        if (!jade) return { success: false, error: 'JADE_NOT_FOUND' };
        jade.luster += amount;
        this._triggerHook('lusterIncreased', { jadeId, newLuster: jade.luster });
        return { success: true };
    }

    polishJade(jadeId, amount = 5) {
        const jade = this.jades.get(jadeId);
        if (!jade) return { success: false, error: 'JADE_NOT_FOUND' };
        jade.polish += amount;
        this._triggerHook('jadePolished', { jadeId, newPolish: jade.polish });
        return { success: true };
    }

    masterJade(jadeId) {
        const jade = this.jades.get(jadeId);
        if (!jade) return { success: false, error: 'JADE_NOT_FOUND' };
        jade.status = 'mastered';
        this._triggerHook('jadeMastered', { jadeId });
        return { success: true };
    }

    calculateJadeValue(jadeId) {
        const jade = this.jades.get(jadeId);
        if (!jade) return 0;
        return jade.luster * 2 + jade.polish + jade.grits.length * 15;
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
        if (this.stats.totalJades < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxJades += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { jades: Array.from(this.jades.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.jades) this.jades = new Map(data.jades);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, jadeCount: this.jades.size }; }
}
