/**
 * CultivationResonance.test.js - 修真共鸣测试
 * V746 Iteration 9/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationResonance } from '../../../systems/ai/CultivationResonance.js';

describe('CultivationResonance', () => {
    let system;
    beforeEach(() => { system = new CultivationResonance(); });

    describe('recruitResonance', () => {
        it('should recruit', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1', name: 'Echo1', type: 'harmonic' });
            expect(resonance.masterId).toBe('m1');
            expect(resonance.name).toBe('Echo1');
            expect(resonance.type).toBe('harmonic');
        });

        it('should default name to unnamed', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            expect(resonance.name).toBe('unnamed');
        });

        it('should default type to harmonic', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            expect(resonance.type).toBe('harmonic');
        });

        it('should default harmony to baseHarmony', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            expect(resonance.harmony).toBe(20);
        });

        it('should set level to 1 and status to novice', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            expect(resonance.level).toBe(1);
            expect(resonance.status).toBe('novice');
        });

        it('should init empty echoes', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            expect(resonance.echoes).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            expect(resonance.resonanceId).toBeTruthy();
        });

        it('should respect provided id', () => {
            const { resonance } = system.recruitResonance({ id: 'custom-res', masterId: 'm1' });
            expect(resonance.resonanceId).toBe('custom-res');
        });

        it('should accept custom echoes', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1', echoes: ['e1', 'e2'] });
            expect(resonance.echoes.length).toBe(2);
        });

        it('should accept custom harmony', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1', harmony: 99 });
            expect(resonance.harmony).toBe(99);
        });

        it('should accept dissonant type', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1', type: 'dissonant' });
            expect(resonance.type).toBe('dissonant');
        });

        it('should accept perfect type', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1', type: 'perfect' });
            expect(resonance.type).toBe('perfect');
        });

        it('should increment totalResonances', () => {
            system.recruitResonance({ masterId: 'm1' });
            expect(system.stats.totalResonances).toBe(1);
        });

        it('should trigger resonanceRecruited hook', () => {
            let called = false;
            system.registerHook('resonanceRecruited', () => { called = true; });
            system.recruitResonance({ masterId: 'm1' });
            expect(called).toBe(true);
        });
    });

    describe('getResonance', () => {
        it('should return resonance', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            expect(system.getResonance(resonance.resonanceId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getResonance('ghost')).toBeNull(); });
    });

    describe('listResonances', () => {
        it('should list all', () => {
            system.recruitResonance({ masterId: 'm1' });
            system.recruitResonance({ masterId: 'm2' });
            expect(system.listResonances().length).toBe(2);
        });

        it('should return empty array when none', () => {
            expect(system.listResonances().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitResonance({ masterId: 'm1' });
            system.recruitResonance({ masterId: 'm2' });
            system.recruitResonance({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitResonance({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { resonance: r1 } = system.recruitResonance({ masterId: 'm1' });
            system.recruitResonance({ masterId: 'm1' });
            system.legendResonance(r1.resonanceId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitResonance({ masterId: 'm1' });
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addEcho', () => {
        it('should add echo', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            system.addEcho(resonance.resonanceId, 'e1');
            expect(resonance.echoes.length).toBe(1);
            expect(resonance.echoes[0]).toBe('e1');
        });

        it('should reject missing resonance', () => {
            const result = system.addEcho('ghost', 'e1');
            expect(result.error).toBe('RESONANCE_NOT_FOUND');
        });

        it('should promote to veteran at 3 echoes', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            system.addEcho(resonance.resonanceId, 'e1');
            system.addEcho(resonance.resonanceId, 'e2');
            system.addEcho(resonance.resonanceId, 'e3');
            expect(resonance.status).toBe('veteran');
        });

        it('should not promote past veteran', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            system.legendResonance(resonance.resonanceId);
            system.addEcho(resonance.resonanceId, 'e1');
            system.addEcho(resonance.resonanceId, 'e2');
            system.addEcho(resonance.resonanceId, 'e3');
            expect(resonance.status).toBe('legendary');
        });

        it('should trigger echoAdded hook', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            let called = false;
            system.registerHook('echoAdded', () => { called = true; });
            system.addEcho(resonance.resonanceId, 'e1');
            expect(called).toBe(true);
        });
    });

    describe('raiseHarmony', () => {
        it('should raise by default 5', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            system.raiseHarmony(resonance.resonanceId);
            expect(resonance.harmony).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            system.raiseHarmony(resonance.resonanceId, 50);
            expect(resonance.harmony).toBe(70);
        });

        it('should reject missing resonance', () => {
            const result = system.raiseHarmony('ghost', 5);
            expect(result.error).toBe('RESONANCE_NOT_FOUND');
        });

        it('should trigger harmonyRaised hook', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            let called = false;
            system.registerHook('harmonyRaised', () => { called = true; });
            system.raiseHarmony(resonance.resonanceId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpResonance', () => {
        it('should level up', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            system.levelUpResonance(resonance.resonanceId);
            expect(resonance.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            system.levelUpResonance(resonance.resonanceId);
            system.levelUpResonance(resonance.resonanceId);
            system.levelUpResonance(resonance.resonanceId);
            expect(resonance.level).toBe(4);
        });

        it('should reject missing resonance', () => {
            const result = system.levelUpResonance('ghost');
            expect(result.error).toBe('RESONANCE_NOT_FOUND');
        });

        it('should trigger resonanceLeveledUp hook', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            let called = false;
            system.registerHook('resonanceLeveledUp', () => { called = true; });
            system.levelUpResonance(resonance.resonanceId);
            expect(called).toBe(true);
        });
    });

    describe('legendResonance', () => {
        it('should set status to legendary', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            system.legendResonance(resonance.resonanceId);
            expect(resonance.status).toBe('legendary');
        });

        it('should reject missing resonance', () => {
            const result = system.legendResonance('ghost');
            expect(result.error).toBe('RESONANCE_NOT_FOUND');
        });

        it('should trigger resonanceLegendized hook', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            let called = false;
            system.registerHook('resonanceLegendized', () => { called = true; });
            system.legendResonance(resonance.resonanceId);
            expect(called).toBe(true);
        });
    });

    describe('calculateResonanceValue', () => {
        it('should calculate base value', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            // level=1, harmony=20, echoes=0 -> 100 + 40 + 0 = 140
            expect(system.calculateResonanceValue(resonance.resonanceId)).toBe(140);
        });

        it('should factor in level', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            system.levelUpResonance(resonance.resonanceId);
            system.levelUpResonance(resonance.resonanceId);
            // level=3, harmony=20, echoes=0 -> 300 + 40 + 0 = 340
            expect(system.calculateResonanceValue(resonance.resonanceId)).toBe(340);
        });

        it('should factor in echoes', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            system.addEcho(resonance.resonanceId, 'e1');
            system.addEcho(resonance.resonanceId, 'e2');
            // level=1, harmony=20, echoes=2 -> 100 + 40 + 60 = 200
            expect(system.calculateResonanceValue(resonance.resonanceId)).toBe(200);
        });

        it('should factor in harmony', () => {
            const { resonance } = system.recruitResonance({ masterId: 'm1' });
            system.raiseHarmony(resonance.resonanceId, 30);
            // level=1, harmony=50, echoes=0 -> 100 + 100 + 0 = 200
            expect(system.calculateResonanceValue(resonance.resonanceId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateResonanceValue('ghost')).toBe(0);
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

        it('should execute default getResonance', () => {
            const result = system.executeTool('getResonance', { resonanceId: 'ghost' });
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
            const unregister = system.registerHook('resonanceRecruited', () => count++);
            unregister();
            system.recruitResonance({ masterId: 'm1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('resonanceRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitResonance({ masterId: 'm1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalResonances = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalResonances = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitResonance({ masterId: 'm1' });
            const json = system.toJSON();
            expect(json.resonances.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitResonance({ masterId: 'm1' });
            const json = system.toJSON();
            const newSys = new CultivationResonance();
            newSys.fromJSON(json);
            expect(newSys.resonances.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.resonanceCount).toBe(0);
            expect(stats.totalResonances).toBe(0);
        });
    });

    describe('config defaults', () => {
        it('should accept custom config', () => {
            const sys = new CultivationResonance({ maxResonances: 50, baseHarmony: 10 });
            expect(sys.config.maxResonances).toBe(50);
            expect(sys.config.baseHarmony).toBe(10);
        });
    });
});
