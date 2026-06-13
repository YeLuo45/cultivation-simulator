/**
 * CultivationScale.js - 修真音阶系统
 * V792 Iteration 25/30 Round 31
 */
export class CultivationScale {
    constructor(config = {}) {
        this.config = { maxScales: config.maxScales || 20, basePurity: config.basePurity || 20, ...config };
        this.scales = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalScales: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getScale', (ctx) => this.getScale(ctx.scaleId));
        this.registerTool('recruitScale', (ctx) => this.recruitScale(ctx));
    }

    recruitScale(data) {
        if (this.scales.size >= this.config.maxScales) {
            return { success: false, error: 'MAX_SCALES_REACHED' };
        }
        const id = data.scaleId || `scl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const scale = {
            scaleId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed-scale',
            type: data.type || 'major',
            purity: data.purity !== undefined ? data.purity : this.config.basePurity,
            degrees: data.degrees || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.scales.set(id, scale);
        this.stats.totalScales++;
        this._triggerHook('scaleRecruited', { scaleId: id, masterId: scale.masterId });
        return { success: true, scale };
    }

    getScale(id) { return this.scales.get(id) ? { ...this.scales.get(id) } : null; }
    listScales() { return Array.from(this.scales.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.scales.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.scales.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addDegree(scaleId, degree) {
        const scale = this.scales.get(scaleId);
        if (!scale) return { success: false, error: 'SCALE_NOT_FOUND' };
        scale.degrees.push(degree);
        this._triggerHook('degreeAdded', { scaleId, degree, degrees: scale.degrees.length });
        return { success: true };
    }

    raisePurity(scaleId, amount = 5) {
        const scale = this.scales.get(scaleId);
        if (!scale) return { success: false, error: 'SCALE_NOT_FOUND' };
        scale.purity += amount;
        this._triggerHook('purityRaised', { scaleId, newPurity: scale.purity });
        return { success: true };
    }

    levelUpScale(scaleId) {
        const scale = this.scales.get(scaleId);
        if (!scale) return { success: false, error: 'SCALE_NOT_FOUND' };
        scale.level++;
        this._triggerHook('scaleLeveledUp', { scaleId, newLevel: scale.level });
        return { success: true };
    }

    legendScale(scaleId) {
        const scale = this.scales.get(scaleId);
        if (!scale) return { success: false, error: 'SCALE_NOT_FOUND' };
        scale.status = 'legendary';
        this._triggerHook('scaleLegendized', { scaleId });
        return { success: true };
    }

    calculateScaleValue(scaleId) {
        const scale = this.scales.get(scaleId);
        if (!scale) return 0;
        return scale.level * 100 + scale.purity * 2 + scale.degrees.length * 30;
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
        if (this.stats.totalScales < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxScales += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { scales: Array.from(this.scales.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.scales) this.scales = new Map(data.scales);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, scaleCount: this.scales.size }; }
}
