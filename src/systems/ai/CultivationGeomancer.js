/**
 * CultivationGeomancer.js - 修真土系师
 * V631 Iteration 14/30 Round 26
 */
export class CultivationGeomancer {
    constructor(config = {}) {
        this.config = { maxGeomancers: config.maxGeomancers || 50, baseStability: config.baseStability || 20, ...config };
        this.geomancers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGeomancers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getGeomancer', (ctx) => this.getGeomancer(ctx.geomancerId));
        this.registerTool('recruitGeomancer', (ctx) => this.recruitGeomancer(ctx));
    }

    recruitGeomancer(data = {}) {
        const id = data.id || `geo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const validTypes = ['earth', 'crystal', 'sand'];
        const type = data.type || 'earth';
        if (!validTypes.includes(type)) return { success: false, error: 'INVALID_TYPE' };
        const geomancer = {
            geomancerId: id,
            mentorId: data.mentorId || null,
            name: data.name || 'Geomancer',
            type,
            stability: data.stability != null ? data.stability : this.config.baseStability,
            formations: [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.geomancers.set(id, geomancer);
        this.stats.totalGeomancers++;
        this._triggerHook('geomancerRecruited', { geomancerId: id, name: geomancer.name });
        return { success: true, geomancer };
    }

    getGeomancer(id) { return this.geomancers.get(id) ? { ...this.geomancers.get(id) } : null; }
    listGeomancers() { return Array.from(this.geomancers.values()).map(g => ({ ...g })); }
    listByMentor(mentorId) { return Array.from(this.geomancers.values()).filter(g => g.mentorId === mentorId).map(g => ({ ...g })); }
    listLegendary() { return Array.from(this.geomancers.values()).filter(g => g.status === 'legendary').map(g => ({ ...g })); }

    addFormation(geomancerId, formation) {
        const geomancer = this.geomancers.get(geomancerId);
        if (!geomancer) return { success: false, error: 'GEOMANCER_NOT_FOUND' };
        geomancer.formations.push(formation);
        this._triggerHook('formationAdded', { geomancerId, formation });
        return { success: true };
    }

    increaseStability(geomancerId, amount = 5) {
        const geomancer = this.geomancers.get(geomancerId);
        if (!geomancer) return { success: false, error: 'GEOMANCER_NOT_FOUND' };
        geomancer.stability += amount;
        if (geomancer.stability >= 100) geomancer.status = 'veteran';
        this._triggerHook('stabilityIncreased', { geomancerId, newStability: geomancer.stability });
        return { success: true };
    }

    levelUpGeomancer(geomancerId) {
        const geomancer = this.geomancers.get(geomancerId);
        if (!geomancer) return { success: false, error: 'GEOMANCER_NOT_FOUND' };
        geomancer.level++;
        this._triggerHook('geomancerLeveledUp', { geomancerId, newLevel: geomancer.level });
        return { success: true };
    }

    legendGeomancer(geomancerId) {
        const geomancer = this.geomancers.get(geomancerId);
        if (!geomancer) return { success: false, error: 'GEOMANCER_NOT_FOUND' };
        geomancer.status = 'legendary';
        this._triggerHook('geomancerLegendized', { geomancerId });
        return { success: true };
    }

    calculateGeomancerValue(geomancerId) {
        const geomancer = this.geomancers.get(geomancerId);
        if (!geomancer) return 0;
        return geomancer.level * 100 + geomancer.stability * 2 + geomancer.formations.length * 30;
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
        if (this.stats.totalGeomancers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxGeomancers += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { geomancers: Array.from(this.geomancers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.geomancers) this.geomancers = new Map(data.geomancers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, geomancerCount: this.geomancers.size }; }
}
