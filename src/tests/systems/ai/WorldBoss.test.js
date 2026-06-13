/**
 * WorldBoss.test.js - 世界Boss测试
 * V390 Iteration 6/9 Round 12 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WorldBoss } from '../../../systems/ai/WorldBoss.js';

describe('WorldBoss', () => {
    let system;
    beforeEach(() => { system = new WorldBoss(); });

    describe('spawnBoss', () => {
        it('should spawn', () => {
            const { boss } = system.spawnBoss({ name: 'B1' });
            expect(boss.name).toBe('B1');
        });

        it('should trigger bossSpawned hook', () => {
            let called = false;
            system.registerHook('bossSpawned', () => { called = true; });
            system.spawnBoss({});
            expect(called).toBe(true);
        });
    });

    describe('getBoss', () => {
        it('should return', () => {
            const { boss } = system.spawnBoss({});
            expect(system.getBoss(boss.bossId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBoss('ghost')).toBeNull(); });
    });

    describe('listBosses', () => {
        it('should list all', () => {
            system.spawnBoss({});
            expect(system.listBosses().length).toBe(1);
        });
    });

    describe('listAlive', () => {
        it('should filter', () => {
            const { boss } = system.spawnBoss({});
            boss.status = 'defeated';
            system.spawnBoss({});
            expect(system.listAlive().length).toBe(1);
        });
    });

    describe('listByLevel', () => {
        it('should filter', () => {
            system.spawnBoss({ level: 30 });
            system.spawnBoss({ level: 80 });
            expect(system.listByLevel(50).length).toBe(1);
        });
    });

    describe('attackBoss', () => {
        it('should attack', () => {
            const { boss } = system.spawnBoss({});
            const result = system.attackBoss(boss.bossId, 'c1', 100);
            expect(result.success).toBe(true);
        });

        it('should reduce health', () => {
            const { boss } = system.spawnBoss({ health: 1000 });
            system.attackBoss(boss.bossId, 'c1', 300);
            expect(boss.health).toBe(700);
        });

        it('should reject missing', () => {
            const result = system.attackBoss('ghost', 'c1', 100);
            expect(result.error).toBe('BOSS_NOT_FOUND');
        });

        it('should reject defeated', () => {
            const { boss } = system.spawnBoss({});
            boss.status = 'defeated';
            const result = system.attackBoss(boss.bossId, 'c1', 100);
            expect(result.error).toBe('BOSS_DEFEATED');
        });

        it('should defeat at 0 health', () => {
            const { boss } = system.spawnBoss({ health: 100 });
            system.attackBoss(boss.bossId, 'c1', 100);
            expect(boss.status).toBe('defeated');
        });

        it('should trigger bossAttacked hook', () => {
            const { boss } = system.spawnBoss({});
            let called = false;
            system.registerHook('bossAttacked', () => { called = true; });
            system.attackBoss(boss.bossId, 'c1', 100);
            expect(called).toBe(true);
        });

        it('should trigger bossDefeated hook', () => {
            const { boss } = system.spawnBoss({ health: 100 });
            let called = false;
            system.registerHook('bossDefeated', () => { called = true; });
            system.attackBoss(boss.bossId, 'c1', 100);
            expect(called).toBe(true);
        });
    });

    describe('getAttempt', () => {
        it('should return', () => {
            const { boss } = system.spawnBoss({});
            const { attempt } = system.attackBoss(boss.bossId, 'c1', 100);
            expect(system.getAttempt(attempt.attemptId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getAttempt('ghost')).toBeNull(); });
    });

    describe('listAttempts', () => {
        it('should list all', () => {
            const { boss } = system.spawnBoss({});
            system.attackBoss(boss.bossId, 'c1', 100);
            expect(system.listAttempts().length).toBe(1);
        });
    });

    describe('listAttemptsByBoss', () => {
        it('should filter', () => {
            const { boss: b1 } = system.spawnBoss({});
            const { boss: b2 } = system.spawnBoss({});
            system.attackBoss(b1.bossId, 'c1', 100);
            system.attackBoss(b2.bossId, 'c1', 100);
            expect(system.listAttemptsByBoss(b1.bossId).length).toBe(1);
        });
    });

    describe('listAttemptsByCultivator', () => {
        it('should filter', () => {
            const { boss } = system.spawnBoss({});
            system.attackBoss(boss.bossId, 'c1', 100);
            system.attackBoss(boss.bossId, 'c2', 100);
            expect(system.listAttemptsByCultivator('c1').length).toBe(1);
        });
    });

    describe('calculateHealthPercent', () => {
        it('should calculate', () => {
            const { boss } = system.spawnBoss({ health: 1000 });
            system.attackBoss(boss.bossId, 'c1', 250);
            expect(system.calculateHealthPercent(boss.bossId)).toBeCloseTo(0.75, 5);
        });

        it('should return null for missing', () => {
            expect(system.calculateHealthPercent('ghost')).toBeNull();
        });
    });

    describe('countAlive', () => {
        it('should count', () => {
            system.spawnBoss({});
            system.spawnBoss({});
            expect(system.countAlive()).toBe(2);
        });
    });

    describe('countDefeated', () => {
        it('should count', () => {
            const { boss } = system.spawnBoss({ health: 100 });
            system.attackBoss(boss.bossId, 'c1', 100);
            system.spawnBoss({});
            expect(system.countDefeated()).toBe(1);
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

        it('should execute default getBoss', () => {
            const result = system.executeTool('getBoss', { bossId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('bossSpawned', () => count++);
            unregister();
            system.spawnBoss({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('bossSpawned', () => { throw new Error('x'); });
            expect(() => system.spawnBoss({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBosses = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBosses = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.spawnBoss({});
            const json = system.toJSON();
            expect(json.bosses.length).toBe(1);
        });
        it('should deserialize', () => {
            system.spawnBoss({});
            const json = system.toJSON();
            const newSys = new WorldBoss();
            newSys.fromJSON(json);
            expect(newSys.bosses.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.bossCount).toBe(0);
        });
    });
});