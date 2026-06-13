/**
 * CultivationHealer.test.js - 修真医师系统测试
 * V603 Iteration 6/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationHealer } from '../../../systems/ai/CultivationHealer.js';

describe('CultivationHealer', () => {
    let system;
    beforeEach(() => { system = new CultivationHealer(); });

    describe('recruitHealer', () => {
        it('should recruit', () => {
            const { healer } = system.recruitHealer({ mentorId: 'mnt1', name: 'Sage Healer', type: 'spiritual' });
            expect(healer.mentorId).toBe('mnt1');
            expect(healer.name).toBe('Sage Healer');
            expect(healer.type).toBe('spiritual');
        });

        it('should default type to physical', () => {
            const { healer } = system.recruitHealer({});
            expect(healer.type).toBe('physical');
        });

        it('should default status to novice', () => {
            const { healer } = system.recruitHealer({});
            expect(healer.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { healer } = system.recruitHealer({});
            expect(healer.level).toBe(1);
        });

        it('should default cures to empty array', () => {
            const { healer } = system.recruitHealer({});
            expect(healer.cures).toEqual([]);
        });

        it('should assign auto id when missing', () => {
            const { healer } = system.recruitHealer({});
            expect(healer.healerId).toMatch(/^heal_/);
        });

        it('should use provided healerId', () => {
            const { healer } = system.recruitHealer({ healerId: 'h_explicit' });
            expect(healer.healerId).toBe('h_explicit');
        });

        it('should trigger healerRecruited hook', () => {
            let called = false;
            system.registerHook('healerRecruited', () => { called = true; });
            system.recruitHealer({});
            expect(called).toBe(true);
        });
    });

    describe('getHealer', () => {
        it('should return', () => {
            const { healer } = system.recruitHealer({});
            expect(system.getHealer(healer.healerId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getHealer('ghost')).toBeNull(); });
    });

    describe('listHealers', () => {
        it('should list all', () => {
            system.recruitHealer({});
            system.recruitHealer({});
            expect(system.listHealers().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listHealers().length).toBe(0);
        });
    });

    describe('listByMentor', () => {
        it('should filter', () => {
            system.recruitHealer({ mentorId: 'm1' });
            system.recruitHealer({ mentorId: 'm2' });
            expect(system.listByMentor('m1').length).toBe(1);
        });

        it('should return empty for unknown mentor', () => {
            system.recruitHealer({ mentorId: 'm1' });
            expect(system.listByMentor('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { healer: a } = system.recruitHealer({});
            const { healer: b } = system.recruitHealer({});
            system.legendHealer(a.healerId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.healerId).toBeDefined();
        });

        it('should return empty when none legendary', () => {
            system.recruitHealer({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addCure', () => {
        it('should add cure', () => {
            const { healer } = system.recruitHealer({});
            system.addCure(healer.healerId, 'qi_restore');
            expect(healer.cures).toContain('qi_restore');
        });

        it('should add multiple cures', () => {
            const { healer } = system.recruitHealer({});
            system.addCure(healer.healerId, 'qi_restore');
            system.addCure(healer.healerId, 'meridian_repair');
            expect(healer.cures.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addCure('ghost', 'qi_restore');
            expect(result.error).toBe('HEALER_NOT_FOUND');
        });

        it('should trigger cureAdded hook', () => {
            const { healer } = system.recruitHealer({});
            let called = false;
            system.registerHook('cureAdded', () => { called = true; });
            system.addCure(healer.healerId, 'qi_restore');
            expect(called).toBe(true);
        });
    });

    describe('boostHealing', () => {
        it('should boost healing', () => {
            const { healer } = system.recruitHealer({});
            system.boostHealing(healer.healerId, 10);
            expect(healer.healing).toBe(30);
        });

        it('should default amount to 5', () => {
            const { healer } = system.recruitHealer({});
            system.boostHealing(healer.healerId);
            expect(healer.healing).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.boostHealing('ghost', 10);
            expect(result.error).toBe('HEALER_NOT_FOUND');
        });

        it('should trigger healingBoosted hook', () => {
            const { healer } = system.recruitHealer({});
            let called = false;
            system.registerHook('healingBoosted', () => { called = true; });
            system.boostHealing(healer.healerId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpHealer', () => {
        it('should increment level', () => {
            const { healer } = system.recruitHealer({});
            system.levelUpHealer(healer.healerId);
            expect(healer.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { healer } = system.recruitHealer({});
            system.levelUpHealer(healer.healerId);
            system.levelUpHealer(healer.healerId);
            system.levelUpHealer(healer.healerId);
            expect(healer.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpHealer('ghost');
            expect(result.error).toBe('HEALER_NOT_FOUND');
        });
    });

    describe('legendHealer', () => {
        it('should set status to legendary', () => {
            const { healer } = system.recruitHealer({});
            system.legendHealer(healer.healerId);
            expect(healer.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendHealer('ghost');
            expect(result.error).toBe('HEALER_NOT_FOUND');
        });

        it('should trigger healerLegendized hook', () => {
            const { healer } = system.recruitHealer({});
            let called = false;
            system.registerHook('healerLegendized', () => { called = true; });
            system.legendHealer(healer.healerId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHealerValue', () => {
        it('should calculate', () => {
            const { healer } = system.recruitHealer({});
            system.addCure(healer.healerId, 'qi_restore');
            // value = 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculateHealerValue(healer.healerId)).toBeCloseTo(170, 5);
        });

        it('should recalculate after level up', () => {
            const { healer } = system.recruitHealer({});
            system.levelUpHealer(healer.healerId);
            // value = 2 * 100 + 20 * 2 + 0 * 30 = 200 + 40 + 0 = 240
            expect(system.calculateHealerValue(healer.healerId)).toBeCloseTo(240, 5);
        });

        it('should recalculate after healing boost', () => {
            const { healer } = system.recruitHealer({});
            system.boostHealing(healer.healerId, 5);
            // value = 1 * 100 + 25 * 2 + 0 * 30 = 100 + 50 + 0 = 150
            expect(system.calculateHealerValue(healer.healerId)).toBeCloseTo(150, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHealerValue('ghost')).toBe(0);
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

        it('should execute default getHealer', () => {
            const result = system.executeTool('getHealer', { healerId: 'ghost' });
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
            const unregister = system.registerHook('healerRecruited', () => count++);
            unregister();
            system.recruitHealer({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('healerRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitHealer({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalHealers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalHealers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitHealer({});
            const json = system.toJSON();
            expect(json.healers.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitHealer({});
            const json = system.toJSON();
            const newSys = new CultivationHealer();
            newSys.fromJSON(json);
            expect(newSys.healers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitHealer({});
            const stats = system.getStats();
            expect(stats.healerCount).toBe(1);
        });
    });
});
