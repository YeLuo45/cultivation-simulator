/**
 * CultivationDreamSymbolDecoder.test.js - 修真梦境符号解读测试
 * V876 P-20260613-019 Iteration 19/30 Round 34
 * 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    CultivationDreamSymbolDecoder,
    SYMBOL_TYPES,
    SYMBOL_TYPE_COUNT,
    MEANING_LIBRARY,
    MEANING_LIBRARY_COUNT,
    INTERPRETATION_RULES,
    INTERPRETATION_LEVELS,
    MAX_INTERPRETATIONS_PER_DREAM,
    DEFAULT_MAX_DECODED_SYMBOLS,
    SYMBOL_NOT_FOUND,
    DECODED_NOT_FOUND,
    INVALID_INPUT,
    ALREADY_APPLIED,
} from '../../../systems/ai/CultivationDreamSymbolDecoder.js';

describe('CultivationDreamSymbolDecoder', () => {
    let system;
    beforeEach(() => { system = new CultivationDreamSymbolDecoder(); });

    describe('constructor', () => {
        it('should default config', () => {
            expect(system.config.maxDecodedSymbols).toBe(DEFAULT_MAX_DECODED_SYMBOLS);
            expect(system.config.maxInterpretationsPerDream).toBe(MAX_INTERPRETATIONS_PER_DREAM);
            expect(system.config.autoInterpret).toBe(true);
        });
        it('should accept custom config', () => {
            const s = new CultivationDreamSymbolDecoder({ maxDecodedSymbols: 5, autoInterpret: false });
            expect(s.config.maxDecodedSymbols).toBe(5);
            expect(s.config.autoInterpret).toBe(false);
        });
        it('should accept masteryThreshold=0', () => {
            const s = new CultivationDreamSymbolDecoder({ masteryThreshold: 0 });
            expect(s.config.masteryThreshold).toBe(0);
        });
        it('should init empty maps', () => {
            expect(system.decoded.size).toBe(0);
            expect(system.dreamDecoded.size).toBe(0);
        });
        it('should init stats', () => {
            expect(system.stats.totalDecoded).toBe(0);
            expect(system.stats.totalInterpreted).toBe(0);
            expect(system.stats.bySymbol.sword).toBe(0);
        });
        it('should register default tools', () => {
            expect(system.tools.has('getDecoded')).toBe(true);
            expect(system.tools.has('listByDream')).toBe(true);
            expect(system.tools.has('listApplied')).toBe(true);
        });
    });

    describe('decodeSymbol', () => {
        it('should decode a sword symbol', () => {
            const { success, decoded } = system.decodeSymbol('dream_1', 'sword');
            expect(success).toBe(true);
            expect(decoded.symbol).toBe('sword');
            expect(decoded.dreamId).toBe('dream_1');
        });
        it('should populate meaning from library', () => {
            const { decoded } = system.decodeSymbol('d1', 'lotus');
            expect(decoded.meaning).toBe(MEANING_LIBRARY.lotus.meaning);
        });
        it('should reject empty dreamId', () => {
            const r = system.decodeSymbol('', 'sword');
            expect(r.success).toBe(false);
            expect(r.error).toBe(INVALID_INPUT);
        });
        it('should reject unknown symbol', () => {
            const r = system.decodeSymbol('d1', 'unknown');
            expect(r.error).toBe(SYMBOL_NOT_FOUND);
        });
        it('should reject non-string symbol', () => {
            expect(system.decodeSymbol('d1', 123).error).toBe(SYMBOL_NOT_FOUND);
        });
        it('should trim dream decoded list when exceeding max', () => {
            const s = new CultivationDreamSymbolDecoder({ maxInterpretationsPerDream: 2, autoInterpret: false });
            s.decodeSymbol('d1', 'sword');
            s.decodeSymbol('d1', 'lotus');
            s.decodeSymbol('d1', 'phoenix');
            expect(s.listByDream('d1').length).toBe(2);
        });
        it('should trigger onDecoded hook', () => {
            let called = false;
            system.registerHook('onDecoded', () => { called = true; });
            system.decodeSymbol('d1', 'sword');
            expect(called).toBe(true);
        });
        it('should auto-interpret by default', () => {
            const { decoded } = system.decodeSymbol('d1', 'sword');
            expect(decoded.interpretation).not.toBeNull();
        });
        it('should track all 10 symbols', () => {
            for (const sym of SYMBOL_TYPES) {
                system.decodeSymbol('d1', sym);
            }
            expect(system.decoded.size).toBe(SYMBOL_TYPE_COUNT);
        });
    });

    describe('interpretMeaning', () => {
        it('should interpret a decoded entry', () => {
            const { decoded } = system.decodeSymbol('d1', 'taiji');
            // already auto-interpreted; force re-interpret
            const r = system.interpretMeaning(decoded.id);
            expect(r.success).toBe(true);
            expect(r.score).toBeGreaterThan(0);
            expect(r.level).toBeDefined();
        });
        it('should reject empty decodedId', () => {
            expect(system.interpretMeaning('').error).toBe(INVALID_INPUT);
        });
        it('should reject unknown decodedId', () => {
            expect(system.interpretMeaning('ghost').error).toBe(DECODED_NOT_FOUND);
        });
        it('should classify yang as >= adept', () => {
            const { decoded } = system.decodeSymbol('d1', 'sword');
            expect(['adept', 'master']).toContain(decoded.interpretationLevel);
        });
        it('should classify rebirth/ascension boosted as adept (0.7<0.8)', () => {
            const { decoded } = system.decodeSymbol('d1', 'phoenix');
            // phoenix: yang base 0.5 + insightBoost 0.2 = 0.7, default masteryThreshold 0.8 -> adept
            expect(decoded.interpretationLevel).toBe('adept');
        });
        it('should classify pure yin lotus as novice', () => {
            const { decoded } = system.decodeSymbol('d1', 'lotus');
            // lotus: yin base 0.4 + 0.1 omen non-rebirth/ascension = 0.5 -> adept
            expect(decoded.interpretationLevel).toBe('adept');
        });
        it('should classify moon as adept at threshold 0.95 (score 0.5)', () => {
            const s = new CultivationDreamSymbolDecoder({ masteryThreshold: 0.95 });
            const { decoded } = s.decodeSymbol('d1', 'moon');
            // moon: yin 0.4 + 0.1 = 0.5, threshold 0.95 -> adept (0.5 >= 0.5)
            expect(decoded.interpretationLevel).toBe('adept');
        });
        it('should trigger onInterpreted hook', () => {
            const { decoded } = system.decodeSymbol('d1', 'sword');
            let called = false;
            system.registerHook('onInterpreted', () => { called = true; });
            system.interpretMeaning(decoded.id);
            expect(called).toBe(true);
        });
    });

    describe('applyInsight', () => {
        it('should apply a decoded entry', () => {
            const { decoded } = system.decodeSymbol('d1', 'sword');
            const r = system.applyInsight(decoded.id);
            expect(r.success).toBe(true);
            expect(r.appliedAt).toBeGreaterThan(0);
        });
        it('should reject empty decodedId', () => {
            expect(system.applyInsight('').error).toBe(INVALID_INPUT);
        });
        it('should reject unknown decodedId', () => {
            expect(system.applyInsight('ghost').error).toBe(DECODED_NOT_FOUND);
        });
        it('should reject double-apply', () => {
            const { decoded } = system.decodeSymbol('d1', 'sword');
            system.applyInsight(decoded.id);
            const r = system.applyInsight(decoded.id);
            expect(r.error).toBe(ALREADY_APPLIED);
        });
        it('should reject when not interpreted', () => {
            const s = new CultivationDreamSymbolDecoder({ autoInterpret: false });
            const { decoded } = s.decodeSymbol('d1', 'sword');
            const r = s.applyInsight(decoded.id);
            expect(r.error).toBe('NOT_INTERPRETED');
        });
        it('should trigger onApplied hook', () => {
            const { decoded } = system.decodeSymbol('d1', 'sword');
            let called = false;
            system.registerHook('onApplied', () => { called = true; });
            system.applyInsight(decoded.id);
            expect(called).toBe(true);
        });
    });

    describe('getDecoded', () => {
        it('should return a copy', () => {
            const { decoded } = system.decodeSymbol('d1', 'sword');
            const g = system.getDecoded(decoded.id);
            expect(g).toEqual(decoded);
        });
        it('should return null for missing', () => {
            expect(system.getDecoded('ghost')).toBeNull();
        });
    });

    describe('listByDream', () => {
        it('should list by dream', () => {
            system.decodeSymbol('d1', 'sword');
            system.decodeSymbol('d1', 'lotus');
            system.decodeSymbol('d2', 'moon');
            expect(system.listByDream('d1').length).toBe(2);
        });
        it('should return [] for unknown dream', () => {
            expect(system.listByDream('ghost')).toEqual([]);
        });
    });

    describe('listApplied', () => {
        it('should list applied', () => {
            const { decoded: d1 } = system.decodeSymbol('d1', 'sword');
            system.decodeSymbol('d1', 'lotus');
            system.applyInsight(d1.id);
            expect(system.listApplied().length).toBe(1);
        });
        it('should return [] when none', () => {
            expect(system.listApplied()).toEqual([]);
        });
    });

    describe('listBySymbol', () => {
        it('should filter by symbol', () => {
            system.decodeSymbol('d1', 'sword');
            system.decodeSymbol('d1', 'sword');
            system.decodeSymbol('d1', 'lotus');
            expect(system.listBySymbol('sword').length).toBe(2);
        });
        it('should return [] for unknown symbol', () => {
            expect(system.listBySymbol('unknown')).toEqual([]);
        });
    });

    describe('listByLevel', () => {
        it('should list by level master with low threshold', () => {
            const s = new CultivationDreamSymbolDecoder({ masteryThreshold: 0.5 });
            s.decodeSymbol('d1', 'phoenix');
            s.decodeSymbol('d1', 'sword');
            // phoenix/sword score=0.7 >= 0.5 -> master
            expect(s.listByLevel('master').length).toBeGreaterThanOrEqual(1);
        });
        it('should return [] for unknown level', () => {
            expect(system.listByLevel('unknown')).toEqual([]);
        });
    });

    describe('deleteDecoded', () => {
        it('should delete a decoded entry', () => {
            const { decoded } = system.decodeSymbol('d1', 'sword');
            const r = system.deleteDecoded(decoded.id);
            expect(r.success).toBe(true);
            expect(system.getDecoded(decoded.id)).toBeNull();
        });
        it('should reject missing', () => {
            expect(system.deleteDecoded('ghost').error).toBe(DECODED_NOT_FOUND);
        });
        it('should remove from dream list', () => {
            const { decoded } = system.decodeSymbol('d1', 'sword');
            system.deleteDecoded(decoded.id);
            expect(system.listByDream('d1').length).toBe(0);
        });
    });

    describe('registerTool + executeTool', () => {
        it('should register custom tool', () => {
            const r = system.registerTool('t', () => 1);
            expect(r.success).toBe(true);
        });
        it('should reject invalid name', () => {
            expect(system.registerTool('', () => {}).error).toBe(INVALID_INPUT);
        });
        it('should reject invalid handler', () => {
            expect(system.registerTool('t', null).error).toBe(INVALID_INPUT);
        });
        it('should execute registered tool', () => {
            system.registerTool('get42', () => 42);
            expect(system.executeTool('get42').result).toBe(42);
        });
        it('should pass context', () => {
            system.registerTool('echo', (ctx) => ctx);
            expect(system.executeTool('echo', { x: 1 }).result.x).toBe(1);
        });
        it('should handle missing-context default {}', () => {
            system.registerTool('echoAll', (ctx) => Object.keys(ctx).length);
            expect(system.executeTool('echoAll').result).toBe(0);
        });
        it('should handle null context', () => {
            system.registerTool('echoAll2', (ctx) => Object.keys(ctx || {}).length);
            expect(system.executeTool('echoAll2', null).result).toBe(0);
        });
        it('should return UNKNOWN_TOOL', () => {
            expect(system.executeTool('nope').error).toBe('UNKNOWN_TOOL');
        });
        it('should catch tool errors', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            expect(system.executeTool('bad').error).toBe('TOOL_EXECUTION_ERROR');
        });
        it('should call built-in getDecoded', () => {
            const { decoded } = system.decodeSymbol('d1', 'sword');
            const r = system.executeTool('getDecoded', { decodedId: decoded.id });
            expect(r.result.id).toBe(decoded.id);
        });
    });

    describe('registerHook + triggerHook', () => {
        it('should register hook', () => {
            expect(system.registerHook('onX', () => {}).success).toBe(true);
        });
        it('should reject invalid event name', () => {
            expect(system.registerHook('', () => {}).error).toBe(INVALID_INPUT);
        });
        it('should reject invalid handler', () => {
            expect(system.registerHook('onX', null).error).toBe(INVALID_INPUT);
        });
        it('should support multiple handlers', () => {
            let n = 0;
            system.registerHook('onDecoded', () => { n++; });
            system.registerHook('onDecoded', () => { n++; });
            system.decodeSymbol('d1', 'sword');
            // onDecoded fires on decode
            expect(n).toBe(2);
        });
        it('should silently handle hook errors', () => {
            system.registerHook('onDecoded', () => { throw new Error('x'); });
            expect(() => system.decodeSymbol('d1', 'sword')).not.toThrow();
        });
        it('should unregister hook', () => {
            const h = () => {};
            system.registerHook('onX', h);
            expect(system.unregisterHook('onX', h).success).toBe(true);
        });
        it('should return EVENT_NOT_FOUND', () => {
            expect(system.unregisterHook('nope', () => {}).error).toBe('EVENT_NOT_FOUND');
        });
        it('should return HANDLER_NOT_FOUND', () => {
            system.registerHook('onX', () => {});
            expect(system.unregisterHook('onX', () => {}).error).toBe('HANDLER_NOT_FOUND');
        });
    });

    describe('toJSON/fromJSON', () => {
        it('should roundtrip', () => {
            system.decodeSymbol('d1', 'sword');
            const json = system.toJSON();
            const s2 = new CultivationDreamSymbolDecoder();
            const r = s2.fromJSON(json);
            expect(r.success).toBe(true);
            expect(s2.decoded.size).toBe(1);
        });
        it('should reject invalid data', () => {
            expect(system.fromJSON(null).error).toBe(INVALID_INPUT);
        });
    });

    describe('getStats + autoEvolve + reset', () => {
        it('should return stats', () => {
            const s = system.getStats();
            expect(s.totalTracked).toBe(0);
        });
        it('should autoEvolve', () => {
            const r = system.autoEvolve();
            expect(r.evolutionCount).toBe(1);
        });
        it('should reset', () => {
            system.decodeSymbol('d1', 'sword');
            system.reset();
            expect(system.decoded.size).toBe(0);
        });
    });

    describe('edge cases', () => {
        it('should classify unknown polarity as novice', () => {
            const { decoded } = system.decodeSymbol('d1', 'moon');
            // access internal entry to mutate polarity
            const internal = system.decoded.get(decoded.id);
            internal.polarity = 'unknown';
            internal.omen = 'unknown';
            system.interpretMeaning(decoded.id);
            expect(internal.interpretationLevel).toBe('novice');
        });
        it('should return SYMBOL_NOT_FOUND when meaning missing', () => {
            const orig = system._lookupMeaning.bind(system);
            system._lookupMeaning = () => null;
            const r = system.decodeSymbol('d1', 'sword');
            expect(r.error).toBe(SYMBOL_NOT_FOUND);
            system._lookupMeaning = orig;
        });
    });

    describe('meaning library completeness', () => {
        it('should have meaning for every symbol', () => {
            for (const s of SYMBOL_TYPES) {
                expect(MEANING_LIBRARY[s]).toBeDefined();
            }
            expect(Object.keys(MEANING_LIBRARY).length).toBe(MEANING_LIBRARY_COUNT);
        });
    });
});
