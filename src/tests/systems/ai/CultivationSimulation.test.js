/**
 * CultivationSimulation.test.js - 修真模拟测试
 * V577 Iteration 20/20 FINAL Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSimulation } from '../../../systems/ai/CultivationSimulation.js';

describe('CultivationSimulation', () => {
    let system;
    beforeEach(() => { system = new CultivationSimulation(); });

    describe('createScenario', () => {
        it('should create', () => {
            const { scenario } = system.createScenario({ name: 'Jade World' });
            expect(scenario.name).toBe('Jade World');
        });

        it('should set initial metrics', () => {
            const { scenario } = system.createScenario({});
            expect(system.getMetrics(scenario.scenarioId)).not.toBeNull();
        });

        it('should trigger scenarioCreated hook', () => {
            let called = false;
            system.registerHook('scenarioCreated', () => { called = true; });
            system.createScenario({});
            expect(called).toBe(true);
        });
    });

    describe('getScenario', () => {
        it('should return', () => {
            const { scenario } = system.createScenario({});
            expect(system.getScenario(scenario.scenarioId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getScenario('ghost')).toBeNull(); });
    });

    describe('listScenarios', () => {
        it('should list all', () => {
            system.createScenario({});
            expect(system.listScenarios().length).toBe(1);
        });
    });

    describe('listBySimulator', () => {
        it('should filter', () => {
            system.createScenario({ simulator: 's1' });
            system.createScenario({ simulator: 's2' });
            expect(system.listBySimulator('s1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.createScenario({ type: 'virtual' });
            system.createScenario({ type: 'physical' });
            expect(system.listByType('virtual').length).toBe(1);
        });
    });

    describe('listByReality', () => {
        it('should filter', () => {
            system.createScenario({});
            system.createScenario({ reality: 200 });
            expect(system.listByReality(100).length).toBe(1);
        });
    });

    describe('listTop', () => {
        it('should return top', () => {
            system.createScenario({});
            system.createScenario({});
            expect(system.listTop(2).length).toBe(2);
        });
    });

    describe('setMetrics', () => {
        it('should set', () => {
            const { scenario } = system.createScenario({});
            const result = system.setMetrics(scenario.scenarioId, { stability: 90 });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.setMetrics('ghost', {});
            expect(result.error).toBe('SCENARIO_NOT_FOUND');
        });
    });

    describe('getMetrics', () => {
        it('should return', () => {
            const { scenario } = system.createScenario({});
            expect(system.getMetrics(scenario.scenarioId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getMetrics('ghost')).toBeNull();
        });
    });

    describe('refreshScenario', () => {
        it('should refresh', () => {
            const { scenario } = system.createScenario({});
            const result = system.refreshScenario(scenario.scenarioId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.refreshScenario('ghost');
            expect(result.error).toBe('SCENARIO_NOT_FOUND');
        });

        it('should trigger scenarioRefreshed hook', () => {
            const { scenario } = system.createScenario({});
            let called = false;
            system.registerHook('scenarioRefreshed', () => { called = true; });
            system.refreshScenario(scenario.scenarioId);
            expect(called).toBe(true);
        });
    });

    describe('gainReality', () => {
        it('should gain', () => {
            const { scenario } = system.createScenario({});
            system.gainReality(scenario.scenarioId, 50);
            expect(scenario.reality).toBe(100);
        });

        it('should reject missing', () => {
            const result = system.gainReality('ghost', 5);
            expect(result.error).toBe('SCENARIO_NOT_FOUND');
        });

        it('should trigger realityGained hook', () => {
            const { scenario } = system.createScenario({});
            let called = false;
            system.registerHook('realityGained', () => { called = true; });
            system.gainReality(scenario.scenarioId, 5);
            expect(called).toBe(true);
        });
    });

    describe('spawnAgent', () => {
        it('should spawn', () => {
            const { scenario } = system.createScenario({});
            system.spawnAgent(scenario.scenarioId, 5);
            expect(scenario.agents).toBe(6);
        });

        it('should reject missing', () => {
            const result = system.spawnAgent('ghost', 5);
            expect(result.error).toBe('SCENARIO_NOT_FOUND');
        });

        it('should trigger agentSpawned hook', () => {
            const { scenario } = system.createScenario({});
            let called = false;
            system.registerHook('agentSpawned', () => { called = true; });
            system.spawnAgent(scenario.scenarioId, 5);
            expect(called).toBe(true);
        });
    });

    describe('promoteScenario', () => {
        it('should promote', () => {
            const { scenario } = system.createScenario({});
            system.promoteScenario(scenario.scenarioId);
            expect(scenario.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.promoteScenario('ghost');
            expect(result.error).toBe('SCENARIO_NOT_FOUND');
        });

        it('should trigger scenarioPromoted hook', () => {
            const { scenario } = system.createScenario({});
            let called = false;
            system.registerHook('scenarioPromoted', () => { called = true; });
            system.promoteScenario(scenario.scenarioId);
            expect(called).toBe(true);
        });
    });

    describe('changeType', () => {
        it('should change', () => {
            const { scenario } = system.createScenario({});
            system.changeType(scenario.scenarioId, 'physical');
            expect(scenario.type).toBe('physical');
        });

        it('should reject missing', () => {
            const result = system.changeType('ghost', 'physical');
            expect(result.error).toBe('SCENARIO_NOT_FOUND');
        });

        it('should trigger typeChanged hook', () => {
            const { scenario } = system.createScenario({});
            let called = false;
            system.registerHook('typeChanged', () => { called = true; });
            system.changeType(scenario.scenarioId, 'augmented');
            expect(called).toBe(true);
        });
    });

    describe('startScenario', () => {
        it('should start', () => {
            const { scenario } = system.createScenario({});
            system.startScenario(scenario.scenarioId);
            expect(scenario.status).toBe('running');
        });

        it('should reject missing', () => {
            const result = system.startScenario('ghost');
            expect(result.error).toBe('SCENARIO_NOT_FOUND');
        });

        it('should trigger scenarioStarted hook', () => {
            const { scenario } = system.createScenario({});
            let called = false;
            system.registerHook('scenarioStarted', () => { called = true; });
            system.startScenario(scenario.scenarioId);
            expect(called).toBe(true);
        });
    });

    describe('stopScenario', () => {
        it('should stop', () => {
            const { scenario } = system.createScenario({});
            system.stopScenario(scenario.scenarioId);
            expect(scenario.status).toBe('stopped');
        });

        it('should reject missing', () => {
            const result = system.stopScenario('ghost');
            expect(result.error).toBe('SCENARIO_NOT_FOUND');
        });

        it('should trigger scenarioStopped hook', () => {
            const { scenario } = system.createScenario({});
            let called = false;
            system.registerHook('scenarioStopped', () => { called = true; });
            system.stopScenario(scenario.scenarioId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSimulationValue', () => {
        it('should calculate', () => {
            const { scenario } = system.createScenario({});
            expect(system.calculateSimulationValue(scenario.scenarioId)).toBe(210);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSimulationValue('ghost')).toBe(0);
        });
    });

    describe('deleteScenario', () => {
        it('should delete', () => {
            const { scenario } = system.createScenario({});
            const result = system.deleteScenario(scenario.scenarioId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteScenario('ghost');
            expect(result.error).toBe('SCENARIO_NOT_FOUND');
        });

        it('should trigger scenarioDeleted hook', () => {
            const { scenario } = system.createScenario({});
            let called = false;
            system.registerHook('scenarioDeleted', () => { called = true; });
            system.deleteScenario(scenario.scenarioId);
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

        it('should execute default getScenario', () => {
            const result = system.executeTool('getScenario', { scenarioId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('scenarioCreated', () => count++);
            unregister();
            system.createScenario({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('scenarioCreated', () => { throw new Error('x'); });
            expect(() => system.createScenario({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalScenarios = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalScenarios = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createScenario({});
            const json = system.toJSON();
            expect(json.scenarios.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createScenario({});
            const json = system.toJSON();
            const newSys = new CultivationSimulation();
            newSys.fromJSON(json);
            expect(newSys.scenarios.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.scenarioCount).toBe(0);
        });
    });
});