/**
 * CultivationMohist.test.js - 修真墨家测试
 * V642 Iteration 25/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMohist } from '../../../systems/ai/CultivationMohist.js';

describe('CultivationMohist', () => {
    let system;
    beforeEach(() => { system = new CultivationMohist(); });

    describe('recruitMohist', () => {
        it('should recruit', () => {
            const { mohist } = system.recruitMohist({ masterId: 'm1', name: 'Master Mo', type: 'engineer' });
            expect(mohist.masterId).toBe('m1');
            expect(mohist.name).toBe('Master Mo');
            expect(mohist.type).toBe('engineer');
        });

        it('should default to base love', () => {
            const { mohist } = system.recruitMohist({});
            expect(mohist.love).toBe(20);
        });

        it('should default to empty gadgets', () => {
            const { mohist } = system.recruitMohist({});
            expect(mohist.gadgets).toEqual([]);
        });

        it('should default to level 1', () => {
            const { mohist } = system.recruitMohist({});
            expect(mohist.level).toBe(1);
        });

        it('should default to novice status', () => {
            const { mohist } = system.recruitMohist({});
            expect(mohist.status).toBe('novice');
        });

        it('should default to engineer type', () => {
            const { mohist } = system.recruitMohist({});
            expect(mohist.type).toBe('engineer');
        });

        it('should trigger mohistRecruited hook', () => {
            let called = false;
            system.registerHook('mohistRecruited', () => { called = true; });
            system.recruitMohist({});
            expect(called).toBe(true);
        });

        it('should generate unique ids', () => {
            const { mohist: m1 } = system.recruitMohist({});
            const { mohist: m2 } = system.recruitMohist({});
            expect(m1.mohistId).not.toBe(m2.mohistId);
        });
    });

    describe('getMohist', () => {
        it('should return', () => {
            const { mohist } = system.recruitMohist({});
            expect(system.getMohist(mohist.mohistId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMohist('ghost')).toBeNull(); });
    });

    describe('listMohists', () => {
        it('should list all', () => {
            system.recruitMohist({});
            system.recruitMohist({});
            expect(system.listMohists().length).toBe(2);
        });

        it('should return empty list initially', () => {
            expect(system.listMohists().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitMohist({ masterId: 'm1' });
            system.recruitMohist({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitMohist({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary mohists', () => {
            const { mohist: m1 } = system.recruitMohist({});
            const { mohist: m2 } = system.recruitMohist({});
            system.legendMohist(m1.mohistId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].mohistId).toBe(m1.mohistId);
        });

        it('should return empty when none legendary', () => {
            system.recruitMohist({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addGadget', () => {
        it('should add gadget', () => {
            const { mohist } = system.recruitMohist({});
            system.addGadget(mohist.mohistId, 'wooden_ox');
            expect(mohist.gadgets).toContain('wooden_ox');
        });

        it('should reject missing', () => {
            const result = system.addGadget('ghost', 'cloud_ladder');
            expect(result.error).toBe('MOHIST_NOT_FOUND');
        });

        it('should trigger gadgetAdded hook', () => {
            const { mohist } = system.recruitMohist({});
            let called = false;
            system.registerHook('gadgetAdded', () => { called = true; });
            system.addGadget(mohist.mohistId, 'chariot');
            expect(called).toBe(true);
        });
    });

    describe('expressLove', () => {
        it('should express love with custom amount', () => {
            const { mohist } = system.recruitMohist({});
            system.expressLove(mohist.mohistId, 15);
            expect(mohist.love).toBe(35);
        });

        it('should default to 5', () => {
            const { mohist } = system.recruitMohist({});
            system.expressLove(mohist.mohistId);
            expect(mohist.love).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.expressLove('ghost', 5);
            expect(result.error).toBe('MOHIST_NOT_FOUND');
        });

        it('should trigger loveExpressed hook', () => {
            const { mohist } = system.recruitMohist({});
            let called = false;
            system.registerHook('loveExpressed', () => { called = true; });
            system.expressLove(mohist.mohistId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMohist', () => {
        it('should level up', () => {
            const { mohist } = system.recruitMohist({});
            system.levelUpMohist(mohist.mohistId);
            expect(mohist.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { mohist } = system.recruitMohist({});
            system.levelUpMohist(mohist.mohistId);
            system.levelUpMohist(mohist.mohistId);
            system.levelUpMohist(mohist.mohistId);
            expect(mohist.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpMohist('ghost');
            expect(result.error).toBe('MOHIST_NOT_FOUND');
        });

        it('should trigger mohistLeveledUp hook', () => {
            const { mohist } = system.recruitMohist({});
            let called = false;
            system.registerHook('mohistLeveledUp', () => { called = true; });
            system.levelUpMohist(mohist.mohistId);
            expect(called).toBe(true);
        });
    });

    describe('legendMohist', () => {
        it('should set status to legendary', () => {
            const { mohist } = system.recruitMohist({});
            system.legendMohist(mohist.mohistId);
            expect(mohist.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendMohist('ghost');
            expect(result.error).toBe('MOHIST_NOT_FOUND');
        });

        it('should trigger mohistLegendized hook', () => {
            const { mohist } = system.recruitMohist({});
            let called = false;
            system.registerHook('mohistLegendized', () => { called = true; });
            system.legendMohist(mohist.mohistId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMohistValue', () => {
        it('should calculate value', () => {
            const { mohist } = system.recruitMohist({});
            system.addGadget(mohist.mohistId, 'a');
            system.addGadget(mohist.mohistId, 'b');
            // level=1 * 100 + love=20 * 2 + gadgets.length=2 * 30 = 100 + 40 + 60 = 200
            expect(system.calculateMohistValue(mohist.mohistId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMohistValue('ghost')).toBe(0);
        });

        it('should reflect leveling and love', () => {
            const { mohist } = system.recruitMohist({});
            system.levelUpMohist(mohist.mohistId);
            system.expressLove(mohist.mohistId, 10);
            // level=2 * 100 + love=30 * 2 + 0 = 200 + 60 = 260
            expect(system.calculateMohistValue(mohist.mohistId)).toBe(260);
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

        it('should execute default getMohist', () => {
            const result = system.executeTool('getMohist', { mohistId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('mohistRecruited', () => count++);
            unregister();
            system.recruitMohist({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('mohistRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMohist({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMohists = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMohists = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitMohist({});
            const json = system.toJSON();
            expect(json.mohists.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitMohist({});
            const json = system.toJSON();
            const newSys = new CultivationMohist();
            newSys.fromJSON(json);
            expect(newSys.mohists.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.mohistCount).toBe(0);
        });
    });
});
