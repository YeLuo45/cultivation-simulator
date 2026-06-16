/**
 * MasterApprentice.js - 师徒系统
 * V475 Iteration 7/15 Round 18 - Master-Apprentice Bond System
 *
 * 融合6大设计系统:
 * - generic-agent: 师徒循环
 * - chatdev: 师徒协调
 * - nanobot: 师徒mesh
 * - claude-code: 师徒工具
 * - thunderbolt: 师徒持久化
 * - ruflo: 师徒Hook
 */

export class MasterApprentice {
    constructor(config = {}) {
        this.config = { maxBonds: config.maxBonds || 100, baseIntimacy: config.baseIntimacy || 10, ...config };
        this.bonds = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBonds: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBond', (ctx) => this.getBond(ctx.bondId));
        this.registerTool('formBond', (ctx) => this.formBond(ctx));
    }

    formBond(data) {
        const id = data.id || `bnd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const bond = {
            bondId: id,
            masterId: data.masterId,
            apprenticeId: data.apprenticeId,
            dao: data.dao || 'sword',
            intimacy: data.intimacy || this.config.baseIntimacy,
            duration: data.duration || 0,
            mastery: data.mastery || 0,
            status: 'proposed',
            createdAt: Date.now()
        };
        this.bonds.set(id, bond);
        this.stats.totalBonds++;
        this._triggerHook('bondFormed', { bondId: id });
        return { success: true, bond };
    }

    getBond(id) { return this.bonds.get(id) ? { ...this.bonds.get(id) } : null; }
    listBonds() { return Array.from(this.bonds.values()).map(b => ({ ...b })); }
    listByMaster(masterId) { return Array.from(this.bonds.values()).filter(b => b.masterId === masterId).map(b => ({ ...b })); }
    listByApprentice(apprenticeId) { return Array.from(this.bonds.values()).filter(b => b.apprenticeId === apprenticeId).map(b => ({ ...b })); }

    strengthenBond(bondId, amount = 5) {
        const bond = this.bonds.get(bondId);
        if (!bond) return { success: false, error: 'BOND_NOT_FOUND' };
        bond.intimacy += amount;
        if (bond.status === 'proposed' && bond.intimacy > 0) bond.status = 'active';
        this._triggerHook('bondStrengthened', { bondId, newIntimacy: bond.intimacy });
        return { success: true };
    }

    extendDuration(bondId, amount = 30) {
        const bond = this.bonds.get(bondId);
        if (!bond) return { success: false, error: 'BOND_NOT_FOUND' };
        bond.duration += amount;
        if (bond.status === 'proposed') bond.status = 'active';
        this._triggerHook('durationExtended', { bondId, newDuration: bond.duration });
        return { success: true };
    }

    teachApprentice(bondId, technique) {
        const bond = this.bonds.get(bondId);
        if (!bond) return { success: false, error: 'BOND_NOT_FOUND' };
        bond.mastery += 1;
        bond.lastTechnique = technique;
        this._triggerHook('apprenticeTaught', { bondId, technique, newMastery: bond.mastery });
        return { success: true };
    }

    severBond(bondId) {
        const bond = this.bonds.get(bondId);
        if (!bond) return { success: false, error: 'BOND_NOT_FOUND' };
        bond.status = 'severed';
        this._triggerHook('bondSevered', { bondId });
        return { success: true };
    }

    calculateBondStrength(bondId) {
        const bond = this.bonds.get(bondId);
        if (!bond) return 0;
        return bond.intimacy * 2 + bond.duration / 10 + bond.dao.length;
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
        if (this.stats.totalBonds < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBonds += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { bonds: Array.from(this.bonds.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.bonds) this.bonds = new Map(data.bonds);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, bondCount: this.bonds.size }; }
}
