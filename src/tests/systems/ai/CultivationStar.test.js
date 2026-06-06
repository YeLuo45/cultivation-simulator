/**
 * CultivationStar.test.js - 修真星系统测试
 * V593 Iteration 16/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationStar } from '../../../systems/ai/CultivationStar.js';

describe('CultivationStar', () => {
    let system;
    beforeEach(() => { system = new CultivationStar(); });

    describe('observeStar', () => {
        it('should observe', () => {
            const { star } = system.observeStar({ astronomerId: 'a1', name: 'Polaris' });
            expect(star.astronomerId).toBe('a1');
            expect(star.name).toBe('Polaris');
        });

        it('should set defaults', () => {
            const { star } = system.observeStar({});
            expect(star.type).toBe('luminous');
            expect(star.brilliance).toBe(20);
            expect(star.level).toBe(1);
            expect(star.status).toBe('rising');
            expect(star.satellites).toEqual([]);
        });

        it('should trigger starObserved hook', () => {
            let called = false;
            system.registerHook('starObserved', () => { called = true; });
            system.observeStar({});
            expect(called).toBe(true);
        });
    });

    describe('getStar', () => {
        it('should return', () => {
            const { star } = system.observeStar({});
            expect(system.getStar(star.starId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getStar('ghost')).toBeNull(); });
    });

    describe('listStars', () => {
        it('should list all', () => {
            system.observeStar({});
            system.observeStar({});
            expect(system.listStars().length).toBe(2);
        });
        it('should return empty when no stars', () => {
            expect(system.listStars().length).toBe(0);
        });
    });

    describe('listByAstronomer', () => {
        it('should filter', () => {
            system.observeStar({ astronomerId: 'a1' });
            system.observeStar({ astronomerId: 'a2' });
            expect(system.listByAstronomer('a1').length).toBe(1);
        });
        it('should return empty for unknown', () => {
            system.observeStar({ astronomerId: 'a1' });
            expect(system.listByAstronomer('ghost').length).toBe(0);
        });
    });

    describe('listEternal', () => {
        it('should list only eternal stars', () => {
            const { star } = system.observeStar({});
            system.eternalizeStar(star.starId);
            system.observeStar({});
            expect(system.listEternal().length).toBe(1);
        });
        it('should return empty when none eternal', () => {
            system.observeStar({});
            expect(system.listEternal().length).toBe(0);
        });
    });

    describe('addSatellite', () => {
        it('should add satellite', () => {
            const { star } = system.observeStar({});
            system.addSatellite(star.starId, 'moon1');
            expect(star.satellites.length).toBe(1);
            expect(star.satellites[0]).toBe('moon1');
        });

        it('should reject missing star', () => {
            const result = system.addSatellite('ghost', 'moon1');
            expect(result.error).toBe('STAR_NOT_FOUND');
        });

        it('should trigger satelliteAdded hook', () => {
            const { star } = system.observeStar({});
            let called = false;
            system.registerHook('satelliteAdded', () => { called = true; });
            system.addSatellite(star.starId, 'moon1');
            expect(called).toBe(true);
        });
    });

    describe('increaseBrilliance', () => {
        it('should increase with default amount', () => {
            const { star } = system.observeStar({});
            system.increaseBrilliance(star.starId);
            expect(star.brilliance).toBe(25);
        });

        it('should increase with custom amount', () => {
            const { star } = system.observeStar({});
            system.increaseBrilliance(star.starId, 50);
            expect(star.brilliance).toBe(70);
        });

        it('should reject missing star', () => {
            const result = system.increaseBrilliance('ghost', 10);
            expect(result.error).toBe('STAR_NOT_FOUND');
        });

        it('should trigger brillianceIncreased hook', () => {
            const { star } = system.observeStar({});
            let called = false;
            system.registerHook('brillianceIncreased', () => { called = true; });
            system.increaseBrilliance(star.starId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpStar', () => {
        it('should level up', () => {
            const { star } = system.observeStar({});
            system.levelUpStar(star.starId);
            expect(star.level).toBe(2);
        });

        it('should reject missing star', () => {
            const result = system.levelUpStar('ghost');
            expect(result.error).toBe('STAR_NOT_FOUND');
        });

        it('should trigger starLeveledUp hook', () => {
            const { star } = system.observeStar({});
            let called = false;
            system.registerHook('starLeveledUp', () => { called = true; });
            system.levelUpStar(star.starId);
            expect(called).toBe(true);
        });
    });

    describe('eternalizeStar', () => {
        it('should set status to eternal', () => {
            const { star } = system.observeStar({});
            system.eternalizeStar(star.starId);
            expect(star.status).toBe('eternal');
        });

        it('should reject missing star', () => {
            const result = system.eternalizeStar('ghost');
            expect(result.error).toBe('STAR_NOT_FOUND');
        });

        it('should trigger starEternalized hook', () => {
            const { star } = system.observeStar({});
            let called = false;
            system.registerHook('starEternalized', () => { called = true; });
            system.eternalizeStar(star.starId);
            expect(called).toBe(true);
        });
    });

    describe('calculateStarValue', () => {
        it('should calculate', () => {
            const { star } = system.observeStar({});
            system.levelUpStar(star.starId);
            system.addSatellite(star.starId, 'm1');
            // level 2 *100 + brilliance 20*2 + 1*30 = 200+40+30 = 270
            expect(system.calculateStarValue(star.starId)).toBe(270);
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

        it('should handle missing context', () => {
            system.registerTool('noop', () => 'ok');
            const result = system.executeTool('noop');
            expect(result.result).toBe('ok');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('starObserved', () => count++);
            unregister();
            system.observeStar({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('starObserved', () => { throw new Error('x'); });
            expect(() => system.observeStar({})).not.toThrow();
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
            system.observeStar({});
            const json = system.toJSON();
            expect(json.stars.length).toBe(1);
        });
        it('should deserialize', () => {
            system.observeStar({});
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
            expect(stats.totalStars).toBe(0);
        });
    });
});
