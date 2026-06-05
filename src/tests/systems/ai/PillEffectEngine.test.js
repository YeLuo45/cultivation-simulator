/**
 * PillEffectEngine.test.js - 丹药效果引擎测试
 * V328 Iteration 7/9 Round 5 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PillEffectEngine } from '../../../systems/ai/PillEffectEngine.js';

describe('PillEffectEngine', () => {
    let system;
    beforeEach(() => { system = new PillEffectEngine(); });

    describe('Default Templates', () => {
        it('should have templates', () => { expect(system.effectTemplates.size).toBe(4); });
        it('should contain qi_boost', () => { expect(system.getEffectTemplate('qi_boost')).not.toBeNull(); });
    });

    describe('createEffect', () => {
        it('should create', () => {
            const { effect } = system.createEffect({ templateId: 'qi_boost' });
            expect(effect.templateId).toBe('qi_boost');
        });

        it('should trigger effectCreated hook', () => {
            let called = false;
            system.registerHook('effectCreated', () => { called = true; });
            system.createEffect({});
            expect(called).toBe(true);
        });
    });

    describe('getEffect', () => {
        it('should return', () => {
            const { effect } = system.createEffect({});
            expect(system.getEffect(effect.effectId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getEffect('ghost')).toBeNull(); });
    });

    describe('listEffects', () => {
        it('should list all', () => {
            system.createEffect({});
            expect(system.listEffects().length).toBe(1);
        });
    });

    describe('applyEffect', () => {
        it('should apply', () => {
            const { effect } = system.createEffect({});
            const result = system.applyEffect(effect.effectId, 't1');
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.applyEffect('ghost', 't1');
            expect(result.error).toBe('EFFECT_NOT_FOUND');
        });

        it('should increment totalApplied', () => {
            const { effect } = system.createEffect({});
            system.applyEffect(effect.effectId, 't1');
            expect(system.stats.totalApplied).toBe(1);
        });

        it('should trigger effectApplied hook', () => {
            const { effect } = system.createEffect({});
            let called = false;
            system.registerHook('effectApplied', () => { called = true; });
            system.applyEffect(effect.effectId, 't1');
            expect(called).toBe(true);
        });
    });

    describe('removeEffect', () => {
        it('should remove', () => {
            const { effect } = system.createEffect({});
            system.applyEffect(effect.effectId, 't1');
            const result = system.removeEffect(effect.effectId, 't1');
            expect(result.success).toBe(true);
        });

        it('should reject missing target', () => {
            const result = system.removeEffect('any', 'ghost');
            expect(result.error).toBe('TARGET_NOT_FOUND');
        });

        it('should reject not active', () => {
            const { effect } = system.createEffect({});
            system.applyEffect(effect.effectId, 't1');
            const result = system.removeEffect('ghost', 't1');
            expect(result.error).toBe('EFFECT_NOT_ACTIVE');
        });

        it('should trigger effectRemoved hook', () => {
            const { effect } = system.createEffect({});
            system.applyEffect(effect.effectId, 't1');
            let called = false;
            system.registerHook('effectRemoved', () => { called = true; });
            system.removeEffect(effect.effectId, 't1');
            expect(called).toBe(true);
        });
    });

    describe('getTargetEffects', () => {
        it('should return effects', () => {
            const { effect } = system.createEffect({});
            system.applyEffect(effect.effectId, 't1');
            expect(system.getTargetEffects('t1').length).toBe(1);
        });

        it('should return empty for missing', () => {
            expect(system.getTargetEffects('ghost').length).toBe(0);
        });
    });

    describe('calculateCombinedEffect', () => {
        it('should combine', () => {
            const { effect: e1 } = system.createEffect({ modifiers: { attack: 10 } });
            const { effect: e2 } = system.createEffect({ modifiers: { attack: 5 } });
            system.applyEffect(e1.effectId, 't1');
            system.applyEffect(e2.effectId, 't1');
            const combined = system.calculateCombinedEffect('t1');
            expect(combined.attack).toBe(15);
        });
    });

    describe('getEffectTemplate', () => {
        it('should return', () => { expect(system.getEffectTemplate('qi_boost')).not.toBeNull(); });
        it('should return null for missing', () => { expect(system.getEffectTemplate('ghost')).toBeNull(); });
    });

    describe('listEffectTemplates', () => {
        it('should list all', () => { expect(system.listEffectTemplates().length).toBe(4); });
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

        it('should execute default getEffect', () => {
            const result = system.executeTool('getEffect', { effectId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('effectCreated', () => count++);
            unregister();
            system.createEffect({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('effectCreated', () => { throw new Error('x'); });
            expect(() => system.createEffect({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalApplied = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalApplied = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createEffect({});
            const json = system.toJSON();
            expect(json.effects.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createEffect({});
            const json = system.toJSON();
            const newSys = new PillEffectEngine();
            newSys.fromJSON(json);
            expect(newSys.effects.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.templateCount).toBe(4);
        });
    });
});