/**
 * TreasureRepair.test.js - 宝物修复系统测试
 * V510 Iteration 12/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreasureRepair } from '../../../systems/ai/TreasureRepair.js';

describe('TreasureRepair', () => {
    let system;
    beforeEach(() => { system = new TreasureRepair(); });

    describe('startRepair', () => {
        it('should start with defaults', () => {
            const { repair } = system.startRepair({});
            expect(repair.restorerId).toBe('unknown');
            expect(repair.treasureName).toBe('unnamed_treasure');
            expect(repair.damage).toBe(80);
            expect(repair.quality).toBe(0);
            expect(repair.status).toBe('intake');
            expect(repair.materials).toEqual([]);
        });

        it('should start with custom data', () => {
            const { repair } = system.startRepair({ restorerId: 'r1', treasureName: 'SkySword', damage: 50, quality: 10, materials: ['a', 'b'] });
            expect(repair.restorerId).toBe('r1');
            expect(repair.treasureName).toBe('SkySword');
            expect(repair.damage).toBe(50);
            expect(repair.quality).toBe(10);
            expect(repair.materials).toEqual(['a', 'b']);
        });

        it('should respect custom config', () => {
            const custom = new TreasureRepair({ baseDamage: 30 });
            const { repair } = custom.startRepair({});
            expect(repair.damage).toBe(30);
        });

        it('should trigger repairStarted hook', () => {
            let called = false;
            system.registerHook('repairStarted', () => { called = true; });
            system.startRepair({});
            expect(called).toBe(true);
        });

        it('should generate unique IDs', () => {
            const a = system.startRepair({});
            const b = system.startRepair({});
            expect(a.repair.repairId).not.toBe(b.repair.repairId);
        });
    });

    describe('getRepair', () => {
        it('should return repair', () => {
            const { repair } = system.startRepair({});
            expect(system.getRepair(repair.repairId)).not.toBeNull();
            expect(system.getRepair(repair.repairId).repairId).toBe(repair.repairId);
        });
        it('should return null for missing', () => { expect(system.getRepair('ghost')).toBeNull(); });
        it('should return a copy of materials array', () => {
            const { repair } = system.startRepair({});
            const r = system.getRepair(repair.repairId);
            r.materials.push('x');
            expect(repair.materials.length).toBe(0);
        });
    });

    describe('listRepairs', () => {
        it('should list all', () => {
            system.startRepair({});
            system.startRepair({});
            system.startRepair({});
            expect(system.listRepairs().length).toBe(3);
        });
        it('should return empty when no repairs', () => {
            expect(system.listRepairs().length).toBe(0);
        });
    });

    describe('listByRestorer', () => {
        it('should filter by restorer', () => {
            system.startRepair({ restorerId: 'r1' });
            system.startRepair({ restorerId: 'r1' });
            system.startRepair({ restorerId: 'r2' });
            expect(system.listByRestorer('r1').length).toBe(2);
            expect(system.listByRestorer('r2').length).toBe(1);
            expect(system.listByRestorer('ghost').length).toBe(0);
        });
    });

    describe('listRestored', () => {
        it('should filter by status restored', () => {
            const a = system.startRepair({});
            system.startRepair({});
            system.completeRepair(a.repair.repairId);
            const restored = system.listRestored();
            expect(restored.length).toBe(1);
            expect(restored[0].status).toBe('restored');
        });

        it('should return empty when none restored', () => {
            system.startRepair({});
            expect(system.listRestored().length).toBe(0);
        });
    });

    describe('addMaterial', () => {
        it('should add material', () => {
            const { repair } = system.startRepair({});
            system.addMaterial(repair.repairId, 'm1');
            system.addMaterial(repair.repairId, 'm2');
            expect(repair.materials).toEqual(['m1', 'm2']);
        });

        it('should reject missing', () => {
            const result = system.addMaterial('ghost', 'm1');
            expect(result.error).toBe('REPAIR_NOT_FOUND');
        });

        it('should trigger materialAdded hook', () => {
            const { repair } = system.startRepair({});
            let payload = null;
            system.registerHook('materialAdded', (d) => { payload = d; });
            system.addMaterial(repair.repairId, 'iron');
            expect(payload.material).toBe('iron');
        });
    });

    describe('reduceDamage', () => {
        it('should reduce damage by default', () => {
            const { repair } = system.startRepair({ damage: 80 });
            system.reduceDamage(repair.repairId);
            expect(repair.damage).toBe(75);
        });

        it('should reduce damage by custom amount', () => {
            const { repair } = system.startRepair({ damage: 80 });
            system.reduceDamage(repair.repairId, 30);
            expect(repair.damage).toBe(50);
        });

        it('should not go below zero', () => {
            const { repair } = system.startRepair({ damage: 5 });
            system.reduceDamage(repair.repairId, 50);
            expect(repair.damage).toBe(0);
        });

        it('should reject missing', () => {
            const result = system.reduceDamage('ghost', 5);
            expect(result.error).toBe('REPAIR_NOT_FOUND');
        });

        it('should trigger damageReduced hook', () => {
            const { repair } = system.startRepair({});
            let called = false;
            system.registerHook('damageReduced', () => { called = true; });
            system.reduceDamage(repair.repairId, 5);
            expect(called).toBe(true);
        });

        it('should transition status from intake to repairing', () => {
            const { repair } = system.startRepair({});
            expect(repair.status).toBe('intake');
            system.reduceDamage(repair.repairId, 5);
            expect(repair.status).toBe('repairing');
        });
    });

    describe('refineQuality', () => {
        it('should refine quality by default', () => {
            const { repair } = system.startRepair({});
            system.refineQuality(repair.repairId);
            expect(repair.quality).toBe(5);
        });

        it('should refine quality by custom amount', () => {
            const { repair } = system.startRepair({});
            system.refineQuality(repair.repairId, 20);
            expect(repair.quality).toBe(20);
        });

        it('should reject missing', () => {
            const result = system.refineQuality('ghost', 5);
            expect(result.error).toBe('REPAIR_NOT_FOUND');
        });

        it('should trigger qualityRefined hook', () => {
            const { repair } = system.startRepair({});
            let called = false;
            system.registerHook('qualityRefined', () => { called = true; });
            system.refineQuality(repair.repairId, 5);
            expect(called).toBe(true);
        });

        it('should transition status from intake to repairing', () => {
            const { repair } = system.startRepair({});
            expect(repair.status).toBe('intake');
            system.refineQuality(repair.repairId, 5);
            expect(repair.status).toBe('repairing');
        });
    });

    describe('completeRepair', () => {
        it('should set status to restored', () => {
            const { repair } = system.startRepair({});
            system.completeRepair(repair.repairId);
            expect(repair.status).toBe('restored');
        });

        it('should reject missing', () => {
            const result = system.completeRepair('ghost');
            expect(result.error).toBe('REPAIR_NOT_FOUND');
        });

        it('should trigger repairCompleted hook', () => {
            const { repair } = system.startRepair({});
            let called = false;
            system.registerHook('repairCompleted', () => { called = true; });
            system.completeRepair(repair.repairId);
            expect(called).toBe(true);
        });
    });

    describe('calculateRepairValue', () => {
        it('should calculate default value', () => {
            const { repair } = system.startRepair({ damage: 80 });
            // quality=0, damage=80, materials=[] => 0*10 + (100-80) + 0*5 = 20
            expect(system.calculateRepairValue(repair.repairId)).toBe(20);
        });

        it('should factor in quality', () => {
            const { repair } = system.startRepair({ damage: 50, quality: 10 });
            // 10*10 + (100-50) + 0*5 = 100 + 50 = 150
            expect(system.calculateRepairValue(repair.repairId)).toBe(150);
        });

        it('should factor in materials', () => {
            const { repair } = system.startRepair({ damage: 50, quality: 5, materials: ['a', 'b', 'c'] });
            // 5*10 + (100-50) + 3*5 = 50 + 50 + 15 = 115
            expect(system.calculateRepairValue(repair.repairId)).toBe(115);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateRepairValue('ghost')).toBe(0);
        });

        it('should increase after repair work', () => {
            const { repair } = system.startRepair({ damage: 80 });
            const before = system.calculateRepairValue(repair.repairId);
            system.refineQuality(repair.repairId, 10);
            system.reduceDamage(repair.repairId, 20);
            system.addMaterial(repair.repairId, 'm1');
            const after = system.calculateRepairValue(repair.repairId);
            expect(after).toBeGreaterThan(before);
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

        it('should execute default getRepair', () => {
            const result = system.executeTool('getRepair', { repairId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default startRepair', () => {
            const result = system.executeTool('startRepair', { restorerId: 'r1' });
            expect(result.success).toBe(true);
            expect(result.result.repair.restorerId).toBe('r1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('repairStarted', () => count++);
            unregister();
            system.startRepair({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('repairStarted', () => { throw new Error('x'); });
            expect(() => system.startRepair({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalRepairs = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalRepairs = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startRepair({});
            const json = system.toJSON();
            expect(json.repairs.length).toBe(1);
            expect(json.stats.totalRepairs).toBe(1);
        });
        it('should deserialize', () => {
            system.startRepair({ restorerId: 'r1' });
            const json = system.toJSON();
            const newSys = new TreasureRepair();
            newSys.fromJSON(json);
            expect(newSys.repairs.size).toBe(1);
            expect(newSys.stats.totalRepairs).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.repairCount).toBe(0);
            expect(stats.totalRepairs).toBe(0);
            system.startRepair({});
            expect(system.getStats().repairCount).toBe(1);
        });
    });
});
