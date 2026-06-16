/**
 * CultivationTerritory.js - 修真领土
 * V586 Iteration 9/20 Round 24
 */
export class CultivationTerritory {
    constructor(config = {}) {
        this.config = { maxTerritories: config.maxTerritories || 30, baseInfluence: config.baseInfluence || 20, ...config };
        this.territories = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTerritories: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTerritory', (ctx) => this.getTerritory(ctx.territoryId));
        this.registerTool('claimTerritory', (ctx) => this.claimTerritory(ctx));
    }

    claimTerritory(data) {
        const id = data.territoryId || data.id || `ter_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const territory = {
            territoryId: id,
            rulerId: data.rulerId,
            name: data.name || 'Unnamed Territory',
            type: data.type || 'kingdom',
            influence: data.influence !== undefined ? data.influence : this.config.baseInfluence,
            lands: data.lands || [],
            level: 1,
            status: 'claimed',
            createdAt: Date.now()
        };
        this.territories.set(id, territory);
        this.stats.totalTerritories++;
        this._triggerHook('territoryClaimed', { territoryId: id });
        return { success: true, territory };
    }

    getTerritory(territoryId) { return this.territories.get(territoryId) ? { ...this.territories.get(territoryId) } : null; }
    listTerritories() { return Array.from(this.territories.values()).map(t => ({ ...t })); }
    listByRuler(rulerId) { return Array.from(this.territories.values()).filter(t => t.rulerId === rulerId).map(t => ({ ...t })); }
    listStable() { return Array.from(this.territories.values()).filter(t => t.status === 'stable' || t.status === 'eternal').map(t => ({ ...t })); }

    addLand(territoryId, land) {
        const territory = this.territories.get(territoryId);
        if (!territory) return { success: false, error: 'TERRITORY_NOT_FOUND' };
        territory.lands.push(land);
        this._triggerHook('landAdded', { territoryId, land });
        return { success: true };
    }

    increaseInfluence(territoryId, amount = 5) {
        const territory = this.territories.get(territoryId);
        if (!territory) return { success: false, error: 'TERRITORY_NOT_FOUND' };
        territory.influence += amount;
        if (territory.influence >= 100 && territory.status === 'claimed') territory.status = 'stable';
        this._triggerHook('influenceIncreased', { territoryId, amount, newInfluence: territory.influence });
        return { success: true, newInfluence: territory.influence };
    }

    levelUpTerritory(territoryId) {
        const territory = this.territories.get(territoryId);
        if (!territory) return { success: false, error: 'TERRITORY_NOT_FOUND' };
        territory.level++;
        this._triggerHook('territoryLeveledUp', { territoryId, newLevel: territory.level });
        return { success: true, newLevel: territory.level };
    }

    eternizeTerritory(territoryId) {
        const territory = this.territories.get(territoryId);
        if (!territory) return { success: false, error: 'TERRITORY_NOT_FOUND' };
        territory.status = 'eternal';
        this._triggerHook('territoryEternalized', { territoryId });
        return { success: true };
    }

    calculateTerritoryValue(territoryId) {
        const territory = this.territories.get(territoryId);
        if (!territory) return 0;
        return territory.level * 100 + territory.influence * 2 + territory.lands.length * 30;
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
        if (this.stats.totalTerritories < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTerritories += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { territories: Array.from(this.territories.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.territories) this.territories = new Map(data.territories);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, territoryCount: this.territories.size }; }
}
