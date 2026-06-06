/**
 * CultivationCultivatorDashboard.js - 修真者仪表盘
 * V647 Iteration 30/30 FINAL Round 26
 */
export class CultivationCultivatorDashboard {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxCultivators: config.maxCultivators || 100, baseQi: config.baseQi || 50, ...config };
        this.cultivators = new Map();
        this.metrics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCultivators: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCultivator', (ctx) => this.getCultivator(ctx.cultivatorId));
        this.registerTool('getMetrics', (ctx) => this.getMetrics(ctx.cultivatorId));
        this.registerTool('listByType', (ctx) => this.listByType(ctx.type));
    }

    recruitCultivator(data) {
        const id = data.id || `cult_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cultivator = { cultivatorId: id, elderId: data.elderId || 'unknown', name: data.name || 'Unnamed Cultivator', type: data.type || 'dual', qi: data.qi || this.config.baseQi, realms: data.realms || [], level: data.level || 1, status: 'novice', recruitedAt: Date.now(), lastRefresh: Date.now() };
        this.cultivators.set(id, cultivator);
        this.metrics.set(id, { qi: 50, dao: 30, body: 40 });
        this.stats.totalCultivators++;
        this._triggerHook('cultivatorRecruited', { cultivatorId: id });
        return { success: true, cultivator };
    }

    getCultivator(id) { return this.cultivators.get(id) ? { ...this.cultivators.get(id) } : null; }
    listCultivators() { return Array.from(this.cultivators.values()).map(c => ({ ...c })); }
    listByType(type) { return Array.from(this.cultivators.values()).filter(c => c.type === type).map(c => ({ ...c })); }
    listByElder(elderId) { return Array.from(this.cultivators.values()).filter(c => c.elderId === elderId).map(c => ({ ...c })); }
    listByLevel(min) { return Array.from(this.cultivators.values()).filter(c => c.level >= min).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.cultivators.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }
    listTop(n = 10) { return [...this.listCultivators()].sort((a, b) => b.level - a.level).slice(0, n); }

    setMetrics(cultivatorId, metrics) {
        const current = this.metrics.get(cultivatorId);
        if (!current) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        this.metrics.set(cultivatorId, { ...current, ...metrics, updatedAt: Date.now() });
        return { success: true };
    }

    getMetrics(cultivatorId) { return this.metrics.get(cultivatorId) ? { ...this.metrics.get(cultivatorId) } : null; }

    refreshCultivator(cultivatorId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        cultivator.lastRefresh = Date.now();
        this._triggerHook('cultivatorRefreshed', { cultivatorId });
        return { success: true };
    }

    gainQi(cultivatorId, amount = 10) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        cultivator.qi += amount;
        this._triggerHook('qiGained', { cultivatorId });
        return { success: true };
    }

    addRealm(cultivatorId, realm) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        cultivator.realms.push(realm);
        this._triggerHook('realmAdded', { cultivatorId });
        return { success: true };
    }

    promoteCultivator(cultivatorId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        cultivator.level++;
        this._triggerHook('cultivatorPromoted', { cultivatorId });
        return { success: true };
    }

    trainCultivator(cultivatorId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        cultivator.status = 'veteran';
        this._triggerHook('cultivatorTrained', { cultivatorId });
        return { success: true };
    }

    tribulateCultivator(cultivatorId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        cultivator.status = 'tribulating';
        this._triggerHook('cultivatorTribulating', { cultivatorId });
        return { success: true };
    }

    legendCultivator(cultivatorId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        cultivator.status = 'legendary';
        this._triggerHook('cultivatorLegendized', { cultivatorId });
        return { success: true };
    }

    changeType(cultivatorId, newType) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        cultivator.type = newType;
        this._triggerHook('typeChanged', { cultivatorId });
        return { success: true };
    }

    calculateCultivatorValue(cultivatorId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return 0;
        return cultivator.level * 100 + cultivator.qi * 2 + cultivator.realms.length * 30;
    }

    deleteCultivator(cultivatorId) {
        if (!this.cultivators.has(cultivatorId)) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        this.cultivators.delete(cultivatorId);
        this.metrics.delete(cultivatorId);
        this._triggerHook('cultivatorDeleted', { cultivatorId });
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
        if (this.stats.totalCultivators < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { cultivators: Array.from(this.cultivators.entries()), metrics: Array.from(this.metrics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.cultivators) this.cultivators = new Map(data.cultivators);
        if (data.metrics) this.metrics = new Map(data.metrics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cultivatorCount: this.cultivators.size }; }
}