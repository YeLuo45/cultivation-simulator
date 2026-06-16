/**
 * CultivationDwarf.test.js - 修真矮人系统测试
 * V675 Iteration 28/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDwarf } from '../../../systems/ai/CultivationDwarf.js';

describe('CultivationDwarf', () => {
    let system;
    beforeEach(() => { system = new CultivationDwarf(); });

    describe('recruitDwarf', () => {
        it('should recruit dwarf', () => {
            const { dwarf } = system.recruitDwarf({ masterId: 'm1', name: 'Thorin' });
            expect(dwarf.masterId).toBe('m1');
            expect(dwarf.name).toBe('Thorin');
        });

        it('should default to novice status', () => {
            const { dwarf } = system.recruitDwarf({});
            expect(dwarf.status).toBe('novice');
        });

        it('should default type to mountain', () => {
            const { dwarf } = system.recruitDwarf({});
            expect(dwarf.type).toBe('mountain');
        });

        it('should default stamina to baseStamina', () => {
            const { dwarf } = system.recruitDwarf({});
            expect(dwarf.stamina).toBe(20);
        });

        it('should start at level 1', () => {
            const { dwarf } = system.recruitDwarf({});
            expect(dwarf.level).toBe(1);
        });

        it('should start with empty crafts', () => {
            const { dwarf } = system.recruitDwarf({});
            expect(dwarf.crafts).toEqual([]);
        });

        it('should generate dwarfId', () => {
            const { dwarf } = system.recruitDwarf({});
            expect(dwarf.dwarfId).toBeDefined();
            expect(typeof dwarf.dwarfId).toBe('string');
        });

        it('should accept custom dwarfId', () => {
            const { dwarf } = system.recruitDwarf({ dwarfId: 'my-dwarf' });
            expect(dwarf.dwarfId).toBe('my-dwarf');
        });

        it('should trigger dwarfRecruited hook', () => {
            let called = false;
            system.registerHook('dwarfRecruited', () => { called = true; });
            system.recruitDwarf({});
            expect(called).toBe(true);
        });

        it('should support all types', () => {
            const { dwarf: d1 } = system.recruitDwarf({ type: 'mountain' });
            const { dwarf: d2 } = system.recruitDwarf({ type: 'forge' });
            const { dwarf: d3 } = system.recruitDwarf({ type: 'miner' });
            expect(d1.type).toBe('mountain');
            expect(d2.type).toBe('forge');
            expect(d3.type).toBe('miner');
        });

        it('should accept custom crafts', () => {
            const { dwarf } = system.recruitDwarf({ crafts: ['weaving', 'smithing'] });
            expect(dwarf.crafts).toEqual(['weaving', 'smithing']);
        });
    });

    describe('getDwarf', () => {
        it('should return dwarf', () => {
            const { dwarf } = system.recruitDwarf({});
            expect(system.getDwarf(dwarf.dwarfId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDwarf('ghost')).toBeNull(); });
    });

    describe('listDwarves', () => {
        it('should list all', () => {
            system.recruitDwarf({});
            system.recruitDwarf({});
            expect(system.listDwarves().length).toBe(2);
        });

        it('should return empty when no dwarves', () => {
            expect(system.listDwarves().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitDwarf({ masterId: 'm1' });
            system.recruitDwarf({ masterId: 'm2' });
            system.recruitDwarf({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitDwarf({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { dwarf: d1 } = system.recruitDwarf({});
            const { dwarf: d2 } = system.recruitDwarf({});
            system.legendDwarf(d1.dwarfId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].dwarfId).toBe(d1.dwarfId);
            expect(d2.status).toBe('novice');
        });

        it('should return empty when none legendary', () => {
            system.recruitDwarf({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addCraft', () => {
        it('should add craft', () => {
            const { dwarf } = system.recruitDwarf({});
            system.addCraft(dwarf.dwarfId, 'weapon-forging');
            expect(dwarf.crafts).toContain('weapon-forging');
        });

        it('should accumulate crafts', () => {
            const { dwarf } = system.recruitDwarf({});
            system.addCraft(dwarf.dwarfId, 'c1');
            system.addCraft(dwarf.dwarfId, 'c2');
            system.addCraft(dwarf.dwarfId, 'c3');
            expect(dwarf.crafts.length).toBe(3);
        });

        it('should reject missing dwarf', () => {
            const result = system.addCraft('ghost', 'craft');
            expect(result.error).toBe('DWARF_NOT_FOUND');
        });

        it('should trigger craftAdded hook', () => {
            const { dwarf } = system.recruitDwarf({});
            let called = false;
            system.registerHook('craftAdded', () => { called = true; });
            system.addCraft(dwarf.dwarfId, 'craft');
            expect(called).toBe(true);
        });
    });

    describe('raiseStamina', () => {
        it('should raise stamina by default', () => {
            const { dwarf } = system.recruitDwarf({});
            system.raiseStamina(dwarf.dwarfId);
            expect(dwarf.stamina).toBe(25);
        });

        it('should raise stamina by custom amount', () => {
            const { dwarf } = system.recruitDwarf({});
            system.raiseStamina(dwarf.dwarfId, 50);
            expect(dwarf.stamina).toBe(70);
        });

        it('should reject missing dwarf', () => {
            const result = system.raiseStamina('ghost');
            expect(result.error).toBe('DWARF_NOT_FOUND');
        });

        it('should trigger staminaRaised hook', () => {
            const { dwarf } = system.recruitDwarf({});
            let called = false;
            system.registerHook('staminaRaised', () => { called = true; });
            system.raiseStamina(dwarf.dwarfId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDwarf', () => {
        it('should level up', () => {
            const { dwarf } = system.recruitDwarf({});
            system.levelUpDwarf(dwarf.dwarfId);
            expect(dwarf.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { dwarf } = system.recruitDwarf({});
            system.levelUpDwarf(dwarf.dwarfId);
            system.levelUpDwarf(dwarf.dwarfId);
            system.levelUpDwarf(dwarf.dwarfId);
            expect(dwarf.level).toBe(4);
        });

        it('should reject missing dwarf', () => {
            const result = system.levelUpDwarf('ghost');
            expect(result.error).toBe('DWARF_NOT_FOUND');
        });

        it('should trigger dwarfLeveledUp hook', () => {
            const { dwarf } = system.recruitDwarf({});
            let called = false;
            system.registerHook('dwarfLeveledUp', () => { called = true; });
            system.levelUpDwarf(dwarf.dwarfId);
            expect(called).toBe(true);
        });
    });

    describe('legendDwarf', () => {
        it('should legendize dwarf', () => {
            const { dwarf } = system.recruitDwarf({});
            system.legendDwarf(dwarf.dwarfId);
            expect(dwarf.status).toBe('legendary');
        });

        it('should reject missing dwarf', () => {
            const result = system.legendDwarf('ghost');
            expect(result.error).toBe('DWARF_NOT_FOUND');
        });

        it('should trigger dwarfLegendized hook', () => {
            const { dwarf } = system.recruitDwarf({});
            let called = false;
            system.registerHook('dwarfLegendized', () => { called = true; });
            system.legendDwarf(dwarf.dwarfId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDwarfValue', () => {
        it('should calculate base value', () => {
            const { dwarf } = system.recruitDwarf({});
            // level=1, stamina=20, crafts=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculateDwarfValue(dwarf.dwarfId)).toBe(140);
        });

        it('should include crafts in value', () => {
            const { dwarf } = system.recruitDwarf({});
            system.addCraft(dwarf.dwarfId, 'c1');
            system.addCraft(dwarf.dwarfId, 'c2');
            // level=1, stamina=20, crafts=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateDwarfValue(dwarf.dwarfId)).toBe(200);
        });

        it('should scale with level', () => {
            const { dwarf } = system.recruitDwarf({});
            system.levelUpDwarf(dwarf.dwarfId);
            system.levelUpDwarf(dwarf.dwarfId);
            // level=3, stamina=20, crafts=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculateDwarfValue(dwarf.dwarfId)).toBe(340);
        });

        it('should scale with stamina', () => {
            const { dwarf } = system.recruitDwarf({});
            system.raiseStamina(dwarf.dwarfId, 100);
            // level=1, stamina=120, crafts=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculateDwarfValue(dwarf.dwarfId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDwarfValue('ghost')).toBe(0);
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

        it('should execute default getDwarf', () => {
            const result = system.executeTool('getDwarf', { dwarfId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitDwarf', () => {
            const result = system.executeTool('recruitDwarf', { masterId: 'm1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('dwarfRecruited', () => count++);
            unregister();
            system.recruitDwarf({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('dwarfRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDwarf({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDwarves = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDwarves = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDwarf({});
            const json = system.toJSON();
            expect(json.dwarves.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitDwarf({});
            const json = system.toJSON();
            const newSys = new CultivationDwarf();
            newSys.fromJSON(json);
            expect(newSys.dwarves.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.dwarfCount).toBe(0);
        });
    });
});
