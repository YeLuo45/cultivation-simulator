/**
 * CultivationDreamDaoInsight.test.js - 梦中悟道系统测试
 * V864 Iteration 7/30 Round 34 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    CultivationDreamDaoInsight,
    DAO_FRAGMENTS,
    INSIGHT_LEVELS,
    DAO_HEART_THRESHOLDS,
} from '../../../systems/ai/CultivationDreamDaoInsight.js';

describe('CultivationDreamDaoInsight', () => {
    let system;
    beforeEach(() => {
        system = new CultivationDreamDaoInsight();
    });

    describe('Constants', () => {
        it('should have 5 dao fragments', () => {
            expect(DAO_FRAGMENTS.length).toBe(5);
        });
        it('should have 10 insight levels', () => {
            expect(INSIGHT_LEVELS).toBe(10);
        });
        it('should have crystallize threshold 100', () => {
            expect(DAO_HEART_THRESHOLDS.CRYSTALLIZE).toBe(100);
        });
    });

    describe('awakenDao', () => {
        it('should awaken a dream', () => {
            const { daoInsight } = system.awakenDao('d1', 'fire');
            expect(daoInsight.dreamId).toBe('d1');
            expect(daoInsight.daoFragment).toBe('fire');
        });
        it('should default unknown fragment to water', () => {
            const { daoInsight } = system.awakenDao('d1', 'chaos');
            expect(daoInsight.daoFragment).toBe('water');
        });
        it('should default dreamId when null', () => {
            const { daoInsight } = system.awakenDao(null, 'fire');
            expect(daoInsight.dreamId).toBe('unknown_dream');
        });
        it('should initialize insightLevel 1 by default', () => {
            const { daoInsight } = system.awakenDao('d1', 'fire');
            expect(daoInsight.insightLevel).toBe(1);
        });
        it('should accept custom initial level', () => {
            const { daoInsight } = system.awakenDao('d1', 'fire', { initialLevel: 5 });
            expect(daoInsight.insightLevel).toBe(5);
        });
        it('should compute heartProgress from successRate', () => {
            const { daoInsight } = system.awakenDao('d1', 'fire', { successRate: 0.9, heartProgress: 9 });
            expect(daoInsight.daoHeartProgress).toBe(9);
        });
        it('should cap effective rate at 1', () => {
            const { daoInsight } = system.awakenDao('d1', 'fire', { successRate: 0.9, skillBonus: 0.5 });
            expect(daoInsight.successRate).toBe(1);
        });
        it('should trigger daoAwakened hook', () => {
            let called = false;
            system.registerHook('daoAwakened', () => { called = true; });
            system.awakenDao('d1', 'fire');
            expect(called).toBe(true);
        });
        it('should increment totalAwakenings', () => {
            system.awakenDao('d1', 'fire');
            expect(system.stats.totalAwakenings).toBe(1);
        });
    });

    describe('getDaoInsight', () => {
        it('should return', () => {
            const { daoInsight } = system.awakenDao('d1', 'fire');
            expect(system.getDaoInsight(daoInsight.id)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getDaoInsight('ghost')).toBeNull();
        });
    });

    describe('listDaoInsights', () => {
        it('should list all', () => {
            system.awakenDao('d1', 'fire');
            system.awakenDao('d2', 'water');
            expect(system.listDaoInsights().length).toBe(2);
        });
        it('should return empty initially', () => {
            expect(system.listDaoInsights().length).toBe(0);
        });
    });

    describe('listByDream', () => {
        it('should filter by dream', () => {
            system.awakenDao('d1', 'fire');
            system.awakenDao('d2', 'water');
            expect(system.listByDream('d1').length).toBe(1);
        });
    });

    describe('listByFragment', () => {
        it('should filter by fragment', () => {
            system.awakenDao('d1', 'fire');
            system.awakenDao('d2', 'water');
            expect(system.listByFragment('fire').length).toBe(1);
        });
    });

    describe('listCrystallized', () => {
        it('should return empty when none crystallized', () => {
            system.awakenDao('d1', 'fire', { heartProgress: 100 });
            expect(system.listCrystallized().length).toBe(0);
        });
        it('should return only crystallized', () => {
            const a = system.awakenDao('d1', 'fire', { heartProgress: 100 }).daoInsight;
            system.crystallizeDaoHeart('d1');
            expect(system.listCrystallized().length).toBe(1);
        });
    });

    describe('listTopHeart', () => {
        it('should return top N', () => {
            system.awakenDao('d1', 'fire', { heartProgress: 10 });
            system.awakenDao('d2', 'water', { heartProgress: 50 });
            const top = system.listTopHeart(1);
            expect(top.length).toBe(1);
            expect(top[0].daoHeartProgress).toBe(50);
        });
    });

    describe('integrateInsight', () => {
        it('should integrate', () => {
            system.awakenDao('d1', 'fire');
            const result = system.integrateInsight('d1', 2);
            expect(result.success).toBe(true);
            expect(result.insightLevel).toBe(3);
        });
        it('should reject when no active insight', () => {
            const result = system.integrateInsight('ghost', 1);
            expect(result.error).toBe('NO_ACTIVE_INSIGHT');
        });
        it('should cap at insightCap', () => {
            system.awakenDao('d1', 'fire', { initialLevel: 9 });
            const result = system.integrateInsight('d1', 5);
            expect(result.insightLevel).toBe(10);
        });
        it('should trigger insightIntegrated hook', () => {
            system.awakenDao('d1', 'fire');
            let called = false;
            system.registerHook('insightIntegrated', () => { called = true; });
            system.integrateInsight('d1', 1);
            expect(called).toBe(true);
        });
        it('should ignore crystallized insights', () => {
            const a = system.awakenDao('d1', 'fire', { heartProgress: 100 }).daoInsight;
            system.crystallizeDaoHeart('d1');
            const result = system.integrateInsight('d1', 1);
            expect(result.error).toBe('NO_ACTIVE_INSIGHT');
        });
    });

    describe('crystallizeDaoHeart', () => {
        it('should crystallize', () => {
            system.awakenDao('d1', 'fire', { heartProgress: 100 });
            const result = system.crystallizeDaoHeart('d1');
            expect(result.success).toBe(true);
            expect(result.crystallizedAt).toBeGreaterThan(0);
        });
        it('should reject when no active insight', () => {
            const result = system.crystallizeDaoHeart('ghost');
            expect(result.error).toBe('NO_ACTIVE_INSIGHT');
        });
        it('should reject insufficient heart progress', () => {
            system.awakenDao('d1', 'fire', { heartProgress: 10 });
            const result = system.crystallizeDaoHeart('d1');
            expect(result.error).toBe('INSUFFICIENT_HEART_PROGRESS');
        });
        it('should trigger daoHeartCrystallized hook', () => {
            system.awakenDao('d1', 'fire', { heartProgress: 100 });
            let called = false;
            system.registerHook('daoHeartCrystallized', () => { called = true; });
            system.crystallizeDaoHeart('d1');
            expect(called).toBe(true);
        });
        it('should increment totalCrystallizations', () => {
            system.awakenDao('d1', 'fire', { heartProgress: 100 });
            system.crystallizeDaoHeart('d1');
            expect(system.stats.totalCrystallizations).toBe(1);
        });
    });

    describe('calculateDaoPower', () => {
        it('should calculate base power', () => {
            const { daoInsight } = system.awakenDao('d1', 'fire', { initialLevel: 2, heartProgress: 10 });
            const power = system.calculateDaoPower(daoInsight.id);
            expect(power).toBe(2 * 50 + 10 * 2);
        });
        it('should add crystallized bonus', () => {
            const { daoInsight } = system.awakenDao('d1', 'fire', { initialLevel: 1, heartProgress: 100 });
            system.crystallizeDaoHeart('d1');
            const power = system.calculateDaoPower(daoInsight.id);
            // After crystallization, insightLevel is bumped to insightCap (10) by system
            expect(power).toBe(10 * 50 + 100 * 2 + 200);
        });
        it('should return 0 for missing', () => {
            expect(system.calculateDaoPower('ghost')).toBe(0);
        });
    });

    describe('mergeDaoInsights', () => {
        it('should merge same fragment', () => {
            const a = system.awakenDao('d1', 'fire', { initialLevel: 2, heartProgress: 10 }).daoInsight;
            const b = system.awakenDao('d2', 'fire', { initialLevel: 3, heartProgress: 20 }).daoInsight;
            const result = system.mergeDaoInsights(a.id, b.id);
            expect(result.success).toBe(true);
        });
        it('should reject missing', () => {
            const result = system.mergeDaoInsights('a', 'b');
            expect(result.error).toBe('INSIGHT_NOT_FOUND');
        });
        it('should reject different fragment', () => {
            const a = system.awakenDao('d1', 'fire').daoInsight;
            const b = system.awakenDao('d2', 'water').daoInsight;
            const result = system.mergeDaoInsights(a.id, b.id);
            expect(result.error).toBe('FRAGMENT_MISMATCH');
        });
        it('should trigger daoInsightsMerged hook', () => {
            const a = system.awakenDao('d1', 'fire').daoInsight;
            const b = system.awakenDao('d2', 'fire').daoInsight;
            let called = false;
            system.registerHook('daoInsightsMerged', () => { called = true; });
            system.mergeDaoInsights(a.id, b.id);
            expect(called).toBe(true);
        });
        it('should transfer crystallizedAt from b to a', () => {
            const a = system.awakenDao('d1', 'fire', { heartProgress: 100 }).daoInsight;
            const b = system.awakenDao('d2', 'fire', { heartProgress: 100 }).daoInsight;
            system.crystallizeDaoHeart('d2');
            const result = system.mergeDaoInsights(a.id, b.id);
            expect(result.success).toBe(true);
            expect(result.merged.crystallizedAt).not.toBeNull();
        });
    });

    describe('deleteDaoInsight', () => {
        it('should delete', () => {
            const { daoInsight } = system.awakenDao('d1', 'fire');
            const result = system.deleteDaoInsight(daoInsight.id);
            expect(result.success).toBe(true);
        });
        it('should reject missing', () => {
            const result = system.deleteDaoInsight('ghost');
            expect(result.error).toBe('INSIGHT_NOT_FOUND');
        });
        it('should trigger daoInsightDeleted hook', () => {
            const { daoInsight } = system.awakenDao('d1', 'fire');
            let called = false;
            system.registerHook('daoInsightDeleted', () => { called = true; });
            system.deleteDaoInsight(daoInsight.id);
            expect(called).toBe(true);
        });
    });

    describe('Tool System', () => {
        it('should register tool', () => {
            system.registerTool('t', () => 'ok');
            expect(system.listTools()).toContain('t');
        });
        it('should execute tool', () => {
            system.registerTool('t', (ctx) => ctx.value);
            const result = system.executeTool('t', { value: 42 });
            expect(result.result).toBe(42);
        });
        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });
        it('should handle tool errors', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('x');
        });
        it('should execute default getDaoInsight tool', () => {
            const { daoInsight } = system.awakenDao('d1', 'fire');
            const result = system.executeTool('getDaoInsight', { id: daoInsight.id });
            expect(result.result.id).toBe(daoInsight.id);
        });
        it('should execute default listByFragment tool', () => {
            system.awakenDao('d1', 'fire');
            const result = system.executeTool('listByFragment', { fragment: 'fire' });
            expect(result.result.length).toBe(1);
        });
        it('should default context to {} when missing', () => {
            system.registerTool('noCtx', (ctx) => ctx);
            const result = system.executeTool('noCtx');
            expect(result.success).toBe(true);
            expect(result.result).toEqual({});
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('daoAwakened', () => count++);
            unregister();
            system.awakenDao('d1', 'fire');
            expect(count).toBe(0);
        });
        it('should handle hook errors silently', () => {
            system.registerHook('daoAwakened', () => { throw new Error('x'); });
            expect(() => system.awakenDao('d1', 'fire')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalAwakenings = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalAwakenings = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.awakenDao('d1', 'fire');
            const json = system.toJSON();
            expect(json.daoInsights.length).toBe(1);
        });
        it('should deserialize', () => {
            system.awakenDao('d1', 'fire');
            const json = system.toJSON();
            const newSys = new CultivationDreamDaoInsight();
            newSys.fromJSON(json);
            expect(newSys.daoInsights.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.insightCount).toBe(0);
        });
        it('should include crystallized count', () => {
            system.awakenDao('d1', 'fire', { heartProgress: 100 });
            system.crystallizeDaoHeart('d1');
            const stats = system.getStats();
            expect(stats.crystallizedCount).toBe(1);
        });
    });
});
