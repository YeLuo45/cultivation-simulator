/**
 * CultivationDreamReincarnationVision.test.js - 修真轮回幻视测试
 * V871 Iteration 5/30 Round 34 - 测试覆盖率目标: 99%+
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDreamReincarnationVision, LIFE_STAGES, VISION_SCENES, INTERPRETATION_DEPTH } from '../../../systems/ai/CultivationDreamReincarnationVision.js';

describe('CultivationDreamReincarnationVision', () => {
    let system;
    beforeEach(() => { system = new CultivationDreamReincarnationVision(); });

    describe('exports', () => {
        it('should export constants', () => {
            expect(LIFE_STAGES.length).toBe(3);
            expect(VISION_SCENES.length).toBe(10);
            expect(INTERPRETATION_DEPTH.length).toBe(5);
        });
    });

    describe('constructor', () => {
        it('should accept custom config', () => {
            const s = new CultivationDreamReincarnationVision({ maxVisions: 5, sceneCount: 5 });
            expect(s.config.sceneCount).toBe(5);
        });
    });

    describe('triggerVision', () => {
        it('should trigger', () => {
            const { vision } = system.triggerVision('d1', 'past');
            expect(vision.dreamId).toBe('d1');
            expect(vision.lifeStage).toBe('past');
            expect(vision.scenes.length).toBe(3);
        });
        it('should reject invalid stage', () => {
            expect(system.triggerVision('d', 'invalid').error).toBe('INVALID_STAGE');
        });
        it('should trigger hook', () => {
            let called = false;
            system.registerHook('visionTriggered', () => { called = true; });
            system.triggerVision('d', 'future');
            expect(called).toBe(true);
        });
        it('should support all stages', () => {
            for (const s of LIFE_STAGES) {
                expect(system.triggerVision('d', s).success).toBe(true);
            }
        });
    });

    describe('interpretVision', () => {
        it('should interpret', () => {
            const { vision } = system.triggerVision('d', 'past');
            const r = system.interpretVision(vision.id);
            expect(r.interpretation).toContain('past');
        });
        it('should reject missing', () => {
            expect(system.interpretVision('ghost').error).toBe('VISION_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { vision } = system.triggerVision('d', 'past');
            let called = false;
            system.registerHook('visionInterpreted', () => { called = true; });
            system.interpretVision(vision.id);
            expect(called).toBe(true);
        });
    });

    describe('acceptVision', () => {
        it('should accept', () => {
            const { vision } = system.triggerVision('d', 'past');
            const r = system.acceptVision(vision.id);
            expect(r.success).toBe(true);
            expect(vision.accepted).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.acceptVision('ghost').error).toBe('VISION_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { vision } = system.triggerVision('d', 'past');
            let called = false;
            system.registerHook('visionAccepted', () => { called = true; });
            system.acceptVision(vision.id);
            expect(called).toBe(true);
        });
    });

    describe('list methods', () => {
        it('listVisions', () => {
            system.triggerVision('d', 'past');
            expect(system.listVisions().length).toBe(1);
        });
        it('listByStage', () => {
            system.triggerVision('d', 'past');
            system.triggerVision('d', 'future');
            expect(system.listByStage('past').length).toBe(1);
        });
        it('listByDream', () => {
            system.triggerVision('d1', 'past');
            expect(system.listByDream('d1').length).toBe(1);
        });
        it('listAccepted', () => {
            const { vision } = system.triggerVision('d', 'past');
            system.acceptVision(vision.id);
            expect(system.listAccepted().length).toBe(1);
        });
    });

    describe('addScene', () => {
        it('should add', () => {
            const { vision } = system.triggerVision('d', 'past');
            const r = system.addScene(vision.id, 'mountain_peak');
            expect(r.success).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.addScene('ghost', 'mountain_peak').error).toBe('VISION_NOT_FOUND');
        });
        it('should reject invalid', () => {
            const { vision } = system.triggerVision('d', 'past');
            expect(system.addScene(vision.id, 'invalid').error).toBe('INVALID_SCENE');
        });
    });

    describe('getDepthName', () => {
        it('should map', () => {
            expect(system.getDepthName([1, 2, 3])).toBe(INTERPRETATION_DEPTH[3]);
        });
        it('should handle empty', () => {
            expect(system.getDepthName([])).toBe(INTERPRETATION_DEPTH[0]);
        });
        it('should handle non-array', () => {
            expect(system.getDepthName(null)).toBe(INTERPRETATION_DEPTH[0]);
        });
    });

    describe('deleteVision', () => {
        it('should delete', () => {
            const { vision } = system.triggerVision('d', 'past');
            expect(system.deleteVision(vision.id).success).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.deleteVision('ghost').error).toBe('VISION_NOT_FOUND');
        });
        it('should trigger hook', () => {
            const { vision } = system.triggerVision('d', 'past');
            let called = false;
            system.registerHook('visionDeleted', () => { called = true; });
            system.deleteVision(vision.id);
            expect(called).toBe(true);
        });
    });

    describe('tools and hooks', () => {
        it('should execute default tool', () => {
            const { vision } = system.triggerVision('d', 'past');
            const r = system.executeTool('getVision', { visionId: vision.id });
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
            const r = system.executeTool('getVision');
            expect(r.success).toBe(true);
            expect(r.result).toBeNull();
        });
        it('should list tools', () => {
            expect(system.listTools().length).toBe(2);
        });
        it('should unregister hook', () => {
            let count = 0;
            const off = system.registerHook('visionTriggered', () => { count++; });
            system.triggerVision('d', 'past');
            off();
            system.triggerVision('d', 'past');
            expect(count).toBe(1);
        });
        it('should catch handler errors', () => {
            system.registerHook('visionTriggered', () => { throw new Error('x'); });
            expect(() => system.triggerVision('d', 'past')).not.toThrow();
        });
    });

    describe('toJSON/fromJSON', () => {
        it('should round trip', () => {
            system.triggerVision('d', 'past');
            const json = system.toJSON();
            const s2 = new CultivationDreamReincarnationVision();
            expect(s2.fromJSON(json).success).toBe(true);
        });
        it('should handle empty fromJSON', () => {
            const s2 = new CultivationDreamReincarnationVision();
            expect(s2.fromJSON({}).success).toBe(true);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.triggerVision('d', 'past');
            const stats = system.getStats();
            expect(stats.totalTriggered).toBe(1);
            expect(stats.visionCount).toBe(1);
        });
    });
});
