/**
 * DecisionLogger.js - 决策记录器
 * V992 P-20260614-152 Round 38 Iter 15/30
 */
export const DECISION_OUTCOMES = ['passed', 'rejected', 'tabled', 'withdrawn', 'expired'];

export class DecisionLogger {
    constructor(config = {}) {
        this.config = { ...config };
        this.log = new Map();     // decisionId -> { id, proposalId, outcome, votes, members, content, ts }
        this.byProposal = new Map();
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `dlog_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    log_(proposalId, outcome, content, votes = {}) {
        if (!proposalId) return null;
        if (!DECISION_OUTCOMES.includes(outcome)) return null;
        const id = this._newId();
        const entry = { id, proposalId, outcome, content, votes, ts: Date.now() };
        this.log.set(id, entry);
        if (!this.byProposal.has(proposalId)) this.byProposal.set(proposalId, []);
        this.byProposal.get(proposalId).push(id);
        this.stats.total++;
        this._emit('logged', entry);
        return entry;
    }
    get(id) { return this.log.get(id) || null; }
    listAll() { return [...this.log.values()]; }
    forProposal(proposalId) {
        const ids = this.byProposal.get(proposalId) || [];
        return ids.map(id => this.log.get(id)).filter(Boolean);
    }
    byOutcome(outcome) { return this.listAll().filter(e => e.outcome === outcome); }

    hasDecision(proposalId) { return (this.byProposal.get(proposalId) || []).length > 0; }
    lastDecision(proposalId) {
        const list = this.forProposal(proposalId);
        return list.length > 0 ? list[list.length - 1] : null;
    }
    isApproved(proposalId) {
        const last = this.lastDecision(proposalId);
        return last ? last.outcome === 'passed' : false;
    }

    exportTo(decisionId) {
        const e = this.log.get(decisionId);
        if (!e) return null;
        return JSON.stringify({ ...e, exportedAt: Date.now() }, null, 2);
    }
    exportAll() { return this.listAll().map(e => ({ ...e })); }

    countByOutcome() {
        const c = {};
        for (const o of DECISION_OUTCOMES) c[o] = 0;
        for (const e of this.log.values()) c[e.outcome] = (c[e.outcome] || 0) + 1;
        return c;
    }
    recent(n = 10) {
        return [...this.listAll()].sort((a, b) => b.ts - a.ts).slice(0, n);
    }
    report() { return { total: this.stats.total, byOutcome: this.countByOutcome() }; }
    reset() { this.log.clear(); this.byProposal.clear(); this.stats = { total: 0 }; }
}
