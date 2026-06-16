/**
 * TribulationSystem.test.js - 渡劫系统测试
 * V388 Iteration 4/9 Round 12 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TribulationSystem } from '../../../systems/ai/TribulationSystem.js';

describe('TribulationSystem', () => {
    let system;
    beforeEach(() => { system = new TribulationSystem(); });

    describe('startTribulation', () => {
        it('should start', () => {
            const { tribulation } = system.startTribulation({ cultivatorId: 'c1' });
            expect(tribulation.cultivatorId).toBe('c1');
        });

        it('should trigger tribulationStarted hook', () => {
            let called = false;
            system.registerHook('tribulationStarted', () => { called = true; });
            system.startTribulation({});
            expect(called).toBe(true);
        });
    });

    describe('getTribulation', () => {
        it('should return', () => {
            const { tribulation } = system.startTribulation({});
            expect(system.getTribulation(tribulation.tribulationId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTribulation('ghost')).toBeNull(); });
    });

    describe('listTribulations', () => {
        it('should list all', () => {
            system.startTribulation({});
            expect(system.listTribulations().length).toBe(1);
        });
    });

    describe('listOngoing', () => {
        it('should filter', () => {
            const { tribulation } = system.startTribulation({});
            tribulation.status = 'passed';
            system.startTribulation({});
            expect(system.listOngoing().length).toBe(1);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.startTribulation({ cultivatorId: 'c1' });
            system.startTribulation({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listByRealm', () => {
        it('should filter', () => {
            system.startTribulation({ realm: 'core_formation' });
            system.startTribulation({ realm: 'nascent_soul' });
            expect(system.listByRealm('core_formation').length).toBe(1);
        });
    });

    describe('surviveStrike', () => {
        it('should survive', () => {
            const { tribulation } = system.startTribulation({});
            system.surviveStrike(tribulation.tribulationId);
            expect(tribulation.strikesSurvived).toBe(1);
        });

        it('should pass after all strikes', () => {
            const { tribulation } = system.startTribulation({ lightningStrikes: 3 });
            for (let i = 0; i < 3; i++) system.surviveStrike(tribulation.tribulationId);
            expect(tribulation.status).toBe('passed');
        });

        it('should reject missing', () => {
            const result = system.surviveStrike('ghost');
            expect(result.error).toBe('TRIBULATION_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { tribulation } = system.startTribulation({});
            tribulation.status = 'passed';
            const result = system.surviveStrike(tribulation.tribulationId);
            expect(result.error).toBe('TRIBULATION_INACTIVE');
        });

        it('should trigger strikeSurvived hook', () => {
            const { tribulation } = system.startTribulation({});
            let called = false;
            system.registerHook('strikeSurvived', () => { called = true; });
            system.surviveStrike(tribulation.tribulationId);
            expect(called).toBe(true);
        });

        it('should trigger tribulationPassed hook', () => {
            const { tribulation } = system.startTribulation({ lightningStrikes: 1 });
            let called = false;
            system.registerHook('tribulationPassed', () => { called = true; });
            system.surviveStrike(tribulation.tribulationId);
            expect(called).toBe(true);
        });
    });

    describe('failTribulation', () => {
        it('should fail', () => {
            const { tribulation } = system.startTribulation({});
            system.failTribulation(tribulation.tribulationId);
            expect(tribulation.status).toBe('failed');
        });

        it('should reject missing', () => {
            const result = system.failTribulation('ghost');
            expect(result.error).toBe('TRIBULATION_NOT_FOUND');
        });

        it('should trigger tribulationFailed hook', () => {
            const { tribulation } = system.startTribulation({});
            let called = false;
            system.registerHook('tribulationFailed', () => { called = true; });
            system.failTribulation(tribulation.tribulationId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSurvivalRate', () => {
        it('should calculate', () => {
            const { tribulation } = system.startTribulation({ lightningStrikes: 9 });
            for (let i = 0; i < 3; i++) system.surviveStrike(tribulation.tribulationId);
            expect(system.calculateSurvivalRate(tribulation.tribulationId)).toBeCloseTo(1/3, 5);
        });

        it('should return null for missing', () => {
            expect(system.calculateSurvivalRate('ghost')).toBeNull();
        });
    });

    describe('countPasses', () => {
        it('should count', () => {
            const { tribulation } = system.startTribulation({ lightningStrikes: 1 });
            system.surviveStrike(tribulation.tribulationId);
            system.startTribulation({});
            expect(system.countPasses()).toBe(1);
        });
    });

    describe('countFailures', () => {
        it('should count', () => {
            const { tribulation } = system.startTribulation({});
            system.failTribulation(tribulation.tribulationId);
            system.startTribulation({});
            expect(system.countFailures()).toBe(1);
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

        it('should execute default getTribulation', () => {
            const result = system.executeTool('getTribulation', { tribulationId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('tribulationStarted', () => count++);
            unregister();
            system.startTribulation({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('tribulationStarted', () => { throw new Error('x'); });
            expect(() => system.startTribulation({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTribulations = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTribulations = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startTribulation({});
            const json = system.toJSON();
            expect(json.tribulations.length).toBe(1);
        });
        it('should deserialize', () => {
            system.startTribulation({});
            const json = system.toJSON();
            const newSys = new TribulationSystem();
            newSys.fromJSON(json);
            expect(newSys.tribulations.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.tribulationCount).toBe(0);
        });
    });
});