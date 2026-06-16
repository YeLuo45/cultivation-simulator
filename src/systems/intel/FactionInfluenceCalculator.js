/**
 * FactionInfluenceCalculator.js - 势力影响计算器
 * V1076 P-20260614-403 Round 41 Iter 9/30
 */
export const INFLUENCE_FACTORS = ['military', 'economic', 'cultural', 'political', 'religious'];
export const DEFAULT_WEIGHTS = { military: 0.25, economic: 0.25, cultural: 0.15, political: 0.25, religious: 0.10 };

export class FactionInfluenceCalculator {
    constructor(config = {}) {
        this.config = { weights: config.weights || DEFAULT_WEIGHTS, ...config };
        this.factions = new Map();   // factionId -> { id, name, scores, total, trend }
        this.history = new Map();
        this.hooks = new Map();
        this.stats = { total: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `fac_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    create(name, scores) {
        if (!name) return null;
        const normalized = {};
        for (const f of INFLUENCE_FACTORS) normalized[f] = (scores && scores[f]) || 0;
        const id = this._newId();
        const f = { id, name, scores: normalized, total: 0, trend: 'stable' };
        f.total = this._computeTotal(normalized);
        this.factions.set(id, f);
        this.stats.total++;
        return f;
    }
    _computeTotal(scores) {
        return Object.entries(scores).reduce((s, [k, v]) => s + (v * (this.config.weights[k] || 0.1)), 0);
    }
    get(id) { return this.factions.get(id) || null; }
    listAll() { return [...this.factions.values()]; }

    updateScore(id, factor, value) {
        const f = this.factions.get(id);
        if (!f) return false;
        if (!INFLUENCE_FACTORS.includes(factor)) return false;
        f.scores[factor] = Math.max(0, Math.min(100, value));
        f.total = this._computeTotal(f.scores);
        return true;
    }
    updateScores(id, scores) {
        const f = this.factions.get(id);
        if (!f) return false;
        for (const [k, v] of Object.entries(scores)) {
            if (INFLUENCE_FACTORS.includes(k)) f.scores[k] = Math.max(0, Math.min(100, v));
        }
        f.total = this._computeTotal(f.scores);
        return true;
    }
    scoreOf(id, factor) { return this.factions.get(id)?.scores[factor] || 0; }
    totalOf(id) { return this.factions.get(id)?.total || 0; }
    dominantFactor(id) {
        const f = this.factions.get(id);
        if (!f) return null;
        return Object.entries(f.scores).reduce((best, [k, v]) => !best || v > best[1] ? [k, v] : best, null)?.[0];
    }
    rank() { return this.listAll().sort((a, b) => b.total - a.total); }
    rankOf(id) {
        const sorted = this.rank();
        const idx = sorted.findIndex(f => f.id === id);
        return idx === -1 ? -1 : idx + 1;
    }
    compare(a, b) {
        return (this.totalOf(a) || 0) - (this.totalOf(b) || 0);
    }
    isStronger(a, b) { return this.compare(a, b) > 0; }
    leading() {
        const sorted = this.rank();
        return sorted[0] || null;
    }
    weakest() {
        const sorted = this.rank();
        return sorted[sorted.length - 1] || null;
    }
    averageTotal() {
        if (this.factions.size === 0) return 0;
        return this.listAll().reduce((s, f) => s + f.total, 0) / this.factions.size;
    }
    report() { return { total: this.stats.total, averageTotal: this.averageTotal() }; }
    reset() { this.factions.clear(); this.history.clear(); this.stats = { total: 0 }; }
}
