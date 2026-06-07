/**
 * CultivationWaterfall.js - 修真瀑系统
 * V691 Iteration 14/30 Round 28
 */
export class CultivationWaterfall {
    constructor(config = {}) {
        this.config = { maxWaterfalls: config.maxWaterfalls || 10, baseForce: config.baseForce || 20, ...config };
        this.waterfalls = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalWaterfalls: 0, legendaryCount: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getWaterfall', (ctx) => this.getWaterfall(ctx.waterfallId));
        this.registerTool('recruitWaterfall', (ctx) => this.recruitWaterfall(ctx));
    }

    recruitWaterfall(data) {
        if (this.waterfalls.size >= this.config.maxWaterfalls) return { success: false, error: 'MAX_WATERFALLS_REACHED' };
        const id = data.waterfallId || `wfl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const waterfall = {
            waterfallId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed',
            type: data.type || 'heavenly',
            force: data.force != null ? data.force : this.config.baseForce,
            pools: data.pools || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.waterfalls.set(id, waterfall);
        this.stats.totalWaterfalls++;
        this._triggerHook('waterfallRecruited', { waterfallId: id });
        return { success: true, waterfall };
    }

    getWaterfall(id) { return this.waterfalls.get(id) ? { ...this.waterfalls.get(id) } : null; }
    listWaterfalls() { return Array.from(this.waterfalls.values()).map(w => ({ ...w })); }
    listByMaster(masterId) { return Array.from(this.waterfalls.values()).filter(w => w.masterId === masterId).map(w => ({ ...w })); }
    listLegendary() { return Array.from(this.waterfalls.values()).filter(w => w.status === 'legendary').map(w => ({ ...w })); }

    addPool(waterfallId, pool) {
        const waterfall = this.waterfalls.get(waterfallId);
        if (!waterfall) return { success: false, error: 'WATERFALL_NOT_FOUND' };
        waterfall.pools.push(pool);
        this._triggerHook('poolAdded', { waterfallId, pool });
        return { success: true };
    }

    raiseForce(waterfallId, amount = 5) {
        const waterfall = this.waterfalls.get(waterfallId);
        if (!waterfall) return { success: false, error: 'WATERFALL_NOT_FOUND' };
        waterfall.force += amount;
        this._triggerHook('forceRaised', { waterfallId, newForce: waterfall.force });
        return { success: true };
    }

    levelUpWaterfall(waterfallId) {
        const waterfall = this.waterfalls.get(waterfallId);
        if (!waterfall) return { success: false, error: 'WATERFALL_NOT_FOUND' };
        waterfall.level++;
        this._triggerHook('waterfallLeveledUp', { waterfallId, newLevel: waterfall.level });
        return { success: true };
    }

    legendWaterfall(waterfallId) {
        const waterfall = this.waterfalls.get(waterfallId);
        if (!waterfall) return { success: false, error: 'WATERFALL_NOT_FOUND' };
        waterfall.status = 'legendary';
        this.stats.legendaryCount++;
        this._triggerHook('waterfallLegendized', { waterfallId });
        return { success: true };
    }

    calculateWaterfallValue(waterfallId) {
        const waterfall = this.waterfalls.get(waterfallId);
        if (!waterfall) return 0;
        return waterfall.level * 100 + waterfall.force * 2 + (waterfall.pools ? waterfall.pools.length : 0) * 30;
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
        if (this.stats.totalWaterfalls < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxWaterfalls += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { waterfalls: Array.from(this.waterfalls.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.waterfalls) this.waterfalls = new Map(data.waterfalls);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, waterfallCount: this.waterfalls.size }; }
}
