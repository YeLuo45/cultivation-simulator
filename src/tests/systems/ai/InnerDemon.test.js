/**
 * InnerDemon.test.js - 心魔系统测试
 * V401 Iteration 8/15 Round 13 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InnerDemon } from '../../../systems/ai/InnerDemon.js';

describe('InnerDemon', () => {
    let system;
    beforeEach(() => { system = new InnerDemon(); });

    describe('spawnDemon', () => {
        it('should spawn', () => {
            const { demon } = system.spawnDemon({ cultivatorId: 'c1' });
            expect(demon.cultivatorId).toBe('c1');
        });

        it('should use defaults', () => {
            const { demon } = system.spawnDemon({});
            expect(demon.level).toBe(1);
            expect(demon.type).toBe('greed');
            expect(demon.status).toBe('dormant');
            expect(demon.strength).toBe(20);
            expect(demon.manifestation).toBe('whisper');
            expect(demon.name).toBeDefined();
        });

        it('should respect custom fields', () => {
            const { demon } = system.spawnDemon({
                cultivatorId: 'c2',
                name: 'Wrathful',
                level: 5,
                type: 'wrath',
                strength: 100,
                manifestation: 'shadow',
                status: 'awakened',
            });
            expect(demon.name).toBe('Wrathful');
            expect(demon.level).toBe(5);
            expect(demon.type).toBe('wrath');
            expect(demon.strength).toBe(100);
            expect(demon.manifestation).toBe('shadow');
            expect(demon.status).toBe('awakened');
        });

        it('should accept explicit demonId', () => {
            const { demon } = system.spawnDemon({ demonId: 'explicit-id' });
            expect(demon.demonId).toBe('explicit-id');
        });

        it('should trigger demonSpawned hook', () => {
            let called = false;
            system.registerHook('demonSpawned', () => { called = true; });
            system.spawnDemon({});
            expect(called).toBe(true);
        });
    });

    describe('getDemon', () => {
        it('should return demon', () => {
            const { demon } = system.spawnDemon({});
            expect(system.getDemon(demon.demonId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getDemon('ghost')).toBeNull();
        });
    });

    describe('listDemons', () => {
        it('should list all', () => {
            system.spawnDemon({});
            system.spawnDemon({});
            expect(system.listDemons().length).toBe(2);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.spawnDemon({ cultivatorId: 'c1' });
            system.spawnDemon({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.spawnDemon({ type: 'greed' });
            system.spawnDemon({ type: 'wrath' });
            system.spawnDemon({ type: 'wrath' });
            expect(system.listByType('wrath').length).toBe(2);
        });
    });

    describe('listByLevel', () => {
        it('should filter by min level', () => {
            system.spawnDemon({ level: 1 });
            system.spawnDemon({ level: 5 });
            system.spawnDemon({ level: 10 });
            expect(system.listByLevel(5).length).toBe(2);
        });
    });

    describe('awakenDemon', () => {
        it('should awaken a demon', () => {
            const { demon } = system.spawnDemon({});
            const result = system.awakenDemon(demon.demonId);
            expect(result.success).toBe(true);
            expect(result.demon.status).toBe('awakened');
        });

        it('should reject missing', () => {
            const result = system.awakenDemon('ghost');
            expect(result.error).toBe('DEMON_NOT_FOUND');
        });

        it('should trigger demonAwakened hook', () => {
            const { demon } = system.spawnDemon({});
            let called = false;
            system.registerHook('demonAwakened', () => { called = true; });
            system.awakenDemon(demon.demonId);
            expect(called).toBe(true);
        });
    });

    describe('strengthenDemon', () => {
        it('should strengthen with default amount', () => {
            const { demon } = system.spawnDemon({ strength: 20 });
            system.strengthenDemon(demon.demonId);
            expect(demon.strength).toBe(25);
        });

        it('should strengthen with custom amount', () => {
            const { demon } = system.spawnDemon({ strength: 20 });
            system.strengthenDemon(demon.demonId, 30);
            expect(demon.strength).toBe(50);
        });

        it('should recompute level based on strength', () => {
            const { demon } = system.spawnDemon({ strength: 20 });
            system.strengthenDemon(demon.demonId, 40);
            expect(demon.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.strengthenDemon('ghost', 10);
            expect(result.error).toBe('DEMON_NOT_FOUND');
        });

        it('should trigger demonStrengthened hook', () => {
            const { demon } = system.spawnDemon({});
            let called = false;
            system.registerHook('demonStrengthened', () => { called = true; });
            system.strengthenDemon(demon.demonId, 5);
            expect(called).toBe(true);
        });
    });

    describe('banishDemon', () => {
        it('should banish a weak demon', () => {
            const { demon } = system.spawnDemon({ strength: 20 });
            const result = system.banishDemon(demon.demonId);
            expect(result.success).toBe(true);
            expect(result.demon.status).toBe('banished');
        });

        it('should fail to banish strong demon', () => {
            const { demon } = system.spawnDemon({ strength: 100 });
            const result = system.banishDemon(demon.demonId);
            expect(result.success).toBe(false);
            expect(result.error).toBe('TOO_STRONG_TO_BANISH');
        });

        it('should reject missing', () => {
            const result = system.banishDemon('ghost');
            expect(result.error).toBe('DEMON_NOT_FOUND');
        });

        it('should trigger demonBanished hook on success', () => {
            const { demon } = system.spawnDemon({ strength: 20 });
            let called = false;
            system.registerHook('demonBanished', () => { called = true; });
            system.banishDemon(demon.demonId);
            expect(called).toBe(true);
        });

        it('should not trigger demonBanished hook on failure', () => {
            const { demon } = system.spawnDemon({ strength: 100 });
            let called = false;
            system.registerHook('demonBanished', () => { called = true; });
            system.banishDemon(demon.demonId);
            expect(called).toBe(false);
        });
    });

    describe('calculateThreat', () => {
        it('should calculate level * strength', () => {
            const { demon } = system.spawnDemon({ level: 3, strength: 50 });
            expect(system.calculateThreat(demon.demonId)).toBe(150);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateThreat('ghost')).toBe(0);
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

        it('should execute default getDemon tool', () => {
            const result = system.executeTool('getDemon', { demonId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('demonSpawned', () => count++);
            unregister();
            system.spawnDemon({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('demonSpawned', () => { throw new Error('x'); });
            expect(() => system.spawnDemon({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDemons = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalDemons = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.spawnDemon({});
            const json = system.toJSON();
            expect(json.demons.length).toBe(1);
        });
        it('should deserialize', () => {
            system.spawnDemon({});
            const json = system.toJSON();
            const newSys = new InnerDemon();
            newSys.fromJSON(json);
            expect(newSys.demons.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.demonCount).toBe(0);
            expect(stats.totalDemons).toBe(0);
        });

        it('should reflect created demons', () => {
            system.spawnDemon({});
            system.spawnDemon({});
            const stats = system.getStats();
            expect(stats.demonCount).toBe(2);
            expect(stats.totalDemons).toBe(2);
        });
    });
});
