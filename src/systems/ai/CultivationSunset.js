/**
 * CultivationSunset.js - 修真日落系统
 * V814 Iteration 17/30 Round 32
 */
export class CultivationSunset {
    constructor(config = {}) {
        this.config = { maxSunsets: config.maxSunsets || 20, baseWarmth: config.baseWarmth || 20, ...config };
        this.sunsets = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSunsets: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSunset', (ctx) => this.getSunset(ctx.sunsetId));
        this.registerTool('recruitSunset', (ctx) => this.recruitSunset(ctx));
    }

    recruitSunset(data) {
        const id = data.sunsetId || `sst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const sunset = {
            sunsetId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Sunset',
            type: data.type || 'golden',
            warmth: data.warmth || this.config.baseWarmth,
            hues: data.hues || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.sunsets.set(id, sunset);
        this.stats.totalSunsets++;
        this._triggerHook('sunsetRecruited', { sunsetId: id });
        return { success: true, sunset };
    }

    getSunset(id) { return this.sunsets.get(id) ? { ...this.sunsets.get(id) } : null; }
    listSunsets() { return Array.from(this.sunsets.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.sunsets.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.sunsets.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addHue(sunsetId, hue) {
        const sunset = this.sunsets.get(sunsetId);
        if (!sunset) return { success: false, error: 'SUNSET_NOT_FOUND' };
        sunset.hues.push(hue);
        this._triggerHook('hueAdded', { sunsetId, hue });
        return { success: true };
    }

    raiseWarmth(sunsetId, amount = 5) {
        const sunset = this.sunsets.get(sunsetId);
        if (!sunset) return { success: false, error: 'SUNSET_NOT_FOUND' };
        sunset.warmth += amount;
        this._triggerHook('warmthRaised', { sunsetId, newWarmth: sunset.warmth });
        return { success: true };
    }

    levelUpSunset(sunsetId) {
        const sunset = this.sunsets.get(sunsetId);
        if (!sunset) return { success: false, error: 'SUNSET_NOT_FOUND' };
        sunset.level++;
        this._triggerHook('sunsetLeveledUp', { sunsetId, newLevel: sunset.level });
        return { success: true };
    }

    legendSunset(sunsetId) {
        const sunset = this.sunsets.get(sunsetId);
        if (!sunset) return { success: false, error: 'SUNSET_NOT_FOUND' };
        sunset.status = 'legendary';
        this._triggerHook('sunsetLegendized', { sunsetId });
        return { success: true };
    }

    calculateSunsetValue(sunsetId) {
        const sunset = this.sunsets.get(sunsetId);
        if (!sunset) return 0;
        return sunset.level * 100 + sunset.warmth * 2 + sunset.hues.length * 30;
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
        if (this.stats.totalSunsets < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSunsets += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { sunsets: Array.from(this.sunsets.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.sunsets) this.sunsets = new Map(data.sunsets);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, sunsetCount: this.sunsets.size }; }
}
