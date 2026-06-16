/**
 * CultivationStore.test.js - 修真商店测试
 * V539 Iteration 2/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationStore } from '../../../systems/ai/CultivationStore.js';

describe('CultivationStore', () => {
    let system;
    beforeEach(() => { system = new CultivationStore(); });

    describe('openStore', () => {
        it('should open a store with defaults', () => {
            const { store } = system.openStore({ ownerId: 'o1' });
            expect(store.ownerId).toBe('o1');
            expect(store.status).toBe('open');
            expect(store.level).toBe(1);
            expect(store.sales).toBe(20);
            expect(store.inventory).toEqual([]);
        });

        it('should accept custom storeId', () => {
            const { store } = system.openStore({ storeId: 'custom', ownerId: 'o1' });
            expect(store.storeId).toBe('custom');
        });

        it('should accept custom name/type/inventory', () => {
            const { store } = system.openStore({ ownerId: 'o1', name: 'Heavenly', type: 'pill', inventory: ['a', 'b'] });
            expect(store.name).toBe('Heavenly');
            expect(store.type).toBe('pill');
            expect(store.inventory).toEqual(['a', 'b']);
        });

        it('should reject when max reached', () => {
            system.config.maxStores = 1;
            system.openStore({});
            const result = system.openStore({});
            expect(result.error).toBe('MAX_STORES_REACHED');
        });

        it('should trigger storeOpened hook', () => {
            let called = false;
            system.registerHook('storeOpened', () => { called = true; });
            system.openStore({});
            expect(called).toBe(true);
        });
    });

    describe('getStore', () => {
        it('should return store', () => {
            const { store } = system.openStore({});
            expect(system.getStore(store.storeId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getStore('ghost')).toBeNull(); });
        it('should return a copy of inventory', () => {
            const { store } = system.openStore({ inventory: ['x'] });
            const fetched = system.getStore(store.storeId);
            fetched.inventory.push('y');
            expect(store.inventory.length).toBe(1);
        });
    });

    describe('listStores', () => {
        it('should list all', () => {
            system.openStore({});
            system.openStore({});
            expect(system.listStores().length).toBe(2);
        });
        it('should return empty initially', () => {
            expect(system.listStores().length).toBe(0);
        });
    });

    describe('listByOwner', () => {
        it('should filter', () => {
            system.openStore({ ownerId: 'o1' });
            system.openStore({ ownerId: 'o2' });
            expect(system.listByOwner('o1').length).toBe(1);
        });
        it('should return empty for unknown owner', () => {
            expect(system.listByOwner('ghost').length).toBe(0);
        });
    });

    describe('listOpen', () => {
        it('should filter open stores', () => {
            const { store } = system.openStore({});
            system.openStore({});
            system.closeStore(store.storeId);
            expect(system.listOpen().length).toBe(1);
        });
    });

    describe('addInventory', () => {
        it('should add item', () => {
            const { store } = system.openStore({});
            const result = system.addInventory(store.storeId, 'sword');
            expect(result.success).toBe(true);
            expect(store.inventory).toContain('sword');
        });
        it('should reject missing', () => {
            const result = system.addInventory('ghost', 'x');
            expect(result.error).toBe('STORE_NOT_FOUND');
        });
        it('should reject closed store', () => {
            const { store } = system.openStore({});
            system.closeStore(store.storeId);
            const result = system.addInventory(store.storeId, 'x');
            expect(result.error).toBe('STORE_CLOSED');
        });
        it('should trigger inventoryAdded hook', () => {
            const { store } = system.openStore({});
            let called = false;
            system.registerHook('inventoryAdded', () => { called = true; });
            system.addInventory(store.storeId, 'pill');
            expect(called).toBe(true);
        });
    });

    describe('increaseSales', () => {
        it('should increase by default', () => {
            const { store } = system.openStore({});
            system.increaseSales(store.storeId);
            expect(store.sales).toBe(25);
        });
        it('should increase by amount', () => {
            const { store } = system.openStore({});
            system.increaseSales(store.storeId, 50);
            expect(store.sales).toBe(70);
        });
        it('should reject missing', () => {
            const result = system.increaseSales('ghost', 10);
            expect(result.error).toBe('STORE_NOT_FOUND');
        });
        it('should trigger salesIncreased hook', () => {
            const { store } = system.openStore({});
            let called = false;
            system.registerHook('salesIncreased', () => { called = true; });
            system.increaseSales(store.storeId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpStore', () => {
        it('should level up', () => {
            const { store } = system.openStore({});
            system.levelUpStore(store.storeId);
            expect(store.level).toBe(2);
        });
        it('should reject missing', () => {
            const result = system.levelUpStore('ghost');
            expect(result.error).toBe('STORE_NOT_FOUND');
        });
        it('should trigger storeLeveledUp hook', () => {
            const { store } = system.openStore({});
            let called = false;
            system.registerHook('storeLeveledUp', () => { called = true; });
            system.levelUpStore(store.storeId);
            expect(called).toBe(true);
        });
    });

    describe('closeStore', () => {
        it('should close store', () => {
            const { store } = system.openStore({});
            system.closeStore(store.storeId);
            expect(store.status).toBe('closed');
        });
        it('should reject missing', () => {
            const result = system.closeStore('ghost');
            expect(result.error).toBe('STORE_NOT_FOUND');
        });
        it('should trigger storeClosed hook', () => {
            const { store } = system.openStore({});
            let called = false;
            system.registerHook('storeClosed', () => { called = true; });
            system.closeStore(store.storeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateStoreValue', () => {
        it('should calculate value', () => {
            const { store } = system.openStore({ inventory: ['a', 'b'] });
            const value = system.calculateStoreValue(store.storeId);
            expect(value).toBe(1 * 100 + 20 * 2 + 2 * 30);
        });
        it('should return 0 for missing', () => {
            expect(system.calculateStoreValue('ghost')).toBe(0);
        });
        it('should update after level/sales changes', () => {
            const { store } = system.openStore({});
            system.levelUpStore(store.storeId);
            system.increaseSales(store.storeId, 30);
            const value = system.calculateStoreValue(store.storeId);
            expect(value).toBe(2 * 100 + 50 * 2 + 0 * 30);
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
        it('should execute default getStore', () => {
            const result = system.executeTool('getStore', { storeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('storeOpened', () => count++);
            unregister();
            system.openStore({});
            expect(count).toBe(0);
        });
        it('should handle errors silently', () => {
            system.registerHook('storeOpened', () => { throw new Error('x'); });
            expect(() => system.openStore({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalStores = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalStores = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openStore({});
            const json = system.toJSON();
            expect(json.stores.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openStore({});
            const json = system.toJSON();
            const newSys = new CultivationStore();
            newSys.fromJSON(json);
            expect(newSys.stores.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.storeCount).toBe(0);
        });
    });
});
