/**
 * CultivationSunrise.js - 修真日出
 * V813 Iteration 16/30 Round 32 - Cultivation Sunrise
 */
export class CultivationSunrise {
    constructor(config = {}) {
        this.config = { maxSunrises: config.maxSunrises || 20, baseGlow: config.baseGlow || 20, ...config };
        this.sunrises = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSunrises: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSunrise', (ctx) => this.getSunrise(ctx.sunriseId));
        this.registerTool('recruitSunrise', (ctx) => this.recruitSunrise(ctx));
    }

    recruitSunrise(data) {
        const id = data.sunriseId || `sunrise_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const sunrise = {
            sunriseId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Sunrise',
            type: data.type || 'golden',
            glow: data.glow || this.config.baseGlow,
            rays: data.rays || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.sunrises.set(id, sunrise);
        this.stats.totalSunrises++;
        this._triggerHook('sunriseRecruited', { sunriseId: id });
        return { success: true, sunrise };
    }

    getSunrise(id) { return this.sunrises.get(id) ? { ...this.sunrises.get(id) } : null; }
    listSunrises() { return Array.from(this.sunrises.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.sunrises.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.sunrises.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addRay(sunriseId, ray) {
        const sunrise = this.sunrises.get(sunriseId);
        if (!sunrise) return { success: false, error: 'SUNRISE_NOT_FOUND' };
        sunrise.rays.push(ray);
        this._triggerHook('rayAdded', { sunriseId, ray });
        return { success: true };
    }

    raiseGlow(sunriseId, amount = 5) {
        const sunrise = this.sunrises.get(sunriseId);
        if (!sunrise) return { success: false, error: 'SUNRISE_NOT_FOUND' };
        sunrise.glow += amount;
        this._triggerHook('glowRaised', { sunriseId, newGlow: sunrise.glow });
        return { success: true };
    }

    levelUpSunrise(sunriseId) {
        const sunrise = this.sunrises.get(sunriseId);
        if (!sunrise) return { success: false, error: 'SUNRISE_NOT_FOUND' };
        sunrise.level++;
        this._triggerHook('sunriseLeveledUp', { sunriseId, newLevel: sunrise.level });
        return { success: true };
    }

    legendSunrise(sunriseId) {
        const sunrise = this.sunrises.get(sunriseId);
        if (!sunrise) return { success: false, error: 'SUNRISE_NOT_FOUND' };
        sunrise.status = 'legendary';
        this._triggerHook('sunriseLegendized', { sunriseId });
        return { success: true };
    }

    calculateSunriseValue(sunriseId) {
        const sunrise = this.sunrises.get(sunriseId);
        if (!sunrise) return 0;
        return sunrise.level * 100 + sunrise.glow * 2 + sunrise.rays.length * 30;
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
        if (this.stats.totalSunrises < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSunrises += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { sunrises: Array.from(this.sunrises.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.sunrises) this.sunrises = new Map(data.sunrises);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, sunriseCount: this.sunrises.size }; }
}
