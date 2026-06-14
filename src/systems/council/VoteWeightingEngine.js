/**
 * VoteWeightingEngine.js - 投票权重引擎
 * V984 P-20260614-144 Round 38 Iter 7/30
 */
export const WEIGHTING_STRATEGIES = ['flat', 'role', 'reputation', 'hybrid'];

export class VoteWeightingEngine {
    constructor(config = {}) {
        this.config = { strategy: config.strategy || 'flat', ...config };
        this.weights = new Map();   // memberId -> weight
        this.hooks = new Map();
        this.stats = { totalWeighted: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    setWeight(memberId, weight) {
        if (!memberId || typeof weight !== 'number') return false;
        this.weights.set(memberId, weight);
        return true;
    }
    getWeight(memberId) { return this.weights.get(memberId) || 1.0; }

    weightFor(memberId, role, reputation = 0) {
        const strategy = this.config.strategy;
        let w = 1.0;
        if (strategy === 'flat') w = 1.0;
        else if (strategy === 'role') {
            const map = { master: 5.0, elder: 3.0, core_disciple: 2.0, inner_disciple: 1.5, outer_disciple: 1.0 };
            w = map[role] || 1.0;
        }
        else if (strategy === 'reputation') w = 1.0 + (reputation / 100);
        else if (strategy === 'hybrid') {
            const map = { master: 5.0, elder: 3.0, core_disciple: 2.0, inner_disciple: 1.5, outer_disciple: 1.0 };
            w = (map[role] || 1.0) * (1 + reputation / 200);
        }
        this.stats.totalWeighted++;
        return w;
    }

    applyTo(votes) {
        // votes: [{ memberId, option }]
        return votes.map(v => ({ ...v, weight: this.getWeight(v.memberId) }));
    }

    aggregate(votes) {
        const sums = {};
        for (const v of votes) {
            const w = v.weight || this.getWeight(v.memberId);
            sums[v.option] = (sums[v.option] || 0) + w;
        }
        return sums;
    }

    changeStrategy(strategy) {
        if (!WEIGHTING_STRATEGIES.includes(strategy)) return false;
        this.config.strategy = strategy;
        this._emit('strategyChanged', { strategy });
        return true;
    }
    getStrategy() { return this.config.strategy; }
    count() { return this.weights.size; }
    report() { return { strategy: this.config.strategy, members: this.weights.size, totalWeighted: this.stats.totalWeighted }; }
    reset() { this.weights.clear(); this.stats = { totalWeighted: 0 }; }
}
