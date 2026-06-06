/**
 * SkyCultivation.js - 天空修炼
 * V468 Iteration 15/15 FINAL Round 17
 */
export class SkyCultivation {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxClouds: config.maxClouds || 100, baseAltitude: config.baseAltitude || 1000, ...config };
        this.cultivations = new Map();
        this.metrics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCultivations: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCultivation', (ctx) => this.getCultivation(ctx.cultivationId));
        this.registerTool('getMetrics', (ctx) => this.getMetrics(ctx.cultivationId));
    }

    startCultivation(data) {
        const id = data.id || `sc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cultivation = { cultivationId: id, name: data.name || 'Sky Cultivation', cultivatorId: data.cultivatorId, altitude: data.altitude || this.config.baseAltitude, wind: data.wind || 30, clouds: data.clouds || 5, stars: data.stars || 12, status: 'ascending', startedAt: Date.now(), lastRefresh: Date.now() };
        this.cultivations.set(id, cultivation);
        this.metrics.set(id, { clarity: 50, dao: 0, qi: 30, lightning: 0, harmony: 100 });
        this.stats.totalCultivations++;
        this._triggerHook('cultivationStarted', { cultivationId: id });
        return { success: true, cultivation };
    }

    getCultivation(id) { return this.cultivations.get(id) ? { ...this.cultivations.get(id) } : null; }
    listCultivations() { return Array.from(this.cultivations.values()).map(c => ({ ...c })); }
    listByCultivator(cultivatorId) { return Array.from(this.cultivations.values()).filter(c => c.cultivatorId === cultivatorId).map(c => ({ ...c })); }
    listByStatus(status) { return Array.from(this.cultivations.values()).filter(c => c.status === status).map(c => ({ ...c })); }

    setMetrics(cultivationId, metrics) {
        const current = this.metrics.get(cultivationId);
        if (!current) return { success: false, error: 'CULTIVATION_NOT_FOUND' };
        this.metrics.set(cultivationId, { ...current, ...metrics, updatedAt: Date.now() });
        return { success: true };
    }

    getMetrics(cultivationId) { return this.metrics.get(cultivationId) ? { ...this.metrics.get(cultivationId) } : null; }

    refreshCultivation(cultivationId) {
        const cultivation = this.cultivations.get(cultivationId);
        if (!cultivation) return { success: false, error: 'CULTIVATION_NOT_FOUND' };
        cultivation.lastRefresh = Date.now();
        this._triggerHook('cultivationRefreshed', { cultivationId });
        return { success: true };
    }

    ascendHigher(cultivationId, amount = 100) {
        const cultivation = this.cultivations.get(cultivationId);
        if (!cultivation) return { success: false, error: 'CULTIVATION_NOT_FOUND' };
        cultivation.altitude += amount;
        this._triggerHook('cultivationAscended', { cultivationId, altitude: cultivation.altitude });
        return { success: true };
    }

    gatherWind(cultivationId, amount = 5) {
        const cultivation = this.cultivations.get(cultivationId);
        if (!cultivation) return { success: false, error: 'CULTIVATION_NOT_FOUND' };
        cultivation.wind += amount;
        this._triggerHook('windGathered', { cultivationId });
        return { success: true };
    }

    collectCloud(cultivationId) {
        const cultivation = this.cultivations.get(cultivationId);
        if (!cultivation) return { success: false, error: 'CULTIVATION_NOT_FOUND' };
        cultivation.clouds++;
        this._triggerHook('cloudCollected', { cultivationId });
        return { success: true };
    }

    summonStar(cultivationId) {
        const cultivation = this.cultivations.get(cultivationId);
        if (!cultivation) return { success: false, error: 'CULTIVATION_NOT_FOUND' };
        cultivation.stars++;
        this._triggerHook('starSummoned', { cultivationId });
        return { success: true };
    }

    completeCultivation(cultivationId) {
        const cultivation = this.cultivations.get(cultivationId);
        if (!cultivation) return { success: false, error: 'CULTIVATION_NOT_FOUND' };
        cultivation.status = 'completed';
        this._triggerHook('cultivationCompleted', { cultivationId });
        return { success: true };
    }

    calculateSkyPower(cultivationId) {
        const cultivation = this.cultivations.get(cultivationId);
        if (!cultivation) return 0;
        return cultivation.altitude / 10 + cultivation.wind + cultivation.clouds * 5 + cultivation.stars * 3;
    }

    deleteCultivation(cultivationId) {
        if (!this.cultivations.has(cultivationId)) return { success: false, error: 'CULTIVATION_NOT_FOUND' };
        this.cultivations.delete(cultivationId);
        this.metrics.delete(cultivationId);
        this._triggerHook('cultivationDeleted', { cultivationId });
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
        if (this.stats.totalCultivations < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { cultivations: Array.from(this.cultivations.entries()), metrics: Array.from(this.metrics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.cultivations) this.cultivations = new Map(data.cultivations);
        if (data.metrics) this.metrics = new Map(data.metrics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cultivationCount: this.cultivations.size }; }
}