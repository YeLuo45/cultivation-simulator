/**
 * KarmaLedger.test.js - 业力账本测试
 * V369 Iteration 3/9 Round 10 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { KarmaLedger } from '../../../systems/ai/KarmaLedger.js';

describe('KarmaLedger', () => {
    let system;
    beforeEach(() => { system = new KarmaLedger(); });

    describe('createLedger', () => {
        it('should create', () => {
            const { ledger } = system.createLedger({ owner: 'L1' });
            expect(ledger.owner).toBe('L1');
        });

        it('should trigger ledgerCreated hook', () => {
            let called = false;
            system.registerHook('ledgerCreated', () => { called = true; });
            system.createLedger({});
            expect(called).toBe(true);
        });
    });

    describe('getLedger', () => {
        it('should return', () => {
            const { ledger } = system.createLedger({});
            expect(system.getLedger(ledger.ledgerId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getLedger('ghost')).toBeNull(); });
    });

    describe('listLedgers', () => {
        it('should list all', () => {
            system.createLedger({});
            expect(system.listLedgers().length).toBe(1);
        });
    });

    describe('addEntry', () => {
        it('should add', () => {
            const { ledger } = system.createLedger({});
            const result = system.addEntry(ledger.ledgerId, { action: 'good', karma: 10 });
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.addEntry('ghost', { action: 'good' });
            expect(result.error).toBe('LEDGER_NOT_FOUND');
        });

        it('should update totalKarma', () => {
            const { ledger } = system.createLedger({});
            system.addEntry(ledger.ledgerId, { karma: 10 });
            expect(ledger.totalKarma).toBe(10);
        });

        it('should trigger entryAdded hook', () => {
            const { ledger } = system.createLedger({});
            let called = false;
            system.registerHook('entryAdded', () => { called = true; });
            system.addEntry(ledger.ledgerId, {});
            expect(called).toBe(true);
        });
    });

    describe('getEntry', () => {
        it('should return', () => {
            const { ledger } = system.createLedger({});
            const { entry } = system.addEntry(ledger.ledgerId, {});
            expect(system.getEntry(entry.entryId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getEntry('ghost')).toBeNull(); });
    });

    describe('listEntries', () => {
        it('should list all', () => {
            const { ledger } = system.createLedger({});
            system.addEntry(ledger.ledgerId, {});
            expect(system.listEntries().length).toBe(1);
        });
    });

    describe('listByLedger', () => {
        it('should filter', () => {
            const { ledger: l1 } = system.createLedger({});
            const { ledger: l2 } = system.createLedger({});
            system.addEntry(l1.ledgerId, {});
            system.addEntry(l2.ledgerId, {});
            expect(system.listByLedger(l1.ledgerId).length).toBe(1);
        });
    });

    describe('listByAction', () => {
        it('should filter', () => {
            const { ledger } = system.createLedger({});
            system.addEntry(ledger.ledgerId, { action: 'good' });
            system.addEntry(ledger.ledgerId, { action: 'bad' });
            expect(system.listByAction('good').length).toBe(1);
        });
    });

    describe('listPositive', () => {
        it('should filter', () => {
            const { ledger } = system.createLedger({});
            system.addEntry(ledger.ledgerId, { karma: 10 });
            system.addEntry(ledger.ledgerId, { karma: -10 });
            expect(system.listPositive().length).toBe(1);
        });
    });

    describe('listNegative', () => {
        it('should filter', () => {
            const { ledger } = system.createLedger({});
            system.addEntry(ledger.ledgerId, { karma: 10 });
            system.addEntry(ledger.ledgerId, { karma: -10 });
            expect(system.listNegative().length).toBe(1);
        });
    });

    describe('calculateNet', () => {
        it('should calculate', () => {
            const { ledger } = system.createLedger({});
            system.addEntry(ledger.ledgerId, { karma: 10 });
            system.addEntry(ledger.ledgerId, { karma: -3 });
            expect(system.calculateNet(ledger.ledgerId)).toBe(7);
        });
    });

    describe('removeEntry', () => {
        it('should remove', () => {
            const { ledger } = system.createLedger({});
            const { entry } = system.addEntry(ledger.ledgerId, { karma: 10 });
            const result = system.removeEntry(entry.entryId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.removeEntry('ghost');
            expect(result.error).toBe('ENTRY_NOT_FOUND');
        });

        it('should trigger entryRemoved hook', () => {
            const { ledger } = system.createLedger({});
            const { entry } = system.addEntry(ledger.ledgerId, {});
            let called = false;
            system.registerHook('entryRemoved', () => { called = true; });
            system.removeEntry(entry.entryId);
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

        it('should execute default getLedger', () => {
            const result = system.executeTool('getLedger', { ledgerId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('ledgerCreated', () => count++);
            unregister();
            system.createLedger({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('ledgerCreated', () => { throw new Error('x'); });
            expect(() => system.createLedger({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalEntries = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalEntries = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createLedger({});
            const json = system.toJSON();
            expect(json.ledgers.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createLedger({});
            const json = system.toJSON();
            const newSys = new KarmaLedger();
            newSys.fromJSON(json);
            expect(newSys.ledgers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.ledgerCount).toBe(0);
        });
    });
});