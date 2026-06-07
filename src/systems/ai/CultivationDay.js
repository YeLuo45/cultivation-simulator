/**
 * CultivationDay.js - 修真日 (Cultivation Day system)
 * V821 Iteration 24/30 Round 32
 */
export class CultivationDay {
    constructor(config = {}) {
        this.config = { maxDays: config.maxDays || 20, baseLength: config.baseLength || 20, ...config };
        this.days = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDays: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDay', (ctx) => this.getDay(ctx.dayId));
        this.registerTool('recruitDay', (ctx) => this.recruitDay(ctx));
    }

    recruitDay(data) {
        const id = data.id || `cday_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const day = {
            dayId: id,
            masterId: data.masterId,
            name: data.name || 'Cultivation Day',
            type: data.type || 'solar',
            length: data.length || this.config.baseLength,
            hours: data.hours || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.days.set(id, day);
        this.stats.totalDays++;
        this._triggerHook('dayRecruited', { dayId: id });
        return { success: true, day };
    }

    getDay(id) { return this.days.get(id) ? { ...this.days.get(id), hours: [...this.days.get(id).hours] } : null; }
    listDays() { return Array.from(this.days.values()).map(d => ({ ...d, hours: [...d.hours] })); }
    listByMaster(masterId) { return Array.from(this.days.values()).filter(d => d.masterId === masterId).map(d => ({ ...d, hours: [...d.hours] })); }
    listLegendary() { return Array.from(this.days.values()).filter(d => d.status === 'legendary').map(d => ({ ...d, hours: [...d.hours] })); }

    addHour(dayId, hour) {
        const day = this.days.get(dayId);
        if (!day) return { success: false, error: 'DAY_NOT_FOUND' };
        const hr = typeof hour === 'string' ? { name: hour, addedAt: Date.now() } : { ...hour, addedAt: hour.addedAt || Date.now() };
        day.hours.push(hr);
        this._triggerHook('hourAdded', { dayId, hour: hr, hourCount: day.hours.length });
        return { success: true, hour: hr };
    }

    raiseLength(dayId, amount = 5) {
        const day = this.days.get(dayId);
        if (!day) return { success: false, error: 'DAY_NOT_FOUND' };
        day.length += amount;
        this._triggerHook('lengthRaised', { dayId, amount, newLength: day.length });
        return { success: true };
    }

    levelUpDay(dayId) {
        const day = this.days.get(dayId);
        if (!day) return { success: false, error: 'DAY_NOT_FOUND' };
        day.level++;
        this._triggerHook('dayLeveledUp', { dayId, newLevel: day.level });
        return { success: true };
    }

    legendDay(dayId) {
        const day = this.days.get(dayId);
        if (!day) return { success: false, error: 'DAY_NOT_FOUND' };
        day.status = 'legendary';
        this._triggerHook('dayLegendized', { dayId });
        return { success: true };
    }

    calculateDayValue(dayId) {
        const day = this.days.get(dayId);
        if (!day) return 0;
        return day.level * 100 + day.length * 2 + day.hours.length * 30;
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
        if (this.stats.totalDays < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDays += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { days: Array.from(this.days.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.days) this.days = new Map(data.days);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, dayCount: this.days.size }; }
}
