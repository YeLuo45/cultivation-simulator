/**
 * CultivationJewelry.test.js - 修真饰系统测试
 * V565 Iteration 8/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationJewelry } from '../../../systems/ai/CultivationJewelry.js';

describe('CultivationJewelry', () => {
    let system;
    beforeEach(() => { system = new CultivationJewelry(); });

    describe('craftJewelry', () => {
        it('should craft with defaults', () => {
            const { jewelry } = system.craftJewelry({});
            expect(jewelry.jewelerId).toBe('unknown_jeweler');
            expect(jewelry.name).toBe('unnamed_jewelry');
            expect(jewelry.type).toBe('necklace');
            expect(jewelry.brilliance).toBe(20);
            expect(jewelry.gems).toEqual([]);
            expect(jewelry.level).toBe(1);
            expect(jewelry.status).toBe('crafted');
        });

        it('should craft with custom data', () => {
            const { jewelry } = system.craftJewelry({
                jewelerId: 'j1',
                name: 'SkyNecklace',
                type: 'bracelet',
                brilliance: 80,
                gems: ['ruby', 'sapphire'],
                level: 3,
                status: 'worn'
            });
            expect(jewelry.jewelerId).toBe('j1');
            expect(jewelry.name).toBe('SkyNecklace');
            expect(jewelry.type).toBe('bracelet');
            expect(jewelry.brilliance).toBe(80);
            expect(jewelry.gems).toEqual(['ruby', 'sapphire']);
            expect(jewelry.level).toBe(3);
            expect(jewelry.status).toBe('worn');
        });

        it('should support all types', () => {
            const { jewelry: j1 } = system.craftJewelry({ type: 'necklace' });
            const { jewelry: j2 } = system.craftJewelry({ type: 'bracelet' });
            const { jewelry: j3 } = system.craftJewelry({ type: 'crown' });
            expect(j1.type).toBe('necklace');
            expect(j2.type).toBe('bracelet');
            expect(j3.type).toBe('crown');
        });

        it('should increment totalJewelries', () => {
            system.craftJewelry({});
            system.craftJewelry({});
            expect(system.stats.totalJewelries).toBe(2);
        });

        it('should generate unique ids', () => {
            const { jewelry: j1 } = system.craftJewelry({});
            const { jewelry: j2 } = system.craftJewelry({});
            expect(j1.jewelryId).not.toBe(j2.jewelryId);
        });

        it('should trigger jewelryCrafted hook', () => {
            let called = false;
            system.registerHook('jewelryCrafted', () => { called = true; });
            system.craftJewelry({});
            expect(called).toBe(true);
        });
    });

    describe('getJewelry', () => {
        it('should return jewelry', () => {
            const { jewelry } = system.craftJewelry({});
            const got = system.getJewelry(jewelry.jewelryId);
            expect(got).not.toBeNull();
            expect(got.jewelryId).toBe(jewelry.jewelryId);
        });
        it('should return null for missing', () => { expect(system.getJewelry('ghost')).toBeNull(); });
    });

    describe('listJewelries', () => {
        it('should list all', () => {
            system.craftJewelry({});
            system.craftJewelry({});
            system.craftJewelry({});
            expect(system.listJewelries().length).toBe(3);
        });

        it('should return empty list when no jewelries', () => {
            expect(system.listJewelries().length).toBe(0);
        });
    });

    describe('listByJeweler', () => {
        it('should filter by jeweler', () => {
            system.craftJewelry({ jewelerId: 'j1' });
            system.craftJewelry({ jewelerId: 'j1' });
            system.craftJewelry({ jewelerId: 'j2' });
            expect(system.listByJeweler('j1').length).toBe(2);
            expect(system.listByJeweler('j2').length).toBe(1);
            expect(system.listByJeweler('j3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary jewelries', () => {
            const { jewelry: j1 } = system.craftJewelry({});
            const { jewelry: j2 } = system.craftJewelry({});
            system.legendJewelry(j1.jewelryId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].jewelryId).toBe(j1.jewelryId);
            expect(j2.status).toBe('crafted');
        });

        it('should return empty when none legendary', () => {
            system.craftJewelry({});
            system.craftJewelry({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addGem', () => {
        it('should add gem', () => {
            const { jewelry } = system.craftJewelry({});
            system.addGem(jewelry.jewelryId, 'ruby');
            expect(jewelry.gems).toContain('ruby');
            expect(jewelry.gems.length).toBe(1);
        });

        it('should add multiple gems', () => {
            const { jewelry } = system.craftJewelry({});
            system.addGem(jewelry.jewelryId, 'ruby');
            system.addGem(jewelry.jewelryId, 'sapphire');
            expect(jewelry.gems).toEqual(['ruby', 'sapphire']);
        });

        it('should reject missing', () => {
            const result = system.addGem('ghost', 'ruby');
            expect(result.error).toBe('JEWELRY_NOT_FOUND');
        });

        it('should trigger gemAdded hook', () => {
            const { jewelry } = system.craftJewelry({});
            let called = false;
            system.registerHook('gemAdded', () => { called = true; });
            system.addGem(jewelry.jewelryId, 'ruby');
            expect(called).toBe(true);
        });
    });

    describe('increaseBrilliance', () => {
        it('should increase by default amount', () => {
            const { jewelry } = system.craftJewelry({});
            system.increaseBrilliance(jewelry.jewelryId);
            expect(jewelry.brilliance).toBe(25);
        });

        it('should increase by custom amount', () => {
            const { jewelry } = system.craftJewelry({});
            system.increaseBrilliance(jewelry.jewelryId, 30);
            expect(jewelry.brilliance).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.increaseBrilliance('ghost', 5);
            expect(result.error).toBe('JEWELRY_NOT_FOUND');
        });

        it('should trigger brillianceIncreased hook', () => {
            const { jewelry } = system.craftJewelry({});
            let called = false;
            system.registerHook('brillianceIncreased', () => { called = true; });
            system.increaseBrilliance(jewelry.jewelryId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpJewelry', () => {
        it('should level up', () => {
            const { jewelry } = system.craftJewelry({});
            system.levelUpJewelry(jewelry.jewelryId);
            expect(jewelry.level).toBe(2);
            system.levelUpJewelry(jewelry.jewelryId);
            expect(jewelry.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpJewelry('ghost');
            expect(result.error).toBe('JEWELRY_NOT_FOUND');
        });

        it('should trigger jewelryLeveledUp hook', () => {
            const { jewelry } = system.craftJewelry({});
            let called = false;
            system.registerHook('jewelryLeveledUp', () => { called = true; });
            system.levelUpJewelry(jewelry.jewelryId);
            expect(called).toBe(true);
        });
    });

    describe('legendJewelry', () => {
        it('should set status to legendary', () => {
            const { jewelry } = system.craftJewelry({});
            system.legendJewelry(jewelry.jewelryId);
            expect(jewelry.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendJewelry('ghost');
            expect(result.error).toBe('JEWELRY_NOT_FOUND');
        });

        it('should trigger jewelryLegendized hook', () => {
            const { jewelry } = system.craftJewelry({});
            let called = false;
            system.registerHook('jewelryLegendized', () => { called = true; });
            system.legendJewelry(jewelry.jewelryId);
            expect(called).toBe(true);
        });
    });

    describe('calculateJewelryValue', () => {
        it('should calculate default value', () => {
            const { jewelry } = system.craftJewelry({});
            // level=1*100 + brilliance=20*2 + 0 gems * 30 = 140
            expect(system.calculateJewelryValue(jewelry.jewelryId)).toBe(140);
        });

        it('should add 30 per gem', () => {
            const { jewelry } = system.craftJewelry({});
            system.addGem(jewelry.jewelryId, 'ruby');
            system.addGem(jewelry.jewelryId, 'sapphire');
            // 100 + 40 + 2*30 = 200
            expect(system.calculateJewelryValue(jewelry.jewelryId)).toBe(200);
        });

        it('should reflect brilliance in formula', () => {
            const { jewelry } = system.craftJewelry({});
            system.increaseBrilliance(jewelry.jewelryId, 30);
            // 100 + (20+30)*2 + 0 = 200
            expect(system.calculateJewelryValue(jewelry.jewelryId)).toBe(200);
        });

        it('should reflect level in formula', () => {
            const { jewelry } = system.craftJewelry({});
            system.levelUpJewelry(jewelry.jewelryId);
            system.levelUpJewelry(jewelry.jewelryId);
            // (1+2)*100 + 40 + 0 = 340
            expect(system.calculateJewelryValue(jewelry.jewelryId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateJewelryValue('ghost')).toBe(0);
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

        it('should execute default getJewelry', () => {
            const result = system.executeTool('getJewelry', { jewelryId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('jewelryCrafted', () => count++);
            unregister();
            system.craftJewelry({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('jewelryCrafted', () => { throw new Error('x'); });
            expect(() => system.craftJewelry({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalJewelries = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalJewelries = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.craftJewelry({});
            const json = system.toJSON();
            expect(json.jewelries.length).toBe(1);
            expect(json.stats.totalJewelries).toBe(1);
        });
        it('should deserialize', () => {
            system.craftJewelry({ name: 'a' });
            const json = system.toJSON();
            const newSys = new CultivationJewelry();
            newSys.fromJSON(json);
            expect(newSys.jewelries.size).toBe(1);
            expect(newSys.stats.totalJewelries).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.jewelryCount).toBe(0);
            expect(stats.totalJewelries).toBe(0);
            system.craftJewelry({});
            expect(system.getStats().jewelryCount).toBe(1);
        });
    });
});
