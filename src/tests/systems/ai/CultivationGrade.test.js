/**
 * CultivationGrade.test.js - 修真品阶系统测试
 * V549 Iteration 12/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationGrade } from '../../../systems/ai/CultivationGrade.js';

describe('CultivationGrade', () => {
    let system;
    beforeEach(() => { system = new CultivationGrade(); });

    describe('openGrade', () => {
        it('should open', () => {
            const { grade } = system.openGrade({ ownerId: 'o1', name: 'jade-sword' });
            expect(grade.ownerId).toBe('o1');
            expect(grade.name).toBe('jade-sword');
            expect(grade.type).toBe('mortal');
            expect(grade.quality).toBe(20);
            expect(grade.level).toBe(1);
            expect(grade.status).toBe('rough');
        });

        it('should use provided gradeId', () => {
            const { grade } = system.openGrade({ gradeId: 'g-custom', ownerId: 'o1' });
            expect(grade.gradeId).toBe('g-custom');
        });

        it('should respect custom type/quality/status', () => {
            const { grade } = system.openGrade({ ownerId: 'o1', type: 'heavenly', quality: 80, status: 'masterpiece' });
            expect(grade.type).toBe('heavenly');
            expect(grade.quality).toBe(80);
            expect(grade.status).toBe('masterpiece');
        });

        it('should trigger gradeOpened hook', () => {
            let called = false;
            system.registerHook('gradeOpened', () => { called = true; });
            system.openGrade({});
            expect(called).toBe(true);
        });

        it('should reject when maxGrades reached', () => {
            system.config.maxGrades = 1;
            system.openGrade({});
            const result = system.openGrade({});
            expect(result.error).toBe('MAX_GRADES_REACHED');
        });
    });

    describe('getGrade', () => {
        it('should return', () => {
            const { grade } = system.openGrade({});
            expect(system.getGrade(grade.gradeId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getGrade('ghost')).toBeNull(); });
    });

    describe('listGrades', () => {
        it('should list all', () => {
            system.openGrade({});
            system.openGrade({});
            expect(system.listGrades().length).toBe(2);
        });
        it('should return empty when none', () => {
            expect(system.listGrades().length).toBe(0);
        });
    });

    describe('listByOwner', () => {
        it('should filter', () => {
            system.openGrade({ ownerId: 'o1' });
            system.openGrade({ ownerId: 'o2' });
            system.openGrade({ ownerId: 'o1' });
            expect(system.listByOwner('o1').length).toBe(2);
        });
        it('should return empty for unknown owner', () => {
            system.openGrade({ ownerId: 'o1' });
            expect(system.listByOwner('unknown').length).toBe(0);
        });
    });

    describe('listRefined', () => {
        it('should return refined only', () => {
            const { grade: g1 } = system.openGrade({});
            const { grade: g2 } = system.openGrade({});
            system.refineGrade(g1.gradeId);
            const refined = system.listRefined();
            expect(refined.length).toBe(1);
            expect(refined[0].gradeId).toBe(g1.gradeId);
        });
        it('should include masterpiece status', () => {
            system.openGrade({ status: 'masterpiece' });
            system.openGrade({});
            expect(system.listRefined().length).toBe(1);
        });
    });

    describe('addRefinement', () => {
        it('should add refinement', () => {
            const { grade } = system.openGrade({});
            const result = system.addRefinement(grade.gradeId, 'soul-temper');
            expect(result.success).toBe(true);
            expect(result.refinements).toBe(1);
            expect(grade.refinements).toContain('soul-temper');
        });

        it('should add multiple refinements', () => {
            const { grade } = system.openGrade({});
            system.addRefinement(grade.gradeId, 'a');
            system.addRefinement(grade.gradeId, 'b');
            expect(grade.refinements.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addRefinement('ghost', 'x');
            expect(result.error).toBe('GRADE_NOT_FOUND');
        });

        it('should trigger refinementAdded hook', () => {
            const { grade } = system.openGrade({});
            let payload = null;
            system.registerHook('refinementAdded', (d) => { payload = d; });
            system.addRefinement(grade.gradeId, 'fire-temper');
            expect(payload.refinement).toBe('fire-temper');
        });
    });

    describe('increaseQuality', () => {
        it('should increase with default amount', () => {
            const { grade } = system.openGrade({});
            system.increaseQuality(grade.gradeId);
            expect(grade.quality).toBe(25);
        });

        it('should increase with custom amount', () => {
            const { grade } = system.openGrade({});
            system.increaseQuality(grade.gradeId, 30);
            expect(grade.quality).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.increaseQuality('ghost', 5);
            expect(result.error).toBe('GRADE_NOT_FOUND');
        });

        it('should trigger qualityIncreased hook', () => {
            const { grade } = system.openGrade({});
            let payload = null;
            system.registerHook('qualityIncreased', (d) => { payload = d; });
            system.increaseQuality(grade.gradeId, 10);
            expect(payload.newQuality).toBe(30);
        });
    });

    describe('levelUpGrade', () => {
        it('should level up', () => {
            const { grade } = system.openGrade({});
            system.levelUpGrade(grade.gradeId);
            expect(grade.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { grade } = system.openGrade({});
            system.levelUpGrade(grade.gradeId);
            system.levelUpGrade(grade.gradeId);
            system.levelUpGrade(grade.gradeId);
            expect(grade.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpGrade('ghost');
            expect(result.error).toBe('GRADE_NOT_FOUND');
        });

        it('should trigger gradeLeveledUp hook', () => {
            const { grade } = system.openGrade({});
            let payload = null;
            system.registerHook('gradeLeveledUp', (d) => { payload = d; });
            system.levelUpGrade(grade.gradeId);
            expect(payload.newLevel).toBe(2);
        });
    });

    describe('refineGrade', () => {
        it('should refine', () => {
            const { grade } = system.openGrade({});
            system.refineGrade(grade.gradeId);
            expect(grade.status).toBe('refined');
        });

        it('should reject missing', () => {
            const result = system.refineGrade('ghost');
            expect(result.error).toBe('GRADE_NOT_FOUND');
        });

        it('should trigger gradeRefined hook', () => {
            const { grade } = system.openGrade({});
            let called = false;
            system.registerHook('gradeRefined', () => { called = true; });
            system.refineGrade(grade.gradeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateGradeValue', () => {
        it('should calculate base value', () => {
            const { grade } = system.openGrade({});
            // level=1 *100 + quality=20 *2 + refinements=0*30 = 100 + 40 + 0 = 140
            expect(system.calculateGradeValue(grade.gradeId)).toBe(140);
        });

        it('should include refinements', () => {
            const { grade } = system.openGrade({});
            system.addRefinement(grade.gradeId, 'a');
            system.addRefinement(grade.gradeId, 'b');
            // 100 + 40 + 60 = 200
            expect(system.calculateGradeValue(grade.gradeId)).toBe(200);
        });

        it('should grow with level and quality', () => {
            const { grade } = system.openGrade({});
            system.levelUpGrade(grade.gradeId);
            system.levelUpGrade(grade.gradeId);
            system.increaseQuality(grade.gradeId, 10);
            // 3*100 + 30*2 + 0 = 360
            expect(system.calculateGradeValue(grade.gradeId)).toBe(360);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateGradeValue('ghost')).toBe(0);
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
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default openGrade tool', () => {
            const result = system.executeTool('openGrade', { ownerId: 'o1', name: 'g1' });
            expect(result.result.success).toBe(true);
            expect(result.result.grade.name).toBe('g1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('gradeOpened', () => count++);
            unregister();
            system.openGrade({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('gradeOpened', () => { throw new Error('x'); });
            expect(() => system.openGrade({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalGrades = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxGrades).toBe(70);
        });
        it('should not double evolve', () => {
            system.stats.totalGrades = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openGrade({});
            const json = system.toJSON();
            expect(json.grades.length).toBe(1);
            expect(json.stats.totalGrades).toBe(1);
        });
        it('should deserialize', () => {
            system.openGrade({ ownerId: 'o1' });
            const json = system.toJSON();
            const newSys = new CultivationGrade();
            newSys.fromJSON(json);
            expect(newSys.grades.size).toBe(1);
            expect(newSys.stats.totalGrades).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.gradeCount).toBe(0);
            expect(stats.totalGrades).toBe(0);
        });
    });
});
