/**
 * CultivationLuck.test.js - 修真运气测试
 * V741 Iteration 4/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationLuck } from '../../../systems/ai/CultivationLuck.js';

describe('CultivationLuck', () => {
    let system;
    beforeEach(() => { system = new CultivationLuck(); });

    describe('recruitLuck', () => {
        it('should recruit', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1', name: 'Lucky1', type: 'fortune' });
            expect(luck.masterId).toBe('m1');
            expect(luck.name).toBe('Lucky1');
            expect(luck.type).toBe('fortune');
        });

        it('should default name to unnamed', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            expect(luck.name).toBe('unnamed');
        });

        it('should default type to fortune', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            expect(luck.type).toBe('fortune');
        });

        it('should default chance to baseChance', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            expect(luck.chance).toBe(20);
        });

        it('should set level to 1 and status to novice', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            expect(luck.level).toBe(1);
            expect(luck.status).toBe('novice');
        });

        it('should init empty charms', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            expect(luck.charms).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            expect(luck.luckId).toBeTruthy();
        });

        it('should respect provided id', () => {
            const { luck } = system.recruitLuck({ id: 'custom-luck', masterId: 'm1' });
            expect(luck.luckId).toBe('custom-luck');
        });

        it('should accept custom charms', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1', charms: ['c1', 'c2'] });
            expect(luck.charms.length).toBe(2);
        });

        it('should accept custom chance', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1', chance: 99 });
            expect(luck.chance).toBe(99);
        });

        it('should accept serendipity type', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1', type: 'serendipity' });
            expect(luck.type).toBe('serendipity');
        });

        it('should accept blessing type', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1', type: 'blessing' });
            expect(luck.type).toBe('blessing');
        });

        it('should increment totalLucks', () => {
            system.recruitLuck({ masterId: 'm1' });
            expect(system.stats.totalLucks).toBe(1);
        });

        it('should trigger luckRecruited hook', () => {
            let called = false;
            system.registerHook('luckRecruited', () => { called = true; });
            system.recruitLuck({ masterId: 'm1' });
            expect(called).toBe(true);
        });
    });

    describe('getLuck', () => {
        it('should return luck', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            expect(system.getLuck(luck.luckId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getLuck('ghost')).toBeNull(); });
    });

    describe('listLucks', () => {
        it('should list all', () => {
            system.recruitLuck({ masterId: 'm1' });
            system.recruitLuck({ masterId: 'm2' });
            expect(system.listLucks().length).toBe(2);
        });

        it('should return empty array when none', () => {
            expect(system.listLucks().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitLuck({ masterId: 'm1' });
            system.recruitLuck({ masterId: 'm2' });
            system.recruitLuck({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitLuck({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { luck: l1 } = system.recruitLuck({ masterId: 'm1' });
            system.recruitLuck({ masterId: 'm1' });
            system.legendLuck(l1.luckId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitLuck({ masterId: 'm1' });
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addCharm', () => {
        it('should add charm', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            system.addCharm(luck.luckId, 'c1');
            expect(luck.charms.length).toBe(1);
            expect(luck.charms[0]).toBe('c1');
        });

        it('should reject missing luck', () => {
            const result = system.addCharm('ghost', 'c1');
            expect(result.error).toBe('LUCK_NOT_FOUND');
        });

        it('should promote to veteran at 3 charms', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            system.addCharm(luck.luckId, 'c1');
            system.addCharm(luck.luckId, 'c2');
            system.addCharm(luck.luckId, 'c3');
            expect(luck.status).toBe('veteran');
        });

        it('should not promote past veteran', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            system.legendLuck(luck.luckId);
            system.addCharm(luck.luckId, 'c1');
            system.addCharm(luck.luckId, 'c2');
            system.addCharm(luck.luckId, 'c3');
            expect(luck.status).toBe('legendary');
        });

        it('should trigger charmAdded hook', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            let called = false;
            system.registerHook('charmAdded', () => { called = true; });
            system.addCharm(luck.luckId, 'c1');
            expect(called).toBe(true);
        });
    });

    describe('raiseChance', () => {
        it('should raise by default 5', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            system.raiseChance(luck.luckId);
            expect(luck.chance).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            system.raiseChance(luck.luckId, 50);
            expect(luck.chance).toBe(70);
        });

        it('should reject missing luck', () => {
            const result = system.raiseChance('ghost', 5);
            expect(result.error).toBe('LUCK_NOT_FOUND');
        });

        it('should trigger chanceRaised hook', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            let called = false;
            system.registerHook('chanceRaised', () => { called = true; });
            system.raiseChance(luck.luckId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpLuck', () => {
        it('should level up', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            system.levelUpLuck(luck.luckId);
            expect(luck.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            system.levelUpLuck(luck.luckId);
            system.levelUpLuck(luck.luckId);
            system.levelUpLuck(luck.luckId);
            expect(luck.level).toBe(4);
        });

        it('should reject missing luck', () => {
            const result = system.levelUpLuck('ghost');
            expect(result.error).toBe('LUCK_NOT_FOUND');
        });

        it('should trigger luckLeveledUp hook', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            let called = false;
            system.registerHook('luckLeveledUp', () => { called = true; });
            system.levelUpLuck(luck.luckId);
            expect(called).toBe(true);
        });
    });

    describe('legendLuck', () => {
        it('should set status to legendary', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            system.legendLuck(luck.luckId);
            expect(luck.status).toBe('legendary');
        });

        it('should reject missing luck', () => {
            const result = system.legendLuck('ghost');
            expect(result.error).toBe('LUCK_NOT_FOUND');
        });

        it('should trigger luckLegendized hook', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            let called = false;
            system.registerHook('luckLegendized', () => { called = true; });
            system.legendLuck(luck.luckId);
            expect(called).toBe(true);
        });
    });

    describe('calculateLuckValue', () => {
        it('should calculate base value', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            // level=1, chance=20, charms=0 -> 100 + 40 + 0 = 140
            expect(system.calculateLuckValue(luck.luckId)).toBe(140);
        });

        it('should factor in level', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            system.levelUpLuck(luck.luckId);
            system.levelUpLuck(luck.luckId);
            // level=3, chance=20, charms=0 -> 300 + 40 + 0 = 340
            expect(system.calculateLuckValue(luck.luckId)).toBe(340);
        });

        it('should factor in charms', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            system.addCharm(luck.luckId, 'c1');
            system.addCharm(luck.luckId, 'c2');
            // level=1, chance=20, charms=2 -> 100 + 40 + 60 = 200
            expect(system.calculateLuckValue(luck.luckId)).toBe(200);
        });

        it('should factor in chance', () => {
            const { luck } = system.recruitLuck({ masterId: 'm1' });
            system.raiseChance(luck.luckId, 30);
            // level=1, chance=50, charms=0 -> 100 + 100 + 0 = 200
            expect(system.calculateLuckValue(luck.luckId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateLuckValue('ghost')).toBe(0);
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

        it('should execute default getLuck', () => {
            const result = system.executeTool('getLuck', { luckId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute tool with no context', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('luckRecruited', () => count++);
            unregister();
            system.recruitLuck({ masterId: 'm1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('luckRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitLuck({ masterId: 'm1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalLucks = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalLucks = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitLuck({ masterId: 'm1' });
            const json = system.toJSON();
            expect(json.lucks.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitLuck({ masterId: 'm1' });
            const json = system.toJSON();
            const newSys = new CultivationLuck();
            newSys.fromJSON(json);
            expect(newSys.lucks.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.luckCount).toBe(0);
            expect(stats.totalLucks).toBe(0);
        });
    });

    describe('config defaults', () => {
        it('should accept custom config', () => {
            const sys = new CultivationLuck({ maxLucks: 50, baseChance: 10 });
            expect(sys.config.maxLucks).toBe(50);
            expect(sys.config.baseChance).toBe(10);
        });
    });
});
