/**
 * SpiritBeastRegistry.js - 灵兽登记
 * V1108 P-20260614-801 Round 42 Iter 11/30
 */
export const BEAST_TYPES = ['dragon', 'phoenix', 'qilin', 'tiger', 'turtle', 'snake', 'fox', 'wolf', 'eagle', 'fish'];
export const BEAST_RARITY = ['common', 'rare', 'epic', 'legendary', 'divine', 'primordial'];

export class SpiritBeastRegistry {
    constructor(config = {}) {
        this.config = { ...config };
        this.beasts = new Map();   // bid -> { id, name, type, rarity, level, owner, ts }
        this.byOwner = new Map();
        this.byType = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalLevel: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `sb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    register(name, type, rarity = 'common', level = 1, owner = null) {
        if (!name) return null;
        if (!BEAST_TYPES.includes(type)) type = 'wolf';
        if (!BEAST_RARITY.includes(rarity)) rarity = 'common';
        const id = this._newId();
        const b = { id, name, type, rarity, level, owner, ts: Date.now() };
        this.beasts.set(id, b);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        if (!this.byType.has(type)) this.byType.set(type, new Set());
        this.byType.get(type).add(id);
        this.stats.total++;
        this.stats.totalLevel += level;
        return b;
    }
    get(id) { return this.beasts.get(id) || null; }
    listAll() { return [...this.beasts.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.beasts.get(id)).filter(Boolean);
    }
    listByType(type) {
        const ids = this.byType.get(type) || new Set();
        return [...ids].map(id => this.beasts.get(id)).filter(Boolean);
    }
    listByRarity(r) { return this.listAll().filter(b => b.rarity === r); }
    listDivine() { return this.listAll().filter(b => b.rarity === 'divine' || b.rarity === 'primordial'); }

    setLevel(id, level) {
        const b = this.beasts.get(id);
        if (!b) return false;
        b.level = Math.max(1, level);
        this.stats.totalLevel = this.listAll().reduce((s, x) => s + x.level, 0);
        return true;
    }
    setOwner(id, owner) {
        const b = this.beasts.get(id);
        if (!b) return false;
        b.owner = owner;
        return true;
    }
    isDivine(id) { const r = this.beasts.get(id)?.rarity; return r === 'divine' || r === 'primordial'; }
    isPrimordial(id) { return this.beasts.get(id)?.rarity === 'primordial'; }
    levelOf(id) { return this.beasts.get(id)?.level || 0; }
    rarityOf(id) { return this.beasts.get(id)?.rarity || null; }
    typeOf(id) { return this.beasts.get(id)?.type || null; }
    ownerOf(id) { return this.beasts.get(id)?.owner || null; }
    averageLevel() { return this.stats.total === 0 ? 0 : this.stats.totalLevel / this.stats.total; }
    bestLevel() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, b) => !best || b.level > best.level ? b : best, null);
    }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    countByType() {
        const c = {};
        for (const t of BEAST_TYPES) c[t] = 0;
        for (const b of this.beasts.values()) c[b.type] = (c[b.type] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, averageLevel: this.averageLevel() }; }
    reset() { this.beasts.clear(); this.byOwner.clear(); this.byType.clear(); this.stats = { total: 0, totalLevel: 0 }; }
}
