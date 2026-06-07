/**
 * CultivationDecade.test.js - 修真十年系统测试
 * V825 Iteration 28/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDecade } from '../../../systems/ai/CultivationDecade.js';

describe('CultivationDecade', () => {
    let system;
    beforeEach(() => { system = new CultivationDecade(); });

    describe('recruitDecade', () => {
        it('should create with default values', () => {
            const { decade } = system.recruitDecade({ masterId: 'm1' });
            expect(decade.masterId).toBe('m1');
            expect(decade.name).toBe('Cultivation Decade');
            expect(decade.type).toBe('earthly');
            expect(decade.weight).toBe(20);
            expect(decade.years).toEqual([]);
            expect(decade.level).toBe(1);
            expect(decade.status).toBe('novice');
        });

        it('should create with custom values', () => {
            const { decade } = system.recruitDecade({ masterId: 'm1', name: 'Decade of Iron', type: 'celestial', weight: 80 });
            expect(decade.name).toBe('Decade of Iron');
            expect(decade.type).toBe('celestial');
            expect(decade.weight).toBe(80);
            expect(decade.level).toBe(1);
        });

        it('should support divine type', () => {
            const { decade } = system.recruitDecade({ masterId: 'm1', type: 'divine' });
            expect(decade.type).toBe('divine');
        });

        it('should generate a unique decadeId', () => {
            const { decade: d1 } = system.recruitDecade({});
            const { decade: d2 } = system.recruitDecade({});
            expect(d1.decadeId).not.toBe(d2.decadeId);
        });

        it('should accept custom id', () => {
            const { decade } = system.recruitDecade({ id: 'custom_decade_42' });
            expect(decade.decadeId).toBe('custom_decade_42');
        });

        it('should trigger decadeRecruited hook', () => {
            let called = false;
            system.registerHook('decadeRecruited', () => { called = true; });
            system.recruitDecade({});
            expect(called).toBe(true);
        });
    });

    describe('getDecade', () => {
        it('should return decade', () => {
            const { decade } = system.recruitDecade({});
            expect(system.getDecade(decade.decadeId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getDecade('ghost')).toBeNull();
        });

        it('should return a clone with years array', () => {
            const { decade } = system.recruitDecade({});
            system.addYear(decade.decadeId, 'y1');
            const fetched = system.getDecade(decade.decadeId);
            expect(fetched.years.length).toBe(1);
            expect(fetched.years[0].name).toBe('y1');
        });
    });

    describe('listDecades', () => {
        it('should list all', () => {
            system.recruitDecade({});
            system.recruitDecade({});
            expect(system.listDecades().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listDecades().length).toBe(0);
        });

        it('should return clones with years arrays', () => {
            const { decade } = system.recruitDecade({});
            system.addYear(decade.decadeId, 'y1');
            const listed = system.listDecades();
            expect(listed[0].years).toEqual([{ name: 'y1', timestamp: listed[0].years[0].timestamp }]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitDecade({ masterId: 'm1' });
            system.recruitDecade({ masterId: 'm2' });
            system.recruitDecade({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitDecade({ masterId: 'm1' });
            expect(system.listByMaster('unknown').length).toBe(0);
        });

        it('should return clones with years arrays', () => {
            const { decade } = system.recruitDecade({ masterId: 'm1' });
            system.addYear(decade.decadeId, 'spring');
            const listed = system.listByMaster('m1');
            expect(listed[0].years.length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should only list legendary decades', () => {
            const { decade: d1 } = system.recruitDecade({});
            const { decade: d2 } = system.recruitDecade({});
            system.legendDecade(d1.decadeId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].decadeId).toBe(d1.decadeId);
            expect(legendary[0].decadeId).not.toBe(d2.decadeId);
        });

        it('should return empty when none legendary', () => {
            system.recruitDecade({});
            expect(system.listLegendary().length).toBe(0);
        });

        it('should return clones with years arrays', () => {
            const { decade } = system.recruitDecade({});
            system.addYear(decade.decadeId, 'y1');
            system.legendDecade(decade.decadeId);
            const listed = system.listLegendary();
            expect(listed[0].years.length).toBe(1);
        });
    });

    describe('addYear', () => {
        it('should add string year', () => {
            const { decade } = system.recruitDecade({});
            system.addYear(decade.decadeId, 'awakening');
            expect(decade.years.length).toBe(1);
            expect(decade.years[0].name).toBe('awakening');
        });

        it('should add object year', () => {
            const { decade } = system.recruitDecade({});
            system.addYear(decade.decadeId, { name: 'spring', detail: 'bloom' });
            expect(decade.years.length).toBe(1);
            expect(decade.years[0].name).toBe('spring');
            expect(decade.years[0].detail).toBe('bloom');
        });

        it('should preserve provided timestamp', () => {
            const { decade } = system.recruitDecade({});
            system.addYear(decade.decadeId, { name: 'y', timestamp: 12345 });
            expect(decade.years[0].timestamp).toBe(12345);
        });

        it('should reject missing', () => {
            const result = system.addYear('ghost', 'y');
            expect(result.error).toBe('DECADE_NOT_FOUND');
        });

        it('should trigger yearAdded hook', () => {
            const { decade } = system.recruitDecade({});
            let received = null;
            system.registerHook('yearAdded', (d) => { received = d; });
            system.addYear(decade.decadeId, 'yearA');
            expect(received).not.toBeNull();
            expect(received.decadeId).toBe(decade.decadeId);
            expect(received.year.name).toBe('yearA');
            expect(received.yearCount).toBe(1);
        });
    });

    describe('raiseWeight', () => {
        it('should raise weight by default 5', () => {
            const { decade } = system.recruitDecade({});
            const initial = decade.weight;
            system.raiseWeight(decade.decadeId);
            expect(decade.weight).toBe(initial + 5);
        });

        it('should raise weight by custom amount', () => {
            const { decade } = system.recruitDecade({});
            system.raiseWeight(decade.decadeId, 25);
            expect(decade.weight).toBe(45);
        });

        it('should reject missing', () => {
            const result = system.raiseWeight('ghost', 5);
            expect(result.error).toBe('DECADE_NOT_FOUND');
        });

        it('should trigger weightRaised hook', () => {
            const { decade } = system.recruitDecade({});
            let received = null;
            system.registerHook('weightRaised', (d) => { received = d; });
            system.raiseWeight(decade.decadeId, 10);
            expect(received).not.toBeNull();
            expect(received.decadeId).toBe(decade.decadeId);
            expect(received.amount).toBe(10);
            expect(received.newWeight).toBe(30);
        });
    });

    describe('levelUpDecade', () => {
        it('should level up by 1', () => {
            const { decade } = system.recruitDecade({});
            system.levelUpDecade(decade.decadeId);
            expect(decade.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { decade } = system.recruitDecade({});
            system.levelUpDecade(decade.decadeId);
            system.levelUpDecade(decade.decadeId);
            system.levelUpDecade(decade.decadeId);
            expect(decade.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpDecade('ghost');
            expect(result.error).toBe('DECADE_NOT_FOUND');
        });

        it('should trigger decadeLeveledUp hook', () => {
            const { decade } = system.recruitDecade({});
            let received = null;
            system.registerHook('decadeLeveledUp', (d) => { received = d; });
            system.levelUpDecade(decade.decadeId);
            expect(received).not.toBeNull();
            expect(received.decadeId).toBe(decade.decadeId);
            expect(received.newLevel).toBe(2);
        });
    });

    describe('legendDecade', () => {
        it('should set status to legendary', () => {
            const { decade } = system.recruitDecade({});
            system.legendDecade(decade.decadeId);
            expect(decade.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendDecade('ghost');
            expect(result.error).toBe('DECADE_NOT_FOUND');
        });

        it('should trigger decadeLegendized hook', () => {
            const { decade } = system.recruitDecade({});
            let called = false;
            system.registerHook('decadeLegendized', () => { called = true; });
            system.legendDecade(decade.decadeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDecadeValue', () => {
        it('should calculate level * 100 + weight * 2 + years.length * 30', () => {
            const { decade } = system.recruitDecade({ weight: 50 });
            system.addYear(decade.decadeId, 'y1');
            system.addYear(decade.decadeId, 'y2');
            system.levelUpDecade(decade.decadeId);
            // level=2, weight=50, years=2 -> 200 + 100 + 60 = 360
            expect(system.calculateDecadeValue(decade.decadeId)).toBe(360);
        });

        it('should handle fresh decade', () => {
            const { decade } = system.recruitDecade({});
            // level=1, weight=20, years=0 -> 100 + 40 + 0 = 140
            expect(system.calculateDecadeValue(decade.decadeId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDecadeValue('ghost')).toBe(0);
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

        it('should execute default getDecade and recruitDecade', () => {
            const recruitResult = system.executeTool('recruitDecade', { masterId: 'm1' });
            expect(recruitResult.success).toBe(true);
            const d = recruitResult.result.decade;
            const getResult = system.executeTool('getDecade', { decadeId: d.decadeId });
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
            const unregister = system.registerHook('decadeRecruited', () => count++);
            unregister();
            system.recruitDecade({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('decadeRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDecade({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when totalDecades >= 5', () => {
            system.stats.totalDecades = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalDecades = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDecade({});
            const json = system.toJSON();
            expect(json.decades.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitDecade({});
            const json = system.toJSON();
            const newSys = new CultivationDecade();
            newSys.fromJSON(json);
            expect(newSys.decades.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with decadeCount', () => {
            system.recruitDecade({});
            const stats = system.getStats();
            expect(stats.decadeCount).toBe(1);
            expect(stats.totalDecades).toBe(1);
        });
    });
});
