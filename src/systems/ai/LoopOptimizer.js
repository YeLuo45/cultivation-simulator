/**
 * LoopOptimizer.js - 回路优化器
 * V975 P-20260614-028 Iteration 28/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (generic-agent self-evolution):
 * - 优化 coaching feedback loop 的参数
 * - 维护 policy parameters
 * - 根据 effectiveness 调整权重
 */

export const PARAM_KEYS = ['acceptanceWeight', 'effectivenessWeight', 'cooldownFactor', 'adviceFrequency'];
export const DEFAULT_PARAMS = {
    acceptanceWeight: 1.0,
    effectivenessWeight: 1.0,
    cooldownFactor: 1.0,
    adviceFrequency: 0.5,
};

export class LoopOptimizer {
    constructor(config = {}) {
        this.config = { ...config };
        this.policies = new Map();    // playerId -> { params: {...}, history: [...] }
        this.hooks = new Map();
        this.stats = { totalOptimizations: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    _initPlayer(playerId) {
        if (!this.policies.has(playerId)) {
            this.policies.set(playerId, { params: { ...DEFAULT_PARAMS }, history: [] });
        }
    }

    getParams(playerId) {
        this._initPlayer(playerId);
        return { ...this.policies.get(playerId).params };
    }

    setParam(playerId, key, value) {
        if (!PARAM_KEYS.includes(key)) return false;
        this._initPlayer(playerId);
        this.policies.get(playerId).params[key] = value;
        return true;
    }

    optimize(playerId, effectiveness, acceptanceRate) {
        this._initPlayer(playerId);
        const policy = this.policies.get(playerId);
        const oldParams = { ...policy.params };
        if (effectiveness < 0.3) {
            policy.params.effectivenessWeight = Math.min(2.0, policy.params.effectivenessWeight * 1.1);
            policy.params.adviceFrequency = Math.max(0.1, policy.params.adviceFrequency * 0.9);
        } else if (effectiveness > 0.7) {
            policy.params.adviceFrequency = Math.min(1.0, policy.params.adviceFrequency * 1.1);
        }
        if (acceptanceRate < 0.3) {
            policy.params.acceptanceWeight = Math.max(0.5, policy.params.acceptanceWeight * 0.9);
        } else if (acceptanceRate > 0.7) {
            policy.params.acceptanceWeight = Math.min(1.5, policy.params.acceptanceWeight * 1.1);
        }
        policy.history.push({ ts: Date.now(), oldParams, newParams: { ...policy.params }, effectiveness, acceptanceRate });
        if (policy.history.length > 50) policy.history.shift();
        this.stats.totalOptimizations++;
        this._emit('optimized', { playerId, params: policy.params });
        return { ...policy.params };
    }

    shouldAdvise(playerId) {
        this._initPlayer(playerId);
        const params = this.policies.get(playerId).params;
        return Math.random() < params.adviceFrequency;
    }

    resetParams(playerId) {
        this._initPlayer(playerId);
        this.policies.get(playerId).params = { ...DEFAULT_PARAMS };
    }

    listHistory(playerId) {
        this._initPlayer(playerId);
        return [...this.policies.get(playerId).history];
    }

    avgEffectiveness(playerId) {
        const h = this.listHistory(playerId);
        if (h.length === 0) return 0;
        return h.reduce((s, x) => s + x.effectiveness, 0) / h.length;
    }

    isImproving(playerId) {
        const h = this.listHistory(playerId);
        if (h.length < 2) return false;
        const first = h[0].effectiveness;
        const last = h[h.length - 1].effectiveness;
        return last > first;
    }

    report(playerId) {
        const params = this.getParams(playerId);
        return {
            playerId,
            params,
            totalOptimizations: this.listHistory(playerId).length,
            avgEffectiveness: this.avgEffectiveness(playerId),
            isImproving: this.isImproving(playerId),
        };
    }

    reset() {
        this.policies.clear();
        this.stats = { totalOptimizations: 0 };
    }
}
