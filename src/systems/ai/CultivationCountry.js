/**
 * CultivationCountry.js - 修真国
 * V588 Iteration 11/20 Round 24
 */

export class CultivationCountry {
    constructor(config = {}) {
        this.config = { maxCountries: config.maxCountries || 20, basePower: config.basePower || 20, ...config };
        this.countries = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCountries: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCountry', (ctx) => this.getCountry(ctx.countryId));
        this.registerTool('foundCountry', (ctx) => this.foundCountry(ctx));
    }

    foundCountry(data) {
        const id = data.id || `cty_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const country = {
            countryId: id,
            sovereignId: data.sovereignId,
            name: data.name || '无名国',
            type: data.type || 'kingdom',
            power: data.power || this.config.basePower,
            regions: data.regions || [],
            level: data.level || 1,
            status: 'forming',
            createdAt: Date.now()
        };
        this.countries.set(id, country);
        this.stats.totalCountries++;
        this._triggerHook('countryFound', { countryId: id });
        return { success: true, country };
    }

    getCountry(id) { return this.countries.get(id) ? { ...this.countries.get(id) } : null; }
    listCountries() { return Array.from(this.countries.values()).map(c => ({ ...c })); }
    listBySovereign(sovereignId) { return Array.from(this.countries.values()).filter(c => c.sovereignId === sovereignId).map(c => ({ ...c })); }
    listStable() { return Array.from(this.countries.values()).filter(c => c.status === 'stable' || c.status === 'eternal').map(c => ({ ...c })); }

    addRegion(countryId, region) {
        const country = this.countries.get(countryId);
        if (!country) return { success: false, error: 'COUNTRY_NOT_FOUND' };
        country.regions.push(region);
        this._triggerHook('regionAdded', { countryId, region });
        return { success: true };
    }

    increasePower(countryId, amount = 5) {
        const country = this.countries.get(countryId);
        if (!country) return { success: false, error: 'COUNTRY_NOT_FOUND' };
        country.power += amount;
        if (country.status === 'forming' && country.regions.length > 0) country.status = 'stable';
        this._triggerHook('powerIncreased', { countryId, newPower: country.power });
        return { success: true };
    }

    levelUpCountry(countryId) {
        const country = this.countries.get(countryId);
        if (!country) return { success: false, error: 'COUNTRY_NOT_FOUND' };
        country.level++;
        this._triggerHook('countryLeveledUp', { countryId, newLevel: country.level });
        return { success: true };
    }

    eternizeCountry(countryId) {
        const country = this.countries.get(countryId);
        if (!country) return { success: false, error: 'COUNTRY_NOT_FOUND' };
        country.status = 'eternal';
        this._triggerHook('countryEternalized', { countryId });
        return { success: true };
    }

    calculateCountryValue(countryId) {
        const country = this.countries.get(countryId);
        if (!country) return 0;
        return country.level * 100 + country.power * 2 + country.regions.length * 30;
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
        if (this.stats.totalCountries < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCountries += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { countries: Array.from(this.countries.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.countries) this.countries = new Map(data.countries);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, countryCount: this.countries.size }; }
}
