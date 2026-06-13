/**
 * ElementalAffinity.js - 灵根亲和系统
 * V359 Iteration 2/9 Round 9
 */
export class ElementalAffinity {
    constructor(config = {}) {
        this.config = { maxAffinity: config.maxAffinity || 1, baseGrowth: config.baseGrowth || 0.1, ...config };
        this.cultivators = new Map();
        this.affinities = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGrowths: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCultivator', (ctx) => this.getCultivator(ctx.cultivatorId));
        this.registerTool('growAffinity', (ctx) => this.growAffinity(ctx.cultivatorId, ctx.elementId, ctx.amount));
    }

    registerCultivator(data) {
        const id = data.id || `cv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cultivator = { cultivatorId: id, name: data.name || 'Anonymous', createdAt: Date.now() };
        this.cultivators.set(id, cultivator);
        this.affinities.set(id, { metal: 0, wood: 0, water: 0, fire: 0, earth: 0 });
        return { success: true, cultivator };
    }

    getCultivator(id) { return this.cultivators.get(id) ? { ...this.cultivators.get(id) } : null; }
    getAffinities(id) { return this.affinities.get(id) ? { ...this.affinities.get(id) } : null; }

    growAffinity(cultivatorId, elementId, amount = this.config.baseGrowth) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        if (!(elementId in this.affinities.get(cultivatorId))) return { success: false, error: 'INVALID_ELEMENT' };
        const current = this.affinities.get(cultivatorId);
        current[elementId] = Math.min(this.config.maxAffinity, current[elementId] + amount);
        this.stats.totalGrowths++;
        this._triggerHook('affinityGrew', { cultivatorId, elementId, value: current[elementId] });
        return { success: true, value: current[elementId] };
    }

    decayAffinity(cultivatorId, elementId, amount) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        if (!(elementId in this.affinities.get(cultivatorId))) return { success: false, error: 'INVALID_ELEMENT' };
        const current = this.affinities.get(cultivatorId);
        current[elementId] = Math.max(0, current[elementId] - amount);
        this._triggerHook('affinityDecayed', { cultivatorId, elementId, value: current[elementId] });
        return { success: true, value: current[elementId] };
    }

    transferAffinity(fromId, toId, elementId) {
        const from = this.cultivators.get(fromId);
        const to = this.cultivators.get(toId);
        if (!from || !to) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        const fromAff = this.affinities.get(fromId);
        const toAff = this.affinities.get(toId);
        if (!fromAff[elementId] || !toAff) return { success: false, error: 'INVALID_ELEMENT' };
        const transfer = fromAff[elementId] / 2;
        fromAff[elementId] -= transfer;
        toAff[elementId] = Math.min(this.config.maxAffinity, toAff[elementId] + transfer);
        this._triggerHook('affinityTransferred', { fromId, toId, elementId, amount: transfer });
        return { success: true, transferred: transfer };
    }

    calculateTotalAffinity(cultivatorId) {
        const aff = this.affinities.get(cultivatorId);
        if (!aff) return 0;
        return Object.values(aff).reduce((sum, v) => sum + v, 0);
    }

    findDominant(cultivatorId) {
        const aff = this.affinities.get(cultivatorId);
        if (!aff) return null;
        let max = -1, elem = null;
        for (const [k, v] of Object.entries(aff)) { if (v > max) { max = v; elem = k; } }
        return elem;
    }

    listByElement(elementId, threshold = 0.5) {
        const result = [];
        for (const [cvId, aff] of this.affinities) {
            if (aff[elementId] >= threshold) result.push({ cultivatorId: cvId, affinity: aff[elementId] });
        }
        return result;
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
        if (this.stats.totalGrowths < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseGrowth += 0.05;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { cultivators: Array.from(this.cultivators.entries()), affinities: Array.from(this.affinities.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.cultivators) this.cultivators = new Map(data.cultivators);
        if (data.affinities) this.affinities = new Map(data.affinities);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cultivatorCount: this.cultivators.size }; }
}