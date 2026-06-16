/**
 * IngredientCatalog.js - 灵材目录
 * V1039 P-20260614-258 Round 40 Iter 2/30
 */
export const INGREDIENT_TYPES = ['herb', 'mineral', 'beast', 'essence', 'liquid'];
export const RARITY = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export class IngredientCatalog {
    constructor(config = {}) {
        this.config = { ...config };
        this.ingredients = new Map();   // ingId -> { id, name, type, rarity, qi, price, stock }
        this.byType = new Map();
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ing_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    add(name, type, rarity = 'common', qi = 10, price = 5, stock = 100) {
        if (!name) return null;
        if (!INGREDIENT_TYPES.includes(type)) type = 'herb';
        if (!RARITY.includes(rarity)) rarity = 'common';
        const id = this._newId();
        const i = { id, name, type, rarity, qi, price, stock, createdAt: Date.now() };
        this.ingredients.set(id, i);
        if (!this.byType.has(type)) this.byType.set(type, new Set());
        this.byType.get(type).add(id);
        this.stats.total++;
        return i;
    }
    get(id) { return this.ingredients.get(id) || null; }
    listAll() { return [...this.ingredients.values()]; }
    listByType(type) {
        const ids = this.byType.get(type) || new Set();
        return [...ids].map(id => this.ingredients.get(id)).filter(Boolean);
    }
    listByRarity(rarity) { return this.listAll().filter(i => i.rarity === rarity); }
    searchByName(query) {
        const q = (query || '').toLowerCase();
        return this.listAll().filter(i => i.name.toLowerCase().includes(q));
    }
    setStock(id, amount) {
        const i = this.ingredients.get(id);
        if (!i) return false;
        i.stock = Math.max(0, amount);
        return true;
    }
    consume(id, amount = 1) {
        const i = this.ingredients.get(id);
        if (!i) return false;
        if (i.stock < amount) return false;
        i.stock -= amount;
        this._emit('consumed', { id, amount });
        return true;
    }
    restock(id, amount = 1) {
        const i = this.ingredients.get(id);
        if (!i) return false;
        i.stock += amount;
        this._emit('restocked', { id, amount });
        return true;
    }
    hasStock(id, amount = 1) { return (this.ingredients.get(id)?.stock || 0) >= amount; }
    totalValue() { return this.listAll().reduce((s, i) => s + i.price * i.stock, 0); }
    totalQi() { return this.listAll().reduce((s, i) => s + i.qi * i.stock, 0); }
    setPrice(id, price) {
        const i = this.ingredients.get(id);
        if (!i) return false;
        i.price = Math.max(0, price);
        return true;
    }
    report() { return { total: this.stats.total, totalValue: this.totalValue() }; }
    reset() { this.ingredients.clear(); this.byType.clear(); this.stats = { total: 0 }; }
}
