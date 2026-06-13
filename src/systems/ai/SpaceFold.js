/**
 * SpaceFold.js - 空间折叠
 * V434 Iteration 11/15 Round 15 - Space Fold
 *
 * 融合6大设计系统:
 * - generic-agent: 空间折叠自循环
 * - chatdev: 空间折叠角色协调
 * - nanobot: 空间折叠mesh
 * - claude-code: 空间折叠分析工具
 * - thunderbolt: 空间折叠持久化
 * - ruflo: 空间折叠Hook
 */

export class SpaceFold {
    constructor(config = {}) {
        this.config = { maxFolds: config.maxFolds || 100, baseDistance: config.baseDistance || 1000, ...config };
        this.folds = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFolds: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getFold', (ctx) => this.getFold(ctx.foldId));
        this.registerTool('createFold', (ctx) => this.createFold(ctx));
    }

    createFold(data) {
        const id = data.id || `fld_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const fold = {
            foldId: id,
            controllerId: data.controllerId,
            name: data.name || 'Space Fold',
            origin: data.origin || 'origin_point',
            target: data.target || 'target_point',
            distance: data.distance !== undefined ? data.distance : this.config.baseDistance,
            stability: data.stability !== undefined ? data.stability : 0,
            status: data.status || 'unstable',
            createdAt: Date.now()
        };
        this.folds.set(id, fold);
        this.stats.totalFolds++;
        this._triggerHook('foldCreated', { foldId: id });
        return { success: true, fold };
    }

    getFold(id) { return this.folds.get(id) ? { ...this.folds.get(id) } : null; }
    listFolds() { return Array.from(this.folds.values()).map(f => ({ ...f })); }
    listByController(controllerId) { return Array.from(this.folds.values()).filter(f => f.controllerId === controllerId).map(f => ({ ...f })); }
    listStable() { return Array.from(this.folds.values()).filter(f => f.status === 'stable').map(f => ({ ...f })); }

    stabilizeFold(foldId, amount = 5) {
        const fold = this.folds.get(foldId);
        if (!fold) return { success: false, error: 'FOLD_NOT_FOUND' };
        fold.stability += amount;
        this._triggerHook('foldStabilized', { foldId, newStability: fold.stability });
        return { success: true };
    }

    shortenDistance(foldId, amount = 2) {
        const fold = this.folds.get(foldId);
        if (!fold) return { success: false, error: 'FOLD_NOT_FOUND' };
        fold.distance = Math.max(0, fold.distance - amount);
        this._triggerHook('distanceShortened', { foldId, newDistance: fold.distance });
        return { success: true };
    }

    anchorFold(foldId) {
        const fold = this.folds.get(foldId);
        if (!fold) return { success: false, error: 'FOLD_NOT_FOUND' };
        fold.status = 'stable';
        this._triggerHook('foldAnchored', { foldId });
        return { success: true };
    }

    collapseFold(foldId) {
        const fold = this.folds.get(foldId);
        if (!fold) return { success: false, error: 'FOLD_NOT_FOUND' };
        fold.status = 'collapsed';
        this._triggerHook('foldCollapsed', { foldId });
        return { success: true };
    }

    calculateFoldingPower(foldId) {
        const fold = this.folds.get(foldId);
        if (!fold) return 0;
        return (1000 - fold.distance) * (1 + fold.stability / 100);
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
        if (this.stats.totalFolds < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxFolds += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { folds: Array.from(this.folds.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.folds) this.folds = new Map(data.folds);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, foldCount: this.folds.size }; }
}
