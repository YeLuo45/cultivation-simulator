/**
 * RecipeRegistry.js - 丹方登记册
 * V1038 P-20260614-228 Round 40 Iter 1/30 Direction C 仙道炼药坊
 */
export const RECIPE_TYPES = ['healing', 'attack', 'buff', 'cure', 'enhance', 'special'];
export const RECIPE_RARITY = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export class RecipeRegistry {
    constructor(config = {}) {
        this.config = { ...config };
        this.recipes = new Map();   // recipeId -> { id, name, type, rarity, ingredients, output, difficulty }
        this.byType = new Map();
        this.byRarity = new Map();
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `rcp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    addRecipe(name, type, ingredients, output, difficulty = 1, rarity = 'common') {
        if (!name) return null;
        if (!RECIPE_TYPES.includes(type)) type = 'healing';
        if (!RECIPE_RARITY.includes(rarity)) rarity = 'common';
        if (!Array.isArray(ingredients)) return null;
        const id = this._newId();
        const r = { id, name, type, ingredients: [...ingredients], output, difficulty, rarity, createdAt: Date.now() };
        this.recipes.set(id, r);
        if (!this.byType.has(type)) this.byType.set(type, new Set());
        this.byType.get(type).add(id);
        if (!this.byRarity.has(rarity)) this.byRarity.set(rarity, new Set());
        this.byRarity.get(rarity).add(id);
        this.stats.total++;
        this._emit('added', r);
        return r;
    }
    get(id) { return this.recipes.get(id) || null; }
    listAll() { return [...this.recipes.values()]; }
    listByType(type) {
        const ids = this.byType.get(type) || new Set();
        return [...ids].map(id => this.recipes.get(id)).filter(Boolean);
    }
    listByRarity(rarity) {
        const ids = this.byRarity.get(rarity) || new Set();
        return [...ids].map(id => this.recipes.get(id)).filter(Boolean);
    }
    searchByName(query) {
        const q = (query || '').toLowerCase();
        return this.listAll().filter(r => r.name.toLowerCase().includes(q));
    }
    hasIngredient(id, ingredient) {
        return (this.recipes.get(id)?.ingredients || []).includes(ingredient);
    }
    ingredientCount(id) { return this.recipes.get(id)?.ingredients.length || 0; }
    byOutput(item) { return this.listAll().filter(r => r.output === item); }
    byDifficulty(min = 0) { return this.listAll().filter(r => r.difficulty >= min); }
    byMaxDifficulty(max = 100) { return this.listAll().filter(r => r.difficulty <= max); }
    setDifficulty(id, level) {
        const r = this.recipes.get(id);
        if (!r) return false;
        r.difficulty = Math.max(1, Math.min(100, level));
        return true;
    }
    countByType() {
        const c = {};
        for (const t of RECIPE_TYPES) c[t] = 0;
        for (const r of this.recipes.values()) c[r.type] = (c[r.type] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, byType: this.countByType() }; }
    reset() { this.recipes.clear(); this.byType.clear(); this.byRarity.clear(); this.stats = { total: 0 }; }
}
