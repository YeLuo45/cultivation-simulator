/**
 * CultivationManual.js - 修炼秘籍
 * V1104 P-20260614-606 Round 42 Iter 7/30
 */
export const MANUAL_TYPES = ['compendium', 'scroll', 'tablet', 'oral', 'vision'];
export const MANUAL_RARITY = ['common', 'rare', 'epic', 'legendary', 'divine'];

export class CultivationManual {
    constructor(config = {}) {
        this.config = { ...config };
        this.manuals = new Map();   // mid -> { id, name, type, rarity, techniques, owner, ts }
        this.byType = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalTechniques: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `mn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    compile(name, type, techniques = [], rarity = 'common', owner = null) {
        if (!name) return null;
        if (!MANUAL_TYPES.includes(type)) type = 'compendium';
        if (!MANUAL_RARITY.includes(rarity)) rarity = 'common';
        if (!Array.isArray(techniques)) techniques = [];
        const id = this._newId();
        const m = { id, name, type, rarity, techniques: [...techniques], owner, ts: Date.now() };
        this.manuals.set(id, m);
        if (!this.byType.has(type)) this.byType.set(type, new Set());
        this.byType.get(type).add(id);
        this.stats.total++;
        this.stats.totalTechniques += techniques.length;
        return m;
    }
    get(id) { return this.manuals.get(id) || null; }
    listAll() { return [...this.manuals.values()]; }
    listByType(type) {
        const ids = this.byType.get(type) || new Set();
        return [...ids].map(id => this.manuals.get(id)).filter(Boolean);
    }
    listByRarity(r) { return this.listAll().filter(m => m.rarity === r); }
    listDivine() { return this.listByRarity('divine'); }
    listByOwner(owner) { return this.listAll().filter(m => m.owner === owner); }

    addTechnique(id, techniqueId) {
        const m = this.manuals.get(id);
        if (!m) return false;
        if (m.techniques.includes(techniqueId)) return false;
        m.techniques.push(techniqueId);
        this.stats.totalTechniques++;
        return true;
    }
    removeTechnique(id, techniqueId) {
        const m = this.manuals.get(id);
        if (!m) return false;
        m.techniques = m.techniques.filter(t => t !== techniqueId);
        return true;
    }
    setOwner(id, owner) {
        const m = this.manuals.get(id);
        if (!m) return false;
        m.owner = owner;
        return true;
    }
    isDivine(id) { return this.manuals.get(id)?.rarity === 'divine'; }
    isComplete(id) { return (this.manuals.get(id)?.techniques.length || 0) >= 5; }
    techniqueCount(id) { return this.manuals.get(id)?.techniques.length || 0; }
    rarityOf(id) { return this.manuals.get(id)?.rarity || null; }
    techniquesOf(id) { return [...(this.manuals.get(id)?.techniques || [])]; }
    hasTechnique(id, techniqueId) { return (this.manuals.get(id)?.techniques || []).includes(techniqueId); }
    averageTechniques() { return this.stats.total === 0 ? 0 : this.stats.totalTechniques / this.stats.total; }
    mostComplete() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, m) => !best || m.techniques.length > best.techniques.length ? m : best, null);
    }
    countByRarity() {
        const c = {};
        for (const r of MANUAL_RARITY) c[r] = 0;
        for (const m of this.manuals.values()) c[m.rarity] = (c[m.rarity] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalTechniques: this.stats.totalTechniques }; }
    reset() { this.manuals.clear(); this.byType.clear(); this.stats = { total: 0, totalTechniques: 0 }; }
}
