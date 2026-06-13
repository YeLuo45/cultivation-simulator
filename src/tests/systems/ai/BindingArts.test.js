/**
 * BindingArts.test.js - 束缚术测试
 * V459 Iteration 6/15 Round 17 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BindingArts } from '../../../systems/ai/BindingArts.js';

describe('BindingArts', () => {
    let system;
    beforeEach(() => { system = new BindingArts(); });

    describe('castBinding', () => {
        it('should cast', () => {
            const { binding } = system.castBinding({ binderId: 'b1' });
            expect(binding.binderId).toBe('b1');
        });

        it('should use default type rope', () => {
            const { binding } = system.castBinding({});
            expect(binding.type).toBe('rope');
        });

        it('should use default name', () => {
            const { binding } = system.castBinding({});
            expect(binding.name).toBe('unnamed_binding');
        });

        it('should trigger bindingCast hook', () => {
            let called = false;
            system.registerHook('bindingCast', () => { called = true; });
            system.castBinding({});
            expect(called).toBe(true);
        });
    });

    describe('getBinding', () => {
        it('should return', () => {
            const { binding } = system.castBinding({});
            expect(system.getBinding(binding.bindingId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBinding('ghost')).toBeNull(); });
    });

    describe('listBindings', () => {
        it('should list all', () => {
            system.castBinding({});
            expect(system.listBindings().length).toBe(1);
        });
    });

    describe('listByBinder', () => {
        it('should filter', () => {
            system.castBinding({ binderId: 'b1' });
            system.castBinding({ binderId: 'b2' });
            expect(system.listByBinder('b1').length).toBe(1);
        });

        it('should return empty for unknown binder', () => {
            system.castBinding({ binderId: 'b1' });
            expect(system.listByBinder('unknown').length).toBe(0);
        });
    });

    describe('listByType', () => {
        it('should filter by rope', () => {
            system.castBinding({ type: 'rope' });
            system.castBinding({ type: 'spiritual' });
            expect(system.listByType('rope').length).toBe(1);
        });

        it('should filter by spiritual', () => {
            system.castBinding({ type: 'rope' });
            system.castBinding({ type: 'spiritual' });
            system.castBinding({ type: 'soul' });
            expect(system.listByType('spiritual').length).toBe(1);
        });

        it('should return empty for unknown type', () => {
            system.castBinding({ type: 'rope' });
            expect(system.listByType('unknown').length).toBe(0);
        });
    });

    describe('tightenBinding', () => {
        it('should tighten', () => {
            const { binding } = system.castBinding({});
            system.tightenBinding(binding.bindingId, 10);
            expect(binding.strength).toBe(25);
        });

        it('should use default amount', () => {
            const { binding } = system.castBinding({});
            system.tightenBinding(binding.bindingId);
            expect(binding.strength).toBe(20);
        });

        it('should reject missing', () => {
            const result = system.tightenBinding('ghost', 10);
            expect(result.error).toBe('BINDING_NOT_FOUND');
        });

        it('should trigger bindingTightened hook', () => {
            const { binding } = system.castBinding({});
            let called = false;
            system.registerHook('bindingTightened', () => { called = true; });
            system.tightenBinding(binding.bindingId, 5);
            expect(called).toBe(true);
        });
    });

    describe('extendBinding', () => {
        it('should extend', () => {
            const { binding } = system.castBinding({});
            system.extendBinding(binding.bindingId, 20);
            expect(binding.duration).toBe(50);
        });

        it('should use default amount', () => {
            const { binding } = system.castBinding({});
            system.extendBinding(binding.bindingId);
            expect(binding.duration).toBe(40);
        });

        it('should reject missing', () => {
            const result = system.extendBinding('ghost', 10);
            expect(result.error).toBe('BINDING_NOT_FOUND');
        });

        it('should trigger bindingExtended hook', () => {
            const { binding } = system.castBinding({});
            let called = false;
            system.registerHook('bindingExtended', () => { called = true; });
            system.extendBinding(binding.bindingId, 5);
            expect(called).toBe(true);
        });
    });

    describe('addTarget', () => {
        it('should add target', () => {
            const { binding } = system.castBinding({});
            system.addTarget(binding.bindingId, 'target1');
            expect(binding.targets.length).toBe(1);
        });

        it('should add multiple targets', () => {
            const { binding } = system.castBinding({});
            system.addTarget(binding.bindingId, 't1');
            system.addTarget(binding.bindingId, 't2');
            expect(binding.targets.length).toBe(2);
        });

        it('should set status to active when target added', () => {
            const { binding } = system.castBinding({});
            system.addTarget(binding.bindingId, 't1');
            expect(binding.status).toBe('active');
        });

        it('should reject missing', () => {
            const result = system.addTarget('ghost', 't1');
            expect(result.error).toBe('BINDING_NOT_FOUND');
        });
    });

    describe('severBinding', () => {
        it('should sever', () => {
            const { binding } = system.castBinding({});
            system.severBinding(binding.bindingId);
            expect(binding.status).toBe('severed');
        });

        it('should reject missing', () => {
            const result = system.severBinding('ghost');
            expect(result.error).toBe('BINDING_NOT_FOUND');
        });

        it('should trigger bindingSevered hook', () => {
            const { binding } = system.castBinding({});
            let called = false;
            system.registerHook('bindingSevered', () => { called = true; });
            system.severBinding(binding.bindingId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBindingPower', () => {
        it('should calculate', () => {
            const { binding } = system.castBinding({});
            // strength(15) * (1 + 30/100) + 0 * 3 = 15 * 1.3 = 19.5
            expect(system.calculateBindingPower(binding.bindingId)).toBeCloseTo(19.5, 5);
        });

        it('should include target bonus', () => {
            const { binding } = system.castBinding({});
            system.addTarget(binding.bindingId, 't1');
            system.addTarget(binding.bindingId, 't2');
            // 15 * 1.3 + 2 * 3 = 19.5 + 6 = 25.5
            expect(system.calculateBindingPower(binding.bindingId)).toBeCloseTo(25.5, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBindingPower('ghost')).toBe(0);
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

        it('should execute default getBinding', () => {
            const result = system.executeTool('getBinding', { bindingId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('bindingCast', () => count++);
            unregister();
            system.castBinding({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('bindingCast', () => { throw new Error('x'); });
            expect(() => system.castBinding({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBindings = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBindings = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.castBinding({});
            const json = system.toJSON();
            expect(json.bindings.length).toBe(1);
        });
        it('should deserialize', () => {
            system.castBinding({});
            const json = system.toJSON();
            const newSys = new BindingArts();
            newSys.fromJSON(json);
            expect(newSys.bindings.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.bindingCount).toBe(0);
        });
    });
});
