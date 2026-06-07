/**
 * CultivationOpal.js - 修真蛋白石系统
 * V837 Iteration 10/30 Round 33
 */
export class CultivationOpal {
    constructor(config = {}) {
        this.config = { maxOpals: config.maxOpals || 20, baseShimmer: config.baseShimmer || 20, ...config };
        this.opals = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalOpals: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getOpal', (ctx) => this.getOpal(ctx.opalId));
        this.registerTool('recruitOpal', (ctx) => this.recruitOpal(ctx));
    }

    recruitOpal(data) {
        const id = data.opalId || `opal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const opal = { opalId: id, masterId: data.masterId, name: data.name || 'Mystic Opal', type: data.type || 'divine', shimmer: data.shimmer || this.config.baseShimmer, inclusions: data.inclusions || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.opals.set(id, opal);
        this.stats.totalOpals++;
        this._triggerHook('opalRecruited', { opalId: id });
        return { success: true, opal };
    }

    getOpal(id) { return this.opals.get(id) ? { ...this.opals.get(id) } : null; }
    listOpals() { return Array.from(this.opals.values()).map(o => ({ ...o })); }
    listByMaster(masterId) { return Array.from(this.opals.values()).filter(o => o.masterId === masterId).map(o => ({ ...o })); }
    listLegendary() { return Array.from(this.opals.values()).filter(o => o.status === 'legendary').map(o => ({ ...o })); }

    addInclusion(opalId, inclusion) {
        const opal = this.opals.get(opalId);
        if (!opal) return { success: false, error: 'OPAL_NOT_FOUND' };
        opal.inclusions.push(inclusion);
        this._triggerHook('inclusionAdded', { opalId, inclusion });
        return { success: true };
    }

    raiseShimmer(opalId, amount = 5) {
        const opal = this.opals.get(opalId);
        if (!opal) return { success: false, error: 'OPAL_NOT_FOUND' };
        opal.shimmer += amount;
        this._triggerHook('shimmerRaised', { opalId, newShimmer: opal.shimmer });
        return { success: true };
    }

    levelUpOpal(opalId) {
        const opal = this.opals.get(opalId);
        if (!opal) return { success: false, error: 'OPAL_NOT_FOUND' };
        opal.level++;
        this._triggerHook('opalLeveledUp', { opalId, newLevel: opal.level });
        return { success: true };
    }

    legendOpal(opalId) {
        const opal = this.opals.get(opalId);
        if (!opal) return { success: false, error: 'OPAL_NOT_FOUND' };
        opal.status = 'legendary';
        this._triggerHook('opalLegendized', { opalId });
        return { success: true };
    }

    calculateOpalValue(opalId) {
        const opal = this.opals.get(opalId);
        if (!opal) return 0;
        return opal.level * 100 + opal.shimmer * 2 + opal.inclusions.length * 30;
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
        if (this.stats.totalOpals < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxOpals += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { opals: Array.from(this.opals.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.opals) this.opals = new Map(data.opals);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, opalCount: this.opals.size }; }
}
