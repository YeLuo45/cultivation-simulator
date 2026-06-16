/**
 * BallotBox.js - 投票箱
 * V983 P-20260614-143 Round 38 Iter 6/30
 */
export const VOTE_OPTIONS = ['yes', 'no', 'abstain'];
export const BALLOT_STATUS = ['open', 'closed', 'invalid'];

export class BallotBox {
    constructor(config = {}) {
        this.config = { ...config };
        this.ballots = new Map();    // ballotId -> { id, proposalId, options, ballots: [], status, openedAt, closedAt }
        this.byProposal = new Map(); // proposalId -> ballotId
        this.hooks = new Map();
        this.stats = { totalBallots: 0, totalCast: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `ballot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    open(proposalId, options = null) {
        if (!proposalId) return null;
        const opts = options || VOTE_OPTIONS;
        const id = this._newId();
        const b = { id, proposalId, options: opts, ballots: [], status: 'open', openedAt: Date.now() };
        this.ballots.set(id, b);
        this.byProposal.set(proposalId, id);
        this.stats.totalBallots++;
        this._emit('opened', b);
        return b;
    }
    close(ballotId) {
        const b = this.ballots.get(ballotId);
        if (!b) return false;
        b.status = 'closed';
        b.closedAt = Date.now();
        this._emit('closed', b);
        return true;
    }
    invalidate(ballotId, reason = '') {
        const b = this.ballots.get(ballotId);
        if (!b) return false;
        b.status = 'invalid';
        b.invalidReason = reason;
        this._emit('invalidated', b);
        return true;
    }
    cast(ballotId, memberId, option, weight = 1) {
        const b = this.ballots.get(ballotId);
        if (!b || b.status !== 'open') return null;
        if (!b.options.includes(option)) return null;
        // Replace existing ballot from same member
        b.ballots = b.ballots.filter(x => x.memberId !== memberId);
        const entry = { memberId, option, weight, ts: Date.now() };
        b.ballots.push(entry);
        this.stats.totalCast++;
        this._emit('cast', { ballotId, ...entry });
        return entry;
    }
    hasVoted(ballotId, memberId) {
        const b = this.ballots.get(ballotId);
        if (!b) return false;
        return b.ballots.some(x => x.memberId === memberId);
    }
    getVote(ballotId, memberId) {
        const b = this.ballots.get(ballotId);
        if (!b) return null;
        return b.ballots.find(x => x.memberId === memberId) || null;
    }
    get(ballotId) { return this.ballots.get(ballotId) || null; }
    getByProposal(proposalId) { return this.ballots.get(this.byProposal.get(proposalId)) || null; }

    tally(ballotId) {
        const b = this.ballots.get(ballotId);
        if (!b) return null;
        const counts = {};
        for (const o of b.options) counts[o] = 0;
        for (const v of b.ballots) {
            counts[v.option] = (counts[v.option] || 0) + v.weight;
        }
        return { total: b.ballots.length, weighted: b.ballots.reduce((s, x) => s + x.weight, 0), counts };
    }

    listByStatus(status) { return [...this.ballots.values()].filter(b => b.status === status); }
    report() { return { totalBallots: this.stats.totalBallots, totalCast: this.stats.totalCast, open: this.listByStatus('open').length }; }
    reset() { this.ballots.clear(); this.byProposal.clear(); this.stats = { totalBallots: 0, totalCast: 0 }; }
}
