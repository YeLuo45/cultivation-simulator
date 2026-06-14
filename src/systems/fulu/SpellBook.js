/**
 * SpellBook.js - 咒语书
 * V1143 Round 43 Iter 16/30
 */
export const SPELL_TYPES = ['fire', 'ice', 'thunder', 'healing', 'shield', 'curse'];
export const SPELL_TIERS = ['cantrip', 'first', 'second', 'third', 'fourth', 'fifth'];

export class SpellBook {
    constructor(config = {}) {
        this.config = { ...config };
        this.spells = new Map();   // sid -> { id, name, type, tier, mana, owner, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalMana: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `sb2_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    addSpell(name, type, tier = 'cantrip', mana = 5, owner = null) {
        if (!name) return null;
        if (!SPELL_TYPES.includes(type)) type = 'fire';
        if (!SPELL_TIERS.includes(tier)) tier = 'cantrip';
        const id = this._newId();
        const s = { id, name, type, tier, mana, owner, ts: Date.now() };
        this.spells.set(id, s);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        this.stats.totalMana += mana;
        this._emit('added', s);
        return s;
    }
    get(id) { return this.spells.get(id) || null; }
    listAll() { return [...this.spells.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.spells.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(s => s.type === type); }
    listByTier(t) { return this.listAll().filter(s => s.tier === t); }
    listFifthTier() { return this.listByTier('fifth'); }

    setTier(id, tier) {
        const s = this.spells.get(id);
        if (!s) return false;
        if (!SPELL_TIERS.includes(tier)) return false;
        s.tier = tier;
        return true;
    }
    setMana(id, mana) {
        const s = this.spells.get(id);
        if (!s) return false;
        s.mana = Math.max(0, mana);
        this.stats.totalMana = this.listAll().reduce((sum, x) => sum + x.mana, 0);
        return true;
    }
    setOwner(id, owner) {
        const s = this.spells.get(id);
        if (!s) return false;
        s.owner = owner;
        return true;
    }
    isFifthTier(id) { return this.spells.get(id)?.tier === 'fifth'; }
    manaOf(id) { return this.spells.get(id)?.mana || 0; }
    typeOf(id) { return this.spells.get(id)?.type || null; }
    tierOf(id) { return this.spells.get(id)?.tier || null; }
    ownerOf(id) { return this.spells.get(id)?.owner || null; }
    tierIndex(id) { return SPELL_TIERS.indexOf(this.spells.get(id)?.tier || ''); }
    averageMana() { return this.stats.total === 0 ? 0 : this.stats.totalMana / this.stats.total; }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    bestMana() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, s) => !best || s.mana > best.mana ? s : best, null);
    }
    countByType() {
        const c = {};
        for (const t of SPELL_TYPES) c[t] = 0;
        for (const s of this.spells.values()) c[s.type] = (c[s.type] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalMana: this.stats.totalMana, averageMana: this.averageMana() }; }
    reset() { this.spells.clear(); this.byOwner.clear(); this.stats = { total: 0, totalMana: 0 }; }
}
