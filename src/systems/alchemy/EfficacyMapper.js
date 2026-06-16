/**
 * EfficacyMapper.js - 功效图谱
 * V1048 P-20260614-238 Round 40 Iter 11/30
 */
export const EFFICACY_TYPES = ['heal', 'attack', 'defense', 'speed', 'wisdom', 'luck', 'resist'];
export const DEFAULT_EFFICACY = 1.0;

export class EfficacyMapper {
    constructor(config = {}) {
        this.config = { ...config };
        this.efficacies = new Map();   // pillId -> { id, name, type, value, sideEffects }
        this.byType = new Map();
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `efc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    registerPill(pillId, name, type, value = DEFAULT_EFFICACY) {
        if (!pillId) return false;
        if (!EFFICACY_TYPES.includes(type)) type = 'heal';
        this.efficacies.set(pillId, { id: pillId, name, type, value, sideEffects: [] });
        if (!this.byType.has(type)) this.byType.set(type, new Set());
        this.byType.get(type).add(pillId);
        this.stats.total++;
        return true;
    }
    get(pillId) { return this.efficacies.get(pillId) || null; }
    listAll() { return [...this.efficacies.values()]; }
    listByType(type) {
        const ids = this.byType.get(type) || new Set();
        return [...ids].map(id => this.efficacies.get(id)).filter(Boolean);
    }

    setValue(pillId, value) {
        const e = this.efficacies.get(pillId);
        if (!e) return false;
        e.value = Math.max(0, value);
        return true;
    }
    boost(pillId, amount) {
        const e = this.efficacies.get(pillId);
        if (!e) return false;
        e.value = Math.max(0, e.value + amount);
        return true;
    }
    addSideEffect(pillId, effect) {
        const e = this.efficacies.get(pillId);
        if (!e) return false;
        e.sideEffects.push(effect);
        return true;
    }
    hasSideEffect(pillId, effect) {
        return (this.efficacies.get(pillId)?.sideEffects || []).includes(effect);
    }
    sideEffectCount(pillId) { return this.efficacies.get(pillId)?.sideEffects.length || 0; }

    strongest(type, n = 5) {
        return this.listByType(type).sort((a, b) => b.value - a.value).slice(0, n);
    }
    averageValue(type = null) {
        const list = type ? this.listByType(type) : this.listAll();
        if (list.length === 0) return 0;
        return list.reduce((s, e) => s + e.value, 0) / list.length;
    }
    bestFor(type) {
        const list = this.listByType(type);
        if (list.length === 0) return null;
        return list.reduce((best, e) => !best || e.value > best.value ? e : best, null);
    }
    isEffective(pillId, threshold = 1.0) {
        return (this.efficacies.get(pillId)?.value || 0) >= threshold;
    }
    pillValue(pillId) { return this.efficacies.get(pillId)?.value || 0; }
    countByType() {
        const c = {};
        for (const t of EFFICACY_TYPES) c[t] = 0;
        for (const e of this.efficacies.values()) c[e.type] = (c[e.type] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total }; }
    reset() { this.efficacies.clear(); this.byType.clear(); this.stats = { total: 0 }; }
}
