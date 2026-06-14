/**
 * ResourceEstimator.js - 资源估算器
 * V1077 P-20260614-404 Round 41 Iter 10/30
 */
export const RESOURCE_TYPES = ['gold', 'qi_stones', 'food', 'weapons', 'cultivators', 'formations'];

export class ResourceEstimator {
    constructor(config = {}) {
        this.config = { ...config };
        this.estimates = new Map();   // estId -> { id, faction, type, amount, confidence, ts }
        this.byFaction = new Map();
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `res_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    estimate(faction, type, amount, confidence = 0.7) {
        if (!faction) return null;
        if (!RESOURCE_TYPES.includes(type)) return null;
        if (typeof amount !== 'number' || amount < 0) return null;
        const id = this._newId();
        const e = { id, faction, type, amount, confidence: Math.max(0, Math.min(1, confidence)), ts: Date.now() };
        this.estimates.set(id, e);
        if (!this.byFaction.has(faction)) this.byFaction.set(faction, []);
        this.byFaction.get(faction).push(id);
        this.stats.total++;
        this._emit('estimated', e);
        return e;
    }
    get(id) { return this.estimates.get(id) || null; }
    listAll() { return [...this.estimates.values()]; }
    listByFaction(faction) {
        const ids = this.byFaction.get(faction) || [];
        return ids.map(id => this.estimates.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(e => e.type === type); }

    update(id, amount, confidence) {
        const e = this.estimates.get(id);
        if (!e) return false;
        if (typeof amount === 'number' && amount >= 0) e.amount = amount;
        if (typeof confidence === 'number') e.confidence = Math.max(0, Math.min(1, confidence));
        return true;
    }
    setConfidence(id, confidence) {
        const e = this.estimates.get(id);
        if (!e) return false;
        e.confidence = Math.max(0, Math.min(1, confidence));
        return true;
    }
    totalForFaction(faction, type = null) {
        const list = this.listByFaction(faction).filter(e => !type || e.type === type);
        return list.reduce((s, e) => s + e.amount, 0);
    }
    confidenceOf(id) { return this.estimates.get(id)?.confidence || 0; }
    amountOf(id) { return this.estimates.get(id)?.amount || 0; }
    isReliable(id) { return (this.estimates.get(id)?.confidence || 0) >= 0.7; }
    best(type) {
        const list = this.listByType(type);
        if (list.length === 0) return null;
        return list.reduce((best, e) => !best || e.confidence > best.confidence ? e : best, null);
    }
    mostFor(faction) {
        const list = this.listByFaction(faction);
        if (list.length === 0) return null;
        return list.reduce((best, e) => !best || e.amount > best.amount ? e : best, null);
    }
    countByType() {
        const c = {};
        for (const t of RESOURCE_TYPES) c[t] = 0;
        for (const e of this.estimates.values()) c[e.type] = (c[e.type] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total }; }
    reset() { this.estimates.clear(); this.byFaction.clear(); this.stats = { total: 0 }; }
}
