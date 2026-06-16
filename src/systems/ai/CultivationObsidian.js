/**
 * CultivationObsidian.js - 修真黑曜石系统
 * V839 Iteration 12/30 Round 33
 */
export class CultivationObsidian {
    constructor(config = {}) {
        this.config = { maxObsidians: config.maxObsidians || 20, baseSharpness: config.baseSharpness || 20, ...config };
        this.obsidians = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalObsidians: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getObsidian', (ctx) => this.getObsidian(ctx.obsidianId));
        this.registerTool('recruitObsidian', (ctx) => this.recruitObsidian(ctx));
    }

    recruitObsidian(data) {
        const id = data.id || `obs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const obsidian = {
            obsidianId: id,
            masterId: data.masterId || 'unknown_master',
            name: data.name || 'unnamed_obsidian',
            type: data.type || 'black',
            sharpness: data.sharpness || this.config.baseSharpness,
            edges: data.edges || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.obsidians.set(id, obsidian);
        this.stats.totalObsidians++;
        this._triggerHook('obsidianRecruited', { obsidianId: id });
        return { success: true, obsidian };
    }

    getObsidian(id) { return this.obsidians.get(id) ? { ...this.obsidians.get(id) } : null; }
    listObsidians() { return Array.from(this.obsidians.values()).map(o => ({ ...o })); }
    listByMaster(masterId) { return Array.from(this.obsidians.values()).filter(o => o.masterId === masterId).map(o => ({ ...o })); }
    listLegendary() { return Array.from(this.obsidians.values()).filter(o => o.status === 'legendary').map(o => ({ ...o })); }

    addEdge(obsidianId, edge) {
        const obsidian = this.obsidians.get(obsidianId);
        if (!obsidian) return { success: false, error: 'OBSIDIAN_NOT_FOUND' };
        obsidian.edges.push(edge);
        if (obsidian.edges.length >= 5) obsidian.status = 'veteran';
        this._triggerHook('edgeAdded', { obsidianId, edge });
        return { success: true };
    }

    raiseSharpness(obsidianId, amount = 5) {
        const obsidian = this.obsidians.get(obsidianId);
        if (!obsidian) return { success: false, error: 'OBSIDIAN_NOT_FOUND' };
        obsidian.sharpness += amount;
        this._triggerHook('sharpnessRaised', { obsidianId, newSharpness: obsidian.sharpness });
        return { success: true };
    }

    levelUpObsidian(obsidianId) {
        const obsidian = this.obsidians.get(obsidianId);
        if (!obsidian) return { success: false, error: 'OBSIDIAN_NOT_FOUND' };
        obsidian.level++;
        this._triggerHook('obsidianLeveledUp', { obsidianId, newLevel: obsidian.level });
        return { success: true };
    }

    legendObsidian(obsidianId) {
        const obsidian = this.obsidians.get(obsidianId);
        if (!obsidian) return { success: false, error: 'OBSIDIAN_NOT_FOUND' };
        obsidian.status = 'legendary';
        this._triggerHook('obsidianLegendized', { obsidianId });
        return { success: true };
    }

    calculateObsidianValue(obsidianId) {
        const obsidian = this.obsidians.get(obsidianId);
        if (!obsidian) return 0;
        return obsidian.level * 100 + obsidian.sharpness * 2 + obsidian.edges.length * 30;
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
        if (this.stats.totalObsidians < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxObsidians += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { obsidians: Array.from(this.obsidians.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.obsidians) this.obsidians = new Map(data.obsidians);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, obsidianCount: this.obsidians.size }; }
}