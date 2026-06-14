/**
 * SymbolDesigner.js - 符文设计
 * V1131 Round 43 Iter 4/30
 */
export const SYMBOL_CATEGORIES = ['offensive', 'defensive', 'utility', 'control', 'healing', 'summoning'];
export const SYMBOL_RARITY = ['common', 'rare', 'epic', 'legendary', 'mythic'];

export class SymbolDesigner {
    constructor(config = {}) {
        this.config = { ...config };
        this.symbols = new Map();   // sid -> { id, name, category, rarity, complexity, owner, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalComplexity: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `sd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    design(name, category, complexity = 1, rarity = 'common', owner = null) {
        if (!name) return null;
        if (!SYMBOL_CATEGORIES.includes(category)) category = 'utility';
        if (!SYMBOL_RARITY.includes(rarity)) rarity = 'common';
        const id = this._newId();
        const s = { id, name, category, rarity, complexity, owner, ts: Date.now() };
        this.symbols.set(id, s);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        this.stats.totalComplexity += complexity;
        this._emit('designed', s);
        return s;
    }
    get(id) { return this.symbols.get(id) || null; }
    listAll() { return [...this.symbols.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.symbols.get(id)).filter(Boolean);
    }
    listByCategory(c) { return this.listAll().filter(s => s.category === c); }
    listByRarity(r) { return this.listAll().filter(s => s.rarity === r); }
    listMythic() { return this.listByRarity('mythic'); }

    setComplexity(id, complexity) {
        const s = this.symbols.get(id);
        if (!s) return false;
        s.complexity = Math.max(0, complexity);
        this.stats.totalComplexity = this.listAll().reduce((sum, x) => sum + x.complexity, 0);
        return true;
    }
    setRarity(id, rarity) {
        const s = this.symbols.get(id);
        if (!s) return false;
        if (!SYMBOL_RARITY.includes(rarity)) return false;
        s.rarity = rarity;
        return true;
    }
    setOwner(id, owner) {
        const s = this.symbols.get(id);
        if (!s) return false;
        s.owner = owner;
        return true;
    }
    isMythic(id) { return this.symbols.get(id)?.rarity === 'mythic'; }
    complexityOf(id) { return this.symbols.get(id)?.complexity || 0; }
    rarityOf(id) { return this.symbols.get(id)?.rarity || null; }
    categoryOf(id) { return this.symbols.get(id)?.category || null; }
    ownerOf(id) { return this.symbols.get(id)?.owner || null; }
    averageComplexity() { return this.stats.total === 0 ? 0 : this.stats.totalComplexity / this.stats.total; }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    bestComplexity() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, s) => !best || s.complexity > best.complexity ? s : best, null);
    }
    countByCategory() {
        const c = {};
        for (const cat of SYMBOL_CATEGORIES) c[cat] = 0;
        for (const s of this.symbols.values()) c[s.category] = (c[s.category] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, averageComplexity: this.averageComplexity() }; }
    reset() { this.symbols.clear(); this.byOwner.clear(); this.stats = { total: 0, totalComplexity: 0 }; }
}
