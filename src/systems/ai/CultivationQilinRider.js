/**
 * CultivationQilinRider.js - 修真麒麟骑系统
 * V646 Iteration 29/30 Round 26
 */
export class CultivationQilinRider {
    constructor(config = {}) {
        this.config = { maxQilinRiders: config.maxQilinRiders || 10, baseBond: config.baseBond || 20, ...config };
        this.qilinriders = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalQilinRiders: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getQilinRider', (ctx) => this.getQilinRider(ctx.riderId));
        this.registerTool('recruitQilinRider', (ctx) => this.recruitQilinRider(ctx));
    }

    recruitQilinRider(data) {
        const id = data.riderId || `qil_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const rider = {
            riderId: id,
            senseiId: data.senseiId,
            name: data.name || 'Golden Qilin Rider',
            type: data.type || 'golden',
            bond: data.bond || this.config.baseBond,
            qilins: data.qilins || [],
            level: data.level || 1,
            status: data.status || 'novice',
            recruitedAt: Date.now()
        };
        this.qilinriders.set(id, rider);
        this.stats.totalQilinRiders++;
        this._triggerHook('qilinRiderRecruited', { riderId: id, senseiId: data.senseiId });
        return { success: true, rider };
    }

    getQilinRider(id) { return this.qilinriders.get(id) ? { ...this.qilinriders.get(id) } : null; }
    listQilinRiders() { return Array.from(this.qilinriders.values()).map(r => ({ ...r })); }
    listBySensei(senseiId) { return Array.from(this.qilinriders.values()).filter(r => r.senseiId === senseiId).map(r => ({ ...r })); }
    listLegendary() { return Array.from(this.qilinriders.values()).filter(r => r.status === 'legendary').map(r => ({ ...r })); }

    addQilin(riderId, qilin) {
        const rider = this.qilinriders.get(riderId);
        if (!rider) return { success: false, error: 'RIDER_NOT_FOUND' };
        rider.qilins.push(qilin);
        this._triggerHook('qilinAdded', { riderId, qilin });
        return { success: true };
    }

    raiseBond(riderId, amount = 5) {
        const rider = this.qilinriders.get(riderId);
        if (!rider) return { success: false, error: 'RIDER_NOT_FOUND' };
        rider.bond += amount;
        this._triggerHook('bondRaised', { riderId, newBond: rider.bond });
        return { success: true };
    }

    levelUpQilinRider(riderId) {
        const rider = this.qilinriders.get(riderId);
        if (!rider) return { success: false, error: 'RIDER_NOT_FOUND' };
        rider.level++;
        this._triggerHook('qilinRiderLeveledUp', { riderId, newLevel: rider.level });
        return { success: true };
    }

    legendQilinRider(riderId) {
        const rider = this.qilinriders.get(riderId);
        if (!rider) return { success: false, error: 'RIDER_NOT_FOUND' };
        rider.status = 'legendary';
        this._triggerHook('qilinRiderLegendized', { riderId });
        return { success: true };
    }

    calculateQilinRiderValue(riderId) {
        const rider = this.qilinriders.get(riderId);
        if (!rider) return 0;
        return rider.level * 100 + rider.bond * 2 + rider.qilins.length * 30;
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
        if (this.stats.totalQilinRiders < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxQilinRiders += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { qilinriders: Array.from(this.qilinriders.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.qilinriders) this.qilinriders = new Map(data.qilinriders);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, qilinRiderCount: this.qilinriders.size }; }
}
