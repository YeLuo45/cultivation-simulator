/**
 * CultivationJade.test.js - 修真翡翠系统测试
 * V831 Iteration 4/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationJade } from '../../../systems/ai/CultivationJade.js';

describe('CultivationJade', () => {
    let system;
    beforeEach(() => { system = new CultivationJade(); });

    describe('recruitJade', () => {
        it('should recruit with defaults', () => {
            const { jade } = system.recruitJade({});
            expect(jade.masterId).toBe('unknown_master');
            expect(jade.name).toBe('unnamed_jade');
            expect(jade.type).toBe('imperial');
            expect(jade.luster).toBe(20);
            expect(jade.carvings).toEqual([]);
            expect(jade.level).toBe(1);
            expect(jade.status).toBe('novice');
        });

        it('should recruit with custom data', () => {
            const { jade } = system.recruitJade({
                masterId: 'm1',
                name: 'CelestialJade',
                type: 'divine',
                luster: 80,
                carvings: ['dragon'],
                level: 3,
                status: 'veteran'
            });
            expect(jade.masterId).toBe('m1');
            expect(jade.name).toBe('CelestialJade');
            expect(jade.type).toBe('divine');
            expect(jade.luster).toBe(80);
            expect(jade.carvings).toEqual(['dragon']);
            expect(jade.level).toBe(3);
            expect(jade.status).toBe('veteran');
        });

        it('should support white type', () => {
            const { jade } = system.recruitJade({ type: 'white' });
            expect(jade.type).toBe('white');
        });

        it('should increment totalJades', () => {
            system.recruitJade({});
            system.recruitJade({});
            expect(system.stats.totalJades).toBe(2);
        });

        it('should trigger jadeRecruited hook', () => {
            let called = false;
            system.registerHook('jadeRecruited', () => { called = true; });
            system.recruitJade({});
            expect(called).toBe(true);
        });

        it('should respect maxJades config', () => {
            const tiny = new CultivationJade({ maxJades: 2 });
            expect(tiny.config.maxJades).toBe(2);
        });
    });

    describe('getJade', () => {
        it('should return jade', () => {
            const { jade } = system.recruitJade({});
            const got = system.getJade(jade.jadeId);
            expect(got).not.toBeNull();
            expect(got.jadeId).toBe(jade.jadeId);
        });
        it('should return null for missing', () => { expect(system.getJade('ghost')).toBeNull(); });
    });

    describe('listJades', () => {
        it('should list all', () => {
            system.recruitJade({});
            system.recruitJade({});
            system.recruitJade({});
            expect(system.listJades().length).toBe(3);
        });

        it('should return empty list when no jades', () => {
            expect(system.listJades().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitJade({ masterId: 'm1' });
            system.recruitJade({ masterId: 'm1' });
            system.recruitJade({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary jades', () => {
            const { jade: j1 } = system.recruitJade({});
            const { jade: j2 } = system.recruitJade({});
            system.legendJade(j1.jadeId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].jadeId).toBe(j1.jadeId);
            expect(j2.status).toBe('novice');
        });

        it('should return empty when none legendary', () => {
            system.recruitJade({});
            system.recruitJade({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addCarving', () => {
        it('should add carving', () => {
            const { jade } = system.recruitJade({});
            system.addCarving(jade.jadeId, 'phoenix');
            expect(jade.carvings).toContain('phoenix');
            expect(jade.carvings.length).toBe(1);
        });

        it('should add multiple carvings', () => {
            const { jade } = system.recruitJade({});
            system.addCarving(jade.jadeId, 'phoenix');
            system.addCarving(jade.jadeId, 'dragon');
            expect(jade.carvings).toEqual(['phoenix', 'dragon']);
        });

        it('should reject missing', () => {
            const result = system.addCarving('ghost', 'phoenix');
            expect(result.error).toBe('JADE_NOT_FOUND');
        });

        it('should trigger carvingAdded hook', () => {
            const { jade } = system.recruitJade({});
            let called = false;
            system.registerHook('carvingAdded', () => { called = true; });
            system.addCarving(jade.jadeId, 'phoenix');
            expect(called).toBe(true);
        });
    });

    describe('raiseLuster', () => {
        it('should raise by default amount', () => {
            const { jade } = system.recruitJade({});
            system.raiseLuster(jade.jadeId);
            expect(jade.luster).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { jade } = system.recruitJade({});
            system.raiseLuster(jade.jadeId, 30);
            expect(jade.luster).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raiseLuster('ghost', 5);
            expect(result.error).toBe('JADE_NOT_FOUND');
        });

        it('should trigger lusterRaised hook', () => {
            const { jade } = system.recruitJade({});
            let called = false;
            system.registerHook('lusterRaised', () => { called = true; });
            system.raiseLuster(jade.jadeId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpJade', () => {
        it('should level up', () => {
            const { jade } = system.recruitJade({});
            system.levelUpJade(jade.jadeId);
            expect(jade.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { jade } = system.recruitJade({});
            system.levelUpJade(jade.jadeId);
            system.levelUpJade(jade.jadeId);
            system.levelUpJade(jade.jadeId);
            expect(jade.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpJade('ghost');
            expect(result.error).toBe('JADE_NOT_FOUND');
        });

        it('should trigger jadeLeveledUp hook', () => {
            const { jade } = system.recruitJade({});
            let called = false;
            system.registerHook('jadeLeveledUp', () => { called = true; });
            system.levelUpJade(jade.jadeId);
            expect(called).toBe(true);
        });
    });

    describe('legendJade', () => {
        it('should set status to legendary', () => {
            const { jade } = system.recruitJade({});
            system.legendJade(jade.jadeId);
            expect(jade.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendJade('ghost');
            expect(result.error).toBe('JADE_NOT_FOUND');
        });

        it('should trigger jadeLegendized hook', () => {
            const { jade } = system.recruitJade({});
            let called = false;
            system.registerHook('jadeLegendized', () => { called = true; });
            system.legendJade(jade.jadeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateJadeValue', () => {
        it('should calculate default value', () => {
            const { jade } = system.recruitJade({});
            // level=1 * 100 + luster=20 * 2 + 0 * 30 = 140
            expect(system.calculateJadeValue(jade.jadeId)).toBe(140);
        });

        it('should add 30 per carving', () => {
            const { jade } = system.recruitJade({});
            system.addCarving(jade.jadeId, 'phoenix');
            system.addCarving(jade.jadeId, 'dragon');
            // 100 + 40 + 2*30 = 200
            expect(system.calculateJadeValue(jade.jadeId)).toBe(200);
        });

        it('should reflect level in formula', () => {
            const { jade } = system.recruitJade({});
            system.levelUpJade(jade.jadeId);
            system.levelUpJade(jade.jadeId);
            // 3 * 100 + 40 + 0 = 340
            expect(system.calculateJadeValue(jade.jadeId)).toBe(340);
        });

        it('should reflect luster in formula', () => {
            const { jade } = system.recruitJade({ luster: 50 });
            // 1 * 100 + 50 * 2 + 0 = 200
            expect(system.calculateJadeValue(jade.jadeId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateJadeValue('ghost')).toBe(0);
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

        it('should execute default getJade', () => {
            const result = system.executeTool('getJade', { jadeId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitJade', () => {
            const result = system.executeTool('recruitJade', { masterId: 'm1' });
            expect(result.success).toBe(true);
            expect(result.result.jade.masterId).toBe('m1');
        });

        it('should execute tool with null context', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo', null);
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('jadeRecruited', () => count++);
            unregister();
            system.recruitJade({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('jadeRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitJade({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalJades = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalJades = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitJade({});
            const json = system.toJSON();
            expect(json.jades.length).toBe(1);
            expect(json.stats.totalJades).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitJade({ name: 'a' });
            const json = system.toJSON();
            const newSys = new CultivationJade();
            newSys.fromJSON(json);
            expect(newSys.jades.size).toBe(1);
            expect(newSys.stats.totalJades).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.jadeCount).toBe(0);
            expect(stats.totalJades).toBe(0);
            system.recruitJade({});
            expect(system.getStats().jadeCount).toBe(1);
        });
    });
});
