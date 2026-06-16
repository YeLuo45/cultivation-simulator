/**
 * CultivationCoke.test.js - 修真焦炭系统测试
 * V851 Iteration 24/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationCoke } from '../../../systems/ai/CultivationCoke.js';

describe('CultivationCoke', () => {
    let system;
    beforeEach(() => { system = new CultivationCoke(); });

    describe('recruitCoke', () => {
        it('should recruit with defaults', () => {
            const { coke } = system.recruitCoke({});
            expect(coke.masterId).toBe('unknown_master');
            expect(coke.name).toBe('unnamed_coke');
            expect(coke.type).toBe('metallurgical');
            expect(coke.heat).toBe(20);
            expect(coke.slags).toEqual([]);
            expect(coke.level).toBe(1);
            expect(coke.status).toBe('novice');
        });

        it('should recruit with custom data', () => {
            const { coke } = system.recruitCoke({
                masterId: 'm1',
                name: 'FlameCoke',
                type: 'divine',
                heat: 80,
                slags: ['iron'],
                level: 3,
                status: 'veteran'
            });
            expect(coke.masterId).toBe('m1');
            expect(coke.name).toBe('FlameCoke');
            expect(coke.type).toBe('divine');
            expect(coke.heat).toBe(80);
            expect(coke.slags).toEqual(['iron']);
            expect(coke.level).toBe(3);
            expect(coke.status).toBe('veteran');
        });

        it('should increment totalCokes', () => {
            system.recruitCoke({});
            system.recruitCoke({});
            expect(system.stats.totalCokes).toBe(2);
        });

        it('should trigger cokeRecruited hook', () => {
            let called = false;
            system.registerHook('cokeRecruited', () => { called = true; });
            system.recruitCoke({});
            expect(called).toBe(true);
        });
    });

    describe('getCoke', () => {
        it('should return coke', () => {
            const { coke } = system.recruitCoke({});
            const got = system.getCoke(coke.cokeId);
            expect(got).not.toBeNull();
            expect(got.cokeId).toBe(coke.cokeId);
        });
        it('should return null for missing', () => { expect(system.getCoke('ghost')).toBeNull(); });
    });

    describe('listCokes', () => {
        it('should list all', () => {
            system.recruitCoke({});
            system.recruitCoke({});
            system.recruitCoke({});
            expect(system.listCokes().length).toBe(3);
        });

        it('should return empty list when no cokes', () => {
            expect(system.listCokes().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitCoke({ masterId: 'm1' });
            system.recruitCoke({ masterId: 'm1' });
            system.recruitCoke({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary cokes', () => {
            const { coke: c1 } = system.recruitCoke({});
            const { coke: c2 } = system.recruitCoke({});
            system.legendCoke(c1.cokeId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].cokeId).toBe(c1.cokeId);
        });

        it('should return empty when none legendary', () => {
            system.recruitCoke({});
            system.recruitCoke({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addSlag', () => {
        it('should add slag', () => {
            const { coke } = system.recruitCoke({});
            system.addSlag(coke.cokeId, 'iron');
            expect(coke.slags).toContain('iron');
            expect(coke.slags.length).toBe(1);
        });

        it('should add multiple slags', () => {
            const { coke } = system.recruitCoke({});
            system.addSlag(coke.cokeId, 'iron');
            system.addSlag(coke.cokeId, 'copper');
            expect(coke.slags).toEqual(['iron', 'copper']);
        });

        it('should set status to veteran when 5+ slags', () => {
            const { coke } = system.recruitCoke({});
            system.addSlag(coke.cokeId, 'a');
            system.addSlag(coke.cokeId, 'b');
            system.addSlag(coke.cokeId, 'c');
            system.addSlag(coke.cokeId, 'd');
            expect(coke.status).toBe('novice');
            system.addSlag(coke.cokeId, 'e');
            expect(coke.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.addSlag('ghost', 'iron');
            expect(result.error).toBe('COKE_NOT_FOUND');
        });

        it('should trigger slagAdded hook', () => {
            const { coke } = system.recruitCoke({});
            let called = false;
            system.registerHook('slagAdded', () => { called = true; });
            system.addSlag(coke.cokeId, 'iron');
            expect(called).toBe(true);
        });
    });

    describe('raiseHeat', () => {
        it('should raise by default amount', () => {
            const { coke } = system.recruitCoke({});
            system.raiseHeat(coke.cokeId);
            expect(coke.heat).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { coke } = system.recruitCoke({});
            system.raiseHeat(coke.cokeId, 30);
            expect(coke.heat).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.raiseHeat('ghost', 5);
            expect(result.error).toBe('COKE_NOT_FOUND');
        });

        it('should trigger heatRaised hook', () => {
            const { coke } = system.recruitCoke({});
            let called = false;
            system.registerHook('heatRaised', () => { called = true; });
            system.raiseHeat(coke.cokeId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpCoke', () => {
        it('should level up', () => {
            const { coke } = system.recruitCoke({});
            system.levelUpCoke(coke.cokeId);
            expect(coke.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { coke } = system.recruitCoke({});
            system.levelUpCoke(coke.cokeId);
            system.levelUpCoke(coke.cokeId);
            expect(coke.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpCoke('ghost');
            expect(result.error).toBe('COKE_NOT_FOUND');
        });

        it('should trigger cokeLeveledUp hook', () => {
            const { coke } = system.recruitCoke({});
            let called = false;
            system.registerHook('cokeLeveledUp', () => { called = true; });
            system.levelUpCoke(coke.cokeId);
            expect(called).toBe(true);
        });
    });

    describe('legendCoke', () => {
        it('should set status to legendary', () => {
            const { coke } = system.recruitCoke({});
            system.legendCoke(coke.cokeId);
            expect(coke.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendCoke('ghost');
            expect(result.error).toBe('COKE_NOT_FOUND');
        });

        it('should trigger cokeLegendized hook', () => {
            const { coke } = system.recruitCoke({});
            let called = false;
            system.registerHook('cokeLegendized', () => { called = true; });
            system.legendCoke(coke.cokeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCokeValue', () => {
        it('should calculate default value', () => {
            const { coke } = system.recruitCoke({});
            // level=1 * 100 + heat=20 * 2 + 0 * 30 = 140
            expect(system.calculateCokeValue(coke.cokeId)).toBe(140);
        });

        it('should add 30 per slag', () => {
            const { coke } = system.recruitCoke({});
            system.addSlag(coke.cokeId, 'iron');
            system.addSlag(coke.cokeId, 'copper');
            // 100 + 40 + 2*30 = 200
            expect(system.calculateCokeValue(coke.cokeId)).toBe(200);
        });

        it('should reflect level in formula', () => {
            const { coke } = system.recruitCoke({});
            system.levelUpCoke(coke.cokeId);
            system.levelUpCoke(coke.cokeId);
            // 3*100 + 40 + 0 = 340
            expect(system.calculateCokeValue(coke.cokeId)).toBe(340);
        });

        it('should reflect heat in formula', () => {
            const { coke } = system.recruitCoke({});
            system.raiseHeat(coke.cokeId, 30);
            // 100 + 50*2 + 0 = 200
            expect(system.calculateCokeValue(coke.cokeId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCokeValue('ghost')).toBe(0);
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

        it('should execute default getCoke', () => {
            const result = system.executeTool('getCoke', { cokeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('cokeRecruited', () => count++);
            unregister();
            system.recruitCoke({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('cokeRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitCoke({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCokes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalCokes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitCoke({});
            const json = system.toJSON();
            expect(json.cokes.length).toBe(1);
            expect(json.stats.totalCokes).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitCoke({ name: 'a' });
            const json = system.toJSON();
            const newSys = new CultivationCoke();
            newSys.fromJSON(json);
            expect(newSys.cokes.size).toBe(1);
            expect(newSys.stats.totalCokes).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.cokeCount).toBe(0);
            expect(stats.totalCokes).toBe(0);
            system.recruitCoke({});
            expect(system.getStats().cokeCount).toBe(1);
        });
    });
});
