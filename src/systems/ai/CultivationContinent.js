/**
 * CultivationContinent.js - 修真大陆
 * V587 Iteration 10/20 Round 24
 */
export class CultivationContinent {
    constructor(config = {}) {
        this.config = { maxContinents: config.maxContinents || 20, baseArea: config.baseArea || 1000, ...config };
        this.continents = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalContinents: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getContinent', (ctx) => this.getContinent(ctx.continentId));
        this.registerTool('openContinent', (ctx) => this.openContinent(ctx));
    }

    openContinent(data) {
        const id = data.continentId || data.id || `cnt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const continent = {
            continentId: id,
            governorId: data.governorId,
            name: data.name || 'Unnamed Continent',
            type: data.type || 'eastern',
            area: data.area !== undefined ? data.area : this.config.baseArea,
            nations: data.nations || [],
            level: 1,
            status: 'forming',
            createdAt: Date.now()
        };
        this.continents.set(id, continent);
        this.stats.totalContinents++;
        this._triggerHook('continentOpened', { continentId: id });
        return { success: true, continent };
    }

    getContinent(continentId) { return this.continents.get(continentId) ? { ...this.continents.get(continentId) } : null; }
    listContinents() { return Array.from(this.continents.values()).map(c => ({ ...c })); }
    listByGovernor(governorId) { return Array.from(this.continents.values()).filter(c => c.governorId === governorId).map(c => ({ ...c })); }
    listStable() { return Array.from(this.continents.values()).filter(c => c.status === 'stable' || c.status === 'eternal').map(c => ({ ...c })); }

    addNation(continentId, nation) {
        const continent = this.continents.get(continentId);
        if (!continent) return { success: false, error: 'CONTINENT_NOT_FOUND' };
        continent.nations.push(nation);
        this._triggerHook('nationAdded', { continentId, nation });
        return { success: true };
    }

    expandArea(continentId, amount = 5) {
        const continent = this.continents.get(continentId);
        if (!continent) return { success: false, error: 'CONTINENT_NOT_FOUND' };
        continent.area += amount;
        this._triggerHook('areaExpanded', { continentId, amount, newArea: continent.area });
        return { success: true, newArea: continent.area };
    }

    levelUpContinent(continentId) {
        const continent = this.continents.get(continentId);
        if (!continent) return { success: false, error: 'CONTINENT_NOT_FOUND' };
        continent.level++;
        this._triggerHook('continentLeveledUp', { continentId, newLevel: continent.level });
        return { success: true, newLevel: continent.level };
    }

    eternizeContinent(continentId) {
        const continent = this.continents.get(continentId);
        if (!continent) return { success: false, error: 'CONTINENT_NOT_FOUND' };
        continent.status = 'eternal';
        this._triggerHook('continentEternalized', { continentId });
        return { success: true };
    }

    calculateContinentValue(continentId) {
        const continent = this.continents.get(continentId);
        if (!continent) return 0;
        return continent.level * 100 + continent.area * 2 + continent.nations.length * 30;
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
        if (this.stats.totalContinents < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxContinents += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { continents: Array.from(this.continents.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.continents) this.continents = new Map(data.continents);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, continentCount: this.continents.size }; }
}
