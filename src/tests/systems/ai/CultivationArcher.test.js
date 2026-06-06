/**
 * CultivationArcher.test.js - 修真弓手测试
 * V600 Iteration 3/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationArcher } from '../../../systems/ai/CultivationArcher.js';

describe('CultivationArcher', () => {
    let system;
    beforeEach(() => { system = new CultivationArcher(); });

    describe('recruitArcher', () => {
        it('should recruit', () => {
            const { archer } = system.recruitArcher({ trainerId: 't1', name: 'Legolas' });
            expect(archer.trainerId).toBe('t1');
            expect(archer.name).toBe('Legolas');
        });

        it('should default type to longbow', () => {
            const { archer } = system.recruitArcher({});
            expect(archer.type).toBe('longbow');
        });

        it('should default accuracy to baseAccuracy', () => {
            const { archer } = system.recruitArcher({});
            expect(archer.accuracy).toBe(70);
        });

        it('should initialize with novice status and level 1', () => {
            const { archer } = system.recruitArcher({});
            expect(archer.status).toBe('novice');
            expect(archer.level).toBe(1);
        });

        it('should initialize with empty arrows array', () => {
            const { archer } = system.recruitArcher({});
            expect(archer.arrows).toEqual([]);
        });

        it('should trigger archerRecruited hook', () => {
            let called = false;
            system.registerHook('archerRecruited', () => { called = true; });
            system.recruitArcher({});
            expect(called).toBe(true);
        });

        it('should accept custom arrow input', () => {
            const { archer } = system.recruitArcher({ arrows: ['flame', 'ice'] });
            expect(archer.arrows).toEqual(['flame', 'ice']);
        });
    });

    describe('getArcher', () => {
        it('should return', () => {
            const { archer } = system.recruitArcher({});
            expect(system.getArcher(archer.archerId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getArcher('ghost')).toBeNull(); });
    });

    describe('listArchers', () => {
        it('should list all', () => {
            system.recruitArcher({});
            system.recruitArcher({});
            expect(system.listArchers().length).toBe(2);
        });

        it('should return empty array when no archers', () => {
            expect(system.listArchers().length).toBe(0);
        });
    });

    describe('listByTrainer', () => {
        it('should filter', () => {
            system.recruitArcher({ trainerId: 't1' });
            system.recruitArcher({ trainerId: 't2' });
            expect(system.listByTrainer('t1').length).toBe(1);
        });

        it('should return empty for unknown trainer', () => {
            system.recruitArcher({ trainerId: 't1' });
            expect(system.listByTrainer('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary archers', () => {
            const { archer: a1 } = system.recruitArcher({});
            system.recruitArcher({});
            system.legendArcher(a1.archerId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendaries', () => {
            system.recruitArcher({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addArrow', () => {
        it('should add arrow', () => {
            const { archer } = system.recruitArcher({});
            system.addArrow(archer.archerId, 'flame');
            expect(archer.arrows).toContain('flame');
        });

        it('should add multiple arrows', () => {
            const { archer } = system.recruitArcher({});
            system.addArrow(archer.archerId, 'flame');
            system.addArrow(archer.archerId, 'ice');
            expect(archer.arrows.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addArrow('ghost', 'flame');
            expect(result.error).toBe('ARCHER_NOT_FOUND');
        });

        it('should trigger arrowAdded hook', () => {
            const { archer } = system.recruitArcher({});
            let called = false;
            system.registerHook('arrowAdded', () => { called = true; });
            system.addArrow(archer.archerId, 'flame');
            expect(called).toBe(true);
        });
    });

    describe('improveAccuracy', () => {
        it('should improve accuracy with default amount', () => {
            const { archer } = system.recruitArcher({});
            system.improveAccuracy(archer.archerId);
            expect(archer.accuracy).toBe(75);
        });

        it('should improve accuracy with custom amount', () => {
            const { archer } = system.recruitArcher({});
            system.improveAccuracy(archer.archerId, 10);
            expect(archer.accuracy).toBe(80);
        });

        it('should reject missing', () => {
            const result = system.improveAccuracy('ghost', 10);
            expect(result.error).toBe('ARCHER_NOT_FOUND');
        });

        it('should trigger accuracyImproved hook', () => {
            const { archer } = system.recruitArcher({});
            let called = false;
            system.registerHook('accuracyImproved', () => { called = true; });
            system.improveAccuracy(archer.archerId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpArcher', () => {
        it('should level up', () => {
            const { archer } = system.recruitArcher({});
            system.levelUpArcher(archer.archerId);
            expect(archer.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { archer } = system.recruitArcher({});
            system.levelUpArcher(archer.archerId);
            system.levelUpArcher(archer.archerId);
            expect(archer.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpArcher('ghost');
            expect(result.error).toBe('ARCHER_NOT_FOUND');
        });

        it('should trigger archerLeveledUp hook', () => {
            const { archer } = system.recruitArcher({});
            let called = false;
            system.registerHook('archerLeveledUp', () => { called = true; });
            system.levelUpArcher(archer.archerId);
            expect(called).toBe(true);
        });
    });

    describe('legendArcher', () => {
        it('should set status to legendary', () => {
            const { archer } = system.recruitArcher({});
            system.legendArcher(archer.archerId);
            expect(archer.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendArcher('ghost');
            expect(result.error).toBe('ARCHER_NOT_FOUND');
        });

        it('should trigger archerLegendized hook', () => {
            const { archer } = system.recruitArcher({});
            let called = false;
            system.registerHook('archerLegendized', () => { called = true; });
            system.legendArcher(archer.archerId);
            expect(called).toBe(true);
        });
    });

    describe('calculateArcherValue', () => {
        it('should calculate base value', () => {
            const { archer } = system.recruitArcher({});
            // level(1)*100 + accuracy(70)*2 + arrows(0)*30 = 100 + 140 + 0 = 240
            expect(system.calculateArcherValue(archer.archerId)).toBe(240);
        });

        it('should include arrow value', () => {
            const { archer } = system.recruitArcher({ arrows: ['a', 'b', 'c'] });
            // level(1)*100 + accuracy(70)*2 + arrows(3)*30 = 100 + 140 + 90 = 330
            expect(system.calculateArcherValue(archer.archerId)).toBe(330);
        });

        it('should include level in value', () => {
            const { archer } = system.recruitArcher({});
            system.levelUpArcher(archer.archerId);
            // level(2)*100 + accuracy(70)*2 + arrows(0)*30 = 200 + 140 + 0 = 340
            expect(system.calculateArcherValue(archer.archerId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateArcherValue('ghost')).toBe(0);
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

        it('should execute default getArcher', () => {
            const result = system.executeTool('getArcher', { archerId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitArcher', () => {
            const result = system.executeTool('recruitArcher', { name: 'Test' });
            expect(result.success).toBe(true);
            expect(result.result.archer.name).toBe('Test');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('archerRecruited', () => count++);
            unregister();
            system.recruitArcher({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('archerRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitArcher({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalArchers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalArchers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitArcher({});
            const json = system.toJSON();
            expect(json.archers.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitArcher({});
            const json = system.toJSON();
            const newSys = new CultivationArcher();
            newSys.fromJSON(json);
            expect(newSys.archers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.archerCount).toBe(0);
        });

        it('should reflect added archers', () => {
            system.recruitArcher({});
            const stats = system.getStats();
            expect(stats.archerCount).toBe(1);
        });
    });
});
