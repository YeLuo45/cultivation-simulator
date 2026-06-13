/**
 * CultivationOctave.test.js - 修真八度系统测试
 * V793 Iteration 26/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationOctave } from '../../../systems/ai/CultivationOctave.js';

describe('CultivationOctave', () => {
    let system;
    beforeEach(() => { system = new CultivationOctave(); });

    describe('recruitOctave', () => {
        it('should recruit an octave', () => {
            const { octave } = system.recruitOctave({ masterId: 'm1', name: 'Sky Bell' });
            expect(octave.masterId).toBe('m1');
            expect(octave.name).toBe('Sky Bell');
        });

        it('should set defaults', () => {
            const { octave } = system.recruitOctave({});
            expect(octave.type).toBe('high');
            expect(octave.range).toBe(20);
            expect(octave.level).toBe(1);
            expect(octave.status).toBe('novice');
            expect(octave.tones).toEqual([]);
        });

        it('should accept custom values', () => {
            const { octave } = system.recruitOctave({ type: 'low', range: 80, level: 5, status: 'veteran', tones: ['A', 'B'] });
            expect(octave.type).toBe('low');
            expect(octave.range).toBe(80);
            expect(octave.level).toBe(5);
            expect(octave.status).toBe('veteran');
            expect(octave.tones.length).toBe(2);
        });

        it('should accept perfect type', () => {
            const { octave } = system.recruitOctave({ type: 'perfect' });
            expect(octave.type).toBe('perfect');
        });

        it('should trigger octaveRecruited hook', () => {
            let called = false;
            system.registerHook('octaveRecruited', () => { called = true; });
            system.recruitOctave({});
            expect(called).toBe(true);
        });

        it('should increment totalOctaves', () => {
            system.recruitOctave({});
            system.recruitOctave({});
            expect(system.stats.totalOctaves).toBe(2);
        });

        it('should accept custom octaveId', () => {
            const { octave } = system.recruitOctave({ octaveId: 'custom-oct' });
            expect(octave.octaveId).toBe('custom-oct');
        });
    });

    describe('getOctave', () => {
        it('should return octave', () => {
            const { octave } = system.recruitOctave({});
            expect(system.getOctave(octave.octaveId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getOctave('ghost')).toBeNull();
        });
    });

    describe('listOctaves', () => {
        it('should list all', () => {
            system.recruitOctave({});
            system.recruitOctave({});
            expect(system.listOctaves().length).toBe(2);
        });

        it('should return empty list initially', () => {
            expect(system.listOctaves().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitOctave({ masterId: 'm1' });
            system.recruitOctave({ masterId: 'm2' });
            system.recruitOctave({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitOctave({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { octave: t1 } = system.recruitOctave({});
            const { octave: t2 } = system.recruitOctave({});
            system.legendOctave(t2.octaveId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].octaveId).toBe(t2.octaveId);
        });

        it('should return empty when none legendary', () => {
            system.recruitOctave({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addTone', () => {
        it('should add tone', () => {
            const { octave } = system.recruitOctave({});
            system.addTone(octave.octaveId, 'High-C');
            expect(octave.tones).toContain('High-C');
        });

        it('should reject missing octave', () => {
            const result = system.addTone('ghost', 'x');
            expect(result.error).toBe('OCTAVE_NOT_FOUND');
        });

        it('should trigger toneAdded hook', () => {
            const { octave } = system.recruitOctave({});
            let called = false;
            system.registerHook('toneAdded', () => { called = true; });
            system.addTone(octave.octaveId, 'Mid-D');
            expect(called).toBe(true);
        });

        it('should add multiple tones', () => {
            const { octave } = system.recruitOctave({});
            system.addTone(octave.octaveId, 'A');
            system.addTone(octave.octaveId, 'B');
            expect(octave.tones.length).toBe(2);
        });
    });

    describe('raiseRange', () => {
        it('should raise range by default', () => {
            const { octave } = system.recruitOctave({});
            system.raiseRange(octave.octaveId);
            expect(octave.range).toBe(25);
        });

        it('should raise range by custom amount', () => {
            const { octave } = system.recruitOctave({});
            system.raiseRange(octave.octaveId, 50);
            expect(octave.range).toBe(70);
        });

        it('should reject missing octave', () => {
            const result = system.raiseRange('ghost', 10);
            expect(result.error).toBe('OCTAVE_NOT_FOUND');
        });

        it('should trigger rangeRaised hook', () => {
            const { octave } = system.recruitOctave({});
            let called = false;
            system.registerHook('rangeRaised', () => { called = true; });
            system.raiseRange(octave.octaveId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpOctave', () => {
        it('should level up', () => {
            const { octave } = system.recruitOctave({});
            system.levelUpOctave(octave.octaveId);
            expect(octave.level).toBe(2);
        });

        it('should reject missing octave', () => {
            const result = system.levelUpOctave('ghost');
            expect(result.error).toBe('OCTAVE_NOT_FOUND');
        });

        it('should trigger octaveLeveledUp hook', () => {
            const { octave } = system.recruitOctave({});
            let called = false;
            system.registerHook('octaveLeveledUp', () => { called = true; });
            system.levelUpOctave(octave.octaveId);
            expect(called).toBe(true);
        });
    });

    describe('legendOctave', () => {
        it('should set status to legendary', () => {
            const { octave } = system.recruitOctave({});
            system.legendOctave(octave.octaveId);
            expect(octave.status).toBe('legendary');
        });

        it('should reject missing octave', () => {
            const result = system.legendOctave('ghost');
            expect(result.error).toBe('OCTAVE_NOT_FOUND');
        });

        it('should trigger octaveLegendized hook', () => {
            const { octave } = system.recruitOctave({});
            let called = false;
            system.registerHook('octaveLegendized', () => { called = true; });
            system.legendOctave(octave.octaveId);
            expect(called).toBe(true);
        });
    });

    describe('calculateOctaveValue', () => {
        it('should calculate value', () => {
            const { octave } = system.recruitOctave({ level: 3, range: 50, tones: ['A', 'B'] });
            // 3*100 + 50*2 + 2*30 = 300 + 100 + 60 = 460
            expect(system.calculateOctaveValue(octave.octaveId)).toBe(460);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateOctaveValue('ghost')).toBe(0);
        });

        it('should reflect state changes', () => {
            const { octave } = system.recruitOctave({});
            system.addTone(octave.octaveId, 'X');
            system.raiseRange(octave.octaveId, 10);
            system.levelUpOctave(octave.octaveId);
            // 2*100 + 30*2 + 1*30 = 200 + 60 + 30 = 290
            expect(system.calculateOctaveValue(octave.octaveId)).toBe(290);
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

        it('should have default tools', () => {
            expect(system.listTools()).toContain('getOctave');
            expect(system.listTools()).toContain('recruitOctave');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('octaveRecruited', () => count++);
            unregister();
            system.recruitOctave({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('octaveRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitOctave({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalOctaves = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalOctaves = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitOctave({});
            const json = system.toJSON();
            expect(json.octaves.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitOctave({ masterId: 'm1' });
            const json = system.toJSON();
            const newSys = new CultivationOctave();
            newSys.fromJSON(json);
            expect(newSys.octaves.size).toBe(1);
            expect(newSys.listByMaster('m1').length).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.octaveCount).toBe(0);
        });
    });
});
