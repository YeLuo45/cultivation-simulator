/**
 * CultivationPulse.test.js - 修真脉动系统测试
 * V745 Iteration 8/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPulse } from '../../../systems/ai/CultivationPulse.js';

describe('CultivationPulse', () => {
    let system;
    beforeEach(() => { system = new CultivationPulse(); });

    describe('recruitPulse', () => {
        it('should recruit', () => {
            const { pulse } = system.recruitPulse({ masterId: 'm1' });
            expect(pulse.masterId).toBe('m1');
        });

        it('should default type to heart', () => {
            const { pulse } = system.recruitPulse({});
            expect(pulse.type).toBe('heart');
        });

        it('should default status to novice', () => {
            const { pulse } = system.recruitPulse({});
            expect(pulse.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { pulse } = system.recruitPulse({});
            expect(pulse.level).toBe(1);
        });

        it('should trigger pulseRecruited hook', () => {
            let called = false;
            system.registerHook('pulseRecruited', () => { called = true; });
            system.recruitPulse({});
            expect(called).toBe(true);
        });
    });

    describe('getPulse', () => {
        it('should return', () => {
            const { pulse } = system.recruitPulse({});
            expect(system.getPulse(pulse.pulseId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPulse('ghost')).toBeNull(); });
    });

    describe('listPulses', () => {
        it('should list all', () => {
            system.recruitPulse({});
            expect(system.listPulses().length).toBe(1);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitPulse({ masterId: 'm1' });
            system.recruitPulse({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { pulse: p1 } = system.recruitPulse({});
            const { pulse: p2 } = system.recruitPulse({});
            system.legendPulse(p1.pulseId);
            expect(system.listLegendary().length).toBe(1);
            system.legendPulse(p2.pulseId);
            expect(system.listLegendary().length).toBe(2);
        });
    });

    describe('addBeat', () => {
        it('should add beat', () => {
            const { pulse } = system.recruitPulse({});
            system.addBeat(pulse.pulseId, 'first-beat');
            expect(pulse.beats).toContain('first-beat');
        });

        it('should reject missing', () => {
            const result = system.addBeat('ghost', 'beat');
            expect(result.error).toBe('PULSE_NOT_FOUND');
        });

        it('should trigger beatAdded hook', () => {
            const { pulse } = system.recruitPulse({});
            let called = false;
            system.registerHook('beatAdded', () => { called = true; });
            system.addBeat(pulse.pulseId, 'b');
            expect(called).toBe(true);
        });
    });

    describe('raiseRhythm', () => {
        it('should raise rhythm', () => {
            const { pulse } = system.recruitPulse({});
            system.raiseRhythm(pulse.pulseId, 10);
            expect(pulse.rhythm).toBe(30);
        });

        it('should default amount to 5', () => {
            const { pulse } = system.recruitPulse({});
            system.raiseRhythm(pulse.pulseId);
            expect(pulse.rhythm).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseRhythm('ghost', 10);
            expect(result.error).toBe('PULSE_NOT_FOUND');
        });

        it('should trigger rhythmRaised hook', () => {
            const { pulse } = system.recruitPulse({});
            let called = false;
            system.registerHook('rhythmRaised', () => { called = true; });
            system.raiseRhythm(pulse.pulseId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpPulse', () => {
        it('should level up', () => {
            const { pulse } = system.recruitPulse({});
            system.levelUpPulse(pulse.pulseId);
            expect(pulse.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpPulse('ghost');
            expect(result.error).toBe('PULSE_NOT_FOUND');
        });

        it('should trigger pulseLeveledUp hook', () => {
            const { pulse } = system.recruitPulse({});
            let called = false;
            system.registerHook('pulseLeveledUp', () => { called = true; });
            system.levelUpPulse(pulse.pulseId);
            expect(called).toBe(true);
        });
    });

    describe('legendPulse', () => {
        it('should set status to legendary', () => {
            const { pulse } = system.recruitPulse({});
            system.legendPulse(pulse.pulseId);
            expect(pulse.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendPulse('ghost');
            expect(result.error).toBe('PULSE_NOT_FOUND');
        });

        it('should trigger pulseLegendized hook', () => {
            const { pulse } = system.recruitPulse({});
            let called = false;
            system.registerHook('pulseLegendized', () => { called = true; });
            system.legendPulse(pulse.pulseId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePulseValue', () => {
        it('should calculate', () => {
            const { pulse } = system.recruitPulse({});
            system.addBeat(pulse.pulseId, 'b1');
            // level=1, rhythm=20, beats.length=1 => 1*100 + 20*2 + 1*30 = 170
            expect(system.calculatePulseValue(pulse.pulseId)).toBe(170);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePulseValue('ghost')).toBe(0);
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

        it('should execute default getPulse', () => {
            const result = system.executeTool('getPulse', { pulseId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitPulse', () => {
            const result = system.executeTool('recruitPulse', { masterId: 'm1' });
            expect(result.success).toBe(true);
        });

        it('should handle undefined context', () => {
            system.registerTool('test', () => 'ok');
            const result = system.executeTool('test');
            expect(result.result).toBe('ok');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('pulseRecruited', () => count++);
            unregister();
            system.recruitPulse({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('pulseRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitPulse({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPulses = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPulses = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitPulse({});
            const json = system.toJSON();
            expect(json.pulses.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitPulse({});
            const json = system.toJSON();
            const newSys = new CultivationPulse();
            newSys.fromJSON(json);
            expect(newSys.pulses.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.pulseCount).toBe(0);
        });
    });
});
