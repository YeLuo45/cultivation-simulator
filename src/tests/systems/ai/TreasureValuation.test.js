/**
 * TreasureValuation.test.js - 宝物评估系统测试
 * V338 Iteration 8/9 Round 6 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreasureValuation } from '../../../systems/ai/TreasureValuation.js';

describe('TreasureValuation', () => {
    let system;
    beforeEach(() => { system = new TreasureValuation(); });

    describe('appraise', () => {
        it('should appraise', () => {
            const { appraisal } = system.appraise({});
            expect(appraisal).toBeDefined();
        });

        it('should calculate mythic value', () => {
            const { appraisal } = system.appraise({ baseValue: 100, rarity: 'mythic' });
            expect(appraisal.value).toBe(1000);
        });

        it('should calculate legendary value', () => {
            const { appraisal } = system.appraise({ baseValue: 100, rarity: 'legendary' });
            expect(appraisal.value).toBe(500);
        });

        it('should apply condition', () => {
            const { appraisal } = system.appraise({ baseValue: 100, condition: 50 });
            expect(appraisal.value).toBe(50);
        });

        it('should trigger appraisalCompleted hook', () => {
            let called = false;
            system.registerHook('appraisalCompleted', () => { called = true; });
            system.appraise({});
            expect(called).toBe(true);
        });
    });

    describe('getAppraisal', () => {
        it('should return', () => {
            const { appraisal } = system.appraise({});
            expect(system.getAppraisal(appraisal.id)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getAppraisal('ghost')).toBeNull(); });
    });

    describe('listAppraisals', () => {
        it('should list all', () => {
            system.appraise({});
            expect(system.listAppraisals().length).toBe(1);
        });
    });

    describe('createValuation', () => {
        it('should create', () => {
            const { valuation } = system.createValuation('i1', {});
            expect(valuation.itemId).toBe('i1');
        });

        it('should trigger valuationCreated hook', () => {
            let called = false;
            system.registerHook('valuationCreated', () => { called = true; });
            system.createValuation('i1', {});
            expect(called).toBe(true);
        });
    });

    describe('getValuation', () => {
        it('should return', () => {
            const { valuation } = system.createValuation('i1', {});
            expect(system.getValuation(valuation.valuationId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getValuation('ghost')).toBeNull(); });
    });

    describe('listValuations', () => {
        it('should list all', () => {
            system.createValuation('i1', {});
            expect(system.listValuations().length).toBe(1);
        });
    });

    describe('listByItem', () => {
        it('should filter', () => {
            system.createValuation('i1', {});
            system.createValuation('i2', {});
            expect(system.listByItem('i1').length).toBe(1);
        });
    });

    describe('updateValuation', () => {
        it('should update', () => {
            const { valuation } = system.createValuation('i1', { estimatedValue: 100 });
            system.updateValuation(valuation.valuationId, { estimatedValue: 200 });
            expect(valuation.estimatedValue).toBe(200);
        });

        it('should reject missing', () => {
            const result = system.updateValuation('ghost', {});
            expect(result.error).toBe('VALUATION_NOT_FOUND');
        });

        it('should trigger valuationUpdated hook', () => {
            const { valuation } = system.createValuation('i1', {});
            let called = false;
            system.registerHook('valuationUpdated', () => { called = true; });
            system.updateValuation(valuation.valuationId, {});
            expect(called).toBe(true);
        });
    });

    describe('calculateInsurance', () => {
        it('should calculate 5%', () => {
            const { valuation } = system.createValuation('i1', { estimatedValue: 1000 });
            expect(system.calculateInsurance(valuation.valuationId)).toBe(50);
        });

        it('should return null for missing', () => {
            expect(system.calculateInsurance('ghost')).toBeNull();
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

        it('should execute default getValuation', () => {
            const result = system.executeTool('getValuation', { valuationId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('valuationCreated', () => count++);
            unregister();
            system.createValuation('i1', {});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('valuationCreated', () => { throw new Error('x'); });
            expect(() => system.createValuation('i1', {})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalValuations = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalValuations = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createValuation('i1', {});
            const json = system.toJSON();
            expect(json.valuations.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createValuation('i1', {});
            const json = system.toJSON();
            const newSys = new TreasureValuation();
            newSys.fromJSON(json);
            expect(newSys.valuations.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.valuationCount).toBe(0);
        });
    });
});