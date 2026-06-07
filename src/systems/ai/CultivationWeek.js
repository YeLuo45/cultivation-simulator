/**
 * CultivationWeek.js - 修真周 (Cultivation Week system)
 * V822 Iteration 25/30 Round 32
 */
export class CultivationWeek {
    constructor(config = {}) {
        this.config = { maxWeeks: config.maxWeeks || 20, baseFlow: config.baseFlow || 20, ...config };
        this.weeks = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalWeeks: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getWeek', (ctx) => this.getWeek(ctx.weekId));
        this.registerTool('recruitWeek', (ctx) => this.recruitWeek(ctx));
    }

    recruitWeek(data) {
        const id = data.id || `cwk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const week = {
            weekId: id,
            masterId: data.masterId,
            name: data.name || 'Cultivation Week',
            type: data.type || 'planetary',
            flow: data.flow || this.config.baseFlow,
            days: data.days || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.weeks.set(id, week);
        this.stats.totalWeeks++;
        this._triggerHook('weekRecruited', { weekId: id });
        return { success: true, week };
    }

    getWeek(id) { return this.weeks.get(id) ? { ...this.weeks.get(id), days: [...this.weeks.get(id).days] } : null; }
    listWeeks() { return Array.from(this.weeks.values()).map(w => ({ ...w, days: [...w.days] })); }
    listByMaster(masterId) { return Array.from(this.weeks.values()).filter(w => w.masterId === masterId).map(w => ({ ...w, days: [...w.days] })); }
    listLegendary() { return Array.from(this.weeks.values()).filter(w => w.status === 'legendary').map(w => ({ ...w, days: [...w.days] })); }

    addDay(weekId, day) {
        const week = this.weeks.get(weekId);
        if (!week) return { success: false, error: 'WEEK_NOT_FOUND' };
        const d = typeof day === 'string' ? { name: day, addedAt: Date.now() } : { ...day, addedAt: day.addedAt || Date.now() };
        week.days.push(d);
        this._triggerHook('dayAdded', { weekId, day: d, dayCount: week.days.length });
        return { success: true, day: d };
    }

    raiseFlow(weekId, amount = 5) {
        const week = this.weeks.get(weekId);
        if (!week) return { success: false, error: 'WEEK_NOT_FOUND' };
        week.flow += amount;
        this._triggerHook('flowRaised', { weekId, amount, newFlow: week.flow });
        return { success: true };
    }

    levelUpWeek(weekId) {
        const week = this.weeks.get(weekId);
        if (!week) return { success: false, error: 'WEEK_NOT_FOUND' };
        week.level++;
        this._triggerHook('weekLeveledUp', { weekId, newLevel: week.level });
        return { success: true };
    }

    legendWeek(weekId) {
        const week = this.weeks.get(weekId);
        if (!week) return { success: false, error: 'WEEK_NOT_FOUND' };
        week.status = 'legendary';
        this._triggerHook('weekLegendized', { weekId });
        return { success: true };
    }

    calculateWeekValue(weekId) {
        const week = this.weeks.get(weekId);
        if (!week) return 0;
        return week.level * 100 + week.flow * 2 + week.days.length * 30;
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
        if (this.stats.totalWeeks < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxWeeks += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { weeks: Array.from(this.weeks.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.weeks) this.weeks = new Map(data.weeks);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, weekCount: this.weeks.size }; }
}