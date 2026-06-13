/**
 * SkyCultivation.test.js - 天空修炼测试
 * V468 Iteration 15/15 FINAL Round 17 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SkyCultivation } from '../../../systems/ai/SkyCultivation.js';

describe('SkyCultivation', () => {
    let system;
    beforeEach(() => { system = new SkyCultivation(); });

    describe('startCultivation', () => {
        it('should start', () => {
            const { cultivation } = system.startCultivation({ name: 'C1' });
            expect(cultivation.name).toBe('C1');
        });

        it('should set initial metrics', () => {
            const { cultivation } = system.startCultivation({});
            expect(system.getMetrics(cultivation.cultivationId)).not.toBeNull();
        });

        it('should trigger cultivationStarted hook', () => {
            let called = false;
            system.registerHook('cultivationStarted', () => { called = true; });
            system.startCultivation({});
            expect(called).toBe(true);
        });
    });

    describe('getCultivation', () => {
        it('should return', () => {
            const { cultivation } = system.startCultivation({});
            expect(system.getCultivation(cultivation.cultivationId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCultivation('ghost')).toBeNull(); });
    });

    describe('listCultivations', () => {
        it('should list all', () => {
            system.startCultivation({});
            expect(system.listCultivations().length).toBe(1);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.startCultivation({ cultivatorId: 'c1' });
            system.startCultivation({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listByStatus', () => {
        it('should filter', () => {
            system.startCultivation({});
            expect(system.listByStatus('ascending').length).toBe(1);
        });
    });

    describe('setMetrics', () => {
        it('should set', () => {
            const { cultivation } = system.startCultivation({});
            const result = system.setMetrics(cultivation.cultivationId, { clarity: 80 });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.setMetrics('ghost', {});
            expect(result.error).toBe('CULTIVATION_NOT_FOUND');
        });
    });

    describe('getMetrics', () => {
        it('should return', () => {
            const { cultivation } = system.startCultivation({});
            expect(system.getMetrics(cultivation.cultivationId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getMetrics('ghost')).toBeNull();
        });
    });

    describe('refreshCultivation', () => {
        it('should refresh', () => {
            const { cultivation } = system.startCultivation({});
            const result = system.refreshCultivation(cultivation.cultivationId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.refreshCultivation('ghost');
            expect(result.error).toBe('CULTIVATION_NOT_FOUND');
        });

        it('should trigger cultivationRefreshed hook', () => {
            const { cultivation } = system.startCultivation({});
            let called = false;
            system.registerHook('cultivationRefreshed', () => { called = true; });
            system.refreshCultivation(cultivation.cultivationId);
            expect(called).toBe(true);
        });
    });

    describe('ascendHigher', () => {
        it('should ascend', () => {
            const { cultivation } = system.startCultivation({});
            system.ascendHigher(cultivation.cultivationId, 500);
            expect(cultivation.altitude).toBe(1500);
        });

        it('should reject missing', () => {
            const result = system.ascendHigher('ghost', 100);
            expect(result.error).toBe('CULTIVATION_NOT_FOUND');
        });

        it('should trigger cultivationAscended hook', () => {
            const { cultivation } = system.startCultivation({});
            let called = false;
            system.registerHook('cultivationAscended', () => { called = true; });
            system.ascendHigher(cultivation.cultivationId, 100);
            expect(called).toBe(true);
        });
    });

    describe('gatherWind', () => {
        it('should gather', () => {
            const { cultivation } = system.startCultivation({});
            system.gatherWind(cultivation.cultivationId, 10);
            expect(cultivation.wind).toBe(40);
        });

        it('should reject missing', () => {
            const result = system.gatherWind('ghost', 5);
            expect(result.error).toBe('CULTIVATION_NOT_FOUND');
        });

        it('should trigger windGathered hook', () => {
            const { cultivation } = system.startCultivation({});
            let called = false;
            system.registerHook('windGathered', () => { called = true; });
            system.gatherWind(cultivation.cultivationId);
            expect(called).toBe(true);
        });
    });

    describe('collectCloud', () => {
        it('should collect', () => {
            const { cultivation } = system.startCultivation({});
            system.collectCloud(cultivation.cultivationId);
            expect(cultivation.clouds).toBe(6);
        });

        it('should reject missing', () => {
            const result = system.collectCloud('ghost');
            expect(result.error).toBe('CULTIVATION_NOT_FOUND');
        });

        it('should trigger cloudCollected hook', () => {
            const { cultivation } = system.startCultivation({});
            let called = false;
            system.registerHook('cloudCollected', () => { called = true; });
            system.collectCloud(cultivation.cultivationId);
            expect(called).toBe(true);
        });
    });

    describe('summonStar', () => {
        it('should summon', () => {
            const { cultivation } = system.startCultivation({});
            system.summonStar(cultivation.cultivationId);
            expect(cultivation.stars).toBe(13);
        });

        it('should reject missing', () => {
            const result = system.summonStar('ghost');
            expect(result.error).toBe('CULTIVATION_NOT_FOUND');
        });

        it('should trigger starSummoned hook', () => {
            const { cultivation } = system.startCultivation({});
            let called = false;
            system.registerHook('starSummoned', () => { called = true; });
            system.summonStar(cultivation.cultivationId);
            expect(called).toBe(true);
        });
    });

    describe('completeCultivation', () => {
        it('should complete', () => {
            const { cultivation } = system.startCultivation({});
            system.completeCultivation(cultivation.cultivationId);
            expect(cultivation.status).toBe('completed');
        });

        it('should reject missing', () => {
            const result = system.completeCultivation('ghost');
            expect(result.error).toBe('CULTIVATION_NOT_FOUND');
        });

        it('should trigger cultivationCompleted hook', () => {
            const { cultivation } = system.startCultivation({});
            let called = false;
            system.registerHook('cultivationCompleted', () => { called = true; });
            system.completeCultivation(cultivation.cultivationId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSkyPower', () => {
        it('should calculate', () => {
            const { cultivation } = system.startCultivation({});
            expect(system.calculateSkyPower(cultivation.cultivationId)).toBe(100 + 30 + 25 + 36);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSkyPower('ghost')).toBe(0);
        });
    });

    describe('deleteCultivation', () => {
        it('should delete', () => {
            const { cultivation } = system.startCultivation({});
            const result = system.deleteCultivation(cultivation.cultivationId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteCultivation('ghost');
            expect(result.error).toBe('CULTIVATION_NOT_FOUND');
        });

        it('should trigger cultivationDeleted hook', () => {
            const { cultivation } = system.startCultivation({});
            let called = false;
            system.registerHook('cultivationDeleted', () => { called = true; });
            system.deleteCultivation(cultivation.cultivationId);
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

        it('should execute default getCultivation', () => {
            const result = system.executeTool('getCultivation', { cultivationId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('cultivationStarted', () => count++);
            unregister();
            system.startCultivation({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('cultivationStarted', () => { throw new Error('x'); });
            expect(() => system.startCultivation({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCultivations = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCultivations = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startCultivation({});
            const json = system.toJSON();
            expect(json.cultivations.length).toBe(1);
        });
        it('should deserialize', () => {
            system.startCultivation({});
            const json = system.toJSON();
            const newSys = new SkyCultivation();
            newSys.fromJSON(json);
            expect(newSys.cultivations.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.cultivationCount).toBe(0);
        });
    });
});