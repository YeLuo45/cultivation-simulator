/**
 * CosmicEvents.test.js - 宇宙异象测试
 * V355 Iteration 7/9 Round 8 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CosmicEvents } from '../../../systems/ai/CosmicEvents.js';

describe('CosmicEvents', () => {
    let system;
    beforeEach(() => { system = new CosmicEvents(); });

    describe('createEvent', () => {
        it('should create', () => {
            const { event } = system.createEvent({ typeId: 'comet' });
            expect(event.typeId).toBe('comet');
        });

        it('should use template power', () => {
            const { event } = system.createEvent({ typeId: 'eclipse' });
            expect(event.power).toBe(100);
        });

        it('should trigger cosmicEventOccurred hook', () => {
            let called = false;
            system.registerHook('cosmicEventOccurred', () => { called = true; });
            system.createEvent({ typeId: 'comet' });
            expect(called).toBe(true);
        });
    });

    describe('getEvent', () => {
        it('should return', () => {
            const { event } = system.createEvent({ typeId: 'comet' });
            expect(system.getEvent(event.eventId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getEvent('ghost')).toBeNull(); });
    });

    describe('listEvents', () => {
        it('should list all', () => {
            system.createEvent({ typeId: 'comet' });
            expect(system.listEvents().length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.createEvent({ typeId: 'comet' });
            system.createEvent({ typeId: 'eclipse' });
            expect(system.listByType('comet').length).toBe(1);
        });
    });

    describe('listCosmicTypes', () => {
        it('should list all', () => {
            const types = system.listCosmicTypes();
            expect(types.length).toBe(4);
        });
    });

    describe('createOmen', () => {
        it('should create', () => {
            const { omen } = system.createOmen({ typeId: 'comet' });
            expect(omen.typeId).toBe('comet');
        });

        it('should trigger omenCreated hook', () => {
            let called = false;
            system.registerHook('omenCreated', () => { called = true; });
            system.createOmen({ typeId: 'comet' });
            expect(called).toBe(true);
        });
    });

    describe('getOmen', () => {
        it('should return', () => {
            const { omen } = system.createOmen({ typeId: 'comet' });
            expect(system.getOmen(omen.omenId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getOmen('ghost')).toBeNull(); });
    });

    describe('listOmens', () => {
        it('should list all', () => {
            system.createOmen({ typeId: 'comet' });
            expect(system.listOmens().length).toBe(1);
        });
    });

    describe('listOmensByRegion', () => {
        it('should filter', () => {
            system.createOmen({ typeId: 'comet', region: 'east' });
            system.createOmen({ typeId: 'comet', region: 'west' });
            expect(system.listOmensByRegion('east').length).toBe(1);
        });
    });

    describe('calculateTotalPower', () => {
        it('should calculate', () => {
            system.createEvent({ typeId: 'comet' });
            system.createEvent({ typeId: 'eclipse' });
            expect(system.calculateTotalPower()).toBe(150);
        });

        it('should return 0 for empty', () => {
            expect(system.calculateTotalPower()).toBe(0);
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

        it('should execute default getEvent', () => {
            const result = system.executeTool('getEvent', { eventId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('cosmicEventOccurred', () => count++);
            unregister();
            system.createEvent({ typeId: 'comet' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('cosmicEventOccurred', () => { throw new Error('x'); });
            expect(() => system.createEvent({ typeId: 'comet' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalEvents = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalEvents = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createEvent({ typeId: 'comet' });
            const json = system.toJSON();
            expect(json.events.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createEvent({ typeId: 'comet' });
            const json = system.toJSON();
            const newSys = new CosmicEvents();
            newSys.fromJSON(json);
            expect(newSys.events.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.eventCount).toBe(0);
        });
    });
});