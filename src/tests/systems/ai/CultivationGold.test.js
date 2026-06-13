/**
 * CultivationGold.test.js - 修真金系统测试
 * V856 Iteration 29/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationGold } from '../../../systems/ai/CultivationGold.js';

describe('CultivationGold', () => {
    let system;
    beforeEach(() => { system = new CultivationGold(); });

    describe('recruitGold', () => {
        it('should recruit with defaults', () => {
            const { gold } = system.recruitGold({});
            expect(gold.masterId).toBe('unknown_master');
            expect(gold.name).toBe('unnamed_gold');
            expect(gold.type).toBe('pure');
            expect(gold.luster).toBe(20);
            expect(gold.veins).toEqual([]);
            expect(gold.level).toBe(1);
            expect(gold.status).toBe('novice');
        });

        it('should recruit with custom data', () => {
            const { gold } = system.recruitGold({
                masterId: 'm1',
                name: 'SunGold',
                type: 'royal',
                luster: 80,
                veins: ['aureate'],
                level: 3,
                status: 'veteran'
            });
            expect(gold.masterId).toBe('m1');
            expect(gold.name).toBe('SunGold');
            expect(gold.type).toBe('royal');
            expect(gold.luster).toBe(80);
            expect(gold.veins).toEqual(['aureate']);
            expect(gold.level).toBe(3);
            expect(gold.status).toBe('veteran');
        });

        it('should increment totalGolds', () => {
            system.recruitGold({});
            system.recruitGold({});
            expect(system.stats.totalGolds).toBe(2);
        });

        it('should trigger goldRecruited hook', () => {
            let called = false;
            system.registerHook('goldRecruited', () => { called = true; });
            system.recruitGold({});
            expect(called).toBe(true);
        });
    });

    describe('getGold', () => {
        it('should return gold', () => {
            const { gold } = system.recruitGold({});
            const got = system.getGold(gold.goldId);
            expect(got).not.toBeNull();
            expect(got.goldId).toBe(gold.goldId);
        });
        it('should return null for missing', () => { expect(system.getGold('ghost')).toBeNull(); });
    });

    describe('listGolds', () => {
        it('should list all', () => {
            system.recruitGold({});
            system.recruitGold({});
            system.recruitGold({});
            expect(system.listGolds().length).toBe(3);
        });

        it('should return empty list when no golds', () => {
            expect(system.listGolds().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitGold({ masterId: 'm1' });
            system.recruitGold({ masterId: 'm1' });
            system.recruitGold({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary golds', () => {
            const { gold: s1 } = system.recruitGold({});
            const { gold: s2 } = system.recruitGold({});
            system.legendGold(s1.goldId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].goldId).toBe(s1.goldId);
        });

        it('should return empty when none legendary', () => {
            system.recruitGold({});
            system.recruitGold({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addVein', () => {
        it('should add vein', () => {
            const { gold } = system.recruitGold({});
            system.addVein(gold.goldId, 'aureate');
            expect(gold.veins).toContain('aureate');
            expect(gold.veins.length).toBe(1);
        });

        it('should add multiple veins', () => {
            const { gold } = system.recruitGold({});
            system.addVein(gold.goldId, 'aureate');
            system.addVein(gold.goldId, 'sunfire');
            expect(gold.veins).toEqual(['aureate', 'sunfire']);
        });

        it('should set status to veteran when 5+ veins', () => {
            const { gold } = system.recruitGold({});
            system.addVein(gold.goldId, 'a');
            system.addVein(gold.goldId, 'b');
            system.addVein(gold.goldId, 'c');
            system.addVein(gold.goldId, 'd');
            expect(gold.status).toBe('novice');
            system.addVein(gold.goldId, 'e');
            expect(gold.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.addVein('ghost', 'aureate');
            expect(result.error).toBe('GOLD_NOT_FOUND');
        });

        it('should trigger veinAdded hook', () => {
            const { gold } = system.recruitGold({});
            let called = false;
            system.registerHook('veinAdded', () => { called = true; });
            system.addVein(gold.goldId, 'aureate');
            expect(called).toBe(true);
        });
    });

    describe('raiseLuster', () => {
        it('should raise by default amount', () => {
            const { gold } = system.recruitGold({});
            system.raiseLuster(gold.goldId);
            expect(gold.luster).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { gold } = system.recruitGold({});
            system.raiseLuster(gold.goldId, 30);
            expect(gold.luster).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raiseLuster('ghost', 5);
            expect(result.error).toBe('GOLD_NOT_FOUND');
        });

        it('should trigger lusterRaised hook', () => {
            const { gold } = system.recruitGold({});
            let called = false;
            system.registerHook('lusterRaised', () => { called = true; });
            system.raiseLuster(gold.goldId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpGold', () => {
        it('should level up', () => {
            const { gold } = system.recruitGold({});
            system.levelUpGold(gold.goldId);
            expect(gold.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { gold } = system.recruitGold({});
            system.levelUpGold(gold.goldId);
            system.levelUpGold(gold.goldId);
            expect(gold.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpGold('ghost');
            expect(result.error).toBe('GOLD_NOT_FOUND');
        });

        it('should trigger goldLeveledUp hook', () => {
            const { gold } = system.recruitGold({});
            let called = false;
            system.registerHook('goldLeveledUp', () => { called = true; });
            system.levelUpGold(gold.goldId);
            expect(called).toBe(true);
        });
    });

    describe('legendGold', () => {
        it('should set status to legendary', () => {
            const { gold } = system.recruitGold({});
            system.legendGold(gold.goldId);
            expect(gold.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendGold('ghost');
            expect(result.error).toBe('GOLD_NOT_FOUND');
        });

        it('should trigger goldLegendized hook', () => {
            const { gold } = system.recruitGold({});
            let called = false;
            system.registerHook('goldLegendized', () => { called = true; });
            system.legendGold(gold.goldId);
            expect(called).toBe(true);
        });
    });

    describe('calculateGoldValue', () => {
        it('should calculate default value', () => {
            const { gold } = system.recruitGold({});
            // level=1 * 100 + luster=20 * 2 + 0 * 30 = 140
            expect(system.calculateGoldValue(gold.goldId)).toBe(140);
        });

        it('should add 30 per vein', () => {
            const { gold } = system.recruitGold({});
            system.addVein(gold.goldId, 'aureate');
            system.addVein(gold.goldId, 'sunfire');
            // 100 + 40 + 2*30 = 200
            expect(system.calculateGoldValue(gold.goldId)).toBe(200);
        });

        it('should reflect level in formula', () => {
            const { gold } = system.recruitGold({});
            system.levelUpGold(gold.goldId);
            system.levelUpGold(gold.goldId);
            // 3*100 + 40 + 0 = 340
            expect(system.calculateGoldValue(gold.goldId)).toBe(340);
        });

        it('should reflect luster in formula', () => {
            const { gold } = system.recruitGold({});
            system.raiseLuster(gold.goldId, 30);
            // 100 + 50*2 + 0 = 200
            expect(system.calculateGoldValue(gold.goldId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateGoldValue('ghost')).toBe(0);
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

        it('should execute default getGold', () => {
            const result = system.executeTool('getGold', { goldId: 'ghost' });
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
            const unregister = system.registerHook('goldRecruited', () => count++);
            unregister();
            system.recruitGold({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('goldRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitGold({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalGolds = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalGolds = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitGold({});
            const json = system.toJSON();
            expect(json.golds.length).toBe(1);
            expect(json.stats.totalGolds).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitGold({ name: 'a' });
            const json = system.toJSON();
            const newSys = new CultivationGold();
            newSys.fromJSON(json);
            expect(newSys.golds.size).toBe(1);
            expect(newSys.stats.totalGolds).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.goldCount).toBe(0);
            expect(stats.totalGolds).toBe(0);
            system.recruitGold({});
            expect(system.getStats().goldCount).toBe(1);
        });
    });
});
