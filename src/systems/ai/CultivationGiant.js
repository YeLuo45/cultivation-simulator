/**
 * CultivationGiant.js - 修真巨人系统
 * V676 Iteration 29/30 Round 27
 */
export class CultivationGiant {
    constructor(config = {}) {
        this.config = { maxGiants: config.maxGiants || 20, baseStrength: config.baseStrength || 20, ...config };
        this.giants = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGiants: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getGiant', (ctx) => this.getGiant(ctx.giantId));
        this.registerTool('recruitGiant', (ctx) => this.recruitGiant(ctx));
    }

    recruitGiant(data) {
        const id = data.giantId || `giant_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const giant = { giantId: id, masterId: data.masterId, name: data.name, type: data.type || 'stone', strength: data.strength || this.config.baseStrength, boulders: data.boulders || [], level: 1, status: 'novice', createdAt: Date.now() };
        this.giants.set(id, giant);
        this.stats.totalGiants++;
        this._triggerHook('giantRecruited', { giantId: id });
        return { success: true, giant };
    }

    getGiant(id) { return this.giants.get(id) ? { ...this.giants.get(id) } : null; }
    listGiants() { return Array.from(this.giants.values()).map(g => ({ ...g })); }
    listByMaster(masterId) { return Array.from(this.giants.values()).filter(g => g.masterId === masterId).map(g => ({ ...g })); }
    listLegendary() { return Array.from(this.giants.values()).filter(g => g.status === 'legendary').map(g => ({ ...g })); }

    addBoulder(giantId, boulder) {
        const giant = this.giants.get(giantId);
        if (!giant) return { success: false, error: 'GIANT_NOT_FOUND' };
        giant.boulders.push(boulder);
        this._triggerHook('boulderAdded', { giantId, boulder });
        return { success: true };
    }

    raiseStrength(giantId, amount = 5) {
        const giant = this.giants.get(giantId);
        if (!giant) return { success: false, error: 'GIANT_NOT_FOUND' };
        giant.strength += amount;
        this._triggerHook('strengthRaised', { giantId, newStrength: giant.strength });
        return { success: true };
    }

    levelUpGiant(giantId) {
        const giant = this.giants.get(giantId);
        if (!giant) return { success: false, error: 'GIANT_NOT_FOUND' };
        giant.level++;
        this._triggerHook('giantLeveledUp', { giantId, newLevel: giant.level });
        return { success: true };
    }

    legendGiant(giantId) {
        const giant = this.giants.get(giantId);
        if (!giant) return { success: false, error: 'GIANT_NOT_FOUND' };
        giant.status = 'legendary';
        this._triggerHook('giantLegendized', { giantId });
        return { success: true };
    }

    calculateGiantValue(giantId) {
        const giant = this.giants.get(giantId);
        if (!giant) return 0;
        return giant.level * 100 + giant.strength * 2 + giant.boulders.length * 30;
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
        if (this.stats.totalGiants < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxGiants += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { giants: Array.from(this.giants.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.giants) this.giants = new Map(data.giants);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, giantCount: this.giants.size }; }
}
