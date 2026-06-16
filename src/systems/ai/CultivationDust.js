/**
 * CultivationDust.js - 修真尘
 * V847 Iteration 20/30 Round 33
 */
export class CultivationDust {
    constructor(config = {}) {
        this.config = { maxDusts: config.maxDusts || 20, baseLightness: config.baseLightness || 20, ...config };
        this.dusts = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDusts: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDust', (ctx) => this.getDust(ctx.dustId));
        this.registerTool('recruitDust', (ctx) => this.recruitDust(ctx));
    }

    recruitDust(data) {
        const id = data.id || `dst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const dust = {
            dustId: id,
            masterId: data.masterId || 'unknown',
            name: data.name || 'Unnamed Dust',
            type: data.type || 'cosmic',
            lightness: data.lightness || this.config.baseLightness,
            motes: data.motes || [],
            level: data.level || 1,
            status: data.status || 'novice',
            recruitedAt: Date.now()
        };
        this.dusts.set(id, dust);
        this.stats.totalDusts++;
        this._triggerHook('dustRecruited', { dustId: id });
        return { success: true, dust };
    }

    getDust(id) { return this.dusts.get(id) ? { ...this.dusts.get(id) } : null; }
    listDusts() { return Array.from(this.dusts.values()).map(d => ({ ...d })); }
    listByMaster(masterId) { return Array.from(this.dusts.values()).filter(d => d.masterId === masterId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.dusts.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addMote(dustId, mote) {
        const dust = this.dusts.get(dustId);
        if (!dust) return { success: false, error: 'DUST_NOT_FOUND' };
        dust.motes.push(mote);
        this._triggerHook('moteAdded', { dustId, mote });
        return { success: true };
    }

    raiseLightness(dustId, amount = 5) {
        const dust = this.dusts.get(dustId);
        if (!dust) return { success: false, error: 'DUST_NOT_FOUND' };
        dust.lightness += amount;
        this._triggerHook('lightnessRaised', { dustId, newLightness: dust.lightness });
        return { success: true };
    }

    levelUpDust(dustId) {
        const dust = this.dusts.get(dustId);
        if (!dust) return { success: false, error: 'DUST_NOT_FOUND' };
        dust.level++;
        this._triggerHook('dustLeveledUp', { dustId, newLevel: dust.level });
        return { success: true };
    }

    legendDust(dustId) {
        const dust = this.dusts.get(dustId);
        if (!dust) return { success: false, error: 'DUST_NOT_FOUND' };
        dust.status = 'legendary';
        this._triggerHook('dustLegendized', { dustId });
        return { success: true };
    }

    calculateDustValue(dustId) {
        const dust = this.dusts.get(dustId);
        if (!dust) return 0;
        return dust.level * 100 + dust.lightness * 2 + dust.motes.length * 30;
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
        if (this.stats.totalDusts < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDusts += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { dusts: Array.from(this.dusts.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.dusts) this.dusts = new Map(data.dusts);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, dustCount: this.dusts.size }; }
}
