/**
 * CultivationMountain.test.js - 修真山系统测试
 * V688 Iteration 11/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMountain } from '../../../systems/ai/CultivationMountain.js';

describe('CultivationMountain', () => {
    let system;
    beforeEach(() => { system = new CultivationMountain(); });

    describe('recruitMountain', () => {
        it('should recruit', () => {
            const { mountain } = system.recruitMountain({ masterId: 'm1', name: 'Jade Peak' });
            expect(mountain.masterId).toBe('m1');
            expect(mountain.name).toBe('Jade Peak');
        });

        it('should use baseAltitude by default', () => {
            const { mountain } = system.recruitMountain({});
            expect(mountain.altitude).toBe(20);
        });

        it('should default type to jade', () => {
            const { mountain } = system.recruitMountain({});
            expect(mountain.type).toBe('jade');
        });

        it('should default status to novice', () => {
            const { mountain } = system.recruitMountain({});
            expect(mountain.status).toBe('novice');
        });

        it('should reject when max reached', () => {
            system.config.maxMountains = 2;
            system.recruitMountain({});
            system.recruitMountain({});
            const result = system.recruitMountain({});
            expect(result.error).toBe('MAX_MOUNTAINS_REACHED');
        });

        it('should trigger mountainRecruited hook', () => {
            let called = false;
            system.registerHook('mountainRecruited', () => { called = true; });
            system.recruitMountain({});
            expect(called).toBe(true);
        });
    });

    describe('getMountain', () => {
        it('should return', () => {
            const { mountain } = system.recruitMountain({});
            expect(system.getMountain(mountain.mountainId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMountain('ghost')).toBeNull(); });
    });

    describe('listMountains', () => {
        it('should list all', () => {
            system.recruitMountain({});
            system.recruitMountain({});
            expect(system.listMountains().length).toBe(2);
        });

        it('should return empty when no mountains', () => {
            expect(system.listMountains().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitMountain({ masterId: 'm1' });
            system.recruitMountain({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { mountain } = system.recruitMountain({});
            system.legendMountain(mountain.mountainId);
            system.recruitMountain({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addPeak', () => {
        it('should add peak', () => {
            const { mountain } = system.recruitMountain({});
            system.addPeak(mountain.mountainId, 'Eagle Peak');
            expect(mountain.peaks.length).toBe(1);
            expect(mountain.peaks[0]).toBe('Eagle Peak');
        });

        it('should reject missing', () => {
            const result = system.addPeak('ghost', 'X');
            expect(result.error).toBe('MOUNTAIN_NOT_FOUND');
        });

        it('should trigger peakAdded hook', () => {
            const { mountain } = system.recruitMountain({});
            let called = false;
            system.registerHook('peakAdded', () => { called = true; });
            system.addPeak(mountain.mountainId, 'X');
            expect(called).toBe(true);
        });
    });

    describe('raiseAltitude', () => {
        it('should raise', () => {
            const { mountain } = system.recruitMountain({});
            system.raiseAltitude(mountain.mountainId, 10);
            expect(mountain.altitude).toBe(30);
        });

        it('should use default 5', () => {
            const { mountain } = system.recruitMountain({});
            system.raiseAltitude(mountain.mountainId);
            expect(mountain.altitude).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseAltitude('ghost', 5);
            expect(result.error).toBe('MOUNTAIN_NOT_FOUND');
        });

        it('should trigger altitudeRaised hook', () => {
            const { mountain } = system.recruitMountain({});
            let called = false;
            system.registerHook('altitudeRaised', () => { called = true; });
            system.raiseAltitude(mountain.mountainId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMountain', () => {
        it('should level up', () => {
            const { mountain } = system.recruitMountain({});
            system.levelUpMountain(mountain.mountainId);
            expect(mountain.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpMountain('ghost');
            expect(result.error).toBe('MOUNTAIN_NOT_FOUND');
        });

        it('should trigger mountainLeveledUp hook', () => {
            const { mountain } = system.recruitMountain({});
            let called = false;
            system.registerHook('mountainLeveledUp', () => { called = true; });
            system.levelUpMountain(mountain.mountainId);
            expect(called).toBe(true);
        });
    });

    describe('legendMountain', () => {
        it('should set legendary', () => {
            const { mountain } = system.recruitMountain({});
            system.legendMountain(mountain.mountainId);
            expect(mountain.status).toBe('legendary');
        });

        it('should increment legendaryCount', () => {
            const { mountain } = system.recruitMountain({});
            system.legendMountain(mountain.mountainId);
            expect(system.stats.legendaryCount).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.legendMountain('ghost');
            expect(result.error).toBe('MOUNTAIN_NOT_FOUND');
        });

        it('should trigger mountainLegendized hook', () => {
            const { mountain } = system.recruitMountain({});
            let called = false;
            system.registerHook('mountainLegendized', () => { called = true; });
            system.legendMountain(mountain.mountainId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMountainValue', () => {
        it('should calculate', () => {
            const { mountain } = system.recruitMountain({});
            system.addPeak(mountain.mountainId, 'P1');
            system.addPeak(mountain.mountainId, 'P2');
            // level=1, altitude=20, peaks=2 -> 1*100 + 20*2 + 2*30 = 100 + 40 + 60 = 200
            expect(system.calculateMountainValue(mountain.mountainId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMountainValue('ghost')).toBe(0);
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

        it('should execute default getMountain', () => {
            const result = system.executeTool('getMountain', { mountainId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitMountain', () => {
            const result = system.executeTool('recruitMountain', { masterId: 'm1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('mountainRecruited', () => count++);
            unregister();
            system.recruitMountain({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('mountainRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMountain({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMountains = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMountains = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitMountain({});
            const json = system.toJSON();
            expect(json.mountains.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitMountain({});
            const json = system.toJSON();
            const newSys = new CultivationMountain();
            newSys.fromJSON(json);
            expect(newSys.mountains.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.mountainCount).toBe(0);
        });
    });
});
