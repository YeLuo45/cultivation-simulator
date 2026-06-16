/**
 * CultivationHell.test.js - 修真地府系统测试
 * V681 Iteration 4/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationHell } from '../../../systems/ai/CultivationHell.js';

describe('CultivationHell', () => {
    let system;
    beforeEach(() => { system = new CultivationHell(); });

    describe('recruitHell', () => {
        it('should recruit', () => {
            const { hell } = system.recruitHell({ masterId: 'm1', name: 'Niflheim' });
            expect(hell.masterId).toBe('m1');
            expect(hell.name).toBe('Niflheim');
        });

        it('should use default type and darkness', () => {
            const { hell } = system.recruitHell({});
            expect(hell.type).toBe('blood');
            expect(hell.darkness).toBe(20);
        });

        it('should accept custom type blood', () => {
            const { hell } = system.recruitHell({ type: 'blood' });
            expect(hell.type).toBe('blood');
        });

        it('should accept custom type lava', () => {
            const { hell } = system.recruitHell({ type: 'lava' });
            expect(hell.type).toBe('lava');
        });

        it('should accept custom type ice', () => {
            const { hell } = system.recruitHell({ type: 'ice' });
            expect(hell.type).toBe('ice');
        });

        it('should reject when max reached', () => {
            const small = new CultivationHell({ maxHells: 1 });
            small.recruitHell({});
            const result = small.recruitHell({});
            expect(result.error).toBe('MAX_HELLS_REACHED');
        });

        it('should trigger hellRecruited hook', () => {
            let called = false;
            system.registerHook('hellRecruited', () => { called = true; });
            system.recruitHell({});
            expect(called).toBe(true);
        });

        it('should set initial status to novice', () => {
            const { hell } = system.recruitHell({});
            expect(hell.status).toBe('novice');
            expect(hell.level).toBe(1);
        });

        it('should accept custom darkness including 0', () => {
            const { hell } = system.recruitHell({ darkness: 0 });
            expect(hell.darkness).toBe(0);
        });

        it('should accept custom master and punishments', () => {
            const { hell } = system.recruitHell({ masterId: 'm42', punishments: [{ name: 'initial' }] });
            expect(hell.masterId).toBe('m42');
            expect(hell.punishments.length).toBe(1);
        });

        it('should accept custom hellId', () => {
            const { hell } = system.recruitHell({ hellId: 'custom_hll_1' });
            expect(hell.hellId).toBe('custom_hll_1');
        });
    });

    describe('getHell', () => {
        it('should return', () => {
            const { hell } = system.recruitHell({});
            expect(system.getHell(hell.hellId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getHell('ghost')).toBeNull(); });
        it('should return a copy not the original reference', () => {
            const { hell } = system.recruitHell({});
            const fetched = system.getHell(hell.hellId);
            expect(fetched).not.toBe(hell);
        });
    });

    describe('listHells', () => {
        it('should list all', () => {
            system.recruitHell({});
            system.recruitHell({});
            expect(system.listHells().length).toBe(2);
        });
        it('should return empty when none', () => {
            expect(system.listHells().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitHell({ masterId: 'm1' });
            system.recruitHell({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
        it('should return empty for unknown master', () => {
            system.recruitHell({ masterId: 'm1' });
            expect(system.listByMaster('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { hell: h1 } = system.recruitHell({});
            const { hell: h2 } = system.recruitHell({});
            system.legendHell(h1.hellId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].hellId).toBe(h1.hellId);
        });
    });

    describe('addPunishment', () => {
        it('should add punishment', () => {
            const { hell } = system.recruitHell({});
            system.addPunishment(hell.hellId, { name: 'EternalFlame' });
            expect(hell.punishments.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addPunishment('ghost', {});
            expect(result.error).toBe('HELL_NOT_FOUND');
        });

        it('should trigger punishmentAdded hook', () => {
            const { hell } = system.recruitHell({});
            let called = false;
            system.registerHook('punishmentAdded', () => { called = true; });
            system.addPunishment(hell.hellId, { name: 'Torment' });
            expect(called).toBe(true);
        });
    });

    describe('deepenDarkness', () => {
        it('should deepen darkness', () => {
            const { hell } = system.recruitHell({});
            system.deepenDarkness(hell.hellId, 10);
            expect(hell.darkness).toBe(30);
        });

        it('should use default amount', () => {
            const { hell } = system.recruitHell({});
            system.deepenDarkness(hell.hellId);
            expect(hell.darkness).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.deepenDarkness('ghost', 5);
            expect(result.error).toBe('HELL_NOT_FOUND');
        });

        it('should trigger darknessDeepened hook', () => {
            const { hell } = system.recruitHell({});
            let called = false;
            system.registerHook('darknessDeepened', () => { called = true; });
            system.deepenDarkness(hell.hellId, 3);
            expect(called).toBe(true);
        });
    });

    describe('levelUpHell', () => {
        it('should level up', () => {
            const { hell } = system.recruitHell({});
            system.levelUpHell(hell.hellId);
            expect(hell.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpHell('ghost');
            expect(result.error).toBe('HELL_NOT_FOUND');
        });
    });

    describe('legendHell', () => {
        it('should legendize', () => {
            const { hell } = system.recruitHell({});
            system.legendHell(hell.hellId);
            expect(hell.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendHell('ghost');
            expect(result.error).toBe('HELL_NOT_FOUND');
        });

        it('should trigger hellLegendized hook', () => {
            const { hell } = system.recruitHell({});
            let called = false;
            system.registerHook('hellLegendized', () => { called = true; });
            system.legendHell(hell.hellId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHellValue', () => {
        it('should calculate', () => {
            const { hell } = system.recruitHell({});
            system.levelUpHell(hell.hellId);
            system.deepenDarkness(hell.hellId, 5);
            system.addPunishment(hell.hellId, { name: 'p' });
            const value = system.calculateHellValue(hell.hellId);
            expect(value).toBe(2 * 100 + 25 * 2 + 1 * 30);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHellValue('ghost')).toBe(0);
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

        it('should execute tool with undefined context', () => {
            system.registerTool('nocontext', (ctx) => ctx);
            const result = system.executeTool('nocontext');
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

        it('should execute default getHell', () => {
            const result = system.executeTool('getHell', { hellId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitHell via tool', () => {
            const result = system.executeTool('recruitHell', { name: 'ToolRecruited' });
            expect(result.result.success).toBe(true);
            expect(result.result.hell.name).toBe('ToolRecruited');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('hellRecruited', () => count++);
            unregister();
            system.recruitHell({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('hellRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitHell({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalHells = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalHells = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitHell({});
            const json = system.toJSON();
            expect(json.hells.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitHell({});
            const json = system.toJSON();
            const newSys = new CultivationHell();
            newSys.fromJSON(json);
            expect(newSys.hells.size).toBe(1);
        });
        it('should deserialize empty data', () => {
            const newSys = new CultivationHell();
            const result = newSys.fromJSON({});
            expect(result.success).toBe(true);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.hellCount).toBe(0);
        });
    });
});
