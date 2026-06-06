/**
 * CultivationSamurai.js - 修真武士
 * V617 Iteration 20/20 FINAL Round 25
 */
export class CultivationSamurai {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxSamurais: config.maxSamurais || 50, baseHonor: config.baseHonor || 30, ...config };
        this.samurais = new Map();
        this.metrics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSamurais: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSamurai', (ctx) => this.getSamurai(ctx.samuraiId));
        this.registerTool('getMetrics', (ctx) => this.getMetrics(ctx.samuraiId));
    }

    recruitSamurai(data) {
        const id = data.id || `sam_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const samurai = { samuraiId: id, senseiId: data.senseiId || 'unknown', name: data.name || 'Unnamed Samurai', type: data.type || 'katana', honor: data.honor || this.config.baseHonor, techniques: data.techniques || [], level: data.level || 1, status: 'novice', recruitedAt: Date.now(), lastRefresh: Date.now() };
        this.samurais.set(id, samurai);
        this.metrics.set(id, { honor: 50, discipline: 60, swordSkill: 75 });
        this.stats.totalSamurais++;
        this._triggerHook('samuraiRecruited', { samuraiId: id });
        return { success: true, samurai };
    }

    getSamurai(id) { return this.samurais.get(id) ? { ...this.samurais.get(id) } : null; }
    listSamurais() { return Array.from(this.samurais.values()).map(s => ({ ...s })); }
    listBySensei(senseiId) { return Array.from(this.samurais.values()).filter(s => s.senseiId === senseiId).map(s => ({ ...s })); }
    listByType(type) { return Array.from(this.samurais.values()).filter(s => s.type === type).map(s => ({ ...s })); }
    listByHonor(min) { return Array.from(this.samurais.values()).filter(s => s.honor >= min).map(s => ({ ...s })); }
    listTop(n = 10) { return [...this.listSamurais()].sort((a, b) => b.honor - a.honor).slice(0, n); }

    setMetrics(samuraiId, metrics) {
        const current = this.metrics.get(samuraiId);
        if (!current) return { success: false, error: 'SAMURAI_NOT_FOUND' };
        this.metrics.set(samuraiId, { ...current, ...metrics, updatedAt: Date.now() });
        return { success: true };
    }

    getMetrics(samuraiId) { return this.metrics.get(samuraiId) ? { ...this.metrics.get(samuraiId) } : null; }

    refreshSamurai(samuraiId) {
        const samurai = this.samurais.get(samuraiId);
        if (!samurai) return { success: false, error: 'SAMURAI_NOT_FOUND' };
        samurai.lastRefresh = Date.now();
        this._triggerHook('samuraiRefreshed', { samuraiId });
        return { success: true };
    }

    gainHonor(samuraiId, amount = 10) {
        const samurai = this.samurais.get(samuraiId);
        if (!samurai) return { success: false, error: 'SAMURAI_NOT_FOUND' };
        samurai.honor += amount;
        this._triggerHook('honorGained', { samuraiId });
        return { success: true };
    }

    addTechnique(samuraiId, technique) {
        const samurai = this.samurais.get(samuraiId);
        if (!samurai) return { success: false, error: 'SAMURAI_NOT_FOUND' };
        samurai.techniques.push(technique);
        this._triggerHook('techniqueAdded', { samuraiId });
        return { success: true };
    }

    promoteSamurai(samuraiId) {
        const samurai = this.samurais.get(samuraiId);
        if (!samurai) return { success: false, error: 'SAMURAI_NOT_FOUND' };
        samurai.level++;
        this._triggerHook('samuraiPromoted', { samuraiId });
        return { success: true };
    }

    trainSamurai(samuraiId) {
        const samurai = this.samurais.get(samuraiId);
        if (!samurai) return { success: false, error: 'SAMURAI_NOT_FOUND' };
        samurai.status = 'veteran';
        this._triggerHook('samuraiTrained', { samuraiId });
        return { success: true };
    }

    duelSamurai(samuraiId) {
        const samurai = this.samurais.get(samuraiId);
        if (!samurai) return { success: false, error: 'SAMURAI_NOT_FOUND' };
        samurai.status = 'dueling';
        this._triggerHook('samuraiDueling', { samuraiId });
        return { success: true };
    }

    legendSamurai(samuraiId) {
        const samurai = this.samurais.get(samuraiId);
        if (!samurai) return { success: false, error: 'SAMURAI_NOT_FOUND' };
        samurai.status = 'legendary';
        this._triggerHook('samuraiLegendized', { samuraiId });
        return { success: true };
    }

    changeType(samuraiId, newType) {
        const samurai = this.samurais.get(samuraiId);
        if (!samurai) return { success: false, error: 'SAMURAI_NOT_FOUND' };
        samurai.type = newType;
        this._triggerHook('typeChanged', { samuraiId });
        return { success: true };
    }

    calculateSamuraiValue(samuraiId) {
        const samurai = this.samurais.get(samuraiId);
        if (!samurai) return 0;
        return samurai.level * 100 + samurai.honor * 2 + samurai.techniques.length * 30;
    }

    deleteSamurai(samuraiId) {
        if (!this.samurais.has(samuraiId)) return { success: false, error: 'SAMURAI_NOT_FOUND' };
        this.samurais.delete(samuraiId);
        this.metrics.delete(samuraiId);
        this._triggerHook('samuraiDeleted', { samuraiId });
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
        if (this.stats.totalSamurais < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { samurais: Array.from(this.samurais.entries()), metrics: Array.from(this.metrics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.samurais) this.samurais = new Map(data.samurais);
        if (data.metrics) this.metrics = new Map(data.metrics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, samuraiCount: this.samurais.size }; }
}