/**
 * CultivationBrand.test.js - 修真烙印系统测试
 * V760 Iteration 23/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBrand } from '../../../systems/ai/CultivationBrand.js';

describe('CultivationBrand', () => {
    let system;
    beforeEach(() => { system = new CultivationBrand(); });

    describe('recruitBrand', () => {
        it('should recruit brand', () => {
            const { brand } = system.recruitBrand({ masterId: 'm1', name: 'Heaven Brand', type: 'sacred' });
            expect(brand.masterId).toBe('m1');
            expect(brand.name).toBe('Heaven Brand');
            expect(brand.type).toBe('sacred');
        });

        it('should default type to fire', () => {
            const { brand } = system.recruitBrand({});
            expect(brand.type).toBe('fire');
        });

        it('should default name to Unnamed Brand', () => {
            const { brand } = system.recruitBrand({});
            expect(brand.name).toBe('Unnamed Brand');
        });

        it('should default heat to baseHeat', () => {
            const { brand } = system.recruitBrand({});
            expect(brand.heat).toBe(20);
        });

        it('should start at level 1', () => {
            const { brand } = system.recruitBrand({});
            expect(brand.level).toBe(1);
        });

        it('should start with status novice', () => {
            const { brand } = system.recruitBrand({});
            expect(brand.status).toBe('novice');
        });

        it('should start with empty scars', () => {
            const { brand } = system.recruitBrand({});
            expect(brand.scars).toEqual([]);
        });

        it('should generate brandId', () => {
            const { brand } = system.recruitBrand({});
            expect(brand.brandId).toBeDefined();
            expect(typeof brand.brandId).toBe('string');
        });

        it('should accept custom brandId', () => {
            const { brand } = system.recruitBrand({ brandId: 'my-brand' });
            expect(brand.brandId).toBe('my-brand');
        });

        it('should support all types', () => {
            const { brand: s1 } = system.recruitBrand({ type: 'fire' });
            const { brand: s2 } = system.recruitBrand({ type: 'iron' });
            const { brand: s3 } = system.recruitBrand({ type: 'sacred' });
            expect(s1.type).toBe('fire');
            expect(s2.type).toBe('iron');
            expect(s3.type).toBe('sacred');
        });

        it('should trigger brandRecruited hook', () => {
            let called = false;
            system.registerHook('brandRecruited', () => { called = true; });
            system.recruitBrand({});
            expect(called).toBe(true);
        });
    });

    describe('getBrand', () => {
        it('should return brand', () => {
            const { brand } = system.recruitBrand({});
            expect(system.getBrand(brand.brandId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBrand('ghost')).toBeNull(); });
    });

    describe('listBrands', () => {
        it('should list all', () => {
            system.recruitBrand({});
            system.recruitBrand({});
            expect(system.listBrands().length).toBe(2);
        });

        it('should return empty when no brands', () => {
            expect(system.listBrands().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitBrand({ masterId: 'm1' });
            system.recruitBrand({ masterId: 'm2' });
            system.recruitBrand({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for missing master', () => {
            system.recruitBrand({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { brand: s1 } = system.recruitBrand({});
            const { brand: s2 } = system.recruitBrand({});
            system.legendBrand(s1.brandId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].brandId).toBe(s1.brandId);
        });

        it('should return empty when none legendary', () => {
            system.recruitBrand({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addScar', () => {
        it('should add scar', () => {
            const { brand } = system.recruitBrand({});
            system.addScar(brand.brandId, 'dragon-scar');
            expect(brand.scars).toContain('dragon-scar');
            expect(brand.scars.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addScar('ghost', 'scar');
            expect(result.error).toBe('BRAND_NOT_FOUND');
        });

        it('should trigger scarAdded hook', () => {
            const { brand } = system.recruitBrand({});
            let called = false;
            system.registerHook('scarAdded', () => { called = true; });
            system.addScar(brand.brandId, 'scar');
            expect(called).toBe(true);
        });

        it('should add multiple scars', () => {
            const { brand } = system.recruitBrand({});
            system.addScar(brand.brandId, 'scar1');
            system.addScar(brand.brandId, 'scar2');
            expect(brand.scars.length).toBe(2);
        });
    });

    describe('raiseHeat', () => {
        it('should raise heat', () => {
            const { brand } = system.recruitBrand({});
            system.raiseHeat(brand.brandId, 10);
            expect(brand.heat).toBe(30);
        });

        it('should default amount to 5', () => {
            const { brand } = system.recruitBrand({});
            system.raiseHeat(brand.brandId);
            expect(brand.heat).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseHeat('ghost', 10);
            expect(result.error).toBe('BRAND_NOT_FOUND');
        });

        it('should trigger heatRaised hook', () => {
            const { brand } = system.recruitBrand({});
            let called = false;
            system.registerHook('heatRaised', () => { called = true; });
            system.raiseHeat(brand.brandId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpBrand', () => {
        it('should level up', () => {
            const { brand } = system.recruitBrand({});
            system.levelUpBrand(brand.brandId);
            expect(brand.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpBrand('ghost');
            expect(result.error).toBe('BRAND_NOT_FOUND');
        });

        it('should trigger brandLeveledUp hook', () => {
            const { brand } = system.recruitBrand({});
            let called = false;
            system.registerHook('brandLeveledUp', () => { called = true; });
            system.levelUpBrand(brand.brandId);
            expect(called).toBe(true);
        });
    });

    describe('legendBrand', () => {
        it('should set status to legendary', () => {
            const { brand } = system.recruitBrand({});
            system.legendBrand(brand.brandId);
            expect(brand.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendBrand('ghost');
            expect(result.error).toBe('BRAND_NOT_FOUND');
        });

        it('should trigger brandLegendized hook', () => {
            const { brand } = system.recruitBrand({});
            let called = false;
            system.registerHook('brandLegendized', () => { called = true; });
            system.legendBrand(brand.brandId);
            expect(called).toBe(true);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitBrand({ type: 'fire' });
            system.recruitBrand({ type: 'iron' });
            system.recruitBrand({ type: 'sacred' });
            expect(system.listByType('sacred').length).toBe(1);
        });

        it('should return empty for missing type', () => {
            system.recruitBrand({ type: 'fire' });
            expect(system.listByType('cosmic').length).toBe(0);
        });
    });

    describe('listVeteran', () => {
        it('should return empty when no veteran brands', () => {
            system.recruitBrand({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('calculateBrandValue', () => {
        it('should calculate for default brand', () => {
            const { brand } = system.recruitBrand({});
            // level 1 * 100 + heat 20 * 2 + 0 scars * 30 = 100 + 40 + 0 = 140
            expect(system.calculateBrandValue(brand.brandId)).toBe(140);
        });

        it('should incorporate level, heat, and scars', () => {
            const { brand } = system.recruitBrand({});
            system.levelUpBrand(brand.brandId); // level 2
            system.raiseHeat(brand.brandId, 10); // heat 30
            system.addScar(brand.brandId, 'scar1'); // 1 scar
            system.addScar(brand.brandId, 'scar2'); // 2 scars
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateBrandValue(brand.brandId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBrandValue('ghost')).toBe(0);
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

        it('should execute default getBrand', () => {
            const result = system.executeTool('getBrand', { brandId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('brandRecruited', () => count++);
            unregister();
            system.recruitBrand({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('brandRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitBrand({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBrands = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBrands = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitBrand({});
            const json = system.toJSON();
            expect(json.brands.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitBrand({});
            const json = system.toJSON();
            const newSys = new CultivationBrand();
            newSys.fromJSON(json);
            expect(newSys.brands.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.brandCount).toBe(0);
        });
    });
});
