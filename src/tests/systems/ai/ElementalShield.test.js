/**
 * ElementalShield.test.js - 元素护盾测试
 * V364 Iteration 7/9 Round 9 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ElementalShield } from '../../../systems/ai/ElementalShield.js';

describe('ElementalShield', () => {
    let system;
    beforeEach(() => { system = new ElementalShield(); });

    describe('createShield', () => {
        it('should create', () => {
            const { shield } = system.createShield({ elementId: 'fire' });
            expect(shield.elementId).toBe('fire');
        });

        it('should reject invalid element', () => {
            const result = system.createShield({ elementId: 'ghost' });
            expect(result.error).toBe('INVALID_ELEMENT');
        });

        it('should trigger shieldCreated hook', () => {
            let called = false;
            system.registerHook('shieldCreated', () => { called = true; });
            system.createShield({ elementId: 'fire' });
            expect(called).toBe(true);
        });
    });

    describe('getShield', () => {
        it('should return', () => {
            const { shield } = system.createShield({ elementId: 'fire' });
            expect(system.getShield(shield.shieldId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getShield('ghost')).toBeNull(); });
    });

    describe('listShields', () => {
        it('should list all', () => {
            system.createShield({ elementId: 'fire' });
            expect(system.listShields().length).toBe(1);
        });
    });

    describe('listByElement', () => {
        it('should filter', () => {
            system.createShield({ elementId: 'fire' });
            system.createShield({ elementId: 'water' });
            expect(system.listByElement('fire').length).toBe(1);
        });
    });

    describe('listActive', () => {
        it('should filter', () => {
            const { shield } = system.createShield({ elementId: 'fire', strength: 10 });
            system.createShield({ elementId: 'water', strength: 0 });
            expect(system.listActive().length).toBe(1);
        });
    });

    describe('absorbDamage', () => {
        it('should absorb', () => {
            const { shield } = system.createShield({ elementId: 'fire', strength: 100 });
            const result = system.absorbDamage(shield.shieldId, 30);
            expect(result.absorbed).toBe(30);
        });

        it('should clamp to current', () => {
            const { shield } = system.createShield({ elementId: 'fire', strength: 10 });
            const result = system.absorbDamage(shield.shieldId, 50);
            expect(result.absorbed).toBe(10);
        });

        it('should trigger damageAbsorbed hook', () => {
            const { shield } = system.createShield({ elementId: 'fire' });
            let called = false;
            system.registerHook('damageAbsorbed', () => { called = true; });
            system.absorbDamage(shield.shieldId, 10);
            expect(called).toBe(true);
        });

        it('should trigger shieldBroken on 0', () => {
            const { shield } = system.createShield({ elementId: 'fire', strength: 5 });
            let called = false;
            system.registerHook('shieldBroken', () => { called = true; });
            system.absorbDamage(shield.shieldId, 10);
            expect(called).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.absorbDamage('ghost', 10);
            expect(result.error).toBe('SHIELD_NOT_FOUND');
        });
    });

    describe('repairShield', () => {
        it('should repair', () => {
            const { shield } = system.createShield({ elementId: 'fire', strength: 100 });
            shield.currentStrength = 50;
            system.repairShield(shield.shieldId, 30);
            expect(shield.currentStrength).toBe(80);
        });

        it('should cap at max strength', () => {
            const { shield } = system.createShield({ elementId: 'fire', strength: 100 });
            system.repairShield(shield.shieldId, 50);
            expect(shield.currentStrength).toBe(100);
        });

        it('should reject missing', () => {
            const result = system.repairShield('ghost', 10);
            expect(result.error).toBe('SHIELD_NOT_FOUND');
        });

        it('should trigger shieldRepaired hook', () => {
            const { shield } = system.createShield({ elementId: 'fire' });
            let called = false;
            system.registerHook('shieldRepaired', () => { called = true; });
            system.repairShield(shield.shieldId, 10);
            expect(called).toBe(true);
        });
    });

    describe('destroyShield', () => {
        it('should destroy', () => {
            const { shield } = system.createShield({ elementId: 'fire' });
            const result = system.destroyShield(shield.shieldId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.destroyShield('ghost');
            expect(result.error).toBe('SHIELD_NOT_FOUND');
        });

        it('should trigger shieldDestroyed hook', () => {
            const { shield } = system.createShield({ elementId: 'fire' });
            let called = false;
            system.registerHook('shieldDestroyed', () => { called = true; });
            system.destroyShield(shield.shieldId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTotalDefense', () => {
        it('should calculate', () => {
            system.createShield({ elementId: 'fire', strength: 50 });
            system.createShield({ elementId: 'water', strength: 30 });
            expect(system.calculateTotalDefense()).toBe(80);
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

        it('should execute default getShield', () => {
            const result = system.executeTool('getShield', { shieldId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('shieldCreated', () => count++);
            unregister();
            system.createShield({ elementId: 'fire' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('shieldCreated', () => { throw new Error('x'); });
            expect(() => system.createShield({ elementId: 'fire' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalShields = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalShields = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createShield({ elementId: 'fire' });
            const json = system.toJSON();
            expect(json.shields.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createShield({ elementId: 'fire' });
            const json = system.toJSON();
            const newSys = new ElementalShield();
            newSys.fromJSON(json);
            expect(newSys.shields.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.shieldCount).toBe(0);
        });
    });
});