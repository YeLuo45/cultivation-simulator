/**
 * CultivationMaterial.test.js - 修真材料系统测试
 * V700 Iteration 23/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMaterial } from '../../../systems/ai/CultivationMaterial.js';

describe('CultivationMaterial', () => {
    let system;
    beforeEach(() => { system = new CultivationMaterial(); });

    describe('recruitMaterial', () => {
        it('should recruit', () => {
            const { material } = system.recruitMaterial({ masterId: 'm1', name: 'Spirit Iron' });
            expect(material.masterId).toBe('m1');
            expect(material.name).toBe('Spirit Iron');
        });

        it('should default to novice status', () => {
            const { material } = system.recruitMaterial({});
            expect(material.status).toBe('novice');
        });

        it('should default type to metal', () => {
            const { material } = system.recruitMaterial({});
            expect(material.type).toBe('metal');
        });

        it('should default purity to basePurity', () => {
            const { material } = system.recruitMaterial({});
            expect(material.purity).toBe(20);
        });

        it('should start at level 1', () => {
            const { material } = system.recruitMaterial({});
            expect(material.level).toBe(1);
        });

        it('should start with empty refinements', () => {
            const { material } = system.recruitMaterial({});
            expect(material.refinements).toEqual([]);
        });

        it('should generate materialId', () => {
            const { material } = system.recruitMaterial({});
            expect(material.materialId).toBeDefined();
            expect(typeof material.materialId).toBe('string');
        });

        it('should accept custom materialId', () => {
            const { material } = system.recruitMaterial({ materialId: 'my-material' });
            expect(material.materialId).toBe('my-material');
        });

        it('should trigger materialRecruited hook', () => {
            let called = false;
            system.registerHook('materialRecruited', () => { called = true; });
            system.recruitMaterial({});
            expect(called).toBe(true);
        });

        it('should support all types', () => {
            const { material: m1 } = system.recruitMaterial({ type: 'metal' });
            const { material: m2 } = system.recruitMaterial({ type: 'wood' });
            const { material: m3 } = system.recruitMaterial({ type: 'element' });
            expect(m1.type).toBe('metal');
            expect(m2.type).toBe('wood');
            expect(m3.type).toBe('element');
        });
    });

    describe('getMaterial', () => {
        it('should return material', () => {
            const { material } = system.recruitMaterial({});
            expect(system.getMaterial(material.materialId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMaterial('ghost')).toBeNull(); });
    });

    describe('listMaterials', () => {
        it('should list all', () => {
            system.recruitMaterial({});
            system.recruitMaterial({});
            expect(system.listMaterials().length).toBe(2);
        });

        it('should return empty when no materials', () => {
            expect(system.listMaterials().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitMaterial({ masterId: 'm1' });
            system.recruitMaterial({ masterId: 'm2' });
            system.recruitMaterial({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitMaterial({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { material: m1 } = system.recruitMaterial({});
            const { material: m2 } = system.recruitMaterial({});
            system.legendMaterial(m1.materialId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].materialId).toBe(m1.materialId);
            expect(m2.status).toBe('novice');
        });

        it('should return empty when none legendary', () => {
            system.recruitMaterial({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addRefinement', () => {
        it('should add refinement', () => {
            const { material } = system.recruitMaterial({});
            system.addRefinement(material.materialId, 'fire-temper');
            expect(material.refinements).toContain('fire-temper');
        });

        it('should accumulate refinements', () => {
            const { material } = system.recruitMaterial({});
            system.addRefinement(material.materialId, 'r1');
            system.addRefinement(material.materialId, 'r2');
            system.addRefinement(material.materialId, 'r3');
            expect(material.refinements.length).toBe(3);
        });

        it('should reject missing material', () => {
            const result = system.addRefinement('ghost', 'r');
            expect(result.error).toBe('MATERIAL_NOT_FOUND');
        });

        it('should trigger refinementAdded hook', () => {
            const { material } = system.recruitMaterial({});
            let called = false;
            system.registerHook('refinementAdded', () => { called = true; });
            system.addRefinement(material.materialId, 'r');
            expect(called).toBe(true);
        });
    });

    describe('raisePurity', () => {
        it('should raise purity by default', () => {
            const { material } = system.recruitMaterial({});
            system.raisePurity(material.materialId);
            expect(material.purity).toBe(25);
        });

        it('should raise purity by custom amount', () => {
            const { material } = system.recruitMaterial({});
            system.raisePurity(material.materialId, 100);
            expect(material.purity).toBe(120);
        });

        it('should reject missing material', () => {
            const result = system.raisePurity('ghost');
            expect(result.error).toBe('MATERIAL_NOT_FOUND');
        });

        it('should trigger purityRaised hook', () => {
            const { material } = system.recruitMaterial({});
            let called = false;
            system.registerHook('purityRaised', () => { called = true; });
            system.raisePurity(material.materialId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMaterial', () => {
        it('should level up', () => {
            const { material } = system.recruitMaterial({});
            system.levelUpMaterial(material.materialId);
            expect(material.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { material } = system.recruitMaterial({});
            system.levelUpMaterial(material.materialId);
            system.levelUpMaterial(material.materialId);
            system.levelUpMaterial(material.materialId);
            expect(material.level).toBe(4);
        });

        it('should reject missing material', () => {
            const result = system.levelUpMaterial('ghost');
            expect(result.error).toBe('MATERIAL_NOT_FOUND');
        });

        it('should trigger materialLeveledUp hook', () => {
            const { material } = system.recruitMaterial({});
            let called = false;
            system.registerHook('materialLeveledUp', () => { called = true; });
            system.levelUpMaterial(material.materialId);
            expect(called).toBe(true);
        });
    });

    describe('legendMaterial', () => {
        it('should legendize', () => {
            const { material } = system.recruitMaterial({});
            system.legendMaterial(material.materialId);
            expect(material.status).toBe('legendary');
        });

        it('should reject missing material', () => {
            const result = system.legendMaterial('ghost');
            expect(result.error).toBe('MATERIAL_NOT_FOUND');
        });

        it('should trigger materialLegendized hook', () => {
            const { material } = system.recruitMaterial({});
            let called = false;
            system.registerHook('materialLegendized', () => { called = true; });
            system.legendMaterial(material.materialId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMaterialValue', () => {
        it('should calculate base value', () => {
            const { material } = system.recruitMaterial({});
            // level=1, purity=20, refinements=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculateMaterialValue(material.materialId)).toBe(140);
        });

        it('should include refinements in value', () => {
            const { material } = system.recruitMaterial({});
            system.addRefinement(material.materialId, 'r1');
            system.addRefinement(material.materialId, 'r2');
            // level=1, purity=20, refinements=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateMaterialValue(material.materialId)).toBe(200);
        });

        it('should scale with level', () => {
            const { material } = system.recruitMaterial({});
            system.levelUpMaterial(material.materialId);
            system.levelUpMaterial(material.materialId);
            // level=3, purity=20, refinements=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculateMaterialValue(material.materialId)).toBe(340);
        });

        it('should scale with purity', () => {
            const { material } = system.recruitMaterial({});
            system.raisePurity(material.materialId, 100);
            // level=1, purity=120, refinements=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculateMaterialValue(material.materialId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMaterialValue('ghost')).toBe(0);
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

        it('should handle undefined context', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test');
            expect(result.success).toBe(true);
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

        it('should execute default getMaterial', () => {
            const result = system.executeTool('getMaterial', { materialId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitMaterial', () => {
            const result = system.executeTool('recruitMaterial', { masterId: 'm1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('materialRecruited', () => count++);
            unregister();
            system.recruitMaterial({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('materialRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMaterial({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMaterials = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMaterials = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitMaterial({});
            const json = system.toJSON();
            expect(json.materials.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitMaterial({});
            const json = system.toJSON();
            const newSys = new CultivationMaterial();
            newSys.fromJSON(json);
            expect(newSys.materials.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.materialCount).toBe(0);
        });
    });
});
