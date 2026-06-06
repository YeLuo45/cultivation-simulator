/**
 * DaoComprehension.test.js - 道悟测试
 * V421 Iteration 13/15 Round 14 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DaoComprehension } from '../../../systems/ai/DaoComprehension.js';

describe('DaoComprehension', () => {
    let system;
    beforeEach(() => { system = new DaoComprehension(); });

    describe('beginComprehension', () => {
        it('should begin', () => {
            const { comprehension } = system.beginComprehension({ cultivatorId: 'c1', dao: 'sword' });
            expect(comprehension.cultivatorId).toBe('c1');
            expect(comprehension.dao).toBe('sword');
        });

        it('should default dao', () => {
            const { comprehension } = system.beginComprehension({ cultivatorId: 'c1' });
            expect(comprehension.dao).toBe('unknown');
        });

        it('should default level to baseLevel', () => {
            const { comprehension } = system.beginComprehension({ cultivatorId: 'c1' });
            expect(comprehension.level).toBe(1);
        });

        it('should default insights to 0', () => {
            const { comprehension } = system.beginComprehension({ cultivatorId: 'c1' });
            expect(comprehension.insights).toBe(0);
        });

        it('should default fragments to empty', () => {
            const { comprehension } = system.beginComprehension({ cultivatorId: 'c1' });
            expect(comprehension.fragments).toEqual([]);
        });

        it('should default status to developing', () => {
            const { comprehension } = system.beginComprehension({ cultivatorId: 'c1' });
            expect(comprehension.status).toBe('developing');
        });

        it('should increment totalComprehensions', () => {
            system.beginComprehension({ cultivatorId: 'c1' });
            expect(system.stats.totalComprehensions).toBe(1);
        });

        it('should trigger comprehensionBegun hook', () => {
            let called = false;
            system.registerHook('comprehensionBegun', () => { called = true; });
            system.beginComprehension({ cultivatorId: 'c1' });
            expect(called).toBe(true);
        });
    });

    describe('getComprehension', () => {
        it('should return', () => {
            const { comprehension } = system.beginComprehension({ cultivatorId: 'c1' });
            expect(system.getComprehension(comprehension.comprehensionId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getComprehension('ghost')).toBeNull(); });
    });

    describe('listComprehensions', () => {
        it('should list all', () => {
            system.beginComprehension({ cultivatorId: 'c1' });
            system.beginComprehension({ cultivatorId: 'c2' });
            expect(system.listComprehensions().length).toBe(2);
        });

        it('should return empty list initially', () => {
            expect(system.listComprehensions()).toEqual([]);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.beginComprehension({ cultivatorId: 'c1' });
            system.beginComprehension({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });

        it('should return empty for unknown cultivator', () => {
            system.beginComprehension({ cultivatorId: 'c1' });
            expect(system.listByCultivator('ghost')).toEqual([]);
        });
    });

    describe('listByDao', () => {
        it('should filter by dao', () => {
            system.beginComprehension({ cultivatorId: 'c1', dao: 'sword' });
            system.beginComprehension({ cultivatorId: 'c2', dao: 'fire' });
            expect(system.listByDao('sword').length).toBe(1);
        });

        it('should return empty for unknown dao', () => {
            system.beginComprehension({ cultivatorId: 'c1', dao: 'sword' });
            expect(system.listByDao('ghost')).toEqual([]);
        });
    });

    describe('gainInsight', () => {
        it('should increase insights by default amount', () => {
            const { comprehension } = system.beginComprehension({ cultivatorId: 'c1' });
            system.gainInsight(comprehension.comprehensionId);
            expect(comprehension.insights).toBe(5);
        });

        it('should increase insights by custom amount', () => {
            const { comprehension } = system.beginComprehension({ cultivatorId: 'c1' });
            system.gainInsight(comprehension.comprehensionId, 15);
            expect(comprehension.insights).toBe(15);
        });

        it('should reject missing', () => {
            const result = system.gainInsight('ghost', 10);
            expect(result.error).toBe('COMPREHENSION_NOT_FOUND');
        });

        it('should trigger insightGained hook', () => {
            const { comprehension } = system.beginComprehension({ cultivatorId: 'c1' });
            let called = false;
            system.registerHook('insightGained', () => { called = true; });
            system.gainInsight(comprehension.comprehensionId, 10);
            expect(called).toBe(true);
        });
    });

    describe('collectFragment', () => {
        it('should add fragment', () => {
            const { comprehension } = system.beginComprehension({ cultivatorId: 'c1' });
            system.collectFragment(comprehension.comprehensionId, 'sword-fragment-1');
            expect(comprehension.fragments).toContain('sword-fragment-1');
        });

        it('should add multiple fragments', () => {
            const { comprehension } = system.beginComprehension({ cultivatorId: 'c1' });
            system.collectFragment(comprehension.comprehensionId, 'f1');
            system.collectFragment(comprehension.comprehensionId, 'f2');
            expect(comprehension.fragments.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.collectFragment('ghost', 'f1');
            expect(result.error).toBe('COMPREHENSION_NOT_FOUND');
        });

        it('should trigger fragmentCollected hook', () => {
            const { comprehension } = system.beginComprehension({ cultivatorId: 'c1' });
            let called = false;
            system.registerHook('fragmentCollected', () => { called = true; });
            system.collectFragment(comprehension.comprehensionId, 'f1');
            expect(called).toBe(true);
        });
    });

    describe('awakenDao', () => {
        it('should set status to awakened when insights >= 10', () => {
            const { comprehension } = system.beginComprehension({ cultivatorId: 'c1' });
            system.gainInsight(comprehension.comprehensionId, 10);
            system.awakenDao(comprehension.comprehensionId);
            expect(comprehension.status).toBe('awakened');
        });

        it('should reject when insights < 10', () => {
            const { comprehension } = system.beginComprehension({ cultivatorId: 'c1' });
            const result = system.awakenDao(comprehension.comprehensionId);
            expect(result.error).toBe('INSUFFICIENT_INSIGHTS');
        });

        it('should reject missing', () => {
            const result = system.awakenDao('ghost');
            expect(result.error).toBe('COMPREHENSION_NOT_FOUND');
        });

        it('should trigger daoAwakened hook', () => {
            const { comprehension } = system.beginComprehension({ cultivatorId: 'c1' });
            system.gainInsight(comprehension.comprehensionId, 10);
            let called = false;
            system.registerHook('daoAwakened', () => { called = true; });
            system.awakenDao(comprehension.comprehensionId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDaoProgress', () => {
        it('should calculate', () => {
            const { comprehension } = system.beginComprehension({ cultivatorId: 'c1', level: 2 });
            system.gainInsight(comprehension.comprehensionId, 10);
            system.collectFragment(comprehension.comprehensionId, 'f1');
            // 2 * 10 + 10 + 1 * 3 = 33
            expect(system.calculateDaoProgress(comprehension.comprehensionId)).toBe(33);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDaoProgress('ghost')).toBe(0);
        });
    });

    describe('listMastered', () => {
        it('should filter mastered', () => {
            const { comprehension: c1 } = system.beginComprehension({ cultivatorId: 'c1', status: 'mastered' });
            const { comprehension: c2 } = system.beginComprehension({ cultivatorId: 'c2', status: 'developing' });
            expect(system.listMastered().length).toBe(1);
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

        it('should execute default getComprehension', () => {
            const result = system.executeTool('getComprehension', { comprehensionId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('comprehensionBegun', () => count++);
            unregister();
            system.beginComprehension({ cultivatorId: 'c1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('comprehensionBegun', () => { throw new Error('x'); });
            expect(() => system.beginComprehension({ cultivatorId: 'c1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalComprehensions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalComprehensions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.beginComprehension({ cultivatorId: 'c1' });
            const json = system.toJSON();
            expect(json.comprehensions.length).toBe(1);
        });
        it('should deserialize', () => {
            system.beginComprehension({ cultivatorId: 'c1' });
            const json = system.toJSON();
            const newSys = new DaoComprehension();
            newSys.fromJSON(json);
            expect(newSys.comprehensions.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.comprehensionCount).toBe(0);
        });
    });
});
