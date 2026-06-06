/**
 * CultivationLevel.test.js - 修真等级系统测试
 * V548 Iteration 11/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationLevel } from '../../../systems/ai/CultivationLevel.js';

describe('CultivationLevel', () => {
    let system;
    beforeEach(() => { system = new CultivationLevel(); });

    describe('openLevel', () => {
        it('should open level', () => {
            const { level } = system.openLevel({ cultivatorId: 'c1', name: 'Foundation Qi' });
            expect(level.cultivatorId).toBe('c1');
            expect(level.name).toBe('Foundation Qi');
        });

        it('should default type to qi', () => {
            const { level } = system.openLevel({});
            expect(level.type).toBe('qi');
        });

        it('should default name to Unnamed Level', () => {
            const { level } = system.openLevel({});
            expect(level.name).toBe('Unnamed Level');
        });

        it('should default xp to baseXP (0)', () => {
            const { level } = system.openLevel({});
            expect(level.xp).toBe(0);
        });

        it('should default tier to 1', () => {
            const { level } = system.openLevel({});
            expect(level.tier).toBe(1);
        });

        it('should default status to training', () => {
            const { level } = system.openLevel({});
            expect(level.status).toBe('training');
        });

        it('should start with empty skills', () => {
            const { level } = system.openLevel({});
            expect(level.skills).toEqual([]);
        });

        it('should auto-generate levelId', () => {
            const { level } = system.openLevel({});
            expect(level.levelId).toBeTruthy();
            expect(typeof level.levelId).toBe('string');
        });

        it('should respect provided levelId', () => {
            const { level } = system.openLevel({ levelId: 'myLevel' });
            expect(level.levelId).toBe('myLevel');
        });

        it('should support custom type', () => {
            const { level } = system.openLevel({ type: 'core' });
            expect(level.type).toBe('core');
        });

        it('should support foundation type', () => {
            const { level } = system.openLevel({ type: 'foundation' });
            expect(level.type).toBe('foundation');
        });

        it('should support provided xp', () => {
            const { level } = system.openLevel({ xp: 50 });
            expect(level.xp).toBe(50);
        });

        it('should trigger levelOpened hook', () => {
            let called = false;
            system.registerHook('levelOpened', () => { called = true; });
            system.openLevel({});
            expect(called).toBe(true);
        });

        it('should return success', () => {
            const result = system.openLevel({});
            expect(result.success).toBe(true);
        });
    });

    describe('getLevel', () => {
        it('should return level', () => {
            const { level } = system.openLevel({});
            expect(system.getLevel(level.levelId)).not.toBeNull();
            expect(system.getLevel(level.levelId).levelId).toBe(level.levelId);
        });
        it('should return null for missing', () => {
            expect(system.getLevel('ghost')).toBeNull();
        });
    });

    describe('listLevels', () => {
        it('should list all', () => {
            system.openLevel({});
            system.openLevel({});
            expect(system.listLevels().length).toBe(2);
        });

        it('should return empty when no levels', () => {
            expect(system.listLevels().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.openLevel({ cultivatorId: 'c1' });
            system.openLevel({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });

        it('should return empty for unknown', () => {
            system.openLevel({ cultivatorId: 'c1' });
            expect(system.listByCultivator('ghost').length).toBe(0);
        });
    });

    describe('listAchieved', () => {
        it('should filter achieved only', () => {
            const { level: l1 } = system.openLevel({});
            const { level: l2 } = system.openLevel({});
            system.achieveLevel(l1.levelId);
            const achieved = system.listAchieved();
            expect(achieved.length).toBe(1);
            expect(achieved[0].levelId).toBe(l1.levelId);
            expect(l2.status).toBe('training');
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.openLevel({ type: 'qi' });
            system.openLevel({ type: 'foundation' });
            system.openLevel({ type: 'core' });
            expect(system.listByType('qi').length).toBe(1);
            expect(system.listByType('foundation').length).toBe(1);
            expect(system.listByType('core').length).toBe(1);
        });
    });

    describe('addSkill', () => {
        it('should add skill', () => {
            const { level } = system.openLevel({});
            system.addSkill(level.levelId, 'sword-art');
            expect(level.skills).toContain('sword-art');
        });

        it('should support multiple skills', () => {
            const { level } = system.openLevel({});
            system.addSkill(level.levelId, 's1');
            system.addSkill(level.levelId, 's2');
            expect(level.skills.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addSkill('ghost', 's');
            expect(result.error).toBe('LEVEL_NOT_FOUND');
        });

        it('should trigger skillAdded hook', () => {
            const { level } = system.openLevel({});
            let called = false;
            system.registerHook('skillAdded', () => { called = true; });
            system.addSkill(level.levelId, 's');
            expect(called).toBe(true);
        });
    });

    describe('gainXP', () => {
        it('should gain xp by default 5', () => {
            const { level } = system.openLevel({});
            system.gainXP(level.levelId);
            expect(level.xp).toBe(5);
        });

        it('should gain custom amount', () => {
            const { level } = system.openLevel({});
            system.gainXP(level.levelId, 50);
            expect(level.xp).toBe(50);
        });

        it('should accumulate xp', () => {
            const { level } = system.openLevel({});
            system.gainXP(level.levelId, 10);
            system.gainXP(level.levelId, 20);
            expect(level.xp).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.gainXP('ghost', 10);
            expect(result.error).toBe('LEVEL_NOT_FOUND');
        });

        it('should trigger xpGained hook', () => {
            const { level } = system.openLevel({});
            let called = false;
            system.registerHook('xpGained', () => { called = true; });
            system.gainXP(level.levelId, 10);
            expect(called).toBe(true);
        });
    });

    describe('ascendTier', () => {
        it('should ascend tier', () => {
            const { level } = system.openLevel({});
            system.ascendTier(level.levelId);
            expect(level.tier).toBe(2);
        });

        it('should accumulate tier', () => {
            const { level } = system.openLevel({});
            system.ascendTier(level.levelId);
            system.ascendTier(level.levelId);
            system.ascendTier(level.levelId);
            expect(level.tier).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.ascendTier('ghost');
            expect(result.error).toBe('LEVEL_NOT_FOUND');
        });

        it('should trigger tierAscended hook', () => {
            const { level } = system.openLevel({});
            let called = false;
            system.registerHook('tierAscended', () => { called = true; });
            system.ascendTier(level.levelId);
            expect(called).toBe(true);
        });
    });

    describe('achieveLevel', () => {
        it('should achieve level', () => {
            const { level } = system.openLevel({});
            system.achieveLevel(level.levelId);
            expect(level.status).toBe('achieved');
        });

        it('should reject missing', () => {
            const result = system.achieveLevel('ghost');
            expect(result.error).toBe('LEVEL_NOT_FOUND');
        });

        it('should trigger levelAchieved hook', () => {
            const { level } = system.openLevel({});
            let called = false;
            system.registerHook('levelAchieved', () => { called = true; });
            system.achieveLevel(level.levelId);
            expect(called).toBe(true);
        });
    });

    describe('calculateLevelPower', () => {
        it('should calculate basic', () => {
            const { level } = system.openLevel({});
            // tier=1, xp=0, skills=0 -> 1*100 + 0*2 + 0*30 = 100
            expect(system.calculateLevelPower(level.levelId)).toBe(100);
        });

        it('should include tier', () => {
            const { level } = system.openLevel({});
            system.ascendTier(level.levelId);
            system.ascendTier(level.levelId);
            // tier=3, xp=0, skills=0 -> 3*100 + 0*2 + 0*30 = 300
            expect(system.calculateLevelPower(level.levelId)).toBe(300);
        });

        it('should include xp', () => {
            const { level } = system.openLevel({});
            system.gainXP(level.levelId, 50);
            // tier=1, xp=50, skills=0 -> 1*100 + 50*2 + 0*30 = 200
            expect(system.calculateLevelPower(level.levelId)).toBe(200);
        });

        it('should include skills', () => {
            const { level } = system.openLevel({});
            system.addSkill(level.levelId, 's1');
            system.addSkill(level.levelId, 's2');
            // tier=1, xp=0, skills=2 -> 1*100 + 0*2 + 2*30 = 160
            expect(system.calculateLevelPower(level.levelId)).toBe(160);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateLevelPower('ghost')).toBe(0);
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

        it('should handle null context', () => {
            system.registerTool('test', () => 'ok');
            const result = system.executeTool('test', null);
            expect(result.result).toBe('ok');
        });

        it('should handle undefined context', () => {
            system.registerTool('test', () => 'ok');
            const result = system.executeTool('test', undefined);
            expect(result.result).toBe('ok');
        });

        it('should execute default getLevel', () => {
            const result = system.executeTool('getLevel', { levelId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default openLevel', () => {
            const result = system.executeTool('openLevel', { cultivatorId: 'c1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('levelOpened', () => count++);
            unregister();
            system.openLevel({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('levelOpened', () => { throw new Error('x'); });
            expect(() => system.openLevel({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalLevels = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalLevels = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openLevel({});
            const json = system.toJSON();
            expect(json.levels.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openLevel({});
            const json = system.toJSON();
            const newSys = new CultivationLevel();
            newSys.fromJSON(json);
            expect(newSys.levels.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.levelCount).toBe(0);
        });

        it('should reflect added levels', () => {
            system.openLevel({});
            system.openLevel({});
            const stats = system.getStats();
            expect(stats.levelCount).toBe(2);
        });
    });
});
