/**
 * SectDashboard.js - 宗门仪表盘
 * V483 Iteration 15/15 FINAL Round 18
 */
export class SectDashboard {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxSects: config.maxSects || 50, baseStrength: config.baseStrength || 100, ...config };
        this.sects = new Map();
        this.metrics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSects: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSect', (ctx) => this.getSect(ctx.sectId));
        this.registerTool('getMetrics', (ctx) => this.getMetrics(ctx.sectId));
    }

    registerSect(data) {
        const id = data.id || `sd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const sect = { sectId: id, name: data.name || 'Unnamed Sect', founder: data.founder || 'unknown', disciples: data.disciples || 10, strength: data.strength || this.config.baseStrength, fame: data.fame || 0, resources: data.resources || 1000, status: 'active', foundedAt: Date.now(), lastRefresh: Date.now() };
        this.sects.set(id, sect);
        this.metrics.set(id, { cohesion: 80, prosperity: 70, daoHeart: 0, divineFavor: 50, reputation: 60 });
        this.stats.totalSects++;
        this._triggerHook('sectRegistered', { sectId: id });
        return { success: true, sect };
    }

    getSect(id) { return this.sects.get(id) ? { ...this.sects.get(id) } : null; }
    listSects() { return Array.from(this.sects.values()).map(s => ({ ...s })); }
    listByStatus(status) { return Array.from(this.sects.values()).filter(s => s.status === status).map(s => ({ ...s })); }
    listByFame(min) { return Array.from(this.sects.values()).filter(s => s.fame >= min).map(s => ({ ...s })); }
    listTop(n = 10) { return [...this.listSects()].sort((a, b) => b.strength - a.strength).slice(0, n); }

    setMetrics(sectId, metrics) {
        const current = this.metrics.get(sectId);
        if (!current) return { success: false, error: 'SECT_NOT_FOUND' };
        this.metrics.set(sectId, { ...current, ...metrics, updatedAt: Date.now() });
        return { success: true };
    }

    getMetrics(sectId) { return this.metrics.get(sectId) ? { ...this.metrics.get(sectId) } : null; }

    refreshSect(sectId) {
        const sect = this.sects.get(sectId);
        if (!sect) return { success: false, error: 'SECT_NOT_FOUND' };
        sect.lastRefresh = Date.now();
        this._triggerHook('sectRefreshed', { sectId });
        return { success: true };
    }

    recruitDisciple(sectId, count = 1) {
        const sect = this.sects.get(sectId);
        if (!sect) return { success: false, error: 'SECT_NOT_FOUND' };
        sect.disciples += count;
        this._triggerHook('discipleRecruited', { sectId, count });
        return { success: true };
    }

    trainDisciple(sectId, amount = 5) {
        const sect = this.sects.get(sectId);
        if (!sect) return { success: false, error: 'SECT_NOT_FOUND' };
        sect.strength += amount;
        this._triggerHook('discipleTrained', { sectId });
        return { success: true };
    }

    gatherResources(sectId, amount = 100) {
        const sect = this.sects.get(sectId);
        if (!sect) return { success: false, error: 'SECT_NOT_FOUND' };
        sect.resources += amount;
        this._triggerHook('resourcesGathered', { sectId });
        return { success: true };
    }

    spendResources(sectId, amount = 50) {
        const sect = this.sects.get(sectId);
        if (!sect) return { success: false, error: 'SECT_NOT_FOUND' };
        if (sect.resources < amount) return { success: false, error: 'INSUFFICIENT_RESOURCES' };
        sect.resources -= amount;
        this._triggerHook('resourcesSpent', { sectId });
        return { success: true };
    }

    promoteStrength(sectId, amount = 10) {
        const sect = this.sects.get(sectId);
        if (!sect) return { success: false, error: 'SECT_NOT_FOUND' };
        sect.strength += amount;
        this._triggerHook('strengthPromoted', { sectId });
        return { success: true };
    }

    disbandSect(sectId) {
        const sect = this.sects.get(sectId);
        if (!sect) return { success: false, error: 'SECT_NOT_FOUND' };
        sect.status = 'disbanded';
        this._triggerHook('sectDisbanded', { sectId });
        return { success: true };
    }

    calculateSectPower(sectId) {
        const sect = this.sects.get(sectId);
        if (!sect) return 0;
        return sect.strength + sect.disciples * 2 + Math.floor(sect.resources / 100);
    }

    deleteSect(sectId) {
        if (!this.sects.has(sectId)) return { success: false, error: 'SECT_NOT_FOUND' };
        this.sects.delete(sectId);
        this.metrics.delete(sectId);
        this._triggerHook('sectDeleted', { sectId });
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
        if (this.stats.totalSects < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { sects: Array.from(this.sects.entries()), metrics: Array.from(this.metrics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.sects) this.sects = new Map(data.sects);
        if (data.metrics) this.metrics = new Map(data.metrics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, sectCount: this.sects.size }; }
}