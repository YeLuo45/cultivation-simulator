/**
 * CultivationUnderworld.test.js - 修真冥界系统测试
 * V682 Iteration 5/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationUnderworld } from '../../../systems/ai/CultivationUnderworld.js';

describe('CultivationUnderworld', () => {
    let system;
    beforeEach(() => { system = new CultivationUnderworld(); });

    describe('recruitUnderworld', () => {
        it('should recruit underworld', () => {
            const { underworld } = system.recruitUnderworld({ masterId: 'm1', name: 'Dark Abyss' });
            expect(underworld.masterId).toBe('m1');
            expect(underworld.name).toBe('Dark Abyss');
        });

        it('should default type to shadow', () => {
            const { underworld } = system.recruitUnderworld({});
            expect(underworld.type).toBe('shadow');
        });

        it('should default death to baseDeath', () => {
            const { underworld } = system.recruitUnderworld({});
            expect(underworld.death).toBe(20);
        });

        it('should start at level 1', () => {
            const { underworld } = system.recruitUnderworld({});
            expect(underworld.level).toBe(1);
        });

        it('should start with novice status', () => {
            const { underworld } = system.recruitUnderworld({});
            expect(underworld.status).toBe('novice');
        });

        it('should start with empty judges', () => {
            const { underworld } = system.recruitUnderworld({});
            expect(underworld.judges).toEqual([]);
        });

        it('should generate underworldId', () => {
            const { underworld } = system.recruitUnderworld({});
            expect(underworld.underworldId).toBeDefined();
            expect(typeof underworld.underworldId).toBe('string');
        });

        it('should accept custom underworldId', () => {
            const { underworld } = system.recruitUnderworld({ underworldId: 'my-underworld' });
            expect(underworld.underworldId).toBe('my-underworld');
        });

        it('should support all types', () => {
            const { underworld: u1 } = system.recruitUnderworld({ type: 'shadow' });
            const { underworld: u2 } = system.recruitUnderworld({ type: 'ghost' });
            const { underworld: u3 } = system.recruitUnderworld({ type: 'soul' });
            expect(u1.type).toBe('shadow');
            expect(u2.type).toBe('ghost');
            expect(u3.type).toBe('soul');
        });

        it('should trigger underworldRecruited hook', () => {
            let called = false;
            system.registerHook('underworldRecruited', () => { called = true; });
            system.recruitUnderworld({});
            expect(called).toBe(true);
        });
    });

    describe('getUnderworld', () => {
        it('should return underworld', () => {
            const { underworld } = system.recruitUnderworld({});
            expect(system.getUnderworld(underworld.underworldId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getUnderworld('ghost')).toBeNull(); });
    });

    describe('listUnderworlds', () => {
        it('should list all', () => {
            system.recruitUnderworld({});
            system.recruitUnderworld({});
            expect(system.listUnderworlds().length).toBe(2);
        });

        it('should return empty when no underworlds', () => {
            expect(system.listUnderworlds().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitUnderworld({ masterId: 'm1' });
            system.recruitUnderworld({ masterId: 'm2' });
            system.recruitUnderworld({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitUnderworld({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { underworld: u1 } = system.recruitUnderworld({});
            const { underworld: u2 } = system.recruitUnderworld({});
            system.legendUnderworld(u1.underworldId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].underworldId).toBe(u1.underworldId);
            expect(u2.status).toBe('novice');
        });

        it('should return empty when none legendary', () => {
            system.recruitUnderworld({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addJudge', () => {
        it('should add judge', () => {
            const { underworld } = system.recruitUnderworld({});
            system.addJudge(underworld.underworldId, 'Yanluo Wang');
            expect(underworld.judges).toContain('Yanluo Wang');
        });

        it('should accumulate judges', () => {
            const { underworld } = system.recruitUnderworld({});
            system.addJudge(underworld.underworldId, 'j1');
            system.addJudge(underworld.underworldId, 'j2');
            system.addJudge(underworld.underworldId, 'j3');
            expect(underworld.judges.length).toBe(3);
        });

        it('should reject missing underworld', () => {
            const result = system.addJudge('ghost', 'j');
            expect(result.error).toBe('UNDERWORLD_NOT_FOUND');
        });

        it('should trigger judgeAdded hook', () => {
            const { underworld } = system.recruitUnderworld({});
            let called = false;
            system.registerHook('judgeAdded', () => { called = true; });
            system.addJudge(underworld.underworldId, 'j');
            expect(called).toBe(true);
        });
    });

    describe('deepenDeath', () => {
        it('should deepen death by default', () => {
            const { underworld } = system.recruitUnderworld({});
            system.deepenDeath(underworld.underworldId);
            expect(underworld.death).toBe(25);
        });

        it('should deepen death by custom amount', () => {
            const { underworld } = system.recruitUnderworld({});
            system.deepenDeath(underworld.underworldId, 100);
            expect(underworld.death).toBe(120);
        });

        it('should reject missing underworld', () => {
            const result = system.deepenDeath('ghost', 10);
            expect(result.error).toBe('UNDERWORLD_NOT_FOUND');
        });

        it('should trigger deathDeepened hook', () => {
            const { underworld } = system.recruitUnderworld({});
            let called = false;
            system.registerHook('deathDeepened', () => { called = true; });
            system.deepenDeath(underworld.underworldId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpUnderworld', () => {
        it('should level up', () => {
            const { underworld } = system.recruitUnderworld({});
            system.levelUpUnderworld(underworld.underworldId);
            expect(underworld.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { underworld } = system.recruitUnderworld({});
            system.levelUpUnderworld(underworld.underworldId);
            system.levelUpUnderworld(underworld.underworldId);
            system.levelUpUnderworld(underworld.underworldId);
            expect(underworld.level).toBe(4);
        });

        it('should reject missing underworld', () => {
            const result = system.levelUpUnderworld('ghost');
            expect(result.error).toBe('UNDERWORLD_NOT_FOUND');
        });

        it('should trigger underworldLeveledUp hook', () => {
            const { underworld } = system.recruitUnderworld({});
            let called = false;
            system.registerHook('underworldLeveledUp', () => { called = true; });
            system.levelUpUnderworld(underworld.underworldId);
            expect(called).toBe(true);
        });
    });

    describe('legendUnderworld', () => {
        it('should legendize underworld', () => {
            const { underworld } = system.recruitUnderworld({});
            system.legendUnderworld(underworld.underworldId);
            expect(underworld.status).toBe('legendary');
        });

        it('should reject missing underworld', () => {
            const result = system.legendUnderworld('ghost');
            expect(result.error).toBe('UNDERWORLD_NOT_FOUND');
        });

        it('should trigger underworldLegendized hook', () => {
            const { underworld } = system.recruitUnderworld({});
            let called = false;
            system.registerHook('underworldLegendized', () => { called = true; });
            system.legendUnderworld(underworld.underworldId);
            expect(called).toBe(true);
        });
    });

    describe('calculateUnderworldValue', () => {
        it('should calculate base value', () => {
            const { underworld } = system.recruitUnderworld({});
            // level=1, death=20, judges=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculateUnderworldValue(underworld.underworldId)).toBe(140);
        });

        it('should include death in value', () => {
            const { underworld } = system.recruitUnderworld({});
            system.deepenDeath(underworld.underworldId, 100);
            // level=1, death=120, judges=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculateUnderworldValue(underworld.underworldId)).toBe(340);
        });

        it('should include judges in value', () => {
            const { underworld } = system.recruitUnderworld({});
            system.addJudge(underworld.underworldId, 'j1');
            system.addJudge(underworld.underworldId, 'j2');
            // level=1, death=20, judges=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateUnderworldValue(underworld.underworldId)).toBe(200);
        });

        it('should scale with level', () => {
            const { underworld } = system.recruitUnderworld({});
            system.levelUpUnderworld(underworld.underworldId);
            system.levelUpUnderworld(underworld.underworldId);
            // level=3, death=20, judges=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculateUnderworldValue(underworld.underworldId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateUnderworldValue('ghost')).toBe(0);
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

        it('should handle undefined context', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test');
            expect(result.success).toBe(true);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should execute default getUnderworld', () => {
            const result = system.executeTool('getUnderworld', { underworldId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitUnderworld', () => {
            const result = system.executeTool('recruitUnderworld', { masterId: 'm1' });
            expect(result.success).toBe(true);
        });

        it('should handle errors in tools', () => {
            system.registerTool('bad', () => { throw new Error('tool-failed'); });
            const result = system.executeTool('bad', {});
            expect(result.success).toBe(false);
            expect(result.error).toBe('tool-failed');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('underworldRecruited', () => count++);
            unregister();
            system.recruitUnderworld({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('underworldRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitUnderworld({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalUnderworlds = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalUnderworlds = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitUnderworld({});
            const json = system.toJSON();
            expect(json.underworlds.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitUnderworld({});
            const json = system.toJSON();
            const newSys = new CultivationUnderworld();
            newSys.fromJSON(json);
            expect(newSys.underworlds.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.underworldCount).toBe(0);
        });
    });
});
