/**
 * TreasureRefining.test.js - 炼器系统测试
 * V416 Iteration 8/15 Round 14 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreasureRefining } from '../../../systems/ai/TreasureRefining.js';

describe('TreasureRefining', () => {
    let system;
    beforeEach(() => { system = new TreasureRefining(); });

    describe('forgeTreasure', () => {
        it('should forge with defaults', () => {
            const { treasure } = system.forgeTreasure({});
            expect(treasure.type).toBe('sword');
            expect(treasure.grade).toBe('common');
            expect(treasure.sharpness).toBe(20);
            expect(treasure.durability).toBe(100);
            expect(treasure.refinement).toBe(0);
        });

        it('should forge with custom data', () => {
            const { treasure } = system.forgeTreasure({ name: 'SkySword', type: 'blade', grade: 'legendary', sharpness: 80, durability: 150, refinement: 5 });
            expect(treasure.name).toBe('SkySword');
            expect(treasure.type).toBe('blade');
            expect(treasure.grade).toBe('legendary');
            expect(treasure.sharpness).toBe(80);
            expect(treasure.durability).toBe(150);
            expect(treasure.refinement).toBe(5);
        });

        it('should trigger treasureForged hook', () => {
            let called = false;
            system.registerHook('treasureForged', () => { called = true; });
            system.forgeTreasure({});
            expect(called).toBe(true);
        });
    });

    describe('getTreasure', () => {
        it('should return treasure', () => {
            const { treasure } = system.forgeTreasure({});
            expect(system.getTreasure(treasure.treasureId)).not.toBeNull();
            expect(system.getTreasure(treasure.treasureId).treasureId).toBe(treasure.treasureId);
        });
        it('should return null for missing', () => { expect(system.getTreasure('ghost')).toBeNull(); });
    });

    describe('listTreasures', () => {
        it('should list all', () => {
            system.forgeTreasure({});
            system.forgeTreasure({});
            system.forgeTreasure({});
            expect(system.listTreasures().length).toBe(3);
        });

        it('should return empty list when no treasures', () => {
            expect(system.listTreasures().length).toBe(0);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.forgeTreasure({ type: 'sword' });
            system.forgeTreasure({ type: 'blade' });
            system.forgeTreasure({ type: 'fan' });
            expect(system.listByType('sword').length).toBe(1);
            expect(system.listByType('blade').length).toBe(1);
            expect(system.listByType('fan').length).toBe(1);
        });
    });

    describe('listByGrade', () => {
        it('should filter by grade', () => {
            system.forgeTreasure({ grade: 'common' });
            system.forgeTreasure({ grade: 'rare' });
            system.forgeTreasure({ grade: 'legendary' });
            expect(system.listByGrade('rare').length).toBe(1);
            expect(system.listByGrade('legendary').length).toBe(1);
            expect(system.listByGrade('common').length).toBe(1);
        });
    });

    describe('listByRefinement', () => {
        it('should filter by minimum refinement', () => {
            system.forgeTreasure({ refinement: 0 });
            system.forgeTreasure({ refinement: 5 });
            system.forgeTreasure({ refinement: 10 });
            expect(system.listByRefinement(0).length).toBe(3);
            expect(system.listByRefinement(5).length).toBe(2);
            expect(system.listByRefinement(10).length).toBe(1);
        });
    });

    describe('refineTreasure', () => {
        it('should refine by default amount', () => {
            const { treasure } = system.forgeTreasure({});
            system.refineTreasure(treasure.treasureId);
            expect(treasure.refinement).toBe(1);
        });

        it('should refine by custom amount', () => {
            const { treasure } = system.forgeTreasure({});
            system.refineTreasure(treasure.treasureId, 3);
            expect(treasure.refinement).toBe(3);
        });

        it('should cap at 10', () => {
            const { treasure } = system.forgeTreasure({ refinement: 8 });
            system.refineTreasure(treasure.treasureId, 5);
            expect(treasure.refinement).toBe(10);
        });

        it('should reject missing', () => {
            const result = system.refineTreasure('ghost', 1);
            expect(result.error).toBe('TREASURE_NOT_FOUND');
        });

        it('should trigger treasureRefined hook', () => {
            const { treasure } = system.forgeTreasure({});
            let called = false;
            system.registerHook('treasureRefined', () => { called = true; });
            system.refineTreasure(treasure.treasureId, 1);
            expect(called).toBe(true);
        });
    });

    describe('sharpenTreasure', () => {
        it('should sharpen by default amount', () => {
            const { treasure } = system.forgeTreasure({});
            system.sharpenTreasure(treasure.treasureId);
            expect(treasure.sharpness).toBe(25);
        });

        it('should sharpen by custom amount', () => {
            const { treasure } = system.forgeTreasure({});
            system.sharpenTreasure(treasure.treasureId, 30);
            expect(treasure.sharpness).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.sharpenTreasure('ghost', 5);
            expect(result.error).toBe('TREASURE_NOT_FOUND');
        });

        it('should trigger treasureSharpened hook', () => {
            const { treasure } = system.forgeTreasure({});
            let called = false;
            system.registerHook('treasureSharpened', () => { called = true; });
            system.sharpenTreasure(treasure.treasureId, 5);
            expect(called).toBe(true);
        });
    });

    describe('repairTreasure', () => {
        it('should repair by default amount', () => {
            const { treasure } = system.forgeTreasure({});
            treasure.durability = 50;
            system.repairTreasure(treasure.treasureId);
            expect(treasure.durability).toBe(70);
        });

        it('should repair by custom amount', () => {
            const { treasure } = system.forgeTreasure({});
            treasure.durability = 30;
            system.repairTreasure(treasure.treasureId, 40);
            expect(treasure.durability).toBe(70);
        });

        it('should cap at 100', () => {
            const { treasure } = system.forgeTreasure({});
            treasure.durability = 90;
            system.repairTreasure(treasure.treasureId, 50);
            expect(treasure.durability).toBe(100);
        });

        it('should reject missing', () => {
            const result = system.repairTreasure('ghost');
            expect(result.error).toBe('TREASURE_NOT_FOUND');
        });

        it('should trigger treasureRepaired hook', () => {
            const { treasure } = system.forgeTreasure({});
            let called = false;
            system.registerHook('treasureRepaired', () => { called = true; });
            system.repairTreasure(treasure.treasureId, 10);
            expect(called).toBe(true);
        });
    });

    describe('calculatePower', () => {
        it('should calculate default power', () => {
            const { treasure } = system.forgeTreasure({});
            // sharpness=20, refinement=0, durability=100 => 20 * 1 * 1 = 20
            expect(system.calculatePower(treasure.treasureId)).toBeCloseTo(20, 5);
        });

        it('should increase with refinement', () => {
            const { treasure } = system.forgeTreasure({});
            treasure.refinement = 5;
            treasure.durability = 100;
            // 20 * (1 + 5/10) * (100/100) = 20 * 1.5 * 1 = 30
            expect(system.calculatePower(treasure.treasureId)).toBeCloseTo(30, 5);
        });

        it('should account for durability', () => {
            const { treasure } = system.forgeTreasure({});
            treasure.refinement = 0;
            treasure.sharpness = 50;
            treasure.durability = 50;
            // 50 * 1 * 0.5 = 25
            expect(system.calculatePower(treasure.treasureId)).toBeCloseTo(25, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePower('ghost')).toBe(0);
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

        it('should execute default getTreasure', () => {
            const result = system.executeTool('getTreasure', { treasureId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('treasureForged', () => count++);
            unregister();
            system.forgeTreasure({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('treasureForged', () => { throw new Error('x'); });
            expect(() => system.forgeTreasure({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTreasures = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalTreasures = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.forgeTreasure({});
            const json = system.toJSON();
            expect(json.treasures.length).toBe(1);
            expect(json.stats.totalTreasures).toBe(1);
        });
        it('should deserialize', () => {
            system.forgeTreasure({ name: 'a' });
            const json = system.toJSON();
            const newSys = new TreasureRefining();
            newSys.fromJSON(json);
            expect(newSys.treasures.size).toBe(1);
            expect(newSys.stats.totalTreasures).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.treasureCount).toBe(0);
            expect(stats.totalTreasures).toBe(0);
            system.forgeTreasure({});
            expect(system.getStats().treasureCount).toBe(1);
        });
    });
});
