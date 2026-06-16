/**
 * CultivationWorld.test.js - 修真世界测试
 * V557 Iteration 20/20 FINAL Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationWorld } from '../../../systems/ai/CultivationWorld.js';

describe('CultivationWorld', () => {
    let system;
    beforeEach(() => { system = new CultivationWorld(); });

    describe('openRealm', () => {
        it('should open', () => {
            const { realm } = system.openRealm({ name: 'Jade' });
            expect(realm.name).toBe('Jade');
        });

        it('should set initial metrics', () => {
            const { realm } = system.openRealm({});
            expect(system.getMetrics(realm.realmId)).not.toBeNull();
        });

        it('should trigger realmOpened hook', () => {
            let called = false;
            system.registerHook('realmOpened', () => { called = true; });
            system.openRealm({});
            expect(called).toBe(true);
        });
    });

    describe('getRealm', () => {
        it('should return', () => {
            const { realm } = system.openRealm({});
            expect(system.getRealm(realm.realmId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRealm('ghost')).toBeNull(); });
    });

    describe('listRealms', () => {
        it('should list all', () => {
            system.openRealm({});
            expect(system.listRealms().length).toBe(1);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.openRealm({ cultivator: 'c1' });
            system.openRealm({ cultivator: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listByTier', () => {
        it('should filter', () => {
            system.openRealm({ tier: 'mortal' });
            system.openRealm({ tier: 'immortal' });
            expect(system.listByTier('mortal').length).toBe(1);
        });
    });

    describe('listByPower', () => {
        it('should filter', () => {
            system.openRealm({});
            system.openRealm({ power: 500 });
            expect(system.listByPower(200).length).toBe(1);
        });
    });

    describe('listTop', () => {
        it('should return top', () => {
            system.openRealm({});
            system.openRealm({});
            expect(system.listTop(2).length).toBe(2);
        });
    });

    describe('setMetrics', () => {
        it('should set', () => {
            const { realm } = system.openRealm({});
            const result = system.setMetrics(realm.realmId, { prosperity: 90 });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.setMetrics('ghost', {});
            expect(result.error).toBe('REALM_NOT_FOUND');
        });
    });

    describe('getMetrics', () => {
        it('should return', () => {
            const { realm } = system.openRealm({});
            expect(system.getMetrics(realm.realmId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getMetrics('ghost')).toBeNull();
        });
    });

    describe('refreshRealm', () => {
        it('should refresh', () => {
            const { realm } = system.openRealm({});
            const result = system.refreshRealm(realm.realmId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.refreshRealm('ghost');
            expect(result.error).toBe('REALM_NOT_FOUND');
        });

        it('should trigger realmRefreshed hook', () => {
            const { realm } = system.openRealm({});
            let called = false;
            system.registerHook('realmRefreshed', () => { called = true; });
            system.refreshRealm(realm.realmId);
            expect(called).toBe(true);
        });
    });

    describe('gainPower', () => {
        it('should gain', () => {
            const { realm } = system.openRealm({});
            system.gainPower(realm.realmId, 50);
            expect(realm.power).toBe(150);
        });

        it('should reject missing', () => {
            const result = system.gainPower('ghost', 5);
            expect(result.error).toBe('REALM_NOT_FOUND');
        });

        it('should trigger powerGained hook', () => {
            const { realm } = system.openRealm({});
            let called = false;
            system.registerHook('powerGained', () => { called = true; });
            system.gainPower(realm.realmId, 5);
            expect(called).toBe(true);
        });
    });

    describe('expandRealm', () => {
        it('should expand', () => {
            const { realm } = system.openRealm({});
            system.expandRealm(realm.realmId, 5);
            expect(realm.realms).toBe(6);
        });

        it('should reject missing', () => {
            const result = system.expandRealm('ghost', 5);
            expect(result.error).toBe('REALM_NOT_FOUND');
        });

        it('should trigger realmExpanded hook', () => {
            const { realm } = system.openRealm({});
            let called = false;
            system.registerHook('realmExpanded', () => { called = true; });
            system.expandRealm(realm.realmId, 5);
            expect(called).toBe(true);
        });
    });

    describe('promoteRealm', () => {
        it('should promote', () => {
            const { realm } = system.openRealm({});
            system.promoteRealm(realm.realmId);
            expect(realm.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.promoteRealm('ghost');
            expect(result.error).toBe('REALM_NOT_FOUND');
        });

        it('should trigger realmPromoted hook', () => {
            const { realm } = system.openRealm({});
            let called = false;
            system.registerHook('realmPromoted', () => { called = true; });
            system.promoteRealm(realm.realmId);
            expect(called).toBe(true);
        });
    });

    describe('changeTier', () => {
        it('should change', () => {
            const { realm } = system.openRealm({});
            system.changeTier(realm.realmId, 'immortal');
            expect(realm.tier).toBe('immortal');
        });

        it('should reject missing', () => {
            const result = system.changeTier('ghost', 'immortal');
            expect(result.error).toBe('REALM_NOT_FOUND');
        });

        it('should trigger tierChanged hook', () => {
            const { realm } = system.openRealm({});
            let called = false;
            system.registerHook('tierChanged', () => { called = true; });
            system.changeTier(realm.realmId, 'divine');
            expect(called).toBe(true);
        });
    });

    describe('closeRealm', () => {
        it('should close', () => {
            const { realm } = system.openRealm({});
            system.closeRealm(realm.realmId);
            expect(realm.status).toBe('closed');
        });

        it('should reject missing', () => {
            const result = system.closeRealm('ghost');
            expect(result.error).toBe('REALM_NOT_FOUND');
        });

        it('should trigger realmClosed hook', () => {
            const { realm } = system.openRealm({});
            let called = false;
            system.registerHook('realmClosed', () => { called = true; });
            system.closeRealm(realm.realmId);
            expect(called).toBe(true);
        });
    });

    describe('calculateWorldPower', () => {
        it('should calculate', () => {
            const { realm } = system.openRealm({});
            expect(system.calculateWorldPower(realm.realmId)).toBe(310);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateWorldPower('ghost')).toBe(0);
        });
    });

    describe('deleteRealm', () => {
        it('should delete', () => {
            const { realm } = system.openRealm({});
            const result = system.deleteRealm(realm.realmId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteRealm('ghost');
            expect(result.error).toBe('REALM_NOT_FOUND');
        });

        it('should trigger realmDeleted hook', () => {
            const { realm } = system.openRealm({});
            let called = false;
            system.registerHook('realmDeleted', () => { called = true; });
            system.deleteRealm(realm.realmId);
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
            const unregister = system.registerHook('realmOpened', () => count++);
            unregister();
            system.openRealm({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('realmOpened', () => { throw new Error('x'); });
            expect(() => system.openRealm({})).not.toThrow();
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
        });
        it('should not double evolve', () => {
            system.stats.totalRealms = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openRealm({});
            const json = system.toJSON();
            expect(json.realms.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openRealm({});
            const json = system.toJSON();
            const newSys = new CultivationWorld();
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