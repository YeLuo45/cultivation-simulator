/**
 * CultivationHour.test.js - 修真时辰系统测试
 * V820 Iteration 23/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationHour } from '../../../systems/ai/CultivationHour.js';

describe('CultivationHour', () => {
    let system;
    beforeEach(() => { system = new CultivationHour(); });

    describe('recruitHour', () => {
        it('should create with default values', () => {
            const { hour } = system.recruitHour({ masterId: 'm1' });
            expect(hour.masterId).toBe('m1');
            expect(hour.name).toBe('Cultivation Hour');
            expect(hour.type).toBe('earthly');
            expect(hour.weight).toBe(20);
            expect(hour.ticks).toEqual([]);
            expect(hour.level).toBe(1);
            expect(hour.status).toBe('novice');
        });

        it('should create with custom values', () => {
            const { hour } = system.recruitHour({ masterId: 'm1', name: 'Zi Hour', type: 'heavenly', weight: 80 });
            expect(hour.name).toBe('Zi Hour');
            expect(hour.type).toBe('heavenly');
            expect(hour.weight).toBe(80);
            expect(hour.level).toBe(1);
        });

        it('should support divine type', () => {
            const { hour } = system.recruitHour({ masterId: 'm1', type: 'divine' });
            expect(hour.type).toBe('divine');
        });

        it('should generate a unique hourId', () => {
            const { hour: h1 } = system.recruitHour({});
            const { hour: h2 } = system.recruitHour({});
            expect(h1.hourId).not.toBe(h2.hourId);
        });

        it('should accept custom id', () => {
            const { hour } = system.recruitHour({ id: 'custom_42' });
            expect(hour.hourId).toBe('custom_42');
        });

        it('should trigger hourRecruited hook', () => {
            let called = false;
            system.registerHook('hourRecruited', () => { called = true; });
            system.recruitHour({});
            expect(called).toBe(true);
        });
    });

    describe('getHour', () => {
        it('should return hour', () => {
            const { hour } = system.recruitHour({});
            expect(system.getHour(hour.hourId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getHour('ghost')).toBeNull();
        });
    });

    describe('listHours', () => {
        it('should list all', () => {
            system.recruitHour({});
            system.recruitHour({});
            expect(system.listHours().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listHours().length).toBe(0);
        });

        it('should return clones with ticks arrays', () => {
            const { hour } = system.recruitHour({});
            system.addTick(hour.hourId, 't1');
            const listed = system.listHours();
            expect(listed[0].ticks).toEqual([{ name: 't1', timestamp: listed[0].ticks[0].timestamp }]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitHour({ masterId: 'm1' });
            system.recruitHour({ masterId: 'm2' });
            system.recruitHour({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitHour({ masterId: 'm1' });
            expect(system.listByMaster('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should only list legendary hours', () => {
            const { hour: h1 } = system.recruitHour({});
            const { hour: h2 } = system.recruitHour({});
            system.legendHour(h1.hourId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].hourId).toBe(h1.hourId);
            expect(legendary[0].hourId).not.toBe(h2.hourId);
        });

        it('should return empty when none legendary', () => {
            system.recruitHour({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addTick', () => {
        it('should add string tick', () => {
            const { hour } = system.recruitHour({});
            system.addTick(hour.hourId, 'awakening');
            expect(hour.ticks.length).toBe(1);
            expect(hour.ticks[0].name).toBe('awakening');
        });

        it('should add object tick', () => {
            const { hour } = system.recruitHour({});
            system.addTick(hour.hourId, { name: 'meditation', detail: 'deep' });
            expect(hour.ticks.length).toBe(1);
            expect(hour.ticks[0].name).toBe('meditation');
            expect(hour.ticks[0].detail).toBe('deep');
        });

        it('should preserve provided timestamp', () => {
            const { hour } = system.recruitHour({});
            system.addTick(hour.hourId, { name: 't', timestamp: 12345 });
            expect(hour.ticks[0].timestamp).toBe(12345);
        });

        it('should reject missing', () => {
            const result = system.addTick('ghost', 't');
            expect(result.error).toBe('HOUR_NOT_FOUND');
        });

        it('should trigger tickAdded hook', () => {
            const { hour } = system.recruitHour({});
            let received = null;
            system.registerHook('tickAdded', (d) => { received = d; });
            system.addTick(hour.hourId, 'tickA');
            expect(received).not.toBeNull();
            expect(received.hourId).toBe(hour.hourId);
            expect(received.tick.name).toBe('tickA');
            expect(received.tickCount).toBe(1);
        });
    });

    describe('raiseWeight', () => {
        it('should raise weight by default 5', () => {
            const { hour } = system.recruitHour({});
            const initial = hour.weight;
            system.raiseWeight(hour.hourId);
            expect(hour.weight).toBe(initial + 5);
        });

        it('should raise weight by custom amount', () => {
            const { hour } = system.recruitHour({});
            system.raiseWeight(hour.hourId, 25);
            expect(hour.weight).toBe(45);
        });

        it('should reject missing', () => {
            const result = system.raiseWeight('ghost', 5);
            expect(result.error).toBe('HOUR_NOT_FOUND');
        });

        it('should trigger weightRaised hook', () => {
            const { hour } = system.recruitHour({});
            let received = null;
            system.registerHook('weightRaised', (d) => { received = d; });
            system.raiseWeight(hour.hourId, 10);
            expect(received).not.toBeNull();
            expect(received.hourId).toBe(hour.hourId);
            expect(received.amount).toBe(10);
            expect(received.newWeight).toBe(30);
        });
    });

    describe('levelUpHour', () => {
        it('should level up by 1', () => {
            const { hour } = system.recruitHour({});
            system.levelUpHour(hour.hourId);
            expect(hour.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { hour } = system.recruitHour({});
            system.levelUpHour(hour.hourId);
            system.levelUpHour(hour.hourId);
            system.levelUpHour(hour.hourId);
            expect(hour.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpHour('ghost');
            expect(result.error).toBe('HOUR_NOT_FOUND');
        });

        it('should trigger hourLeveledUp hook', () => {
            const { hour } = system.recruitHour({});
            let received = null;
            system.registerHook('hourLeveledUp', (d) => { received = d; });
            system.levelUpHour(hour.hourId);
            expect(received).not.toBeNull();
            expect(received.hourId).toBe(hour.hourId);
            expect(received.newLevel).toBe(2);
        });
    });

    describe('legendHour', () => {
        it('should set status to legendary', () => {
            const { hour } = system.recruitHour({});
            system.legendHour(hour.hourId);
            expect(hour.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendHour('ghost');
            expect(result.error).toBe('HOUR_NOT_FOUND');
        });

        it('should trigger hourLegendized hook', () => {
            const { hour } = system.recruitHour({});
            let called = false;
            system.registerHook('hourLegendized', () => { called = true; });
            system.legendHour(hour.hourId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHourValue', () => {
        it('should calculate level * 100 + weight * 2 + ticks.length * 30', () => {
            const { hour } = system.recruitHour({ weight: 50 });
            system.addTick(hour.hourId, 't1');
            system.addTick(hour.hourId, 't2');
            system.levelUpHour(hour.hourId);
            // level=2, weight=50, ticks=2 -> 200 + 100 + 60 = 360
            expect(system.calculateHourValue(hour.hourId)).toBe(360);
        });

        it('should handle fresh hour', () => {
            const { hour } = system.recruitHour({});
            // level=1, weight=20, ticks=0 -> 100 + 40 + 0 = 140
            expect(system.calculateHourValue(hour.hourId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHourValue('ghost')).toBe(0);
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

        it('should execute default getHour and recruitHour', () => {
            const recruitResult = system.executeTool('recruitHour', { masterId: 'm1' });
            expect(recruitResult.success).toBe(true);
            const h = recruitResult.result.hour;
            const getResult = system.executeTool('getHour', { hourId: h.hourId });
            expect(getResult.result).not.toBeNull();
        });

        it('should execute tool without context', () => {
            system.registerTool('test', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('test');
            expect(result.result).toBe(0);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('hourRecruited', () => count++);
            unregister();
            system.recruitHour({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('hourRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitHour({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when totalHours >= 5', () => {
            system.stats.totalHours = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalHours = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitHour({});
            const json = system.toJSON();
            expect(json.hours.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitHour({});
            const json = system.toJSON();
            const newSys = new CultivationHour();
            newSys.fromJSON(json);
            expect(newSys.hours.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with hourCount', () => {
            system.recruitHour({});
            const stats = system.getStats();
            expect(stats.hourCount).toBe(1);
            expect(stats.totalHours).toBe(1);
        });
    });
});
