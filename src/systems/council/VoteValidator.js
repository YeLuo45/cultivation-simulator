/**
 * VoteValidator.js - 投票验证器
 * V987 P-20260614-147 Round 38 Iter 10/30
 */
export const VALIDATION_RULES = {
    no_double_vote: true,
    must_be_eligible: true,
    must_be_open: true,
    weight_bounds: { min: 0, max: 100 },
};

export class VoteValidator {
    constructor(config = {}) {
        this.config = { ...VALIDATION_RULES, ...config };
        this.eligible = new Set();    // eligible memberIds
        this.cast = new Map();        // proposalId -> Set<memberId>
        this.hooks = new Map();
        this.stats = { totalChecks: 0, rejected: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    addEligible(memberId) { this.eligible.add(memberId); return true; }
    removeEligible(memberId) { return this.eligible.delete(memberId); }
    isEligible(memberId) { return this.eligible.has(memberId); }
    eligibleCount() { return this.eligible.size; }
    listEligible() { return [...this.eligible]; }

    _alreadyCast(proposalId, memberId) {
        if (!this.cast.has(proposalId)) this.cast.set(proposalId, new Set());
        return this.cast.get(proposalId).has(memberId);
    }
    _markCast(proposalId, memberId) {
        if (!this.cast.has(proposalId)) this.cast.set(proposalId, new Set());
        this.cast.get(proposalId).add(memberId);
    }

    validate(proposalId, memberId, ballot, weight = 1) {
        this.stats.totalChecks++;
        const errors = [];
        if (this.config.must_be_open && ballot.status !== 'open') errors.push('ballot_not_open');
        if (this.config.must_be_eligible && !this.isEligible(memberId)) errors.push('not_eligible');
        if (this.config.no_double_vote && this._alreadyCast(proposalId, memberId)) errors.push('already_voted');
        if (typeof weight !== 'number' || weight < this.config.weight_bounds.min || weight > this.config.weight_bounds.max) {
            errors.push('weight_out_of_bounds');
        }
        if (errors.length > 0) {
            this.stats.rejected++;
            this._emit('rejected', { proposalId, memberId, errors });
            return { valid: false, errors };
        }
        this._markCast(proposalId, memberId);
        this._emit('validated', { proposalId, memberId });
        return { valid: true, errors: [] };
    }

    resetBallot(proposalId) {
        this.cast.delete(proposalId);
    }
    report() {
        return { totalChecks: this.stats.totalChecks, rejected: this.stats.rejected, eligible: this.eligible.size };
    }
    reset() { this.eligible.clear(); this.cast.clear(); this.stats = { totalChecks: 0, rejected: 0 }; }
}
