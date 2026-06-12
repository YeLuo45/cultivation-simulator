/**
 * CultivationDreamOracle.test.js - 修真梦境神谕测试
 * V869 Iteration 3/30 Round 34 - 测试覆盖率目标: 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDreamOracle, ORACLE_TOPICS, ANSWER_TEMPLATES, CONFIDENCE_LEVELS } from '../../../systems/ai/CultivationDreamOracle.js';

describe('CultivationDreamOracle', () => {
    let system;
    beforeEach(() => { system = new CultivationDreamOracle(); });

    describe('exports', () => {
        it('should export constants', () => {
            expect(ORACLE_TOPICS.length).toBe(5);
            expect(ANSWER_TEMPLATES.length).toBe(8);
            expect(CONFIDENCE_LEVELS.length).toBe(5);
        });
    });

    describe('constructor', () => {
        it('should accept custom config', () => {
            const s = new CultivationDreamOracle({ maxOracles: 10, baseConfidence: 0.7 });
            expect(s.config.baseConfidence).toBe(0.7);
        });
    });

    describe('consultOracle', () => {
        it('should consult', () => {
            const { oracle } = system.consultOracle('d1', 'What lies ahead?');
            expect(oracle.dreamId).toBe('d1');
            expect(oracle.question).toBe('What lies ahead?');
            expect(oracle.answer).toBeDefined();
        });
        it('should reject empty question', () => {
            expect(system.consultOracle('d', '').error).toBe('INVALID_QUESTION');
        });
        it('should reject non-string', () => {
            expect(system.consultOracle('d', 123).error).toBe('INVALID_QUESTION');
        });
        it('should trigger hook', () => {
            let called = false;
            system.registerHook('oracleConsulted', () => { called = true; });
            system.consultOracle('d', 'Q?');
            expect(called).toBe(true);
        });
    });

    describe('interpretAnswer', () => {
        it('should interpret', () => {
            const { oracle } = system.consultOracle('d', 'Q?');
            const r = system.interpretAnswer(oracle.id);
            expect(r.interpretation).toContain('Interpretation');
        });
        it('should reject missing', () => {
            expect(system.interpretAnswer('ghost').error).toBe('ORACLE_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { oracle } = system.consultOracle('d', 'Q?');
            let called = false;
            system.registerHook('answerInterpreted', () => { called = true; });
            system.interpretAnswer(oracle.id);
            expect(called).toBe(true);
        });
    });

    describe('seekGuidance', () => {
        it('should seek', () => {
            const r = system.seekGuidance('d', 'cultivation');
            expect(r.success).toBe(true);
            expect(r.oracle.topic).toBe('cultivation');
        });
        it('should reject invalid topic', () => {
            expect(system.seekGuidance('d', 'invalid').error).toBe('INVALID_TOPIC');
        });
        it('should trigger hook', () => {
            let called = false;
            system.registerHook('guidanceSought', () => { called = true; });
            system.seekGuidance('d', 'wealth');
            expect(called).toBe(true);
        });
        it('should support all topics', () => {
            for (const t of ORACLE_TOPICS) {
                expect(system.seekGuidance('d', t).success).toBe(true);
            }
        });
    });

    describe('list methods', () => {
        it('listOracles', () => {
            system.consultOracle('d', 'Q?');
            expect(system.listOracles().length).toBe(1);
        });
        it('listByTopic', () => {
            system.seekGuidance('d', 'wealth');
            expect(system.listByTopic('wealth').length).toBe(1);
        });
        it('listByDream', () => {
            system.consultOracle('d1', 'Q?');
            expect(system.listByDream('d1').length).toBe(1);
        });
        it('listInterpreted', () => {
            const { oracle } = system.consultOracle('d', 'Q?');
            system.interpretAnswer(oracle.id);
            expect(system.listInterpreted().length).toBe(1);
        });
    });

    describe('raiseConfidence', () => {
        it('should raise', () => {
            const { oracle } = system.consultOracle('d', 'Q?');
            const before = oracle.confidence;
            system.raiseConfidence(oracle.id, 0.2);
            expect(oracle.confidence).toBeGreaterThanOrEqual(before);
        });
        it('should cap at 1', () => {
            const { oracle } = system.consultOracle('d', 'Q?');
            system.raiseConfidence(oracle.id, 5);
            expect(oracle.confidence).toBe(1);
        });
        it('should reject missing', () => {
            expect(system.raiseConfidence('ghost').error).toBe('ORACLE_NOT_FOUND');
        });
    });

    describe('getConfidenceLevelName', () => {
        it('should map', () => {
            expect(system.getConfidenceLevelName(0.1)).toBe(CONFIDENCE_LEVELS[0]);
            expect(system.getConfidenceLevelName(0.9)).toBe(CONFIDENCE_LEVELS[CONFIDENCE_LEVELS.length - 1]);
        });
        it('should handle non-number', () => {
            expect(system.getConfidenceLevelName(null)).toBe(CONFIDENCE_LEVELS[0]);
        });
    });

    describe('deleteOracle', () => {
        it('should delete', () => {
            const { oracle } = system.consultOracle('d', 'Q?');
            expect(system.deleteOracle(oracle.id).success).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.deleteOracle('ghost').error).toBe('ORACLE_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { oracle } = system.consultOracle('d', 'Q?');
            let called = false;
            system.registerHook('oracleDeleted', () => { called = true; });
            system.deleteOracle(oracle.id);
            expect(called).toBe(true);
        });
    });

    describe('tools and hooks', () => {
        it('should execute default tool', () => {
            const { oracle } = system.consultOracle('d', 'Q?');
            const r = system.executeTool('getOracle', { oracleId: oracle.id });
            expect(r.success).toBe(true);
        });
        it('should handle missing tool', () => {
            expect(system.executeTool('ghost').error).toBe('TOOL_NOT_FOUND');
        });
        it('should handle exception', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            expect(system.executeTool('bad').error).toBe('x');
        });
        it('should handle missing context for default tool', () => {
            const r = system.executeTool('getOracle');
            expect(r.success).toBe(true);
            expect(r.result).toBeNull();
        });
        it('should list tools', () => {
            expect(system.listTools().length).toBe(2);
        });
        it('should unregister hook', () => {
            let count = 0;
            const off = system.registerHook('oracleConsulted', () => { count++; });
            system.consultOracle('d', 'Q?');
            off();
            system.consultOracle('d', 'Q?');
            expect(count).toBe(1);
        });
        it('should catch handler errors', () => {
            system.registerHook('oracleConsulted', () => { throw new Error('x'); });
            expect(() => system.consultOracle('d', 'Q?')).not.toThrow();
        });
    });

    describe('toJSON/fromJSON', () => {
        it('should round trip', () => {
            system.consultOracle('d', 'Q?');
            const json = system.toJSON();
            const s2 = new CultivationDreamOracle();
            expect(s2.fromJSON(json).success).toBe(true);
        });
        it('should handle empty fromJSON', () => {
            const s2 = new CultivationDreamOracle();
            expect(s2.fromJSON({}).success).toBe(true);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.consultOracle('d', 'Q?');
            const stats = system.getStats();
            expect(stats.totalConsulted).toBe(1);
            expect(stats.oracleCount).toBe(1);
        });
    });
});
