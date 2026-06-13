/**
 * CultivationL2GlobalTrends.js - 修真 L2 全局趋势系统
 * V898 P-20260613-072 Iteration 11/30 Round 35
 *
 * 灵感来源: generic-agent L0-L4 五层记忆框架 (L2 全局层)
 * 修真趋势系统: 跟踪玩家属性 (根骨/悟性/机缘) 的全局变化趋势
 * - 核心 API: trackTrend / queryTrend / analyzeTrend
 * - 数据结构: { id, playerId, attribute, value, trend, recordedAt, samples }
 * - 配置: ATTRIBUTES, TREND_THRESHOLDS, SAMPLES_MAX, TREND_RANGE_TYPES
 */

export const ATTRIBUTES = ['root_bone', 'aptitude', 'fortune'];
export const ATTRIBUTE_COUNT = 3;

export const ATTRIBUTE_META = {
    root_bone: { name: '根骨', weight: 0.4, baseValue: 0.5 },
    aptitude: { name: '悟性', weight: 0.35, baseValue: 0.5 },
    fortune: { name: '机缘', weight: 0.25, baseValue: 0.5 },
};

export const TREND_THRESHOLDS = {
    rising: 0.1,
    falling: -0.1,
};

export const TRENDS = ['rising', 'falling', 'stable'];

export const SAMPLES_MAX = 50;
export const DEFAULT_SAMPLES_MAX = 50;
export const MIN_SAMPLES_FOR_ANALYSIS = 2;

export const TREND_RANGE_TYPES = ['hour', 'day', 'week', 'month'];
export const TREND_RANGE_COUNT = 4;

export const TREND_RANGE_MS = {
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
};

export const INVALID_PLAYER_ID = 'INVALID_PLAYER_ID';
export const INVALID_ATTRIBUTE = 'INVALID_ATTRIBUTE';
export const INVALID_RANGE_TYPE = 'INVALID_RANGE_TYPE';
export const INVALID_VALUE = 'INVALID_VALUE';
export const TREND_NOT_FOUND = 'TREND_NOT_FOUND';
export const UNKNOWN_TOOL = 'UNKNOWN_TOOL';
export const INVALID_TOOL_NAME = 'INVALID_TOOL_NAME';
export const INVALID_HANDLER = 'INVALID_HANDLER';
export const INVALID_EVENT_NAME = 'INVALID_EVENT_NAME';
export const EVENT_NOT_FOUND = 'EVENT_NOT_FOUND';
export const HANDLER_NOT_FOUND = 'HANDLER_NOT_FOUND';
export const INVALID_DATA = 'INVALID_DATA';
export const TOOL_EXECUTION_ERROR = 'TOOL_EXECUTION_ERROR';

export class CultivationL2GlobalTrends {
    constructor(config = {}) {
        this.config = {
            samplesMax: config.samplesMax !== undefined ? config.samplesMax : DEFAULT_SAMPLES_MAX,
            risingThreshold: config.risingThreshold !== undefined ? config.risingThreshold : TREND_THRESHOLDS.rising,
            fallingThreshold: config.fallingThreshold !== undefined ? config.fallingThreshold : TREND_THRESHOLDS.falling,
            autoAnalyze: config.autoAnalyze !== undefined ? config.autoAnalyze : true,
            minSamplesForAnalysis: config.minSamplesForAnalysis !== undefined ? config.minSamplesForAnalysis : MIN_SAMPLES_FOR_ANALYSIS,
            ...config,
        };
        this.trends = new Map();
        this.playerTrends = new Map();
        this.attributeTrends = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = {
            totalTracked: 0,
            totalQueried: 0,
            totalAnalyzed: 0,
            byAttribute: { root_bone: 0, aptitude: 0, fortune: 0 },
            byTrend: { rising: 0, falling: 0, stable: 0 },
        };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTrend', (ctx) => this.getTrend(ctx.trendId));
        this.registerTool('queryTrend', (ctx) => this.queryTrend(ctx.playerId, ctx.attribute, ctx.range));
        this.registerTool('analyzeTrend', (ctx) => this.analyzeTrend(ctx.playerId, ctx.attribute));
        this.registerTool('listByAttribute', (ctx) => this.listByAttribute(ctx.attribute));
        this.registerTool('listByPlayer', (ctx) => this.listByPlayer(ctx.playerId));
        this.registerTool('listByTrend', (ctx) => this.listByTrend(ctx.trend));
    }

    _genId() {
        return `trend_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    _isValidAttribute(attr) {
        return typeof attr === 'string' && ATTRIBUTES.includes(attr);
    }

    _isValidRange(range) {
        return typeof range === 'string' && TREND_RANGE_TYPES.includes(range);
    }

    _isValidTrend(trend) {
        return typeof trend === 'string' && TRENDS.includes(trend);
    }

    _clampValue(v) {
        if (typeof v !== 'number' || Number.isNaN(v)) return 0;
        return Math.max(0, Math.min(1, v));
    }

    _classifyTrend(samples) {
        if (!Array.isArray(samples) || samples.length < 2) return 'stable';
        const first = samples[0].value;
        const last = samples[samples.length - 1].value;
        const delta = last - first;
        if (delta > this.config.risingThreshold) return 'rising';
        if (delta < this.config.fallingThreshold) return 'falling';
        return 'stable';
    }

    _calculateSlope(samples) {
        if (!Array.isArray(samples) || samples.length < 2) return 0;
        const first = samples[0].value;
        const last = samples[samples.length - 1].value;
        return last - first;
    }

    _calculateAverage(samples) {
        if (!Array.isArray(samples) || samples.length === 0) return 0;
        const sum = samples.reduce((acc, s) => acc + (typeof s.value === 'number' ? s.value : 0), 0);
        return sum / samples.length;
    }

    _calculateVolatility(samples) {
        if (!Array.isArray(samples) || samples.length < 2) return 0;
        const avg = this._calculateAverage(samples);
        const squaredDiffs = samples.map(s => Math.pow((s.value - avg), 2));
        const variance = squaredDiffs.reduce((acc, v) => acc + v, 0) / samples.length;
        return Math.sqrt(variance);
    }

    _rangeCutoff(range) {
        return Date.now() - TREND_RANGE_MS[range];
    }

    _filterByRange(trend, range) {
        const cutoff = this._rangeCutoff(range);
        return trend.samples.filter(s => s.recordedAt >= cutoff);
    }

    trackTrend(playerId, attribute, value, options = {}) {
        if (typeof playerId !== 'string' || playerId.length === 0) {
            return { success: false, error: INVALID_PLAYER_ID };
        }
        if (!this._isValidAttribute(attribute)) {
            return { success: false, error: INVALID_ATTRIBUTE };
        }
        if (typeof value !== 'number' || Number.isNaN(value)) {
            return { success: false, error: INVALID_VALUE };
        }
        const id = options.id !== undefined ? options.id : this._genId();
        const recordedAt = options.recordedAt !== undefined ? options.recordedAt : Date.now();
        const clampedValue = this._clampValue(value);

        let trend = null;
        let key = `${playerId}:${attribute}`;
        if (this.trends.has(key)) {
            trend = this.trends.get(key);
        } else {
            trend = {
                id,
                playerId,
                attribute,
                value: clampedValue,
                trend: 'stable',
                recordedAt,
                samples: [],
            };
            this.trends.set(key, trend);
            if (!this.playerTrends.has(playerId)) this.playerTrends.set(playerId, []);
            this.playerTrends.get(playerId).push(key);
            if (!this.attributeTrends.has(attribute)) this.attributeTrends.set(attribute, []);
            this.attributeTrends.get(attribute).push(key);
        }

        const sample = {
            value: clampedValue,
            recordedAt,
            source: options.source !== undefined ? options.source : 'manual',
        };
        trend.samples.push(sample);
        if (trend.samples.length > this.config.samplesMax) {
            trend.samples.shift();
        }
        trend.value = clampedValue;
        trend.recordedAt = recordedAt;

        if (this.config.autoAnalyze && trend.samples.length >= this.config.minSamplesForAnalysis) {
            const prevTrend = trend.trend;
            trend.trend = this._classifyTrend(trend.samples);
            if (prevTrend !== trend.trend) {
                this.stats.byTrend[prevTrend] = this.stats.byTrend[prevTrend] - 1;
                this.stats.byTrend[trend.trend] = this.stats.byTrend[trend.trend] + 1;
            }
        } else {
            trend.trend = 'stable';
        }

        this.stats.totalTracked += 1;
        this.stats.byAttribute[attribute] = this.stats.byAttribute[attribute] + 1;

        this._triggerHook('onTracked', { trendId: trend.id, sample, playerId, attribute });
        return { success: true, trend: this.getTrend(trend.id) };
    }

    queryTrend(playerId, attribute, range = 'day') {
        if (typeof playerId !== 'string' || playerId.length === 0) {
            return { success: false, error: INVALID_PLAYER_ID };
        }
        if (!this._isValidAttribute(attribute)) {
            return { success: false, error: INVALID_ATTRIBUTE };
        }
        if (!this._isValidRange(range)) {
            return { success: false, error: INVALID_RANGE_TYPE };
        }
        const key = `${playerId}:${attribute}`;
        if (!this.trends.has(key)) {
            return {
                success: true,
                playerId,
                attribute,
                range,
                samples: [],
                count: 0,
                trend: 'stable',
            };
        }
        const trend = this.trends.get(key);
        const filtered = this._filterByRange(trend, range);
        this.stats.totalQueried += 1;
        return {
            success: true,
            playerId,
            attribute,
            range,
            samples: filtered.map(s => ({ ...s })),
            count: filtered.length,
            trend: trend.trend,
        };
    }

    analyzeTrend(playerId, attribute = null) {
        if (typeof playerId !== 'string' || playerId.length === 0) {
            return { success: false, error: INVALID_PLAYER_ID };
        }
        if (attribute !== null && !this._isValidAttribute(attribute)) {
            return { success: false, error: INVALID_ATTRIBUTE };
        }
        const targetAttrs = attribute !== null ? [attribute] : ATTRIBUTES;
        const result = {
            playerId,
            attributes: {},
            overall: 'stable',
            totalSamples: 0,
        };
        const trends = [];
        for (const attr of targetAttrs) {
            const key = `${playerId}:${attr}`;
            if (!this.trends.has(key)) {
                result.attributes[attr] = {
                    present: false,
                    trend: 'stable',
                    slope: 0,
                    average: 0,
                    volatility: 0,
                    sampleCount: 0,
                };
                continue;
            }
            const trend = this.trends.get(key);
            const slope = this._calculateSlope(trend.samples);
            const average = this._calculateAverage(trend.samples);
            const volatility = this._calculateVolatility(trend.samples);
            const cls = this._classifyTrend(trend.samples);
            trend.trend = cls;
            result.attributes[attr] = {
                present: true,
                trend: cls,
                slope,
                average,
                volatility,
                sampleCount: trend.samples.length,
            };
            result.totalSamples += trend.samples.length;
            trends.push(cls);
        }
        if (trends.length > 0) {
            const risingCount = trends.filter(t => t === 'rising').length;
            const fallingCount = trends.filter(t => t === 'falling').length;
            if (risingCount > fallingCount && risingCount > 0) {
                result.overall = 'rising';
            } else if (fallingCount > risingCount && fallingCount > 0) {
                result.overall = 'falling';
            } else {
                result.overall = 'stable';
            }
        }
        this.stats.totalAnalyzed += 1;
        this._triggerHook('onAnalyzed', { playerId, overall: result.overall });
        return { success: true, analysis: result };
    }

    getTrend(trendId) {
        if (typeof trendId !== 'string' || trendId.length === 0) return null;
        for (const trend of this.trends.values()) {
            if (trend.id === trendId) {
                return {
                    ...trend,
                    samples: trend.samples.map(s => ({ ...s })),
                };
            }
        }
        return null;
    }

    getTrendKey(playerId, attribute) {
        if (typeof playerId !== 'string' || playerId.length === 0) return null;
        if (!this._isValidAttribute(attribute)) return null;
        const key = `${playerId}:${attribute}`;
        if (!this.trends.has(key)) return null;
        return this.trends.get(key);
    }

    listByAttribute(attribute) {
        if (!this._isValidAttribute(attribute)) return [];
        if (!this.attributeTrends.has(attribute)) return [];
        const ids = this.attributeTrends.get(attribute);
        return ids.map(k => this.trends.get(k)).filter(t => t !== undefined).map(t => ({
            ...t,
            samples: t.samples.map(s => ({ ...s })),
        }));
    }

    listByTrend(trend) {
        if (!this._isValidTrend(trend)) return [];
        return Array.from(this.trends.values())
            .filter(t => t.trend === trend)
            .map(t => ({ ...t, samples: t.samples.map(s => ({ ...s })) }));
    }

    listByPlayer(playerId) {
        if (typeof playerId !== 'string' || playerId.length === 0) return [];
        if (!this.playerTrends.has(playerId)) return [];
        const keys = this.playerTrends.get(playerId);
        return keys.map(k => this.trends.get(k)).filter(t => t !== undefined).map(t => ({
            ...t,
            samples: t.samples.map(s => ({ ...s })),
        }));
    }

    listAll() {
        return Array.from(this.trends.values()).map(t => ({
            ...t,
            samples: t.samples.map(s => ({ ...s })),
        }));
    }

    listAttributes() {
        return ATTRIBUTES.slice();
    }

    listRangeTypes() {
        return TREND_RANGE_TYPES.slice();
    }

    deleteTrend(playerId, attribute) {
        if (typeof playerId !== 'string' || playerId.length === 0) {
            return { success: false, error: INVALID_PLAYER_ID };
        }
        if (!this._isValidAttribute(attribute)) {
            return { success: false, error: INVALID_ATTRIBUTE };
        }
        const key = `${playerId}:${attribute}`;
        if (!this.trends.has(key)) {
            return { success: false, error: TREND_NOT_FOUND };
        }
        this.trends.delete(key);
        if (this.playerTrends.has(playerId)) {
            const arr = this.playerTrends.get(playerId);
            const idx = arr.indexOf(key);
            if (idx !== -1) arr.splice(idx, 1);
            if (arr.length === 0) this.playerTrends.delete(playerId);
        }
        if (this.attributeTrends.has(attribute)) {
            const arr = this.attributeTrends.get(attribute);
            const idx = arr.indexOf(key);
            if (idx !== -1) arr.splice(idx, 1);
            if (arr.length === 0) this.attributeTrends.delete(attribute);
        }
        this._triggerHook('onDeleted', { playerId, attribute });
        return { success: true };
    }

    clearSamples(playerId, attribute) {
        if (typeof playerId !== 'string' || playerId.length === 0) {
            return { success: false, error: INVALID_PLAYER_ID };
        }
        if (!this._isValidAttribute(attribute)) {
            return { success: false, error: INVALID_ATTRIBUTE };
        }
        const key = `${playerId}:${attribute}`;
        if (!this.trends.has(key)) {
            return { success: false, error: TREND_NOT_FOUND };
        }
        const trend = this.trends.get(key);
        trend.samples = [];
        trend.trend = 'stable';
        return { success: true };
    }

    setThreshold(name, value) {
        if (name === 'rising' && typeof value === 'number') {
            this.config.risingThreshold = value;
            return { success: true };
        }
        if (name === 'falling' && typeof value === 'number') {
            this.config.fallingThreshold = value;
            return { success: true };
        }
        return { success: false, error: INVALID_VALUE };
    }

    registerTool(name, handler) {
        if (typeof name !== 'string' || name.length === 0) {
            return { success: false, error: INVALID_TOOL_NAME };
        }
        if (typeof handler !== 'function') {
            return { success: false, error: INVALID_HANDLER };
        }
        this.tools.set(name, handler);
        return { success: true };
    }

    executeTool(name, context) {
        if (!this.tools.has(name)) {
            return { success: false, error: UNKNOWN_TOOL };
        }
        const handler = this.tools.get(name);
        const ctx = (context !== undefined && context !== null) ? context : {};
        try {
            const result = handler(ctx);
            return { success: true, result };
        } catch (e) {
            return { success: false, error: TOOL_EXECUTION_ERROR, message: e.message };
        }
    }

    registerHook(event, handler) {
        if (typeof event !== 'string' || event.length === 0) {
            return { success: false, error: INVALID_EVENT_NAME };
        }
        if (typeof handler !== 'function') {
            return { success: false, error: INVALID_HANDLER };
        }
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(handler);
        return { success: true };
    }

    _triggerHook(event, data) {
        if (!this.hooks.has(event)) return;
        for (const handler of this.hooks.get(event)) {
            try {
                handler(data);
            } catch (e) {
                // silent error handling
            }
        }
    }

    unregisterHook(event, handler) {
        if (!this.hooks.has(event)) return { success: false, error: EVENT_NOT_FOUND };
        const arr = this.hooks.get(event);
        const idx = arr.indexOf(handler);
        if (idx === -1) return { success: false, error: HANDLER_NOT_FOUND };
        arr.splice(idx, 1);
        return { success: true };
    }

    toJSON() {
        return {
            config: this.config,
            trends: Array.from(this.trends.entries()),
            playerTrends: Array.from(this.playerTrends.entries()),
            attributeTrends: Array.from(this.attributeTrends.entries()),
            stats: this.stats,
        };
    }

    fromJSON(data) {
        if (!data || typeof data !== 'object') return { success: false, error: INVALID_DATA };
        if (data.config) {
            this.config = { ...this.config, ...data.config };
        }
        if (data.trends && Array.isArray(data.trends)) {
            this.trends = new Map(data.trends);
        }
        if (data.playerTrends && Array.isArray(data.playerTrends)) {
            this.playerTrends = new Map(data.playerTrends);
        }
        if (data.attributeTrends && Array.isArray(data.attributeTrends)) {
            this.attributeTrends = new Map(data.attributeTrends);
        }
        if (data.stats) {
            this.stats = { ...this.stats, ...data.stats };
        }
        return { success: true };
    }

    getStats() {
        return {
            ...this.stats,
            totalTrendRecords: this.trends.size,
        };
    }

    reset() {
        this.trends.clear();
        this.playerTrends.clear();
        this.attributeTrends.clear();
        this.hooks.clear();
        this.stats = {
            totalTracked: 0,
            totalQueried: 0,
            totalAnalyzed: 0,
            byAttribute: { root_bone: 0, aptitude: 0, fortune: 0 },
            byTrend: { rising: 0, falling: 0, stable: 0 },
        };
        this._registerDefaultTools();
        return { success: true };
    }
}
