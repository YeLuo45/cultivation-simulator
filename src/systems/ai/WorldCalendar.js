/**
 * WorldCalendar.js - 世界日历
 * V352 Iteration 4/9 Round 8
 */
export class WorldCalendar {
    constructor(config = {}) {
        this.config = { daysPerYear: config.daysPerYear || 360, monthsPerYear: config.monthsPerYear || 12, baseYear: config.baseYear || 1, ...config };
        this.events = new Map();
        this.holidays = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEvents: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEvent', (ctx) => this.getEvent(ctx.eventId));
        this.registerTool('addEvent', (ctx) => this.addEvent(ctx));
    }

    yearToDay(year) { return (year - this.config.baseYear) * this.config.daysPerYear; }
    dayToYear(day) { return Math.floor(day / this.config.daysPerYear) + this.config.baseYear; }

    addEvent(data) {
        const id = data.id || `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const event = { eventId: id, name: data.name || 'Event', day: data.day || 0, year: data.year || this.config.baseYear, type: data.type || 'general', description: data.description || '' };
        this.events.set(id, event);
        this.stats.totalEvents++;
        this._triggerHook('eventAdded', { eventId: id });
        return { success: true, event };
    }

    getEvent(id) { return this.events.get(id) ? { ...this.events.get(id) } : null; }
    listEvents() { return Array.from(this.events.values()).map(e => ({ ...e })); }
    listByYear(year) { return Array.from(this.events.values()).filter(e => e.year === year).map(e => ({ ...e })); }
    listByType(type) { return Array.from(this.events.values()).filter(e => e.type === type).map(e => ({ ...e })); }
    listByDayRange(startDay, endDay) { return Array.from(this.events.values()).filter(e => e.day >= startDay && e.day <= endDay).map(e => ({ ...e })); }

    removeEvent(eventId) {
        if (!this.events.has(eventId)) return { success: false, error: 'EVENT_NOT_FOUND' };
        this.events.delete(eventId);
        this._triggerHook('eventRemoved', { eventId });
        return { success: true };
    }

    addHoliday(data) {
        const id = data.id || `hol_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const holiday = { holidayId: id, name: data.name || 'Holiday', day: data.day || 0, month: data.month || 1, recurring: data.recurring || true };
        this.holidays.set(id, holiday);
        this._triggerHook('holidayAdded', { holidayId: id });
        return { success: true, holiday };
    }

    getHoliday(id) { return this.holidays.get(id) ? { ...this.holidays.get(id) } : null; }
    listHolidays() { return Array.from(this.holidays.values()).map(h => ({ ...h })); }
    listHolidaysByMonth(month) { return Array.from(this.holidays.values()).filter(h => h.month === month).map(h => ({ ...h })); }

    isHoliday(day, month) { return Array.from(this.holidays.values()).some(h => h.day === day && h.month === month); }

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
        if (this.stats.totalEvents < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { events: Array.from(this.events.entries()), holidays: Array.from(this.holidays.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.events) this.events = new Map(data.events);
        if (data.holidays) this.holidays = new Map(data.holidays);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, eventCount: this.events.size, holidayCount: this.holidays.size }; }
}