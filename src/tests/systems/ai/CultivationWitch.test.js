/**
 * CultivationWitch.test.js - 修真女巫系统测试
 * V627 Iteration 10/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationWitch } from '../../../systems/ai/CultivationWitch.js';

describe('CultivationWitch', () => {
    let system;
    beforeEach(() => { system = new CultivationWitch(); });

    describe('recruitWitch', () => {
        it('should recruit with given fields', () => {
            const { witch } = system.recruitWitch({ covenId: 'c1', name: 'Hedge Witch', type: 'hex' });
            expect(witch.covenId).toBe('c1');
            expect(witch.name).toBe('Hedge Witch');
            expect(witch.type).toBe('hex');
        });

        it('should default type to familiar and magic to 20', () => {
            const { witch } = system.recruitWitch({ covenId: 'c1' });
            expect(witch.type).toBe('familiar');
            expect(witch.magic).toBe(20);
            expect(witch.level).toBe(1);
            expect(witch.status).toBe('novice');
            expect(witch.familiars).toEqual([]);
        });

        it('should generate a witchId when not provided', () => {
            const { witch } = system.recruitWitch({});
            expect(witch.witchId).toBeTruthy();
            expect(typeof witch.witchId).toBe('string');
        });

        it('should trigger witchRecruited hook', () => {
            let called = false;
            system.registerHook('witchRecruited', () => { called = true; });
            system.recruitWitch({});
            expect(called).toBe(true);
        });
    });

    describe('getWitch', () => {
        it('should return witch copy', () => {
            const { witch } = system.recruitWitch({});
            const found = system.getWitch(witch.witchId);
            expect(found).not.toBeNull();
            expect(found.witchId).toBe(witch.witchId);
        });
        it('should return null for missing', () => { expect(system.getWitch('ghost')).toBeNull(); });
    });

    describe('listWitches', () => {
        it('should list all witches', () => {
            system.recruitWitch({});
            system.recruitWitch({});
            system.recruitWitch({});
            expect(system.listWitches().length).toBe(3);
        });
    });

    describe('listByCoven', () => {
        it('should filter by coven', () => {
            system.recruitWitch({ covenId: 'c1' });
            system.recruitWitch({ covenId: 'c2' });
            system.recruitWitch({ covenId: 'c1' });
            expect(system.listByCoven('c1').length).toBe(2);
            expect(system.listByCoven('c2').length).toBe(1);
            expect(system.listByCoven('c3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary witches', () => {
            const { witch: a } = system.recruitWitch({});
            const { witch: b } = system.recruitWitch({});
            system.legendWitch(a.witchId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].witchId).toBe(a.witchId);
            expect(b.status).toBe('novice');
        });
    });

    describe('addFamiliar', () => {
        it('should add a familiar to witch', () => {
            const { witch } = system.recruitWitch({});
            const result = system.addFamiliar(witch.witchId, 'black_cat');
            expect(result.success).toBe(true);
            expect(witch.familiars).toContain('black_cat');
        });

        it('should reject missing witch', () => {
            const result = system.addFamiliar('ghost', 'raven');
            expect(result.error).toBe('WITCH_NOT_FOUND');
        });

        it('should trigger familiarAdded hook', () => {
            const { witch } = system.recruitWitch({});
            let called = false;
            system.registerHook('familiarAdded', () => { called = true; });
            system.addFamiliar(witch.witchId, 'raven');
            expect(called).toBe(true);
        });
    });

    describe('buildMagic', () => {
        it('should build magic by default 5', () => {
            const { witch } = system.recruitWitch({});
            system.buildMagic(witch.witchId);
            expect(witch.magic).toBe(25);
        });

        it('should build magic by custom amount', () => {
            const { witch } = system.recruitWitch({});
            system.buildMagic(witch.witchId, 30);
            expect(witch.magic).toBe(50);
        });

        it('should reject missing witch', () => {
            const result = system.buildMagic('ghost', 10);
            expect(result.error).toBe('WITCH_NOT_FOUND');
        });

        it('should trigger magicBuilt hook', () => {
            const { witch } = system.recruitWitch({});
            let called = false;
            system.registerHook('magicBuilt', () => { called = true; });
            system.buildMagic(witch.witchId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpWitch', () => {
        it('should increase level by 1', () => {
            const { witch } = system.recruitWitch({});
            system.levelUpWitch(witch.witchId);
            expect(witch.level).toBe(2);
        });

        it('should increase level multiple times', () => {
            const { witch } = system.recruitWitch({});
            system.levelUpWitch(witch.witchId);
            system.levelUpWitch(witch.witchId);
            system.levelUpWitch(witch.witchId);
            expect(witch.level).toBe(4);
        });

        it('should reject missing witch', () => {
            const result = system.levelUpWitch('ghost');
            expect(result.error).toBe('WITCH_NOT_FOUND');
        });

        it('should trigger witchLeveledUp hook', () => {
            const { witch } = system.recruitWitch({});
            let called = false;
            system.registerHook('witchLeveledUp', () => { called = true; });
            system.levelUpWitch(witch.witchId);
            expect(called).toBe(true);
        });
    });

    describe('legendWitch', () => {
        it('should set status to legendary', () => {
            const { witch } = system.recruitWitch({});
            system.legendWitch(witch.witchId);
            expect(witch.status).toBe('legendary');
        });

        it('should reject missing witch', () => {
            const result = system.legendWitch('ghost');
            expect(result.error).toBe('WITCH_NOT_FOUND');
        });

        it('should trigger witchLegendized hook', () => {
            const { witch } = system.recruitWitch({});
            let called = false;
            system.registerHook('witchLegendized', () => { called = true; });
            system.legendWitch(witch.witchId);
            expect(called).toBe(true);
        });
    });

    describe('calculateWitchValue', () => {
        it('should calculate value with default stats', () => {
            const { witch } = system.recruitWitch({});
            // level=1 * 100 + magic=20 * 2 + familiars=0 * 30 = 140
            expect(system.calculateWitchValue(witch.witchId)).toBe(140);
        });

        it('should calculate value with familiars and leveled up', () => {
            const { witch } = system.recruitWitch({});
            system.levelUpWitch(witch.witchId);
            system.levelUpWitch(witch.witchId);
            system.addFamiliar(witch.witchId, 'cat');
            system.addFamiliar(witch.witchId, 'raven');
            // level=3 * 100 + magic=20 * 2 + familiars=2 * 30 = 300 + 40 + 60 = 400
            expect(system.calculateWitchValue(witch.witchId)).toBe(400);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateWitchValue('ghost')).toBe(0);
        });
    });

    describe('Tool System', () => {
        it('should register and list tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute custom tool', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const result = system.executeTool('test', { value: 42 });
            expect(result.success).toBe(true);
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle tool execution errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.success).toBe(false);
            expect(result.error).toBe('boom');
        });

        it('should execute default getWitch tool', () => {
            const { witch } = system.recruitWitch({});
            const result = system.executeTool('getWitch', { witchId: witch.witchId });
            expect(result.success).toBe(true);
            expect(result.result.witchId).toBe(witch.witchId);
        });

        it('should execute default recruitWitch tool', () => {
            const result = system.executeTool('recruitWitch', { covenId: 'c1', name: 'X', type: 'brew' });
            expect(result.success).toBe(true);
            expect(result.result.witch.covenId).toBe('c1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('witchRecruited', () => count++);
            unregister();
            system.recruitWitch({});
            expect(count).toBe(0);
        });

        it('should handle errors silently in hooks', () => {
            system.registerHook('witchRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitWitch({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient witches', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when threshold met', () => {
            system.stats.totalWitches = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxWitches).toBe(70);
        });
        it('should not double evolve', () => {
            system.stats.totalWitches = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitWitch({});
            system.recruitWitch({});
            const json = system.toJSON();
            expect(json.witches.length).toBe(2);
            expect(json.stats.totalWitches).toBe(2);
        });

        it('should deserialize from JSON', () => {
            system.recruitWitch({ name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationWitch();
            newSys.fromJSON(json);
            expect(newSys.witches.size).toBe(1);
            expect(newSys.stats.totalWitches).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with count', () => {
            system.recruitWitch({});
            const stats = system.getStats();
            expect(stats.witchCount).toBe(1);
            expect(stats.totalWitches).toBe(1);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
