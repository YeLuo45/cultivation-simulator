/**
 * CultivationDoor.test.js - 修真门系统测试
 * V753 Iteration 16/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDoor } from '../../../systems/ai/CultivationDoor.js';

describe('CultivationDoor', () => {
    let system;
    beforeEach(() => { system = new CultivationDoor(); });

    describe('recruitDoor', () => {
        it('should recruit door', () => {
            const { door } = system.recruitDoor({ masterId: 'm1', name: 'Celestial Door', type: 'divine' });
            expect(door.masterId).toBe('m1');
            expect(door.name).toBe('Celestial Door');
            expect(door.type).toBe('divine');
        });

        it('should default type to wooden', () => {
            const { door } = system.recruitDoor({});
            expect(door.type).toBe('wooden');
        });

        it('should default name to Unnamed Door', () => {
            const { door } = system.recruitDoor({});
            expect(door.name).toBe('Unnamed Door');
        });

        it('should default mystery to baseMystery', () => {
            const { door } = system.recruitDoor({});
            expect(door.mystery).toBe(20);
        });

        it('should start at level 1', () => {
            const { door } = system.recruitDoor({});
            expect(door.level).toBe(1);
        });

        it('should start with status novice', () => {
            const { door } = system.recruitDoor({});
            expect(door.status).toBe('novice');
        });

        it('should start with empty hinges', () => {
            const { door } = system.recruitDoor({});
            expect(door.hinges).toEqual([]);
        });

        it('should generate doorId', () => {
            const { door } = system.recruitDoor({});
            expect(door.doorId).toBeDefined();
            expect(typeof door.doorId).toBe('string');
        });

        it('should accept custom doorId', () => {
            const { door } = system.recruitDoor({ doorId: 'my-door' });
            expect(door.doorId).toBe('my-door');
        });

        it('should support all types', () => {
            const { door: d1 } = system.recruitDoor({ type: 'wooden' });
            const { door: d2 } = system.recruitDoor({ type: 'iron' });
            const { door: d3 } = system.recruitDoor({ type: 'divine' });
            expect(d1.type).toBe('wooden');
            expect(d2.type).toBe('iron');
            expect(d3.type).toBe('divine');
        });

        it('should trigger doorRecruited hook', () => {
            let called = false;
            system.registerHook('doorRecruited', () => { called = true; });
            system.recruitDoor({});
            expect(called).toBe(true);
        });
    });

    describe('getDoor', () => {
        it('should return door', () => {
            const { door } = system.recruitDoor({});
            expect(system.getDoor(door.doorId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDoor('ghost')).toBeNull(); });
    });

    describe('listDoors', () => {
        it('should list all', () => {
            system.recruitDoor({});
            system.recruitDoor({});
            expect(system.listDoors().length).toBe(2);
        });

        it('should return empty when no doors', () => {
            expect(system.listDoors().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitDoor({ masterId: 'm1' });
            system.recruitDoor({ masterId: 'm2' });
            system.recruitDoor({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for missing master', () => {
            system.recruitDoor({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { door: d1 } = system.recruitDoor({});
            const { door: d2 } = system.recruitDoor({});
            system.legendDoor(d1.doorId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].doorId).toBe(d1.doorId);
        });

        it('should return empty when none legendary', () => {
            system.recruitDoor({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addHinge', () => {
        it('should add hinge', () => {
            const { door } = system.recruitDoor({});
            system.addHinge(door.doorId, 'gold-hinge');
            expect(door.hinges).toContain('gold-hinge');
            expect(door.hinges.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addHinge('ghost', 'hinge');
            expect(result.error).toBe('DOOR_NOT_FOUND');
        });

        it('should trigger hingeAdded hook', () => {
            const { door } = system.recruitDoor({});
            let called = false;
            system.registerHook('hingeAdded', () => { called = true; });
            system.addHinge(door.doorId, 'hinge');
            expect(called).toBe(true);
        });

        it('should add multiple hinges', () => {
            const { door } = system.recruitDoor({});
            system.addHinge(door.doorId, 'hinge1');
            system.addHinge(door.doorId, 'hinge2');
            expect(door.hinges.length).toBe(2);
        });
    });

    describe('raiseMystery', () => {
        it('should raise mystery', () => {
            const { door } = system.recruitDoor({});
            system.raiseMystery(door.doorId, 10);
            expect(door.mystery).toBe(30);
        });

        it('should default amount to 5', () => {
            const { door } = system.recruitDoor({});
            system.raiseMystery(door.doorId);
            expect(door.mystery).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseMystery('ghost', 10);
            expect(result.error).toBe('DOOR_NOT_FOUND');
        });

        it('should trigger mysteryRaised hook', () => {
            const { door } = system.recruitDoor({});
            let called = false;
            system.registerHook('mysteryRaised', () => { called = true; });
            system.raiseMystery(door.doorId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDoor', () => {
        it('should level up', () => {
            const { door } = system.recruitDoor({});
            system.levelUpDoor(door.doorId);
            expect(door.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpDoor('ghost');
            expect(result.error).toBe('DOOR_NOT_FOUND');
        });

        it('should trigger doorLeveledUp hook', () => {
            const { door } = system.recruitDoor({});
            let called = false;
            system.registerHook('doorLeveledUp', () => { called = true; });
            system.levelUpDoor(door.doorId);
            expect(called).toBe(true);
        });
    });

    describe('legendDoor', () => {
        it('should set status to legendary', () => {
            const { door } = system.recruitDoor({});
            system.legendDoor(door.doorId);
            expect(door.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendDoor('ghost');
            expect(result.error).toBe('DOOR_NOT_FOUND');
        });

        it('should trigger doorLegendized hook', () => {
            const { door } = system.recruitDoor({});
            let called = false;
            system.registerHook('doorLegendized', () => { called = true; });
            system.legendDoor(door.doorId);
            expect(called).toBe(true);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitDoor({ type: 'wooden' });
            system.recruitDoor({ type: 'iron' });
            system.recruitDoor({ type: 'divine' });
            expect(system.listByType('iron').length).toBe(1);
        });

        it('should return empty for missing type', () => {
            system.recruitDoor({ type: 'wooden' });
            expect(system.listByType('cosmic').length).toBe(0);
        });
    });

    describe('listVeteran', () => {
        it('should return empty when no veteran doors', () => {
            system.recruitDoor({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('calculateDoorValue', () => {
        it('should calculate for default door', () => {
            const { door } = system.recruitDoor({});
            // level 1 * 100 + mystery 20 * 2 + 0 hinges * 30 = 100 + 40 + 0 = 140
            expect(system.calculateDoorValue(door.doorId)).toBe(140);
        });

        it('should incorporate level, mystery, and hinges', () => {
            const { door } = system.recruitDoor({});
            system.levelUpDoor(door.doorId); // level 2
            system.raiseMystery(door.doorId, 10); // mystery 30
            system.addHinge(door.doorId, 'hinge1'); // 1 hinge
            system.addHinge(door.doorId, 'hinge2'); // 2 hinges
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateDoorValue(door.doorId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDoorValue('ghost')).toBe(0);
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

        it('should execute default getDoor', () => {
            const result = system.executeTool('getDoor', { doorId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('doorRecruited', () => count++);
            unregister();
            system.recruitDoor({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('doorRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDoor({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDoors = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDoors = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDoor({});
            const json = system.toJSON();
            expect(json.doors.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitDoor({});
            const json = system.toJSON();
            const newSys = new CultivationDoor();
            newSys.fromJSON(json);
            expect(newSys.doors.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.doorCount).toBe(0);
        });
    });
});
