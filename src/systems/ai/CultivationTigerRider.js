/**
 * CultivationTigerRider.js - 修真虎骑系统
 * V645 Iteration 28/30 Round 26
 */
export class CultivationTigerRider {
    constructor(config = {}) {
        this.config = { maxTigerRiders: config.maxTigerRiders || 20, baseBond: config.baseBond || 20, ...config };
        this.tigerriders = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTigerRiders: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTigerRider', (ctx) => this.getTigerRider(ctx.riderId));
        this.registerTool('recruitTigerRider', (ctx) => this.recruitTigerRider(ctx));
    }

    recruitTigerRider(data) {
        const id = data.riderId || `tgr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const rider = {
            riderId: id,
            masterId: data.masterId,
            name: data.name || 'Bengal Tiger Rider',
            type: data.type || 'bengal',
            bond: data.bond || this.config.baseBond,
            tigers: data.tigers || [],
            level: data.level || 1,
            status: data.status || 'novice',
            recruitedAt: Date.now()
        };
        this.tigerriders.set(id, rider);
        this.stats.totalTigerRiders++;
        this._triggerHook('tigerRiderRecruited', { riderId: id, masterId: data.masterId });
        return { success: true, rider };
    }

    getTigerRider(id) { return this.tigerriders.get(id) ? { ...this.tigerriders.get(id) } : null; }
    listTigerRiders() { return Array.from(this.tigerriders.values()).map(r => ({ ...r })); }
    listByMaster(masterId) { return Array.from(this.tigerriders.values()).filter(r => r.masterId === masterId).map(r => ({ ...r })); }
    listLegendary() { return Array.from(this.tigerriders.values()).filter(r => r.status === 'legendary').map(r => ({ ...r })); }

    addTiger(riderId, tiger) {
        const rider = this.tigerriders.get(riderId);
        if (!rider) return { success: false, error: 'RIDER_NOT_FOUND' };
        rider.tigers.push(tiger);
        this._triggerHook('tigerAdded', { riderId, tiger });
        return { success: true };
    }

    tameBond(riderId, amount = 5) {
        const rider = this.tigerriders.get(riderId);
        if (!rider) return { success: false, error: 'RIDER_NOT_FOUND' };
        rider.bond += amount;
        this._triggerHook('bondTamed', { riderId, newBond: rider.bond });
        return { success: true };
    }

    levelUpTigerRider(riderId) {
        const rider = this.tigerriders.get(riderId);
        if (!rider) return { success: false, error: 'RIDER_NOT_FOUND' };
        rider.level++;
        this._triggerHook('tigerRiderLeveledUp', { riderId, newLevel: rider.level });
        return { success: true };
    }

    legendTigerRider(riderId) {
        const rider = this.tigerriders.get(riderId);
        if (!rider) return { success: false, error: 'RIDER_NOT_FOUND' };
        rider.status = 'legendary';
        this._triggerHook('tigerRiderLegendized', { riderId });
        return { success: true };
    }

    calculateTigerRiderValue(riderId) {
        const rider = this.tigerriders.get(riderId);
        if (!rider) return 0;
        return rider.level * 100 + rider.bond * 2 + rider.tigers.length * 30;
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
        if (this.stats.totalTigerRiders < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTigerRiders += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { tigerriders: Array.from(this.tigerriders.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.tigerriders) this.tigerriders = new Map(data.tigerriders);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, tigerRiderCount: this.tigerriders.size }; }
}
