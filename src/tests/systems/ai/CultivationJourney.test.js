/**
 * CultivationJourney.test.js - 修真旅途测试
 * V453 Iteration 15/15 FINAL Round 16 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationJourney } from '../../../systems/ai/CultivationJourney.js';

describe('CultivationJourney', () => {
    let system;
    beforeEach(() => { system = new CultivationJourney(); });

    describe('startJourney', () => {
        it('should start', () => {
            const { journey } = system.startJourney({ name: 'J1' });
            expect(journey.name).toBe('J1');
        });

        it('should set initial metrics', () => {
            const { journey } = system.startJourney({});
            expect(system.getMetrics(journey.journeyId)).not.toBeNull();
        });

        it('should trigger journeyStarted hook', () => {
            let called = false;
            system.registerHook('journeyStarted', () => { called = true; });
            system.startJourney({});
            expect(called).toBe(true);
        });
    });

    describe('getJourney', () => {
        it('should return', () => {
            const { journey } = system.startJourney({});
            expect(system.getJourney(journey.journeyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getJourney('ghost')).toBeNull(); });
    });

    describe('listJourneys', () => {
        it('should list all', () => {
            system.startJourney({});
            expect(system.listJourneys().length).toBe(1);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.startJourney({ cultivatorId: 'c1' });
            system.startJourney({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listByStatus', () => {
        it('should filter', () => {
            system.startJourney({});
            expect(system.listByStatus('in-progress').length).toBe(1);
        });
    });

    describe('setMetrics', () => {
        it('should set', () => {
            const { journey } = system.startJourney({});
            const result = system.setMetrics(journey.journeyId, { stamina: 80 });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.setMetrics('ghost', {});
            expect(result.error).toBe('JOURNEY_NOT_FOUND');
        });
    });

    describe('getMetrics', () => {
        it('should return', () => {
            const { journey } = system.startJourney({});
            expect(system.getMetrics(journey.journeyId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getMetrics('ghost')).toBeNull();
        });
    });

    describe('refreshJourney', () => {
        it('should refresh', () => {
            const { journey } = system.startJourney({});
            const result = system.refreshJourney(journey.journeyId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.refreshJourney('ghost');
            expect(result.error).toBe('JOURNEY_NOT_FOUND');
        });

        it('should trigger journeyRefreshed hook', () => {
            const { journey } = system.startJourney({});
            let called = false;
            system.registerHook('journeyRefreshed', () => { called = true; });
            system.refreshJourney(journey.journeyId);
            expect(called).toBe(true);
        });
    });

    describe('passTribulation', () => {
        it('should pass', () => {
            const { journey } = system.startJourney({});
            system.passTribulation(journey.journeyId);
            expect(journey.tribulationsPassed).toBe(1);
        });

        it('should trigger realm at 3 tribulations', () => {
            const { journey } = system.startJourney({});
            system.passTribulation(journey.journeyId);
            system.passTribulation(journey.journeyId);
            system.passTribulation(journey.journeyId);
            expect(journey.realmsAttained).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.passTribulation('ghost');
            expect(result.error).toBe('JOURNEY_NOT_FOUND');
        });

        it('should trigger tribulationPassed hook', () => {
            const { journey } = system.startJourney({});
            let called = false;
            system.registerHook('tribulationPassed', () => { called = true; });
            system.passTribulation(journey.journeyId);
            expect(called).toBe(true);
        });
    });

    describe('findTreasure', () => {
        it('should find', () => {
            const { journey } = system.startJourney({});
            system.findTreasure(journey.journeyId);
            expect(journey.treasuresFound).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.findTreasure('ghost');
            expect(result.error).toBe('JOURNEY_NOT_FOUND');
        });

        it('should trigger treasureFound hook', () => {
            const { journey } = system.startJourney({});
            let called = false;
            system.registerHook('treasureFound', () => { called = true; });
            system.findTreasure(journey.journeyId);
            expect(called).toBe(true);
        });
    });

    describe('defeatEnemy', () => {
        it('should defeat', () => {
            const { journey } = system.startJourney({});
            system.defeatEnemy(journey.journeyId);
            expect(journey.enemiesDefeated).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.defeatEnemy('ghost');
            expect(result.error).toBe('JOURNEY_NOT_FOUND');
        });

        it('should trigger enemyDefeated hook', () => {
            const { journey } = system.startJourney({});
            let called = false;
            system.registerHook('enemyDefeated', () => { called = true; });
            system.defeatEnemy(journey.journeyId);
            expect(called).toBe(true);
        });
    });

    describe('completeJourney', () => {
        it('should complete', () => {
            const { journey } = system.startJourney({});
            system.completeJourney(journey.journeyId);
            expect(journey.status).toBe('completed');
        });

        it('should reject missing', () => {
            const result = system.completeJourney('ghost');
            expect(result.error).toBe('JOURNEY_NOT_FOUND');
        });

        it('should trigger journeyCompleted hook', () => {
            const { journey } = system.startJourney({});
            let called = false;
            system.registerHook('journeyCompleted', () => { called = true; });
            system.completeJourney(journey.journeyId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCultivationProgress', () => {
        it('should calculate', () => {
            const { journey } = system.startJourney({ dao: 'sword' });
            journey.tribulationsPassed = 1;
            journey.treasuresFound = 5;
            journey.enemiesDefeated = 3;
            expect(system.calculateCultivationProgress(journey.journeyId)).toBe(10 + 0 + 10 + 9 + 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCultivationProgress('ghost')).toBe(0);
        });
    });

    describe('deleteJourney', () => {
        it('should delete', () => {
            const { journey } = system.startJourney({});
            const result = system.deleteJourney(journey.journeyId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteJourney('ghost');
            expect(result.error).toBe('JOURNEY_NOT_FOUND');
        });

        it('should trigger journeyDeleted hook', () => {
            const { journey } = system.startJourney({});
            let called = false;
            system.registerHook('journeyDeleted', () => { called = true; });
            system.deleteJourney(journey.journeyId);
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

        it('should execute default getJourney', () => {
            const result = system.executeTool('getJourney', { journeyId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('journeyStarted', () => count++);
            unregister();
            system.startJourney({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('journeyStarted', () => { throw new Error('x'); });
            expect(() => system.startJourney({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalJourneys = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalJourneys = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startJourney({});
            const json = system.toJSON();
            expect(json.journeys.length).toBe(1);
        });
        it('should deserialize', () => {
            system.startJourney({});
            const json = system.toJSON();
            const newSys = new CultivationJourney();
            newSys.fromJSON(json);
            expect(newSys.journeys.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.journeyCount).toBe(0);
        });
    });
});