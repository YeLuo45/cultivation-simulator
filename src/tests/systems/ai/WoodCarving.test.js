/**
 * WoodCarving.test.js - 木雕系统测试
 * V516 Iteration 18/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WoodCarving } from '../../../systems/ai/WoodCarving.js';

describe('WoodCarving', () => {
    let system;
    beforeEach(() => { system = new WoodCarving(); });

    describe('carveWood', () => {
        it('should carve with defaults', () => {
            const { carving } = system.carveWood({});
            expect(carving.carverId).toBe('unknown_carver');
            expect(carving.name).toBe('unnamed_carving');
            expect(carving.type).toBe('figure');
            expect(carving.detail).toBe(10);
            expect(carving.materials).toEqual([]);
            expect(carving.status).toBe('raw');
            expect(carving.carvingId).toBeDefined();
            expect(carving.startedAt).toBeDefined();
        });

        it('should carve with custom data', () => {
            const { carving } = system.carveWood({
                carverId: 'master_c1',
                name: 'DragonStatue',
                type: 'totem',
                detail: 50,
                materials: ['oak', 'gold'],
                status: 'sculpted'
            });
            expect(carving.carverId).toBe('master_c1');
            expect(carving.name).toBe('DragonStatue');
            expect(carving.type).toBe('totem');
            expect(carving.detail).toBe(50);
            expect(carving.materials).toEqual(['oak', 'gold']);
            expect(carving.status).toBe('sculpted');
        });

        it('should support all three types', () => {
            const { carving: c1 } = system.carveWood({ type: 'figure' });
            const { carving: c2 } = system.carveWood({ type: 'talisman' });
            const { carving: c3 } = system.carveWood({ type: 'totem' });
            expect(c1.type).toBe('figure');
            expect(c2.type).toBe('talisman');
            expect(c3.type).toBe('totem');
        });

        it('should increment totalCarvings', () => {
            system.carveWood({});
            system.carveWood({});
            system.carveWood({});
            expect(system.stats.totalCarvings).toBe(3);
        });

        it('should trigger carvingStarted hook', () => {
            let called = false;
            system.registerHook('carvingStarted', () => { called = true; });
            system.carveWood({});
            expect(called).toBe(true);
        });

        it('should accept custom id', () => {
            const { carving } = system.carveWood({ id: 'custom_id_123' });
            expect(carving.carvingId).toBe('custom_id_123');
        });
    });

    describe('getCarving', () => {
        it('should return carving', () => {
            const { carving } = system.carveWood({ name: 'a' });
            const got = system.getCarving(carving.carvingId);
            expect(got).not.toBeNull();
            expect(got.carvingId).toBe(carving.carvingId);
            expect(got.name).toBe('a');
        });
        it('should return null for missing', () => { expect(system.getCarving('ghost')).toBeNull(); });
    });

    describe('listCarvings', () => {
        it('should list all', () => {
            system.carveWood({});
            system.carveWood({});
            expect(system.listCarvings().length).toBe(2);
        });

        it('should return empty list when no carvings', () => {
            expect(system.listCarvings().length).toBe(0);
        });
    });

    describe('listByCarver', () => {
        it('should filter by carver', () => {
            system.carveWood({ carverId: 'c1' });
            system.carveWood({ carverId: 'c1' });
            system.carveWood({ carverId: 'c2' });
            expect(system.listByCarver('c1').length).toBe(2);
            expect(system.listByCarver('c2').length).toBe(1);
            expect(system.listByCarver('c3').length).toBe(0);
        });
    });

    describe('listMastered', () => {
        it('should list only mastered carvings', () => {
            const { carving: c1 } = system.carveWood({});
            const { carving: c2 } = system.carveWood({});
            system.masterCarving(c1.carvingId);
            expect(system.listMastered().length).toBe(1);
            expect(system.listMastered()[0].carvingId).toBe(c1.carvingId);
            expect(c2.status).toBe('raw');
        });

        it('should return empty when none mastered', () => {
            system.carveWood({});
            system.carveWood({});
            expect(system.listMastered().length).toBe(0);
        });
    });

    describe('addMaterial', () => {
        it('should add material', () => {
            const { carving } = system.carveWood({});
            system.addMaterial(carving.carvingId, 'oak');
            expect(carving.materials).toContain('oak');
            expect(carving.materials.length).toBe(1);
        });

        it('should add multiple materials', () => {
            const { carving } = system.carveWood({});
            system.addMaterial(carving.carvingId, 'oak');
            system.addMaterial(carving.carvingId, 'gold');
            system.addMaterial(carving.carvingId, 'jade');
            expect(carving.materials).toEqual(['oak', 'gold', 'jade']);
        });

        it('should set status to sculpted when 2+ materials', () => {
            const { carving } = system.carveWood({});
            expect(carving.status).toBe('raw');
            system.addMaterial(carving.carvingId, 'oak');
            expect(carving.status).toBe('raw');
            system.addMaterial(carving.carvingId, 'gold');
            expect(carving.status).toBe('sculpted');
        });

        it('should reject missing', () => {
            const result = system.addMaterial('ghost', 'oak');
            expect(result.error).toBe('CARVING_NOT_FOUND');
        });

        it('should trigger materialAdded hook', () => {
            const { carving } = system.carveWood({});
            let called = false;
            system.registerHook('materialAdded', () => { called = true; });
            system.addMaterial(carving.carvingId, 'oak');
            expect(called).toBe(true);
        });
    });

    describe('refineDetail', () => {
        it('should refine by default amount', () => {
            const { carving } = system.carveWood({});
            system.refineDetail(carving.carvingId);
            expect(carving.detail).toBe(15);
        });

        it('should refine by custom amount', () => {
            const { carving } = system.carveWood({});
            system.refineDetail(carving.carvingId, 30);
            expect(carving.detail).toBe(40);
        });

        it('should reject missing', () => {
            const result = system.refineDetail('ghost', 5);
            expect(result.error).toBe('CARVING_NOT_FOUND');
        });

        it('should trigger detailRefined hook', () => {
            const { carving } = system.carveWood({});
            let called = false;
            system.registerHook('detailRefined', () => { called = true; });
            system.refineDetail(carving.carvingId, 5);
            expect(called).toBe(true);
        });
    });

    describe('masterCarving', () => {
        it('should set status to mastered', () => {
            const { carving } = system.carveWood({});
            system.masterCarving(carving.carvingId);
            expect(carving.status).toBe('mastered');
        });

        it('should reject missing', () => {
            const result = system.masterCarving('ghost');
            expect(result.error).toBe('CARVING_NOT_FOUND');
        });

        it('should trigger carvingMastered hook', () => {
            const { carving } = system.carveWood({});
            let called = false;
            system.registerHook('carvingMastered', () => { called = true; });
            system.masterCarving(carving.carvingId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCarvingValue', () => {
        it('should calculate default value', () => {
            const { carving } = system.carveWood({});
            // detail=10 * 10 + 0 materials * 5 = 100
            expect(system.calculateCarvingValue(carving.carvingId)).toBe(100);
        });

        it('should add 5 per material', () => {
            const { carving } = system.carveWood({});
            system.addMaterial(carving.carvingId, 'oak');
            system.addMaterial(carving.carvingId, 'gold');
            // 100 + 2*5 = 110
            expect(system.calculateCarvingValue(carving.carvingId)).toBe(110);
        });

        it('should reflect detail in formula', () => {
            const { carving } = system.carveWood({ detail: 50 });
            // 50 * 10 + 0 = 500
            expect(system.calculateCarvingValue(carving.carvingId)).toBe(500);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCarvingValue('ghost')).toBe(0);
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
            system.registerTool('bad', () => { throw new Error('crack'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('crack');
        });

        it('should execute default getCarving', () => {
            const result = system.executeTool('getCarving', { carvingId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('carvingStarted', () => count++);
            unregister();
            system.carveWood({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('carvingStarted', () => { throw new Error('x'); });
            expect(() => system.carveWood({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCarvings = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxCarvings).toBe(150);
        });
        it('should not double evolve', () => {
            system.stats.totalCarvings = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.carveWood({ name: 'a' });
            const json = system.toJSON();
            expect(json.carvings.length).toBe(1);
            expect(json.stats.totalCarvings).toBe(1);
            expect(json.config.maxCarvings).toBe(100);
        });
        it('should deserialize', () => {
            system.carveWood({ name: 'a' });
            const json = system.toJSON();
            const newSys = new WoodCarving();
            newSys.fromJSON(json);
            expect(newSys.carvings.size).toBe(1);
            expect(newSys.stats.totalCarvings).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.carvingCount).toBe(0);
            expect(stats.totalCarvings).toBe(0);
            system.carveWood({});
            expect(system.getStats().carvingCount).toBe(1);
            expect(system.getStats().totalCarvings).toBe(1);
        });
    });
});
