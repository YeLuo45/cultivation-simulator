/**
 * ApprenticePath.js - 弟子之路
 * V476 Iteration 8/15 Round 18
 */
export class ApprenticePath {
    constructor(config = {}) {
        this.config = { maxPaths: config.maxPaths || 100, baseLessons: config.baseLessons || 0, ...config };
        this.paths = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPaths: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPath', (ctx) => this.getPath(ctx.pathId));
        this.registerTool('startPath', (ctx) => this.startPath(ctx));
    }

    startPath(data) {
        const id = data.pathId || `pth_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const path = {
            pathId: id,
            apprenticeId: data.apprenticeId,
            masterId: data.masterId,
            milestones: data.milestones || [],
            lessons: data.lessons || [],
            breakthroughs: data.breakthroughs || this.config.baseLessons,
            status: data.status || 'in-progress',
            createdAt: Date.now()
        };
        this.paths.set(id, path);
        this.stats.totalPaths++;
        this._triggerHook('pathStarted', { pathId: id });
        return { success: true, path };
    }

    getPath(id) { return this.paths.get(id) ? { ...this.paths.get(id) } : null; }
    listPaths() { return Array.from(this.paths.values()).map(p => ({ ...p })); }
    listByApprentice(apprenticeId) { return Array.from(this.paths.values()).filter(p => p.apprenticeId === apprenticeId).map(p => ({ ...p })); }
    listInProgress() { return Array.from(this.paths.values()).filter(p => p.status === 'in-progress').map(p => ({ ...p })); }

    addLesson(pathId, lesson) {
        const path = this.paths.get(pathId);
        if (!path) return { success: false, error: 'PATH_NOT_FOUND' };
        path.lessons.push(lesson);
        this._triggerHook('lessonAdded', { pathId, lesson });
        return { success: true, path: { ...path } };
    }

    achieveMilestone(pathId, milestone) {
        const path = this.paths.get(pathId);
        if (!path) return { success: false, error: 'PATH_NOT_FOUND' };
        path.milestones.push(milestone);
        this._triggerHook('milestoneAchieved', { pathId, milestone });
        return { success: true, path: { ...path } };
    }

    breakthrough(pathId) {
        const path = this.paths.get(pathId);
        if (!path) return { success: false, error: 'PATH_NOT_FOUND' };
        path.breakthroughs++;
        this._triggerHook('breakthroughReached', { pathId, newBreakthroughs: path.breakthroughs });
        return { success: true, path: { ...path } };
    }

    graduatePath(pathId) {
        const path = this.paths.get(pathId);
        if (!path) return { success: false, error: 'PATH_NOT_FOUND' };
        path.status = 'graduated';
        this._triggerHook('pathGraduated', { pathId });
        return { success: true, path: { ...path } };
    }

    calculateGrowthScore(pathId) {
        const path = this.paths.get(pathId);
        if (!path) return 0;
        return path.lessons.length * 5 + path.milestones.length * 20 + path.breakthroughs * 50;
    }

    listGraduated() { return Array.from(this.paths.values()).filter(p => p.status === 'graduated').map(p => ({ ...p })); }

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
        this.config.maxPaths += 50;
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
