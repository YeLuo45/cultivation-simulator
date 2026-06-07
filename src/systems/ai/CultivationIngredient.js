/**
 * CultivationIngredient.js - 修真药材
 * V701 Iteration 24/30 Round 28
 */
export class CultivationIngredient {
    constructor(config = {}) {
        this.config = { maxIngredients: config.maxIngredients || 100, baseFreshness: config.baseFreshness || 20, ...config };
        this.ingredients = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalIngredients: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getIngredient', (ctx) => this.getIngredient(ctx.ingredientId));
        this.registerTool('recruitIngredient', (ctx) => this.recruitIngredient(ctx));
    }

    recruitIngredient(data) {
        const id = data.id || `ing_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const ingredient = {
            ingredientId: id,
            masterId: data.masterId,
            name: data.name || 'Mystic Herb',
            type: data.type || 'herb',
            freshness: data.freshness || this.config.baseFreshness,
            preparations: data.preparations || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.ingredients.set(id, ingredient);
        this.stats.totalIngredients++;
        this._triggerHook('ingredientRecruited', { ingredientId: id });
        return { success: true, ingredient };
    }

    getIngredient(id) { return this.ingredients.get(id) ? { ...this.ingredients.get(id) } : null; }
    listIngredients() { return Array.from(this.ingredients.values()).map(i => ({ ...i })); }
    listByMaster(masterId) { return Array.from(this.ingredients.values()).filter(i => i.masterId === masterId).map(i => ({ ...i })); }
    listLegendary() { return Array.from(this.ingredients.values()).filter(i => i.status === 'legendary').map(i => ({ ...i })); }

    addPreparation(ingredientId, preparation) {
        const ingredient = this.ingredients.get(ingredientId);
        if (!ingredient) return { success: false, error: 'INGREDIENT_NOT_FOUND' };
        ingredient.preparations.push(preparation);
        this._triggerHook('preparationAdded', { ingredientId, preparation });
        return { success: true };
    }

    raiseFreshness(ingredientId, amount = 5) {
        const ingredient = this.ingredients.get(ingredientId);
        if (!ingredient) return { success: false, error: 'INGREDIENT_NOT_FOUND' };
        ingredient.freshness += amount;
        this._triggerHook('freshnessRaised', { ingredientId, amount, newFreshness: ingredient.freshness });
        return { success: true };
    }

    levelUpIngredient(ingredientId) {
        const ingredient = this.ingredients.get(ingredientId);
        if (!ingredient) return { success: false, error: 'INGREDIENT_NOT_FOUND' };
        ingredient.level++;
        this._triggerHook('ingredientLeveledUp', { ingredientId, newLevel: ingredient.level });
        return { success: true };
    }

    legendIngredient(ingredientId) {
        const ingredient = this.ingredients.get(ingredientId);
        if (!ingredient) return { success: false, error: 'INGREDIENT_NOT_FOUND' };
        ingredient.status = 'legendary';
        this._triggerHook('ingredientLegendized', { ingredientId, status: ingredient.status });
        return { success: true };
    }

    calculateIngredientValue(ingredientId) {
        const ingredient = this.ingredients.get(ingredientId);
        if (!ingredient) return 0;
        return ingredient.level * 100 + ingredient.freshness * 2 + ingredient.preparations.length * 30;
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
        if (this.stats.totalIngredients < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxIngredients += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { ingredients: Array.from(this.ingredients.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.ingredients) this.ingredients = new Map(data.ingredients);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, ingredientCount: this.ingredients.size }; }
}
