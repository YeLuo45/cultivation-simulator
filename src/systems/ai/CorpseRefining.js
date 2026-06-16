/**
 * CorpseRefining.js - 炼尸系统
 * V451 Iteration 13/15 Round 16
 */
export class CorpseRefining {
    constructor(config = {}) {
        this.config = { maxCorpses: config.maxCorpses || 50, baseFerocity: config.baseFerocity || 20, ...config };
        this.corpses = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCorpses: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCorpse', (ctx) => this.getCorpse(ctx.corpseId));
        this.registerTool('collectCorpse', (ctx) => this.collectCorpse(ctx));
    }

    collectCorpse(data) {
        if (this.corpses.size >= this.config.maxCorpses) return { success: false, error: 'MAX_CORPSES_REACHED' };
        const id = data.corpseId || `crp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const corpse = {
            corpseId: id,
            refinerId: data.refinerId,
            name: data.name || 'Unnamed Corpse',
            origin: data.origin || 'unknown',
            ferocity: data.ferocity || this.config.baseFerocity,
            durability: data.durability != null ? data.durability : 50,
            bodyParts: data.bodyParts || [],
            status: 'raw',
            createdAt: Date.now()
        };
        this.corpses.set(id, corpse);
        this.stats.totalCorpses++;
        this._triggerHook('corpseCollected', { corpseId: id, refinerId: corpse.refinerId });
        return { success: true, corpse };
    }

    getCorpse(id) { return this.corpses.get(id) ? { ...this.corpses.get(id) } : null; }
    listCorpses() { return Array.from(this.corpses.values()).map(c => ({ ...c })); }
    listByRefiner(refinerId) { return Array.from(this.corpses.values()).filter(c => c.refinerId === refinerId).map(c => ({ ...c })); }
    listByOrigin(origin) { return Array.from(this.corpses.values()).filter(c => c.origin === origin).map(c => ({ ...c })); }

    refineCorpse(corpseId, amount = 5) {
        const corpse = this.corpses.get(corpseId);
        if (!corpse) return { success: false, error: 'CORPSE_NOT_FOUND' };
        corpse.durability += amount;
        if (corpse.durability >= 100 && corpse.status === 'raw') corpse.status = 'refined';
        this._triggerHook('corpseRefined', { corpseId, newDurability: corpse.durability });
        return { success: true };
    }

    increaseFerocity(corpseId, amount = 2) {
        const corpse = this.corpses.get(corpseId);
        if (!corpse) return { success: false, error: 'CORPSE_NOT_FOUND' };
        corpse.ferocity += amount;
        this._triggerHook('ferocityIncreased', { corpseId, newFerocity: corpse.ferocity });
        return { success: true };
    }

    addPart(corpseId, part) {
        const corpse = this.corpses.get(corpseId);
        if (!corpse) return { success: false, error: 'CORPSE_NOT_FOUND' };
        corpse.bodyParts.push(part);
        return { success: true };
    }

    animateCorpse(corpseId) {
        const corpse = this.corpses.get(corpseId);
        if (!corpse) return { success: false, error: 'CORPSE_NOT_FOUND' };
        corpse.status = 'animated';
        this._triggerHook('corpseAnimated', { corpseId });
        return { success: true };
    }

    calculateCorpsePower(corpseId) {
        const corpse = this.corpses.get(corpseId);
        if (!corpse) return 0;
        return corpse.ferocity * (corpse.durability / 100) + corpse.bodyParts.length * 5;
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
        if (this.stats.totalCorpses < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCorpses += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { corpses: Array.from(this.corpses.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.corpses) this.corpses = new Map(data.corpses);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, corpseCount: this.corpses.size }; }
}
