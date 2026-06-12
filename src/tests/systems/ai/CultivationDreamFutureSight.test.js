/**
 * CultivationDreamFutureSight.test.js - 修真未来洞察测试
 * V873 Iteration 7/30 Round 34 - 测试覆盖率目标: 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDreamFutureSight, TIMELINES, CLARITY_LEVELS, REFINEMENT_RULES } from '../../../systems/ai/CultivationDreamFutureSight.js';

describe('CultivationDreamFutureSight', () => {
    let system;
    beforeEach(() => { system = new CultivationDreamFutureSight(); });

    describe('exports', () => {
        it('should export constants', () => {
            expect(TIMELINES.length).toBe(3);
            expect(CLARITY_LEVELS.length).toBe(5);
            expect(REFINEMENT_RULES.length).toBe(5);
        });
    });

    describe('constructor', () => {
        it('should accept custom config', () => {
            const s = new CultivationDreamFutureSight({ maxSights: 5, baseClarity: 0.5, maxRefinements: 3 });
            expect(s.config.maxRefinements).toBe(3);
        });
    });

    describe('glimpseFuture', () => {
        it('should glimpse', () => {
            const { sight } = system.glimpseFuture('d1', 'near');
            expect(sight.dreamId).toBe('d1');
            expect(sight.timeline).toBe('near');
            expect(sight.visionClarity).toBeGreaterThan(0);
        });
        it('should reject invalid timeline', () => {
            expect(system.glimpseFuture('d', 'invalid').error).toBe('INVALID_TIMELINE');
        });
        it('should trigger hook', () => {
            let called = false;
            system.registerHook('futureGlimpsed', () => { called = true; });
            system.glimpseFuture('d', 'far');
            expect(called).toBe(true);
        });
        it('should support all timelines', () => {
            for (const t of TIMELINES) {
                expect(system.glimpseFuture('d', t).success).toBe(true);
            }
        });
    });

    describe('refineVision', () => {
        it('should refine', () => {
            const { sight } = system.glimpseFuture('d', 'near');
            const r = system.refineVision(sight.id, 'focus');
            expect(r.visionClarity).toBeGreaterThan(0.2);
        });
        it('should reject missing', () => {
            expect(system.refineVision('ghost', 'focus').error).toBe('SIGHT_NOT_FOUND');
        });
        it('should reject locked', () => {
            const { sight } = system.glimpseFuture('d', 'near');
            system.lockProphecy(sight.id);
            expect(system.refineVision(sight.id, 'focus').error).toBe('SIGHT_LOCKED');
        });
        it('should reject max refinements', () => {
            const { sight } = system.glimpseFuture('d', 'near');
            for (let i = 0; i < 20; i++) system.refineVision(sight.id, 'focus');
            const r = system.refineVision(sight.id, 'focus');
            expect(r.error).toBe('MAX_REFINEMENTS');
        });
        it('should handle invalid feedback', () => {
            const { sight } = system.glimpseFuture('d', 'near');
            const r = system.refineVision(sight.id, 'invalid');
            expect(r.success).toBe(true);
        });
        it('should trigger hook', () => {
            const { sight } = system.glimpseFuture('d', 'near');
            let called = false;
            system.registerHook('visionRefined', () => { called = true; });
            system.refineVision(sight.id, 'focus');
            expect(called).toBe(true);
        });
    });

    describe('lockProphecy', () => {
        it('should lock', () => {
            const { sight } = system.glimpseFuture('d', 'near');
            const r = system.lockProphecy(sight.id);
            expect(r.success).toBe(true);
            expect(sight.locked).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.lockProphecy('ghost').error).toBe('SIGHT_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { sight } = system.glimpseFuture('d', 'near');
            let called = false;
            system.registerHook('prophecyLocked', () => { called = true; });
            system.lockProphecy(sight.id);
            expect(called).toBe(true);
        });
    });

    describe('unlockProphecy', () => {
        it('should unlock', () => {
            const { sight } = system.glimpseFuture('d', 'near');
            system.lockProphecy(sight.id);
            const r = system.unlockProphecy(sight.id);
            expect(r.success).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.unlockProphecy('ghost').error).toBe('SIGHT_NOT_FOUND');
        });
    });

    describe('list methods', () => {
        it('listSights', () => {
            system.glimpseFuture('d', 'near');
            expect(system.listSights().length).toBe(1);
        });
        it('listByTimeline', () => {
            system.glimpseFuture('d', 'near');
            system.glimpseFuture('d', 'far');
            expect(system.listByTimeline('near').length).toBe(1);
        });
        it('listByDream', () => {
            system.glimpseFuture('d1', 'near');
            expect(system.listByDream('d1').length).toBe(1);
        });
        it('listLocked', () => {
            const { sight } = system.glimpseFuture('d', 'near');
            system.lockProphecy(sight.id);
            expect(system.listLocked().length).toBe(1);
        });
    });

    describe('getClarityLevel', () => {
        it('should map', () => {
            expect(system.getClarityLevel(0.1)).toBe(CLARITY_LEVELS[0]);
            expect(system.getClarityLevel(0.9)).toBe(CLARITY_LEVELS[CLARITY_LEVELS.length - 1]);
        });
        it('should handle non-number', () => {
            expect(system.getClarityLevel(null)).toBe(CLARITY_LEVELS[0]);
        });
    });

    describe('deleteSight', () => {
        it('should delete', () => {
            const { sight } = system.glimpseFuture('d', 'near');
            expect(system.deleteSight(sight.id).success).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.deleteSight('ghost').error).toBe('SIGHT_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { sight } = system.glimpseFuture('d', 'near');
            let called = false;
            system.registerHook('sightDeleted', () => { called = true; });
            system.deleteSight(sight.id);
            expect(called).toBe(true);
        });
    });

    describe('tools and hooks', () => {
        it('should execute default tool', () => {
            const { sight } = system.glimpseFuture('d', 'near');
            const r = system.executeTool('getSight', { sightId: sight.id });
            expect(r.success).toBe(true);
        });
        it('should handle missing tool', () => {
            expect(system.executeTool('ghost').error).toBe('TOOL_NOT_FOUND');
        });
        it('should handle exception', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            expect(system.executeTool('bad').error).toBe('x');
        });
        it('should handle missing context for default tool', () => {
            const r = system.executeTool('getSight');
            expect(r.success).toBe(true);
            expect(r.result).toBeNull();
        });
        it('should list tools', () => {
            expect(system.listTools().length).toBe(2);
        });
        it('should unregister hook', () => {
            let count = 0;
            const off = system.registerHook('futureGlimpsed', () => { count++; });
            system.glimpseFuture('d', 'near');
            off();
            system.glimpseFuture('d', 'near');
            expect(count).toBe(1);
        });
        it('should catch handler errors', () => {
            system.registerHook('futureGlimpsed', () => { throw new Error('x'); });
            expect(() => system.glimpseFuture('d', 'near')).not.toThrow();
        });
    });

    describe('toJSON/fromJSON', () => {
        it('should round trip', () => {
            system.glimpseFuture('d', 'near');
            const json = system.toJSON();
            const s2 = new CultivationDreamFutureSight();
            expect(s2.fromJSON(json).success).toBe(true);
        });
        it('should handle empty fromJSON', () => {
            const s2 = new CultivationDreamFutureSight();
            expect(s2.fromJSON({}).success).toBe(true);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.glimpseFuture('d', 'near');
            const stats = system.getStats();
            expect(stats.totalGlimpsed).toBe(1);
            expect(stats.sightCount).toBe(1);
        });
    });
});
