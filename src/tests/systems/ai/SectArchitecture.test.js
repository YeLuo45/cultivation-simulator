/**
 * SectArchitecture.test.js - 宗门建筑测试
 * V477 Iteration 9/15 Round 18 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectArchitecture } from '../../../systems/ai/SectArchitecture.js';

describe('SectArchitecture', () => {
    let system;
    beforeEach(() => { system = new SectArchitecture(); });

    describe('designBuilding', () => {
        it('should design', () => {
            const { building } = system.designBuilding({ sectId: 's1', name: 'Main Hall', type: 'hall' });
            expect(building.sectId).toBe('s1');
            expect(building.name).toBe('Main Hall');
            expect(building.type).toBe('hall');
        });

        it('should default to hall type and planning status', () => {
            const { building } = system.designBuilding({ sectId: 's1' });
            expect(building.type).toBe('hall');
            expect(building.status).toBe('planning');
            expect(building.floors).toBe(1);
        });

        it('should trigger buildingDesigned hook', () => {
            let called = false;
            system.registerHook('buildingDesigned', () => { called = true; });
            system.designBuilding({});
            expect(called).toBe(true);
        });
    });

    describe('getBuilding', () => {
        it('should return', () => {
            const { building } = system.designBuilding({});
            expect(system.getBuilding(building.buildingId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBuilding('ghost')).toBeNull(); });
    });

    describe('listBuildings', () => {
        it('should list all', () => {
            system.designBuilding({});
            system.designBuilding({});
            expect(system.listBuildings().length).toBe(2);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.designBuilding({ sectId: 's1' });
            system.designBuilding({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.designBuilding({ type: 'hall' });
            system.designBuilding({ type: 'tower' });
            system.designBuilding({ type: 'garden' });
            expect(system.listByType('tower').length).toBe(1);
        });
    });

    describe('addFloor', () => {
        it('should add floor', () => {
            const { building } = system.designBuilding({});
            system.addFloor(building.buildingId);
            expect(building.floors).toBe(2);
        });

        it('should flip planning to built on first addFloor', () => {
            const { building } = system.designBuilding({});
            system.addFloor(building.buildingId);
            expect(building.status).toBe('built');
        });

        it('should reject missing', () => {
            const result = system.addFloor('ghost');
            expect(result.error).toBe('BUILDING_NOT_FOUND');
        });

        it('should trigger floorAdded hook', () => {
            const { building } = system.designBuilding({});
            let called = false;
            system.registerHook('floorAdded', () => { called = true; });
            system.addFloor(building.buildingId);
            expect(called).toBe(true);
        });
    });

    describe('reinforceBuilding', () => {
        it('should reinforce', () => {
            const { building } = system.designBuilding({});
            system.reinforceBuilding(building.buildingId, 7);
            expect(building.defenses).toBe(7);
        });

        it('should use default amount of 5', () => {
            const { building } = system.designBuilding({});
            system.reinforceBuilding(building.buildingId);
            expect(building.defenses).toBe(5);
        });

        it('should flip planning to built on reinforce', () => {
            const { building } = system.designBuilding({});
            system.reinforceBuilding(building.buildingId);
            expect(building.status).toBe('built');
        });

        it('should reject missing', () => {
            const result = system.reinforceBuilding('ghost');
            expect(result.error).toBe('BUILDING_NOT_FOUND');
        });

        it('should trigger buildingReinforced hook', () => {
            const { building } = system.designBuilding({});
            let called = false;
            system.registerHook('buildingReinforced', () => { called = true; });
            system.reinforceBuilding(building.buildingId);
            expect(called).toBe(true);
        });
    });

    describe('damageBuilding', () => {
        it('should damage', () => {
            const { building } = system.designBuilding({});
            system.reinforceBuilding(building.buildingId, 20);
            system.damageBuilding(building.buildingId, 5);
            expect(building.defenses).toBe(15);
        });

        it('should use default amount of 10', () => {
            const { building } = system.designBuilding({});
            system.reinforceBuilding(building.buildingId, 20);
            system.damageBuilding(building.buildingId);
            expect(building.defenses).toBe(10);
        });

        it('should clamp defenses to 0', () => {
            const { building } = system.designBuilding({});
            system.damageBuilding(building.buildingId, 50);
            expect(building.defenses).toBe(0);
            expect(building.status).toBe('damaged');
        });

        it('should reject missing', () => {
            const result = system.damageBuilding('ghost');
            expect(result.error).toBe('BUILDING_NOT_FOUND');
        });
    });

    describe('demolishBuilding', () => {
        it('should set status to damaged', () => {
            const { building } = system.designBuilding({});
            system.demolishBuilding(building.buildingId);
            expect(building.status).toBe('damaged');
        });

        it('should reject missing', () => {
            const result = system.demolishBuilding('ghost');
            expect(result.error).toBe('BUILDING_NOT_FOUND');
        });

        it('should trigger buildingDemolished hook', () => {
            const { building } = system.designBuilding({});
            let called = false;
            system.registerHook('buildingDemolished', () => { called = true; });
            system.demolishBuilding(building.buildingId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBuildingValue', () => {
        it('should calculate value', () => {
            const { building } = system.designBuilding({});
            system.reinforceBuilding(building.buildingId, 5);
            // floors=1, defenses=5 => 1*100 + 5*2 = 110
            expect(system.calculateBuildingValue(building.buildingId)).toBe(110);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBuildingValue('ghost')).toBe(0);
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

        it('should execute default getBuilding', () => {
            const result = system.executeTool('getBuilding', { buildingId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('buildingDesigned', () => count++);
            unregister();
            system.designBuilding({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('buildingDesigned', () => { throw new Error('x'); });
            expect(() => system.designBuilding({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBuildings = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBuildings = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.designBuilding({});
            const json = system.toJSON();
            expect(json.buildings.length).toBe(1);
        });
        it('should deserialize', () => {
            system.designBuilding({});
            const json = system.toJSON();
            const newSys = new SectArchitecture();
            newSys.fromJSON(json);
            expect(newSys.buildings.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.buildingCount).toBe(0);
        });
    });
});
