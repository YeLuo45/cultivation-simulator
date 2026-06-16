/**
 * CultivationPath.js - 修真道
 * V749 Iteration 12/30 Round 30
 */
export class CultivationPath {
    constructor(config = {}) {
        this.config = { maxPaths: config.maxPaths || 20, baseClarity: config.baseClarity || 20, ...config };
        this.paths = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPaths: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPath', (ctx) => this.getPath(ctx.pathId));
        this.registerTool('recruitPath', (ctx) => this.recruitPath(ctx));
    }

    recruitPath(data) {
        const id = data.pathId || `pth_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const path = {
            pathId: id,
            masterId: data.masterId,
            name: data.name,
            type: data.type || 'neutral',
            clarity: data.clarity || this.config.baseClarity,
            waypoints: data.waypoints || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.paths.set(id, path);
        this.stats.totalPaths++;
        this._triggerHook('pathRecruited', { pathId: id });
        return { success: true, path };
    }

    getPath(id) { return this.paths.get(id) ? { ...this.paths.get(id) } : null; }
    listPaths() { return Array.from(this.paths.values()).map(p => ({ ...p })); }
    listByMaster(masterId) { return Array.from(this.paths.values()).filter(p => p.masterId === masterId).map(p => ({ ...p })); }
    listLegendary() { return Array.from(this.paths.values()).filter(p => p.status === 'legendary').map(p => ({ ...p })); }

    addWaypoint(pathId, waypoint) {
        const path = this.paths.get(pathId);
        if (!path) return { success: false, error: 'PATH_NOT_FOUND' };
        path.waypoints.push(waypoint);
        this._triggerHook('waypointAdded', { pathId, waypoint });
        return { success: true, path: { ...path } };
    }

    raiseClarity(pathId, amount = 5) {
        const path = this.paths.get(pathId);
        if (!path) return { success: false, error: 'PATH_NOT_FOUND' };
        path.clarity += amount;
        this._triggerHook('clarityRaised', { pathId, newClarity: path.clarity });
        return { success: true, path: { ...path } };
    }

    levelUpPath(pathId) {
        const path = this.paths.get(pathId);
        if (!path) return { success: false, error: 'PATH_NOT_FOUND' };
        path.level++;
        this._triggerHook('pathLeveledUp', { pathId, newLevel: path.level });
        return { success: true, path: { ...path } };
    }

    legendPath(pathId) {
        const path = this.paths.get(pathId);
        if (!path) return { success: false, error: 'PATH_NOT_FOUND' };
        path.status = 'legendary';
        this._triggerHook('pathLegendized', { pathId });
        return { success: true, path: { ...path } };
    }

    calculatePathValue(pathId) {
        const path = this.paths.get(pathId);
        if (!path) return 0;
        return path.level * 100 + path.clarity * 2 + path.waypoints.length * 30;
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
        if (this.stats.totalPaths < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPaths += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { paths: Array.from(this.paths.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.paths) this.paths = new Map(data.paths);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, pathCount: this.paths.size }; }
}
