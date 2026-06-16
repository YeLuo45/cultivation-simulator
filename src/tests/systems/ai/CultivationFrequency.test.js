/**
 * CultivationFrequency.test.js - 修真频率测试
 * V747 Iteration 10/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationFrequency } from '../../../systems/ai/CultivationFrequency.js';

describe('CultivationFrequency', () => {
    let system;
    beforeEach(() => { system = new CultivationFrequency(); });

    describe('recruitFrequency', () => {
        it('should recruit', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1', name: 'Pulse1', type: 'high' });
            expect(frequency.masterId).toBe('m1');
            expect(frequency.name).toBe('Pulse1');
            expect(frequency.type).toBe('high');
        });

        it('should default name to unnamed', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            expect(frequency.name).toBe('unnamed');
        });

        it('should default type to medium', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            expect(frequency.type).toBe('medium');
        });

        it('should default amplitude to baseAmplitude', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            expect(frequency.amplitude).toBe(20);
        });

        it('should set level to 1 and status to novice', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            expect(frequency.level).toBe(1);
            expect(frequency.status).toBe('novice');
        });

        it('should init empty waves', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            expect(frequency.waves).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            expect(frequency.frequencyId).toBeTruthy();
        });

        it('should respect provided id', () => {
            const { frequency } = system.recruitFrequency({ id: 'custom-freq', masterId: 'm1' });
            expect(frequency.frequencyId).toBe('custom-freq');
        });

        it('should accept custom waves', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1', waves: ['w1', 'w2'] });
            expect(frequency.waves.length).toBe(2);
        });

        it('should accept custom amplitude', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1', amplitude: 99 });
            expect(frequency.amplitude).toBe(99);
        });

        it('should accept low type', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1', type: 'low' });
            expect(frequency.type).toBe('low');
        });

        it('should accept high type', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1', type: 'high' });
            expect(frequency.type).toBe('high');
        });

        it('should increment totalFrequencies', () => {
            system.recruitFrequency({ masterId: 'm1' });
            expect(system.stats.totalFrequencies).toBe(1);
        });

        it('should trigger frequencyRecruited hook', () => {
            let called = false;
            system.registerHook('frequencyRecruited', () => { called = true; });
            system.recruitFrequency({ masterId: 'm1' });
            expect(called).toBe(true);
        });
    });

    describe('getFrequency', () => {
        it('should return frequency', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            expect(system.getFrequency(frequency.frequencyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getFrequency('ghost')).toBeNull(); });
    });

    describe('listFrequencies', () => {
        it('should list all', () => {
            system.recruitFrequency({ masterId: 'm1' });
            system.recruitFrequency({ masterId: 'm2' });
            expect(system.listFrequencies().length).toBe(2);
        });

        it('should return empty array when none', () => {
            expect(system.listFrequencies().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitFrequency({ masterId: 'm1' });
            system.recruitFrequency({ masterId: 'm2' });
            system.recruitFrequency({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitFrequency({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { frequency: f1 } = system.recruitFrequency({ masterId: 'm1' });
            system.recruitFrequency({ masterId: 'm1' });
            system.legendFrequency(f1.frequencyId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitFrequency({ masterId: 'm1' });
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addWave', () => {
        it('should add wave', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            system.addWave(frequency.frequencyId, 'w1');
            expect(frequency.waves.length).toBe(1);
            expect(frequency.waves[0]).toBe('w1');
        });

        it('should reject missing frequency', () => {
            const result = system.addWave('ghost', 'w1');
            expect(result.error).toBe('FREQUENCY_NOT_FOUND');
        });

        it('should promote to veteran at 3 waves', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            system.addWave(frequency.frequencyId, 'w1');
            system.addWave(frequency.frequencyId, 'w2');
            system.addWave(frequency.frequencyId, 'w3');
            expect(frequency.status).toBe('veteran');
        });

        it('should not promote past veteran', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            system.legendFrequency(frequency.frequencyId);
            system.addWave(frequency.frequencyId, 'w1');
            system.addWave(frequency.frequencyId, 'w2');
            system.addWave(frequency.frequencyId, 'w3');
            expect(frequency.status).toBe('legendary');
        });

        it('should trigger waveAdded hook', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            let called = false;
            system.registerHook('waveAdded', () => { called = true; });
            system.addWave(frequency.frequencyId, 'w1');
            expect(called).toBe(true);
        });
    });

    describe('raiseAmplitude', () => {
        it('should raise by default 5', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            system.raiseAmplitude(frequency.frequencyId);
            expect(frequency.amplitude).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            system.raiseAmplitude(frequency.frequencyId, 50);
            expect(frequency.amplitude).toBe(70);
        });

        it('should reject missing frequency', () => {
            const result = system.raiseAmplitude('ghost', 5);
            expect(result.error).toBe('FREQUENCY_NOT_FOUND');
        });

        it('should trigger amplitudeRaised hook', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            let called = false;
            system.registerHook('amplitudeRaised', () => { called = true; });
            system.raiseAmplitude(frequency.frequencyId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpFrequency', () => {
        it('should level up', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            system.levelUpFrequency(frequency.frequencyId);
            expect(frequency.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            system.levelUpFrequency(frequency.frequencyId);
            system.levelUpFrequency(frequency.frequencyId);
            system.levelUpFrequency(frequency.frequencyId);
            expect(frequency.level).toBe(4);
        });

        it('should reject missing frequency', () => {
            const result = system.levelUpFrequency('ghost');
            expect(result.error).toBe('FREQUENCY_NOT_FOUND');
        });

        it('should trigger frequencyLeveledUp hook', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            let called = false;
            system.registerHook('frequencyLeveledUp', () => { called = true; });
            system.levelUpFrequency(frequency.frequencyId);
            expect(called).toBe(true);
        });
    });

    describe('legendFrequency', () => {
        it('should set status to legendary', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            system.legendFrequency(frequency.frequencyId);
            expect(frequency.status).toBe('legendary');
        });

        it('should reject missing frequency', () => {
            const result = system.legendFrequency('ghost');
            expect(result.error).toBe('FREQUENCY_NOT_FOUND');
        });

        it('should trigger frequencyLegendized hook', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            let called = false;
            system.registerHook('frequencyLegendized', () => { called = true; });
            system.legendFrequency(frequency.frequencyId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFrequencyValue', () => {
        it('should calculate base value', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            // level=1, amplitude=20, waves=0 -> 100 + 40 + 0 = 140
            expect(system.calculateFrequencyValue(frequency.frequencyId)).toBe(140);
        });

        it('should factor in level', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            system.levelUpFrequency(frequency.frequencyId);
            system.levelUpFrequency(frequency.frequencyId);
            // level=3, amplitude=20, waves=0 -> 300 + 40 + 0 = 340
            expect(system.calculateFrequencyValue(frequency.frequencyId)).toBe(340);
        });

        it('should factor in waves', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            system.addWave(frequency.frequencyId, 'w1');
            system.addWave(frequency.frequencyId, 'w2');
            // level=1, amplitude=20, waves=2 -> 100 + 40 + 60 = 200
            expect(system.calculateFrequencyValue(frequency.frequencyId)).toBe(200);
        });

        it('should factor in amplitude', () => {
            const { frequency } = system.recruitFrequency({ masterId: 'm1' });
            system.raiseAmplitude(frequency.frequencyId, 30);
            // level=1, amplitude=50, waves=0 -> 100 + 100 + 0 = 200
            expect(system.calculateFrequencyValue(frequency.frequencyId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateFrequencyValue('ghost')).toBe(0);
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

        it('should execute default getFrequency', () => {
            const result = system.executeTool('getFrequency', { frequencyId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute tool with no context', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('frequencyRecruited', () => count++);
            unregister();
            system.recruitFrequency({ masterId: 'm1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('frequencyRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitFrequency({ masterId: 'm1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalFrequencies = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalFrequencies = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitFrequency({ masterId: 'm1' });
            const json = system.toJSON();
            expect(json.frequencies.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitFrequency({ masterId: 'm1' });
            const json = system.toJSON();
            const newSys = new CultivationFrequency();
            newSys.fromJSON(json);
            expect(newSys.frequencies.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.frequencyCount).toBe(0);
            expect(stats.totalFrequencies).toBe(0);
        });
    });

    describe('config defaults', () => {
        it('should accept custom config', () => {
            const sys = new CultivationFrequency({ maxFrequencies: 50, baseAmplitude: 10 });
            expect(sys.config.maxFrequencies).toBe(50);
            expect(sys.config.baseAmplitude).toBe(10);
        });
    });
});
