/**
 * CultivationDreamCore.test.js - 修真梦境核心引擎测试
 * V858 P-20260613-001 Iteration 1/30 Round 34
 * 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    CultivationDreamCore,
    DREAM_TYPES,
    DREAM_TYPE_KEYS,
    QUALITY_THRESHOLDS,
    QUALITY_TIERS,
    MAX_INSIGHTS_PER_DREAM,
    DEFAULT_MAX_DREAMS_PER_PLAYER,
} from '../../../systems/ai/CultivationDreamCore.js';

describe('CultivationDreamCore', () => {
    let system;
    beforeEach(() => { system = new CultivationDreamCore(); });

    describe('constructor', () => {
        it('should initialize with default config', () => {
            expect(system.config.maxDreamsPerPlayer).toBe(DEFAULT_MAX_DREAMS_PER_PLAYER);
            expect(system.config.maxInsightsPerDream).toBe(MAX_INSIGHTS_PER_DREAM);
            expect(system.config.autoClassify).toBe(true);
        });
        it('should accept custom config', () => {
            const s = new CultivationDreamCore({ maxDreamsPerPlayer: 5, autoClassify: false });
            expect(s.config.maxDreamsPerPlayer).toBe(5);
            expect(s.config.autoClassify).toBe(false);
        });
        it('should initialize empty maps', () => {
            expect(system.dreams.size).toBe(0);
            expect(system.playerDreams.size).toBe(0);
            expect(system.activeDreams.size).toBe(0);
        });
        it('should initialize stats', () => {
            expect(system.stats.totalEntered).toBe(0);
            expect(system.stats.byQuality.mythic).toBe(0);
        });
        it('should register default tools', () => {
            expect(system.tools.has('getDream')).toBe(true);
            expect(system.tools.has('listByPlayer')).toBe(true);
        });
        it('should handle config=0 numeric fields', () => {
            const s = new CultivationDreamCore({ maxDreamsPerPlayer: 0, maxInsightsPerDream: 0 });
            expect(s.config.maxDreamsPerPlayer).toBe(0);
            expect(s.config.maxInsightsPerDream).toBe(0);
        });
        it('should handle autoClassify=false', () => {
            const s = new CultivationDreamCore({ autoClassify: false });
            expect(s.config.autoClassify).toBe(false);
        });
        it('should handle defaultQuality=legendary', () => {
            const s = new CultivationDreamCore({ defaultQuality: 'legendary' });
            expect(s.config.defaultQuality).toBe('legendary');
        });
    });

    describe('enterDream', () => {
        it('should enter a meditation dream', () => {
            const { success, dream } = system.enterDream('player_1', 'meditation');
            expect(success).toBe(true);
            expect(dream.type).toBe('meditation');
            expect(dream.playerId).toBe('player_1');
            expect(dream.quality).toBe('common');
        });
        it('should enter all 5 dream types', () => {
            for (const type of DREAM_TYPE_KEYS) {
                const { success, dream } = system.enterDream('p1', type);
                expect(success).toBe(true);
                expect(dream.type).toBe(type);
            }
        });
        it('should accept custom duration', () => {
            const { dream } = system.enterDream('p1', 'meditation', { duration: 30000 });
            expect(dream.duration).toBe(30000);
        });
        it('should accept custom intensity=0', () => {
            const { dream } = system.enterDream('p1', 'meditation', { intensity: 0 });
            expect(dream.intensity).toBe(0);
        });
        it('should reject empty playerId', () => {
            const result = system.enterDream('', 'meditation');
            expect(result.success).toBe(false);
            expect(result.error).toBe('INVALID_PLAYER_ID');
        });
        it('should reject unknown type', () => {
            const result = system.enterDream('p1', 'unknown_type');
            expect(result.error).toBe('UNKNOWN_DREAM_TYPE');
        });
        it('should reject when too many active dreams', () => {
            for (let i = 0; i < 5; i++) {
                system.enterDream('p1', 'meditation');
            }
            const result = system.enterDream('p1', 'meditation');
            expect(result.error).toBe('TOO_MANY_ACTIVE_DREAMS');
        });
        it('should track player dreams', () => {
            system.enterDream('p1', 'meditation');
            system.enterDream('p1', 'pill');
            expect(system.playerDreams.get('p1').length).toBe(2);
        });
        it('should trim old dreams when exceeding max', () => {
            const s = new CultivationDreamCore({ maxDreamsPerPlayer: 2 });
            s.enterDream('p1', 'meditation');
            s.enterDream('p1', 'meditation');
            s.enterDream('p1', 'meditation');
            expect(s.dreams.size).toBe(2);
            expect(s.playerDreams.get('p1').length).toBe(2);
        });
        it('should update byType stats', () => {
            system.enterDream('p1', 'sword');
            expect(system.stats.byType.sword).toBe(1);
        });
    });

    describe('exitDream', () => {
        it('should exit an active dream', () => {
            const { dream } = system.enterDream('p1', 'meditation');
            const result = system.exitDream(dream.id, { score: 50 });
            expect(result.success).toBe(true);
            expect(result.dream.exitedAt).not.toBe(null);
        });
        it('should reject empty dreamId', () => {
            const result = system.exitDream('');
            expect(result.error).toBe('INVALID_DREAM_ID');
        });
        it('should reject unknown dreamId', () => {
            const result = system.exitDream('unknown_id');
            expect(result.error).toBe('DREAM_NOT_FOUND');
        });
        it('should reject double exit', () => {
            const { dream } = system.enterDream('p1', 'meditation');
            system.exitDream(dream.id);
            const result = system.exitDream(dream.id);
            expect(result.error).toBe('DREAM_ALREADY_EXITED');
        });
        it('should auto-classify quality with autoClassify=true', () => {
            const s = new CultivationDreamCore({ autoClassify: true });
            const { dream } = s.enterDream('p1', 'meditation');
            s.exitDream(dream.id, { score: 95 });
            expect(s.getDream(dream.id).quality).toBe('legendary');
        });
        it('should classify mythic at score 99+', () => {
            const s = new CultivationDreamCore({ autoClassify: true });
            const { dream } = s.enterDream('p1', 'meditation');
            s.exitDream(dream.id, { score: 99 });
            expect(s.getDream(dream.id).quality).toBe('mythic');
        });
        it('should classify rare at score 70+', () => {
            const s = new CultivationDreamCore({ autoClassify: true });
            const { dream } = s.enterDream('p1', 'meditation');
            s.exitDream(dream.id, { score: 70 });
            expect(s.getDream(dream.id).quality).toBe('rare');
        });
        it('should classify common at score <70', () => {
            const s = new CultivationDreamCore({ autoClassify: true });
            const { dream } = s.enterDream('p1', 'meditation');
            s.exitDream(dream.id, { score: 50 });
            expect(s.getDream(dream.id).quality).toBe('common');
        });
        it('should NOT classify when autoClassify=false', () => {
            const s = new CultivationDreamCore({ autoClassify: false });
            const { dream } = s.enterDream('p1', 'meditation');
            s.exitDream(dream.id, { score: 99 });
            expect(s.getDream(dream.id).quality).toBe('common');
        });
        it('should add insights from outcome', () => {
            const { dream } = system.enterDream('p1', 'meditation');
            system.exitDream(dream.id, { insights: ['a', 'b', 'c'] });
            expect(system.getDream(dream.id).insights).toEqual(['a', 'b', 'c']);
        });
        it('should cap insights at maxInsightsPerDream', () => {
            const s = new CultivationDreamCore({ maxInsightsPerDream: 2 });
            const { dream } = s.enterDream('p1', 'meditation');
            s.exitDream(dream.id, { insights: ['a', 'b', 'c', 'd'] });
            expect(s.getDream(dream.id).insights).toEqual(['a', 'b']);
        });
        it('should remove from activeDreams on exit', () => {
            const { dream } = system.enterDream('p1', 'meditation');
            expect(system.activeDreams.has(dream.id)).toBe(true);
            system.exitDream(dream.id);
            expect(system.activeDreams.has(dream.id)).toBe(false);
        });
        it('should update totalExited stat', () => {
            const { dream } = system.enterDream('p1', 'meditation');
            system.exitDream(dream.id);
            expect(system.stats.totalExited).toBe(1);
        });
    });

    describe('getDream', () => {
        it('should return dream by id', () => {
            const { dream } = system.enterDream('p1', 'meditation');
            const fetched = system.getDream(dream.id);
            expect(fetched.id).toBe(dream.id);
        });
        it('should return null for unknown id', () => {
            expect(system.getDream('unknown')).toBe(null);
        });
        it('should return clone with insights array copy', () => {
            const { dream } = system.enterDream('p1', 'meditation');
            system.exitDream(dream.id, { insights: ['x'] });
            const fetched = system.getDream(dream.id);
            fetched.insights.push('mutated');
            expect(system.getDream(dream.id).insights).toEqual(['x']);
        });
    });

    describe('listByPlayer', () => {
        it('should return empty for unknown player', () => {
            expect(system.listByPlayer('unknown')).toEqual([]);
        });
        it('should list all player dreams', () => {
            system.enterDream('p1', 'meditation');
            system.enterDream('p1', 'pill');
            expect(system.listByPlayer('p1').length).toBe(2);
        });
        it('should separate dreams by player', () => {
            system.enterDream('p1', 'meditation');
            system.enterDream('p2', 'pill');
            expect(system.listByPlayer('p1').length).toBe(1);
            expect(system.listByPlayer('p2').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.enterDream('p1', 'meditation');
            system.enterDream('p1', 'sword');
            system.enterDream('p2', 'sword');
            expect(system.listByType('sword').length).toBe(2);
        });
        it('should return empty for unknown type', () => {
            expect(system.listByType('unknown')).toEqual([]);
        });
    });

    describe('listByQuality', () => {
        it('should filter by quality', () => {
            const s = new CultivationDreamCore({ autoClassify: true });
            const { dream: d1 } = s.enterDream('p1', 'meditation');
            s.exitDream(d1.id, { score: 99 });
            const { dream: d2 } = s.enterDream('p2', 'meditation');
            s.exitDream(d2.id, { score: 50 });
            expect(s.listByQuality('mythic').length).toBe(1);
            expect(s.listByQuality('common').length).toBe(1);
        });
        it('should return empty for unknown quality', () => {
            expect(system.listByQuality('unknown')).toEqual([]);
        });
    });

    describe('listActive', () => {
        it('should list active dreams only', () => {
            const { dream } = system.enterDream('p1', 'meditation');
            system.enterDream('p2', 'pill');
            system.exitDream(dream.id);
            expect(system.listActive().length).toBe(1);
        });
        it('should return empty when no active', () => {
            expect(system.listActive()).toEqual([]);
        });
    });

    describe('listActiveByPlayer', () => {
        it('should filter active by player', () => {
            system.enterDream('p1', 'meditation');
            system.enterDream('p2', 'pill');
            expect(system.listActiveByPlayer('p1').length).toBe(1);
        });
    });

    describe('getDreamStats', () => {
        it('should return zero stats for unknown player', () => {
            const stats = system.getDreamStats('unknown');
            expect(stats.totalDreams).toBe(0);
            expect(stats.totalInsights).toBe(0);
        });
        it('should calculate avgDuration for exited dreams', () => {
            const { dream } = system.enterDream('p1', 'meditation');
            system.exitDream(dream.id);
            const stats = system.getDreamStats('p1');
            expect(stats.exitedCount).toBe(1);
            expect(stats.avgDuration).toBeGreaterThanOrEqual(0);
        });
        it('should track active count', () => {
            system.enterDream('p1', 'meditation');
            system.enterDream('p1', 'pill');
            const stats = system.getDreamStats('p1');
            expect(stats.activeCount).toBe(2);
        });
        it('should track totalInsights across dreams', () => {
            const { dream } = system.enterDream('p1', 'meditation');
            system.exitDream(dream.id, { insights: ['a', 'b'] });
            const stats = system.getDreamStats('p1');
            expect(stats.totalInsights).toBe(2);
        });
        it('should compute qualityDistribution', () => {
            const { dream } = system.enterDream('p1', 'meditation');
            system.exitDream(dream.id);
            const stats = system.getDreamStats('p1');
            expect(stats.qualityDistribution.common).toBe(1);
        });
    });

    describe('registerTool + executeTool', () => {
        it('should register custom tool', () => {
            const result = system.registerTool('myTool', () => 42);
            expect(result.success).toBe(true);
            expect(system.tools.has('myTool')).toBe(true);
        });
        it('should reject invalid tool name', () => {
            expect(system.registerTool('', () => {}).error).toBe('INVALID_TOOL_NAME');
        });
        it('should reject invalid handler', () => {
            expect(system.registerTool('t', null).error).toBe('INVALID_HANDLER');
        });
        it('should execute registered tool', () => {
            system.registerTool('get42', () => 42);
            const result = system.executeTool('get42');
            expect(result.result).toBe(42);
        });
        it('should pass context to tool', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo', { x: 1 });
            expect(result.result.x).toBe(1);
        });
        it('should handle missing-context (default {} branch)', () => {
            system.registerTool('echoAll', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('echoAll');
            expect(result.result).toBe(0);
        });
        it('should handle null context', () => {
            system.registerTool('echoAll2', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('echoAll2', null);
            expect(result.result).toBe(0);
        });
        it('should return UNKNOWN_TOOL for missing tool', () => {
            expect(system.executeTool('nonexistent').error).toBe('UNKNOWN_TOOL');
        });
        it('should handle tool execution errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad');
            expect(result.success).toBe(false);
            expect(result.error).toBe('TOOL_EXECUTION_ERROR');
        });
        it('should call built-in getDream via tool', () => {
            const { dream } = system.enterDream('p1', 'meditation');
            const result = system.executeTool('getDream', { dreamId: dream.id });
            expect(result.result.id).toBe(dream.id);
        });
    });

    describe('registerHook + triggerHook', () => {
        it('should register hook', () => {
            const result = system.registerHook('onTest', () => {});
            expect(result.success).toBe(true);
        });
        it('should reject invalid event name', () => {
            expect(system.registerHook('', () => {}).error).toBe('INVALID_EVENT_NAME');
        });
        it('should reject invalid handler', () => {
            expect(system.registerHook('onTest', null).error).toBe('INVALID_HANDLER');
        });
        it('should trigger hook on enterDream', () => {
            let called = false;
            system.registerHook('onDreamEnter', () => { called = true; });
            system.enterDream('p1', 'meditation');
            expect(called).toBe(true);
        });
        it('should trigger hook on exitDream', () => {
            let called = false;
            system.registerHook('onDreamExit', () => { called = true; });
            const { dream } = system.enterDream('p1', 'meditation');
            system.exitDream(dream.id);
            expect(called).toBe(true);
        });
        it('should handle hook errors silently', () => {
            system.registerHook('onDreamEnter', () => { throw new Error('hook-fail'); });
            expect(() => system.enterDream('p1', 'meditation')).not.toThrow();
        });
        it('should support multiple handlers per event', () => {
            let count = 0;
            system.registerHook('onDreamEnter', () => { count++; });
            system.registerHook('onDreamEnter', () => { count++; });
            system.enterDream('p1', 'meditation');
            expect(count).toBe(2);
        });
        it('should unregister hook', () => {
            const handler = () => {};
            system.registerHook('onTest', handler);
            const result = system.unregisterHook('onTest', handler);
            expect(result.success).toBe(true);
        });
        it('should return error when unregistering missing event', () => {
            expect(system.unregisterHook('nonexistent', () => {}).error).toBe('EVENT_NOT_FOUND');
        });
        it('should return error when unregistering missing handler', () => {
            system.registerHook('onTest', () => {});
            expect(system.unregisterHook('onTest', () => {}).error).toBe('HANDLER_NOT_FOUND');
        });
    });

    describe('deleteDream', () => {
        it('should delete a dream', () => {
            const { dream } = system.enterDream('p1', 'meditation');
            const result = system.deleteDream(dream.id);
            expect(result.success).toBe(true);
            expect(system.dreams.has(dream.id)).toBe(false);
        });
        it('should reject unknown dreamId', () => {
            expect(system.deleteDream('unknown').error).toBe('DREAM_NOT_FOUND');
        });
        it('should remove from playerDreams list', () => {
            const { dream } = system.enterDream('p1', 'meditation');
            system.deleteDream(dream.id);
            expect(system.playerDreams.get('p1')).toEqual([]);
        });
        it('should remove from activeDreams', () => {
            const { dream } = system.enterDream('p1', 'meditation');
            system.deleteDream(dream.id);
            expect(system.activeDreams.has(dream.id)).toBe(false);
        });
    });

    describe('toJSON + fromJSON', () => {
        it('should serialize state', () => {
            system.enterDream('p1', 'meditation');
            const json = system.toJSON();
            expect(json.dreams.length).toBe(1);
        });
        it('should deserialize state', () => {
            system.enterDream('p1', 'meditation');
            const json = system.toJSON();
            const s2 = new CultivationDreamCore();
            const result = s2.fromJSON(json);
            expect(result.success).toBe(true);
            expect(s2.dreams.size).toBe(1);
        });
        it('should reject invalid data', () => {
            expect(system.fromJSON(null).error).toBe('INVALID_DATA');
        });
        it('should restore active dreams on fromJSON', () => {
            system.enterDream('p1', 'meditation');
            const json = system.toJSON();
            const s2 = new CultivationDreamCore();
            s2.fromJSON(json);
            expect(s2.activeDreams.size).toBe(1);
        });
        it('should handle partial config update', () => {
            const s = new CultivationDreamCore();
            s.fromJSON({ config: { maxDreamsPerPlayer: 99 } });
            expect(s.config.maxDreamsPerPlayer).toBe(99);
        });
        it('should merge stats', () => {
            const s = new CultivationDreamCore();
            s.fromJSON({ stats: { totalEntered: 42 } });
            expect(s.stats.totalEntered).toBe(42);
        });
    });

    describe('getStats', () => {
        it('should return stats snapshot', () => {
            const stats = system.getStats();
            expect(stats.totalDreams).toBe(0);
            expect(stats.activeDreams).toBe(0);
        });
        it('should reflect dreams count', () => {
            system.enterDream('p1', 'meditation');
            system.enterDream('p2', 'pill');
            expect(system.getStats().totalDreams).toBe(2);
        });
    });

    describe('autoEvolve + reset', () => {
        it('should increment evolutionCount', () => {
            system.autoEvolve();
            expect(system.stats.evolutionCount).toBe(1);
        });
        it('should reset all state', () => {
            system.enterDream('p1', 'meditation');
            system.autoEvolve();
            system.reset();
            expect(system.dreams.size).toBe(0);
            expect(system.stats.evolutionCount).toBe(0);
        });
        it('should re-register default tools after reset', () => {
            system.reset();
            expect(system.tools.has('getDream')).toBe(true);
        });
    });

    describe('DREAM_TYPES export', () => {
        it('should have 5 dream types', () => {
            expect(Object.keys(DREAM_TYPES).length).toBe(5);
        });
        it('should have valid config for each type', () => {
            for (const [key, value] of Object.entries(DREAM_TYPES)) {
                expect(value.name).toBeDefined();
                expect(value.baseDuration).toBeGreaterThan(0);
                expect(value.baseQuality).toBeDefined();
            }
        });
    });

    describe('QUALITY_THRESHOLDS + QUALITY_TIERS exports', () => {
        it('should have ordered thresholds', () => {
            expect(QUALITY_THRESHOLDS.common).toBeLessThan(QUALITY_THRESHOLDS.rare);
            expect(QUALITY_THRESHOLDS.rare).toBeLessThan(QUALITY_THRESHOLDS.legendary);
            expect(QUALITY_THRESHOLDS.legendary).toBeLessThan(QUALITY_THRESHOLDS.mythic);
        });
        it('should have 4 quality tiers', () => {
            expect(QUALITY_TIERS.length).toBe(4);
        });
    });

    describe('edge cases', () => {
        it('should handle multiple exits for same player', () => {
            const d1 = system.enterDream('p1', 'meditation');
            const d2 = system.enterDream('p1', 'pill');
            system.exitDream(d1.dream.id);
            system.exitDream(d2.dream.id);
            expect(system.stats.totalExited).toBe(2);
        });
        it('should handle dream with quality upgrade', () => {
            const s = new CultivationDreamCore({ autoClassify: true });
            const { dream } = s.enterDream('p1', 'meditation');
            s.stats.byQuality.common = 1;
            s.exitDream(dream.id, { score: 99 });
            expect(s.stats.byQuality.mythic).toBe(1);
        });
        it('should keep dream in playerDreams even after exit', () => {
            const { dream } = system.enterDream('p1', 'meditation');
            system.exitDream(dream.id);
            expect(system.playerDreams.get('p1')).toContain(dream.id);
        });
        it('should handle insight overflow gracefully', () => {
            const s = new CultivationDreamCore({ maxInsightsPerDream: 1 });
            const { dream } = s.enterDream('p1', 'meditation');
            s.exitDream(dream.id, { insights: ['a', 'b'] });
            expect(s.getDream(dream.id).insights).toEqual(['a']);
        });
        it('should preserve stats on fromJSON when not provided', () => {
            const s = new CultivationDreamCore();
            s.autoEvolve();
            s.fromJSON({});
            // Stats are preserved when data.stats is not provided
            expect(s.stats.evolutionCount).toBe(1);
        });
    });
});