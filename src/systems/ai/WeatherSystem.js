/**
 * WeatherSystem.js - 天气系统
 * V350 Iteration 2/9 Round 8
 */
export class WeatherSystem {
    constructor(config = {}) {
        this.config = { maxRegions: config.maxRegions || 100, baseChangeRate: config.baseChangeRate || 0.3, ...config };
        this.regions = new Map();
        this.weatherHistory = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalChanges: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const types = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy', 'windy', 'clear'];
        for (const t of types) this.config[`type_${t}`] = t;
    }

    _registerDefaultTools() {
        this.registerTool('getRegion', (ctx) => this.getRegion(ctx.regionId));
        this.registerTool('setWeather', (ctx) => this.setWeather(ctx.regionId, ctx.type));
    }

    registerRegion(data) {
        const id = data.id || `rg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const region = { regionId: id, name: data.name || 'Region', currentWeather: 'clear', weatherIntensity: 0, createdAt: Date.now() };
        this.regions.set(id, region);
        return { success: true, region };
    }

    getRegion(id) { return this.regions.get(id) ? { ...this.regions.get(id) } : null; }
    listRegions() { return Array.from(this.regions.values()).map(r => ({ ...r })); }
    listByWeather(type) { return Array.from(this.regions.values()).filter(r => r.currentWeather === type).map(r => ({ ...r })); }

    setWeather(regionId, type, intensity = 0.5) {
        const region = this.regions.get(regionId);
        if (!region) return { success: false, error: 'REGION_NOT_FOUND' };
        const previous = region.currentWeather;
        region.currentWeather = type;
        region.weatherIntensity = Math.max(0, Math.min(1, intensity));
        const entryId = `wh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        this.weatherHistory.set(entryId, { entryId, regionId, previous, current: type, intensity, changedAt: Date.now() });
        this.stats.totalChanges++;
        this._triggerHook('weatherChanged', { regionId, type, previous });
        return { success: true, region: { ...region } };
    }

    getWeatherHistory(regionId) {
        return Array.from(this.weatherHistory.values()).filter(h => h.regionId === regionId).map(h => ({ ...h }));
    }

    randomChange(regionId) {
        const region = this.regions.get(regionId);
        if (!region) return { success: false, error: 'REGION_NOT_FOUND' };
        const types = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy', 'windy', 'clear'];
        const type = types[Math.floor(Math.random() * types.length)];
        return this.setWeather(regionId, type, Math.random());
    }

    calculateEffect(type, intensity) {
        const effects = { sunny: { cultivation: 0.1 * intensity }, rainy: { water: 0.2 * intensity }, stormy: { damage: 0.3 * intensity }, snowy: { cold: 0.2 * intensity }, foggy: { visibility: -0.3 * intensity }, windy: { movement: 0.2 * intensity }, clear: { clarity: 0.1 * intensity } };
        return effects[type] || effects.clear;
    }

    listWeatherTypes() { return ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy', 'windy', 'clear']; }

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
        if (this.stats.totalChanges < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRegions += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { regions: Array.from(this.regions.entries()), weatherHistory: Array.from(this.weatherHistory.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.regions) this.regions = new Map(data.regions);
        if (data.weatherHistory) this.weatherHistory = new Map(data.weatherHistory);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, regionCount: this.regions.size }; }
}