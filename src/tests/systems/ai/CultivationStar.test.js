/**
 * CultivationStar.test.js - 修真星辰系统测试
 * V683 Iteration 6/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationStar } from '../../../systems/ai/CultivationStar.js';

describe('CultivationStar', () => {
    let system;
    beforeEach(() => { system = new CultivationStar(); });

    describe('recruitStar', () => {
        it('should recruit', () => {
            const { star } = system.recruitStar({ masterId: 'm1', name: 'Polaris' });
            expect(star.masterId).toBe('m1');
            expect(star.name).toBe('Polaris');
        });

        it('should default type to north', () => {
            const { star } = system.recruitStar({});
            expect(star.type).toBe('north');
        });

        it('should default brilliance to baseBrilliance', () => {
            const { star } = system.recruitStar({});
            expect(star.brilliance).toBe(20);
        });

        it('should set status to novice', () => {
            const { star } = system.recruitStar({});
            expect(star.status).toBe('novice');
        });

        it('should increment stats', () => {
            system.recruitStar({});
            expect(system.stats.totalStars).toBe(1);
        });

        it('should trigger starRecruited hook', () => {
            let called = false;
            system.registerHook('starRecruited', () => { called = true; });
            system.recruitStar({});
            expect(called).toBe(true);
        });
    });

    describe('getStar', () => {
        it('should return star', () => {
            const { star } = system.recruitStar({});
            expect(system.getStar(star.starId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getStar('ghost')).toBeNull(); });
    });

    describe('listStars', () => {
        it('should list all', () => {
            system.recruitStar({});
            system.recruitStar({});
            expect(system.listStars().length).toBe(2);
        });
        it('should return empty list', () => {
            expect(system.listStars().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitStar({ masterId: 'm1' });
            system.recruitStar({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
        it('should return empty for unknown master', () => {
            system.recruitStar({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { star } = system.recruitStar({});
            system.legendStar(star.starId);
            system.recruitStar({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addConstellation', () => {
        it('should add constellation', () => {
            const { star } = system.recruitStar({});
            const result = system.addConstellation(star.starId, 'Orion');
            expect(result.success).toBe(true);
            expect(star.constellations).toContain('Orion');
        });

        it('should reject missing star', () => {
            const result = system.addConstellation('ghost', 'Orion');
            expect(result.error).toBe('STAR_NOT_FOUND');
        });

        it('should trigger constellationAdded hook', () => {
            const { star } = system.recruitStar({});
            let called = false;
            system.registerHook('constellationAdded', () => { called = true; });
            system.addConstellation(star.starId, 'Orion');
            expect(called).toBe(true);
        });
    });

    describe('raiseBrilliance', () => {
        it('should raise by default 5', () => {
            const { star } = system.recruitStar({});
            system.raiseBrilliance(star.starId);
            expect(star.brilliance).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { star } = system.recruitStar({});
            system.raiseBrilliance(star.starId, 10);
            expect(star.brilliance).toBe(30);
        });

        it('should reject missing star', () => {
            const result = system.raiseBrilliance('ghost', 5);
            expect(result.error).toBe('STAR_NOT_FOUND');
        });

        it('should trigger brillianceRaised hook', () => {
            const { star } = system.recruitStar({});
            let called = false;
            system.registerHook('brillianceRaised', () => { called = true; });
            system.raiseBrilliance(star.starId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpStar', () => {
        it('should level up', () => {
            const { star } = system.recruitStar({});
            system.levelUpStar(star.starId);
            expect(star.level).toBe(2);
        });

        it('should reject missing star', () => {
            const result = system.levelUpStar('ghost');
            expect(result.error).toBe('STAR_NOT_FOUND');
        });

        it('should trigger starLeveledUp hook', () => {
            const { star } = system.recruitStar({});
            let called = false;
            system.registerHook('starLeveledUp', () => { called = true; });
            system.levelUpStar(star.starId);
            expect(called).toBe(true);
        });
    });

    describe('legendStar', () => {
        it('should set status to legendary', () => {
            const { star } = system.recruitStar({});
            system.legendStar(star.starId);
            expect(star.status).toBe('legendary');
        });

        it('should reject missing star', () => {
            const result = system.legendStar('ghost');
            expect(result.error).toBe('STAR_NOT_FOUND');
        });

        it('should trigger starLegendized hook', () => {
            const { star } = system.recruitStar({});
            let called = false;
            system.registerHook('starLegendized', () => { called = true; });
            system.legendStar(star.starId);
            expect(called).toBe(true);
        });
    });

    describe('calculateStarValue', () => {
        it('should calculate value', () => {
            const { star } = system.recruitStar({});
            system.levelUpStar(star.starId); // level 2
            system.addConstellation(star.starId, 'A');
            system.addConstellation(star.starId, 'B');
            // level=2, brilliance=20, constellations=2 -> 2*100 + 20*2 + 2*30 = 200+40+60 = 300
            expect(system.calculateStarValue(star.starId)).toBe(300);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateStarValue('ghost')).toBe(0);
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

        it('should execute default getStar', () => {
            const result = system.executeTool('getStar', { starId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('starRecruited', () => count++);
            unregister();
            system.recruitStar({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('starRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitStar({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalStars = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalStars = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitStar({});
            const json = system.toJSON();
            expect(json.stars.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitStar({});
            const json = system.toJSON();
            const newSys = new CultivationStar();
            newSys.fromJSON(json);
            expect(newSys.stars.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.starCount).toBe(0);
        });
    });
});
