/**
 * CultivationIce.js - 修真冰
 * V799 Iteration 2/30 Round 32
 */
export class CultivationIce {
    constructor(config = {}) {
        this.config = { maxIces: config.maxIces || 20, baseCold: config.baseCold || 20, ...config };
        this.ices = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalIces: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getIce', (ctx) => this.getIce(ctx.iceId));
        this.registerTool('recruitIce', (ctx) => this.recruitIce(ctx));
    }

    recruitIce(data) {
        const id = data.id || `ice_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const ice = {
            iceId: id,
            masterId: data.masterId || 'unknown',
            name: data.name || 'Unnamed Ice',
            type: data.type || 'glacial',
            cold: data.cold || this.config.baseCold,
            shards: data.shards || [],
            level: data.level || 1,
            status: data.status || 'novice',
            recruitedAt: Date.now()
        };
        this.ices.set(id, ice);
        this.stats.totalIces++;
        this._triggerHook('iceRecruited', { iceId: id });
        return { success: true, ice };
    }

    getIce(id) { return this.ices.get(id) ? { ...this.ices.get(id) } : null; }
    listIces() { return Array.from(this.ices.values()).map(i => ({ ...i })); }
    listByMaster(masterId) { return Array.from(this.ices.values()).filter(i => i.masterId === masterId).map(i => ({ ...i })); }
    listByType(type) { return Array.from(this.ices.values()).filter(i => i.type === type).map(i => ({ ...i })); }
    listLegendary() { return Array.from(this.ices.values()).filter(i => i.status === 'legendary').map(i => ({ ...i })); }

    addShard(iceId, shard) {
        const ice = this.ices.get(iceId);
        if (!ice) return { success: false, error: 'ICE_NOT_FOUND' };
        ice.shards.push(shard);
        this._triggerHook('shardAdded', { iceId, shard });
        return { success: true };
    }

    raiseCold(iceId, amount = 5) {
        const ice = this.ices.get(iceId);
        if (!ice) return { success: false, error: 'ICE_NOT_FOUND' };
        ice.cold += amount;
        this._triggerHook('coldRaised', { iceId, newCold: ice.cold });
        return { success: true };
    }

    levelUpIce(iceId) {
        const ice = this.ices.get(iceId);
        if (!ice) return { success: false, error: 'ICE_NOT_FOUND' };
        ice.level++;
        this._triggerHook('iceLeveledUp', { iceId, newLevel: ice.level });
        return { success: true };
    }

    legendIce(iceId) {
        const ice = this.ices.get(iceId);
        if (!ice) return { success: false, error: 'ICE_NOT_FOUND' };
        ice.status = 'legendary';
        this._triggerHook('iceLegendized', { iceId });
        return { success: true };
    }

    trainIce(iceId) {
        const ice = this.ices.get(iceId);
        if (!ice) return { success: false, error: 'ICE_NOT_FOUND' };
        ice.status = 'veteran';
        this._triggerHook('iceTrained', { iceId });
        return { success: true };
    }

    calculateIceValue(iceId) {
        const ice = this.ices.get(iceId);
        if (!ice) return 0;
        return ice.level * 100 + ice.cold * 2 + ice.shards.length * 30;
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
        if (this.stats.totalIces < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxIces += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { ices: Array.from(this.ices.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.ices) this.ices = new Map(data.ices);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, iceCount: this.ices.size }; }
}
