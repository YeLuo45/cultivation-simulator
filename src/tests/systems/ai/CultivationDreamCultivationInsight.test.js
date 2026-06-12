/**
 * CultivationDreamCultivationInsight.test.js - 梦中修真感悟测试
 * V865 P-20260613-008 Iteration 8/30 Round 34
 * 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    CultivationDreamCultivationInsight,
    INSIGHT_SOURCES,
    SOURCE_KEYS,
    WISDOM_THRESHOLDS,
    WISDOM_GRADES,
    EXTRACTION_RATES,
    WISDOM_GRADE_MAX,
    INSIGHT_STATES,
} from '../../../systems/ai/CultivationDreamCultivationInsight.js';

describe('CultivationDreamCultivationInsight', () => {
    let system;
    beforeEach(() => { system = new CultivationDreamCultivationInsight(); });

    describe('constructor edge cases', () => {
        it('should handle explicit maxInsights=0', () => {
            const s = new CultivationDreamCultivationInsight({ maxInsights: 0 });
            expect(s.config.maxInsights).toBe(0);
        });
        it('should handle explicit maxMergeBatch=0', () => {
            const s = new CultivationDreamCultivationInsight({ maxMergeBatch: 0 });
            expect(s.config.maxMergeBatch).toBe(0);
        });
        it('should handle explicit essenceCap=0', () => {
            const s = new CultivationDreamCultivationInsight({ essenceCap: 0 });
            expect(s.config.essenceCap).toBe(0);
        });
        it('should handle explicit baseMergeBonus=0', () => {
            const s = new CultivationDreamCultivationInsight({ baseMergeBonus: 0 });
            expect(s.config.baseMergeBonus).toBe(0);
        });
    });

    describe('gainInsight', () => {
        it('should gain breakthrough insight', () => {
            const r = system.gainInsight('d1', 'breakthrough');
            expect(r.insight.source).toBe('breakthrough');
            expect(r.insight.wisdomScore).toBe(INSIGHT_SOURCES.breakthrough.wisdomGain);
        });
        it('should gain alchemy insight', () => {
            const r = system.gainInsight('d1', 'alchemy');
            expect(r.insight.source).toBe('alchemy');
        });
        it('should gain encounter insight', () => {
            const r = system.gainInsight('d1', 'encounter');
            expect(r.insight.source).toBe('encounter');
        });
        it('should reject empty dreamId', () => {
            const r = system.gainInsight('', 'breakthrough');
            expect(r.error).toBe('INVALID_DREAM_ID');
        });
        it('should reject unknown source', () => {
            const r = system.gainInsight('d1', 'unknown');
            expect(r.error).toBe('UNKNOWN_SOURCE');
        });
        it('should reject non-string source', () => {
            const r = system.gainInsight('d1', 123);
            expect(r.error).toBe('UNKNOWN_SOURCE');
        });
        it('should enforce maxInsights', () => {
            const s = new CultivationDreamCultivationInsight({ maxInsights: 1 });
            s.gainInsight('d1', 'breakthrough');
            const r = s.gainInsight('d2', 'breakthrough');
            expect(r.error).toBe('MAX_INSIGHTS_REACHED');
        });
        it('should initialize mergedCount=0 and extractedEssence=0', () => {
            const r = system.gainInsight('d1', 'breakthrough');
            expect(r.insight.mergedCount).toBe(0);
            expect(r.insight.extractedEssence).toBe(0);
        });
        it('should set state to gained', () => {
            const r = system.gainInsight('d1', 'breakthrough');
            expect(r.insight.state).toBe(INSIGHT_STATES.GAINED);
        });
        it('should set gainedAt timestamp', () => {
            const before = Date.now();
            const r = system.gainInsight('d1', 'breakthrough');
            expect(r.insight.gainedAt).toBeGreaterThanOrEqual(before);
        });
        it('should trigger insightGained hook', () => {
            let called = false;
            system.registerHook('insightGained', () => { called = true; });
            system.gainInsight('d1', 'breakthrough');
            expect(called).toBe(true);
        });
        it('should increment totalGains', () => {
            system.gainInsight('d1', 'breakthrough');
            expect(system.stats.totalGains).toBe(1);
        });
    });

    describe('getInsight', () => {
        it('should return insight copy', () => {
            const r = system.gainInsight('d1', 'breakthrough');
            const got = system.getInsight(r.insight.id);
            expect(got.id).toBe(r.insight.id);
        });
        it('should return null for missing', () => {
            expect(system.getInsight('ghost')).toBeNull();
        });
    });

    describe('listInsights', () => {
        it('should list all', () => {
            system.gainInsight('d1', 'breakthrough');
            system.gainInsight('d2', 'alchemy');
            expect(system.listInsights().length).toBe(2);
        });
    });

    describe('listInsightsByDream', () => {
        it('should filter by dreamId', () => {
            system.gainInsight('d1', 'breakthrough');
            system.gainInsight('d2', 'breakthrough');
            system.gainInsight('d1', 'alchemy');
            expect(system.listInsightsByDream('d1').length).toBe(2);
        });
        it('should return empty for no match', () => {
            expect(system.listInsightsByDream('none')).toEqual([]);
        });
    });

    describe('listInsightsBySource', () => {
        it('should filter by source', () => {
            system.gainInsight('d1', 'breakthrough');
            system.gainInsight('d2', 'alchemy');
            system.gainInsight('d3', 'breakthrough');
            expect(system.listInsightsBySource('breakthrough').length).toBe(2);
        });
    });

    describe('listInsightsByGrade', () => {
        it('should filter by grade', () => {
            system.gainInsight('d1', 'encounter'); // wisdom=5 → novice
            expect(system.listInsightsByGrade(0).length).toBe(1);
        });
    });

    describe('listInsightsByState', () => {
        it('should filter by state', () => {
            system.gainInsight('d1', 'breakthrough');
            const r = system.listInsightsByState(INSIGHT_STATES.GAINED);
            expect(r.length).toBe(1);
        });
        it('should return empty for unknown state', () => {
            expect(system.listInsightsByState('unknown')).toEqual([]);
        });
    });

    describe('listExtractedInsights', () => {
        it('should return empty when none extracted', () => {
            system.gainInsight('d1', 'breakthrough');
            expect(system.listExtractedInsights().length).toBe(0);
        });
    });

    describe('mergeInsights', () => {
        it('should reject empty dreamId', () => {
            const r = system.mergeInsights('', ['x', 'y']);
            expect(r.error).toBe('INVALID_DREAM_ID');
        });
        it('should reject non-array ids', () => {
            const r = system.mergeInsights('d1', 'x');
            expect(r.error).toBe('INVALID_IDS');
        });
        it('should reject batch of size 1', () => {
            const r = system.mergeInsights('d1', ['x']);
            expect(r.error).toBe('INVALID_IDS');
        });
        it('should reject empty array', () => {
            const r = system.mergeInsights('d1', []);
            expect(r.error).toBe('INVALID_IDS');
        });
        it('should reject batch too large', () => {
            const s = new CultivationDreamCultivationInsight({ maxMergeBatch: 1 });
            const { insight: i1 } = s.gainInsight('d1', 'breakthrough');
            const { insight: i2 } = s.gainInsight('d1', 'breakthrough');
            const r = s.mergeInsights('d1', [i1.id, i2.id]);
            expect(r.error).toBe('BATCH_TOO_LARGE');
        });
        it('should reject missing insight', () => {
            const { insight: i1 } = system.gainInsight('d1', 'breakthrough');
            const r = system.mergeInsights('d1', [i1.id, 'ghost']);
            expect(r.error).toBe('INSIGHT_NOT_FOUND');
        });
        it('should reject dream mismatch', () => {
            const { insight: i1 } = system.gainInsight('d1', 'breakthrough');
            const { insight: i2 } = system.gainInsight('d2', 'breakthrough');
            const r = system.mergeInsights('d1', [i1.id, i2.id]);
            expect(r.error).toBe('DREAM_MISMATCH');
        });
        it('should merge 2 insights and increment mergedCount', () => {
            const { insight: i1 } = system.gainInsight('d1', 'encounter');
            const { insight: i2 } = system.gainInsight('d1', 'encounter');
            const r = system.mergeInsights('d1', [i1.id, i2.id]);
            expect(r.success).toBe(true);
            expect(r.mergedCount).toBe(1);
            // primary keeps its own 5 + absorbs 5 from i2 + 2 bonus = 12
            expect(r.wisdomScore).toBe(12);
        });
        it('should merge 3 insights and increment mergedCount by 2', () => {
            const { insight: i1 } = system.gainInsight('d1', 'encounter');
            const { insight: i2 } = system.gainInsight('d1', 'encounter');
            const { insight: i3 } = system.gainInsight('d1', 'encounter');
            const r = system.mergeInsights('d1', [i1.id, i2.id, i3.id]);
            expect(r.mergedCount).toBe(2);
            // 5 + 5 + 5 + 2 = 17
            expect(r.wisdomScore).toBe(17);
        });
        it('should set primary state to merged', () => {
            const { insight: i1 } = system.gainInsight('d1', 'encounter');
            const { insight: i2 } = system.gainInsight('d1', 'encounter');
            system.mergeInsights('d1', [i1.id, i2.id]);
            const got = system.getInsight(i1.id);
            expect(got.state).toBe(INSIGHT_STATES.MERGED);
        });
        it('should set non-primary state to merged', () => {
            const { insight: i1 } = system.gainInsight('d1', 'encounter');
            const { insight: i2 } = system.gainInsight('d1', 'encounter');
            system.mergeInsights('d1', [i1.id, i2.id]);
            const got = system.getInsight(i2.id);
            expect(got.state).toBe(INSIGHT_STATES.MERGED);
        });
        it('should reject merge of already extracted insight', () => {
            const { insight: i1 } = system.gainInsight('d1', 'encounter');
            const { insight: i2 } = system.gainInsight('d1', 'encounter');
            system.extractWisdom(i1.id);
            const r = system.mergeInsights('d1', [i1.id, i2.id]);
            expect(r.error).toBe('ALREADY_EXTRACTED');
        });
        it('should respect baseMergeBonus=0', () => {
            const s = new CultivationDreamCultivationInsight({ baseMergeBonus: 0 });
            const { insight: i1 } = s.gainInsight('d1', 'encounter');
            const { insight: i2 } = s.gainInsight('d1', 'encounter');
            const r = s.mergeInsights('d1', [i1.id, i2.id]);
            // 5 + 5 + 0 = 10
            expect(r.wisdomScore).toBe(10);
        });
        it('should trigger insightsMerged hook', () => {
            let called = false;
            const { insight: i1 } = system.gainInsight('d1', 'encounter');
            const { insight: i2 } = system.gainInsight('d1', 'encounter');
            system.registerHook('insightsMerged', () => { called = true; });
            system.mergeInsights('d1', [i1.id, i2.id]);
            expect(called).toBe(true);
        });
        it('should increment totalMerges', () => {
            const { insight: i1 } = system.gainInsight('d1', 'encounter');
            const { insight: i2 } = system.gainInsight('d1', 'encounter');
            system.mergeInsights('d1', [i1.id, i2.id]);
            expect(system.stats.totalMerges).toBe(1);
        });
    });

    describe('extractWisdom', () => {
        it('should reject missing insight', () => {
            const r = system.extractWisdom('ghost');
            expect(r.error).toBe('INSIGHT_NOT_FOUND');
        });
        it('should extract novice essence (wisdom=5)', () => {
            const { insight } = system.gainInsight('d1', 'encounter'); // wisdom=5
            const r = system.extractWisdom(insight.id);
            expect(r.grade).toBe('novice');
            expect(r.extractedEssence).toBe(0); // floor(5*0.1)=0
        });
        it('should extract apprentice essence (wisdom=26)', () => {
            const s = new CultivationDreamCultivationInsight();
            // 2 breakthroughs (12 each) + bonus 2 = 26
            const { insight: i1 } = s.gainInsight('d1', 'breakthrough');
            const { insight: i2 } = s.gainInsight('d1', 'breakthrough');
            s.mergeInsights('d1', [i1.id, i2.id]);
            const r = s.extractWisdom(i1.id);
            expect(r.grade).toBe('apprentice');
            // floor(26*0.2)=5
            expect(r.extractedEssence).toBe(5);
        });
        it('should extract adept essence (wisdom=50)', () => {
            // 4 encounter (5 each) + bonus 2 = 22, not enough
            // Use custom: 4 breakthroughs (12 each) + bonus 2 = 50
            const { insight: i1 } = system.gainInsight('d1', 'breakthrough');
            const { insight: i2 } = system.gainInsight('d1', 'breakthrough');
            const { insight: i3 } = system.gainInsight('d1', 'breakthrough');
            const { insight: i4 } = system.gainInsight('d1', 'breakthrough');
            system.mergeInsights('d1', [i1.id, i2.id, i3.id, i4.id]);
            const r = system.extractWisdom(i1.id);
            expect(r.grade).toBe('adept');
            // floor(50*0.3)=15
            expect(r.extractedEssence).toBe(15);
        });
        it('should extract sage essence (wisdom>=100)', () => {
            // baseMergeBonus=100: 12+12+100=124 → sage
            const s = new CultivationDreamCultivationInsight({ baseMergeBonus: 100 });
            const { insight: i1 } = s.gainInsight('d1', 'breakthrough');
            const { insight: i2 } = s.gainInsight('d1', 'breakthrough');
            s.mergeInsights('d1', [i1.id, i2.id]);
            const r = s.extractWisdom(i1.id);
            expect(r.grade).toBe('sage');
            // floor(124*0.4)=49
            expect(r.extractedEssence).toBe(49);
        });
        it('should extract immortal essence (wisdom>=200)', () => {
            // baseMergeBonus=200: 12+12+200=224 → immortal
            const s = new CultivationDreamCultivationInsight({ baseMergeBonus: 200 });
            const { insight: i1 } = s.gainInsight('d1', 'breakthrough');
            const { insight: i2 } = s.gainInsight('d1', 'breakthrough');
            s.mergeInsights('d1', [i1.id, i2.id]);
            const r = s.extractWisdom(i1.id);
            expect(r.grade).toBe('immortal');
            // floor(224*0.5)=112
            expect(r.extractedEssence).toBe(112);
        });
        it('should reject double extraction', () => {
            const { insight } = system.gainInsight('d1', 'breakthrough');
            system.extractWisdom(insight.id);
            const r = system.extractWisdom(insight.id);
            expect(r.error).toBe('ALREADY_EXTRACTED');
        });
        it('should set state to extracted', () => {
            const { insight } = system.gainInsight('d1', 'breakthrough');
            system.extractWisdom(insight.id);
            const got = system.getInsight(insight.id);
            expect(got.state).toBe(INSIGHT_STATES.EXTRACTED);
        });
        it('should store extractedEssence on insight', () => {
            const { insight } = system.gainInsight('d1', 'breakthrough');
            system.extractWisdom(insight.id);
            const got = system.getInsight(insight.id);
            expect(got.extractedEssence).toBe(1);
        });
        it('should respect essenceCap', () => {
            const s = new CultivationDreamCultivationInsight({ baseMergeBonus: 100, essenceCap: 1 });
            const { insight: i1 } = s.gainInsight('d1', 'breakthrough');
            const { insight: i2 } = s.gainInsight('d1', 'breakthrough');
            s.mergeInsights('d1', [i1.id, i2.id]);
            const r = s.extractWisdom(i1.id);
            expect(r.extractedEssence).toBe(1);
        });
        it('should trigger wisdomExtracted hook', () => {
            let called = false;
            const { insight } = system.gainInsight('d1', 'breakthrough');
            system.registerHook('wisdomExtracted', () => { called = true; });
            system.extractWisdom(insight.id);
            expect(called).toBe(true);
        });
        it('should increment totalExtractions', () => {
            const { insight } = system.gainInsight('d1', 'breakthrough');
            system.extractWisdom(insight.id);
            expect(system.stats.totalExtractions).toBe(1);
        });
    });

    describe('calculateWisdomGrade', () => {
        it('should return null for missing', () => {
            expect(system.calculateWisdomGrade('ghost')).toBeNull();
        });
        it('should return novice for low wisdom', () => {
            const { insight } = system.gainInsight('d1', 'encounter');
            expect(system.calculateWisdomGrade(insight.id)).toBe('novice');
        });
    });

    describe('getDreamInsightSummary', () => {
        it('should return zeros for empty dream', () => {
            const s = system.getDreamInsightSummary('none');
            expect(s.insightCount).toBe(0);
            expect(s.totalWisdom).toBe(0);
        });
        it('should aggregate insights', () => {
            const { insight: i1 } = system.gainInsight('d1', 'breakthrough');
            system.gainInsight('d1', 'encounter');
            system.extractWisdom(i1.id);
            const s = system.getDreamInsightSummary('d1');
            expect(s.insightCount).toBe(2);
            expect(s.totalWisdom).toBe(12 + 5);
            expect(s.totalEssence).toBe(1);
        });
        it('should track max grade', () => {
            // Use sage-grade insight
            const s = new CultivationDreamCultivationInsight({ baseMergeBonus: 100 });
            const { insight: i1 } = s.gainInsight('d1', 'breakthrough');
            const { insight: i2 } = s.gainInsight('d1', 'breakthrough');
            s.mergeInsights('d1', [i1.id, i2.id]);
            const sum = s.getDreamInsightSummary('d1');
            expect(sum.maxGrade).toBe('sage');
        });
    });

    describe('registerTool / executeTool', () => {
        it('should register and execute', () => {
            system.registerTool('custom', () => 'ok');
            const r = system.executeTool('custom', {});
            expect(r.success).toBe(true);
            expect(r.result).toBe('ok');
        });
        it('should use empty object when context is undefined', () => {
            system.registerTool('custom', (ctx) => ctx);
            const r = system.executeTool('custom', undefined);
            expect(r.success).toBe(true);
            expect(r.result).toEqual({});
        });
        it('should use empty object when context is null', () => {
            system.registerTool('custom', (ctx) => ctx);
            const r = system.executeTool('custom', null);
            expect(r.success).toBe(true);
            expect(r.result).toEqual({});
        });
        it('should return error for unknown tool', () => {
            const r = system.executeTool('nope', {});
            expect(r.error).toBe('TOOL_NOT_FOUND');
        });
        it('should catch handler errors', () => {
            system.registerTool('boom', () => { throw new Error('x'); });
            const r = system.executeTool('boom', {});
            expect(r.error).toBe('x');
        });
    });

    describe('listTools', () => {
        it('should return default tool names', () => {
            expect(system.listTools().length).toBe(2);
        });
    });

    describe('registerHook', () => {
        it('should support multiple handlers', () => {
            let count = 0;
            system.registerHook('insightGained', () => { count++; });
            system.registerHook('insightGained', () => { count++; });
            system.gainInsight('d1', 'breakthrough');
            expect(count).toBe(2);
        });
        it('should return unsubscribe function', () => {
            let count = 0;
            const handler = () => { count++; };
            const unsub = system.registerHook('insightGained', handler);
            system.gainInsight('d1', 'breakthrough');
            unsub();
            system.gainInsight('d2', 'breakthrough');
            expect(count).toBe(1);
        });
        it('should swallow handler exceptions', () => {
            system.registerHook('insightGained', () => { throw new Error('x'); });
            expect(() => system.gainInsight('d1', 'breakthrough')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient gains', () => {
            expect(system.autoEvolve().evolved).toBe(false);
        });
        it('should evolve after 5 gains', () => {
            for (let i = 0; i < 5; i++) system.gainInsight(`d${i}`, 'breakthrough');
            expect(system.autoEvolve().evolved).toBe(true);
        });
        it('should not evolve twice', () => {
            for (let i = 0; i < 5; i++) system.gainInsight(`d${i}`, 'breakthrough');
            system.autoEvolve();
            const r = system.autoEvolve();
            expect(r.evolved).toBe(false);
            expect(r.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('toJSON / fromJSON', () => {
        it('should serialize insights', () => {
            system.gainInsight('d1', 'breakthrough');
            const json = system.toJSON();
            expect(json.insights.length).toBe(1);
        });
        it('should deserialize insights', () => {
            const s2 = new CultivationDreamCultivationInsight();
            s2.gainInsight('d1', 'breakthrough');
            const json = s2.toJSON();
            const s3 = new CultivationDreamCultivationInsight();
            s3.fromJSON(json);
            expect(s3.insights.size).toBe(1);
        });
        it('should restore stats', () => {
            const s2 = new CultivationDreamCultivationInsight();
            s2.gainInsight('d1', 'breakthrough');
            const json = s2.toJSON();
            const s3 = new CultivationDreamCultivationInsight();
            s3.fromJSON(json);
            expect(s3.stats.totalGains).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should include insightCount', () => {
            system.gainInsight('d1', 'breakthrough');
            const stats = system.getStats();
            expect(stats.insightCount).toBe(1);
        });
    });

    describe('module constants', () => {
        it('should expose SOURCE_KEYS with 3 keys', () => {
            expect(SOURCE_KEYS.length).toBe(3);
        });
        it('should expose WISDOM_THRESHOLDS with 5 entries', () => {
            expect(WISDOM_THRESHOLDS.length).toBe(5);
        });
        it('should expose WISDOM_GRADES with 5 entries', () => {
            expect(WISDOM_GRADES.length).toBe(5);
        });
        it('should expose EXTRACTION_RATES for all 5 grades', () => {
            for (const g of WISDOM_GRADES) {
                expect(EXTRACTION_RATES[g]).toBeDefined();
            }
        });
        it('should have INSIGHT_SOURCES entries for all keys', () => {
            for (const k of SOURCE_KEYS) {
                expect(INSIGHT_SOURCES[k]).toBeDefined();
            }
        });
    });
});
