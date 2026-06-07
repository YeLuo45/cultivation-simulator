/**
 * CultivationItem.test.js - 修真物品测试
 * V698 Iteration 21/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationItem } from '../../../systems/ai/CultivationItem.js';

describe('CultivationItem', () => {
    let system;
    beforeEach(() => { system = new CultivationItem(); });

    describe('recruitItem', () => {
        it('should recruit', () => {
            const { item } = system.recruitItem({ masterId: 'm1', name: 'spirit-sword', type: 'equipment' });
            expect(item.masterId).toBe('m1');
            expect(item.name).toBe('spirit-sword');
            expect(item.type).toBe('equipment');
        });

        it('should default type to consumable', () => {
            const { item } = system.recruitItem({ masterId: 'm1' });
            expect(item.type).toBe('consumable');
        });

        it('should set default value from config', () => {
            const { item } = system.recruitItem({ masterId: 'm1' });
            expect(item.value).toBe(20);
        });

        it('should initialize level 1 and status novice', () => {
            const { item } = system.recruitItem({ masterId: 'm1' });
            expect(item.level).toBe(1);
            expect(item.status).toBe('novice');
        });

        it('should respect custom value and enchantments', () => {
            const { item } = system.recruitItem({ masterId: 'm1', value: 80, enchantments: ['flame', 'wind'] });
            expect(item.value).toBe(80);
            expect(item.enchantments.length).toBe(2);
        });

        it('should trigger itemRecruited hook', () => {
            let called = false;
            system.registerHook('itemRecruited', () => { called = true; });
            system.recruitItem({});
            expect(called).toBe(true);
        });
    });

    describe('getItem', () => {
        it('should return item', () => {
            const { item } = system.recruitItem({});
            expect(system.getItem(item.itemId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getItem('ghost')).toBeNull(); });
    });

    describe('listItems', () => {
        it('should list all', () => {
            system.recruitItem({});
            system.recruitItem({});
            expect(system.listItems().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitItem({ masterId: 'm1' });
            system.recruitItem({ masterId: 'm2' });
            system.recruitItem({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary items', () => {
            const { item: a } = system.recruitItem({});
            const { item: b } = system.recruitItem({});
            system.legendItem(b.itemId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addEnchantment', () => {
        it('should add enchantment', () => {
            const { item } = system.recruitItem({});
            system.addEnchantment(item.itemId, 'flame-burst');
            expect(item.enchantments.length).toBe(1);
            expect(item.enchantments[0]).toBe('flame-burst');
        });

        it('should reject missing', () => {
            const result = system.addEnchantment('ghost', 'x');
            expect(result.error).toBe('ITEM_NOT_FOUND');
        });

        it('should trigger enchantmentAdded hook', () => {
            const { item } = system.recruitItem({});
            let payload = null;
            system.registerHook('enchantmentAdded', (d) => { payload = d; });
            system.addEnchantment(item.itemId, 'ice-edge');
            expect(payload.enchantment).toBe('ice-edge');
        });
    });

    describe('raiseValue', () => {
        it('should raise with default amount', () => {
            const { item } = system.recruitItem({});
            system.raiseValue(item.itemId);
            expect(item.value).toBe(25);
        });

        it('should raise with custom amount', () => {
            const { item } = system.recruitItem({});
            system.raiseValue(item.itemId, 30);
            expect(item.value).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raiseValue('ghost', 5);
            expect(result.error).toBe('ITEM_NOT_FOUND');
        });

        it('should trigger valueRaised hook', () => {
            const { item } = system.recruitItem({});
            let called = false;
            system.registerHook('valueRaised', () => { called = true; });
            system.raiseValue(item.itemId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpItem', () => {
        it('should level up', () => {
            const { item } = system.recruitItem({});
            system.levelUpItem(item.itemId);
            expect(item.level).toBe(2);
        });

        it('should promote to veteran at level 5', () => {
            const { item } = system.recruitItem({});
            for (let i = 0; i < 4; i++) system.levelUpItem(item.itemId);
            expect(item.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpItem('ghost');
            expect(result.error).toBe('ITEM_NOT_FOUND');
        });

        it('should trigger itemLeveledUp hook', () => {
            const { item } = system.recruitItem({});
            let called = false;
            system.registerHook('itemLeveledUp', () => { called = true; });
            system.levelUpItem(item.itemId);
            expect(called).toBe(true);
        });
    });

    describe('legendItem', () => {
        it('should mark legendary', () => {
            const { item } = system.recruitItem({});
            system.legendItem(item.itemId);
            expect(item.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendItem('ghost');
            expect(result.error).toBe('ITEM_NOT_FOUND');
        });

        it('should trigger itemLegendized hook', () => {
            const { item } = system.recruitItem({});
            let called = false;
            system.registerHook('itemLegendized', () => { called = true; });
            system.legendItem(item.itemId);
            expect(called).toBe(true);
        });
    });

    describe('calculateItemValue', () => {
        it('should calculate', () => {
            const { item } = system.recruitItem({});
            // level=1*100 + value=20*2 + enchantments=0*30 = 140
            expect(system.calculateItemValue(item.itemId)).toBe(140);
        });

        it('should incorporate level, value, enchantments', () => {
            const { item } = system.recruitItem({});
            system.levelUpItem(item.itemId); // level 2
            system.raiseValue(item.itemId, 5); // value 25
            system.addEnchantment(item.itemId, 'a');
            system.addEnchantment(item.itemId, 'b');
            // 2*100 + 25*2 + 2*30 = 200 + 50 + 60 = 310
            expect(system.calculateItemValue(item.itemId)).toBe(310);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateItemValue('ghost')).toBe(0);
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

        it('should execute default getItem and recruitItem tools', () => {
            const recruit = system.executeTool('recruitItem', { masterId: 'm1' });
            expect(recruit.result.success).toBe(true);
            const get = system.executeTool('getItem', { itemId: recruit.result.item.itemId });
            expect(get.result).not.toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('itemRecruited', () => count++);
            unregister();
            system.recruitItem({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('itemRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitItem({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalItems = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalItems = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitItem({});
            const json = system.toJSON();
            expect(json.items.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitItem({});
            const json = system.toJSON();
            const newSys = new CultivationItem();
            newSys.fromJSON(json);
            expect(newSys.items.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.itemCount).toBe(0);
        });
    });
});
