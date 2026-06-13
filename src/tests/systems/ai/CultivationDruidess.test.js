/**
 * CultivationDruidess.test.js - 修真女德系统测试
 * V624 Iteration 7/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDruidess } from '../../../systems/ai/CultivationDruidess.js';

describe('CultivationDruidess', () => {
    let system;
    beforeEach(() => { system = new CultivationDruidess(); });

    describe('recruitDruidess', () => {
        it('should recruit', () => {
            const { druidess } = system.recruitDruidess({ mentorId: 'mnt1', name: 'Forest Sage', type: 'ocean' });
            expect(druidess.mentorId).toBe('mnt1');
            expect(druidess.name).toBe('Forest Sage');
            expect(druidess.type).toBe('ocean');
        });

        it('should default type to forest', () => {
            const { druidess } = system.recruitDruidess({});
            expect(druidess.type).toBe('forest');
        });

        it('should default status to novice', () => {
            const { druidess } = system.recruitDruidess({});
            expect(druidess.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { druidess } = system.recruitDruidess({});
            expect(druidess.level).toBe(1);
        });

        it('should default companions to empty array', () => {
            const { druidess } = system.recruitDruidess({});
            expect(druidess.companions).toEqual([]);
        });

        it('should default harmony to baseHarmony', () => {
            const { druidess } = system.recruitDruidess({});
            expect(druidess.harmony).toBe(20);
        });

        it('should assign auto id when missing', () => {
            const { druidess } = system.recruitDruidess({});
            expect(druidess.druidessId).toMatch(/^drs_/);
        });

        it('should use provided druidessId', () => {
            const { druidess } = system.recruitDruidess({ druidessId: 'd_explicit' });
            expect(druidess.druidessId).toBe('d_explicit');
        });

        it('should trigger druidessRecruited hook', () => {
            let called = false;
            system.registerHook('druidessRecruited', () => { called = true; });
            system.recruitDruidess({});
            expect(called).toBe(true);
        });

        it('should support storm type', () => {
            const { druidess } = system.recruitDruidess({ type: 'storm' });
            expect(druidess.type).toBe('storm');
        });

        it('should use custom config when provided', () => {
            const custom = new CultivationDruidess({ baseHarmony: 50 });
            const { druidess } = custom.recruitDruidess({});
            expect(druidess.harmony).toBe(50);
        });
    });

    describe('getDruidess', () => {
        it('should return', () => {
            const { druidess } = system.recruitDruidess({});
            expect(system.getDruidess(druidess.druidessId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDruidess('ghost')).toBeNull(); });
    });

    describe('listDruidesses', () => {
        it('should list all', () => {
            system.recruitDruidess({});
            system.recruitDruidess({});
            expect(system.listDruidesses().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listDruidesses().length).toBe(0);
        });
    });

    describe('listByMentor', () => {
        it('should filter', () => {
            system.recruitDruidess({ mentorId: 'm1' });
            system.recruitDruidess({ mentorId: 'm2' });
            expect(system.listByMentor('m1').length).toBe(1);
        });

        it('should return empty for unknown mentor', () => {
            system.recruitDruidess({ mentorId: 'm1' });
            expect(system.listByMentor('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { druidess: a } = system.recruitDruidess({});
            const { druidess: b } = system.recruitDruidess({});
            system.legendDruidess(a.druidessId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.druidessId).toBeDefined();
        });

        it('should return empty when none legendary', () => {
            system.recruitDruidess({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addCompanion', () => {
        it('should add companion', () => {
            const { druidess } = system.recruitDruidess({});
            system.addCompanion(druidess.druidessId, 'wolf');
            expect(druidess.companions).toContain('wolf');
        });

        it('should add multiple companions', () => {
            const { druidess } = system.recruitDruidess({});
            system.addCompanion(druidess.druidessId, 'wolf');
            system.addCompanion(druidess.druidessId, 'bear');
            expect(druidess.companions.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addCompanion('ghost', 'wolf');
            expect(result.error).toBe('DRUIDESS_NOT_FOUND');
        });

        it('should trigger companionAdded hook', () => {
            const { druidess } = system.recruitDruidess({});
            let called = false;
            system.registerHook('companionAdded', () => { called = true; });
            system.addCompanion(druidess.druidessId, 'wolf');
            expect(called).toBe(true);
        });
    });

    describe('deepenHarmony', () => {
        it('should deepen harmony', () => {
            const { druidess } = system.recruitDruidess({});
            system.deepenHarmony(druidess.druidessId, 10);
            expect(druidess.harmony).toBe(30);
        });

        it('should default amount to 5', () => {
            const { druidess } = system.recruitDruidess({});
            system.deepenHarmony(druidess.druidessId);
            expect(druidess.harmony).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.deepenHarmony('ghost', 10);
            expect(result.error).toBe('DRUIDESS_NOT_FOUND');
        });

        it('should trigger harmonyDeepened hook', () => {
            const { druidess } = system.recruitDruidess({});
            let called = false;
            system.registerHook('harmonyDeepened', () => { called = true; });
            system.deepenHarmony(druidess.druidessId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDruidess', () => {
        it('should increment level', () => {
            const { druidess } = system.recruitDruidess({});
            system.levelUpDruidess(druidess.druidessId);
            expect(druidess.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { druidess } = system.recruitDruidess({});
            system.levelUpDruidess(druidess.druidessId);
            system.levelUpDruidess(druidess.druidessId);
            system.levelUpDruidess(druidess.druidessId);
            expect(druidess.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpDruidess('ghost');
            expect(result.error).toBe('DRUIDESS_NOT_FOUND');
        });
    });

    describe('legendDruidess', () => {
        it('should set status to legendary', () => {
            const { druidess } = system.recruitDruidess({});
            system.legendDruidess(druidess.druidessId);
            expect(druidess.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendDruidess('ghost');
            expect(result.error).toBe('DRUIDESS_NOT_FOUND');
        });

        it('should trigger druidessLegendized hook', () => {
            const { druidess } = system.recruitDruidess({});
            let called = false;
            system.registerHook('druidessLegendized', () => { called = true; });
            system.legendDruidess(druidess.druidessId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDruidessValue', () => {
        it('should calculate', () => {
            const { druidess } = system.recruitDruidess({});
            system.addCompanion(druidess.druidessId, 'wolf');
            // value = 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculateDruidessValue(druidess.druidessId)).toBeCloseTo(170, 5);
        });

        it('should recalculate after level up', () => {
            const { druidess } = system.recruitDruidess({});
            system.levelUpDruidess(druidess.druidessId);
            // value = 2 * 100 + 20 * 2 + 0 * 30 = 200 + 40 + 0 = 240
            expect(system.calculateDruidessValue(druidess.druidessId)).toBeCloseTo(240, 5);
        });

        it('should recalculate after harmony deepen', () => {
            const { druidess } = system.recruitDruidess({});
            system.deepenHarmony(druidess.druidessId, 5);
            // value = 1 * 100 + 25 * 2 + 0 * 30 = 100 + 50 + 0 = 150
            expect(system.calculateDruidessValue(druidess.druidessId)).toBeCloseTo(150, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDruidessValue('ghost')).toBe(0);
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

        it('should execute default getDruidess', () => {
            const result = system.executeTool('getDruidess', { druidessId: 'ghost' });
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
            const unregister = system.registerHook('druidessRecruited', () => count++);
            unregister();
            system.recruitDruidess({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('druidessRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDruidess({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDruidesses = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDruidesses = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDruidess({});
            const json = system.toJSON();
            expect(json.druidesses.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitDruidess({});
            const json = system.toJSON();
            const newSys = new CultivationDruidess();
            newSys.fromJSON(json);
            expect(newSys.druidesses.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitDruidess({});
            const stats = system.getStats();
            expect(stats.druidessCount).toBe(1);
        });
    });
});
