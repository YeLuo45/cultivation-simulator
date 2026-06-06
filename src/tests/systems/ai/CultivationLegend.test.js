/**
 * CultivationLegend.test.js - 修真传奇系统测试
 * V662 Iteration 15/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationLegend } from '../../../systems/ai/CultivationLegend.js';

describe('CultivationLegend', () => {
    let system;
    beforeEach(() => { system = new CultivationLegend(); });

    describe('recruitLegend', () => {
        it('should recruit with masterId and name', () => {
            const { legend } = system.recruitLegend({ masterId: 'm1', name: 'Saga of the Phoenix' });
            expect(legend.masterId).toBe('m1');
            expect(legend.name).toBe('Saga of the Phoenix');
        });

        it('should default to myth type', () => {
            const { legend } = system.recruitLegend({});
            expect(legend.type).toBe('myth');
        });

        it('should accept type myth', () => {
            const { legend } = system.recruitLegend({ type: 'myth' });
            expect(legend.type).toBe('myth');
        });

        it('should accept type heroic', () => {
            const { legend } = system.recruitLegend({ type: 'heroic' });
            expect(legend.type).toBe('heroic');
        });

        it('should accept type divine', () => {
            const { legend } = system.recruitLegend({ type: 'divine' });
            expect(legend.type).toBe('divine');
        });

        it('should default fame to baseFame', () => {
            const { legend } = system.recruitLegend({});
            expect(legend.fame).toBe(20);
        });

        it('should accept explicit fame', () => {
            const { legend } = system.recruitLegend({ fame: 100 });
            expect(legend.fame).toBe(100);
        });

        it('should accept fame=0', () => {
            const { legend } = system.recruitLegend({ fame: 0 });
            expect(legend.fame).toBe(0);
        });

        it('should default tales to empty array', () => {
            const { legend } = system.recruitLegend({});
            expect(legend.tales).toEqual([]);
        });

        it('should clone tales array', () => {
            const orig = ['tale-a'];
            const { legend } = system.recruitLegend({ tales: orig });
            orig.push('tale-b');
            expect(legend.tales.length).toBe(1);
        });

        it('should start at level 1', () => {
            const { legend } = system.recruitLegend({});
            expect(legend.level).toBe(1);
        });

        it('should default status to novice', () => {
            const { legend } = system.recruitLegend({});
            expect(legend.status).toBe('novice');
        });

        it('should generate legendId', () => {
            const { legend } = system.recruitLegend({});
            expect(legend.legendId).toBeDefined();
            expect(typeof legend.legendId).toBe('string');
        });

        it('should accept custom legendId', () => {
            const { legend } = system.recruitLegend({ legendId: 'my-legend' });
            expect(legend.legendId).toBe('my-legend');
        });

        it('should trigger legendRecruited hook', () => {
            let called = false;
            system.registerHook('legendRecruited', () => { called = true; });
            system.recruitLegend({});
            expect(called).toBe(true);
        });

        it('should set createdAt timestamp', () => {
            const { legend } = system.recruitLegend({});
            expect(legend.createdAt).toBeDefined();
            expect(typeof legend.createdAt).toBe('number');
        });

        it('should increment totalLegends stat', () => {
            system.recruitLegend({});
            system.recruitLegend({});
            expect(system.stats.totalLegends).toBe(2);
        });
    });

    describe('getLegend', () => {
        it('should return legend', () => {
            const { legend } = system.recruitLegend({});
            expect(system.getLegend(legend.legendId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getLegend('ghost')).toBeNull();
        });
        it('should return a copy', () => {
            const { legend } = system.recruitLegend({ name: 'Original' });
            const fetched = system.getLegend(legend.legendId);
            fetched.name = 'Mutated';
            expect(system.getLegend(legend.legendId).name).toBe('Original');
        });
    });

    describe('listLegends', () => {
        it('should list all', () => {
            system.recruitLegend({});
            system.recruitLegend({});
            expect(system.listLegends().length).toBe(2);
        });
        it('should return empty when no legends', () => {
            expect(system.listLegends().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitLegend({ masterId: 'm1' });
            system.recruitLegend({ masterId: 'm2' });
            system.recruitLegend({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
        it('should return empty for unknown master', () => {
            system.recruitLegend({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { legend: l1 } = system.recruitLegend({});
            const { legend: l2 } = system.recruitLegend({});
            system.legendLegend(l1.legendId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].legendId).toBe(l1.legendId);
            expect(l2.status).toBe('novice');
        });
        it('should return empty when none legendary', () => {
            system.recruitLegend({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addTale', () => {
        it('should add tale', () => {
            const { legend } = system.recruitLegend({});
            system.addTale(legend.legendId, 'The Battle of Five Peaks');
            expect(legend.tales).toContain('The Battle of Five Peaks');
        });

        it('should accumulate tales', () => {
            const { legend } = system.recruitLegend({});
            system.addTale(legend.legendId, 'tale-1');
            system.addTale(legend.legendId, 'tale-2');
            system.addTale(legend.legendId, 'tale-3');
            expect(legend.tales.length).toBe(3);
        });

        it('should reject missing legend', () => {
            const result = system.addTale('ghost', 'tale');
            expect(result.error).toBe('LEGEND_NOT_FOUND');
        });

        it('should trigger taleAdded hook', () => {
            const { legend } = system.recruitLegend({});
            let received = null;
            system.registerHook('taleAdded', (d) => { received = d; });
            system.addTale(legend.legendId, 'epic-tale');
            expect(received.tale).toBe('epic-tale');
        });
    });

    describe('buildFame', () => {
        it('should build fame by default', () => {
            const { legend } = system.recruitLegend({});
            system.buildFame(legend.legendId);
            expect(legend.fame).toBe(25);
        });

        it('should build fame by custom amount', () => {
            const { legend } = system.recruitLegend({});
            system.buildFame(legend.legendId, 100);
            expect(legend.fame).toBe(120);
        });

        it('should reject missing legend', () => {
            const result = system.buildFame('ghost', 5);
            expect(result.error).toBe('LEGEND_NOT_FOUND');
        });

        it('should trigger fameBuilt hook', () => {
            const { legend } = system.recruitLegend({});
            let received = null;
            system.registerHook('fameBuilt', (d) => { received = d; });
            system.buildFame(legend.legendId, 10);
            expect(received.newFame).toBe(30);
        });
    });

    describe('levelUpLegend', () => {
        it('should level up', () => {
            const { legend } = system.recruitLegend({});
            system.levelUpLegend(legend.legendId);
            expect(legend.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { legend } = system.recruitLegend({});
            system.levelUpLegend(legend.legendId);
            system.levelUpLegend(legend.legendId);
            system.levelUpLegend(legend.legendId);
            expect(legend.level).toBe(4);
        });

        it('should reject missing legend', () => {
            const result = system.levelUpLegend('ghost');
            expect(result.error).toBe('LEGEND_NOT_FOUND');
        });

        it('should trigger legendLeveledUp hook', () => {
            const { legend } = system.recruitLegend({});
            let received = null;
            system.registerHook('legendLeveledUp', (d) => { received = d; });
            system.levelUpLegend(legend.legendId);
            expect(received.newLevel).toBe(2);
        });
    });

    describe('legendLegend', () => {
        it('should mark legendary', () => {
            const { legend } = system.recruitLegend({});
            system.legendLegend(legend.legendId);
            expect(legend.status).toBe('legendary');
        });

        it('should reject missing legend', () => {
            const result = system.legendLegend('ghost');
            expect(result.error).toBe('LEGEND_NOT_FOUND');
        });

        it('should trigger legendLegendized hook', () => {
            const { legend } = system.recruitLegend({});
            let called = false;
            system.registerHook('legendLegendized', () => { called = true; });
            system.legendLegend(legend.legendId);
            expect(called).toBe(true);
        });
    });

    describe('calculateLegendValue', () => {
        it('should calculate base value', () => {
            const { legend } = system.recruitLegend({});
            // level=1, fame=20, tales=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculateLegendValue(legend.legendId)).toBe(140);
        });

        it('should include tales in value', () => {
            const { legend } = system.recruitLegend({});
            system.addTale(legend.legendId, 'tale-1');
            system.addTale(legend.legendId, 'tale-2');
            // level=1, fame=20, tales=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateLegendValue(legend.legendId)).toBe(200);
        });

        it('should scale with level', () => {
            const { legend } = system.recruitLegend({});
            system.levelUpLegend(legend.legendId);
            system.levelUpLegend(legend.legendId);
            // level=3, fame=20, tales=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculateLegendValue(legend.legendId)).toBe(340);
        });

        it('should scale with fame', () => {
            const { legend } = system.recruitLegend({});
            system.buildFame(legend.legendId, 100);
            // level=1, fame=120, tales=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculateLegendValue(legend.legendId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateLegendValue('ghost')).toBe(0);
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

        it('should handle undefined context', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test');
            expect(result.success).toBe(true);
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

        it('should execute default getLegend tool', () => {
            const result = system.executeTool('getLegend', { legendId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitLegend tool', () => {
            const result = system.executeTool('recruitLegend', { masterId: 'm1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('legendRecruited', () => count++);
            unregister();
            system.recruitLegend({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('legendRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitLegend({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalLegends = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalLegends = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitLegend({});
            const json = system.toJSON();
            expect(json.legends.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitLegend({});
            const json = system.toJSON();
            const newSys = new CultivationLegend();
            newSys.fromJSON(json);
            expect(newSys.legends.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.legendCount).toBe(0);
        });
    });
});
