/**
 * CultivationEagle.test.js - 修真鹰测试
 * V720 Iteration 13/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationEagle } from '../../../systems/ai/CultivationEagle.js';

describe('CultivationEagle', () => {
    let system;
    beforeEach(() => { system = new CultivationEagle(); });

    describe('recruitEagle', () => {
        it('should create', () => {
            const { eagle } = system.recruitEagle({ name: 'Sky Hunter' });
            expect(eagle.name).toBe('Sky Hunter');
        });

        it('should default to golden type', () => {
            const { eagle } = system.recruitEagle({});
            expect(eagle.type).toBe('golden');
        });

        it('should set initial status to novice', () => {
            const { eagle } = system.recruitEagle({});
            expect(eagle.status).toBe('novice');
        });

        it('should use baseKeenness default', () => {
            const { eagle } = system.recruitEagle({});
            expect(eagle.keenness).toBe(20);
        });

        it('should trigger eagleRecruited hook', () => {
            let called = false;
            system.registerHook('eagleRecruited', () => { called = true; });
            system.recruitEagle({});
            expect(called).toBe(true);
        });
    });

    describe('getEagle', () => {
        it('should return', () => {
            const { eagle } = system.recruitEagle({});
            expect(system.getEagle(eagle.eagleId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getEagle('ghost')).toBeNull(); });
    });

    describe('listEagles', () => {
        it('should list all', () => {
            system.recruitEagle({});
            expect(system.listEagles().length).toBe(1);
        });

        it('should be empty initially', () => {
            expect(system.listEagles().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitEagle({ masterId: 'm1' });
            system.recruitEagle({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.recruitEagle({ type: 'silver' });
            system.recruitEagle({ type: 'spirit' });
            expect(system.listByType('silver').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            system.recruitEagle({});
            expect(system.listLegendary().length).toBe(0);
        });

        it('should include legendized eagles', () => {
            const { eagle } = system.recruitEagle({});
            system.legendEagle(eagle.eagleId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addFeather', () => {
        it('should add', () => {
            const { eagle } = system.recruitEagle({});
            system.addFeather(eagle.eagleId, 'storm_feather');
            expect(eagle.feathers.length).toBe(1);
        });

        it('should add multiple feathers', () => {
            const { eagle } = system.recruitEagle({});
            system.addFeather(eagle.eagleId, 'f1');
            system.addFeather(eagle.eagleId, 'f2');
            expect(eagle.feathers.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addFeather('ghost', 'f');
            expect(result.error).toBe('EAGLE_NOT_FOUND');
        });

        it('should trigger featherAdded hook', () => {
            const { eagle } = system.recruitEagle({});
            let called = false;
            system.registerHook('featherAdded', () => { called = true; });
            system.addFeather(eagle.eagleId, 'f');
            expect(called).toBe(true);
        });
    });

    describe('raiseKeenness', () => {
        it('should raise by default', () => {
            const { eagle } = system.recruitEagle({});
            system.raiseKeenness(eagle.eagleId);
            expect(eagle.keenness).toBe(25);
        });

        it('should raise by amount', () => {
            const { eagle } = system.recruitEagle({});
            system.raiseKeenness(eagle.eagleId, 10);
            expect(eagle.keenness).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseKeenness('ghost', 5);
            expect(result.error).toBe('EAGLE_NOT_FOUND');
        });

        it('should trigger keennessRaised hook', () => {
            const { eagle } = system.recruitEagle({});
            let called = false;
            system.registerHook('keennessRaised', () => { called = true; });
            system.raiseKeenness(eagle.eagleId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpEagle', () => {
        it('should level up', () => {
            const { eagle } = system.recruitEagle({});
            system.levelUpEagle(eagle.eagleId);
            expect(eagle.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { eagle } = system.recruitEagle({});
            system.levelUpEagle(eagle.eagleId);
            system.levelUpEagle(eagle.eagleId);
            expect(eagle.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpEagle('ghost');
            expect(result.error).toBe('EAGLE_NOT_FOUND');
        });

        it('should trigger eagleLeveledUp hook', () => {
            const { eagle } = system.recruitEagle({});
            let called = false;
            system.registerHook('eagleLeveledUp', () => { called = true; });
            system.levelUpEagle(eagle.eagleId);
            expect(called).toBe(true);
        });
    });

    describe('promoteEagle', () => {
        it('should promote to veteran', () => {
            const { eagle } = system.recruitEagle({});
            system.promoteEagle(eagle.eagleId);
            expect(eagle.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.promoteEagle('ghost');
            expect(result.error).toBe('EAGLE_NOT_FOUND');
        });

        it('should trigger eaglePromoted hook', () => {
            const { eagle } = system.recruitEagle({});
            let called = false;
            system.registerHook('eaglePromoted', () => { called = true; });
            system.promoteEagle(eagle.eagleId);
            expect(called).toBe(true);
        });
    });

    describe('changeType', () => {
        it('should change type', () => {
            const { eagle } = system.recruitEagle({});
            system.changeType(eagle.eagleId, 'spirit');
            expect(eagle.type).toBe('spirit');
        });

        it('should reject missing', () => {
            const result = system.changeType('ghost', 'spirit');
            expect(result.error).toBe('EAGLE_NOT_FOUND');
        });

        it('should trigger typeChanged hook', () => {
            const { eagle } = system.recruitEagle({});
            let called = false;
            system.registerHook('typeChanged', () => { called = true; });
            system.changeType(eagle.eagleId, 'silver');
            expect(called).toBe(true);
        });
    });

    describe('legendEagle', () => {
        it('should legend', () => {
            const { eagle } = system.recruitEagle({});
            system.legendEagle(eagle.eagleId);
            expect(eagle.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendEagle('ghost');
            expect(result.error).toBe('EAGLE_NOT_FOUND');
        });

        it('should trigger eagleLegendized hook', () => {
            const { eagle } = system.recruitEagle({});
            let called = false;
            system.registerHook('eagleLegendized', () => { called = true; });
            system.legendEagle(eagle.eagleId);
            expect(called).toBe(true);
        });
    });

    describe('calculateEagleValue', () => {
        it('should calculate base', () => {
            const { eagle } = system.recruitEagle({});
            // level 1 * 100 + keenness 20 * 2 + feathers 0 * 30 = 140
            expect(system.calculateEagleValue(eagle.eagleId)).toBe(140);
        });

        it('should include feather count', () => {
            const { eagle } = system.recruitEagle({});
            system.addFeather(eagle.eagleId, 'f1');
            system.addFeather(eagle.eagleId, 'f2');
            // level 1 * 100 + keenness 20 * 2 + 2 * 30 = 200
            expect(system.calculateEagleValue(eagle.eagleId)).toBe(200);
        });

        it('should include level', () => {
            const { eagle } = system.recruitEagle({});
            system.levelUpEagle(eagle.eagleId);
            // level 2 * 100 + keenness 20 * 2 + 0 = 240
            expect(system.calculateEagleValue(eagle.eagleId)).toBe(240);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateEagleValue('ghost')).toBe(0);
        });
    });

    describe('deleteEagle', () => {
        it('should delete', () => {
            const { eagle } = system.recruitEagle({});
            const result = system.deleteEagle(eagle.eagleId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteEagle('ghost');
            expect(result.error).toBe('EAGLE_NOT_FOUND');
        });

        it('should trigger eagleDeleted hook', () => {
            const { eagle } = system.recruitEagle({});
            let called = false;
            system.registerHook('eagleDeleted', () => { called = true; });
            system.deleteEagle(eagle.eagleId);
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

        it('should execute default getEagle tool', () => {
            const { eagle } = system.recruitEagle({});
            const result = system.executeTool('getEagle', { eagleId: eagle.eagleId });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('eagleRecruited', () => count++);
            unregister();
            system.recruitEagle({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('eagleRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitEagle({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalEagles = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalEagles = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitEagle({});
            const json = system.toJSON();
            expect(json.eagles.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitEagle({});
            const json = system.toJSON();
            const newSys = new CultivationEagle();
            newSys.fromJSON(json);
            expect(newSys.eagles.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.eagleCount).toBe(0);
        });
    });
});
