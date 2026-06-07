/**
 * CultivationResonance.js - 修真共鸣
 * V746 Iteration 9/30 Round 30
 */
export class CultivationResonance {
    constructor(config = {}) {
        this.config = { maxResonances: config.maxResonances || 20, baseHarmony: config.baseHarmony || 20, ...config };
        this.resonances = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalResonances: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getResonance', (ctx) => this.getResonance(ctx.resonanceId));
        this.registerTool('recruitResonance', (ctx) => this.recruitResonance(ctx));
    }

    recruitResonance(data) {
        const id = data.id || `res_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const resonance = {
            resonanceId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed',
            type: data.type || 'harmonic',
            harmony: data.harmony || this.config.baseHarmony,
            echoes: data.echoes || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.resonances.set(id, resonance);
        this.stats.totalResonances++;
        this._triggerHook('resonanceRecruited', { resonanceId: id });
        return { success: true, resonance };
    }

    getResonance(id) { return this.resonances.get(id) ? { ...this.resonances.get(id) } : null; }
    listResonances() { return Array.from(this.resonances.values()).map(r => ({ ...r })); }
    listByMaster(masterId) { return Array.from(this.resonances.values()).filter(r => r.masterId === masterId).map(r => ({ ...r })); }
    listLegendary() { return Array.from(this.resonances.values()).filter(r => r.status === 'legendary').map(r => ({ ...r })); }

    addEcho(resonanceId, echo) {
        const resonance = this.resonances.get(resonanceId);
        if (!resonance) return { success: false, error: 'RESONANCE_NOT_FOUND' };
        resonance.echoes.push(echo);
        if (resonance.echoes.length >= 3 && resonance.status === 'novice') resonance.status = 'veteran';
        this._triggerHook('echoAdded', { resonanceId, echo });
        return { success: true };
    }

    raiseHarmony(resonanceId, amount = 5) {
        const resonance = this.resonances.get(resonanceId);
        if (!resonance) return { success: false, error: 'RESONANCE_NOT_FOUND' };
        resonance.harmony += amount;
        this._triggerHook('harmonyRaised', { resonanceId, newHarmony: resonance.harmony });
        return { success: true };
    }

    levelUpResonance(resonanceId) {
        const resonance = this.resonances.get(resonanceId);
        if (!resonance) return { success: false, error: 'RESONANCE_NOT_FOUND' };
        resonance.level++;
        this._triggerHook('resonanceLeveledUp', { resonanceId, newLevel: resonance.level });
        return { success: true };
    }

    legendResonance(resonanceId) {
        const resonance = this.resonances.get(resonanceId);
        if (!resonance) return { success: false, error: 'RESONANCE_NOT_FOUND' };
        resonance.status = 'legendary';
        this._triggerHook('resonanceLegendized', { resonanceId });
        return { success: true };
    }

    calculateResonanceValue(resonanceId) {
        const resonance = this.resonances.get(resonanceId);
        if (!resonance) return 0;
        return resonance.level * 100 + resonance.harmony * 2 + resonance.echoes.length * 30;
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
        if (this.stats.totalResonances < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxResonances += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { resonances: Array.from(this.resonances.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.resonances) this.resonances = new Map(data.resonances);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, resonanceCount: this.resonances.size }; }
}
