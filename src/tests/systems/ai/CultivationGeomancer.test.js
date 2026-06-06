/**
 * CultivationGeomancer.test.js - 修真土系师测试
 * V631 Iteration 14/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationGeomancer } from '../../../systems/ai/CultivationGeomancer.js';

describe('CultivationGeomancer', () => {
    let system;
    beforeEach(() => { system = new CultivationGeomancer(); });

    describe('recruitGeomancer', () => {
        it('should recruit', () => {
            const { geomancer } = system.recruitGeomancer({ name: 'G1', mentorId: 'm1' });
            expect(geomancer.name).toBe('G1');
            expect(geomancer.mentorId).toBe('m1');
        });

        it('should default type to earth', () => {
            const { geomancer } = system.recruitGeomancer({});
            expect(geomancer.type).toBe('earth');
        });

        it('should accept crystal type', () => {
            const { geomancer } = system.recruitGeomancer({ type: 'crystal' });
            expect(geomancer.type).toBe('crystal');
        });

        it('should accept sand type', () => {
            const { geomancer } = system.recruitGeomancer({ type: 'sand' });
            expect(geomancer.type).toBe('sand');
        });

        it('should reject invalid type', () => {
            const result = system.recruitGeomancer({ type: 'ghost' });
            expect(result.error).toBe('INVALID_TYPE');
        });

        it('should trigger geomancerRecruited hook', () => {
            let called = false;
            system.registerHook('geomancerRecruited', () => { called = true; });
            system.recruitGeomancer({});
            expect(called).toBe(true);
        });
    });

    describe('getGeomancer', () => {
        it('should return', () => {
            const { geomancer } = system.recruitGeomancer({});
            expect(system.getGeomancer(geomancer.geomancerId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getGeomancer('ghost')).toBeNull(); });
    });

    describe('listGeomancers', () => {
        it('should list all', () => {
            system.recruitGeomancer({});
            system.recruitGeomancer({});
            expect(system.listGeomancers().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listGeomancers().length).toBe(0);
        });
    });

    describe('listByMentor', () => {
        it('should filter', () => {
            system.recruitGeomancer({ mentorId: 'm1' });
            system.recruitGeomancer({ mentorId: 'm2' });
            system.recruitGeomancer({ mentorId: 'm1' });
            expect(system.listByMentor('m1').length).toBe(2);
        });

        it('should return empty for unknown mentor', () => {
            system.recruitGeomancer({ mentorId: 'm1' });
            expect(system.listByMentor('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { geomancer: g1 } = system.recruitGeomancer({});
            const { geomancer: g2 } = system.recruitGeomancer({});
            g2.status = 'legendary';
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addFormation', () => {
        it('should add formation', () => {
            const { geomancer } = system.recruitGeomancer({});
            system.addFormation(geomancer.geomancerId, 'earth_wall');
            expect(geomancer.formations.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addFormation('ghost', 'earth_wall');
            expect(result.error).toBe('GEOMANCER_NOT_FOUND');
        });

        it('should trigger formationAdded hook', () => {
            const { geomancer } = system.recruitGeomancer({});
            let called = false;
            system.registerHook('formationAdded', () => { called = true; });
            system.addFormation(geomancer.geomancerId, 'crystal_prison');
            expect(called).toBe(true);
        });
    });

    describe('increaseStability', () => {
        it('should increase', () => {
            const { geomancer } = system.recruitGeomancer({});
            system.increaseStability(geomancer.geomancerId, 10);
            expect(geomancer.stability).toBe(30);
        });

        it('should default to 5', () => {
            const { geomancer } = system.recruitGeomancer({});
            system.increaseStability(geomancer.geomancerId);
            expect(geomancer.stability).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.increaseStability('ghost', 5);
            expect(result.error).toBe('GEOMANCER_NOT_FOUND');
        });

        it('should trigger stabilityIncreased hook', () => {
            const { geomancer } = system.recruitGeomancer({});
            let called = false;
            system.registerHook('stabilityIncreased', () => { called = true; });
            system.increaseStability(geomancer.geomancerId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpGeomancer', () => {
        it('should level up', () => {
            const { geomancer } = system.recruitGeomancer({});
            system.levelUpGeomancer(geomancer.geomancerId);
            expect(geomancer.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpGeomancer('ghost');
            expect(result.error).toBe('GEOMANCER_NOT_FOUND');
        });

        it('should trigger geomancerLeveledUp hook', () => {
            const { geomancer } = system.recruitGeomancer({});
            let called = false;
            system.registerHook('geomancerLeveledUp', () => { called = true; });
            system.levelUpGeomancer(geomancer.geomancerId);
            expect(called).toBe(true);
        });
    });

    describe('legendGeomancer', () => {
        it('should set status to legendary', () => {
            const { geomancer } = system.recruitGeomancer({});
            system.legendGeomancer(geomancer.geomancerId);
            expect(geomancer.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendGeomancer('ghost');
            expect(result.error).toBe('GEOMANCER_NOT_FOUND');
        });

        it('should trigger geomancerLegendized hook', () => {
            const { geomancer } = system.recruitGeomancer({});
            let called = false;
            system.registerHook('geomancerLegendized', () => { called = true; });
            system.legendGeomancer(geomancer.geomancerId);
            expect(called).toBe(true);
        });
    });

    describe('increaseStability - veteran promotion', () => {
        it('should promote to veteran at stability >= 100', () => {
            const { geomancer } = system.recruitGeomancer({});
            system.increaseStability(geomancer.geomancerId, 100);
            expect(geomancer.status).toBe('veteran');
        });
    });

    describe('recruitGeomancer - stability override', () => {
        it('should use provided stability', () => {
            const { geomancer } = system.recruitGeomancer({ stability: 50 });
            expect(geomancer.stability).toBe(50);
        });

        it('should accept provided id', () => {
            const { geomancer } = system.recruitGeomancer({ id: 'custom_geo_1' });
            expect(geomancer.geomancerId).toBe('custom_geo_1');
        });

        it('should accept provided name', () => {
            const { geomancer } = system.recruitGeomancer({ name: 'G2' });
            expect(geomancer.name).toBe('G2');
        });

        it('should accept provided mentorId', () => {
            const { geomancer } = system.recruitGeomancer({ mentorId: 'm1' });
            expect(geomancer.mentorId).toBe('m1');
        });
    });

    describe('calculateGeomancerValue', () => {
        it('should calculate', () => {
            const { geomancer } = system.recruitGeomancer({});
            system.addFormation(geomancer.geomancerId, 'f1');
            system.addFormation(geomancer.geomancerId, 'f2');
            // level 1 * 100 + stability 20 * 2 + formations 2 * 30 = 100 + 40 + 60 = 200
            expect(system.calculateGeomancerValue(geomancer.geomancerId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateGeomancerValue('ghost')).toBe(0);
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

        it('should handle missing context', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test', undefined);
            expect(result.success).toBe(true);
        });

        it('should execute default recruitGeomancer', () => {
            const result = system.executeTool('recruitGeomancer', { name: 'G1' });
            expect(result.result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('geomancerRecruited', () => count++);
            unregister();
            system.recruitGeomancer({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('geomancerRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitGeomancer({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalGeomancers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalGeomancers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitGeomancer({});
            const json = system.toJSON();
            expect(json.geomancers.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitGeomancer({});
            const json = system.toJSON();
            const newSys = new CultivationGeomancer();
            newSys.fromJSON(json);
            expect(newSys.geomancers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.geomancerCount).toBe(0);
        });
    });
});
