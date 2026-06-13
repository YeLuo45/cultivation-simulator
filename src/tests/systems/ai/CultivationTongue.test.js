/**
 * CultivationTongue.test.js - 道舌系统测试
 * V524 Iteration 6/20 Round 21 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTongue } from '../../../systems/ai/CultivationTongue.js';

describe('CultivationTongue', () => {
    let system;
    beforeEach(() => { system = new CultivationTongue(); });

    describe('openTongue', () => {
        it('should open tongue', () => {
            const { tongue } = system.openTongue({ cultivatorId: 'c1', name: 'Spirit Tongue' });
            expect(tongue.cultivatorId).toBe('c1');
            expect(tongue.name).toBe('Spirit Tongue');
        });

        it('should default to open status', () => {
            const { tongue } = system.openTongue({});
            expect(tongue.status).toBe('open');
        });

        it('should default type to heavenly', () => {
            const { tongue } = system.openTongue({});
            expect(tongue.type).toBe('heavenly');
        });

        it('should default acuity to baseAcuity', () => {
            const { tongue } = system.openTongue({});
            expect(tongue.acuity).toBe(20);
        });

        it('should start at level 1', () => {
            const { tongue } = system.openTongue({});
            expect(tongue.level).toBe(1);
        });

        it('should start with empty flavors', () => {
            const { tongue } = system.openTongue({});
            expect(tongue.flavors).toEqual([]);
        });

        it('should trigger tongueOpened hook', () => {
            let called = false;
            system.registerHook('tongueOpened', () => { called = true; });
            system.openTongue({});
            expect(called).toBe(true);
        });

        it('should accept custom tongueId', () => {
            const { tongue } = system.openTongue({ tongueId: 'tongue_xyz' });
            expect(tongue.tongueId).toBe('tongue_xyz');
        });

        it('should accept custom type', () => {
            const { tongue } = system.openTongue({ type: 'demonic' });
            expect(tongue.type).toBe('demonic');
        });
    });

    describe('getTongue', () => {
        it('should return', () => {
            const { tongue } = system.openTongue({});
            expect(system.getTongue(tongue.tongueId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTongue('ghost')).toBeNull(); });
    });

    describe('listTongues', () => {
        it('should list all', () => {
            system.openTongue({});
            system.openTongue({});
            expect(system.listTongues().length).toBe(2);
        });

        it('should return empty when no tongues', () => {
            expect(system.listTongues().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.openTongue({ cultivatorId: 'c1' });
            system.openTongue({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });

        it('should return empty for unknown cultivator', () => {
            system.openTongue({ cultivatorId: 'c1' });
            expect(system.listByCultivator('ghost').length).toBe(0);
        });
    });

    describe('listAwakened', () => {
        it('should filter awakened only', () => {
            const { tongue: t1 } = system.openTongue({});
            const { tongue: t2 } = system.openTongue({});
            system.awakenTongue(t1.tongueId);
            const awakened = system.listAwakened();
            expect(awakened.length).toBe(1);
            expect(awakened[0].tongueId).toBe(t1.tongueId);
            expect(t2.status).toBe('open');
        });
    });

    describe('addFlavor', () => {
        it('should add flavor', () => {
            const { tongue } = system.openTongue({});
            system.addFlavor(tongue.tongueId, 'sweet');
            expect(tongue.flavors).toContain('sweet');
        });

        it('should add multiple flavors', () => {
            const { tongue } = system.openTongue({});
            system.addFlavor(tongue.tongueId, 'sweet');
            system.addFlavor(tongue.tongueId, 'bitter');
            expect(tongue.flavors.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addFlavor('ghost', 'sweet');
            expect(result.error).toBe('TONGUE_NOT_FOUND');
        });

        it('should trigger flavorAdded hook', () => {
            const { tongue } = system.openTongue({});
            let called = false;
            system.registerHook('flavorAdded', () => { called = true; });
            system.addFlavor(tongue.tongueId, 'umami');
            expect(called).toBe(true);
        });
    });

    describe('increaseAcuity', () => {
        it('should increase acuity by default', () => {
            const { tongue } = system.openTongue({});
            system.increaseAcuity(tongue.tongueId);
            expect(tongue.acuity).toBe(25);
        });

        it('should increase acuity by custom amount', () => {
            const { tongue } = system.openTongue({});
            system.increaseAcuity(tongue.tongueId, 50);
            expect(tongue.acuity).toBe(70);
        });

        it('should reject missing', () => {
            const result = system.increaseAcuity('ghost');
            expect(result.error).toBe('TONGUE_NOT_FOUND');
        });

        it('should trigger acuityIncreased hook', () => {
            const { tongue } = system.openTongue({});
            let called = false;
            system.registerHook('acuityIncreased', () => { called = true; });
            system.increaseAcuity(tongue.tongueId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpTongue', () => {
        it('should level up', () => {
            const { tongue } = system.openTongue({});
            system.levelUpTongue(tongue.tongueId);
            expect(tongue.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpTongue('ghost');
            expect(result.error).toBe('TONGUE_NOT_FOUND');
        });

        it('should trigger tongueLeveledUp hook', () => {
            const { tongue } = system.openTongue({});
            let called = false;
            system.registerHook('tongueLeveledUp', () => { called = true; });
            system.levelUpTongue(tongue.tongueId);
            expect(called).toBe(true);
        });
    });

    describe('awakenTongue', () => {
        it('should awaken tongue', () => {
            const { tongue } = system.openTongue({});
            system.awakenTongue(tongue.tongueId);
            expect(tongue.status).toBe('awakened');
        });

        it('should reject missing', () => {
            const result = system.awakenTongue('ghost');
            expect(result.error).toBe('TONGUE_NOT_FOUND');
        });

        it('should trigger tongueAwakened hook', () => {
            const { tongue } = system.openTongue({});
            let called = false;
            system.registerHook('tongueAwakened', () => { called = true; });
            system.awakenTongue(tongue.tongueId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTonguePower', () => {
        it('should calculate', () => {
            const { tongue } = system.openTongue({});
            // level=1, acuity=20, flavors=0 -> 1*50 + 20 + 0 = 70
            expect(system.calculateTonguePower(tongue.tongueId)).toBe(70);
        });

        it('should include flavors in power', () => {
            const { tongue } = system.openTongue({});
            system.addFlavor(tongue.tongueId, 'f1');
            system.addFlavor(tongue.tongueId, 'f2');
            // level=1, acuity=20, flavors=2 -> 1*50 + 20 + 2*15 = 100
            expect(system.calculateTonguePower(tongue.tongueId)).toBe(100);
        });

        it('should scale with level', () => {
            const { tongue } = system.openTongue({});
            system.levelUpTongue(tongue.tongueId);
            system.levelUpTongue(tongue.tongueId);
            // level=3, acuity=20, flavors=0 -> 3*50 + 20 + 0 = 170
            expect(system.calculateTonguePower(tongue.tongueId)).toBe(170);
        });

        it('should scale with acuity', () => {
            const { tongue } = system.openTongue({});
            system.increaseAcuity(tongue.tongueId, 30);
            // level=1, acuity=50, flavors=0 -> 1*50 + 50 + 0 = 100
            expect(system.calculateTonguePower(tongue.tongueId)).toBe(100);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTonguePower('ghost')).toBe(0);
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

        it('should execute default getTongue', () => {
            const result = system.executeTool('getTongue', { tongueId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default openTongue', () => {
            const result = system.executeTool('openTongue', { cultivatorId: 'c1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('tongueOpened', () => count++);
            unregister();
            system.openTongue({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('tongueOpened', () => { throw new Error('x'); });
            expect(() => system.openTongue({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTongues = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTongues = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openTongue({});
            const json = system.toJSON();
            expect(json.tongues.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openTongue({});
            const json = system.toJSON();
            const newSys = new CultivationTongue();
            newSys.fromJSON(json);
            expect(newSys.tongues.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.tongueCount).toBe(0);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.openTongue({ type: 'heavenly' });
            system.openTongue({ type: 'demonic' });
            system.openTongue({ type: 'spirit' });
            expect(system.listByType('heavenly').length).toBe(1);
            expect(system.listByType('demonic').length).toBe(1);
            expect(system.listByType('spirit').length).toBe(1);
        });
    });
});
