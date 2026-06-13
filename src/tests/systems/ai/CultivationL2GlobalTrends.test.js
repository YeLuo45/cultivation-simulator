/**
 * CultivationL2GlobalTrends.test.js - 修真 L2 全局趋势系统测试
 * V898 P-20260613-072 Iteration 11/30 Round 35
 * 目标: 99%+
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    CultivationL2GlobalTrends,
    ATTRIBUTES, ATTRIBUTE_COUNT, ATTRIBUTE_META,
    TREND_THRESHOLDS, TRENDS,
    SAMPLES_MAX, DEFAULT_SAMPLES_MAX, MIN_SAMPLES_FOR_ANALYSIS,
    TREND_RANGE_TYPES, TREND_RANGE_COUNT, TREND_RANGE_MS,
    INVALID_PLAYER_ID, INVALID_ATTRIBUTE, INVALID_RANGE_TYPE,
    INVALID_VALUE, TREND_NOT_FOUND, UNKNOWN_TOOL,
    INVALID_TOOL_NAME, INVALID_HANDLER, INVALID_EVENT_NAME,
    EVENT_NOT_FOUND, HANDLER_NOT_FOUND, INVALID_DATA, TOOL_EXECUTION_ERROR,
} from '../../../systems/ai/CultivationL2GlobalTrends.js';

describe('CultivationL2GlobalTrends', () => {
    let system;
    beforeEach(() => { system = new CultivationL2GlobalTrends(); });

    describe('constructor', () => {
        it('should initialize with default config', () => {
            expect(system.config.samplesMax).toBe(DEFAULT_SAMPLES_MAX);
            expect(system.config.samplesMax).toBe(SAMPLES_MAX);
            expect(system.config.risingThreshold).toBe(TREND_THRESHOLDS.rising);
            expect(system.config.fallingThreshold).toBe(TREND_THRESHOLDS.falling);
            expect(system.config.autoAnalyze).toBe(true);
            expect(system.config.minSamplesForAnalysis).toBe(MIN_SAMPLES_FOR_ANALYSIS);
        });
        it('should accept custom config', () => {
            const s = new CultivationL2GlobalTrends({
                samplesMax: 10,
                risingThreshold: 0.2,
                fallingThreshold: -0.2,
                autoAnalyze: false,
                minSamplesForAnalysis: 3,
            });
            expect(s.config.samplesMax).toBe(10);
            expect(s.config.risingThreshold).toBe(0.2);
            expect(s.config.fallingThreshold).toBe(-0.2);
            expect(s.config.autoAnalyze).toBe(false);
            expect(s.config.minSamplesForAnalysis).toBe(3);
        });
        it('should handle samplesMax=0 in config', () => {
            const s = new CultivationL2GlobalTrends({ samplesMax: 0 });
            expect(s.config.samplesMax).toBe(0);
        });
        it('should handle minSamplesForAnalysis=0 in config', () => {
            const s = new CultivationL2GlobalTrends({ minSamplesForAnalysis: 0 });
            expect(s.config.minSamplesForAnalysis).toBe(0);
        });
        it('should initialize empty maps', () => {
            expect(system.trends.size).toBe(0);
            expect(system.playerTrends.size).toBe(0);
            expect(system.attributeTrends.size).toBe(0);
        });
        it('should initialize stats with all 3 attributes and 3 trends', () => {
            expect(system.stats.totalTracked).toBe(0);
            expect(system.stats.totalQueried).toBe(0);
            expect(system.stats.totalAnalyzed).toBe(0);
            expect(system.stats.byAttribute.root_bone).toBe(0);
            expect(system.stats.byAttribute.aptitude).toBe(0);
            expect(system.stats.byAttribute.fortune).toBe(0);
            expect(system.stats.byTrend.rising).toBe(0);
            expect(system.stats.byTrend.falling).toBe(0);
            expect(system.stats.byTrend.stable).toBe(0);
        });
        it('should register default tools', () => {
            expect(system.tools.has('getTrend')).toBe(true);
            expect(system.tools.has('queryTrend')).toBe(true);
            expect(system.tools.has('analyzeTrend')).toBe(true);
            expect(system.tools.has('listByAttribute')).toBe(true);
            expect(system.tools.has('listByPlayer')).toBe(true);
            expect(system.tools.has('listByTrend')).toBe(true);
        });
    });

    describe('exports & constants', () => {
        it('should export 3 attributes', () => {
            expect(ATTRIBUTES).toEqual(['root_bone', 'aptitude', 'fortune']);
            expect(ATTRIBUTE_COUNT).toBe(3);
        });
        it('should export 3 trends', () => {
            expect(TRENDS).toEqual(['rising', 'falling', 'stable']);
        });
        it('should export 4 range types', () => {
            expect(TREND_RANGE_TYPES).toEqual(['hour', 'day', 'week', 'month']);
            expect(TREND_RANGE_COUNT).toBe(4);
        });
        it('should have ATTRIBUTE_META entries', () => {
            expect(ATTRIBUTE_META.root_bone.name).toBe('根骨');
            expect(ATTRIBUTE_META.aptitude.name).toBe('悟性');
            expect(ATTRIBUTE_META.fortune.name).toBe('机缘');
        });
        it('should have correct trend thresholds', () => {
            expect(TREND_THRESHOLDS.rising).toBe(0.1);
            expect(TREND_THRESHOLDS.falling).toBe(-0.1);
        });
        it('should have range ms values', () => {
            expect(TREND_RANGE_MS.hour).toBe(60 * 60 * 1000);
            expect(TREND_RANGE_MS.day).toBe(24 * 60 * 60 * 1000);
            expect(TREND_RANGE_MS.week).toBe(7 * 24 * 60 * 60 * 1000);
            expect(TREND_RANGE_MS.month).toBe(30 * 24 * 60 * 60 * 1000);
        });
    });

    describe('trackTrend', () => {
        it('should track a root_bone sample', () => {
            const { success, trend } = system.trackTrend('p1', 'root_bone', 0.5);
            expect(success).toBe(true);
            expect(trend.playerId).toBe('p1');
            expect(trend.attribute).toBe('root_bone');
            expect(trend.value).toBe(0.5);
        });
        it('should track all 3 attribute types', () => {
            for (const attr of ATTRIBUTES) {
                const { success } = system.trackTrend('p1', attr, 0.4);
                expect(success).toBe(true);
            }
            expect(system.trends.size).toBe(3);
        });
        it('should reject empty playerId', () => {
            const result = system.trackTrend('', 'root_bone', 0.5);
            expect(result.success).toBe(false);
            expect(result.error).toBe(INVALID_PLAYER_ID);
        });
        it('should reject invalid attribute', () => {
            const result = system.trackTrend('p1', 'unknown_attr', 0.5);
            expect(result.success).toBe(false);
            expect(result.error).toBe(INVALID_ATTRIBUTE);
        });
        it('should reject NaN value', () => {
            const result = system.trackTrend('p1', 'root_bone', NaN);
            expect(result.success).toBe(false);
            expect(result.error).toBe(INVALID_VALUE);
        });
        it('should reject non-number value', () => {
            const result = system.trackTrend('p1', 'root_bone', '0.5');
            expect(result.success).toBe(false);
            expect(result.error).toBe(INVALID_VALUE);
        });
        it('should accept value=0', () => {
            const { trend } = system.trackTrend('p1', 'root_bone', 0);
            expect(trend.value).toBe(0);
        });
        it('should accept custom id option', () => {
            const { trend } = system.trackTrend('p1', 'root_bone', 0.5, { id: 'custom_id_1' });
            expect(trend.id).toBe('custom_id_1');
        });
        it('should accept custom recordedAt option', () => {
            const ts = 1700000000000;
            const { trend } = system.trackTrend('p1', 'root_bone', 0.5, { recordedAt: ts });
            expect(trend.recordedAt).toBe(ts);
        });
        it('should accept custom source option', () => {
            const { trend } = system.trackTrend('p1', 'root_bone', 0.5, { source: 'cultivation_session' });
            expect(trend.samples[0].source).toBe('cultivation_session');
        });
        it('should clamp value >1 to 1', () => {
            const { trend } = system.trackTrend('p1', 'root_bone', 1.5);
            expect(trend.value).toBe(1);
        });
        it('should clamp value <0 to 0', () => {
            const { trend } = system.trackTrend('p1', 'root_bone', -0.5);
            expect(trend.value).toBe(0);
        });
        it('should accumulate samples for same key', () => {
            system.trackTrend('p1', 'root_bone', 0.1);
            system.trackTrend('p1', 'root_bone', 0.2);
            const trend = system.getTrendKey('p1', 'root_bone');
            expect(trend.samples.length).toBe(2);
        });
        it('should roll over samples beyond samplesMax', () => {
            const s = new CultivationL2GlobalTrends({ samplesMax: 3 });
            s.trackTrend('p1', 'root_bone', 0.1);
            s.trackTrend('p1', 'root_bone', 0.2);
            s.trackTrend('p1', 'root_bone', 0.3);
            s.trackTrend('p1', 'root_bone', 0.4);
            const trend = s.getTrendKey('p1', 'root_bone');
            expect(trend.samples.length).toBe(3);
            expect(trend.samples[0].value).toBe(0.2);
        });
        it('should update byAttribute stats', () => {
            system.trackTrend('p1', 'fortune', 0.5);
            expect(system.stats.byAttribute.fortune).toBe(1);
        });
        it('should track player mapping', () => {
            system.trackTrend('p1', 'root_bone', 0.5);
            expect(system.playerTrends.has('p1')).toBe(true);
        });
        it('should track attribute mapping', () => {
            system.trackTrend('p1', 'root_bone', 0.5);
            expect(system.attributeTrends.has('root_bone')).toBe(true);
        });
    });

    describe('queryTrend', () => {
        beforeEach(() => {
            system.trackTrend('p1', 'root_bone', 0.3);
            system.trackTrend('p1', 'root_bone', 0.4);
        });

        it('should query samples in default range (day)', () => {
            const result = system.queryTrend('p1', 'root_bone');
            expect(result.success).toBe(true);
            expect(result.playerId).toBe('p1');
            expect(result.attribute).toBe('root_bone');
            expect(result.range).toBe('day');
            expect(result.count).toBe(2);
        });
        it('should return empty result for unknown key', () => {
            const result = system.queryTrend('unknown', 'root_bone');
            expect(result.success).toBe(true);
            expect(result.count).toBe(0);
            expect(result.samples).toEqual([]);
            expect(result.trend).toBe('stable');
        });
        it('should accept all 4 range types', () => {
            for (const r of TREND_RANGE_TYPES) {
                const result = system.queryTrend('p1', 'root_bone', r);
                expect(result.success).toBe(true);
                expect(result.range).toBe(r);
            }
        });
        it('should reject empty playerId', () => {
            const result = system.queryTrend('', 'root_bone');
            expect(result.error).toBe(INVALID_PLAYER_ID);
        });
        it('should reject invalid attribute', () => {
            const result = system.queryTrend('p1', 'bad');
            expect(result.error).toBe(INVALID_ATTRIBUTE);
        });
        it('should reject invalid range', () => {
            const result = system.queryTrend('p1', 'root_bone', 'year');
            expect(result.error).toBe(INVALID_RANGE_TYPE);
        });
        it('should filter samples outside range', () => {
            const past = Date.now() - 2 * 24 * 60 * 60 * 1000;  // 2 days ago
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.5, { recordedAt: past });
            s.trackTrend('p1', 'root_bone', 0.6);
            const r1 = s.queryTrend('p1', 'root_bone', 'day');
            expect(r1.count).toBe(1);
            const r2 = s.queryTrend('p1', 'root_bone', 'week');
            expect(r2.count).toBe(2);
        });
        it('should return samples in hour range only', () => {
            const past = Date.now() - 2 * 60 * 60 * 1000;  // 2 hours ago
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.5, { recordedAt: past });
            s.trackTrend('p1', 'root_bone', 0.6);
            const result = s.queryTrend('p1', 'root_bone', 'hour');
            expect(result.count).toBe(1);
        });
        it('should return samples in month range', () => {
            const past = Date.now() - 15 * 24 * 60 * 60 * 1000;  // 15 days ago
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.5, { recordedAt: past });
            s.trackTrend('p1', 'root_bone', 0.6);
            const result = s.queryTrend('p1', 'root_bone', 'month');
            expect(result.count).toBe(2);
        });
        it('should include trend in result', () => {
            const result = system.queryTrend('p1', 'root_bone');
            expect(result.trend).toBeDefined();
            expect(TRENDS.includes(result.trend)).toBe(true);
        });
        it('should increment totalQueried', () => {
            const before = system.stats.totalQueried;
            system.queryTrend('p1', 'root_bone');
            expect(system.stats.totalQueried).toBe(before + 1);
        });
    });

    describe('analyzeTrend', () => {
        it('should analyze single attribute rising', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.1);
            s.trackTrend('p1', 'root_bone', 0.5);
            const { success, analysis } = s.analyzeTrend('p1', 'root_bone');
            expect(success).toBe(true);
            expect(analysis.attributes.root_bone.trend).toBe('rising');
            expect(analysis.attributes.root_bone.slope).toBeCloseTo(0.4, 5);
        });
        it('should analyze single attribute falling', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.8);
            s.trackTrend('p1', 'root_bone', 0.3);
            const { analysis } = s.analyzeTrend('p1', 'root_bone');
            expect(analysis.attributes.root_bone.trend).toBe('falling');
        });
        it('should analyze stable attribute', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.4);
            s.trackTrend('p1', 'root_bone', 0.45);
            const { analysis } = s.analyzeTrend('p1', 'root_bone');
            expect(analysis.attributes.root_bone.trend).toBe('stable');
        });
        it('should compute average correctly', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.0);
            s.trackTrend('p1', 'root_bone', 0.2);
            const { analysis } = s.analyzeTrend('p1', 'root_bone');
            expect(analysis.attributes.root_bone.average).toBeCloseTo(0.1, 5);
        });
        it('should compute volatility=0 for flat data', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.5);
            s.trackTrend('p1', 'root_bone', 0.5);
            const { analysis } = s.analyzeTrend('p1', 'root_bone');
            expect(analysis.attributes.root_bone.volatility).toBe(0);
        });
        it('should compute volatility > 0 for varied data', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.1);
            s.trackTrend('p1', 'root_bone', 0.9);
            const { analysis } = s.analyzeTrend('p1', 'root_bone');
            expect(analysis.attributes.root_bone.volatility).toBeGreaterThan(0);
        });
        it('should analyze all 3 attributes (null)', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.1);
            s.trackTrend('p1', 'root_bone', 0.5);
            s.trackTrend('p1', 'aptitude', 0.8);
            s.trackTrend('p1', 'aptitude', 0.3);
            const { analysis } = s.analyzeTrend('p1');
            expect(analysis.attributes.root_bone.trend).toBe('rising');
            expect(analysis.attributes.aptitude.trend).toBe('falling');
            expect(analysis.attributes.fortune.present).toBe(false);
        });
        it('should compute overall=stable when no trends', () => {
            const { analysis } = system.analyzeTrend('unknown');
            expect(analysis.overall).toBe('stable');
        });
        it('should compute overall=rising when majority rising', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.1);
            s.trackTrend('p1', 'root_bone', 0.5);
            s.trackTrend('p1', 'aptitude', 0.1);
            s.trackTrend('p1', 'aptitude', 0.5);
            s.trackTrend('p1', 'fortune', 0.1);
            s.trackTrend('p1', 'fortune', 0.5);
            const { analysis } = s.analyzeTrend('p1');
            expect(analysis.overall).toBe('rising');
        });
        it('should compute overall=falling when majority falling', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.8);
            s.trackTrend('p1', 'root_bone', 0.2);
            s.trackTrend('p1', 'aptitude', 0.8);
            s.trackTrend('p1', 'aptitude', 0.2);
            s.trackTrend('p1', 'fortune', 0.1);
            s.trackTrend('p1', 'fortune', 0.5);
            const { analysis } = s.analyzeTrend('p1');
            expect(analysis.overall).toBe('falling');
        });
        it('should mark missing attribute as present=false', () => {
            const { analysis } = system.analyzeTrend('p1', 'fortune');
            expect(analysis.attributes.fortune.present).toBe(false);
            expect(analysis.attributes.fortune.sampleCount).toBe(0);
        });
        it('should reject empty playerId', () => {
            const result = system.analyzeTrend('');
            expect(result.error).toBe(INVALID_PLAYER_ID);
        });
        it('should reject invalid attribute', () => {
            const result = system.analyzeTrend('p1', 'bad');
            expect(result.error).toBe(INVALID_ATTRIBUTE);
        });
        it('should handle single sample (insufficient for trend)', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.5);
            const { analysis } = s.analyzeTrend('p1', 'root_bone');
            expect(analysis.attributes.root_bone.trend).toBe('stable');
            expect(analysis.attributes.root_bone.slope).toBe(0);
        });
        it('should increment totalAnalyzed', () => {
            const before = system.stats.totalAnalyzed;
            system.analyzeTrend('p1');
            expect(system.stats.totalAnalyzed).toBe(before + 1);
        });
        it('should count totalSamples', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.1);
            s.trackTrend('p1', 'root_bone', 0.2);
            s.trackTrend('p1', 'aptitude', 0.3);
            const { analysis } = s.analyzeTrend('p1');
            expect(analysis.totalSamples).toBe(3);
        });
        it('should return overall=stable when all stable', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.4);
            s.trackTrend('p1', 'root_bone', 0.45);
            s.trackTrend('p1', 'aptitude', 0.4);
            s.trackTrend('p1', 'aptitude', 0.45);
            const { analysis } = s.analyzeTrend('p1');
            expect(analysis.overall).toBe('stable');
        });
    });

    describe('trend classification thresholds', () => {
        it('should classify as rising when delta > 0.1', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.0);
            s.trackTrend('p1', 'root_bone', 0.2);
            const t = s.getTrendKey('p1', 'root_bone');
            expect(t.trend).toBe('rising');
        });
        it('should classify as falling when delta < -0.1', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.9);
            s.trackTrend('p1', 'root_bone', 0.5);
            const t = s.getTrendKey('p1', 'root_bone');
            expect(t.trend).toBe('falling');
        });
        it('should classify as stable when |delta| <= 0.1', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.4);
            s.trackTrend('p1', 'root_bone', 0.45);
            const t = s.getTrendKey('p1', 'root_bone');
            expect(t.trend).toBe('stable');
        });
        it('should respect custom rising threshold', () => {
            const s = new CultivationL2GlobalTrends({ risingThreshold: 0.3 });
            s.trackTrend('p1', 'root_bone', 0.0);
            s.trackTrend('p1', 'root_bone', 0.2);
            const t = s.getTrendKey('p1', 'root_bone');
            expect(t.trend).toBe('stable');
        });
        it('should respect custom falling threshold', () => {
            const s = new CultivationL2GlobalTrends({ fallingThreshold: -0.3 });
            s.trackTrend('p1', 'root_bone', 0.9);
            s.trackTrend('p1', 'root_bone', 0.7);
            const t = s.getTrendKey('p1', 'root_bone');
            expect(t.trend).toBe('stable');
        });
        it('should update byTrend stat on trend change', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.0);
            s.trackTrend('p1', 'root_bone', 0.5);
            expect(s.stats.byTrend.rising).toBe(1);
        });
    });

    describe('getTrend & getTrendKey', () => {
        it('should return trend by id', () => {
            const { trend } = system.trackTrend('p1', 'root_bone', 0.5);
            const fetched = system.getTrend(trend.id);
            expect(fetched.id).toBe(trend.id);
            expect(fetched.playerId).toBe('p1');
        });
        it('should return null for unknown id', () => {
            expect(system.getTrend('unknown_id')).toBe(null);
        });
        it('should return null for empty id', () => {
            expect(system.getTrend('')).toBe(null);
        });
        it('should return trend by key', () => {
            system.trackTrend('p1', 'root_bone', 0.5);
            const t = system.getTrendKey('p1', 'root_bone');
            expect(t.playerId).toBe('p1');
            expect(t.attribute).toBe('root_bone');
        });
        it('should return null for unknown key', () => {
            expect(system.getTrendKey('unknown', 'root_bone')).toBe(null);
        });
        it('should return null for getTrendKey with invalid attribute', () => {
            expect(system.getTrendKey('p1', 'bad')).toBe(null);
        });
        it('should return null for getTrendKey with empty playerId', () => {
            expect(system.getTrendKey('', 'root_bone')).toBe(null);
        });
        it('should deep-copy samples in getTrend', () => {
            system.trackTrend('p1', 'root_bone', 0.5);
            const t = system.getTrend(system.listByAttribute('root_bone')[0].id);
            expect(t.samples).toEqual([{ value: 0.5, recordedAt: t.recordedAt, source: 'manual' }]);
        });
    });

    describe('listByAttribute', () => {
        it('should list all trends for an attribute', () => {
            system.trackTrend('p1', 'root_bone', 0.5);
            system.trackTrend('p2', 'root_bone', 0.4);
            const list = system.listByAttribute('root_bone');
            expect(list.length).toBe(2);
        });
        it('should return empty for invalid attribute', () => {
            expect(system.listByAttribute('bad')).toEqual([]);
        });
        it('should return empty for attribute with no trends', () => {
            expect(system.listByAttribute('aptitude')).toEqual([]);
        });
        it('should list fortune attribute separately', () => {
            system.trackTrend('p1', 'fortune', 0.3);
            expect(system.listByAttribute('fortune').length).toBe(1);
        });
    });

    describe('listByTrend', () => {
        it('should list rising trends', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.0);
            s.trackTrend('p1', 'root_bone', 0.5);
            const list = s.listByTrend('rising');
            expect(list.length).toBe(1);
        });
        it('should list falling trends', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.9);
            s.trackTrend('p1', 'root_bone', 0.3);
            const list = s.listByTrend('falling');
            expect(list.length).toBe(1);
        });
        it('should list stable trends', () => {
            const s = new CultivationL2GlobalTrends();
            s.trackTrend('p1', 'root_bone', 0.4);
            s.trackTrend('p1', 'root_bone', 0.45);
            const list = s.listByTrend('stable');
            expect(list.length).toBe(1);
        });
        it('should return empty for invalid trend', () => {
            expect(system.listByTrend('unknown')).toEqual([]);
        });
    });

    describe('listByPlayer', () => {
        it('should list all trends for a player', () => {
            system.trackTrend('p1', 'root_bone', 0.5);
            system.trackTrend('p1', 'aptitude', 0.4);
            system.trackTrend('p1', 'fortune', 0.6);
            const list = system.listByPlayer('p1');
            expect(list.length).toBe(3);
        });
        it('should return empty for unknown player', () => {
            expect(system.listByPlayer('unknown')).toEqual([]);
        });
        it('should return empty for empty playerId', () => {
            expect(system.listByPlayer('')).toEqual([]);
        });
    });

    describe('listAll & listAttributes & listRangeTypes', () => {
        it('should list all trends', () => {
            system.trackTrend('p1', 'root_bone', 0.5);
            system.trackTrend('p2', 'aptitude', 0.4);
            expect(system.listAll().length).toBe(2);
        });
        it('should list attributes', () => {
            expect(system.listAttributes()).toEqual(ATTRIBUTES);
        });
        it('should return a copy of attributes', () => {
            const a = system.listAttributes();
            a.push('fake');
            expect(system.listAttributes().length).toBe(3);
        });
        it('should list range types', () => {
            expect(system.listRangeTypes()).toEqual(TREND_RANGE_TYPES);
        });
        it('should return a copy of range types', () => {
            const r = system.listRangeTypes();
            r.push('fake');
            expect(system.listRangeTypes().length).toBe(4);
        });
    });

    describe('deleteTrend', () => {
        it('should delete existing trend', () => {
            system.trackTrend('p1', 'root_bone', 0.5);
            const result = system.deleteTrend('p1', 'root_bone');
            expect(result.success).toBe(true);
            expect(system.getTrendKey('p1', 'root_bone')).toBe(null);
        });
        it('should reject empty playerId', () => {
            const result = system.deleteTrend('', 'root_bone');
            expect(result.error).toBe(INVALID_PLAYER_ID);
        });
        it('should reject invalid attribute', () => {
            const result = system.deleteTrend('p1', 'bad');
            expect(result.error).toBe(INVALID_ATTRIBUTE);
        });
        it('should return error for non-existent trend', () => {
            const result = system.deleteTrend('p1', 'root_bone');
            expect(result.error).toBe(TREND_NOT_FOUND);
        });
        it('should remove from attributeTrends when last', () => {
            system.trackTrend('p1', 'fortune', 0.5);
            system.deleteTrend('p1', 'fortune');
            expect(system.attributeTrends.has('fortune')).toBe(false);
        });
        it('should keep attributeTrends when more exist', () => {
            system.trackTrend('p1', 'fortune', 0.5);
            system.trackTrend('p2', 'fortune', 0.4);
            system.deleteTrend('p1', 'fortune');
            expect(system.attributeTrends.has('fortune')).toBe(true);
        });
    });

    describe('clearSamples', () => {
        it('should clear samples of a trend', () => {
            system.trackTrend('p1', 'root_bone', 0.5);
            system.trackTrend('p1', 'root_bone', 0.6);
            const result = system.clearSamples('p1', 'root_bone');
            expect(result.success).toBe(true);
            const t = system.getTrendKey('p1', 'root_bone');
            expect(t.samples.length).toBe(0);
            expect(t.trend).toBe('stable');
        });
        it('should reject empty playerId', () => {
            const result = system.clearSamples('', 'root_bone');
            expect(result.error).toBe(INVALID_PLAYER_ID);
        });
        it('should reject invalid attribute', () => {
            const result = system.clearSamples('p1', 'bad');
            expect(result.error).toBe(INVALID_ATTRIBUTE);
        });
        it('should return error for non-existent trend', () => {
            const result = system.clearSamples('p1', 'root_bone');
            expect(result.error).toBe(TREND_NOT_FOUND);
        });
    });

    describe('setThreshold', () => {
        it('should set rising threshold', () => {
            const r = system.setThreshold('rising', 0.2);
            expect(r.success).toBe(true);
            expect(system.config.risingThreshold).toBe(0.2);
        });
        it('should set falling threshold', () => {
            const r = system.setThreshold('falling', -0.2);
            expect(r.success).toBe(true);
            expect(system.config.fallingThreshold).toBe(-0.2);
        });
        it('should reject unknown threshold name', () => {
            const r = system.setThreshold('unknown', 0.1);
            expect(r.success).toBe(false);
            expect(r.error).toBe(INVALID_VALUE);
        });
        it('should reject non-number value', () => {
            const r = system.setThreshold('rising', '0.1');
            expect(r.success).toBe(false);
            expect(r.error).toBe(INVALID_VALUE);
        });
    });

    describe('registerTool & executeTool', () => {
        it('should register and execute a tool', () => {
            system.registerTool('custom', (ctx) => ctx.x * 2);
            const r = system.executeTool('custom', { x: 5 });
            expect(r.success).toBe(true);
            expect(r.result).toBe(10);
        });
        it('should reject empty tool name', () => {
            const r = system.registerTool('', () => null);
            expect(r.error).toBe(INVALID_TOOL_NAME);
        });
        it('should reject non-function handler', () => {
            const r = system.registerTool('bad', 'not a function');
            expect(r.error).toBe(INVALID_HANDLER);
        });
        it('should return UNKNOWN_TOOL for unknown tool', () => {
            const r = system.executeTool('nonexistent', {});
            expect(r.error).toBe(UNKNOWN_TOOL);
        });
        it('should handle missing context (context=undefined)', () => {
            const r = system.executeTool('getTrend');
            expect(r.success).toBe(true);
            expect(r.result).toBe(null);
        });
        it('should handle null context', () => {
            const r = system.executeTool('getTrend', null);
            expect(r.success).toBe(true);
            expect(r.result).toBe(null);
        });
        it('should catch tool execution errors', () => {
            system.registerTool('throws', () => { throw new Error('boom'); });
            const r = system.executeTool('throws', {});
            expect(r.success).toBe(false);
            expect(r.error).toBe(TOOL_EXECUTION_ERROR);
            expect(r.message).toBe('boom');
        });
        it('should use getTrend default tool', () => {
            const { trend } = system.trackTrend('p1', 'root_bone', 0.5);
            const r = system.executeTool('getTrend', { trendId: trend.id });
            expect(r.success).toBe(true);
            expect(r.result.id).toBe(trend.id);
        });
        it('should use queryTrend default tool', () => {
            system.trackTrend('p1', 'root_bone', 0.5);
            const r = system.executeTool('queryTrend', { playerId: 'p1', attribute: 'root_bone', range: 'day' });
            expect(r.success).toBe(true);
            expect(r.result.count).toBe(1);
        });
        it('should use analyzeTrend default tool', () => {
            const r = system.executeTool('analyzeTrend', { playerId: 'p1' });
            expect(r.success).toBe(true);
        });
        it('should use listByAttribute default tool', () => {
            system.trackTrend('p1', 'root_bone', 0.5);
            const r = system.executeTool('listByAttribute', { attribute: 'root_bone' });
            expect(r.success).toBe(true);
            expect(r.result.length).toBe(1);
        });
        it('should use listByPlayer default tool', () => {
            system.trackTrend('p1', 'root_bone', 0.5);
            const r = system.executeTool('listByPlayer', { playerId: 'p1' });
            expect(r.success).toBe(true);
            expect(r.result.length).toBe(1);
        });
        it('should use listByTrend default tool', () => {
            const r = system.executeTool('listByTrend', { trend: 'stable' });
            expect(r.success).toBe(true);
        });
    });

    describe('registerHook & _triggerHook & unregisterHook', () => {
        it('should register and trigger a hook', () => {
            const cb = vi.fn();
            system.registerHook('onTracked', cb);
            system.trackTrend('p1', 'root_bone', 0.5);
            expect(cb).toHaveBeenCalled();
        });
        it('should trigger onAnalyzed hook', () => {
            const cb = vi.fn();
            system.registerHook('onAnalyzed', cb);
            system.analyzeTrend('p1');
            expect(cb).toHaveBeenCalled();
        });
        it('should trigger onDeleted hook', () => {
            const cb = vi.fn();
            system.trackTrend('p1', 'root_bone', 0.5);
            system.registerHook('onDeleted', cb);
            system.deleteTrend('p1', 'root_bone');
            expect(cb).toHaveBeenCalled();
        });
        it('should reject empty event name', () => {
            const r = system.registerHook('', () => null);
            expect(r.error).toBe(INVALID_EVENT_NAME);
        });
        it('should reject non-function handler', () => {
            const r = system.registerHook('onTracked', 'not a function');
            expect(r.error).toBe(INVALID_HANDLER);
        });
        it('should silently catch hook errors', () => {
            system.registerHook('onTracked', () => { throw new Error('hook fail'); });
            expect(() => system.trackTrend('p1', 'root_bone', 0.5)).not.toThrow();
        });
        it('should unregister a hook', () => {
            const cb = vi.fn();
            system.registerHook('onTracked', cb);
            const r = system.unregisterHook('onTracked', cb);
            expect(r.success).toBe(true);
        });
        it('should return EVENT_NOT_FOUND for unknown event', () => {
            const r = system.unregisterHook('unknown', () => null);
            expect(r.error).toBe(EVENT_NOT_FOUND);
        });
        it('should return HANDLER_NOT_FOUND for unknown handler', () => {
            system.registerHook('onTracked', () => null);
            const r = system.unregisterHook('onTracked', () => null);
            expect(r.error).toBe(HANDLER_NOT_FOUND);
        });
    });

    describe('toJSON & fromJSON', () => {
        it('should serialize to JSON', () => {
            system.trackTrend('p1', 'root_bone', 0.5);
            const json = system.toJSON();
            expect(json.config).toBeDefined();
            expect(json.trends.length).toBe(1);
            expect(json.playerTrends.length).toBe(1);
            expect(json.attributeTrends.length).toBe(1);
            expect(json.stats).toBeDefined();
        });
        it('should deserialize from JSON', () => {
            system.trackTrend('p1', 'root_bone', 0.5);
            const json = system.toJSON();
            const s2 = new CultivationL2GlobalTrends();
            const r = s2.fromJSON(json);
            expect(r.success).toBe(true);
            expect(s2.trends.size).toBe(1);
        });
        it('should restore config from JSON', () => {
            const json = { config: { samplesMax: 5, risingThreshold: 0.05 } };
            const s = new CultivationL2GlobalTrends();
            s.fromJSON(json);
            expect(s.config.samplesMax).toBe(5);
        });
        it('should restore stats from JSON', () => {
            const s = new CultivationL2GlobalTrends();
            s.fromJSON({ stats: { totalTracked: 99 } });
            expect(s.stats.totalTracked).toBe(99);
        });
        it('should reject invalid data', () => {
            const r = system.fromJSON(null);
            expect(r.error).toBe(INVALID_DATA);
        });
        it('should reject non-object data', () => {
            const r = system.fromJSON('bad');
            expect(r.error).toBe(INVALID_DATA);
        });
    });

    describe('getStats & reset', () => {
        it('should return stats with totalTrendRecords', () => {
            system.trackTrend('p1', 'root_bone', 0.5);
            const stats = system.getStats();
            expect(stats.totalTracked).toBe(1);
            expect(stats.totalTrendRecords).toBe(1);
        });
        it('should reset state', () => {
            system.trackTrend('p1', 'root_bone', 0.5);
            const r = system.reset();
            expect(r.success).toBe(true);
            expect(system.trends.size).toBe(0);
            expect(system.stats.totalTracked).toBe(0);
        });
        it('should re-register default tools after reset', () => {
            system.reset();
            expect(system.tools.has('getTrend')).toBe(true);
        });
        it('should clear hooks on reset', () => {
            system.registerHook('onTracked', () => null);
            system.reset();
            expect(system.hooks.size).toBe(0);
        });
    });

    describe('private helper methods', () => {
        it('_clampValue should return 0 for NaN', () => {
            expect(system._clampValue(NaN)).toBe(0);
        });
        it('_clampValue should return 0 for non-number', () => {
            expect(system._clampValue('foo')).toBe(0);
        });
        it('_clampValue should return 0 for undefined', () => {
            expect(system._clampValue(undefined)).toBe(0);
        });
        it('_clampValue should clamp to 1 for value > 1', () => {
            expect(system._clampValue(2.5)).toBe(1);
        });
        it('_clampValue should clamp to 0 for value < 0', () => {
            expect(system._clampValue(-0.5)).toBe(0);
        });
        it('_clampValue should return value when in range', () => {
            expect(system._clampValue(0.5)).toBe(0.5);
        });
        it('_calculateAverage should return 0 for empty array', () => {
            expect(system._calculateAverage([])).toBe(0);
        });
        it('_calculateAverage should handle non-array', () => {
            expect(system._calculateAverage(null)).toBe(0);
        });
        it('_calculateAverage should treat non-number value as 0', () => {
            const samples = [{ value: 0.2 }, { value: 'invalid' }, { value: 0.4 }];
            expect(system._calculateAverage(samples)).toBeCloseTo(0.2, 5);
        });
        it('_calculateSlope should return 0 for empty array', () => {
            expect(system._calculateSlope([])).toBe(0);
        });
        it('_calculateSlope should return 0 for single sample', () => {
            expect(system._calculateSlope([{ value: 0.5 }])).toBe(0);
        });
        it('_calculateSlope should return 0 for non-array', () => {
            expect(system._calculateSlope(null)).toBe(0);
        });
        it('_calculateSlope should compute delta correctly', () => {
            expect(system._calculateSlope([{ value: 0.1 }, { value: 0.6 }])).toBeCloseTo(0.5, 5);
        });
        it('_calculateVolatility should return 0 for length<2', () => {
            expect(system._calculateVolatility([{ value: 0.5 }])).toBe(0);
        });
        it('_calculateVolatility should return 0 for empty array', () => {
            expect(system._calculateVolatility([])).toBe(0);
        });
        it('_calculateVolatility should return 0 for non-array', () => {
            expect(system._calculateVolatility(null)).toBe(0);
        });
        it('_classifyTrend should return stable for empty array', () => {
            expect(system._classifyTrend([])).toBe('stable');
        });
        it('_classifyTrend should return stable for non-array', () => {
            expect(system._classifyTrend(null)).toBe('stable');
        });
        it('_classifyTrend should return stable for single sample', () => {
            expect(system._classifyTrend([{ value: 0.5 }])).toBe('stable');
        });
    });

    describe('hooks fire properly', () => {
        it('onTracked passes correct payload', () => {
            const cb = vi.fn();
            system.registerHook('onTracked', cb);
            system.trackTrend('p1', 'root_bone', 0.5);
            const callArg = cb.mock.calls[0][0];
            expect(callArg.playerId).toBe('p1');
            expect(callArg.attribute).toBe('root_bone');
            expect(callArg.sample).toBeDefined();
        });
        it('onAnalyzed passes correct payload', () => {
            const cb = vi.fn();
            system.registerHook('onAnalyzed', cb);
            system.analyzeTrend('p1');
            const callArg = cb.mock.calls[0][0];
            expect(callArg.playerId).toBe('p1');
            expect(callArg.overall).toBe('stable');
        });
    });

    describe('autoAnalyze=false', () => {
        it('should not classify when autoAnalyze=false', () => {
            const s = new CultivationL2GlobalTrends({ autoAnalyze: false });
            s.trackTrend('p1', 'root_bone', 0.0);
            s.trackTrend('p1', 'root_bone', 0.9);
            const t = s.getTrendKey('p1', 'root_bone');
            expect(t.trend).toBe('stable');
        });
    });

    describe('rolling deletion with samplesMax=1', () => {
        it('should keep only the latest sample', () => {
            const s = new CultivationL2GlobalTrends({ samplesMax: 1 });
            s.trackTrend('p1', 'root_bone', 0.1);
            s.trackTrend('p1', 'root_bone', 0.5);
            const t = s.getTrendKey('p1', 'root_bone');
            expect(t.samples.length).toBe(1);
            expect(t.samples[0].value).toBe(0.5);
        });
    });

    describe('re-tracking same key uses accumulated samples', () => {
        it('should accumulate samples for same playerId+attribute', () => {
            system.trackTrend('p1', 'root_bone', 0.2);
            system.trackTrend('p1', 'root_bone', 0.4);
            system.trackTrend('p1', 'root_bone', 0.8);
            const t = system.getTrendKey('p1', 'root_bone');
            expect(t.samples.length).toBe(3);
        });
        it('should track different players independently', () => {
            system.trackTrend('p1', 'root_bone', 0.2);
            system.trackTrend('p2', 'root_bone', 0.5);
            expect(system.trends.size).toBe(2);
        });
        it('should track different attributes independently', () => {
            system.trackTrend('p1', 'root_bone', 0.2);
            system.trackTrend('p1', 'aptitude', 0.5);
            system.trackTrend('p1', 'fortune', 0.7);
            expect(system.trends.size).toBe(3);
        });
    });

    describe('edge cases', () => {
        it('should handle value=1', () => {
            const { trend } = system.trackTrend('p1', 'root_bone', 1);
            expect(trend.value).toBe(1);
        });
        it('should handle trackTrend on existing trend with new recordedAt', () => {
            const ts1 = 1000;
            const ts2 = 2000;
            const { trend } = system.trackTrend('p1', 'root_bone', 0.3, { recordedAt: ts1 });
            const { trend: t2 } = system.trackTrend('p1', 'root_bone', 0.5, { recordedAt: ts2 });
            expect(t2.recordedAt).toBe(ts2);
        });
        it('should queryTrend return range in result', () => {
            const r = system.queryTrend('p1', 'root_bone', 'week');
            expect(r.range).toBe('week');
        });
        it('should expose samples as copies not refs', () => {
            system.trackTrend('p1', 'root_bone', 0.5);
            const t1 = system.getTrendKey('p1', 'root_bone');
            const t2 = system.getTrend(system.listByAttribute('root_bone')[0].id);
            t1.samples.push({ value: 999, recordedAt: 0, source: 'fake' });
            expect(t2.samples.length).toBe(1);
        });
    });
});
