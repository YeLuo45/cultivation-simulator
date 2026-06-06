/**
 * MindReading.test.js - 读心测试
 * V419 Iteration 11/15 Round 14 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MindReading } from '../../../systems/ai/MindReading.js';

describe('MindReading', () => {
    let system;
    beforeEach(() => { system = new MindReading(); });

    describe('startReading', () => {
        it('should start a reading', () => {
            const { reading } = system.startReading({ readerId: 'r1', targetId: 't1' });
            expect(reading.readerId).toBe('r1');
            expect(reading.targetId).toBe('t1');
        });

        it('should use baseDepth default', () => {
            const { reading } = system.startReading({});
            expect(reading.depth).toBe(10);
        });

        it('should trigger readingStarted hook', () => {
            let called = false;
            system.registerHook('readingStarted', () => { called = true; });
            system.startReading({});
            expect(called).toBe(true);
        });
    });

    describe('getReading', () => {
        it('should return reading', () => {
            const { reading } = system.startReading({});
            expect(system.getReading(reading.readingId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getReading('ghost')).toBeNull(); });
    });

    describe('listReadings', () => {
        it('should list all', () => {
            system.startReading({});
            expect(system.listReadings().length).toBe(1);
        });
    });

    describe('listByReader', () => {
        it('should filter by reader', () => {
            system.startReading({ readerId: 'r1' });
            system.startReading({ readerId: 'r2' });
            expect(system.listByReader('r1').length).toBe(1);
        });
    });

    describe('listByTarget', () => {
        it('should filter by target', () => {
            system.startReading({ targetId: 't1' });
            system.startReading({ targetId: 't2' });
            expect(system.listByTarget('t1').length).toBe(1);
        });
    });

    describe('digDeeper', () => {
        it('should increase depth by default amount', () => {
            const { reading } = system.startReading({});
            system.digDeeper(reading.readingId);
            expect(reading.depth).toBe(15);
        });

        it('should increase depth by custom amount', () => {
            const { reading } = system.startReading({});
            system.digDeeper(reading.readingId, 20);
            expect(reading.depth).toBe(30);
        });

        it('should reject missing reading', () => {
            const result = system.digDeeper('ghost', 5);
            expect(result.error).toBe('READING_NOT_FOUND');
        });

        it('should trigger readingDeepened hook', () => {
            const { reading } = system.startReading({});
            let called = false;
            system.registerHook('readingDeepened', () => { called = true; });
            system.digDeeper(reading.readingId, 5);
            expect(called).toBe(true);
        });
    });

    describe('extractThought', () => {
        it('should add a thought', () => {
            const { reading } = system.startReading({});
            system.extractThought(reading.readingId, 'hidden fear');
            expect(reading.thoughts).toContain('hidden fear');
            expect(reading.thoughts.length).toBe(1);
        });

        it('should reject missing reading', () => {
            const result = system.extractThought('ghost', 'x');
            expect(result.error).toBe('READING_NOT_FOUND');
        });

        it('should trigger thoughtExtracted hook', () => {
            const { reading } = system.startReading({});
            let called = false;
            system.registerHook('thoughtExtracted', () => { called = true; });
            system.extractThought(reading.readingId, 'x');
            expect(called).toBe(true);
        });
    });

    describe('readEmotion', () => {
        it('should add an emotion', () => {
            const { reading } = system.startReading({});
            system.readEmotion(reading.readingId, 'anger');
            expect(reading.emotions).toContain('anger');
            expect(reading.emotions.length).toBe(1);
        });

        it('should reject missing reading', () => {
            const result = system.readEmotion('ghost', 'x');
            expect(result.error).toBe('READING_NOT_FOUND');
        });

        it('should trigger emotionRead hook', () => {
            const { reading } = system.startReading({});
            let called = false;
            system.registerHook('emotionRead', () => { called = true; });
            system.readEmotion(reading.readingId, 'x');
            expect(called).toBe(true);
        });
    });

    describe('calculateInsight', () => {
        it('should calculate base insight', () => {
            const { reading } = system.startReading({});
            // depth=10, 0 thoughts, 0 emotions, 0 secrets = 20
            expect(system.calculateInsight(reading.readingId)).toBe(20);
        });

        it('should factor thoughts, emotions, secrets', () => {
            const { reading } = system.startReading({ thoughts: ['a'], emotions: ['b'], secrets: ['c'] });
            // depth=10*2=20, 1*5=5, 1*3=3, 1*10=10 = 38
            expect(system.calculateInsight(reading.readingId)).toBe(38);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateInsight('ghost')).toBe(0);
        });
    });

    describe('listDeep', () => {
        it('should filter deep readings', () => {
            const { reading: r1 } = system.startReading({});
            const { reading: r2 } = system.startReading({});
            r1.depth = 30;
            r2.depth = 5;
            expect(system.listDeep().length).toBe(1);
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

        it('should execute default getReading', () => {
            const result = system.executeTool('getReading', { readingId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('readingStarted', () => count++);
            unregister();
            system.startReading({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('readingStarted', () => { throw new Error('x'); });
            expect(() => system.startReading({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalReadings = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalReadings = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startReading({});
            const json = system.toJSON();
            expect(json.readings.length).toBe(1);
        });
        it('should deserialize', () => {
            system.startReading({});
            const json = system.toJSON();
            const newSys = new MindReading();
            newSys.fromJSON(json);
            expect(newSys.readings.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.readingCount).toBe(0);
        });
    });
});
