/**
 * BeastBond.js - 灵兽契约系统
 * V327 Iteration 6/9 Round 5
 */
export class BeastBond {
    constructor(config = {}) {
        this.config = { maxBondLevel: config.maxBondLevel || 10, baseBondExp: config.baseBondExp || 50, ...config };
        this.bonds = new Map();
        this.bondTypes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBonds: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const types = [
            { typeId: 'soul', name: 'Soul Bond', maxLevel: 10, benefits: { power: 0.5, loyalty: 1.0 } },
            { typeId: 'blood', name: 'Blood Bond', maxLevel: 10, benefits: { power: 0.3, hp: 0.5 } },
            { typeId: 'spirit', name: 'Spirit Bond', maxLevel: 5, benefits: { cultivation: 0.2 } }
        ];
        for (const t of types) this.bondTypes.set(t.typeId, t);
    }

    _registerDefaultTools() {
        this.registerTool('getBond', (ctx) => this.getBond(ctx.bondId));
        this.registerTool('listBonds', () => Array.from(this.bonds.values()).map(b => ({...b})));
    }

    createBond(data) {
        const id = data.id || `bnd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const type = this.bondTypes.get(data.typeId);
        if (!type) return { success: false, error: 'TYPE_NOT_FOUND' };
        const bond = { bondId: id, typeId: data.typeId, cultivatorId: data.cultivatorId, beastId: data.beastId, level: 1, exp: 0, createdAt: Date.now() };
        this.bonds.set(id, bond);
        this.stats.totalBonds++;
        this._triggerHook('bondCreated', { bondId: id });
        return { success: true, bond };
    }

    getBond(id) { return this.bonds.get(id) ? { ...this.bonds.get(id) } : null; }
    listBonds() { return Array.from(this.bonds.values()).map(b => ({ ...b })); }
    getBondsByCultivator(cultivatorId) {
        return Array.from(this.bonds.values()).filter(b => b.cultivatorId === cultivatorId).map(b => ({ ...b }));
    }

    strengthenBond(bondId, amount) {
        const bond = this.bonds.get(bondId);
        if (!bond) return { success: false, error: 'BOND_NOT_FOUND' };
        const type = this.bondTypes.get(bond.typeId);
        bond.exp += amount;
        const required = this._expRequired(bond.level);
        while (bond.exp >= required && bond.level < type.maxLevel) {
            bond.exp -= required;
            bond.level++;
            this._triggerHook('bondLevelUp', { bondId, newLevel: bond.level });
        }
        this._triggerHook('bondStrengthened', { bondId, amount });
        return { success: true, bond: { ...bond } };
    }

    _expRequired(level) {
        return Math.floor(this.config.baseBondExp * Math.pow(1.5, level - 1));
    }

    severBond(bondId) {
        const bond = this.bonds.get(bondId);
        if (!bond) return { success: false, error: 'BOND_NOT_FOUND' };
        this.bonds.delete(bondId);
        this._triggerHook('bondSevered', { bondId });
        return { success: true };
    }

    getBondBenefits(bondId) {
        const bond = this.bonds.get(bondId);
        if (!bond) return null;
        const type = this.bondTypes.get(bond.typeId);
        const levelMultiplier = bond.level / type.maxLevel;
        const benefits = {};
        for (const [k, v] of Object.entries(type.benefits)) {
            benefits[k] = v * levelMultiplier;
        }
        return benefits;
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
        this.config.baseBondExp = Math.max(10, this.config.baseBondExp - 5);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { bonds: Array.from(this.bonds.entries()), bondTypes: Array.from(this.bondTypes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.bonds) this.bonds = new Map(data.bonds);
        if (data.bondTypes) this.bondTypes = new Map(data.bondTypes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, bondCount: this.bonds.size, typeCount: this.bondTypes.size }; }
}