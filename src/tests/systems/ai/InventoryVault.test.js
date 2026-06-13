/**
 * InventoryVault.test.js - 仓库库存测试
 * V380 Iteration 5/9 Round 11 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InventoryVault } from '../../../systems/ai/InventoryVault.js';

describe('InventoryVault', () => {
    let system;
    beforeEach(() => { system = new InventoryVault(); });

    describe('createVault', () => {
        it('should create', () => {
            const { vault } = system.createVault({ ownerId: 'o1' });
            expect(vault.ownerId).toBe('o1');
        });

        it('should trigger vaultCreated hook', () => {
            let called = false;
            system.registerHook('vaultCreated', () => { called = true; });
            system.createVault({});
            expect(called).toBe(true);
        });
    });

    describe('getVault', () => {
        it('should return', () => {
            const { vault } = system.createVault({});
            expect(system.getVault(vault.vaultId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getVault('ghost')).toBeNull(); });
    });

    describe('listVaults', () => {
        it('should list all', () => {
            system.createVault({});
            expect(system.listVaults().length).toBe(1);
        });
    });

    describe('listByOwner', () => {
        it('should filter', () => {
            system.createVault({ ownerId: 'o1' });
            system.createVault({ ownerId: 'o2' });
            expect(system.listByOwner('o1').length).toBe(1);
        });
    });

    describe('addItem', () => {
        it('should add', () => {
            const { vault } = system.createVault({});
            const result = system.addItem(vault.vaultId, 'potion', 1);
            expect(result.success).toBe(true);
        });

        it('should reject missing vault', () => {
            const result = system.addItem('ghost', 'potion');
            expect(result.error).toBe('VAULT_NOT_FOUND');
        });

        it('should reject full', () => {
            const { vault } = system.createVault({ capacity: 1 });
            system.addItem(vault.vaultId, 'potion', 1);
            const result = system.addItem(vault.vaultId, 'sword', 1);
            expect(result.error).toBe('VAULT_FULL');
        });

        it('should increment existing', () => {
            const { vault } = system.createVault({});
            system.addItem(vault.vaultId, 'potion', 1);
            system.addItem(vault.vaultId, 'potion', 1);
            expect(vault.items[0].quantity).toBe(2);
        });

        it('should trigger itemAdded hook', () => {
            const { vault } = system.createVault({});
            let called = false;
            system.registerHook('itemAdded', () => { called = true; });
            system.addItem(vault.vaultId, 'potion');
            expect(called).toBe(true);
        });
    });

    describe('removeItem', () => {
        it('should remove', () => {
            const { vault } = system.createVault({});
            system.addItem(vault.vaultId, 'potion', 5);
            const result = system.removeItem(vault.vaultId, 'potion', 2);
            expect(result.success).toBe(true);
        });

        it('should reject missing vault', () => {
            const result = system.removeItem('ghost', 'potion');
            expect(result.error).toBe('VAULT_NOT_FOUND');
        });

        it('should reject missing item', () => {
            const { vault } = system.createVault({});
            const result = system.removeItem(vault.vaultId, 'ghost');
            expect(result.error).toBe('ITEM_NOT_FOUND');
        });

        it('should reject insufficient', () => {
            const { vault } = system.createVault({});
            system.addItem(vault.vaultId, 'potion', 1);
            const result = system.removeItem(vault.vaultId, 'potion', 5);
            expect(result.error).toBe('INSUFFICIENT_QUANTITY');
        });

        it('should remove item if 0', () => {
            const { vault } = system.createVault({});
            system.addItem(vault.vaultId, 'potion', 1);
            system.removeItem(vault.vaultId, 'potion', 1);
            expect(vault.items.length).toBe(0);
        });

        it('should trigger itemRemoved hook', () => {
            const { vault } = system.createVault({});
            system.addItem(vault.vaultId, 'potion', 1);
            let called = false;
            system.registerHook('itemRemoved', () => { called = true; });
            system.removeItem(vault.vaultId, 'potion', 1);
            expect(called).toBe(true);
        });
    });

    describe('getItemQuantity', () => {
        it('should return', () => {
            const { vault } = system.createVault({});
            system.addItem(vault.vaultId, 'potion', 5);
            expect(system.getItemQuantity(vault.vaultId, 'potion')).toBe(5);
        });

        it('should return 0 for missing', () => {
            const { vault } = system.createVault({});
            expect(system.getItemQuantity(vault.vaultId, 'ghost')).toBe(0);
        });

        it('should return null for missing vault', () => {
            expect(system.getItemQuantity('ghost', 'potion')).toBeNull();
        });
    });

    describe('upgradeVault', () => {
        it('should upgrade', () => {
            const { vault } = system.createVault({});
            system.upgradeVault(vault.vaultId);
            expect(vault.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.upgradeVault('ghost');
            expect(result.error).toBe('VAULT_NOT_FOUND');
        });

        it('should trigger vaultUpgraded hook', () => {
            const { vault } = system.createVault({});
            let called = false;
            system.registerHook('vaultUpgraded', () => { called = true; });
            system.upgradeVault(vault.vaultId);
            expect(called).toBe(true);
        });
    });

    describe('transferItem', () => {
        it('should transfer', () => {
            const { vault: v1 } = system.createVault({});
            const { vault: v2 } = system.createVault({});
            system.addItem(v1.vaultId, 'potion', 5);
            const result = system.transferItem(v1.vaultId, v2.vaultId, 'potion', 3);
            expect(result.success).toBe(true);
        });

        it('should trigger itemTransferred hook', () => {
            const { vault: v1 } = system.createVault({});
            const { vault: v2 } = system.createVault({});
            system.addItem(v1.vaultId, 'potion', 5);
            let called = false;
            system.registerHook('itemTransferred', () => { called = true; });
            system.transferItem(v1.vaultId, v2.vaultId, 'potion', 3);
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

        it('should execute default getVault', () => {
            const result = system.executeTool('getVault', { vaultId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('vaultCreated', () => count++);
            unregister();
            system.createVault({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('vaultCreated', () => { throw new Error('x'); });
            expect(() => system.createVault({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalVaults = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalVaults = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createVault({});
            const json = system.toJSON();
            expect(json.vaults.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createVault({});
            const json = system.toJSON();
            const newSys = new InventoryVault();
            newSys.fromJSON(json);
            expect(newSys.vaults.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.vaultCount).toBe(0);
        });
    });
});