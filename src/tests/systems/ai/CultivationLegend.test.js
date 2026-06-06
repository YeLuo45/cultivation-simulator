/**
 * CultivationLegend.test.js - 修真传说系统测试
 * V571 Iteration 14/20 Round 23 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationLegend } from '../../../systems/ai/CultivationLegend.js';

describe('CultivationLegend', () => {
    let system;
    beforeEach(() => { system = new CultivationLegend(); });

    describe('tellLegend', () => {
        it('should create', () => {
            const { legend } = system.tellLegend({ narratorId: 'n1', name: 'The Great Saga' });
            expect(legend.narratorId).toBe('n1');
            expect(legend.name).toBe('The Great Saga');
            expect(legend.type).toBe('hero');
        });

        it('should respect type', () => {
            const { legend } = system.tellLegend({ type: 'demon' });
            expect(legend.type).toBe('demon');
        });

        it('should respect type divine', () => {
            const { legend } = system.tellLegend({ type: 'divine' });
            expect(legend.type).toBe('divine');
        });

        it('should use baseNarrative default', () => {
            const { legend } = system.tellLegend({});
            expect(legend.narrative).toBe(20);
        });

        it('should accept explicit narrative', () => {
            const { legend } = system.tellLegend({ narrative: 100 });
            expect(legend.narrative).toBe(100);
        });

        it('should accept narrative=0', () => {
            const { legend } = system.tellLegend({ narrative: 0 });
            expect(legend.narrative).toBe(0);
        });

        it('should respect heroes array', () => {
            const { legend } = system.tellLegend({ heroes: ['h1', 'h2'] });
            expect(legend.heroes.length).toBe(2);
        });

        it('should clone heroes array', () => {
            const orig = ['a'];
            const { legend } = system.tellLegend({ heroes: orig });
            orig.push('b');
            expect(legend.heroes.length).toBe(1);
        });

        it('should reject when storage full', () => {
            system.config.maxLegends = 1;
            system.tellLegend({});
            const result = system.tellLegend({});
            expect(result.error).toBe('STORAGE_FULL');
        });

        it('should trigger legendTold hook', () => {
            let called = false;
            system.registerHook('legendTold', () => { called = true; });
            system.tellLegend({});
            expect(called).toBe(true);
        });
    });

    describe('getLegend', () => {
        it('should return', () => {
            const { legend } = system.tellLegend({});
            expect(system.getLegend(legend.legendId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getLegend('ghost')).toBeNull(); });
        it('should return a copy', () => {
            const { legend } = system.tellLegend({ name: 'X' });
            const fetched = system.getLegend(legend.legendId);
            fetched.name = 'Y';
            expect(system.getLegend(legend.legendId).name).toBe('X');
        });
    });

    describe('listLegends', () => {
        it('should list all', () => {
            system.tellLegend({});
            system.tellLegend({});
            expect(system.listLegends().length).toBe(2);
        });
        it('should be empty initially', () => {
            expect(system.listLegends().length).toBe(0);
        });
    });

    describe('listByNarrator', () => {
        it('should filter by narrator', () => {
            system.tellLegend({ narratorId: 'n1' });
            system.tellLegend({ narratorId: 'n2' });
            system.tellLegend({ narratorId: 'n1' });
            expect(system.listByNarrator('n1').length).toBe(2);
        });
        it('should return empty for unknown narrator', () => {
            system.tellLegend({ narratorId: 'n1' });
            expect(system.listByNarrator('ghost').length).toBe(0);
        });
    });

    describe('listImmortal', () => {
        it('should filter by status', () => {
            const { legend } = system.tellLegend({});
            system.immortalizeLegend(legend.legendId);
            system.tellLegend({});
            expect(system.listImmortal().length).toBe(1);
        });
        it('should be empty when none', () => {
            system.tellLegend({});
            expect(system.listImmortal().length).toBe(0);
        });
    });

    describe('addHero', () => {
        it('should add hero', () => {
            const { legend } = system.tellLegend({});
            system.addHero(legend.legendId, 'hero 1');
            expect(legend.heroes.length).toBe(1);
            expect(legend.heroes[0]).toBe('hero 1');
        });

        it('should reject missing', () => {
            const result = system.addHero('ghost', 'h');
            expect(result.error).toBe('LEGEND_NOT_FOUND');
        });

        it('should trigger heroAdded hook', () => {
            const { legend } = system.tellLegend({});
            let received = null;
            system.registerHook('heroAdded', (d) => { received = d; });
            system.addHero(legend.legendId, 'h1');
            expect(received.heroCount).toBe(1);
        });
    });

    describe('deepenNarrative', () => {
        it('should deepen with default amount', () => {
            const { legend } = system.tellLegend({});
            system.deepenNarrative(legend.legendId);
            expect(legend.narrative).toBe(25);
        });

        it('should deepen with custom amount', () => {
            const { legend } = system.tellLegend({});
            system.deepenNarrative(legend.legendId, 10);
            expect(legend.narrative).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.deepenNarrative('ghost', 5);
            expect(result.error).toBe('LEGEND_NOT_FOUND');
        });

        it('should trigger narrativeDeepened hook', () => {
            const { legend } = system.tellLegend({});
            let received = null;
            system.registerHook('narrativeDeepened', (d) => { received = d; });
            system.deepenNarrative(legend.legendId, 7);
            expect(received.newNarrative).toBe(27);
        });
    });

    describe('levelUpLegend', () => {
        it('should level up', () => {
            const { legend } = system.tellLegend({});
            system.levelUpLegend(legend.legendId);
            expect(legend.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpLegend('ghost');
            expect(result.error).toBe('LEGEND_NOT_FOUND');
        });

        it('should trigger legendLeveledUp hook', () => {
            const { legend } = system.tellLegend({});
            let received = null;
            system.registerHook('legendLeveledUp', (d) => { received = d; });
            system.levelUpLegend(legend.legendId);
            expect(received.newLevel).toBe(2);
        });
    });

    describe('immortalizeLegend', () => {
        it('should mark immortal', () => {
            const { legend } = system.tellLegend({});
            system.immortalizeLegend(legend.legendId);
            expect(legend.status).toBe('immortal');
        });

        it('should reject missing', () => {
            const result = system.immortalizeLegend('ghost');
            expect(result.error).toBe('LEGEND_NOT_FOUND');
        });

        it('should trigger legendImmortalized hook', () => {
            const { legend } = system.tellLegend({});
            let called = false;
            system.registerHook('legendImmortalized', () => { called = true; });
            system.immortalizeLegend(legend.legendId);
            expect(called).toBe(true);
        });
    });

    describe('calculateLegendValue', () => {
        it('should calculate base value', () => {
            const { legend } = system.tellLegend({});
            // level 1 * 100 + narrative 20 * 2 + 0 heroes * 30 = 140
            expect(system.calculateLegendValue(legend.legendId)).toBe(140);
        });

        it('should include heroes', () => {
            const { legend } = system.tellLegend({ heroes: ['a', 'b'] });
            // 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateLegendValue(legend.legendId)).toBe(200);
        });

        it('should reflect level and narrative', () => {
            const { legend } = system.tellLegend({});
            system.levelUpLegend(legend.legendId);
            system.deepenNarrative(legend.legendId, 10);
            // 2*100 + 30*2 + 0 = 260
            expect(system.calculateLegendValue(legend.legendId)).toBe(260);
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
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('legendTold', () => count++);
            unregister();
            system.tellLegend({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('legendTold', () => { throw new Error('x'); });
            expect(() => system.tellLegend({})).not.toThrow();
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
            system.tellLegend({});
            const json = system.toJSON();
            expect(json.legends.length).toBe(1);
        });
        it('should deserialize', () => {
            system.tellLegend({});
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
