/**
 * CultivationSkill.test.js - 道术系统测试
 * V531 Iteration 13/20 Round 21 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSkill } from '../../../systems/ai/CultivationSkill.js';

describe('CultivationSkill', () => {
    let system;
    beforeEach(() => { system = new CultivationSkill(); });

    describe('castSkill', () => {
        it('should cast skill', () => {
            const { skill } = system.castSkill({ cultivatorId: 'c1', name: 'Sword Qi' });
            expect(skill.cultivatorId).toBe('c1');
            expect(skill.name).toBe('Sword Qi');
        });

        it('should default to initiated status', () => {
            const { skill } = system.castSkill({});
            expect(skill.status).toBe('initiated');
        });

        it('should default type to attack', () => {
            const { skill } = system.castSkill({});
            expect(skill.type).toBe('attack');
        });

        it('should default power to basePower', () => {
            const { skill } = system.castSkill({});
            expect(skill.power).toBe(20);
        });

        it('should start at level 1', () => {
            const { skill } = system.castSkill({});
            expect(skill.level).toBe(1);
        });

        it('should start with empty effects', () => {
            const { skill } = system.castSkill({});
            expect(skill.effects).toEqual([]);
        });

        it('should generate skillId', () => {
            const { skill } = system.castSkill({});
            expect(skill.skillId).toBeDefined();
            expect(typeof skill.skillId).toBe('string');
        });

        it('should accept custom skillId', () => {
            const { skill } = system.castSkill({ skillId: 'my-skill' });
            expect(skill.skillId).toBe('my-skill');
        });

        it('should trigger skillCast hook', () => {
            let called = false;
            system.registerHook('skillCast', () => { called = true; });
            system.castSkill({});
            expect(called).toBe(true);
        });

        it('should support all types', () => {
            const { skill: s1 } = system.castSkill({ type: 'attack' });
            const { skill: s2 } = system.castSkill({ type: 'defense' });
            const { skill: s3 } = system.castSkill({ type: 'utility' });
            expect(s1.type).toBe('attack');
            expect(s2.type).toBe('defense');
            expect(s3.type).toBe('utility');
        });
    });

    describe('getSkill', () => {
        it('should return skill', () => {
            const { skill } = system.castSkill({});
            expect(system.getSkill(skill.skillId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSkill('ghost')).toBeNull(); });
    });

    describe('listSkills', () => {
        it('should list all', () => {
            system.castSkill({});
            system.castSkill({});
            expect(system.listSkills().length).toBe(2);
        });

        it('should return empty when no skills', () => {
            expect(system.listSkills().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter by cultivator', () => {
            system.castSkill({ cultivatorId: 'c1' });
            system.castSkill({ cultivatorId: 'c2' });
            system.castSkill({ cultivatorId: 'c1' });
            expect(system.listByCultivator('c1').length).toBe(2);
        });

        it('should return empty for unknown cultivator', () => {
            system.castSkill({ cultivatorId: 'c1' });
            expect(system.listByCultivator('ghost').length).toBe(0);
        });
    });

    describe('listMastered', () => {
        it('should filter mastered only', () => {
            const { skill: s1 } = system.castSkill({});
            const { skill: s2 } = system.castSkill({});
            system.masterSkill(s1.skillId);
            const mastered = system.listMastered();
            expect(mastered.length).toBe(1);
            expect(mastered[0].skillId).toBe(s1.skillId);
            expect(s2.status).toBe('initiated');
        });

        it('should return empty when none mastered', () => {
            system.castSkill({});
            expect(system.listMastered().length).toBe(0);
        });
    });

    describe('addEffect', () => {
        it('should add effect', () => {
            const { skill } = system.castSkill({});
            system.addEffect(skill.skillId, 'burn');
            expect(skill.effects).toContain('burn');
        });

        it('should accumulate effects', () => {
            const { skill } = system.castSkill({});
            system.addEffect(skill.skillId, 'burn');
            system.addEffect(skill.skillId, 'freeze');
            system.addEffect(skill.skillId, 'shock');
            expect(skill.effects.length).toBe(3);
        });

        it('should reject missing skill', () => {
            const result = system.addEffect('ghost', 'burn');
            expect(result.error).toBe('SKILL_NOT_FOUND');
        });

        it('should trigger effectAdded hook', () => {
            const { skill } = system.castSkill({});
            let called = false;
            system.registerHook('effectAdded', () => { called = true; });
            system.addEffect(skill.skillId, 'burn');
            expect(called).toBe(true);
        });
    });

    describe('increasePower', () => {
        it('should increase power by default', () => {
            const { skill } = system.castSkill({});
            system.increasePower(skill.skillId);
            expect(skill.power).toBe(25);
        });

        it('should increase power by custom amount', () => {
            const { skill } = system.castSkill({});
            system.increasePower(skill.skillId, 100);
            expect(skill.power).toBe(120);
        });

        it('should reject missing skill', () => {
            const result = system.increasePower('ghost');
            expect(result.error).toBe('SKILL_NOT_FOUND');
        });

        it('should trigger powerIncreased hook', () => {
            const { skill } = system.castSkill({});
            let called = false;
            system.registerHook('powerIncreased', () => { called = true; });
            system.increasePower(skill.skillId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSkill', () => {
        it('should level up', () => {
            const { skill } = system.castSkill({});
            system.levelUpSkill(skill.skillId);
            expect(skill.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { skill } = system.castSkill({});
            system.levelUpSkill(skill.skillId);
            system.levelUpSkill(skill.skillId);
            system.levelUpSkill(skill.skillId);
            expect(skill.level).toBe(4);
        });

        it('should reject missing skill', () => {
            const result = system.levelUpSkill('ghost');
            expect(result.error).toBe('SKILL_NOT_FOUND');
        });

        it('should trigger skillLeveledUp hook', () => {
            const { skill } = system.castSkill({});
            let called = false;
            system.registerHook('skillLeveledUp', () => { called = true; });
            system.levelUpSkill(skill.skillId);
            expect(called).toBe(true);
        });
    });

    describe('masterSkill', () => {
        it('should master skill', () => {
            const { skill } = system.castSkill({});
            system.masterSkill(skill.skillId);
            expect(skill.status).toBe('mastered');
        });

        it('should reject missing skill', () => {
            const result = system.masterSkill('ghost');
            expect(result.error).toBe('SKILL_NOT_FOUND');
        });

        it('should trigger skillMastered hook', () => {
            const { skill } = system.castSkill({});
            let called = false;
            system.registerHook('skillMastered', () => { called = true; });
            system.masterSkill(skill.skillId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSkillPower', () => {
        it('should calculate base power', () => {
            const { skill } = system.castSkill({});
            // level=1, power=20, effects=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculateSkillPower(skill.skillId)).toBe(140);
        });

        it('should include effects in power', () => {
            const { skill } = system.castSkill({});
            system.addEffect(skill.skillId, 'burn');
            system.addEffect(skill.skillId, 'freeze');
            // level=1, power=20, effects=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateSkillPower(skill.skillId)).toBe(200);
        });

        it('should scale with level', () => {
            const { skill } = system.castSkill({});
            system.levelUpSkill(skill.skillId);
            system.levelUpSkill(skill.skillId);
            // level=3, power=20, effects=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculateSkillPower(skill.skillId)).toBe(340);
        });

        it('should scale with power', () => {
            const { skill } = system.castSkill({});
            system.increasePower(skill.skillId, 100);
            // level=1, power=120, effects=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculateSkillPower(skill.skillId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSkillPower('ghost')).toBe(0);
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

        it('should handle undefined context', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test');
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

        it('should execute default getSkill', () => {
            const result = system.executeTool('getSkill', { skillId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default castSkill', () => {
            const result = system.executeTool('castSkill', { cultivatorId: 'c1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('skillCast', () => count++);
            unregister();
            system.castSkill({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('skillCast', () => { throw new Error('x'); });
            expect(() => system.castSkill({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSkills = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSkills = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.castSkill({});
            const json = system.toJSON();
            expect(json.skills.length).toBe(1);
        });
        it('should deserialize', () => {
            system.castSkill({});
            const json = system.toJSON();
            const newSys = new CultivationSkill();
            newSys.fromJSON(json);
            expect(newSys.skills.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.skillCount).toBe(0);
        });
    });
});
