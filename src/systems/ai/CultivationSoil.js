/**
 * CultivationSoil.js - 修真土壤系统
 * V845 Iteration 18/30 Round 33
 */
export class CultivationSoil {
    constructor(config = {}) {
        this.config = { maxSoils: config.maxSoils || 20, baseFertility: config.baseFertility || 20, ...config };
        this.soils = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSoils: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSoil', (ctx) => this.getSoil(ctx.soilId));
        this.registerTool('recruitSoil', (ctx) => this.recruitSoil(ctx));
    }

    recruitSoil(data = {}) {
        if (this.soils.size >= this.config.maxSoils) {
            return { success: false, error: 'MAX_SOILS_REACHED' };
        }
        const id = data.soilId || `sol_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const soil = {
            soilId: id,
            masterId: data.masterId || null,
            name: data.name || `Soil-${id.slice(-5)}`,
            type: data.type || 'loam',
            fertility: data.fertility !== undefined ? data.fertility : this.config.baseFertility,
            harvests: Array.isArray(data.harvests) ? [...data.harvests] : [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.soils.set(id, soil);
        this.stats.totalSoils++;
        this._triggerHook('soilRecruited', { soilId: id, masterId: soil.masterId });
        return { success: true, soil };
    }

    getSoil(id) { return this.soils.get(id) ? { ...this.soils.get(id) } : null; }
    listSoils() { return Array.from(this.soils.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.soils.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.soils.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addHarvest(soilId, harvest) {
        const soil = this.soils.get(soilId);
        if (!soil) return { success: false, error: 'SOIL_NOT_FOUND' };
        soil.harvests.push(harvest);
        this._triggerHook('harvestAdded', { soilId, harvest, totalHarvests: soil.harvests.length });
        return { success: true };
    }

    raiseFertility(soilId, amount = 5) {
        const soil = this.soils.get(soilId);
        if (!soil) return { success: false, error: 'SOIL_NOT_FOUND' };
        soil.fertility += amount;
        this._triggerHook('fertilityRaised', { soilId, newFertility: soil.fertility });
        return { success: true };
    }

    levelUpSoil(soilId) {
        const soil = this.soils.get(soilId);
        if (!soil) return { success: false, error: 'SOIL_NOT_FOUND' };
        soil.level++;
        this._triggerHook('soilLeveledUp', { soilId, newLevel: soil.level });
        return { success: true };
    }

    legendSoil(soilId) {
        const soil = this.soils.get(soilId);
        if (!soil) return { success: false, error: 'SOIL_NOT_FOUND' };
        soil.status = 'legendary';
        this._triggerHook('soilLegendized', { soilId });
        return { success: true };
    }

    calculateSoilValue(soilId) {
        const soil = this.soils.get(soilId);
        if (!soil) return 0;
        return soil.level * 100 + soil.fertility * 2 + soil.harvests.length * 30;
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
        if (this.stats.totalSoils < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSoils += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { soils: Array.from(this.soils.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.soils) this.soils = new Map(data.soils);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, soilCount: this.soils.size }; }
}
