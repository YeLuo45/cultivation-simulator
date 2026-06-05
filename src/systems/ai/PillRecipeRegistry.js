/**
 * PillRecipeRegistry.js - 丹药配方注册系统
 * V323 Iteration 2/9 Round 5
 */
export class PillRecipeRegistry {
    constructor(config = {}) {
        this.config = { maxRecipes: config.maxRecipes || 200, baseQuality: config.baseQuality || 50, ...config };
        this.recipes = new Map();
        this.recipeVersions = new Map();
        this.collections = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRecipes: 0, totalVersions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRecipe', (ctx) => this.getRecipe(ctx.recipeId));
        this.registerTool('listRecipes', () => Array.from(this.recipes.values()).map(r => ({...r})));
        this.registerTool('searchRecipes', (ctx) => this.searchRecipes(ctx.filter || {}));
    }

    registerRecipe(data) {
        const id = data.id || `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const recipe = {
            recipeId: id, name: data.name || 'Unnamed',
            ingredients: data.ingredients || {}, grade: data.grade || 1,
            quality: data.quality || this.config.baseQuality,
            version: 1, createdAt: Date.now(), author: data.author || 'unknown',
            tags: data.tags || [], description: data.description || ''
        };
        this.recipes.set(id, recipe);
        this.recipeVersions.set(id, [{ version: 1, changes: 'initial', timestamp: Date.now() }]);
        this.stats.totalRecipes++;
        this._triggerHook('recipeRegistered', { recipeId: id });
        return { success: true, recipe };
    }

    getRecipe(id) { return this.recipes.get(id) ? { ...this.recipes.get(id) } : null; }
    listRecipes() { return Array.from(this.recipes.values()).map(r => ({ ...r })); }

    updateRecipe(id, updates) {
        const recipe = this.recipes.get(id);
        if (!recipe) return { success: false, error: 'RECIPE_NOT_FOUND' };
        if (updates.name !== undefined) recipe.name = updates.name;
        if (updates.ingredients !== undefined) recipe.ingredients = updates.ingredients;
        if (updates.grade !== undefined) recipe.grade = updates.grade;
        if (updates.quality !== undefined) recipe.quality = updates.quality;
        if (updates.description !== undefined) recipe.description = updates.description;
        recipe.version++;
        if (!this.recipeVersions.has(id)) this.recipeVersions.set(id, []);
        this.recipeVersions.get(id).push({ version: recipe.version, changes: 'updated', timestamp: Date.now() });
        this._triggerHook('recipeUpdated', { recipeId: id, version: recipe.version });
        return { success: true, recipe: { ...recipe } };
    }

    deleteRecipe(id) {
        if (!this.recipes.has(id)) return { success: false, error: 'RECIPE_NOT_FOUND' };
        this.recipes.delete(id);
        this.recipeVersions.delete(id);
        this._triggerHook('recipeDeleted', { recipeId: id });
        return { success: true };
    }

    getRecipeHistory(id) { return this.recipeVersions.get(id) || []; }

    searchRecipes(filter) {
        let results = Array.from(this.recipes.values());
        if (filter.grade !== undefined) results = results.filter(r => r.grade === filter.grade);
        if (filter.tag) results = results.filter(r => r.tags.includes(filter.tag));
        if (filter.minQuality !== undefined) results = results.filter(r => r.quality >= filter.minQuality);
        if (filter.ingredient) results = results.filter(r => filter.ingredient in r.ingredients);
        if (filter.author) results = results.filter(r => r.author === filter.author);
        if (filter.keyword) {
            const kw = filter.keyword.toLowerCase();
            results = results.filter(r => r.name.toLowerCase().includes(kw) || r.description.toLowerCase().includes(kw));
        }
        return results.map(r => ({ ...r }));
    }

    createCollection(name) {
        const id = `col_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        this.collections.set(id, { collectionId: id, name, recipeIds: [], createdAt: Date.now() });
        this._triggerHook('collectionCreated', { collectionId: id });
        return { success: true, collection: this.collections.get(id) };
    }

    addToCollection(collectionId, recipeId) {
        const collection = this.collections.get(collectionId);
        if (!collection) return { success: false, error: 'COLLECTION_NOT_FOUND' };
        if (!this.recipes.has(recipeId)) return { success: false, error: 'RECIPE_NOT_FOUND' };
        if (!collection.recipeIds.includes(recipeId)) collection.recipeIds.push(recipeId);
        return { success: true, collection: { ...collection } };
    }

    removeFromCollection(collectionId, recipeId) {
        const collection = this.collections.get(collectionId);
        if (!collection) return { success: false, error: 'COLLECTION_NOT_FOUND' };
        collection.recipeIds = collection.recipeIds.filter(id => id !== recipeId);
        return { success: true, collection: { ...collection } };
    }

    listCollections() { return Array.from(this.collections.values()).map(c => ({ ...c })); }

    getCollection(id) { return this.collections.get(id) ? { ...this.collections.get(id) } : null; }

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

    toJSON() { return { recipes: Array.from(this.recipes.entries()), recipeVersions: Array.from(this.recipeVersions.entries()), collections: Array.from(this.collections.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.recipes) this.recipes = new Map(data.recipes);
        if (data.recipeVersions) this.recipeVersions = new Map(data.recipeVersions);
        if (data.collections) this.collections = new Map(data.collections);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, recipeCount: this.recipes.size, collectionCount: this.collections.size }; }
}