/**
 * HeavenEarthLedger.js - 天地账簿
 * V1125 P-20260614-818 Round 42 Iter 28/30
 */
export const LEDGER_TYPES = ['karma', 'merit', 'destiny', 'fortune', 'sin'];
export const LEDGER_STATUS = ['pending', 'committed', 'cancelled'];

export class HeavenEarthLedger {
    constructor(config = {}) {
        this.config = { ...config };
        this.entries = new Map();   // eid -> { id, owner, type, amount, status, reason, ts }
        this.byOwner = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalCommitted: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `hl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    record(owner, type, amount, reason = '') {
        if (!owner) return null;
        if (!LEDGER_TYPES.includes(type)) return null;
        if (typeof amount !== 'number' || amount === 0) return null;
        const id = this._newId();
        const e = { id, owner, type, amount, status: 'pending', reason, ts: Date.now() };
        this.entries.set(id, e);
        if (!this.byOwner.has(owner)) this.byOwner.set(owner, []);
        this.byOwner.get(owner).push(id);
        this.stats.total++;
        return e;
    }
    get(id) { return this.entries.get(id) || null; }
    listAll() { return [...this.entries.values()]; }
    listByOwner(owner) {
        const ids = this.byOwner.get(owner) || [];
        return ids.map(id => this.entries.get(id)).filter(Boolean);
    }
    listByType(type) { return this.listAll().filter(e => e.type === type); }
    listByStatus(st) { return this.listAll().filter(e => e.status === st); }
    listPending() { return this.listByStatus('pending'); }
    listCommitted() { return this.listByStatus('committed'); }

    commit(id) {
        const e = this.entries.get(id);
        if (!e) return false;
        if (e.status !== 'pending') return false;
        e.status = 'committed';
        this.stats.totalCommitted++;
        this._emit('committed', e);
        return true;
    }
    cancel(id) {
        const e = this.entries.get(id);
        if (!e) return false;
        e.status = 'cancelled';
        return true;
    }
    isPending(id) { return this.entries.get(id)?.status === 'pending'; }
    isCommitted(id) { return this.entries.get(id)?.status === 'committed'; }
    isCancelled(id) { return this.entries.get(id)?.status === 'cancelled'; }
    isPositive(id) { return (this.entries.get(id)?.amount || 0) > 0; }
    isNegative(id) { return (this.entries.get(id)?.amount || 0) < 0; }
    amountOf(id) { return this.entries.get(id)?.amount || 0; }
    typeOf(id) { return this.entries.get(id)?.type || null; }
    balanceFor(owner) {
        return this.listByOwner(owner).filter(e => e.status === 'committed').reduce((s, e) => s + e.amount, 0);
    }
    pendingFor(owner) {
        return this.listByOwner(owner).filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);
    }
    positiveFor(owner) {
        return this.listByOwner(owner).filter(e => e.amount > 0 && e.status === 'committed').reduce((s, e) => s + e.amount, 0);
    }
    negativeFor(owner) {
        return this.listByOwner(owner).filter(e => e.amount < 0 && e.status === 'committed').reduce((s, e) => s + e.amount, 0);
    }
    commitRate() { return this.stats.total === 0 ? 0 : this.stats.totalCommitted / this.stats.total; }
    averageAmount() {
        if (this.entries.size === 0) return 0;
        return this.listAll().reduce((s, e) => s + e.amount, 0) / this.entries.size;
    }
    ownerCount(owner) { return this.listByOwner(owner).length; }
    countByType() {
        const c = {};
        for (const t of LEDGER_TYPES) c[t] = 0;
        for (const e of this.entries.values()) c[e.type] = (c[e.type] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalCommitted: this.stats.totalCommitted, commitRate: this.commitRate() }; }
    reset() { this.entries.clear(); this.byOwner.clear(); this.stats = { total: 0, totalCommitted: 0 }; }
}
