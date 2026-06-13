/**
 * CultivationRally.js - 修真集结
 * V737 Iteration 30/30 FINAL Round 29
 */
export class CultivationRally {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxRallies: config.maxRallies || 50, baseMorale: config.baseMorale || 20, ...config };
        this.rallies = new Map();
        this.metrics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRallies: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRally', (ctx) => this.getRally(ctx.rallyId));
        this.registerTool('getMetrics', (ctx) => this.getMetrics(ctx.rallyId));
        this.registerTool('listByType', (ctx) => this.listByType(ctx.type));
    }

    summonRally(data) {
        const id = data.id || `rally_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const rally = { rallyId: id, commanderId: data.commanderId || 'unknown', name: data.name || 'Unnamed Rally', type: data.type || 'banner', morale: data.morale || this.config.baseMorale, banners: data.banners || [], level: data.level || 1, status: 'novice', summonedAt: Date.now(), lastRefresh: Date.now() };
        this.rallies.set(id, rally);
        this.metrics.set(id, { morale: 50, range: 30, intensity: 70 });
        this.stats.totalRallies++;
        this._triggerHook('rallySummoned', { rallyId: id });
        return { success: true, rally };
    }

    getRally(id) { return this.rallies.get(id) ? { ...this.rallies.get(id) } : null; }
    listRallies() { return Array.from(this.rallies.values()).map(r => ({ ...r })); }
    listByType(type) { return Array.from(this.rallies.values()).filter(r => r.type === type).map(r => ({ ...r })); }
    listByCommander(commanderId) { return Array.from(this.rallies.values()).filter(r => r.commanderId === commanderId).map(r => ({ ...r })); }
    listByLevel(min) { return Array.from(this.rallies.values()).filter(r => r.level >= min).map(r => ({ ...r })); }
    listLegendary() { return Array.from(this.rallies.values()).filter(r => r.status === 'legendary').map(r => ({ ...r })); }
    listTop(n = 10) { return [...this.listRallies()].sort((a, b) => b.level - a.level).slice(0, n); }

    setMetrics(rallyId, metrics) {
        const current = this.metrics.get(rallyId);
        if (!current) return { success: false, error: 'RALLY_NOT_FOUND' };
        this.metrics.set(rallyId, { ...current, ...metrics, updatedAt: Date.now() });
        return { success: true };
    }

    getMetrics(rallyId) { return this.metrics.get(rallyId) ? { ...this.metrics.get(rallyId) } : null; }

    refreshRally(rallyId) {
        const rally = this.rallies.get(rallyId);
        if (!rally) return { success: false, error: 'RALLY_NOT_FOUND' };
        rally.lastRefresh = Date.now();
        this._triggerHook('rallyRefreshed', { rallyId });
        return { success: true };
    }

    boostMorale(rallyId, amount = 5) {
        const rally = this.rallies.get(rallyId);
        if (!rally) return { success: false, error: 'RALLY_NOT_FOUND' };
        rally.morale = Math.max(0, rally.morale + amount);
        this._triggerHook('moraleBoosted', { rallyId });
        return { success: true };
    }

    addBanner(rallyId, banner) {
        const rally = this.rallies.get(rallyId);
        if (!rally) return { success: false, error: 'RALLY_NOT_FOUND' };
        rally.banners.push(banner);
        this._triggerHook('bannerAdded', { rallyId });
        return { success: true };
    }

    promoteRally(rallyId) {
        const rally = this.rallies.get(rallyId);
        if (!rally) return { success: false, error: 'RALLY_NOT_FOUND' };
        rally.level++;
        this._triggerHook('rallyPromoted', { rallyId });
        return { success: true };
    }

    marchRally(rallyId) {
        const rally = this.rallies.get(rallyId);
        if (!rally) return { success: false, error: 'RALLY_NOT_FOUND' };
        rally.status = 'marching';
        this._triggerHook('rallyMarched', { rallyId });
        return { success: true };
    }

    holdRally(rallyId) {
        const rally = this.rallies.get(rallyId);
        if (!rally) return { success: false, error: 'RALLY_NOT_FOUND' };
        rally.status = 'holding';
        this._triggerHook('rallyHolding', { rallyId });
        return { success: true };
    }

    legendRally(rallyId) {
        const rally = this.rallies.get(rallyId);
        if (!rally) return { success: false, error: 'RALLY_NOT_FOUND' };
        rally.status = 'legendary';
        this._triggerHook('rallyLegendized', { rallyId });
        return { success: true };
    }

    shiftType(rallyId, newType) {
        const rally = this.rallies.get(rallyId);
        if (!rally) return { success: false, error: 'RALLY_NOT_FOUND' };
        rally.type = newType;
        this._triggerHook('typeShifted', { rallyId });
        return { success: true };
    }

    calculateRallyValue(rallyId) {
        const rally = this.rallies.get(rallyId);
        if (!rally) return 0;
        return rally.level * 100 + rally.morale * 2 + rally.banners.length * 30;
    }

    mergeRallies(rallyId, otherRallyId) {
        const rally = this.rallies.get(rallyId);
        const other = this.rallies.get(otherRallyId);
        if (!rally || !other) return { success: false, error: 'RALLY_NOT_FOUND' };
        rally.morale = Math.max(rally.morale, other.morale);
        rally.banners = [...rally.banners, ...other.banners];
        this.rallies.delete(otherRallyId);
        this.metrics.delete(otherRallyId);
        this._triggerHook('ralliesMerged', { rallyId, otherRallyId });
        return { success: true };
    }

    deleteRally(rallyId) {
        if (!this.rallies.has(rallyId)) return { success: false, error: 'RALLY_NOT_FOUND' };
        this.rallies.delete(rallyId);
        this.metrics.delete(rallyId);
        this._triggerHook('rallyDeleted', { rallyId });
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
        if (this.stats.totalRallies < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { rallies: Array.from(this.rallies.entries()), metrics: Array.from(this.metrics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.rallies) this.rallies = new Map(data.rallies);
        if (data.metrics) this.metrics = new Map(data.metrics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, rallyCount: this.rallies.size }; }
}