/**
 * SecretRealmExplorer.test.js - 秘境探险系统测试
 * V334 Iteration 4/9 Round 6 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SecretRealmExplorer } from '../../../systems/ai/SecretRealmExplorer.js';

describe('SecretRealmExplorer', () => {
    let system;
    beforeEach(() => { system = new SecretRealmExplorer(); });

    describe('createRealm', () => {
        it('should create', () => {
            const { realm } = system.createRealm({ name: 'R1' });
            expect(realm.name).toBe('R1');
        });

        it('should default to uncleared', () => {
            const { realm } = system.createRealm({});
            expect(realm.cleared).toBe(false);
        });

        it('should trigger realmCreated hook', () => {
            let called = false;
            system.registerHook('realmCreated', () => { called = true; });
            system.createRealm({});
            expect(called).toBe(true);
        });
    });

    describe('getRealm', () => {
        it('should return', () => {
            const { realm } = system.createRealm({});
            expect(system.getRealm(realm.realmId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRealm('ghost')).toBeNull(); });
    });

    describe('listRealms', () => {
        it('should list all', () => {
            system.createRealm({});
            expect(system.listRealms().length).toBe(1);
        });
    });

    describe('listByTier', () => {
        it('should filter', () => {
            system.createRealm({ tier: 1 });
            system.createRealm({ tier: 3 });
            expect(system.listByTier(1).length).toBe(1);
        });
    });

    describe('startExploration', () => {
        it('should start', () => {
            const { realm } = system.createRealm({});
            const result = system.startExploration(realm.realmId, 'e1');
            expect(result.success).toBe(true);
        });

        it('should reject missing realm', () => {
            const result = system.startExploration('ghost', 'e1');
            expect(result.error).toBe('REALM_NOT_FOUND');
        });

        it('should increment totalExplorations', () => {
            const { realm } = system.createRealm({});
            system.startExploration(realm.realmId, 'e1');
            expect(system.stats.totalExplorations).toBe(1);
        });

        it('should trigger explorationStarted hook', () => {
            const { realm } = system.createRealm({});
            let called = false;
            system.registerHook('explorationStarted', () => { called = true; });
            system.startExploration(realm.realmId, 'e1');
            expect(called).toBe(true);
        });
    });

    describe('advanceExploration', () => {
        it('should advance', () => {
            const { realm } = system.createRealm({});
            const { exploration } = system.startExploration(realm.realmId, 'e1');
            const result = system.advanceExploration(exploration.expId, 20);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.advanceExploration('ghost', 20);
            expect(result.error).toBe('EXPLORATION_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { realm } = system.createRealm({});
            const { exploration } = system.startExploration(realm.realmId, 'e1');
            exploration.status = 'cleared';
            const result = system.advanceExploration(exploration.expId, 20);
            expect(result.error).toBe('EXPLORATION_INACTIVE');
        });
    });

    describe('completeExploration', () => {
        it('should complete', () => {
            const { realm } = system.createRealm({});
            const { exploration } = system.startExploration(realm.realmId, 'e1');
            exploration.progress = 100;
            const result = system.completeExploration(exploration.expId);
            expect(result.success).toBe(true);
        });

        it('should mark realm cleared', () => {
            const { realm } = system.createRealm({});
            const { exploration } = system.startExploration(realm.realmId, 'e1');
            exploration.progress = 100;
            system.completeExploration(exploration.expId);
            expect(realm.cleared).toBe(true);
        });

        it('should trigger explorationCleared hook', () => {
            const { realm } = system.createRealm({});
            const { exploration } = system.startExploration(realm.realmId, 'e1');
            exploration.progress = 100;
            let called = false;
            system.registerHook('explorationCleared', () => { called = true; });
            system.completeExploration(exploration.expId);
            expect(called).toBe(true);
        });
    });

    describe('failExploration', () => {
        it('should fail', () => {
            const { realm } = system.createRealm({});
            const { exploration } = system.startExploration(realm.realmId, 'e1');
            const result = system.failExploration(exploration.expId, 'died');
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.failExploration('ghost');
            expect(result.error).toBe('EXPLORATION_NOT_FOUND');
        });

        it('should trigger explorationFailed hook', () => {
            const { realm } = system.createRealm({});
            const { exploration } = system.startExploration(realm.realmId, 'e1');
            let called = false;
            system.registerHook('explorationFailed', () => { called = true; });
            system.failExploration(exploration.expId, 'x');
            expect(called).toBe(true);
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

        it('should execute default getRealm', () => {
            const result = system.executeTool('getRealm', { realmId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('realmCreated', () => count++);
            unregister();
            system.createRealm({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('realmCreated', () => { throw new Error('x'); });
            expect(() => system.createRealm({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCleared = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCleared = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createRealm({});
            const json = system.toJSON();
            expect(json.realms.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createRealm({});
            const json = system.toJSON();
            const newSys = new SecretRealmExplorer();
            newSys.fromJSON(json);
            expect(newSys.realms.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.realmCount).toBe(0);
        });
    });
});