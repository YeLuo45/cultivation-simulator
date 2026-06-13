/**
 * TravelExploration.test.js - 旅行探索测试
 * V444 Iteration 6/15 Round 16 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TravelExploration } from '../../../systems/ai/TravelExploration.js';

describe('TravelExploration', () => {
    let system;
    beforeEach(() => { system = new TravelExploration(); });

    describe('planJourney', () => {
        it('should plan', () => {
            const { journey } = system.planJourney({ travelerId: 't1', name: 'East Trek', destination: 'East Mountain' });
            expect(journey.travelerId).toBe('t1');
            expect(journey.name).toBe('East Trek');
            expect(journey.status).toBe('planned');
        });

        it('should use default distance', () => {
            const { journey } = system.planJourney({});
            expect(journey.distance).toBe(1000);
        });

        it('should respect custom distance', () => {
            const { journey } = system.planJourney({ distance: 500 });
            expect(journey.distance).toBe(500);
        });

        it('should trigger journeyPlanned hook', () => {
            let called = false;
            system.registerHook('journeyPlanned', () => { called = true; });
            system.planJourney({});
            expect(called).toBe(true);
        });
    });

    describe('getJourney', () => {
        it('should return', () => {
            const { journey } = system.planJourney({});
            expect(system.getJourney(journey.journeyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getJourney('ghost')).toBeNull(); });
    });

    describe('listJourneys', () => {
        it('should list all', () => {
            system.planJourney({});
            system.planJourney({});
            expect(system.listJourneys().length).toBe(2);
        });
    });

    describe('listByTraveler', () => {
        it('should filter', () => {
            system.planJourney({ travelerId: 't1' });
            system.planJourney({ travelerId: 't2' });
            expect(system.listByTraveler('t1').length).toBe(1);
        });
    });

    describe('listOngoing', () => {
        it('should filter ongoing only', () => {
            const { journey: j1 } = system.planJourney({});
            const { journey: j2 } = system.planJourney({});
            system.travelStep(j1.journeyId, 5);
            const ongoing = system.listOngoing();
            expect(ongoing.length).toBe(1);
            expect(ongoing[0].journeyId).toBe(j1.journeyId);
        });
    });

    describe('travelStep', () => {
        it('should decrease distance', () => {
            const { journey } = system.planJourney({});
            system.travelStep(journey.journeyId, 100);
            expect(journey.distance).toBe(900);
        });

        it('should default amount to 10', () => {
            const { journey } = system.planJourney({});
            system.travelStep(journey.journeyId);
            expect(journey.distance).toBe(990);
        });

        it('should set status to ongoing', () => {
            const { journey } = system.planJourney({});
            system.travelStep(journey.journeyId, 5);
            expect(journey.status).toBe('ongoing');
        });

        it('should auto-complete when distance zero', () => {
            const { journey } = system.planJourney({ distance: 50 });
            system.travelStep(journey.journeyId, 50);
            expect(journey.status).toBe('completed');
            expect(journey.distance).toBe(0);
        });

        it('should not go below zero', () => {
            const { journey } = system.planJourney({ distance: 50 });
            system.travelStep(journey.journeyId, 200);
            expect(journey.distance).toBe(0);
        });

        it('should reject missing', () => {
            const result = system.travelStep('ghost', 10);
            expect(result.error).toBe('JOURNEY_NOT_FOUND');
        });

        it('should trigger journeyTraveled hook', () => {
            const { journey } = system.planJourney({});
            let called = false;
            system.registerHook('journeyTraveled', () => { called = true; });
            system.travelStep(journey.journeyId, 10);
            expect(called).toBe(true);
        });
    });

    describe('discoverPlace', () => {
        it('should add discovery', () => {
            const { journey } = system.planJourney({});
            system.discoverPlace(journey.journeyId, 'Hidden Valley');
            expect(journey.discoveries.length).toBe(1);
            expect(journey.discoveries[0].name).toBe('Hidden Valley');
        });

        it('should reject missing', () => {
            const result = system.discoverPlace('ghost', 'Place');
            expect(result.error).toBe('JOURNEY_NOT_FOUND');
        });

        it('should trigger placeDiscovered hook', () => {
            const { journey } = system.planJourney({});
            let called = false;
            system.registerHook('placeDiscovered', () => { called = true; });
            system.discoverPlace(journey.journeyId, 'Old Temple');
            expect(called).toBe(true);
        });
    });

    describe('encounter', () => {
        it('should add encounter', () => {
            const { journey } = system.planJourney({});
            system.encounter(journey.journeyId, 'bandit');
            expect(journey.encounters.length).toBe(1);
            expect(journey.encounters[0].type).toBe('bandit');
        });

        it('should reject missing', () => {
            const result = system.encounter('ghost', 'beast');
            expect(result.error).toBe('JOURNEY_NOT_FOUND');
        });

        it('should trigger encounterOccurred hook', () => {
            const { journey } = system.planJourney({});
            let called = false;
            system.registerHook('encounterOccurred', () => { called = true; });
            system.encounter(journey.journeyId, 'spirit_beast');
            expect(called).toBe(true);
        });
    });

    describe('completeJourney', () => {
        it('should complete', () => {
            const { journey } = system.planJourney({});
            system.completeJourney(journey.journeyId);
            expect(journey.status).toBe('completed');
            expect(journey.distance).toBe(0);
        });

        it('should reject missing', () => {
            const result = system.completeJourney('ghost');
            expect(result.error).toBe('JOURNEY_NOT_FOUND');
        });

        it('should trigger journeyCompleted hook', () => {
            const { journey } = system.planJourney({});
            let called = false;
            system.registerHook('journeyCompleted', () => { called = true; });
            system.completeJourney(journey.journeyId);
            expect(called).toBe(true);
        });
    });

    describe('calculateExplorationProgress', () => {
        it('should calculate from distance', () => {
            const { journey } = system.planJourney({ distance: 50 });
            // distance > 0 -> (100 - 50) = 50
            expect(system.calculateExplorationProgress(journey.journeyId)).toBe(50);
        });

        it('should add discoveries bonus', () => {
            const { journey } = system.planJourney({ distance: 30 });
            system.travelStep(journey.journeyId, 30); // distance -> 0
            // distance = 0 -> 100
            system.discoverPlace(journey.journeyId, 'A');
            system.discoverPlace(journey.journeyId, 'B');
            // 100 + 2*5 = 110
            expect(system.calculateExplorationProgress(journey.journeyId)).toBe(110);
        });

        it('should add encounters bonus', () => {
            const { journey } = system.planJourney({ distance: 30 });
            system.travelStep(journey.journeyId, 30); // distance -> 0
            system.encounter(journey.journeyId, 'bandit');
            system.encounter(journey.journeyId, 'beast');
            system.encounter(journey.journeyId, 'storm');
            // 100 + 3*3 = 109
            expect(system.calculateExplorationProgress(journey.journeyId)).toBe(109);
        });

        it('should return 100 when distance 0 with no extras', () => {
            const { journey } = system.planJourney({ distance: 30 });
            system.travelStep(journey.journeyId, 30); // distance -> 0
            expect(system.calculateExplorationProgress(journey.journeyId)).toBe(100);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateExplorationProgress('ghost')).toBe(0);
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
            const unregister = system.registerHook('journeyPlanned', () => count++);
            unregister();
            system.planJourney({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('journeyPlanned', () => { throw new Error('x'); });
            expect(() => system.planJourney({})).not.toThrow();
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
            system.planJourney({});
            const json = system.toJSON();
            expect(json.journeys.length).toBe(1);
        });
        it('should deserialize', () => {
            system.planJourney({});
            const json = system.toJSON();
            const newSys = new TravelExploration();
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
