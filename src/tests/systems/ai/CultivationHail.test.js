/**
 * CultivationHail.test.js - 修真雹测试
 * V801 Iteration 4/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationHail } from '../../../systems/ai/CultivationHail.js';

describe('CultivationHail', () => {
    let system;
    beforeEach(() => { system = new CultivationHail(); });

    describe('recruitHail', () => {
        it('should recruit with default values', () => {
            const { hail } = system.recruitHail({ name: 'Hail One' });
            expect(hail.name).toBe('Hail One');
            expect(hail.type).toBe('winter');
            expect(hail.density).toBe(20);
            expect(hail.level).toBe(1);
            expect(hail.status).toBe('novice');
        });

        it('should support different types', () => {
            const { hail: h1 } = system.recruitHail({ type: 'stormy' });
            const { hail: h2 } = system.recruitHail({ type: 'divine' });
            expect(h1.type).toBe('stormy');
            expect(h2.type).toBe('divine');
        });

        it('should default to winter for invalid type', () => {
            const { hail } = system.recruitHail({ type: 'lava' });
            expect(hail.type).toBe('winter');
        });

        it('should support master assignment', () => {
            const { hail } = system.recruitHail({ masterId: 'master_x' });
            expect(hail.masterId).toBe('master_x');
        });

        it('should reject when max reached', () => {
            const sys = new CultivationHail({ maxHails: 2 });
            sys.recruitHail({});
            sys.recruitHail({});
            const result = sys.recruitHail({});
            expect(result.error).toBe('MAX_HAILS_REACHED');
        });

        it('should trigger hailRecruited hook', () => {
            let called = false;
            system.registerHook('hailRecruited', () => { called = true; });
            system.recruitHail({});
            expect(called).toBe(true);
        });
    });

    describe('getHail', () => {
        it('should return hail', () => {
            const { hail } = system.recruitHail({});
            expect(system.getHail(hail.hailId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getHail('ghost')).toBeNull();
        });
    });

    describe('listHails', () => {
        it('should list all', () => {
            system.recruitHail({});
            system.recruitHail({});
            expect(system.listHails().length).toBe(2);
        });

        it('should return empty array when none', () => {
            expect(system.listHails()).toEqual([]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitHail({ masterId: 'm1' });
            system.recruitHail({ masterId: 'm1' });
            system.recruitHail({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should return only legendary', () => {
            const { hail } = system.recruitHail({});
            system.legendHail(hail.hailId);
            system.recruitHail({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addStone', () => {
        it('should add a stone', () => {
            const { hail } = system.recruitHail({});
            const result = system.addStone(hail.hailId, { weight: 25 });
            expect(result.success).toBe(true);
            expect(hail.stones.length).toBe(1);
        });

        it('should support multiple stones', () => {
            const { hail } = system.recruitHail({});
            system.addStone(hail.hailId, { weight: 10 });
            system.addStone(hail.hailId, { weight: 20 });
            expect(hail.stones.length).toBe(2);
        });

        it('should reject missing hail', () => {
            const result = system.addStone('ghost', {});
            expect(result.error).toBe('HAIL_NOT_FOUND');
        });

        it('should trigger stoneAdded hook', () => {
            const { hail } = system.recruitHail({});
            let called = false;
            system.registerHook('stoneAdded', () => { called = true; });
            system.addStone(hail.hailId, {});
            expect(called).toBe(true);
        });
    });

    describe('raiseDensity', () => {
        it('should raise density by default amount', () => {
            const { hail } = system.recruitHail({});
            system.raiseDensity(hail.hailId);
            expect(hail.density).toBe(25);
        });

        it('should accept custom amount', () => {
            const { hail } = system.recruitHail({});
            system.raiseDensity(hail.hailId, 15);
            expect(hail.density).toBe(35);
        });

        it('should reject missing hail', () => {
            const result = system.raiseDensity('ghost');
            expect(result.error).toBe('HAIL_NOT_FOUND');
        });

        it('should trigger densityRaised hook', () => {
            const { hail } = system.recruitHail({});
            let called = false;
            system.registerHook('densityRaised', () => { called = true; });
            system.raiseDensity(hail.hailId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpHail', () => {
        it('should increment level', () => {
            const { hail } = system.recruitHail({});
            system.levelUpHail(hail.hailId);
            expect(hail.level).toBe(2);
        });

        it('should set veteran at level 10', () => {
            const { hail } = system.recruitHail({});
            for (let i = 0; i < 9; i++) system.levelUpHail(hail.hailId);
            expect(hail.status).toBe('veteran');
        });

        it('should reject missing hail', () => {
            const result = system.levelUpHail('ghost');
            expect(result.error).toBe('HAIL_NOT_FOUND');
        });
    });

    describe('legendHail', () => {
        it('should set legendary', () => {
            const { hail } = system.recruitHail({});
            system.legendHail(hail.hailId);
            expect(hail.status).toBe('legendary');
        });

        it('should reject missing hail', () => {
            const result = system.legendHail('ghost');
            expect(result.error).toBe('HAIL_NOT_FOUND');
        });

        it('should trigger hailLegendized hook', () => {
            const { hail } = system.recruitHail({});
            let called = false;
            system.registerHook('hailLegendized', () => { called = true; });
            system.legendHail(hail.hailId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHailValue', () => {
        it('should calculate value', () => {
            const { hail } = system.recruitHail({});
            system.addStone(hail.hailId, {});
            const value = system.calculateHailValue(hail.hailId);
            // level 1 * 100 + density 20 * 2 + 1 stone * 30 = 100 + 40 + 30 = 170
            expect(value).toBe(170);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHailValue('ghost')).toBe(0);
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

        it('should execute default getHail', () => {
            const result = system.executeTool('getHail', { hailId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('hailRecruited', () => count++);
            unregister();
            system.recruitHail({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('hailRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitHail({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient recruits', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve after threshold', () => {
            for (let i = 0; i < 5; i++) system.recruitHail({});
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            for (let i = 0; i < 5; i++) system.recruitHail({});
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitHail({});
            const json = system.toJSON();
            expect(json.hails.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitHail({});
            const json = system.toJSON();
            const newSys = new CultivationHail();
            newSys.fromJSON(json);
            expect(newSys.hails.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with counts', () => {
            const { hail } = system.recruitHail({});
            system.legendHail(hail.hailId);
            const stats = system.getStats();
            expect(stats.hailCount).toBe(1);
            expect(stats.legendaryCount).toBe(1);
            expect(stats.totalRecruited).toBe(1);
        });
    });
});
