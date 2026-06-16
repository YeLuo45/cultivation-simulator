/**
 * CultivationCadence.test.js - 修真节奏系统测试
 * V785 Iteration 18/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCadence } from '../../../systems/ai/CultivationCadence.js';

describe('CultivationCadence', () => {
    let system;
    beforeEach(() => { system = new CultivationCadence(); });

    describe('recruitCadence', () => {
        it('should recruit with defaults', () => {
            const { cadence } = system.recruitCadence({ masterId: 'm1' });
            expect(cadence.masterId).toBe('m1');
            expect(cadence.level).toBe(1);
            expect(cadence.status).toBe('novice');
            expect(cadence.rhythm).toBe(20);
            expect(cadence.beats).toEqual([]);
            expect(cadence.type).toBe('calm');
            expect(cadence.name).toBe('Unnamed Cadence');
        });

        it('should accept custom fields', () => {
            const { cadence } = system.recruitCadence({
                masterId: 'm2',
                name: 'Swift Wind',
                type: 'swift',
                rhythm: 50,
                beats: ['b1', 'b2']
            });
            expect(cadence.name).toBe('Swift Wind');
            expect(cadence.type).toBe('swift');
            expect(cadence.rhythm).toBe(50);
            expect(cadence.beats.length).toBe(2);
        });

        it('should trigger cadenceRecruited hook', () => {
            let called = false;
            system.registerHook('cadenceRecruited', () => { called = true; });
            system.recruitCadence({ masterId: 'm1' });
            expect(called).toBe(true);
        });
    });

    describe('getCadence', () => {
        it('should return a copy', () => {
            const { cadence } = system.recruitCadence({ masterId: 'm1' });
            const fetched = system.getCadence(cadence.cadenceId);
            expect(fetched).not.toBeNull();
            expect(fetched.cadenceId).toBe(cadence.cadenceId);
            fetched.name = 'mutated';
            expect(cadence.name).not.toBe('mutated');
        });
        it('should return null for missing', () => {
            expect(system.getCadence('ghost')).toBeNull();
        });
    });

    describe('listCadences', () => {
        it('should list all', () => {
            system.recruitCadence({ masterId: 'm1' });
            system.recruitCadence({ masterId: 'm2' });
            expect(system.listCadences().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitCadence({ masterId: 'm1' });
            system.recruitCadence({ masterId: 'm1' });
            system.recruitCadence({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
        });
        it('should return empty for unknown master', () => {
            expect(system.listByMaster('nobody').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter only legendary', () => {
            const { cadence: a } = system.recruitCadence({ masterId: 'm1' });
            const { cadence: b } = system.recruitCadence({ masterId: 'm1' });
            system.legendCadence(b.cadenceId);
            const result = system.listLegendary();
            expect(result.length).toBe(1);
            expect(result[0].cadenceId).toBe(b.cadenceId);
        });
        it('should return empty when none legendary', () => {
            system.recruitCadence({ masterId: 'm1' });
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addBeat', () => {
        it('should add beat to cadence', () => {
            const { cadence } = system.recruitCadence({ masterId: 'm1' });
            system.addBeat(cadence.cadenceId, 'beat-1');
            expect(cadence.beats).toContain('beat-1');
        });

        it('should reject missing cadence', () => {
            const result = system.addBeat('ghost', 'x');
            expect(result.success).toBe(false);
            expect(result.error).toBe('CADENCE_NOT_FOUND');
        });

        it('should trigger beatAdded hook', () => {
            const { cadence } = system.recruitCadence({ masterId: 'm1' });
            let received = null;
            system.registerHook('beatAdded', (d) => { received = d; });
            system.addBeat(cadence.cadenceId, 'b-x');
            expect(received).not.toBeNull();
            expect(received.beat).toBe('b-x');
        });
    });

    describe('raiseRhythm', () => {
        it('should raise with default amount', () => {
            const { cadence } = system.recruitCadence({ masterId: 'm1' });
            system.raiseRhythm(cadence.cadenceId);
            expect(cadence.rhythm).toBe(25);
        });
        it('should raise with custom amount', () => {
            const { cadence } = system.recruitCadence({ masterId: 'm1' });
            system.raiseRhythm(cadence.cadenceId, 15);
            expect(cadence.rhythm).toBe(35);
        });
        it('should reject missing cadence', () => {
            const result = system.raiseRhythm('ghost', 5);
            expect(result.error).toBe('CADENCE_NOT_FOUND');
        });
        it('should trigger rhythmRaised hook', () => {
            const { cadence } = system.recruitCadence({ masterId: 'm1' });
            let received = null;
            system.registerHook('rhythmRaised', (d) => { received = d; });
            system.raiseRhythm(cadence.cadenceId, 7);
            expect(received.newRhythm).toBe(27);
        });
    });

    describe('levelUpCadence', () => {
        it('should increment level', () => {
            const { cadence } = system.recruitCadence({ masterId: 'm1' });
            system.levelUpCadence(cadence.cadenceId);
            expect(cadence.level).toBe(2);
            system.levelUpCadence(cadence.cadenceId);
            expect(cadence.level).toBe(3);
        });
        it('should reject missing cadence', () => {
            const result = system.levelUpCadence('ghost');
            expect(result.error).toBe('CADENCE_NOT_FOUND');
        });
        it('should trigger cadenceLeveledUp hook', () => {
            const { cadence } = system.recruitCadence({ masterId: 'm1' });
            let received = null;
            system.registerHook('cadenceLeveledUp', (d) => { received = d; });
            system.levelUpCadence(cadence.cadenceId);
            expect(received.newLevel).toBe(2);
        });
    });

    describe('legendCadence', () => {
        it('should set status to legendary', () => {
            const { cadence } = system.recruitCadence({ masterId: 'm1' });
            system.legendCadence(cadence.cadenceId);
            expect(cadence.status).toBe('legendary');
        });
        it('should reject missing cadence', () => {
            const result = system.legendCadence('ghost');
            expect(result.error).toBe('CADENCE_NOT_FOUND');
        });
        it('should trigger cadenceLegendized hook', () => {
            const { cadence } = system.recruitCadence({ masterId: 'm1' });
            let called = false;
            system.registerHook('cadenceLegendized', () => { called = true; });
            system.legendCadence(cadence.cadenceId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCadenceValue', () => {
        it('should calculate: level*100 + rhythm*2 + beats*30', () => {
            const { cadence } = system.recruitCadence({ masterId: 'm1', rhythm: 30 });
            system.addBeat(cadence.cadenceId, 'b1');
            system.addBeat(cadence.cadenceId, 'b2');
            system.levelUpCadence(cadence.cadenceId);
            // level=2, rhythm=30, beats=2 -> 200 + 60 + 60 = 320
            expect(system.calculateCadenceValue(cadence.cadenceId)).toBe(320);
        });
        it('should return 0 for missing', () => {
            expect(system.calculateCadenceValue('ghost')).toBe(0);
        });
    });

    describe('Tool System', () => {
        it('should register a custom tool', () => {
            system.registerTool('custom', () => 'ok');
            expect(system.listTools()).toContain('custom');
        });
        it('should execute a custom tool', () => {
            system.registerTool('echo', (ctx) => ctx.value);
            const result = system.executeTool('echo', { value: 99 });
            expect(result.success).toBe(true);
            expect(result.result).toBe(99);
        });
        it('should reject missing tool', () => {
            const result = system.executeTool('nope', {});
            expect(result.success).toBe(false);
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });
        it('should handle tool errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.success).toBe(false);
            expect(result.error).toBe('boom');
        });
        it('should execute default getCadence tool', () => {
            const result = system.executeTool('getCadence', { cadenceId: 'ghost' });
            expect(result.success).toBe(true);
            expect(result.result).toBeNull();
        });
        it('should execute default recruitCadence tool', () => {
            const result = system.executeTool('recruitCadence', { masterId: 'mx', name: 'A', type: 'sacred' });
            expect(result.success).toBe(true);
            expect(result.result.cadence.type).toBe('sacred');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const off = system.registerHook('cadenceRecruited', () => count++);
            off();
            system.recruitCadence({ masterId: 'm1' });
            expect(count).toBe(0);
        });
        it('should swallow handler errors', () => {
            system.registerHook('cadenceRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitCadence({ masterId: 'm1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient cadences', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when threshold met', () => {
            system.stats.totalCadences = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double-evolve', () => {
            system.stats.totalCadences = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitCadence({ masterId: 'm1' });
            const json = system.toJSON();
            expect(json.cadences.length).toBe(1);
            expect(json.stats.totalCadences).toBe(1);
        });
        it('should deserialize from JSON', () => {
            system.recruitCadence({ masterId: 'm1' });
            const json = system.toJSON();
            const fresh = new CultivationCadence();
            fresh.fromJSON(json);
            expect(fresh.cadences.size).toBe(1);
            expect(fresh.stats.totalCadences).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with count', () => {
            system.recruitCadence({ masterId: 'm1' });
            const stats = system.getStats();
            expect(stats.cadenceCount).toBe(1);
            expect(stats.totalCadences).toBe(1);
        });
    });
});
