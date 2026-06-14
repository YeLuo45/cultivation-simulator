/**
 * SealTemplate.js - 符箓模板
 * V1132 Round 43 Iter 5/30
 */
export const TEMPLATE_TYPES = ['combat', 'support', 'control', 'healing', 'movement', 'summon'];
export const TEMPLATE_LEVELS = ['basic', 'intermediate', 'advanced', 'master', 'grandmaster'];

export class SealTemplate {
    constructor(config = {}) {
        this.config = { ...config };
        this.templates = new Map();   // tid -> { id, name, type, level, slots, owner, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalSlots: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `st_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    createTemplate(name, type, slots = [], level = 'basic', owner = null) {
        if (!name) return null;
        if (!TEMPLATE_TYPES.includes(type)) type = 'combat';
        if (!TEMPLATE_LEVELS.includes(level)) level = 'basic';
        if (!Array.isArray(slots)) slots = [];
        const id = this._newId();
        const t = { id, name, type, level, slots: [...slots], owner, ts: Date.now() };
        this.templates.set(id, t);
        if (owner) {
            if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
            this.byOwner.get(owner).push(id);
        }
        this.stats.total++;
        this.stats.totalSlots += slots.length;
        return t;
    }
    get(id) { return this.templates.get(id) || null; }
    listAll() { return [...this.templates.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.templates.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(t => t.type === type); }
    listByLevel(l) { return this.listAll().filter(t => t.level === l); }
    listGrandmaster() { return this.listByLevel('grandmaster'); }

    addSlot(id, symbol) {
        const t = this.templates.get(id);
        if (!t) return false;
        t.slots.push(symbol);
        this.stats.totalSlots++;
        return true;
    }
    removeSlot(id, symbol) {
        const t = this.templates.get(id);
        if (!t) return false;
        t.slots = t.slots.filter(s => s !== symbol);
        return true;
    }
    setLevel(id, level) {
        const t = this.templates.get(id);
        if (!t) return false;
        if (!TEMPLATE_LEVELS.includes(level)) return false;
        t.level = level;
        return true;
    }
    setOwner(id, owner) {
        const t = this.templates.get(id);
        if (!t) return false;
        t.owner = owner;
        return true;
    }
    isGrandmaster(id) { return this.templates.get(id)?.level === 'grandmaster'; }
    slotCount(id) { return this.templates.get(id)?.slots.length || 0; }
    levelOf(id) { return this.templates.get(id)?.level || null; }
    typeOf(id) { return this.templates.get(id)?.type || null; }
    slotsOf(id) { return [...(this.templates.get(id)?.slots || [])]; }
    hasSymbol(id, symbol) { return (this.templates.get(id)?.slots || []).includes(symbol); }
    averageSlots() { return this.stats.total === 0 ? 0 : this.stats.totalSlots / this.stats.total; }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    bestTemplate() {
        const list = this.listAll();
        if (list.length === 0) return null;
        return list.reduce((best, t) => !best || t.slots.length > best.slots.length ? t : best, null);
    }
    report() { return { total: this.stats.total, totalSlots: this.stats.totalSlots, averageSlots: this.averageSlots() }; }
    reset() { this.templates.clear(); this.byOwner.clear(); this.stats = { total: 0, totalSlots: 0 }; }
}
