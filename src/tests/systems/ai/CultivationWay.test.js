/**
 * CultivationWay.test.js - 道途系统测试
 * V528 Iteration 10/20 Round 21 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationWay } from '../../../systems/ai/CultivationWay.js';

describe('CultivationWay', () => {
    let system;
    beforeEach(() => { system = new CultivationWay(); });

    describe('walkWay', () => {
        it('should walk way', () => {
            const { way } = system.walkWay({ cultivatorId: 'c1', name: 'Sword Path' });
            expect(way.cultivatorId).toBe('c1');
            expect(way.name).toBe('Sword Path');
        });

        it('should default to forming status', () => {
            const { way } = system.walkWay({});
            expect(way.status).toBe('forming');
        });

        it('should default type to righteous', () => {
            const { way } = system.walkWay({});
            expect(way.type).toBe('righteous');
        });

        it('should default harmony to baseHarmony', () => {
            const { way } = system.walkWay({});
            expect(way.harmony).toBe(30);
        });

        it('should start at level 1', () => {
            const { way } = system.walkWay({});
            expect(way.level).toBe(1);
        });

        it('should start with empty milestones', () => {
            const { way } = system.walkWay({});
            expect(way.milestones).toEqual([]);
        });

        it('should generate wayId', () => {
            const { way } = system.walkWay({});
            expect(way.wayId).toBeDefined();
            expect(typeof way.wayId).toBe('string');
        });

        it('should accept custom wayId', () => {
            const { way } = system.walkWay({ wayId: 'my-way' });
            expect(way.wayId).toBe('my-way');
        });

        it('should trigger wayWalked hook', () => {
            let called = false;
            system.registerHook('wayWalked', () => { called = true; });
            system.walkWay({});
            expect(called).toBe(true);
        });

        it('should support all types', () => {
            const { way: w1 } = system.walkWay({ type: 'righteous' });
            const { way: w2 } = system.walkWay({ type: 'demonic' });
            const { way: w3 } = system.walkWay({ type: 'chaotic' });
            expect(w1.type).toBe('righteous');
            expect(w2.type).toBe('demonic');
            expect(w3.type).toBe('chaotic');
        });

        it('should accept custom harmony', () => {
            const { way } = system.walkWay({ harmony: 100 });
            expect(way.harmony).toBe(100);
        });

        it('should accept custom milestones', () => {
            const { way } = system.walkWay({ milestones: ['m1', 'm2'] });
            expect(way.milestones.length).toBe(2);
        });
    });

    describe('getWay', () => {
        it('should return way', () => {
            const { way } = system.walkWay({});
            expect(system.getWay(way.wayId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getWay('ghost')).toBeNull(); });
    });

    describe('listWays', () => {
        it('should list all', () => {
            system.walkWay({});
            system.walkWay({});
            expect(system.listWays().length).toBe(2);
        });

        it('should return empty when no ways', () => {
            expect(system.listWays().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter by cultivator', () => {
            system.walkWay({ cultivatorId: 'c1' });
            system.walkWay({ cultivatorId: 'c2' });
            system.walkWay({ cultivatorId: 'c1' });
            expect(system.listByCultivator('c1').length).toBe(2);
        });

        it('should return empty for unknown cultivator', () => {
            system.walkWay({ cultivatorId: 'c1' });
            expect(system.listByCultivator('ghost').length).toBe(0);
        });
    });

    describe('listEternal', () => {
        it('should filter eternal only', () => {
            const { way: w1 } = system.walkWay({});
            const { way: w2 } = system.walkWay({});
            system.eternizeWay(w1.wayId);
            const eternal = system.listEternal();
            expect(eternal.length).toBe(1);
            expect(eternal[0].wayId).toBe(w1.wayId);
            expect(w2.status).toBe('forming');
        });
    });

    describe('addMilestone', () => {
        it('should add milestone', () => {
            const { way } = system.walkWay({});
            system.addMilestone(way.wayId, 'first-step');
            expect(way.milestones).toContain('first-step');
        });

        it('should accumulate milestones', () => {
            const { way } = system.walkWay({});
            system.addMilestone(way.wayId, 'm1');
            system.addMilestone(way.wayId, 'm2');
            system.addMilestone(way.wayId, 'm3');
            expect(way.milestones.length).toBe(3);
        });

        it('should reject missing way', () => {
            const result = system.addMilestone('ghost', 'm');
            expect(result.error).toBe('WAY_NOT_FOUND');
        });

        it('should trigger milestoneAdded hook', () => {
            const { way } = system.walkWay({});
            let called = false;
            system.registerHook('milestoneAdded', () => { called = true; });
            system.addMilestone(way.wayId, 'm');
            expect(called).toBe(true);
        });
    });

    describe('increaseHarmony', () => {
        it('should increase harmony by default', () => {
            const { way } = system.walkWay({});
            system.increaseHarmony(way.wayId);
            expect(way.harmony).toBe(35);
        });

        it('should increase harmony by custom amount', () => {
            const { way } = system.walkWay({});
            system.increaseHarmony(way.wayId, 100);
            expect(way.harmony).toBe(130);
        });

        it('should reject missing way', () => {
            const result = system.increaseHarmony('ghost');
            expect(result.error).toBe('WAY_NOT_FOUND');
        });

        it('should trigger harmonyIncreased hook', () => {
            const { way } = system.walkWay({});
            let called = false;
            system.registerHook('harmonyIncreased', () => { called = true; });
            system.increaseHarmony(way.wayId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpWay', () => {
        it('should level up', () => {
            const { way } = system.walkWay({});
            system.levelUpWay(way.wayId);
            expect(way.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { way } = system.walkWay({});
            system.levelUpWay(way.wayId);
            system.levelUpWay(way.wayId);
            system.levelUpWay(way.wayId);
            expect(way.level).toBe(4);
        });

        it('should reject missing way', () => {
            const result = system.levelUpWay('ghost');
            expect(result.error).toBe('WAY_NOT_FOUND');
        });

        it('should trigger wayLeveledUp hook', () => {
            const { way } = system.walkWay({});
            let called = false;
            system.registerHook('wayLeveledUp', () => { called = true; });
            system.levelUpWay(way.wayId);
            expect(called).toBe(true);
        });
    });

    describe('eternizeWay', () => {
        it('should eternize way', () => {
            const { way } = system.walkWay({});
            system.eternizeWay(way.wayId);
            expect(way.status).toBe('eternal');
        });

        it('should reject missing way', () => {
            const result = system.eternizeWay('ghost');
            expect(result.error).toBe('WAY_NOT_FOUND');
        });

        it('should trigger wayEternalized hook', () => {
            const { way } = system.walkWay({});
            let called = false;
            system.registerHook('wayEternalized', () => { called = true; });
            system.eternizeWay(way.wayId);
            expect(called).toBe(true);
        });
    });

    describe('calculateWayPower', () => {
        it('should calculate base power', () => {
            const { way } = system.walkWay({});
            // level=1, harmony=30, milestones=0 -> 1*100 + 30*2 + 0 = 160
            expect(system.calculateWayPower(way.wayId)).toBe(160);
        });

        it('should include milestones in power', () => {
            const { way } = system.walkWay({});
            system.addMilestone(way.wayId, 'm1');
            system.addMilestone(way.wayId, 'm2');
            // level=1, harmony=30, milestones=2 -> 1*100 + 30*2 + 2*30 = 220
            expect(system.calculateWayPower(way.wayId)).toBe(220);
        });

        it('should scale with level', () => {
            const { way } = system.walkWay({});
            system.levelUpWay(way.wayId);
            system.levelUpWay(way.wayId);
            // level=3, harmony=30, milestones=0 -> 3*100 + 30*2 + 0 = 360
            expect(system.calculateWayPower(way.wayId)).toBe(360);
        });

        it('should scale with harmony', () => {
            const { way } = system.walkWay({});
            system.increaseHarmony(way.wayId, 100);
            // level=1, harmony=130, milestones=0 -> 1*100 + 130*2 + 0 = 360
            expect(system.calculateWayPower(way.wayId)).toBe(360);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateWayPower('ghost')).toBe(0);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.walkWay({ type: 'righteous' });
            system.walkWay({ type: 'demonic' });
            system.walkWay({ type: 'chaotic' });
            expect(system.listByType('righteous').length).toBe(1);
            expect(system.listByType('demonic').length).toBe(1);
            expect(system.listByType('chaotic').length).toBe(1);
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

        it('should execute default getWay', () => {
            const result = system.executeTool('getWay', { wayId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default walkWay', () => {
            const result = system.executeTool('walkWay', { cultivatorId: 'c1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('wayWalked', () => count++);
            unregister();
            system.walkWay({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('wayWalked', () => { throw new Error('x'); });
            expect(() => system.walkWay({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalWays = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalWays = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.walkWay({});
            const json = system.toJSON();
            expect(json.ways.length).toBe(1);
        });
        it('should deserialize', () => {
            system.walkWay({});
            const json = system.toJSON();
            const newSys = new CultivationWay();
            newSys.fromJSON(json);
            expect(newSys.ways.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.wayCount).toBe(0);
        });
    });
});
