/**
 * SectCultureDashboard.js - 宗门文化仪表盘
 * V498 Iteration 15/15 FINAL Round 19
 */
export class SectCultureDashboard {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxCultures: config.maxCultures || 30, baseWisdom: config.baseWisdom || 50, ...config };
        this.cultures = new Map();
        this.metrics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCultures: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCulture', (ctx) => this.getCulture(ctx.cultureId));
        this.registerTool('getMetrics', (ctx) => this.getMetrics(ctx.cultureId));
    }

    registerCulture(data) {
        const id = data.id || `sc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const culture = { cultureId: id, name: data.name || 'Unnamed Culture', sectId: data.sectId || 'unknown', wisdom: data.wisdom || this.config.baseWisdom, philosophy: data.philosophy || 'balance', traditions: data.traditions || [], status: 'thriving', createdAt: Date.now(), lastRefresh: Date.now() };
        this.cultures.set(id, culture);
        this.metrics.set(id, { harmony: 75, prosperity: 70, disciples: 0, legacy: 50 });
        this.stats.totalCultures++;
        this._triggerHook('cultureRegistered', { cultureId: id });
        return { success: true, culture };
    }

    getCulture(id) { return this.cultures.get(id) ? { ...this.cultures.get(id) } : null; }
    listCultures() { return Array.from(this.cultures.values()).map(c => ({ ...c })); }
    listBySect(sectId) { return Array.from(this.cultures.values()).filter(c => c.sectId === sectId).map(c => ({ ...c })); }
    listByStatus(status) { return Array.from(this.cultures.values()).filter(c => c.status === status).map(c => ({ ...c })); }
    listByPhilosophy(philosophy) { return Array.from(this.cultures.values()).filter(c => c.philosophy === philosophy).map(c => ({ ...c })); }

    setMetrics(cultureId, metrics) {
        const current = this.metrics.get(cultureId);
        if (!current) return { success: false, error: 'CULTURE_NOT_FOUND' };
        this.metrics.set(cultureId, { ...current, ...metrics, updatedAt: Date.now() });
        return { success: true };
    }

    getMetrics(cultureId) { return this.metrics.get(cultureId) ? { ...this.metrics.get(cultureId) } : null; }

    refreshCulture(cultureId) {
        const culture = this.cultures.get(cultureId);
        if (!culture) return { success: false, error: 'CULTURE_NOT_FOUND' };
        culture.lastRefresh = Date.now();
        this._triggerHook('cultureRefreshed', { cultureId });
        return { success: true };
    }

    gainWisdom(cultureId, amount = 10) {
        const culture = this.cultures.get(cultureId);
        if (!culture) return { success: false, error: 'CULTURE_NOT_FOUND' };
        culture.wisdom += amount;
        this._triggerHook('wisdomGained', { cultureId });
        return { success: true };
    }

    addTradition(cultureId, tradition) {
        const culture = this.cultures.get(cultureId);
        if (!culture) return { success: false, error: 'CULTURE_NOT_FOUND' };
        culture.traditions.push(tradition);
        this._triggerHook('traditionAdded', { cultureId });
        return { success: true };
    }

    convertPhilosophy(cultureId, newPhilosophy) {
        const culture = this.cultures.get(cultureId);
        if (!culture) return { success: false, error: 'CULTURE_NOT_FOUND' };
        culture.philosophy = newPhilosophy;
        this._triggerHook('philosophyConverted', { cultureId });
        return { success: true };
    }

    recruitDisciple(cultureId, count = 1) {
        const culture = this.cultures.get(cultureId);
        if (!culture) return { success: false, error: 'CULTURE_NOT_FOUND' };
        const metrics = this.metrics.get(cultureId);
        if (metrics) metrics.disciples += count;
        this._triggerHook('discipleRecruited', { cultureId, count });
        return { success: true };
    }

    calculateCulturalPower(cultureId) {
        const culture = this.cultures.get(cultureId);
        if (!culture) return 0;
        return culture.wisdom * 2 + culture.traditions.length * 10;
    }

    archiveCulture(cultureId) {
        const culture = this.cultures.get(cultureId);
        if (!culture) return { success: false, error: 'CULTURE_NOT_FOUND' };
        culture.status = 'archived';
        this._triggerHook('cultureArchived', { cultureId });
        return { success: true };
    }

    deleteCulture(cultureId) {
        if (!this.cultures.has(cultureId)) return { success: false, error: 'CULTURE_NOT_FOUND' };
        this.cultures.delete(cultureId);
        this.metrics.delete(cultureId);
        this._triggerHook('cultureDeleted', { cultureId });
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
        if (this.stats.totalCultures < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { cultures: Array.from(this.cultures.entries()), metrics: Array.from(this.metrics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.cultures) this.cultures = new Map(data.cultures);
        if (data.metrics) this.metrics = new Map(data.metrics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cultureCount: this.cultures.size }; }
}