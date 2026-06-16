/**
 * CultivationPrana.test.js - 修真气息系统测试
 * V726 Iteration 19/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPrana } from '../../../systems/ai/CultivationPrana.js';

describe('CultivationPrana', () => {
    let system;
    beforeEach(() => { system = new CultivationPrana(); });

    describe('recruitPrana', () => {
        it('should recruit', () => {
            const { prana } = system.recruitPrana({ masterId: 'mst1', name: 'Sage Prana', type: 'life' });
            expect(prana.masterId).toBe('mst1');
            expect(prana.name).toBe('Sage Prana');
            expect(prana.type).toBe('life');
        });

        it('should default type to breath', () => {
            const { prana } = system.recruitPrana({});
            expect(prana.type).toBe('breath');
        });

        it('should default status to novice', () => {
            const { prana } = system.recruitPrana({});
            expect(prana.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { prana } = system.recruitPrana({});
            expect(prana.level).toBe(1);
        });

        it('should default breaths to empty array', () => {
            const { prana } = system.recruitPrana({});
            expect(prana.breaths).toEqual([]);
        });

        it('should default vitality to baseVitality', () => {
            const { prana } = system.recruitPrana({});
            expect(prana.vitality).toBe(20);
        });

        it('should assign auto id when missing', () => {
            const { prana } = system.recruitPrana({});
            expect(prana.pranaId).toMatch(/^prn_/);
        });

        it('should use provided pranaId', () => {
            const { prana } = system.recruitPrana({ pranaId: 'p_explicit' });
            expect(prana.pranaId).toBe('p_explicit');
        });

        it('should trigger pranaRecruited hook', () => {
            let called = false;
            system.registerHook('pranaRecruited', () => { called = true; });
            system.recruitPrana({});
            expect(called).toBe(true);
        });
    });

    describe('getPrana', () => {
        it('should return', () => {
            const { prana } = system.recruitPrana({});
            expect(system.getPrana(prana.pranaId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPrana('ghost')).toBeNull(); });
    });

    describe('listPranas', () => {
        it('should list all', () => {
            system.recruitPrana({});
            system.recruitPrana({});
            expect(system.listPranas().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listPranas().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitPrana({ masterId: 'm1' });
            system.recruitPrana({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitPrana({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { prana: a } = system.recruitPrana({});
            const { prana: b } = system.recruitPrana({});
            system.legendPrana(a.pranaId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.pranaId).toBeDefined();
        });

        it('should return empty when none legendary', () => {
            system.recruitPrana({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addBreath', () => {
        it('should add breath', () => {
            const { prana } = system.recruitPrana({});
            system.addBreath(prana.pranaId, 'inhale_heaven');
            expect(prana.breaths).toContain('inhale_heaven');
        });

        it('should add multiple breaths', () => {
            const { prana } = system.recruitPrana({});
            system.addBreath(prana.pranaId, 'inhale_heaven');
            system.addBreath(prana.pranaId, 'exhale_earth');
            expect(prana.breaths.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addBreath('ghost', 'inhale_heaven');
            expect(result.error).toBe('PRANA_NOT_FOUND');
        });

        it('should trigger breathAdded hook', () => {
            const { prana } = system.recruitPrana({});
            let called = false;
            system.registerHook('breathAdded', () => { called = true; });
            system.addBreath(prana.pranaId, 'inhale_heaven');
            expect(called).toBe(true);
        });
    });

    describe('raiseVitality', () => {
        it('should raise vitality', () => {
            const { prana } = system.recruitPrana({});
            system.raiseVitality(prana.pranaId, 10);
            expect(prana.vitality).toBe(30);
        });

        it('should default amount to 5', () => {
            const { prana } = system.recruitPrana({});
            system.raiseVitality(prana.pranaId);
            expect(prana.vitality).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseVitality('ghost', 10);
            expect(result.error).toBe('PRANA_NOT_FOUND');
        });

        it('should trigger vitalityRaised hook', () => {
            const { prana } = system.recruitPrana({});
            let called = false;
            system.registerHook('vitalityRaised', () => { called = true; });
            system.raiseVitality(prana.pranaId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpPrana', () => {
        it('should increment level', () => {
            const { prana } = system.recruitPrana({});
            system.levelUpPrana(prana.pranaId);
            expect(prana.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { prana } = system.recruitPrana({});
            system.levelUpPrana(prana.pranaId);
            system.levelUpPrana(prana.pranaId);
            system.levelUpPrana(prana.pranaId);
            expect(prana.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpPrana('ghost');
            expect(result.error).toBe('PRANA_NOT_FOUND');
        });
    });

    describe('legendPrana', () => {
        it('should set status to legendary', () => {
            const { prana } = system.recruitPrana({});
            system.legendPrana(prana.pranaId);
            expect(prana.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendPrana('ghost');
            expect(result.error).toBe('PRANA_NOT_FOUND');
        });

        it('should trigger pranaLegendized hook', () => {
            const { prana } = system.recruitPrana({});
            let called = false;
            system.registerHook('pranaLegendized', () => { called = true; });
            system.legendPrana(prana.pranaId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePranaValue', () => {
        it('should calculate', () => {
            const { prana } = system.recruitPrana({});
            system.addBreath(prana.pranaId, 'inhale_heaven');
            // value = 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculatePranaValue(prana.pranaId)).toBeCloseTo(170, 5);
        });

        it('should recalculate after level up', () => {
            const { prana } = system.recruitPrana({});
            system.levelUpPrana(prana.pranaId);
            // value = 2 * 100 + 20 * 2 + 0 * 30 = 200 + 40 + 0 = 240
            expect(system.calculatePranaValue(prana.pranaId)).toBeCloseTo(240, 5);
        });

        it('should recalculate after vitality raise', () => {
            const { prana } = system.recruitPrana({});
            system.raiseVitality(prana.pranaId, 5);
            // value = 1 * 100 + 25 * 2 + 0 * 30 = 100 + 50 + 0 = 150
            expect(system.calculatePranaValue(prana.pranaId)).toBeCloseTo(150, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePranaValue('ghost')).toBe(0);
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

        it('should execute default getPrana', () => {
            const result = system.executeTool('getPrana', { pranaId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle undefined context with default', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('pranaRecruited', () => count++);
            unregister();
            system.recruitPrana({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('pranaRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitPrana({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPranas = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPranas = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitPrana({});
            const json = system.toJSON();
            expect(json.pranas.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitPrana({});
            const json = system.toJSON();
            const newSys = new CultivationPrana();
            newSys.fromJSON(json);
            expect(newSys.pranas.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitPrana({});
            const stats = system.getStats();
            expect(stats.pranaCount).toBe(1);
        });
    });
});
