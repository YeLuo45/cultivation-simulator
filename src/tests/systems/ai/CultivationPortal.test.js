/**
 * CultivationPortal.test.js - 修真传送门系统测试
 * V757 Iteration 20/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPortal } from '../../../systems/ai/CultivationPortal.js';

describe('CultivationPortal', () => {
    let system;
    beforeEach(() => { system = new CultivationPortal(); });

    describe('recruitPortal', () => {
        it('should recruit portal', () => {
            const { portal } = system.recruitPortal({ masterId: 'm1', name: 'Celestial Portal', type: 'dimensional' });
            expect(portal.masterId).toBe('m1');
            expect(portal.name).toBe('Celestial Portal');
            expect(portal.type).toBe('dimensional');
        });

        it('should default type to small', () => {
            const { portal } = system.recruitPortal({});
            expect(portal.type).toBe('small');
        });

        it('should default name to Unnamed Portal', () => {
            const { portal } = system.recruitPortal({});
            expect(portal.name).toBe('Unnamed Portal');
        });

        it('should default distortion to baseDistortion', () => {
            const { portal } = system.recruitPortal({});
            expect(portal.distortion).toBe(20);
        });

        it('should start at level 1', () => {
            const { portal } = system.recruitPortal({});
            expect(portal.level).toBe(1);
        });

        it('should start with status novice', () => {
            const { portal } = system.recruitPortal({});
            expect(portal.status).toBe('novice');
        });

        it('should start with empty coordinates', () => {
            const { portal } = system.recruitPortal({});
            expect(portal.coordinates).toEqual([]);
        });

        it('should generate portalId', () => {
            const { portal } = system.recruitPortal({});
            expect(portal.portalId).toBeDefined();
            expect(typeof portal.portalId).toBe('string');
        });

        it('should accept custom portalId', () => {
            const { portal } = system.recruitPortal({ portalId: 'my-portal' });
            expect(portal.portalId).toBe('my-portal');
        });

        it('should support all types', () => {
            const { portal: p1 } = system.recruitPortal({ type: 'small' });
            const { portal: p2 } = system.recruitPortal({ type: 'grand' });
            const { portal: p3 } = system.recruitPortal({ type: 'dimensional' });
            expect(p1.type).toBe('small');
            expect(p2.type).toBe('grand');
            expect(p3.type).toBe('dimensional');
        });

        it('should trigger portalRecruited hook', () => {
            let called = false;
            system.registerHook('portalRecruited', () => { called = true; });
            system.recruitPortal({});
            expect(called).toBe(true);
        });

        it('should accept custom distortion', () => {
            const { portal } = system.recruitPortal({ distortion: 99 });
            expect(portal.distortion).toBe(99);
        });
    });

    describe('getPortal', () => {
        it('should return portal', () => {
            const { portal } = system.recruitPortal({});
            expect(system.getPortal(portal.portalId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPortal('ghost')).toBeNull(); });
    });

    describe('listPortals', () => {
        it('should list all', () => {
            system.recruitPortal({});
            system.recruitPortal({});
            expect(system.listPortals().length).toBe(2);
        });

        it('should return empty when no portals', () => {
            expect(system.listPortals().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitPortal({ masterId: 'm1' });
            system.recruitPortal({ masterId: 'm2' });
            system.recruitPortal({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for missing master', () => {
            system.recruitPortal({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { portal: p1 } = system.recruitPortal({});
            const { portal: p2 } = system.recruitPortal({});
            system.legendPortal(p1.portalId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].portalId).toBe(p1.portalId);
        });

        it('should return empty when none legendary', () => {
            system.recruitPortal({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addCoordinate', () => {
        it('should add coordinate', () => {
            const { portal } = system.recruitPortal({});
            system.addCoordinate(portal.portalId, 'x:100,y:200');
            expect(portal.coordinates).toContain('x:100,y:200');
            expect(portal.coordinates.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addCoordinate('ghost', 'coord');
            expect(result.error).toBe('PORTAL_NOT_FOUND');
        });

        it('should trigger coordinateAdded hook', () => {
            const { portal } = system.recruitPortal({});
            let called = false;
            system.registerHook('coordinateAdded', () => { called = true; });
            system.addCoordinate(portal.portalId, 'coord');
            expect(called).toBe(true);
        });

        it('should add multiple coordinates', () => {
            const { portal } = system.recruitPortal({});
            system.addCoordinate(portal.portalId, 'coord1');
            system.addCoordinate(portal.portalId, 'coord2');
            expect(portal.coordinates.length).toBe(2);
        });
    });

    describe('raiseDistortion', () => {
        it('should raise distortion', () => {
            const { portal } = system.recruitPortal({});
            system.raiseDistortion(portal.portalId, 10);
            expect(portal.distortion).toBe(30);
        });

        it('should default amount to 5', () => {
            const { portal } = system.recruitPortal({});
            system.raiseDistortion(portal.portalId);
            expect(portal.distortion).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseDistortion('ghost', 10);
            expect(result.error).toBe('PORTAL_NOT_FOUND');
        });

        it('should trigger distortionRaised hook', () => {
            const { portal } = system.recruitPortal({});
            let called = false;
            system.registerHook('distortionRaised', () => { called = true; });
            system.raiseDistortion(portal.portalId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpPortal', () => {
        it('should level up', () => {
            const { portal } = system.recruitPortal({});
            system.levelUpPortal(portal.portalId);
            expect(portal.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpPortal('ghost');
            expect(result.error).toBe('PORTAL_NOT_FOUND');
        });

        it('should trigger portalLeveledUp hook', () => {
            const { portal } = system.recruitPortal({});
            let called = false;
            system.registerHook('portalLeveledUp', () => { called = true; });
            system.levelUpPortal(portal.portalId);
            expect(called).toBe(true);
        });
    });

    describe('legendPortal', () => {
        it('should set status to legendary', () => {
            const { portal } = system.recruitPortal({});
            system.legendPortal(portal.portalId);
            expect(portal.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendPortal('ghost');
            expect(result.error).toBe('PORTAL_NOT_FOUND');
        });

        it('should trigger portalLegendized hook', () => {
            const { portal } = system.recruitPortal({});
            let called = false;
            system.registerHook('portalLegendized', () => { called = true; });
            system.legendPortal(portal.portalId);
            expect(called).toBe(true);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitPortal({ type: 'small' });
            system.recruitPortal({ type: 'grand' });
            system.recruitPortal({ type: 'dimensional' });
            expect(system.listByType('grand').length).toBe(1);
        });

        it('should return empty for missing type', () => {
            system.recruitPortal({ type: 'small' });
            expect(system.listByType('cosmic').length).toBe(0);
        });
    });

    describe('listVeteran', () => {
        it('should return empty when no veteran portals', () => {
            system.recruitPortal({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('calculatePortalValue', () => {
        it('should calculate for default portal', () => {
            const { portal } = system.recruitPortal({});
            // level 1 * 100 + distortion 20 * 2 + 0 coordinates * 30 = 100 + 40 + 0 = 140
            expect(system.calculatePortalValue(portal.portalId)).toBe(140);
        });

        it('should incorporate level, distortion, and coordinates', () => {
            const { portal } = system.recruitPortal({});
            system.levelUpPortal(portal.portalId); // level 2
            system.raiseDistortion(portal.portalId, 10); // distortion 30
            system.addCoordinate(portal.portalId, 'c1'); // 1 coordinate
            system.addCoordinate(portal.portalId, 'c2'); // 2 coordinates
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculatePortalValue(portal.portalId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePortalValue('ghost')).toBe(0);
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

        it('should execute default getPortal', () => {
            const result = system.executeTool('getPortal', { portalId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitPortal', () => {
            const result = system.executeTool('recruitPortal', { masterId: 'mx' });
            expect(result.success).toBe(true);
        });

        it('should handle missing context gracefully', () => {
            system.registerTool('test', () => 'no-ctx');
            const result = system.executeTool('test');
            expect(result.result).toBe('no-ctx');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('portalRecruited', () => count++);
            unregister();
            system.recruitPortal({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('portalRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitPortal({})).not.toThrow();
        });

        it('should handle unregister on already-cleared event', () => {
            const unregister = system.registerHook('never-fired', () => {});
            unregister();
            // call again after map entry is removed
            unregister();
            expect(true).toBe(true);
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPortals = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPortals = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitPortal({});
            const json = system.toJSON();
            expect(json.portals.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitPortal({});
            const json = system.toJSON();
            const newSys = new CultivationPortal();
            newSys.fromJSON(json);
            expect(newSys.portals.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.portalCount).toBe(0);
        });
    });
});
