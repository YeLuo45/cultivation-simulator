/**
 * CultivationIron.test.js - 修真铁系统测试
 * V853 Iteration 26/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationIron } from '../../../systems/ai/CultivationIron.js';

describe('CultivationIron', () => {
    let system;
    beforeEach(() => { system = new CultivationIron(); });

    describe('recruitIron', () => {
        it('should create', () => {
            const { iron } = system.recruitIron({ masterId: 'm1', name: 'Meteoric', type: 'divine' });
            expect(iron.masterId).toBe('m1');
            expect(iron.name).toBe('Meteoric');
            expect(iron.type).toBe('divine');
        });

        it('should default type to wrought and use baseHardness', () => {
            const { iron } = system.recruitIron({});
            expect(iron.type).toBe('wrought');
            expect(iron.hardness).toBe(20);
            expect(iron.status).toBe('novice');
            expect(iron.level).toBe(1);
            expect(iron.ores).toEqual([]);
        });

        it('should accept custom hardness and ores', () => {
            const { iron } = system.recruitIron({ hardness: 50, ores: ['hematite', 'magnetite'] });
            expect(iron.hardness).toBe(50);
            expect(iron.ores.length).toBe(2);
        });

        it('should trigger ironRecruited hook', () => {
            let called = false;
            system.registerHook('ironRecruited', () => { called = true; });
            system.recruitIron({});
            expect(called).toBe(true);
        });

        it('should reject when at maxIrons', () => {
            const small = new CultivationIron({ maxIrons: 1 });
            small.recruitIron({});
            const result = small.recruitIron({});
            expect(result.error).toBe('MAX_IRONS_REACHED');
        });
    });

    describe('getIron', () => {
        it('should return', () => {
            const { iron } = system.recruitIron({});
            expect(system.getIron(iron.ironId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getIron('ghost')).toBeNull(); });
    });

    describe('listIrons', () => {
        it('should list all', () => {
            system.recruitIron({});
            system.recruitIron({});
            expect(system.listIrons().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitIron({ masterId: 'm1' });
            system.recruitIron({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { iron: a } = system.recruitIron({});
            const { iron: b } = system.recruitIron({});
            system.legendIron(a.ironId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addOre', () => {
        it('should add', () => {
            const { iron } = system.recruitIron({});
            system.addOre(iron.ironId, 'hematite');
            expect(iron.ores.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addOre('ghost', 'x');
            expect(result.error).toBe('IRON_NOT_FOUND');
        });

        it('should trigger oreAdded hook', () => {
            const { iron } = system.recruitIron({});
            let called = false;
            system.registerHook('oreAdded', () => { called = true; });
            system.addOre(iron.ironId, 'magnetite');
            expect(called).toBe(true);
        });
    });

    describe('raiseHardness', () => {
        it('should raise with custom amount', () => {
            const { iron } = system.recruitIron({});
            system.raiseHardness(iron.ironId, 10);
            expect(iron.hardness).toBe(30);
        });

        it('should default amount to 5', () => {
            const { iron } = system.recruitIron({});
            system.raiseHardness(iron.ironId);
            expect(iron.hardness).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseHardness('ghost', 5);
            expect(result.error).toBe('IRON_NOT_FOUND');
        });

        it('should trigger hardnessRaised hook', () => {
            const { iron } = system.recruitIron({});
            let called = false;
            system.registerHook('hardnessRaised', () => { called = true; });
            system.raiseHardness(iron.ironId, 3);
            expect(called).toBe(true);
        });
    });

    describe('levelUpIron', () => {
        it('should level up', () => {
            const { iron } = system.recruitIron({});
            system.levelUpIron(iron.ironId);
            expect(iron.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpIron('ghost');
            expect(result.error).toBe('IRON_NOT_FOUND');
        });

        it('should trigger ironLeveledUp hook', () => {
            const { iron } = system.recruitIron({});
            let called = false;
            system.registerHook('ironLeveledUp', () => { called = true; });
            system.levelUpIron(iron.ironId);
            expect(called).toBe(true);
        });
    });

    describe('legendIron', () => {
        it('should legendize', () => {
            const { iron } = system.recruitIron({});
            system.legendIron(iron.ironId);
            expect(iron.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendIron('ghost');
            expect(result.error).toBe('IRON_NOT_FOUND');
        });

        it('should trigger ironLegendized hook', () => {
            const { iron } = system.recruitIron({});
            let called = false;
            system.registerHook('ironLegendized', () => { called = true; });
            system.legendIron(iron.ironId);
            expect(called).toBe(true);
        });
    });

    describe('calculateIronValue', () => {
        it('should calculate', () => {
            const { iron } = system.recruitIron({ level: 2, hardness: 30 });
            system.addOre(iron.ironId, 'a');
            system.addOre(iron.ironId, 'b');
            // level*100 + hardness*2 + ores*30 = 200 + 60 + 60 = 320
            expect(system.calculateIronValue(iron.ironId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateIronValue('ghost')).toBe(0);
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

        it('should execute default getIron', () => {
            const result = system.executeTool('getIron', { ironId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('ironRecruited', () => count++);
            unregister();
            system.recruitIron({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('ironRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitIron({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalIrons = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalIrons = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitIron({});
            const json = system.toJSON();
            expect(json.irons.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitIron({});
            const json = system.toJSON();
            const newSys = new CultivationIron();
            newSys.fromJSON(json);
            expect(newSys.irons.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.ironCount).toBe(0);
        });
    });
});
