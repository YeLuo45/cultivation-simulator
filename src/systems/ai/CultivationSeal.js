/**
 * CultivationSeal.js - 修真封印系统
 * V758 Iteration 21/30 Round 30 - Cultivation Seal
 */

export class CultivationSeal {
    constructor(config = {}) {
        this.config = { maxSeals: config.maxSeals || 20, basePotency: config.basePotency || 20, ...config };
        this.seals = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSeals: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSeal', (ctx) => this.getSeal(ctx.sealId));
        this.registerTool('recruitSeal', (ctx) => this.recruitSeal(ctx));
    }

    recruitSeal(data) {
        const id = data.sealId || `seal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const seal = {
            sealId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Seal',
            type: data.type || 'binding',
            potency: data.potency || this.config.basePotency,
            chains: data.chains || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.seals.set(id, seal);
        this.stats.totalSeals++;
        this._triggerHook('sealRecruited', { sealId: id });
        return { success: true, seal };
    }

    getSeal(id) { return this.seals.get(id) ? { ...this.seals.get(id) } : null; }
    listSeals() { return Array.from(this.seals.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.seals.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.seals.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addChain(sealId, chain) {
        const seal = this.seals.get(sealId);
        if (!seal) return { success: false, error: 'SEAL_NOT_FOUND' };
        seal.chains.push(chain);
        this._triggerHook('chainAdded', { sealId, chain });
        return { success: true, seal: { ...seal } };
    }

    raisePotency(sealId, amount = 5) {
        const seal = this.seals.get(sealId);
        if (!seal) return { success: false, error: 'SEAL_NOT_FOUND' };
        seal.potency += amount;
        this._triggerHook('potencyRaised', { sealId, newPotency: seal.potency });
        return { success: true };
    }

    levelUpSeal(sealId) {
        const seal = this.seals.get(sealId);
        if (!seal) return { success: false, error: 'SEAL_NOT_FOUND' };
        seal.level++;
        this._triggerHook('sealLeveledUp', { sealId, newLevel: seal.level });
        return { success: true };
    }

    legendSeal(sealId) {
        const seal = this.seals.get(sealId);
        if (!seal) return { success: false, error: 'SEAL_NOT_FOUND' };
        seal.status = 'legendary';
        this._triggerHook('sealLegendized', { sealId });
        return { success: true };
    }

    calculateSealValue(sealId) {
        const seal = this.seals.get(sealId);
        if (!seal) return 0;
        return seal.level * 100 + seal.potency * 2 + seal.chains.length * 30;
    }

    listByType(type) { return Array.from(this.seals.values()).filter(s => s.type === type).map(s => ({ ...s })); }
    listVeteran() { return Array.from(this.seals.values()).filter(s => s.status === 'veteran').map(s => ({ ...s })); }

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
        if (this.stats.totalSeals < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSeals += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { seals: Array.from(this.seals.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.seals) this.seals = new Map(data.seals);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, sealCount: this.seals.size }; }
}
