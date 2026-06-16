/**
 * PolicyLearner.js - 策略学习器
 * V976 P-20260614-029 Iteration 29/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (generic-agent self-evolution + learning):
 * - 从历史数据学习最优策略
 * - 维护 policy candidates
 * - 选择最佳 policy 应用
 */

export const POLICY_TYPES = ['aggressive', 'balanced', 'conservative'];
export const DEFAULT_LEARNING_RATE = 0.1;

export class PolicyLearner {
    constructor(config = {}) {
        this.config = {
            learningRate: config.learningRate || DEFAULT_LEARNING_RATE,
            ...config,
        };
        this.policies = new Map();      // playerId -> Map<policyType, {score, count}>
        this.applied = new Map();       // playerId -> policyType
        this.hooks = new Map();
        this.stats = { totalUpdates: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    _initPlayer(playerId) {
        if (!this.policies.has(playerId)) {
            this.policies.set(playerId, new Map());
            for (const t of POLICY_TYPES) this.policies.get(playerId).set(t, { score: 0, count: 0 });
        }
    }

    recordOutcome(playerId, policyType, reward) {
        if (!POLICY_TYPES.includes(policyType)) return null;
        if (typeof reward !== 'number') return null;
        this._initPlayer(playerId);
        const p = this.policies.get(playerId).get(policyType);
        p.count++;
        p.score = p.score + this.config.learningRate * (reward - p.score);
        this.stats.totalUpdates++;
        this._emit('updated', { playerId, policyType, score: p.score });
        return p;
    }

    bestPolicy(playerId) {
        this._initPlayer(playerId);
        const pmap = this.policies.get(playerId);
        let best = null, bestScore = -Infinity;
        for (const [type, data] of pmap) {
            if (data.count > 0 && data.score > bestScore) {
                bestScore = data.score;
                best = type;
            }
        }
        return best;
    }

    applyPolicy(playerId, policyType) {
        if (!POLICY_TYPES.includes(policyType)) return false;
        this._initPlayer(playerId);
        this.applied.set(playerId, policyType);
        return true;
    }

    autoApply(playerId) {
        this._initPlayer(playerId);
        const best = this.bestPolicy(playerId);
        if (best) this.applied.set(playerId, best);
        return best;
    }

    getAppliedPolicy(playerId) {
        return this.applied.get(playerId) || null;
    }

    getScores(playerId) {
        this._initPlayer(playerId);
        return Object.fromEntries(this.policies.get(playerId));
    }

    shouldExplore(playerId, epsilon = 0.1) {
        return Math.random() < epsilon;
    }

    choosePolicy(playerId, epsilon = 0.1) {
        this._initPlayer(playerId);
        if (this.shouldExplore(playerId, epsilon)) {
            return POLICY_TYPES[Math.floor(Math.random() * POLICY_TYPES.length)];
        }
        return this.bestPolicy(playerId) || 'balanced';
    }

    hasLearned(playerId) {
        const pmap = this.policies.get(playerId);
        if (!pmap) return false;
        return [...pmap.values()].some(p => p.count > 0);
    }

    report(playerId) {
        const scores = this.getScores(playerId);
        return {
            playerId,
            applied: this.getAppliedPolicy(playerId),
            best: this.bestPolicy(playerId),
            scores,
            hasLearned: this.hasLearned(playerId),
        };
    }

    reset() {
        this.policies.clear();
        this.applied.clear();
        this.stats = { totalUpdates: 0 };
    }
}
