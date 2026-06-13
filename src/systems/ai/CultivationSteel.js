/**
 * CultivationSteel.js - 修真钢系统
 * V854 Iteration 27/30 Round 33
 */
export class CultivationSteel {
    constructor(config = {}) {
        this.config = { maxSteels: config.maxSteels || 20, baseHardness: config.baseHardness || 20, ...config };
        this.steels = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSteels: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSteel', (ctx) => this.getSteel(ctx.steelId));
        this.registerTool('recruitSteel', (ctx) => this.recruitSteel(ctx));
    }

    recruitSteel(data) {
        const id = data.id || `stl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const steel = {
            steelId: id,
            masterId: data.masterId || 'unknown_master',
            name: data.name || 'unnamed_steel',
            type: data.type || 'carbon',
            hardness: data.hardness || this.config.baseHardness,
            alloys: data.alloys || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.steels.set(id, steel);
        this.stats.totalSteels++;
        this._triggerHook('steelRecruited', { steelId: id });
        return { success: true, steel };
    }

    getSteel(id) { return this.steels.get(id) ? { ...this.steels.get(id) } : null; }
    listSteels() { return Array.from(this.steels.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.steels.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.steels.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addAlloy(steelId, alloy) {
        const steel = this.steels.get(steelId);
        if (!steel) return { success: false, error: 'STEEL_NOT_FOUND' };
        steel.alloys.push(alloy);
        if (steel.alloys.length >= 5) steel.status = 'veteran';
        this._triggerHook('alloyAdded', { steelId, alloy });
        return { success: true };
    }

    raiseHardness(steelId, amount = 5) {
        const steel = this.steels.get(steelId);
        if (!steel) return { success: false, error: 'STEEL_NOT_FOUND' };
        steel.hardness += amount;
        this._triggerHook('hardnessRaised', { steelId, newHardness: steel.hardness });
        return { success: true };
    }

    levelUpSteel(steelId) {
        const steel = this.steels.get(steelId);
        if (!steel) return { success: false, error: 'STEEL_NOT_FOUND' };
        steel.level++;
        this._triggerHook('steelLeveledUp', { steelId, newLevel: steel.level });
        return { success: true };
    }

    legendSteel(steelId) {
        const steel = this.steels.get(steelId);
        if (!steel) return { success: false, error: 'STEEL_NOT_FOUND' };
        steel.status = 'legendary';
        this._triggerHook('steelLegendized', { steelId });
        return { success: true };
    }

    calculateSteelValue(steelId) {
        const steel = this.steels.get(steelId);
        if (!steel) return 0;
        return steel.level * 100 + steel.hardness * 2 + steel.alloys.length * 30;
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
        if (this.stats.totalSteels < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSteels += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { steels: Array.from(this.steels.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.steels) this.steels = new Map(data.steels);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, steelCount: this.steels.size }; }
}
