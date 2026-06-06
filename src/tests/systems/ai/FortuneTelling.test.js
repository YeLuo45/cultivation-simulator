/**
 * FortuneTelling.test.js - 卜卦测试
 * V429 Iteration 6/15 Round 15 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FortuneTelling } from '../../../systems/ai/FortuneTelling.js';

describe('FortuneTelling', () => {
    let system;
    beforeEach(() => { system = new FortuneTelling(); });

    describe('performReading', () => {
        it('should perform a reading', () => {
            const { reading } = system.performReading({ inquirerId: 'i1', question: 'Will I find treasure?' });
            expect(reading.inquirerId).toBe('i1');
            expect(reading.question).toBe('Will I find treasure?');
        });

        it('should use baseAccuracy default', () => {
            const { reading } = system.performReading({});
            expect(reading.accuracy).toBe(50);
        });

        it('should default status to pending', () => {
            const { reading } = system.performReading({});
            expect(reading.status).toBe('pending');
        });

        it('should initialize empty lines array', () => {
            const { reading } = system.performReading({});
            expect(reading.lines).toEqual([]);
        });

        it('should initialize empty interpretation', () => {
            const { reading } = system.performReading({});
            expect(reading.interpretation).toBe('');
        });

        it('should use provided id', () => {
            const { reading } = system.performReading({ id: 'my_id' });
            expect(reading.readingId).toBe('my_id');
        });

        it('should trigger readingPerformed hook', () => {
            let called = false;
            system.registerHook('readingPerformed', () => { called = true; });
            system.performReading({});
            expect(called).toBe(true);
        });
    });

    describe('getReading', () => {
        it('should return reading', () => {
            const { reading } = system.performReading({});
            expect(system.getReading(reading.readingId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getReading('ghost')).toBeNull(); });
    });

    describe('listReadings', () => {
        it('should list all', () => {
            system.performReading({});
            expect(system.listReadings().length).toBe(1);
        });

        it('should return empty list when no readings', () => {
            expect(system.listReadings().length).toBe(0);
        });
    });

    describe('listByInquirer', () => {
        it('should filter by inquirer', () => {
            system.performReading({ inquirerId: 'i1' });
            system.performReading({ inquirerId: 'i2' });
            expect(system.listByInquirer('i1').length).toBe(1);
        });

        it('should return empty for unknown inquirer', () => {
            system.performReading({ inquirerId: 'i1' });
            expect(system.listByInquirer('ghost').length).toBe(0);
        });
    });

    describe('listAccurate', () => {
        it('should filter by threshold', () => {
            system.performReading({ inquirerId: 'i1', accuracy: 90 });
            system.performReading({ inquirerId: 'i2', accuracy: 30 });
            expect(system.listAccurate(70).length).toBe(1);
        });

        it('should use default threshold of 70', () => {
            system.performReading({ accuracy: 80 });
            system.performReading({ accuracy: 60 });
            expect(system.listAccurate().length).toBe(1);
        });
    });

    describe('castHexagram', () => {
        it('should set hexagram', () => {
            const { reading } = system.performReading({});
            system.castHexagram(reading.readingId, 'Qian');
            expect(reading.hexagram).toBe('Qian');
        });

        it('should update status to hexagram_cast', () => {
            const { reading } = system.performReading({});
            system.castHexagram(reading.readingId, 'Kun');
            expect(reading.status).toBe('hexagram_cast');
        });

        it('should reject missing reading', () => {
            const result = system.castHexagram('ghost', 'Qian');
            expect(result.error).toBe('READING_NOT_FOUND');
        });

        it('should trigger hexagramCast hook', () => {
            const { reading } = system.performReading({});
            let called = false;
            system.registerHook('hexagramCast', () => { called = true; });
            system.castHexagram(reading.readingId, 'Qian');
            expect(called).toBe(true);
        });
    });

    describe('divineLine', () => {
        it('should add a line', () => {
            const { reading } = system.performReading({});
            system.divineLine(reading.readingId, 'yang');
            expect(reading.lines).toContain('yang');
            expect(reading.lines.length).toBe(1);
        });

        it('should append multiple lines', () => {
            const { reading } = system.performReading({});
            system.divineLine(reading.readingId, 'yang');
            system.divineLine(reading.readingId, 'yin');
            expect(reading.lines.length).toBe(2);
        });

        it('should reject missing reading', () => {
            const result = system.divineLine('ghost', 'yang');
            expect(result.error).toBe('READING_NOT_FOUND');
        });

        it('should trigger lineDrawn hook', () => {
            const { reading } = system.performReading({});
            let called = false;
            system.registerHook('lineDrawn', () => { called = true; });
            system.divineLine(reading.readingId, 'yang');
            expect(called).toBe(true);
        });
    });

    describe('interpretDivination', () => {
        it('should set interpretation', () => {
            const { reading } = system.performReading({});
            system.interpretDivination(reading.readingId, 'A sign of great fortune');
            expect(reading.interpretation).toBe('A sign of great fortune');
        });

        it('should update status to interpreted', () => {
            const { reading } = system.performReading({});
            system.interpretDivination(reading.readingId, 'meaningful');
            expect(reading.status).toBe('interpreted');
        });

        it('should update accuracy based on calculateAccuracy', () => {
            const { reading } = system.performReading({});
            system.divineLine(reading.readingId, 'yang');
            system.divineLine(reading.readingId, 'yin');
            system.interpretDivination(reading.readingId, 'fortune');
            // 2 lines * 10 + 'fortune'.length(7) = 27
            expect(reading.accuracy).toBe(27);
        });

        it('should reject missing reading', () => {
            const result = system.interpretDivination('ghost', 'x');
            expect(result.error).toBe('READING_NOT_FOUND');
        });

        it('should trigger divinationInterpreted hook', () => {
            const { reading } = system.performReading({});
            let called = false;
            system.registerHook('divinationInterpreted', () => { called = true; });
            system.interpretDivination(reading.readingId, 'fortune');
            expect(called).toBe(true);
        });
    });

    describe('calculateAccuracy', () => {
        it('should calculate base accuracy', () => {
            const { reading } = system.performReading({});
            // 0 lines * 10 + 0 length = 0
            expect(system.calculateAccuracy(reading.readingId)).toBe(0);
        });

        it('should factor lines and interpretation length', () => {
            const { reading } = system.performReading({ lines: ['a', 'b'], interpretation: 'hello' });
            // 2*10 + 5 = 25
            expect(system.calculateAccuracy(reading.readingId)).toBe(25);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateAccuracy('ghost')).toBe(0);
        });
    });

    describe('listAccurateDefault', () => {
        it('should filter by default threshold', () => {
            system.performReading({ accuracy: 80 });
            system.performReading({ accuracy: 60 });
            expect(system.listAccurateDefault().length).toBe(1);
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
            const unregister = system.registerHook('readingPerformed', () => count++);
            unregister();
            system.performReading({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('readingPerformed', () => { throw new Error('x'); });
            expect(() => system.performReading({})).not.toThrow();
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
            system.performReading({});
            const json = system.toJSON();
            expect(json.readings.length).toBe(1);
        });
        it('should deserialize', () => {
            system.performReading({});
            const json = system.toJSON();
            const newSys = new FortuneTelling();
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
