/**
 * CultivationEagle.js - 修真鹰
 * V720 Iteration 13/30 Round 29
 */
export class CultivationEagle {
    constructor(config = {}) {
        this.config = { maxEagles: config.maxEagles || 20, baseKeenness: config.baseKeenness || 20, ...config };
        this.eagles = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEagles: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEagle', (ctx) => this.getEagle(ctx.eagleId));
        this.registerTool('recruitEagle', (ctx) => this.recruitEagle(ctx));
    }

    recruitEagle(data) {
        const id = data.id || `eagle_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const eagle = { eagleId: id, masterId: data.masterId || 'unknown', name: data.name || 'Unnamed Eagle', type: data.type || 'golden', keenness: data.keenness || this.config.baseKeenness, feathers: data.feathers || [], level: data.level || 1, status: 'novice', recruitedAt: Date.now() };
        this.eagles.set(id, eagle);
        this.stats.totalEagles++;
        this._triggerHook('eagleRecruited', { eagleId: id });
        return { success: true, eagle };
    }

    getEagle(id) { return this.eagles.get(id) ? { ...this.eagles.get(id) } : null; }
    listEagles() { return Array.from(this.eagles.values()).map(e => ({ ...e })); }
    listByMaster(masterId) { return Array.from(this.eagles.values()).filter(e => e.masterId === masterId).map(e => ({ ...e })); }
    listByType(type) { return Array.from(this.eagles.values()).filter(e => e.type === type).map(e => ({ ...e })); }
    listLegendary() { return Array.from(this.eagles.values()).filter(e => e.status === 'legendary').map(e => ({ ...e })); }

    addFeather(eagleId, feather) {
        const eagle = this.eagles.get(eagleId);
        if (!eagle) return { success: false, error: 'EAGLE_NOT_FOUND' };
        eagle.feathers.push(feather);
        this._triggerHook('featherAdded', { eagleId, feather });
        return { success: true };
    }

    raiseKeenness(eagleId, amount = 5) {
        const eagle = this.eagles.get(eagleId);
        if (!eagle) return { success: false, error: 'EAGLE_NOT_FOUND' };
        eagle.keenness += amount;
        this._triggerHook('keennessRaised', { eagleId, newKeenness: eagle.keenness });
        return { success: true };
    }

    levelUpEagle(eagleId) {
        const eagle = this.eagles.get(eagleId);
        if (!eagle) return { success: false, error: 'EAGLE_NOT_FOUND' };
        eagle.level++;
        this._triggerHook('eagleLeveledUp', { eagleId, newLevel: eagle.level });
        return { success: true };
    }

    promoteEagle(eagleId) {
        const eagle = this.eagles.get(eagleId);
        if (!eagle) return { success: false, error: 'EAGLE_NOT_FOUND' };
        eagle.status = 'veteran';
        this._triggerHook('eaglePromoted', { eagleId });
        return { success: true };
    }

    changeType(eagleId, newType) {
        const eagle = this.eagles.get(eagleId);
        if (!eagle) return { success: false, error: 'EAGLE_NOT_FOUND' };
        eagle.type = newType;
        this._triggerHook('typeChanged', { eagleId });
        return { success: true };
    }

    legendEagle(eagleId) {
        const eagle = this.eagles.get(eagleId);
        if (!eagle) return { success: false, error: 'EAGLE_NOT_FOUND' };
        eagle.status = 'legendary';
        this._triggerHook('eagleLegendized', { eagleId });
        return { success: true };
    }

    calculateEagleValue(eagleId) {
        const eagle = this.eagles.get(eagleId);
        if (!eagle) return 0;
        return eagle.level * 100 + eagle.keenness * 2 + eagle.feathers.length * 30;
    }

    deleteEagle(eagleId) {
        if (!this.eagles.has(eagleId)) return { success: false, error: 'EAGLE_NOT_FOUND' };
        this.eagles.delete(eagleId);
        this._triggerHook('eagleDeleted', { eagleId });
        return { success: true };
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
        if (this.stats.totalEagles < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxEagles += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { eagles: Array.from(this.eagles.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.eagles) this.eagles = new Map(data.eagles);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, eagleCount: this.eagles.size }; }
}
