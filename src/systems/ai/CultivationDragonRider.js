/**
 * CultivationDragonRider.js - 修真龙骑系统
 * V643 Iteration 26/30 Round 26
 */
export class CultivationDragonRider {
    constructor(config = {}) {
        this.config = { maxDragonRiders: config.maxDragonRiders || 20, baseBond: config.baseBond || 20, ...config };
        this.dragonriders = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDragonRiders: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDragonRider', (ctx) => this.getDragonRider(ctx.riderId));
        this.registerTool('recruitDragonRider', (ctx) => this.recruitDragonRider(ctx));
    }

    recruitDragonRider(data) {
        const id = data.riderId || `drg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const rider = {
            riderId: id,
            trainerId: data.trainerId,
            name: data.name || 'Azure Dragon Rider',
            type: data.type || 'azure',
            bond: data.bond || this.config.baseBond,
            dragons: data.dragons || [],
            level: data.level || 1,
            status: data.status || 'novice',
            recruitedAt: Date.now()
        };
        this.dragonriders.set(id, rider);
        this.stats.totalDragonRiders++;
        this._triggerHook('dragonRiderRecruited', { riderId: id, trainerId: data.trainerId });
        return { success: true, rider };
    }

    getDragonRider(id) { return this.dragonriders.get(id) ? { ...this.dragonriders.get(id) } : null; }
    listDragonRiders() { return Array.from(this.dragonriders.values()).map(r => ({ ...r })); }
    listByTrainer(trainerId) { return Array.from(this.dragonriders.values()).filter(r => r.trainerId === trainerId).map(r => ({ ...r })); }
    listLegendary() { return Array.from(this.dragonriders.values()).filter(r => r.status === 'legendary').map(r => ({ ...r })); }

    addDragon(riderId, dragon) {
        const rider = this.dragonriders.get(riderId);
        if (!rider) return { success: false, error: 'RIDER_NOT_FOUND' };
        rider.dragons.push(dragon);
        this._triggerHook('dragonAdded', { riderId, dragon });
        return { success: true };
    }

    strengthenBond(riderId, amount = 5) {
        const rider = this.dragonriders.get(riderId);
        if (!rider) return { success: false, error: 'RIDER_NOT_FOUND' };
        rider.bond += amount;
        this._triggerHook('bondStrengthened', { riderId, newBond: rider.bond });
        return { success: true };
    }

    levelUpDragonRider(riderId) {
        const rider = this.dragonriders.get(riderId);
        if (!rider) return { success: false, error: 'RIDER_NOT_FOUND' };
        rider.level++;
        this._triggerHook('dragonRiderLeveledUp', { riderId, newLevel: rider.level });
        return { success: true };
    }

    legendDragonRider(riderId) {
        const rider = this.dragonriders.get(riderId);
        if (!rider) return { success: false, error: 'RIDER_NOT_FOUND' };
        rider.status = 'legendary';
        this._triggerHook('dragonRiderLegendized', { riderId });
        return { success: true };
    }

    calculateDragonRiderValue(riderId) {
        const rider = this.dragonriders.get(riderId);
        if (!rider) return 0;
        return rider.level * 100 + rider.bond * 2 + rider.dragons.length * 30;
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
        if (this.stats.totalDragonRiders < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDragonRiders += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { dragonriders: Array.from(this.dragonriders.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.dragonriders) this.dragonriders = new Map(data.dragonriders);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, dragonRiderCount: this.dragonriders.size }; }
}
