/**
 * CultivationDew.test.js - 修真露测试
 * V804 Iteration 7/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDew } from '../../../systems/ai/CultivationDew.js';

describe('CultivationDew', () => {
    let system;
    beforeEach(() => { system = new CultivationDew(); });

    describe('recruitDew', () => {
        it('should create a dew', () => {
            const { dew } = system.recruitDew({ name: 'Morning Dew' });
            expect(dew.name).toBe('Morning Dew');
        });

        it('should default type to morning', () => {
            const { dew } = system.recruitDew({});
            expect(dew.type).toBe('morning');
        });

        it('should default freshness to baseFreshness (20)', () => {
            const { dew } = system.recruitDew({});
            expect(dew.freshness).toBe(20);
        });

        it('should default status to novice', () => {
            const { dew } = system.recruitDew({});
            expect(dew.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { dew } = system.recruitDew({});
            expect(dew.level).toBe(1);
        });

        it('should default droplets to empty array', () => {
            const { dew } = system.recruitDew({});
            expect(dew.droplets).toEqual([]);
        });

        it('should trigger dewRecruited hook', () => {
            let called = false;
            system.registerHook('dewRecruited', () => { called = true; });
            system.recruitDew({});
            expect(called).toBe(true);
        });

        it('should increment totalDews stat', () => {
            system.recruitDew({});
            expect(system.stats.totalDews).toBe(1);
        });

        it('should accept custom type spring', () => {
            const { dew } = system.recruitDew({ type: 'spring' });
            expect(dew.type).toBe('spring');
        });

        it('should accept custom type sacred', () => {
            const { dew } = system.recruitDew({ type: 'sacred' });
            expect(dew.type).toBe('sacred');
        });

        it('should accept custom masterId', () => {
            const { dew } = system.recruitDew({ masterId: 'master-1' });
            expect(dew.masterId).toBe('master-1');
        });
    });

    describe('getDew', () => {
        it('should return dew by id', () => {
            const { dew } = system.recruitDew({});
            expect(system.getDew(dew.dewId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDew('ghost')).toBeNull(); });
    });

    describe('listDews', () => {
        it('should list all dews', () => {
            system.recruitDew({});
            system.recruitDew({});
            expect(system.listDews().length).toBe(2);
        });
        it('should return empty list when no dews', () => {
            expect(system.listDews().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitDew({ masterId: 'm1' });
            system.recruitDew({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary dews', () => {
            system.recruitDew({});
            const { dew } = system.recruitDew({});
            system.legendDew(dew.dewId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none are legendary', () => {
            system.recruitDew({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addDroplet', () => {
        it('should add a droplet to the array', () => {
            const { dew } = system.recruitDew({});
            system.addDroplet(dew.dewId, 'water-droplet');
            expect(dew.droplets.length).toBe(1);
            expect(dew.droplets[0]).toBe('water-droplet');
        });

        it('should reject missing dew', () => {
            const result = system.addDroplet('ghost', 'droplet');
            expect(result.error).toBe('DEW_NOT_FOUND');
        });

        it('should trigger dropletAdded hook', () => {
            const { dew } = system.recruitDew({});
            let called = false;
            system.registerHook('dropletAdded', () => { called = true; });
            system.addDroplet(dew.dewId, 'ice-droplet');
            expect(called).toBe(true);
        });
    });

    describe('raiseFreshness', () => {
        it('should raise freshness by default 5', () => {
            const { dew } = system.recruitDew({});
            system.raiseFreshness(dew.dewId);
            expect(dew.freshness).toBe(25);
        });

        it('should raise freshness by custom amount', () => {
            const { dew } = system.recruitDew({});
            system.raiseFreshness(dew.dewId, 10);
            expect(dew.freshness).toBe(30);
        });

        it('should reject missing dew', () => {
            const result = system.raiseFreshness('ghost', 5);
            expect(result.error).toBe('DEW_NOT_FOUND');
        });

        it('should trigger freshnessRaised hook', () => {
            const { dew } = system.recruitDew({});
            let called = false;
            system.registerHook('freshnessRaised', () => { called = true; });
            system.raiseFreshness(dew.dewId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDew', () => {
        it('should increment level', () => {
            const { dew } = system.recruitDew({});
            system.levelUpDew(dew.dewId);
            expect(dew.level).toBe(2);
        });

        it('should reject missing dew', () => {
            const result = system.levelUpDew('ghost');
            expect(result.error).toBe('DEW_NOT_FOUND');
        });

        it('should trigger dewLeveledUp hook', () => {
            const { dew } = system.recruitDew({});
            let called = false;
            system.registerHook('dewLeveledUp', () => { called = true; });
            system.levelUpDew(dew.dewId);
            expect(called).toBe(true);
        });
    });

    describe('legendDew', () => {
        it('should set status to legendary', () => {
            const { dew } = system.recruitDew({});
            system.legendDew(dew.dewId);
            expect(dew.status).toBe('legendary');
        });

        it('should reject missing dew', () => {
            const result = system.legendDew('ghost');
            expect(result.error).toBe('DEW_NOT_FOUND');
        });

        it('should trigger dewLegendized hook', () => {
            const { dew } = system.recruitDew({});
            let called = false;
            system.registerHook('dewLegendized', () => { called = true; });
            system.legendDew(dew.dewId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDewValue', () => {
        it('should calculate value: level*100 + freshness*2 + droplets.length*30', () => {
            const { dew } = system.recruitDew({});
            dew.level = 2;
            dew.freshness = 30;
            dew.droplets = ['a', 'b'];
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateDewValue(dew.dewId)).toBe(320);
        });

        it('should return 0 for missing dew', () => {
            expect(system.calculateDewValue('ghost')).toBe(0);
        });

        it('should calculate correctly with default values', () => {
            const { dew } = system.recruitDew({});
            // 1*100 + 20*2 + 0*30 = 100 + 40 + 0 = 140
            expect(system.calculateDewValue(dew.dewId)).toBe(140);
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

        it('should execute default getDew tool', () => {
            const result = system.executeTool('getDew', { dewId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('dewRecruited', () => count++);
            unregister();
            system.recruitDew({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('dewRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDew({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient dews', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when totalDews >= 5', () => {
            system.stats.totalDews = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDews = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitDew({});
            const json = system.toJSON();
            expect(json.dews.length).toBe(1);
        });
        it('should deserialize from JSON', () => {
            system.recruitDew({});
            const json = system.toJSON();
            const newSys = new CultivationDew();
            newSys.fromJSON(json);
            expect(newSys.dews.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with dewCount', () => {
            const stats = system.getStats();
            expect(stats.dewCount).toBe(0);
        });
    });
});
