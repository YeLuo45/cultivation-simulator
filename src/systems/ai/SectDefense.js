/**
 * SectDefense.js - 宗门防御
 * V415 Iteration 7/15 Round 14
 */
export class SectDefense {
    constructor(config = {}) {
        this.config = { maxDefenses: config.maxDefenses || 50, baseWalls: config.baseWalls || 100, baseShields: config.baseShields || 10, ...config };
        this.defenses = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDefenses: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDefense', (ctx) => this.getDefense(ctx.defenseId));
        this.registerTool('buildDefense', (ctx) => this.buildDefense(ctx));
    }

    buildDefense(data) {
        const id = data.id || `def_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const defense = { defenseId: id, sectId: data.sectId, walls: data.walls || this.config.baseWalls, towers: data.towers || 2, shields: data.shields || this.config.baseShields, integrity: data.integrity || 100, garrison: data.garrison || 10, status: 'intact', builtAt: Date.now() };
        this.defenses.set(id, defense);
        this.stats.totalDefenses++;
        this._triggerHook('defenseBuilt', { defenseId: id });
        return { success: true, defense };
    }

    getDefense(id) { return this.defenses.get(id) ? { ...this.defenses.get(id) } : null; }
    listDefenses() { return Array.from(this.defenses.values()).map(d => ({ ...d })); }
    listBySect(sectId) { return Array.from(this.defenses.values()).filter(d => d.sectId === sectId).map(d => ({ ...d })); }
    listByIntegrity(min) { return Array.from(this.defenses.values()).filter(d => d.integrity >= min).map(d => ({ ...d })); }

    fortifyDefense(defenseId, amount = 10) {
        const defense = this.defenses.get(defenseId);
        if (!defense) return { success: false, error: 'DEFENSE_NOT_FOUND' };
        defense.walls += amount;
        this._triggerHook('defenseFortified', { defenseId, newWalls: defense.walls });
        return { success: true };
    }

    garrisonRecruited(defenseId, count = 5) {
        const defense = this.defenses.get(defenseId);
        if (!defense) return { success: false, error: 'DEFENSE_NOT_FOUND' };
        defense.garrison += count;
        this._triggerHook('garrisonRecruited', { defenseId, newGarrison: defense.garrison });
        return { success: true };
    }

    repairDefense(defenseId, amount = 20) {
        const defense = this.defenses.get(defenseId);
        if (!defense) return { success: false, error: 'DEFENSE_NOT_FOUND' };
        defense.integrity = Math.min(100, defense.integrity + amount);
        if (defense.integrity >= 100) defense.status = 'intact';
        else defense.status = 'repaired';
        this._triggerHook('defenseRepaired', { defenseId, newIntegrity: defense.integrity });
        return { success: true };
    }

    calculateDefenseStrength(defenseId) {
        const defense = this.defenses.get(defenseId);
        if (!defense) return 0;
        return defense.walls + defense.shields * 2 + defense.towers * 5 + defense.garrison * 3 + defense.integrity / 10;
    }

    listStrong() { return this.listByIntegrity(80); }

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
        if (this.stats.totalDefenses < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDefenses += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { defenses: Array.from(this.defenses.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.defenses) this.defenses = new Map(data.defenses);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, defenseCount: this.defenses.size }; }
}
