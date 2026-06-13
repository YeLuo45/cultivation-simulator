/**
 * SectChronicle.test.js - 宗门编年史测试
 * V470 Iteration 2/15 Round 18 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectChronicle } from '../../../systems/ai/SectChronicle.js';

describe('SectChronicle', () => {
    let system;
    beforeEach(() => { system = new SectChronicle(); });

    describe('recordEntry', () => {
        it('should record', () => {
            const { entry } = system.recordEntry({ sectId: 's1', year: 100, event: 'founding' });
            expect(entry.sectId).toBe('s1');
            expect(entry.year).toBe(100);
            expect(entry.event).toBe('founding');
        });

        it('should use base importance by default', () => {
            const { entry } = system.recordEntry({});
            expect(entry.importance).toBe(10);
        });

        it('should default status to draft', () => {
            const { entry } = system.recordEntry({});
            expect(entry.status).toBe('draft');
        });

        it('should respect custom entryId', () => {
            const { entry } = system.recordEntry({ entryId: 'custom_1' });
            expect(entry.entryId).toBe('custom_1');
        });

        it('should accept witnesses array', () => {
            const { entry } = system.recordEntry({ witnesses: ['w1', 'w2'] });
            expect(entry.witnesses).toEqual(['w1', 'w2']);
        });

        it('should trigger entryRecorded hook', () => {
            let called = false;
            system.registerHook('entryRecorded', () => { called = true; });
            system.recordEntry({});
            expect(called).toBe(true);
        });
    });

    describe('getEntry', () => {
        it('should return entry', () => {
            const { entry } = system.recordEntry({});
            expect(system.getEntry(entry.entryId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getEntry('ghost')).toBeNull(); });
    });

    describe('listEntries', () => {
        it('should list all', () => {
            system.recordEntry({});
            system.recordEntry({});
            expect(system.listEntries().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listEntries().length).toBe(0);
        });
    });

    describe('listBySect', () => {
        it('should filter', () => {
            system.recordEntry({ sectId: 's1' });
            system.recordEntry({ sectId: 's2' });
            expect(system.listBySect('s1').length).toBe(1);
        });
    });

    describe('listByImportance', () => {
        it('should filter by min importance', () => {
            system.recordEntry({ importance: 5 });
            system.recordEntry({ importance: 50 });
            system.recordEntry({ importance: 200 });
            expect(system.listByImportance(20).length).toBe(2);
        });
    });

    describe('addWitness', () => {
        it('should add witness', () => {
            const { entry } = system.recordEntry({});
            system.addWitness(entry.entryId, 'witness_a');
            expect(entry.witnesses).toContain('witness_a');
        });

        it('should add multiple witnesses', () => {
            const { entry } = system.recordEntry({});
            system.addWitness(entry.entryId, 'w1');
            system.addWitness(entry.entryId, 'w2');
            expect(entry.witnesses.length).toBe(2);
        });

        it('should reject missing entry', () => {
            const result = system.addWitness('ghost', 'w');
            expect(result.error).toBe('ENTRY_NOT_FOUND');
        });

        it('should trigger witnessAdded hook', () => {
            const { entry } = system.recordEntry({});
            let called = false;
            system.registerHook('witnessAdded', () => { called = true; });
            system.addWitness(entry.entryId, 'w');
            expect(called).toBe(true);
        });
    });

    describe('increaseImportance', () => {
        it('should increase by default 5', () => {
            const { entry } = system.recordEntry({});
            system.increaseImportance(entry.entryId);
            expect(entry.importance).toBe(15);
        });

        it('should increase by custom amount', () => {
            const { entry } = system.recordEntry({});
            system.increaseImportance(entry.entryId, 50);
            expect(entry.importance).toBe(60);
        });

        it('should reject missing entry', () => {
            const result = system.increaseImportance('ghost', 10);
            expect(result.error).toBe('ENTRY_NOT_FOUND');
        });

        it('should trigger importanceIncreased hook', () => {
            const { entry } = system.recordEntry({});
            let called = false;
            system.registerHook('importanceIncreased', () => { called = true; });
            system.increaseImportance(entry.entryId, 10);
            expect(called).toBe(true);
        });
    });

    describe('archiveEntry', () => {
        it('should set status to archived', () => {
            const { entry } = system.recordEntry({});
            system.archiveEntry(entry.entryId);
            expect(entry.status).toBe('archived');
        });

        it('should reject missing entry', () => {
            const result = system.archiveEntry('ghost');
            expect(result.error).toBe('ENTRY_NOT_FOUND');
        });

        it('should trigger entryArchived hook', () => {
            const { entry } = system.recordEntry({});
            let called = false;
            system.registerHook('entryArchived', () => { called = true; });
            system.archiveEntry(entry.entryId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHistoricalValue', () => {
        it('should calculate with witnesses and year', () => {
            const { entry } = system.recordEntry({ importance: 20, year: 500, witnesses: ['w1', 'w2'] });
            // 20*10 + 2*5 + 500/100 = 200 + 10 + 5 = 215
            expect(system.calculateHistoricalValue(entry.entryId)).toBeCloseTo(215, 5);
        });

        it('should calculate with no witnesses', () => {
            const { entry } = system.recordEntry({ importance: 10, year: 0 });
            // 10*10 + 0*5 + 0/100 = 100
            expect(system.calculateHistoricalValue(entry.entryId)).toBeCloseTo(100, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHistoricalValue('ghost')).toBe(0);
        });
    });

    describe('recordAll', () => {
        it('should set status to recorded', () => {
            const { entry } = system.recordEntry({});
            system.recordAll(entry.entryId);
            expect(entry.status).toBe('recorded');
        });

        it('should reject missing entry', () => {
            const result = system.recordAll('ghost');
            expect(result.error).toBe('ENTRY_NOT_FOUND');
        });
    });

    describe('listArchived', () => {
        it('should filter archived entries', () => {
            const { entry: e1 } = system.recordEntry({});
            system.recordEntry({});
            system.archiveEntry(e1.entryId);
            expect(system.listArchived().length).toBe(1);
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
            const unregister = system.registerHook('entryRecorded', () => count++);
            unregister();
            system.recordEntry({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('entryRecorded', () => { throw new Error('x'); });
            expect(() => system.recordEntry({})).not.toThrow();
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
            system.recordEntry({});
            const json = system.toJSON();
            expect(json.entries.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recordEntry({});
            const json = system.toJSON();
            const newSys = new SectChronicle();
            newSys.fromJSON(json);
            expect(newSys.entries.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.entryCount).toBe(0);
        });
    });
});
