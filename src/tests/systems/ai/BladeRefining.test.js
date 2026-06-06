/**
 * BladeRefining.test.js - 刀刃打磨系统测试
 * V513 Iteration 15/15 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BladeRefining } from '../../../systems/ai/BladeRefining.js';

describe('BladeRefining', () => {
    let system;
    beforeEach(() => { system = new BladeRefining(); });

    describe('refineBlade', () => {
        it('should refine a blade', () => {
            const { blade } = system.refineBlade({ refinerId: 'r1', name: 'Saber', edge: 50 });
            expect(blade.name).toBe('Saber');
            expect(blade.refinerId).toBe('r1');
            expect(blade.edge).toBe(50);
        });

        it('should set default name', () => {
            const { blade } = system.refineBlade({});
            expect(blade.name).toBe('Unnamed Blade');
        });

        it('should use baseEdge default', () => {
            const { blade } = system.refineBlade({});
            expect(blade.edge).toBe(20);
        });

        it('should default polishing to 0', () => {
            const { blade } = system.refineBlade({});
            expect(blade.polishing).toBe(0);
        });

        it('should start with empty oils', () => {
            const { blade } = system.refineBlade({});
            expect(blade.oils).toEqual([]);
        });

        it('should start with status raw', () => {
            const { blade } = system.refineBlade({});
            expect(blade.status).toBe('raw');
        });

        it('should trigger bladeRefined hook', () => {
            let called = false;
            system.registerHook('bladeRefined', () => { called = true; });
            system.refineBlade({});
            expect(called).toBe(true);
        });

        it('should reject when max reached', () => {
            const small = new BladeRefining({ maxBlades: 2 });
            small.refineBlade({});
            small.refineBlade({});
            const result = small.refineBlade({});
            expect(result.error).toBe('MAX_BLADES_REACHED');
        });

        it('should accept pre-populated oils', () => {
            const { blade } = system.refineBlade({ oils: ['dragon', 'phoenix'] });
            expect(blade.oils.length).toBe(2);
        });
    });

    describe('getBlade', () => {
        it('should return a blade', () => {
            const { blade } = system.refineBlade({});
            expect(system.getBlade(blade.bladeId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getBlade('ghost')).toBeNull();
        });

        it('should return a copy not reference', () => {
            const { blade } = system.refineBlade({});
            const got = system.getBlade(blade.bladeId);
            got.name = 'Modified';
            expect(blade.name).not.toBe('Modified');
        });
    });

    describe('listBlades', () => {
        it('should list all', () => {
            system.refineBlade({});
            system.refineBlade({});
            expect(system.listBlades().length).toBe(2);
        });

        it('should return empty array when no blades', () => {
            expect(system.listBlades()).toEqual([]);
        });
    });

    describe('listByRefiner', () => {
        it('should filter by refinerId', () => {
            system.refineBlade({ refinerId: 'r1' });
            system.refineBlade({ refinerId: 'r2' });
            expect(system.listByRefiner('r1').length).toBe(1);
        });

        it('should return empty when none match', () => {
            system.refineBlade({ refinerId: 'r1' });
            expect(system.listByRefiner('r2').length).toBe(0);
        });
    });

    describe('listMastered', () => {
        it('should filter by mastered status', () => {
            const { blade: b1 } = system.refineBlade({});
            const { blade: b2 } = system.refineBlade({});
            system.masterBlade(b1.bladeId);
            expect(system.listMastered().length).toBe(1);
        });

        it('should return empty when none mastered', () => {
            system.refineBlade({});
            expect(system.listMastered().length).toBe(0);
        });
    });

    describe('addOil', () => {
        it('should add an oil', () => {
            const { blade } = system.refineBlade({});
            system.addOil(blade.bladeId, 'dragon');
            expect(blade.oils).toContain('dragon');
        });

        it('should add multiple oils', () => {
            const { blade } = system.refineBlade({});
            system.addOil(blade.bladeId, 'a');
            system.addOil(blade.bladeId, 'b');
            expect(blade.oils.length).toBe(2);
        });

        it('should reject missing blade', () => {
            const result = system.addOil('ghost', 'dragon');
            expect(result.error).toBe('BLADE_NOT_FOUND');
        });

        it('should trigger oilAdded hook', () => {
            const { blade } = system.refineBlade({});
            let called = false;
            system.registerHook('oilAdded', () => { called = true; });
            system.addOil(blade.bladeId, 'dragon');
            expect(called).toBe(true);
        });
    });

    describe('increaseEdge', () => {
        it('should increase edge', () => {
            const { blade } = system.refineBlade({});
            system.increaseEdge(blade.bladeId, 10);
            expect(blade.edge).toBe(30);
        });

        it('should use default amount 5', () => {
            const { blade } = system.refineBlade({});
            system.increaseEdge(blade.bladeId);
            expect(blade.edge).toBe(25);
        });

        it('should change status to refined at 100', () => {
            const { blade } = system.refineBlade({ edge: 95 });
            system.increaseEdge(blade.bladeId, 10);
            expect(blade.status).toBe('refined');
        });

        it('should not downgrade status once refined', () => {
            const { blade } = system.refineBlade({ edge: 100 });
            blade.status = 'refined';
            system.increaseEdge(blade.bladeId, 5);
            expect(blade.status).toBe('refined');
        });

        it('should reject missing blade', () => {
            const result = system.increaseEdge('ghost', 5);
            expect(result.error).toBe('BLADE_NOT_FOUND');
        });

        it('should trigger edgeIncreased hook', () => {
            const { blade } = system.refineBlade({});
            let called = false;
            system.registerHook('edgeIncreased', () => { called = true; });
            system.increaseEdge(blade.bladeId, 5);
            expect(called).toBe(true);
        });
    });

    describe('polishBlade', () => {
        it('should increase polishing', () => {
            const { blade } = system.refineBlade({});
            system.polishBlade(blade.bladeId, 10);
            expect(blade.polishing).toBe(10);
        });

        it('should use default amount 5', () => {
            const { blade } = system.refineBlade({});
            system.polishBlade(blade.bladeId);
            expect(blade.polishing).toBe(5);
        });

        it('should reject missing blade', () => {
            const result = system.polishBlade('ghost', 5);
            expect(result.error).toBe('BLADE_NOT_FOUND');
        });

        it('should trigger bladePolished hook', () => {
            const { blade } = system.refineBlade({});
            let called = false;
            system.registerHook('bladePolished', () => { called = true; });
            system.polishBlade(blade.bladeId, 5);
            expect(called).toBe(true);
        });
    });

    describe('masterBlade', () => {
        it('should set status to mastered', () => {
            const { blade } = system.refineBlade({});
            system.masterBlade(blade.bladeId);
            expect(blade.status).toBe('mastered');
        });

        it('should reject missing blade', () => {
            const result = system.masterBlade('ghost');
            expect(result.error).toBe('BLADE_NOT_FOUND');
        });

        it('should trigger bladeMastered hook', () => {
            const { blade } = system.refineBlade({});
            let called = false;
            system.registerHook('bladeMastered', () => { called = true; });
            system.masterBlade(blade.bladeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBladeValue', () => {
        it('should calculate value with default blade', () => {
            const { blade } = system.refineBlade({});
            // edge=20, polishing=0, oils=0 -> 20*2 + 0 + 0*10 = 40
            expect(system.calculateBladeValue(blade.bladeId)).toBe(40);
        });

        it('should include polishing', () => {
            const { blade } = system.refineBlade({ edge: 50 });
            system.polishBlade(blade.bladeId, 20);
            // edge=50, polishing=20, oils=0 -> 50*2 + 20 + 0*10 = 120
            expect(system.calculateBladeValue(blade.bladeId)).toBe(120);
        });

        it('should include oils', () => {
            const { blade } = system.refineBlade({ edge: 50 });
            system.addOil(blade.bladeId, 'a');
            system.addOil(blade.bladeId, 'b');
            // edge=50, polishing=0, oils=2 -> 50*2 + 0 + 2*10 = 120
            expect(system.calculateBladeValue(blade.bladeId)).toBe(120);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBladeValue('ghost')).toBe(0);
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

        it('should execute default getBlade tool', () => {
            const result = system.executeTool('getBlade', { bladeId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('bladeRefined', () => count++);
            unregister();
            system.refineBlade({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('bladeRefined', () => { throw new Error('x'); });
            expect(() => system.refineBlade({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient blades', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when threshold met', () => {
            system.stats.totalBlades = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalBlades = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.refineBlade({});
            const json = system.toJSON();
            expect(json.blades.length).toBe(1);
        });

        it('should deserialize', () => {
            system.refineBlade({});
            const json = system.toJSON();
            const newSys = new BladeRefining();
            newSys.fromJSON(json);
            expect(newSys.blades.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with bladeCount', () => {
            const stats = system.getStats();
            expect(stats.bladeCount).toBe(0);
            expect(stats.totalBlades).toBe(0);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
