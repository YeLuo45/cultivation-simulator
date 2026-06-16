/**
 * VotingPowerCalculator.js - 投票权计算器
 * V980 P-20260614-140 Round 38 Iter 3/30
 */
export const POWER_FACTORS = {
    master: 5.0,
    elder: 3.0,
    core_disciple: 2.0,
    inner_disciple: 1.5,
    outer_disciple: 1.0,
};
export const REPUTATION_WEIGHT = 0.3;
export const CONTRIBUTION_WEIGHT = 0.2;
export const SENIORITY_WEIGHT = 0.1;

export class VotingPowerCalculator {
    constructor(config = {}) {
        this.config = {
            reputationWeight: config.reputationWeight !== undefined ? config.reputationWeight : REPUTATION_WEIGHT,
            contributionWeight: config.contributionWeight !== undefined ? config.contributionWeight : CONTRIBUTION_WEIGHT,
            seniorityWeight: config.seniorityWeight !== undefined ? config.seniorityWeight : SENIORITY_WEIGHT,
            ...config,
        };
        this.reputation = new Map();    // memberId -> reputation 0-100
        this.contributions = new Map(); // memberId -> contribution score
        this.seniority = new Map();     // memberId -> days since joined
        this.hooks = new Map();
        this.stats = { totalCalcs: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    setReputation(memberId, value) {
        if (!memberId) return false;
        const v = Math.max(0, Math.min(100, value));
        this.reputation.set(memberId, v);
        return true;
    }
    getReputation(memberId) { return this.reputation.get(memberId) || 0; }

    addContribution(memberId, amount) {
        if (!memberId || typeof amount !== 'number') return null;
        const c = this.contributions.get(memberId) || 0;
        this.contributions.set(memberId, c + amount);
        return this.contributions.get(memberId);
    }
    getContribution(memberId) { return this.contributions.get(memberId) || 0; }

    setSeniority(memberId, days) {
        if (!memberId || typeof days !== 'number') return false;
        this.seniority.set(memberId, days);
        return true;
    }
    getSeniority(memberId) { return this.seniority.get(memberId) || 0; }

    calculate(memberId, role) {
        if (!memberId || !role) return 0;
        const base = POWER_FACTORS[role] || 1.0;
        const rep = this.getReputation(memberId) / 100;
        const con = Math.min(1.0, this.getContribution(memberId) / 1000);
        const sen = Math.min(1.0, this.getSeniority(memberId) / 365);
        const bonus = rep * this.config.reputationWeight + con * this.config.contributionWeight + sen * this.config.seniorityWeight;
        this.stats.totalCalcs++;
        return base * (1 + bonus);
    }

    calculateAll(roles) {
        const result = new Map();
        for (const memberId of Object.keys(roles)) {
            result.set(memberId, this.calculate(memberId, roles[memberId]));
        }
        return result;
    }

    totalPower(roles) {
        let sum = 0;
        for (const memberId of Object.keys(roles)) {
            sum += this.calculate(memberId, roles[memberId]);
        }
        return sum;
    }

    topVoters(roles, n = 5) {
        const all = this.calculateAll(roles);
        return [...all.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
    }

    report() {
        return {
            totalCalcs: this.stats.totalCalcs,
            reputationTracked: this.reputation.size,
            contributionTracked: this.contributions.size,
            seniorityTracked: this.seniority.size,
        };
    }
    reset() {
        this.reputation.clear();
        this.contributions.clear();
        this.seniority.clear();
        this.stats = { totalCalcs: 0 };
    }
}
