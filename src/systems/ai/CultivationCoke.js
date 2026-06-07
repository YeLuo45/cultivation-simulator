/**
 * CultivationCoke.js - 修真焦炭系统
 * V851 Iteration 24/30 Round 33
 */
export class CultivationCoke {
    constructor(config = {}) {
        this.config = { maxCokes: config.maxCokes || 20, baseHeat: config.baseHeat || 20, ...config };
        this.cokes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCokes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCoke', (ctx) => this.getCoke(ctx.cokeId));
        this.registerTool('recruitCoke', (ctx) => this.recruitCoke(ctx));
    }

    recruitCoke(data) {
        const id = data.id || `cok_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const coke = {
            cokeId: id,
            masterId: data.masterId || 'unknown_master',
            name: data.name || 'unnamed_coke',
            type: data.type || 'metallurgical',
            heat: data.heat || this.config.baseHeat,
            slags: data.slags || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.cokes.set(id, coke);
        this.stats.totalCokes++;
        this._triggerHook('cokeRecruited', { cokeId: id });
        return { success: true, coke };
    }

    getCoke(id) { return this.cokes.get(id) ? { ...this.cokes.get(id) } : null; }
    listCokes() { return Array.from(this.cokes.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.cokes.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.cokes.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addSlag(cokeId, slag) {
        const coke = this.cokes.get(cokeId);
        if (!coke) return { success: false, error: 'COKE_NOT_FOUND' };
        coke.slags.push(slag);
        if (coke.slags.length >= 5) coke.status = 'veteran';
        this._triggerHook('slagAdded', { cokeId, slag });
        return { success: true };
    }

    raiseHeat(cokeId, amount = 5) {
        const coke = this.cokes.get(cokeId);
        if (!coke) return { success: false, error: 'COKE_NOT_FOUND' };
        coke.heat += amount;
        this._triggerHook('heatRaised', { cokeId, newHeat: coke.heat });
        return { success: true };
    }

    levelUpCoke(cokeId) {
        const coke = this.cokes.get(cokeId);
        if (!coke) return { success: false, error: 'COKE_NOT_FOUND' };
        coke.level++;
        this._triggerHook('cokeLeveledUp', { cokeId, newLevel: coke.level });
        return { success: true };
    }

    legendCoke(cokeId) {
        const coke = this.cokes.get(cokeId);
        if (!coke) return { success: false, error: 'COKE_NOT_FOUND' };
        coke.status = 'legendary';
        this._triggerHook('cokeLegendized', { cokeId });
        return { success: true };
    }

    calculateCokeValue(cokeId) {
        const coke = this.cokes.get(cokeId);
        if (!coke) return 0;
        return coke.level * 100 + coke.heat * 2 + coke.slags.length * 30;
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
        if (this.stats.totalCokes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCokes += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { cokes: Array.from(this.cokes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.cokes) this.cokes = new Map(data.cokes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cokeCount: this.cokes.size }; }
}
