/**
 * TreasureVaultSystem.test.js - 宝库系统测试
 * V336 Iteration 6/9 Round 6 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreasureVaultSystem } from '../../../systems/ai/TreasureVaultSystem.js';

describe('TreasureVaultSystem', () => {
    let system;
    beforeEach(() => { system = new TreasureVaultSystem(); });

    describe('createVault', () => {
        it('should create', () => {
            const { vault } = system.createVault({ name: 'V1' });
            expect(vault.name).toBe('V1');
        });

        it('should have capacity', () => {
            const { vault } = system.createVault({ capacity: 50 });
            expect(vault.capacity).toBe(50);
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

    describe('listVaultsByOwner', () => {
        it('should filter', () => {
            system.createVault({ ownerId: 'o1' });
            system.createVault({ ownerId: 'o2' });
            expect(system.listVaultsByOwner('o1').length).toBe(1);
        });
    });

    describe('addItem', () => {
        it('should add', () => {
            const { vault } = system.createVault({});
            const result = system.addItem(vault.vaultId, {});
            expect(result.success).toBe(true);
        });

        it('should reject missing vault', () => {
            const result = system.addItem('ghost', {});
            expect(result.error).toBe('VAULT_NOT_FOUND');
        });

        it('should reject full vault', () => {
            const { vault } = system.createVault({ capacity: 1 });
            system.addItem(vault.vaultId, {});
            const result = system.addItem(vault.vaultId, {});
            expect(result.error).toBe('VAULT_FULL');
        });

        it('should trigger itemStored hook', () => {
            const { vault } = system.createVault({});
            let called = false;
            system.registerHook('itemStored', () => { called = true; });
            system.addItem(vault.vaultId, {});
            expect(called).toBe(true);
        });
    });

    describe('getItem', () => {
        it('should return', () => {
            const { vault } = system.createVault({});
            const { item } = system.addItem(vault.vaultId, {});
            expect(system.getItem(item.itemId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getItem('ghost')).toBeNull(); });
    });

    describe('removeItem', () => {
        it('should remove', () => {
            const { vault } = system.createVault({});
            const { item } = system.addItem(vault.vaultId, {});
            const result = system.removeItem(item.itemId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.removeItem('ghost');
            expect(result.error).toBe('ITEM_NOT_FOUND');
        });

        it('should trigger itemRemoved hook', () => {
            const { vault } = system.createVault({});
            const { item } = system.addItem(vault.vaultId, {});
            let called = false;
            system.registerHook('itemRemoved', () => { called = true; });
            system.removeItem(item.itemId);
            expect(called).toBe(true);
        });
    });

    describe('listItems', () => {
        it('should filter by vault', () => {
            const { vault: v1 } = system.createVault({});
            const { vault: v2 } = system.createVault({});
            system.addItem(v1.vaultId, {});
            system.addItem(v2.vaultId, {});
            expect(system.listItems(v1.vaultId).length).toBe(1);
        });
    });

    describe('transferItem', () => {
        it('should transfer', () => {
            const { vault: v1 } = system.createVault({});
            const { vault: v2 } = system.createVault({});
            const { item } = system.addItem(v1.vaultId, {});
            const result = system.transferItem(item.itemId, v2.vaultId);
            expect(result.success).toBe(true);
        });

        it('should reject missing item', () => {
            const { vault } = system.createVault({});
            const result = system.transferItem('ghost', vault.vaultId);
            expect(result.error).toBe('ITEM_NOT_FOUND');
        });

        it('should reject missing target', () => {
            const { vault: v1 } = system.createVault({});
            const { item } = system.addItem(v1.vaultId, {});
            const result = system.transferItem(item.itemId, 'ghost');
            expect(result.error).toBe('VAULT_NOT_FOUND');
        });

        it('should reject full target', () => {
            const { vault: v1 } = system.createVault({});
            const { vault: v2 } = system.createVault({ capacity: 1 });
            const { item } = system.addItem(v1.vaultId, {});
            system.addItem(v2.vaultId, {});
            const result = system.transferItem(item.itemId, v2.vaultId);
            expect(result.error).toBe('TARGET_VAULT_FULL');
        });

        it('should trigger itemTransferred hook', () => {
            const { vault: v1 } = system.createVault({});
            const { vault: v2 } = system.createVault({});
            const { item } = system.addItem(v1.vaultId, {});
            let called = false;
            system.registerHook('itemTransferred', () => { called = true; });
            system.transferItem(item.itemId, v2.vaultId);
            expect(called).toBe(true);
        });
    });

    describe('calculateVaultValue', () => {
        it('should calculate', () => {
            const { vault } = system.createVault({});
            system.addItem(vault.vaultId, { value: 100 });
            system.addItem(vault.vaultId, { value: 50 });
            expect(system.calculateVaultValue(vault.vaultId)).toBe(150);
        });

        it('should return 0 for empty', () => {
            const { vault } = system.createVault({});
            expect(system.calculateVaultValue(vault.vaultId)).toBe(0);
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
            const newSys = new TreasureVaultSystem();
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