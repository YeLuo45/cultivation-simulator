/**
 * CultivationMelody.test.js - 修真旋律系统测试
 * V783 Iteration 16/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMelody } from '../../../systems/ai/CultivationMelody.js';

describe('CultivationMelody', () => {
    let system;
    beforeEach(() => { system = new CultivationMelody(); });

    describe('recruitMelody', () => {
        it('should recruit', () => {
            const { melody } = system.recruitMelody({ masterId: 'm1', name: 'Celestial Melody', type: 'sweet' });
            expect(melody.masterId).toBe('m1');
            expect(melody.name).toBe('Celestial Melody');
            expect(melody.type).toBe('sweet');
        });

        it('should default type to sacred', () => {
            const { melody } = system.recruitMelody({});
            expect(melody.type).toBe('sacred');
        });

        it('should default status to novice', () => {
            const { melody } = system.recruitMelody({});
            expect(melody.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { melody } = system.recruitMelody({});
            expect(melody.level).toBe(1);
        });

        it('should default phrases to empty array', () => {
            const { melody } = system.recruitMelody({});
            expect(melody.phrases).toEqual([]);
        });

        it('should default sweetness to baseSweetness', () => {
            const { melody } = system.recruitMelody({});
            expect(melody.sweetness).toBe(20);
        });

        it('should assign auto id when missing', () => {
            const { melody } = system.recruitMelody({});
            expect(melody.melodyId).toMatch(/^mld_/);
        });

        it('should use provided melodyId', () => {
            const { melody } = system.recruitMelody({ melodyId: 'm_explicit' });
            expect(melody.melodyId).toBe('m_explicit');
        });

        it('should trigger melodyRecruited hook', () => {
            let called = false;
            system.registerHook('melodyRecruited', () => { called = true; });
            system.recruitMelody({});
            expect(called).toBe(true);
        });

        it('should respect custom config baseSweetness', () => {
            const customSystem = new CultivationMelody({ baseSweetness: 50 });
            const { melody } = customSystem.recruitMelody({});
            expect(melody.sweetness).toBe(50);
        });

        it('should support bitter type', () => {
            const { melody } = system.recruitMelody({ type: 'bitter' });
            expect(melody.type).toBe('bitter');
        });
    });

    describe('getMelody', () => {
        it('should return', () => {
            const { melody } = system.recruitMelody({});
            expect(system.getMelody(melody.melodyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMelody('ghost')).toBeNull(); });
        it('should return a copy (not reference)', () => {
            const { melody } = system.recruitMelody({ name: 'Original' });
            const fetched = system.getMelody(melody.melodyId);
            fetched.name = 'Mutated';
            const refetched = system.getMelody(melody.melodyId);
            expect(refetched.name).toBe('Original');
        });
    });

    describe('listMelodies', () => {
        it('should list all', () => {
            system.recruitMelody({});
            system.recruitMelody({});
            expect(system.listMelodies().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listMelodies().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitMelody({ masterId: 'm1' });
            system.recruitMelody({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitMelody({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { melody: a } = system.recruitMelody({});
            const { melody: b } = system.recruitMelody({});
            system.legendMelody(a.melodyId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.melodyId).toBeDefined();
        });

        it('should return empty when none legendary', () => {
            system.recruitMelody({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addPhrase', () => {
        it('should add phrase', () => {
            const { melody } = system.recruitMelody({});
            system.addPhrase(melody.melodyId, 'verse-1');
            expect(melody.phrases).toContain('verse-1');
        });

        it('should add multiple phrases', () => {
            const { melody } = system.recruitMelody({});
            system.addPhrase(melody.melodyId, 'verse-1');
            system.addPhrase(melody.melodyId, 'verse-2');
            expect(melody.phrases.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addPhrase('ghost', 'verse-1');
            expect(result.error).toBe('MELODY_NOT_FOUND');
        });

        it('should trigger phraseAdded hook', () => {
            const { melody } = system.recruitMelody({});
            let called = false;
            system.registerHook('phraseAdded', () => { called = true; });
            system.addPhrase(melody.melodyId, 'verse-1');
            expect(called).toBe(true);
        });
    });

    describe('raiseSweetness', () => {
        it('should raise sweetness', () => {
            const { melody } = system.recruitMelody({});
            system.raiseSweetness(melody.melodyId, 10);
            expect(melody.sweetness).toBe(30);
        });

        it('should default amount to 5', () => {
            const { melody } = system.recruitMelody({});
            system.raiseSweetness(melody.melodyId);
            expect(melody.sweetness).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseSweetness('ghost', 10);
            expect(result.error).toBe('MELODY_NOT_FOUND');
        });

        it('should trigger sweetnessRaised hook', () => {
            const { melody } = system.recruitMelody({});
            let called = false;
            system.registerHook('sweetnessRaised', () => { called = true; });
            system.raiseSweetness(melody.melodyId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMelody', () => {
        it('should increment level', () => {
            const { melody } = system.recruitMelody({});
            system.levelUpMelody(melody.melodyId);
            expect(melody.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { melody } = system.recruitMelody({});
            system.levelUpMelody(melody.melodyId);
            system.levelUpMelody(melody.melodyId);
            system.levelUpMelody(melody.melodyId);
            expect(melody.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpMelody('ghost');
            expect(result.error).toBe('MELODY_NOT_FOUND');
        });
    });

    describe('legendMelody', () => {
        it('should set status to legendary', () => {
            const { melody } = system.recruitMelody({});
            system.legendMelody(melody.melodyId);
            expect(melody.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendMelody('ghost');
            expect(result.error).toBe('MELODY_NOT_FOUND');
        });

        it('should trigger melodyLegendized hook', () => {
            const { melody } = system.recruitMelody({});
            let called = false;
            system.registerHook('melodyLegendized', () => { called = true; });
            system.legendMelody(melody.melodyId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMelodyValue', () => {
        it('should calculate', () => {
            const { melody } = system.recruitMelody({});
            system.addPhrase(melody.melodyId, 'verse-1');
            // value = 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculateMelodyValue(melody.melodyId)).toBe(170);
        });

        it('should recalculate after level up', () => {
            const { melody } = system.recruitMelody({});
            system.levelUpMelody(melody.melodyId);
            // value = 2 * 100 + 20 * 2 + 0 * 30 = 200 + 40 + 0 = 240
            expect(system.calculateMelodyValue(melody.melodyId)).toBe(240);
        });

        it('should recalculate after sweetness raise', () => {
            const { melody } = system.recruitMelody({});
            system.raiseSweetness(melody.melodyId, 5);
            // value = 1 * 100 + 25 * 2 + 0 * 30 = 100 + 50 + 0 = 150
            expect(system.calculateMelodyValue(melody.melodyId)).toBe(150);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMelodyValue('ghost')).toBe(0);
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

        it('should execute default getMelody', () => {
            const result = system.executeTool('getMelody', { melodyId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle undefined context with default', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('melodyRecruited', () => count++);
            unregister();
            system.recruitMelody({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('melodyRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMelody({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMelodies = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMelodies = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitMelody({});
            const json = system.toJSON();
            expect(json.melodies.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitMelody({});
            const json = system.toJSON();
            const newSys = new CultivationMelody();
            newSys.fromJSON(json);
            expect(newSys.melodies.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitMelody({});
            const stats = system.getStats();
            expect(stats.melodyCount).toBe(1);
        });
    });
});
