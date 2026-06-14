/**
 * BreakthroughCatalyst.js - 突破催化剂
 * V1106 P-20260614-608 Round 42 Iter 9/30
 */
export const CATALYST_TYPES = ['pill', 'herb', 'formation', 'tribulation_elixir', 'blood', 'spiritual_fruit'];
export const CATALYST_RARITY = ['common', 'rare', 'epic', 'legendary', 'divine'];

export class BreakthroughCatalyst {
    constructor(config = {}) {
        this.config = { ...config };
        this.catalysts = new Map();   // cid -> { id, name, type, rarity, power, owner, used, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalUsed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `bc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    craft(name, type, power = 1, rarity = 'common', owner = null) {
        if (!name) return null;
        if (!CATALYST_TYPES.includes(type)) type = 'pill';
        if (!CATALYST_RARITY.includes(rarity)) rarity = 'common';
        const id = this._newId();
        const c = { id, name, type, rarity, power, owner, used: false, ts: Date.now() };
        this.catalysts.set(id, c);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        return c;
    }
    get(id) { return this.catalysts.get(id) || null; }
    listAll() { return [...this.catalysts.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.catalysts.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(c => c.type === type); }
    listByRarity(r) { return this.listAll().filter(c => c.rarity === r); }
    listUnused() { return this.listAll().filter(c => !c.used); }
    listUsed() { return this.listAll().filter(c => c.used); }

    setPower(id, power) {
        const c = this.catalysts.get(id);
        if (!c) return false;
        c.power = Math.max(0, power);
        return true;
    }
    setOwner(id, owner) {
        const c = this.catalysts.get(id);
        if (!c) return false;
        c.owner = owner;
        return true;
    }
    use(id) {
        const c = this.catalysts.get(id);
        if (!c) return false;
        if (c.used) return false;
        c.used = true;
        this.stats.totalUsed++;
        this._emit('used', c);
        return true;
    }
    isDivine(id) { return this.catalysts.get(id)?.rarity === 'divine'; }
    isUsed(id) { return this.catalysts.get(id)?.used === true; }
    powerOf(id) { return this.catalysts.get(id)?.power || 0; }
    typeOf(id) { return this.catalysts.get(id)?.type || null; }
    rarityOf(id) { return this.catalysts.get(id)?.rarity || null; }
    ownerOf(id) { return this.catalysts.get(id)?.owner || null; }
    bestFor(owner) {
        const list = this.listByOwner(owner).filter(c => !c.used);
        if (list.length === 0) return null;
        return list.reduce((best, c) => !best || c.power > best.power ? c : best, null);
    }
    averagePower() {
        if (this.catalysts.size === 0) return 0;
        return this.listAll().reduce((s, c) => s + c.power, 0) / this.catalysts.size;
    }
    usageRate() { return this.stats.total === 0 ? 0 : this.stats.totalUsed / this.stats.total; }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    countByRarity() {
        const c = {};
        for (const r of CATALYST_RARITY) c[r] = 0;
        for (const cat of this.catalysts.values()) c[cat.rarity] = (c[cat.rarity] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalUsed: this.stats.totalUsed, usageRate: this.usageRate() }; }
    reset() { this.catalysts.clear(); this.byOwner.clear(); this.stats = { total: 0, totalUsed: 0 }; }
}
