/**
 * CultivationPath.js - 道路系统
 * V529 Iteration 11/20 Round 21 - Cultivation Path
 */

export class CultivationPath {
    constructor(config = {}) {
        this.config = { maxPaths: config.maxPaths || 50, baseInsight: config.baseInsight || 20, ...config };
        this.paths = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPaths: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPath', (ctx) => this.getPath(ctx.pathId));
        this.registerTool('openPath', (ctx) => this.openPath(ctx));
    }

    openPath(data) {
        const id = data.pathId || `path_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const path = {
            pathId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'Unnamed Path',
            type: data.type || 'sage',
            insight: data.insight || this.config.baseInsight,
            trials: data.trials || [],
            level: 1,
            status: 'open',
            createdAt: Date.now()
        };
        this.paths.set(id, path);
        this.stats.totalPaths++;
        this._triggerHook('pathOpened', { pathId: id });
        return { success: true, path };
    }

    getPath(id) { return this.paths.get(id) ? { ...this.paths.get(id) } : null; }
    listPaths() { return Array.from(this.paths.values()).map(p => ({ ...p })); }
    listByCultivator(cultivatorId) { return Array.from(this.paths.values()).filter(p => p.cultivatorId === cultivatorId).map(p => ({ ...p })); }
    listMastered() { return Array.from(this.paths.values()).filter(p => p.status === 'mastered').map(p => ({ ...p })); }

    addTrial(pathId, trial) {
        const path = this.paths.get(pathId);
        if (!path) return { success: false, error: 'PATH_NOT_FOUND' };
        path.trials.push(trial);
        this._triggerHook('trialAdded', { pathId, trial });
        return { success: true, path: { ...path } };
    }

    increaseInsight(pathId, amount = 5) {
        const path = this.paths.get(pathId);
        if (!path) return { success: false, error: 'PATH_NOT_FOUND' };
        path.insight += amount;
        this._triggerHook('insightIncreased', { pathId, newInsight: path.insight });
        return { success: true };
    }

    levelUpPath(pathId) {
        const path = this.paths.get(pathId);
        if (!path) return { success: false, error: 'PATH_NOT_FOUND' };
        path.level++;
        this._triggerHook('pathLeveledUp', { pathId, newLevel: path.level });
        return { success: true };
    }

    masterPath(pathId) {
        const path = this.paths.get(pathId);
        if (!path) return { success: false, error: 'PATH_NOT_FOUND' };
        path.status = 'mastered';
        this._triggerHook('pathMastered', { pathId });
        return { success: true };
    }

    calculatePathPower(pathId) {
        const path = this.paths.get(pathId);
        if (!path) return 0;
        return path.level * 100 + path.insight * 2 + path.trials.length * 30;
    }

    listByType(type) { return Array.from(this.paths.values()).filter(p => p.type === type).map(p => ({ ...p })); }
    listVisible() { return Array.from(this.paths.values()).filter(p => p.status === 'visible').map(p => ({ ...p })); }

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
        this.config.maxPaths += 30;
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
