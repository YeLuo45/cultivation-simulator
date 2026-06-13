/**
 * CultivationKnight.test.js - 修真骑士测试
 * V602 Iteration 5/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationKnight } from '../../../systems/ai/CultivationKnight.js';

describe('CultivationKnight', () => {
    let system;
    beforeEach(() => { system = new CultivationKnight(); });

    describe('recruitKnight', () => {
        it('should recruit', () => {
            const { knight } = system.recruitKnight({ commanderId: 'c1', name: 'Sir Lancelot', type: 'heavy' });
            expect(knight.commanderId).toBe('c1');
            expect(knight.name).toBe('Sir Lancelot');
            expect(knight.type).toBe('heavy');
            expect(knight.defense).toBe(20);
            expect(knight.level).toBe(1);
            expect(knight.status).toBe('novice');
            expect(knight.mounts).toEqual([]);
        });

        it('should use defaults when not provided', () => {
            const { knight } = system.recruitKnight({});
            expect(knight.name).toBe('Anonymous Knight');
            expect(knight.type).toBe('medium');
        });

        it('should use provided defense', () => {
            const { knight } = system.recruitKnight({ defense: 75 });
            expect(knight.defense).toBe(75);
        });

        it('should use provided mounts', () => {
            const { knight } = system.recruitKnight({ mounts: ['Stallion'] });
            expect(knight.mounts).toEqual(['Stallion']);
        });

        it('should trigger knightRecruited hook', () => {
            let called = false;
            system.registerHook('knightRecruited', () => { called = true; });
            system.recruitKnight({});
            expect(called).toBe(true);
        });

        it('should increment totalKnights stat', () => {
            system.recruitKnight({});
            system.recruitKnight({});
            expect(system.stats.totalKnights).toBe(2);
        });
    });

    describe('getKnight', () => {
        it('should return', () => {
            const { knight } = system.recruitKnight({});
            expect(system.getKnight(knight.knightId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getKnight('ghost')).toBeNull(); });
        it('should return a copy (not internal reference)', () => {
            const { knight } = system.recruitKnight({});
            const retrieved = system.getKnight(knight.knightId);
            retrieved.name = 'Modified';
            expect(system.knights.get(knight.knightId).name).toBe('Anonymous Knight');
        });
    });

    describe('listKnights', () => {
        it('should list all', () => {
            system.recruitKnight({});
            system.recruitKnight({});
            expect(system.listKnights().length).toBe(2);
        });
        it('should return empty array when no knights', () => {
            expect(system.listKnights()).toEqual([]);
        });
    });

    describe('listByCommander', () => {
        it('should filter', () => {
            system.recruitKnight({ commanderId: 'c1' });
            system.recruitKnight({ commanderId: 'c2' });
            expect(system.listByCommander('c1').length).toBe(1);
        });
        it('should return empty for unknown commander', () => {
            system.recruitKnight({ commanderId: 'c1' });
            expect(system.listByCommander('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { knight } = system.recruitKnight({});
            system.legendKnight(knight.knightId);
            system.recruitKnight({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addMount', () => {
        it('should add mount', () => {
            const { knight } = system.recruitKnight({});
            system.addMount(knight.knightId, 'War Horse');
            expect(knight.mounts).toContain('War Horse');
            expect(knight.mounts.length).toBe(1);
        });

        it('should add multiple mounts', () => {
            const { knight } = system.recruitKnight({});
            system.addMount(knight.knightId, 'Stallion');
            system.addMount(knight.knightId, 'Griffin');
            expect(knight.mounts.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addMount('ghost', 'Pegasus');
            expect(result.error).toBe('KNIGHT_NOT_FOUND');
        });

        it('should trigger mountAdded hook', () => {
            const { knight } = system.recruitKnight({});
            let called = false;
            system.registerHook('mountAdded', () => { called = true; });
            system.addMount(knight.knightId, 'Unicorn');
            expect(called).toBe(true);
        });
    });

    describe('raiseDefense', () => {
        it('should raise with amount', () => {
            const { knight } = system.recruitKnight({});
            system.raiseDefense(knight.knightId, 15);
            expect(knight.defense).toBe(35);
        });

        it('should raise with default amount', () => {
            const { knight } = system.recruitKnight({});
            system.raiseDefense(knight.knightId);
            expect(knight.defense).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseDefense('ghost', 10);
            expect(result.error).toBe('KNIGHT_NOT_FOUND');
        });

        it('should trigger defenseRaised hook', () => {
            const { knight } = system.recruitKnight({});
            let called = false;
            system.registerHook('defenseRaised', () => { called = true; });
            system.raiseDefense(knight.knightId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpKnight', () => {
        it('should level up', () => {
            const { knight } = system.recruitKnight({});
            system.levelUpKnight(knight.knightId);
            expect(knight.level).toBe(2);
        });

        it('should promote to veteran at level 5', () => {
            const { knight } = system.recruitKnight({});
            for (let i = 0; i < 4; i++) system.levelUpKnight(knight.knightId);
            expect(knight.level).toBe(5);
            expect(knight.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpKnight('ghost');
            expect(result.error).toBe('KNIGHT_NOT_FOUND');
        });

        it('should trigger knightLeveledUp hook', () => {
            const { knight } = system.recruitKnight({});
            let called = false;
            system.registerHook('knightLeveledUp', () => { called = true; });
            system.levelUpKnight(knight.knightId);
            expect(called).toBe(true);
        });
    });

    describe('legendKnight', () => {
        it('should legendize', () => {
            const { knight } = system.recruitKnight({});
            system.legendKnight(knight.knightId);
            expect(knight.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendKnight('ghost');
            expect(result.error).toBe('KNIGHT_NOT_FOUND');
        });

        it('should trigger knightLegendized hook', () => {
            const { knight } = system.recruitKnight({});
            let called = false;
            system.registerHook('knightLegendized', () => { called = true; });
            system.legendKnight(knight.knightId);
            expect(called).toBe(true);
        });
    });

    describe('calculateKnightValue', () => {
        it('should calculate', () => {
            const { knight } = system.recruitKnight({});
            system.levelUpKnight(knight.knightId);
            system.raiseDefense(knight.knightId, 5);
            system.addMount(knight.knightId, 'War Horse');
            // level=2, defense=25, mounts.length=1 => 2*100 + 25*2 + 1*30 = 200+50+30 = 280
            expect(system.calculateKnightValue(knight.knightId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateKnightValue('ghost')).toBe(0);
        });

        it('should return base value for new knight', () => {
            const { knight } = system.recruitKnight({});
            // level=1, defense=20, mounts.length=0 => 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateKnightValue(knight.knightId)).toBe(140);
        });
    });

    describe('listVeterans', () => {
        it('should filter', () => {
            const { knight } = system.recruitKnight({});
            for (let i = 0; i < 4; i++) system.levelUpKnight(knight.knightId);
            system.recruitKnight({});
            expect(system.listVeterans().length).toBe(1);
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

        it('should execute default getKnight', () => {
            const result = system.executeTool('getKnight', { knightId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('knightRecruited', () => count++);
            unregister();
            system.recruitKnight({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('knightRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitKnight({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalKnights = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalKnights = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitKnight({});
            const json = system.toJSON();
            expect(json.knights.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitKnight({});
            const json = system.toJSON();
            const newSys = new CultivationKnight();
            newSys.fromJSON(json);
            expect(newSys.knights.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.knightCount).toBe(0);
        });
    });
});
