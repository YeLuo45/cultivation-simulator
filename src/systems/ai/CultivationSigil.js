/**
 * CultivationSigil.js - 修真印记系统
 * V759 Iteration 22/30 Round 30 - Cultivation Sigil
 */

export class CultivationSigil {
    constructor(config = {}) {
        this.config = { maxSigils: config.maxSigils || 20, baseStrength: config.baseStrength || 20, ...config };
        this.sigils = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSigils: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSigil', (ctx) => this.getSigil(ctx.sigilId));
        this.registerTool('recruitSigil', (ctx) => this.recruitSigil(ctx));
    }

    recruitSigil(data) {
        const id = data.sigilId || `sigil_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const sigil = {
            sigilId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Sigil',
            type: data.type || 'personal',
            strength: data.strength || this.config.baseStrength,
            marks: data.marks || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.sigils.set(id, sigil);
        this.stats.totalSigils++;
        this._triggerHook('sigilRecruited', { sigilId: id });
        return { success: true, sigil };
    }

    getSigil(id) { return this.sigils.get(id) ? { ...this.sigils.get(id) } : null; }
    listSigils() { return Array.from(this.sigils.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.sigils.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.sigils.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addMark(sigilId, mark) {
        const sigil = this.sigils.get(sigilId);
        if (!sigil) return { success: false, error: 'SIGIL_NOT_FOUND' };
        sigil.marks.push(mark);
        this._triggerHook('markAdded', { sigilId, mark });
        return { success: true, sigil: { ...sigil } };
    }

    raiseStrength(sigilId, amount = 5) {
        const sigil = this.sigils.get(sigilId);
        if (!sigil) return { success: false, error: 'SIGIL_NOT_FOUND' };
        sigil.strength += amount;
        this._triggerHook('strengthRaised', { sigilId, newStrength: sigil.strength });
        return { success: true };
    }

    levelUpSigil(sigilId) {
        const sigil = this.sigils.get(sigilId);
        if (!sigil) return { success: false, error: 'SIGIL_NOT_FOUND' };
        sigil.level++;
        this._triggerHook('sigilLeveledUp', { sigilId, newLevel: sigil.level });
        return { success: true };
    }

    legendSigil(sigilId) {
        const sigil = this.sigils.get(sigilId);
        if (!sigil) return { success: false, error: 'SIGIL_NOT_FOUND' };
        sigil.status = 'legendary';
        this._triggerHook('sigilLegendized', { sigilId });
        return { success: true };
    }

    calculateSigilValue(sigilId) {
        const sigil = this.sigils.get(sigilId);
        if (!sigil) return 0;
        return sigil.level * 100 + sigil.strength * 2 + sigil.marks.length * 30;
    }

    listByType(type) { return Array.from(this.sigils.values()).filter(s => s.type === type).map(s => ({ ...s })); }
    listVeteran() { return Array.from(this.sigils.values()).filter(s => s.status === 'veteran').map(s => ({ ...s })); }

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
        if (this.stats.totalSigils < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSigils += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { sigils: Array.from(this.sigils.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.sigils) this.sigils = new Map(data.sigils);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, sigilCount: this.sigils.size }; }
}
