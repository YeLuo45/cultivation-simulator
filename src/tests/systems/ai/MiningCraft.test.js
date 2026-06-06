/**
 * MiningCraft.test.js - 采矿系统测试
 * V447 Iteration 9/15 Round 16 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MiningCraft } from '../../../systems/ai/MiningCraft.js';

describe('MiningCraft', () => {
    let system;
    beforeEach(() => { system = new MiningCraft(); });

    describe('startMining', () => {
        it('should start', () => {
            const { mine } = system.startMining({ minerId: 'm1', name: 'Iron Pit', oreType: 'iron' });
            expect(mine.minerId).toBe('m1');
            expect(mine.oreType).toBe('iron');
        });

        it('should use default oreType', () => {
            const { mine } = system.startMining({});
            expect(mine.oreType).toBe('iron');
        });

        it('should trigger mineStarted hook', () => {
            let called = false;
            system.registerHook('mineStarted', () => { called = true; });
            system.startMining({});
            expect(called).toBe(true);
        });
    });

    describe('getMine', () => {
        it('should return', () => {
            const { mine } = system.startMining({});
            expect(system.getMine(mine.mineId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMine('ghost')).toBeNull(); });
    });

    describe('listMines', () => {
        it('should list all', () => {
            system.startMining({});
            expect(system.listMines().length).toBe(1);
        });
    });

    describe('listByMiner', () => {
        it('should filter', () => {
            system.startMining({ minerId: 'm1' });
            system.startMining({ minerId: 'm2' });
            expect(system.listByMiner('m1').length).toBe(1);
        });
    });

    describe('listByOreType', () => {
        it('should filter', () => {
            system.startMining({ oreType: 'iron' });
            system.startMining({ oreType: 'gold' });
            expect(system.listByOreType('iron').length).toBe(1);
        });
    });

    describe('mineOre', () => {
        it('should mine', () => {
            const { mine } = system.startMining({});
            system.mineOre(mine.mineId, 10);
            expect(mine.ores).toBe(10);
        });

        it('should reduce durability', () => {
            const { mine } = system.startMining({});
            const initial = mine.durability;
            system.mineOre(mine.mineId, 5);
            expect(mine.durability).toBeLessThan(initial);
        });

        it('should reject missing', () => {
            const result = system.mineOre('ghost', 5);
            expect(result.error).toBe('MINE_NOT_FOUND');
        });

        it('should trigger oreMined hook', () => {
            const { mine } = system.startMining({});
            let called = false;
            system.registerHook('oreMined', () => { called = true; });
            system.mineOre(mine.mineId, 5);
            expect(called).toBe(true);
        });
    });

    describe('deepenMine', () => {
        it('should deepen', () => {
            const { mine } = system.startMining({});
            system.deepenMine(mine.mineId, 20);
            expect(mine.depth).toBe(20);
        });

        it('should reject missing', () => {
            const result = system.deepenMine('ghost', 10);
            expect(result.error).toBe('MINE_NOT_FOUND');
        });

        it('should trigger mineDeepened hook', () => {
            const { mine } = system.startMining({});
            let called = false;
            system.registerHook('mineDeepened', () => { called = true; });
            system.deepenMine(mine.mineId, 10);
            expect(called).toBe(true);
        });
    });

    describe('exhaustMine', () => {
        it('should exhaust', () => {
            const { mine } = system.startMining({});
            system.exhaustMine(mine.mineId);
            expect(mine.status).toBe('exhausted');
        });

        it('should reject missing', () => {
            const result = system.exhaustMine('ghost');
            expect(result.error).toBe('MINE_NOT_FOUND');
        });

        it('should trigger mineExhausted hook', () => {
            const { mine } = system.startMining({});
            let called = false;
            system.registerHook('mineExhausted', () => { called = true; });
            system.exhaustMine(mine.mineId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMiningYield', () => {
        it('should calculate', () => {
            const { mine } = system.startMining({});
            system.mineOre(mine.mineId, 10);
            system.deepenMine(mine.mineId, 20);
            const yield_ = system.calculateMiningYield(mine.mineId);
            expect(yield_).toBeGreaterThan(0);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMiningYield('ghost')).toBe(0);
        });
    });

    describe('listActive', () => {
        it('should filter active', () => {
            const { mine } = system.startMining({});
            system.exhaustMine(mine.mineId);
            expect(system.listActive().length).toBe(0);
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

        it('should execute default startMining', () => {
            const result = system.executeTool('startMining', { minerId: 'm1' });
            expect(result.result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('mineStarted', () => count++);
            unregister();
            system.startMining({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('mineStarted', () => { throw new Error('x'); });
            expect(() => system.startMining({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMines = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMines = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startMining({});
            const json = system.toJSON();
            expect(json.mines.length).toBe(1);
        });
        it('should deserialize', () => {
            system.startMining({});
            const json = system.toJSON();
            const newSys = new MiningCraft();
            newSys.fromJSON(json);
            expect(newSys.mines.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.mineCount).toBe(0);
        });
    });
});
