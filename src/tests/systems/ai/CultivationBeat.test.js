/**
 * CultivationBeat.test.js - 修真节拍系统测试
 * V787 Iteration 20/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBeat } from '../../../systems/ai/CultivationBeat.js';

describe('CultivationBeat', () => {
    let system;
    beforeEach(() => { system = new CultivationBeat(); });

    describe('recruitBeat', () => {
        it('should recruit with defaults', () => {
            const { beat } = system.recruitBeat({ masterId: 'm1' });
            expect(beat.masterId).toBe('m1');
            expect(beat.level).toBe(1);
            expect(beat.status).toBe('novice');
            expect(beat.strength).toBe(20);
            expect(beat.pulses).toEqual([]);
            expect(beat.type).toBe('drum');
            expect(beat.name).toBe('Unnamed Beat');
        });

        it('should accept custom fields', () => {
            const { beat } = system.recruitBeat({
                masterId: 'm2',
                name: 'Iron Drum',
                type: 'heart',
                strength: 60,
                pulses: ['p1', 'p2']
            });
            expect(beat.name).toBe('Iron Drum');
            expect(beat.type).toBe('heart');
            expect(beat.strength).toBe(60);
            expect(beat.pulses.length).toBe(2);
        });

        it('should generate an id if not provided', () => {
            const { beat } = system.recruitBeat({ masterId: 'm1' });
            expect(beat.beatId).toBeDefined();
            expect(typeof beat.beatId).toBe('string');
            expect(beat.beatId.length).toBeGreaterThan(0);
        });

        it('should use provided beatId if given', () => {
            const { beat } = system.recruitBeat({ masterId: 'm1', beatId: 'custom-id-99' });
            expect(beat.beatId).toBe('custom-id-99');
        });

        it('should increment totalBeats', () => {
            system.recruitBeat({ masterId: 'm1' });
            system.recruitBeat({ masterId: 'm2' });
            expect(system.stats.totalBeats).toBe(2);
        });

        it('should trigger beatRecruited hook', () => {
            let called = false;
            system.registerHook('beatRecruited', () => { called = true; });
            system.recruitBeat({ masterId: 'm1' });
            expect(called).toBe(true);
        });

        it('should set createdAt timestamp', () => {
            const before = Date.now();
            const { beat } = system.recruitBeat({ masterId: 'm1' });
            const after = Date.now();
            expect(beat.createdAt).toBeGreaterThanOrEqual(before);
            expect(beat.createdAt).toBeLessThanOrEqual(after);
        });
    });

    describe('getBeat', () => {
        it('should return a copy', () => {
            const { beat } = system.recruitBeat({ masterId: 'm1' });
            const fetched = system.getBeat(beat.beatId);
            expect(fetched).not.toBeNull();
            expect(fetched.beatId).toBe(beat.beatId);
            fetched.name = 'mutated';
            expect(beat.name).not.toBe('mutated');
        });
        it('should return null for missing', () => {
            expect(system.getBeat('ghost')).toBeNull();
        });
    });

    describe('listBeats', () => {
        it('should list all', () => {
            system.recruitBeat({ masterId: 'm1' });
            system.recruitBeat({ masterId: 'm2' });
            expect(system.listBeats().length).toBe(2);
        });
        it('should return empty when none', () => {
            expect(system.listBeats().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitBeat({ masterId: 'm1' });
            system.recruitBeat({ masterId: 'm1' });
            system.recruitBeat({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
        });
        it('should return empty for unknown master', () => {
            expect(system.listByMaster('nobody').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter only legendary', () => {
            const { beat: a } = system.recruitBeat({ masterId: 'm1' });
            const { beat: b } = system.recruitBeat({ masterId: 'm1' });
            system.legendBeat(b.beatId);
            const result = system.listLegendary();
            expect(result.length).toBe(1);
            expect(result[0].beatId).toBe(b.beatId);
        });
        it('should return empty when none legendary', () => {
            system.recruitBeat({ masterId: 'm1' });
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addPulse', () => {
        it('should add pulse to beat', () => {
            const { beat } = system.recruitBeat({ masterId: 'm1' });
            system.addPulse(beat.beatId, 'pulse-1');
            expect(beat.pulses).toContain('pulse-1');
        });

        it('should reject missing beat', () => {
            const result = system.addPulse('ghost', 'x');
            expect(result.success).toBe(false);
            expect(result.error).toBe('BEAT_NOT_FOUND');
        });

        it('should trigger pulseAdded hook', () => {
            const { beat } = system.recruitBeat({ masterId: 'm1' });
            let received = null;
            system.registerHook('pulseAdded', (d) => { received = d; });
            system.addPulse(beat.beatId, 'p-x');
            expect(received).not.toBeNull();
            expect(received.pulse).toBe('p-x');
        });

        it('should append multiple pulses', () => {
            const { beat } = system.recruitBeat({ masterId: 'm1' });
            system.addPulse(beat.beatId, 'a');
            system.addPulse(beat.beatId, 'b');
            system.addPulse(beat.beatId, 'c');
            expect(beat.pulses).toEqual(['a', 'b', 'c']);
        });
    });

    describe('raiseStrength', () => {
        it('should raise with default amount', () => {
            const { beat } = system.recruitBeat({ masterId: 'm1' });
            system.raiseStrength(beat.beatId);
            expect(beat.strength).toBe(25);
        });
        it('should raise with custom amount', () => {
            const { beat } = system.recruitBeat({ masterId: 'm1' });
            system.raiseStrength(beat.beatId, 15);
            expect(beat.strength).toBe(35);
        });
        it('should reject missing beat', () => {
            const result = system.raiseStrength('ghost', 5);
            expect(result.error).toBe('BEAT_NOT_FOUND');
        });
        it('should trigger strengthRaised hook', () => {
            const { beat } = system.recruitBeat({ masterId: 'm1' });
            let received = null;
            system.registerHook('strengthRaised', (d) => { received = d; });
            system.raiseStrength(beat.beatId, 7);
            expect(received.newStrength).toBe(27);
        });
    });

    describe('levelUpBeat', () => {
        it('should increment level', () => {
            const { beat } = system.recruitBeat({ masterId: 'm1' });
            system.levelUpBeat(beat.beatId);
            expect(beat.level).toBe(2);
            system.levelUpBeat(beat.beatId);
            expect(beat.level).toBe(3);
        });
        it('should reject missing beat', () => {
            const result = system.levelUpBeat('ghost');
            expect(result.error).toBe('BEAT_NOT_FOUND');
        });
        it('should trigger beatLeveledUp hook', () => {
            const { beat } = system.recruitBeat({ masterId: 'm1' });
            let received = null;
            system.registerHook('beatLeveledUp', (d) => { received = d; });
            system.levelUpBeat(beat.beatId);
            expect(received.newLevel).toBe(2);
        });
    });

    describe('legendBeat', () => {
        it('should set status to legendary', () => {
            const { beat } = system.recruitBeat({ masterId: 'm1' });
            system.legendBeat(beat.beatId);
            expect(beat.status).toBe('legendary');
        });
        it('should reject missing beat', () => {
            const result = system.legendBeat('ghost');
            expect(result.error).toBe('BEAT_NOT_FOUND');
        });
        it('should trigger beatLegendized hook', () => {
            const { beat } = system.recruitBeat({ masterId: 'm1' });
            let called = false;
            system.registerHook('beatLegendized', () => { called = true; });
            system.legendBeat(beat.beatId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBeatValue', () => {
        it('should calculate: level*100 + strength*2 + pulses*30', () => {
            const { beat } = system.recruitBeat({ masterId: 'm1', strength: 30 });
            system.addPulse(beat.beatId, 'p1');
            system.addPulse(beat.beatId, 'p2');
            system.levelUpBeat(beat.beatId);
            // level=2, strength=30, pulses=2 -> 200 + 60 + 60 = 320
            expect(system.calculateBeatValue(beat.beatId)).toBe(320);
        });
        it('should return 0 for missing', () => {
            expect(system.calculateBeatValue('ghost')).toBe(0);
        });
        it('should recompute after raiseStrength', () => {
            const { beat } = system.recruitBeat({ masterId: 'm1' });
            // level=1, strength=20, pulses=0 -> 100 + 40 + 0 = 140
            expect(system.calculateBeatValue(beat.beatId)).toBe(140);
            system.raiseStrength(beat.beatId, 10);
            // level=1, strength=30, pulses=0 -> 100 + 60 + 0 = 160
            expect(system.calculateBeatValue(beat.beatId)).toBe(160);
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
        it('should execute default getBeat tool', () => {
            const result = system.executeTool('getBeat', { beatId: 'ghost' });
            expect(result.success).toBe(true);
            expect(result.result).toBeNull();
        });
        it('should execute default recruitBeat tool', () => {
            const result = system.executeTool('recruitBeat', { masterId: 'mx', name: 'A', type: 'spirit' });
            expect(result.success).toBe(true);
            expect(result.result.beat.type).toBe('spirit');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const off = system.registerHook('beatRecruited', () => count++);
            off();
            system.recruitBeat({ masterId: 'm1' });
            expect(count).toBe(0);
        });
        it('should swallow handler errors', () => {
            system.registerHook('beatRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitBeat({ masterId: 'm1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient beats', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when threshold met', () => {
            system.stats.totalBeats = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double-evolve', () => {
            system.stats.totalBeats = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitBeat({ masterId: 'm1' });
            const json = system.toJSON();
            expect(json.beats.length).toBe(1);
            expect(json.stats.totalBeats).toBe(1);
        });
        it('should deserialize from JSON', () => {
            system.recruitBeat({ masterId: 'm1' });
            const json = system.toJSON();
            const fresh = new CultivationBeat();
            fresh.fromJSON(json);
            expect(fresh.beats.size).toBe(1);
            expect(fresh.stats.totalBeats).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with count', () => {
            system.recruitBeat({ masterId: 'm1' });
            const stats = system.getStats();
            expect(stats.beatCount).toBe(1);
            expect(stats.totalBeats).toBe(1);
        });
    });
});
