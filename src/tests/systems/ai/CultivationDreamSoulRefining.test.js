/**
 * CultivationDreamSoulRefining.test.js - 修真灵魂淬炼测试
 * V867 Iteration 1/30 Round 34 - 测试覆盖率目标: 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDreamSoulRefining, SOUL_TECHNIQUES, IMPURITY_TYPES, PURITY_LEVELS } from '../../../systems/ai/CultivationDreamSoulRefining.js';

describe('CultivationDreamSoulRefining', () => {
    let system;
    beforeEach(() => { system = new CultivationDreamSoulRefining(); });

    describe('exports', () => {
        it('should export constants', () => {
            expect(SOUL_TECHNIQUES.length).toBe(3);
            expect(IMPURITY_TYPES.length).toBe(5);
            expect(PURITY_LEVELS.length).toBe(5);
        });
    });

    describe('constructor', () => {
        it('should accept custom config', () => {
            const s = new CultivationDreamSoulRefining({ maxRefinements: 10, basePurity: 0.2 });
            expect(s.config.maxRefinements).toBe(10);
            expect(s.config.basePurity).toBe(0.2);
        });
    });

    describe('startRefining', () => {
        it('should start refinement', () => {
            const { refinement } = system.startRefining('dream1', 'soul_purification');
            expect(refinement.dreamId).toBe('dream1');
            expect(refinement.technique).toBe('soul_purification');
            expect(refinement.status).toBe('in_progress');
            expect(refinement.impurityCount).toBe(5);
        });
        it('should reject invalid technique', () => {
            const r = system.startRefining('d', 'invalid');
            expect(r.error).toBe('INVALID_TECHNIQUE');
        });
        it('should trigger hook', () => {
            let called = false;
            system.registerHook('refiningStarted', () => { called = true; });
            system.startRefining('d', 'soul_fission');
            expect(called).toBe(true);
        });
        it('should support all techniques', () => {
            for (const t of SOUL_TECHNIQUES) {
                const r = system.startRefining('d', t);
                expect(r.success).toBe(true);
            }
        });
    });

    describe('getRefinement', () => {
        it('should return refinement', () => {
            const { refinement } = system.startRefining('d', 'soul_fusion');
            const got = system.getRefinement(refinement.id);
            expect(got.id).toBe(refinement.id);
        });
        it('should return null for missing', () => {
            expect(system.getRefinement('ghost')).toBeNull();
        });
    });

    describe('listRefinements', () => {
        it('should list', () => {
            system.startRefining('d', 'soul_purification');
            expect(system.listRefinements().length).toBe(1);
        });
    });

    describe('listByTechnique', () => {
        it('should filter', () => {
            system.startRefining('d', 'soul_purification');
            system.startRefining('d', 'soul_fission');
            expect(system.listByTechnique('soul_purification').length).toBe(1);
        });
    });

    describe('listByDream', () => {
        it('should filter by dream', () => {
            system.startRefining('d1', 'soul_purification');
            system.startRefining('d2', 'soul_fission');
            expect(system.listByDream('d1').length).toBe(1);
        });
    });

    describe('listCompleted', () => {
        it('should filter completed', () => {
            const { refinement } = system.startRefining('d', 'soul_fusion');
            system.completeRefining(refinement.id);
            expect(system.listCompleted().length).toBe(1);
        });
    });

    describe('purifySoul', () => {
        it('should purify', () => {
            const { refinement } = system.startRefining('d', 'soul_purification');
            const r = system.purifySoul(refinement.id, 'rage');
            expect(r.purity).toBeGreaterThan(0.1);
            expect(r.impurityCount).toBe(4);
        });
        it('should reject missing', () => {
            expect(system.purifySoul('ghost', 'rage').error).toBe('REFINEMENT_NOT_FOUND');
        });
        it('should reject invalid impurity', () => {
            const { refinement } = system.startRefining('d', 'soul_fission');
            expect(system.purifySoul(refinement.id, 'invalid').error).toBe('INVALID_IMPURITY');
        });
        it('should trigger hook', () => {
            const { refinement } = system.startRefining('d', 'soul_fission');
            let called = false;
            system.registerHook('soulPurified', () => { called = true; });
            system.purifySoul(refinement.id, 'rage');
            expect(called).toBe(true);
        });
        it('should cap purity', () => {
            const { refinement } = system.startRefining('d', 'soul_fission');
            for (let i = 0; i < 20; i++) system.purifySoul(refinement.id, 'rage');
            const got = system.getRefinement(refinement.id);
            expect(got.purity).toBe(1);
        });
    });

    describe('completeRefining', () => {
        it('should complete', () => {
            const { refinement } = system.startRefining('d', 'soul_fusion');
            const r = system.completeRefining(refinement.id);
            expect(r.success).toBe(true);
            expect(refinement.status).toBe('completed');
        });
        it('should reject missing', () => {
            expect(system.completeRefining('ghost').error).toBe('REFINEMENT_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { refinement } = system.startRefining('d', 'soul_fusion');
            let called = false;
            system.registerHook('refiningCompleted', () => { called = true; });
            system.completeRefining(refinement.id);
            expect(called).toBe(true);
        });
    });

    describe('raisePurity', () => {
        it('should raise', () => {
            const { refinement } = system.startRefining('d', 'soul_fusion');
            system.raisePurity(refinement.id, 0.2);
            const got = system.getRefinement(refinement.id);
            expect(got.purity).toBeCloseTo(0.3, 5);
        });
        it('should reject missing', () => {
            expect(system.raisePurity('ghost').error).toBe('REFINEMENT_NOT_FOUND');
        });
    });

    describe('getPurityLevel', () => {
        it('should map purity to level', () => {
            expect(system.getPurityLevel(0.1)).toBe(PURITY_LEVELS[0]);
            expect(system.getPurityLevel(0.9)).toBe(PURITY_LEVELS[PURITY_LEVELS.length - 1]);
        });
        it('should handle non-number', () => {
            expect(system.getPurityLevel(null)).toBe(PURITY_LEVELS[0]);
        });
    });

    describe('deleteRefinement', () => {
        it('should delete', () => {
            const { refinement } = system.startRefining('d', 'soul_fusion');
            expect(system.deleteRefinement(refinement.id).success).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.deleteRefinement('ghost').error).toBe('REFINEMENT_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { refinement } = system.startRefining('d', 'soul_fusion');
            let called = false;
            system.registerHook('refinementDeleted', () => { called = true; });
            system.deleteRefinement(refinement.id);
            expect(called).toBe(true);
        });
    });

    describe('registerTool/executeTool', () => {
        it('should execute default tools', () => {
            const { refinement } = system.startRefining('d', 'soul_fusion');
            const r = system.executeTool('getRefinement', { refinementId: refinement.id });
            expect(r.success).toBe(true);
        });
        it('should execute custom tool', () => {
            system.registerTool('myTool', () => 'ok');
            expect(system.executeTool('myTool').result).toBe('ok');
        });
        it('should handle missing tool', () => {
            expect(system.executeTool('ghost').error).toBe('TOOL_NOT_FOUND');
        });
        it('should handle exception', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            expect(system.executeTool('bad').error).toBe('boom');
        });
        it('should handle missing context', () => {
            expect(system.executeTool('getRefinement').error).toBeUndefined();
            const r = system.executeTool('getRefinement');
            expect(r.result).toBeNull();
        });
        it('should list tools', () => {
            expect(system.listTools().length).toBeGreaterThan(0);
        });
    });

    describe('registerHook', () => {
        it('should unregister', () => {
            let count = 0;
            const off = system.registerHook('refiningStarted', () => { count++; });
            system.startRefining('d', 'soul_fission');
            off();
            system.startRefining('d', 'soul_fission');
            expect(count).toBe(1);
        });
        it('should catch handler errors', () => {
            system.registerHook('refiningStarted', () => { throw new Error('x'); });
            expect(() => system.startRefining('d', 'soul_fission')).not.toThrow();
        });
    });

    describe('toJSON/fromJSON', () => {
        it('should round trip', () => {
            const { refinement } = system.startRefining('d', 'soul_fusion');
            const json = system.toJSON();
            const s2 = new CultivationDreamSoulRefining();
            expect(s2.fromJSON(json).success).toBe(true);
        });
        it('should handle empty fromJSON', () => {
            const s2 = new CultivationDreamSoulRefining();
            expect(s2.fromJSON({}).success).toBe(true);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.startRefining('d', 'soul_fusion');
            const stats = system.getStats();
            expect(stats.refinementCount).toBe(1);
            expect(stats.totalRefined).toBe(1);
        });
    });
});
