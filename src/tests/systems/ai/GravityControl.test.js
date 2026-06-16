/**
 * GravityControl.test.js - 重力掌控测试
 * V431 Iteration 8/15 Round 15 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GravityControl } from '../../../systems/ai/GravityControl.js';

describe('GravityControl', () => {
    let system;
    beforeEach(() => { system = new GravityControl(); });

    describe('createField', () => {
        it('should create a field', () => {
            const { field } = system.createField({ controllerId: 'g1', name: 'GroundGrip' });
            expect(field.controllerId).toBe('g1');
            expect(field.name).toBe('GroundGrip');
        });

        it('should use baseStrength default', () => {
            const { field } = system.createField({});
            expect(field.strength).toBe(10);
        });

        it('should default range to 5', () => {
            const { field } = system.createField({});
            expect(field.range).toBe(5);
        });

        it('should default mass to 10', () => {
            const { field } = system.createField({});
            expect(field.mass).toBe(10);
        });

        it('should default direction to down', () => {
            const { field } = system.createField({});
            expect(field.direction).toBe('down');
        });

        it('should default status to passive', () => {
            const { field } = system.createField({});
            expect(field.status).toBe('passive');
        });

        it('should use provided id', () => {
            const { field } = system.createField({ id: 'my_id' });
            expect(field.fieldId).toBe('my_id');
        });

        it('should trigger fieldCreated hook', () => {
            let called = false;
            system.registerHook('fieldCreated', () => { called = true; });
            system.createField({});
            expect(called).toBe(true);
        });
    });

    describe('getField', () => {
        it('should return field', () => {
            const { field } = system.createField({});
            expect(system.getField(field.fieldId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getField('ghost')).toBeNull(); });
    });

    describe('listFields', () => {
        it('should list all', () => {
            system.createField({});
            expect(system.listFields().length).toBe(1);
        });

        it('should return empty list when no fields', () => {
            expect(system.listFields().length).toBe(0);
        });
    });

    describe('listByController', () => {
        it('should filter by controller', () => {
            system.createField({ controllerId: 'g1' });
            system.createField({ controllerId: 'g2' });
            expect(system.listByController('g1').length).toBe(1);
        });

        it('should return empty for unknown controller', () => {
            system.createField({ controllerId: 'g1' });
            expect(system.listByController('ghost').length).toBe(0);
        });
    });

    describe('listActive', () => {
        it('should filter active and crushing statuses', () => {
            const { field: f1 } = system.createField({});
            f1.status = 'active';
            const { field: f2 } = system.createField({});
            f2.status = 'crushing';
            system.createField({});
            expect(system.listActive().length).toBe(2);
        });

        it('should return empty when no active', () => {
            system.createField({});
            expect(system.listActive().length).toBe(0);
        });
    });

    describe('increaseStrength', () => {
        it('should increase', () => {
            const { field } = system.createField({});
            system.increaseStrength(field.fieldId, 10);
            expect(field.strength).toBe(20);
        });

        it('should use default amount of 5', () => {
            const { field } = system.createField({});
            system.increaseStrength(field.fieldId);
            expect(field.strength).toBe(15);
        });

        it('should reject missing', () => {
            const result = system.increaseStrength('ghost', 10);
            expect(result.error).toBe('FIELD_NOT_FOUND');
        });

        it('should trigger strengthIncreased hook', () => {
            const { field } = system.createField({});
            let called = false;
            system.registerHook('strengthIncreased', () => { called = true; });
            system.increaseStrength(field.fieldId, 10);
            expect(called).toBe(true);
        });
    });

    describe('expandRange', () => {
        it('should expand', () => {
            const { field } = system.createField({});
            system.expandRange(field.fieldId, 5);
            expect(field.range).toBe(10);
        });

        it('should use default amount of 2', () => {
            const { field } = system.createField({});
            system.expandRange(field.fieldId);
            expect(field.range).toBe(7);
        });

        it('should reject missing', () => {
            const result = system.expandRange('ghost', 5);
            expect(result.error).toBe('FIELD_NOT_FOUND');
        });

        it('should trigger rangeExpanded hook', () => {
            const { field } = system.createField({});
            let called = false;
            system.registerHook('rangeExpanded', () => { called = true; });
            system.expandRange(field.fieldId, 5);
            expect(called).toBe(true);
        });
    });

    describe('reverseGravity', () => {
        it('should reverse down to up', () => {
            const { field } = system.createField({});
            system.reverseGravity(field.fieldId);
            expect(field.direction).toBe('up');
        });

        it('should reverse up to down on second call', () => {
            const { field } = system.createField({});
            system.reverseGravity(field.fieldId);
            system.reverseGravity(field.fieldId);
            expect(field.direction).toBe('down');
        });

        it('should reject missing', () => {
            const result = system.reverseGravity('ghost');
            expect(result.error).toBe('FIELD_NOT_FOUND');
        });

        it('should trigger gravityReversed hook', () => {
            const { field } = system.createField({});
            let called = false;
            system.registerHook('gravityReversed', () => { called = true; });
            system.reverseGravity(field.fieldId);
            expect(called).toBe(true);
        });
    });

    describe('deactivateField', () => {
        it('should set status to passive', () => {
            const { field } = system.createField({ status: 'active' });
            system.deactivateField(field.fieldId);
            expect(field.status).toBe('passive');
        });

        it('should set crushing to passive', () => {
            const { field } = system.createField({ status: 'crushing' });
            system.deactivateField(field.fieldId);
            expect(field.status).toBe('passive');
        });

        it('should reject missing', () => {
            const result = system.deactivateField('ghost');
            expect(result.error).toBe('FIELD_NOT_FOUND');
        });
    });

    describe('calculateGravityForce', () => {
        it('should calculate with default values', () => {
            const { field } = system.createField({});
            // strength=10, range=5, mass=10 -> 10 * (1 + 0.5) + 10 = 10*1.5+10 = 25
            expect(system.calculateGravityForce(field.fieldId)).toBe(25);
        });

        it('should reflect strength changes', () => {
            const { field } = system.createField({});
            system.increaseStrength(field.fieldId, 10);
            // strength=20, range=5, mass=10 -> 20*1.5+10 = 40
            expect(system.calculateGravityForce(field.fieldId)).toBe(40);
        });

        it('should reflect range changes', () => {
            const { field } = system.createField({});
            system.expandRange(field.fieldId, 5);
            // strength=10, range=10, mass=10 -> 10*(1+1)+10 = 30
            expect(system.calculateGravityForce(field.fieldId)).toBe(30);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateGravityForce('ghost')).toBe(0);
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

        it('should execute default getField', () => {
            const result = system.executeTool('getField', { fieldId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('fieldCreated', () => count++);
            unregister();
            system.createField({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('fieldCreated', () => { throw new Error('x'); });
            expect(() => system.createField({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalFields = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalFields = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createField({});
            const json = system.toJSON();
            expect(json.fields.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createField({});
            const json = system.toJSON();
            const newSys = new GravityControl();
            newSys.fromJSON(json);
            expect(newSys.fields.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.fieldCount).toBe(0);
        });
    });
});
