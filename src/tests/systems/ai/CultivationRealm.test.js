/**
 * CultivationRealm.test.js - 修真境界测试
 * V678 Iteration 18/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationRealm } from '../../../systems/ai/CultivationRealm.js';

describe('CultivationRealm', () => {
    let system;
    beforeEach(() => { system = new CultivationRealm(); });

    describe('recruitRealm', () => {
        it('should recruit a realm', () => {
            const { realm } = system.recruitRealm({ masterId: 'm1', name: 'Azure Realm', type: 'qi' });
            expect(realm.masterId).toBe('m1');
            expect(realm.name).toBe('Azure Realm');
            expect(realm.type).toBe('qi');
            expect(realm.status).toBe('novice');
            expect(realm.level).toBe(1);
        });

        it('should use defaults when not provided', () => {
            const { realm } = system.recruitRealm({});
            expect(realm.name).toBe('Unnamed Realm');
            expect(realm.type).toBe('qi');
            expect(realm.density).toBe(20);
            expect(realm.laws).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { realm } = system.recruitRealm({});
            expect(realm.realmId).toBeTruthy();
            expect(typeof realm.realmId).toBe('string');
        });

        it('should use provided realmId', () => {
            const { realm } = system.recruitRealm({ realmId: 'custom-realm-1' });
            expect(realm.realmId).toBe('custom-realm-1');
        });

        it('should trigger realmRecruited hook', () => {
            let called = false;
            system.registerHook('realmRecruited', () => { called = true; });
            system.recruitRealm({});
            expect(called).toBe(true);
        });

        it('should increment totalRealms stat', () => {
            expect(system.stats.totalRealms).toBe(0);
            system.recruitRealm({});
            expect(system.stats.totalRealms).toBe(1);
            system.recruitRealm({});
            expect(system.stats.totalRealms).toBe(2);
        });

        it('should accept foundation type', () => {
            const { realm } = system.recruitRealm({ type: 'foundation' });
            expect(realm.type).toBe('foundation');
        });

        it('should accept core type', () => {
            const { realm } = system.recruitRealm({ type: 'core' });
            expect(realm.type).toBe('core');
        });

        it('should accept nascent type', () => {
            const { realm } = system.recruitRealm({ type: 'nascent' });
            expect(realm.type).toBe('nascent');
        });
    });

    describe('getRealm', () => {
        it('should return a realm', () => {
            const { realm } = system.recruitRealm({});
            expect(system.getRealm(realm.realmId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getRealm('ghost')).toBeNull();
        });
        it('should return a copy, not a reference', () => {
            const { realm } = system.recruitRealm({});
            const got = system.getRealm(realm.realmId);
            got.name = 'Modified';
            expect(realm.name).toBe('Unnamed Realm');
        });
    });

    describe('listRealms', () => {
        it('should list all', () => {
            system.recruitRealm({});
            system.recruitRealm({});
            expect(system.listRealms().length).toBe(2);
        });

        it('should return empty list when empty', () => {
            expect(system.listRealms().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitRealm({ masterId: 'm1' });
            system.recruitRealm({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty when no match', () => {
            system.recruitRealm({ masterId: 'm1' });
            expect(system.listByMaster('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { realm: r1 } = system.recruitRealm({});
            system.recruitRealm({});
            system.legendRealm(r1.realmId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendary', () => {
            system.recruitRealm({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addLaw', () => {
        it('should add law', () => {
            const { realm } = system.recruitRealm({});
            system.addLaw(realm.realmId, 'law-of-fire');
            expect(realm.laws.length).toBe(1);
            expect(realm.laws[0]).toBe('law-of-fire');
        });

        it('should reject missing', () => {
            const result = system.addLaw('ghost', 'x');
            expect(result.error).toBe('REALM_NOT_FOUND');
        });

        it('should trigger lawAdded hook', () => {
            const { realm } = system.recruitRealm({});
            let called = false;
            system.registerHook('lawAdded', () => { called = true; });
            system.addLaw(realm.realmId, 'silence-law');
            expect(called).toBe(true);
        });

        it('should add multiple laws', () => {
            const { realm } = system.recruitRealm({});
            system.addLaw(realm.realmId, 'l1');
            system.addLaw(realm.realmId, 'l2');
            system.addLaw(realm.realmId, 'l3');
            expect(realm.laws.length).toBe(3);
        });
    });

    describe('raiseDensity', () => {
        it('should raise density', () => {
            const { realm } = system.recruitRealm({});
            system.raiseDensity(realm.realmId, 10);
            expect(realm.density).toBe(30);
        });

        it('should use default amount of 5', () => {
            const { realm } = system.recruitRealm({});
            system.raiseDensity(realm.realmId);
            expect(realm.density).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseDensity('ghost', 5);
            expect(result.error).toBe('REALM_NOT_FOUND');
        });

        it('should trigger densityRaised hook', () => {
            const { realm } = system.recruitRealm({});
            let called = false;
            system.registerHook('densityRaised', () => { called = true; });
            system.raiseDensity(realm.realmId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpRealm', () => {
        it('should level up', () => {
            const { realm } = system.recruitRealm({});
            system.levelUpRealm(realm.realmId);
            expect(realm.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { realm } = system.recruitRealm({});
            system.levelUpRealm(realm.realmId);
            system.levelUpRealm(realm.realmId);
            system.levelUpRealm(realm.realmId);
            expect(realm.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpRealm('ghost');
            expect(result.error).toBe('REALM_NOT_FOUND');
        });

        it('should trigger realmLeveledUp hook', () => {
            const { realm } = system.recruitRealm({});
            let called = false;
            system.registerHook('realmLeveledUp', () => { called = true; });
            system.levelUpRealm(realm.realmId);
            expect(called).toBe(true);
        });
    });

    describe('legendRealm', () => {
        it('should set status to legendary', () => {
            const { realm } = system.recruitRealm({});
            system.legendRealm(realm.realmId);
            expect(realm.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendRealm('ghost');
            expect(result.error).toBe('REALM_NOT_FOUND');
        });

        it('should trigger realmLegendized hook', () => {
            const { realm } = system.recruitRealm({});
            let called = false;
            system.registerHook('realmLegendized', () => { called = true; });
            system.legendRealm(realm.realmId);
            expect(called).toBe(true);
        });
    });

    describe('calculateRealmValue', () => {
        it('should calculate value', () => {
            const { realm } = system.recruitRealm({});
            system.addLaw(realm.realmId, 'law-1');
            // level=1, density=20 (default baseDensity), laws=1
            // 1*100 + 20*2 + 1*30 = 100 + 40 + 30 = 170
            expect(system.calculateRealmValue(realm.realmId)).toBe(170);
        });

        it('should reflect level and density changes', () => {
            const { realm } = system.recruitRealm({});
            system.levelUpRealm(realm.realmId);
            system.raiseDensity(realm.realmId, 10);
            // level=2, density=30, laws=0
            // 2*100 + 30*2 + 0*30 = 200 + 60 + 0 = 260
            expect(system.calculateRealmValue(realm.realmId)).toBe(260);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateRealmValue('ghost')).toBe(0);
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

        it('should default context to empty object', () => {
            system.registerTool('test', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('test', null);
            expect(result.result).toBe(0);
        });

        it('should execute default getRealm', () => {
            const result = system.executeTool('getRealm', { realmId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitRealm', () => {
            const result = system.executeTool('recruitRealm', { name: 'ToolRealm' });
            expect(result.success).toBe(true);
            expect(result.result.realm.name).toBe('ToolRealm');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('realmRecruited', () => count++);
            unregister();
            system.recruitRealm({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('realmRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitRealm({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalRealms = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalRealms = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitRealm({});
            const json = system.toJSON();
            expect(json.realms.length).toBe(1);
            expect(json.stats.totalRealms).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitRealm({});
            const json = system.toJSON();
            const newSys = new CultivationRealm();
            newSys.fromJSON(json);
            expect(newSys.realms.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.realmCount).toBe(0);
            expect(stats.totalRealms).toBe(0);
            expect(stats.evolutionCount).toBe(0);
        });
    });

    describe('Config', () => {
        it('should use default config', () => {
            expect(system.config.maxRealms).toBe(30);
            expect(system.config.baseDensity).toBe(20);
        });
        it('should accept custom config', () => {
            const custom = new CultivationRealm({ maxRealms: 60, baseDensity: 50 });
            expect(custom.config.maxRealms).toBe(60);
            expect(custom.config.baseDensity).toBe(50);
        });
    });
});
