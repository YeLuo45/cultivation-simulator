/**
 * CultivationAura.js - 修真灵气
 * V707 Iteration 30/30 FINAL Round 28
 */
export class CultivationAura {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxAuras: config.maxAuras || 50, baseResonance: config.baseResonance || 20, ...config };
        this.auras = new Map();
        this.metrics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAuras: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getAura', (ctx) => this.getAura(ctx.auraId));
        this.registerTool('getMetrics', (ctx) => this.getMetrics(ctx.auraId));
        this.registerTool('listByType', (ctx) => this.listByType(ctx.type));
    }

    emitAura(data) {
        const id = data.id || `aura_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const aura = { auraId: id, sourceId: data.sourceId || 'unknown', name: data.name || 'Unnamed Aura', type: data.type || 'spirit', resonance: data.resonance || this.config.baseResonance, emanations: data.emanations || [], level: data.level || 1, status: 'novice', emittedAt: Date.now(), lastRefresh: Date.now() };
        this.auras.set(id, aura);
        this.metrics.set(id, { resonance: 50, range: 30, intensity: 70 });
        this.stats.totalAuras++;
        this._triggerHook('auraEmitted', { auraId: id });
        return { success: true, aura };
    }

    getAura(id) { return this.auras.get(id) ? { ...this.auras.get(id) } : null; }
    listAuras() { return Array.from(this.auras.values()).map(a => ({ ...a })); }
    listByType(type) { return Array.from(this.auras.values()).filter(a => a.type === type).map(a => ({ ...a })); }
    listBySource(sourceId) { return Array.from(this.auras.values()).filter(a => a.sourceId === sourceId).map(a => ({ ...a })); }
    listByLevel(min) { return Array.from(this.auras.values()).filter(a => a.level >= min).map(a => ({ ...a })); }
    listLegendary() { return Array.from(this.auras.values()).filter(a => a.status === 'legendary').map(a => ({ ...a })); }
    listTop(n = 10) { return [...this.listAuras()].sort((a, b) => b.level - a.level).slice(0, n); }

    setMetrics(auraId, metrics) {
        const current = this.metrics.get(auraId);
        if (!current) return { success: false, error: 'AURA_NOT_FOUND' };
        this.metrics.set(auraId, { ...current, ...metrics, updatedAt: Date.now() });
        return { success: true };
    }

    getMetrics(auraId) { return this.metrics.get(auraId) ? { ...this.metrics.get(auraId) } : null; }

    refreshAura(auraId) {
        const aura = this.auras.get(auraId);
        if (!aura) return { success: false, error: 'AURA_NOT_FOUND' };
        aura.lastRefresh = Date.now();
        this._triggerHook('auraRefreshed', { auraId });
        return { success: true };
    }

    amplifyResonance(auraId, amount = 5) {
        const aura = this.auras.get(auraId);
        if (!aura) return { success: false, error: 'AURA_NOT_FOUND' };
        aura.resonance = Math.max(0, aura.resonance + amount);
        this._triggerHook('resonanceAmplified', { auraId });
        return { success: true };
    }

    addEmanation(auraId, emanation) {
        const aura = this.auras.get(auraId);
        if (!aura) return { success: false, error: 'AURA_NOT_FOUND' };
        aura.emanations.push(emanation);
        this._triggerHook('emanationAdded', { auraId });
        return { success: true };
    }

    promoteAura(auraId) {
        const aura = this.auras.get(auraId);
        if (!aura) return { success: false, error: 'AURA_NOT_FOUND' };
        aura.level++;
        this._triggerHook('auraPromoted', { auraId });
        return { success: true };
    }

    concentrateAura(auraId) {
        const aura = this.auras.get(auraId);
        if (!aura) return { success: false, error: 'AURA_NOT_FOUND' };
        aura.status = 'concentrated';
        this._triggerHook('auraConcentrated', { auraId });
        return { success: true };
    }

    projectAura(auraId) {
        const aura = this.auras.get(auraId);
        if (!aura) return { success: false, error: 'AURA_NOT_FOUND' };
        aura.status = 'projecting';
        this._triggerHook('auraProjected', { auraId });
        return { success: true };
    }

    legendAura(auraId) {
        const aura = this.auras.get(auraId);
        if (!aura) return { success: false, error: 'AURA_NOT_FOUND' };
        aura.status = 'legendary';
        this._triggerHook('auraLegendized', { auraId });
        return { success: true };
    }

    shiftType(auraId, newType) {
        const aura = this.auras.get(auraId);
        if (!aura) return { success: false, error: 'AURA_NOT_FOUND' };
        aura.type = newType;
        this._triggerHook('typeShifted', { auraId });
        return { success: true };
    }

    calculateAuraValue(auraId) {
        const aura = this.auras.get(auraId);
        if (!aura) return 0;
        return aura.level * 100 + aura.resonance * 2 + aura.emanations.length * 30;
    }

    mergeAuras(auraId, otherAuraId) {
        const aura = this.auras.get(auraId);
        const other = this.auras.get(otherAuraId);
        if (!aura || !other) return { success: false, error: 'AURA_NOT_FOUND' };
        aura.resonance = Math.max(aura.resonance, other.resonance);
        aura.emanations = [...aura.emanations, ...other.emanations];
        this.auras.delete(otherAuraId);
        this.metrics.delete(otherAuraId);
        this._triggerHook('aurasMerged', { auraId, otherAuraId });
        return { success: true };
    }

    deleteAura(auraId) {
        if (!this.auras.has(auraId)) return { success: false, error: 'AURA_NOT_FOUND' };
        this.auras.delete(auraId);
        this.metrics.delete(auraId);
        this._triggerHook('auraDeleted', { auraId });
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
        if (this.stats.totalAuras < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { auras: Array.from(this.auras.entries()), metrics: Array.from(this.metrics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.auras) this.auras = new Map(data.auras);
        if (data.metrics) this.metrics = new Map(data.metrics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, auraCount: this.auras.size }; }
}