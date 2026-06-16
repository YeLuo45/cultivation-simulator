/**
 * SectDefense.test.js - 宗门防御测试
 * V415 Iteration 7/15 Round 14 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectDefense } from '../../../systems/ai/SectDefense.js';

describe('SectDefense', () => {
    let system;
    beforeEach(() => { system = new SectDefense(); });

    describe('buildDefense', () => {
        it('should build', () => {
            const { defense } = system.buildDefense({ sectId: 's1' });
            expect(defense.sectId).toBe('s1');
        });

        it('should assign default walls', () => {
            const { defense } = system.buildDefense({ sectId: 's1' });
            expect(defense.walls).toBe(100);
        });

        it('should trigger defenseBuilt hook', () => {
            let called = false;
            system.registerHook('defenseBuilt', () => { called = true; });
            system.buildDefense({ sectId: 's1' });
            expect(called).toBe(true);
        });
    });

    describe('getDefense', () => {
        it('should return', () => {
            const { defense } = system.buildDefense({ sectId: 's1' });
            expect(system.getDefense(defense.defenseId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDefense('ghost')).toBeNull(); });
    });

    describe('listDefenses', () => {
        it('should list all', () => {
            system.buildDefense({ sectId: 's1' });
            expect(system.listDefenses().length).toBe(1);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.buildDefense({ sectId: 's1' });
            system.buildDefense({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });
    });

    describe('listByIntegrity', () => {
        it('should filter by integrity', () => {
            system.buildDefense({ sectId: 's1', integrity: 50 });
            system.buildDefense({ sectId: 's2', integrity: 95 });
            expect(system.listByIntegrity(80).length).toBe(1);
        });
    });

    describe('fortifyDefense', () => {
        it('should fortify', () => {
            const { defense } = system.buildDefense({ sectId: 's1' });
            system.fortifyDefense(defense.defenseId, 10);
            expect(defense.walls).toBe(110);
        });

        it('should reject missing', () => {
            const result = system.fortifyDefense('ghost', 10);
            expect(result.error).toBe('DEFENSE_NOT_FOUND');
        });

        it('should trigger defenseFortified hook', () => {
            const { defense } = system.buildDefense({ sectId: 's1' });
            let called = false;
            system.registerHook('defenseFortified', () => { called = true; });
            system.fortifyDefense(defense.defenseId, 10);
            expect(called).toBe(true);
        });
    });

    describe('garrisonRecruited', () => {
        it('should recruit garrison', () => {
            const { defense } = system.buildDefense({ sectId: 's1' });
            system.garrisonRecruited(defense.defenseId, 5);
            expect(defense.garrison).toBe(15);
        });

        it('should reject missing', () => {
            const result = system.garrisonRecruited('ghost', 5);
            expect(result.error).toBe('DEFENSE_NOT_FOUND');
        });

        it('should trigger garrisonRecruited hook', () => {
            const { defense } = system.buildDefense({ sectId: 's1' });
            let called = false;
            system.registerHook('garrisonRecruited', () => { called = true; });
            system.garrisonRecruited(defense.defenseId, 5);
            expect(called).toBe(true);
        });
    });

    describe('repairDefense', () => {
        it('should repair', () => {
            const { defense } = system.buildDefense({ sectId: 's1', integrity: 50 });
            system.repairDefense(defense.defenseId, 20);
            expect(defense.integrity).toBe(70);
        });

        it('should cap integrity at 100', () => {
            const { defense } = system.buildDefense({ sectId: 's1', integrity: 90 });
            system.repairDefense(defense.defenseId, 20);
            expect(defense.integrity).toBe(100);
        });

        it('should mark status intact at full integrity', () => {
            const { defense } = system.buildDefense({ sectId: 's1', integrity: 90 });
            system.repairDefense(defense.defenseId, 20);
            expect(defense.status).toBe('intact');
        });

        it('should reject missing', () => {
            const result = system.repairDefense('ghost', 20);
            expect(result.error).toBe('DEFENSE_NOT_FOUND');
        });

        it('should trigger defenseRepaired hook', () => {
            const { defense } = system.buildDefense({ sectId: 's1', integrity: 50 });
            let called = false;
            system.registerHook('defenseRepaired', () => { called = true; });
            system.repairDefense(defense.defenseId, 20);
            expect(called).toBe(true);
        });
    });

    describe('calculateDefenseStrength', () => {
        it('should calculate', () => {
            const { defense } = system.buildDefense({ sectId: 's1' });
            // walls(100) + shields(10)*2 + towers(2)*5 + garrison(10)*3 + integrity(100)/10
            // = 100 + 20 + 10 + 30 + 10 = 170
            expect(system.calculateDefenseStrength(defense.defenseId)).toBeCloseTo(170, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDefenseStrength('ghost')).toBe(0);
        });
    });

    describe('listStrong', () => {
        it('should filter high integrity', () => {
            system.buildDefense({ sectId: 's1', integrity: 50 });
            system.buildDefense({ sectId: 's2', integrity: 95 });
            expect(system.listStrong().length).toBe(1);
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

        it('should execute default getDefense', () => {
            const result = system.executeTool('getDefense', { defenseId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('defenseBuilt', () => count++);
            unregister();
            system.buildDefense({ sectId: 's1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('defenseBuilt', () => { throw new Error('x'); });
            expect(() => system.buildDefense({ sectId: 's1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDefenses = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDefenses = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.buildDefense({ sectId: 's1' });
            const json = system.toJSON();
            expect(json.defenses.length).toBe(1);
        });
        it('should deserialize', () => {
            system.buildDefense({ sectId: 's1' });
            const json = system.toJSON();
            const newSys = new SectDefense();
            newSys.fromJSON(json);
            expect(newSys.defenses.size).toBe(1);
        });
        it('should handle empty data', () => {
            const newSys = new SectDefense();
            const result = newSys.fromJSON({});
            expect(result.success).toBe(true);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.defenseCount).toBe(0);
        });
    });
});
