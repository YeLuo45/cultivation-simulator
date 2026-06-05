/**
 * Comprehension.js - 悟性系统
 * V343 Iteration 4/9 Round 7
 */
export class Comprehension {
    constructor(config = {}) {
        this.config = { maxComprehension: config.maxComprehension || 10, baseComprehension: config.baseComprehension || 1.0, ...config };
        this.cultivators = new Map();
        this.realizations = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCultivators: 0, totalRealizations: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCultivator', (ctx) => this.getCultivator(ctx.cultivatorId));
        this.registerTool('realizeTruth', (ctx) => this.realizeTruth(ctx.cultivatorId, ctx.truth));
    }

    registerCultivator(data) {
        const id = data.id || `cv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cultivator = { cultivatorId: id, name: data.name || 'Anonymous', comprehension: data.comprehension || this.config.baseComprehension, exp: 0, level: 1, realizedTruths: [] };
        this.cultivators.set(id, cultivator);
        this.stats.totalCultivators++;
        return { success: true, cultivator };
    }

    getCultivator(id) { return this.cultivators.get(id) ? { ...this.cultivators.get(id) } : null; }
    listCultivators() { return Array.from(this.cultivators.values()).map(c => ({ ...c })); }

    trainComprehension(cultivatorId, amount) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        cultivator.exp += amount;
        const newLevel = 1 + Math.floor(cultivator.exp / 100);
        const leveled = newLevel > cultivator.level;
        cultivator.level = newLevel;
        cultivator.comprehension = Math.min(this.config.maxComprehension, this.config.baseComprehension + newLevel * 0.1);
        this._triggerHook('comprehensionTrained', { cultivatorId, level: cultivator.level });
        if (leveled) this._triggerHook('levelUp', { cultivatorId, newLevel });
        return { success: true, cultivator: { ...cultivator }, leveledUp: leveled };
    }

    realizeTruth(cultivatorId, truth) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        const id = `rz_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const realization = { realizationId: id, cultivatorId, truth, realizedAt: Date.now() };
        this.realizations.set(id, realization);
        cultivator.realizedTruths.push(id);
        this.stats.totalRealizations++;
        this._triggerHook('truthRealized', { cultivatorId, realizationId: id });
        return { success: true, realization };
    }

    listRealizations(cultivatorId) {
        return Array.from(this.realizations.values()).filter(r => r.cultivatorId === cultivatorId).map(r => ({ ...r }));
    }

    calculateLearningRate(cultivatorId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return null;
        return Math.floor(cultivator.comprehension * 10);
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
        if (this.stats.totalRealizations < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseComprehension += 0.5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { cultivators: Array.from(this.cultivators.entries()), realizations: Array.from(this.realizations.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.cultivators) this.cultivators = new Map(data.cultivators);
        if (data.realizations) this.realizations = new Map(data.realizations);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cultivatorCount: this.cultivators.size, realizationCount: this.realizations.size }; }
}