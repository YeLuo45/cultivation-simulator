/**
 * PoliticalTrendPredictor.js - 政治趋势预测器
 * V1003 P-20260614-163 Round 38 Iter 26/30
 */
export const TREND_DIRECTIONS = ['rising', 'stable', 'declining', 'volatile'];

export class PoliticalTrendPredictor {
    constructor(config = {}) {
        this.config = { windowSize: config.windowSize || 5, ...config };
        this.history = new Map();   // topic -> [{ value, ts }]
        this.hooks = new Map();
        this.stats = { totalObservations: 0, totalPredictions: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    observe(topic, value) {
        if (!topic || typeof value !== 'number') return false;
        if (!this.history.has(topic)) this.history.set(topic, []);
        this.history.get(topic).push({ value, ts: Date.now() });
        if (this.history.get(topic).length > 50) this.history.get(topic).shift();
        this.stats.totalObservations++;
        return true;
    }
    getHistory(topic) { return [...(this.history.get(topic) || [])]; }
    topics() { return [...this.history.keys()]; }

    trend(topic) {
        const h = this.getHistory(topic);
        if (h.length < 2) return 'stable';
        const recent = h.slice(-this.config.windowSize);
        const first = recent[0].value;
        const last = recent[recent.length - 1].value;
        if (last === first) return 'stable';
        const ratio = last / Math.max(0.0001, Math.abs(first));
        const mean = recent.reduce((s, x) => s + x.value, 0) / recent.length;
        const variance = recent.reduce((s, x) => s + Math.pow(x.value - mean, 2), 0) / recent.length;
        if (variance > mean * 1.5) return 'volatile';
        if (ratio > 1.2) return 'rising';
        if (ratio < 0.8) return 'declining';
        return 'stable';
    }
    predict(topic) {
        const t = this.trend(topic);
        const h = this.getHistory(topic);
        if (h.length < 2) return { direction: 'stable', predicted: h.length > 0 ? h[0].value : 0 };
        const recent = h.slice(-this.config.windowSize);
        const last = recent[recent.length - 1].value;
        const slope = (recent[recent.length - 1].value - recent[0].value) / Math.max(1, recent.length - 1);
        this.stats.totalPredictions++;
        const result = {
            direction: t,
            current: last,
            predicted: Math.max(0, last + slope),
            slope,
            confidence: Math.max(0, 1 - recent.reduce((s, x) => s + Math.pow(x.value - last, 2), 0) / recent.length / 100),
        };
        this._emit('predicted', { topic, ...result });
        return result;
    }
    predictAll() {
        const result = {};
        for (const topic of this.topics()) {
            result[topic] = this.predict(topic);
        }
        return result;
    }
    isRising(topic) { return this.trend(topic) === 'rising'; }
    isDeclining(topic) { return this.trend(topic) === 'declining'; }
    isVolatile(topic) { return this.trend(topic) === 'volatile'; }
    isStable(topic) { return this.trend(topic) === 'stable'; }

    report() {
        const tDir = {};
        for (const topic of this.topics()) tDir[topic] = this.trend(topic);
        return { observations: this.stats.totalObservations, predictions: this.stats.totalPredictions, topics: this.history.size, trends: tDir };
    }
    reset() { this.history.clear(); this.stats = { totalObservations: 0, totalPredictions: 0 }; }
}
