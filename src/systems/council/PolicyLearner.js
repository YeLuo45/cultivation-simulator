/**
 * PolicyLearner.js - 政策学习器
 * V1004 P-20260614-164 Round 38 Iter 27/30
 */
export const DEFAULT_LEARNING_RATE = 0.1;
export const POLICY_OUTCOMES = ['success', 'failure', 'partial'];

export class PolicyLearner {
    constructor(config = {}) {
        this.config = { learningRate: config.learningRate || DEFAULT_LEARNING_RATE, ...config };
        this.policies = new Map();   // policyName -> { score, count, history }
        this.applied = new Map();    // context -> policyName
        this.hooks = new Map();
        this.stats = { totalUpdates: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    register(name) {
        if (!name) return false;
        this.policies.set(name, { score: 0, count: 0, history: [] });
        return true;
    }
    listAll() { return [...this.policies.entries()].map(([name, data]) => ({ name, ...data })); }

    record(name, outcome, reward = null) {
        if (!this.policies.has(name)) this.register(name);
        const p = this.policies.get(name);
        const r = reward !== null ? reward : (outcome === 'success' ? 1 : (outcome === 'failure' ? -1 : 0));
        p.count++;
        p.score = p.score + this.config.learningRate * (r - p.score);
        p.history.push({ outcome, reward: r, ts: Date.now() });
        if (p.history.length > 50) p.history.shift();
        this.stats.totalUpdates++;
        this._emit('updated', { name, score: p.score });
        return p;
    }

    best() {
        let bestName = null, bestScore = -Infinity;
        for (const [name, p] of this.policies) {
            if (p.count > 0 && p.score > bestScore) {
                bestScore = p.score;
                bestName = name;
            }
        }
        return bestName;
    }
    apply(context, name) {
        if (!this.policies.has(name)) return false;
        this.applied.set(context, name);
        return true;
    }
    autoApply(context) {
        const b = this.best();
        if (b) {
            this.applied.set(context, b);
            return b;
        }
        return null;
    }
    currentPolicy(context) { return this.applied.get(context) || null; }

    shouldExplore(epsilon = 0.1) { return Math.random() < epsilon; }
    choosePolicy(context, epsilon = 0.1) {
        if (this.shouldExplore(epsilon)) {
            const names = [...this.policies.keys()];
            return names[Math.floor(Math.random() * names.length)] || null;
        }
        return this.best() || this.autoApply(context);
    }

    score(name) { return this.policies.get(name)?.score || 0; }
    count(name) { return this.policies.get(name)?.count || 0; }
    hasLearned() {
        for (const p of this.policies.values()) if (p.count > 0) return true;
        return false;
    }
    isLearning(name) { return this.count(name) > 0; }

    history(name) { return [...(this.policies.get(name)?.history || [])]; }
    report() { return { total: this.policies.size, updates: this.stats.totalUpdates, best: this.best() }; }
    reset() { this.policies.clear(); this.applied.clear(); this.stats = { totalUpdates: 0 }; }
}
