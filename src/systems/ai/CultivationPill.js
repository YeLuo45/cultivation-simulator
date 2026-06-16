/**
 * CultivationPill.js - 修真丹系统
 * V702 Iteration 25/30 Round 28
 */
export class CultivationPill {
    constructor(config = {}) {
        this.config = { maxPills: config.maxPills || 100, basePotency: config.basePotency || 20, ...config };
        this.pills = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPills: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPill', (ctx) => this.getPill(ctx.pillId));
        this.registerTool('recruitPill', (ctx) => this.recruitPill(ctx));
    }

    recruitPill(data) {
        const id = data.id || `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const pill = {
            pillId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed_pill',
            type: data.type || 'qi',
            potency: data.potency || this.config.basePotency,
            recipes: data.recipes || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.pills.set(id, pill);
        this.stats.totalPills++;
        this._triggerHook('pillRecruited', { pillId: id });
        return { success: true, pill };
    }

    getPill(id) { return this.pills.get(id) ? { ...this.pills.get(id) } : null; }
    listPills() { return Array.from(this.pills.values()).map(p => ({ ...p })); }
    listByMaster(masterId) { return Array.from(this.pills.values()).filter(p => p.masterId === masterId).map(p => ({ ...p })); }
    listLegendary() { return Array.from(this.pills.values()).filter(p => p.status === 'legendary').map(p => ({ ...p })); }

    addRecipe(pillId, recipe) {
        const pill = this.pills.get(pillId);
        if (!pill) return { success: false, error: 'PILL_NOT_FOUND' };
        pill.recipes.push(recipe);
        this._triggerHook('recipeAdded', { pillId, recipe });
        return { success: true };
    }

    raisePotency(pillId, amount = 5) {
        const pill = this.pills.get(pillId);
        if (!pill) return { success: false, error: 'PILL_NOT_FOUND' };
        pill.potency += amount;
        this._triggerHook('potencyRaised', { pillId, newPotency: pill.potency });
        return { success: true };
    }

    levelUpPill(pillId) {
        const pill = this.pills.get(pillId);
        if (!pill) return { success: false, error: 'PILL_NOT_FOUND' };
        pill.level++;
        this._triggerHook('pillLeveledUp', { pillId, newLevel: pill.level });
        return { success: true };
    }

    legendPill(pillId) {
        const pill = this.pills.get(pillId);
        if (!pill) return { success: false, error: 'PILL_NOT_FOUND' };
        pill.status = 'legendary';
        this._triggerHook('pillLegendized', { pillId });
        return { success: true };
    }

    calculatePillValue(pillId) {
        const pill = this.pills.get(pillId);
        if (!pill) return 0;
        return pill.level * 100 + pill.potency * 2 + pill.recipes.length * 30;
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
