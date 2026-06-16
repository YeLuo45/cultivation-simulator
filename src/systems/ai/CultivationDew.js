/**
 * CultivationDew.js - 修真露
 * V804 Iteration 7/30 Round 32
 */
export class CultivationDew {
    constructor(config = {}) {
        this.config = { maxDews: config.maxDews || 20, baseFreshness: config.baseFreshness || 20, ...config };
        this.dews = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDews: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDew', (ctx) => this.getDew(ctx.dewId));
        this.registerTool('recruitDew', (ctx) => this.recruitDew(ctx));
    }

    recruitDew(data) {
        const id = data.id || `dew_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const dew = {
            dewId: id,
            masterId: data.masterId || 'unknown',
            name: data.name || 'Unnamed Dew',
            type: data.type || 'morning',
            freshness: data.freshness || this.config.baseFreshness,
            droplets: data.droplets || [],
            level: data.level || 1,
            status: data.status || 'novice',
            recruitedAt: Date.now()
        };
        this.dews.set(id, dew);
        this.stats.totalDews++;
        this._triggerHook('dewRecruited', { dewId: id });
        return { success: true, dew };
    }

    getDew(id) { return this.dews.get(id) ? { ...this.dews.get(id) } : null; }
    listDews() { return Array.from(this.dews.values()).map(d => ({ ...d })); }
    listByMaster(masterId) { return Array.from(this.dews.values()).filter(d => d.masterId === masterId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.dews.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addDroplet(dewId, droplet) {
        const dew = this.dews.get(dewId);
        if (!dew) return { success: false, error: 'DEW_NOT_FOUND' };
        dew.droplets.push(droplet);
        this._triggerHook('dropletAdded', { dewId, droplet });
        return { success: true };
    }

    raiseFreshness(dewId, amount = 5) {
        const dew = this.dews.get(dewId);
        if (!dew) return { success: false, error: 'DEW_NOT_FOUND' };
        dew.freshness += amount;
        this._triggerHook('freshnessRaised', { dewId, newFreshness: dew.freshness });
        return { success: true };
    }

    levelUpDew(dewId) {
        const dew = this.dews.get(dewId);
        if (!dew) return { success: false, error: 'DEW_NOT_FOUND' };
        dew.level++;
        this._triggerHook('dewLeveledUp', { dewId, newLevel: dew.level });
        return { success: true };
    }

    legendDew(dewId) {
        const dew = this.dews.get(dewId);
        if (!dew) return { success: false, error: 'DEW_NOT_FOUND' };
        dew.status = 'legendary';
        this._triggerHook('dewLegendized', { dewId });
        return { success: true };
    }

    calculateDewValue(dewId) {
        const dew = this.dews.get(dewId);
        if (!dew) return 0;
        return dew.level * 100 + dew.freshness * 2 + dew.droplets.length * 30;
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
        if (this.stats.totalDews < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDews += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { dews: Array.from(this.dews.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.dews) this.dews = new Map(data.dews);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, dewCount: this.dews.size }; }
}
