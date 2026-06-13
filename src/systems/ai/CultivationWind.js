/**
 * CultivationWind.js - 修真风系统
 * V807 Iteration 10/30 Round 32
 */
export class CultivationWind {
    constructor(config = {}) {
        this.config = { maxWinds: config.maxWinds || 20, baseSpeed: config.baseSpeed || 20, ...config };
        this.winds = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalWinds: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getWind', (ctx) => this.getWind(ctx.windId));
        this.registerTool('recruitWind', (ctx) => this.recruitWind(ctx));
    }

    recruitWind(data) {
        const id = data.id || `wnd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const wind = { windId: id, masterId: data.masterId || null, name: data.name || 'Anonymous', type: data.type || 'gentle', speed: data.speed || this.config.baseSpeed, gusts: data.gusts || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.winds.set(id, wind);
        this.stats.totalWinds++;
        this._triggerHook('windRecruited', { windId: id });
        return { success: true, wind };
    }

    getWind(id) { return this.winds.get(id) ? { ...this.winds.get(id) } : null; }
    listWinds() { return Array.from(this.winds.values()).map(w => ({ ...w })); }
    listByMaster(masterId) { return Array.from(this.winds.values()).filter(w => w.masterId === masterId).map(w => ({ ...w })); }
    listLegendary() { return Array.from(this.winds.values()).filter(w => w.status === 'legendary').map(w => ({ ...w })); }

    addGust(windId, gust) {
        const wind = this.winds.get(windId);
        if (!wind) return { success: false, error: 'WIND_NOT_FOUND' };
        const gustName = (gust && typeof gust === 'object') ? (gust.name || 'gust') : gust;
        wind.gusts.push({ name: gustName, addedAt: Date.now() });
        this._triggerHook('gustAdded', { windId, gust: gustName });
        return { success: true };
    }

    raiseSpeed(windId, amount = 5) {
        const wind = this.winds.get(windId);
        if (!wind) return { success: false, error: 'WIND_NOT_FOUND' };
        wind.speed += amount;
        this._triggerHook('speedRaised', { windId, newSpeed: wind.speed });
        return { success: true };
    }

    levelUpWind(windId) {
        const wind = this.winds.get(windId);
        if (!wind) return { success: false, error: 'WIND_NOT_FOUND' };
        wind.level++;
        this._triggerHook('windLeveledUp', { windId, newLevel: wind.level });
        return { success: true };
    }

    legendWind(windId) {
        const wind = this.winds.get(windId);
        if (!wind) return { success: false, error: 'WIND_NOT_FOUND' };
        wind.status = 'legendary';
        this._triggerHook('windLegendized', { windId });
        return { success: true };
    }

    calculateWindValue(windId) {
        const wind = this.winds.get(windId);
        if (!wind) return 0;
        return wind.level * 100 + wind.speed * 2 + wind.gusts.length * 30;
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
        if (this.stats.totalWinds < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxWinds += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { winds: Array.from(this.winds.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.winds) this.winds = new Map(data.winds);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, windCount: this.winds.size }; }
}
