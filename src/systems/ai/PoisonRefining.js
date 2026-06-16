/**
 * PoisonRefining.js - 毒术
 * V456 Iteration 3/15 Round 17
 */
export class PoisonRefining {
    constructor(config = {}) {
        this.config = { maxPoisons: config.maxPoisons || 100, baseToxicity: config.baseToxicity || 20, ...config };
        this.poisons = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPoisons: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPoison', (ctx) => this.getPoison(ctx.poisonId));
        this.registerTool('brewPoison', (ctx) => this.brewPoison(ctx));
    }

    brewPoison(data) {
        const id = data.id || `psn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const poison = {
            poisonId: id,
            refinerId: data.refinerId,
            name: data.name || 'unnamed-poison',
            type: data.type || 'paralysis',
            toxicity: data.toxicity || this.config.baseToxicity,
            antidotes: data.antidotes ? [...data.antidotes] : [],
            status: 'brewed',
            brewedAt: Date.now()
        };
        this.poisons.set(id, poison);
        this.stats.totalPoisons++;
        this._triggerHook('poisonBrewed', { poisonId: id });
        return { success: true, poison };
    }

    getPoison(id) { return this.poisons.get(id) ? { ...this.poisons.get(id), antidotes: [...(this.poisons.get(id).antidotes || [])] } : null; }
    listPoisons() { return Array.from(this.poisons.values()).map(p => ({ ...p, antidotes: [...(p.antidotes || [])] })); }
    listByRefiner(refinerId) { return Array.from(this.poisons.values()).filter(p => p.refinerId === refinerId).map(p => ({ ...p, antidotes: [...(p.antidotes || [])] })); }
    listByType(type) { return Array.from(this.poisons.values()).filter(p => p.type === type).map(p => ({ ...p, antidotes: [...(p.antidotes || [])] })); }

    addAntidote(poisonId, antidote) {
        const poison = this.poisons.get(poisonId);
        if (!poison) return { success: false, error: 'POISON_NOT_FOUND' };
        poison.antidotes.push(antidote);
        this._triggerHook('antidoteAdded', { poisonId, antidote });
        return { success: true };
    }

    intensifyPoison(poisonId, amount = 5) {
        const poison = this.poisons.get(poisonId);
        if (!poison) return { success: false, error: 'POISON_NOT_FOUND' };
        poison.toxicity += amount;
        this._triggerHook('poisonIntensified', { poisonId, newToxicity: poison.toxicity });
        return { success: true };
    }

    applyPoison(poisonId) {
        const poison = this.poisons.get(poisonId);
        if (!poison) return { success: false, error: 'POISON_NOT_FOUND' };
        poison.status = 'applied';
        this._triggerHook('poisonApplied', { poisonId });
        return { success: true };
    }

    calculatePoisonStrength(poisonId) {
        const poison = this.poisons.get(poisonId);
        if (!poison) return 0;
        return poison.toxicity * (1 + poison.antidotes.length / 3);
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
        if (this.stats.totalPoisons < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPoisons += 25;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { poisons: Array.from(this.poisons.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.poisons) this.poisons = new Map(data.poisons);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, poisonCount: this.poisons.size }; }
}
