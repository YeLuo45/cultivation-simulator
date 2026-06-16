/**
 * FormationRegistry.js - 阵法登记
 * V1118 P-20260614-811 Round 42 Iter 21/30
 */
export const FORMATION_TYPES = ['attack', 'defense', 'support', 'control', 'illusion', 'sealing'];
export const FORMATION_RARITY = ['common', 'rare', 'epic', 'legendary', 'divine'];

export class FormationRegistry {
    constructor(config = {}) {
        this.config = { ...config };
        this.formations = new Map();   // fid -> { id, name, type, rarity, power, owner, ts }
        this.byOwner = new Map();
        this.byType = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalPower: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `fr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    register(name, type, rarity = 'common', power = 1, owner = null) {
        if (!name) return null;
        if (!FORMATION_TYPES.includes(type)) type = 'defense';
        if (!FORMATION_RARITY.includes(rarity)) rarity = 'common';
        const id = this._newId();
        const f = { id, name, type, rarity, power, owner, ts: Date.now() };
        this.formations.set(id, f);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        if (!this.byType.has(type)) this.byType.set(type, new Set());
        this.byType.get(type).add(id);
        this.stats.total++;
        this.stats.totalPower += power;
        return f;
    }
    get(id) { return this.formations.get(id) || null; }
    listAll() { return [...this.formations.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.formations.get(id)).filter(Boolean);
    }
    listByType(type) {
        const ids = this.byType.get(type) || new Set();
        return [...ids].map(id => this.formations.get(id)).filter(Boolean);
    }
    listByRarity(r) { return this.listAll().filter(f => f.rarity === r); }
    listDivine() { return this.listByRarity('divine'); }

    setPower(id, power) {
        const f = this.formations.get(id);
        if (!f) return false;
        f.power = Math.max(0, power);
        this.stats.totalPower = this.listAll().reduce((s, x) => s + x.power, 0);
        return true;
    }
    setOwner(id, owner) {
        const f = this.formations.get(id);
        if (!f) return false;
        f.owner = owner;
        return true;
    }
    isDivine(id) { return this.formations.get(id)?.rarity === 'divine'; }
    powerOf(id) { return this.formations.get(id)?.power || 0; }
    typeOf(id) { return this.formations.get(id)?.type || null; }
    rarityOf(id) { return this.formations.get(id)?.rarity || null; }
    ownerOf(id) { return this.formations.get(id)?.owner || null; }
    averagePower() { return this.stats.total === 0 ? 0 : this.stats.totalPower / this.stats.total; }
    bestPower() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, f) => !best || f.power > best.power ? f : best, null);
    }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    countByType() {
        const c = {};
        for (const t of FORMATION_TYPES) c[t] = 0;
        for (const f of this.formations.values()) c[f.type] = (c[f.type] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalPower: this.stats.totalPower, averagePower: this.averagePower() }; }
    reset() { this.formations.clear(); this.byOwner.clear(); this.byType.clear(); this.stats = { total: 0, totalPower: 0 }; }
}
