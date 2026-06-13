/**
 * CultivationCopper.js - 修真铜系统
 * V855 Iteration 28/30 Round 33
 */
export class CultivationCopper {
    constructor(config = {}) {
        this.config = { maxCoppers: config.maxCoppers || 20, baseConductivity: config.baseConductivity || 20, ...config };
        this.coppers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCoppers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCopper', (ctx) => this.getCopper(ctx.copperId));
        this.registerTool('recruitCopper', (ctx) => this.recruitCopper(ctx));
    }

    recruitCopper(data = {}) {
        if (this.coppers.size >= this.config.maxCoppers) {
            return { success: false, error: 'MAX_COPPERS_REACHED' };
        }
        const id = data.copperId || `cop_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const copper = {
            copperId: id,
            masterId: data.masterId || null,
            name: data.name || `Copper-${id.slice(-5)}`,
            type: data.type || 'pure',
            conductivity: data.conductivity !== undefined ? data.conductivity : this.config.baseConductivity,
            ores: Array.isArray(data.ores) ? [...data.ores] : [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.coppers.set(id, copper);
        this.stats.totalCoppers++;
        this._triggerHook('copperRecruited', { copperId: id, masterId: copper.masterId });
        return { success: true, copper };
    }

    getCopper(id) { return this.coppers.get(id) ? { ...this.coppers.get(id) } : null; }
    listCoppers() { return Array.from(this.coppers.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.coppers.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.coppers.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addOre(copperId, ore) {
        const copper = this.coppers.get(copperId);
        if (!copper) return { success: false, error: 'COPPER_NOT_FOUND' };
        copper.ores.push(ore);
        this._triggerHook('oreAdded', { copperId, ore, totalOres: copper.ores.length });
        return { success: true };
    }

    raiseConductivity(copperId, amount = 5) {
        const copper = this.coppers.get(copperId);
        if (!copper) return { success: false, error: 'COPPER_NOT_FOUND' };
        copper.conductivity += amount;
        this._triggerHook('conductivityRaised', { copperId, newConductivity: copper.conductivity });
        return { success: true };
    }

    levelUpCopper(copperId) {
        const copper = this.coppers.get(copperId);
        if (!copper) return { success: false, error: 'COPPER_NOT_FOUND' };
        copper.level++;
        this._triggerHook('copperLeveledUp', { copperId, newLevel: copper.level });
        return { success: true };
    }

    legendCopper(copperId) {
        const copper = this.coppers.get(copperId);
        if (!copper) return { success: false, error: 'COPPER_NOT_FOUND' };
        copper.status = 'legendary';
        this._triggerHook('copperLegendized', { copperId });
        return { success: true };
    }

    calculateCopperValue(copperId) {
        const copper = this.coppers.get(copperId);
        if (!copper) return 0;
        return copper.level * 100 + copper.conductivity * 2 + copper.ores.length * 30;
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
        if (this.stats.totalCoppers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCoppers += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { coppers: Array.from(this.coppers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.coppers) this.coppers = new Map(data.coppers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, copperCount: this.coppers.size }; }
}
