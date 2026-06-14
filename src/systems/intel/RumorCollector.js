/**
 * RumorCollector.js - 谣言收集器
 * V1069 P-20260614-263 Round 41 Iter 2/30
 */
export const RUMOR_TYPES = ['gossip', 'sighting', 'warning', 'prediction', 'prophecy'];
export const VERIFICATION = ['unverified', 'likely', 'confirmed', 'false'];

export class RumorCollector {
    constructor(config = {}) {
        this.config = { ...config };
        this.rumors = new Map();   // rumorId -> { id, type, content, source, verification, ts }
        this.byType = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, confirmed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `rum_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    collect(type, content, source = 'unknown') {
        if (!RUMOR_TYPES.includes(type)) type = 'gossip';
        if (!content) return null;
        const id = this._newId();
        const r = { id, type, content, source, verification: 'unverified', ts: Date.now() };
        this.rumors.set(id, r);
        if (!this.byType.has(type)) this.byType.set(type, new Set());
        this.byType.get(type).add(id);
        this.stats.total++;
        this._emit('collected', r);
        return r;
    }
    get(id) { return this.rumors.get(id) || null; }
    listAll() { return [...this.rumors.values()]; }
    listByType(type) {
        const ids = this.byType.get(type) || new Set();
        return [...ids].map(id => this.rumors.get(id)).filter(Boolean);
    }
    listByVerification(v) { return this.listAll().filter(r => r.verification === v); }
    listBySource(source) { return this.listAll().filter(r => r.source === source); }

    verify(id, status) {
        const r = this.rumors.get(id);
        if (!r) return false;
        if (!VERIFICATION.includes(status)) return false;
        r.verification = status;
        if (status === 'confirmed') this.stats.confirmed++;
        return true;
    }
    isConfirmed(id) { return this.rumors.get(id)?.verification === 'confirmed'; }
    isFalse(id) { return this.rumors.get(id)?.verification === 'false'; }
    markFalse(id) { return this.verify(id, 'false'); }
    confirm(id) { return this.verify(id, 'confirmed'); }
    countByType() {
        const c = {};
        for (const t of RUMOR_TYPES) c[t] = 0;
        for (const r of this.rumors.values()) c[r.type] = (c[r.type] || 0) + 1;
        return c;
    }
    countByVerification() {
        const c = {};
        for (const v of VERIFICATION) c[v] = 0;
        for (const r of this.rumors.values()) c[r.verification] = (c[r.verification] || 0) + 1;
        return c;
    }
    recent(n = 10) { return this.listAll().sort((a, b) => b.ts - a.ts).slice(0, n); }
    averageCredibility() {
        const map = { unverified: 0.2, likely: 0.6, confirmed: 1.0, false: 0 };
        if (this.rumors.size === 0) return 0;
        return this.listAll().reduce((s, r) => s + map[r.verification], 0) / this.rumors.size;
    }
    report() { return { total: this.stats.total, confirmed: this.stats.confirmed, credibility: this.averageCredibility() }; }
    reset() { this.rumors.clear(); this.byType.clear(); this.stats = { total: 0, confirmed: 0 }; }
}
