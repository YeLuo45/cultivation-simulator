/**
 * ElementalFusion.js - 元素融合
 * V362 Iteration 5/9 Round 9
 */
export class ElementalFusion {
    constructor(config = {}) {
        this.config = { maxFusions: config.maxFusions || 100, basePower: config.basePower || 10, ...config };
        this.recipes = new Map();
        this.fusions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFusions: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const recipes = [
            { recipeId: 'fire_water', name: 'Steam', elements: ['fire', 'water'], power: 30 },
            { recipeId: 'fire_earth', name: 'Lava', elements: ['fire', 'earth'], power: 40 },
            { recipeId: 'metal_wood', name: 'Axe', elements: ['metal', 'wood'], power: 25 },
            { recipeId: 'water_wood', name: 'Growth', elements: ['water', 'wood'], power: 20 }
        ];
        for (const r of recipes) this.recipes.set(r.recipeId, r);
    }

    _registerDefaultTools() {
        this.registerTool('getRecipe', (ctx) => this.getRecipe(ctx.recipeId));
        this.registerTool('fuse', (ctx) => this.fuse(ctx.recipeId));
    }

    listRecipes() { return Array.from(this.recipes.values()).map(r => ({ ...r })); }
    getRecipe(id) { return this.recipes.get(id) ? { ...this.recipes.get(id) } : null; }
    findByElements(elements) {
        const sorted = [...elements].sort();
        return Array.from(this.recipes.values()).find(r => r.elements.slice().sort().join(',') === sorted.join(','));
    }

    addRecipe(data) {
        const id = data.id || `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const recipe = { recipeId: id, name: data.name || 'Recipe', elements: data.elements || [], power: data.power || this.config.basePower };
        this.recipes.set(id, recipe);
        this._triggerHook('recipeAdded', { recipeId: id });
        return { success: true, recipe };
    }

    fuse(recipeId) {
        const recipe = this.recipes.get(recipeId);
        if (!recipe) return { success: false, error: 'RECIPE_NOT_FOUND' };
        const id = `fus_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const fusion = { fusionId: id, recipeId, name: recipe.name, power: recipe.power, createdAt: Date.now() };
        this.fusions.set(id, fusion);
        this.stats.totalFusions++;
        this._triggerHook('fusionCreated', { fusionId: id, recipeId });
        return { success: true, fusion };
    }

    getFusion(id) { return this.fusions.get(id) ? { ...this.fusions.get(id) } : null; }
    listFusions() { return Array.from(this.fusions.values()).map(f => ({ ...f })); }
    listByRecipe(recipeId) { return Array.from(this.fusions.values()).filter(f => f.recipeId === recipeId).map(f => ({ ...f })); }

    calculateTotalPower() { return Array.from(this.fusions.values()).reduce((s, f) => s + f.power, 0); }

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
        if (this.stats.totalFusions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.basePower += 5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { recipes: Array.from(this.recipes.entries()), fusions: Array.from(this.fusions.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.recipes) this.recipes = new Map(data.recipes);
        if (data.fusions) this.fusions = new Map(data.fusions);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, recipeCount: this.recipes.size, fusionCount: this.fusions.size }; }
}