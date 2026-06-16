/**
 * CultivationRunesmith.test.js - 修真符文师测试
 * V767 Iteration 30/30 FINAL Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationRunesmith } from '../../../systems/ai/CultivationRunesmith.js';

describe('CultivationRunesmith', () => {
    let system;
    beforeEach(() => { system = new CultivationRunesmith(); });

    describe('forgeRunesmith', () => {
        it('should forge', () => {
            const { smith } = system.forgeRunesmith({ name: 'Forger' });
            expect(smith.name).toBe('Forger');
        });
        it('should initialize empty runes', () => {
            const { smith } = system.forgeRunesmith({});
            expect(smith.runes).toEqual([]);
        });
        it('should trigger runesmithForged hook', () => {
            let called = false;
            system.registerHook('runesmithForged', () => { called = true; });
            system.forgeRunesmith({});
            expect(called).toBe(true);
        });
    });

    describe('getRunesmith', () => {
        it('should return', () => {
            const { smith } = system.forgeRunesmith({});
            expect(system.getRunesmith(smith.runesmithId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRunesmith('ghost')).toBeNull(); });
    });

    describe('listRunesmiths', () => {
        it('should list all', () => {
            system.forgeRunesmith({});
            expect(system.listRunesmiths().length).toBe(1);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.forgeRunesmith({ masterId: 'm1' });
            system.forgeRunesmith({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listByDiscipline', () => {
        it('should filter', () => {
            system.forgeRunesmith({ discipline: 'engraving' });
            system.forgeRunesmith({ discipline: 'carving' });
            expect(system.listByDiscipline('engraving').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.forgeRunesmith({ type: 'rune' });
            system.forgeRunesmith({ type: 'glyph' });
            expect(system.listByType('rune').length).toBe(1);
        });
    });

    describe('listVeteran', () => {
        it('should list veteran+', () => {
            system.forgeRunesmith({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            system.forgeRunesmith({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('listTop', () => {
        it('should return top', () => {
            system.forgeRunesmith({});
            expect(system.listTop(2).length).toBe(1);
        });
    });

    describe('engraveRune', () => {
        it('should engrave', () => {
            const { smith } = system.forgeRunesmith({});
            system.engraveRune(smith.runesmithId, 'flame-rune');
            expect(smith.runes.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.engraveRune('ghost', 'rune');
            expect(result.error).toBe('RUNESMITH_NOT_FOUND');
        });

        it('should trigger runeEngraved hook', () => {
            const { smith } = system.forgeRunesmith({});
            let called = false;
            system.registerHook('runeEngraved', () => { called = true; });
            system.engraveRune(smith.runesmithId, 'rune');
            expect(called).toBe(true);
        });
    });

    describe('raiseSkill', () => {
        it('should raise', () => {
            const { smith } = system.forgeRunesmith({});
            system.raiseSkill(smith.runesmithId, 5);
            expect(smith.skill).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseSkill('ghost', 5);
            expect(result.error).toBe('RUNESMITH_NOT_FOUND');
        });

        it('should trigger skillRaised hook', () => {
            const { smith } = system.forgeRunesmith({});
            let called = false;
            system.registerHook('skillRaised', () => { called = true; });
            system.raiseSkill(smith.runesmithId, 5);
            expect(called).toBe(true);
        });
    });

    describe('promoteRunesmith', () => {
        it('should promote', () => {
            const { smith } = system.forgeRunesmith({});
            system.promoteRunesmith(smith.runesmithId);
            expect(smith.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.promoteRunesmith('ghost');
            expect(result.error).toBe('RUNESMITH_NOT_FOUND');
        });

        it('should trigger runesmithPromoted hook', () => {
            const { smith } = system.forgeRunesmith({});
            let called = false;
            system.registerHook('runesmithPromoted', () => { called = true; });
            system.promoteRunesmith(smith.runesmithId);
            expect(called).toBe(true);
        });
    });

    describe('veteranizeRunesmith', () => {
        it('should veteranize', () => {
            const { smith } = system.forgeRunesmith({});
            system.veteranizeRunesmith(smith.runesmithId);
            expect(smith.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.veteranizeRunesmith('ghost');
            expect(result.error).toBe('RUNESMITH_NOT_FOUND');
        });

        it('should trigger runesmithVeteranized hook', () => {
            const { smith } = system.forgeRunesmith({});
            let called = false;
            system.registerHook('runesmithVeteranized', () => { called = true; });
            system.veteranizeRunesmith(smith.runesmithId);
            expect(called).toBe(true);
        });
    });

    describe('legendizeRunesmith', () => {
        it('should legendize', () => {
            const { smith } = system.forgeRunesmith({});
            system.legendizeRunesmith(smith.runesmithId);
            expect(smith.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendizeRunesmith('ghost');
            expect(result.error).toBe('RUNESMITH_NOT_FOUND');
        });

        it('should trigger runesmithLegendized hook', () => {
            const { smith } = system.forgeRunesmith({});
            let called = false;
            system.registerHook('runesmithLegendized', () => { called = true; });
            system.legendizeRunesmith(smith.runesmithId);
            expect(called).toBe(true);
        });
    });

    describe('changeType', () => {
        it('should change', () => {
            const { smith } = system.forgeRunesmith({});
            system.changeType(smith.runesmithId, 'glyph');
            expect(smith.type).toBe('glyph');
        });

        it('should reject missing', () => {
            const result = system.changeType('ghost', 'glyph');
            expect(result.error).toBe('RUNESMITH_NOT_FOUND');
        });

        it('should trigger typeChanged hook', () => {
            const { smith } = system.forgeRunesmith({});
            let called = false;
            system.registerHook('typeChanged', () => { called = true; });
            system.changeType(smith.runesmithId, 'glyph');
            expect(called).toBe(true);
        });
    });

    describe('changeDiscipline', () => {
        it('should change', () => {
            const { smith } = system.forgeRunesmith({});
            system.changeDiscipline(smith.runesmithId, 'carving');
            expect(smith.discipline).toBe('carving');
        });

        it('should reject missing', () => {
            const result = system.changeDiscipline('ghost', 'carving');
            expect(result.error).toBe('RUNESMITH_NOT_FOUND');
        });

        it('should trigger disciplineChanged hook', () => {
            const { smith } = system.forgeRunesmith({});
            let called = false;
            system.registerHook('disciplineChanged', () => { called = true; });
            system.changeDiscipline(smith.runesmithId, 'carving');
            expect(called).toBe(true);
        });
    });

    describe('restRunesmith', () => {
        it('should rest', () => {
            const { smith } = system.forgeRunesmith({});
            system.restRunesmith(smith.runesmithId);
            expect(smith.lastForge).toBeGreaterThan(0);
        });

        it('should reject missing', () => {
            const result = system.restRunesmith('ghost');
            expect(result.error).toBe('RUNESMITH_NOT_FOUND');
        });

        it('should trigger runesmithRested hook', () => {
            const { smith } = system.forgeRunesmith({});
            let called = false;
            system.registerHook('runesmithRested', () => { called = true; });
            system.restRunesmith(smith.runesmithId);
            expect(called).toBe(true);
        });
    });

    describe('calculateRunesmithValue', () => {
        it('should calculate', () => {
            const { smith } = system.forgeRunesmith({});
            expect(system.calculateRunesmithValue(smith.runesmithId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateRunesmithValue('ghost')).toBe(0);
        });
    });

    describe('mergeRunesmiths', () => {
        it('should merge', () => {
            const a = system.forgeRunesmith({}).smith;
            const b = system.forgeRunesmith({}).smith;
            const result = system.mergeRunesmiths(a.runesmithId, b.runesmithId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.mergeRunesmiths('ghost', 'ghost2');
            expect(result.error).toBe('RUNESMITH_NOT_FOUND');
        });

        it('should trigger runesmithsMerged hook', () => {
            const a = system.forgeRunesmith({}).smith;
            const b = system.forgeRunesmith({}).smith;
            let called = false;
            system.registerHook('runesmithsMerged', () => { called = true; });
            system.mergeRunesmiths(a.runesmithId, b.runesmithId);
            expect(called).toBe(true);
        });
    });

    describe('deleteRunesmith', () => {
        it('should delete', () => {
            const { smith } = system.forgeRunesmith({});
            const result = system.deleteRunesmith(smith.runesmithId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteRunesmith('ghost');
            expect(result.error).toBe('RUNESMITH_NOT_FOUND');
        });

        it('should trigger runesmithDeleted hook', () => {
            const { smith } = system.forgeRunesmith({});
            let called = false;
            system.registerHook('runesmithDeleted', () => { called = true; });
            system.deleteRunesmith(smith.runesmithId);
            expect(called).toBe(true);
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

        it('should execute default listByDiscipline', () => {
            system.forgeRunesmith({ discipline: 'engraving' });
            const result = system.executeTool('listByDiscipline', { discipline: 'engraving' });
            expect(result.result.length).toBe(1);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('runesmithForged', () => count++);
            unregister();
            system.forgeRunesmith({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('runesmithForged', () => { throw new Error('x'); });
            expect(() => system.forgeRunesmith({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalForged = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalForged = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.forgeRunesmith({});
            const json = system.toJSON();
            expect(json.smiths.length).toBe(1);
        });
        it('should deserialize', () => {
            system.forgeRunesmith({});
            const json = system.toJSON();
            const newSys = new CultivationRunesmith();
            newSys.fromJSON(json);
            expect(newSys.smiths.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.smithCount).toBe(0);
        });
    });
});