/**
 * MagicArray.test.js - 法阵测试
 * V413 Iteration 5/15 Round 14 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MagicArray } from '../../../systems/ai/MagicArray.js';

describe('MagicArray', () => {
    let system;
    beforeEach(() => { system = new MagicArray(); });

    describe('drawArray', () => {
        it('should draw', () => {
            const { array } = system.drawArray({ name: 'A1' });
            expect(array.name).toBe('A1');
        });

        it('should trigger arrayDrawn hook', () => {
            let called = false;
            system.registerHook('arrayDrawn', () => { called = true; });
            system.drawArray({});
            expect(called).toBe(true);
        });
    });

    describe('getArray', () => {
        it('should return', () => {
            const { array } = system.drawArray({});
            expect(system.getArray(array.arrayId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getArray('ghost')).toBeNull(); });
    });

    describe('listArrays', () => {
        it('should list all', () => {
            system.drawArray({});
            expect(system.listArrays().length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.drawArray({ type: 'defense' });
            system.drawArray({ type: 'attack' });
            expect(system.listByType('defense').length).toBe(1);
        });
    });

    describe('listActive', () => {
        it('should filter', () => {
            const { array } = system.drawArray({});
            array.status = 'dormant';
            system.drawArray({});
            expect(system.listActive().length).toBe(0);
        });
    });

    describe('activate', () => {
        it('should activate', () => {
            const { array } = system.drawArray({});
            system.activate(array.arrayId);
            expect(array.status).toBe('active');
        });

        it('should reject missing', () => {
            const result = system.activate('ghost');
            expect(result.error).toBe('ARRAY_NOT_FOUND');
        });

        it('should trigger arrayActivated hook', () => {
            const { array } = system.drawArray({});
            let called = false;
            system.registerHook('arrayActivated', () => { called = true; });
            system.activate(array.arrayId);
            expect(called).toBe(true);
        });
    });

    describe('deactivate', () => {
        it('should deactivate', () => {
            const { array } = system.drawArray({});
            system.activate(array.arrayId);
            system.deactivate(array.arrayId);
            expect(array.status).toBe('dormant');
        });

        it('should reject missing', () => {
            const result = system.deactivate('ghost');
            expect(result.error).toBe('ARRAY_NOT_FOUND');
        });

        it('should trigger arrayDeactivated hook', () => {
            const { array } = system.drawArray({});
            let called = false;
            system.registerHook('arrayDeactivated', () => { called = true; });
            system.deactivate(array.arrayId);
            expect(called).toBe(true);
        });
    });

    describe('charge', () => {
        it('should charge', () => {
            const { array } = system.drawArray({});
            system.charge(array.arrayId, 10);
            expect(array.mana).toBe(100);
        });

        it('should cap at 100', () => {
            const { array } = system.drawArray({ mana: 50 });
            system.charge(array.arrayId, 100);
            expect(array.mana).toBe(100);
        });

        it('should reject missing', () => {
            const result = system.charge('ghost', 10);
            expect(result.error).toBe('ARRAY_NOT_FOUND');
        });

        it('should trigger arrayCharged hook', () => {
            const { array } = system.drawArray({});
            let called = false;
            system.registerHook('arrayCharged', () => { called = true; });
            system.charge(array.arrayId, 10);
            expect(called).toBe(true);
        });
    });

    describe('consume', () => {
        it('should consume', () => {
            const { array } = system.drawArray({ mana: 100 });
            system.consume(array.arrayId, 30);
            expect(array.mana).toBe(70);
        });

        it('should reject insufficient', () => {
            const { array } = system.drawArray({ mana: 10 });
            const result = system.consume(array.arrayId, 50);
            expect(result.error).toBe('INSUFFICIENT_MANA');
        });

        it('should reject missing', () => {
            const result = system.consume('ghost', 10);
            expect(result.error).toBe('ARRAY_NOT_FOUND');
        });

        it('should trigger manaConsumed hook', () => {
            const { array } = system.drawArray({ mana: 100 });
            let called = false;
            system.registerHook('manaConsumed', () => { called = true; });
            system.consume(array.arrayId, 10);
            expect(called).toBe(true);
        });
    });

    describe('calculatePower', () => {
        it('should calculate', () => {
            const { array } = system.drawArray({});
            expect(system.calculatePower(array.arrayId)).toBe(250);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePower('ghost')).toBe(0);
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

        it('should execute default getArray', () => {
            const result = system.executeTool('getArray', { arrayId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('arrayDrawn', () => count++);
            unregister();
            system.drawArray({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('arrayDrawn', () => { throw new Error('x'); });
            expect(() => system.drawArray({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalArrays = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalArrays = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.drawArray({});
            const json = system.toJSON();
            expect(json.arrays.length).toBe(1);
        });
        it('should deserialize', () => {
            system.drawArray({});
            const json = system.toJSON();
            const newSys = new MagicArray();
            newSys.fromJSON(json);
            expect(newSys.arrays.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.arrayCount).toBe(0);
        });
    });
});