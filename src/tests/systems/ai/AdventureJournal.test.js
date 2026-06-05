/**
 * AdventureJournal.test.js - 冒险日志系统测试
 * V337 Iteration 7/9 Round 6 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AdventureJournal } from '../../../systems/ai/AdventureJournal.js';

describe('AdventureJournal', () => {
    let system;
    beforeEach(() => { system = new AdventureJournal(); });

    describe('createJournal', () => {
        it('should create', () => {
            const { journal } = system.createJournal({ name: 'J1' });
            expect(journal.name).toBe('J1');
        });

        it('should trigger journalCreated hook', () => {
            let called = false;
            system.registerHook('journalCreated', () => { called = true; });
            system.createJournal({});
            expect(called).toBe(true);
        });
    });

    describe('getJournal', () => {
        it('should return', () => {
            const { journal } = system.createJournal({});
            expect(system.getJournal(journal.journalId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getJournal('ghost')).toBeNull(); });
    });

    describe('listJournals', () => {
        it('should list all', () => {
            system.createJournal({});
            expect(system.listJournals().length).toBe(1);
        });
    });

    describe('listJournalsByAdventurer', () => {
        it('should filter', () => {
            system.createJournal({ adventurerId: 'a1' });
            system.createJournal({ adventurerId: 'a2' });
            expect(system.listJournalsByAdventurer('a1').length).toBe(1);
        });
    });

    describe('addEntry', () => {
        it('should add', () => {
            const { journal } = system.createJournal({});
            const result = system.addEntry(journal.journalId, {});
            expect(result.success).toBe(true);
        });

        it('should reject missing journal', () => {
            const result = system.addEntry('ghost', {});
            expect(result.error).toBe('JOURNAL_NOT_FOUND');
        });

        it('should trigger entryAdded hook', () => {
            const { journal } = system.createJournal({});
            let called = false;
            system.registerHook('entryAdded', () => { called = true; });
            system.addEntry(journal.journalId, {});
            expect(called).toBe(true);
        });
    });

    describe('getEntry', () => {
        it('should return', () => {
            const { journal } = system.createJournal({});
            const { entry } = system.addEntry(journal.journalId, {});
            expect(system.getEntry(entry.entryId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getEntry('ghost')).toBeNull(); });
    });

    describe('listEntries', () => {
        it('should filter by journal', () => {
            const { journal: j1 } = system.createJournal({});
            const { journal: j2 } = system.createJournal({});
            system.addEntry(j1.journalId, {});
            system.addEntry(j2.journalId, {});
            expect(system.listEntries(j1.journalId).length).toBe(1);
        });
    });

    describe('listEntriesByTag', () => {
        it('should filter', () => {
            const { journal } = system.createJournal({});
            system.addEntry(journal.journalId, { tags: ['rare'] });
            system.addEntry(journal.journalId, { tags: ['common'] });
            expect(system.listEntriesByTag('rare').length).toBe(1);
        });
    });

    describe('listEntriesByType', () => {
        it('should filter', () => {
            const { journal } = system.createJournal({});
            system.addEntry(journal.journalId, { type: 'quest' });
            system.addEntry(journal.journalId, { type: 'note' });
            expect(system.listEntriesByType('quest').length).toBe(1);
        });
    });

    describe('updateEntry', () => {
        it('should update', () => {
            const { journal } = system.createJournal({});
            const { entry } = system.addEntry(journal.journalId, { title: 'Old' });
            const result = system.updateEntry(entry.entryId, { title: 'New' });
            expect(entry.title).toBe('New');
        });

        it('should reject missing', () => {
            const result = system.updateEntry('ghost', {});
            expect(result.error).toBe('ENTRY_NOT_FOUND');
        });

        it('should trigger entryUpdated hook', () => {
            const { journal } = system.createJournal({});
            const { entry } = system.addEntry(journal.journalId, {});
            let called = false;
            system.registerHook('entryUpdated', () => { called = true; });
            system.updateEntry(entry.entryId, { title: 'X' });
            expect(called).toBe(true);
        });
    });

    describe('deleteEntry', () => {
        it('should delete', () => {
            const { journal } = system.createJournal({});
            const { entry } = system.addEntry(journal.journalId, {});
            const result = system.deleteEntry(entry.entryId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.deleteEntry('ghost');
            expect(result.error).toBe('ENTRY_NOT_FOUND');
        });

        it('should trigger entryDeleted hook', () => {
            const { journal } = system.createJournal({});
            const { entry } = system.addEntry(journal.journalId, {});
            let called = false;
            system.registerHook('entryDeleted', () => { called = true; });
            system.deleteEntry(entry.entryId);
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

        it('should execute default getEntry', () => {
            const result = system.executeTool('getEntry', { entryId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('journalCreated', () => count++);
            unregister();
            system.createJournal({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('journalCreated', () => { throw new Error('x'); });
            expect(() => system.createJournal({})).not.toThrow();
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
            system.createJournal({});
            const json = system.toJSON();
            expect(json.journals.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createJournal({});
            const json = system.toJSON();
            const newSys = new AdventureJournal();
            newSys.fromJSON(json);
            expect(newSys.journals.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.journalCount).toBe(0);
        });
    });
});