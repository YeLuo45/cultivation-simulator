/**
 * CultivationCity.js - 修真城
 * V589 Iteration 12/20 Round 24
 *
 * 融合6大设计系统:
 * - generic-agent: 城市自循环
 * - chatdev: 城市角色协调
 * - nanobot: 城市mesh
 * - claude-code: 城市分析工具
 * - thunderbolt: 城市持久化
 * - ruflo: 城市Hook
 */

export class CultivationCity {
    constructor(config = {}) {
        this.config = { maxCities: config.maxCities || 50, basePopulation: config.basePopulation || 10000, ...config };
        this.cities = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCities: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCity', (ctx) => this.getCity(ctx.cityId));
        this.registerTool('buildCity', (ctx) => this.buildCity(ctx));
    }

    buildCity(data) {
        const id = data.id || `cty_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const city = {
            cityId: id,
            mayorId: data.mayorId,
            name: data.name,
            type: data.type || 'cultivation',
            population: data.population || this.config.basePopulation,
            districts: data.districts || [],
            level: 1,
            status: 'thriving',
            createdAt: Date.now()
        };
        this.cities.set(id, city);
        this.stats.totalCities++;
        this._triggerHook('cityBuilt', { cityId: id });
        return { success: true, city };
    }

    getCity(id) { return this.cities.get(id) ? { ...this.cities.get(id) } : null; }
    listCities() { return Array.from(this.cities.values()).map(c => ({ ...c })); }
    listByMayor(mayorId) { return Array.from(this.cities.values()).filter(c => c.mayorId === mayorId).map(c => ({ ...c })); }
    listEternal() { return Array.from(this.cities.values()).filter(c => c.status === 'eternal').map(c => ({ ...c })); }

    addDistrict(cityId, district) {
        const city = this.cities.get(cityId);
        if (!city) return { success: false, error: 'CITY_NOT_FOUND' };
        city.districts.push(district);
        this._triggerHook('districtAdded', { cityId, district });
        return { success: true };
    }

    growPopulation(cityId, amount = 5) {
        const city = this.cities.get(cityId);
        if (!city) return { success: false, error: 'CITY_NOT_FOUND' };
        city.population += amount;
        this._triggerHook('populationGrown', { cityId, newPopulation: city.population });
        return { success: true };
    }

    levelUpCity(cityId) {
        const city = this.cities.get(cityId);
        if (!city) return { success: false, error: 'CITY_NOT_FOUND' };
        city.level++;
        this._triggerHook('cityLeveledUp', { cityId, newLevel: city.level });
        return { success: true };
    }

    eternalizeCity(cityId) {
        const city = this.cities.get(cityId);
        if (!city) return { success: false, error: 'CITY_NOT_FOUND' };
        city.status = 'eternal';
        this._triggerHook('cityEternalized', { cityId });
        return { success: true };
    }

    calculateCityValue(cityId) {
        const city = this.cities.get(cityId);
        if (!city) return 0;
        return city.level * 100 + city.population * 2 + city.districts.length * 30;
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
        if (this.stats.totalCities < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCities += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { cities: Array.from(this.cities.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.cities) this.cities = new Map(data.cities);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cityCount: this.cities.size }; }
}
