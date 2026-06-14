/**
 * TechniqueRegistry.js - 功法注册表
 * V1103 P-20260614-605 Round 42 Iter 6/30
 */
export const TECHNIQUE_RARITY = ['common', 'rare', 'epic', 'legendary', 'immortal'];
export const TECHNIQUE_ELEMENTS = ['none', 'metal', 'wood', 'water', 'fire', 'earth', 'wind', 'thunder', 'ice', 'light', 'dark'];

export class TechniqueRegistry {
    constructor(config = {}) {
        this.config = { ...config };
        this.techniques = new Map();   // tid -> { id, name, element, rarity, mastery, owner, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalMastery: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `tc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    register(name, element = 'none', rarity = 'common', owner = null) {
        if (!name) return null;
        if (!TECHNIQUE_ELEMENTS.includes(element)) element = 'none';
        if (!TECHNIQUE_RARITY.includes(rarity)) rarity = 'common';
        const id = this._newId();
        const t = { id, name, element, rarity, mastery: 0, owner, ts: Date.now() };
        this.techniques.set(id, t);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        return t;
    }
    get(id) { return this.techniques.get(id) || null; }
    listAll() { return [...this.techniques.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.techniques.get(id)).filter(Boolean);
    }
    listByElement(el) { return this.listAll().filter(t => t.element === el); }
    listByRarity(r) { return this.listAll().filter(t => t.rarity === r); }
    listImmortal() { return this.listByRarity('immortal'); }

    setMastery(id, mastery) {
        const t = this.techniques.get(id);
        if (!t) return false;
        t.mastery = Math.max(0, Math.min(1, mastery));
        this.stats.totalMastery = this.listAll().reduce((s, x) => s + x.mastery, 0);
        return true;
    }
    setOwner(id, owner) {
        const t = this.techniques.get(id);
        if (!t) return false;
        t.owner = owner;
        return true;
    }
    isImmortal(id) { return this.techniques.get(id)?.rarity === 'immortal'; }
    isMastered(id) { return (this.techniques.get(id)?.mastery || 0) >= 0.9; }
    masteryOf(id) { return this.techniques.get(id)?.mastery || 0; }
    rarityOf(id) { return this.techniques.get(id)?.rarity || null; }
    elementOf(id) { return this.techniques.get(id)?.element || null; }
    ownerOf(id) { return this.techniques.get(id)?.owner || null; }
    averageMastery() { return this.stats.total === 0 ? 0 : this.stats.totalMastery / this.stats.total; }
    bestMastered() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, t) => !best || t.mastery > best.mastery ? t : best, null);
    }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    countByRarity() {
        const c = {};
        for (const r of TECHNIQUE_RARITY) c[r] = 0;
        for (const t of this.techniques.values()) c[t.rarity] = (c[t.rarity] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, averageMastery: this.averageMastery() }; }
    reset() { this.techniques.clear(); this.byOwner.clear(); this.stats = { total: 0, totalMastery: 0 }; }
}
