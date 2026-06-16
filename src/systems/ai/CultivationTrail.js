/**
 * CultivationTrail.js - 修真小径
 * V750 Iteration 13/30 Round 30
 */
export class CultivationTrail {
    constructor(config = {}) {
        this.config = { maxTrails: config.maxTrails || 20, baseWisdom: config.baseWisdom || 20, ...config };
        this.trails = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTrails: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTrail', (ctx) => this.getTrail(ctx.trailId));
        this.registerTool('recruitTrail', (ctx) => this.recruitTrail(ctx));
    }

    recruitTrail(data) {
        const id = data.trailId || `trl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const trail = {
            trailId: id,
            masterId: data.masterId,
            name: data.name,
            type: data.type || 'forest',
            wisdom: data.wisdom || this.config.baseWisdom,
            marks: data.marks || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.trails.set(id, trail);
        this.stats.totalTrails++;
        this._triggerHook('trailRecruited', { trailId: id });
        return { success: true, trail };
    }

    getTrail(id) { return this.trails.get(id) ? { ...this.trails.get(id) } : null; }
    listTrails() { return Array.from(this.trails.values()).map(t => ({ ...t })); }
    listByMaster(masterId) { return Array.from(this.trails.values()).filter(t => t.masterId === masterId).map(t => ({ ...t })); }
    listLegendary() { return Array.from(this.trails.values()).filter(t => t.status === 'legendary').map(t => ({ ...t })); }

    addMark(trailId, mark) {
        const trail = this.trails.get(trailId);
        if (!trail) return { success: false, error: 'TRAIL_NOT_FOUND' };
        trail.marks.push(mark);
        this._triggerHook('markAdded', { trailId, mark });
        return { success: true, trail: { ...trail } };
    }

    raiseWisdom(trailId, amount = 5) {
        const trail = this.trails.get(trailId);
        if (!trail) return { success: false, error: 'TRAIL_NOT_FOUND' };
        trail.wisdom += amount;
        this._triggerHook('wisdomRaised', { trailId, newWisdom: trail.wisdom });
        return { success: true, trail: { ...trail } };
    }

    levelUpTrail(trailId) {
        const trail = this.trails.get(trailId);
        if (!trail) return { success: false, error: 'TRAIL_NOT_FOUND' };
        trail.level++;
        this._triggerHook('trailLeveledUp', { trailId, newLevel: trail.level });
        return { success: true, trail: { ...trail } };
    }

    legendTrail(trailId) {
        const trail = this.trails.get(trailId);
        if (!trail) return { success: false, error: 'TRAIL_NOT_FOUND' };
        trail.status = 'legendary';
        this._triggerHook('trailLegendized', { trailId });
        return { success: true, trail: { ...trail } };
    }

    calculateTrailValue(trailId) {
        const trail = this.trails.get(trailId);
        if (!trail) return 0;
        return trail.level * 100 + trail.wisdom * 2 + trail.marks.length * 30;
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
        if (this.stats.totalTrails < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTrails += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { trails: Array.from(this.trails.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.trails) this.trails = new Map(data.trails);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, trailCount: this.trails.size }; }
}
