/**
 * InnerBalance.test.js - 内在平衡测试
 * V438 Iteration 15/15 FINAL Round 15 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InnerBalance } from '../../../systems/ai/InnerBalance.js';

describe('InnerBalance', () => {
    let system;
    beforeEach(() => { system = new InnerBalance(); });

    describe('createBalance', () => {
        it('should create', () => {
            const { balance } = system.createBalance({ name: 'B1' });
            expect(balance.name).toBe('B1');
        });

        it('should set initial metrics', () => {
            const { balance } = system.createBalance({});
            expect(system.getMetrics(balance.balanceId)).not.toBeNull();
        });

        it('should trigger balanceCreated hook', () => {
            let called = false;
            system.registerHook('balanceCreated', () => { called = true; });
            system.createBalance({});
            expect(called).toBe(true);
        });
    });

    describe('getBalance', () => {
        it('should return', () => {
            const { balance } = system.createBalance({});
            expect(system.getBalance(balance.balanceId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBalance('ghost')).toBeNull(); });
    });

    describe('listBalances', () => {
        it('should list all', () => {
            system.createBalance({});
            expect(system.listBalances().length).toBe(1);
        });
    });

    describe('listByStatus', () => {
        it('should filter', () => {
            system.createBalance({});
            expect(system.listByStatus('balanced').length).toBe(1);
        });
    });

    describe('setMetrics', () => {
        it('should set', () => {
            const { balance } = system.createBalance({});
            const result = system.setMetrics(balance.balanceId, { harmony: 50 });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.setMetrics('ghost', {});
            expect(result.error).toBe('BALANCE_NOT_FOUND');
        });
    });

    describe('getMetrics', () => {
        it('should return', () => {
            const { balance } = system.createBalance({});
            expect(system.getMetrics(balance.balanceId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getMetrics('ghost')).toBeNull();
        });
    });

    describe('refreshBalance', () => {
        it('should refresh', () => {
            const { balance } = system.createBalance({});
            const result = system.refreshBalance(balance.balanceId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.refreshBalance('ghost');
            expect(result.error).toBe('BALANCE_NOT_FOUND');
        });

        it('should set balanced status', () => {
            const { balance } = system.createBalance({ yin: 50, yang: 50 });
            system.refreshBalance(balance.balanceId);
            expect(balance.status).toBe('balanced');
        });

        it('should set imbalanced status', () => {
            const { balance } = system.createBalance({ yin: 10, yang: 100 });
            system.refreshBalance(balance.balanceId);
            expect(balance.status).toBe('imbalanced');
        });

        it('should trigger balanceRefreshed hook', () => {
            const { balance } = system.createBalance({});
            let called = false;
            system.registerHook('balanceRefreshed', () => { called = true; });
            system.refreshBalance(balance.balanceId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHarmonyScore', () => {
        it('should calculate 100 for balanced', () => {
            const { balance } = system.createBalance({ yin: 50, yang: 50 });
            expect(system.calculateHarmonyScore(balance.balanceId)).toBe(100);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHarmonyScore('ghost')).toBe(0);
        });
    });

    describe('adjustYinYang', () => {
        it('should adjust', () => {
            const { balance } = system.createBalance({ yin: 50, yang: 50 });
            system.adjustYinYang(balance.balanceId, 10, -10);
            expect(balance.yin).toBe(60);
            expect(balance.yang).toBe(40);
        });

        it('should cap at 0 and 100', () => {
            const { balance } = system.createBalance({ yin: 50, yang: 50 });
            system.adjustYinYang(balance.balanceId, 100, -100);
            expect(balance.yin).toBe(100);
            expect(balance.yang).toBe(0);
        });

        it('should reject missing', () => {
            const result = system.adjustYinYang('ghost', 10, 10);
            expect(result.error).toBe('BALANCE_NOT_FOUND');
        });

        it('should trigger yinYangAdjusted hook', () => {
            const { balance } = system.createBalance({});
            let called = false;
            system.registerHook('yinYangAdjusted', () => { called = true; });
            system.adjustYinYang(balance.balanceId, 5, 5);
            expect(called).toBe(true);
        });
    });

    describe('deleteBalance', () => {
        it('should delete', () => {
            const { balance } = system.createBalance({});
            const result = system.deleteBalance(balance.balanceId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteBalance('ghost');
            expect(result.error).toBe('BALANCE_NOT_FOUND');
        });

        it('should trigger balanceDeleted hook', () => {
            const { balance } = system.createBalance({});
            let called = false;
            system.registerHook('balanceDeleted', () => { called = true; });
            system.deleteBalance(balance.balanceId);
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

        it('should execute default getBalance', () => {
            const result = system.executeTool('getBalance', { balanceId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('balanceCreated', () => count++);
            unregister();
            system.createBalance({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('balanceCreated', () => { throw new Error('x'); });
            expect(() => system.createBalance({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBalances = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBalances = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createBalance({});
            const json = system.toJSON();
            expect(json.balances.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createBalance({});
            const json = system.toJSON();
            const newSys = new InnerBalance();
            newSys.fromJSON(json);
            expect(newSys.balances.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.balanceCount).toBe(0);
        });
    });
});