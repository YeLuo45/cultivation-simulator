/**
 * CultivationFurniture.test.js - 修真器系统测试
 * V566 Iteration 9/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationFurniture } from '../../../systems/ai/CultivationFurniture.js';

describe('CultivationFurniture', () => {
    let system;
    beforeEach(() => { system = new CultivationFurniture(); });

    describe('buildFurniture', () => {
        it('should build with defaults', () => {
            const { furniture } = system.buildFurniture({});
            expect(furniture.craftsmanId).toBe('unknown_craftsman');
            expect(furniture.name).toBe('unnamed_furniture');
            expect(furniture.type).toBe('table');
            expect(furniture.craftsmanship).toBe(20);
            expect(furniture.woods).toEqual([]);
            expect(furniture.level).toBe(1);
            expect(furniture.status).toBe('rough');
            expect(furniture.furnitureId).toBeDefined();
            expect(furniture.createdAt).toBeDefined();
        });

        it('should build with custom data', () => {
            const { furniture } = system.buildFurniture({
                craftsmanId: 'master_f1',
                name: 'DragonThrone',
                type: 'throne',
                craftsmanship: 80,
                woods: ['sandalwood', 'rosewood'],
                level: 5,
                status: 'polished'
            });
            expect(furniture.craftsmanId).toBe('master_f1');
            expect(furniture.name).toBe('DragonThrone');
            expect(furniture.type).toBe('throne');
            expect(furniture.craftsmanship).toBe(80);
            expect(furniture.woods).toEqual(['sandalwood', 'rosewood']);
            expect(furniture.level).toBe(5);
            expect(furniture.status).toBe('polished');
        });

        it('should support all three types', () => {
            const { furniture: f1 } = system.buildFurniture({ type: 'table' });
            const { furniture: f2 } = system.buildFurniture({ type: 'chair' });
            const { furniture: f3 } = system.buildFurniture({ type: 'throne' });
            expect(f1.type).toBe('table');
            expect(f2.type).toBe('chair');
            expect(f3.type).toBe('throne');
        });

        it('should increment totalFurnitures', () => {
            system.buildFurniture({});
            system.buildFurniture({});
            system.buildFurniture({});
            expect(system.stats.totalFurnitures).toBe(3);
        });

        it('should trigger furnitureBuilt hook', () => {
            let called = false;
            system.registerHook('furnitureBuilt', () => { called = true; });
            system.buildFurniture({});
            expect(called).toBe(true);
        });

        it('should accept custom id', () => {
            const { furniture } = system.buildFurniture({ id: 'custom_id_456' });
            expect(furniture.furnitureId).toBe('custom_id_456');
        });

        it('should respect custom config', () => {
            const custom = new CultivationFurniture({ maxFurnitures: 200, baseCraftsmanship: 50 });
            const { furniture } = custom.buildFurniture({});
            expect(furniture.craftsmanship).toBe(50);
        });
    });

    describe('getFurniture', () => {
        it('should return furniture', () => {
            const { furniture } = system.buildFurniture({ name: 'a' });
            const got = system.getFurniture(furniture.furnitureId);
            expect(got).not.toBeNull();
            expect(got.furnitureId).toBe(furniture.furnitureId);
            expect(got.name).toBe('a');
        });
        it('should return null for missing', () => { expect(system.getFurniture('ghost')).toBeNull(); });
    });

    describe('listFurnitures', () => {
        it('should list all', () => {
            system.buildFurniture({});
            system.buildFurniture({});
            expect(system.listFurnitures().length).toBe(2);
        });

        it('should return empty list when no furnitures', () => {
            expect(system.listFurnitures().length).toBe(0);
        });
    });

    describe('listByCraftsman', () => {
        it('should filter by craftsman', () => {
            system.buildFurniture({ craftsmanId: 'c1' });
            system.buildFurniture({ craftsmanId: 'c1' });
            system.buildFurniture({ craftsmanId: 'c2' });
            expect(system.listByCraftsman('c1').length).toBe(2);
            expect(system.listByCraftsman('c2').length).toBe(1);
            expect(system.listByCraftsman('c3').length).toBe(0);
        });
    });

    describe('listMasterwork', () => {
        it('should list only masterwork furnitures', () => {
            const { furniture: f1 } = system.buildFurniture({});
            const { furniture: f2 } = system.buildFurniture({});
            system.masterworkFurniture(f1.furnitureId);
            expect(system.listMasterwork().length).toBe(1);
            expect(system.listMasterwork()[0].furnitureId).toBe(f1.furnitureId);
            expect(f2.status).toBe('rough');
        });

        it('should return empty when none masterworked', () => {
            system.buildFurniture({});
            system.buildFurniture({});
            expect(system.listMasterwork().length).toBe(0);
        });
    });

    describe('addWood', () => {
        it('should add wood', () => {
            const { furniture } = system.buildFurniture({});
            system.addWood(furniture.furnitureId, 'sandalwood');
            expect(furniture.woods).toContain('sandalwood');
            expect(furniture.woods.length).toBe(1);
        });

        it('should add multiple woods', () => {
            const { furniture } = system.buildFurniture({});
            system.addWood(furniture.furnitureId, 'sandalwood');
            system.addWood(furniture.furnitureId, 'rosewood');
            system.addWood(furniture.furnitureId, 'ebony');
            expect(furniture.woods).toEqual(['sandalwood', 'rosewood', 'ebony']);
        });

        it('should set status to polished when 2+ woods', () => {
            const { furniture } = system.buildFurniture({});
            expect(furniture.status).toBe('rough');
            system.addWood(furniture.furnitureId, 'sandalwood');
            expect(furniture.status).toBe('rough');
            system.addWood(furniture.furnitureId, 'rosewood');
            expect(furniture.status).toBe('polished');
        });

        it('should reject missing', () => {
            const result = system.addWood('ghost', 'sandalwood');
            expect(result.error).toBe('FURNITURE_NOT_FOUND');
        });

        it('should trigger woodAdded hook', () => {
            const { furniture } = system.buildFurniture({});
            let called = false;
            system.registerHook('woodAdded', () => { called = true; });
            system.addWood(furniture.furnitureId, 'sandalwood');
            expect(called).toBe(true);
        });
    });

    describe('increaseCraftsmanship', () => {
        it('should increase by default amount', () => {
            const { furniture } = system.buildFurniture({});
            system.increaseCraftsmanship(furniture.furnitureId);
            expect(furniture.craftsmanship).toBe(25);
        });

        it('should increase by custom amount', () => {
            const { furniture } = system.buildFurniture({});
            system.increaseCraftsmanship(furniture.furnitureId, 30);
            expect(furniture.craftsmanship).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.increaseCraftsmanship('ghost', 5);
            expect(result.error).toBe('FURNITURE_NOT_FOUND');
        });

        it('should trigger craftsmanshipIncreased hook', () => {
            const { furniture } = system.buildFurniture({});
            let called = false;
            system.registerHook('craftsmanshipIncreased', () => { called = true; });
            system.increaseCraftsmanship(furniture.furnitureId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpFurniture', () => {
        it('should level up', () => {
            const { furniture } = system.buildFurniture({});
            system.levelUpFurniture(furniture.furnitureId);
            expect(furniture.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { furniture } = system.buildFurniture({});
            system.levelUpFurniture(furniture.furnitureId);
            system.levelUpFurniture(furniture.furnitureId);
            system.levelUpFurniture(furniture.furnitureId);
            expect(furniture.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpFurniture('ghost');
            expect(result.error).toBe('FURNITURE_NOT_FOUND');
        });

        it('should trigger furnitureLeveledUp hook', () => {
            const { furniture } = system.buildFurniture({});
            let called = false;
            system.registerHook('furnitureLeveledUp', () => { called = true; });
            system.levelUpFurniture(furniture.furnitureId);
            expect(called).toBe(true);
        });
    });

    describe('masterworkFurniture', () => {
        it('should set status to masterwork', () => {
            const { furniture } = system.buildFurniture({});
            system.masterworkFurniture(furniture.furnitureId);
            expect(furniture.status).toBe('masterwork');
        });

        it('should reject missing', () => {
            const result = system.masterworkFurniture('ghost');
            expect(result.error).toBe('FURNITURE_NOT_FOUND');
        });

        it('should trigger furnitureMasterworked hook', () => {
            const { furniture } = system.buildFurniture({});
            let called = false;
            system.registerHook('furnitureMasterworked', () => { called = true; });
            system.masterworkFurniture(furniture.furnitureId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFurnitureValue', () => {
        it('should calculate default value', () => {
            const { furniture } = system.buildFurniture({});
            // level=1 * 100 + craftsmanship=20 * 2 + 0 woods * 30 = 100 + 40 + 0 = 140
            expect(system.calculateFurnitureValue(furniture.furnitureId)).toBe(140);
        });

        it('should add 30 per wood', () => {
            const { furniture } = system.buildFurniture({});
            system.addWood(furniture.furnitureId, 'sandalwood');
            system.addWood(furniture.furnitureId, 'rosewood');
            // 140 + 2*30 = 200
            expect(system.calculateFurnitureValue(furniture.furnitureId)).toBe(200);
        });

        it('should reflect level in formula', () => {
            const { furniture } = system.buildFurniture({});
            system.levelUpFurniture(furniture.furnitureId);
            // level=2 * 100 + 20 * 2 + 0 = 200 + 40 = 240
            expect(system.calculateFurnitureValue(furniture.furnitureId)).toBe(240);
        });

        it('should reflect craftsmanship in formula', () => {
            const { furniture } = system.buildFurniture({});
            system.increaseCraftsmanship(furniture.furnitureId, 30);
            // 1*100 + 50*2 + 0 = 100 + 100 = 200
            expect(system.calculateFurnitureValue(furniture.furnitureId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateFurnitureValue('ghost')).toBe(0);
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

        it('should execute default getFurniture', () => {
            const result = system.executeTool('getFurniture', { furnitureId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('furnitureBuilt', () => count++);
            unregister();
            system.buildFurniture({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('furnitureBuilt', () => { throw new Error('x'); });
            expect(() => system.buildFurniture({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalFurnitures = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxFurnitures).toBe(75);
        });
        it('should not double evolve', () => {
            system.stats.totalFurnitures = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.buildFurniture({ name: 'a' });
            const json = system.toJSON();
            expect(json.furnitures.length).toBe(1);
            expect(json.stats.totalFurnitures).toBe(1);
            expect(json.config.maxFurnitures).toBe(50);
        });
        it('should deserialize', () => {
            system.buildFurniture({ name: 'a' });
            const json = system.toJSON();
            const newSys = new CultivationFurniture();
            newSys.fromJSON(json);
            expect(newSys.furnitures.size).toBe(1);
            expect(newSys.stats.totalFurnitures).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.furnitureCount).toBe(0);
            expect(stats.totalFurnitures).toBe(0);
            system.buildFurniture({});
            expect(system.getStats().furnitureCount).toBe(1);
            expect(system.getStats().totalFurnitures).toBe(1);
        });
    });
});
