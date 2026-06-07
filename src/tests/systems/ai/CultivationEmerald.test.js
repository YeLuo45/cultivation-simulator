/**
 * CultivationEmerald.test.js - 修真绿宝石系统测试
 * V835 Iteration 8/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationEmerald } from '../../../systems/ai/CultivationEmerald.js';

describe('CultivationEmerald', () => {
    let system;
    beforeEach(() => { system = new CultivationEmerald(); });

    describe('recruitEmerald', () => {
        it('should recruit with defaults', () => {
            const { emerald } = system.recruitEmerald({});
            expect(emerald.masterId).toBe('unknown_master');
            expect(emerald.name).toBe('unnamed_emerald');
            expect(emerald.type).toBe('colombian');
            expect(emerald.lushness).toBe(20);
            expect(emerald.inclusions).toEqual([]);
            expect(emerald.level).toBe(1);
            expect(emerald.status).toBe('novice');
        });

        it('should recruit with custom data', () => {
            const { emerald } = system.recruitEmerald({
                masterId: 'm1',
                name: 'MossyEmerald',
                type: 'forest',
                lushness: 80,
                inclusions: ['moss'],
                level: 3,
                status: 'veteran'
            });
            expect(emerald.masterId).toBe('m1');
            expect(emerald.name).toBe('MossyEmerald');
            expect(emerald.type).toBe('forest');
            expect(emerald.lushness).toBe(80);
            expect(emerald.inclusions).toEqual(['moss']);
            expect(emerald.level).toBe(3);
            expect(emerald.status).toBe('veteran');
        });

        it('should support divine type', () => {
            const { emerald } = system.recruitEmerald({ type: 'divine' });
            expect(emerald.type).toBe('divine');
        });

        it('should increment totalEmeralds', () => {
            system.recruitEmerald({});
            system.recruitEmerald({});
            expect(system.stats.totalEmeralds).toBe(2);
        });

        it('should trigger emeraldRecruited hook', () => {
            let called = false;
            system.registerHook('emeraldRecruited', () => { called = true; });
            system.recruitEmerald({});
            expect(called).toBe(true);
        });
    });

    describe('getEmerald', () => {
        it('should return emerald', () => {
            const { emerald } = system.recruitEmerald({});
            const got = system.getEmerald(emerald.emeraldId);
            expect(got).not.toBeNull();
            expect(got.emeraldId).toBe(emerald.emeraldId);
        });
        it('should return null for missing', () => { expect(system.getEmerald('ghost')).toBeNull(); });
    });

    describe('listEmeralds', () => {
        it('should list all', () => {
            system.recruitEmerald({});
            system.recruitEmerald({});
            system.recruitEmerald({});
            expect(system.listEmeralds().length).toBe(3);
        });

        it('should return empty list when no emeralds', () => {
            expect(system.listEmeralds().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitEmerald({ masterId: 'm1' });
            system.recruitEmerald({ masterId: 'm1' });
            system.recruitEmerald({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary emeralds', () => {
            const { emerald: e1 } = system.recruitEmerald({});
            const { emerald: e2 } = system.recruitEmerald({});
            system.legendEmerald(e1.emeraldId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].emeraldId).toBe(e1.emeraldId);
        });

        it('should return empty when none legendary', () => {
            system.recruitEmerald({});
            system.recruitEmerald({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addInclusion', () => {
        it('should add inclusion', () => {
            const { emerald } = system.recruitEmerald({});
            system.addInclusion(emerald.emeraldId, 'moss');
            expect(emerald.inclusions).toContain('moss');
            expect(emerald.inclusions.length).toBe(1);
        });

        it('should add multiple inclusions', () => {
            const { emerald } = system.recruitEmerald({});
            system.addInclusion(emerald.emeraldId, 'moss');
            system.addInclusion(emerald.emeraldId, 'leaf');
            expect(emerald.inclusions).toEqual(['moss', 'leaf']);
        });

        it('should set status to veteran when 5+ inclusions', () => {
            const { emerald } = system.recruitEmerald({});
            system.addInclusion(emerald.emeraldId, 'a');
            system.addInclusion(emerald.emeraldId, 'b');
            system.addInclusion(emerald.emeraldId, 'c');
            system.addInclusion(emerald.emeraldId, 'd');
            expect(emerald.status).toBe('novice');
            system.addInclusion(emerald.emeraldId, 'e');
            expect(emerald.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.addInclusion('ghost', 'moss');
            expect(result.error).toBe('EMERALD_NOT_FOUND');
        });

        it('should trigger inclusionAdded hook', () => {
            const { emerald } = system.recruitEmerald({});
            let called = false;
            system.registerHook('inclusionAdded', () => { called = true; });
            system.addInclusion(emerald.emeraldId, 'moss');
            expect(called).toBe(true);
        });
    });

    describe('raiseLushness', () => {
        it('should raise by default amount', () => {
            const { emerald } = system.recruitEmerald({});
            system.raiseLushness(emerald.emeraldId);
            expect(emerald.lushness).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { emerald } = system.recruitEmerald({});
            system.raiseLushness(emerald.emeraldId, 30);
            expect(emerald.lushness).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raiseLushness('ghost', 5);
            expect(result.error).toBe('EMERALD_NOT_FOUND');
        });

        it('should trigger lushnessRaised hook', () => {
            const { emerald } = system.recruitEmerald({});
            let called = false;
            system.registerHook('lushnessRaised', () => { called = true; });
            system.raiseLushness(emerald.emeraldId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpEmerald', () => {
        it('should level up', () => {
            const { emerald } = system.recruitEmerald({});
            system.levelUpEmerald(emerald.emeraldId);
            expect(emerald.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { emerald } = system.recruitEmerald({});
            system.levelUpEmerald(emerald.emeraldId);
            system.levelUpEmerald(emerald.emeraldId);
            expect(emerald.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpEmerald('ghost');
            expect(result.error).toBe('EMERALD_NOT_FOUND');
        });

        it('should trigger emeraldLeveledUp hook', () => {
            const { emerald } = system.recruitEmerald({});
            let called = false;
            system.registerHook('emeraldLeveledUp', () => { called = true; });
            system.levelUpEmerald(emerald.emeraldId);
            expect(called).toBe(true);
        });
    });

    describe('legendEmerald', () => {
        it('should set status to legendary', () => {
            const { emerald } = system.recruitEmerald({});
            system.legendEmerald(emerald.emeraldId);
            expect(emerald.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendEmerald('ghost');
            expect(result.error).toBe('EMERALD_NOT_FOUND');
        });

        it('should trigger emeraldLegendized hook', () => {
            const { emerald } = system.recruitEmerald({});
            let called = false;
            system.registerHook('emeraldLegendized', () => { called = true; });
            system.legendEmerald(emerald.emeraldId);
            expect(called).toBe(true);
        });
    });

    describe('calculateEmeraldValue', () => {
        it('should calculate default value', () => {
            const { emerald } = system.recruitEmerald({});
            // level=1 * 100 + lushness=20 * 2 + 0 * 30 = 140
            expect(system.calculateEmeraldValue(emerald.emeraldId)).toBe(140);
        });

        it('should add 30 per inclusion', () => {
            const { emerald } = system.recruitEmerald({});
            system.addInclusion(emerald.emeraldId, 'moss');
            system.addInclusion(emerald.emeraldId, 'leaf');
            // 100 + 40 + 2*30 = 200
            expect(system.calculateEmeraldValue(emerald.emeraldId)).toBe(200);
        });

        it('should reflect level in formula', () => {
            const { emerald } = system.recruitEmerald({});
            system.levelUpEmerald(emerald.emeraldId);
            system.levelUpEmerald(emerald.emeraldId);
            // 3*100 + 40 + 0 = 340
            expect(system.calculateEmeraldValue(emerald.emeraldId)).toBe(340);
        });

        it('should reflect lushness in formula', () => {
            const { emerald } = system.recruitEmerald({});
            system.raiseLushness(emerald.emeraldId, 30);
            // 100 + 50*2 + 0 = 200
            expect(system.calculateEmeraldValue(emerald.emeraldId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateEmeraldValue('ghost')).toBe(0);
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

        it('should execute default getEmerald', () => {
            const result = system.executeTool('getEmerald', { emeraldId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('emeraldRecruited', () => count++);
            unregister();
            system.recruitEmerald({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('emeraldRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitEmerald({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalEmeralds = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalEmeralds = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitEmerald({});
            const json = system.toJSON();
            expect(json.emeralds.length).toBe(1);
            expect(json.stats.totalEmeralds).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitEmerald({ name: 'a' });
            const json = system.toJSON();
            const newSys = new CultivationEmerald();
            newSys.fromJSON(json);
            expect(newSys.emeralds.size).toBe(1);
            expect(newSys.stats.totalEmeralds).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.emeraldCount).toBe(0);
            expect(stats.totalEmeralds).toBe(0);
            system.recruitEmerald({});
            expect(system.getStats().emeraldCount).toBe(1);
        });
    });
});
