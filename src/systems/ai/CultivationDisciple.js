/**
 * CultivationDisciple.js - 修真弟子
 * V663 Iteration 16/30 Round 27
 */
export class CultivationDisciple {
    constructor(config = {}) {
        this.config = { maxDisciples: config.maxDisciples || 50, baseProgress: config.baseProgress || 20, ...config };
        this.disciples = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDisciples: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDisciple', (ctx) => this.getDisciple(ctx.discipleId));
        this.registerTool('recruitDisciple', (ctx) => this.recruitDisciple(ctx));
    }

    recruitDisciple(data) {
        const id = data.discipleId || `dci_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const disciple = {
            discipleId: id,
            masterId: data.masterId,
            name: data.name || `Disciple-${id.slice(-5)}`,
            type: data.type || 'outer',
            progress: data.progress || this.config.baseProgress,
            tasks: data.tasks || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.disciples.set(id, disciple);
        this.stats.totalDisciples++;
        this._triggerHook('discipleRecruited', { discipleId: id });
        return { success: true, disciple };
    }

    getDisciple(id) { return this.disciples.get(id) ? { ...this.disciples.get(id) } : null; }
    listDisciples() { return Array.from(this.disciples.values()).map(d => ({ ...d })); }
    listByMaster(masterId) { return Array.from(this.disciples.values()).filter(d => d.masterId === masterId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.disciples.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addTask(discipleId, task) {
        const disciple = this.disciples.get(discipleId);
        if (!disciple) return { success: false, error: 'DISCIPLE_NOT_FOUND' };
        disciple.tasks.push(task);
        this._triggerHook('taskAdded', { discipleId, task });
        return { success: true, disciple: { ...disciple } };
    }

    deepenProgress(discipleId, amount = 5) {
        const disciple = this.disciples.get(discipleId);
        if (!disciple) return { success: false, error: 'DISCIPLE_NOT_FOUND' };
        disciple.progress += amount;
        this._triggerHook('progressDeepened', { discipleId, newProgress: disciple.progress });
        return { success: true, disciple: { ...disciple } };
    }

    levelUpDisciple(discipleId) {
        const disciple = this.disciples.get(discipleId);
        if (!disciple) return { success: false, error: 'DISCIPLE_NOT_FOUND' };
        disciple.level++;
        this._triggerHook('discipleLeveledUp', { discipleId, newLevel: disciple.level });
        return { success: true, disciple: { ...disciple } };
    }

    legendDisciple(discipleId) {
        const disciple = this.disciples.get(discipleId);
        if (!disciple) return { success: false, error: 'DISCIPLE_NOT_FOUND' };
        disciple.status = 'legendary';
        this._triggerHook('discipleLegendized', { discipleId });
        return { success: true, disciple: { ...disciple } };
    }

    calculateDiscipleValue(discipleId) {
        const disciple = this.disciples.get(discipleId);
        if (!disciple) return 0;
        return disciple.level * 100 + disciple.progress * 2 + disciple.tasks.length * 30;
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
        if (this.stats.totalDisciples < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDisciples += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { disciples: Array.from(this.disciples.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.disciples) this.disciples = new Map(data.disciples);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, discipleCount: this.disciples.size }; }
}
