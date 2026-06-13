/**
 * SectEnemy.test.js - 宗门宿敌测试
 * V496 Iteration 13/15 Round 19 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectEnemy } from '../../../systems/ai/SectEnemy.js';

describe('SectEnemy', () => {
    let system;
    beforeEach(() => { system = new SectEnemy(); });

    describe('declareEnemy', () => {
        it('should declare', () => {
            const { enemy } = system.declareEnemy({ sectId: 's1', foe: 's2' });
            expect(enemy.sectId).toBe('s1');
            expect(enemy.foe).toBe('s2');
        });

        it('should use baseGrudge by default', () => {
            const { enemy } = system.declareEnemy({ sectId: 's1', foe: 's2' });
            expect(enemy.grudge).toBe(10);
        });

        it('should trigger enemyDeclared hook', () => {
            let called = false;
            system.registerHook('enemyDeclared', () => { called = true; });
            system.declareEnemy({ sectId: 's1', foe: 's2' });
            expect(called).toBe(true);
        });
    });

    describe('getEnemy', () => {
        it('should return', () => {
            const { enemy } = system.declareEnemy({ sectId: 's1', foe: 's2' });
            expect(system.getEnemy(enemy.enemyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getEnemy('ghost')).toBeNull(); });
    });

    describe('listEnemies', () => {
        it('should list all', () => {
            system.declareEnemy({ sectId: 's1', foe: 's2' });
            expect(system.listEnemies().length).toBe(1);
        });
    });

    describe('listBySect', () => {
        it('should filter by sectId', () => {
            system.declareEnemy({ sectId: 's1', foe: 's2' });
            system.declareEnemy({ sectId: 's2', foe: 's3' });
            expect(system.listBySect('s1').length).toBe(1);
        });

        it('should filter by foe', () => {
            system.declareEnemy({ sectId: 's1', foe: 's2' });
            system.declareEnemy({ sectId: 's3', foe: 's4' });
            expect(system.listBySect('s2').length).toBe(1);
        });
    });

    describe('listTense', () => {
        it('should filter tense and escalating', () => {
            system.declareEnemy({ sectId: 's1', foe: 's2' });
            const { enemy } = system.declareEnemy({ sectId: 's3', foe: 's4' });
            system.makePeace(enemy.enemyId);
            expect(system.listTense().length).toBe(1);
        });
    });

    describe('deepenGrudge', () => {
        it('should deepen default 5', () => {
            const { enemy } = system.declareEnemy({ sectId: 's1', foe: 's2' });
            system.deepenGrudge(enemy.enemyId);
            expect(enemy.grudge).toBe(15);
        });

        it('should deepen custom amount', () => {
            const { enemy } = system.declareEnemy({ sectId: 's1', foe: 's2' });
            system.deepenGrudge(enemy.enemyId, 20);
            expect(enemy.grudge).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.deepenGrudge('ghost', 10);
            expect(result.error).toBe('ENEMY_NOT_FOUND');
        });

        it('should trigger grudgeDeepened hook', () => {
            const { enemy } = system.declareEnemy({ sectId: 's1', foe: 's2' });
            let called = false;
            system.registerHook('grudgeDeepened', () => { called = true; });
            system.deepenGrudge(enemy.enemyId, 5);
            expect(called).toBe(true);
        });
    });

    describe('recordBattle', () => {
        it('should record', () => {
            const { enemy } = system.declareEnemy({ sectId: 's1', foe: 's2' });
            system.recordBattle(enemy.enemyId, { type: 'raid', outcome: 'won' });
            expect(enemy.battles.length).toBe(1);
        });

        it('should set status to escalating when first battle recorded', () => {
            const { enemy } = system.declareEnemy({ sectId: 's1', foe: 's2' });
            system.recordBattle(enemy.enemyId, { type: 'skirmish' });
            expect(enemy.status).toBe('escalating');
        });

        it('should reject missing', () => {
            const result = system.recordBattle('ghost', { type: 'raid' });
            expect(result.error).toBe('ENEMY_NOT_FOUND');
        });

        it('should trigger battleRecorded hook', () => {
            const { enemy } = system.declareEnemy({ sectId: 's1', foe: 's2' });
            let called = false;
            system.registerHook('battleRecorded', () => { called = true; });
            system.recordBattle(enemy.enemyId, { type: 'raid' });
            expect(called).toBe(true);
        });
    });

    describe('makePeace', () => {
        it('should set status to peacemaking', () => {
            const { enemy } = system.declareEnemy({ sectId: 's1', foe: 's2' });
            system.makePeace(enemy.enemyId);
            expect(enemy.status).toBe('peacemaking');
        });

        it('should reject missing', () => {
            const result = system.makePeace('ghost');
            expect(result.error).toBe('ENEMY_NOT_FOUND');
        });

        it('should trigger peaceMade hook', () => {
            const { enemy } = system.declareEnemy({ sectId: 's1', foe: 's2' });
            let called = false;
            system.registerHook('peaceMade', () => { called = true; });
            system.makePeace(enemy.enemyId);
            expect(called).toBe(true);
        });
    });

    describe('calculateEnemyThreat', () => {
        it('should calculate', () => {
            const { enemy } = system.declareEnemy({ sectId: 's1', foe: 's2', grudge: 10 });
            system.recordBattle(enemy.enemyId, { type: 'siege' });
            system.recordBattle(enemy.enemyId, { type: 'raid' });
            // grudge(10)*10 + battles(2)*50 = 100 + 100 = 200
            expect(system.calculateEnemyThreat(enemy.enemyId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateEnemyThreat('ghost')).toBe(0);
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

        it('should execute default getEnemy', () => {
            const result = system.executeTool('getEnemy', { enemyId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('enemyDeclared', () => count++);
            unregister();
            system.declareEnemy({ sectId: 's1', foe: 's2' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('enemyDeclared', () => { throw new Error('x'); });
            expect(() => system.declareEnemy({ sectId: 's1', foe: 's2' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalEnemies = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalEnemies = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.declareEnemy({ sectId: 's1', foe: 's2' });
            const json = system.toJSON();
            expect(json.enemies.length).toBe(1);
        });
        it('should deserialize', () => {
            system.declareEnemy({ sectId: 's1', foe: 's2' });
            const json = system.toJSON();
            const newSys = new SectEnemy();
            newSys.fromJSON(json);
            expect(newSys.enemies.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.enemyCount).toBe(0);
        });
    });
});
