/**
 * CultivationMist.test.js - 修真雾测试
 * V803 Iteration 6/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMist } from '../../../systems/ai/CultivationMist.js';

describe('CultivationMist', () => {
    let system;
    beforeEach(() => { system = new CultivationMist(); });

    describe('recruitMist', () => {
        it('should create a mist', () => {
            const { mist } = system.recruitMist({ name: 'Morning Mist' });
            expect(mist.name).toBe('Morning Mist');
        });

        it('should default type to morning', () => {
            const { mist } = system.recruitMist({});
            expect(mist.type).toBe('morning');
        });

        it('should default density to baseDensity (20)', () => {
            const { mist } = system.recruitMist({});
            expect(mist.density).toBe(20);
        });

        it('should default status to novice', () => {
            const { mist } = system.recruitMist({});
            expect(mist.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { mist } = system.recruitMist({});
            expect(mist.level).toBe(1);
        });

        it('should default wisps to empty array', () => {
            const { mist } = system.recruitMist({});
            expect(mist.wisps).toEqual([]);
        });

        it('should trigger mistRecruited hook', () => {
            let called = false;
            system.registerHook('mistRecruited', () => { called = true; });
            system.recruitMist({});
            expect(called).toBe(true);
        });

        it('should increment totalMists stat', () => {
            system.recruitMist({});
            expect(system.stats.totalMists).toBe(1);
        });
    });

    describe('getMist', () => {
        it('should return mist by id', () => {
            const { mist } = system.recruitMist({});
            expect(system.getMist(mist.mistId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMist('ghost')).toBeNull(); });
    });

    describe('listMists', () => {
        it('should list all mists', () => {
            system.recruitMist({});
            system.recruitMist({});
            expect(system.listMists().length).toBe(2);
        });
        it('should return empty list when no mists', () => {
            expect(system.listMists().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitMist({ masterId: 'm1' });
            system.recruitMist({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary mists', () => {
            system.recruitMist({});
            const { mist } = system.recruitMist({});
            system.legendMist(mist.mistId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none are legendary', () => {
            system.recruitMist({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addWisp', () => {
        it('should add a wisp to the array', () => {
            const { mist } = system.recruitMist({});
            system.addWisp(mist.mistId, 'fire-wisp');
            expect(mist.wisps.length).toBe(1);
            expect(mist.wisps[0]).toBe('fire-wisp');
        });

        it('should reject missing mist', () => {
            const result = system.addWisp('ghost', 'wisp');
            expect(result.error).toBe('MIST_NOT_FOUND');
        });

        it('should trigger wispAdded hook', () => {
            const { mist } = system.recruitMist({});
            let called = false;
            system.registerHook('wispAdded', () => { called = true; });
            system.addWisp(mist.mistId, 'ice-wisp');
            expect(called).toBe(true);
        });
    });

    describe('raiseDensity', () => {
        it('should raise density by default 5', () => {
            const { mist } = system.recruitMist({});
            system.raiseDensity(mist.mistId);
            expect(mist.density).toBe(25);
        });

        it('should raise density by custom amount', () => {
            const { mist } = system.recruitMist({});
            system.raiseDensity(mist.mistId, 10);
            expect(mist.density).toBe(30);
        });

        it('should reject missing mist', () => {
            const result = system.raiseDensity('ghost', 5);
            expect(result.error).toBe('MIST_NOT_FOUND');
        });

        it('should trigger densityRaised hook', () => {
            const { mist } = system.recruitMist({});
            let called = false;
            system.registerHook('densityRaised', () => { called = true; });
            system.raiseDensity(mist.mistId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMist', () => {
        it('should increment level', () => {
            const { mist } = system.recruitMist({});
            system.levelUpMist(mist.mistId);
            expect(mist.level).toBe(2);
        });

        it('should reject missing mist', () => {
            const result = system.levelUpMist('ghost');
            expect(result.error).toBe('MIST_NOT_FOUND');
        });

        it('should trigger mistLeveledUp hook', () => {
            const { mist } = system.recruitMist({});
            let called = false;
            system.registerHook('mistLeveledUp', () => { called = true; });
            system.levelUpMist(mist.mistId);
            expect(called).toBe(true);
        });
    });

    describe('legendMist', () => {
        it('should set status to legendary', () => {
            const { mist } = system.recruitMist({});
            system.legendMist(mist.mistId);
            expect(mist.status).toBe('legendary');
        });

        it('should reject missing mist', () => {
            const result = system.legendMist('ghost');
            expect(result.error).toBe('MIST_NOT_FOUND');
        });

        it('should trigger mistLegendized hook', () => {
            const { mist } = system.recruitMist({});
            let called = false;
            system.registerHook('mistLegendized', () => { called = true; });
            system.legendMist(mist.mistId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMistValue', () => {
        it('should calculate value: level*100 + density*2 + wisps.length*30', () => {
            const { mist } = system.recruitMist({});
            mist.level = 2;
            mist.density = 30;
            mist.wisps = ['a', 'b'];
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateMistValue(mist.mistId)).toBe(320);
        });

        it('should return 0 for missing mist', () => {
            expect(system.calculateMistValue('ghost')).toBe(0);
        });

        it('should calculate correctly with default values', () => {
            const { mist } = system.recruitMist({});
            // 1*100 + 20*2 + 0*30 = 100 + 40 + 0 = 140
            expect(system.calculateMistValue(mist.mistId)).toBe(140);
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

        it('should execute default getMist tool', () => {
            const result = system.executeTool('getMist', { mistId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('mistRecruited', () => count++);
            unregister();
            system.recruitMist({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('mistRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMist({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient mists', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when totalMists >= 5', () => {
            system.stats.totalMists = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMists = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitMist({});
            const json = system.toJSON();
            expect(json.mists.length).toBe(1);
        });
        it('should deserialize from JSON', () => {
            system.recruitMist({});
            const json = system.toJSON();
            const newSys = new CultivationMist();
            newSys.fromJSON(json);
            expect(newSys.mists.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with mistCount', () => {
            const stats = system.getStats();
            expect(stats.mistCount).toBe(0);
        });
    });
});
