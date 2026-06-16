/**
 * CultivationGranite.js - 修真花岗岩
 * V841 Iteration 14/30 Round 33
 */
export class CultivationGranite {
    constructor(config = {}) {
        this.config = { maxGranites: config.maxGranites || 20, baseHardness: config.baseHardness || 20, ...config };
        this.granites = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGranites: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getGranite', (ctx) => this.getGranite(ctx.graniteId));
        this.registerTool('recruitGranite', (ctx) => this.recruitGranite(ctx));
    }

    recruitGranite(data) {
        const id = data.graniteId || `grn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const granite = { graniteId: id, masterId: data.masterId, name: data.name || 'unnamed', type: data.type || 'white', hardness: data.hardness || this.config.baseHardness, flecks: data.flecks || [], level: 1, status: 'novice', createdAt: Date.now() };
        this.granites.set(id, granite);
        this.stats.totalGranites++;
        this._triggerHook('graniteRecruited', { graniteId: id });
        return { success: true, granite };
    }

    getGranite(id) { return this.granites.get(id) ? { ...this.granites.get(id) } : null; }
    listGranites() { return Array.from(this.granites.values()).map(g => ({ ...g })); }
    listByMaster(masterId) { return Array.from(this.granites.values()).filter(g => g.masterId === masterId).map(g => ({ ...g })); }
    listLegendary() { return Array.from(this.granites.values()).filter(g => g.status === 'legendary').map(g => ({ ...g })); }

    addFleck(graniteId, fleck) {
        const granite = this.granites.get(graniteId);
        if (!granite) return { success: false, error: 'GRANITE_NOT_FOUND' };
        granite.flecks.push(fleck);
        this._triggerHook('fleckAdded', { graniteId, fleck });
        return { success: true };
    }

    raiseHardness(graniteId, amount = 5) {
        const granite = this.granites.get(graniteId);
        if (!granite) return { success: false, error: 'GRANITE_NOT_FOUND' };
        granite.hardness += amount;
        this._triggerHook('hardnessRaised', { graniteId, newHardness: granite.hardness });
        return { success: true };
    }

    levelUpGranite(graniteId) {
        const granite = this.granites.get(graniteId);
        if (!granite) return { success: false, error: 'GRANITE_NOT_FOUND' };
        granite.level++;
        this._triggerHook('graniteLeveledUp', { graniteId, newLevel: granite.level });
        return { success: true };
    }

    legendGranite(graniteId) {
        const granite = this.granites.get(graniteId);
        if (!granite) return { success: false, error: 'GRANITE_NOT_FOUND' };
        granite.status = 'legendary';
        this._triggerHook('graniteLegendized', { graniteId });
        return { success: true };
    }

    calculateGraniteValue(graniteId) {
        const granite = this.granites.get(graniteId);
        if (!granite) return 0;
        return granite.level * 100 + granite.hardness * 2 + granite.flecks.length * 30;
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
        if (this.stats.totalGranites < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxGranites += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { granites: Array.from(this.granites.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.granites) this.granites = new Map(data.granites);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, graniteCount: this.granites.size }; }
}
