/**
 * CultivationL1AchievementIndex.test.js - 修真L1成就索引测试
 * V889 P-20260613-063 Iteration 2/30 Round 35
 * 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    CultivationL1AchievementIndex,
    ACHIEVEMENT_CATEGORIES,
    ACHIEVEMENT_CATEGORY_COUNT,
    ACHIEVEMENT_TIERS,
    ACHIEVEMENT_TIER_COUNT,
    DEFAULT_POINTS_PER_TIER,
    DEFAULT_POINTS_PER_TIER_COUNT,
    MAX_ACHIEVEMENTS_PER_PLAYER,
    ACHIEVEMENT_CATALOG,
    ACHIEVEMENT_CATALOG_SIZE,
    ACHIEVEMENT_INDEX_SCORE_FACTOR,
    L1_LAYER,
    INVALID_PLAYER_ID,
    INVALID_ACHIEVEMENT_ID,
    INVALID_CATEGORY,
    INVALID_TIER,
    INVALID_NAME,
    DUPLICATE_ACHIEVEMENT,
    PLAYER_FULL,
    ACHIEVEMENT_NOT_FOUND,
    INVALID_TOOL_NAME,
    INVALID_HANDLER,
    UNKNOWN_TOOL,
    TOOL_EXECUTION_ERROR,
    INVALID_EVENT_NAME,
    EVENT_NOT_REGISTERED,
    HANDLER_NOT_FOUND,
    INVALID_DATA,
} from '../../../systems/ai/CultivationL1AchievementIndex.js';

describe('CultivationL1AchievementIndex', () => {
    let system;
    beforeEach(() => {
        system = new CultivationL1AchievementIndex();
    });

    describe('constants and exports', () => {
        it('should expose 4 categories', () => {
            expect(ACHIEVEMENT_CATEGORY_COUNT).toBe(4);
            expect(ACHIEVEMENT_CATEGORIES.length).toBe(4);
            expect(ACHIEVEMENT_CATEGORIES).toEqual(['combat', 'cultivation', 'social', 'exploration']);
        });
        it('should expose 4 tiers', () => {
            expect(ACHIEVEMENT_TIER_COUNT).toBe(4);
            expect(ACHIEVEMENT_TIERS.length).toBe(4);
            expect(ACHIEVEMENT_TIERS).toEqual(['bronze', 'silver', 'gold', 'platinum']);
        });
        it('should expose 4 levels of default points', () => {
            expect(DEFAULT_POINTS_PER_TIER_COUNT).toBe(4);
            expect(DEFAULT_POINTS_PER_TIER.bronze).toBe(10);
            expect(DEFAULT_POINTS_PER_TIER.silver).toBe(25);
            expect(DEFAULT_POINTS_PER_TIER.gold).toBe(50);
            expect(DEFAULT_POINTS_PER_TIER.platinum).toBe(100);
        });
        it('should expose MAX_ACHIEVEMENTS_PER_PLAYER', () => {
            expect(MAX_ACHIEVEMENTS_PER_PLAYER).toBe(100);
        });
        it('should expose L1 layer identifier', () => {
            expect(L1_LAYER).toBe('L1');
        });
        it('should expose an achievement catalog', () => {
            expect(ACHIEVEMENT_CATALOG_SIZE).toBeGreaterThan(0);
            expect(ACHIEVEMENT_CATALOG.first_step).toBeDefined();
            expect(ACHIEVEMENT_CATALOG.first_step.category).toBe('cultivation');
            expect(ACHIEVEMENT_CATALOG.first_step.tier).toBe('bronze');
        });
        it('should expose index score factor as small value', () => {
            expect(ACHIEVEMENT_INDEX_SCORE_FACTOR).toBeLessThan(1);
        });
    });

    describe('constructor', () => {
        it('should initialize with default config', () => {
            expect(system.config.maxAchievementsPerPlayer).toBe(MAX_ACHIEVEMENTS_PER_PLAYER);
            expect(system.config.allowDuplicates).toBe(false);
            expect(system.config.defaultCategory).toBe('cultivation');
            expect(system.config.defaultTier).toBe('bronze');
        });
        it('should accept custom config', () => {
            const s = new CultivationL1AchievementIndex({
                maxAchievementsPerPlayer: 5,
                allowDuplicates: true,
                defaultCategory: 'combat',
                defaultTier: 'silver',
            });
            expect(s.config.maxAchievementsPerPlayer).toBe(5);
            expect(s.config.allowDuplicates).toBe(true);
            expect(s.config.defaultCategory).toBe('combat');
            expect(s.config.defaultTier).toBe('silver');
        });
        it('should initialize empty maps', () => {
            expect(system.achievements.size).toBe(0);
            expect(system.playerAchievements.size).toBe(0);
        });
        it('should initialize stats with zero counters', () => {
            expect(system.stats.totalUnlocked).toBe(0);
            expect(system.stats.totalQueried).toBe(0);
            expect(system.stats.totalIndexed).toBe(0);
            expect(system.stats.totalPoints).toBe(0);
            expect(system.stats.evolutionCount).toBe(0);
        });
        it('should register default tools', () => {
            expect(system.tools.has('unlock')).toBe(true);
            expect(system.tools.has('query')).toBe(true);
            expect(system.tools.has('index')).toBe(true);
            expect(system.tools.has('listByTier')).toBe(true);
        });
    });

    describe('unlockAchievement', () => {
        it('should unlock a catalog achievement', () => {
            const { success, achievement } = system.unlockAchievement('p1', 'first_step');
            expect(success).toBe(true);
            expect(achievement.playerId).toBe('p1');
            expect(achievement.achievementId).toBe('first_step');
            expect(achievement.achievementName).toBe('初入仙途');
            expect(achievement.category).toBe('cultivation');
            expect(achievement.tier).toBe('bronze');
            expect(achievement.points).toBe(10);
        });
        it('should reject empty playerId', () => {
            const result = system.unlockAchievement('', 'first_step');
            expect(result.success).toBe(false);
            expect(result.error).toBe(INVALID_PLAYER_ID);
        });
        it('should reject empty achievementId', () => {
            const result = system.unlockAchievement('p1', '');
            expect(result.success).toBe(false);
            expect(result.error).toBe(INVALID_ACHIEVEMENT_ID);
        });
        it('should reject duplicate unlock (default config)', () => {
            system.unlockAchievement('p1', 'first_step');
            const result = system.unlockAchievement('p1', 'first_step');
            expect(result.success).toBe(false);
            expect(result.error).toBe(DUPLICATE_ACHIEVEMENT);
        });
        it('should allow duplicate when allowDuplicates=true', () => {
            const s = new CultivationL1AchievementIndex({ allowDuplicates: true });
            const r1 = s.unlockAchievement('p1', 'first_step');
            const r2 = s.unlockAchievement('p1', 'first_step');
            expect(r1.success).toBe(true);
            expect(r2.success).toBe(true);
        });
        it('should reject override with invalid category', () => {
            const result = system.unlockAchievement('p1', 'first_step', { category: 'invalid' });
            expect(result.error).toBe(INVALID_CATEGORY);
        });
        it('should reject override with invalid tier', () => {
            const result = system.unlockAchievement('p1', 'first_step', { tier: 'invalid' });
            expect(result.error).toBe(INVALID_TIER);
        });
        it('should reject override with empty name', () => {
            const result = system.unlockAchievement('p1', 'first_step', { name: '' });
            expect(result.error).toBe(INVALID_NAME);
        });
        it('should use override values when provided', () => {
            const { achievement } = system.unlockAchievement('p1', 'first_step', {
                name: 'Custom',
                category: 'combat',
                tier: 'platinum',
            });
            expect(achievement.achievementName).toBe('Custom');
            expect(achievement.category).toBe('combat');
            expect(achievement.tier).toBe('platinum');
            expect(achievement.points).toBe(100);
        });
        it('should use default category/tier when achievementId not in catalog', () => {
            const { achievement } = system.unlockAchievement('p1', 'custom_xyz');
            expect(achievement.category).toBe('cultivation');
            expect(achievement.tier).toBe('bronze');
        });
        it('should reject when max achievements reached', () => {
            const s = new CultivationL1AchievementIndex({ maxAchievementsPerPlayer: 2 });
            s.unlockAchievement('p1', 'first_step');
            s.unlockAchievement('p1', 'qi_sense');
            const result = s.unlockAchievement('p1', 'breakthrough_qi');
            expect(result.success).toBe(false);
            expect(result.error).toBe(PLAYER_FULL);
        });
        it('should reject non-string playerId', () => {
            const result = system.unlockAchievement(null, 'first_step');
            expect(result.error).toBe(INVALID_PLAYER_ID);
        });
        it('should reject non-string achievementId', () => {
            const result = system.unlockAchievement('p1', null);
            expect(result.error).toBe(INVALID_ACHIEVEMENT_ID);
        });
        it('should track player achievements', () => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p1', 'qi_sense');
            expect(system.playerAchievements.get('p1').length).toBe(2);
        });
        it('should assign different points per tier', () => {
            const r1 = system.unlockAchievement('p1', 'first_step');
            const r2 = system.unlockAchievement('p1', 'breakthrough_qi');
            const r3 = system.unlockAchievement('p1', 'foundation');
            const r4 = system.unlockAchievement('p1', 'golden_core');
            expect(r1.achievement.points).toBe(10);
            expect(r2.achievement.points).toBe(25);
            expect(r3.achievement.points).toBe(50);
            expect(r4.achievement.points).toBe(100);
        });
        it('should update byCategory stats', () => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p2', 'first_combat_win');
            expect(system.stats.byCategory.cultivation).toBe(1);
            expect(system.stats.byCategory.combat).toBe(1);
        });
        it('should update byTier stats', () => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p2', 'golden_core');
            expect(system.stats.byTier.bronze).toBe(1);
            expect(system.stats.byTier.platinum).toBe(1);
        });
        it('should update totalUnlocked and totalPoints', () => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p2', 'breakthrough_qi');
            expect(system.stats.totalUnlocked).toBe(2);
            expect(system.stats.totalPoints).toBe(35);
        });
        it('should set unlockedAt to current time', () => {
            const before = Date.now();
            const { achievement } = system.unlockAchievement('p1', 'first_step');
            const after = Date.now();
            expect(achievement.unlockedAt).toBeGreaterThanOrEqual(before);
            expect(achievement.unlockedAt).toBeLessThanOrEqual(after);
        });
        it('should assign unique ids', () => {
            const r1 = system.unlockAchievement('p1', 'first_step');
            const r2 = system.unlockAchievement('p2', 'first_step');
            expect(r1.achievement.id).not.toBe(r2.achievement.id);
            expect(r1.achievement.id).toMatch(/^ach_/);
        });
        it('should return cloned achievement', () => {
            const { achievement } = system.unlockAchievement('p1', 'first_step');
            achievement.points = 999;
            const fresh = system.getAchievement(achievement.id);
            expect(fresh.points).toBe(10);
        });
    });

    describe('queryAchievementStatus', () => {
        beforeEach(() => {
            system.unlockAchievement('p1', 'first_step');
        });
        it('should return unlocked=true for unlocked achievement', () => {
            const result = system.queryAchievementStatus('p1', 'first_step');
            expect(result.unlocked).toBe(true);
            expect(result.achievementId).toBe('first_step');
            expect(result.points).toBe(10);
        });
        it('should return unlocked=false for unknown achievementId', () => {
            const result = system.queryAchievementStatus('p1', 'unknown');
            expect(result.unlocked).toBe(false);
            expect(result.points).toBe(0);
        });
        it('should return unlocked=false for unknown playerId', () => {
            const result = system.queryAchievementStatus('ghost', 'first_step');
            expect(result.unlocked).toBe(false);
        });
        it('should reject empty playerId', () => {
            const result = system.queryAchievementStatus('', 'first_step');
            expect(result.unlocked).toBe(false);
            expect(result.error).toBe(INVALID_PLAYER_ID);
        });
        it('should reject empty achievementId', () => {
            const result = system.queryAchievementStatus('p1', '');
            expect(result.unlocked).toBe(false);
            expect(result.error).toBe(INVALID_ACHIEVEMENT_ID);
        });
        it('should reject non-string playerId', () => {
            const result = system.queryAchievementStatus(123, 'first_step');
            expect(result.unlocked).toBe(false);
            expect(result.error).toBe(INVALID_PLAYER_ID);
        });
        it('should reject non-string achievementId', () => {
            const result = system.queryAchievementStatus('p1', null);
            expect(result.unlocked).toBe(false);
            expect(result.error).toBe(INVALID_ACHIEVEMENT_ID);
        });
        it('should increment totalQueried stat', () => {
            const before = system.stats.totalQueried;
            system.queryAchievementStatus('p1', 'first_step');
            expect(system.stats.totalQueried).toBe(before + 1);
        });
        it('should return cloned achievement in result', () => {
            const result = system.queryAchievementStatus('p1', 'first_step');
            result.achievement.points = 999;
            const fresh = system.queryAchievementStatus('p1', 'first_step');
            expect(fresh.points).toBe(10);
        });
    });

    describe('indexAchievements', () => {
        beforeEach(() => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p1', 'first_combat_win');
            system.unlockAchievement('p1', 'breakthrough_qi');
        });
        it('should group by category', () => {
            const result = system.indexAchievements('p1');
            expect(result.byCategory.cultivation.length).toBe(2);
            expect(result.byCategory.combat.length).toBe(1);
            expect(result.byCategory.social.length).toBe(0);
            expect(result.byCategory.exploration.length).toBe(0);
        });
        it('should group by tier', () => {
            const result = system.indexAchievements('p1');
            expect(result.byTier.bronze.length).toBe(2);
            expect(result.byTier.silver.length).toBe(1);
            expect(result.byTier.gold.length).toBe(0);
            expect(result.byTier.platinum.length).toBe(0);
        });
        it('should report total count', () => {
            const result = system.indexAchievements('p1');
            expect(result.total).toBe(3);
        });
        it('should report totalPoints', () => {
            const result = system.indexAchievements('p1');
            expect(result.totalPoints).toBe(45);
        });
        it('should return empty for unknown player', () => {
            const result = system.indexAchievements('ghost');
            expect(result.total).toBe(0);
            expect(result.totalPoints).toBe(0);
            expect(result.byCategory.cultivation).toEqual([]);
            expect(result.byTier.bronze).toEqual([]);
        });
        it('should reject empty playerId gracefully', () => {
            const result = system.indexAchievements('');
            expect(result.total).toBe(0);
        });
        it('should reject non-string playerId gracefully', () => {
            const result = system.indexAchievements(null);
            expect(result.total).toBe(0);
        });
        it('should increment totalIndexed stat', () => {
            const before = system.stats.totalIndexed;
            system.indexAchievements('p1');
            expect(system.stats.totalIndexed).toBe(before + 1);
        });
        it('should separate by player', () => {
            system.unlockAchievement('p2', 'foundation');
            const r1 = system.indexAchievements('p1');
            const r2 = system.indexAchievements('p2');
            expect(r1.total).toBe(3);
            expect(r2.total).toBe(1);
            expect(r2.byCategory.cultivation.length).toBe(1);
        });
    });

    describe('getAchievement', () => {
        it('should return achievement by internal id', () => {
            const { achievement } = system.unlockAchievement('p1', 'first_step');
            const fetched = system.getAchievement(achievement.id);
            expect(fetched.id).toBe(achievement.id);
            expect(fetched.playerId).toBe('p1');
        });
        it('should return null for unknown internal id', () => {
            expect(system.getAchievement('unknown')).toBe(null);
        });
    });

    describe('listByPlayer', () => {
        it('should return empty for unknown player', () => {
            expect(system.listByPlayer('unknown')).toEqual([]);
        });
        it('should list all player achievements', () => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p1', 'qi_sense');
            expect(system.listByPlayer('p1').length).toBe(2);
        });
        it('should separate by player', () => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p2', 'first_step');
            expect(system.listByPlayer('p1').length).toBe(1);
            expect(system.listByPlayer('p2').length).toBe(1);
        });
    });

    describe('listByCategory', () => {
        it('should filter by category', () => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p2', 'first_combat_win');
            expect(system.listByCategory('cultivation').length).toBe(1);
            expect(system.listByCategory('combat').length).toBe(1);
        });
        it('should return empty for unknown category', () => {
            expect(system.listByCategory('invalid')).toEqual([]);
        });
        it('should aggregate across players', () => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p2', 'qi_sense');
            system.unlockAchievement('p3', 'first_combat_win');
            expect(system.listByCategory('cultivation').length).toBe(2);
            expect(system.listByCategory('combat').length).toBe(1);
        });
        it('should return empty for each category when no achievements', () => {
            expect(system.listByCategory('social').length).toBe(0);
            expect(system.listByCategory('exploration').length).toBe(0);
        });
    });

    describe('listByTier', () => {
        it('should filter by tier', () => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p2', 'golden_core');
            expect(system.listByTier('bronze').length).toBe(1);
            expect(system.listByTier('platinum').length).toBe(1);
        });
        it('should return empty for unknown tier', () => {
            expect(system.listByTier('mythic')).toEqual([]);
        });
        it('should aggregate across players', () => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p2', 'qi_sense');
            system.unlockAchievement('p3', 'golden_core');
            expect(system.listByTier('bronze').length).toBe(2);
            expect(system.listByTier('platinum').length).toBe(1);
        });
    });

    describe('listByCategoryForPlayer + listByTierForPlayer', () => {
        beforeEach(() => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p1', 'first_combat_win');
            system.unlockAchievement('p1', 'breakthrough_qi');
        });
        it('should filter player achievements by category', () => {
            const result = system.listByCategoryForPlayer('p1', 'cultivation');
            expect(result.length).toBe(2);
        });
        it('should filter player achievements by tier', () => {
            const result = system.listByTierForPlayer('p1', 'bronze');
            expect(result.length).toBe(2);
        });
        it('should return empty for invalid category', () => {
            expect(system.listByCategoryForPlayer('p1', 'invalid')).toEqual([]);
        });
        it('should return empty for invalid tier', () => {
            expect(system.listByTierForPlayer('p1', 'invalid')).toEqual([]);
        });
        it('should return empty for unknown player', () => {
            expect(system.listByCategoryForPlayer('ghost', 'cultivation')).toEqual([]);
            expect(system.listByTierForPlayer('ghost', 'bronze')).toEqual([]);
        });
    });

    describe('getAchievementStats', () => {
        it('should return zero stats for unknown player', () => {
            const stats = system.getAchievementStats('unknown');
            expect(stats.total).toBe(0);
            expect(stats.totalPoints).toBe(0);
            expect(stats.indexScore).toBe(0);
            expect(stats.byCategory.cultivation).toBe(0);
            expect(stats.byTier.bronze).toBe(0);
        });
        it('should compute totalPoints and indexScore', () => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p1', 'breakthrough_qi');
            const stats = system.getAchievementStats('p1');
            expect(stats.totalPoints).toBe(35);
            expect(stats.indexScore).toBeCloseTo(0.35, 10);
        });
        it('should cap indexScore at 1 (Math.min)', () => {
            system.unlockAchievement('p1', 'golden_core');
            system.unlockAchievement('p2', 'golden_core');
            const stats = system.getAchievementStats('p1');
            expect(stats.indexScore).toBeLessThanOrEqual(1);
        });
        it('should compute byCategory and byTier', () => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p1', 'qi_sense');
            system.unlockAchievement('p1', 'first_combat_win');
            const stats = system.getAchievementStats('p1');
            expect(stats.byCategory.cultivation).toBe(2);
            expect(stats.byCategory.combat).toBe(1);
            expect(stats.byTier.bronze).toBe(3);
        });
        it('should report total achievements', () => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p1', 'qi_sense');
            expect(system.getAchievementStats('p1').total).toBe(2);
        });
    });

    describe('deleteAchievement', () => {
        it('should delete an achievement by internal id', () => {
            const { achievement } = system.unlockAchievement('p1', 'first_step');
            const result = system.deleteAchievement(achievement.id);
            expect(result.success).toBe(true);
            expect(system.achievements.has(achievement.id)).toBe(false);
        });
        it('should remove from player achievements', () => {
            const { achievement } = system.unlockAchievement('p1', 'first_step');
            system.deleteAchievement(achievement.id);
            expect(system.playerAchievements.get('p1').length).toBe(0);
        });
        it('should reject unknown id', () => {
            const result = system.deleteAchievement('unknown');
            expect(result.error).toBe(ACHIEVEMENT_NOT_FOUND);
        });
    });

    describe('registerTool + executeTool', () => {
        it('should register a custom tool', () => {
            const result = system.registerTool('myTool', () => 42);
            expect(result.success).toBe(true);
            expect(system.tools.has('myTool')).toBe(true);
        });
        it('should reject empty tool name', () => {
            expect(system.registerTool('', () => {}).error).toBe(INVALID_TOOL_NAME);
        });
        it('should reject invalid handler', () => {
            expect(system.registerTool('t', null).error).toBe(INVALID_HANDLER);
        });
        it('should execute a registered tool', () => {
            system.registerTool('get42', () => 42);
            const result = system.executeTool('get42');
            expect(result.result).toBe(42);
        });
        it('should pass context to the tool', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo', { x: 1 });
            expect(result.result.x).toBe(1);
        });
        it('should default context to {} when undefined', () => {
            system.registerTool('keysLen', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('keysLen');
            expect(result.result).toBe(0);
        });
        it('should default context to {} when null', () => {
            system.registerTool('keysLen2', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('keysLen2', null);
            expect(result.result).toBe(0);
        });
        it('should default context to {} when missing context arg', () => {
            system.registerTool('noop', (ctx) => ctx);
            const result = system.executeTool('noop');
            expect(result.result).toEqual({});
        });
        it('should return UNKNOWN_TOOL for missing tool', () => {
            expect(system.executeTool('nonexistent').error).toBe(UNKNOWN_TOOL);
        });
        it('should handle tool execution errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad');
            expect(result.success).toBe(false);
            expect(result.error).toBe(TOOL_EXECUTION_ERROR);
        });
        it('should call built-in unlock via tool', () => {
            const result = system.executeTool('unlock', { playerId: 'p1', achievementId: 'first_step' });
            expect(result.result.success).toBe(true);
        });
        it('should call built-in query via tool', () => {
            system.executeTool('unlock', { playerId: 'p1', achievementId: 'first_step' });
            const result = system.executeTool('query', { playerId: 'p1', achievementId: 'first_step' });
            expect(result.result.unlocked).toBe(true);
        });
        it('should call built-in index via tool', () => {
            system.executeTool('unlock', { playerId: 'p1', achievementId: 'first_step' });
            const result = system.executeTool('index', { playerId: 'p1' });
            expect(result.result.total).toBe(1);
        });
        it('should call built-in listByTier via tool', () => {
            system.executeTool('unlock', { playerId: 'p1', achievementId: 'first_step' });
            const result = system.executeTool('listByTier', { tier: 'bronze' });
            expect(result.result.length).toBe(1);
        });
    });

    describe('registerHook + triggerHook', () => {
        it('should register a hook', () => {
            const result = system.registerHook('onTest', () => {});
            expect(result.success).toBe(true);
        });
        it('should reject invalid event name', () => {
            expect(system.registerHook('', () => {}).error).toBe(INVALID_EVENT_NAME);
        });
        it('should reject invalid handler', () => {
            expect(system.registerHook('onTest', null).error).toBe(INVALID_HANDLER);
        });
        it('should trigger onUnlock hook on unlockAchievement', () => {
            let called = false;
            system.registerHook('onUnlock', () => { called = true; });
            system.unlockAchievement('p1', 'first_step');
            expect(called).toBe(true);
        });
        it('should handle hook errors silently', () => {
            system.registerHook('onUnlock', () => { throw new Error('hook-fail'); });
            expect(() => system.unlockAchievement('p1', 'first_step')).not.toThrow();
        });
        it('should support multiple handlers per event', () => {
            let count = 0;
            system.registerHook('onUnlock', () => { count++; });
            system.registerHook('onUnlock', () => { count++; });
            system.unlockAchievement('p1', 'first_step');
            expect(count).toBe(2);
        });
        it('should unregister a hook', () => {
            const handler = () => {};
            system.registerHook('onTest', handler);
            const result = system.unregisterHook('onTest', handler);
            expect(result.success).toBe(true);
        });
        it('should return error when unregistering missing event', () => {
            expect(system.unregisterHook('noEvent', () => {}).error).toBe(EVENT_NOT_REGISTERED);
        });
        it('should return error when unregistering missing handler', () => {
            const h1 = () => {};
            const h2 = () => {};
            system.registerHook('onTest', h1);
            expect(system.unregisterHook('onTest', h2).error).toBe(HANDLER_NOT_FOUND);
        });
    });

    describe('toJSON + fromJSON', () => {
        it('should serialize state', () => {
            system.unlockAchievement('p1', 'first_step');
            const json = system.toJSON();
            expect(json.achievements.length).toBe(1);
            expect(json.playerAchievements.length).toBe(1);
            expect(json.stats.totalUnlocked).toBe(1);
        });
        it('should roundtrip via fromJSON', () => {
            system.unlockAchievement('p1', 'first_step');
            const json = system.toJSON();
            const s2 = new CultivationL1AchievementIndex();
            const r = s2.fromJSON(json);
            expect(r.success).toBe(true);
            expect(s2.achievements.size).toBe(1);
            expect(s2.playerAchievements.size).toBe(1);
        });
        it('should reject null data', () => {
            expect(system.fromJSON(null).error).toBe(INVALID_DATA);
        });
        it('should reject non-object data', () => {
            expect(system.fromJSON('bad').error).toBe(INVALID_DATA);
        });
        it('should apply config overrides', () => {
            const r = system.fromJSON({ config: { allowDuplicates: true } });
            expect(r.success).toBe(true);
            expect(system.config.allowDuplicates).toBe(true);
        });
        it('should restore stats', () => {
            const r = system.fromJSON({ stats: { totalUnlocked: 7 } });
            expect(r.success).toBe(true);
            expect(system.stats.totalUnlocked).toBe(7);
        });
    });

    describe('getStats', () => {
        it('should expose extended stats', () => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p2', 'qi_sense');
            const stats = system.getStats();
            expect(stats.totalAchievements).toBe(2);
            expect(stats.totalPlayers).toBe(2);
            expect(stats.totalUnlocked).toBe(2);
        });
        it('should report zeros when empty', () => {
            const stats = system.getStats();
            expect(stats.totalAchievements).toBe(0);
            expect(stats.totalPlayers).toBe(0);
        });
    });

    describe('autoEvolve + reset', () => {
        it('should increment evolutionCount', () => {
            const r = system.autoEvolve();
            expect(r.success).toBe(true);
            expect(r.evolutionCount).toBe(1);
        });
        it('should trigger onEvolve hook', () => {
            let called = false;
            system.registerHook('onEvolve', () => { called = true; });
            system.autoEvolve();
            expect(called).toBe(true);
        });
        it('should handle evolve hook errors silently', () => {
            system.registerHook('onEvolve', () => { throw new Error('boom'); });
            expect(() => system.autoEvolve()).not.toThrow();
        });
        it('should reset all state', () => {
            system.unlockAchievement('p1', 'first_step');
            const r = system.reset();
            expect(r.success).toBe(true);
            expect(system.achievements.size).toBe(0);
            expect(system.playerAchievements.size).toBe(0);
            expect(system.stats.totalUnlocked).toBe(0);
            expect(system.hooks.size).toBe(0);
        });
        it('should re-register default tools after reset', () => {
            system.reset();
            expect(system.tools.has('unlock')).toBe(true);
            expect(system.tools.has('query')).toBe(true);
            expect(system.tools.has('index')).toBe(true);
            expect(system.tools.has('listByTier')).toBe(true);
        });
    });

    describe('_hasAchievement + _findAchievementId (internal helpers)', () => {
        it('should return false for unknown player', () => {
            expect(system._hasAchievement('ghost', 'first_step')).toBe(false);
            expect(system._findAchievementId('ghost', 'first_step')).toBe(null);
        });
        it('should return false for known player without the achievement', () => {
            system.unlockAchievement('p1', 'first_step');
            expect(system._hasAchievement('p1', 'golden_core')).toBe(false);
            expect(system._findAchievementId('p1', 'golden_core')).toBe(null);
        });
        it('should return true for known achievement', () => {
            const { achievement } = system.unlockAchievement('p1', 'first_step');
            expect(system._hasAchievement('p1', 'first_step')).toBe(true);
            expect(system._findAchievementId('p1', 'first_step')).toBe(achievement.id);
        });
        it('should skip stale ids in playerAchievements (defensive branch)', () => {
            system.unlockAchievement('p1', 'first_step');
            const stale = 'ach_stale_xyz';
            system.playerAchievements.get('p1').push(stale);
            expect(system._hasAchievement('p1', 'first_step')).toBe(true);
            expect(system._findAchievementId('p1', 'first_step')).not.toBe(null);
        });
    });

    describe('indexAchievements with stale ids (defensive continue branch)', () => {
        it('should skip ids in playerAchievements missing from achievements map', () => {
            system.unlockAchievement('p1', 'first_step');
            system.playerAchievements.get('p1').push('ach_stale_999');
            const result = system.indexAchievements('p1');
            expect(result.total).toBe(2);
            expect(result.byCategory.cultivation.length).toBe(1);
        });
    });

    describe('_bumpCounter (internal helper)', () => {
        it('should increment existing key', () => {
            const m = { a: 3 };
            expect(system._bumpCounter(m, 'a')).toBe(4);
        });
        it('should use 0 fallback for missing key (nullish branch)', () => {
            const m = { a: 3 };
            expect(system._bumpCounter(m, 'missing')).toBe(1);
        });
        it('should treat null as missing (nullish branch)', () => {
            const m = { a: null };
            expect(system._bumpCounter(m, 'a')).toBe(1);
        });
    });

    describe('end-to-end L1 indexing scenario', () => {
        it('should support the L1 -> L2 promotion signal flow', () => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p1', 'breakthrough_qi');
            system.unlockAchievement('p1', 'foundation');
            system.unlockAchievement('p1', 'golden_core');
            const stats = system.getAchievementStats('p1');
            expect(stats.totalPoints).toBe(185);
            expect(stats.indexScore).toBe(1);
            expect(stats.byTier.gold).toBe(1);
            expect(stats.byTier.platinum).toBe(1);
        });
        it('should isolate achievements between players', () => {
            system.unlockAchievement('p1', 'first_step');
            system.unlockAchievement('p2', 'golden_core');
            const idx1 = system.indexAchievements('p1');
            const idx2 = system.indexAchievements('p2');
            expect(idx1.total).toBe(1);
            expect(idx2.total).toBe(1);
            expect(idx1.byCategory.cultivation.length).toBe(1);
            expect(idx2.byCategory.cultivation.length).toBe(1);
            expect(idx1.byTier.platinum.length).toBe(0);
            expect(idx2.byTier.platinum.length).toBe(1);
        });
    });
});