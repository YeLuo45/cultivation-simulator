/**
 * MechanicalGolem.js - 机关傀儡
 * V452 Iteration 14/15 Round 16
 */
export class MechanicalGolem {
    constructor(config = {}) {
        this.config = { maxGolems: config.maxGolems || 50, baseStrength: config.baseStrength || 30, ...config };
        this.golems = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGolems: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getGolem', (ctx) => this.getGolem(ctx.golemId));
        this.registerTool('assembleGolem', (ctx) => this.assembleGolem(ctx));
    }

    assembleGolem(data) {
        const id = data.id || `glm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const golem = {
            golemId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Golem',
            type: data.type || 'warrior',
            strength: data.strength || this.config.baseStrength,
            parts: data.parts || [],
            energy: data.energy || 0,
            status: 'assembled',
            assembledAt: Date.now()
        };
        this.golems.set(id, golem);
        this.stats.totalGolems++;
        this._triggerHook('golemAssembled', { golemId: id });
        return { success: true, golem };
    }

    getGolem(id) { return this.golems.get(id) ? { ...this.golems.get(id) } : null; }
    listGolems() { return Array.from(this.golems.values()).map(g => ({ ...g })); }
    listByMaster(masterId) { return Array.from(this.golems.values()).filter(g => g.masterId === masterId).map(g => ({ ...g })); }
    listByType(type) { return Array.from(this.golems.values()).filter(g => g.type === type).map(g => ({ ...g })); }

    addPart(golemId, part) {
        const golem = this.golems.get(golemId);
        if (!golem) return { success: false, error: 'GOLEM_NOT_FOUND' };
        golem.parts.push(part);
        this._triggerHook('partAdded', { golemId, part });
        return { success: true };
    }

    increaseStrength(golemId, amount = 5) {
        const golem = this.golems.get(golemId);
        if (!golem) return { success: false, error: 'GOLEM_NOT_FOUND' };
        golem.strength += amount;
        this._triggerHook('strengthIncreased', { golemId, newStrength: golem.strength });
        return { success: true };
    }

    chargeEnergy(golemId, amount = 10) {
        const golem = this.golems.get(golemId);
        if (!golem) return { success: false, error: 'GOLEM_NOT_FOUND' };
        golem.energy += amount;
        this._triggerHook('energyCharged', { golemId, energy: golem.energy });
        return { success: true };
    }

    activateGolem(golemId) {
        const golem = this.golems.get(golemId);
        if (!golem) return { success: false, error: 'GOLEM_NOT_FOUND' };
        golem.status = 'active';
        this._triggerHook('golemActivated', { golemId });
        return { success: true };
    }

    calculateGolemPower(golemId) {
        const golem = this.golems.get(golemId);
        if (!golem) return 0;
        return golem.strength * (golem.energy / 100) + golem.parts.length * 3;
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
        if (this.stats.totalGolems < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxGolems += 25;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { golems: Array.from(this.golems.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.golems) this.golems = new Map(data.golems);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, golemCount: this.golems.size }; }
}
