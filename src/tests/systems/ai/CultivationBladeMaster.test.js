/**
 * CultivationBladeMaster.test.js - 修真刀圣系统测试
 * V635 Iteration 18/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBladeMaster } from '../../../systems/ai/CultivationBladeMaster.js';

describe('CultivationBladeMaster', () => {
    let system;
    beforeEach(() => { system = new CultivationBladeMaster(); });

    describe('recruitBladeMaster', () => {
        it('should recruit with default values', () => {
            const { master } = system.recruitBladeMaster({ name: 'BladeSage' });
            expect(master.name).toBe('BladeSage');
            expect(master.type).toBe('single');
            expect(master.level).toBe(1);
            expect(master.status).toBe('novice');
            expect(master.bladeAura).toBe(20);
            expect(master.blades).toEqual([]);
        });

        it('should accept custom data', () => {
            const { master } = system.recruitBladeMaster({
                masterId: 'bm_custom',
                name: 'TwinFang',
                type: 'dual',
                bladeAura: 50,
                level: 3,
                status: 'veteran',
                blades: ['jade-blade']
            });
            expect(master.masterId).toBe('bm_custom');
            expect(master.type).toBe('dual');
            expect(master.bladeAura).toBe(50);
            expect(master.level).toBe(3);
            expect(master.status).toBe('veteran');
            expect(master.blades.length).toBe(1);
        });

        it('should generate id when missing', () => {
            const { master } = system.recruitBladeMaster({});
            expect(master.masterId).toMatch(/^bdm_/);
        });

        it('should accept curved type', () => {
            const { master } = system.recruitBladeMaster({ type: 'curved' });
            expect(master.type).toBe('curved');
        });

        it('should trigger bladeMasterRecruited hook', () => {
            let called = false;
            system.registerHook('bladeMasterRecruited', () => { called = true; });
            system.recruitBladeMaster({});
            expect(called).toBe(true);
        });
    });

    describe('getBladeMaster', () => {
        it('should return master', () => {
            const { master } = system.recruitBladeMaster({ name: 'A' });
            const result = system.getBladeMaster(master.masterId);
            expect(result).not.toBeNull();
            expect(result.name).toBe('A');
        });

        it('should return null for missing', () => {
            expect(system.getBladeMaster('ghost')).toBeNull();
        });
    });

    describe('listBladeMasters', () => {
        it('should list all', () => {
            system.recruitBladeMaster({});
            system.recruitBladeMaster({});
            expect(system.listBladeMasters().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listBladeMasters()).toEqual([]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId2', () => {
            system.recruitBladeMaster({ masterId2: 'm1' });
            system.recruitBladeMaster({ masterId2: 'm2' });
            system.recruitBladeMaster({ masterId2: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { master: m1 } = system.recruitBladeMaster({ status: 'novice' });
            const { master: m2 } = system.recruitBladeMaster({ status: 'legendary' });
            system.legendBladeMaster(m1.masterId);
            const result = system.listLegendary();
            expect(result.length).toBe(2);
            expect(result.map(r => r.masterId)).toContain(m2.masterId);
        });
    });

    describe('addBlade', () => {
        it('should add blade to master', () => {
            const { master } = system.recruitBladeMaster({});
            system.addBlade(master.masterId, 'iron-blade');
            const updated = system.getBladeMaster(master.masterId);
            expect(updated.blades).toContain('iron-blade');
        });

        it('should add multiple blades', () => {
            const { master } = system.recruitBladeMaster({});
            system.addBlade(master.masterId, 'blade-1');
            system.addBlade(master.masterId, 'blade-2');
            expect(system.getBladeMaster(master.masterId).blades.length).toBe(2);
        });

        it('should reject missing master', () => {
            const result = system.addBlade('ghost', 'blade');
            expect(result.error).toBe('BLADE_MASTER_NOT_FOUND');
        });

        it('should trigger bladeAdded hook', () => {
            const { master } = system.recruitBladeMaster({});
            let received = null;
            system.registerHook('bladeAdded', (data) => { received = data; });
            system.addBlade(master.masterId, 'wind-cutter');
            expect(received.blade).toBe('wind-cutter');
        });
    });

    describe('sharpenAura', () => {
        it('should sharpen with default amount', () => {
            const { master } = system.recruitBladeMaster({});
            system.sharpenAura(master.masterId);
            expect(master.bladeAura).toBe(25);
        });

        it('should sharpen with custom amount', () => {
            const { master } = system.recruitBladeMaster({});
            system.sharpenAura(master.masterId, 10);
            expect(master.bladeAura).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.sharpenAura('ghost', 10);
            expect(result.error).toBe('BLADE_MASTER_NOT_FOUND');
        });

        it('should trigger auraSharpened hook', () => {
            const { master } = system.recruitBladeMaster({});
            let called = false;
            system.registerHook('auraSharpened', () => { called = true; });
            system.sharpenAura(master.masterId, 7);
            expect(called).toBe(true);
        });
    });

    describe('levelUpBladeMaster', () => {
        it('should level up', () => {
            const { master } = system.recruitBladeMaster({});
            system.levelUpBladeMaster(master.masterId);
            expect(master.level).toBe(2);
            system.levelUpBladeMaster(master.masterId);
            expect(master.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpBladeMaster('ghost');
            expect(result.error).toBe('BLADE_MASTER_NOT_FOUND');
        });

        it('should trigger bladeMasterLeveledUp hook', () => {
            const { master } = system.recruitBladeMaster({});
            let received = null;
            system.registerHook('bladeMasterLeveledUp', (d) => { received = d; });
            system.levelUpBladeMaster(master.masterId);
            expect(received.newLevel).toBe(2);
        });
    });

    describe('legendBladeMaster', () => {
        it('should set legendary status', () => {
            const { master } = system.recruitBladeMaster({ status: 'novice' });
            system.legendBladeMaster(master.masterId);
            expect(master.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendBladeMaster('ghost');
            expect(result.error).toBe('BLADE_MASTER_NOT_FOUND');
        });

        it('should trigger bladeMasterLegendized hook', () => {
            const { master } = system.recruitBladeMaster({});
            let called = false;
            system.registerHook('bladeMasterLegendized', () => { called = true; });
            system.legendBladeMaster(master.masterId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBladeMasterValue', () => {
        it('should calculate value', () => {
            const { master } = system.recruitBladeMaster({ level: 2, bladeAura: 10 });
            system.addBlade(master.masterId, 'b1');
            system.addBlade(master.masterId, 'b2');
            // 2*100 + 10*2 + 2*30 = 200 + 20 + 60 = 280
            expect(system.calculateBladeMasterValue(master.masterId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBladeMasterValue('ghost')).toBe(0);
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

        it('should execute default getBladeMaster', () => {
            const result = system.executeTool('getBladeMaster', { masterId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('bladeMasterRecruited', () => count++);
            unregister();
            system.recruitBladeMaster({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('bladeMasterRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitBladeMaster({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBladeMasters = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalBladeMasters = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitBladeMaster({});
            const json = system.toJSON();
            expect(json.blademasters.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitBladeMaster({});
            const json = system.toJSON();
            const newSys = new CultivationBladeMaster();
            newSys.fromJSON(json);
            expect(newSys.blademasters.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.bladeMasterCount).toBe(0);
            expect(stats.totalBladeMasters).toBe(0);
        });
    });
});
