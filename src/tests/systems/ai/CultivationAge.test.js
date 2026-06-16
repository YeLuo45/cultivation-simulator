/**
 * CultivationAge.test.js - 修真龄系统测试
 * V580 Iteration 3/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationAge } from '../../../systems/ai/CultivationAge.js';

describe('CultivationAge', () => {
    let system;
    beforeEach(() => { system = new CultivationAge(); });

    describe('openAge', () => {
        it('should open', () => {
            const { age } = system.openAge({ cultivatorId: 'c1', name: 'Origin' });
            expect(age.cultivatorId).toBe('c1');
            expect(age.name).toBe('Origin');
        });

        it('should set defaults', () => {
            const { age } = system.openAge({});
            expect(age.type).toBe('mortal');
            expect(age.wisdom).toBe(20);
            expect(age.milestones).toEqual([]);
            expect(age.level).toBe(1);
            expect(age.status).toBe('young');
        });

        it('should respect provided type and status', () => {
            const { age } = system.openAge({ type: 'immortal', status: 'mature' });
            expect(age.type).toBe('immortal');
            expect(age.status).toBe('mature');
        });

        it('should trigger ageOpened hook', () => {
            let called = false;
            system.registerHook('ageOpened', () => { called = true; });
            system.openAge({});
            expect(called).toBe(true);
        });
    });

    describe('getAge', () => {
        it('should return', () => {
            const { age } = system.openAge({});
            expect(system.getAge(age.ageId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getAge('ghost')).toBeNull(); });
    });

    describe('listAges', () => {
        it('should list all', () => {
            system.openAge({});
            system.openAge({});
            expect(system.listAges().length).toBe(2);
        });
        it('should return empty', () => {
            expect(system.listAges().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.openAge({ cultivatorId: 'c1' });
            system.openAge({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
        it('should return empty for unknown cultivator', () => {
            system.openAge({ cultivatorId: 'c1' });
            expect(system.listByCultivator('c2').length).toBe(0);
        });
    });

    describe('listAncient', () => {
        it('should filter ancient', () => {
            const { age: a1 } = system.openAge({});
            system.openAge({});
            system.ancientAge(a1.ageId);
            expect(system.listAncient().length).toBe(1);
        });
        it('should return empty when none ancient', () => {
            system.openAge({});
            expect(system.listAncient().length).toBe(0);
        });
    });

    describe('addMilestone', () => {
        it('should add milestone', () => {
            const { age } = system.openAge({});
            system.addMilestone(age.ageId, 'breakthrough');
            expect(age.milestones.length).toBe(1);
            expect(age.milestones[0]).toBe('breakthrough');
        });

        it('should add multiple milestones', () => {
            const { age } = system.openAge({});
            system.addMilestone(age.ageId, 'm1');
            system.addMilestone(age.ageId, 'm2');
            expect(age.milestones.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addMilestone('ghost', 'm');
            expect(result.error).toBe('AGE_NOT_FOUND');
        });

        it('should trigger milestoneAdded hook', () => {
            const { age } = system.openAge({});
            let received = null;
            system.registerHook('milestoneAdded', (data) => { received = data; });
            system.addMilestone(age.ageId, 'tribulation');
            expect(received.milestone).toBe('tribulation');
        });
    });

    describe('increaseWisdom', () => {
        it('should increase with default amount', () => {
            const { age } = system.openAge({});
            system.increaseWisdom(age.ageId);
            expect(age.wisdom).toBe(25);
        });

        it('should increase with custom amount', () => {
            const { age } = system.openAge({});
            system.increaseWisdom(age.ageId, 50);
            expect(age.wisdom).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.increaseWisdom('ghost', 5);
            expect(result.error).toBe('AGE_NOT_FOUND');
        });

        it('should trigger wisdomIncreased hook', () => {
            const { age } = system.openAge({});
            let called = false;
            system.registerHook('wisdomIncreased', () => { called = true; });
            system.increaseWisdom(age.ageId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpAge', () => {
        it('should level up', () => {
            const { age } = system.openAge({});
            system.levelUpAge(age.ageId);
            expect(age.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { age } = system.openAge({});
            system.levelUpAge(age.ageId);
            system.levelUpAge(age.ageId);
            system.levelUpAge(age.ageId);
            expect(age.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpAge('ghost');
            expect(result.error).toBe('AGE_NOT_FOUND');
        });

        it('should trigger ageLeveledUp hook', () => {
            const { age } = system.openAge({});
            let newLevel = null;
            system.registerHook('ageLeveledUp', (data) => { newLevel = data.newLevel; });
            system.levelUpAge(age.ageId);
            expect(newLevel).toBe(2);
        });
    });

    describe('ancientAge', () => {
        it('should mark as ancient', () => {
            const { age } = system.openAge({});
            system.ancientAge(age.ageId);
            expect(age.status).toBe('ancient');
        });

        it('should reject missing', () => {
            const result = system.ancientAge('ghost');
            expect(result.error).toBe('AGE_NOT_FOUND');
        });

        it('should trigger ageAncientized hook', () => {
            const { age } = system.openAge({});
            let called = false;
            system.registerHook('ageAncientized', () => { called = true; });
            system.ancientAge(age.ageId);
            expect(called).toBe(true);
        });
    });

    describe('calculateAgeValue', () => {
        it('should calculate base value', () => {
            const { age } = system.openAge({});
            // level=1, wisdom=20, milestones=0 -> 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateAgeValue(age.ageId)).toBe(140);
        });

        it('should reflect level and wisdom and milestones', () => {
            const { age } = system.openAge({});
            system.levelUpAge(age.ageId); // level 2
            system.increaseWisdom(age.ageId, 30); // wisdom 50
            system.addMilestone(age.ageId, 'm1'); // 1 milestone
            system.addMilestone(age.ageId, 'm2'); // 2 milestones
            // 2*100 + 50*2 + 2*30 = 200 + 100 + 60 = 360
            expect(system.calculateAgeValue(age.ageId)).toBe(360);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateAgeValue('ghost')).toBe(0);
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

        it('should execute default getAge and openAge', () => {
            const getResult = system.executeTool('getAge', { ageId: 'ghost' });
            expect(getResult.result).toBeNull();
            const openResult = system.executeTool('openAge', { cultivatorId: 'c1', name: 'X' });
            expect(openResult.result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('ageOpened', () => count++);
            unregister();
            system.openAge({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('ageOpened', () => { throw new Error('x'); });
            expect(() => system.openAge({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalAges = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalAges = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openAge({});
            const json = system.toJSON();
            expect(json.ages.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openAge({});
            const json = system.toJSON();
            const newSys = new CultivationAge();
            newSys.fromJSON(json);
            expect(newSys.ages.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.openAge({});
            const stats = system.getStats();
            expect(stats.ageCount).toBe(1);
            expect(stats.totalAges).toBe(1);
        });
    });
});
