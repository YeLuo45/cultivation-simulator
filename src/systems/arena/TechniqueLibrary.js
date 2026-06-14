/**
 * TechniqueLibrary.js - 战技图书馆
 * V1018 P-20260614-178 Round 39 Iter 11/30
 */
export const TECHNIQUE_TYPES = ['sword', 'blade', 'spear', 'fist', 'palm', 'movement', 'mental'];
export const ELEMENT_TYPES = ['none', 'fire', 'water', 'wood', 'metal', 'earth', 'wind', 'thunder', 'light', 'dark'];

export class TechniqueLibrary {
    constructor(config = {}) {
        this.config = { ...config };
        this.techniques = new Map();   // techId -> { id, name, type, element, power, cost, cooldown, requirements }
        this.byType = new Map();
        this.byElement = new Map();
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `tech_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    addTechnique(name, type, element = 'none', power = 10, cost = 5, cooldown = 1) {
        if (!name) return null;
        if (!TECHNIQUE_TYPES.includes(type)) type = 'sword';
        if (!ELEMENT_TYPES.includes(element)) element = 'none';
        const id = this._newId();
        const t = { id, name, type, element, power, cost, cooldown, requirements: {} };
        this.techniques.set(id, t);
        if (!this.byType.has(type)) this.byType.set(type, new Set());
        this.byType.get(type).add(id);
        if (!this.byElement.has(element)) this.byElement.set(element, new Set());
        this.byElement.get(element).add(id);
        this.stats.total++;
        this._emit('added', t);
        return t;
    }
    get(id) { return this.techniques.get(id) || null; }
    listAll() { return [...this.techniques.values()]; }
    listByType(type) {
        const ids = this.byType.get(type) || new Set();
        return [...ids].map(id => this.techniques.get(id)).filter(Boolean);
    }
    listByElement(element) {
        const ids = this.byElement.get(element) || new Set();
        return [...ids].map(id => this.techniques.get(id)).filter(Boolean);
    }
    searchByName(query) {
        const q = (query || '').toLowerCase();
        return this.listAll().filter(t => t.name.toLowerCase().includes(q));
    }
    setRequirements(id, requirements) {
        const t = this.techniques.get(id);
        if (!t) return false;
        t.requirements = { ...t.requirements, ...requirements };
        return true;
    }
    meetsRequirements(id, playerStats) {
        const t = this.techniques.get(id);
        if (!t) return false;
        for (const [k, v] of Object.entries(t.requirements)) {
            if ((playerStats[k] || 0) < v) return false;
        }
        return true;
    }
    compatible(techId, playerElement) {
        const t = this.techniques.get(techId);
        if (!t) return false;
        if (t.element === 'none') return true;
        return t.element === playerElement;
    }
    byPower(minPower = 0) { return this.listAll().filter(t => t.power >= minPower); }
    isAffordable(techId, availableQi) {
        const t = this.techniques.get(techId);
        return t ? availableQi >= t.cost : false;
    }
    bestForElement(element) {
        const list = this.listByElement(element);
        if (list.length === 0) return null;
        return list.reduce((best, t) => !best || t.power > best.power ? t : best, null);
    }
    report() { return { total: this.stats.total, byType: Object.fromEntries([...this.byType.entries()].map(([k, v]) => [k, v.size])) }; }
    reset() { this.techniques.clear(); this.byType.clear(); this.byElement.clear(); this.stats = { total: 0 }; }
}
