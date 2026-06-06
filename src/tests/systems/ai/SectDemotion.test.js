/**
 * SectDemotion.test.js - 宗门降级系统测试
 * V492 Iteration 9/15 Round 19 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectDemotion } from '../../../systems/ai/SectDemotion.js';

describe('SectDemotion', () => {
    let system;
    beforeEach(() => { system = new SectDemotion(); });

    describe('recordDemotion', () => {
        it('should record demotion', () => {
            const { demotion } = system.recordDemotion({ sectId: 's1', member: 'm1', fromRank: 'elder', toRank: 'disciple' });
            expect(demotion.sectId).toBe('s1');
            expect(demotion.member).toBe('m1');
            expect(demotion.fromRank).toBe('elder');
            expect(demotion.toRank).toBe('disciple');
        });

        it('should default reason to baseReason when not provided', () => {
            const { demotion } = system.recordDemotion({});
            expect(demotion.reason).toEqual(['unspecified']);
        });

        it('should accept reason as string and wrap to array', () => {
            const { demotion } = system.recordDemotion({ reason: 'misconduct' });
            expect(demotion.reason).toEqual(['misconduct']);
        });

        it('should accept reason as array', () => {
            const { demotion } = system.recordDemotion({ reason: ['a', 'b'] });
            expect(demotion.reason).toEqual(['a', 'b']);
        });

        it('should set status to pending', () => {
            const { demotion } = system.recordDemotion({});
            expect(demotion.status).toBe('pending');
        });

        it('should accept custom demotionId', () => {
            const { demotion } = system.recordDemotion({ demotionId: 'dmt_custom_1' });
            expect(demotion.demotionId).toBe('dmt_custom_1');
        });

        it('should accept custom id', () => {
            const { demotion } = system.recordDemotion({ id: 'dmt_custom_2' });
            expect(demotion.demotionId).toBe('dmt_custom_2');
        });

        it('should trigger demotionRecorded hook', () => {
            let called = false;
            system.registerHook('demotionRecorded', () => { called = true; });
            system.recordDemotion({});
            expect(called).toBe(true);
        });

        it('should increment totalDemotions', () => {
            system.recordDemotion({});
            system.recordDemotion({});
            expect(system.stats.totalDemotions).toBe(2);
        });

        it('should return success', () => {
            const result = system.recordDemotion({});
            expect(result.success).toBe(true);
        });
    });

    describe('getDemotion', () => {
        it('should return demotion', () => {
            const { demotion } = system.recordDemotion({});
            expect(system.getDemotion(demotion.demotionId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getDemotion('ghost')).toBeNull();
        });

        it('should return a copy of reason array', () => {
            const { demotion } = system.recordDemotion({ reason: 'a' });
            const result = system.getDemotion(demotion.demotionId);
            result.reason.push('mutated');
            const fresh = system.getDemotion(demotion.demotionId);
            expect(fresh.reason).toEqual(['a']);
        });
    });

    describe('listDemotions', () => {
        it('should list all', () => {
            system.recordDemotion({});
            system.recordDemotion({});
            expect(system.listDemotions().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listDemotions().length).toBe(0);
        });

        it('should return copies of reason arrays', () => {
            system.recordDemotion({ reason: 'a' });
            const list = system.listDemotions();
            list[0].reason.push('mutated');
            const fresh = system.listDemotions();
            expect(fresh[0].reason).toEqual(['a']);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.recordDemotion({ sectId: 's1' });
            system.recordDemotion({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });

        it('should return empty for unknown sect', () => {
            system.recordDemotion({});
            expect(system.listBySect('ghost').length).toBe(0);
        });

        it('should return multiple matches for same sect', () => {
            system.recordDemotion({ sectId: 's1' });
            system.recordDemotion({ sectId: 's1' });
            system.recordDemotion({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(2);
        });
    });

    describe('listExecuted', () => {
        it('should filter executed', () => {
            const { demotion } = system.recordDemotion({});
            system.recordDemotion({});
            system.executeDemotion(demotion.demotionId);
            expect(system.listExecuted().length).toBe(1);
        });

        it('should return empty when none executed', () => {
            system.recordDemotion({});
            expect(system.listExecuted().length).toBe(0);
        });

        it('should not include overturned', () => {
            const { demotion } = system.recordDemotion({});
            system.overturnDemotion(demotion.demotionId);
            expect(system.listExecuted().length).toBe(0);
        });
    });

    describe('addReason', () => {
        it('should add reason to existing array', () => {
            const { demotion } = system.recordDemotion({ reason: 'a' });
            system.addReason(demotion.demotionId, 'b');
            expect(demotion.reason).toEqual(['a', 'b']);
        });

        it('should add to base reason when default', () => {
            const { demotion } = system.recordDemotion({});
            system.addReason(demotion.demotionId, 'evidence_found');
            expect(demotion.reason).toEqual(['unspecified', 'evidence_found']);
        });

        it('should reject missing', () => {
            const result = system.addReason('ghost', 'whatever');
            expect(result.error).toBe('DEMOTION_NOT_FOUND');
        });

        it('should trigger reasonAdded hook', () => {
            const { demotion } = system.recordDemotion({});
            let called = false;
            system.registerHook('reasonAdded', () => { called = true; });
            system.addReason(demotion.demotionId, 'new');
            expect(called).toBe(true);
        });

        it('should return success on valid', () => {
            const { demotion } = system.recordDemotion({});
            const result = system.addReason(demotion.demotionId, 'new');
            expect(result.success).toBe(true);
        });
    });

    describe('executeDemotion', () => {
        it('should set status to executed', () => {
            const { demotion } = system.recordDemotion({});
            system.executeDemotion(demotion.demotionId);
            expect(demotion.status).toBe('executed');
        });

        it('should reject missing', () => {
            const result = system.executeDemotion('ghost');
            expect(result.error).toBe('DEMOTION_NOT_FOUND');
        });

        it('should trigger demotionExecuted hook', () => {
            const { demotion } = system.recordDemotion({});
            let called = false;
            system.registerHook('demotionExecuted', () => { called = true; });
            system.executeDemotion(demotion.demotionId);
            expect(called).toBe(true);
        });
    });

    describe('overturnDemotion', () => {
        it('should set status to overturned', () => {
            const { demotion } = system.recordDemotion({});
            system.overturnDemotion(demotion.demotionId);
            expect(demotion.status).toBe('overturned');
        });

        it('should reject missing', () => {
            const result = system.overturnDemotion('ghost');
            expect(result.error).toBe('DEMOTION_NOT_FOUND');
        });

        it('should trigger demotionOverturned hook', () => {
            const { demotion } = system.recordDemotion({});
            let called = false;
            system.registerHook('demotionOverturned', () => { called = true; });
            system.overturnDemotion(demotion.demotionId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDemotionSeverity', () => {
        it('should calculate for default reason', () => {
            const { demotion } = system.recordDemotion({ toRank: 'disciple' });
            // reason.length=1 (unspecified) * 5 + toRank.length('disciple'.length=8) = 5 + 8 = 13
            expect(system.calculateDemotionSeverity(demotion.demotionId)).toBe(13);
        });

        it('should increase severity with added reasons', () => {
            const { demotion } = system.recordDemotion({ toRank: 'disciple' });
            system.addReason(demotion.demotionId, 'evidence_a');
            system.addReason(demotion.demotionId, 'evidence_b');
            // 3 reasons * 5 + 8 = 23
            expect(system.calculateDemotionSeverity(demotion.demotionId)).toBe(23);
        });

        it('should factor in toRank length', () => {
            const { demotion } = system.recordDemotion({ toRank: 'outer' });
            // 1 * 5 + 5 = 10
            expect(system.calculateDemotionSeverity(demotion.demotionId)).toBe(10);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDemotionSeverity('ghost')).toBe(0);
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

        it('should execute default getDemotion', () => {
            const result = system.executeTool('getDemotion', { demotionId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recordDemotion tool', () => {
            const result = system.executeTool('recordDemotion', { sectId: 's1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('demotionRecorded', () => count++);
            unregister();
            system.recordDemotion({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('demotionRecorded', () => { throw new Error('x'); });
            expect(() => system.recordDemotion({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalDemotions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalDemotions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recordDemotion({});
            const json = system.toJSON();
            expect(json.demotions.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recordDemotion({});
            const json = system.toJSON();
            const newSys = new SectDemotion();
            newSys.fromJSON(json);
            expect(newSys.demotions.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.demotionCount).toBe(0);
        });

        it('should include demotionCount after record', () => {
            system.recordDemotion({});
            const stats = system.getStats();
            expect(stats.demotionCount).toBe(1);
        });
    });
});
