/**
 * VotingResultAggregator.js - 投票结果聚合器
 * V986 P-20260614-146 Round 38 Iter 9/30
 */
export const RESULT_TYPES = ['passed', 'rejected', 'tied', 'no_quorum', 'pending'];

export class VotingResultAggregator {
    constructor(config = {}) {
        this.config = { ...config };
        this.results = new Map();   // proposalId -> { type, breakdown, computedAt }
        this.hooks = new Map();
        this.stats = { totalComputed: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    compute(proposalId, votes, totalEligible, requiredRatio = 0.5) {
        // votes: [{ option, weight }]
        const totals = {};
        for (const v of votes) totals[v.option] = (totals[v.option] || 0) + (v.weight || 1);
        const totalVotes = Object.values(totals).reduce((s, n) => s + n, 0);
        let result;
        if (totalVotes < totalEligible * requiredRatio) {
            result = totalVotes === 0 ? 'no_quorum' : 'pending';
        } else {
            const yes = totals.yes || 0;
            const no = totals.no || 0;
            if (yes > no) result = 'passed';
            else if (no > yes) result = 'rejected';
            else result = 'tied';
        }
        const r = { type: result, breakdown: totals, totalVotes, totalEligible, requiredRatio, computedAt: Date.now() };
        this.results.set(proposalId, r);
        this.stats.totalComputed++;
        this._emit('computed', { proposalId, ...r });
        return r;
    }

    get(proposalId) { return this.results.get(proposalId) || null; }

    isPassed(proposalId) { return this.results.get(proposalId)?.type === 'passed'; }
    isRejected(proposalId) { return this.results.get(proposalId)?.type === 'rejected'; }
    isTied(proposalId) { return this.results.get(proposalId)?.type === 'tied'; }

    margin(proposalId) {
        const r = this.results.get(proposalId);
        if (!r) return 0;
        return (r.breakdown.yes || 0) - (r.breakdown.no || 0);
    }
    supportRatio(proposalId) {
        const r = this.results.get(proposalId);
        if (!r) return 0;
        const total = (r.breakdown.yes || 0) + (r.breakdown.no || 0);
        if (total === 0) return 0;
        return (r.breakdown.yes || 0) / total;
    }

    listByType(type) { return [...this.results.entries()].filter(([_, r]) => r.type === type).map(([id]) => id); }
    listAll() { return [...this.results.entries()].map(([id, r]) => ({ proposalId: id, ...r })); }
    report() { return { totalComputed: this.stats.totalComputed, byType: QUORUM_AGG(this) }; }
    reset() { this.results.clear(); this.stats = { totalComputed: 0 }; }
}

function QUORUM_AGG(agg) {
    const counts = { passed: 0, rejected: 0, tied: 0, no_quorum: 0, pending: 0 };
    for (const r of agg.results.values()) counts[r.type] = (counts[r.type] || 0) + 1;
    return counts;
}
