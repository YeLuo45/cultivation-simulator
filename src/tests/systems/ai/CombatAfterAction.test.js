/**
 * CombatAfterAction.test.js - 战斗复盘系统测试
 * V320 Iteration 8/9 Round 4 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CombatAfterAction } from '../../../systems/ai/CombatAfterAction.js';

describe('CombatAfterAction', () => {
    let system;
    beforeEach(() => { system = new CombatAfterAction(); });

    describe('createBattle', () => {
        it('should create', () => {
            const { battle } = system.createBattle({ name: 'B1' });
            expect(battle.name).toBe('B1');
        });

        it('should default status to in_progress', () => {
            const { battle } = system.createBattle({});
            expect(battle.status).toBe('in_progress');
        });
    });

    describe('getBattle', () => {
        it('should return', () => {
            const { battle } = system.createBattle({});
            expect(system.getBattle(battle.battleId)).not.toBeNull();
        });

        it('should return null for missing', () => { expect(system.getBattle('ghost')).toBeNull(); });
    });

    describe('endBattle', () => {
        it('should end', () => {
            const { battle } = system.createBattle({});
            const result = system.endBattle(battle.battleId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.endBattle('ghost');
            expect(result.error).toBe('BATTLE_NOT_FOUND');
        });

        it('should set endTime', () => {
            const { battle } = system.createBattle({});
            system.endBattle(battle.battleId);
            expect(battle.endTime).toBeGreaterThan(0);
        });
    });

    describe('Lessons', () => {
        it('should add', () => {
            const { lesson } = system.addLesson({ content: 'X' });
            expect(lesson.content).toBe('X');
        });

        it('should default importance to 5', () => {
            const { lesson } = system.addLesson({});
            expect(lesson.importance).toBe(5);
        });

        it('should get', () => {
            const { lesson } = system.addLesson({});
            expect(system.getLesson(lesson.lessonId)).not.toBeNull();
        });

        it('should return null for missing', () => { expect(system.getLesson('ghost')).toBeNull(); });

        it('should list', () => {
            system.addLesson({});
            expect(system.listLessons().length).toBe(1);
        });

        it('should trigger lessonAdded hook', () => {
            let called = false;
            system.registerHook('lessonAdded', () => { called = true; });
            system.addLesson({});
            expect(called).toBe(true);
        });
    });

    describe('generateReport', () => {
        it('should generate', () => {
            const { battle } = system.createBattle({});
            const result = system.generateReport(battle.battleId, { won: true });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.generateReport('ghost', {});
            expect(result.error).toBe('BATTLE_NOT_FOUND');
        });

        it('should calculate score', () => {
            const { battle } = system.createBattle({});
            const { report } = system.generateReport(battle.battleId, { won: true, lowCasualties: true, objectiveAchieved: true });
            expect(report.score).toBe(100);
        });

        it('should have highlights for victory', () => {
            const { battle } = system.createBattle({});
            const { report } = system.generateReport(battle.battleId, { won: true });
            expect(report.highlights.length).toBeGreaterThan(0);
        });

        it('should have improvements for low score', () => {
            const { battle } = system.createBattle({});
            const { report } = system.generateReport(battle.battleId, {});
            expect(report.improvements.length).toBeGreaterThan(0);
        });

        it('should increment totalReports', () => {
            const { battle } = system.createBattle({});
            system.generateReport(battle.battleId, {});
            expect(system.stats.totalReports).toBe(1);
        });

        it('should trigger reportGenerated hook', () => {
            const { battle } = system.createBattle({});
            let called = false;
            system.registerHook('reportGenerated', () => { called = true; });
            system.generateReport(battle.battleId, {});
            expect(called).toBe(true);
        });
    });

    describe('getReport', () => {
        it('should return', () => {
            const { battle } = system.createBattle({});
            const { report } = system.generateReport(battle.battleId, {});
            expect(system.getReport(report.reportId)).not.toBeNull();
        });

        it('should return null for missing', () => { expect(system.getReport('ghost')).toBeNull(); });
    });

    describe('listReports', () => {
        it('should list all', () => {
            const { battle } = system.createBattle({});
            system.generateReport(battle.battleId, {});
            expect(system.listReports().length).toBe(1);
        });
    });

    describe('applyLessonsToReport', () => {
        it('should apply', () => {
            const { battle } = system.createBattle({});
            const { report } = system.generateReport(battle.battleId, {});
            const { lesson } = system.addLesson({});
            const result = system.applyLessonsToReport(report.reportId, [lesson.lessonId]);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.applyLessonsToReport('ghost', []);
            expect(result.error).toBe('REPORT_NOT_FOUND');
        });
    });

    describe('getImprovementSuggestions', () => {
        it('should return high importance', () => {
            system.addLesson({ importance: 8 });
            system.addLesson({ importance: 3 });
            expect(system.getImprovementSuggestions().length).toBe(1);
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

        it('should execute default getReport', () => {
            const result = system.executeTool('getReport', { reportId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('reportGenerated', () => count++);
            unregister();
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('reportGenerated', () => { throw new Error('x'); });
            const { battle } = system.createBattle({});
            expect(() => system.generateReport(battle.battleId, {})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalReports = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalReports = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createBattle({});
            const json = system.toJSON();
            expect(json.battles.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createBattle({});
            const json = system.toJSON();
            const newSys = new CombatAfterAction();
            newSys.fromJSON(json);
            expect(newSys.battles.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.battleCount).toBe(0);
        });
    });
});