/**
 * CultivationRain.js - 修真雨
 * V802 Iteration 5/30 Round 32
 */
export class CultivationRain {
    constructor(config = {}) {
        this.config = { maxRains: config.maxRains || 20, baseMoisture: config.baseMoisture || 20, ...config };
        this.rains = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRecruited: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRain', (ctx) => this.getRain(ctx.rainId));
        this.registerTool('recruitRain', (ctx) => this.recruitRain(ctx));
    }

    recruitRain(data) {
        const id = data.id || `rain_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const rain = {
            rainId: id, masterId: data.masterId || 'unknown', name: data.name || 'Unnamed Rain',
            type: data.type || 'gentle', moisture: data.moisture || this.config.baseMoisture,
            drops: data.drops || [], level: data.level || 1, status: 'novice',
            createdAt: Date.now()
        };
        this.rains.set(id, rain);
        this.stats.totalRecruited++;
        this._triggerHook('rainRecruited', { rainId: id });
        return { success: true, rain };
    }

    getRain(id) { return this.rains.get(id) ? { ...this.rains.get(id) } : null; }
    listRains() { return Array.from(this.rains.values()).map(r => ({ ...r })); }
    listByMaster(masterId) { return Array.from(this.rains.values()).filter(r => r.masterId === masterId).map(r => ({ ...r })); }
    listLegendary() { return Array.from(this.rains.values()).filter(r => r.status === 'legendary').map(r => ({ ...r })); }

    addDrop(rainId, drop) {
        const rain = this.rains.get(rainId);
        if (!rain) return { success: false, error: 'RAIN_NOT_FOUND' };
        rain.drops.push(drop);
        this._triggerHook('dropAdded', { rainId });
        return { success: true };
    }

    raiseMoisture(rainId, amount = 5) {
        const rain = this.rains.get(rainId);
        if (!rain) return { success: false, error: 'RAIN_NOT_FOUND' };
        rain.moisture = Math.max(0, rain.moisture + amount);
        this._triggerHook('moistureRaised', { rainId });
        return { success: true };
    }

    levelUpRain(rainId) {
        const rain = this.rains.get(rainId);
        if (!rain) return { success: false, error: 'RAIN_NOT_FOUND' };
        rain.level++;
        this._triggerHook('rainLeveledUp', { rainId });
        return { success: true };
    }

    legendRain(rainId) {
        const rain = this.rains.get(rainId);
        if (!rain) return { success: false, error: 'RAIN_NOT_FOUND' };
        rain.status = 'legendary';
        this._triggerHook('rainLegendized', { rainId });
        return { success: true };
    }

    calculateRainValue(rainId) {
        const rain = this.rains.get(rainId);
        if (!rain) return 0;
        return rain.level * 100 + rain.moisture * 2 + rain.drops.length * 30;
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
        if (this.stats.totalRecruited < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRains += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { rains: Array.from(this.rains.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.rains) this.rains = new Map(data.rains);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, rainCount: this.rains.size }; }
}
