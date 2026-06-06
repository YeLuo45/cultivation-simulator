/**
 * PillBrewing.js - 丹药酿造系统
 * V503 Iteration 5/20 Round 20
 */
export class PillBrewing {
    constructor(config = {}) {
        this.config = { maxPills: config.maxPills || 200, basePotency: config.basePotency || 20, ...config };
        this.pills = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPills: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPill', (ctx) => this.getPill(ctx.pillId));
        this.registerTool('brewPill', (ctx) => this.brewPill(ctx));
    }

    brewPill(data) {
        const id = data.id || `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const pill = {
            pillId: id,
            alchemistId: data.alchemistId,
            name: data.name || 'unnamed_pill',
            type: data.type || 'healing',
            potency: data.potency || this.config.basePotency,
            ingredients: data.ingredients || [],
            status: 'brewed',
            brewedAt: Date.now()
        };
        this.pills.set(id, pill);
        this.stats.totalPills++;
        this._triggerHook('pillBrewed', { pillId: id });
        return { success: true, pill };
    }

    getPill(id) { return this.pills.get(id) ? { ...this.pills.get(id) } : null; }
    listPills() { return Array.from(this.pills.values()).map(p => ({ ...p })); }
    listByAlchemist(alchemistId) { return Array.from(this.pills.values()).filter(p => p.alchemistId === alchemistId).map(p => ({ ...p })); }
    listMastered() { return Array.from(this.pills.values()).filter(p => p.status === 'mastered').map(p => ({ ...p })); }

    addIngredient(pillId, ingredient) {
        const pill = this.pills.get(pillId);
        if (!pill) return { success: false, error: 'PILL_NOT_FOUND' };
        pill.ingredients.push(ingredient);
        this._triggerHook('ingredientAdded', { pillId, ingredient });
        return { success: true };
    }

    agePill(pillId, amount = 5) {
        const pill = this.pills.get(pillId);
        if (!pill) return { success: false, error: 'PILL_NOT_FOUND' };
        pill.potency += amount;
        pill.status = 'aged';
        this._triggerHook('pillAged', { pillId, newPotency: pill.potency });
        return { success: true };
    }

    masterPill(pillId) {
        const pill = this.pills.get(pillId);
        if (!pill) return { success: false, error: 'PILL_NOT_FOUND' };
        pill.status = 'mastered';
        this._triggerHook('pillMastered', { pillId });
        return { success: true };
    }

    calculatePillValue(pillId) {
        const pill = this.pills.get(pillId);
        if (!pill) return 0;
        return pill.potency * 10 + pill.ingredients.length * 5;
    }

    listByType(type) { return Array.from(this.pills.values()).filter(p => p.type === type).map(p => ({ ...p })); }

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
        if (this.stats.totalPills < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPills += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { pills: Array.from(this.pills.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.pills) this.pills = new Map(data.pills);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, pillCount: this.pills.size }; }
}
