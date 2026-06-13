/**
 * CultivationPrana.js - 修真气息系统
 * V726 Iteration 19/30 Round 29
 */
export class CultivationPrana {
    constructor(config = {}) {
        this.config = { maxPranas: config.maxPranas || 20, baseVitality: config.baseVitality || 20, ...config };
        this.pranas = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPranas: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPrana', (ctx) => this.getPrana(ctx.pranaId));
        this.registerTool('recruitPrana', (ctx) => this.recruitPrana(ctx));
    }

    recruitPrana(data) {
        const id = data.pranaId || `prn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const prana = { pranaId: id, masterId: data.masterId, name: data.name || 'Mystic Prana', type: data.type || 'breath', vitality: data.vitality || this.config.baseVitality, breaths: data.breaths || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.pranas.set(id, prana);
        this.stats.totalPranas++;
        this._triggerHook('pranaRecruited', { pranaId: id });
        return { success: true, prana };
    }

    getPrana(id) { return this.pranas.get(id) ? { ...this.pranas.get(id) } : null; }
    listPranas() { return Array.from(this.pranas.values()).map(p => ({ ...p })); }
    listByMaster(masterId) { return Array.from(this.pranas.values()).filter(p => p.masterId === masterId).map(p => ({ ...p })); }
    listLegendary() { return Array.from(this.pranas.values()).filter(p => p.status === 'legendary').map(p => ({ ...p })); }

    addBreath(pranaId, breath) {
        const prana = this.pranas.get(pranaId);
        if (!prana) return { success: false, error: 'PRANA_NOT_FOUND' };
        prana.breaths.push(breath);
        this._triggerHook('breathAdded', { pranaId, breath });
        return { success: true };
    }

    raiseVitality(pranaId, amount = 5) {
        const prana = this.pranas.get(pranaId);
        if (!prana) return { success: false, error: 'PRANA_NOT_FOUND' };
        prana.vitality += amount;
        this._triggerHook('vitalityRaised', { pranaId, newVitality: prana.vitality });
        return { success: true };
    }

    levelUpPrana(pranaId) {
        const prana = this.pranas.get(pranaId);
        if (!prana) return { success: false, error: 'PRANA_NOT_FOUND' };
        prana.level++;
        this._triggerHook('pranaLeveledUp', { pranaId, newLevel: prana.level });
        return { success: true };
    }

    legendPrana(pranaId) {
        const prana = this.pranas.get(pranaId);
        if (!prana) return { success: false, error: 'PRANA_NOT_FOUND' };
        prana.status = 'legendary';
        this._triggerHook('pranaLegendized', { pranaId });
        return { success: true };
    }

    calculatePranaValue(pranaId) {
        const prana = this.pranas.get(pranaId);
        if (!prana) return 0;
        return prana.level * 100 + prana.vitality * 2 + prana.breaths.length * 30;
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
        if (this.stats.totalPranas < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPranas += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { pranas: Array.from(this.pranas.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.pranas) this.pranas = new Map(data.pranas);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, pranaCount: this.pranas.size }; }
}
