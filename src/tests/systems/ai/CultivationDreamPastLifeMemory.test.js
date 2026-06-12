/**
 * CultivationDreamPastLifeMemory.test.js - 修真前世记忆测试
 * V872 Iteration 6/30 Round 34 - 测试覆盖率目标: 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDreamPastLifeMemory, MEMORY_ERAS, FRAGMENT_TYPES, SYNTHESIS_RULES } from '../../../systems/ai/CultivationDreamPastLifeMemory.js';

describe('CultivationDreamPastLifeMemory', () => {
    let system;
    beforeEach(() => { system = new CultivationDreamPastLifeMemory(); });

    describe('exports', () => {
        it('should export constants', () => {
            expect(MEMORY_ERAS.length).toBe(3);
            expect(FRAGMENT_TYPES.length).toBe(6);
            expect(SYNTHESIS_RULES.length).toBe(5);
        });
    });

    describe('constructor', () => {
        it('should accept custom config', () => {
            const s = new CultivationDreamPastLifeMemory({ maxMemories: 5, fragmentCount: 6 });
            expect(s.config.fragmentCount).toBe(6);
        });
    });

    describe('recoverMemory', () => {
        it('should recover', () => {
            const { memory } = system.recoverMemory('d1', 'ancient');
            expect(memory.dreamId).toBe('d1');
            expect(memory.era).toBe('ancient');
            expect(memory.memoryFragments.length).toBe(4);
        });
        it('should reject invalid era', () => {
            expect(system.recoverMemory('d', 'invalid').error).toBe('INVALID_ERA');
        });
        it('should trigger hook', () => {
            let called = false;
            system.registerHook('memoryRecovered', () => { called = true; });
            system.recoverMemory('d', 'classical');
            expect(called).toBe(true);
        });
        it('should support all eras', () => {
            for (const e of MEMORY_ERAS) {
                expect(system.recoverMemory('d', e).success).toBe(true);
            }
        });
    });

    describe('linkMemory', () => {
        it('should link', () => {
            const { memory } = system.recoverMemory('d', 'ancient');
            const r = system.linkMemory(memory.id, 'currentLife');
            expect(r.linkScore).toBeGreaterThan(0);
        });
        it('should reject missing', () => {
            expect(system.linkMemory('ghost', 'life').error).toBe('MEMORY_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { memory } = system.recoverMemory('d', 'ancient');
            let called = false;
            system.registerHook('memoryLinked', () => { called = true; });
            system.linkMemory(memory.id, 'life');
            expect(called).toBe(true);
        });
    });

    describe('synthesizeMemories', () => {
        it('should synthesize', () => {
            const { memory: m1 } = system.recoverMemory('d', 'ancient');
            const { memory: m2 } = system.recoverMemory('d', 'classical');
            const r = system.synthesizeMemories([m1.id, m2.id]);
            expect(r.count).toBe(2);
        });
        it('should reject empty', () => {
            expect(system.synthesizeMemories([]).error).toBe('INVALID_INPUT');
        });
        it('should reject non-array', () => {
            expect(system.synthesizeMemories('x').error).toBe('INVALID_INPUT');
        });
        it('should reject no valid', () => {
            expect(system.synthesizeMemories(['ghost']).error).toBe('NO_VALID_MEMORIES');
        });
        it('should trigger hook', () => {
            const { memory: m1 } = system.recoverMemory('d', 'ancient');
            let called = false;
            system.registerHook('memoriesSynthesized', () => { called = true; });
            system.synthesizeMemories([m1.id]);
            expect(called).toBe(true);
        });
    });

    describe('list methods', () => {
        it('listMemories', () => {
            system.recoverMemory('d', 'ancient');
            expect(system.listMemories().length).toBe(1);
        });
        it('listByEra', () => {
            system.recoverMemory('d', 'ancient');
            system.recoverMemory('d', 'modern');
            expect(system.listByEra('ancient').length).toBe(1);
        });
        it('listByDream', () => {
            system.recoverMemory('d1', 'ancient');
            expect(system.listByDream('d1').length).toBe(1);
        });
        it('listSynthesized', () => {
            const { memory } = system.recoverMemory('d', 'ancient');
            system.synthesizeMemories([memory.id]);
            expect(system.listSynthesized().length).toBe(1);
        });
    });

    describe('addFragment', () => {
        it('should add', () => {
            const { memory } = system.recoverMemory('d', 'ancient');
            const r = system.addFragment(memory.id, 'emotional');
            expect(r.success).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.addFragment('ghost', 'emotional').error).toBe('MEMORY_NOT_FOUND');
        });
        it('should reject invalid', () => {
            const { memory } = system.recoverMemory('d', 'ancient');
            expect(system.addFragment(memory.id, 'invalid').error).toBe('INVALID_FRAGMENT');
        });
    });

    describe('raiseLinkScore', () => {
        it('should raise', () => {
            const { memory } = system.recoverMemory('d', 'ancient');
            system.linkMemory(memory.id, 'life');
            system.raiseLinkScore(memory.id, 0.2);
            expect(memory.linkScore).toBeGreaterThan(0);
        });
        it('should cap at 1', () => {
            const { memory } = system.recoverMemory('d', 'ancient');
            system.raiseLinkScore(memory.id, 5);
            expect(memory.linkScore).toBe(1);
        });
        it('should reject missing', () => {
            expect(system.raiseLinkScore('ghost').error).toBe('MEMORY_NOT_FOUND');
        });
    });

    describe('deleteMemory', () => {
        it('should delete', () => {
            const { memory } = system.recoverMemory('d', 'ancient');
            expect(system.deleteMemory(memory.id).success).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.deleteMemory('ghost').error).toBe('MEMORY_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { memory } = system.recoverMemory('d', 'ancient');
            let called = false;
            system.registerHook('memoryDeleted', () => { called = true; });
            system.deleteMemory(memory.id);
            expect(called).toBe(true);
        });
    });

    describe('tools and hooks', () => {
        it('should execute default tool', () => {
            const { memory } = system.recoverMemory('d', 'ancient');
            const r = system.executeTool('getMemory', { memoryId: memory.id });
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
            const r = system.executeTool('getMemory');
            expect(r.success).toBe(true);
            expect(r.result).toBeNull();
        });
        it('should list tools', () => {
            expect(system.listTools().length).toBe(2);
        });
        it('should unregister hook', () => {
            let count = 0;
            const off = system.registerHook('memoryRecovered', () => { count++; });
            system.recoverMemory('d', 'ancient');
            off();
            system.recoverMemory('d', 'ancient');
            expect(count).toBe(1);
        });
        it('should catch handler errors', () => {
            system.registerHook('memoryRecovered', () => { throw new Error('x'); });
            expect(() => system.recoverMemory('d', 'ancient')).not.toThrow();
        });
    });

    describe('toJSON/fromJSON', () => {
        it('should round trip', () => {
            system.recoverMemory('d', 'ancient');
            const json = system.toJSON();
            const s2 = new CultivationDreamPastLifeMemory();
            expect(s2.fromJSON(json).success).toBe(true);
        });
        it('should handle empty fromJSON', () => {
            const s2 = new CultivationDreamPastLifeMemory();
            expect(s2.fromJSON({}).success).toBe(true);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recoverMemory('d', 'ancient');
            const stats = system.getStats();
            expect(stats.totalRecovered).toBe(1);
            expect(stats.memoryCount).toBe(1);
        });
    });
});
