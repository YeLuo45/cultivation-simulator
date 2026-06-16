/**
 * MarriageSystem.js - 双修婚姻
 * V436 Iteration 13/15 Round 15 - Dual Cultivation Marriage System
 *
 * 融合6大设计系统:
 * - generic-agent: 双修循环
 * - chatdev: 双修协调
 * - nanobot: 双修mesh
 * - claude-code: 双修工具
 * - thunderbolt: 双修持久化
 * - ruflo: 双修Hook
 */

export class MarriageSystem {
    constructor(config = {}) {
        this.config = { maxMarriages: config.maxMarriages || 50, baseBondStrength: config.baseBondStrength || 10, ...config };
        this.marriages = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMarriages: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMarriage', (ctx) => this.getMarriage(ctx.marriageId));
        this.registerTool('proposeMarriage', (ctx) => this.proposeMarriage(ctx));
    }

    proposeMarriage(data) {
        const id = data.id || `mrg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const marriage = {
            marriageId: id,
            partner1: data.partner1,
            partner2: data.partner2,
            dao: data.dao || 'sword',
            resonance: data.resonance || 0,
            status: 'proposed',
            bondStrength: data.bondStrength || this.config.baseBondStrength,
            createdAt: Date.now()
        };
        this.marriages.set(id, marriage);
        this.stats.totalMarriages++;
        this._triggerHook('marriageProposed', { marriageId: id });
        return { success: true, marriage };
    }

    getMarriage(id) { return this.marriages.get(id) ? { ...this.marriages.get(id) } : null; }
    listMarriages() { return Array.from(this.marriages.values()).map(m => ({ ...m })); }
    listByPartner(partnerId) { return Array.from(this.marriages.values()).filter(m => m.partner1 === partnerId || m.partner2 === partnerId).map(m => ({ ...m })); }
    listBonded() { return Array.from(this.marriages.values()).filter(m => m.status === 'bonded').map(m => ({ ...m })); }

    increaseResonance(marriageId, amount = 5) {
        const marriage = this.marriages.get(marriageId);
        if (!marriage) return { success: false, error: 'MARRIAGE_NOT_FOUND' };
        marriage.resonance += amount;
        this._triggerHook('resonanceIncreased', { marriageId, newResonance: marriage.resonance });
        return { success: true };
    }

    dualCultivate(marriageId, amount = 10) {
        const marriage = this.marriages.get(marriageId);
        if (!marriage) return { success: false, error: 'MARRIAGE_NOT_FOUND' };
        marriage.bondStrength += amount;
        if (marriage.status === 'proposed') marriage.status = 'bonded';
        this._triggerHook('dualCultivationPerformed', { marriageId, newBondStrength: marriage.bondStrength });
        return { success: true };
    }

    severMarriage(marriageId) {
        const marriage = this.marriages.get(marriageId);
        if (!marriage) return { success: false, error: 'MARRIAGE_NOT_FOUND' };
        marriage.status = 'severed';
        this._triggerHook('marriageSevered', { marriageId });
        return { success: true };
    }

    calculateHarmonicPower(marriageId) {
        const marriage = this.marriages.get(marriageId);
        if (!marriage) return 0;
        return marriage.bondStrength * (1 + marriage.resonance / 100) + marriage.dao.length;
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
        if (this.stats.totalMarriages < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMarriages += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { marriages: Array.from(this.marriages.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.marriages) this.marriages = new Map(data.marriages);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, marriageCount: this.marriages.size }; }
}
