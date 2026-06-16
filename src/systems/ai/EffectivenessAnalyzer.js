/**
 * EffectivenessAnalyzer.js - 效果分析器
 * V974 P-20260614-027 Iteration 27/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (generic-agent L0-L4 + analytics):
 * - 评估建议/干预的实际效果
 * - 计算 effectiveness score
 * - 区分 short-term vs long-term
 */

export const EFFECTIVENESS_LEVELS = ['none', 'minimal', 'moderate', 'high', 'excellent'];
export const DEFAULT_WINDOW = 7;

export class EffectivenessAnalyzer {
    constructor(config = {}) {
        this.config = { window: config.window || DEFAULT_WINDOW, ...config };
        this.measurements = new Map();  // playerId -> [{intervention, baseline, post, score, ts}]
        this.hooks = new Map();
        this.stats = { totalAnalyzed: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    measure(playerId, intervention, baseline, post) {
        if (typeof baseline !== 'number' || typeof post !== 'number') return null;
        const score = this._computeScore(baseline, post);
        const level = this._scoreToLevel(score);
        const entry = { intervention, baseline, post, score, level, ts: Date.now() };
        if (!this.measurements.has(playerId)) this.measurements.set(playerId, []);
        this.measurements.get(playerId).push(entry);
        if (this.measurements.get(playerId).length > 100) this.measurements.get(playerId).shift();
        this.stats.totalAnalyzed++;
        this._emit('measured', { playerId, entry });
        return entry;
    }

    _computeScore(baseline, post) {
        if (baseline === 0) return post > 0 ? 1.0 : 0;
        return Math.max(0, (post - baseline) / Math.abs(baseline));
    }

    _scoreToLevel(score) {
        if (score >= 0.8) return 'excellent';
        if (score >= 0.5) return 'high';
        if (score >= 0.2) return 'moderate';
        if (score > 0) return 'minimal';
        return 'none';
    }

    listMeasurements(playerId) {
        return [...(this.measurements.get(playerId) || [])];
    }

    averageEffectiveness(playerId) {
        const list = this.listMeasurements(playerId);
        if (list.length === 0) return 0;
        return list.reduce((s, m) => s + m.score, 0) / list.length;
    }

    effectivenessByIntervention(playerId) {
        const list = this.listMeasurements(playerId);
        const grouped = {};
        for (const m of list) {
            if (!grouped[m.intervention]) grouped[m.intervention] = [];
            grouped[m.intervention].push(m.score);
        }
        const result = {};
        for (const [k, scores] of Object.entries(grouped)) {
            result[k] = scores.reduce((s, x) => s + x, 0) / scores.length;
        }
        return result;
    }

    recentTrend(playerId) {
        const list = this.listMeasurements(playerId);
        if (list.length < 2) return 'insufficient';
        const recent = list.slice(-this.config.window);
        const scores = recent.map(m => m.score);
        const first = scores[0];
        const last = scores[scores.length - 1];
        if (last > first * 1.1) return 'improving';
        if (last < first * 0.9) return 'declining';
        return 'stable';
    }

    bestIntervention(playerId) {
        const grouped = this.effectivenessByIntervention(playerId);
        let best = null, bestScore = -1;
        for (const [k, s] of Object.entries(grouped)) {
            if (s > bestScore) { bestScore = s; best = k; }
        }
        return best;
    }

    isEffective(score, threshold = 0.3) {
        return score >= threshold;
    }

    report(playerId) {
        const list = this.listMeasurements(playerId);
        return {
            playerId,
            totalMeasurements: list.length,
            avgEffectiveness: this.averageEffectiveness(playerId),
            trend: this.recentTrend(playerId),
            bestIntervention: this.bestIntervention(playerId),
        };
    }

    reset() {
        this.measurements.clear();
        this.stats = { totalAnalyzed: 0 };
    }
}
