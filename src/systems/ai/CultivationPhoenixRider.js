/**
 * CultivationPhoenixRider.js - 修真凤骑系统
 * V644 Iteration 27/30 Round 26
 */
export class CultivationPhoenixRider {
    constructor(config = {}) {
        this.config = { maxPhoenixRiders: config.maxPhoenixRiders || 15, baseBond: config.baseBond || 20, ...config };
        this.phoenixriders = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPhoenixRiders: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPhoenixRider', (ctx) => this.getPhoenixRider(ctx.riderId));
        this.registerTool('recruitPhoenixRider', (ctx) => this.recruitPhoenixRider(ctx));
    }

    recruitPhoenixRider(data) {
        const id = data.riderId || `phx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const rider = {
            riderId: id,
            mentorId: data.mentorId,
            name: data.name || 'Vermilion Phoenix Rider',
            type: data.type || 'vermilion',
            bond: data.bond || this.config.baseBond,
            phoenixes: data.phoenixes || [],
            level: data.level || 1,
            status: data.status || 'novice',
            recruitedAt: Date.now()
        };
        this.phoenixriders.set(id, rider);
        this.stats.totalPhoenixRiders++;
        this._triggerHook('phoenixRiderRecruited', { riderId: id, mentorId: data.mentorId });
        return { success: true, rider };
    }

    getPhoenixRider(id) { return this.phoenixriders.get(id) ? { ...this.phoenixriders.get(id) } : null; }
    listPhoenixRiders() { return Array.from(this.phoenixriders.values()).map(r => ({ ...r })); }
    listByMentor(mentorId) { return Array.from(this.phoenixriders.values()).filter(r => r.mentorId === mentorId).map(r => ({ ...r })); }
    listLegendary() { return Array.from(this.phoenixriders.values()).filter(r => r.status === 'legendary').map(r => ({ ...r })); }

    addPhoenix(riderId, phoenix) {
        const rider = this.phoenixriders.get(riderId);
        if (!rider) return { success: false, error: 'RIDER_NOT_FOUND' };
        rider.phoenixes.push(phoenix);
        this._triggerHook('phoenixAdded', { riderId, phoenix });
        return { success: true };
    }

    deepenBond(riderId, amount = 5) {
        const rider = this.phoenixriders.get(riderId);
        if (!rider) return { success: false, error: 'RIDER_NOT_FOUND' };
        rider.bond += amount;
        this._triggerHook('bondDeepened', { riderId, newBond: rider.bond });
        return { success: true };
    }

    levelUpPhoenixRider(riderId) {
        const rider = this.phoenixriders.get(riderId);
        if (!rider) return { success: false, error: 'RIDER_NOT_FOUND' };
        rider.level++;
        this._triggerHook('phoenixRiderLeveledUp', { riderId, newLevel: rider.level });
        return { success: true };
    }

    legendPhoenixRider(riderId) {
        const rider = this.phoenixriders.get(riderId);
        if (!rider) return { success: false, error: 'RIDER_NOT_FOUND' };
        rider.status = 'legendary';
        this._triggerHook('phoenixRiderLegendized', { riderId });
        return { success: true };
    }

    calculatePhoenixRiderValue(riderId) {
        const rider = this.phoenixriders.get(riderId);
        if (!rider) return 0;
        return rider.level * 100 + rider.bond * 2 + rider.phoenixes.length * 30;
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
        if (this.stats.totalPhoenixRiders < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPhoenixRiders += 8;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { phoenixriders: Array.from(this.phoenixriders.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.phoenixriders) this.phoenixriders = new Map(data.phoenixriders);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, phoenixRiderCount: this.phoenixriders.size }; }
}
