/**
 * SpiritInfusion.test.js - 灵器附灵系统测试
 * V511 Iteration 13/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SpiritInfusion } from '../../../systems/ai/SpiritInfusion.js';

describe('SpiritInfusion', () => {
    let system;
    beforeEach(() => { system = new SpiritInfusion(); });

    describe('beginInfusion', () => {
        it('should begin with defaults', () => {
            const { infusion } = system.beginInfusion({});
            expect(infusion.masterId).toBe('unknown_master');
            expect(infusion.weaponName).toBe('unnamed_weapon');
            expect(infusion.spirits).toEqual([]);
            expect(infusion.harmony).toBe(20);
            expect(infusion.power).toBe(0);
            expect(infusion.status).toBe('in-progress');
        });

        it('should begin with custom data', () => {
            const { infusion } = system.beginInfusion({ masterId: 'm1', weaponName: 'SpiritSword', spirits: ['flame'], harmony: 50, power: 25 });
            expect(infusion.masterId).toBe('m1');
            expect(infusion.weaponName).toBe('SpiritSword');
            expect(infusion.spirits).toEqual(['flame']);
            expect(infusion.harmony).toBe(50);
            expect(infusion.power).toBe(25);
        });

        it('should respect custom config baseHarmony', () => {
            const custom = new SpiritInfusion({ baseHarmony: 60 });
            const { infusion } = custom.beginInfusion({});
            expect(infusion.harmony).toBe(60);
        });

        it('should increment totalInfusions', () => {
            system.beginInfusion({});
            system.beginInfusion({});
            system.beginInfusion({});
            expect(system.stats.totalInfusions).toBe(3);
        });

        it('should generate unique infusion ids', () => {
            const a = system.beginInfusion({});
            const b = system.beginInfusion({});
            expect(a.infusion.infusionId).not.toBe(b.infusion.infusionId);
        });

        it('should respect provided id', () => {
            const { infusion } = system.beginInfusion({ id: 'fixed_id_123' });
            expect(infusion.infusionId).toBe('fixed_id_123');
        });

        it('should trigger infusionBegun hook', () => {
            let called = false;
            system.registerHook('infusionBegun', () => { called = true; });
            system.beginInfusion({});
            expect(called).toBe(true);
        });
    });

    describe('getInfusion', () => {
        it('should return infusion', () => {
            const { infusion } = system.beginInfusion({});
            const got = system.getInfusion(infusion.infusionId);
            expect(got).not.toBeNull();
            expect(got.infusionId).toBe(infusion.infusionId);
        });
        it('should return null for missing', () => { expect(system.getInfusion('ghost')).toBeNull(); });
    });

    describe('listInfusions', () => {
        it('should list all', () => {
            system.beginInfusion({});
            system.beginInfusion({});
            system.beginInfusion({});
            expect(system.listInfusions().length).toBe(3);
        });

        it('should return empty list when no infusions', () => {
            expect(system.listInfusions().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.beginInfusion({ masterId: 'm1' });
            system.beginInfusion({ masterId: 'm1' });
            system.beginInfusion({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listHarmonized', () => {
        it('should list only harmonized infusions', () => {
            const { infusion: i1 } = system.beginInfusion({});
            const { infusion: i2 } = system.beginInfusion({});
            i1.status = 'harmonized';
            i2.status = 'sealed';
            expect(system.listHarmonized().length).toBe(1);
            expect(system.listHarmonized()[0].infusionId).toBe(i1.infusionId);
        });

        it('should return empty when none harmonized', () => {
            system.beginInfusion({});
            system.beginInfusion({});
            expect(system.listHarmonized().length).toBe(0);
        });
    });

    describe('addSpirit', () => {
        it('should add a spirit', () => {
            const { infusion } = system.beginInfusion({});
            system.addSpirit(infusion.infusionId, 'flame');
            expect(infusion.spirits).toContain('flame');
            expect(infusion.spirits.length).toBe(1);
        });

        it('should add multiple spirits', () => {
            const { infusion } = system.beginInfusion({});
            system.addSpirit(infusion.infusionId, 'flame');
            system.addSpirit(infusion.infusionId, 'frost');
            expect(infusion.spirits).toEqual(['flame', 'frost']);
        });

        it('should reject missing', () => {
            const result = system.addSpirit('ghost', 'flame');
            expect(result.error).toBe('INFUSION_NOT_FOUND');
        });

        it('should trigger spiritAdded hook', () => {
            const { infusion } = system.beginInfusion({});
            let called = false;
            system.registerHook('spiritAdded', () => { called = true; });
            system.addSpirit(infusion.infusionId, 'flame');
            expect(called).toBe(true);
        });
    });

    describe('increaseHarmony', () => {
        it('should increase by default amount', () => {
            const { infusion } = system.beginInfusion({});
            system.increaseHarmony(infusion.infusionId);
            expect(infusion.harmony).toBe(25);
        });

        it('should increase by custom amount', () => {
            const { infusion } = system.beginInfusion({});
            system.increaseHarmony(infusion.infusionId, 30);
            expect(infusion.harmony).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.increaseHarmony('ghost', 5);
            expect(result.error).toBe('INFUSION_NOT_FOUND');
        });

        it('should trigger harmonyIncreased hook', () => {
            const { infusion } = system.beginInfusion({});
            let called = false;
            system.registerHook('harmonyIncreased', () => { called = true; });
            system.increaseHarmony(infusion.infusionId, 5);
            expect(called).toBe(true);
        });
    });

    describe('boostPower', () => {
        it('should boost by default amount', () => {
            const { infusion } = system.beginInfusion({});
            system.boostPower(infusion.infusionId);
            expect(infusion.power).toBe(10);
        });

        it('should boost by custom amount', () => {
            const { infusion } = system.beginInfusion({});
            system.boostPower(infusion.infusionId, 50);
            expect(infusion.power).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.boostPower('ghost', 5);
            expect(result.error).toBe('INFUSION_NOT_FOUND');
        });

        it('should trigger powerBoosted hook', () => {
            const { infusion } = system.beginInfusion({});
            let called = false;
            system.registerHook('powerBoosted', () => { called = true; });
            system.boostPower(infusion.infusionId, 5);
            expect(called).toBe(true);
        });
    });

    describe('sealInfusion', () => {
        it('should set status to sealed', () => {
            const { infusion } = system.beginInfusion({});
            system.sealInfusion(infusion.infusionId);
            expect(infusion.status).toBe('sealed');
        });

        it('should reject missing', () => {
            const result = system.sealInfusion('ghost');
            expect(result.error).toBe('INFUSION_NOT_FOUND');
        });

        it('should trigger infusionSealed hook', () => {
            const { infusion } = system.beginInfusion({});
            let called = false;
            system.registerHook('infusionSealed', () => { called = true; });
            system.sealInfusion(infusion.infusionId);
            expect(called).toBe(true);
        });
    });

    describe('calculateInfusionValue', () => {
        it('should calculate default value', () => {
            const { infusion } = system.beginInfusion({});
            // harmony=20 * 2 + power=0 + spirits.length=0 * 30 = 40
            expect(system.calculateInfusionValue(infusion.infusionId)).toBe(40);
        });

        it('should add 30 per spirit', () => {
            const { infusion } = system.beginInfusion({});
            system.addSpirit(infusion.infusionId, 'flame');
            system.addSpirit(infusion.infusionId, 'frost');
            // 20*2 + 0 + 2*30 = 100
            expect(system.calculateInfusionValue(infusion.infusionId)).toBe(100);
        });

        it('should reflect harmony and power in formula', () => {
            const { infusion } = system.beginInfusion({ harmony: 50, power: 30 });
            // 50*2 + 30 + 0*30 = 130
            expect(system.calculateInfusionValue(infusion.infusionId)).toBe(130);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateInfusionValue('ghost')).toBe(0);
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
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getInfusion', () => {
            const result = system.executeTool('getInfusion', { infusionId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('infusionBegun', () => count++);
            unregister();
            system.beginInfusion({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('infusionBegun', () => { throw new Error('x'); });
            expect(() => system.beginInfusion({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalInfusions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalInfusions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.beginInfusion({});
            const json = system.toJSON();
            expect(json.infusions.length).toBe(1);
            expect(json.stats.totalInfusions).toBe(1);
        });
        it('should deserialize', () => {
            system.beginInfusion({ weaponName: 'a' });
            const json = system.toJSON();
            const newSys = new SpiritInfusion();
            newSys.fromJSON(json);
            expect(newSys.infusions.size).toBe(1);
            expect(newSys.stats.totalInfusions).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.infusionCount).toBe(0);
            expect(stats.totalInfusions).toBe(0);
            system.beginInfusion({});
            expect(system.getStats().infusionCount).toBe(1);
        });
    });
});
