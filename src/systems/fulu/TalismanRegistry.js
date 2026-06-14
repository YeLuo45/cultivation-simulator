/**
 * TalismanRegistry.js - 符箓登记
 * V1133 Round 43 Iter 6/30
 */
export const TALISMAN_TYPES = ['attack', 'defense', 'speed', 'healing', 'control', 'banish'];
export const TALISMAN_RARITY = ['common', 'rare', 'epic', 'legendary', 'immortal'];

export class TalismanRegistry {
    constructor(config = {}) {
        this.config = { ...config };
        this.talismans = new Map();   // tid -> { id, name, type, rarity, power, charges, owner, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalPower: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `tr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    register(name, type, power = 1, charges = 1, rarity = 'common', owner = null) {
        if (!name) return null;
        if (!TALISMAN_TYPES.includes(type)) type = 'attack';
        if (!TALISMAN_RARITY.includes(rarity)) rarity = 'common';
        const id = this._newId();
        const t = { id, name, type, rarity, power, charges, owner, ts: Date.now() };
        this.talismans.set(id, t);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        this.stats.totalPower += power;
        this._emit('registered', t);
        return t;
    }
    get(id) { return this.talismans.get(id) || null; }
    listAll() { return [...this.talismans.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.talismans.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(t => t.type === type); }
    listByRarity(r) { return this.listAll().filter(t => t.rarity === r); }
    listImmortal() { return this.listByRarity('immortal'); }
    listActive() { return this.listAll().filter(t => t.charges > 0); }

    setPower(id, power) {
        const t = this.talismans.get(id);
        if (!t) return false;
        t.power = Math.max(0, power);
        this.stats.totalPower = this.listAll().reduce((s, x) => s + x.power, 0);
        return true;
    }
    setCharges(id, charges) {
        const t = this.talismans.get(id);
        if (!t) return false;
        t.charges = Math.max(0, charges);
        return true;
    }
    setOwner(id, owner) {
        const t = this.talismans.get(id);
        if (!t) return false;
        t.owner = owner;
        return true;
    }
    consume(id) {
        const t = this.talismans.get(id);
        if (!t) return false;
        if (t.charges <= 0) return false;
        t.charges--;
        return true;
    }
    isImmortal(id) { return this.talismans.get(id)?.rarity === 'immortal'; }
    isExhausted(id) { return (this.talismans.get(id)?.charges || 0) === 0; }
    powerOf(id) { return this.talismans.get(id)?.power || 0; }
    chargesOf(id) { return this.talismans.get(id)?.charges || 0; }
    typeOf(id) { return this.talismans.get(id)?.type || null; }
    rarityOf(id) { return this.talismans.get(id)?.rarity || null; }
    ownerOf(id) { return this.talismans.get(id)?.owner || null; }
    averagePower() { return this.stats.total === 0 ? 0 : this.stats.totalPower / this.stats.total; }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    bestPower() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, t) => !best || t.power > best.power ? t : best, null);
    }
    countByType() {
        const c = {};
        for (const t of TALISMAN_TYPES) c[t] = 0;
        for (const ta of this.talismans.values()) c[ta.type] = (c[ta.type] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalPower: this.stats.totalPower, averagePower: this.averagePower() }; }
    reset() { this.talismans.clear(); this.byOwner.clear(); this.stats = { total: 0, totalPower: 0 }; }
}
