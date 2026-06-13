/**
 * CultivationChorus.test.js - 修真合唱系统测试
 * V782 Iteration 15/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationChorus } from '../../../systems/ai/CultivationChorus.js';

describe('CultivationChorus', () => {
    let system;
    beforeEach(() => { system = new CultivationChorus(); });

    describe('recruitChorus', () => {
        it('should recruit', () => {
            const { chorus } = system.recruitChorus({ masterId: 'm1', name: 'Sacred Chorus', type: 'folk' });
            expect(chorus.masterId).toBe('m1');
            expect(chorus.name).toBe('Sacred Chorus');
            expect(chorus.type).toBe('folk');
        });

        it('should default type to sacred', () => {
            const { chorus } = system.recruitChorus({});
            expect(chorus.type).toBe('sacred');
        });

        it('should default status to novice', () => {
            const { chorus } = system.recruitChorus({});
            expect(chorus.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { chorus } = system.recruitChorus({});
            expect(chorus.level).toBe(1);
        });

        it('should default voices to empty array', () => {
            const { chorus } = system.recruitChorus({});
            expect(chorus.voices).toEqual([]);
        });

        it('should default harmony to baseHarmony', () => {
            const { chorus } = system.recruitChorus({});
            expect(chorus.harmony).toBe(20);
        });

        it('should assign auto id when missing', () => {
            const { chorus } = system.recruitChorus({});
            expect(chorus.chorusId).toMatch(/^chorus_/);
        });

        it('should use provided chorusId', () => {
            const { chorus } = system.recruitChorus({ chorusId: 'c_explicit' });
            expect(chorus.chorusId).toBe('c_explicit');
        });

        it('should trigger chorusRecruited hook', () => {
            let called = false;
            system.registerHook('chorusRecruited', () => { called = true; });
            system.recruitChorus({});
            expect(called).toBe(true);
        });

        it('should respect custom config baseHarmony', () => {
            const customSystem = new CultivationChorus({ baseHarmony: 50 });
            const { chorus } = customSystem.recruitChorus({});
            expect(chorus.harmony).toBe(50);
        });
    });

    describe('getChorus', () => {
        it('should return', () => {
            const { chorus } = system.recruitChorus({});
            expect(system.getChorus(chorus.chorusId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getChorus('ghost')).toBeNull(); });
        it('should return a copy (not reference)', () => {
            const { chorus } = system.recruitChorus({ name: 'Original' });
            const fetched = system.getChorus(chorus.chorusId);
            fetched.name = 'Mutated';
            const refetched = system.getChorus(chorus.chorusId);
            expect(refetched.name).toBe('Original');
        });
    });

    describe('listChoruses', () => {
        it('should list all', () => {
            system.recruitChorus({});
            system.recruitChorus({});
            expect(system.listChoruses().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listChoruses().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitChorus({ masterId: 'm1' });
            system.recruitChorus({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitChorus({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { chorus: a } = system.recruitChorus({});
            const { chorus: b } = system.recruitChorus({});
            system.legendChorus(a.chorusId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.chorusId).toBeDefined();
        });

        it('should return empty when none legendary', () => {
            system.recruitChorus({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addVoice', () => {
        it('should add voice', () => {
            const { chorus } = system.recruitChorus({});
            system.addVoice(chorus.chorusId, 'soprano');
            expect(chorus.voices).toContain('soprano');
        });

        it('should add multiple voices', () => {
            const { chorus } = system.recruitChorus({});
            system.addVoice(chorus.chorusId, 'soprano');
            system.addVoice(chorus.chorusId, 'alto');
            expect(chorus.voices.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addVoice('ghost', 'soprano');
            expect(result.error).toBe('CHORUS_NOT_FOUND');
        });

        it('should trigger voiceAdded hook', () => {
            const { chorus } = system.recruitChorus({});
            let called = false;
            system.registerHook('voiceAdded', () => { called = true; });
            system.addVoice(chorus.chorusId, 'soprano');
            expect(called).toBe(true);
        });
    });

    describe('raiseHarmony', () => {
        it('should raise harmony', () => {
            const { chorus } = system.recruitChorus({});
            system.raiseHarmony(chorus.chorusId, 10);
            expect(chorus.harmony).toBe(30);
        });

        it('should default amount to 5', () => {
            const { chorus } = system.recruitChorus({});
            system.raiseHarmony(chorus.chorusId);
            expect(chorus.harmony).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseHarmony('ghost', 10);
            expect(result.error).toBe('CHORUS_NOT_FOUND');
        });

        it('should trigger harmonyRaised hook', () => {
            const { chorus } = system.recruitChorus({});
            let called = false;
            system.registerHook('harmonyRaised', () => { called = true; });
            system.raiseHarmony(chorus.chorusId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpChorus', () => {
        it('should increment level', () => {
            const { chorus } = system.recruitChorus({});
            system.levelUpChorus(chorus.chorusId);
            expect(chorus.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { chorus } = system.recruitChorus({});
            system.levelUpChorus(chorus.chorusId);
            system.levelUpChorus(chorus.chorusId);
            system.levelUpChorus(chorus.chorusId);
            expect(chorus.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpChorus('ghost');
            expect(result.error).toBe('CHORUS_NOT_FOUND');
        });
    });

    describe('legendChorus', () => {
        it('should set status to legendary', () => {
            const { chorus } = system.recruitChorus({});
            system.legendChorus(chorus.chorusId);
            expect(chorus.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendChorus('ghost');
            expect(result.error).toBe('CHORUS_NOT_FOUND');
        });

        it('should trigger chorusLegendized hook', () => {
            const { chorus } = system.recruitChorus({});
            let called = false;
            system.registerHook('chorusLegendized', () => { called = true; });
            system.legendChorus(chorus.chorusId);
            expect(called).toBe(true);
        });
    });

    describe('calculateChorusValue', () => {
        it('should calculate', () => {
            const { chorus } = system.recruitChorus({});
            system.addVoice(chorus.chorusId, 'soprano');
            // value = 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculateChorusValue(chorus.chorusId)).toBeCloseTo(170, 5);
        });

        it('should recalculate after level up', () => {
            const { chorus } = system.recruitChorus({});
            system.levelUpChorus(chorus.chorusId);
            // value = 2 * 100 + 20 * 2 + 0 * 30 = 200 + 40 + 0 = 240
            expect(system.calculateChorusValue(chorus.chorusId)).toBeCloseTo(240, 5);
        });

        it('should recalculate after harmony raise', () => {
            const { chorus } = system.recruitChorus({});
            system.raiseHarmony(chorus.chorusId, 5);
            // value = 1 * 100 + 25 * 2 + 0 * 30 = 100 + 50 + 0 = 150
            expect(system.calculateChorusValue(chorus.chorusId)).toBeCloseTo(150, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateChorusValue('ghost')).toBe(0);
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

        it('should execute default getChorus', () => {
            const result = system.executeTool('getChorus', { chorusId: 'ghost' });
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
            const unregister = system.registerHook('chorusRecruited', () => count++);
            unregister();
            system.recruitChorus({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('chorusRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitChorus({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalChoruses = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalChoruses = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitChorus({});
            const json = system.toJSON();
            expect(json.choruses.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitChorus({});
            const json = system.toJSON();
            const newSys = new CultivationChorus();
            newSys.fromJSON(json);
            expect(newSys.choruses.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitChorus({});
            const stats = system.getStats();
            expect(stats.chorusCount).toBe(1);
        });
    });
});
