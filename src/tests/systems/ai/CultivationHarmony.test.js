/**
 * CultivationHarmony.test.js - 修真和声系统测试
 * V784 Iteration 17/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationHarmony } from '../../../systems/ai/CultivationHarmony.js';

describe('CultivationHarmony', () => {
    let system;
    beforeEach(() => { system = new CultivationHarmony(); });

    describe('recruitHarmony', () => {
        it('should recruit', () => {
            const { harmony } = system.recruitHarmony({ masterId: 'm1', name: 'Celestial Chord' });
            expect(harmony.masterId).toBe('m1');
            expect(harmony.name).toBe('Celestial Chord');
        });

        it('should default type to major', () => {
            const { harmony } = system.recruitHarmony({});
            expect(harmony.type).toBe('major');
        });

        it('should default depth to baseDepth', () => {
            const { harmony } = system.recruitHarmony({});
            expect(harmony.depth).toBe(20);
        });

        it('should default status to novice', () => {
            const { harmony } = system.recruitHarmony({});
            expect(harmony.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { harmony } = system.recruitHarmony({});
            expect(harmony.level).toBe(1);
        });

        it('should initialize empty chords', () => {
            const { harmony } = system.recruitHarmony({});
            expect(harmony.chords).toEqual([]);
        });

        it('should accept divine type', () => {
            const { harmony } = system.recruitHarmony({ type: 'divine' });
            expect(harmony.type).toBe('divine');
        });

        it('should accept minor type', () => {
            const { harmony } = system.recruitHarmony({ type: 'minor' });
            expect(harmony.type).toBe('minor');
        });

        it('should trigger harmonyRecruited hook', () => {
            let called = false;
            system.registerHook('harmonyRecruited', () => { called = true; });
            system.recruitHarmony({});
            expect(called).toBe(true);
        });

        it('should generate unique ids', () => {
            const { harmony: h1 } = system.recruitHarmony({});
            const { harmony: h2 } = system.recruitHarmony({});
            expect(h1.harmonyId).not.toBe(h2.harmonyId);
        });
    });

    describe('getHarmony', () => {
        it('should return', () => {
            const { harmony } = system.recruitHarmony({});
            expect(system.getHarmony(harmony.harmonyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getHarmony('ghost')).toBeNull(); });
    });

    describe('listHarmonies', () => {
        it('should list all', () => {
            system.recruitHarmony({});
            system.recruitHarmony({});
            expect(system.listHarmonies().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listHarmonies().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitHarmony({ masterId: 'm1' });
            system.recruitHarmony({ masterId: 'm2' });
            system.recruitHarmony({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitHarmony({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { harmony: h1 } = system.recruitHarmony({});
            const { harmony: h2 } = system.recruitHarmony({});
            system.legendHarmony(h2.harmonyId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].harmonyId).toBe(h2.harmonyId);
        });

        it('should return empty when no legendaries', () => {
            system.recruitHarmony({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addChord', () => {
        it('should add chord', () => {
            const { harmony } = system.recruitHarmony({});
            system.addChord(harmony.harmonyId, 'C-major');
            expect(harmony.chords).toContain('C-major');
        });

        it('should add multiple chords', () => {
            const { harmony } = system.recruitHarmony({});
            system.addChord(harmony.harmonyId, 'A-minor');
            system.addChord(harmony.harmonyId, 'G-major');
            expect(harmony.chords.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addChord('ghost', 'X');
            expect(result.error).toBe('HARMONY_NOT_FOUND');
        });

        it('should trigger chordAdded hook', () => {
            const { harmony } = system.recruitHarmony({});
            let called = false;
            system.registerHook('chordAdded', () => { called = true; });
            system.addChord(harmony.harmonyId, 'C-major');
            expect(called).toBe(true);
        });
    });

    describe('raiseDepth', () => {
        it('should raise depth by default amount', () => {
            const { harmony } = system.recruitHarmony({});
            system.raiseDepth(harmony.harmonyId);
            expect(harmony.depth).toBe(25);
        });

        it('should raise depth by custom amount', () => {
            const { harmony } = system.recruitHarmony({});
            system.raiseDepth(harmony.harmonyId, 50);
            expect(harmony.depth).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.raiseDepth('ghost', 10);
            expect(result.error).toBe('HARMONY_NOT_FOUND');
        });

        it('should trigger depthRaised hook', () => {
            const { harmony } = system.recruitHarmony({});
            let called = false;
            system.registerHook('depthRaised', () => { called = true; });
            system.raiseDepth(harmony.harmonyId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpHarmony', () => {
        it('should level up', () => {
            const { harmony } = system.recruitHarmony({});
            system.levelUpHarmony(harmony.harmonyId);
            expect(harmony.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { harmony } = system.recruitHarmony({});
            system.levelUpHarmony(harmony.harmonyId);
            system.levelUpHarmony(harmony.harmonyId);
            system.levelUpHarmony(harmony.harmonyId);
            expect(harmony.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpHarmony('ghost');
            expect(result.error).toBe('HARMONY_NOT_FOUND');
        });

        it('should trigger harmonyLeveledUp hook', () => {
            const { harmony } = system.recruitHarmony({});
            let called = false;
            system.registerHook('harmonyLeveledUp', () => { called = true; });
            system.levelUpHarmony(harmony.harmonyId);
            expect(called).toBe(true);
        });
    });

    describe('legendHarmony', () => {
        it('should set status to legendary', () => {
            const { harmony } = system.recruitHarmony({});
            system.legendHarmony(harmony.harmonyId);
            expect(harmony.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendHarmony('ghost');
            expect(result.error).toBe('HARMONY_NOT_FOUND');
        });

        it('should trigger harmonyLegendized hook', () => {
            const { harmony } = system.recruitHarmony({});
            let called = false;
            system.registerHook('harmonyLegendized', () => { called = true; });
            system.legendHarmony(harmony.harmonyId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHarmonyValue', () => {
        it('should calculate base value', () => {
            const { harmony } = system.recruitHarmony({});
            // level=1, depth=20, chords=[]: 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateHarmonyValue(harmony.harmonyId)).toBe(140);
        });

        it('should factor in chords', () => {
            const { harmony } = system.recruitHarmony({});
            system.addChord(harmony.harmonyId, 'A');
            system.addChord(harmony.harmonyId, 'B');
            // 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateHarmonyValue(harmony.harmonyId)).toBe(200);
        });

        it('should factor in level and depth', () => {
            const { harmony } = system.recruitHarmony({});
            system.levelUpHarmony(harmony.harmonyId);
            system.raiseDepth(harmony.harmonyId, 10);
            // 2*100 + 30*2 + 0*30 = 260
            expect(system.calculateHarmonyValue(harmony.harmonyId)).toBe(260);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHarmonyValue('ghost')).toBe(0);
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

        it('should execute default getHarmony', () => {
            const result = system.executeTool('getHarmony', { harmonyId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitHarmony', () => {
            const result = system.executeTool('recruitHarmony', { masterId: 'm1' });
            expect(result.success).toBe(true);
            expect(result.result.harmony.masterId).toBe('m1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('harmonyRecruited', () => count++);
            unregister();
            system.recruitHarmony({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('harmonyRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitHarmony({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalHarmonies = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalHarmonies = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitHarmony({});
            const json = system.toJSON();
            expect(json.harmonies.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitHarmony({});
            const json = system.toJSON();
            const newSys = new CultivationHarmony();
            newSys.fromJSON(json);
            expect(newSys.harmonies.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.harmonyCount).toBe(0);
        });

        it('should reflect count after recruit', () => {
            system.recruitHarmony({});
            system.recruitHarmony({});
            const stats = system.getStats();
            expect(stats.harmonyCount).toBe(2);
            expect(stats.totalHarmonies).toBe(2);
        });
    });
});
