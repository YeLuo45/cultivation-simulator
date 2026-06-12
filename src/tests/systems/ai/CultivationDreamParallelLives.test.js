/**
 * CultivationDreamParallelLives.test.js - 修真平行人生测试
 * V874 Iteration 8/30 Round 34 - 测试覆盖率目标: 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDreamParallelLives, CHOICE_BRANCHES, OUTCOME_TYPES, COMPARISON_RULES } from '../../../systems/ai/CultivationDreamParallelLives.js';

describe('CultivationDreamParallelLives', () => {
    let system;
    beforeEach(() => { system = new CultivationDreamParallelLives(); });

    describe('exports', () => {
        it('should export constants', () => {
            expect(CHOICE_BRANCHES.length).toBe(3);
            expect(OUTCOME_TYPES.length).toBe(5);
            expect(COMPARISON_RULES.length).toBe(5);
        });
    });

    describe('constructor', () => {
        it('should accept custom config', () => {
            const s = new CultivationDreamParallelLives({ maxLives: 5, baseChoices: 5 });
            expect(s.config.baseChoices).toBe(5);
        });
    });

    describe('enterParallelLife', () => {
        it('should enter', () => {
            const { life } = system.enterParallelLife('d1', 'martial');
            expect(life.dreamId).toBe('d1');
            expect(life.choiceBranch).toBe('martial');
            expect(life.outcome).toBeDefined();
        });
        it('should reject invalid branch', () => {
            expect(system.enterParallelLife('d', 'invalid').error).toBe('INVALID_BRANCH');
        });
        it('should trigger hook', () => {
            let called = false;
            system.registerHook('lifeEntered', () => { called = true; });
            system.enterParallelLife('d', 'scholar');
            expect(called).toBe(true);
        });
        it('should support all branches', () => {
            for (const b of CHOICE_BRANCHES) {
                expect(system.enterParallelLife('d', b).success).toBe(true);
            }
        });
    });

    describe('compareOutcomes', () => {
        it('should compare same branch', () => {
            const { life: l1 } = system.enterParallelLife('d', 'martial');
            const { life: l2 } = system.enterParallelLife('d', 'martial');
            const r = system.compareOutcomes([l1.id, l2.id]);
            expect(r.similarity).toBe(1);
            expect(r.count).toBe(2);
        });
        it('should compare different branches', () => {
            const { life: l1 } = system.enterParallelLife('d', 'martial');
            const { life: l2 } = system.enterParallelLife('d', 'scholar');
            const r = system.compareOutcomes([l1.id, l2.id]);
            expect(r.similarity).toBe(0);
        });
        it('should reject too few', () => {
            const { life } = system.enterParallelLife('d', 'martial');
            expect(system.compareOutcomes([life.id]).error).toBe('NEED_TWO_LIVES');
        });
        it('should reject non-array', () => {
            expect(system.compareOutcomes('x').error).toBe('NEED_TWO_LIVES');
        });
        it('should reject insufficient valid', () => {
            const { life } = system.enterParallelLife('d', 'martial');
            expect(system.compareOutcomes([life.id, 'ghost']).error).toBe('INSUFFICIENT_LIVES');
        });
        it('should trigger hook', () => {
            const { life: l1 } = system.enterParallelLife('d', 'martial');
            const { life: l2 } = system.enterParallelLife('d', 'martial');
            let called = false;
            system.registerHook('outcomesCompared', () => { called = true; });
            system.compareOutcomes([l1.id, l2.id]);
            expect(called).toBe(true);
        });
    });

    describe('exitParallel', () => {
        it('should exit', () => {
            const { life } = system.enterParallelLife('d', 'martial');
            const r = system.exitParallel(life.id);
            expect(r.success).toBe(true);
            expect(life.exited).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.exitParallel('ghost').error).toBe('LIFE_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { life } = system.enterParallelLife('d', 'martial');
            let called = false;
            system.registerHook('lifeExited', () => { called = true; });
            system.exitParallel(life.id);
            expect(called).toBe(true);
        });
    });

    describe('list methods', () => {
        it('listLives', () => {
            system.enterParallelLife('d', 'martial');
            expect(system.listLives().length).toBe(1);
        });
        it('listByBranch', () => {
            system.enterParallelLife('d', 'martial');
            system.enterParallelLife('d', 'scholar');
            expect(system.listByBranch('martial').length).toBe(1);
        });
        it('listByDream', () => {
            system.enterParallelLife('d1', 'martial');
            expect(system.listByDream('d1').length).toBe(1);
        });
        it('listActive', () => {
            const { life } = system.enterParallelLife('d', 'martial');
            system.exitParallel(life.id);
            expect(system.listActive().length).toBe(0);
        });
    });

    describe('addChoice', () => {
        it('should add', () => {
            const { life } = system.enterParallelLife('d', 'martial');
            const r = system.addChoice(life.id, 2);
            expect(r.choicesCount).toBeGreaterThan(3);
        });
        it('should reject missing', () => {
            expect(system.addChoice('ghost').error).toBe('LIFE_NOT_FOUND');
        });
    });

    describe('setOutcome', () => {
        it('should set', () => {
            const { life } = system.enterParallelLife('d', 'martial');
            const r = system.setOutcome(life.id, 'triumph');
            expect(r.success).toBe(true);
            expect(life.outcome).toBe('triumph');
        });
        it('should reject missing', () => {
            expect(system.setOutcome('ghost', 'triumph').error).toBe('LIFE_NOT_FOUND');
        });
        it('should reject invalid', () => {
            const { life } = system.enterParallelLife('d', 'martial');
            expect(system.setOutcome(life.id, 'invalid').error).toBe('INVALID_OUTCOME');
        });
    });

    describe('deleteLife', () => {
        it('should delete', () => {
            const { life } = system.enterParallelLife('d', 'martial');
            expect(system.deleteLife(life.id).success).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.deleteLife('ghost').error).toBe('LIFE_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { life } = system.enterParallelLife('d', 'martial');
            let called = false;
            system.registerHook('lifeDeleted', () => { called = true; });
            system.deleteLife(life.id);
            expect(called).toBe(true);
        });
    });

    describe('tools and hooks', () => {
        it('should execute default tool', () => {
            const { life } = system.enterParallelLife('d', 'martial');
            const r = system.executeTool('getLife', { lifeId: life.id });
            expect(r.success).toBe(true);
        });
        it('should handle missing tool', () => {
            expect(system.executeTool('ghost').error).toBe('TOOL_NOT_FOUND');
        });
        it('should handle exception', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            expect(system.executeTool('bad').error).toBe('x');
        });
        it('should handle missing context for default tool', () => {
            const r = system.executeTool('getLife');
            expect(r.success).toBe(true);
            expect(r.result).toBeNull();
        });
        it('should list tools', () => {
            expect(system.listTools().length).toBe(2);
        });
        it('should unregister hook', () => {
            let count = 0;
            const off = system.registerHook('lifeEntered', () => { count++; });
            system.enterParallelLife('d', 'martial');
            off();
            system.enterParallelLife('d', 'martial');
            expect(count).toBe(1);
        });
        it('should catch handler errors', () => {
            system.registerHook('lifeEntered', () => { throw new Error('x'); });
            expect(() => system.enterParallelLife('d', 'martial')).not.toThrow();
        });
    });

    describe('toJSON/fromJSON', () => {
        it('should round trip', () => {
            system.enterParallelLife('d', 'martial');
            const json = system.toJSON();
            const s2 = new CultivationDreamParallelLives();
            expect(s2.fromJSON(json).success).toBe(true);
        });
        it('should handle empty fromJSON', () => {
            const s2 = new CultivationDreamParallelLives();
            expect(s2.fromJSON({}).success).toBe(true);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.enterParallelLife('d', 'martial');
            const stats = system.getStats();
            expect(stats.totalEntered).toBe(1);
            expect(stats.lifeCount).toBe(1);
        });
    });
});
