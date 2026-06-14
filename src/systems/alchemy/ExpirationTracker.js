/**
 * ExpirationTracker.js - 失效追踪器
 * V1055 P-20260614-245 Round 40 Iter 18/30
 */
export const EXPIRATION_STATUS = ['fresh', 'aging', 'stale', 'expired'];
export const DEFAULT_TTL = 30 * 24 * 60 * 60 * 1000;  // 30 days

export class ExpirationTracker {
    constructor(config = {}) {
        this.config = { defaultTtl: config.defaultTtl || DEFAULT_TTL, ...config };
        this.items = new Map();   // itemId -> { id, name, createdAt, ttl, status }
        this.hooks = new Map();
        this.stats = { total: 0, expired: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    track(itemId, name, ttl = null, createdAt = null) {
        if (!itemId) return null;
        this.items.set(itemId, { id: itemId, name, createdAt: createdAt || Date.now(), ttl: ttl || this.config.defaultTtl, status: 'fresh' });
        this.stats.total++;
        return this.items.get(itemId);
    }
    get(itemId) { return this.items.get(itemId) || null; }
    listAll() { return [...this.items.values()]; }
    listByStatus(st) { return this.listAll().filter(i => i.status === st); }

    updateStatus(itemId) {
        const i = this.items.get(itemId);
        if (!i) return false;
        const age = Date.now() - i.createdAt;
        const ratio = age / i.ttl;
        let newStatus;
        if (ratio < 0.5) newStatus = 'fresh';
        else if (ratio < 0.8) newStatus = 'aging';
        else if (ratio < 1) newStatus = 'stale';
        else newStatus = 'expired';
        if (newStatus !== i.status) {
            i.status = newStatus;
            if (newStatus === 'expired') {
                this.stats.expired++;
                this._emit('expired', i);
            }
        }
        return true;
    }
    sweepAll() {
        for (const id of this.items.keys()) this.updateStatus(id);
    }
    isExpired(itemId) { return this.items.get(itemId)?.status === 'expired'; }
    isFresh(itemId) { return this.items.get(itemId)?.status === 'fresh'; }
    isStale(itemId) { return this.items.get(itemId)?.status === 'stale'; }
    remainingMs(itemId) {
        const i = this.items.get(itemId);
        if (!i) return 0;
        return Math.max(0, i.ttl - (Date.now() - i.createdAt));
    }
    freshness(itemId) {
        const i = this.items.get(itemId);
        if (!i) return 0;
        return Math.max(0, Math.min(1, 1 - (Date.now() - i.createdAt) / i.ttl));
    }
    removeExpired() {
        const toRemove = [];
        for (const [id, i] of this.items) {
            if (Date.now() - i.createdAt >= i.ttl) toRemove.push(id);
        }
        for (const id of toRemove) this.items.delete(id);
        return toRemove.length;
    }
    countByStatus() {
        const c = {};
        for (const s of EXPIRATION_STATUS) c[s] = 0;
        for (const i of this.items.values()) c[i.status] = (c[i.status] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, expired: this.stats.expired }; }
    reset() { this.items.clear(); this.stats = { total: 0, expired: 0 }; }
}
