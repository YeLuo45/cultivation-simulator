/**
 * CultivationTide.test.js - 修真潮汐系统测试
 * V743 Iteration 6/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTide } from '../../../systems/ai/CultivationTide.js';

describe('CultivationTide', () => {
    let system;
    beforeEach(() => { system = new CultivationTide(); });

    describe('recruitTide', () => {
        it('should create', () => {
            const { tide } = system.recruitTide({ masterId: 'm1', name: 'AzureTide' });
            expect(tide.masterId).toBe('m1');
            expect(tide.name).toBe('AzureTide');
        });

        it('should trigger tideRecruited hook', () => {
            let called = false;
            system.registerHook('tideRecruited', () => { called = true; });
            system.recruitTide({});
            expect(called).toBe(true);
        });
    });

    describe('getTide', () => {
        it('should return', () => {
            const { tide } = system.recruitTide({});
            expect(system.getTide(tide.tideId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTide('ghost')).toBeNull(); });
    });

    describe('listTides', () => {
        it('should list all', () => {
            system.recruitTide({});
            expect(system.listTides().length).toBe(1);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitTide({ masterId: 'm1' });
            system.recruitTide({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { tide: t1 } = system.recruitTide({});
            const { tide: t2 } = system.recruitTide({});
            system.legendTide(t2.tideId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addCurrent', () => {
        it('should add current', () => {
            const { tide } = system.recruitTide({});
            system.addCurrent(tide.tideId, 'whirlpool');
            expect(tide.currents).toContain('whirlpool');
        });

        it('should reject missing', () => {
            const result = system.addCurrent('ghost', 'x');
            expect(result.error).toBe('TIDE_NOT_FOUND');
        });

        it('should trigger currentAdded hook', () => {
            const { tide } = system.recruitTide({});
            let called = false;
            system.registerHook('currentAdded', () => { called = true; });
            system.addCurrent(tide.tideId, 'flow');
            expect(called).toBe(true);
        });
    });

    describe('raisePower', () => {
        it('should raise power', () => {
            const { tide } = system.recruitTide({});
            system.raisePower(tide.tideId, 10);
            expect(tide.power).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raisePower('ghost', 10);
            expect(result.error).toBe('TIDE_NOT_FOUND');
        });

        it('should trigger powerRaised hook', () => {
            const { tide } = system.recruitTide({});
            let called = false;
            system.registerHook('powerRaised', () => { called = true; });
            system.raisePower(tide.tideId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpTide', () => {
        it('should level up', () => {
            const { tide } = system.recruitTide({});
            system.levelUpTide(tide.tideId);
            expect(tide.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpTide('ghost');
            expect(result.error).toBe('TIDE_NOT_FOUND');
        });

        it('should trigger tideLeveledUp hook', () => {
            const { tide } = system.recruitTide({});
            let called = false;
            system.registerHook('tideLeveledUp', () => { called = true; });
            system.levelUpTide(tide.tideId);
            expect(called).toBe(true);
        });
    });

    describe('legendTide', () => {
        it('should set legendary', () => {
            const { tide } = system.recruitTide({});
            system.legendTide(tide.tideId);
            expect(tide.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendTide('ghost');
            expect(result.error).toBe('TIDE_NOT_FOUND');
        });

        it('should trigger tideLegendized hook', () => {
            const { tide } = system.recruitTide({});
            let called = false;
            system.registerHook('tideLegendized', () => { called = true; });
            system.legendTide(tide.tideId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTideValue', () => {
        it('should calculate', () => {
            const { tide } = system.recruitTide({});
            system.addCurrent(tide.tideId, 'c1');
            system.raisePower(tide.tideId, 5);
            system.levelUpTide(tide.tideId);
            // level=2*100 + power(25)*2 + currents(1)*30 = 200+50+30 = 280
            expect(system.calculateTideValue(tide.tideId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTideValue('ghost')).toBe(0);
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

        it('should execute default getTide', () => {
            const result = system.executeTool('getTide', { tideId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('tideRecruited', () => count++);
            unregister();
            system.recruitTide({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('tideRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitTide({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTides = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTides = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitTide({});
            const json = system.toJSON();
            expect(json.tides.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitTide({});
            const json = system.toJSON();
            const newSys = new CultivationTide();
            newSys.fromJSON(json);
            expect(newSys.tides.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.tideCount).toBe(0);
        });
    });
});
