/**
 * CultivationMonth.js - 修真月 (Cultivation Month system)
 * V823 Iteration 26/30 Round 32
 */
export class CultivationMonth {
    constructor(config = {}) {
        this.config = { maxMonths: config.maxMonths || 20, basePhases: config.basePhases || 20, ...config };
        this.months = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMonths: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMonth', (ctx) => this.getMonth(ctx.monthId));
        this.registerTool('recruitMonth', (ctx) => this.recruitMonth(ctx));
    }

    recruitMonth(data) {
        const id = data.id || `cmo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const month = {
            monthId: id,
            masterId: data.masterId,
            name: data.name || 'Cultivation Month',
            type: data.type || 'lunar',
            phases: data.phases || this.config.basePhases,
            weeks: data.weeks || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.months.set(id, month);
        this.stats.totalMonths++;
        this._triggerHook('monthRecruited', { monthId: id });
        return { success: true, month };
    }

    getMonth(id) { return this.months.get(id) ? { ...this.months.get(id), weeks: [...this.months.get(id).weeks] } : null; }
    listMonths() { return Array.from(this.months.values()).map(m => ({ ...m, weeks: [...m.weeks] })); }
    listByMaster(masterId) { return Array.from(this.months.values()).filter(m => m.masterId === masterId).map(m => ({ ...m, weeks: [...m.weeks] })); }
    listLegendary() { return Array.from(this.months.values()).filter(m => m.status === 'legendary').map(m => ({ ...m, weeks: [...m.weeks] })); }

    addWeek(monthId, week) {
        const month = this.months.get(monthId);
        if (!month) return { success: false, error: 'MONTH_NOT_FOUND' };
        const wk = typeof week === 'string' ? { name: week, addedAt: Date.now() } : { ...week, addedAt: week.addedAt || Date.now() };
        month.weeks.push(wk);
        this._triggerHook('weekAdded', { monthId, week: wk, weekCount: month.weeks.length });
        return { success: true, week: wk };
    }

    raisePhase(monthId, amount = 5) {
        const month = this.months.get(monthId);
        if (!month) return { success: false, error: 'MONTH_NOT_FOUND' };
        month.phases += amount;
        this._triggerHook('phaseRaised', { monthId, amount, newPhases: month.phases });
        return { success: true };
    }

    levelUpMonth(monthId) {
        const month = this.months.get(monthId);
        if (!month) return { success: false, error: 'MONTH_NOT_FOUND' };
        month.level++;
        this._triggerHook('monthLeveledUp', { monthId, newLevel: month.level });
        return { success: true };
    }

    legendMonth(monthId) {
        const month = this.months.get(monthId);
        if (!month) return { success: false, error: 'MONTH_NOT_FOUND' };
        month.status = 'legendary';
        this._triggerHook('monthLegendized', { monthId });
        return { success: true };
    }

    calculateMonthValue(monthId) {
        const month = this.months.get(monthId);
        if (!month) return 0;
        return month.level * 100 + month.phases * 2 + month.weeks.length * 30;
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
        if (this.stats.totalMonths < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMonths += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { months: Array.from(this.months.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.months) this.months = new Map(data.months);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, monthCount: this.months.size }; }
}
