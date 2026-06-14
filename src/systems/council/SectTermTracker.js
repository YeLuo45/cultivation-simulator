/**
 * SectTermTracker.js - 任期追踪器
 * V982 P-20260614-142 Round 38 Iter 5/30
 */
export const DEFAULT_TERM_LENGTH_MS = 90 * 24 * 60 * 60 * 1000;  // 90 days
export const TERM_STATUS = ['active', 'expired', 'renewed', 'revoked'];

export class SectTermTracker {
    constructor(config = {}) {
        this.config = {
            defaultTermLength: config.defaultTermLength || DEFAULT_TERM_LENGTH_MS,
            ...config,
        };
        this.terms = new Map();        // termId -> { memberId, role, startTs, endTs, status }
        this.byMember = new Map();     // memberId -> [termId]
        this.hooks = new Map();
        this.stats = { total: 0, expired: 0, renewed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `term_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    startTerm(memberId, role, lengthMs = null) {
        if (!memberId || !role) return null;
        const len = lengthMs || this.config.defaultTermLength;
        const now = Date.now();
        const id = this._newId();
        const t = { id, memberId, role, startTs: now, endTs: now + len, status: 'active' };
        this.terms.set(id, t);
        if (!this.byMember.has(memberId)) this.byMember.set(memberId, []);
        this.byMember.get(memberId).push(id);
        this.stats.total++;
        this._emit('termStarted', t);
        return t;
    }
    get(id) { return this.terms.get(id) || null; }
    isActive(id) {
        const t = this.terms.get(id);
        if (!t) return false;
        return t.status === 'active' && Date.now() < t.endTs;
    }
    remainingMs(id) {
        const t = this.terms.get(id);
        if (!t) return 0;
        return Math.max(0, t.endTs - Date.now());
    }
    progress(id) {
        const t = this.terms.get(id);
        if (!t) return 0;
        const total = t.endTs - t.startTs;
        if (total === 0) return 1;
        return Math.min(1, (Date.now() - t.startTs) / total);
    }
    renew(id, extensionMs = null) {
        const t = this.terms.get(id);
        if (!t) return false;
        const ext = extensionMs || this.config.defaultTermLength;
        t.endTs += ext;
        t.status = 'renewed';
        this.stats.renewed++;
        this._emit('renewed', t);
        return true;
    }
    revoke(id, reason = '') {
        const t = this.terms.get(id);
        if (!t) return false;
        t.status = 'revoked';
        t.revokedAt = Date.now();
        t.revokeReason = reason;
        this._emit('revoked', t);
        return true;
    }
    sweepExpired() {
        const now = Date.now();
        for (const t of this.terms.values()) {
            if (t.status === 'active' && now >= t.endTs) {
                t.status = 'expired';
                this.stats.expired++;
                this._emit('expired', t);
            }
        }
    }
    activeFor(memberId) {
        const ids = this.byMember.get(memberId) || [];
        return ids.map(id => this.terms.get(id)).filter(t => t && this.isActive(t.id));
    }
    historyFor(memberId) {
        const ids = this.byMember.get(memberId) || [];
        return ids.map(id => this.terms.get(id)).filter(Boolean);
    }
    expiredTerms() {
        this.sweepExpired();
        return [...this.terms.values()].filter(t => t.status === 'expired');
    }
    report() { return { ...this.stats, total: this.terms.size }; }
    reset() { this.terms.clear(); this.byMember.clear(); this.stats = { total: 0, expired: 0, renewed: 0 }; }
}
