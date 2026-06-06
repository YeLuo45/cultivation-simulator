/**
 * SwordIntent.test.js - 剑意测试
 * V409 Iteration 1/15 Round 14 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SwordIntent } from '../../../systems/ai/SwordIntent.js';

describe('SwordIntent', () => {
    let system;
    beforeEach(() => { system = new SwordIntent(); });

    describe('forgeIntent', () => {
        it('should forge', () => {
            const { intent } = system.forgeIntent({ cultivatorId: 'c1' });
            expect(intent.cultivatorId).toBe('c1');
        });

        it('should trigger intentForged hook', () => {
            let called = false;
            system.registerHook('intentForged', () => { called = true; });
            system.forgeIntent({});
            expect(called).toBe(true);
        });
    });

    describe('getIntent', () => {
        it('should return', () => {
            const { intent } = system.forgeIntent({});
            expect(system.getIntent(intent.intentId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getIntent('ghost')).toBeNull(); });
    });

    describe('listIntents', () => {
        it('should list all', () => {
            system.forgeIntent({});
            expect(system.listIntents().length).toBe(1);
        });
    });

    describe('listByCultivator', () => {
        it('should filter', () => {
            system.forgeIntent({ cultivatorId: 'c1' });
            system.forgeIntent({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
    });

    describe('listByElement', () => {
        it('should filter', () => {
            system.forgeIntent({ element: 'fire' });
            system.forgeIntent({ element: 'water' });
            expect(system.listByElement('fire').length).toBe(1);
        });
    });

    describe('listBySharpness', () => {
        it('should filter', () => {
            system.forgeIntent({ sharpness: 10 });
            system.forgeIntent({ sharpness: 100 });
            expect(system.listBySharpness(50).length).toBe(1);
        });
    });

    describe('sharpen', () => {
        it('should sharpen', () => {
            const { intent } = system.forgeIntent({});
            system.sharpen(intent.intentId, 5);
            expect(intent.sharpness).toBe(15);
        });

        it('should reject missing', () => {
            const result = system.sharpen('ghost', 5);
            expect(result.error).toBe('INTENT_NOT_FOUND');
        });

        it('should trigger intentSharpened hook', () => {
            const { intent } = system.forgeIntent({});
            let called = false;
            system.registerHook('intentSharpened', () => { called = true; });
            system.sharpen(intent.intentId, 5);
            expect(called).toBe(true);
        });
    });

    describe('practice', () => {
        it('should practice', () => {
            const { intent } = system.forgeIntent({});
            system.practice(intent.intentId, 5);
            expect(intent.mastery).toBe(5);
        });

        it('should reject missing', () => {
            const result = system.practice('ghost', 5);
            expect(result.error).toBe('INTENT_NOT_FOUND');
        });

        it('should trigger intentPracticed hook', () => {
            const { intent } = system.forgeIntent({});
            let called = false;
            system.registerHook('intentPracticed', () => { called = true; });
            system.practice(intent.intentId, 5);
            expect(called).toBe(true);
        });
    });

    describe('extendRange', () => {
        it('should extend', () => {
            const { intent } = system.forgeIntent({});
            system.extendRange(intent.intentId, 3);
            expect(intent.range).toBe(8);
        });

        it('should reject missing', () => {
            const result = system.extendRange('ghost', 3);
            expect(result.error).toBe('INTENT_NOT_FOUND');
        });

        it('should trigger intentRangeExtended hook', () => {
            const { intent } = system.forgeIntent({});
            let called = false;
            system.registerHook('intentRangeExtended', () => { called = true; });
            system.extendRange(intent.intentId, 3);
            expect(called).toBe(true);
        });
    });

    describe('calculatePower', () => {
        it('should calculate', () => {
            const { intent } = system.forgeIntent({});
            expect(system.calculatePower(intent.intentId)).toBe(50);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePower('ghost')).toBe(0);
        });
    });

    describe('listSharp', () => {
        it('should filter', () => {
            system.forgeIntent({ sharpness: 10 });
            system.forgeIntent({ sharpness: 100 });
            expect(system.listSharp().length).toBe(1);
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

        it('should execute default getIntent', () => {
            const result = system.executeTool('getIntent', { intentId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('intentForged', () => count++);
            unregister();
            system.forgeIntent({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('intentForged', () => { throw new Error('x'); });
            expect(() => system.forgeIntent({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalIntents = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalIntents = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.forgeIntent({});
            const json = system.toJSON();
            expect(json.intents.length).toBe(1);
        });
        it('should deserialize', () => {
            system.forgeIntent({});
            const json = system.toJSON();
            const newSys = new SwordIntent();
            newSys.fromJSON(json);
            expect(newSys.intents.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.intentCount).toBe(0);
        });
    });
});