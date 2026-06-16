/**
 * CultivationJade.js - 修真翡翠系统
 * V831 Iteration 4/30 Round 33
 */
export class CultivationJade {
    constructor(config = {}) {
        this.config = { maxJades: config.maxJades || 20, baseLuster: config.baseLuster || 20, ...config };
        this.jades = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalJades: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getJade', (ctx) => this.getJade(ctx.jadeId));
        this.registerTool('recruitJade', (ctx) => this.recruitJade(ctx));
    }

    recruitJade(data) {
        const id = data.id || `jde_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const jade = {
            jadeId: id,
            masterId: data.masterId || 'unknown_master',
            name: data.name || 'unnamed_jade',
            type: data.type || 'imperial',
            luster: data.luster || this.config.baseLuster,
            carvings: data.carvings || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.jades.set(id, jade);
        this.stats.totalJades++;
        this._triggerHook('jadeRecruited', { jadeId: id });
        return { success: true, jade };
    }

    getJade(id) { return this.jades.get(id) ? { ...this.jades.get(id) } : null; }
    listJades() { return Array.from(this.jades.values()).map(j => ({ ...j })); }
    listByMaster(masterId) { return Array.from(this.jades.values()).filter(j => j.masterId === masterId).map(j => ({ ...j })); }
    listLegendary() { return Array.from(this.jades.values()).filter(j => j.status === 'legendary').map(j => ({ ...j })); }

    addCarving(jadeId, carving) {
        const jade = this.jades.get(jadeId);
        if (!jade) return { success: false, error: 'JADE_NOT_FOUND' };
        jade.carvings.push(carving);
        this._triggerHook('carvingAdded', { jadeId, carving });
        return { success: true };
    }

    raiseLuster(jadeId, amount = 5) {
        const jade = this.jades.get(jadeId);
        if (!jade) return { success: false, error: 'JADE_NOT_FOUND' };
        jade.luster += amount;
        this._triggerHook('lusterRaised', { jadeId, newLuster: jade.luster });
        return { success: true };
    }

    levelUpJade(jadeId) {
        const jade = this.jades.get(jadeId);
        if (!jade) return { success: false, error: 'JADE_NOT_FOUND' };
        jade.level++;
        this._triggerHook('jadeLeveledUp', { jadeId, newLevel: jade.level });
        return { success: true };
    }

    legendJade(jadeId) {
        const jade = this.jades.get(jadeId);
        if (!jade) return { success: false, error: 'JADE_NOT_FOUND' };
        jade.status = 'legendary';
        this._triggerHook('jadeLegendized', { jadeId });
        return { success: true };
    }

    calculateJadeValue(jadeId) {
        const jade = this.jades.get(jadeId);
        if (!jade) return 0;
        return jade.level * 100 + jade.luster * 2 + jade.carvings.length * 30;
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
        this.config.maxJades += 10;
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
