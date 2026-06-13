/**
 * CultivationRally.test.js - 修真集结测试
 * V737 Iteration 30/30 FINAL Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationRally } from '../../../systems/ai/CultivationRally.js';

describe('CultivationRally', () => {
    let system;
    beforeEach(() => { system = new CultivationRally(); });

    describe('summonRally', () => {
        it('should summon', () => {
            const { rally } = system.summonRally({ name: 'Triumph' });
            expect(rally.name).toBe('Triumph');
        });
        it('should set initial metrics', () => {
            const { rally } = system.summonRally({});
            expect(system.getMetrics(rally.rallyId)).not.toBeNull();
        });
        it('should trigger rallySummoned hook', () => {
            let called = false;
            system.registerHook('rallySummoned', () => { called = true; });
            system.summonRally({});
            expect(called).toBe(true);
        });
    });

    describe('getRally', () => {
        it('should return', () => {
            const { rally } = system.summonRally({});
            expect(system.getRally(rally.rallyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRally('ghost')).toBeNull(); });
    });

    describe('listRallies', () => {
        it('should list all', () => {
            system.summonRally({});
            expect(system.listRallies().length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.summonRally({ type: 'banner' });
            system.summonRally({ type: 'drum' });
            expect(system.listByType('banner').length).toBe(1);
        });
    });

    describe('listByCommander', () => {
        it('should filter', () => {
            system.summonRally({ commanderId: 'c1' });
            system.summonRally({ commanderId: 'c2' });
            expect(system.listByCommander('c1').length).toBe(1);
        });
    });

    describe('listByLevel', () => {
        it('should filter', () => {
            system.summonRally({});
            expect(system.listByLevel(1).length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            system.summonRally({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('listTop', () => {
        it('should return top', () => {
            system.summonRally({});
            expect(system.listTop(2).length).toBe(1);
        });
    });

    describe('setMetrics', () => {
        it('should set', () => {
            const { rally } = system.summonRally({});
            const result = system.setMetrics(rally.rallyId, { morale: 99 });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.setMetrics('ghost', {});
            expect(result.error).toBe('RALLY_NOT_FOUND');
        });
    });

    describe('getMetrics', () => {
        it('should return', () => {
            const { rally } = system.summonRally({});
            expect(system.getMetrics(rally.rallyId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getMetrics('ghost')).toBeNull();
        });
    });

    describe('refreshRally', () => {
        it('should refresh', () => {
            const { rally } = system.summonRally({});
            const result = system.refreshRally(rally.rallyId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.refreshRally('ghost');
            expect(result.error).toBe('RALLY_NOT_FOUND');
        });

        it('should trigger rallyRefreshed hook', () => {
            const { rally } = system.summonRally({});
            let called = false;
            system.registerHook('rallyRefreshed', () => { called = true; });
            system.refreshRally(rally.rallyId);
            expect(called).toBe(true);
        });
    });

    describe('boostMorale', () => {
        it('should boost', () => {
            const { rally } = system.summonRally({});
            system.boostMorale(rally.rallyId, 5);
            expect(rally.morale).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.boostMorale('ghost', 5);
            expect(result.error).toBe('RALLY_NOT_FOUND');
        });

        it('should trigger moraleBoosted hook', () => {
            const { rally } = system.summonRally({});
            let called = false;
            system.registerHook('moraleBoosted', () => { called = true; });
            system.boostMorale(rally.rallyId, 5);
            expect(called).toBe(true);
        });
    });

    describe('addBanner', () => {
        it('should add', () => {
            const { rally } = system.summonRally({});
            system.addBanner(rally.rallyId, 'phoenix');
            expect(rally.banners.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addBanner('ghost', 'phoenix');
            expect(result.error).toBe('RALLY_NOT_FOUND');
        });

        it('should trigger bannerAdded hook', () => {
            const { rally } = system.summonRally({});
            let called = false;
            system.registerHook('bannerAdded', () => { called = true; });
            system.addBanner(rally.rallyId, 'phoenix');
            expect(called).toBe(true);
        });
    });

    describe('promoteRally', () => {
        it('should promote', () => {
            const { rally } = system.summonRally({});
            system.promoteRally(rally.rallyId);
            expect(rally.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.promoteRally('ghost');
            expect(result.error).toBe('RALLY_NOT_FOUND');
        });

        it('should trigger rallyPromoted hook', () => {
            const { rally } = system.summonRally({});
            let called = false;
            system.registerHook('rallyPromoted', () => { called = true; });
            system.promoteRally(rally.rallyId);
            expect(called).toBe(true);
        });
    });

    describe('marchRally', () => {
        it('should march', () => {
            const { rally } = system.summonRally({});
            system.marchRally(rally.rallyId);
            expect(rally.status).toBe('marching');
        });

        it('should reject missing', () => {
            const result = system.marchRally('ghost');
            expect(result.error).toBe('RALLY_NOT_FOUND');
        });

        it('should trigger rallyMarched hook', () => {
            const { rally } = system.summonRally({});
            let called = false;
            system.registerHook('rallyMarched', () => { called = true; });
            system.marchRally(rally.rallyId);
            expect(called).toBe(true);
        });
    });

    describe('holdRally', () => {
        it('should hold', () => {
            const { rally } = system.summonRally({});
            system.holdRally(rally.rallyId);
            expect(rally.status).toBe('holding');
        });

        it('should reject missing', () => {
            const result = system.holdRally('ghost');
            expect(result.error).toBe('RALLY_NOT_FOUND');
        });

        it('should trigger rallyHolding hook', () => {
            const { rally } = system.summonRally({});
            let called = false;
            system.registerHook('rallyHolding', () => { called = true; });
            system.holdRally(rally.rallyId);
            expect(called).toBe(true);
        });
    });

    describe('legendRally', () => {
        it('should legend', () => {
            const { rally } = system.summonRally({});
            system.legendRally(rally.rallyId);
            expect(rally.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendRally('ghost');
            expect(result.error).toBe('RALLY_NOT_FOUND');
        });

        it('should trigger rallyLegendized hook', () => {
            const { rally } = system.summonRally({});
            let called = false;
            system.registerHook('rallyLegendized', () => { called = true; });
            system.legendRally(rally.rallyId);
            expect(called).toBe(true);
        });
    });

    describe('shiftType', () => {
        it('should shift', () => {
            const { rally } = system.summonRally({});
            system.shiftType(rally.rallyId, 'drum');
            expect(rally.type).toBe('drum');
        });

        it('should reject missing', () => {
            const result = system.shiftType('ghost', 'drum');
            expect(result.error).toBe('RALLY_NOT_FOUND');
        });

        it('should trigger typeShifted hook', () => {
            const { rally } = system.summonRally({});
            let called = false;
            system.registerHook('typeShifted', () => { called = true; });
            system.shiftType(rally.rallyId, 'drum');
            expect(called).toBe(true);
        });
    });

    describe('calculateRallyValue', () => {
        it('should calculate', () => {
            const { rally } = system.summonRally({});
            expect(system.calculateRallyValue(rally.rallyId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateRallyValue('ghost')).toBe(0);
        });
    });

    describe('mergeRallies', () => {
        it('should merge', () => {
            const a = system.summonRally({}).rally;
            const b = system.summonRally({}).rally;
            const result = system.mergeRallies(a.rallyId, b.rallyId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.mergeRallies('ghost', 'ghost2');
            expect(result.error).toBe('RALLY_NOT_FOUND');
        });

        it('should trigger ralliesMerged hook', () => {
            const a = system.summonRally({}).rally;
            const b = system.summonRally({}).rally;
            let called = false;
            system.registerHook('ralliesMerged', () => { called = true; });
            system.mergeRallies(a.rallyId, b.rallyId);
            expect(called).toBe(true);
        });
    });

    describe('deleteRally', () => {
        it('should delete', () => {
            const { rally } = system.summonRally({});
            const result = system.deleteRally(rally.rallyId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteRally('ghost');
            expect(result.error).toBe('RALLY_NOT_FOUND');
        });

        it('should trigger rallyDeleted hook', () => {
            const { rally } = system.summonRally({});
            let called = false;
            system.registerHook('rallyDeleted', () => { called = true; });
            system.deleteRally(rally.rallyId);
            expect(called).toBe(true);
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

        it('should execute default listByType', () => {
            system.summonRally({ type: 'banner' });
            const result = system.executeTool('listByType', { type: 'banner' });
            expect(result.result.length).toBe(1);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('rallySummoned', () => count++);
            unregister();
            system.summonRally({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('rallySummoned', () => { throw new Error('x'); });
            expect(() => system.summonRally({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalRallies = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalRallies = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.summonRally({});
            const json = system.toJSON();
            expect(json.rallies.length).toBe(1);
        });
        it('should deserialize', () => {
            system.summonRally({});
            const json = system.toJSON();
            const newSys = new CultivationRally();
            newSys.fromJSON(json);
            expect(newSys.rallies.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.rallyCount).toBe(0);
        });
    });
});