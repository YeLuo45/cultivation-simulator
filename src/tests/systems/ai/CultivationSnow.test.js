/**
 * CultivationSnow.test.js - 修真雪测试
 * V800 Iteration 3/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSnow } from '../../../systems/ai/CultivationSnow.js';

describe('CultivationSnow', () => {
    let system;
    beforeEach(() => { system = new CultivationSnow(); });

    describe('recruitSnow', () => {
        it('should recruit', () => {
            const { snow } = system.recruitSnow({ name: 'Frosty' });
            expect(snow.name).toBe('Frosty');
        });

        it('should initialize empty flakes', () => {
            const { snow } = system.recruitSnow({});
            expect(snow.flakes).toEqual([]);
        });

        it('should default type to winter', () => {
            const { snow } = system.recruitSnow({});
            expect(snow.type).toBe('winter');
        });

        it('should default status to novice', () => {
            const { snow } = system.recruitSnow({});
            expect(snow.status).toBe('novice');
        });

        it('should trigger snowRecruited hook', () => {
            let called = false;
            system.registerHook('snowRecruited', () => { called = true; });
            system.recruitSnow({});
            expect(called).toBe(true);
        });
    });

    describe('getSnow', () => {
        it('should return', () => {
            const { snow } = system.recruitSnow({});
            expect(system.getSnow(snow.snowId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSnow('ghost')).toBeNull(); });
    });

    describe('listSnows', () => {
        it('should list all', () => {
            system.recruitSnow({});
            expect(system.listSnows().length).toBe(1);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitSnow({ masterId: 'm1' });
            system.recruitSnow({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { snow } = system.recruitSnow({});
            system.legendSnow(snow.snowId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addFlake', () => {
        it('should add', () => {
            const { snow } = system.recruitSnow({});
            system.addFlake(snow.snowId, 'crystal');
            expect(snow.flakes.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addFlake('ghost', 'crystal');
            expect(result.error).toBe('SNOW_NOT_FOUND');
        });

        it('should trigger flakeAdded hook', () => {
            const { snow } = system.recruitSnow({});
            let called = false;
            system.registerHook('flakeAdded', () => { called = true; });
            system.addFlake(snow.snowId, 'crystal');
            expect(called).toBe(true);
        });
    });

    describe('raisePurity', () => {
        it('should raise', () => {
            const { snow } = system.recruitSnow({});
            system.raisePurity(snow.snowId, 5);
            expect(snow.purity).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raisePurity('ghost', 5);
            expect(result.error).toBe('SNOW_NOT_FOUND');
        });

        it('should trigger purityRaised hook', () => {
            const { snow } = system.recruitSnow({});
            let called = false;
            system.registerHook('purityRaised', () => { called = true; });
            system.raisePurity(snow.snowId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSnow', () => {
        it('should level up', () => {
            const { snow } = system.recruitSnow({});
            system.levelUpSnow(snow.snowId);
            expect(snow.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpSnow('ghost');
            expect(result.error).toBe('SNOW_NOT_FOUND');
        });

        it('should trigger snowLeveledUp hook', () => {
            const { snow } = system.recruitSnow({});
            let called = false;
            system.registerHook('snowLeveledUp', () => { called = true; });
            system.levelUpSnow(snow.snowId);
            expect(called).toBe(true);
        });
    });

    describe('legendSnow', () => {
        it('should legendize', () => {
            const { snow } = system.recruitSnow({});
            system.legendSnow(snow.snowId);
            expect(snow.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSnow('ghost');
            expect(result.error).toBe('SNOW_NOT_FOUND');
        });

        it('should trigger snowLegendized hook', () => {
            const { snow } = system.recruitSnow({});
            let called = false;
            system.registerHook('snowLegendized', () => { called = true; });
            system.legendSnow(snow.snowId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSnowValue', () => {
        it('should calculate', () => {
            const { snow } = system.recruitSnow({});
            system.addFlake(snow.snowId, 'crystal');
            // level=1, purity=20, flakes.length=1 -> 1*100 + 20*2 + 1*30 = 170
            expect(system.calculateSnowValue(snow.snowId)).toBe(170);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSnowValue('ghost')).toBe(0);
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

        it('should execute default getSnow', () => {
            const result = system.executeTool('getSnow', { snowId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('snowRecruited', () => count++);
            unregister();
            system.recruitSnow({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('snowRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSnow({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalRecruited = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalRecruited = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSnow({});
            const json = system.toJSON();
            expect(json.snows.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSnow({});
            const json = system.toJSON();
            const newSys = new CultivationSnow();
            newSys.fromJSON(json);
            expect(newSys.snows.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.snowCount).toBe(0);
        });
    });
});
