/**
 * CultivationDreamPillRefining.test.js - 梦中炼丹测试
 * V861 P-20260613-004 Iteration 4/30 Round 34
 * 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    CultivationDreamPillRefining,
    PILL_RECIPES,
    FLAME_LEVELS,
    FLAME_INTENSITY_VALUES,
    QUALITY_THRESHOLDS,
    QUALITY_TIERS,
} from '../../../systems/ai/CultivationDreamPillRefining.js';

describe('CultivationDreamPillRefining', () => {
    let system;
    beforeEach(() => { system = new CultivationDreamPillRefining(); });

    describe('startRefining', () => {
        it('should start a qi_gathering refining', () => {
            const { refining } = system.startRefining('dream_1', 'qi_gathering');
            expect(refining.recipe).toBe('qi_gathering');
            expect(refining.dreamId).toBe('dream_1');
        });
        it('should start a foundation refining', () => {
            const { refining } = system.startRefining('dream_2', 'foundation');
            expect(refining.tier).toBe(2);
        });
        it('should start a golden_core refining', () => {
            const { refining } = system.startRefining('dream_3', 'golden_core');
            expect(refining.tier).toBe(3);
        });
        it('should initialize empty ingredients when not provided', () => {
            const { refining } = system.startRefining('dream_x', 'qi_gathering');
            expect(refining.ingredients).toEqual([]);
        });
        it('should accept custom ingredients array', () => {
            const { refining } = system.startRefining('dream_x', 'qi_gathering', { ingredients: ['spirit_grass'] });
            expect(refining.ingredients).toEqual(['spirit_grass']);
        });
        it('should reject unknown recipe', () => {
            const result = system.startRefining('dream_1', 'unknown_pill');
            expect(result.error).toBe('UNKNOWN_RECIPE');
        });
        it('should reject empty dreamId', () => {
            const result = system.startRefining('', 'qi_gathering');
            expect(result.error).toBe('INVALID_DREAM_ID');
        });
        it('should enforce maxRefinings', () => {
            const s = new CultivationDreamPillRefining({ maxRefinings: 2 });
            s.startRefining('d1', 'qi_gathering');
            s.startRefining('d1', 'qi_gathering');
            const result = s.startRefining('d1', 'qi_gathering');
            expect(result.error).toBe('MAX_REFININGS_REACHED');
        });
        it('should set flameName from defaultFlameLevel', () => {
            const s = new CultivationDreamPillRefining({ defaultFlameLevel: 2 });
            const { refining } = s.startRefining('d1', 'qi_gathering');
            expect(refining.flameName).toBe('medium');
        });
        it('should clamp out-of-range flameLevel to 0', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering', { flameLevel: 99 });
            expect(refining.flameIntensity).toBe(0);
        });
        it('should set initial progress 0 and not extracted', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            expect(refining.refiningProgress).toBe(0);
            expect(refining.extracted).toBe(false);
            expect(refining.status).toBe('in_progress');
        });
        it('should trigger refiningStarted hook', () => {
            let called = false;
            system.registerHook('refiningStarted', () => { called = true; });
            system.startRefining('d1', 'qi_gathering');
            expect(called).toBe(true);
        });
    });

    describe('getRefining', () => {
        it('should return refining copy', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            const got = system.getRefining(refining.id);
            expect(got.id).toBe(refining.id);
        });
        it('should return null for missing', () => {
            expect(system.getRefining('ghost')).toBeNull();
        });
    });

    describe('listRefinings', () => {
        it('should list all', () => {
            system.startRefining('d1', 'qi_gathering');
            system.startRefining('d2', 'foundation');
            expect(system.listRefinings().length).toBe(2);
        });
    });

    describe('listByDream', () => {
        it('should filter by dream', () => {
            system.startRefining('d1', 'qi_gathering');
            system.startRefining('d2', 'qi_gathering');
            expect(system.listByDream('d1').length).toBe(1);
        });
    });

    describe('listByRecipe', () => {
        it('should filter by recipe', () => {
            system.startRefining('d1', 'qi_gathering');
            system.startRefining('d1', 'foundation');
            expect(system.listByRecipe('qi_gathering').length).toBe(1);
        });
    });

    describe('listExtracted / listInProgress', () => {
        it('should separate extracted/in_progress', () => {
            const a = system.startRefining('d1', 'qi_gathering').refining;
            system.tickProgress(a.id);
            system.tickProgress(a.id);
            system.tickProgress(a.id);
            system.tickProgress(a.id);
            system.tickProgress(a.id);
            system.tickProgress(a.id);
            system.tickProgress(a.id);
            system.tickProgress(a.id);
            system.tickProgress(a.id);
            system.tickProgress(a.id);
            system.extractPill(a.id);
            expect(system.listExtracted().length).toBe(1);
            expect(system.listInProgress().length).toBe(0);
        });
    });

    describe('listTop', () => {
        it('should return top by quality', () => {
            const a = system.startRefining('d1', 'qi_gathering', { ingredients: PILL_RECIPES.qi_gathering.requiredIngredients }).refining;
            for (let i = 0; i < 10; i++) system.tickProgress(a.id);
            system.extractPill(a.id);
            const top = system.listTop(1);
            expect(top.length).toBe(1);
        });
    });

    describe('controlFlame', () => {
        it('should set flameIntensity', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            const r = system.controlFlame(refining.id, 3);
            expect(r.flameIntensity).toBe(3);
        });
        it('should update flameName', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            system.controlFlame(refining.id, 4);
            expect(refining.flameName).toBe('inferno');
        });
        it('should clamp upper bound to FLAME_LEVELS.length-1', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            const r = system.controlFlame(refining.id, 99);
            expect(r.flameIntensity).toBe(FLAME_LEVELS.length - 1);
        });
        it('should reject missing', () => {
            const r = system.controlFlame('ghost', 2);
            expect(r.error).toBe('REFINING_NOT_FOUND');
        });
        it('should reject negative intensity', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            const r = system.controlFlame(refining.id, -1);
            expect(r.error).toBe('INVALID_INTENSITY');
        });
        it('should trigger flameControlled hook', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            let called = false;
            system.registerHook('flameControlled', () => { called = true; });
            system.controlFlame(refining.id, 2);
            expect(called).toBe(true);
        });
    });

    describe('addIngredient', () => {
        it('should add a string ingredient', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            const r = system.addIngredient(refining.id, 'spirit_grass');
            expect(r.count).toBe(1);
        });
        it('should add an object ingredient', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            const r = system.addIngredient(refining.id, { name: 'qi_essence' });
            expect(r.count).toBe(1);
        });
        it('should reject missing', () => {
            const r = system.addIngredient('ghost', 'spirit_grass');
            expect(r.error).toBe('REFINING_NOT_FOUND');
        });
        it('should reject after extracted', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering', { ingredients: PILL_RECIPES.qi_gathering.requiredIngredients });
            for (let i = 0; i < 10; i++) system.tickProgress(refining.id);
            system.extractPill(refining.id);
            const r = system.addIngredient(refining.id, 'spirit_grass');
            expect(r.error).toBe('ALREADY_EXTRACTED');
        });
        it('should trigger ingredientAdded hook', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            let called = false;
            system.registerHook('ingredientAdded', () => { called = true; });
            system.addIngredient(refining.id, 'spirit_grass');
            expect(called).toBe(true);
        });
        it('should reject when maxIngredients reached', () => {
            const s = new CultivationDreamPillRefining({ maxIngredients: 2 });
            const { refining } = s.startRefining('d1', 'qi_gathering');
            s.addIngredient(refining.id, 'a');
            s.addIngredient(refining.id, 'b');
            const r = s.addIngredient(refining.id, 'c');
            expect(r.error).toBe('MAX_INGREDIENTS');
        });
        it('should handle null/undefined ingredient', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            const r = system.addIngredient(refining.id, null);
            expect(r.count).toBe(1);
            expect(refining.ingredients[0]).toBe('unknown');
        });
        it('should handle ingredient object without name', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            const r = system.addIngredient(refining.id, {});
            expect(refining.ingredients[0]).toBe('unknown');
        });
    });

    describe('tickProgress', () => {
        it('should advance progress by progressPerTick', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            system.tickProgress(refining.id);
            expect(refining.refiningProgress).toBe(system.config.progressPerTick);
        });
        it('should clamp to 100', () => {
            const s = new CultivationDreamPillRefining({ progressPerTick: 60 });
            const { refining } = s.startRefining('d1', 'qi_gathering');
            s.tickProgress(refining.id);
            s.tickProgress(refining.id);
            expect(refining.refiningProgress).toBe(100);
        });
        it('should set status to ready at 100', () => {
            const s = new CultivationDreamPillRefining({ progressPerTick: 100 });
            const { refining } = s.startRefining('d1', 'qi_gathering');
            s.tickProgress(refining.id);
            expect(refining.status).toBe('ready');
        });
        it('should reject missing', () => {
            expect(system.tickProgress('ghost').error).toBe('REFINING_NOT_FOUND');
        });
        it('should reject after extracted', () => {
            const s = new CultivationDreamPillRefining({ progressPerTick: 100 });
            const { refining } = s.startRefining('d1', 'qi_gathering');
            s.tickProgress(refining.id);
            s.extractPill(refining.id);
            expect(s.tickProgress(refining.id).error).toBe('ALREADY_EXTRACTED');
        });
        it('should trigger progressTicked hook', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            let called = false;
            system.registerHook('progressTicked', () => { called = true; });
            system.tickProgress(refining.id);
            expect(called).toBe(true);
        });
    });

    describe('classifyQuality', () => {
        it('classifies poor', () => { expect(system.classifyQuality(0.1)).toBe('poor'); });
        it('classifies common', () => { expect(system.classifyQuality(0.5)).toBe('common'); });
        it('classifies rare', () => { expect(system.classifyQuality(0.8)).toBe('rare'); });
        it('classifies legendary', () => { expect(system.classifyQuality(0.95)).toBe('legendary'); });
        it('classifies invalid as poor', () => { expect(system.classifyQuality(-1)).toBe('poor'); });
    });

    describe('extractPill', () => {
        it('should extract ready pill', () => {
            const s = new CultivationDreamPillRefining({ progressPerTick: 100 });
            const { refining } = s.startRefining('d1', 'qi_gathering', { ingredients: PILL_RECIPES.qi_gathering.requiredIngredients });
            s.tickProgress(refining.id);
            const r = s.extractPill(refining.id);
            expect(r.success).toBe(true);
            expect(r.pill.tier).toBeDefined();
        });
        it('should reject not ready', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            const r = system.extractPill(refining.id);
            expect(r.error).toBe('NOT_READY');
        });
        it('should reject missing', () => {
            const r = system.extractPill('ghost');
            expect(r.error).toBe('REFINING_NOT_FOUND');
        });
        it('should reject double extract', () => {
            const s = new CultivationDreamPillRefining({ progressPerTick: 100 });
            const { refining } = s.startRefining('d1', 'qi_gathering');
            s.tickProgress(refining.id);
            s.extractPill(refining.id);
            const r = s.extractPill(refining.id);
            expect(r.error).toBe('ALREADY_EXTRACTED');
        });
        it('should set completedAt when null at extract time', () => {
            const s = new CultivationDreamPillRefining({ progressPerTick: 100 });
            const { refining } = s.startRefining('d1', 'qi_gathering');
            s.tickProgress(refining.id);
            s.refinings.get(refining.id).completedAt = null;
            const r = s.extractPill(refining.id);
            expect(r.success).toBe(true);
            expect(s.refinings.get(refining.id).completedAt).toBeGreaterThan(0);
        });
        it('should produce lower quality with suboptimal flame', () => {
            const sOpt = new CultivationDreamPillRefining({ progressPerTick: 100 });
            const sSub = new CultivationDreamPillRefining({ progressPerTick: 100 });
            const a = sOpt.startRefining('d1', 'qi_gathering', { ingredients: PILL_RECIPES.qi_gathering.requiredIngredients }).refining;
            const b = sSub.startRefining('d1', 'qi_gathering', { ingredients: PILL_RECIPES.qi_gathering.requiredIngredients, flameLevel: 4 }).refining;
            sOpt.tickProgress(a.id);
            sSub.tickProgress(b.id);
            sOpt.extractPill(a.id);
            sSub.extractPill(b.id);
            expect(sOpt.refinings.get(a.id).pillQuality).toBeGreaterThan(sSub.refinings.get(b.id).pillQuality);
        });
        it('should fallback flameVal to 0 when name is invalid', () => {
            const s = new CultivationDreamPillRefining({ progressPerTick: 100 });
            const { refining } = s.startRefining('d1', 'qi_gathering', { ingredients: PILL_RECIPES.qi_gathering.requiredIngredients });
            s.refinings.get(refining.id).flameName = 'bogus_flame';
            s.refinings.get(refining.id).flameIntensity = 99;
            s.tickProgress(refining.id);
            s.extractPill(refining.id);
            expect(s.refinings.get(refining.id).pillQuality).toBeGreaterThanOrEqual(0);
        });
        it('should trigger pillExtracted hook', () => {
            const s = new CultivationDreamPillRefining({ progressPerTick: 100 });
            const { refining } = s.startRefining('d1', 'qi_gathering');
            s.tickProgress(refining.id);
            let called = false;
            s.registerHook('pillExtracted', () => { called = true; });
            s.extractPill(refining.id);
            expect(called).toBe(true);
        });
    });

    describe('cancelRefining', () => {
        it('should cancel', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            const r = system.cancelRefining(refining.id);
            expect(r.success).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.cancelRefining('ghost').error).toBe('REFINING_NOT_FOUND');
        });
        it('should reject after extracted', () => {
            const s = new CultivationDreamPillRefining({ progressPerTick: 100 });
            const { refining } = s.startRefining('d1', 'qi_gathering');
            s.tickProgress(refining.id);
            s.extractPill(refining.id);
            expect(s.cancelRefining(refining.id).error).toBe('ALREADY_EXTRACTED');
        });
        it('should trigger refiningCancelled hook', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            let called = false;
            system.registerHook('refiningCancelled', () => { called = true; });
            system.cancelRefining(refining.id);
            expect(called).toBe(true);
        });
    });

    describe('deleteRefining', () => {
        it('should delete', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            expect(system.deleteRefining(refining.id).success).toBe(true);
        });
        it('should reject missing', () => {
            expect(system.deleteRefining('ghost').error).toBe('REFINING_NOT_FOUND');
        });
        it('should trigger refiningDeleted hook', () => {
            const { refining } = system.startRefining('d1', 'qi_gathering');
            let called = false;
            system.registerHook('refiningDeleted', () => { called = true; });
            system.deleteRefining(refining.id);
            expect(called).toBe(true);
        });
    });

    describe('calculateRefiningScore', () => {
        it('should compute score for valid', () => {
            const s = new CultivationDreamPillRefining({ progressPerTick: 100 });
            const { refining } = s.startRefining('d1', 'qi_gathering', { ingredients: PILL_RECIPES.qi_gathering.requiredIngredients });
            s.tickProgress(refining.id);
            s.extractPill(refining.id);
            expect(s.calculateRefiningScore(refining.id)).toBeGreaterThan(0);
        });
        it('should return 0 for missing', () => {
            expect(system.calculateRefiningScore('ghost')).toBe(0);
        });
    });

    describe('getDreamProgress', () => {
        it('should summarize dream refinings', () => {
            system.startRefining('d1', 'qi_gathering');
            system.startRefining('d1', 'qi_gathering');
            const summary = system.getDreamProgress('d1');
            expect(summary.refiningCount).toBe(2);
            expect(summary.avgQuality).toBe(0);
        });
        it('should return zeros for missing dream', () => {
            const summary = system.getDreamProgress('ghost');
            expect(summary.refiningCount).toBe(0);
        });
    });

    describe('Tool System', () => {
        it('should register tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });
        it('should execute tool with context', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const r = system.executeTool('test', { value: 42 });
            expect(r.result).toBe(42);
        });
        it('should execute tool with missing context (default to {})', () => {
            system.registerTool('test', (ctx) => Object.keys(ctx).length);
            const r = system.executeTool('test');
            expect(r.result).toBe(0);
        });
        it('should execute tool with null context (default to {})', () => {
            system.registerTool('test', (ctx) => ctx === undefined);
            const r = system.executeTool('test', null);
            expect(r.result).toBe(false);
        });
        it('should reject missing tool', () => {
            expect(system.executeTool('ghost', {}).error).toBe('TOOL_NOT_FOUND');
        });
        it('should catch tool handler errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const r = system.executeTool('bad', {});
            expect(r.error).toBe('boom');
        });
        it('should execute default listByDream', () => {
            system.startRefining('d1', 'qi_gathering');
            const r = system.executeTool('listByDream', { dreamId: 'd1' });
            expect(r.result.length).toBe(1);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('refiningStarted', () => count++);
            unregister();
            system.startRefining('d1', 'qi_gathering');
            expect(count).toBe(0);
        });
        it('should handle hook errors silently', () => {
            system.registerHook('refiningStarted', () => { throw new Error('x'); });
            expect(() => system.startRefining('d1', 'qi_gathering')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            expect(system.autoEvolve().evolved).toBe(false);
        });
        it('should evolve after threshold', () => {
            system.stats.totalStarted = 10;
            const r = system.autoEvolve();
            expect(r.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalStarted = 10;
            system.autoEvolve();
            const r = system.autoEvolve();
            expect(r.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startRefining('d1', 'qi_gathering');
            const json = system.toJSON();
            expect(json.refinings.length).toBe(1);
        });
        it('should deserialize', () => {
            system.startRefining('d1', 'qi_gathering');
            const json = system.toJSON();
            const sys2 = new CultivationDreamPillRefining();
            sys2.fromJSON(json);
            expect(sys2.refinings.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should include refiningCount', () => {
            const stats = system.getStats();
            expect(stats.refiningCount).toBe(0);
        });
    });

    describe('Exports', () => {
        it('PILL_RECIPES has 3 recipes', () => {
            expect(Object.keys(PILL_RECIPES).length).toBe(3);
        });
        it('FLAME_LEVELS has 5 levels', () => {
            expect(FLAME_LEVELS.length).toBe(5);
        });
        it('FLAME_INTENSITY_VALUES mapped', () => {
            expect(FLAME_INTENSITY_VALUES.ember).toBe(0.1);
        });
        it('QUALITY_THRESHOLDS has 4 tiers', () => {
            expect(Object.keys(QUALITY_THRESHOLDS).length).toBe(4);
        });
        it('QUALITY_TIERS has 4 tiers', () => {
            expect(QUALITY_TIERS.length).toBe(4);
        });
    });
});
