/**
 * CultivationTreasure.test.js - 修真宝物系统测试
 * V699 Iteration 22/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTreasure } from '../../../systems/ai/CultivationTreasure.js';

describe('CultivationTreasure', () => {
    let system;
    beforeEach(() => { system = new CultivationTreasure(); });

    describe('recruitTreasure', () => {
        it('should recruit', () => {
            const { treasure } = system.recruitTreasure({ masterId: 'm1', name: 'DragonBlade' });
            expect(treasure.masterId).toBe('m1');
            expect(treasure.name).toBe('DragonBlade');
        });

        it('should default name to Cultivation Treasure', () => {
            const { treasure } = system.recruitTreasure({});
            expect(treasure.name).toBe('Cultivation Treasure');
        });

        it('should default type to weapon', () => {
            const { treasure } = system.recruitTreasure({});
            expect(treasure.type).toBe('weapon');
        });

        it('should default rarity to baseRarity', () => {
            const { treasure } = system.recruitTreasure({});
            expect(treasure.rarity).toBe(20);
        });

        it('should default status to novice', () => {
            const { treasure } = system.recruitTreasure({});
            expect(treasure.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { treasure } = system.recruitTreasure({});
            expect(treasure.level).toBe(1);
        });

        it('should default enchantments to empty array', () => {
            const { treasure } = system.recruitTreasure({});
            expect(treasure.enchantments).toEqual([]);
        });

        it('should trigger treasureRecruited hook', () => {
            let called = false;
            system.registerHook('treasureRecruited', () => { called = true; });
            system.recruitTreasure({});
            expect(called).toBe(true);
        });
    });

    describe('getTreasure', () => {
        it('should return', () => {
            const { treasure } = system.recruitTreasure({});
            expect(system.getTreasure(treasure.treasureId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTreasure('ghost')).toBeNull(); });
    });

    describe('listTreasures', () => {
        it('should list all', () => {
            system.recruitTreasure({});
            system.recruitTreasure({});
            expect(system.listTreasures().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listTreasures().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitTreasure({ masterId: 'm1' });
            system.recruitTreasure({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitTreasure({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary treasures', () => {
            const { treasure: t1 } = system.recruitTreasure({});
            system.recruitTreasure({});
            system.legendTreasure(t1.treasureId);
            const result = system.listLegendary();
            expect(result.length).toBe(1);
            expect(result[0].treasureId).toBe(t1.treasureId);
        });

        it('should return empty when none legendary', () => {
            system.recruitTreasure({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addEnchantment', () => {
        it('should add enchantment', () => {
            const { treasure } = system.recruitTreasure({});
            const result = system.addEnchantment(treasure.treasureId, { name: 'Flaming' });
            expect(result.success).toBe(true);
            expect(treasure.enchantments.length).toBe(1);
            expect(treasure.enchantments[0].name).toBe('Flaming');
        });

        it('should reject missing treasure', () => {
            const result = system.addEnchantment('ghost', { name: 'Frost' });
            expect(result.error).toBe('TREASURE_NOT_FOUND');
        });

        it('should trigger enchantmentAdded hook', () => {
            const { treasure } = system.recruitTreasure({});
            let called = false;
            system.registerHook('enchantmentAdded', () => { called = true; });
            system.addEnchantment(treasure.treasureId, { name: 'Lightning' });
            expect(called).toBe(true);
        });
    });

    describe('raiseRarity', () => {
        it('should raise rarity', () => {
            const { treasure } = system.recruitTreasure({});
            const result = system.raiseRarity(treasure.treasureId, 10);
            expect(result.success).toBe(true);
            expect(treasure.rarity).toBe(30);
        });

        it('should default amount to 5', () => {
            const { treasure } = system.recruitTreasure({});
            system.raiseRarity(treasure.treasureId);
            expect(treasure.rarity).toBe(25);
        });

        it('should reject missing treasure', () => {
            const result = system.raiseRarity('ghost', 5);
            expect(result.error).toBe('TREASURE_NOT_FOUND');
        });

        it('should trigger rarityRaised hook', () => {
            const { treasure } = system.recruitTreasure({});
            let called = false;
            system.registerHook('rarityRaised', () => { called = true; });
            system.raiseRarity(treasure.treasureId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpTreasure', () => {
        it('should level up', () => {
            const { treasure } = system.recruitTreasure({});
            const result = system.levelUpTreasure(treasure.treasureId);
            expect(result.success).toBe(true);
            expect(treasure.level).toBe(2);
        });

        it('should reject missing treasure', () => {
            const result = system.levelUpTreasure('ghost');
            expect(result.error).toBe('TREASURE_NOT_FOUND');
        });

        it('should trigger treasureLeveledUp hook', () => {
            const { treasure } = system.recruitTreasure({});
            let called = false;
            system.registerHook('treasureLeveledUp', () => { called = true; });
            system.levelUpTreasure(treasure.treasureId);
            expect(called).toBe(true);
        });
    });

    describe('legendTreasure', () => {
        it('should legendize', () => {
            const { treasure } = system.recruitTreasure({});
            const result = system.legendTreasure(treasure.treasureId);
            expect(result.success).toBe(true);
            expect(treasure.status).toBe('legendary');
        });

        it('should reject missing treasure', () => {
            const result = system.legendTreasure('ghost');
            expect(result.error).toBe('TREASURE_NOT_FOUND');
        });

        it('should trigger treasureLegendized hook', () => {
            const { treasure } = system.recruitTreasure({});
            let called = false;
            system.registerHook('treasureLegendized', () => { called = true; });
            system.legendTreasure(treasure.treasureId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTreasureValue', () => {
        it('should calculate base value with level=1, rarity=20, 0 enchantments', () => {
            const { treasure } = system.recruitTreasure({});
            // level*100 + rarity*2 + enchantments.length*30 = 1*100 + 20*2 + 0 = 140
            expect(system.calculateTreasureValue(treasure.treasureId)).toBe(140);
        });

        it('should add enchantment value (30 each)', () => {
            const { treasure } = system.recruitTreasure({});
            system.addEnchantment(treasure.treasureId, { name: 'A' });
            system.addEnchantment(treasure.treasureId, { name: 'B' });
            // 1*100 + 20*2 + 2*30 = 100 + 40 + 60 = 200
            expect(system.calculateTreasureValue(treasure.treasureId)).toBe(200);
        });

        it('should add level and rarity changes', () => {
            const { treasure } = system.recruitTreasure({});
            system.levelUpTreasure(treasure.treasureId); // level 2
            system.raiseRarity(treasure.treasureId, 10); // rarity 30
            // 2*100 + 30*2 + 0 = 200 + 60 = 260
            expect(system.calculateTreasureValue(treasure.treasureId)).toBe(260);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTreasureValue('ghost')).toBe(0);
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

        it('should execute default getTreasure', () => {
            const result = system.executeTool('getTreasure', { treasureId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle null context', () => {
            const result = system.executeTool('getTreasure', null);
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('treasureRecruited', () => count++);
            unregister();
            system.recruitTreasure({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('treasureRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitTreasure({})).not.toThrow();
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
        });
        it('should not double evolve', () => {
            system.stats.totalTreasures = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitTreasure({});
            const json = system.toJSON();
            expect(json.treasures.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitTreasure({});
            const json = system.toJSON();
            const newSys = new CultivationTreasure();
            newSys.fromJSON(json);
            expect(newSys.treasures.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.treasureCount).toBe(0);
        });
    });
});
