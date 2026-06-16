/**
 * CultivationSpearSaint.js - 修真枪圣
 * V636 Iteration 19/30 Round 26
 */
export class CultivationSpearSaint {
    constructor(config = {}) {
        this.config = { maxSpearSaints: config.maxSpearSaints || 20, basePrecision: config.basePrecision || 20, ...config };
        this.spearsaints = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSpearSaints: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSpearSaint', (ctx) => this.getSpearSaint(ctx.spearSaintId));
        this.registerTool('recruitSpearSaint', (ctx) => this.recruitSpearSaint(ctx));
    }

    recruitSpearSaint(data) {
        const id = data.id || `sst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const spearsaint = {
            saintId: id,
            mentorId: data.mentorId,
            name: data.name || 'SpearSaint',
            type: data.type || 'iron',
            precision: data.precision || this.config.basePrecision,
            spears: data.spears || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.spearsaints.set(id, spearsaint);
        this.stats.totalSpearSaints++;
        this._triggerHook('spearSaintRecruited', { spearSaintId: id });
        return { success: true, spearsaint };
    }

    getSpearSaint(id) { return this.spearsaints.get(id) ? { ...this.spearsaints.get(id) } : null; }
    listSpearSaints() { return Array.from(this.spearsaints.values()).map(s => ({ ...s })); }
    listByMentor(mentorId) { return Array.from(this.spearsaints.values()).filter(s => s.mentorId === mentorId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.spearsaints.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addSpear(spearSaintId, spear) {
        const spearsaint = this.spearsaints.get(spearSaintId);
        if (!spearsaint) return { success: false, error: 'SPEARSAINT_NOT_FOUND' };
        spearsaint.spears.push(spear);
        this._triggerHook('spearAdded', { spearSaintId, spear });
        return { success: true };
    }

    sharpenPrecision(spearSaintId, amount = 5) {
        const spearsaint = this.spearsaints.get(spearSaintId);
        if (!spearsaint) return { success: false, error: 'SPEARSAINT_NOT_FOUND' };
        spearsaint.precision += amount;
        this._triggerHook('precisionSharpened', { spearSaintId, newPrecision: spearsaint.precision });
        return { success: true };
    }

    levelUpSpearSaint(spearSaintId) {
        const spearsaint = this.spearsaints.get(spearSaintId);
        if (!spearsaint) return { success: false, error: 'SPEARSAINT_NOT_FOUND' };
        spearsaint.level++;
        this._triggerHook('spearSaintLeveledUp', { spearSaintId, newLevel: spearsaint.level });
        return { success: true };
    }

    legendSpearSaint(spearSaintId) {
        const spearsaint = this.spearsaints.get(spearSaintId);
        if (!spearsaint) return { success: false, error: 'SPEARSAINT_NOT_FOUND' };
        spearsaint.status = 'legendary';
        this._triggerHook('spearSaintLegendized', { spearSaintId });
        return { success: true };
    }

    calculateSpearSaintValue(spearSaintId) {
        const spearsaint = this.spearsaints.get(spearSaintId);
        if (!spearsaint) return 0;
        return spearsaint.level * 100 + spearsaint.precision * 2 + spearsaint.spears.length * 30;
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
        if (this.stats.totalSpearSaints < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSpearSaints += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { spearsaints: Array.from(this.spearsaints.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.spearsaints) this.spearsaints = new Map(data.spearsaints);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, spearSaintCount: this.spearsaints.size }; }
}
