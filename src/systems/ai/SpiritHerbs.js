/**
 * SpiritHerbs.js - 灵草
 * V411 Iteration 3/15 Round 14
 */
export class SpiritHerbs {
    constructor(config = {}) {
        this.config = { maxHerbs: config.maxHerbs || 500, basePotency: config.basePotency || 10, ...config };
        this.herbs = new Map();
        this.harvests = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalHerbs: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getHerb', (ctx) => this.getHerb(ctx.herbId));
        this.registerTool('plantHerb', (ctx) => this.plantHerb(ctx));
    }

    plantHerb(data) {
        const id = data.id || `hb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const herb = { herbId: id, name: data.name || 'Spirit Herb', element: data.element || 'wood', potency: data.potency || this.config.basePotency, age: 0, growthRate: data.growthRate || 1, status: 'growing', plantedAt: Date.now() };
        this.herbs.set(id, herb);
        this.stats.totalHerbs++;
        this._triggerHook('herbPlanted', { herbId: id });
        return { success: true, herb };
    }

    getHerb(id) { return this.herbs.get(id) ? { ...this.herbs.get(id) } : null; }
    listHerbs() { return Array.from(this.herbs.values()).map(h => ({ ...h })); }
    listByElement(element) { return Array.from(this.herbs.values()).filter(h => h.element === element).map(h => ({ ...h })); }
    listByPotency(min) { return Array.from(this.herbs.values()).filter(h => h.potency >= min).map(h => ({ ...h })); }

    grow(herbId, time) {
        const herb = this.herbs.get(herbId);
        if (!herb) return { success: false, error: 'HERB_NOT_FOUND' };
        herb.age += time;
        herb.potency += herb.growthRate * time;
        this._triggerHook('herbGrown', { herbId, newAge: herb.age });
        return { success: true };
    }

    harvestHerb(herbId) {
        const herb = this.herbs.get(herbId);
        if (!herb) return { success: false, error: 'HERB_NOT_FOUND' };
        const id = `hrv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const harvest = { harvestId: id, herbId, herbName: herb.name, potency: herb.potency, harvestedAt: Date.now() };
        this.harvests.set(id, harvest);
        herb.status = 'harvested';
        this._triggerHook('herbHarvested', { herbId });
        return { success: true, harvest };
    }

    getHarvest(id) { return this.harvests.get(id) ? { ...this.harvests.get(id) } : null; }
    listHarvests() { return Array.from(this.harvests.values()).map(h => ({ ...h })); }
    listHarvestsByHerb(herbId) { return Array.from(this.harvests.values()).filter(h => h.herbId === herbId).map(h => ({ ...h })); }

    calculateTotalPotency() { return Array.from(this.harvests.values()).reduce((s, h) => s + h.potency, 0); }
    listMature(threshold = 50) { return this.listByPotency(threshold); }

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
        if (this.stats.totalHerbs < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxHerbs += 100;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { herbs: Array.from(this.herbs.entries()), harvests: Array.from(this.harvests.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.herbs) this.herbs = new Map(data.herbs);
        if (data.harvests) this.harvests = new Map(data.harvests);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, herbCount: this.herbs.size }; }
}