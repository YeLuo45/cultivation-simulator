/**
 * InsightSystem.test.js - 修炼感悟系统测试
 * V341 Iteration 2/9 Round 7 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InsightSystem } from '../../../systems/ai/InsightSystem.js';

describe('InsightSystem', () => {
    let system;
    beforeEach(() => { system = new InsightSystem(); });

    describe('registerCultivator', () => {
        it('should register', () => {
            const { cultivator } = system.registerCultivator({ name: 'C1' });
            expect(cultivator.name).toBe('C1');
        });

        it('should start at level 1', () => {
            const { cultivator } = system.registerCultivator({});
            expect(cultivator.insightLevel).toBe(1);
        });
    });

    describe('getCultivator', () => {
        it('should return', () => {
            const { cultivator } = system.registerCultivator({});
            expect(system.getCultivator(cultivator.cultivatorId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCultivator('ghost')).toBeNull(); });
    });

    describe('listCultivators', () => {
        it('should list all', () => {
            system.registerCultivator({});
            expect(system.listCultivators().length).toBe(1);
        });
    });

    describe('gainInsight', () => {
        it('should gain', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.gainInsight(cultivator.cultivatorId, 'sword', 1);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.gainInsight('ghost', 'topic', 1);
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should increase insightExp', () => {
            const { cultivator } = system.registerCultivator({});
            system.gainInsight(cultivator.cultivatorId, 'topic', 1);
            expect(cultivator.insightExp).toBeGreaterThan(0);
        });

        it('should scale with quality', () => {
            const sys = new InsightSystem();
            const { cultivator: c1 } = sys.registerCultivator({});
            const { cultivator: c2 } = sys.registerCultivator({});
            sys.gainInsight(c1.cultivatorId, 'topic', 1);
            sys.gainInsight(c2.cultivatorId, 'topic', 3);
            expect(c2.insightExp).toBeGreaterThan(c1.insightExp);
        });

        it('should level up at threshold', () => {
            const { cultivator } = system.registerCultivator({});
            system.gainInsight(cultivator.cultivatorId, 'topic', 50);
            expect(cultivator.insightLevel).toBeGreaterThan(1);
        });

        it('should trigger insightLevelUp hook on level up', () => {
            const { cultivator } = system.registerCultivator({});
            let called = false;
            system.registerHook('insightLevelUp', () => { called = true; });
            system.gainInsight(cultivator.cultivatorId, 'topic', 50);
            expect(called).toBe(true);
        });

        it('should trigger insightGained hook', () => {
            const { cultivator } = system.registerCultivator({});
            let called = false;
            system.registerHook('insightGained', () => { called = true; });
            system.gainInsight(cultivator.cultivatorId, 'topic', 1);
            expect(called).toBe(true);
        });
    });

    describe('getInsight', () => {
        it('should return', () => {
            const { cultivator } = system.registerCultivator({});
            const { insight } = system.gainInsight(cultivator.cultivatorId, 'topic', 1);
            expect(system.getInsight(insight.insightId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getInsight('ghost')).toBeNull(); });
    });

    describe('listInsights', () => {
        it('should filter by cultivator', () => {
            const { cultivator: c1 } = system.registerCultivator({});
            const { cultivator: c2 } = system.registerCultivator({});
            system.gainInsight(c1.cultivatorId, 'topic', 1);
            system.gainInsight(c2.cultivatorId, 'topic', 1);
            expect(system.listInsights(c1.cultivatorId).length).toBe(1);
        });
    });

    describe('listByQuality', () => {
        it('should filter', () => {
            const { cultivator } = system.registerCultivator({});
            system.gainInsight(cultivator.cultivatorId, 'topic', 1);
            system.gainInsight(cultivator.cultivatorId, 'topic', 3);
            expect(system.listByQuality(2).length).toBe(1);
        });
    });

    describe('startMeditation', () => {
        it('should start', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.startMeditation(cultivator.cultivatorId, 30);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.startMeditation('ghost', 30);
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should trigger meditationStarted hook', () => {
            const { cultivator } = system.registerCultivator({});
            let called = false;
            system.registerHook('meditationStarted', () => { called = true; });
            system.startMeditation(cultivator.cultivatorId, 30);
            expect(called).toBe(true);
        });
    });

    describe('completeMeditation', () => {
        it('should complete', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startMeditation(cultivator.cultivatorId, 60);
            const result = system.completeMeditation(session.sessionId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.completeMeditation('ghost');
            expect(result.error).toBe('SESSION_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startMeditation(cultivator.cultivatorId, 30);
            session.status = 'completed';
            const result = system.completeMeditation(session.sessionId);
            expect(result.error).toBe('SESSION_INACTIVE');
        });

        it('should trigger meditationCompleted hook', () => {
            const { cultivator } = system.registerCultivator({});
            const { session } = system.startMeditation(cultivator.cultivatorId, 60);
            let called = false;
            system.registerHook('meditationCompleted', () => { called = true; });
            system.completeMeditation(session.sessionId);
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

        it('should execute default getCultivator', () => {
            const result = system.executeTool('getCultivator', { cultivatorId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('insightGained', () => count++);
            unregister();
            const { cultivator } = system.registerCultivator({});
            system.gainInsight(cultivator.cultivatorId, 'topic', 1);
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('insightGained', () => { throw new Error('x'); });
            const { cultivator } = system.registerCultivator({});
            expect(() => system.gainInsight(cultivator.cultivatorId, 'topic', 1)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalInsights = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalInsights = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerCultivator({});
            const json = system.toJSON();
            expect(json.cultivators.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerCultivator({});
            const json = system.toJSON();
            const newSys = new InsightSystem();
            newSys.fromJSON(json);
            expect(newSys.cultivators.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.cultivatorCount).toBe(0);
        });
    });
});