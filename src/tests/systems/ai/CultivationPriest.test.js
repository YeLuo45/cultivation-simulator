/**
 * CultivationPriest.test.js - 修真牧师系统测试
 * V613 Iteration 16/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPriest } from '../../../systems/ai/CultivationPriest.js';

describe('CultivationPriest', () => {
    let system;
    beforeEach(() => { system = new CultivationPriest(); });

    describe('recruitPriest', () => {
        it('should recruit', () => {
            const { priest } = system.recruitPriest({ bishopId: 'b1', name: 'Holy Priest', type: 'divine' });
            expect(priest.bishopId).toBe('b1');
            expect(priest.name).toBe('Holy Priest');
            expect(priest.type).toBe('divine');
        });

        it('should default type to light', () => {
            const { priest } = system.recruitPriest({});
            expect(priest.type).toBe('light');
        });

        it('should default status to novice', () => {
            const { priest } = system.recruitPriest({});
            expect(priest.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { priest } = system.recruitPriest({});
            expect(priest.level).toBe(1);
        });

        it('should default rites to empty array', () => {
            const { priest } = system.recruitPriest({});
            expect(priest.rites).toEqual([]);
        });

        it('should assign auto id when missing', () => {
            const { priest } = system.recruitPriest({});
            expect(priest.priestId).toMatch(/^priest_/);
        });

        it('should use provided priestId', () => {
            const { priest } = system.recruitPriest({ priestId: 'p_explicit' });
            expect(priest.priestId).toBe('p_explicit');
        });

        it('should trigger priestRecruited hook', () => {
            let called = false;
            system.registerHook('priestRecruited', () => { called = true; });
            system.recruitPriest({});
            expect(called).toBe(true);
        });
    });

    describe('getPriest', () => {
        it('should return', () => {
            const { priest } = system.recruitPriest({});
            expect(system.getPriest(priest.priestId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPriest('ghost')).toBeNull(); });
    });

    describe('listPriests', () => {
        it('should list all', () => {
            system.recruitPriest({});
            system.recruitPriest({});
            expect(system.listPriests().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listPriests().length).toBe(0);
        });
    });

    describe('listByBishop', () => {
        it('should filter', () => {
            system.recruitPriest({ bishopId: 'b1' });
            system.recruitPriest({ bishopId: 'b2' });
            expect(system.listByBishop('b1').length).toBe(1);
        });

        it('should return empty for unknown bishop', () => {
            system.recruitPriest({ bishopId: 'b1' });
            expect(system.listByBishop('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { priest: a } = system.recruitPriest({});
            const { priest: b } = system.recruitPriest({});
            system.legendPriest(a.priestId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.priestId).toBeDefined();
        });

        it('should return empty when none legendary', () => {
            system.recruitPriest({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addRite', () => {
        it('should add rite', () => {
            const { priest } = system.recruitPriest({});
            system.addRite(priest.priestId, 'blessing_of_light');
            expect(priest.rites).toContain('blessing_of_light');
        });

        it('should add multiple rites', () => {
            const { priest } = system.recruitPriest({});
            system.addRite(priest.priestId, 'blessing_of_light');
            system.addRite(priest.priestId, 'shadow_ward');
            expect(priest.rites.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addRite('ghost', 'blessing_of_light');
            expect(result.error).toBe('PRIEST_NOT_FOUND');
        });

        it('should trigger riteAdded hook', () => {
            const { priest } = system.recruitPriest({});
            let called = false;
            system.registerHook('riteAdded', () => { called = true; });
            system.addRite(priest.priestId, 'blessing_of_light');
            expect(called).toBe(true);
        });
    });

    describe('increaseDevotion', () => {
        it('should increase devotion', () => {
            const { priest } = system.recruitPriest({});
            system.increaseDevotion(priest.priestId, 10);
            expect(priest.devotion).toBe(30);
        });

        it('should default amount to 5', () => {
            const { priest } = system.recruitPriest({});
            system.increaseDevotion(priest.priestId);
            expect(priest.devotion).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.increaseDevotion('ghost', 10);
            expect(result.error).toBe('PRIEST_NOT_FOUND');
        });

        it('should trigger devotionIncreased hook', () => {
            const { priest } = system.recruitPriest({});
            let called = false;
            system.registerHook('devotionIncreased', () => { called = true; });
            system.increaseDevotion(priest.priestId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpPriest', () => {
        it('should increment level', () => {
            const { priest } = system.recruitPriest({});
            system.levelUpPriest(priest.priestId);
            expect(priest.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { priest } = system.recruitPriest({});
            system.levelUpPriest(priest.priestId);
            system.levelUpPriest(priest.priestId);
            system.levelUpPriest(priest.priestId);
            expect(priest.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpPriest('ghost');
            expect(result.error).toBe('PRIEST_NOT_FOUND');
        });
    });

    describe('legendPriest', () => {
        it('should set status to legendary', () => {
            const { priest } = system.recruitPriest({});
            system.legendPriest(priest.priestId);
            expect(priest.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendPriest('ghost');
            expect(result.error).toBe('PRIEST_NOT_FOUND');
        });

        it('should trigger priestLegendized hook', () => {
            const { priest } = system.recruitPriest({});
            let called = false;
            system.registerHook('priestLegendized', () => { called = true; });
            system.legendPriest(priest.priestId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePriestValue', () => {
        it('should calculate', () => {
            const { priest } = system.recruitPriest({});
            system.addRite(priest.priestId, 'blessing_of_light');
            // value = 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculatePriestValue(priest.priestId)).toBeCloseTo(170, 5);
        });

        it('should recalculate after level up', () => {
            const { priest } = system.recruitPriest({});
            system.levelUpPriest(priest.priestId);
            // value = 2 * 100 + 20 * 2 + 0 * 30 = 200 + 40 + 0 = 240
            expect(system.calculatePriestValue(priest.priestId)).toBeCloseTo(240, 5);
        });

        it('should recalculate after devotion increase', () => {
            const { priest } = system.recruitPriest({});
            system.increaseDevotion(priest.priestId, 5);
            // value = 1 * 100 + 25 * 2 + 0 * 30 = 100 + 50 + 0 = 150
            expect(system.calculatePriestValue(priest.priestId)).toBeCloseTo(150, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePriestValue('ghost')).toBe(0);
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

        it('should execute default getPriest', () => {
            const result = system.executeTool('getPriest', { priestId: 'ghost' });
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
            const unregister = system.registerHook('priestRecruited', () => count++);
            unregister();
            system.recruitPriest({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('priestRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitPriest({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPriests = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPriests = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitPriest({});
            const json = system.toJSON();
            expect(json.priests.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitPriest({});
            const json = system.toJSON();
            const newSys = new CultivationPriest();
            newSys.fromJSON(json);
            expect(newSys.priests.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitPriest({});
            const stats = system.getStats();
            expect(stats.priestCount).toBe(1);
        });
    });
});
