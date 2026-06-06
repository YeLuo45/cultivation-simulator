/**
 * CookingCultivation.js - 食修系统
 * V426 Iteration 3/15 Round 15
 */
export class CookingCultivation {
    constructor(config = {}) {
        this.config = { maxRecipes: config.maxRecipes || 200, baseCooking: config.baseCooking || 10, ...config };
        this.recipes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRecipes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRecipe', (ctx) => this.getRecipe(ctx.recipeId));
        this.registerTool('prepareRecipe', (ctx) => this.prepareRecipe(ctx));
    }

    prepareRecipe(data) {
        const id = data.id || `rcp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const recipe = { recipeId: id, cultivatorId: data.cultivatorId, name: data.name, cuisine: data.cuisine, flavor: data.flavor, ingredients: data.ingredients || [], cooking: data.cooking || this.config.baseCooking, status: 'raw', preparedAt: Date.now() };
        this.recipes.set(id, recipe);
        this.stats.totalRecipes++;
        this._triggerHook('recipePrepared', { recipeId: id });
        return { success: true, recipe };
    }

    getRecipe(id) { return this.recipes.get(id) ? { ...this.recipes.get(id) } : null; }
    listRecipes() { return Array.from(this.recipes.values()).map(r => ({ ...r })); }
    listByCuisine(cuisine) { return Array.from(this.recipes.values()).filter(r => r.cuisine === cuisine).map(r => ({ ...r })); }
    listByFlavor(flavor) { return Array.from(this.recipes.values()).filter(r => r.flavor === flavor).map(r => ({ ...r })); }

    addIngredient(recipeId, ingredient) {
        const recipe = this.recipes.get(recipeId);
        if (!recipe) return { success: false, error: 'RECIPE_NOT_FOUND' };
        recipe.ingredients.push(ingredient);
        this._triggerHook('ingredientAdded', { recipeId, ingredient });
        return { success: true };
    }

    cookRecipe(recipeId, amount = 5) {
        const recipe = this.recipes.get(recipeId);
        if (!recipe) return { success: false, error: 'RECIPE_NOT_FOUND' };
        recipe.cooking += amount;
        recipe.status = 'cooked';
        this._triggerHook('recipeCooked', { recipeId, newCooking: recipe.cooking });
        return { success: true };
    }

    serveRecipe(recipeId) {
        const recipe = this.recipes.get(recipeId);
        if (!recipe) return { success: false, error: 'RECIPE_NOT_FOUND' };
        recipe.status = 'served';
        this._triggerHook('recipeServed', { recipeId });
        return { success: true };
    }

    calculateNutritionalValue(recipeId) {
        const recipe = this.recipes.get(recipeId);
        if (!recipe) return 0;
        return recipe.ingredients.length * 10 + recipe.cooking * (recipe.flavor.length / 2);
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
        if (this.stats.totalRecipes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRecipes += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { recipes: Array.from(this.recipes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.recipes) this.recipes = new Map(data.recipes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, recipeCount: this.recipes.size }; }
}
