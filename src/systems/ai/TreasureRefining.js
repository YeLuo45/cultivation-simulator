/**
 * TreasureRefining.js - 炼器系统
 * V416 Iteration 8/15 Round 14
 */
export class TreasureRefining {
    constructor(config = {}) {
        this.config = { maxTreasures: config.maxTreasures || 200, baseSharpness: config.baseSharpness || 20, baseDurability: config.baseDurability || 100, ...config };
        this.treasures = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTreasures: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTreasure', (ctx) => this.getTreasure(ctx.treasureId));
        this.registerTool('forgeTreasure', (ctx) => this.forgeTreasure(ctx));
    }

    forgeTreasure(data) {
        const id = data.id || `trs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const treasure = { treasureId: id, name: data.name || 'unnamed_treasure', type: data.type || 'sword', grade: data.grade || 'common', sharpness: data.sharpness || this.config.baseSharpness, durability: data.durability || this.config.baseDurability, refinement: data.refinement || 0, status: 'idle', forgedAt: Date.now() };
        this.treasures.set(id, treasure);
        this.stats.totalTreasures++;
        this._triggerHook('treasureForged', { treasureId: id });
        return { success: true, treasure };
    }

    getTreasure(id) { return this.treasures.get(id) ? { ...this.treasures.get(id) } : null; }
    listTreasures() { return Array.from(this.treasures.values()).map(t => ({ ...t })); }
    listByType(type) { return Array.from(this.treasures.values()).filter(t => t.type === type).map(t => ({ ...t })); }
    listByGrade(grade) { return Array.from(this.treasures.values()).filter(t => t.grade === grade).map(t => ({ ...t })); }
    listByRefinement(min) { return Array.from(this.treasures.values()).filter(t => t.refinement >= min).map(t => ({ ...t })); }

    refineTreasure(treasureId, amount = 1) {
        const treasure = this.treasures.get(treasureId);
        if (!treasure) return { success: false, error: 'TREASURE_NOT_FOUND' };
        treasure.refinement = Math.min(10, treasure.refinement + amount);
        this._triggerHook('treasureRefined', { treasureId, newRefinement: treasure.refinement });
        return { success: true };
    }

    sharpenTreasure(treasureId, amount = 5) {
        const treasure = this.treasures.get(treasureId);
        if (!treasure) return { success: false, error: 'TREASURE_NOT_FOUND' };
        treasure.sharpness += amount;
        this._triggerHook('treasureSharpened', { treasureId, newSharpness: treasure.sharpness });
        return { success: true };
    }

    repairTreasure(treasureId, amount = 20) {
        const treasure = this.treasures.get(treasureId);
        if (!treasure) return { success: false, error: 'TREASURE_NOT_FOUND' };
        treasure.durability = Math.min(100, treasure.durability + amount);
        this._triggerHook('treasureRepaired', { treasureId });
        return { success: true };
    }

    calculatePower(treasureId) {
        const treasure = this.treasures.get(treasureId);
        if (!treasure) return 0;
        return treasure.sharpness * (1 + treasure.refinement / 10) * (treasure.durability / 100);
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
        if (this.stats.totalTreasures < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTreasures += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { treasures: Array.from(this.treasures.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.treasures) this.treasures = new Map(data.treasures);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, treasureCount: this.treasures.size }; }
}
