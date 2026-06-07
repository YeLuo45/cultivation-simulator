/**
 * CultivationQuartz.test.js - 修真石英测试
 * V838 Iteration 11/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationQuartz } from '../../../systems/ai/CultivationQuartz.js';

describe('CultivationQuartz', () => {
    let system;
    beforeEach(() => { system = new CultivationQuartz(); });

    describe('recruitQuartz', () => {
        it('should recruit', () => {
            const { quartz } = system.recruitQuartz({ masterId: 'm1', name: 'Sky Quartz', type: 'divine' });
            expect(quartz.masterId).toBe('m1');
            expect(quartz.name).toBe('Sky Quartz');
            expect(quartz.type).toBe('divine');
        });

        it('should default type, clarity, level, status', () => {
            const { quartz } = system.recruitQuartz({ masterId: 'm1' });
            expect(quartz.type).toBe('rose');
            expect(quartz.clarity).toBe(20);
            expect(quartz.level).toBe(1);
            expect(quartz.status).toBe('novice');
            expect(quartz.crystals).toEqual([]);
        });

        it('should accept custom quartzId', () => {
            const { quartz } = system.recruitQuartz({ quartzId: 'custom-id', masterId: 'm1' });
            expect(quartz.quartzId).toBe('custom-id');
        });

        it('should trigger quartzRecruited hook', () => {
            let called = false;
            system.registerHook('quartzRecruited', () => { called = true; });
            system.recruitQuartz({});
            expect(called).toBe(true);
        });

        it('should return success true', () => {
            const result = system.recruitQuartz({ masterId: 'm1' });
            expect(result.success).toBe(true);
        });
    });

    describe('getQuartz', () => {
        it('should return', () => {
            const { quartz } = system.recruitQuartz({});
            expect(system.getQuartz(quartz.quartzId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getQuartz('ghost')).toBeNull(); });
    });

    describe('listQuartzes', () => {
        it('should list all', () => {
            system.recruitQuartz({});
            system.recruitQuartz({});
            expect(system.listQuartzes().length).toBe(2);
        });

        it('should return empty array initially', () => {
            expect(system.listQuartzes()).toEqual([]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitQuartz({ masterId: 'm1' });
            system.recruitQuartz({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitQuartz({ masterId: 'm1' });
            expect(system.listByMaster('unknown')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter by legendary', () => {
            const { quartz: q1 } = system.recruitQuartz({});
            const { quartz: q2 } = system.recruitQuartz({});
            system.legendQuartz(q2.quartzId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].quartzId).toBe(q2.quartzId);
        });

        it('should return empty when none legendary', () => {
            system.recruitQuartz({});
            expect(system.listLegendary()).toEqual([]);
        });
    });

    describe('addCrystal', () => {
        it('should add crystal', () => {
            const { quartz } = system.recruitQuartz({});
            system.addCrystal(quartz.quartzId, 'fire-crystal');
            expect(quartz.crystals).toContain('fire-crystal');
            expect(quartz.crystals.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addCrystal('ghost', 'c');
            expect(result.error).toBe('QUARTZ_NOT_FOUND');
        });

        it('should trigger crystalAdded hook', () => {
            const { quartz } = system.recruitQuartz({});
            let called = false;
            system.registerHook('crystalAdded', () => { called = true; });
            system.addCrystal(quartz.quartzId, 'c');
            expect(called).toBe(true);
        });
    });

    describe('raiseClarity', () => {
        it('should raise', () => {
            const { quartz } = system.recruitQuartz({});
            system.raiseClarity(quartz.quartzId, 10);
            expect(quartz.clarity).toBe(30);
        });

        it('should default amount to 5', () => {
            const { quartz } = system.recruitQuartz({});
            system.raiseClarity(quartz.quartzId);
            expect(quartz.clarity).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseClarity('ghost', 10);
            expect(result.error).toBe('QUARTZ_NOT_FOUND');
        });

        it('should trigger clarityRaised hook', () => {
            const { quartz } = system.recruitQuartz({});
            let called = false;
            system.registerHook('clarityRaised', () => { called = true; });
            system.raiseClarity(quartz.quartzId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpQuartz', () => {
        it('should level up', () => {
            const { quartz } = system.recruitQuartz({});
            system.levelUpQuartz(quartz.quartzId);
            expect(quartz.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpQuartz('ghost');
            expect(result.error).toBe('QUARTZ_NOT_FOUND');
        });

        it('should trigger quartzLeveledUp hook', () => {
            const { quartz } = system.recruitQuartz({});
            let called = false;
            system.registerHook('quartzLeveledUp', () => { called = true; });
            system.levelUpQuartz(quartz.quartzId);
            expect(called).toBe(true);
        });
    });

    describe('legendQuartz', () => {
        it('should legendize', () => {
            const { quartz } = system.recruitQuartz({});
            system.legendQuartz(quartz.quartzId);
            expect(quartz.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendQuartz('ghost');
            expect(result.error).toBe('QUARTZ_NOT_FOUND');
        });

        it('should trigger quartzLegendized hook', () => {
            const { quartz } = system.recruitQuartz({});
            let called = false;
            system.registerHook('quartzLegendized', () => { called = true; });
            system.legendQuartz(quartz.quartzId);
            expect(called).toBe(true);
        });
    });

    describe('calculateQuartzValue', () => {
        it('should calculate', () => {
            const { quartz } = system.recruitQuartz({});
            system.raiseClarity(quartz.quartzId, 10);
            system.addCrystal(quartz.quartzId, 'c1');
            system.addCrystal(quartz.quartzId, 'c2');
            system.levelUpQuartz(quartz.quartzId);
            // level=2*100 + clarity=30*2 + crystals=2*30 = 200 + 60 + 60 = 320
            expect(system.calculateQuartzValue(quartz.quartzId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateQuartzValue('ghost')).toBe(0);
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

        it('should execute default getQuartz', () => {
            const result = system.executeTool('getQuartz', { quartzId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle undefined context', () => {
            let received = 'unset';
            system.registerTool('echo', (ctx) => { received = ctx; return 'ok'; });
            system.executeTool('echo');
            expect(received).toEqual({});
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('quartzRecruited', () => count++);
            unregister();
            system.recruitQuartz({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('quartzRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitQuartz({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalQuartzes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalQuartzes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitQuartz({});
            const json = system.toJSON();
            expect(json.quartzes.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitQuartz({});
            const json = system.toJSON();
            const newSys = new CultivationQuartz();
            newSys.fromJSON(json);
            expect(newSys.quartzes.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.quartzCount).toBe(0);
        });
    });
});
