/**
 * SectFestival.js - 宗门节日
 * V488 Iteration 5/15 Round 19
 */
export class SectFestival {
    constructor(config = {}) {
        this.config = { maxFestivals: config.maxFestivals || 50, baseDuration: config.baseDuration || 1, ...config };
        this.festivals = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFestivals: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getFestival', (ctx) => this.getFestival(ctx.festivalId));
        this.registerTool('scheduleFestival', (ctx) => this.scheduleFestival(ctx));
    }

    scheduleFestival(data) {
        const id = data.id || `fst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const festival = { festivalId: id, sectId: data.sectId, name: data.name, type: data.type || 'harvest', duration: data.duration || this.config.baseDuration, attendees: data.attendees || [], status: data.status || 'upcoming', createdAt: Date.now() };
        this.festivals.set(id, festival);
        this.stats.totalFestivals++;
        this._triggerHook('festivalScheduled', { festivalId: id });
        return { success: true, festival };
    }

    getFestival(id) { return this.festivals.get(id) ? { ...this.festivals.get(id) } : null; }
    listFestivals() { return Array.from(this.festivals.values()).map(f => ({ ...f })); }
    listBySect(sectId) { return Array.from(this.festivals.values()).filter(f => f.sectId === sectId).map(f => ({ ...f })); }
    listActive() { return Array.from(this.festivals.values()).filter(f => f.status === 'active').map(f => ({ ...f })); }

    addAttendee(festivalId, member) {
        const festival = this.festivals.get(festivalId);
        if (!festival) return { success: false, error: 'FESTIVAL_NOT_FOUND' };
        festival.attendees.push(member);
        this._triggerHook('attendeeAdded', { festivalId, member });
        return { success: true };
    }

    extendDuration(festivalId, amount = 2) {
        const festival = this.festivals.get(festivalId);
        if (!festival) return { success: false, error: 'FESTIVAL_NOT_FOUND' };
        festival.duration += amount;
        this._triggerHook('durationExtended', { festivalId, amount, newDuration: festival.duration });
        return { success: true };
    }

    startFestival(festivalId) {
        const festival = this.festivals.get(festivalId);
        if (!festival) return { success: false, error: 'FESTIVAL_NOT_FOUND' };
        festival.status = 'active';
        this._triggerHook('festivalStarted', { festivalId });
        return { success: true };
    }

    endFestival(festivalId) {
        const festival = this.festivals.get(festivalId);
        if (!festival) return { success: false, error: 'FESTIVAL_NOT_FOUND' };
        festival.status = 'concluded';
        this._triggerHook('festivalEnded', { festivalId });
        return { success: true };
    }

    calculateFestivalJoy(festivalId) {
        const festival = this.festivals.get(festivalId);
        if (!festival) return 0;
        return festival.attendees.length * 5 + festival.duration;
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
        if (this.stats.totalFestivals < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxFestivals += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { festivals: Array.from(this.festivals.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.festivals) this.festivals = new Map(data.festivals);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, festivalCount: this.festivals.size }; }
}
