/**
 * TreatyEngine.js - 条约引擎
 * V999 P-20260614-159 Round 38 Iter 22/30
 */
export const TREATY_TYPES = ['peace', 'non_aggression', 'trade', 'alliance', 'mutual_defense', 'vassalage'];
export const TREATY_STATUS = ['draft', 'active', 'expired', 'broken', 'renegotiated'];

export class TreatyEngine {
    constructor(config = {}) {
        this.config = { ...config };
        this.treaties = new Map();     // treatyId -> { id, type, parties, terms, status, signedAt, expiresAt, history }
        this.hooks = new Map();
        this.stats = { total: 0, active: 0, broken: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `trty_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    draft(type, parties, terms, durationMs = null) {
        if (!TREATY_TYPES.includes(type)) return null;
        if (!Array.isArray(parties) || parties.length < 2) return null;
        const id = this._newId();
        const t = { id, type, parties: [...parties], terms: terms || {}, status: 'draft', signedAt: null, expiresAt: null, history: [] };
        if (durationMs !== null) t.expiresAt = Date.now() + durationMs;
        this.treaties.set(id, t);
        this.stats.total++;
        this._emit('drafted', t);
        return t;
    }
    sign(treatyId) {
        const t = this.treaties.get(treatyId);
        if (!t || t.status !== 'draft') return false;
        t.status = 'active';
        t.signedAt = Date.now();
        t.history.push({ event: 'signed', ts: Date.now() });
        this.stats.active++;
        this._emit('signed', t);
        return true;
    }
    breakTreaty(treatyId, reason = '') {
        const t = this.treaties.get(treatyId);
        if (!t || t.status !== 'active') return false;
        t.status = 'broken';
        t.brokenAt = Date.now();
        t.breakReason = reason;
        this.stats.active--;
        this.stats.broken++;
        this._emit('broken', t);
        return true;
    }
    renegotiate(treatyId, newTerms) {
        const t = this.treaties.get(treatyId);
        if (!t) return false;
        const oldStatus = t.status;
        t.status = 'draft';
        t.terms = newTerms;
        t.history.push({ event: 'renegotiated', from: oldStatus, ts: Date.now() });
        if (oldStatus === 'active') this.stats.active--;
        return true;
    }
    expireOverdue() {
        const now = Date.now();
        for (const t of this.treaties.values()) {
            if (t.status === 'active' && t.expiresAt && now >= t.expiresAt) {
                t.status = 'expired';
                this.stats.active--;
                this._emit('expired', t);
            }
        }
    }

    get(treatyId) { return this.treaties.get(treatyId) || null; }
    listAll() { return [...this.treaties.values()]; }
    listByStatus(st) { return this.listAll().filter(t => t.status === st); }
    listByParty(sectId) { return this.listAll().filter(t => t.parties.includes(sectId)); }
    listByType(type) { return this.listAll().filter(t => t.type === type); }

    isActive(treatyId) { return this.treaties.get(treatyId)?.status === 'active'; }
    isBroken(treatyId) { return this.treaties.get(treatyId)?.status === 'broken'; }
    hasActiveTreaty(a, b, type = null) {
        return this.listByParty(a).some(t => t.status === 'active' && t.parties.includes(b) && (type === null || t.type === type));
    }
    isExpiring(treatyId, withinMs = 7 * 24 * 60 * 60 * 1000) {
        const t = this.treaties.get(treatyId);
        if (!t || t.status !== 'active' || !t.expiresAt) return false;
        return t.expiresAt - Date.now() < withinMs;
    }
    history(treatyId) { return [...(this.treaties.get(treatyId)?.history || [])]; }
    report() { return { total: this.stats.total, active: this.stats.active, broken: this.stats.broken }; }
    reset() { this.treaties.clear(); this.stats = { total: 0, active: 0, broken: 0 }; }
}
