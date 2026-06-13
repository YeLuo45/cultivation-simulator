/**
 * CultivationPitch.test.js - 修真音高系统测试
 * V791 Iteration 24/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPitch } from '../../../systems/ai/CultivationPitch.js';

describe('CultivationPitch', () => {
    let system;
    beforeEach(() => { system = new CultivationPitch(); });

    describe('recruitPitch', () => {
        it('should recruit a pitch with masterId', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1', name: 'Celestial Aria' });
            expect(pitch.masterId).toBe('m1');
            expect(pitch.name).toBe('Celestial Aria');
        });

        it('should default name to Unnamed Pitch', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            expect(pitch.name).toBe('Unnamed Pitch');
        });

        it('should default type to middle', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            expect(pitch.type).toBe('middle');
        });

        it('should accept type override', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1', type: 'high' });
            expect(pitch.type).toBe('high');
        });

        it('should default altitude to baseAltitude', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            expect(pitch.altitude).toBe(20);
        });

        it('should default harmonics to empty array', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            expect(pitch.harmonics).toEqual([]);
        });

        it('should start at level 1', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            expect(pitch.level).toBe(1);
        });

        it('should start with novice status', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            expect(pitch.status).toBe('novice');
        });

        it('should generate pitchId', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            expect(pitch.pitchId).toBeTruthy();
        });

        it('should increment totalPitches stat', () => {
            system.recruitPitch({ masterId: 'm1' });
            expect(system.stats.totalPitches).toBe(1);
        });

        it('should trigger pitchRecruited hook', () => {
            let called = false;
            system.registerHook('pitchRecruited', () => { called = true; });
            system.recruitPitch({ masterId: 'm1' });
            expect(called).toBe(true);
        });
    });

    describe('getPitch', () => {
        it('should return pitch by id', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            const fetched = system.getPitch(pitch.pitchId);
            expect(fetched).not.toBeNull();
            expect(fetched.pitchId).toBe(pitch.pitchId);
        });

        it('should return null for missing pitch', () => {
            expect(system.getPitch('ghost')).toBeNull();
        });
    });

    describe('listPitches', () => {
        it('should list all pitches', () => {
            system.recruitPitch({ masterId: 'm1' });
            system.recruitPitch({ masterId: 'm2' });
            expect(system.listPitches().length).toBe(2);
        });

        it('should return empty array when no pitches', () => {
            expect(system.listPitches()).toEqual([]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitPitch({ masterId: 'm1' });
            system.recruitPitch({ masterId: 'm2' });
            system.recruitPitch({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitPitch({ masterId: 'm1' });
            expect(system.listByMaster('unknown')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary pitches', () => {
            const { pitch: p1 } = system.recruitPitch({ masterId: 'm1' });
            const { pitch: p2 } = system.recruitPitch({ masterId: 'm1' });
            system.legendPitch(p2.pitchId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].pitchId).toBe(p2.pitchId);
        });

        it('should return empty when none legendary', () => {
            system.recruitPitch({ masterId: 'm1' });
            expect(system.listLegendary()).toEqual([]);
        });
    });

    describe('addHarmonic', () => {
        it('should add harmonic to pitch', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            system.addHarmonic(pitch.pitchId, 'resonance-1');
            expect(pitch.harmonics).toContain('resonance-1');
        });

        it('should reject missing pitch', () => {
            const result = system.addHarmonic('ghost', 'resonance-1');
            expect(result.error).toBe('PITCH_NOT_FOUND');
        });

        it('should trigger harmonicAdded hook', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            let called = false;
            system.registerHook('harmonicAdded', () => { called = true; });
            system.addHarmonic(pitch.pitchId, 'r1');
            expect(called).toBe(true);
        });
    });

    describe('raiseAltitude', () => {
        it('should raise altitude by default 5', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            system.raiseAltitude(pitch.pitchId);
            expect(pitch.altitude).toBe(25);
        });

        it('should raise altitude by custom amount', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            system.raiseAltitude(pitch.pitchId, 10);
            expect(pitch.altitude).toBe(30);
        });

        it('should reject missing pitch', () => {
            const result = system.raiseAltitude('ghost');
            expect(result.error).toBe('PITCH_NOT_FOUND');
        });

        it('should trigger altitudeRaised hook', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            let called = false;
            system.registerHook('altitudeRaised', () => { called = true; });
            system.raiseAltitude(pitch.pitchId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpPitch', () => {
        it('should increment level', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            system.levelUpPitch(pitch.pitchId);
            expect(pitch.level).toBe(2);
        });

        it('should reject missing pitch', () => {
            const result = system.levelUpPitch('ghost');
            expect(result.error).toBe('PITCH_NOT_FOUND');
        });

        it('should trigger pitchLeveledUp hook', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            let called = false;
            system.registerHook('pitchLeveledUp', () => { called = true; });
            system.levelUpPitch(pitch.pitchId);
            expect(called).toBe(true);
        });
    });

    describe('legendPitch', () => {
        it('should set status to legendary', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            system.legendPitch(pitch.pitchId);
            expect(pitch.status).toBe('legendary');
        });

        it('should reject missing pitch', () => {
            const result = system.legendPitch('ghost');
            expect(result.error).toBe('PITCH_NOT_FOUND');
        });

        it('should trigger pitchLegendized hook', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            let called = false;
            system.registerHook('pitchLegendized', () => { called = true; });
            system.legendPitch(pitch.pitchId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePitchValue', () => {
        it('should calculate correctly with default state', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            // level=1, altitude=20, harmonics=0 -> 100 + 40 + 0 = 140
            expect(system.calculatePitchValue(pitch.pitchId)).toBe(140);
        });

        it('should account for harmonics', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            system.addHarmonic(pitch.pitchId, 'h1');
            system.addHarmonic(pitch.pitchId, 'h2');
            // level=1, altitude=20, harmonics=2 -> 100 + 40 + 60 = 200
            expect(system.calculatePitchValue(pitch.pitchId)).toBe(200);
        });

        it('should account for level', () => {
            const { pitch } = system.recruitPitch({ masterId: 'm1' });
            system.levelUpPitch(pitch.pitchId);
            system.levelUpPitch(pitch.pitchId);
            // level=3, altitude=20, harmonics=0 -> 300 + 40 + 0 = 340
            expect(system.calculatePitchValue(pitch.pitchId)).toBe(340);
        });

        it('should return 0 for missing pitch', () => {
            expect(system.calculatePitchValue('ghost')).toBe(0);
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

        it('should handle tool errors', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('x');
        });

        it('should execute default getPitch tool', () => {
            const result = system.executeTool('getPitch', { pitchId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('pitchRecruited', () => count++);
            unregister();
            system.recruitPitch({ masterId: 'm1' });
            expect(count).toBe(0);
        });

        it('should handle hook errors silently', () => {
            system.registerHook('pitchRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitPitch({ masterId: 'm1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient pitches', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve with sufficient pitches', () => {
            system.stats.totalPitches = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPitches = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitPitch({ masterId: 'm1' });
            const json = system.toJSON();
            expect(json.pitches.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitPitch({ masterId: 'm1' });
            const json = system.toJSON();
            const newSys = new CultivationPitch();
            newSys.fromJSON(json);
            expect(newSys.pitches.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with pitchCount', () => {
            const stats = system.getStats();
            expect(stats.pitchCount).toBe(0);
            expect(stats.totalPitches).toBe(0);
        });
    });
});
