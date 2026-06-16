/**
 * CultivationRain.test.js - 修真雨测试
 * V802 Iteration 5/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationRain } from '../../../systems/ai/CultivationRain.js';

describe('CultivationRain', () => {
    let system;
    beforeEach(() => { system = new CultivationRain(); });

    describe('recruitRain', () => {
        it('should recruit', () => {
            const { rain } = system.recruitRain({ name: 'Monsoon' });
            expect(rain.name).toBe('Monsoon');
        });

        it('should initialize empty drops', () => {
            const { rain } = system.recruitRain({});
            expect(rain.drops).toEqual([]);
        });

        it('should default type to gentle', () => {
            const { rain } = system.recruitRain({});
            expect(rain.type).toBe('gentle');
        });

        it('should default status to novice', () => {
            const { rain } = system.recruitRain({});
            expect(rain.status).toBe('novice');
        });

        it('should default masterId to unknown', () => {
            const { rain } = system.recruitRain({});
            expect(rain.masterId).toBe('unknown');
        });

        it('should default level to 1', () => {
            const { rain } = system.recruitRain({});
            expect(rain.level).toBe(1);
        });

        it('should default moisture to baseMoisture', () => {
            const { rain } = system.recruitRain({});
            expect(rain.moisture).toBe(20);
        });

        it('should use custom moisture when provided', () => {
            const { rain } = system.recruitRain({ moisture: 50 });
            expect(rain.moisture).toBe(50);
        });

        it('should trigger rainRecruited hook', () => {
            let called = false;
            system.registerHook('rainRecruited', () => { called = true; });
            system.recruitRain({});
            expect(called).toBe(true);
        });
    });

    describe('getRain', () => {
        it('should return', () => {
            const { rain } = system.recruitRain({});
            expect(system.getRain(rain.rainId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRain('ghost')).toBeNull(); });
    });

    describe('listRains', () => {
        it('should list all', () => {
            system.recruitRain({});
            expect(system.listRains().length).toBe(1);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitRain({ masterId: 'm1' });
            system.recruitRain({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { rain } = system.recruitRain({});
            system.legendRain(rain.rainId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should not list non-legendary', () => {
            system.recruitRain({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addDrop', () => {
        it('should add', () => {
            const { rain } = system.recruitRain({});
            system.addDrop(rain.rainId, 'dewdrop');
            expect(rain.drops.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addDrop('ghost', 'dewdrop');
            expect(result.error).toBe('RAIN_NOT_FOUND');
        });

        it('should trigger dropAdded hook', () => {
            const { rain } = system.recruitRain({});
            let called = false;
            system.registerHook('dropAdded', () => { called = true; });
            system.addDrop(rain.rainId, 'dewdrop');
            expect(called).toBe(true);
        });
    });

    describe('raiseMoisture', () => {
        it('should raise', () => {
            const { rain } = system.recruitRain({});
            system.raiseMoisture(rain.rainId, 5);
            expect(rain.moisture).toBe(25);
        });

        it('should default amount to 5', () => {
            const { rain } = system.recruitRain({});
            system.raiseMoisture(rain.rainId);
            expect(rain.moisture).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseMoisture('ghost', 5);
            expect(result.error).toBe('RAIN_NOT_FOUND');
        });

        it('should trigger moistureRaised hook', () => {
            const { rain } = system.recruitRain({});
            let called = false;
            system.registerHook('moistureRaised', () => { called = true; });
            system.raiseMoisture(rain.rainId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpRain', () => {
        it('should level up', () => {
            const { rain } = system.recruitRain({});
            system.levelUpRain(rain.rainId);
            expect(rain.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpRain('ghost');
            expect(result.error).toBe('RAIN_NOT_FOUND');
        });

        it('should trigger rainLeveledUp hook', () => {
            const { rain } = system.recruitRain({});
            let called = false;
            system.registerHook('rainLeveledUp', () => { called = true; });
            system.levelUpRain(rain.rainId);
            expect(called).toBe(true);
        });
    });

    describe('legendRain', () => {
        it('should legendize', () => {
            const { rain } = system.recruitRain({});
            system.legendRain(rain.rainId);
            expect(rain.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendRain('ghost');
            expect(result.error).toBe('RAIN_NOT_FOUND');
        });

        it('should trigger rainLegendized hook', () => {
            const { rain } = system.recruitRain({});
            let called = false;
            system.registerHook('rainLegendized', () => { called = true; });
            system.legendRain(rain.rainId);
            expect(called).toBe(true);
        });
    });

    describe('calculateRainValue', () => {
        it('should calculate', () => {
            const { rain } = system.recruitRain({});
            system.addDrop(rain.rainId, 'dewdrop');
            // level=1, moisture=20, drops.length=1 -> 1*100 + 20*2 + 1*30 = 170
            expect(system.calculateRainValue(rain.rainId)).toBe(170);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateRainValue('ghost')).toBe(0);
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

        it('should execute default getRain', () => {
            const result = system.executeTool('getRain', { rainId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('rainRecruited', () => count++);
            unregister();
            system.recruitRain({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('rainRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitRain({})).not.toThrow();
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
            system.recruitRain({});
            const json = system.toJSON();
            expect(json.rains.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitRain({});
            const json = system.toJSON();
            const newSys = new CultivationRain();
            newSys.fromJSON(json);
            expect(newSys.rains.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.rainCount).toBe(0);
        });
    });
});
