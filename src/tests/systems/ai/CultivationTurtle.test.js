/**
 * CultivationTurtle.test.js - 修真龟测试
 * V722 Iteration 15/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTurtle } from '../../../systems/ai/CultivationTurtle.js';

describe('CultivationTurtle', () => {
    let system;
    beforeEach(() => { system = new CultivationTurtle(); });

    describe('recruitTurtle', () => {
        it('should create', () => {
            const { turtle } = system.recruitTurtle({ name: 'Aurelius' });
            expect(turtle.name).toBe('Aurelius');
        });

        it('should default type to sea', () => {
            const { turtle } = system.recruitTurtle({});
            expect(turtle.type).toBe('sea');
        });

        it('should default endurance to baseEndurance', () => {
            const { turtle } = system.recruitTurtle({});
            expect(turtle.endurance).toBe(20);
        });

        it('should default status to novice', () => {
            const { turtle } = system.recruitTurtle({});
            expect(turtle.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { turtle } = system.recruitTurtle({});
            expect(turtle.level).toBe(1);
        });

        it('should initialize empty shells array', () => {
            const { turtle } = system.recruitTurtle({});
            expect(Array.isArray(turtle.shells)).toBe(true);
            expect(turtle.shells.length).toBe(0);
        });

        it('should trigger turtleRecruited hook', () => {
            let called = false;
            system.registerHook('turtleRecruited', () => { called = true; });
            system.recruitTurtle({});
            expect(called).toBe(true);
        });
    });

    describe('getTurtle', () => {
        it('should return', () => {
            const { turtle } = system.recruitTurtle({});
            expect(system.getTurtle(turtle.turtleId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTurtle('ghost')).toBeNull(); });
    });

    describe('listTurtles', () => {
        it('should list all', () => {
            system.recruitTurtle({});
            system.recruitTurtle({});
            expect(system.listTurtles().length).toBe(2);
        });

        it('should return empty array initially', () => {
            expect(system.listTurtles().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitTurtle({ masterId: 'm1' });
            system.recruitTurtle({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.recruitTurtle({ type: 'sea' });
            system.recruitTurtle({ type: 'divine' });
            expect(system.listByType('sea').length).toBe(1);
        });
    });

    describe('listByEndurance', () => {
        it('should filter', () => {
            const { turtle: t1 } = system.recruitTurtle({ endurance: 50 });
            system.recruitTurtle({ endurance: 10 });
            expect(system.listByEndurance(30).length).toBe(1);
            expect(system.listByEndurance(30)[0].turtleId).toBe(t1.turtleId);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            system.recruitTurtle({});
            expect(system.listLegendary().length).toBe(0);
        });

        it('should include legendized turtles', () => {
            const { turtle } = system.recruitTurtle({});
            system.legendTurtle(turtle.turtleId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('listTop', () => {
        it('should return top', () => {
            system.recruitTurtle({});
            expect(system.listTop(2).length).toBe(1);
        });
    });

    describe('refreshTurtle', () => {
        it('should refresh', () => {
            const { turtle } = system.recruitTurtle({});
            const result = system.refreshTurtle(turtle.turtleId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.refreshTurtle('ghost');
            expect(result.error).toBe('TURTLE_NOT_FOUND');
        });

        it('should trigger turtleRefreshed hook', () => {
            const { turtle } = system.recruitTurtle({});
            let called = false;
            system.registerHook('turtleRefreshed', () => { called = true; });
            system.refreshTurtle(turtle.turtleId);
            expect(called).toBe(true);
        });
    });

    describe('addShell', () => {
        it('should add', () => {
            const { turtle } = system.recruitTurtle({});
            const result = system.addShell(turtle.turtleId, 'iron-shell');
            expect(result.success).toBe(true);
            expect(turtle.shells.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addShell('ghost', 'shell');
            expect(result.error).toBe('TURTLE_NOT_FOUND');
        });

        it('should trigger shellAdded hook', () => {
            const { turtle } = system.recruitTurtle({});
            let called = false;
            system.registerHook('shellAdded', () => { called = true; });
            system.addShell(turtle.turtleId, 'jade-shell');
            expect(called).toBe(true);
        });
    });

    describe('raiseEndurance', () => {
        it('should raise with default amount', () => {
            const { turtle } = system.recruitTurtle({});
            system.raiseEndurance(turtle.turtleId);
            expect(turtle.endurance).toBe(25);
        });

        it('should raise with custom amount', () => {
            const { turtle } = system.recruitTurtle({});
            system.raiseEndurance(turtle.turtleId, 10);
            expect(turtle.endurance).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseEndurance('ghost', 5);
            expect(result.error).toBe('TURTLE_NOT_FOUND');
        });

        it('should trigger enduranceRaised hook', () => {
            const { turtle } = system.recruitTurtle({});
            let called = false;
            system.registerHook('enduranceRaised', () => { called = true; });
            system.raiseEndurance(turtle.turtleId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpTurtle', () => {
        it('should level up', () => {
            const { turtle } = system.recruitTurtle({});
            system.levelUpTurtle(turtle.turtleId);
            expect(turtle.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpTurtle('ghost');
            expect(result.error).toBe('TURTLE_NOT_FOUND');
        });

        it('should trigger turtleLeveledUp hook', () => {
            const { turtle } = system.recruitTurtle({});
            let called = false;
            system.registerHook('turtleLeveledUp', () => { called = true; });
            system.levelUpTurtle(turtle.turtleId);
            expect(called).toBe(true);
        });
    });

    describe('trainTurtle', () => {
        it('should train', () => {
            const { turtle } = system.recruitTurtle({});
            const result = system.trainTurtle(turtle.turtleId);
            expect(result.success).toBe(true);
            expect(turtle.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.trainTurtle('ghost');
            expect(result.error).toBe('TURTLE_NOT_FOUND');
        });

        it('should trigger turtleTrained hook', () => {
            const { turtle } = system.recruitTurtle({});
            let called = false;
            system.registerHook('turtleTrained', () => { called = true; });
            system.trainTurtle(turtle.turtleId);
            expect(called).toBe(true);
        });
    });

    describe('legendTurtle', () => {
        it('should legend', () => {
            const { turtle } = system.recruitTurtle({});
            const result = system.legendTurtle(turtle.turtleId);
            expect(result.success).toBe(true);
            expect(turtle.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendTurtle('ghost');
            expect(result.error).toBe('TURTLE_NOT_FOUND');
        });

        it('should trigger turtleLegendized hook', () => {
            const { turtle } = system.recruitTurtle({});
            let called = false;
            system.registerHook('turtleLegendized', () => { called = true; });
            system.legendTurtle(turtle.turtleId);
            expect(called).toBe(true);
        });
    });

    describe('changeType', () => {
        it('should change', () => {
            const { turtle } = system.recruitTurtle({});
            const result = system.changeType(turtle.turtleId, 'primordial');
            expect(result.success).toBe(true);
            expect(turtle.type).toBe('primordial');
        });

        it('should reject missing', () => {
            const result = system.changeType('ghost', 'divine');
            expect(result.error).toBe('TURTLE_NOT_FOUND');
        });

        it('should trigger typeChanged hook', () => {
            const { turtle } = system.recruitTurtle({});
            let called = false;
            system.registerHook('typeChanged', () => { called = true; });
            system.changeType(turtle.turtleId, 'divine');
            expect(called).toBe(true);
        });
    });

    describe('calculateTurtleValue', () => {
        it('should calculate base value', () => {
            const { turtle } = system.recruitTurtle({});
            // level=1, endurance=20, shells=0 -> 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateTurtleValue(turtle.turtleId)).toBe(140);
        });

        it('should include shells in value', () => {
            const { turtle } = system.recruitTurtle({});
            system.addShell(turtle.turtleId, 'shell1');
            system.addShell(turtle.turtleId, 'shell2');
            // level=1, endurance=20, shells=2 -> 100 + 40 + 60 = 200
            expect(system.calculateTurtleValue(turtle.turtleId)).toBe(200);
        });

        it('should scale with level', () => {
            const { turtle } = system.recruitTurtle({});
            system.levelUpTurtle(turtle.turtleId);
            system.levelUpTurtle(turtle.turtleId);
            // level=3, endurance=20, shells=0 -> 300 + 40 = 340
            expect(system.calculateTurtleValue(turtle.turtleId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTurtleValue('ghost')).toBe(0);
        });
    });

    describe('deleteTurtle', () => {
        it('should delete', () => {
            const { turtle } = system.recruitTurtle({});
            const result = system.deleteTurtle(turtle.turtleId);
            expect(result.success).toBe(true);
            expect(system.getTurtle(turtle.turtleId)).toBeNull();
        });

        it('should reject missing', () => {
            const result = system.deleteTurtle('ghost');
            expect(result.error).toBe('TURTLE_NOT_FOUND');
        });

        it('should trigger turtleDeleted hook', () => {
            const { turtle } = system.recruitTurtle({});
            let called = false;
            system.registerHook('turtleDeleted', () => { called = true; });
            system.deleteTurtle(turtle.turtleId);
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

        it('should execute default getTurtle tool', () => {
            const { turtle } = system.recruitTurtle({});
            const result = system.executeTool('getTurtle', { turtleId: turtle.turtleId });
            expect(result.result).not.toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('turtleRecruited', () => count++);
            unregister();
            system.recruitTurtle({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('turtleRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitTurtle({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTurtles = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTurtles = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitTurtle({});
            const json = system.toJSON();
            expect(json.turtles.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitTurtle({});
            const json = system.toJSON();
            const newSys = new CultivationTurtle();
            newSys.fromJSON(json);
            expect(newSys.turtles.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.turtleCount).toBe(0);
        });

        it('should reflect recruited count', () => {
            system.recruitTurtle({});
            expect(system.getStats().turtleCount).toBe(1);
        });
    });
});
