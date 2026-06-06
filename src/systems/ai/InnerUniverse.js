/**
 * InnerUniverse.js - 内在宇宙
 * V423 Iteration 15/15 FINAL Round 14
 */
export class InnerUniverse {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, basePlanets: config.basePlanets || 9, baseStars: config.baseStars || 108, ...config };
        this.universes = new Map();
        this.metrics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalUniverses: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getUniverse', (ctx) => this.getUniverse(ctx.universeId));
        this.registerTool('getMetrics', (ctx) => this.getMetrics(ctx.universeId));
    }

    createUniverse(data) {
        const id = data.id || `iu_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const universe = { universeId: id, name: data.name || 'Inner Universe', cultivatorId: data.cultivatorId, planets: data.planets || this.config.basePlanets, stars: data.stars || this.config.baseStars, dao: data.dao || 'none', realm: data.realm || 'mortal', createdAt: Date.now(), lastRefresh: Date.now() };
        this.universes.set(id, universe);
        this.metrics.set(id, { planets: universe.planets, stars: universe.stars, cultivations: 0, techniques: 0, treasures: 0, disciples: 0, realms: 0 });
        this.stats.totalUniverses++;
        this._triggerHook('universeCreated', { universeId: id });
        return { success: true, universe };
    }

    getUniverse(id) { return this.universes.get(id) ? { ...this.universes.get(id) } : null; }
    listUniverses() { return Array.from(this.universes.values()).map(u => ({ ...u })); }

    setMetrics(universeId, metrics) {
        const current = this.metrics.get(universeId);
        if (!current) return { success: false, error: 'UNIVERSE_NOT_FOUND' };
        this.metrics.set(universeId, { ...current, ...metrics, updatedAt: Date.now() });
        return { success: true };
    }

    getMetrics(universeId) { return this.metrics.get(universeId) ? { ...this.metrics.get(universeId) } : null; }

    refreshUniverse(universeId) {
        const universe = this.universes.get(universeId);
        if (!universe) return { success: false, error: 'UNIVERSE_NOT_FOUND' };
        universe.lastRefresh = Date.now();
        this._triggerHook('universeRefreshed', { universeId });
        return { success: true };
    }

    calculateUniverseSize(universeId) {
        const universe = this.universes.get(universeId);
        if (!universe) return null;
        return universe.planets * 1000 + universe.stars * 10;
    }

    calculateCultivationScore(universeId) {
        const m = this.getMetrics(universeId);
        if (!m) return 0;
        return m.cultivations * 5 + m.techniques * 3 + m.treasures * 2 + m.disciples + m.realms * 10;
    }

    deleteUniverse(universeId) {
        if (!this.universes.has(universeId)) return { success: false, error: 'UNIVERSE_NOT_FOUND' };
        this.universes.delete(universeId);
        this.metrics.delete(universeId);
        this._triggerHook('universeDeleted', { universeId });
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
        if (this.stats.totalUniverses < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { universes: Array.from(this.universes.entries()), metrics: Array.from(this.metrics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.universes) this.universes = new Map(data.universes);
        if (data.metrics) this.metrics = new Map(data.metrics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, universeCount: this.universes.size }; }
}