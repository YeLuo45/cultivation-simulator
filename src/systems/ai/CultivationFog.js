/**
 * CultivationFog.js - 修真霾
 * V805 Iteration 8/30 Round 32
 */
export class CultivationFog {
    constructor(config = {}) {
        this.config = { maxFogs: config.maxFogs || 20, baseOpacity: config.baseOpacity || 20, ...config };
        this.fogs = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFogs: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getFog', (ctx) => this.getFog(ctx.fogId));
        this.registerTool('recruitFog', (ctx) => this.recruitFog(ctx));
    }

    recruitFog(data) {
        const id = data.id || `fog_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const fog = {
            fogId: id,
            masterId: data.masterId || 'unknown',
            name: data.name || 'Unnamed Fog',
            type: data.type || 'thick',
            opacity: data.opacity || this.config.baseOpacity,
            veils: data.veils || [],
            level: data.level || 1,
            status: data.status || 'novice',
            recruitedAt: Date.now()
        };
        this.fogs.set(id, fog);
        this.stats.totalFogs++;
        this._triggerHook('fogRecruited', { fogId: id });
        return { success: true, fog };
    }

    getFog(id) { return this.fogs.get(id) ? { ...this.fogs.get(id) } : null; }
    listFogs() { return Array.from(this.fogs.values()).map(f => ({ ...f })); }
    listByMaster(masterId) { return Array.from(this.fogs.values()).filter(f => f.masterId === masterId).map(f => ({ ...f })); }
    listLegendary() { return Array.from(this.fogs.values()).filter(f => f.status === 'legendary').map(f => ({ ...f })); }

    addVeil(fogId, veil) {
        const fog = this.fogs.get(fogId);
        if (!fog) return { success: false, error: 'FOG_NOT_FOUND' };
        fog.veils.push(veil);
        this._triggerHook('veilAdded', { fogId, veil });
        return { success: true };
    }

    raiseOpacity(fogId, amount = 5) {
        const fog = this.fogs.get(fogId);
        if (!fog) return { success: false, error: 'FOG_NOT_FOUND' };
        fog.opacity += amount;
        this._triggerHook('opacityRaised', { fogId, newOpacity: fog.opacity });
        return { success: true };
    }

    levelUpFog(fogId) {
        const fog = this.fogs.get(fogId);
        if (!fog) return { success: false, error: 'FOG_NOT_FOUND' };
        fog.level++;
        this._triggerHook('fogLeveledUp', { fogId, newLevel: fog.level });
        return { success: true };
    }

    legendFog(fogId) {
        const fog = this.fogs.get(fogId);
        if (!fog) return { success: false, error: 'FOG_NOT_FOUND' };
        fog.status = 'legendary';
        this._triggerHook('fogLegendized', { fogId });
        return { success: true };
    }

    calculateFogValue(fogId) {
        const fog = this.fogs.get(fogId);
        if (!fog) return 0;
        return fog.level * 100 + fog.opacity * 2 + fog.veils.length * 30;
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
        if (this.stats.totalFogs < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxFogs += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { fogs: Array.from(this.fogs.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.fogs) this.fogs = new Map(data.fogs);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, fogCount: this.fogs.size }; }
}
