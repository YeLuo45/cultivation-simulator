/**
 * CultivationCopper.test.js - 修真铜系统测试
 * V855 Iteration 28/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCopper } from '../../../systems/ai/CultivationCopper.js';

describe('CultivationCopper', () => {
    let system;
    beforeEach(() => { system = new CultivationCopper(); });

    describe('recruitCopper', () => {
        it('should create', () => {
            const { copper } = system.recruitCopper({ masterId: 'm1', name: 'PureVein', type: 'divine' });
            expect(copper.masterId).toBe('m1');
            expect(copper.name).toBe('PureVein');
            expect(copper.type).toBe('divine');
        });

        it('should default type to pure and use baseConductivity', () => {
            const { copper } = system.recruitCopper({});
            expect(copper.type).toBe('pure');
            expect(copper.conductivity).toBe(20);
            expect(copper.status).toBe('novice');
            expect(copper.level).toBe(1);
            expect(copper.ores).toEqual([]);
        });

        it('should accept custom conductivity and ores', () => {
            const { copper } = system.recruitCopper({ conductivity: 50, ores: ['malachite', 'azurite'] });
            expect(copper.conductivity).toBe(50);
            expect(copper.ores.length).toBe(2);
        });

        it('should trigger copperRecruited hook', () => {
            let called = false;
            system.registerHook('copperRecruited', () => { called = true; });
            system.recruitCopper({});
            expect(called).toBe(true);
        });

        it('should reject when at maxCoppers', () => {
            const small = new CultivationCopper({ maxCoppers: 1 });
            small.recruitCopper({});
            const result = small.recruitCopper({});
            expect(result.error).toBe('MAX_COPPERS_REACHED');
        });
    });

    describe('getCopper', () => {
        it('should return', () => {
            const { copper } = system.recruitCopper({});
            expect(system.getCopper(copper.copperId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCopper('ghost')).toBeNull(); });
    });

    describe('listCoppers', () => {
        it('should list all', () => {
            system.recruitCopper({});
            system.recruitCopper({});
            expect(system.listCoppers().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitCopper({ masterId: 'm1' });
            system.recruitCopper({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { copper: a } = system.recruitCopper({});
            const { copper: b } = system.recruitCopper({});
            system.legendCopper(a.copperId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addOre', () => {
        it('should add', () => {
            const { copper } = system.recruitCopper({});
            system.addOre(copper.copperId, 'malachite');
            expect(copper.ores.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addOre('ghost', 'x');
            expect(result.error).toBe('COPPER_NOT_FOUND');
        });

        it('should trigger oreAdded hook', () => {
            const { copper } = system.recruitCopper({});
            let called = false;
            system.registerHook('oreAdded', () => { called = true; });
            system.addOre(copper.copperId, 'azurite');
            expect(called).toBe(true);
        });
    });

    describe('raiseConductivity', () => {
        it('should raise with custom amount', () => {
            const { copper } = system.recruitCopper({});
            system.raiseConductivity(copper.copperId, 10);
            expect(copper.conductivity).toBe(30);
        });

        it('should default amount to 5', () => {
            const { copper } = system.recruitCopper({});
            system.raiseConductivity(copper.copperId);
            expect(copper.conductivity).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseConductivity('ghost', 5);
            expect(result.error).toBe('COPPER_NOT_FOUND');
        });

        it('should trigger conductivityRaised hook', () => {
            const { copper } = system.recruitCopper({});
            let called = false;
            system.registerHook('conductivityRaised', () => { called = true; });
            system.raiseConductivity(copper.copperId, 3);
            expect(called).toBe(true);
        });
    });

    describe('levelUpCopper', () => {
        it('should level up', () => {
            const { copper } = system.recruitCopper({});
            system.levelUpCopper(copper.copperId);
            expect(copper.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpCopper('ghost');
            expect(result.error).toBe('COPPER_NOT_FOUND');
        });

        it('should trigger copperLeveledUp hook', () => {
            const { copper } = system.recruitCopper({});
            let called = false;
            system.registerHook('copperLeveledUp', () => { called = true; });
            system.levelUpCopper(copper.copperId);
            expect(called).toBe(true);
        });
    });

    describe('legendCopper', () => {
        it('should legendize', () => {
            const { copper } = system.recruitCopper({});
            system.legendCopper(copper.copperId);
            expect(copper.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendCopper('ghost');
            expect(result.error).toBe('COPPER_NOT_FOUND');
        });

        it('should trigger copperLegendized hook', () => {
            const { copper } = system.recruitCopper({});
            let called = false;
            system.registerHook('copperLegendized', () => { called = true; });
            system.legendCopper(copper.copperId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCopperValue', () => {
        it('should calculate', () => {
            const { copper } = system.recruitCopper({ level: 2, conductivity: 30 });
            system.addOre(copper.copperId, 'a');
            system.addOre(copper.copperId, 'b');
            // level*100 + conductivity*2 + ores*30 = 200 + 60 + 60 = 320
            expect(system.calculateCopperValue(copper.copperId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCopperValue('ghost')).toBe(0);
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

        it('should execute default getCopper', () => {
            const result = system.executeTool('getCopper', { copperId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('copperRecruited', () => count++);
            unregister();
            system.recruitCopper({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('copperRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitCopper({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCoppers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCoppers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitCopper({});
            const json = system.toJSON();
            expect(json.coppers.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitCopper({});
            const json = system.toJSON();
            const newSys = new CultivationCopper();
            newSys.fromJSON(json);
            expect(newSys.coppers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.copperCount).toBe(0);
        });
    });
});
