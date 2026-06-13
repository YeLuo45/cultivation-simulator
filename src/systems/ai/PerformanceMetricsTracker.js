/**
 * PerformanceMetricsTracker.js - 性能指标追踪器
 * V951 P-20260614-004 Iteration 4/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (thunderbolt feedback loops):
 * - 追踪玩家每类操作的 performance metric (success rate / avg duration / efficiency)
 * - 维护 per-player + per-kind 双索引
 * - 提供横向对比 vs 全局平均
 * - 检测 performance trend (improving/declining/stable)
 */

export const METRIC_KINDS = ['cultivate', 'combat', 'trade', 'social', 'explore', 'craft'];
export const TREND_THRESHOLD = 0.1;  // 10% 变化视为趋势变化

export const DEFAULT_WINDOW_SIZE = 20;
export const DEFAULT_SAMPLE_LIMIT = 200;

export class PerformanceMetricsTracker {
    constructor(config = {}) {
        this.config = {
            windowSize: config.windowSize !== undefined ? config.windowSize : DEFAULT_WINDOW_SIZE,
            sampleLimit: config.sampleLimit !== undefined ? config.sampleLimit : DEFAULT_SAMPLE_LIMIT,
            trendThreshold: config.trendThreshold !== undefined ? config.trendThreshold : TREND_THRESHOLD,
            ...config,
        };
        this.samples = new Map();      // sampleId -> { playerId, kind, success, durationMs, value, ts }
        this.playerSamples = new Map(); // playerId -> Map<kind, sampleId[]>
        this.globalSamples = new Map(); // kind -> sampleId[]
        this.hooks = new Map();
        this.stats = { totalSamples: 0, totalComparisons: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    record(playerId, kind, success, durationMs = 0, value = 0) {
        if (!playerId || !METRIC_KINDS.includes(kind)) return null;
        const id = `smp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const sample = { id, playerId, kind, success: !!success, durationMs, value, ts: Date.now() };
        this.samples.set(id, sample);
        if (!this.playerSamples.has(playerId)) this.playerSamples.set(playerId, new Map());
        const pmap = this.playerSamples.get(playerId);
        if (!pmap.has(kind)) pmap.set(kind, []);
        pmap.get(kind).push(id);
        if (pmap.get(kind).length > this.config.sampleLimit) pmap.get(kind).shift();
        if (!this.globalSamples.has(kind)) this.globalSamples.set(kind, []);
        this.globalSamples.get(kind).push(id);
        this.stats.totalSamples++;
        this._emit('recorded', sample);
        return sample;
    }

    _samplesFor(playerId, kind) {
        const pmap = this.playerSamples.get(playerId);
        if (!pmap) return [];
        const ids = pmap.get(kind) || [];
        return ids.map(id => this.samples.get(id)).filter(Boolean);
    }

    _globalSamplesFor(kind) {
        const ids = this.globalSamples.get(kind) || [];
        return ids.map(id => this.samples.get(id)).filter(Boolean);
    }

    _stats(samples) {
        if (samples.length === 0) return { count: 0, successRate: 0, avgDuration: 0, avgValue: 0 };
        const successCount = samples.filter(s => s.success).length;
        const totalDuration = samples.reduce((s, x) => s + x.durationMs, 0);
        const totalValue = samples.reduce((s, x) => s + x.value, 0);
        return {
            count: samples.length,
            successRate: successCount / samples.length,
            avgDuration: totalDuration / samples.length,
            avgValue: totalValue / samples.length,
        };
    }

    getPlayerMetrics(playerId, kind) {
        const samples = this._samplesFor(playerId, kind);
        return this._stats(samples);
    }

    getGlobalMetrics(kind) {
        const samples = this._globalSamplesFor(kind);
        return this._stats(samples);
    }

    compareToGlobal(playerId, kind) {
        this.stats.totalComparisons++;
        const player = this.getPlayerMetrics(playerId, kind);
        const global = this.getGlobalMetrics(kind);
        if (player.count === 0 || global.count === 0) {
            return { player, global, deltaSuccessRate: 0, deltaAvgValue: 0, relativePerformance: 1 };
        }
        const deltaSuccessRate = player.successRate - global.successRate;
        const deltaAvgValue = player.avgValue - global.avgValue;
        const relativePerformance = global.avgValue > 0 ? player.avgValue / global.avgValue : 1;
        return { player, global, deltaSuccessRate, deltaAvgValue, relativePerformance };
    }

    getTrend(playerId, kind) {
        const samples = this._samplesFor(playerId, kind);
        if (samples.length < 4) return 'insufficient';
        const w = this.config.windowSize;
        const half = Math.floor(samples.length / 2);
        const early = samples.slice(0, half);
        const recent = samples.slice(-w);
        const earlyStats = this._stats(early);
        const recentStats = this._stats(recent);
        if (earlyStats.avgValue === 0) return 'stable';
        const change = (recentStats.avgValue - earlyStats.avgValue) / Math.max(1, earlyStats.avgValue);
        if (change > this.config.trendThreshold) return 'improving';
        if (change < -this.config.trendThreshold) return 'declining';
        return 'stable';
    }

    getSample(sampleId) { return this.samples.get(sampleId) || null; }

    report(playerId) {
        const byKind = {};
        const trends = {};
        for (const k of METRIC_KINDS) {
            byKind[k] = this.getPlayerMetrics(playerId, k);
            trends[k] = this.getTrend(playerId, k);
        }
        return { playerId, byKind, trends };
    }

    reset() {
        this.samples.clear();
        this.playerSamples.clear();
        this.globalSamples.clear();
        this.stats = { totalSamples: 0, totalComparisons: 0 };
    }
}
