/**
 * SectLegacy.test.js - 宗门传承测试
 * V471 Iteration 3/15 Round 18 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectLegacy } from '../../../systems/ai/SectLegacy.js';

describe('SectLegacy', () => {
    let system;
    beforeEach(() => { system = new SectLegacy(); });

    describe('establishLegacy', () => {
        it('should create with sectId, founderId and name', () => {
            const { legacy } = system.establishLegacy({ sectId: 's1', founderId: 'f1', name: 'Eternal Flame' });
            expect(legacy.sectId).toBe('s1');
            expect(legacy.founderId).toBe('f1');
            expect(legacy.name).toBe('Eternal Flame');
        });

        it('should default name to "Unnamed Legacy"', () => {
            const { legacy } = system.establishLegacy({});
            expect(legacy.name).toBe('Unnamed Legacy');
        });

        it('should default generations to 1', () => {
            const { legacy } = system.establishLegacy({});
            expect(legacy.generations).toBe(1);
        });

        it('should default status to "growing"', () => {
            const { legacy } = system.establishLegacy({});
            expect(legacy.status).toBe('growing');
        });

        it('should use provided id', () => {
            const { legacy } = system.establishLegacy({ id: 'my_legacy' });
            expect(legacy.legacyId).toBe('my_legacy');
        });

        it('should start with empty achievements array', () => {
            const { legacy } = system.establishLegacy({});
            expect(legacy.achievements).toEqual([]);
        });

        it('should copy provided achievements', () => {
            const { legacy } = system.establishLegacy({ achievements: ['a1', 'a2'] });
            expect(legacy.achievements).toEqual(['a1', 'a2']);
        });

        it('should trigger legacyEstablished hook', () => {
            let called = false;
            system.registerHook('legacyEstablished', () => { called = true; });
            system.establishLegacy({});
            expect(called).toBe(true);
        });

        it('should respect config baseGenerations', () => {
            const custom = new SectLegacy({ baseGenerations: 5 });
            const { legacy } = custom.establishLegacy({});
            expect(legacy.generations).toBe(5);
        });

        it('should increment totalLegacies stats', () => {
            expect(system.stats.totalLegacies).toBe(0);
            system.establishLegacy({});
            expect(system.stats.totalLegacies).toBe(1);
        });
    });

    describe('getLegacy', () => {
        it('should return legacy', () => {
            const { legacy } = system.establishLegacy({});
            expect(system.getLegacy(legacy.legacyId)).not.toBeNull();
        });

        it('should return a copy with achievements array', () => {
            const { legacy } = system.establishLegacy({});
            const got = system.getLegacy(legacy.legacyId);
            expect(got.achievements).toEqual([]);
        });

        it('should return null for missing', () => {
            expect(system.getLegacy('ghost')).toBeNull();
        });
    });

    describe('listLegacies', () => {
        it('should list all', () => {
            system.establishLegacy({});
            expect(system.listLegacies().length).toBe(1);
        });

        it('should return empty when no legacies', () => {
            expect(system.listLegacies().length).toBe(0);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.establishLegacy({ sectId: 's1' });
            system.establishLegacy({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });

        it('should return empty for unknown sect', () => {
            system.establishLegacy({ sectId: 's1' });
            expect(system.listBySect('ghost').length).toBe(0);
        });
    });

    describe('listByGeneration', () => {
        it('should filter by min generations', () => {
            system.establishLegacy({ generations: 1 });
            system.establishLegacy({ generations: 5 });
            system.establishLegacy({ generations: 10 });
            expect(system.listByGeneration(5).length).toBe(2);
        });

        it('should include all when min=1', () => {
            system.establishLegacy({ generations: 1 });
            system.establishLegacy({ generations: 3 });
            expect(system.listByGeneration(1).length).toBe(2);
        });

        it('should return empty when none match', () => {
            system.establishLegacy({ generations: 1 });
            expect(system.listByGeneration(100).length).toBe(0);
        });
    });

    describe('addAchievement', () => {
        it('should add achievement to legacy', () => {
            const { legacy } = system.establishLegacy({});
            system.addAchievement(legacy.legacyId, 'First Sword');
            expect(legacy.achievements).toContain('First Sword');
        });

        it('should add multiple achievements', () => {
            const { legacy } = system.establishLegacy({});
            system.addAchievement(legacy.legacyId, 'a1');
            system.addAchievement(legacy.legacyId, 'a2');
            expect(legacy.achievements.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addAchievement('ghost', 'a1');
            expect(result.error).toBe('LEGACY_NOT_FOUND');
        });

        it('should trigger achievementAdded hook', () => {
            const { legacy } = system.establishLegacy({});
            let called = false;
            system.registerHook('achievementAdded', () => { called = true; });
            system.addAchievement(legacy.legacyId, 'a1');
            expect(called).toBe(true);
        });
    });

    describe('increaseGeneration', () => {
        it('should increase generation by 1', () => {
            const { legacy } = system.establishLegacy({});
            system.increaseGeneration(legacy.legacyId);
            expect(legacy.generations).toBe(2);
        });

        it('should increase generation multiple times', () => {
            const { legacy } = system.establishLegacy({});
            system.increaseGeneration(legacy.legacyId);
            system.increaseGeneration(legacy.legacyId);
            system.increaseGeneration(legacy.legacyId);
            expect(legacy.generations).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.increaseGeneration('ghost');
            expect(result.error).toBe('LEGACY_NOT_FOUND');
        });

        it('should trigger generationIncreased hook', () => {
            const { legacy } = system.establishLegacy({});
            let called = false;
            system.registerHook('generationIncreased', () => { called = true; });
            system.increaseGeneration(legacy.legacyId);
            expect(called).toBe(true);
        });
    });

    describe('preserveLegacy', () => {
        it('should set status to eternal', () => {
            const { legacy } = system.establishLegacy({});
            system.preserveLegacy(legacy.legacyId);
            expect(legacy.status).toBe('eternal');
        });

        it('should reject missing', () => {
            const result = system.preserveLegacy('ghost');
            expect(result.error).toBe('LEGACY_NOT_FOUND');
        });

        it('should trigger legacyPreserved hook', () => {
            const { legacy } = system.establishLegacy({});
            let called = false;
            system.registerHook('legacyPreserved', () => { called = true; });
            system.preserveLegacy(legacy.legacyId);
            expect(called).toBe(true);
        });
    });

    describe('calculateLegacyValue', () => {
        it('should calculate with default values', () => {
            // generations=1, achievements=0 => 1*100 + 0*50 = 100
            const { legacy } = system.establishLegacy({});
            expect(system.calculateLegacyValue(legacy.legacyId)).toBe(100);
        });

        it('should include achievement count', () => {
            const { legacy } = system.establishLegacy({});
            system.addAchievement(legacy.legacyId, 'a1');
            system.addAchievement(legacy.legacyId, 'a2');
            // generations=1, achievements=2 => 1*100 + 2*50 = 200
            expect(system.calculateLegacyValue(legacy.legacyId)).toBe(200);
        });

        it('should reflect generation count', () => {
            const { legacy } = system.establishLegacy({ generations: 3 });
            // generations=3, achievements=0 => 3*100 + 0*50 = 300
            expect(system.calculateLegacyValue(legacy.legacyId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateLegacyValue('ghost')).toBe(0);
        });
    });

    describe('Tool System', () => {
        it('should register tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute tool', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const result = system.executeTool('test', { value: 42 });
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle errors', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('x');
        });

        it('should execute default getLegacy', () => {
            const result = system.executeTool('getLegacy', { legacyId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('legacyEstablished', () => count++);
            unregister();
            system.establishLegacy({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('legacyEstablished', () => { throw new Error('x'); });
            expect(() => system.establishLegacy({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalLegacies = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalLegacies = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.establishLegacy({});
            const json = system.toJSON();
            expect(json.legacies.length).toBe(1);
        });
        it('should deserialize', () => {
            system.establishLegacy({});
            const json = system.toJSON();
            const newSys = new SectLegacy();
            newSys.fromJSON(json);
            expect(newSys.legacies.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.legacyCount).toBe(0);
        });
    });
});
