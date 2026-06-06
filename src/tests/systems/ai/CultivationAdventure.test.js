/**
 * CultivationAdventure.test.js - 修真冒险系统测试
 * V569 Iteration 12/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationAdventure } from '../../../systems/ai/CultivationAdventure.js';

describe('CultivationAdventure', () => {
    let system;
    beforeEach(() => { system = new CultivationAdventure(); });

    describe('startAdventure', () => {
        it('should create adventure', () => {
            const { adventure } = system.startAdventure({ leaderId: 'l1', name: 'Mountain Quest', type: 'quest' });
            expect(adventure.leaderId).toBe('l1');
            expect(adventure.name).toBe('Mountain Quest');
            expect(adventure.type).toBe('quest');
        });

        it('should set default values', () => {
            const { adventure } = system.startAdventure({});
            expect(adventure.type).toBe('exploration');
            expect(adventure.challenge).toBe(20);
            expect(adventure.level).toBe(1);
            expect(adventure.status).toBe('planned');
            expect(adventure.locations).toEqual([]);
        });

        it('should use provided id', () => {
            const { adventure } = system.startAdventure({ id: 'my-id' });
            expect(adventure.adventureId).toBe('my-id');
        });

        it('should trigger adventureStarted hook', () => {
            let called = false;
            system.registerHook('adventureStarted', () => { called = true; });
            system.startAdventure({});
            expect(called).toBe(true);
        });

        it('should increment totalAdventures stat', () => {
            system.startAdventure({});
            expect(system.stats.totalAdventures).toBe(1);
        });
    });

    describe('getAdventure', () => {
        it('should return adventure', () => {
            const { adventure } = system.startAdventure({});
            expect(system.getAdventure(adventure.adventureId)).not.toBeNull();
        });

        it('should return null for missing', () => { expect(system.getAdventure('ghost')).toBeNull(); });

        it('should return a copy', () => {
            const { adventure } = system.startAdventure({});
            const a = system.getAdventure(adventure.adventureId);
            a.name = 'changed';
            expect(system.adventures.get(adventure.adventureId).name).not.toBe('changed');
        });
    });

    describe('listAdventures', () => {
        it('should list all', () => {
            system.startAdventure({});
            system.startAdventure({});
            expect(system.listAdventures().length).toBe(2);
        });

        it('should return empty when no adventures', () => {
            expect(system.listAdventures().length).toBe(0);
        });
    });

    describe('listByLeader', () => {
        it('should filter by leader', () => {
            system.startAdventure({ leaderId: 'l1' });
            system.startAdventure({ leaderId: 'l2' });
            system.startAdventure({ leaderId: 'l1' });
            expect(system.listByLeader('l1').length).toBe(2);
        });

        it('should return empty for unknown leader', () => {
            system.startAdventure({ leaderId: 'l1' });
            expect(system.listByLeader('unknown').length).toBe(0);
        });
    });

    describe('listOngoing', () => {
        it('should filter ongoing', () => {
            const { adventure } = system.startAdventure({});
            system.addLocation(adventure.adventureId, 'cave');
            expect(system.listOngoing().length).toBe(1);
        });

        it('should not include planned', () => {
            system.startAdventure({});
            expect(system.listOngoing().length).toBe(0);
        });
    });

    describe('addLocation', () => {
        it('should add location', () => {
            const { adventure } = system.startAdventure({});
            const { location } = system.addLocation(adventure.adventureId, 'Forest');
            expect(location.name).toBe('Forest');
            expect(adventure.locations.length).toBe(1);
        });

        it('should reject missing adventure', () => {
            const result = system.addLocation('ghost', 'place');
            expect(result.error).toBe('ADVENTURE_NOT_FOUND');
        });

        it('should transition to ongoing', () => {
            const { adventure } = system.startAdventure({});
            system.addLocation(adventure.adventureId, 'place');
            expect(adventure.status).toBe('ongoing');
        });

        it('should trigger locationAdded hook', () => {
            const { adventure } = system.startAdventure({});
            let called = false;
            system.registerHook('locationAdded', () => { called = true; });
            system.addLocation(adventure.adventureId, 'place');
            expect(called).toBe(true);
        });
    });

    describe('increaseChallenge', () => {
        it('should increase challenge', () => {
            const { adventure } = system.startAdventure({});
            system.increaseChallenge(adventure.adventureId, 10);
            expect(adventure.challenge).toBe(30);
        });

        it('should use default amount', () => {
            const { adventure } = system.startAdventure({});
            system.increaseChallenge(adventure.adventureId);
            expect(adventure.challenge).toBe(25);
        });

        it('should reject missing adventure', () => {
            const result = system.increaseChallenge('ghost', 5);
            expect(result.error).toBe('ADVENTURE_NOT_FOUND');
        });

        it('should trigger challengeIncreased hook', () => {
            const { adventure } = system.startAdventure({});
            let called = false;
            system.registerHook('challengeIncreased', () => { called = true; });
            system.increaseChallenge(adventure.adventureId, 5);
            expect(called).toBe(true);
        });

        it('should transition to ongoing', () => {
            const { adventure } = system.startAdventure({});
            system.increaseChallenge(adventure.adventureId, 5);
            expect(adventure.status).toBe('ongoing');
        });
    });

    describe('levelUpAdventure', () => {
        it('should level up', () => {
            const { adventure } = system.startAdventure({});
            system.levelUpAdventure(adventure.adventureId);
            expect(adventure.level).toBe(2);
        });

        it('should reject missing adventure', () => {
            const result = system.levelUpAdventure('ghost');
            expect(result.error).toBe('ADVENTURE_NOT_FOUND');
        });

        it('should trigger adventureLeveledUp hook', () => {
            const { adventure } = system.startAdventure({});
            let called = false;
            system.registerHook('adventureLeveledUp', () => { called = true; });
            system.levelUpAdventure(adventure.adventureId);
            expect(called).toBe(true);
        });
    });

    describe('conquerAdventure', () => {
        it('should set status to conquered', () => {
            const { adventure } = system.startAdventure({});
            system.conquerAdventure(adventure.adventureId);
            expect(adventure.status).toBe('conquered');
        });

        it('should reject missing adventure', () => {
            const result = system.conquerAdventure('ghost');
            expect(result.error).toBe('ADVENTURE_NOT_FOUND');
        });

        it('should trigger adventureConquered hook', () => {
            const { adventure } = system.startAdventure({});
            let called = false;
            system.registerHook('adventureConquered', () => { called = true; });
            system.conquerAdventure(adventure.adventureId);
            expect(called).toBe(true);
        });
    });

    describe('calculateAdventureValue', () => {
        it('should calculate value', () => {
            const { adventure } = system.startAdventure({});
            system.addLocation(adventure.adventureId, 'place1');
            system.addLocation(adventure.adventureId, 'place2');
            system.levelUpAdventure(adventure.adventureId);
            // level=2, challenge=20, locations=2 → 2*100 + 20*2 + 2*30 = 200 + 40 + 60 = 300
            expect(system.calculateAdventureValue(adventure.adventureId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateAdventureValue('ghost')).toBe(0);
        });

        it('should calculate base value with defaults', () => {
            const { adventure } = system.startAdventure({});
            // level=1, challenge=20, locations=0 → 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateAdventureValue(adventure.adventureId)).toBe(140);
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

        it('should handle tool errors', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('x');
        });

        it('should execute default getAdventure', () => {
            const result = system.executeTool('getAdventure', { adventureId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('adventureStarted', () => count++);
            unregister();
            system.startAdventure({});
            expect(count).toBe(0);
        });

        it('should handle hook errors silently', () => {
            system.registerHook('adventureStarted', () => { throw new Error('x'); });
            expect(() => system.startAdventure({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient adventures', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalAdventures = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalAdventures = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startAdventure({});
            const json = system.toJSON();
            expect(json.adventures.length).toBe(1);
        });

        it('should deserialize', () => {
            system.startAdventure({});
            const json = system.toJSON();
            const newSys = new CultivationAdventure();
            newSys.fromJSON(json);
            expect(newSys.adventures.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.adventureCount).toBe(0);
        });

        it('should reflect adventures count', () => {
            system.startAdventure({});
            const stats = system.getStats();
            expect(stats.adventureCount).toBe(1);
        });
    });
});
