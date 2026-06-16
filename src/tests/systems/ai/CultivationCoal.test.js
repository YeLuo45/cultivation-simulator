/**
 * CultivationCoal.test.js - 修真煤系统测试
 * V850 Iteration 23/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCoal } from '../../../systems/ai/CultivationCoal.js';

describe('CultivationCoal', () => {
    let system;
    beforeEach(() => { system = new CultivationCoal(); });

    describe('recruitCoal', () => {
        it('should recruit with defaults', () => {
            const { coal } = system.recruitCoal({});
            expect(coal.masterId).toBe('unknown_master');
            expect(coal.name).toBe('unnamed_coal');
            expect(coal.type).toBe('anthracite');
            expect(coal.heat).toBe(20);
            expect(coal.flames).toEqual([]);
            expect(coal.level).toBe(1);
            expect(coal.status).toBe('novice');
        });

        it('should recruit with custom data', () => {
            const { coal } = system.recruitCoal({
                masterId: 'm1',
                name: 'SunCoal',
                type: 'bituminous',
                heat: 80,
                flames: ['firefly'],
                level: 3,
                status: 'veteran'
            });
            expect(coal.masterId).toBe('m1');
            expect(coal.name).toBe('SunCoal');
            expect(coal.type).toBe('bituminous');
            expect(coal.heat).toBe(80);
            expect(coal.flames).toEqual(['firefly']);
            expect(coal.level).toBe(3);
            expect(coal.status).toBe('veteran');
        });

        it('should increment totalCoals', () => {
            system.recruitCoal({});
            system.recruitCoal({});
            expect(system.stats.totalCoals).toBe(2);
        });

        it('should trigger coalRecruited hook', () => {
            let called = false;
            system.registerHook('coalRecruited', () => { called = true; });
            system.recruitCoal({});
            expect(called).toBe(true);
        });
    });

    describe('getCoal', () => {
        it('should return coal', () => {
            const { coal } = system.recruitCoal({});
            const got = system.getCoal(coal.coalId);
            expect(got).not.toBeNull();
            expect(got.coalId).toBe(coal.coalId);
        });
        it('should return null for missing', () => { expect(system.getCoal('ghost')).toBeNull(); });
    });

    describe('listCoals', () => {
        it('should list all', () => {
            system.recruitCoal({});
            system.recruitCoal({});
            system.recruitCoal({});
            expect(system.listCoals().length).toBe(3);
        });

        it('should return empty list when no coals', () => {
            expect(system.listCoals().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitCoal({ masterId: 'm1' });
            system.recruitCoal({ masterId: 'm1' });
            system.recruitCoal({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary coals', () => {
            const { coal: c1 } = system.recruitCoal({});
            const { coal: c2 } = system.recruitCoal({});
            system.legendCoal(c1.coalId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].coalId).toBe(c1.coalId);
        });

        it('should return empty when none legendary', () => {
            system.recruitCoal({});
            system.recruitCoal({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addFlame', () => {
        it('should add flame', () => {
            const { coal } = system.recruitCoal({});
            system.addFlame(coal.coalId, 'firefly');
            expect(coal.flames).toContain('firefly');
            expect(coal.flames.length).toBe(1);
        });

        it('should add multiple flames', () => {
            const { coal } = system.recruitCoal({});
            system.addFlame(coal.coalId, 'firefly');
            system.addFlame(coal.coalId, 'leaf');
            expect(coal.flames).toEqual(['firefly', 'leaf']);
        });

        it('should set status to veteran when 5+ flames', () => {
            const { coal } = system.recruitCoal({});
            system.addFlame(coal.coalId, 'a');
            system.addFlame(coal.coalId, 'b');
            system.addFlame(coal.coalId, 'c');
            system.addFlame(coal.coalId, 'd');
            expect(coal.status).toBe('novice');
            system.addFlame(coal.coalId, 'e');
            expect(coal.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.addFlame('ghost', 'firefly');
            expect(result.error).toBe('COAL_NOT_FOUND');
        });

        it('should trigger flameAdded hook', () => {
            const { coal } = system.recruitCoal({});
            let called = false;
            system.registerHook('flameAdded', () => { called = true; });
            system.addFlame(coal.coalId, 'firefly');
            expect(called).toBe(true);
        });
    });

    describe('raiseHeat', () => {
        it('should raise by default amount', () => {
            const { coal } = system.recruitCoal({});
            system.raiseHeat(coal.coalId);
            expect(coal.heat).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { coal } = system.recruitCoal({});
            system.raiseHeat(coal.coalId, 30);
            expect(coal.heat).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raiseHeat('ghost', 5);
            expect(result.error).toBe('COAL_NOT_FOUND');
        });

        it('should trigger heatRaised hook', () => {
            const { coal } = system.recruitCoal({});
            let called = false;
            system.registerHook('heatRaised', () => { called = true; });
            system.raiseHeat(coal.coalId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpCoal', () => {
        it('should level up', () => {
            const { coal } = system.recruitCoal({});
            system.levelUpCoal(coal.coalId);
            expect(coal.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { coal } = system.recruitCoal({});
            system.levelUpCoal(coal.coalId);
            system.levelUpCoal(coal.coalId);
            expect(coal.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpCoal('ghost');
            expect(result.error).toBe('COAL_NOT_FOUND');
        });

        it('should trigger coalLeveledUp hook', () => {
            const { coal } = system.recruitCoal({});
            let called = false;
            system.registerHook('coalLeveledUp', () => { called = true; });
            system.levelUpCoal(coal.coalId);
            expect(called).toBe(true);
        });
    });

    describe('legendCoal', () => {
        it('should set status to legendary', () => {
            const { coal } = system.recruitCoal({});
            system.legendCoal(coal.coalId);
            expect(coal.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendCoal('ghost');
            expect(result.error).toBe('COAL_NOT_FOUND');
        });

        it('should trigger coalLegendized hook', () => {
            const { coal } = system.recruitCoal({});
            let called = false;
            system.registerHook('coalLegendized', () => { called = true; });
            system.legendCoal(coal.coalId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCoalValue', () => {
        it('should calculate default value', () => {
            const { coal } = system.recruitCoal({});
            // level=1 * 100 + heat=20 * 2 + 0 * 30 = 140
            expect(system.calculateCoalValue(coal.coalId)).toBe(140);
        });

        it('should add 30 per flame', () => {
            const { coal } = system.recruitCoal({});
            system.addFlame(coal.coalId, 'firefly');
            system.addFlame(coal.coalId, 'leaf');
            // 100 + 40 + 2*30 = 200
            expect(system.calculateCoalValue(coal.coalId)).toBe(200);
        });

        it('should reflect level in formula', () => {
            const { coal } = system.recruitCoal({});
            system.levelUpCoal(coal.coalId);
            system.levelUpCoal(coal.coalId);
            // 3*100 + 40 + 0 = 340
            expect(system.calculateCoalValue(coal.coalId)).toBe(340);
        });

        it('should reflect heat in formula', () => {
            const { coal } = system.recruitCoal({});
            system.raiseHeat(coal.coalId, 30);
            // 100 + 50*2 + 0 = 200
            expect(system.calculateCoalValue(coal.coalId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCoalValue('ghost')).toBe(0);
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

        it('should execute default getCoal', () => {
            const result = system.executeTool('getCoal', { coalId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('coalRecruited', () => count++);
            unregister();
            system.recruitCoal({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('coalRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitCoal({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCoals = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalCoals = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitCoal({});
            const json = system.toJSON();
            expect(json.coals.length).toBe(1);
            expect(json.stats.totalCoals).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitCoal({ name: 'a' });
            const json = system.toJSON();
            const newSys = new CultivationCoal();
            newSys.fromJSON(json);
            expect(newSys.coals.size).toBe(1);
            expect(newSys.stats.totalCoals).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.coalCount).toBe(0);
            expect(stats.totalCoals).toBe(0);
            system.recruitCoal({});
            expect(system.getStats().coalCount).toBe(1);
        });
    });
});
