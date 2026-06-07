/**
 * CultivationYear.js - 修真年 (Cultivation Year system)
 * V824 Iteration 27/30 Round 32
 */
export class CultivationYear {
    constructor(config = {}) {
        this.config = { maxYears: config.maxYears || 20, baseDepth: config.baseDepth || 20, ...config };
        this.years = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalYears: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getYear', (ctx) => this.getYear(ctx.yearId));
        this.registerTool('recruitYear', (ctx) => this.recruitYear(ctx));
    }

    recruitYear(data) {
        const id = data.id || `yr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const year = {
            yearId: id,
            masterId: data.masterId,
            name: data.name || 'Cultivation Year',
            type: data.type || 'solar',
            depth: data.depth || this.config.baseDepth,
            months: data.months || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.years.set(id, year);
        this.stats.totalYears++;
        this._triggerHook('yearRecruited', { yearId: id });
        return { success: true, year };
    }

    getYear(id) { return this.years.get(id) ? { ...this.years.get(id), months: [...this.years.get(id).months] } : null; }
    listYears() { return Array.from(this.years.values()).map(y => ({ ...y, months: [...y.months] })); }
    listByMaster(masterId) { return Array.from(this.years.values()).filter(y => y.masterId === masterId).map(y => ({ ...y, months: [...y.months] })); }
    listLegendary() { return Array.from(this.years.values()).filter(y => y.status === 'legendary').map(y => ({ ...y, months: [...y.months] })); }

    addMonth(yearId, month) {
        const year = this.years.get(yearId);
        if (!year) return { success: false, error: 'YEAR_NOT_FOUND' };
        const m = typeof month === 'string' ? { name: month, timestamp: Date.now() } : { ...month, timestamp: month.timestamp || Date.now() };
        year.months.push(m);
        this._triggerHook('monthAdded', { yearId, month: m, monthCount: year.months.length });
        return { success: true, month: m };
    }

    raiseDepth(yearId, amount = 5) {
        const year = this.years.get(yearId);
        if (!year) return { success: false, error: 'YEAR_NOT_FOUND' };
        year.depth += amount;
        this._triggerHook('depthRaised', { yearId, amount, newDepth: year.depth });
        return { success: true };
    }

    levelUpYear(yearId) {
        const year = this.years.get(yearId);
        if (!year) return { success: false, error: 'YEAR_NOT_FOUND' };
        year.level++;
        this._triggerHook('yearLeveledUp', { yearId, newLevel: year.level });
        return { success: true };
    }

    legendYear(yearId) {
        const year = this.years.get(yearId);
        if (!year) return { success: false, error: 'YEAR_NOT_FOUND' };
        year.status = 'legendary';
        this._triggerHook('yearLegendized', { yearId });
        return { success: true };
    }

    calculateYearValue(yearId) {
        const year = this.years.get(yearId);
        if (!year) return 0;
        return year.level * 100 + year.depth * 2 + year.months.length * 30;
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
        if (this.stats.totalYears < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxYears += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { years: Array.from(this.years.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.years) this.years = new Map(data.years);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, yearCount: this.years.size }; }
}
