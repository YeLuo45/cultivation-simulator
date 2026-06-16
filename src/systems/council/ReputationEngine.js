/**
 * ReputationEngine.js - 声望引擎
 * V994 P-20260614-154 Round 38 Iter 17/30
 */
export const REPUTATION_LEVELS = ['reviled', 'distrusted', 'neutral', 'respected', 'revered', 'legendary'];
export const DEFAULT_DECAY = 0.05;

export class ReputationEngine {
    constructor(config = {}) {
        this.config = { decay: config.decay || DEFAULT_DECAY, ...config };
        this.reputation = new Map();    // memberId -> { score, history }
        this.hooks = new Map();
        this.stats = { changes: 0, decays: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    init(memberId, score = 0) {
        if (!memberId) return false;
        this.reputation.set(memberId, { score: Math.max(0, Math.min(100, score)), history: [{ score, ts: Date.now(), reason: 'init' }] });
        return true;
    }
    get(memberId) { return this.reputation.get(memberId)?.score || 0; }
    getLevel(memberId) {
        const s = this.get(memberId);
        if (s >= 90) return 'legendary';
        if (s >= 75) return 'revered';
        if (s >= 60) return 'respected';
        if (s >= 40) return 'neutral';
        if (s >= 20) return 'distrusted';
        return 'reviled';
    }

    add(memberId, amount, reason = '') {
        if (!memberId || typeof amount !== 'number') return null;
        if (!this.reputation.has(memberId)) this.init(memberId, 0);
        const r = this.reputation.get(memberId);
        const old = r.score;
        r.score = Math.max(0, Math.min(100, r.score + amount));
        r.history.push({ from: old, to: r.score, delta: amount, reason, ts: Date.now() });
        if (r.history.length > 50) r.history.shift();
        this.stats.changes++;
        this._emit('changed', { memberId, ...r, delta: amount });
        return r.score;
    }
    decay(memberId) {
        if (!memberId) return null;
        const r = this.reputation.get(memberId);
        if (!r) return null;
        const old = r.score;
        r.score = Math.max(0, r.score - this.config.decay);
        r.history.push({ from: old, to: r.score, delta: -this.config.decay, reason: 'decay', ts: Date.now() });
        this.stats.decays++;
        this._emit('decayed', { memberId, score: r.score });
        return r.score;
    }
    decayAll() {
        for (const id of this.reputation.keys()) this.decay(id);
    }

    topReputation(n = 5) {
        return [...this.reputation.entries()].sort((a, b) => b[1].score - a[1].score).slice(0, n);
    }
    bottomReputation(n = 5) {
        return [...this.reputation.entries()].sort((a, b) => a[1].score - b[1].score).slice(0, n);
    }
    byLevel(level) {
        return [...this.reputation.entries()].filter(([id]) => this.getLevel(id) === level).map(([id]) => id);
    }
    history(memberId) { return [...(this.reputation.get(memberId)?.history || [])]; }
    report() { return { totalTracked: this.reputation.size, changes: this.stats.changes, decays: this.stats.decays }; }
    reset() { this.reputation.clear(); this.stats = { changes: 0, decays: 0 }; }
}
