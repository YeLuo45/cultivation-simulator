/**
 * CultivationEye.test.js - 道眼系统测试
 * V521 Iteration 3/20 Round 21 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationEye } from '../../../systems/ai/CultivationEye.js';

describe('CultivationEye', () => {
    let system;
    beforeEach(() => { system = new CultivationEye(); });

    describe('openEye', () => {
        it('should open eye', () => {
            const { eye } = system.openEye({ cultivatorId: 'c1', name: 'Heavenly Eye' });
            expect(eye.cultivatorId).toBe('c1');
            expect(eye.name).toBe('Heavenly Eye');
        });

        it('should default to open status', () => {
            const { eye } = system.openEye({});
            expect(eye.status).toBe('open');
        });

        it('should default type to heavenly', () => {
            const { eye } = system.openEye({});
            expect(eye.type).toBe('heavenly');
        });

        it('should default perception to basePerception', () => {
            const { eye } = system.openEye({});
            expect(eye.perception).toBe(20);
        });

        it('should start at level 1', () => {
            const { eye } = system.openEye({});
            expect(eye.level).toBe(1);
        });

        it('should start with empty visions', () => {
            const { eye } = system.openEye({});
            expect(eye.visions).toEqual([]);
        });

        it('should trigger eyeOpened hook', () => {
            let called = false;
            system.registerHook('eyeOpened', () => { called = true; });
            system.openEye({});
            expect(called).toBe(true);
        });
    });

    describe('getEye', () => {
        it('should return', () => {
            const { eye } = system.openEye({});
            expect(system.getEye(eye.eyeId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getEye('ghost')).toBeNull(); });
    });

    describe('listEyes', () => {
        it('should list all', () => {
            system.openEye({});
            system.openEye({});
            expect(system.listEyes().length).toBe(2);
        });

        it('should return empty when no eyes', () => {
            expect(system.listEyes().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.openEye({ cultivatorId: 'c1' });
            system.openEye({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listAwakened', () => {
        it('should filter awakened only', () => {
            const { eye: e1 } = system.openEye({});
            const { eye: e2 } = system.openEye({});
            system.awakenEye(e1.eyeId);
            const awakened = system.listAwakened();
            expect(awakened.length).toBe(1);
            expect(awakened[0].eyeId).toBe(e1.eyeId);
            expect(e2.status).toBe('open');
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.openEye({ type: 'heavenly' });
            system.openEye({ type: 'demonic' });
            system.openEye({ type: 'truth' });
            expect(system.listByType('heavenly').length).toBe(1);
            expect(system.listByType('demonic').length).toBe(1);
        });
    });

    describe('addVision', () => {
        it('should add vision', () => {
            const { eye } = system.openEye({});
            system.addVision(eye.eyeId, 'a future glimpse');
            expect(eye.visions).toContain('a future glimpse');
        });

        it('should reject missing', () => {
            const result = system.addVision('ghost', 'v');
            expect(result.error).toBe('EYE_NOT_FOUND');
        });

        it('should trigger visionAdded hook', () => {
            const { eye } = system.openEye({});
            let called = false;
            system.registerHook('visionAdded', () => { called = true; });
            system.addVision(eye.eyeId, 'v');
            expect(called).toBe(true);
        });
    });

    describe('increasePerception', () => {
        it('should increase perception by default', () => {
            const { eye } = system.openEye({});
            system.increasePerception(eye.eyeId);
            expect(eye.perception).toBe(25);
        });

        it('should increase perception by custom amount', () => {
            const { eye } = system.openEye({});
            system.increasePerception(eye.eyeId, 50);
            expect(eye.perception).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.increasePerception('ghost');
            expect(result.error).toBe('EYE_NOT_FOUND');
        });

        it('should trigger perceptionIncreased hook', () => {
            const { eye } = system.openEye({});
            let called = false;
            system.registerHook('perceptionIncreased', () => { called = true; });
            system.increasePerception(eye.eyeId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpEye', () => {
        it('should level up', () => {
            const { eye } = system.openEye({});
            system.levelUpEye(eye.eyeId);
            expect(eye.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpEye('ghost');
            expect(result.error).toBe('EYE_NOT_FOUND');
        });

        it('should trigger eyeLeveledUp hook', () => {
            const { eye } = system.openEye({});
            let called = false;
            system.registerHook('eyeLeveledUp', () => { called = true; });
            system.levelUpEye(eye.eyeId);
            expect(called).toBe(true);
        });
    });

    describe('awakenEye', () => {
        it('should awaken eye', () => {
            const { eye } = system.openEye({});
            system.awakenEye(eye.eyeId);
            expect(eye.status).toBe('awakened');
        });

        it('should reject missing', () => {
            const result = system.awakenEye('ghost');
            expect(result.error).toBe('EYE_NOT_FOUND');
        });

        it('should trigger eyeAwakened hook', () => {
            const { eye } = system.openEye({});
            let called = false;
            system.registerHook('eyeAwakened', () => { called = true; });
            system.awakenEye(eye.eyeId);
            expect(called).toBe(true);
        });
    });

    describe('calculateEyePower', () => {
        it('should calculate', () => {
            const { eye } = system.openEye({});
            // level=1, perception=20, visions=0 -> 1*50 + 20 + 0 = 70
            expect(system.calculateEyePower(eye.eyeId)).toBe(70);
        });

        it('should include visions in power', () => {
            const { eye } = system.openEye({});
            system.addVision(eye.eyeId, 'v1');
            system.addVision(eye.eyeId, 'v2');
            // level=1, perception=20, visions=2 -> 1*50 + 20 + 2*20 = 110
            expect(system.calculateEyePower(eye.eyeId)).toBe(110);
        });

        it('should scale with level', () => {
            const { eye } = system.openEye({});
            system.levelUpEye(eye.eyeId);
            system.levelUpEye(eye.eyeId);
            // level=3, perception=20, visions=0 -> 3*50 + 20 + 0 = 170
            expect(system.calculateEyePower(eye.eyeId)).toBe(170);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateEyePower('ghost')).toBe(0);
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

        it('should execute default getEye', () => {
            const result = system.executeTool('getEye', { eyeId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default openEye', () => {
            const result = system.executeTool('openEye', { cultivatorId: 'c1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('eyeOpened', () => count++);
            unregister();
            system.openEye({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('eyeOpened', () => { throw new Error('x'); });
            expect(() => system.openEye({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalEyes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalEyes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openEye({});
            const json = system.toJSON();
            expect(json.eyes.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openEye({});
            const json = system.toJSON();
            const newSys = new CultivationEye();
            newSys.fromJSON(json);
            expect(newSys.eyes.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.eyeCount).toBe(0);
        });
    });
});
