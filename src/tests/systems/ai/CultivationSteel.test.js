/**
 * CultivationSteel.test.js - 修真钢系统测试
 * V854 Iteration 27/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSteel } from '../../../systems/ai/CultivationSteel.js';

describe('CultivationSteel', () => {
    let system;
    beforeEach(() => { system = new CultivationSteel(); });

    describe('recruitSteel', () => {
        it('should recruit with defaults', () => {
            const { steel } = system.recruitSteel({});
            expect(steel.masterId).toBe('unknown_master');
            expect(steel.name).toBe('unnamed_steel');
            expect(steel.type).toBe('carbon');
            expect(steel.hardness).toBe(20);
            expect(steel.alloys).toEqual([]);
            expect(steel.level).toBe(1);
            expect(steel.status).toBe('novice');
        });

        it('should recruit with custom data', () => {
            const { steel } = system.recruitSteel({
                masterId: 'm1',
                name: 'SunSteel',
                type: 'stainless',
                hardness: 80,
                alloys: ['chromium'],
                level: 3,
                status: 'veteran'
            });
            expect(steel.masterId).toBe('m1');
            expect(steel.name).toBe('SunSteel');
            expect(steel.type).toBe('stainless');
            expect(steel.hardness).toBe(80);
            expect(steel.alloys).toEqual(['chromium']);
            expect(steel.level).toBe(3);
            expect(steel.status).toBe('veteran');
        });

        it('should increment totalSteels', () => {
            system.recruitSteel({});
            system.recruitSteel({});
            expect(system.stats.totalSteels).toBe(2);
        });

        it('should trigger steelRecruited hook', () => {
            let called = false;
            system.registerHook('steelRecruited', () => { called = true; });
            system.recruitSteel({});
            expect(called).toBe(true);
        });
    });

    describe('getSteel', () => {
        it('should return steel', () => {
            const { steel } = system.recruitSteel({});
            const got = system.getSteel(steel.steelId);
            expect(got).not.toBeNull();
            expect(got.steelId).toBe(steel.steelId);
        });
        it('should return null for missing', () => { expect(system.getSteel('ghost')).toBeNull(); });
    });

    describe('listSteels', () => {
        it('should list all', () => {
            system.recruitSteel({});
            system.recruitSteel({});
            system.recruitSteel({});
            expect(system.listSteels().length).toBe(3);
        });

        it('should return empty list when no steels', () => {
            expect(system.listSteels().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitSteel({ masterId: 'm1' });
            system.recruitSteel({ masterId: 'm1' });
            system.recruitSteel({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary steels', () => {
            const { steel: s1 } = system.recruitSteel({});
            const { steel: s2 } = system.recruitSteel({});
            system.legendSteel(s1.steelId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].steelId).toBe(s1.steelId);
        });

        it('should return empty when none legendary', () => {
            system.recruitSteel({});
            system.recruitSteel({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addAlloy', () => {
        it('should add alloy', () => {
            const { steel } = system.recruitSteel({});
            system.addAlloy(steel.steelId, 'chromium');
            expect(steel.alloys).toContain('chromium');
            expect(steel.alloys.length).toBe(1);
        });

        it('should add multiple alloys', () => {
            const { steel } = system.recruitSteel({});
            system.addAlloy(steel.steelId, 'chromium');
            system.addAlloy(steel.steelId, 'nickel');
            expect(steel.alloys).toEqual(['chromium', 'nickel']);
        });

        it('should set status to veteran when 5+ alloys', () => {
            const { steel } = system.recruitSteel({});
            system.addAlloy(steel.steelId, 'a');
            system.addAlloy(steel.steelId, 'b');
            system.addAlloy(steel.steelId, 'c');
            system.addAlloy(steel.steelId, 'd');
            expect(steel.status).toBe('novice');
            system.addAlloy(steel.steelId, 'e');
            expect(steel.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.addAlloy('ghost', 'chromium');
            expect(result.error).toBe('STEEL_NOT_FOUND');
        });

        it('should trigger alloyAdded hook', () => {
            const { steel } = system.recruitSteel({});
            let called = false;
            system.registerHook('alloyAdded', () => { called = true; });
            system.addAlloy(steel.steelId, 'chromium');
            expect(called).toBe(true);
        });
    });

    describe('raiseHardness', () => {
        it('should raise by default amount', () => {
            const { steel } = system.recruitSteel({});
            system.raiseHardness(steel.steelId);
            expect(steel.hardness).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { steel } = system.recruitSteel({});
            system.raiseHardness(steel.steelId, 30);
            expect(steel.hardness).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raiseHardness('ghost', 5);
            expect(result.error).toBe('STEEL_NOT_FOUND');
        });

        it('should trigger hardnessRaised hook', () => {
            const { steel } = system.recruitSteel({});
            let called = false;
            system.registerHook('hardnessRaised', () => { called = true; });
            system.raiseHardness(steel.steelId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSteel', () => {
        it('should level up', () => {
            const { steel } = system.recruitSteel({});
            system.levelUpSteel(steel.steelId);
            expect(steel.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { steel } = system.recruitSteel({});
            system.levelUpSteel(steel.steelId);
            system.levelUpSteel(steel.steelId);
            expect(steel.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpSteel('ghost');
            expect(result.error).toBe('STEEL_NOT_FOUND');
        });

        it('should trigger steelLeveledUp hook', () => {
            const { steel } = system.recruitSteel({});
            let called = false;
            system.registerHook('steelLeveledUp', () => { called = true; });
            system.levelUpSteel(steel.steelId);
            expect(called).toBe(true);
        });
    });

    describe('legendSteel', () => {
        it('should set status to legendary', () => {
            const { steel } = system.recruitSteel({});
            system.legendSteel(steel.steelId);
            expect(steel.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSteel('ghost');
            expect(result.error).toBe('STEEL_NOT_FOUND');
        });

        it('should trigger steelLegendized hook', () => {
            const { steel } = system.recruitSteel({});
            let called = false;
            system.registerHook('steelLegendized', () => { called = true; });
            system.legendSteel(steel.steelId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSteelValue', () => {
        it('should calculate default value', () => {
            const { steel } = system.recruitSteel({});
            // level=1 * 100 + hardness=20 * 2 + 0 * 30 = 140
            expect(system.calculateSteelValue(steel.steelId)).toBe(140);
        });

        it('should add 30 per alloy', () => {
            const { steel } = system.recruitSteel({});
            system.addAlloy(steel.steelId, 'chromium');
            system.addAlloy(steel.steelId, 'nickel');
            // 100 + 40 + 2*30 = 200
            expect(system.calculateSteelValue(steel.steelId)).toBe(200);
        });

        it('should reflect level in formula', () => {
            const { steel } = system.recruitSteel({});
            system.levelUpSteel(steel.steelId);
            system.levelUpSteel(steel.steelId);
            // 3*100 + 40 + 0 = 340
            expect(system.calculateSteelValue(steel.steelId)).toBe(340);
        });

        it('should reflect hardness in formula', () => {
            const { steel } = system.recruitSteel({});
            system.raiseHardness(steel.steelId, 30);
            // 100 + 50*2 + 0 = 200
            expect(system.calculateSteelValue(steel.steelId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSteelValue('ghost')).toBe(0);
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

        it('should execute default getSteel', () => {
            const result = system.executeTool('getSteel', { steelId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should default context to {} when undefined', () => {
            system.registerTool('checkCtx', (ctx) => ctx);
            const result = system.executeTool('checkCtx', undefined);
            expect(result.result).toEqual({});
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('steelRecruited', () => count++);
            unregister();
            system.recruitSteel({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('steelRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSteel({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSteels = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalSteels = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSteel({});
            const json = system.toJSON();
            expect(json.steels.length).toBe(1);
            expect(json.stats.totalSteels).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSteel({ name: 'a' });
            const json = system.toJSON();
            const newSys = new CultivationSteel();
            newSys.fromJSON(json);
            expect(newSys.steels.size).toBe(1);
            expect(newSys.stats.totalSteels).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.steelCount).toBe(0);
            expect(stats.totalSteels).toBe(0);
            system.recruitSteel({});
            expect(system.getStats().steelCount).toBe(1);
        });
    });
});
