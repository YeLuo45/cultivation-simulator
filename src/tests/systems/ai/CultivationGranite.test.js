/**
 * CultivationGranite.test.js - 修真花岗岩测试
 * V841 Iteration 14/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationGranite } from '../../../systems/ai/CultivationGranite.js';

describe('CultivationGranite', () => {
    let system;
    beforeEach(() => { system = new CultivationGranite(); });

    describe('recruitGranite', () => {
        it('should recruit', () => {
            const { granite } = system.recruitGranite({ masterId: 'm1', name: 'Stone1' });
            expect(granite.masterId).toBe('m1');
            expect(granite.name).toBe('Stone1');
        });

        it('should default type to white', () => {
            const { granite } = system.recruitGranite({});
            expect(granite.type).toBe('white');
        });

        it('should default hardness to base', () => {
            const { granite } = system.recruitGranite({});
            expect(granite.hardness).toBe(20);
        });

        it('should trigger graniteRecruited hook', () => {
            let called = false;
            system.registerHook('graniteRecruited', () => { called = true; });
            system.recruitGranite({});
            expect(called).toBe(true);
        });
    });

    describe('getGranite', () => {
        it('should return', () => {
            const { granite } = system.recruitGranite({});
            expect(system.getGranite(granite.graniteId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getGranite('ghost')).toBeNull(); });
    });

    describe('listGranites', () => {
        it('should list all', () => {
            system.recruitGranite({});
            system.recruitGranite({});
            expect(system.listGranites().length).toBe(2);
        });

        it('should return empty list when no granites', () => {
            expect(system.listGranites().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitGranite({ masterId: 'm1' });
            system.recruitGranite({ masterId: 'm2' });
            system.recruitGranite({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitGranite({ masterId: 'm1' });
            expect(system.listByMaster('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { granite: g1 } = system.recruitGranite({});
            const { granite: g2 } = system.recruitGranite({});
            system.legendGranite(g1.graniteId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitGranite({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addFleck', () => {
        it('should add fleck', () => {
            const { granite } = system.recruitGranite({});
            system.addFleck(granite.graniteId, { color: 'gold' });
            expect(system.getGranite(granite.graniteId).flecks.length).toBe(1);
        });

        it('should reject missing granite', () => {
            const result = system.addFleck('ghost', {});
            expect(result.error).toBe('GRANITE_NOT_FOUND');
        });

        it('should trigger fleckAdded hook', () => {
            const { granite } = system.recruitGranite({});
            let called = false;
            system.registerHook('fleckAdded', () => { called = true; });
            system.addFleck(granite.graniteId, { color: 'silver' });
            expect(called).toBe(true);
        });
    });

    describe('raiseHardness', () => {
        it('should raise hardness', () => {
            const { granite } = system.recruitGranite({});
            system.raiseHardness(granite.graniteId, 10);
            expect(system.getGranite(granite.graniteId).hardness).toBe(30);
        });

        it('should use default amount 5', () => {
            const { granite } = system.recruitGranite({});
            system.raiseHardness(granite.graniteId);
            expect(system.getGranite(granite.graniteId).hardness).toBe(25);
        });

        it('should reject missing granite', () => {
            const result = system.raiseHardness('ghost', 5);
            expect(result.error).toBe('GRANITE_NOT_FOUND');
        });

        it('should trigger hardnessRaised hook', () => {
            const { granite } = system.recruitGranite({});
            let called = false;
            system.registerHook('hardnessRaised', () => { called = true; });
            system.raiseHardness(granite.graniteId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpGranite', () => {
        it('should level up', () => {
            const { granite } = system.recruitGranite({});
            system.levelUpGranite(granite.graniteId);
            expect(system.getGranite(granite.graniteId).level).toBe(2);
        });

        it('should reject missing granite', () => {
            const result = system.levelUpGranite('ghost');
            expect(result.error).toBe('GRANITE_NOT_FOUND');
        });
    });

    describe('legendGranite', () => {
        it('should set status to legendary', () => {
            const { granite } = system.recruitGranite({});
            system.legendGranite(granite.graniteId);
            expect(system.getGranite(granite.graniteId).status).toBe('legendary');
        });

        it('should reject missing granite', () => {
            const result = system.legendGranite('ghost');
            expect(result.error).toBe('GRANITE_NOT_FOUND');
        });

        it('should trigger graniteLegendized hook', () => {
            const { granite } = system.recruitGranite({});
            let called = false;
            system.registerHook('graniteLegendized', () => { called = true; });
            system.legendGranite(granite.graniteId);
            expect(called).toBe(true);
        });
    });

    describe('calculateGraniteValue', () => {
        it('should calculate', () => {
            const { granite } = system.recruitGranite({});
            system.addFleck(granite.graniteId, { color: 'gold' });
            // level 1 * 100 + hardness 20 * 2 + flecks 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculateGraniteValue(granite.graniteId)).toBe(170);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateGraniteValue('ghost')).toBe(0);
        });

        it('should account for level changes', () => {
            const { granite } = system.recruitGranite({});
            system.levelUpGranite(granite.graniteId);
            system.levelUpGranite(granite.graniteId);
            // level 3 * 100 + hardness 20 * 2 + 0 flecks = 300 + 40 + 0 = 340
            expect(system.calculateGraniteValue(granite.graniteId)).toBe(340);
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

        it('should execute default getGranite', () => {
            const result = system.executeTool('getGranite', { graniteId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitGranite', () => {
            const result = system.executeTool('recruitGranite', { masterId: 'm1' });
            expect(result.success).toBe(true);
            expect(result.result.granite.masterId).toBe('m1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('graniteRecruited', () => count++);
            unregister();
            system.recruitGranite({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('graniteRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitGranite({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalGranites = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalGranites = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitGranite({});
            const json = system.toJSON();
            expect(json.granites.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitGranite({});
            const json = system.toJSON();
            const newSys = new CultivationGranite();
            newSys.fromJSON(json);
            expect(newSys.granites.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.graniteCount).toBe(0);
            expect(stats.totalGranites).toBe(0);
        });
    });
});
