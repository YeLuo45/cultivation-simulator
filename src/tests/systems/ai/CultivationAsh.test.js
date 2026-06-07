/**
 * CultivationAsh.test.js - 修真灰系统测试
 * V848 Iteration 21/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationAsh } from '../../../systems/ai/CultivationAsh.js';

describe('CultivationAsh', () => {
    let system;
    beforeEach(() => { system = new CultivationAsh(); });

    describe('recruitAsh', () => {
        it('should recruit with defaults', () => {
            const { ash } = system.recruitAsh({});
            expect(ash.masterId).toBe('unknown_master');
            expect(ash.name).toBe('unnamed_ash');
            expect(ash.type).toBe('volcanic');
            expect(ash.warmth).toBe(20);
            expect(ash.embers).toEqual([]);
            expect(ash.level).toBe(1);
            expect(ash.status).toBe('novice');
        });

        it('should recruit with custom data', () => {
            const { ash } = system.recruitAsh({
                masterId: 'm1',
                name: 'PhoenixAsh',
                type: 'divine',
                warmth: 80,
                embers: ['spark'],
                level: 3,
                status: 'veteran'
            });
            expect(ash.masterId).toBe('m1');
            expect(ash.name).toBe('PhoenixAsh');
            expect(ash.type).toBe('divine');
            expect(ash.warmth).toBe(80);
            expect(ash.embers).toEqual(['spark']);
            expect(ash.level).toBe(3);
            expect(ash.status).toBe('veteran');
        });

        it('should increment totalAshes', () => {
            system.recruitAsh({});
            system.recruitAsh({});
            expect(system.stats.totalAshes).toBe(2);
        });

        it('should trigger ashRecruited hook', () => {
            let called = false;
            system.registerHook('ashRecruited', () => { called = true; });
            system.recruitAsh({});
            expect(called).toBe(true);
        });
    });

    describe('getAsh', () => {
        it('should return ash', () => {
            const { ash } = system.recruitAsh({});
            const got = system.getAsh(ash.ashId);
            expect(got).not.toBeNull();
            expect(got.ashId).toBe(ash.ashId);
        });
        it('should return null for missing', () => { expect(system.getAsh('ghost')).toBeNull(); });
    });

    describe('listAshes', () => {
        it('should list all', () => {
            system.recruitAsh({});
            system.recruitAsh({});
            system.recruitAsh({});
            expect(system.listAshes().length).toBe(3);
        });

        it('should return empty list when no ashes', () => {
            expect(system.listAshes().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitAsh({ masterId: 'm1' });
            system.recruitAsh({ masterId: 'm1' });
            system.recruitAsh({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary ashes', () => {
            const { ash: a1 } = system.recruitAsh({});
            const { ash: a2 } = system.recruitAsh({});
            system.legendAsh(a1.ashId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].ashId).toBe(a1.ashId);
        });

        it('should return empty when none legendary', () => {
            system.recruitAsh({});
            system.recruitAsh({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addEmber', () => {
        it('should add ember', () => {
            const { ash } = system.recruitAsh({});
            system.addEmber(ash.ashId, 'spark');
            expect(ash.embers).toContain('spark');
            expect(ash.embers.length).toBe(1);
        });

        it('should add multiple embers', () => {
            const { ash } = system.recruitAsh({});
            system.addEmber(ash.ashId, 'spark');
            system.addEmber(ash.ashId, 'flame');
            expect(ash.embers).toEqual(['spark', 'flame']);
        });

        it('should set status to veteran when 5+ embers', () => {
            const { ash } = system.recruitAsh({});
            system.addEmber(ash.ashId, 'a');
            system.addEmber(ash.ashId, 'b');
            system.addEmber(ash.ashId, 'c');
            system.addEmber(ash.ashId, 'd');
            expect(ash.status).toBe('novice');
            system.addEmber(ash.ashId, 'e');
            expect(ash.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.addEmber('ghost', 'spark');
            expect(result.error).toBe('ASH_NOT_FOUND');
        });

        it('should trigger emberAdded hook', () => {
            const { ash } = system.recruitAsh({});
            let called = false;
            system.registerHook('emberAdded', () => { called = true; });
            system.addEmber(ash.ashId, 'spark');
            expect(called).toBe(true);
        });
    });

    describe('raiseWarmth', () => {
        it('should raise by default amount', () => {
            const { ash } = system.recruitAsh({});
            system.raiseWarmth(ash.ashId);
            expect(ash.warmth).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { ash } = system.recruitAsh({});
            system.raiseWarmth(ash.ashId, 30);
            expect(ash.warmth).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raiseWarmth('ghost', 5);
            expect(result.error).toBe('ASH_NOT_FOUND');
        });

        it('should trigger warmthRaised hook', () => {
            const { ash } = system.recruitAsh({});
            let called = false;
            system.registerHook('warmthRaised', () => { called = true; });
            system.raiseWarmth(ash.ashId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpAsh', () => {
        it('should level up', () => {
            const { ash } = system.recruitAsh({});
            system.levelUpAsh(ash.ashId);
            expect(ash.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { ash } = system.recruitAsh({});
            system.levelUpAsh(ash.ashId);
            system.levelUpAsh(ash.ashId);
            expect(ash.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpAsh('ghost');
            expect(result.error).toBe('ASH_NOT_FOUND');
        });

        it('should trigger ashLeveledUp hook', () => {
            const { ash } = system.recruitAsh({});
            let called = false;
            system.registerHook('ashLeveledUp', () => { called = true; });
            system.levelUpAsh(ash.ashId);
            expect(called).toBe(true);
        });
    });

    describe('legendAsh', () => {
        it('should set status to legendary', () => {
            const { ash } = system.recruitAsh({});
            system.legendAsh(ash.ashId);
            expect(ash.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendAsh('ghost');
            expect(result.error).toBe('ASH_NOT_FOUND');
        });

        it('should trigger ashLegendized hook', () => {
            const { ash } = system.recruitAsh({});
            let called = false;
            system.registerHook('ashLegendized', () => { called = true; });
            system.legendAsh(ash.ashId);
            expect(called).toBe(true);
        });
    });

    describe('calculateAshValue', () => {
        it('should calculate default value', () => {
            const { ash } = system.recruitAsh({});
            // level=1 * 100 + warmth=20 * 2 + 0 * 30 = 140
            expect(system.calculateAshValue(ash.ashId)).toBe(140);
        });

        it('should add 30 per ember', () => {
            const { ash } = system.recruitAsh({});
            system.addEmber(ash.ashId, 'spark');
            system.addEmber(ash.ashId, 'flame');
            // 100 + 40 + 2*30 = 200
            expect(system.calculateAshValue(ash.ashId)).toBe(200);
        });

        it('should reflect level in formula', () => {
            const { ash } = system.recruitAsh({});
            system.levelUpAsh(ash.ashId);
            system.levelUpAsh(ash.ashId);
            // 3*100 + 40 + 0 = 340
            expect(system.calculateAshValue(ash.ashId)).toBe(340);
        });

        it('should reflect warmth in formula', () => {
            const { ash } = system.recruitAsh({});
            system.raiseWarmth(ash.ashId, 30);
            // 100 + 50*2 + 0 = 200
            expect(system.calculateAshValue(ash.ashId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateAshValue('ghost')).toBe(0);
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
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getAsh', () => {
            const result = system.executeTool('getAsh', { ashId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('ashRecruited', () => count++);
            unregister();
            system.recruitAsh({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('ashRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitAsh({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalAshes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalAshes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitAsh({});
            const json = system.toJSON();
            expect(json.ashes.length).toBe(1);
            expect(json.stats.totalAshes).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitAsh({ name: 'a' });
            const json = system.toJSON();
            const newSys = new CultivationAsh();
            newSys.fromJSON(json);
            expect(newSys.ashes.size).toBe(1);
            expect(newSys.stats.totalAshes).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.ashCount).toBe(0);
            expect(stats.totalAshes).toBe(0);
            system.recruitAsh({});
            expect(system.getStats().ashCount).toBe(1);
        });
    });
});
