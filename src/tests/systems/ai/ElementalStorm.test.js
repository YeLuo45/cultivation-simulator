/**
 * ElementalStorm.test.js - 元素风暴测试
 * V365 Iteration 8/9 Round 9 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ElementalStorm } from '../../../systems/ai/ElementalStorm.js';

describe('ElementalStorm', () => {
    let system;
    beforeEach(() => { system = new ElementalStorm(); });

    describe('createStorm', () => {
        it('should create', () => {
            const { storm } = system.createStorm({ elementId: 'fire' });
            expect(storm.elementId).toBe('fire');
        });

        it('should reject invalid element', () => {
            const result = system.createStorm({ elementId: 'ghost' });
            expect(result.error).toBe('INVALID_ELEMENT');
        });

        it('should trigger stormCreated hook', () => {
            let called = false;
            system.registerHook('stormCreated', () => { called = true; });
            system.createStorm({ elementId: 'fire' });
            expect(called).toBe(true);
        });
    });

    describe('getStorm', () => {
        it('should return', () => {
            const { storm } = system.createStorm({ elementId: 'fire' });
            expect(system.getStorm(storm.stormId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getStorm('ghost')).toBeNull(); });
    });

    describe('listStorms', () => {
        it('should list all', () => {
            system.createStorm({ elementId: 'fire' });
            expect(system.listStorms().length).toBe(1);
        });
    });

    describe('listActive', () => {
        it('should filter', () => {
            system.createStorm({ elementId: 'fire' });
            const { storm } = system.createStorm({ elementId: 'water' });
            storm.active = false;
            expect(system.listActive().length).toBe(1);
        });
    });

    describe('listByElement', () => {
        it('should filter', () => {
            system.createStorm({ elementId: 'fire' });
            system.createStorm({ elementId: 'water' });
            expect(system.listByElement('fire').length).toBe(1);
        });
    });

    describe('triggerStrike', () => {
        it('should trigger', () => {
            const { storm } = system.createStorm({ elementId: 'fire' });
            const result = system.triggerStrike(storm.stormId, 't1', 10);
            expect(result.success).toBe(true);
        });

        it('should reject missing storm', () => {
            const result = system.triggerStrike('ghost', 't1', 10);
            expect(result.error).toBe('STORM_NOT_FOUND');
        });

        it('should reject inactive storm', () => {
            const { storm } = system.createStorm({ elementId: 'fire' });
            storm.active = false;
            const result = system.triggerStrike(storm.stormId, 't1', 10);
            expect(result.error).toBe('STORM_INACTIVE');
        });

        it('should decrement duration', () => {
            const { storm } = system.createStorm({ elementId: 'fire' });
            system.triggerStrike(storm.stormId, 't1', 10);
            expect(storm.duration).toBe(99);
        });

        it('should trigger strikeTriggered hook', () => {
            const { storm } = system.createStorm({ elementId: 'fire' });
            let called = false;
            system.registerHook('strikeTriggered', () => { called = true; });
            system.triggerStrike(storm.stormId, 't1', 10);
            expect(called).toBe(true);
        });
    });

    describe('getStrike', () => {
        it('should return', () => {
            const { storm } = system.createStorm({ elementId: 'fire' });
            const { strike } = system.triggerStrike(storm.stormId, 't1', 10);
            expect(system.getStrike(strike.strikeId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getStrike('ghost')).toBeNull(); });
    });

    describe('listStrikes', () => {
        it('should list all', () => {
            const { storm } = system.createStorm({ elementId: 'fire' });
            system.triggerStrike(storm.stormId, 't1', 10);
            expect(system.listStrikes().length).toBe(1);
        });
    });

    describe('listStrikesByStorm', () => {
        it('should filter', () => {
            const { storm: s1 } = system.createStorm({ elementId: 'fire' });
            const { storm: s2 } = system.createStorm({ elementId: 'water' });
            system.triggerStrike(s1.stormId, 't1', 10);
            system.triggerStrike(s2.stormId, 't1', 10);
            expect(system.listStrikesByStorm(s1.stormId).length).toBe(1);
        });
    });

    describe('intensifyStorm', () => {
        it('should intensify', () => {
            const { storm } = system.createStorm({ elementId: 'fire' });
            system.intensifyStorm(storm.stormId, 20);
            expect(storm.intensity).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.intensifyStorm('ghost', 10);
            expect(result.error).toBe('STORM_NOT_FOUND');
        });

        it('should trigger stormIntensified hook', () => {
            const { storm } = system.createStorm({ elementId: 'fire' });
            let called = false;
            system.registerHook('stormIntensified', () => { called = true; });
            system.intensifyStorm(storm.stormId, 10);
            expect(called).toBe(true);
        });
    });

    describe('endStorm', () => {
        it('should end', () => {
            const { storm } = system.createStorm({ elementId: 'fire' });
            const result = system.endStorm(storm.stormId);
            expect(storm.active).toBe(false);
        });

        it('should reject missing', () => {
            const result = system.endStorm('ghost');
            expect(result.error).toBe('STORM_NOT_FOUND');
        });

        it('should trigger stormEnded hook', () => {
            const { storm } = system.createStorm({ elementId: 'fire' });
            let called = false;
            system.registerHook('stormEnded', () => { called = true; });
            system.endStorm(storm.stormId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTotalDamage', () => {
        it('should calculate', () => {
            const { storm } = system.createStorm({ elementId: 'fire' });
            system.triggerStrike(storm.stormId, 't1', 10);
            system.triggerStrike(storm.stormId, 't2', 20);
            expect(system.calculateTotalDamage()).toBe(30);
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

        it('should execute default getStorm', () => {
            const result = system.executeTool('getStorm', { stormId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('stormCreated', () => count++);
            unregister();
            system.createStorm({ elementId: 'fire' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('stormCreated', () => { throw new Error('x'); });
            expect(() => system.createStorm({ elementId: 'fire' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalStorms = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalStorms = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createStorm({ elementId: 'fire' });
            const json = system.toJSON();
            expect(json.storms.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createStorm({ elementId: 'fire' });
            const json = system.toJSON();
            const newSys = new ElementalStorm();
            newSys.fromJSON(json);
            expect(newSys.storms.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.stormCount).toBe(0);
        });
    });
});