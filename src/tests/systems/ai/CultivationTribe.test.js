/**
 * CultivationTribe.test.js - 修真部落系统测试
 * V592 Iteration 15/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTribe } from '../../../systems/ai/CultivationTribe.js';

describe('CultivationTribe', () => {
    let system;
    beforeEach(() => { system = new CultivationTribe(); });

    describe('formTribe', () => {
        it('should create tribe', () => {
            const { tribe } = system.formTribe({ shamanId: 's1', name: 'Wolf Clan' });
            expect(tribe.shamanId).toBe('s1');
            expect(tribe.name).toBe('Wolf Clan');
        });

        it('should default to nomadic type', () => {
            const { tribe } = system.formTribe({});
            expect(tribe.type).toBe('nomadic');
        });

        it('should default to wandering status', () => {
            const { tribe } = system.formTribe({});
            expect(tribe.status).toBe('wandering');
        });

        it('should default spirit to baseSpirit', () => {
            const { tribe } = system.formTribe({});
            expect(tribe.spirit).toBe(20);
        });

        it('should default totems to empty array', () => {
            const { tribe } = system.formTribe({});
            expect(tribe.totems).toEqual([]);
        });

        it('should respect custom type', () => {
            const { tribe } = system.formTribe({ type: 'warrior' });
            expect(tribe.type).toBe('warrior');
        });

        it('should respect provided totems', () => {
            const { tribe } = system.formTribe({ totems: ['wolf', 'bear'] });
            expect(tribe.totems.length).toBe(2);
        });

        it('should trigger tribeFormed hook', () => {
            let called = false;
            system.registerHook('tribeFormed', () => { called = true; });
            system.formTribe({});
            expect(called).toBe(true);
        });

        it('should generate tribeId if not provided', () => {
            const { tribe } = system.formTribe({});
            expect(tribe.tribeId).toBeTruthy();
        });

        it('should respect custom tribeId', () => {
            const { tribe } = system.formTribe({ tribeId: 'my-tribe' });
            expect(tribe.tribeId).toBe('my-tribe');
        });
    });

    describe('getTribe', () => {
        it('should return tribe', () => {
            const { tribe } = system.formTribe({});
            expect(system.getTribe(tribe.tribeId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getTribe('ghost')).toBeNull();
        });
    });

    describe('listTribes', () => {
        it('should list all', () => {
            system.formTribe({});
            system.formTribe({});
            expect(system.listTribes().length).toBe(2);
        });

        it('should be empty initially', () => {
            expect(system.listTribes().length).toBe(0);
        });
    });

    describe('listByShaman', () => {
        it('should filter by shaman', () => {
            system.formTribe({ shamanId: 's1' });
            system.formTribe({ shamanId: 's2' });
            expect(system.listByShaman('s1').length).toBe(1);
        });

        it('should return empty for unknown shaman', () => {
            system.formTribe({ shamanId: 's1' });
            expect(system.listByShaman('unknown').length).toBe(0);
        });
    });

    describe('listSettled', () => {
        it('should include settled tribes', () => {
            const { tribe } = system.formTribe({ status: 'settled' });
            expect(system.listSettled().length).toBe(1);
        });

        it('should include eternal tribes', () => {
            const { tribe } = system.formTribe({ status: 'eternal' });
            expect(system.listSettled().length).toBe(1);
        });

        it('should exclude wandering tribes', () => {
            system.formTribe({ status: 'wandering' });
            expect(system.listSettled().length).toBe(0);
        });
    });

    describe('addTotem', () => {
        it('should add totem', () => {
            const { tribe } = system.formTribe({});
            system.addTotem(tribe.tribeId, 'eagle');
            expect(tribe.totems).toContain('eagle');
        });

        it('should reject missing tribe', () => {
            const result = system.addTotem('ghost', 'eagle');
            expect(result.error).toBe('TRIBE_NOT_FOUND');
        });

        it('should trigger totemAdded hook', () => {
            const { tribe } = system.formTribe({});
            let called = false;
            system.registerHook('totemAdded', () => { called = true; });
            system.addTotem(tribe.tribeId, 'eagle');
            expect(called).toBe(true);
        });

        it('should support multiple totems', () => {
            const { tribe } = system.formTribe({});
            system.addTotem(tribe.tribeId, 'wolf');
            system.addTotem(tribe.tribeId, 'bear');
            expect(tribe.totems.length).toBe(2);
        });
    });

    describe('increaseSpirit', () => {
        it('should increase spirit', () => {
            const { tribe } = system.formTribe({});
            system.increaseSpirit(tribe.tribeId, 10);
            expect(tribe.spirit).toBe(30);
        });

        it('should default amount to 5', () => {
            const { tribe } = system.formTribe({});
            system.increaseSpirit(tribe.tribeId);
            expect(tribe.spirit).toBe(25);
        });

        it('should reject missing tribe', () => {
            const result = system.increaseSpirit('ghost', 10);
            expect(result.error).toBe('TRIBE_NOT_FOUND');
        });

        it('should trigger spiritIncreased hook', () => {
            const { tribe } = system.formTribe({});
            let called = false;
            system.registerHook('spiritIncreased', () => { called = true; });
            system.increaseSpirit(tribe.tribeId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpTribe', () => {
        it('should level up', () => {
            const { tribe } = system.formTribe({});
            system.levelUpTribe(tribe.tribeId);
            expect(tribe.level).toBe(2);
        });

        it('should reject missing tribe', () => {
            const result = system.levelUpTribe('ghost');
            expect(result.error).toBe('TRIBE_NOT_FOUND');
        });

        it('should trigger tribeLeveledUp hook', () => {
            const { tribe } = system.formTribe({});
            let called = false;
            system.registerHook('tribeLeveledUp', () => { called = true; });
            system.levelUpTribe(tribe.tribeId);
            expect(called).toBe(true);
        });
    });

    describe('eternalizeTribe', () => {
        it('should change status to eternal', () => {
            const { tribe } = system.formTribe({});
            system.eternalizeTribe(tribe.tribeId);
            expect(tribe.status).toBe('eternal');
        });

        it('should reject missing tribe', () => {
            const result = system.eternalizeTribe('ghost');
            expect(result.error).toBe('TRIBE_NOT_FOUND');
        });

        it('should trigger tribeEternalized hook', () => {
            const { tribe } = system.formTribe({});
            let called = false;
            system.registerHook('tribeEternalized', () => { called = true; });
            system.eternalizeTribe(tribe.tribeId);
            expect(called).toBe(true);
        });

        it('should appear in listSettled after eternalize', () => {
            const { tribe } = system.formTribe({});
            system.eternalizeTribe(tribe.tribeId);
            expect(system.listSettled().length).toBe(1);
        });
    });

    describe('calculateTribeValue', () => {
        it('should calculate', () => {
            const { tribe } = system.formTribe({});
            // level 1 * 100 + spirit 20 * 2 + totems 0 * 30 = 140
            expect(system.calculateTribeValue(tribe.tribeId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTribeValue('ghost')).toBe(0);
        });

        it('should factor in totems', () => {
            const { tribe } = system.formTribe({});
            system.addTotem(tribe.tribeId, 'wolf');
            system.addTotem(tribe.tribeId, 'bear');
            // level 1 * 100 + spirit 20 * 2 + totems 2 * 30 = 100 + 40 + 60 = 200
            expect(system.calculateTribeValue(tribe.tribeId)).toBe(200);
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

        it('should execute default getTribe', () => {
            const result = system.executeTool('getTribe', { tribeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('tribeFormed', () => count++);
            unregister();
            system.formTribe({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('tribeFormed', () => { throw new Error('x'); });
            expect(() => system.formTribe({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalTribes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalTribes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.formTribe({});
            const json = system.toJSON();
            expect(json.tribes.length).toBe(1);
        });

        it('should deserialize', () => {
            system.formTribe({});
            const json = system.toJSON();
            const newSys = new CultivationTribe();
            newSys.fromJSON(json);
            expect(newSys.tribes.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.tribeCount).toBe(0);
        });
    });
});
