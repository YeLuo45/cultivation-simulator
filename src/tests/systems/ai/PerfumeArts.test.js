/**
 * PerfumeArts.test.js - 香道系统测试
 * V443 Iteration 5/15 Round 16 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PerfumeArts } from '../../../systems/ai/PerfumeArts.js';

describe('PerfumeArts', () => {
    let system;
    beforeEach(() => { system = new PerfumeArts(); });

    describe('mixPerfume', () => {
        it('should mix a perfume', () => {
            const { perfume } = system.mixPerfume({ cultivatorId: 'c1', name: 'JadeMist' });
            expect(perfume.cultivatorId).toBe('c1');
            expect(perfume.name).toBe('JadeMist');
        });

        it('should default to flower base', () => {
            const { perfume } = system.mixPerfume({ cultivatorId: 'c1' });
            expect(perfume.base).toBe('flower');
        });

        it('should use baseLongevity default', () => {
            const { perfume } = system.mixPerfume({ cultivatorId: 'c1' });
            expect(perfume.longevity).toBe(20);
        });

        it('should set status to mixed', () => {
            const { perfume } = system.mixPerfume({ cultivatorId: 'c1' });
            expect(perfume.status).toBe('mixed');
        });

        it('should increment totalPerfumes', () => {
            system.mixPerfume({});
            expect(system.stats.totalPerfumes).toBe(1);
        });

        it('should trigger perfumeMixed hook', () => {
            let called = false;
            system.registerHook('perfumeMixed', () => { called = true; });
            system.mixPerfume({});
            expect(called).toBe(true);
        });
    });

    describe('getPerfume', () => {
        it('should return perfume', () => {
            const { perfume } = system.mixPerfume({});
            expect(system.getPerfume(perfume.perfumeId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPerfume('ghost')).toBeNull(); });
    });

    describe('listPerfumes', () => {
        it('should list all', () => {
            system.mixPerfume({});
            system.mixPerfume({});
            expect(system.listPerfumes().length).toBe(2);
        });
        it('should return empty initially', () => {
            expect(system.listPerfumes().length).toBe(0);
        });
    });

    describe('listByBase', () => {
        it('should filter by base', () => {
            system.mixPerfume({ base: 'flower' });
            system.mixPerfume({ base: 'wood' });
            system.mixPerfume({ base: 'wood' });
            expect(system.listByBase('wood').length).toBe(2);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.mixPerfume({ cultivatorId: 'c1' });
            system.mixPerfume({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('addNote', () => {
        it('should add note', () => {
            const { perfume } = system.mixPerfume({});
            system.addNote(perfume.perfumeId, 'jasmine');
            expect(perfume.notes.length).toBe(1);
            expect(perfume.notes[0]).toBe('jasmine');
        });

        it('should reject missing perfume', () => {
            const result = system.addNote('ghost', 'jasmine');
            expect(result.error).toBe('PERFUME_NOT_FOUND');
        });

        it('should trigger noteAdded hook', () => {
            const { perfume } = system.mixPerfume({});
            let called = false;
            system.registerHook('noteAdded', () => { called = true; });
            system.addNote(perfume.perfumeId, 'rose');
            expect(called).toBe(true);
        });

        it('should accumulate multiple notes', () => {
            const { perfume } = system.mixPerfume({});
            system.addNote(perfume.perfumeId, 'rose');
            system.addNote(perfume.perfumeId, 'sandalwood');
            expect(perfume.notes.length).toBe(2);
        });
    });

    describe('increaseLongevity', () => {
        it('should increase', () => {
            const { perfume } = system.mixPerfume({});
            system.increaseLongevity(perfume.perfumeId, 10);
            expect(perfume.longevity).toBe(30);
        });

        it('should use default amount of 5', () => {
            const { perfume } = system.mixPerfume({});
            system.increaseLongevity(perfume.perfumeId);
            expect(perfume.longevity).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.increaseLongevity('ghost', 5);
            expect(result.error).toBe('PERFUME_NOT_FOUND');
        });

        it('should trigger longevityIncreased hook', () => {
            const { perfume } = system.mixPerfume({});
            let called = false;
            system.registerHook('longevityIncreased', () => { called = true; });
            system.increaseLongevity(perfume.perfumeId, 5);
            expect(called).toBe(true);
        });
    });

    describe('wearPerfume', () => {
        it('should change status to worn', () => {
            const { perfume } = system.mixPerfume({});
            system.wearPerfume(perfume.perfumeId);
            expect(perfume.status).toBe('worn');
        });

        it('should reject missing', () => {
            const result = system.wearPerfume('ghost');
            expect(result.error).toBe('PERFUME_NOT_FOUND');
        });

        it('should trigger perfumeWorn hook', () => {
            const { perfume } = system.mixPerfume({});
            let called = false;
            system.registerHook('perfumeWorn', () => { called = true; });
            system.wearPerfume(perfume.perfumeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFragranceQuality', () => {
        it('should calculate', () => {
            const { perfume } = system.mixPerfume({ longevity: 20, harmony: 5 });
            const q = system.calculateFragranceQuality(perfume.perfumeId);
            // 20 * (1 + 0/5) + 5 = 25
            expect(q).toBe(25);
        });

        it('should account for notes', () => {
            const { perfume } = system.mixPerfume({ longevity: 20, harmony: 0 });
            system.addNote(perfume.perfumeId, 'a');
            system.addNote(perfume.perfumeId, 'b');
            system.addNote(perfume.perfumeId, 'c');
            system.addNote(perfume.perfumeId, 'd');
            system.addNote(perfume.perfumeId, 'e');
            // 20 * (1 + 5/5) + 0 = 40
            expect(system.calculateFragranceQuality(perfume.perfumeId)).toBe(40);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateFragranceQuality('ghost')).toBe(0);
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

        it('should execute default mixPerfume', () => {
            const result = system.executeTool('mixPerfume', { cultivatorId: 'c1' });
            expect(result.success).toBe(true);
            expect(result.result.perfume.cultivatorId).toBe('c1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('perfumeMixed', () => count++);
            unregister();
            system.mixPerfume({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('perfumeMixed', () => { throw new Error('x'); });
            expect(() => system.mixPerfume({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPerfumes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalPerfumes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.mixPerfume({});
            const json = system.toJSON();
            expect(json.perfumes.length).toBe(1);
        });
        it('should deserialize', () => {
            system.mixPerfume({});
            const json = system.toJSON();
            const newSys = new PerfumeArts();
            newSys.fromJSON(json);
            expect(newSys.perfumes.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.perfumeCount).toBe(0);
            expect(stats.totalPerfumes).toBe(0);
        });
    });
});
