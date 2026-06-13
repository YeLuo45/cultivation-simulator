/**
 * DreamVision.test.js - 梦境系统测试
 * V346 Iteration 7/9 Round 7 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DreamVision } from '../../../systems/ai/DreamVision.js';

describe('DreamVision', () => {
    let system;
    beforeEach(() => { system = new DreamVision(); });

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

    describe('dream', () => {
        it('should dream', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.dream(cultivator.cultivatorId, 'fire', 0.8);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.dream('ghost', 'fire', 0.5);
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should increment dreamCount', () => {
            const { cultivator } = system.registerCultivator({});
            system.dream(cultivator.cultivatorId, 'fire', 0.5);
            expect(cultivator.dreamCount).toBe(1);
        });

        it('should have symbols', () => {
            const { cultivator } = system.registerCultivator({});
            const { dream } = system.dream(cultivator.cultivatorId, 'fire', 0.8);
            expect(dream.symbols.length).toBeGreaterThan(0);
        });

        it('should trigger dreamHad hook', () => {
            const { cultivator } = system.registerCultivator({});
            let called = false;
            system.registerHook('dreamHad', () => { called = true; });
            system.dream(cultivator.cultivatorId, 'fire', 0.5);
            expect(called).toBe(true);
        });
    });

    describe('getDream', () => {
        it('should return', () => {
            const { cultivator } = system.registerCultivator({});
            const { dream } = system.dream(cultivator.cultivatorId, 'fire', 0.5);
            expect(system.getDream(dream.dreamId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDream('ghost')).toBeNull(); });
    });

    describe('listDreams', () => {
        it('should list all', () => {
            const { cultivator } = system.registerCultivator({});
            system.dream(cultivator.cultivatorId, 'fire', 0.5);
            expect(system.listDreams().length).toBe(1);
        });
    });

    describe('listDreamsByCultivator', () => {
        it('should filter', () => {
            const { cultivator: c1 } = system.registerCultivator({});
            const { cultivator: c2 } = system.registerCultivator({});
            system.dream(c1.cultivatorId, 'fire', 0.5);
            system.dream(c2.cultivatorId, 'water', 0.5);
            expect(system.listDreamsByCultivator(c1.cultivatorId).length).toBe(1);
        });
    });

    describe('listDreamsByTheme', () => {
        it('should filter', () => {
            const { cultivator } = system.registerCultivator({});
            system.dream(cultivator.cultivatorId, 'fire', 0.5);
            system.dream(cultivator.cultivatorId, 'water', 0.5);
            expect(system.listDreamsByTheme('fire').length).toBe(1);
        });
    });

    describe('interpret', () => {
        it('should interpret', () => {
            const { cultivator } = system.registerCultivator({});
            const { dream } = system.dream(cultivator.cultivatorId, 'fire', 0.8);
            const result = system.interpret(dream.dreamId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.interpret('ghost');
            expect(result.error).toBe('DREAM_NOT_FOUND');
        });

        it('should trigger dreamInterpreted hook', () => {
            const { cultivator } = system.registerCultivator({});
            const { dream } = system.dream(cultivator.cultivatorId, 'fire', 0.5);
            let called = false;
            system.registerHook('dreamInterpreted', () => { called = true; });
            system.interpret(dream.dreamId);
            expect(called).toBe(true);
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

        it('should execute default getDream', () => {
            const result = system.executeTool('getDream', { dreamId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('dreamHad', () => count++);
            unregister();
            const { cultivator } = system.registerCultivator({});
            system.dream(cultivator.cultivatorId, 'fire', 0.5);
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('dreamHad', () => { throw new Error('x'); });
            const { cultivator } = system.registerCultivator({});
            expect(() => system.dream(cultivator.cultivatorId, 'fire', 0.5)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDreams = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDreams = 10;
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
            const newSys = new DreamVision();
            newSys.fromJSON(json);
            expect(newSys.cultivators.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.dreamCount).toBe(0);
        });
    });
});