/**
 * BeastSkillTree.test.js - 灵兽技能树测试
 * V329 Iteration 8/9 Round 5 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BeastSkillTree } from '../../../systems/ai/BeastSkillTree.js';

describe('BeastSkillTree', () => {
    let system;
    beforeEach(() => { system = new BeastSkillTree(); });

    describe('Default Skills', () => {
        it('should have skills', () => { expect(system.skills.size).toBe(5); });
        it('should contain basic_bite', () => { expect(system.getSkill('basic_bite')).not.toBeNull(); });
    });

    describe('getSkill', () => {
        it('should return', () => { expect(system.getSkill('basic_bite')).not.toBeNull(); });
        it('should return null for missing', () => { expect(system.getSkill('ghost')).toBeNull(); });
    });

    describe('listSkills', () => {
        it('should list all', () => { expect(system.listSkills().length).toBe(5); });
    });

    describe('getSkillsByTier', () => {
        it('should filter by tier', () => {
            expect(system.getSkillsByTier(1).length).toBe(2);
            expect(system.getSkillsByTier(2).length).toBe(2);
        });
    });

    describe('addSkillPoints', () => {
        it('should add', () => {
            const result = system.addSkillPoints('b1', 10);
            expect(result.total).toBe(10);
        });

        it('should trigger skillPointsAdded hook', () => {
            let called = false;
            system.registerHook('skillPointsAdded', () => { called = true; });
            system.addSkillPoints('b1', 10);
            expect(called).toBe(true);
        });
    });

    describe('getAvailablePoints', () => {
        it('should return', () => {
            system.addSkillPoints('b1', 5);
            expect(system.getAvailablePoints('b1')).toBe(5);
        });

        it('should return 0 for missing', () => { expect(system.getAvailablePoints('ghost')).toBe(0); });
    });

    describe('unlockSkill', () => {
        it('should unlock', () => {
            system.addSkillPoints('b1', 10);
            const result = system.unlockSkill('b1', 'basic_bite');
            expect(result.success).toBe(true);
        });

        it('should reject missing skill', () => {
            const result = system.unlockSkill('b1', 'ghost');
            expect(result.error).toBe('SKILL_NOT_FOUND');
        });

        it('should reject insufficient points', () => {
            const result = system.unlockSkill('b1', 'fire_breath');
            expect(result.error).toBe('INSUFFICIENT_POINTS');
        });

        it('should reject missing prerequisite', () => {
            system.addSkillPoints('b1', 10);
            const result = system.unlockSkill('b1', 'fire_breath');
            expect(result.error).toBe('MISSING_PREREQUISITE');
        });

        it('should deduct points', () => {
            system.addSkillPoints('b1', 10);
            system.unlockSkill('b1', 'basic_bite');
            expect(system.getAvailablePoints('b1')).toBe(9);
        });

        it('should add to skill tree', () => {
            system.addSkillPoints('b1', 10);
            system.unlockSkill('b1', 'basic_bite');
            expect(system.hasSkill('b1', 'basic_bite')).toBe(true);
        });

        it('should increment totalUnlocked', () => {
            system.addSkillPoints('b1', 10);
            system.unlockSkill('b1', 'basic_bite');
            expect(system.stats.totalUnlocked).toBe(1);
        });

        it('should trigger skillUnlocked hook', () => {
            system.addSkillPoints('b1', 10);
            let called = false;
            system.registerHook('skillUnlocked', () => { called = true; });
            system.unlockSkill('b1', 'basic_bite');
            expect(called).toBe(true);
        });
    });

    describe('hasSkill', () => {
        it('should return true for unlocked', () => {
            system.addSkillPoints('b1', 10);
            system.unlockSkill('b1', 'basic_bite');
            expect(system.hasSkill('b1', 'basic_bite')).toBe(true);
        });

        it('should return false for not unlocked', () => {
            expect(system.hasSkill('b1', 'basic_bite')).toBe(false);
        });
    });

    describe('getBeastSkills', () => {
        it('should return skills', () => {
            system.addSkillPoints('b1', 10);
            system.unlockSkill('b1', 'basic_bite');
            expect(system.getBeastSkills('b1').length).toBe(1);
        });

        it('should return empty for missing', () => {
            expect(system.getBeastSkills('ghost').length).toBe(0);
        });
    });

    describe('calculateBeastPower', () => {
        it('should calculate', () => {
            system.addSkillPoints('b1', 10);
            system.unlockSkill('b1', 'basic_bite');
            expect(system.calculateBeastPower('b1')).toBe(5);
        });

        it('should return 0 for no skills', () => {
            expect(system.calculateBeastPower('b1')).toBe(0);
        });
    });

    describe('lockSkill', () => {
        it('should lock', () => {
            system.addSkillPoints('b1', 10);
            system.unlockSkill('b1', 'basic_bite');
            const result = system.lockSkill('b1', 'basic_bite');
            expect(result.success).toBe(true);
        });

        it('should reject missing beast', () => {
            const result = system.lockSkill('ghost', 'basic_bite');
            expect(result.error).toBe('BEAST_NOT_FOUND');
        });

        it('should reject not unlocked', () => {
            // First add a different skill to the tree, then try to lock one not in it
            system.skillTrees.set('b1', ['other_skill']);
            const result = system.lockSkill('b1', 'basic_bite');
            expect(result.error).toBe('SKILL_NOT_UNLOCKED');
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

        it('should execute default getSkill', () => {
            const result = system.executeTool('getSkill', { skillId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('skillUnlocked', () => count++);
            unregister();
            system.addSkillPoints('b1', 10);
            system.unlockSkill('b1', 'basic_bite');
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('skillUnlocked', () => { throw new Error('x'); });
            system.addSkillPoints('b1', 10);
            expect(() => system.unlockSkill('b1', 'basic_bite')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalUnlocked = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalUnlocked = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.addSkillPoints('b1', 10);
            const json = system.toJSON();
            expect(json.allocatedPoints.length).toBe(1);
        });
        it('should deserialize', () => {
            system.addSkillPoints('b1', 10);
            const json = system.toJSON();
            const newSys = new BeastSkillTree();
            newSys.fromJSON(json);
            expect(newSys.getAvailablePoints('b1')).toBe(10);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.skillCount).toBe(5);
        });
    });
});