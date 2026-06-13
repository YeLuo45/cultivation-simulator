/**
 * TreasureVault.test.js - 宝库系统测试
 * V502 Iteration 4/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TreasureVault } from '../../../systems/ai/TreasureVault.js';

describe('TreasureVault', () => {
    let system;
    beforeEach(() => { system = new TreasureVault(); });

    describe('openVault', () => {
        it('should open', () => {
            const { vault } = system.openVault({ ownerId: 'o1', name: 'DragonHoard' });
            expect(vault.ownerId).toBe('o1');
            expect(vault.name).toBe('DragonHoard');
        });

        it('should default status to locked', () => {
            const { vault } = system.openVault({});
            expect(vault.status).toBe('locked');
        });

        it('should default gold to baseGold', () => {
            const { vault } = system.openVault({});
            expect(vault.gold).toBe(1000);
        });

        it('should trigger vaultOpened hook', () => {
            let called = false;
            system.registerHook('vaultOpened', () => { called = true; });
            system.openVault({});
            expect(called).toBe(true);
        });
    });

    describe('getVault', () => {
        it('should return', () => {
            const { vault } = system.openVault({});
            expect(system.getVault(vault.vaultId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getVault('ghost')).toBeNull(); });
    });

    describe('listVaults', () => {
        it('should list all', () => {
            system.openVault({});
            expect(system.listVaults().length).toBe(1);
        });

        it('should return empty initially', () => {
            expect(system.listVaults().length).toBe(0);
        });
    });

    describe('listByOwner', () => {
        it('should filter', () => {
            system.openVault({ ownerId: 'o1' });
            system.openVault({ ownerId: 'o2' });
            expect(system.listByOwner('o1').length).toBe(1);
        });

        it('should return empty for unknown owner', () => {
            system.openVault({ ownerId: 'o1' });
            expect(system.listByOwner('ghost').length).toBe(0);
        });
    });

    describe('listUnlocked', () => {
        it('should filter unlocked vaults', () => {
            const { vault: v1 } = system.openVault({});
            const { vault: v2 } = system.openVault({});
            system.unlockVault(v1.vaultId);
            const result = system.listUnlocked();
            expect(result.length).toBe(1);
            expect(result[0].vaultId).toBe(v1.vaultId);
            expect(v2.status).toBe('locked');
        });

        it('should return empty when none unlocked', () => {
            system.openVault({});
            expect(system.listUnlocked().length).toBe(0);
        });
    });

    describe('depositGold', () => {
        it('should deposit', () => {
            const { vault } = system.openVault({});
            const result = system.depositGold(vault.vaultId, 500);
            expect(result.success).toBe(true);
            expect(vault.gold).toBe(1500);
        });

        it('should default amount to 100', () => {
            const { vault } = system.openVault({});
            system.depositGold(vault.vaultId);
            expect(vault.gold).toBe(1100);
        });

        it('should reject missing vault', () => {
            const result = system.depositGold('ghost', 100);
            expect(result.error).toBe('VAULT_NOT_FOUND');
        });

        it('should trigger goldDeposited hook', () => {
            const { vault } = system.openVault({});
            let called = false;
            system.registerHook('goldDeposited', () => { called = true; });
            system.depositGold(vault.vaultId, 100);
            expect(called).toBe(true);
        });
    });

    describe('addGem', () => {
        it('should add gem', () => {
            const { vault } = system.openVault({});
            const result = system.addGem(vault.vaultId, { type: 'ruby', value: 100 });
            expect(result.success).toBe(true);
            expect(vault.gems.length).toBe(1);
            expect(vault.gems[0].type).toBe('ruby');
        });

        it('should reject missing vault', () => {
            const result = system.addGem('ghost', { type: 'ruby' });
            expect(result.error).toBe('VAULT_NOT_FOUND');
        });

        it('should trigger gemAdded hook', () => {
            const { vault } = system.openVault({});
            let called = false;
            system.registerHook('gemAdded', () => { called = true; });
            system.addGem(vault.vaultId, { type: 'emerald' });
            expect(called).toBe(true);
        });
    });

    describe('storeArtifact', () => {
        it('should store artifact', () => {
            const { vault } = system.openVault({});
            const result = system.storeArtifact(vault.vaultId, { name: 'DragonSword', power: 9000 });
            expect(result.success).toBe(true);
            expect(vault.artifacts.length).toBe(1);
            expect(vault.artifacts[0].name).toBe('DragonSword');
        });

        it('should reject missing vault', () => {
            const result = system.storeArtifact('ghost', { name: 'Sword' });
            expect(result.error).toBe('VAULT_NOT_FOUND');
        });

        it('should trigger artifactStored hook', () => {
            const { vault } = system.openVault({});
            let called = false;
            system.registerHook('artifactStored', () => { called = true; });
            system.storeArtifact(vault.vaultId, { name: 'Spear' });
            expect(called).toBe(true);
        });
    });

    describe('unlockVault', () => {
        it('should unlock', () => {
            const { vault } = system.openVault({});
            const result = system.unlockVault(vault.vaultId);
            expect(result.success).toBe(true);
            expect(vault.status).toBe('unlocked');
        });

        it('should reject missing vault', () => {
            const result = system.unlockVault('ghost');
            expect(result.error).toBe('VAULT_NOT_FOUND');
        });

        it('should trigger vaultUnlocked hook', () => {
            const { vault } = system.openVault({});
            let called = false;
            system.registerHook('vaultUnlocked', () => { called = true; });
            system.unlockVault(vault.vaultId);
            expect(called).toBe(true);
        });
    });

    describe('calculateVaultValue', () => {
        it('should calculate base value with just gold', () => {
            const { vault } = system.openVault({ gold: 1000 });
            expect(system.calculateVaultValue(vault.vaultId)).toBe(1000);
        });

        it('should add gems value (500 each)', () => {
            const { vault } = system.openVault({ gold: 1000 });
            system.addGem(vault.vaultId, { type: 'ruby' });
            system.addGem(vault.vaultId, { type: 'sapphire' });
            expect(system.calculateVaultValue(vault.vaultId)).toBe(1000 + 2 * 500);
        });

        it('should add artifacts value (2000 each)', () => {
            const { vault } = system.openVault({ gold: 1000 });
            system.storeArtifact(vault.vaultId, { name: 'Sword' });
            expect(system.calculateVaultValue(vault.vaultId)).toBe(1000 + 2000);
        });

        it('should combine gold + gems + artifacts', () => {
            const { vault } = system.openVault({ gold: 500 });
            system.addGem(vault.vaultId, { type: 'ruby' });
            system.addGem(vault.vaultId, { type: 'sapphire' });
            system.storeArtifact(vault.vaultId, { name: 'Crown' });
            expect(system.calculateVaultValue(vault.vaultId)).toBe(500 + 2 * 500 + 1 * 2000);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateVaultValue('ghost')).toBe(0);
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

        it('should execute default openVault', () => {
            const result = system.executeTool('openVault', { ownerId: 'o1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('vaultOpened', () => count++);
            unregister();
            system.openVault({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('vaultOpened', () => { throw new Error('x'); });
            expect(() => system.openVault({})).not.toThrow();
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
            system.openVault({});
            const json = system.toJSON();
            expect(json.vaults.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openVault({});
            const json = system.toJSON();
            const newSys = new TreasureVault();
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
