/**
 * QuorumCalculator.js - 法定人数计算器
 * V985 P-20260614-145 Round 38 Iter 8/30
 */
export const QUORUM_TYPES = ['simple_majority', 'two_thirds', 'three_quarters', 'unanimous', 'absolute_majority'];

export class QuorumCalculator {
    constructor(config = {}) {
        this.config = {
            defaultQuorum: config.defaultQuorum || 0.5,
            ...config,
        };
        this.requirements = new Map();   // proposalId -> { type, ratio, minVotes }
        this.hooks = new Map();
        this.stats = { totalChecks: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    setRequirement(proposalId, type, ratio = null, minVotes = 1) {
        if (!proposalId) return false;
        if (!QUORUM_TYPES.includes(type)) type = 'simple_majority';
        const r = type === 'unanimous' ? 1.0 : (type === 'three_quarters' ? 0.75 : (type === 'two_thirds' ? 0.667 : (type === 'absolute_majority' ? 0.5 + 0.001 : 0.5)));
        this.requirements.set(proposalId, { type, ratio: ratio || r, minVotes });
        return true;
    }
    getRequirement(proposalId) { return this.requirements.get(proposalId) || { type: 'simple_majority', ratio: 0.5, minVotes: 1 }; }
    removeRequirement(proposalId) { return this.requirements.delete(proposalId); }

    requiredVotes(proposalId, totalEligible) {
        const req = this.getRequirement(proposalId);
        return Math.max(req.minVotes, Math.ceil(totalEligible * req.ratio));
    }

    isMet(proposalId, votesCount, totalEligible) {
        this.stats.totalChecks++;
        const req = this.getRequirement(proposalId);
        if (votesCount < req.minVotes) return false;
        return votesCount >= Math.ceil(totalEligible * req.ratio);
    }

    isQuorumType(type) { return QUORUM_TYPES.includes(type); }
    ratioFor(type) {
        const map = { simple_majority: 0.5, absolute_majority: 0.501, two_thirds: 0.667, three_quarters: 0.75, unanimous: 1.0 };
        return map[type] || 0.5;
    }
    report() {
        return { totalChecks: this.stats.totalChecks, tracked: this.requirements.size };
    }
    reset() { this.requirements.clear(); this.stats = { totalChecks: 0 }; }
}
