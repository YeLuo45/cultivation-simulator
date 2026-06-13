/**
 * IncenseCrafting.test.js - 香火制作测试
 * V506 Iteration 8/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { IncenseCrafting } from '../../../systems/ai/IncenseCrafting.js';

describe('IncenseCrafting', () => {
    let system;
    beforeEach(() => { system = new IncenseCrafting(); });

    describe('craftIncense', () => {
        it('should create', () => {
            const { incense } = system.craftIncense({ crafterId: 'c1' });
            expect(incense.crafterId).toBe('c1');
        });

        it('should default type to calming', () => {
            const { incense } = system.craftIncense({});
            expect(incense.type).toBe('calming');
        });

        it('should accept different types', () => {
            const { incense } = system.craftIncense({ type: 'awakening' });
            expect(incense.type).toBe('awakening');
        });

        it('should trigger incenseCrafted hook', () => {
            let called = false;
            system.registerHook('incenseCrafted', () => { called = true; });
            system.craftIncense({});
            expect(called).toBe(true);
        });
    });

    describe('getIncense', () => {
        it('should return', () => {
            const { incense } = system.craftIncense({});
            expect(system.getIncense(incense.incenseId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getIncense('ghost')).toBeNull(); });
    });

    describe('listIncenses', () => {
        it('should list all', () => {
            system.craftIncense({});
            expect(system.listIncenses().length).toBe(1);
        });
    });

    describe('listByCrafter', () => {
        it('should filter', () => {
            system.craftIncense({ crafterId: 'c1' });
            system.craftIncense({ crafterId: 'c2' });
            expect(system.listByCrafter('c1').length).toBe(1);
        });
    });

    describe('listActive', () => {
        it('should filter lit', () => {
            const { incense: a } = system.craftIncense({ status: 'lit' });
            system.craftIncense({ status: 'extinguished' });
            expect(system.listActive().length).toBe(1);
        });
    });

    describe('addWood', () => {
        it('should add wood', () => {
            const { incense } = system.craftIncense({});
            system.addWood(incense.incenseId, 'sandalwood');
            expect(incense.woods.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addWood('ghost', 'sandalwood');
            expect(result.error).toBe('INCENSE_NOT_FOUND');
        });

        it('should trigger woodAdded hook', () => {
            const { incense } = system.craftIncense({});
            let called = false;
            system.registerHook('woodAdded', () => { called = true; });
            system.addWood(incense.incenseId, 'cedar');
            expect(called).toBe(true);
        });
    });

    describe('enrichFragrance', () => {
        it('should enrich', () => {
            const { incense } = system.craftIncense({});
            system.enrichFragrance(incense.incenseId, 10);
            expect(incense.fragrance).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.enrichFragrance('ghost', 5);
            expect(result.error).toBe('INCENSE_NOT_FOUND');
        });

        it('should trigger fragranceEnriched hook', () => {
            const { incense } = system.craftIncense({});
            let called = false;
            system.registerHook('fragranceEnriched', () => { called = true; });
            system.enrichFragrance(incense.incenseId, 5);
            expect(called).toBe(true);
        });
    });

    describe('lightIncense', () => {
        it('should light', () => {
            const { incense } = system.craftIncense({ status: 'extinguished' });
            system.lightIncense(incense.incenseId);
            expect(incense.status).toBe('lit');
        });

        it('should reject missing', () => {
            const result = system.lightIncense('ghost');
            expect(result.error).toBe('INCENSE_NOT_FOUND');
        });

        it('should trigger incenseLit hook', () => {
            const { incense } = system.craftIncense({});
            let called = false;
            system.registerHook('incenseLit', () => { called = true; });
            system.lightIncense(incense.incenseId);
            expect(called).toBe(true);
        });
    });

    describe('extinguishIncense', () => {
        it('should extinguish', () => {
            const { incense } = system.craftIncense({ status: 'lit' });
            system.extinguishIncense(incense.incenseId);
            expect(incense.status).toBe('extinguished');
        });

        it('should reject missing', () => {
            const result = system.extinguishIncense('ghost');
            expect(result.error).toBe('INCENSE_NOT_FOUND');
        });

        it('should trigger incenseExtinguished hook', () => {
            const { incense } = system.craftIncense({ status: 'lit' });
            let called = false;
            system.registerHook('incenseExtinguished', () => { called = true; });
            system.extinguishIncense(incense.incenseId);
            expect(called).toBe(true);
        });
    });

    describe('calculateIncenseAroma', () => {
        it('should calculate', () => {
            const { incense } = system.craftIncense({});
            incense.woods = ['sandalwood', 'cedar'];
            expect(system.calculateIncenseAroma(incense.incenseId)).toBe(20 * 5 + 2 * 10);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateIncenseAroma('ghost')).toBe(0);
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

        it('should execute default getIncense', () => {
            const result = system.executeTool('getIncense', { incenseId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('incenseCrafted', () => count++);
            unregister();
            system.craftIncense({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('incenseCrafted', () => { throw new Error('x'); });
            expect(() => system.craftIncense({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalIncenses = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalIncenses = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.craftIncense({});
            const json = system.toJSON();
            expect(json.incenses.length).toBe(1);
        });
        it('should deserialize', () => {
            system.craftIncense({});
            const json = system.toJSON();
            const newSys = new IncenseCrafting();
            newSys.fromJSON(json);
            expect(newSys.incenses.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.incenseCount).toBe(0);
        });
    });
});
