/**
 * CultivationCharcoal.test.js - 修真木炭系统测试
 * V849 Iteration 22/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCharcoal } from '../../../systems/ai/CultivationCharcoal.js';

describe('CultivationCharcoal', () => {
    let system;
    beforeEach(() => { system = new CultivationCharcoal(); });

    describe('recruitCharcoal', () => {
        it('should recruit with defaults', () => {
            const { charcoal } = system.recruitCharcoal({});
            expect(charcoal.masterId).toBe('unknown_master');
            expect(charcoal.name).toBe('unnamed_charcoal');
            expect(charcoal.type).toBe('willow');
            expect(charcoal.heat).toBe(20);
            expect(charcoal.embers).toEqual([]);
            expect(charcoal.level).toBe(1);
            expect(charcoal.status).toBe('novice');
        });

        it('should recruit with custom data', () => {
            const { charcoal } = system.recruitCharcoal({
                masterId: 'm1',
                name: 'DivineCharcoal',
                type: 'divine',
                heat: 80,
                embers: ['spark'],
                level: 3,
                status: 'veteran'
            });
            expect(charcoal.masterId).toBe('m1');
            expect(charcoal.name).toBe('DivineCharcoal');
            expect(charcoal.type).toBe('divine');
            expect(charcoal.heat).toBe(80);
            expect(charcoal.embers).toEqual(['spark']);
            expect(charcoal.level).toBe(3);
            expect(charcoal.status).toBe('veteran');
        });

        it('should recruit with oak type', () => {
            const { charcoal } = system.recruitCharcoal({ type: 'oak' });
            expect(charcoal.type).toBe('oak');
        });

        it('should increment totalCharcoals', () => {
            system.recruitCharcoal({});
            system.recruitCharcoal({});
            expect(system.stats.totalCharcoals).toBe(2);
        });

        it('should trigger charcoalRecruited hook', () => {
            let called = false;
            system.registerHook('charcoalRecruited', () => { called = true; });
            system.recruitCharcoal({});
            expect(called).toBe(true);
        });

        it('should accept custom id', () => {
            const { charcoal } = system.recruitCharcoal({ id: 'custom_123' });
            expect(charcoal.charcoalId).toBe('custom_123');
        });
    });

    describe('getCharcoal', () => {
        it('should return charcoal', () => {
            const { charcoal } = system.recruitCharcoal({});
            const got = system.getCharcoal(charcoal.charcoalId);
            expect(got).not.toBeNull();
            expect(got.charcoalId).toBe(charcoal.charcoalId);
        });
        it('should return null for missing', () => { expect(system.getCharcoal('ghost')).toBeNull(); });
    });

    describe('listCharcoals', () => {
        it('should list all', () => {
            system.recruitCharcoal({});
            system.recruitCharcoal({});
            system.recruitCharcoal({});
            expect(system.listCharcoals().length).toBe(3);
        });

        it('should return empty list when no charcoals', () => {
            expect(system.listCharcoals().length).toBe(0);
        });

        it('should return clones not references', () => {
            const { charcoal } = system.recruitCharcoal({});
            const listed = system.listCharcoals();
            listed[0].name = 'modified';
            expect(system.getCharcoal(charcoal.charcoalId).name).toBe('unnamed_charcoal');
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitCharcoal({ masterId: 'm1' });
            system.recruitCharcoal({ masterId: 'm1' });
            system.recruitCharcoal({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary charcoals', () => {
            const { charcoal: c1 } = system.recruitCharcoal({});
            const { charcoal: c2 } = system.recruitCharcoal({});
            system.legendCharcoal(c1.charcoalId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].charcoalId).toBe(c1.charcoalId);
        });

        it('should return empty when none legendary', () => {
            system.recruitCharcoal({});
            system.recruitCharcoal({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addEmber', () => {
        it('should add ember', () => {
            const { charcoal } = system.recruitCharcoal({});
            system.addEmber(charcoal.charcoalId, 'spark');
            expect(charcoal.embers).toContain('spark');
            expect(charcoal.embers.length).toBe(1);
        });

        it('should add multiple embers', () => {
            const { charcoal } = system.recruitCharcoal({});
            system.addEmber(charcoal.charcoalId, 'spark');
            system.addEmber(charcoal.charcoalId, 'flame');
            expect(charcoal.embers).toEqual(['spark', 'flame']);
        });

        it('should set status to veteran when 5+ embers', () => {
            const { charcoal } = system.recruitCharcoal({});
            system.addEmber(charcoal.charcoalId, 'a');
            system.addEmber(charcoal.charcoalId, 'b');
            system.addEmber(charcoal.charcoalId, 'c');
            system.addEmber(charcoal.charcoalId, 'd');
            expect(charcoal.status).toBe('novice');
            system.addEmber(charcoal.charcoalId, 'e');
            expect(charcoal.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.addEmber('ghost', 'spark');
            expect(result.error).toBe('CHARCOAL_NOT_FOUND');
        });

        it('should trigger emberAdded hook', () => {
            const { charcoal } = system.recruitCharcoal({});
            let called = false;
            system.registerHook('emberAdded', () => { called = true; });
            system.addEmber(charcoal.charcoalId, 'spark');
            expect(called).toBe(true);
        });
    });

    describe('raiseHeat', () => {
        it('should raise by default amount', () => {
            const { charcoal } = system.recruitCharcoal({});
            system.raiseHeat(charcoal.charcoalId);
            expect(charcoal.heat).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { charcoal } = system.recruitCharcoal({});
            system.raiseHeat(charcoal.charcoalId, 30);
            expect(charcoal.heat).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raiseHeat('ghost', 5);
            expect(result.error).toBe('CHARCOAL_NOT_FOUND');
        });

        it('should trigger heatRaised hook', () => {
            const { charcoal } = system.recruitCharcoal({});
            let called = false;
            system.registerHook('heatRaised', () => { called = true; });
            system.raiseHeat(charcoal.charcoalId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpCharcoal', () => {
        it('should level up', () => {
            const { charcoal } = system.recruitCharcoal({});
            system.levelUpCharcoal(charcoal.charcoalId);
            expect(charcoal.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { charcoal } = system.recruitCharcoal({});
            system.levelUpCharcoal(charcoal.charcoalId);
            system.levelUpCharcoal(charcoal.charcoalId);
            expect(charcoal.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpCharcoal('ghost');
            expect(result.error).toBe('CHARCOAL_NOT_FOUND');
        });

        it('should trigger charcoalLeveledUp hook', () => {
            const { charcoal } = system.recruitCharcoal({});
            let called = false;
            system.registerHook('charcoalLeveledUp', () => { called = true; });
            system.levelUpCharcoal(charcoal.charcoalId);
            expect(called).toBe(true);
        });
    });

    describe('legendCharcoal', () => {
        it('should set status to legendary', () => {
            const { charcoal } = system.recruitCharcoal({});
            system.legendCharcoal(charcoal.charcoalId);
            expect(charcoal.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendCharcoal('ghost');
            expect(result.error).toBe('CHARCOAL_NOT_FOUND');
        });

        it('should trigger charcoalLegendized hook', () => {
            const { charcoal } = system.recruitCharcoal({});
            let called = false;
            system.registerHook('charcoalLegendized', () => { called = true; });
            system.legendCharcoal(charcoal.charcoalId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCharcoalValue', () => {
        it('should calculate default value', () => {
            const { charcoal } = system.recruitCharcoal({});
            // level=1 * 100 + heat=20 * 2 + 0 * 30 = 140
            expect(system.calculateCharcoalValue(charcoal.charcoalId)).toBe(140);
        });

        it('should add 30 per ember', () => {
            const { charcoal } = system.recruitCharcoal({});
            system.addEmber(charcoal.charcoalId, 'spark');
            system.addEmber(charcoal.charcoalId, 'flame');
            // 100 + 40 + 2*30 = 200
            expect(system.calculateCharcoalValue(charcoal.charcoalId)).toBe(200);
        });

        it('should reflect level in formula', () => {
            const { charcoal } = system.recruitCharcoal({});
            system.levelUpCharcoal(charcoal.charcoalId);
            system.levelUpCharcoal(charcoal.charcoalId);
            // 3*100 + 40 + 0 = 340
            expect(system.calculateCharcoalValue(charcoal.charcoalId)).toBe(340);
        });

        it('should reflect heat in formula', () => {
            const { charcoal } = system.recruitCharcoal({});
            system.raiseHeat(charcoal.charcoalId, 30);
            // 100 + 50*2 + 0 = 200
            expect(system.calculateCharcoalValue(charcoal.charcoalId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCharcoalValue('ghost')).toBe(0);
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

        it('should execute default getCharcoal', () => {
            const result = system.executeTool('getCharcoal', { charcoalId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('charcoalRecruited', () => count++);
            unregister();
            system.recruitCharcoal({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('charcoalRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitCharcoal({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCharcoals = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalCharcoals = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitCharcoal({});
            const json = system.toJSON();
            expect(json.charcoals.length).toBe(1);
            expect(json.stats.totalCharcoals).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitCharcoal({ name: 'a' });
            const json = system.toJSON();
            const newSys = new CultivationCharcoal();
            newSys.fromJSON(json);
            expect(newSys.charcoals.size).toBe(1);
            expect(newSys.stats.totalCharcoals).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.charcoalCount).toBe(0);
            expect(stats.totalCharcoals).toBe(0);
            system.recruitCharcoal({});
            expect(system.getStats().charcoalCount).toBe(1);
        });
    });
});