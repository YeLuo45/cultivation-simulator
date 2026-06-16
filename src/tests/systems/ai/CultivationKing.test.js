/**
 * CultivationKing.test.js - 修真国王系统测试
 * V728 Iteration 21/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationKing } from '../../../systems/ai/CultivationKing.js';

describe('CultivationKing', () => {
    let system;
    beforeEach(() => { system = new CultivationKing(); });

    describe('recruitKing', () => {
        it('should recruit a king', () => {
            const { king } = system.recruitKing({ realmId: 'r1', name: 'Sage King', type: 'wise' });
            expect(king.realmId).toBe('r1');
            expect(king.name).toBe('Sage King');
            expect(king.type).toBe('wise');
        });

        it('should default type to wise', () => {
            const { king } = system.recruitKing({ realmId: 'r1', name: 'K' });
            expect(king.type).toBe('wise');
        });

        it('should default sovereignty to baseSovereignty', () => {
            const { king } = system.recruitKing({ realmId: 'r1', name: 'K' });
            expect(king.sovereignty).toBe(20);
        });

        it('should start with novice status and level 1', () => {
            const { king } = system.recruitKing({ realmId: 'r1', name: 'K' });
            expect(king.status).toBe('novice');
            expect(king.level).toBe(1);
        });

        it('should start with empty decrees', () => {
            const { king } = system.recruitKing({ realmId: 'r1', name: 'K' });
            expect(king.decrees).toEqual([]);
        });

        it('should support custom sovereignty and decrees', () => {
            const { king } = system.recruitKing({ realmId: 'r1', name: 'K', sovereignty: 99, decrees: ['d1'] });
            expect(king.sovereignty).toBe(99);
            expect(king.decrees).toEqual(['d1']);
        });

        it('should trigger kingRecruited hook', () => {
            let called = false;
            system.registerHook('kingRecruited', () => { called = true; });
            system.recruitKing({ realmId: 'r1', name: 'K' });
            expect(called).toBe(true);
        });
    });

    describe('getKing', () => {
        it('should return king', () => {
            const { king } = system.recruitKing({ realmId: 'r1', name: 'K' });
            const found = system.getKing(king.kingId);
            expect(found).not.toBeNull();
            expect(found.kingId).toBe(king.kingId);
        });

        it('should return null for missing', () => {
            expect(system.getKing('ghost')).toBeNull();
        });
    });

    describe('listKings', () => {
        it('should list all', () => {
            system.recruitKing({ realmId: 'r1', name: 'A' });
            system.recruitKing({ realmId: 'r2', name: 'B' });
            expect(system.listKings().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listKings()).toEqual([]);
        });
    });

    describe('listByRealm', () => {
        it('should filter by realm', () => {
            system.recruitKing({ realmId: 'r1', name: 'A' });
            system.recruitKing({ realmId: 'r2', name: 'B' });
            system.recruitKing({ realmId: 'r1', name: 'C' });
            expect(system.listByRealm('r1').length).toBe(2);
        });

        it('should return empty for unknown realm', () => {
            system.recruitKing({ realmId: 'r1', name: 'A' });
            expect(system.listByRealm('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should return only legendary', () => {
            const { king: a } = system.recruitKing({ realmId: 'r1', name: 'A' });
            system.recruitKing({ realmId: 'r1', name: 'B' });
            system.legendKing(a.kingId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addDecree', () => {
        it('should add decree', () => {
            const { king } = system.recruitKing({ realmId: 'r1', name: 'K' });
            system.addDecree(king.kingId, 'no-tax');
            expect(king.decrees).toContain('no-tax');
        });

        it('should reject missing king', () => {
            const result = system.addDecree('ghost', 'd');
            expect(result.error).toBe('KING_NOT_FOUND');
        });

        it('should trigger decreeAdded hook', () => {
            const { king } = system.recruitKing({ realmId: 'r1', name: 'K' });
            let called = false;
            system.registerHook('decreeAdded', () => { called = true; });
            system.addDecree(king.kingId, 'd1');
            expect(called).toBe(true);
        });
    });

    describe('raiseSovereignty', () => {
        it('should raise by default 5', () => {
            const { king } = system.recruitKing({ realmId: 'r1', name: 'K' });
            system.raiseSovereignty(king.kingId);
            expect(king.sovereignty).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { king } = system.recruitKing({ realmId: 'r1', name: 'K' });
            system.raiseSovereignty(king.kingId, 50);
            expect(king.sovereignty).toBe(70);
        });

        it('should reject missing king', () => {
            const result = system.raiseSovereignty('ghost', 10);
            expect(result.error).toBe('KING_NOT_FOUND');
        });

        it('should trigger sovereigntyRaised hook', () => {
            const { king } = system.recruitKing({ realmId: 'r1', name: 'K' });
            let called = false;
            system.registerHook('sovereigntyRaised', () => { called = true; });
            system.raiseSovereignty(king.kingId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpKing', () => {
        it('should increment level', () => {
            const { king } = system.recruitKing({ realmId: 'r1', name: 'K' });
            system.levelUpKing(king.kingId);
            expect(king.level).toBe(2);
        });

        it('should reject missing king', () => {
            const result = system.levelUpKing('ghost');
            expect(result.error).toBe('KING_NOT_FOUND');
        });
    });

    describe('legendKing', () => {
        it('should set status to legendary', () => {
            const { king } = system.recruitKing({ realmId: 'r1', name: 'K' });
            system.legendKing(king.kingId);
            expect(king.status).toBe('legendary');
        });

        it('should reject missing king', () => {
            const result = system.legendKing('ghost');
            expect(result.error).toBe('KING_NOT_FOUND');
        });

        it('should trigger kingLegendized hook', () => {
            const { king } = system.recruitKing({ realmId: 'r1', name: 'K' });
            let called = false;
            system.registerHook('kingLegendized', () => { called = true; });
            system.legendKing(king.kingId);
            expect(called).toBe(true);
        });
    });

    describe('calculateKingValue', () => {
        it('should calculate base value', () => {
            const { king } = system.recruitKing({ realmId: 'r1', name: 'K' });
            // level=1 * 100 + sovereignty=20 * 2 + decrees=0 * 30 = 140
            expect(system.calculateKingValue(king.kingId)).toBe(140);
        });

        it('should account for level and decrees', () => {
            const { king } = system.recruitKing({ realmId: 'r1', name: 'K' });
            system.levelUpKing(king.kingId); // 2
            system.levelUpKing(king.kingId); // 3
            system.addDecree(king.kingId, 'd1');
            system.addDecree(king.kingId, 'd2');
            system.raiseSovereignty(king.kingId, 10); // 30
            // level=3 * 100 + sovereignty=30 * 2 + decrees=2 * 30 = 300+60+60=420
            expect(system.calculateKingValue(king.kingId)).toBe(420);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateKingValue('ghost')).toBe(0);
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

        it('should execute default getKing', () => {
            const result = system.executeTool('getKing', { kingId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('kingRecruited', () => count++);
            unregister();
            system.recruitKing({ realmId: 'r1', name: 'K' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('kingRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitKing({ realmId: 'r1', name: 'K' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalKings = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalKings = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitKing({ realmId: 'r1', name: 'K' });
            const json = system.toJSON();
            expect(json.kings.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitKing({ realmId: 'r1', name: 'K' });
            const json = system.toJSON();
            const newSys = new CultivationKing();
            newSys.fromJSON(json);
            expect(newSys.kings.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.kingCount).toBe(0);
        });
    });
});
