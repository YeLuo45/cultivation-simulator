/**
 * TalismanArray.js - 符阵
 * V1148 Round 43 Iter 21/30
 */
export const ARRAY_TYPES = ['attack', 'defense', 'illusion', 'support', 'banish', 'summon'];
export const ARRAY_SIZES = ['small', 'medium', 'large', 'vast', 'grand'];

export class TalismanArray {
    constructor(config = {}) {
        this.config = { ...config };
        this.arrays = new Map();   // aid -> { id, name, type, size, talismans, power, owner, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalPower: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ta2_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(name, type, talismans = [], size = 'small', owner = null) {
        if (!name) return null;
        if (!ARRAY_TYPES.includes(type)) type = 'attack';
        if (!ARRAY_SIZES.includes(size)) size = 'small';
        if (!Array.isArray(talismans)) talismans = [];
        const power = talismans.length * 10 + (size === 'grand' ? 100 : size === 'vast' ? 50 : size === 'large' ? 25 : size === 'medium' ? 10 : 0);
        const id = this._newId();
        const a = { id, name, type, size, talismans: [...talismans], power, owner, ts: Date.now() };
        this.arrays.set(id, a);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        this.stats.totalPower += power;
        this._emit('created', a);
        return a;
    }
    get(id) { return this.arrays.get(id) || null; }
    listAll() { return [...this.arrays.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.arrays.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(a => a.type === type); }
    listBySize(s) { return this.listAll().filter(a => a.size === s); }
    listGrand() { return this.listBySize('grand'); }

    addTalisman(id, talisman) {
        const a = this.arrays.get(id);
        if (!a) return false;
        a.talismans.push(talisman);
        a.power = a.talismans.length * 10 + (a.size === 'grand' ? 100 : a.size === 'vast' ? 50 : a.size === 'large' ? 25 : a.size === 'medium' ? 10 : 0);
        this.stats.totalPower = this.listAll().reduce((s, x) => s + x.power, 0);
        return true;
    }
    removeTalisman(id, talisman) {
        const a = this.arrays.get(id);
        if (!a) return false;
        a.talismans = a.talismans.filter(t => t !== talisman);
        return true;
    }
    setSize(id, size) {
        const a = this.arrays.get(id);
        if (!a) return false;
        if (!ARRAY_SIZES.includes(size)) return false;
        a.size = size;
        return true;
    }
    setOwner(id, owner) {
        const a = this.arrays.get(id);
        if (!a) return false;
        a.owner = owner;
        return true;
    }
    isGrand(id) { return this.arrays.get(id)?.size === 'grand'; }
    powerOf(id) { return this.arrays.get(id)?.power || 0; }
    typeOf(id) { return this.arrays.get(id)?.type || null; }
    sizeOf(id) { return this.arrays.get(id)?.size || null; }
    talismanCount(id) { return this.arrays.get(id)?.talismans.length || 0; }
    talismansOf(id) { return [...(this.arrays.get(id)?.talismans || [])]; }
    averagePower() { return this.stats.total === 0 ? 0 : this.stats.totalPower / this.stats.total; }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    bestPower() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, a) => !best || a.power > best.power ? a : best, null);
    }
    countByType() {
        const c = {};
        for (const t of ARRAY_TYPES) c[t] = 0;
        for (const a of this.arrays.values()) c[a.type] = (c[a.type] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalPower: this.stats.totalPower, averagePower: this.averagePower() }; }
    reset() { this.arrays.clear(); this.byOwner.clear(); this.stats = { total: 0, totalPower: 0 }; }
}
