/**
 * BondEvolutionEngine.js - 羁绊进化引擎
 * V308 Iteration 5/9 - Bond Evolution Engine
 */
export class BondEvolutionEngine {
    constructor(config = {}) {
        this.config = {
            maxEvolutionLevel: config.maxEvolutionLevel || 5,
            baseExpRequired: config.baseExpRequired || 100,
            evolutionMultiplier: config.evolutionMultiplier || 1.5,
            ...config
        };
        this.bonds = new Map();
        this.evolutionPaths = new Map();
        this.history = [];
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEvolutions: 0, evolutionCount: 0 };
        this._registerDefaultPaths();
        this._registerDefaultTools();
    }

    _registerDefaultPaths() {
        const paths = [
            { pathId: 'soulmate', name: 'Soulmate Path', maxLevel: 5, bonuses: { bondGain: 0.2, harmonyGain: 0.1 } },
            { pathId: 'dao_partner', name: 'Dao Partner Path', maxLevel: 5, bonuses: { cultivationGain: 0.3, comprehensionGain: 0.1 } },
            { pathId: 'twin_flame', name: 'Twin Flame Path', maxLevel: 5, bonuses: { combatPower: 0.4, soulResonance: 0.2 } }
        ];
        for (const p of paths) this.evolutionPaths.set(p.pathId, p);
    }

    _registerDefaultTools() {
        this.registerTool('getEvolutionStatus', (ctx) => this.getBond(ctx.bondId));
        this.registerTool('listPaths', () => Array.from(this.evolutionPaths.values()));
    }

    createBond(data) {
        const id = data.id || `bond_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const bond = {
            bondId: id, level: 0, exp: 0, pathId: data.pathId || 'soulmate',
            companions: data.companions || [], createdAt: Date.now()
        };
        this.bonds.set(id, bond);
        return { success: true, bond };
    }

    getBond(bondId) { const b = this.bonds.get(bondId); return b ? { ...b } : null; }
    listBonds() { return Array.from(this.bonds.values()).map(b => ({ ...b })); }

    addExp(bondId, amount) {
        const bond = this.bonds.get(bondId);
        if (!bond) return { success: false, error: 'BOND_NOT_FOUND' };
        bond.exp += amount;
        this._triggerHook('expGained', { bondId, amount, total: bond.exp });
        // Auto-evolve check
        const required = this._expRequired(bond.level);
        if (bond.exp >= required && bond.level < this.config.maxEvolutionLevel) {
            return this.evolveBond(bondId);
        }
        return { success: true, bond: { ...bond } };
    }

    _expRequired(level) {
        return Math.floor(this.config.baseExpRequired * Math.pow(this.config.evolutionMultiplier, level));
    }

    evolveBond(bondId) {
        const bond = this.bonds.get(bondId);
        if (!bond) return { success: false, error: 'BOND_NOT_FOUND' };
        if (bond.level >= this.config.maxEvolutionLevel) return { success: false, error: 'MAX_LEVEL_REACHED' };
        const required = this._expRequired(bond.level);
        if (bond.exp < required) return { success: false, error: 'INSUFFICIENT_EXP', required };
        bond.level++;
        bond.exp -= required;
        this.history.push({ bondId, newLevel: bond.level, timestamp: Date.now() });
        this.stats.totalEvolutions++;
        this._triggerHook('bondEvolved', { bondId, newLevel: bond.level });
        return { success: true, bond: { ...bond } };
    }

    setPath(bondId, pathId) {
        const bond = this.bonds.get(bondId);
        if (!bond) return { success: false, error: 'BOND_NOT_FOUND' };
        if (!this.evolutionPaths.has(pathId)) return { success: false, error: 'PATH_NOT_FOUND' };
        bond.pathId = pathId;
        return { success: true, bond: { ...bond } };
    }

    getPathBonus(bondId) {
        const bond = this.bonds.get(bondId);
        if (!bond) return null;
        const path = this.evolutionPaths.get(bond.pathId);
        return path ? path.bonuses : null;
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
        if (this.stats.totalEvolutions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.evolutionMultiplier = Math.max(1.1, this.config.evolutionMultiplier - 0.1);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() {
        return { bonds: Array.from(this.bonds.entries()), history: this.history, stats: this.stats, config: this.config };
    }

    fromJSON(data) {
        if (data.bonds) this.bonds = new Map(data.bonds);
        if (data.history) this.history = data.history;
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }

    getStats() {
        return { ...this.stats, bondCount: this.bonds.size, pathCount: this.evolutionPaths.size };
    }
}