/**
 * CultivationCrossbowman.test.js - 修真弩手测试
 * V621 Iteration 4/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCrossbowman } from '../../../systems/ai/CultivationCrossbowman.js';

describe('CultivationCrossbowman', () => {
    let system;
    beforeEach(() => { system = new CultivationCrossbowman(); });

    describe('recruitCrossbowman', () => {
        it('should recruit with handlerId and name', () => {
            const { crossbowman } = system.recruitCrossbowman({ handlerId: 'h1', name: 'X-Bow' });
            expect(crossbowman.handlerId).toBe('h1');
            expect(crossbowman.name).toBe('X-Bow');
        });

        it('should default type to light', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            expect(crossbowman.type).toBe('light');
        });

        it('should default range to baseRange', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            expect(crossbowman.range).toBe(50);
        });

        it('should initialize with novice status and level 1', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            expect(crossbowman.status).toBe('novice');
            expect(crossbowman.level).toBe(1);
        });

        it('should initialize with empty bolts array', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            expect(crossbowman.bolts).toEqual([]);
        });

        it('should trigger crossbowmanRecruited hook', () => {
            let called = false;
            system.registerHook('crossbowmanRecruited', () => { called = true; });
            system.recruitCrossbowman({});
            expect(called).toBe(true);
        });

        it('should accept custom bolt input', () => {
            const { crossbowman } = system.recruitCrossbowman({ bolts: ['piercing', 'flame'] });
            expect(crossbowman.bolts).toEqual(['piercing', 'flame']);
        });

        it('should accept custom type', () => {
            const { crossbowman } = system.recruitCrossbowman({ type: 'heavy' });
            expect(crossbowman.type).toBe('heavy');
        });
    });

    describe('getCrossbowman', () => {
        it('should return crossbowman', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            expect(system.getCrossbowman(crossbowman.crossbowmanId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCrossbowman('ghost')).toBeNull(); });
    });

    describe('listCrossbowmen', () => {
        it('should list all', () => {
            system.recruitCrossbowman({});
            system.recruitCrossbowman({});
            expect(system.listCrossbowmen().length).toBe(2);
        });

        it('should return empty array when no crossbowmen', () => {
            expect(system.listCrossbowmen().length).toBe(0);
        });
    });

    describe('listByHandler', () => {
        it('should filter by handler', () => {
            system.recruitCrossbowman({ handlerId: 'h1' });
            system.recruitCrossbowman({ handlerId: 'h2' });
            expect(system.listByHandler('h1').length).toBe(1);
        });

        it('should return empty for unknown handler', () => {
            system.recruitCrossbowman({ handlerId: 'h1' });
            expect(system.listByHandler('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary crossbowmen', () => {
            const { crossbowman: c1 } = system.recruitCrossbowman({});
            system.recruitCrossbowman({});
            system.legendCrossbowman(c1.crossbowmanId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendaries', () => {
            system.recruitCrossbowman({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addBolt', () => {
        it('should add bolt', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            system.addBolt(crossbowman.crossbowmanId, 'piercing');
            expect(crossbowman.bolts).toContain('piercing');
        });

        it('should add multiple bolts', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            system.addBolt(crossbowman.crossbowmanId, 'piercing');
            system.addBolt(crossbowman.crossbowmanId, 'flame');
            expect(crossbowman.bolts.length).toBe(2);
        });

        it('should reject missing crossbowman', () => {
            const result = system.addBolt('ghost', 'piercing');
            expect(result.error).toBe('CROSSBOWMAN_NOT_FOUND');
        });

        it('should trigger boltAdded hook', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            let called = false;
            system.registerHook('boltAdded', () => { called = true; });
            system.addBolt(crossbowman.crossbowmanId, 'piercing');
            expect(called).toBe(true);
        });
    });

    describe('extendRange', () => {
        it('should extend range with default amount', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            system.extendRange(crossbowman.crossbowmanId);
            expect(crossbowman.range).toBe(55);
        });

        it('should extend range with custom amount', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            system.extendRange(crossbowman.crossbowmanId, 10);
            expect(crossbowman.range).toBe(60);
        });

        it('should reject missing crossbowman', () => {
            const result = system.extendRange('ghost', 10);
            expect(result.error).toBe('CROSSBOWMAN_NOT_FOUND');
        });

        it('should trigger rangeExtended hook', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            let called = false;
            system.registerHook('rangeExtended', () => { called = true; });
            system.extendRange(crossbowman.crossbowmanId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpCrossbowman', () => {
        it('should level up', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            system.levelUpCrossbowman(crossbowman.crossbowmanId);
            expect(crossbowman.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            system.levelUpCrossbowman(crossbowman.crossbowmanId);
            system.levelUpCrossbowman(crossbowman.crossbowmanId);
            expect(crossbowman.level).toBe(3);
        });

        it('should reject missing crossbowman', () => {
            const result = system.levelUpCrossbowman('ghost');
            expect(result.error).toBe('CROSSBOWMAN_NOT_FOUND');
        });

        it('should trigger crossbowmanLeveledUp hook', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            let called = false;
            system.registerHook('crossbowmanLeveledUp', () => { called = true; });
            system.levelUpCrossbowman(crossbowman.crossbowmanId);
            expect(called).toBe(true);
        });
    });

    describe('legendCrossbowman', () => {
        it('should set status to legendary', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            system.legendCrossbowman(crossbowman.crossbowmanId);
            expect(crossbowman.status).toBe('legendary');
        });

        it('should reject missing crossbowman', () => {
            const result = system.legendCrossbowman('ghost');
            expect(result.error).toBe('CROSSBOWMAN_NOT_FOUND');
        });

        it('should trigger crossbowmanLegendized hook', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            let called = false;
            system.registerHook('crossbowmanLegendized', () => { called = true; });
            system.legendCrossbowman(crossbowman.crossbowmanId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCrossbowmanValue', () => {
        it('should calculate base value', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            // level(1)*100 + range(50)*2 + bolts(0)*30 = 100 + 100 + 0 = 200
            expect(system.calculateCrossbowmanValue(crossbowman.crossbowmanId)).toBe(200);
        });

        it('should include bolt value', () => {
            const { crossbowman } = system.recruitCrossbowman({ bolts: ['a', 'b', 'c'] });
            // level(1)*100 + range(50)*2 + bolts(3)*30 = 100 + 100 + 90 = 290
            expect(system.calculateCrossbowmanValue(crossbowman.crossbowmanId)).toBe(290);
        });

        it('should include level in value', () => {
            const { crossbowman } = system.recruitCrossbowman({});
            system.levelUpCrossbowman(crossbowman.crossbowmanId);
            // level(2)*100 + range(50)*2 + bolts(0)*30 = 200 + 100 + 0 = 300
            expect(system.calculateCrossbowmanValue(crossbowman.crossbowmanId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCrossbowmanValue('ghost')).toBe(0);
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

        it('should execute default getCrossbowman', () => {
            const result = system.executeTool('getCrossbowman', { crossbowmanId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitCrossbowman', () => {
            const result = system.executeTool('recruitCrossbowman', { name: 'Test' });
            expect(result.success).toBe(true);
            expect(result.result.crossbowman.name).toBe('Test');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('crossbowmanRecruited', () => count++);
            unregister();
            system.recruitCrossbowman({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('crossbowmanRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitCrossbowman({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCrossbowmen = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCrossbowmen = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitCrossbowman({});
            const json = system.toJSON();
            expect(json.crossbowmen.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitCrossbowman({});
            const json = system.toJSON();
            const newSys = new CultivationCrossbowman();
            newSys.fromJSON(json);
            expect(newSys.crossbowmen.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.crossbowmanCount).toBe(0);
        });

        it('should reflect added crossbowmen', () => {
            system.recruitCrossbowman({});
            const stats = system.getStats();
            expect(stats.crossbowmanCount).toBe(1);
        });
    });
});
