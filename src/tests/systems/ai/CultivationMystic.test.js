/**
 * CultivationMystic.test.js - 修真神秘测试
 * V651 Iteration 4/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMystic } from '../../../systems/ai/CultivationMystic.js';

describe('CultivationMystic', () => {
    let system;
    beforeEach(() => { system = new CultivationMystic(); });

    describe('recruitMystic', () => {
        it('should recruit a mystic', () => {
            const { mystic } = system.recruitMystic({ abbotId: 'a1', name: 'Mystic Zhao' });
            expect(mystic.abbotId).toBe('a1');
            expect(mystic.name).toBe('Mystic Zhao');
            expect(mystic.status).toBe('novice');
            expect(mystic.level).toBe(1);
            expect(mystic.type).toBe('arcane');
        });

        it('should default name and type', () => {
            const { mystic } = system.recruitMystic({});
            expect(mystic.name).toBe('Unnamed Mystic');
            expect(mystic.type).toBe('arcane');
        });

        it('should trigger mysticRecruited hook', () => {
            let called = false;
            system.registerHook('mysticRecruited', () => { called = true; });
            system.recruitMystic({});
            expect(called).toBe(true);
        });

        it('should increment totalMystics stat', () => {
            system.recruitMystic({});
            system.recruitMystic({});
            expect(system.stats.totalMystics).toBe(2);
        });
    });

    describe('getMystic', () => {
        it('should return a mystic', () => {
            const { mystic } = system.recruitMystic({});
            expect(system.getMystic(mystic.mysticId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getMystic('ghost')).toBeNull();
        });
    });

    describe('listMystics', () => {
        it('should list all', () => {
            system.recruitMystic({});
            system.recruitMystic({});
            expect(system.listMystics().length).toBe(2);
        });
        it('should return empty array when none', () => {
            expect(system.listMystics().length).toBe(0);
        });
    });

    describe('listByAbbot', () => {
        it('should filter by abbot', () => {
            system.recruitMystic({ abbotId: 'a1' });
            system.recruitMystic({ abbotId: 'a2' });
            expect(system.listByAbbot('a1').length).toBe(1);
        });
        it('should return empty for unknown abbot', () => {
            system.recruitMystic({ abbotId: 'a1' });
            expect(system.listByAbbot('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { mystic: m1 } = system.recruitMystic({});
            system.recruitMystic({});
            system.legendMystic(m1.mysticId);
            expect(system.listLegendary().length).toBe(1);
        });
        it('should return empty when none legendary', () => {
            system.recruitMystic({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addRune', () => {
        it('should add rune', () => {
            const { mystic } = system.recruitMystic({});
            system.addRune(mystic.mysticId, 'rune-of-fire');
            expect(mystic.runes.length).toBe(1);
            expect(mystic.runes[0]).toBe('rune-of-fire');
        });

        it('should reject missing', () => {
            const result = system.addRune('ghost', 'x');
            expect(result.error).toBe('MYSTIC_NOT_FOUND');
        });

        it('should trigger runeAdded hook', () => {
            const { mystic } = system.recruitMystic({});
            let called = false;
            system.registerHook('runeAdded', () => { called = true; });
            system.addRune(mystic.mysticId, 'rune-of-water');
            expect(called).toBe(true);
        });
    });

    describe('deepenMystery', () => {
        it('should deepen mystery with default amount', () => {
            const { mystic } = system.recruitMystic({});
            system.deepenMystery(mystic.mysticId);
            expect(mystic.mystery).toBe(25);
        });

        it('should deepen mystery with custom amount', () => {
            const { mystic } = system.recruitMystic({});
            system.deepenMystery(mystic.mysticId, 10);
            expect(mystic.mystery).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.deepenMystery('ghost', 5);
            expect(result.error).toBe('MYSTIC_NOT_FOUND');
        });

        it('should trigger mysteryDeepened hook', () => {
            const { mystic } = system.recruitMystic({});
            let called = false;
            system.registerHook('mysteryDeepened', () => { called = true; });
            system.deepenMystery(mystic.mysticId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMystic', () => {
        it('should level up', () => {
            const { mystic } = system.recruitMystic({});
            system.levelUpMystic(mystic.mysticId);
            expect(mystic.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { mystic } = system.recruitMystic({});
            system.levelUpMystic(mystic.mysticId);
            system.levelUpMystic(mystic.mysticId);
            system.levelUpMystic(mystic.mysticId);
            expect(mystic.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpMystic('ghost');
            expect(result.error).toBe('MYSTIC_NOT_FOUND');
        });

        it('should trigger mysticLeveledUp hook', () => {
            const { mystic } = system.recruitMystic({});
            let called = false;
            system.registerHook('mysticLeveledUp', () => { called = true; });
            system.levelUpMystic(mystic.mysticId);
            expect(called).toBe(true);
        });
    });

    describe('legendMystic', () => {
        it('should set status to legendary', () => {
            const { mystic } = system.recruitMystic({});
            system.legendMystic(mystic.mysticId);
            expect(mystic.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendMystic('ghost');
            expect(result.error).toBe('MYSTIC_NOT_FOUND');
        });

        it('should trigger mysticLegendized hook', () => {
            const { mystic } = system.recruitMystic({});
            let called = false;
            system.registerHook('mysticLegendized', () => { called = true; });
            system.legendMystic(mystic.mysticId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMysticValue', () => {
        it('should calculate value', () => {
            const { mystic } = system.recruitMystic({});
            system.addRune(mystic.mysticId, 'r1');
            // level=1, mystery=20 (default baseMystery), runes=1
            // 1*100 + 20*2 + 1*30 = 100 + 40 + 30 = 170
            expect(system.calculateMysticValue(mystic.mysticId)).toBe(170);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMysticValue('ghost')).toBe(0);
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

        it('should default context to empty object', () => {
            system.registerTool('test', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('test', null);
            expect(result.result).toBe(0);
        });

        it('should execute default getMystic tool', () => {
            const result = system.executeTool('getMystic', { mysticId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitMystic tool', () => {
            const result = system.executeTool('recruitMystic', { abbotId: 'a1', name: 'ToolMystic' });
            expect(result.success).toBe(true);
            expect(result.result.mystic.name).toBe('ToolMystic');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('mysticRecruited', () => count++);
            unregister();
            system.recruitMystic({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('mysticRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMystic({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMystics = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxMystics).toBe(45);
        });
        it('should not double evolve', () => {
            system.stats.totalMystics = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitMystic({});
            const json = system.toJSON();
            expect(json.mystics.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitMystic({});
            const json = system.toJSON();
            const newSys = new CultivationMystic();
            newSys.fromJSON(json);
            expect(newSys.mystics.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.mysticCount).toBe(0);
            expect(stats.totalMystics).toBe(0);
        });
    });
});
