/**
 * SectTreasury.test.js - 宗门金库测试
 * V478 Iteration 10/15 Round 18 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectTreasury } from '../../../systems/ai/SectTreasury.js';

describe('SectTreasury', () => {
    let system;
    beforeEach(() => { system = new SectTreasury(); });

    describe('openTreasury', () => {
        it('should open', () => {
            const { treasury } = system.openTreasury({ sectId: 's1' });
            expect(treasury.sectId).toBe('s1');
        });

        it('should trigger treasuryOpened hook', () => {
            let called = false;
            system.registerHook('treasuryOpened', () => { called = true; });
            system.openTreasury({});
            expect(called).toBe(true);
        });
    });

    describe('getTreasury', () => {
        it('should return', () => {
            const { treasury } = system.openTreasury({});
            expect(system.getTreasury(treasury.treasuryId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTreasury('ghost')).toBeNull(); });
    });

    describe('listTreasuries', () => {
        it('should list all', () => {
            system.openTreasury({});
            expect(system.listTreasuries().length).toBe(1);
        });
    });

    describe('listBySect', () => {
        it('should filter', () => {
            system.openTreasury({ sectId: 's1' });
            system.openTreasury({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });
    });

    describe('listByStatus', () => {
        it('should filter', () => {
            system.openTreasury({ status: 'rich' });
            system.openTreasury({ status: 'poor' });
            expect(system.listByStatus('rich').length).toBe(1);
        });
    });

    describe('depositStones', () => {
        it('should deposit default amount', () => {
            const { treasury } = system.openTreasury({});
            system.depositStones(treasury.treasuryId);
            expect(treasury.spiritStones).toBe(1100);
        });

        it('should deposit custom amount', () => {
            const { treasury } = system.openTreasury({});
            system.depositStones(treasury.treasuryId, 500);
            expect(treasury.spiritStones).toBe(1500);
        });

        it('should reject missing', () => {
            const result = system.depositStones('ghost', 100);
            expect(result.error).toBe('TREASURY_NOT_FOUND');
        });

        it('should trigger stonesDeposited hook', () => {
            const { treasury } = system.openTreasury({});
            let called = false;
            system.registerHook('stonesDeposited', () => { called = true; });
            system.depositStones(treasury.treasuryId, 200);
            expect(called).toBe(true);
        });
    });

    describe('withdrawStones', () => {
        it('should withdraw default amount', () => {
            const { treasury } = system.openTreasury({});
            system.withdrawStones(treasury.treasuryId);
            expect(treasury.spiritStones).toBe(950);
        });

        it('should withdraw custom amount', () => {
            const { treasury } = system.openTreasury({});
            system.withdrawStones(treasury.treasuryId, 200);
            expect(treasury.spiritStones).toBe(800);
        });

        it('should reject missing', () => {
            const result = system.withdrawStones('ghost', 50);
            expect(result.error).toBe('TREASURY_NOT_FOUND');
        });

        it('should trigger stonesWithdrawn hook', () => {
            const { treasury } = system.openTreasury({});
            let called = false;
            system.registerHook('stonesWithdrawn', () => { called = true; });
            system.withdrawStones(treasury.treasuryId, 100);
            expect(called).toBe(true);
        });
    });

    describe('addArtifact', () => {
        it('should add artifact', () => {
            const { treasury } = system.openTreasury({});
            const result = system.addArtifact(treasury.treasuryId, { name: 'sword' });
            expect(result.success).toBe(true);
            expect(treasury.artifacts.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addArtifact('ghost', { name: 'sword' });
            expect(result.error).toBe('TREASURY_NOT_FOUND');
        });

        it('should trigger artifactAdded hook', () => {
            const { treasury } = system.openTreasury({});
            let called = false;
            system.registerHook('artifactAdded', () => { called = true; });
            system.addArtifact(treasury.treasuryId, { name: 'blade' });
            expect(called).toBe(true);
        });
    });

    describe('lockTreasury', () => {
        it('should lock to abundant', () => {
            const { treasury } = system.openTreasury({});
            system.lockTreasury(treasury.treasuryId);
            expect(treasury.status).toBe('abundant');
        });

        it('should reject missing', () => {
            const result = system.lockTreasury('ghost');
            expect(result.error).toBe('TREASURY_NOT_FOUND');
        });

        it('should trigger treasuryLocked hook', () => {
            const { treasury } = system.openTreasury({});
            let called = false;
            system.registerHook('treasuryLocked', () => { called = true; });
            system.lockTreasury(treasury.treasuryId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTreasuryValue', () => {
        it('should calculate', () => {
            const { treasury } = system.openTreasury({ gold: 50, artifacts: [{ name: 'a' }, { name: 'b' }] });
            const value = system.calculateTreasuryValue(treasury.treasuryId);
            expect(value).toBe(1000 + 50 * 10 + 2 * 1000);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTreasuryValue('ghost')).toBe(0);
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

        it('should execute default getTreasury', () => {
            const result = system.executeTool('getTreasury', { treasuryId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default openTreasury', () => {
            const result = system.executeTool('openTreasury', { sectId: 's1' });
            expect(result.result.treasury.sectId).toBe('s1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('treasuryOpened', () => count++);
            unregister();
            system.openTreasury({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('treasuryOpened', () => { throw new Error('x'); });
            expect(() => system.openTreasury({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTreasuries = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTreasuries = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openTreasury({});
            const json = system.toJSON();
            expect(json.treasuries.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openTreasury({});
            const json = system.toJSON();
            const newSys = new SectTreasury();
            newSys.fromJSON(json);
            expect(newSys.treasuries.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.treasuryCount).toBe(0);
        });
    });
});
