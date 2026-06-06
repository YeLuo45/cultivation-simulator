/**
 * SailingNavigation.test.js - 航海导航测试
 * V454 Iteration 1/15 Round 17 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SailingNavigation } from '../../../systems/ai/SailingNavigation.js';

describe('SailingNavigation', () => {
    let system;
    beforeEach(() => { system = new SailingNavigation(); });

    describe('launchVoyage', () => {
        it('should launch', () => {
            const { voyage } = system.launchVoyage({ sailorId: 's1', name: 'East Sea Trek', origin: 'Port A', destination: 'Island B' });
            expect(voyage.sailorId).toBe('s1');
            expect(voyage.name).toBe('East Sea Trek');
            expect(voyage.status).toBe('preparing');
        });

        it('should use default distance and wind', () => {
            const { voyage } = system.launchVoyage({});
            expect(voyage.distance).toBe(1000);
            expect(voyage.wind).toBe(10);
        });

        it('should respect custom distance and wind', () => {
            const { voyage } = system.launchVoyage({ distance: 500, wind: 25 });
            expect(voyage.distance).toBe(500);
            expect(voyage.wind).toBe(25);
        });

        it('should trigger voyageLaunched hook', () => {
            let called = false;
            system.registerHook('voyageLaunched', () => { called = true; });
            system.launchVoyage({});
            expect(called).toBe(true);
        });
    });

    describe('getVoyage', () => {
        it('should return', () => {
            const { voyage } = system.launchVoyage({});
            expect(system.getVoyage(voyage.voyageId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getVoyage('ghost')).toBeNull(); });
    });

    describe('listVoyages', () => {
        it('should list all', () => {
            system.launchVoyage({});
            system.launchVoyage({});
            expect(system.listVoyages().length).toBe(2);
        });
    });

    describe('listBySailor', () => {
        it('should filter', () => {
            system.launchVoyage({ sailorId: 's1' });
            system.launchVoyage({ sailorId: 's2' });
            expect(system.listBySailor('s1').length).toBe(1);
        });
    });

    describe('listSailing', () => {
        it('should filter sailing only', () => {
            const { voyage: v1 } = system.launchVoyage({});
            const { voyage: v2 } = system.launchVoyage({});
            system.sailForward(v1.voyageId, 5);
            const sailing = system.listSailing();
            expect(sailing.length).toBe(1);
            expect(sailing[0].voyageId).toBe(v1.voyageId);
        });
    });

    describe('sailForward', () => {
        it('should decrease distance', () => {
            const { voyage } = system.launchVoyage({});
            system.sailForward(voyage.voyageId, 100);
            expect(voyage.distance).toBe(900);
        });

        it('should default amount to 10', () => {
            const { voyage } = system.launchVoyage({});
            system.sailForward(voyage.voyageId);
            expect(voyage.distance).toBe(990);
        });

        it('should set status to sailing', () => {
            const { voyage } = system.launchVoyage({});
            system.sailForward(voyage.voyageId, 5);
            expect(voyage.status).toBe('sailing');
        });

        it('should auto-dock when distance zero', () => {
            const { voyage } = system.launchVoyage({ distance: 50 });
            system.sailForward(voyage.voyageId, 50);
            expect(voyage.status).toBe('docked');
            expect(voyage.distance).toBe(0);
        });

        it('should not go below zero', () => {
            const { voyage } = system.launchVoyage({ distance: 50 });
            system.sailForward(voyage.voyageId, 200);
            expect(voyage.distance).toBe(0);
        });

        it('should reject missing', () => {
            const result = system.sailForward('ghost', 10);
            expect(result.error).toBe('VOYAGE_NOT_FOUND');
        });

        it('should trigger voyageSailed hook', () => {
            const { voyage } = system.launchVoyage({});
            let called = false;
            system.registerHook('voyageSailed', () => { called = true; });
            system.sailForward(voyage.voyageId, 10);
            expect(called).toBe(true);
        });
    });

    describe('catchWind', () => {
        it('should increase wind by default 5', () => {
            const { voyage } = system.launchVoyage({});
            system.catchWind(voyage.voyageId);
            expect(voyage.wind).toBe(15);
        });

        it('should increase wind by custom amount', () => {
            const { voyage } = system.launchVoyage({});
            system.catchWind(voyage.voyageId, 20);
            expect(voyage.wind).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.catchWind('ghost', 5);
            expect(result.error).toBe('VOYAGE_NOT_FOUND');
        });

        it('should trigger windCaught hook', () => {
            const { voyage } = system.launchVoyage({});
            let called = false;
            system.registerHook('windCaught', () => { called = true; });
            system.catchWind(voyage.voyageId, 10);
            expect(called).toBe(true);
        });
    });

    describe('recruitCrew', () => {
        it('should increase crew by default 3', () => {
            const { voyage } = system.launchVoyage({});
            system.recruitCrew(voyage.voyageId);
            expect(voyage.crew).toBe(13);
        });

        it('should increase crew by custom count', () => {
            const { voyage } = system.launchVoyage({});
            system.recruitCrew(voyage.voyageId, 20);
            expect(voyage.crew).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.recruitCrew('ghost', 5);
            expect(result.error).toBe('VOYAGE_NOT_FOUND');
        });

        it('should trigger crewRecruited hook', () => {
            const { voyage } = system.launchVoyage({});
            let called = false;
            system.registerHook('crewRecruited', () => { called = true; });
            system.recruitCrew(voyage.voyageId, 5);
            expect(called).toBe(true);
        });
    });

    describe('dockVoyage', () => {
        it('should dock', () => {
            const { voyage } = system.launchVoyage({});
            system.dockVoyage(voyage.voyageId);
            expect(voyage.status).toBe('docked');
            expect(voyage.distance).toBe(0);
        });

        it('should reject missing', () => {
            const result = system.dockVoyage('ghost');
            expect(result.error).toBe('VOYAGE_NOT_FOUND');
        });

        it('should trigger voyageDocked hook', () => {
            const { voyage } = system.launchVoyage({});
            let called = false;
            system.registerHook('voyageDocked', () => { called = true; });
            system.dockVoyage(voyage.voyageId);
            expect(called).toBe(true);
        });
    });

    describe('calculateVoyageSpeed', () => {
        it('should calculate speed with wind and crew', () => {
            // wind=20, crew=50, distance=200
            // 20 * (1 + 50/100) / max(1, 200/100) = 20 * 1.5 / 2 = 15
            const { voyage } = system.launchVoyage({ wind: 20, crew: 50, distance: 200 });
            expect(system.calculateVoyageSpeed(voyage.voyageId)).toBe(15);
        });

        it('should guard against zero distance', () => {
            // wind=10, crew=10, distance=0 -> Math.max(1, 0) = 1
            // 10 * (1 + 0.1) / 1 = 11
            const { voyage } = system.launchVoyage({ wind: 10, crew: 10 });
            voyage.distance = 0;
            expect(system.calculateVoyageSpeed(voyage.voyageId)).toBeCloseTo(11, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateVoyageSpeed('ghost')).toBe(0);
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

        it('should execute default getVoyage', () => {
            const result = system.executeTool('getVoyage', { voyageId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('voyageLaunched', () => count++);
            unregister();
            system.launchVoyage({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('voyageLaunched', () => { throw new Error('x'); });
            expect(() => system.launchVoyage({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalVoyages = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalVoyages = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.launchVoyage({});
            const json = system.toJSON();
            expect(json.voyages.length).toBe(1);
        });
        it('should deserialize', () => {
            system.launchVoyage({});
            const json = system.toJSON();
            const newSys = new SailingNavigation();
            newSys.fromJSON(json);
            expect(newSys.voyages.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.voyageCount).toBe(0);
        });
    });
});
