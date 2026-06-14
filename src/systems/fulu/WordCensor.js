/**
 * WordCensor.js - 咒词审查
 * V1146 Round 43 Iter 19/30
 */
export const CENSOR_STATUS = ['pending', 'reviewing', 'approved', 'rejected', 'flagged'];
export const CENSOR_REASONS = ['profanity', 'taboo', 'destructive', 'restricted', 'unknown'];

export class WordCensor {
    constructor(config = {}) {
        this.config = { ...config };
        this.reviews = new Map();   // rid -> { id, word, status, reason, score, reviewer, ts }
        this.byReviewer = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalApproved: 0, totalRejected: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `wc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    review(word, reviewer, score = 50) {
        if (!word || !reviewer) return null;
        const id = this._newId();
        const r = { id, word, status: 'reviewing', reason: 'unknown', score, reviewer, ts: Date.now() };
        this.reviews.set(id, r);
        if (!this.byReviewer.has(reviewer)) this.byReviewer.set(reviewer, []);
        this.byReviewer.get(reviewer).push(id);
        this.stats.total++;
        return r;
    }
    get(id) { return this.reviews.get(id) || null; }
    listAll() { return [...this.reviews.values()]; }
    listByWord(w) { return this.listAll().filter(r => r.word === w); }
    listByReviewer(rv) {
        const ids = this.byReviewer.get(rv) || [];
        return ids.map(id => this.reviews.get(id)).filter(Boolean);
    }
    listByStatus(st) { return this.listAll().filter(r => r.status === st); }
    listByReason(r) { return this.listAll().filter(rv => rv.reason === r); }
    listApproved() { return this.listByStatus('approved'); }
    listRejected() { return this.listByStatus('rejected'); }

    setStatus(id, status) {
        const r = this.reviews.get(id);
        if (!r) return false;
        if (!CENSOR_STATUS.includes(status)) return false;
        r.status = status;
        if (status === 'approved') this.stats.totalApproved++;
        else if (status === 'rejected') this.stats.totalRejected++;
        if (status !== 'pending' && status !== 'reviewing') this._emit('concluded', r);
        return true;
    }
    approve(id) { return this.setStatus(id, 'approved'); }
    reject(id) { return this.setStatus(id, 'rejected'); }
    flag(id) { return this.setStatus(id, 'flagged'); }
    setReason(id, reason) {
        const r = this.reviews.get(id);
        if (!r) return false;
        if (!CENSOR_REASONS.includes(reason)) return false;
        r.reason = reason;
        return true;
    }
    setScore(id, score) {
        const r = this.reviews.get(id);
        if (!r) return false;
        r.score = Math.max(0, Math.min(100, score));
        return true;
    }
    isApproved(id) { return this.reviews.get(id)?.status === 'approved'; }
    isRejected(id) { return this.reviews.get(id)?.status === 'rejected'; }
    isFlagged(id) { return this.reviews.get(id)?.status === 'flagged'; }
    isReviewing(id) { return this.reviews.get(id)?.status === 'reviewing'; }
    scoreOf(id) { return this.reviews.get(id)?.score || 0; }
    reasonOf(id) { return this.reviews.get(id)?.reason || null; }
    wordCount(w) { return this.listByWord(w).length; }
    reviewerCount(rv) { return this.listByReviewer(rv).length; }
    approvalRate() { return this.stats.total === 0 ? 0 : this.stats.totalApproved / this.stats.total; }
    averageScore() {
        if (this.reviews.size === 0) return 0;
        return this.listAll().reduce((s, r) => s + r.score, 0) / this.reviews.size;
    }
    countByReason() {
        const c = {};
        for (const r of CENSOR_REASONS) c[r] = 0;
        for (const rv of this.reviews.values()) c[rv.reason] = (c[rv.reason] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalApproved: this.stats.totalApproved, totalRejected: this.stats.totalRejected, approvalRate: this.approvalRate() }; }
    reset() { this.reviews.clear(); this.byReviewer.clear(); this.stats = { total: 0, totalApproved: 0, totalRejected: 0 }; }
}
