/**
 * CultivationBank.test.js - 修真银行测试
 * V540 Iteration 3/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBank } from '../../../systems/ai/CultivationBank.js';

describe('CultivationBank', () => {
    let system;
    beforeEach(() => { system = new CultivationBank(); });

    describe('openBank', () => {
        it('should open a bank with default values', () => {
            const { bank } = system.openBank({ ownerId: 'o1', name: 'Azure Vault' });
            expect(bank.bankId).toBeDefined();
            expect(bank.ownerId).toBe('o1');
            expect(bank.name).toBe('Azure Vault');
            expect(bank.type).toBe('central');
            expect(bank.deposits).toBe(100);
            expect(bank.loans).toEqual([]);
            expect(bank.level).toBe(1);
            expect(bank.status).toBe('open');
        });

        it('should accept merchant type', () => {
            const { bank } = system.openBank({ ownerId: 'o1', type: 'merchant' });
            expect(bank.type).toBe('merchant');
        });

        it('should accept royal type', () => {
            const { bank } = system.openBank({ ownerId: 'o1', type: 'royal' });
            expect(bank.type).toBe('royal');
        });

        it('should respect custom deposits', () => {
            const { bank } = system.openBank({ ownerId: 'o1', deposits: 500 });
            expect(bank.deposits).toBe(500);
        });

        it('should increment totalBanks', () => {
            system.openBank({ ownerId: 'o1' });
            expect(system.stats.totalBanks).toBe(1);
        });

        it('should trigger bankOpened hook', () => {
            let called = false;
            system.registerHook('bankOpened', () => { called = true; });
            system.openBank({ ownerId: 'o1' });
            expect(called).toBe(true);
        });
    });

    describe('getBank', () => {
        it('should return bank', () => {
            const { bank } = system.openBank({ ownerId: 'o1' });
            expect(system.getBank(bank.bankId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBank('ghost')).toBeNull(); });
    });

    describe('listBanks', () => {
        it('should list all', () => {
            system.openBank({ ownerId: 'o1' });
            system.openBank({ ownerId: 'o2' });
            expect(system.listBanks().length).toBe(2);
        });

        it('should return empty list when no banks', () => {
            expect(system.listBanks().length).toBe(0);
        });
    });

    describe('listByOwner', () => {
        it('should filter by owner', () => {
            system.openBank({ ownerId: 'o1' });
            system.openBank({ ownerId: 'o2' });
            system.openBank({ ownerId: 'o1' });
            expect(system.listByOwner('o1').length).toBe(2);
            expect(system.listByOwner('o2').length).toBe(1);
        });

        it('should return empty for unknown owner', () => {
            system.openBank({ ownerId: 'o1' });
            expect(system.listByOwner('ghost').length).toBe(0);
        });
    });

    describe('listOpen', () => {
        it('should return only open banks', () => {
            const { bank: b1 } = system.openBank({ ownerId: 'o1' });
            system.openBank({ ownerId: 'o1' });
            system.closeBank(b1.bankId);
            const open = system.listOpen();
            expect(open.length).toBe(1);
            expect(open[0].status).toBe('open');
        });
    });

    describe('addLoan', () => {
        it('should add a loan', () => {
            const { bank } = system.openBank({ ownerId: 'o1' });
            const result = system.addLoan(bank.bankId, { borrowerId: 'b1', amount: 200 });
            expect(result.success).toBe(true);
            expect(bank.loans.length).toBe(1);
            expect(bank.loans[0].amount).toBe(200);
        });

        it('should use default interest', () => {
            const { bank } = system.openBank({ ownerId: 'o1' });
            const { loan } = system.addLoan(bank.bankId, { borrowerId: 'b1', amount: 100 });
            expect(loan.interest).toBe(0.05);
        });

        it('should accept custom interest', () => {
            const { bank } = system.openBank({ ownerId: 'o1' });
            const { loan } = system.addLoan(bank.bankId, { borrowerId: 'b1', amount: 100, interest: 0.1 });
            expect(loan.interest).toBe(0.1);
        });

        it('should reject missing bank', () => {
            const result = system.addLoan('ghost', { borrowerId: 'b1' });
            expect(result.error).toBe('BANK_NOT_FOUND');
        });

        it('should trigger loanAdded hook', () => {
            const { bank } = system.openBank({ ownerId: 'o1' });
            let called = false;
            system.registerHook('loanAdded', () => { called = true; });
            system.addLoan(bank.bankId, { borrowerId: 'b1' });
            expect(called).toBe(true);
        });

        it('should increment totalLoans', () => {
            const { bank } = system.openBank({ ownerId: 'o1' });
            system.addLoan(bank.bankId, { borrowerId: 'b1' });
            expect(system.stats.totalLoans).toBe(1);
        });
    });

    describe('increaseDeposits', () => {
        it('should increase by default amount', () => {
            const { bank } = system.openBank({ ownerId: 'o1' });
            system.increaseDeposits(bank.bankId);
            expect(bank.deposits).toBe(105);
        });

        it('should increase by custom amount', () => {
            const { bank } = system.openBank({ ownerId: 'o1' });
            system.increaseDeposits(bank.bankId, 50);
            expect(bank.deposits).toBe(150);
        });

        it('should reject missing bank', () => {
            const result = system.increaseDeposits('ghost', 10);
            expect(result.error).toBe('BANK_NOT_FOUND');
        });

        it('should trigger depositsIncreased hook', () => {
            const { bank } = system.openBank({ ownerId: 'o1' });
            let called = false;
            system.registerHook('depositsIncreased', () => { called = true; });
            system.increaseDeposits(bank.bankId, 10);
            expect(called).toBe(true);
        });

        it('should mark bank as prosperous at high deposits', () => {
            const { bank } = system.openBank({ ownerId: 'o1' });
            system.increaseDeposits(bank.bankId, 1000);
            expect(bank.status).toBe('prosperous');
        });
    });

    describe('levelUpBank', () => {
        it('should level up', () => {
            const { bank } = system.openBank({ ownerId: 'o1' });
            system.levelUpBank(bank.bankId);
            expect(bank.level).toBe(2);
        });

        it('should reject missing bank', () => {
            const result = system.levelUpBank('ghost');
            expect(result.error).toBe('BANK_NOT_FOUND');
        });

        it('should trigger bankLeveledUp hook', () => {
            const { bank } = system.openBank({ ownerId: 'o1' });
            let called = false;
            system.registerHook('bankLeveledUp', () => { called = true; });
            system.levelUpBank(bank.bankId);
            expect(called).toBe(true);
        });
    });

    describe('closeBank', () => {
        it('should close bank', () => {
            const { bank } = system.openBank({ ownerId: 'o1' });
            system.closeBank(bank.bankId);
            expect(bank.status).toBe('closed');
        });

        it('should reject missing bank', () => {
            const result = system.closeBank('ghost');
            expect(result.error).toBe('BANK_NOT_FOUND');
        });

        it('should trigger bankClosed hook', () => {
            const { bank } = system.openBank({ ownerId: 'o1' });
            let called = false;
            system.registerHook('bankClosed', () => { called = true; });
            system.closeBank(bank.bankId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBankWealth', () => {
        it('should calculate for new bank', () => {
            const { bank } = system.openBank({ ownerId: 'o1' });
            // level=1, deposits=100, loans=0 -> 100 + 200 + 0 = 300
            expect(system.calculateBankWealth(bank.bankId)).toBe(300);
        });

        it('should factor in loans', () => {
            const { bank } = system.openBank({ ownerId: 'o1' });
            system.addLoan(bank.bankId, { borrowerId: 'b1', amount: 100 });
            system.addLoan(bank.bankId, { borrowerId: 'b2', amount: 200 });
            // level=1, deposits=100, loans=2 -> 100 + 200 + 60 = 360
            expect(system.calculateBankWealth(bank.bankId)).toBe(360);
        });

        it('should factor in level', () => {
            const { bank } = system.openBank({ ownerId: 'o1' });
            system.levelUpBank(bank.bankId);
            system.levelUpBank(bank.bankId);
            // level=3, deposits=100, loans=0 -> 300 + 200 + 0 = 500
            expect(system.calculateBankWealth(bank.bankId)).toBe(500);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBankWealth('ghost')).toBe(0);
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
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getBank', () => {
            const result = system.executeTool('getBank', { bankId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle missing context with default', () => {
            system.registerTool('noctx', (ctx) => ctx);
            const result = system.executeTool('noctx');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('bankOpened', () => count++);
            unregister();
            system.openBank({ ownerId: 'o1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('bankOpened', () => { throw new Error('x'); });
            expect(() => system.openBank({ ownerId: 'o1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient banks', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve after threshold', () => {
            for (let i = 0; i < 5; i++) system.openBank({ ownerId: `o${i}` });
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });

        it('should not double evolve', () => {
            for (let i = 0; i < 5; i++) system.openBank({ ownerId: `o${i}` });
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openBank({ ownerId: 'o1' });
            const json = system.toJSON();
            expect(json.banks.length).toBe(1);
            expect(json.stats.totalBanks).toBe(1);
        });

        it('should deserialize', () => {
            system.openBank({ ownerId: 'o1' });
            const json = system.toJSON();
            const newSys = new CultivationBank();
            newSys.fromJSON(json);
            expect(newSys.banks.size).toBe(1);
            expect(newSys.stats.totalBanks).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.bankCount).toBe(0);
            expect(stats.totalBanks).toBe(0);
        });

        it('should reflect added banks', () => {
            system.openBank({ ownerId: 'o1' });
            expect(system.getStats().bankCount).toBe(1);
        });
    });
});
