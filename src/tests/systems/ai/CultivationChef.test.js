/**
 * CultivationChef.test.js - 修真厨师测试
 * V708 Iteration 1/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationChef } from '../../../systems/ai/CultivationChef.js';

describe('CultivationChef', () => {
    let system;
    beforeEach(() => { system = new CultivationChef(); });

    describe('recruitChef', () => {
        it('should recruit', () => {
            const { chef } = system.recruitChef({ masterId: 'm1', name: 'Master Iron Wok', type: 'heavenly' });
            expect(chef.masterId).toBe('m1');
            expect(chef.name).toBe('Master Iron Wok');
            expect(chef.type).toBe('heavenly');
        });

        it('should trigger chefRecruited hook', () => {
            let called = false;
            system.registerHook('chefRecruited', () => { called = true; });
            system.recruitChef({});
            expect(called).toBe(true);
        });

        it('should set default status to novice', () => {
            const { chef } = system.recruitChef({});
            expect(chef.status).toBe('novice');
        });

        it('should set default culinary to baseCulinary', () => {
            const { chef } = system.recruitChef({});
            expect(chef.culinary).toBe(20);
        });

        it('should set default dishes to empty array', () => {
            const { chef } = system.recruitChef({});
            expect(chef.dishes).toEqual([]);
        });

        it('should set default level to 1', () => {
            const { chef } = system.recruitChef({});
            expect(chef.level).toBe(1);
        });
    });

    describe('getChef', () => {
        it('should return', () => {
            const { chef } = system.recruitChef({});
            expect(system.getChef(chef.chefId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getChef('ghost')).toBeNull(); });
    });

    describe('listChefs', () => {
        it('should list all', () => {
            system.recruitChef({});
            system.recruitChef({});
            expect(system.listChefs().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listChefs().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitChef({ masterId: 'm1' });
            system.recruitChef({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty when none match', () => {
            system.recruitChef({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { chef } = system.recruitChef({});
            system.legendChef(chef.chefId);
            system.recruitChef({});
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitChef({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addDish', () => {
        it('should add dish', () => {
            const { chef } = system.recruitChef({});
            system.addDish(chef.chefId, 'Dragon Dumplings');
            expect(chef.dishes.length).toBe(1);
            expect(chef.dishes[0]).toBe('Dragon Dumplings');
        });

        it('should add multiple dishes', () => {
            const { chef } = system.recruitChef({});
            system.addDish(chef.chefId, 'Dragon Dumplings');
            system.addDish(chef.chefId, 'Phoenix Soup');
            expect(chef.dishes.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addDish('ghost', 'Dragon Dumplings');
            expect(result.error).toBe('CHEF_NOT_FOUND');
        });

        it('should trigger dishAdded hook', () => {
            const { chef } = system.recruitChef({});
            let called = false;
            system.registerHook('dishAdded', () => { called = true; });
            system.addDish(chef.chefId, 'Dragon Dumplings');
            expect(called).toBe(true);
        });
    });

    describe('raiseCulinary', () => {
        it('should raise culinary by default', () => {
            const { chef } = system.recruitChef({});
            system.raiseCulinary(chef.chefId);
            expect(chef.culinary).toBe(25);
        });

        it('should raise culinary by amount', () => {
            const { chef } = system.recruitChef({});
            system.raiseCulinary(chef.chefId, 15);
            expect(chef.culinary).toBe(35);
        });

        it('should reject missing', () => {
            const result = system.raiseCulinary('ghost', 10);
            expect(result.error).toBe('CHEF_NOT_FOUND');
        });

        it('should trigger culinaryRaised hook', () => {
            const { chef } = system.recruitChef({});
            let called = false;
            system.registerHook('culinaryRaised', () => { called = true; });
            system.raiseCulinary(chef.chefId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpChef', () => {
        it('should level up', () => {
            const { chef } = system.recruitChef({});
            system.levelUpChef(chef.chefId);
            expect(chef.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { chef } = system.recruitChef({});
            system.levelUpChef(chef.chefId);
            system.levelUpChef(chef.chefId);
            system.levelUpChef(chef.chefId);
            expect(chef.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpChef('ghost');
            expect(result.error).toBe('CHEF_NOT_FOUND');
        });

        it('should trigger chefLeveledUp hook', () => {
            const { chef } = system.recruitChef({});
            let called = false;
            system.registerHook('chefLeveledUp', () => { called = true; });
            system.levelUpChef(chef.chefId);
            expect(called).toBe(true);
        });
    });

    describe('legendChef', () => {
        it('should mark as legendary', () => {
            const { chef } = system.recruitChef({});
            system.legendChef(chef.chefId);
            expect(chef.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendChef('ghost');
            expect(result.error).toBe('CHEF_NOT_FOUND');
        });

        it('should trigger chefLegendized hook', () => {
            const { chef } = system.recruitChef({});
            let called = false;
            system.registerHook('chefLegendized', () => { called = true; });
            system.legendChef(chef.chefId);
            expect(called).toBe(true);
        });
    });

    describe('calculateChefValue', () => {
        it('should calculate', () => {
            const { chef } = system.recruitChef({});
            // level=1, culinary=20, dishes=0: 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateChefValue(chef.chefId)).toBe(140);
        });

        it('should calculate with dishes', () => {
            const { chef } = system.recruitChef({});
            system.addDish(chef.chefId, 'Dragon Dumplings');
            system.addDish(chef.chefId, 'Phoenix Soup');
            // level=1, culinary=20, dishes=2: 100 + 40 + 60 = 200
            expect(system.calculateChefValue(chef.chefId)).toBe(200);
        });

        it('should calculate with level up and culinary raised', () => {
            const { chef } = system.recruitChef({});
            system.levelUpChef(chef.chefId);
            system.levelUpChef(chef.chefId);
            system.raiseCulinary(chef.chefId, 30);
            // level=3, culinary=50, dishes=0: 300 + 100 + 0 = 400
            expect(system.calculateChefValue(chef.chefId)).toBe(400);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateChefValue('ghost')).toBe(0);
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

        it('should execute default getChef', () => {
            const result = system.executeTool('getChef', { chefId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('chefRecruited', () => count++);
            unregister();
            system.recruitChef({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('chefRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitChef({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalChefs = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalChefs = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitChef({});
            const json = system.toJSON();
            expect(json.chefs.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitChef({});
            const json = system.toJSON();
            const newSys = new CultivationChef();
            newSys.fromJSON(json);
            expect(newSys.chefs.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.chefCount).toBe(0);
        });
    });
});
