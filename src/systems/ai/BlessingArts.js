/**
 * BlessingArts.js - 祝福术系统
 * V458 Iteration 5/15 Round 17 - Blessing Arts
 */

export class BlessingArts {
    constructor(config = {}) {
        this.config = { maxBlessings: config.maxBlessings || 100, basePower: config.basePower || 20, ...config };
        this.blessings = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBlessings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBlessing', (ctx) => this.getBlessing(ctx.blessingId));
        this.registerTool('conferBlessing', (ctx) => this.conferBlessing(ctx));
    }

    conferBlessing(data) {
        const id = data.id || `bls_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const blessing = { blessingId: id, granterId: data.granterId, name: data.name, type: data.type || 'luck', power: data.power || this.config.basePower, beneficiaries: data.beneficiaries || [], status: 'conferred', createdAt: Date.now() };
        this.blessings.set(id, blessing);
        this.stats.totalBlessings++;
        this._triggerHook('blessingConferred', { blessingId: id });
        return { success: true, blessing };
    }

    getBlessing(id) { return this.blessings.get(id) ? { ...this.blessings.get(id) } : null; }
    listBlessings() { return Array.from(this.blessings.values()).map(b => ({ ...b })); }
    listByGranter(granterId) { return Array.from(this.blessings.values()).filter(b => b.granterId === granterId).map(b => ({ ...b })); }
    listByType(type) { return Array.from(this.blessings.values()).filter(b => b.type === type).map(b => ({ ...b })); }

    empowerBlessing(blessingId, amount = 5) {
        const blessing = this.blessings.get(blessingId);
        if (!blessing) return { success: false, error: 'BLESSING_NOT_FOUND' };
        blessing.power += amount;
        this._triggerHook('blessingEmpowered', { blessingId, newPower: blessing.power });
        return { success: true };
    }

    addBeneficiary(blessingId, person) {
        const blessing = this.blessings.get(blessingId);
        if (!blessing) return { success: false, error: 'BLESSING_NOT_FOUND' };
        if (!blessing.beneficiaries.includes(person)) blessing.beneficiaries.push(person);
        this._triggerHook('beneficiaryAdded', { blessingId, person });
        return { success: true };
    }

    bless(blessingId) {
        const blessing = this.blessings.get(blessingId);
        if (!blessing) return { success: false, error: 'BLESSING_NOT_FOUND' };
        blessing.status = 'active';
        this._triggerHook('blessingActivated', { blessingId });
        return { success: true };
    }

    calculateBlessingPower(blessingId) {
        const blessing = this.blessings.get(blessingId);
        if (!blessing) return 0;
        return blessing.power * (1 + blessing.beneficiaries.length / 5);
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
        if (this.stats.totalBlessings < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBlessings += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { blessings: Array.from(this.blessings.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.blessings) this.blessings = new Map(data.blessings);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, blessingCount: this.blessings.size }; }
}
