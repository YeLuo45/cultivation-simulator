/**
 * CultivationDuelist.test.js - 修真决斗者测试
 * V546 Iteration 9/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDuelist } from '../../../systems/ai/CultivationDuelist.js';

describe('CultivationDuelist', () => {
    let system;
    beforeEach(() => { system = new CultivationDuelist(); });

    describe('registerDuelist', () => {
        it('should register with default values', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            expect(duelist.duelistId).toBeDefined();
            expect(duelist.cultivatorId).toBe('c1');
            expect(duelist.name).toBe('Unnamed Duelist');
            expect(duelist.type).toBe('sword');
            expect(duelist.skill).toBe(20);
            expect(duelist.victories).toEqual([]);
            expect(duelist.level).toBe(1);
            expect(duelist.status).toBe('rookie');
        });

        it('should accept custom name', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1', name: 'Sword Saint' });
            expect(duelist.name).toBe('Sword Saint');
        });

        it('should accept blade type', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1', type: 'blade' });
            expect(duelist.type).toBe('blade');
        });

        it('should accept fist type', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1', type: 'fist' });
            expect(duelist.type).toBe('fist');
        });

        it('should respect custom skill', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1', skill: 80 });
            expect(duelist.skill).toBe(80);
        });

        it('should respect custom level', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1', level: 5 });
            expect(duelist.level).toBe(5);
        });

        it('should increment totalDuelists', () => {
            system.registerDuelist({ cultivatorId: 'c1' });
            expect(system.stats.totalDuelists).toBe(1);
        });

        it('should trigger duelistRegistered hook', () => {
            let called = false;
            system.registerHook('duelistRegistered', () => { called = true; });
            system.registerDuelist({ cultivatorId: 'c1' });
            expect(called).toBe(true);
        });

        it('should use provided duelistId when given', () => {
            const { duelist } = system.registerDuelist({ duelistId: 'due_custom_42', cultivatorId: 'c1' });
            expect(duelist.duelistId).toBe('due_custom_42');
        });

        it('should accept provided victories array', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1', victories: [{ opponentId: 'o1' }] });
            expect(duelist.victories.length).toBe(1);
        });

        it('should respect custom status', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1', status: 'master' });
            expect(duelist.status).toBe('master');
        });
    });

    describe('getDuelist', () => {
        it('should return duelist', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            expect(system.getDuelist(duelist.duelistId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDuelist('ghost')).toBeNull(); });
    });

    describe('listDuelists', () => {
        it('should list all', () => {
            system.registerDuelist({ cultivatorId: 'c1' });
            system.registerDuelist({ cultivatorId: 'c2' });
            expect(system.listDuelists().length).toBe(2);
        });

        it('should return empty list when no duelists', () => {
            expect(system.listDuelists().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter by cultivator', () => {
            system.registerDuelist({ cultivatorId: 'c1' });
            system.registerDuelist({ cultivatorId: 'c2' });
            system.registerDuelist({ cultivatorId: 'c1' });
            expect(system.listByCultivator('c1').length).toBe(2);
            expect(system.listByCultivator('c2').length).toBe(1);
        });

        it('should return empty for unknown cultivator', () => {
            system.registerDuelist({ cultivatorId: 'c1' });
            expect(system.listByCultivator('ghost').length).toBe(0);
        });
    });

    describe('listMasters', () => {
        it('should return master and legend duelists', () => {
            const { duelist: d1 } = system.registerDuelist({ cultivatorId: 'c1' });
            system.registerDuelist({ cultivatorId: 'c1', status: 'master' });
            system.registerDuelist({ cultivatorId: 'c1', status: 'legend' });
            system.registerDuelist({ cultivatorId: 'c1' });
            const masters = system.listMasters();
            expect(masters.length).toBe(2);
            // d1 is rookie
            expect(masters.find(m => m.duelistId === d1.duelistId)).toBeUndefined();
        });

        it('should return empty when no masters', () => {
            system.registerDuelist({ cultivatorId: 'c1' });
            expect(system.listMasters().length).toBe(0);
        });
    });

    describe('addVictory', () => {
        it('should add a victory', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            const result = system.addVictory(duelist.duelistId, { opponentId: 'p1', reward: 100 });
            expect(result.success).toBe(true);
            expect(duelist.victories.length).toBe(1);
            expect(duelist.victories[0].opponentId).toBe('p1');
            expect(duelist.victories[0].reward).toBe(100);
        });

        it('should use default reward 0', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            const { victory } = system.addVictory(duelist.duelistId, { opponentId: 'p1' });
            expect(victory.reward).toBe(0);
        });

        it('should reject missing duelist', () => {
            const result = system.addVictory('ghost', { opponentId: 'p1' });
            expect(result.error).toBe('DUELIST_NOT_FOUND');
        });

        it('should trigger victoryAdded hook', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            let called = false;
            system.registerHook('victoryAdded', () => { called = true; });
            system.addVictory(duelist.duelistId, { opponentId: 'p1' });
            expect(called).toBe(true);
        });

        it('should increment totalVictories', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            system.addVictory(duelist.duelistId, { opponentId: 'p1' });
            expect(system.stats.totalVictories).toBe(1);
        });

        it('should use provided victoryId when given', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            const { victory } = system.addVictory(duelist.duelistId, { victoryId: 'v_custom', opponentId: 'p1' });
            expect(victory.victoryId).toBe('v_custom');
        });
    });

    describe('increaseSkill', () => {
        it('should increase by default amount', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            system.increaseSkill(duelist.duelistId);
            expect(duelist.skill).toBe(25);
        });

        it('should increase by custom amount', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            system.increaseSkill(duelist.duelistId, 30);
            expect(duelist.skill).toBe(50);
        });

        it('should reject missing duelist', () => {
            const result = system.increaseSkill('ghost', 10);
            expect(result.error).toBe('DUELIST_NOT_FOUND');
        });

        it('should trigger skillIncreased hook', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            let called = false;
            system.registerHook('skillIncreased', () => { called = true; });
            system.increaseSkill(duelist.duelistId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDuelist', () => {
        it('should level up', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            system.levelUpDuelist(duelist.duelistId);
            expect(duelist.level).toBe(2);
        });

        it('should reject missing duelist', () => {
            const result = system.levelUpDuelist('ghost');
            expect(result.error).toBe('DUELIST_NOT_FOUND');
        });

        it('should trigger duelistLeveledUp hook', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            let called = false;
            system.registerHook('duelistLeveledUp', () => { called = true; });
            system.levelUpDuelist(duelist.duelistId);
            expect(called).toBe(true);
        });
    });

    describe('markLegend', () => {
        it('should mark legend', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            system.markLegend(duelist.duelistId);
            expect(duelist.status).toBe('legend');
        });

        it('should reject missing duelist', () => {
            const result = system.markLegend('ghost');
            expect(result.error).toBe('DUELIST_NOT_FOUND');
        });

        it('should trigger duelistMarkedLegend hook', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            let called = false;
            system.registerHook('duelistMarkedLegend', () => { called = true; });
            system.markLegend(duelist.duelistId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDuelistPower', () => {
        it('should calculate for new duelist', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            // level=1, skill=20, victories=0 -> 100 + 40 + 0 = 140
            expect(system.calculateDuelistPower(duelist.duelistId)).toBe(140);
        });

        it('should factor in victories', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            system.addVictory(duelist.duelistId, { opponentId: 'p1' });
            system.addVictory(duelist.duelistId, { opponentId: 'p2' });
            // level=1, skill=20, victories=2 -> 100 + 40 + 60 = 200
            expect(system.calculateDuelistPower(duelist.duelistId)).toBe(200);
        });

        it('should factor in level', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            system.levelUpDuelist(duelist.duelistId);
            system.levelUpDuelist(duelist.duelistId);
            // level=3, skill=20, victories=0 -> 300 + 40 + 0 = 340
            expect(system.calculateDuelistPower(duelist.duelistId)).toBe(340);
        });

        it('should factor in skill', () => {
            const { duelist } = system.registerDuelist({ cultivatorId: 'c1' });
            system.increaseSkill(duelist.duelistId, 30);
            // level=1, skill=50, victories=0 -> 100 + 100 + 0 = 200
            expect(system.calculateDuelistPower(duelist.duelistId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDuelistPower('ghost')).toBe(0);
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
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getDuelist', () => {
            const result = system.executeTool('getDuelist', { duelistId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle missing context with default', () => {
            system.registerTool('noctx', (ctx) => ctx);
            const result = system.executeTool('noctx');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('duelistRegistered', () => count++);
            unregister();
            system.registerDuelist({ cultivatorId: 'c1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('duelistRegistered', () => { throw new Error('x'); });
            expect(() => system.registerDuelist({ cultivatorId: 'c1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient duelists', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve after threshold', () => {
            for (let i = 0; i < 5; i++) system.registerDuelist({ cultivatorId: `c${i}` });
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });

        it('should not double evolve', () => {
            for (let i = 0; i < 5; i++) system.registerDuelist({ cultivatorId: `c${i}` });
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerDuelist({ cultivatorId: 'c1' });
            const json = system.toJSON();
            expect(json.duelists.length).toBe(1);
            expect(json.stats.totalDuelists).toBe(1);
        });

        it('should deserialize', () => {
            system.registerDuelist({ cultivatorId: 'c1' });
            const json = system.toJSON();
            const newSys = new CultivationDuelist();
            newSys.fromJSON(json);
            expect(newSys.duelists.size).toBe(1);
            expect(newSys.stats.totalDuelists).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.duelistCount).toBe(0);
            expect(stats.totalDuelists).toBe(0);
        });

        it('should reflect added duelists', () => {
            system.registerDuelist({ cultivatorId: 'c1' });
            expect(system.getStats().duelistCount).toBe(1);
        });
    });
});
