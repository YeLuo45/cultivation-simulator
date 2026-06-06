/**
 * SectReputation.test.js - 宗门名声系统测试
 * V493 Iteration 10/15 Round 19 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectReputation } from '../../../systems/ai/SectReputation.js';

describe('SectReputation', () => {
    let system;
    beforeEach(() => { system = new SectReputation(); });

    describe('constructor', () => {
        it('should initialize with defaults', () => {
            expect(system.config.maxReputations).toBe(100);
            expect(system.config.baseScore).toBe(0);
        });

        it('should accept custom config', () => {
            const s = new SectReputation({ maxReputations: 50, baseScore: 100 });
            expect(s.config.maxReputations).toBe(50);
            expect(s.config.baseScore).toBe(100);
        });
    });

    describe('buildReputation', () => {
        it('should build', () => {
            const { reputation } = system.buildReputation({ sectId: 's1' });
            expect(reputation.sectId).toBe('s1');
        });

        it('should set defaults', () => {
            const { reputation } = system.buildReputation({ sectId: 's1' });
            expect(reputation.score).toBe(0);
            expect(reputation.deeds).toEqual([]);
            expect(reputation.scandals).toEqual([]);
            expect(reputation.status).toBe('stable');
        });

        it('should accept custom score', () => {
            const { reputation } = system.buildReputation({ sectId: 's1', score: 500 });
            expect(reputation.score).toBe(500);
        });

        it('should trigger reputationBuilt hook', () => {
            let called = false;
            system.registerHook('reputationBuilt', () => { called = true; });
            system.buildReputation({});
            expect(called).toBe(true);
        });

        it('should increment totalReputations', () => {
            system.buildReputation({});
            expect(system.stats.totalReputations).toBe(1);
        });
    });

    describe('getReputation', () => {
        it('should return', () => {
            const { reputation } = system.buildReputation({});
            expect(system.getReputation(reputation.reputationId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getReputation('ghost')).toBeNull(); });
    });

    describe('listReputations', () => {
        it('should list all', () => {
            system.buildReputation({});
            system.buildReputation({});
            expect(system.listReputations().length).toBe(2);
        });

        it('should return empty array when none', () => {
            expect(system.listReputations()).toEqual([]);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.buildReputation({ sectId: 's1' });
            system.buildReputation({ sectId: 's2' });
            system.buildReputation({ sectId: 's1' });
            expect(system.listBySect('s1').length).toBe(2);
        });

        it('should return empty for unknown sect', () => {
            system.buildReputation({ sectId: 's1' });
            expect(system.listBySect('s9')).toEqual([]);
        });
    });

    describe('listRising', () => {
        it('should filter rising', () => {
            const r1 = system.buildReputation({ sectId: 's1' }).reputation;
            system.buildReputation({ sectId: 's2' });
            system.raiseScore(r1.reputationId);
            expect(system.listRising().length).toBe(1);
        });

        it('should return empty when none rising', () => {
            system.buildReputation({});
            expect(system.listRising()).toEqual([]);
        });
    });

    describe('addDeed', () => {
        it('should add deed', () => {
            const { reputation } = system.buildReputation({});
            system.addDeed(reputation.reputationId, 'saved-village');
            expect(reputation.deeds).toContain('saved-village');
        });

        it('should support multiple deeds', () => {
            const { reputation } = system.buildReputation({});
            system.addDeed(reputation.reputationId, 'd1');
            system.addDeed(reputation.reputationId, 'd2');
            expect(reputation.deeds.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addDeed('ghost', 'x');
            expect(result.error).toBe('REPUTATION_NOT_FOUND');
        });

        it('should trigger deedAdded hook', () => {
            const { reputation } = system.buildReputation({});
            let called = false;
            system.registerHook('deedAdded', () => { called = true; });
            system.addDeed(reputation.reputationId, 'd1');
            expect(called).toBe(true);
        });
    });

    describe('addScandal', () => {
        it('should add scandal', () => {
            const { reputation } = system.buildReputation({});
            system.addScandal(reputation.reputationId, 'betrayed-ally');
            expect(reputation.scandals).toContain('betrayed-ally');
        });

        it('should support multiple scandals', () => {
            const { reputation } = system.buildReputation({});
            system.addScandal(reputation.reputationId, 's1');
            system.addScandal(reputation.reputationId, 's2');
            expect(reputation.scandals.length).toBe(2);
        });

        it('should set status to tarnished', () => {
            const { reputation } = system.buildReputation({});
            system.addScandal(reputation.reputationId, 's1');
            expect(reputation.status).toBe('tarnished');
        });

        it('should not override rising status', () => {
            const { reputation } = system.buildReputation({});
            system.raiseScore(reputation.reputationId);
            system.addScandal(reputation.reputationId, 's1');
            expect(reputation.status).toBe('rising');
        });

        it('should reject missing', () => {
            const result = system.addScandal('ghost', 'x');
            expect(result.error).toBe('REPUTATION_NOT_FOUND');
        });

        it('should trigger scandalAdded hook', () => {
            const { reputation } = system.buildReputation({});
            let called = false;
            system.registerHook('scandalAdded', () => { called = true; });
            system.addScandal(reputation.reputationId, 's1');
            expect(called).toBe(true);
        });
    });

    describe('raiseScore', () => {
        it('should raise score', () => {
            const { reputation } = system.buildReputation({});
            system.raiseScore(reputation.reputationId, 50);
            expect(reputation.score).toBe(50);
        });

        it('should use default amount', () => {
            const { reputation } = system.buildReputation({});
            system.raiseScore(reputation.reputationId);
            expect(reputation.score).toBe(10);
        });

        it('should set status to rising', () => {
            const { reputation } = system.buildReputation({});
            system.raiseScore(reputation.reputationId);
            expect(reputation.status).toBe('rising');
        });

        it('should not override tarnished status', () => {
            const { reputation } = system.buildReputation({});
            system.addScandal(reputation.reputationId, 's1');
            system.raiseScore(reputation.reputationId);
            expect(reputation.status).toBe('tarnished');
        });

        it('should reject missing', () => {
            const result = system.raiseScore('ghost', 10);
            expect(result.error).toBe('REPUTATION_NOT_FOUND');
        });

        it('should trigger reputationRaised hook', () => {
            const { reputation } = system.buildReputation({});
            let called = false;
            system.registerHook('reputationRaised', () => { called = true; });
            system.raiseScore(reputation.reputationId, 10);
            expect(called).toBe(true);
        });
    });

    describe('calculateReputationValue', () => {
        it('should calculate base value', () => {
            const { reputation } = system.buildReputation({});
            expect(system.calculateReputationValue(reputation.reputationId)).toBe(0);
        });

        it('should add deeds weight', () => {
            const { reputation } = system.buildReputation({});
            system.addDeed(reputation.reputationId, 'd1');
            system.addDeed(reputation.reputationId, 'd2');
            expect(system.calculateReputationValue(reputation.reputationId)).toBe(10);
        });

        it('should subtract scandals weight', () => {
            const { reputation } = system.buildReputation({});
            system.addScandal(reputation.reputationId, 's1');
            expect(system.calculateReputationValue(reputation.reputationId)).toBe(-10);
        });

        it('should combine deeds and scandals with score', () => {
            const { reputation } = system.buildReputation({ score: 100 });
            system.addDeed(reputation.reputationId, 'd1');
            system.addScandal(reputation.reputationId, 's1');
            expect(system.calculateReputationValue(reputation.reputationId)).toBe(95);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateReputationValue('ghost')).toBe(0);
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

        it('should handle tool errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should list default tools', () => {
            const tools = system.listTools();
            expect(tools).toContain('getReputation');
            expect(tools).toContain('buildReputation');
        });

        it('should execute default getReputation', () => {
            const result = system.executeTool('getReputation', { reputationId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('reputationBuilt', () => count++);
            unregister();
            system.buildReputation({});
            expect(count).toBe(0);
        });

        it('should handle hook errors silently', () => {
            system.registerHook('reputationBuilt', () => { throw new Error('x'); });
            expect(() => system.buildReputation({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalReputations = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(system.config.maxReputations).toBe(130);
        });
        it('should not double evolve', () => {
            system.stats.totalReputations = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.buildReputation({});
            const json = system.toJSON();
            expect(json.reputations.length).toBe(1);
            expect(json.stats.totalReputations).toBe(1);
        });
        it('should deserialize', () => {
            system.buildReputation({});
            const json = system.toJSON();
            const newSys = new SectReputation();
            newSys.fromJSON(json);
            expect(newSys.reputations.size).toBe(1);
        });

        it('should handle partial deserialize', () => {
            const newSys = new SectReputation();
            newSys.fromJSON({});
            expect(newSys.reputations.size).toBe(0);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.buildReputation({});
            const stats = system.getStats();
            expect(stats.reputationCount).toBe(1);
            expect(stats.totalReputations).toBe(1);
        });
    });
});
