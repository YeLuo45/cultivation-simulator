/**
 * CultivationAlgorithm.js - 修真算法系统
 * V575 Iteration 18/20 Round 23
 */
export class CultivationAlgorithm {
    constructor(config = {}) {
        this.config = { maxAlgorithms: config.maxAlgorithms || 50, baseComplexity: config.baseComplexity || 20, ...config };
        this.algorithms = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAlgorithms: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getAlgorithm', (ctx) => this.getAlgorithm(ctx.algorithmId));
        this.registerTool('designAlgorithm', (ctx) => this.designAlgorithm(ctx));
    }

    designAlgorithm(data) {
        const id = data.algorithmId || `algo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const algorithm = {
            algorithmId: id,
            authorId: data.authorId,
            name: data.name || 'Unnamed Algorithm',
            type: data.type || 'sort',
            complexity: data.complexity || this.config.baseComplexity,
            steps: data.steps || [],
            level: 1,
            status: 'draft',
            createdAt: Date.now()
        };
        this.algorithms.set(id, algorithm);
        this.stats.totalAlgorithms++;
        this._triggerHook('algorithmDesigned', { algorithmId: id });
        return { success: true, algorithm };
    }

    getAlgorithm(id) { return this.algorithms.get(id) ? { ...this.algorithms.get(id) } : null; }
    listAlgorithms() { return Array.from(this.algorithms.values()).map(a => ({ ...a })); }
    listByAuthor(authorId) { return Array.from(this.algorithms.values()).filter(a => a.authorId === authorId).map(a => ({ ...a })); }
    listByType(type) { return Array.from(this.algorithms.values()).filter(a => a.type === type).map(a => ({ ...a })); }
    listOptimal() { return Array.from(this.algorithms.values()).filter(a => a.status === 'optimal').map(a => ({ ...a })); }

    addStep(algorithmId, step) {
        const algorithm = this.algorithms.get(algorithmId);
        if (!algorithm) return { success: false, error: 'ALGORITHM_NOT_FOUND' };
        algorithm.steps.push(step);
        this._triggerHook('stepAdded', { algorithmId, step });
        return { success: true };
    }

    increaseComplexity(algorithmId, amount = 5) {
        const algorithm = this.algorithms.get(algorithmId);
        if (!algorithm) return { success: false, error: 'ALGORITHM_NOT_FOUND' };
        algorithm.complexity += amount;
        this._triggerHook('complexityIncreased', { algorithmId, newComplexity: algorithm.complexity });
        return { success: true };
    }

    levelUpAlgorithm(algorithmId) {
        const algorithm = this.algorithms.get(algorithmId);
        if (!algorithm) return { success: false, error: 'ALGORITHM_NOT_FOUND' };
        algorithm.level++;
        if (algorithm.status === 'draft') algorithm.status = 'tested';
        this._triggerHook('algorithmLeveledUp', { algorithmId, newLevel: algorithm.level });
        return { success: true };
    }

    optimalAlgorithm(algorithmId) {
        const algorithm = this.algorithms.get(algorithmId);
        if (!algorithm) return { success: false, error: 'ALGORITHM_NOT_FOUND' };
        algorithm.status = 'optimal';
        this._triggerHook('algorithmOptimized', { algorithmId });
        return { success: true };
    }

    calculateAlgorithmValue(algorithmId) {
        const algorithm = this.algorithms.get(algorithmId);
        if (!algorithm) return 0;
        return algorithm.level * 100 + algorithm.complexity * 2 + algorithm.steps.length * 30;
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
        if (this.stats.totalAlgorithms < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxAlgorithms += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { algorithms: Array.from(this.algorithms.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.algorithms) this.algorithms = new Map(data.algorithms);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, algorithmCount: this.algorithms.size }; }
}
