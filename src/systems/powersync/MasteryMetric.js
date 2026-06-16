/**
 * MasteryMetric.js - 掌握度指标
 * V1187 Round 45 Iter 31/30 Direction A PowerSync Federation (chatdev)
 * 灵感: orchestrator mastery metric - 加权得分 + 等级评定 + 综合报告
 */

export const TIERS = ['common', 'rare', 'epic', 'legendary'];
export const TIER_COLORS = {
    common: '#9ca3af',     // gray
    rare: '#3b82f6',       // blue
    epic: '#a855f7',       // purple
    legendary: '#f59e0b',  // amber/gold
};
export const GRADE_THRESHOLDS = {
    common: 0,
    rare: 0.4,
    epic: 0.6,
    legendary: 0.8,
};
export const MAX_REPORTS = 50;

export class MasteryMetric {
    constructor(config = {}) {
        const { weights = {}, ...rest } = config;
        this.config = {
            ...rest,
            weights: { density: 0.4, coherence: 0.3, resonance: 0.3, ...weights },
        };
        this.reports = [];
        this.hooks = new Map();
        this.stats = { calculated: 0, reports: 0 };
    }

    _emit(ev, p) {
        const listeners = this.hooks.get(ev) || [];
        for (const fn of listeners) { try { fn(p); } catch (_) { /* ignore */ } }
    }
    registerHook(ev, fn) {
        if (!this.hooks.has(ev)) this.hooks.set(ev, []);
        this.hooks.get(ev).push(fn);
    }

    // ---- score calculation ----
    calculate(metrics) {
        if (!metrics || typeof metrics !== 'object') return 0;
        const { density = 0, coherence = 0, resonance = 0 } = metrics;
        const w = this.config.weights;
        // each metric may be 0-1
        const d = this.normalize(density);
        const c = this.normalize(coherence);
        const r = this.normalize(resonance);
        const raw = w.density * d + w.coherence * c + w.resonance * r;
        const score = this.normalize(raw);
        this.stats.calculated++;
        this._emit('calculated', { score, metrics });
        return score;
    }

    setWeights(newWeights) {
        if (!newWeights || typeof newWeights !== 'object') return false;
        const merged = { ...this.config.weights, ...newWeights };
        // validate
        for (const k of ['density', 'coherence', 'resonance']) {
            if (typeof merged[k] !== 'number' || !isFinite(merged[k]) || merged[k] < 0) {
                return false;
            }
        }
        // auto-normalize if not summing to 1
        const sum = merged.density + merged.coherence + merged.resonance;
        if (sum > 0 && Math.abs(sum - 1) > 0.001) {
            const factor = 1 / sum;
            merged.density *= factor;
            merged.coherence *= factor;
            merged.resonance *= factor;
        }
        this.config.weights = merged;
        return true;
    }

    getWeights() {
        return { ...this.config.weights };
    }

    // ---- normalization / grading ----
    normalize(score) {
        if (typeof score !== 'number' || isNaN(score) || !isFinite(score)) return 0;
        if (score < 0) return 0;
        if (score > 1) return 1;
        return score;
    }

    grade(score) {
        const s = this.normalize(score);
        if (s >= GRADE_THRESHOLDS.legendary) return 'legendary';
        if (s >= GRADE_THRESHOLDS.epic)      return 'epic';
        if (s >= GRADE_THRESHOLDS.rare)      return 'rare';
        return 'common';
    }

    getTier(score) {
        const tier = this.grade(score);
        return { tier, color: TIER_COLORS[tier] };
    }

    getAllTiers() {
        return TIERS.map((t) => ({ tier: t, color: TIER_COLORS[t] }));
    }

    // ---- recommendations ----
    _recommendations(metrics, score) {
        const recs = [];
        if (!metrics) return recs;
        const { density = 0, coherence = 0, resonance = 0 } = metrics;
        if (density < 0.5)   recs.push({ kind: 'expand_modules',    target: 'density',   priority: 'high' });
        if (coherence < 0.5) recs.push({ kind: 'improve_integration', target: 'coherence', priority: 'high' });
        if (resonance < 0.5) recs.push({ kind: 'boost_effectiveness', target: 'resonance', priority: 'medium' });
        if (score >= 0.8)    recs.push({ kind: 'maintain_excellence', target: 'overall',   priority: 'low' });
        if (score < 0.3)     recs.push({ kind: 'overhaul_needed',     target: 'overall',   priority: 'critical' });
        // weighted weakest dimension
        const w = this.config.weights;
        const dims = [
            { name: 'density',   val: density   * w.density },
            { name: 'coherence', val: coherence * w.coherence },
            { name: 'resonance', val: resonance * w.resonance },
        ];
        dims.sort((a, b) => a.val - b.val);
        recs.push({ kind: 'weakest_dimension', target: dims[0].name, priority: 'info', value: dims[0].val });
        return recs;
    }

    // ---- composite report ----
    getMasteryReport(metrics) {
        const score = this.calculate(metrics);
        const tier = this.getTier(score);
        const grade = tier.tier;
        const recommendations = this._recommendations(metrics, score);
        const report = {
            score,
            grade,
            tier,
            recommendations,
            weights: this.getWeights(),
            ts: Date.now(),
        };
        this.reports.push(report);
        if (this.reports.length > MAX_REPORTS) this.reports.shift();
        this.stats.reports++;
        this._emit('reported', report);
        return report;
    }

    listReports() { return this.reports.slice(); }

    getStats() {
        return {
            ...this.stats,
            weights: this.getWeights(),
            reports: this.reports.length,
        };
    }

    reset() {
        this.reports = [];
        this.stats = { calculated: 0, reports: 0 };
    }
}

if (typeof globalThis !== 'undefined') {
    globalThis.MasteryMetric = MasteryMetric;
    globalThis.TIERS = TIERS;
    globalThis.TIER_COLORS = TIER_COLORS;
    globalThis.GRADE_THRESHOLDS = GRADE_THRESHOLDS;
}
