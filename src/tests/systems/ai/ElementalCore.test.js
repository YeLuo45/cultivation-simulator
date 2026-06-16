/**
 * ElementalCore.test.js - 五行核心测试
 * V358 Iteration 1/9 Round 9 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ElementalCore } from '../../../systems/ai/ElementalCore.js';

describe('ElementalCore', () => {
    let system;
    beforeEach(() => { system = new ElementalCore(); });

    describe('Default Elements', () => {
        it('should have 5 default elements', () => { expect(system.elements.size).toBe(5); });
        it('should contain metal', () => { expect(system.getElement('metal')).not.toBeNull(); });
    });

    describe('getElement', () => {
        it('should return', () => { expect(system.getElement('metal')).not.toBeNull(); });
        it('should return null for missing', () => { expect(system.getElement('ghost')).toBeNull(); });
    });

    describe('listElements', () => {
        it('should list all', () => { expect(system.listElements().length).toBe(5); });
    });

    describe('addElement', () => {
        it('should add', () => {
            const { element } = system.addElement({ name: 'Light' });
            expect(element.name).toBe('Light');
        });

        it('should trigger elementAdded hook', () => {
            let called = false;
            system.registerHook('elementAdded', () => { called = true; });
            system.addElement({});
            expect(called).toBe(true);
        });
    });

    describe('registerCultivator', () => {
        it('should register', () => {
            const { cultivator } = system.registerCultivator({ name: 'C1' });
            expect(cultivator.name).toBe('C1');
        });
    });

    describe('getCultivator', () => {
        it('should return', () => {
            const { cultivator } = system.registerCultivator({});
            expect(system.getCultivator(cultivator.cultivatorId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCultivator('ghost')).toBeNull(); });
    });

    describe('listCultivators', () => {
        it('should list all', () => {
            system.registerCultivator({});
            expect(system.listCultivators().length).toBe(1);
        });
    });

    describe('setAffinity', () => {
        it('should set', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.setAffinity(cultivator.cultivatorId, 'metal', 0.8);
            expect(result.success).toBe(true);
        });

        it('should cap at 1', () => {
            const { cultivator } = system.registerCultivator({});
            system.setAffinity(cultivator.cultivatorId, 'metal', 99);
            expect(cultivator.affinities.metal).toBe(1);
        });

        it('should cap at 0', () => {
            const { cultivator } = system.registerCultivator({});
            system.setAffinity(cultivator.cultivatorId, 'metal', -1);
            expect(cultivator.affinities.metal).toBe(0);
        });

        it('should reject missing cultivator', () => {
            const result = system.setAffinity('ghost', 'metal', 0.5);
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should reject missing element', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.setAffinity(cultivator.cultivatorId, 'ghost', 0.5);
            expect(result.error).toBe('ELEMENT_NOT_FOUND');
        });

        it('should set primary element', () => {
            const { cultivator } = system.registerCultivator({});
            system.setAffinity(cultivator.cultivatorId, 'fire', 0.9);
            expect(cultivator.primaryElement).toBe('fire');
        });

        it('should trigger affinityChanged hook', () => {
            const { cultivator } = system.registerCultivator({});
            let called = false;
            system.registerHook('affinityChanged', () => { called = true; });
            system.setAffinity(cultivator.cultivatorId, 'fire', 0.5);
            expect(called).toBe(true);
        });
    });

    describe('getAffinity', () => {
        it('should return', () => {
            const { cultivator } = system.registerCultivator({});
            system.setAffinity(cultivator.cultivatorId, 'fire', 0.7);
            expect(system.getAffinity(cultivator.cultivatorId, 'fire')).toBe(0.7);
        });

        it('should return 0 for uninitialized', () => {
            const { cultivator } = system.registerCultivator({});
            expect(system.getAffinity(cultivator.cultivatorId, 'fire')).toBe(0);
        });

        it('should return null for missing cultivator', () => {
            expect(system.getAffinity('ghost', 'fire')).toBeNull();
        });
    });

    describe('getPrimaryElement', () => {
        it('should return', () => {
            const { cultivator } = system.registerCultivator({});
            system.setAffinity(cultivator.cultivatorId, 'wood', 0.8);
            expect(system.getPrimaryElement(cultivator.cultivatorId)).toBe('wood');
        });

        it('should return null for missing', () => {
            expect(system.getPrimaryElement('ghost')).toBeNull();
        });
    });

    describe('listByElement', () => {
        it('should filter', () => {
            const { cultivator: c1 } = system.registerCultivator({});
            const { cultivator: c2 } = system.registerCultivator({});
            system.setAffinity(c1.cultivatorId, 'fire', 0.9);
            system.setAffinity(c2.cultivatorId, 'water', 0.9);
            expect(system.listByElement('fire').length).toBe(1);
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

        it('should execute default getElement', () => {
            const result = system.executeTool('getElement', { elementId: 'metal' });
            expect(result.result.elementId).toBe('metal');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('elementAdded', () => count++);
            unregister();
            system.addElement({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('elementAdded', () => { throw new Error('x'); });
            expect(() => system.addElement({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalElements = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalElements = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerCultivator({});
            const json = system.toJSON();
            expect(json.cultivators.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerCultivator({});
            const json = system.toJSON();
            const newSys = new ElementalCore();
            newSys.fromJSON(json);
            expect(newSys.cultivators.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.elementCount).toBe(5);
        });
    });
});