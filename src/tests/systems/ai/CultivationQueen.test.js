/**
 * CultivationQueen.test.js - 修真王后系统测试
 * V729 Iteration 22/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationQueen } from '../../../systems/ai/CultivationQueen.js';

describe('CultivationQueen', () => {
    let system;
    beforeEach(() => { system = new CultivationQueen(); });

    describe('recruitQueen', () => {
        it('should recruit a queen', () => {
            const { queen } = system.recruitQueen({ realmId: 'r1', name: 'Graceful Queen', type: 'elegant' });
            expect(queen.realmId).toBe('r1');
            expect(queen.name).toBe('Graceful Queen');
            expect(queen.type).toBe('elegant');
        });

        it('should default type to wise', () => {
            const { queen } = system.recruitQueen({ realmId: 'r1', name: 'Q' });
            expect(queen.type).toBe('wise');
        });

        it('should default grace to baseGrace', () => {
            const { queen } = system.recruitQueen({ realmId: 'r1', name: 'Q' });
            expect(queen.grace).toBe(20);
        });

        it('should start with novice status and level 1', () => {
            const { queen } = system.recruitQueen({ realmId: 'r1', name: 'Q' });
            expect(queen.status).toBe('novice');
            expect(queen.level).toBe(1);
        });

        it('should start with empty favors', () => {
            const { queen } = system.recruitQueen({ realmId: 'r1', name: 'Q' });
            expect(queen.favors).toEqual([]);
        });

        it('should support custom grace and favors', () => {
            const { queen } = system.recruitQueen({ realmId: 'r1', name: 'Q', grace: 99, favors: ['f1'] });
            expect(queen.grace).toBe(99);
            expect(queen.favors).toEqual(['f1']);
        });

        it('should trigger queenRecruited hook', () => {
            let called = false;
            system.registerHook('queenRecruited', () => { called = true; });
            system.recruitQueen({ realmId: 'r1', name: 'Q' });
            expect(called).toBe(true);
        });

        it('should generate unique queenId when not provided', () => {
            const { queen: a } = system.recruitQueen({ realmId: 'r1', name: 'A' });
            const { queen: b } = system.recruitQueen({ realmId: 'r1', name: 'B' });
            expect(a.queenId).toBeTruthy();
            expect(b.queenId).toBeTruthy();
            expect(a.queenId).not.toBe(b.queenId);
        });
    });

    describe('getQueen', () => {
        it('should return queen', () => {
            const { queen } = system.recruitQueen({ realmId: 'r1', name: 'Q' });
            const found = system.getQueen(queen.queenId);
            expect(found).not.toBeNull();
            expect(found.queenId).toBe(queen.queenId);
        });

        it('should return null for missing', () => {
            expect(system.getQueen('ghost')).toBeNull();
        });
    });

    describe('listQueens', () => {
        it('should list all', () => {
            system.recruitQueen({ realmId: 'r1', name: 'A' });
            system.recruitQueen({ realmId: 'r2', name: 'B' });
            expect(system.listQueens().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listQueens()).toEqual([]);
        });
    });

    describe('listByRealm', () => {
        it('should filter by realm', () => {
            system.recruitQueen({ realmId: 'r1', name: 'A' });
            system.recruitQueen({ realmId: 'r2', name: 'B' });
            system.recruitQueen({ realmId: 'r1', name: 'C' });
            expect(system.listByRealm('r1').length).toBe(2);
        });

        it('should return empty for unknown realm', () => {
            system.recruitQueen({ realmId: 'r1', name: 'A' });
            expect(system.listByRealm('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should return only legendary', () => {
            const { queen: a } = system.recruitQueen({ realmId: 'r1', name: 'A' });
            system.recruitQueen({ realmId: 'r1', name: 'B' });
            system.legendQueen(a.queenId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitQueen({ realmId: 'r1', name: 'A' });
            expect(system.listLegendary()).toEqual([]);
        });
    });

    describe('addFavor', () => {
        it('should add favor', () => {
            const { queen } = system.recruitQueen({ realmId: 'r1', name: 'Q' });
            system.addFavor(queen.queenId, 'golden-silk');
            expect(queen.favors).toContain('golden-silk');
        });

        it('should reject missing queen', () => {
            const result = system.addFavor('ghost', 'f');
            expect(result.error).toBe('QUEEN_NOT_FOUND');
        });

        it('should trigger favorAdded hook', () => {
            const { queen } = system.recruitQueen({ realmId: 'r1', name: 'Q' });
            let called = false;
            system.registerHook('favorAdded', () => { called = true; });
            system.addFavor(queen.queenId, 'f1');
            expect(called).toBe(true);
        });
    });

    describe('raiseGrace', () => {
        it('should raise by default 5', () => {
            const { queen } = system.recruitQueen({ realmId: 'r1', name: 'Q' });
            system.raiseGrace(queen.queenId);
            expect(queen.grace).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { queen } = system.recruitQueen({ realmId: 'r1', name: 'Q' });
            system.raiseGrace(queen.queenId, 50);
            expect(queen.grace).toBe(70);
        });

        it('should reject missing queen', () => {
            const result = system.raiseGrace('ghost', 10);
            expect(result.error).toBe('QUEEN_NOT_FOUND');
        });

        it('should trigger graceRaised hook', () => {
            const { queen } = system.recruitQueen({ realmId: 'r1', name: 'Q' });
            let called = false;
            system.registerHook('graceRaised', () => { called = true; });
            system.raiseGrace(queen.queenId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpQueen', () => {
        it('should increment level', () => {
            const { queen } = system.recruitQueen({ realmId: 'r1', name: 'Q' });
            system.levelUpQueen(queen.queenId);
            expect(queen.level).toBe(2);
        });

        it('should reject missing queen', () => {
            const result = system.levelUpQueen('ghost');
            expect(result.error).toBe('QUEEN_NOT_FOUND');
        });
    });

    describe('legendQueen', () => {
        it('should set status to legendary', () => {
            const { queen } = system.recruitQueen({ realmId: 'r1', name: 'Q' });
            system.legendQueen(queen.queenId);
            expect(queen.status).toBe('legendary');
        });

        it('should reject missing queen', () => {
            const result = system.legendQueen('ghost');
            expect(result.error).toBe('QUEEN_NOT_FOUND');
        });

        it('should trigger queenLegendized hook', () => {
            const { queen } = system.recruitQueen({ realmId: 'r1', name: 'Q' });
            let called = false;
            system.registerHook('queenLegendized', () => { called = true; });
            system.legendQueen(queen.queenId);
            expect(called).toBe(true);
        });
    });

    describe('calculateQueenValue', () => {
        it('should calculate base value', () => {
            const { queen } = system.recruitQueen({ realmId: 'r1', name: 'Q' });
            // level=1 * 100 + grace=20 * 2 + favors=0 * 30 = 140
            expect(system.calculateQueenValue(queen.queenId)).toBe(140);
        });

        it('should account for level and favors', () => {
            const { queen } = system.recruitQueen({ realmId: 'r1', name: 'Q' });
            system.levelUpQueen(queen.queenId); // 2
            system.levelUpQueen(queen.queenId); // 3
            system.addFavor(queen.queenId, 'f1');
            system.addFavor(queen.queenId, 'f2');
            system.raiseGrace(queen.queenId, 10); // 30
            // level=3 * 100 + grace=30 * 2 + favors=2 * 30 = 300+60+60=420
            expect(system.calculateQueenValue(queen.queenId)).toBe(420);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateQueenValue('ghost')).toBe(0);
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

        it('should execute default getQueen', () => {
            const result = system.executeTool('getQueen', { queenId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('queenRecruited', () => count++);
            unregister();
            system.recruitQueen({ realmId: 'r1', name: 'Q' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('queenRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitQueen({ realmId: 'r1', name: 'Q' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalQueens = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalQueens = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitQueen({ realmId: 'r1', name: 'Q' });
            const json = system.toJSON();
            expect(json.queens.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitQueen({ realmId: 'r1', name: 'Q' });
            const json = system.toJSON();
            const newSys = new CultivationQueen();
            newSys.fromJSON(json);
            expect(newSys.queens.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.queenCount).toBe(0);
        });
    });
});
