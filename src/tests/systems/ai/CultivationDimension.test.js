/**
 * CultivationDimension.test.js - 修真维度测试
 * V679 Iteration 2/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDimension } from '../../../systems/ai/CultivationDimension.js';

describe('CultivationDimension', () => {
    let system;
    beforeEach(() => { system = new CultivationDimension(); });

    describe('recruitDimension', () => {
        it('should create a dimension', () => {
            const { dimension } = system.recruitDimension({ masterId: 'm1', name: 'Azure Void', type: 'void' });
            expect(dimension.masterId).toBe('m1');
            expect(dimension.name).toBe('Azure Void');
            expect(dimension.type).toBe('void');
        });

        it('should default name to Cultivation Dimension', () => {
            const { dimension } = system.recruitDimension({});
            expect(dimension.name).toBe('Cultivation Dimension');
        });

        it('should default type to spatial', () => {
            const { dimension } = system.recruitDimension({});
            expect(dimension.type).toBe('spatial');
        });

        it('should default depth to baseDepth (20)', () => {
            const { dimension } = system.recruitDimension({});
            expect(dimension.depth).toBe(20);
        });

        it('should default portals to empty array', () => {
            const { dimension } = system.recruitDimension({});
            expect(dimension.portals).toEqual([]);
        });

        it('should default level to 1', () => {
            const { dimension } = system.recruitDimension({});
            expect(dimension.level).toBe(1);
        });

        it('should default status to novice', () => {
            const { dimension } = system.recruitDimension({});
            expect(dimension.status).toBe('novice');
        });

        it('should accept temporal type', () => {
            const { dimension } = system.recruitDimension({ type: 'temporal' });
            expect(dimension.type).toBe('temporal');
        });

        it('should accept veteran status', () => {
            const { dimension } = system.recruitDimension({ status: 'veteran' });
            expect(dimension.status).toBe('veteran');
        });

        it('should use provided id', () => {
            const { dimension } = system.recruitDimension({ id: 'my_id' });
            expect(dimension.dimensionId).toBe('my_id');
        });

        it('should accept custom portals', () => {
            const portals = [{ id: 'p1' }, { id: 'p2' }];
            const { dimension } = system.recruitDimension({ portals });
            expect(dimension.portals).toEqual(portals);
        });

        it('should accept custom depth', () => {
            const { dimension } = system.recruitDimension({ depth: 100 });
            expect(dimension.depth).toBe(100);
        });

        it('should trigger dimensionRecruited hook', () => {
            let called = false;
            system.registerHook('dimensionRecruited', () => { called = true; });
            system.recruitDimension({});
            expect(called).toBe(true);
        });
    });

    describe('getDimension', () => {
        it('should return dimension', () => {
            const { dimension } = system.recruitDimension({});
            expect(system.getDimension(dimension.dimensionId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDimension('ghost')).toBeNull(); });
    });

    describe('listDimensions', () => {
        it('should list all', () => {
            system.recruitDimension({});
            expect(system.listDimensions().length).toBe(1);
        });

        it('should return empty list when no dimensions', () => {
            expect(system.listDimensions().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitDimension({ masterId: 'm1' });
            system.recruitDimension({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitDimension({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary status', () => {
            system.recruitDimension({});
            system.recruitDimension({ status: 'legendary' });
            system.recruitDimension({ status: 'legendary' });
            expect(system.listLegendary().length).toBe(2);
        });

        it('should return empty when no legendary', () => {
            system.recruitDimension({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addPortal', () => {
        it('should add a portal', () => {
            const { dimension } = system.recruitDimension({});
            system.addPortal(dimension.dimensionId, { id: 'p1', target: 'realm1' });
            expect(dimension.portals.length).toBe(1);
            expect(dimension.portals[0].id).toBe('p1');
        });

        it('should accumulate portals', () => {
            const { dimension } = system.recruitDimension({});
            system.addPortal(dimension.dimensionId, { id: 'p1' });
            system.addPortal(dimension.dimensionId, { id: 'p2' });
            system.addPortal(dimension.dimensionId, { id: 'p3' });
            expect(dimension.portals.length).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.addPortal('ghost', { id: 'p1' });
            expect(result.error).toBe('DIMENSION_NOT_FOUND');
        });

        it('should trigger portalAdded hook', () => {
            const { dimension } = system.recruitDimension({});
            let called = false;
            system.registerHook('portalAdded', () => { called = true; });
            system.addPortal(dimension.dimensionId, { id: 'p1' });
            expect(called).toBe(true);
        });
    });

    describe('deepenDepth', () => {
        it('should deepen', () => {
            const { dimension } = system.recruitDimension({});
            system.deepenDepth(dimension.dimensionId, 10);
            expect(dimension.depth).toBe(30);
        });

        it('should use default amount of 5', () => {
            const { dimension } = system.recruitDimension({});
            system.deepenDepth(dimension.dimensionId);
            expect(dimension.depth).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.deepenDepth('ghost', 10);
            expect(result.error).toBe('DIMENSION_NOT_FOUND');
        });

        it('should trigger depthDeepened hook', () => {
            const { dimension } = system.recruitDimension({});
            let called = false;
            system.registerHook('depthDeepened', () => { called = true; });
            system.deepenDepth(dimension.dimensionId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDimension', () => {
        it('should level up', () => {
            const { dimension } = system.recruitDimension({});
            system.levelUpDimension(dimension.dimensionId);
            expect(dimension.level).toBe(2);
        });

        it('should accumulate level', () => {
            const { dimension } = system.recruitDimension({});
            system.levelUpDimension(dimension.dimensionId);
            system.levelUpDimension(dimension.dimensionId);
            system.levelUpDimension(dimension.dimensionId);
            expect(dimension.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpDimension('ghost');
            expect(result.error).toBe('DIMENSION_NOT_FOUND');
        });

        it('should trigger dimensionLeveledUp hook', () => {
            const { dimension } = system.recruitDimension({});
            let called = false;
            system.registerHook('dimensionLeveledUp', () => { called = true; });
            system.levelUpDimension(dimension.dimensionId);
            expect(called).toBe(true);
        });
    });

    describe('legendDimension', () => {
        it('should set status to legendary', () => {
            const { dimension } = system.recruitDimension({});
            system.legendDimension(dimension.dimensionId);
            expect(dimension.status).toBe('legendary');
        });

        it('should override veteran status', () => {
            const { dimension } = system.recruitDimension({ status: 'veteran' });
            system.legendDimension(dimension.dimensionId);
            expect(dimension.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendDimension('ghost');
            expect(result.error).toBe('DIMENSION_NOT_FOUND');
        });

        it('should trigger dimensionLegendized hook', () => {
            const { dimension } = system.recruitDimension({});
            let called = false;
            system.registerHook('dimensionLegendized', () => { called = true; });
            system.legendDimension(dimension.dimensionId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDimensionValue', () => {
        it('should calculate with default values', () => {
            const { dimension } = system.recruitDimension({});
            // level=1, depth=20, portals=0 -> 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateDimensionValue(dimension.dimensionId)).toBe(140);
        });

        it('should reflect level changes', () => {
            const { dimension } = system.recruitDimension({});
            system.levelUpDimension(dimension.dimensionId);
            system.levelUpDimension(dimension.dimensionId);
            // level=3, depth=20, portals=0 -> 3*100 + 20*2 + 0*30 = 340
            expect(system.calculateDimensionValue(dimension.dimensionId)).toBe(340);
        });

        it('should reflect depth changes', () => {
            const { dimension } = system.recruitDimension({});
            system.deepenDepth(dimension.dimensionId, 30);
            // level=1, depth=50, portals=0 -> 1*100 + 50*2 + 0*30 = 200
            expect(system.calculateDimensionValue(dimension.dimensionId)).toBe(200);
        });

        it('should reflect portals changes', () => {
            const { dimension } = system.recruitDimension({});
            system.addPortal(dimension.dimensionId, { id: 'p1' });
            system.addPortal(dimension.dimensionId, { id: 'p2' });
            // level=1, depth=20, portals=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateDimensionValue(dimension.dimensionId)).toBe(200);
        });

        it('should reflect all changes combined', () => {
            const { dimension } = system.recruitDimension({});
            system.levelUpDimension(dimension.dimensionId);
            system.deepenDepth(dimension.dimensionId, 10);
            system.addPortal(dimension.dimensionId, { id: 'p1' });
            // level=2, depth=30, portals=1 -> 2*100 + 30*2 + 1*30 = 290
            expect(system.calculateDimensionValue(dimension.dimensionId)).toBe(290);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDimensionValue('ghost')).toBe(0);
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

        it('should execute default getDimension', () => {
            const result = system.executeTool('getDimension', { dimensionId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitDimension', () => {
            const result = system.executeTool('recruitDimension', { masterId: 'm1' });
            expect(result.success).toBe(true);
            expect(result.result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('dimensionRecruited', () => count++);
            unregister();
            system.recruitDimension({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('dimensionRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDimension({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDimensions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDimensions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDimension({});
            const json = system.toJSON();
            expect(json.dimensions.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitDimension({});
            const json = system.toJSON();
            const newSys = new CultivationDimension();
            newSys.fromJSON(json);
            expect(newSys.dimensions.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.dimensionCount).toBe(0);
        });

        it('should include dimensionCount after recruit', () => {
            system.recruitDimension({});
            const stats = system.getStats();
            expect(stats.dimensionCount).toBe(1);
            expect(stats.totalDimensions).toBe(1);
        });
    });
});
