/**
 * MusicCultivation.test.js - 音律修炼测试
 * V424 Iteration 1/15 Round 15 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MusicCultivation } from '../../../systems/ai/MusicCultivation.js';

describe('MusicCultivation', () => {
    let system;
    beforeEach(() => { system = new MusicCultivation(); });

    describe('composeMusic', () => {
        it('should compose', () => {
            const { composition } = system.composeMusic({ cultivatorId: 'c1', name: 'Spring Dawn' });
            expect(composition.cultivatorId).toBe('c1');
            expect(composition.name).toBe('Spring Dawn');
        });

        it('should trigger musicComposed hook', () => {
            let called = false;
            system.registerHook('musicComposed', () => { called = true; });
            system.composeMusic({});
            expect(called).toBe(true);
        });
    });

    describe('getComposition', () => {
        it('should return', () => {
            const { composition } = system.composeMusic({});
            expect(system.getComposition(composition.compositionId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getComposition('ghost')).toBeNull(); });
    });

    describe('listCompositions', () => {
        it('should list all', () => {
            system.composeMusic({});
            expect(system.listCompositions().length).toBe(1);
        });
    });

    describe('listByInstrument', () => {
        it('should filter', () => {
            system.composeMusic({ instrument: 'guzheng' });
            system.composeMusic({ instrument: 'xiao' });
            expect(system.listByInstrument('guzheng').length).toBe(1);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.composeMusic({ cultivatorId: 'c1' });
            system.composeMusic({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listByResonance', () => {
        it('should filter', () => {
            system.composeMusic({ resonance: 10 });
            system.composeMusic({ resonance: 100 });
            expect(system.listByResonance(50).length).toBe(1);
        });
    });

    describe('practiceMusic', () => {
        it('should practice', () => {
            const { composition } = system.composeMusic({});
            system.practiceMusic(composition.compositionId, 10);
            expect(composition.mastery).toBe(10);
        });

        it('should reject missing', () => {
            const result = system.practiceMusic('ghost', 10);
            expect(result.error).toBe('COMPOSITION_NOT_FOUND');
        });

        it('should trigger musicPracticed hook', () => {
            const { composition } = system.composeMusic({});
            let called = false;
            system.registerHook('musicPracticed', () => { called = true; });
            system.practiceMusic(composition.compositionId, 10);
            expect(called).toBe(true);
        });
    });

    describe('tuneMusic', () => {
        it('should tune', () => {
            const { composition } = system.composeMusic({});
            system.tuneMusic(composition.compositionId, 80);
            expect(composition.tempo).toBe(80);
        });

        it('should reject missing', () => {
            const result = system.tuneMusic('ghost', 80);
            expect(result.error).toBe('COMPOSITION_NOT_FOUND');
        });

        it('should trigger musicTuned hook', () => {
            const { composition } = system.composeMusic({});
            let called = false;
            system.registerHook('musicTuned', () => { called = true; });
            system.tuneMusic(composition.compositionId, 80);
            expect(called).toBe(true);
        });
    });

    describe('performMusic', () => {
        it('should perform', () => {
            const { composition } = system.composeMusic({});
            system.performMusic(composition.compositionId);
            expect(composition.status).toBe('performed');
        });

        it('should reject missing', () => {
            const result = system.performMusic('ghost');
            expect(result.error).toBe('COMPOSITION_NOT_FOUND');
        });

        it('should trigger musicPerformed hook', () => {
            const { composition } = system.composeMusic({});
            let called = false;
            system.registerHook('musicPerformed', () => { called = true; });
            system.performMusic(composition.compositionId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHarmony', () => {
        it('should calculate', () => {
            const { composition } = system.composeMusic({});
            // resonance=20, mastery=0, melody=50: 20*(1+0/100)+50 = 70
            expect(system.calculateHarmony(composition.compositionId)).toBe(70);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHarmony('ghost')).toBe(0);
        });
    });

    describe('listHarmonic', () => {
        it('should filter', () => {
            system.composeMusic({ resonance: 10 });
            system.composeMusic({ resonance: 100 });
            expect(system.listHarmonic().length).toBe(1);
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

        it('should execute default getComposition', () => {
            const result = system.executeTool('getComposition', { compositionId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('musicComposed', () => count++);
            unregister();
            system.composeMusic({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('musicComposed', () => { throw new Error('x'); });
            expect(() => system.composeMusic({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCompositions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCompositions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.composeMusic({});
            const json = system.toJSON();
            expect(json.compositions.length).toBe(1);
        });
        it('should deserialize', () => {
            system.composeMusic({});
            const json = system.toJSON();
            const newSys = new MusicCultivation();
            newSys.fromJSON(json);
            expect(newSys.compositions.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.compositionCount).toBe(0);
        });
    });
});
