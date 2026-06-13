/**
 * SoulRefiningSystem.test.js - 灵魂修炼测试
 * V368 Iteration 2/9 Round 10 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SoulRefiningSystem } from '../../../systems/ai/SoulRefiningSystem.js';

describe('SoulRefiningSystem', () => {
    let system;
    beforeEach(() => { system = new SoulRefiningSystem(); });

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

    describe('startRefinement', () => {
        it('should start', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.startRefinement(cultivator.cultivatorId, 'meditation');
            expect(result.success).toBe(true);
        });

        it('should reject missing cultivator', () => {
            const result = system.startRefinement('ghost', 'meditation');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should reject invalid method', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.startRefinement(cultivator.cultivatorId, 'ghost');
            expect(result.error).toBe('INVALID_METHOD');
        });

        it('should trigger refinementStarted hook', () => {
            const { cultivator } = system.registerCultivator({});
            let called = false;
            system.registerHook('refinementStarted', () => { called = true; });
            system.startRefinement(cultivator.cultivatorId, 'meditation');
            expect(called).toBe(true);
        });
    });

    describe('advanceRefinement', () => {
        it('should advance', () => {
            const { cultivator } = system.registerCultivator({});
            const { refinement } = system.startRefinement(cultivator.cultivatorId, 'meditation');
            const result = system.advanceRefinement(refinement.refinementId, 20);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.advanceRefinement('ghost', 20);
            expect(result.error).toBe('REFINEMENT_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { cultivator } = system.registerCultivator({});
            const { refinement } = system.startRefinement(cultivator.cultivatorId, 'meditation');
            refinement.status = 'completed';
            const result = system.advanceRefinement(refinement.refinementId, 20);
            expect(result.error).toBe('REFINEMENT_INACTIVE');
        });
    });

    describe('completeRefinement', () => {
        it('should complete', () => {
            const { cultivator } = system.registerCultivator({});
            const { refinement } = system.startRefinement(cultivator.cultivatorId, 'meditation');
            refinement.progress = 100;
            const result = system.completeRefinement(refinement.refinementId);
            expect(result.success).toBe(true);
        });

        it('should grant exp', () => {
            const { cultivator } = system.registerCultivator({});
            const { refinement } = system.startRefinement(cultivator.cultivatorId, 'meditation');
            refinement.progress = 100;
            system.completeRefinement(refinement.refinementId);
            expect(cultivator.soulExp).toBeGreaterThan(0);
        });

        it('should trigger refinementCompleted hook', () => {
            const { cultivator } = system.registerCultivator({});
            const { refinement } = system.startRefinement(cultivator.cultivatorId, 'meditation');
            refinement.progress = 100;
            let called = false;
            system.registerHook('refinementCompleted', () => { called = true; });
            system.completeRefinement(refinement.refinementId);
            expect(called).toBe(true);
        });

        it('should trigger soulLevelUp', () => {
            const { cultivator } = system.registerCultivator({});
            const { refinement } = system.startRefinement(cultivator.cultivatorId, 'meditation');
            refinement.progress = 100;
            cultivator.soulExp = 100;
            let called = false;
            system.registerHook('soulLevelUp', () => { called = true; });
            system.completeRefinement(refinement.refinementId);
            expect(called).toBe(true);
        });
    });

    describe('interruptRefinement', () => {
        it('should interrupt', () => {
            const { cultivator } = system.registerCultivator({});
            const { refinement } = system.startRefinement(cultivator.cultivatorId, 'meditation');
            const result = system.interruptRefinement(refinement.refinementId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.interruptRefinement('ghost');
            expect(result.error).toBe('REFINEMENT_NOT_FOUND');
        });

        it('should trigger refinementInterrupted hook', () => {
            const { cultivator } = system.registerCultivator({});
            const { refinement } = system.startRefinement(cultivator.cultivatorId, 'meditation');
            let called = false;
            system.registerHook('refinementInterrupted', () => { called = true; });
            system.interruptRefinement(refinement.refinementId);
            expect(called).toBe(true);
        });
    });

    describe('listMethods', () => {
        it('should list all', () => { expect(system.listMethods().length).toBe(4); });
    });

    describe('getRefinement', () => {
        it('should return', () => {
            const { cultivator } = system.registerCultivator({});
            const { refinement } = system.startRefinement(cultivator.cultivatorId, 'meditation');
            expect(system.getRefinement(refinement.refinementId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRefinement('ghost')).toBeNull(); });
    });

    describe('listRefinements', () => {
        it('should list all', () => {
            const { cultivator } = system.registerCultivator({});
            system.startRefinement(cultivator.cultivatorId, 'meditation');
            expect(system.listRefinements().length).toBe(1);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            const { cultivator: c1 } = system.registerCultivator({});
            const { cultivator: c2 } = system.registerCultivator({});
            system.startRefinement(c1.cultivatorId, 'meditation');
            system.startRefinement(c2.cultivatorId, 'meditation');
            expect(system.listByCultivator(c1.cultivatorId).length).toBe(1);
        });
    });

    describe('listByMethod', () => {
        it('should filter', () => {
            const { cultivator } = system.registerCultivator({});
            system.startRefinement(cultivator.cultivatorId, 'meditation');
            system.startRefinement(cultivator.cultivatorId, 'tantra');
            expect(system.listByMethod('meditation').length).toBe(1);
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

        it('should execute default getCultivator', () => {
            const result = system.executeTool('getCultivator', { cultivatorId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('refinementStarted', () => count++);
            unregister();
            const { cultivator } = system.registerCultivator({});
            system.startRefinement(cultivator.cultivatorId, 'meditation');
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('refinementStarted', () => { throw new Error('x'); });
            const { cultivator } = system.registerCultivator({});
            expect(() => system.startRefinement(cultivator.cultivatorId, 'meditation')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalRefinements = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalRefinements = 10;
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
            const newSys = new SoulRefiningSystem();
            newSys.fromJSON(json);
            expect(newSys.cultivators.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.cultivatorCount).toBe(0);
        });
    });
});