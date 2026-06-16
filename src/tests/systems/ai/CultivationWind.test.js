/**
 * CultivationWind.test.js - 修真风测试
 * V807 Iteration 10/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationWind } from '../../../systems/ai/CultivationWind.js';

describe('CultivationWind', () => {
    let system;
    beforeEach(() => { system = new CultivationWind(); });

    describe('recruitWind', () => {
        it('should recruit', () => {
            const { wind } = system.recruitWind({ name: 'Wind1' });
            expect(wind.name).toBe('Wind1');
        });

        it('should default type to gentle', () => {
            const { wind } = system.recruitWind({});
            expect(wind.type).toBe('gentle');
        });

        it('should default speed to baseSpeed', () => {
            const { wind } = system.recruitWind({});
            expect(wind.speed).toBe(20);
        });

        it('should default status to novice', () => {
            const { wind } = system.recruitWind({});
            expect(wind.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { wind } = system.recruitWind({});
            expect(wind.level).toBe(1);
        });

        it('should default gusts to []', () => {
            const { wind } = system.recruitWind({});
            expect(wind.gusts).toEqual([]);
        });

        it('should preserve masterId', () => {
            const { wind } = system.recruitWind({ masterId: 'm1' });
            expect(wind.masterId).toBe('m1');
        });

        it('should increment stats', () => {
            system.recruitWind({});
            expect(system.stats.totalWinds).toBe(1);
        });

        it('should trigger windRecruited hook', () => {
            let called = false;
            system.registerHook('windRecruited', () => { called = true; });
            system.recruitWind({});
            expect(called).toBe(true);
        });
    });

    describe('getWind', () => {
        it('should return', () => {
            const { wind } = system.recruitWind({});
            expect(system.getWind(wind.windId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getWind('ghost')).toBeNull(); });
    });

    describe('listWinds', () => {
        it('should list all', () => {
            system.recruitWind({});
            system.recruitWind({});
            expect(system.listWinds().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listWinds().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitWind({ masterId: 'm1' });
            system.recruitWind({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitWind({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { wind: w1 } = system.recruitWind({});
            const { wind: w2 } = system.recruitWind({});
            w2.status = 'legendary';
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none', () => {
            system.recruitWind({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addGust', () => {
        it('should add a gust', () => {
            const { wind } = system.recruitWind({});
            const result = system.addGust(wind.windId, 'Zephyr');
            expect(result.success).toBe(true);
            expect(wind.gusts.length).toBe(1);
        });

        it('should accept string gust name', () => {
            const { wind } = system.recruitWind({});
            system.addGust(wind.windId, 'GustForce');
            expect(wind.gusts[0].name).toBe('GustForce');
        });

        it('should accept object gust', () => {
            const { wind } = system.recruitWind({});
            system.addGust(wind.windId, { name: 'Storm' });
            expect(wind.gusts[0].name).toBe('Storm');
        });

        it('should default gust name when object lacks name', () => {
            const { wind } = system.recruitWind({});
            system.addGust(wind.windId, {});
            expect(wind.gusts[0].name).toBe('gust');
        });

        it('should reject missing', () => {
            const result = system.addGust('ghost', 'Zephyr');
            expect(result.error).toBe('WIND_NOT_FOUND');
        });

        it('should trigger gustAdded hook', () => {
            const { wind } = system.recruitWind({});
            let called = false;
            system.registerHook('gustAdded', () => { called = true; });
            system.addGust(wind.windId, 'Zephyr');
            expect(called).toBe(true);
        });
    });

    describe('raiseSpeed', () => {
        it('should raise speed with default amount', () => {
            const { wind } = system.recruitWind({});
            system.raiseSpeed(wind.windId);
            expect(wind.speed).toBe(25);
        });

        it('should raise speed with custom amount', () => {
            const { wind } = system.recruitWind({});
            system.raiseSpeed(wind.windId, 10);
            expect(wind.speed).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseSpeed('ghost', 5);
            expect(result.error).toBe('WIND_NOT_FOUND');
        });

        it('should trigger speedRaised hook', () => {
            const { wind } = system.recruitWind({});
            let called = false;
            system.registerHook('speedRaised', () => { called = true; });
            system.raiseSpeed(wind.windId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpWind', () => {
        it('should level up', () => {
            const { wind } = system.recruitWind({});
            system.levelUpWind(wind.windId);
            expect(wind.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpWind('ghost');
            expect(result.error).toBe('WIND_NOT_FOUND');
        });
    });

    describe('legendWind', () => {
        it('should set status to legendary', () => {
            const { wind } = system.recruitWind({});
            system.legendWind(wind.windId);
            expect(wind.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendWind('ghost');
            expect(result.error).toBe('WIND_NOT_FOUND');
        });

        it('should trigger windLegendized hook', () => {
            const { wind } = system.recruitWind({});
            let called = false;
            system.registerHook('windLegendized', () => { called = true; });
            system.legendWind(wind.windId);
            expect(called).toBe(true);
        });
    });

    describe('calculateWindValue', () => {
        it('should calculate base value', () => {
            const { wind } = system.recruitWind({});
            // level 1 * 100 + speed 20 * 2 + 0 gusts * 30 = 140
            expect(system.calculateWindValue(wind.windId)).toBe(140);
        });

        it('should include gust bonus', () => {
            const { wind } = system.recruitWind({});
            system.addGust(wind.windId, 'Zephyr');
            system.addGust(wind.windId, 'Gust');
            // level 1 * 100 + speed 20 * 2 + 2 * 30 = 200
            expect(system.calculateWindValue(wind.windId)).toBe(200);
        });

        it('should include level bonus', () => {
            const { wind } = system.recruitWind({});
            system.levelUpWind(wind.windId);
            // level 2 * 100 + speed 20 * 2 + 0 * 30 = 240
            expect(system.calculateWindValue(wind.windId)).toBe(240);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateWindValue('ghost')).toBe(0);
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

        it('should default context to {} when undefined', () => {
            system.registerTool('echoCtx', (ctx) => ctx);
            const result = system.executeTool('echoCtx');
            expect(result.result).toEqual({});
        });

        it('should execute default getWind', () => {
            const result = system.executeTool('getWind', { windId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('windRecruited', () => count++);
            unregister();
            system.recruitWind({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('windRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitWind({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalWinds = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalWinds = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitWind({});
            const json = system.toJSON();
            expect(json.winds.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitWind({});
            const json = system.toJSON();
            const newSys = new CultivationWind();
            newSys.fromJSON(json);
            expect(newSys.winds.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.windCount).toBe(0);
        });

        it('should reflect recruitment', () => {
            system.recruitWind({});
            const stats = system.getStats();
            expect(stats.windCount).toBe(1);
        });
    });
});
