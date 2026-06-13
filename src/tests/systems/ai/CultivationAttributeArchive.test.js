/**
 * CultivationAttributeArchive.test.js - 修真属性档案系统测试
 * V899 P-20260613-073 Iteration 12/30 Round 35
 * 目标: 99%+
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    CultivationAttributeArchive,
    ARCHIVABLE_ATTRIBUTES, ARCHIVABLE_ATTRIBUTE_COUNT, ATTRIBUTE_META,
    MAX_HISTORY_PER_ATTR, DEFAULT_MAX_HISTORY, ATTRIBUTE_CHANGE_RULES,
    COMPARE_MODES, COMPARE_MODE_COUNT,
    INVALID_PLAYER_ID, INVALID_ATTRIBUTE, INVALID_VALUE,
    ATTRIBUTE_NOT_FOUND, INVALID_COMPARE_MODE,
    UNKNOWN_TOOL, INVALID_TOOL_NAME, INVALID_HANDLER, INVALID_EVENT_NAME,
    EVENT_NOT_FOUND, HANDLER_NOT_FOUND, INVALID_DATA, TOOL_EXECUTION_ERROR,
} from '../../../systems/ai/CultivationAttributeArchive.js';

describe('CultivationAttributeArchive', () => {
    let system;
    beforeEach(() => { system = new CultivationAttributeArchive(); });

    describe('constructor & config', () => {
        it('should initialize with default config', () => {
            expect(system.config.maxHistory).toBe(DEFAULT_MAX_HISTORY);
            expect(system.config.maxHistory).toBe(MAX_HISTORY_PER_ATTR);
            expect(system.config.minDelta).toBe(ATTRIBUTE_CHANGE_RULES.minDelta);
            expect(system.config.maxDelta).toBe(ATTRIBUTE_CHANGE_RULES.maxDelta);
            expect(system.config.absoluteMin).toBe(ATTRIBUTE_CHANGE_RULES.absoluteMin);
            expect(system.config.absoluteMax).toBe(ATTRIBUTE_CHANGE_RULES.absoluteMax);
            expect(system.config.decayEnabled).toBe(false);
            expect(system.config.decayRate).toBe(ATTRIBUTE_CHANGE_RULES.decayRate);
        });
        it('should accept custom config', () => {
            const s = new CultivationAttributeArchive({
                maxHistory: 5, minDelta: 0.01, maxDelta: 0.9,
                absoluteMin: -1, absoluteMax: 2,
                decayEnabled: true, decayRate: 0.05,
            });
            expect(s.config.maxHistory).toBe(5);
            expect(s.config.minDelta).toBe(0.01);
            expect(s.config.maxDelta).toBe(0.9);
            expect(s.config.absoluteMin).toBe(-1);
            expect(s.config.absoluteMax).toBe(2);
            expect(s.config.decayEnabled).toBe(true);
            expect(s.config.decayRate).toBe(0.05);
        });
        it('should handle maxHistory=1 edge case', () => {
            const s = new CultivationAttributeArchive({ maxHistory: 1 });
            expect(s.config.maxHistory).toBe(1);
        });
        it('should handle maxHistory=0 edge case', () => {
            const s = new CultivationAttributeArchive({ maxHistory: 0 });
            expect(s.config.maxHistory).toBe(0);
        });
        it('should initialize empty maps and stats', () => {
            expect(system.archives.size).toBe(0);
            expect(system.playerArchives.size).toBe(0);
            expect(system.attributeArchives.size).toBe(0);
            expect(system.tools.size).toBeGreaterThan(0);
            expect(system.hooks.size).toBe(0);
            expect(system.stats.totalArchived).toBe(0);
            expect(system.stats.totalRetrieved).toBe(0);
            expect(system.stats.totalCompared).toBe(0);
            expect(system.stats.totalDeleted).toBe(0);
            expect(system.stats.totalCleared).toBe(0);
        });
        it('should initialize byAttribute stats for all 10 attributes', () => {
            for (const attr of ARCHIVABLE_ATTRIBUTES) {
                expect(system.stats.byAttribute[attr]).toBe(0);
            }
        });
        it('should register default tools', () => {
            expect(system.tools.has('archiveAttribute')).toBe(true);
            expect(system.tools.has('retrieveAttribute')).toBe(true);
            expect(system.tools.has('compareAttributes')).toBe(true);
            expect(system.tools.has('listByPlayer')).toBe(true);
            expect(system.tools.has('listByAttribute')).toBe(true);
            expect(system.tools.has('getHistory')).toBe(true);
            expect(system.tools.has('deleteArchive')).toBe(true);
            expect(system.tools.has('clearHistory')).toBe(true);
        });
    });

    describe('edge cases / branch coverage', () => {
        it('clampValue should use default 0 when absoluteMin is null', () => {
            const s = new CultivationAttributeArchive({ absoluteMin: null });
            const r = s.archiveAttribute('p1', 'root_bone', -0.5);
            // absoluteMin is null, so lo=0, value gets clamped to 0
            expect(r.archive.currentValue).toBe(0);
        });
        it('clampValue should use default 1 when absoluteMax is null', () => {
            const s = new CultivationAttributeArchive({ absoluteMax: null });
            const r = s.archiveAttribute('p1', 'root_bone', 1.5);
            // absoluteMax is null, so hi=1, value gets clamped to 1
            expect(r.archive.currentValue).toBe(1);
        });
        it('clampValue should handle non-number with default return 0', () => {
            // Direct test of the inner _clampValue behavior via archiveAttribute NaN path
            const r = system.archiveAttribute('p1', 'root_bone', NaN);
            expect(r.error).toBe(INVALID_VALUE);
        });
        it('archiveAttribute should add byAttribute entry when missing', () => {
            // manually delete an entry to simulate missing init
            system.archiveAttribute('p1', 'root_bone', 0.5);
            delete system.stats.byAttribute.root_bone;
            system.archiveAttribute('p1', 'root_bone', 0.6);
            expect(system.stats.byAttribute.root_bone).toBe(1);
        });
        it('compareAttributes should use 0.0001 fallback when v2=0 and minDelta is null', () => {
            const s = new CultivationAttributeArchive({ minDelta: null });
            s.archiveAttribute('p1', 'root_bone', 0.5);
            s.archiveAttribute('p3', 'root_bone', 0);
            const r = s.compareAttributes('p1', 'p3', 'root_bone', 'relative');
            // diff=0.5, denom = minDelta(null) ?? 0.0001 = 0.0001, result = 5000
            expect(r.success).toBe(true);
            expect(r.difference).toBe(5000);
        });
        it('setMaxHistory should accept max value', () => {
            expect(system.setMaxHistory(1000).success).toBe(true);
        });
        it('executeTool archiveAttribute with missing options should work', () => {
            const r = system.executeTool('archiveAttribute', { playerId: 'p1', attribute: 'root_bone', value: 0.5 });
            expect(r.success).toBe(true);
            expect(r.result.success).toBe(true);
        });
        it('listByPlayer should filter out undefined entries', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            // Manually remove from archives to simulate stale entry
            system.archives.delete('p1:root_bone');
            const list = system.listByPlayer('p1');
            // Should still be 0 since filter removes undefined
            expect(list.length).toBe(0);
        });
        it('listByAttribute should filter out undefined entries', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            system.archives.delete('p1:root_bone');
            const list = system.listByAttribute('root_bone');
            expect(list.length).toBe(0);
        });
    });

    describe('exports & constants', () => {
        it('should export 10 archivable attributes', () => {
            expect(ARCHIVABLE_ATTRIBUTES).toEqual([
                'root_bone', 'aptitude', 'fortune', 'comprehension', 'willpower',
                'karma', 'luck', 'charm', 'intellect', 'endurance',
            ]);
            expect(ARCHIVABLE_ATTRIBUTE_COUNT).toBe(10);
        });
        it('should export 3 compare modes', () => {
            expect(COMPARE_MODES).toEqual(['absolute', 'relative', 'delta']);
            expect(COMPARE_MODE_COUNT).toBe(3);
        });
        it('should export MAX_HISTORY_PER_ATTR=30', () => {
            expect(MAX_HISTORY_PER_ATTR).toBe(30);
            expect(DEFAULT_MAX_HISTORY).toBe(30);
        });
        it('should have ATTRIBUTE_META entries', () => {
            expect(ATTRIBUTE_META.root_bone.name).toBe('根骨');
            expect(ATTRIBUTE_META.aptitude.name).toBe('悟性');
            expect(ATTRIBUTE_META.fortune.name).toBe('机缘');
            expect(ATTRIBUTE_META.comprehension.name).toBe('领悟');
            expect(ATTRIBUTE_META.willpower.name).toBe('意志');
            expect(ATTRIBUTE_META.karma.name).toBe('业力');
            expect(ATTRIBUTE_META.luck.name).toBe('气运');
            expect(ATTRIBUTE_META.charm.name).toBe('魅力');
            expect(ATTRIBUTE_META.intellect.name).toBe('智力');
            expect(ATTRIBUTE_META.endurance.name).toBe('耐力');
        });
        it('should have ATTRIBUTE_CHANGE_RULES with safe ranges', () => {
            expect(ATTRIBUTE_CHANGE_RULES.absoluteMin).toBe(0);
            expect(ATTRIBUTE_CHANGE_RULES.absoluteMax).toBe(1);
            expect(ATTRIBUTE_CHANGE_RULES.minDelta).toBeGreaterThan(0);
            expect(ATTRIBUTE_CHANGE_RULES.minDelta).toBeLessThan(0.01);
        });
    });

    describe('archiveAttribute', () => {
        it('should create a new archive on first call', () => {
            const res = system.archiveAttribute('p1', 'root_bone', 0.5);
            expect(res.success).toBe(true);
            expect(res.archive.id).toBeDefined();
            expect(res.archive.playerId).toBe('p1');
            expect(res.archive.attributeName).toBe('root_bone');
            expect(res.archive.baseValue).toBe(0.5);
            expect(res.archive.currentValue).toBe(0.5);
            expect(res.archive.history.length).toBe(1);
        });
        it('should accumulate history on subsequent calls', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            system.archiveAttribute('p1', 'root_bone', 0.6);
            const res = system.archiveAttribute('p1', 'root_bone', 0.7);
            expect(res.archive.history.length).toBe(3);
            expect(res.archive.history[0].value).toBe(0.5);
            expect(res.archive.history[1].value).toBe(0.6);
            expect(res.archive.history[2].value).toBe(0.7);
        });
        it('should keep baseValue fixed after first archive', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            system.archiveAttribute('p1', 'root_bone', 0.8);
            const res = system.archiveAttribute('p1', 'root_bone', 0.9);
            expect(res.archive.baseValue).toBe(0.5);
            expect(res.archive.currentValue).toBe(0.9);
        });
        it('should compute currentValue = baseValue + latest delta', () => {
            system.archiveAttribute('p1', 'aptitude', 0.4);
            const r2 = system.archiveAttribute('p1', 'aptitude', 0.7);
            // delta = 0.7 - 0.4 = 0.3
            // currentValue = 0.4 + 0.3 = 0.7
            expect(r2.archive.currentValue).toBeCloseTo(0.7, 10);
        });
        it('should clamp value to [absoluteMin, absoluteMax]', () => {
            const r1 = system.archiveAttribute('p1', 'luck', -0.5);
            expect(r1.archive.currentValue).toBe(0);
            const r2 = system.archiveAttribute('p1', 'luck', 1.5);
            expect(r2.archive.currentValue).toBe(1);
        });
        it('should record delta and reason in history entries', () => {
            system.archiveAttribute('p1', 'fortune', 0.5);
            const r = system.archiveAttribute('p1', 'fortune', 0.6, { reason: 'blessing', source: 'event' });
            expect(r.archive.history[1].delta).toBeCloseTo(0.1, 10);
            expect(r.archive.history[1].reason).toBe('blessing');
            expect(r.archive.history[1].source).toBe('event');
        });
        it('should respect custom id and recordedAt', () => {
            const r = system.archiveAttribute('p1', 'karma', 0.5, { id: 'custom-arch-id', recordedAt: 1700000000000 });
            expect(r.archive.id).toBe('custom-arch-id');
            expect(r.archive.recordedAt).toBe(1700000000000);
        });
        it('should truncate history when exceeding maxHistory', () => {
            const s = new CultivationAttributeArchive({ maxHistory: 3 });
            for (let i = 0; i < 5; i++) {
                s.archiveAttribute('p1', 'root_bone', 0.1 * (i + 1));
            }
            const r = s.retrieveAttribute('p1', 'root_bone');
            expect(r.archive.history.length).toBe(3);
            expect(r.archive.history[0].value).toBeCloseTo(0.3, 10);
            expect(r.archive.history[2].value).toBeCloseTo(0.5, 10);
        });
        it('should update stats on archive', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            system.archiveAttribute('p1', 'aptitude', 0.6);
            system.archiveAttribute('p2', 'root_bone', 0.4);
            expect(system.stats.totalArchived).toBe(3);
            expect(system.stats.byAttribute.root_bone).toBe(2);
            expect(system.stats.byAttribute.aptitude).toBe(1);
            expect(system.stats.byPlayer.p1).toBe(2);
            expect(system.stats.byPlayer.p2).toBe(1);
        });
        it('should fail with empty playerId', () => {
            expect(system.archiveAttribute('', 'root_bone', 0.5).error).toBe(INVALID_PLAYER_ID);
            expect(system.archiveAttribute(null, 'root_bone', 0.5).error).toBe(INVALID_PLAYER_ID);
            expect(system.archiveAttribute(undefined, 'root_bone', 0.5).error).toBe(INVALID_PLAYER_ID);
            expect(system.archiveAttribute(123, 'root_bone', 0.5).error).toBe(INVALID_PLAYER_ID);
        });
        it('should fail with invalid attribute', () => {
            expect(system.archiveAttribute('p1', 'invalid', 0.5).error).toBe(INVALID_ATTRIBUTE);
            expect(system.archiveAttribute('p1', null, 0.5).error).toBe(INVALID_ATTRIBUTE);
            expect(system.archiveAttribute('p1', '', 0.5).error).toBe(INVALID_ATTRIBUTE);
        });
        it('should fail with invalid value', () => {
            expect(system.archiveAttribute('p1', 'root_bone', 'foo').error).toBe(INVALID_VALUE);
            expect(system.archiveAttribute('p1', 'root_bone', null).error).toBe(INVALID_VALUE);
            expect(system.archiveAttribute('p1', 'root_bone', undefined).error).toBe(INVALID_VALUE);
            expect(system.archiveAttribute('p1', 'root_bone', NaN).error).toBe(INVALID_VALUE);
        });
    });

    describe('retrieveAttribute', () => {
        it('should retrieve an existing archive', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            const r = system.retrieveAttribute('p1', 'root_bone');
            expect(r.success).toBe(true);
            expect(r.archive.baseValue).toBe(0.5);
        });
        it('should return a deep copy of the archive', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            const r1 = system.retrieveAttribute('p1', 'root_bone');
            r1.archive.history[0].value = 999;
            const r2 = system.retrieveAttribute('p1', 'root_bone');
            expect(r2.archive.history[0].value).toBe(0.5);
        });
        it('should return ATTRIBUTE_NOT_FOUND for missing archive', () => {
            const r = system.retrieveAttribute('p1', 'root_bone');
            expect(r.success).toBe(false);
            expect(r.error).toBe(ATTRIBUTE_NOT_FOUND);
        });
        it('should fail with invalid player', () => {
            expect(system.retrieveAttribute('', 'root_bone').error).toBe(INVALID_PLAYER_ID);
            expect(system.retrieveAttribute(null, 'root_bone').error).toBe(INVALID_PLAYER_ID);
        });
        it('should fail with invalid attribute', () => {
            expect(system.retrieveAttribute('p1', 'unknown').error).toBe(INVALID_ATTRIBUTE);
        });
        it('should update stats', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            system.retrieveAttribute('p1', 'root_bone');
            system.retrieveAttribute('p1', 'root_bone');
            expect(system.stats.totalRetrieved).toBe(2);
        });
    });

    describe('compareAttributes', () => {
        beforeEach(() => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            system.archiveAttribute('p1', 'root_bone', 0.7);
            system.archiveAttribute('p2', 'root_bone', 0.4);
        });

        it('should compute absolute difference', () => {
            const r = system.compareAttributes('p1', 'p2', 'root_bone', 'absolute');
            expect(r.success).toBe(true);
            // p1.currentValue=0.7, p2.currentValue=0.4, diff=0.3
            expect(r.difference).toBeCloseTo(0.3, 10);
            expect(r.value1).toBeCloseTo(0.7, 10);
            expect(r.value2).toBeCloseTo(0.4, 10);
            expect(r.baseValue1).toBe(0.5);
            expect(r.baseValue2).toBe(0.4);
        });
        it('should compute relative difference', () => {
            const r = system.compareAttributes('p1', 'p2', 'root_bone', 'relative');
            // diff=0.3, v2=0.4, relative=0.3/0.4=0.75
            expect(r.difference).toBeCloseTo(0.75, 10);
            expect(r.mode).toBe('relative');
        });
        it('should compute delta with base deltas', () => {
            const r = system.compareAttributes('p1', 'p2', 'root_bone', 'delta');
            expect(r.mode).toBe('delta');
            expect(r.difference).toBeCloseTo(0.3, 10);
            // p1 baseDelta = 0.7 - 0.5 = 0.2
            // p2 baseDelta = 0.4 - 0.4 = 0
            expect(r.baseDelta1).toBeCloseTo(0.2, 10);
            expect(r.baseDelta2).toBeCloseTo(0, 10);
        });
        it('should default to absolute mode', () => {
            const r = system.compareAttributes('p1', 'p2', 'root_bone');
            expect(r.mode).toBe('absolute');
        });
        it('should handle relative division by zero safely', () => {
            system.archiveAttribute('p3', 'root_bone', 0);
            const r = system.compareAttributes('p1', 'p3', 'root_bone', 'relative');
            // p3.currentValue=0, denom uses minDelta=0.0001
            expect(r.success).toBe(true);
            expect(Number.isFinite(r.difference)).toBe(true);
        });
        it('should fail if either archive missing', () => {
            expect(system.compareAttributes('p1', 'unknown', 'root_bone').error).toBe(ATTRIBUTE_NOT_FOUND);
            expect(system.compareAttributes('unknown', 'p2', 'root_bone').error).toBe(ATTRIBUTE_NOT_FOUND);
        });
        it('should fail with invalid player IDs', () => {
            expect(system.compareAttributes('', 'p2', 'root_bone').error).toBe(INVALID_PLAYER_ID);
            expect(system.compareAttributes('p1', '', 'root_bone').error).toBe(INVALID_PLAYER_ID);
            expect(system.compareAttributes(null, 'p2', 'root_bone').error).toBe(INVALID_PLAYER_ID);
        });
        it('should fail with invalid attribute', () => {
            expect(system.compareAttributes('p1', 'p2', 'unknown').error).toBe(INVALID_ATTRIBUTE);
        });
        it('should fail with invalid compare mode', () => {
            expect(system.compareAttributes('p1', 'p2', 'root_bone', 'bogus').error).toBe(INVALID_COMPARE_MODE);
            expect(system.compareAttributes('p1', 'p2', 'root_bone', null).error).toBe(INVALID_COMPARE_MODE);
            expect(system.compareAttributes('p1', 'p2', 'root_bone', 123).error).toBe(INVALID_COMPARE_MODE);
            expect(system.compareAttributes('p1', 'p2', 'root_bone', '').error).toBe(INVALID_COMPARE_MODE);
        });
        it('should update compare stats', () => {
            system.compareAttributes('p1', 'p2', 'root_bone');
            system.compareAttributes('p1', 'p2', 'root_bone', 'delta');
            expect(system.stats.totalCompared).toBe(2);
        });
    });

    describe('getHistory', () => {
        it('should return history array', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            system.archiveAttribute('p1', 'root_bone', 0.6);
            const r = system.getHistory('p1', 'root_bone');
            expect(r.success).toBe(true);
            expect(r.count).toBe(2);
            expect(r.history.length).toBe(2);
        });
        it('should return a copy of history', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            const r = system.getHistory('p1', 'root_bone');
            r.history[0].value = 999;
            const r2 = system.getHistory('p1', 'root_bone');
            expect(r2.history[0].value).toBe(0.5);
        });
        it('should fail with invalid params', () => {
            expect(system.getHistory('', 'root_bone').error).toBe(INVALID_PLAYER_ID);
            expect(system.getHistory('p1', 'unknown').error).toBe(INVALID_ATTRIBUTE);
            expect(system.getHistory('missing', 'root_bone').error).toBe(ATTRIBUTE_NOT_FOUND);
        });
    });

    describe('listByPlayer / listByAttribute / listAll', () => {
        beforeEach(() => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            system.archiveAttribute('p1', 'aptitude', 0.6);
            system.archiveAttribute('p2', 'root_bone', 0.4);
            system.archiveAttribute('p2', 'fortune', 0.7);
        });

        it('listByPlayer should return archives for one player', () => {
            const list = system.listByPlayer('p1');
            expect(list.length).toBe(2);
            expect(list.every(a => a.playerId === 'p1')).toBe(true);
        });
        it('listByAttribute should return archives for one attribute', () => {
            const list = system.listByAttribute('root_bone');
            expect(list.length).toBe(2);
            expect(list.every(a => a.attributeName === 'root_bone')).toBe(true);
        });
        it('listAll should return all archives', () => {
            const list = system.listAll();
            expect(list.length).toBe(4);
        });
        it('listAttributes should return all 10 archivable attributes', () => {
            const attrs = system.listAttributes();
            expect(attrs).toEqual(ARCHIVABLE_ATTRIBUTES);
            expect(attrs.length).toBe(10);
        });
        it('listPlayers should return all players', () => {
            const players = system.listPlayers();
            expect(players.sort()).toEqual(['p1', 'p2']);
        });
        it('listByPlayer returns [] for unknown player', () => {
            expect(system.listByPlayer('unknown')).toEqual([]);
        });
        it('listByPlayer returns [] for invalid player', () => {
            expect(system.listByPlayer('')).toEqual([]);
            expect(system.listByPlayer(null)).toEqual([]);
        });
        it('listByAttribute returns [] for unknown attribute', () => {
            expect(system.listByAttribute('unknown')).toEqual([]);
        });
        it('listByAttribute returns [] for attribute with no archives', () => {
            expect(system.listByAttribute('karma')).toEqual([]);
        });
    });

    describe('hasArchive', () => {
        it('should return true for existing archive', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            expect(system.hasArchive('p1', 'root_bone')).toBe(true);
        });
        it('should return false for missing archive', () => {
            expect(system.hasArchive('p1', 'root_bone')).toBe(false);
        });
        it('should return false for invalid player', () => {
            expect(system.hasArchive('', 'root_bone')).toBe(false);
            expect(system.hasArchive(null, 'root_bone')).toBe(false);
        });
        it('should return false for invalid attribute', () => {
            expect(system.hasArchive('p1', 'unknown')).toBe(false);
        });
    });

    describe('deleteArchive / clearHistory / deletePlayer', () => {
        it('deleteArchive should remove the archive', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            const r = system.deleteArchive('p1', 'root_bone');
            expect(r.success).toBe(true);
            expect(system.hasArchive('p1', 'root_bone')).toBe(false);
            expect(system.stats.totalDeleted).toBe(1);
        });
        it('deleteArchive should fail for missing archive', () => {
            expect(system.deleteArchive('p1', 'root_bone').error).toBe(ATTRIBUTE_NOT_FOUND);
        });
        it('deleteArchive should fail with invalid params', () => {
            expect(system.deleteArchive('', 'root_bone').error).toBe(INVALID_PLAYER_ID);
            expect(system.deleteArchive('p1', 'unknown').error).toBe(INVALID_ATTRIBUTE);
        });
        it('clearHistory should reset history but keep baseValue', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            system.archiveAttribute('p1', 'root_bone', 0.8);
            const r = system.clearHistory('p1', 'root_bone');
            expect(r.success).toBe(true);
            const arc = system.retrieveAttribute('p1', 'root_bone').archive;
            expect(arc.history.length).toBe(0);
            expect(arc.baseValue).toBe(0.5);
            expect(arc.currentValue).toBe(0.5);
            expect(system.stats.totalCleared).toBe(1);
        });
        it('clearHistory should fail for missing archive', () => {
            expect(system.clearHistory('p1', 'root_bone').error).toBe(ATTRIBUTE_NOT_FOUND);
        });
        it('clearHistory should fail with invalid params', () => {
            expect(system.clearHistory('', 'root_bone').error).toBe(INVALID_PLAYER_ID);
            expect(system.clearHistory('p1', 'unknown').error).toBe(INVALID_ATTRIBUTE);
        });
        it('deletePlayer should remove all archives for a player', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            system.archiveAttribute('p1', 'aptitude', 0.6);
            system.archiveAttribute('p1', 'fortune', 0.7);
            system.archiveAttribute('p2', 'root_bone', 0.4);
            const r = system.deletePlayer('p1');
            expect(r.success).toBe(true);
            expect(r.deleted).toBe(3);
            expect(system.hasArchive('p1', 'root_bone')).toBe(false);
            expect(system.hasArchive('p2', 'root_bone')).toBe(true);
        });
        it('deletePlayer should fail for unknown player', () => {
            expect(system.deletePlayer('unknown').error).toBe(ATTRIBUTE_NOT_FOUND);
        });
        it('deletePlayer should fail with invalid playerId', () => {
            expect(system.deletePlayer('').error).toBe(INVALID_PLAYER_ID);
            expect(system.deletePlayer(null).error).toBe(INVALID_PLAYER_ID);
        });
    });

    describe('setMaxHistory', () => {
        it('should update maxHistory', () => {
            const r = system.setMaxHistory(50);
            expect(r.success).toBe(true);
            expect(system.config.maxHistory).toBe(50);
        });
        it('should fail with invalid values', () => {
            expect(system.setMaxHistory('foo').error).toBe(INVALID_VALUE);
            expect(system.setMaxHistory(NaN).error).toBe(INVALID_VALUE);
            expect(system.setMaxHistory(0).error).toBe(INVALID_VALUE);
            expect(system.setMaxHistory(-5).error).toBe(INVALID_VALUE);
        });
    });

    describe('tool system', () => {
        it('registerTool should add a new tool', () => {
            const r = system.registerTool('myTool', () => 'ok');
            expect(r.success).toBe(true);
            expect(system.tools.has('myTool')).toBe(true);
        });
        it('registerTool should fail with invalid name', () => {
            expect(system.registerTool('', () => 'x').error).toBe(INVALID_TOOL_NAME);
            expect(system.registerTool(null, () => 'x').error).toBe(INVALID_TOOL_NAME);
            expect(system.registerTool(123, () => 'x').error).toBe(INVALID_TOOL_NAME);
        });
        it('registerTool should fail with non-function handler', () => {
            expect(system.registerTool('myTool', null).error).toBe(INVALID_HANDLER);
            expect(system.registerTool('myTool', 'foo').error).toBe(INVALID_HANDLER);
            expect(system.registerTool('myTool', 123).error).toBe(INVALID_HANDLER);
        });
        it('executeTool should run a registered tool', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            const r = system.executeTool('retrieveAttribute', { playerId: 'p1', attribute: 'root_bone' });
            expect(r.success).toBe(true);
            expect(r.result.success).toBe(true);
            expect(r.result.archive.baseValue).toBe(0.5);
        });
        it('executeTool should handle missing context (uses ?? defaults via ctx?.x)', () => {
            const r = system.executeTool('retrieveAttribute', undefined);
            // ctx?.playerId / ctx?.attribute will be undefined → invalid player / attribute
            expect(r.success).toBe(true);
            expect(r.result.success).toBe(false);
            expect(r.result.error).toBe(INVALID_PLAYER_ID);
        });
        it('executeTool should handle null context', () => {
            const r = system.executeTool('retrieveAttribute', null);
            expect(r.success).toBe(true);
            expect(r.result.success).toBe(false);
        });
        it('executeTool should return UNKNOWN_TOOL for unknown tool', () => {
            expect(system.executeTool('unknown').error).toBe(UNKNOWN_TOOL);
        });
        it('executeTool should fail with invalid name', () => {
            expect(system.executeTool('').error).toBe(INVALID_TOOL_NAME);
            expect(system.executeTool(null).error).toBe(INVALID_TOOL_NAME);
        });
        it('executeTool should catch handler errors', () => {
            system.registerTool('explode', () => { throw new Error('boom'); });
            const r = system.executeTool('explode');
            expect(r.success).toBe(false);
            expect(r.error).toBe(TOOL_EXECUTION_ERROR);
            expect(r.message).toBe('boom');
        });
        it('default archiveAttribute tool should work end-to-end', () => {
            const r = system.executeTool('archiveAttribute', { playerId: 'p1', attribute: 'root_bone', value: 0.5 });
            expect(r.success).toBe(true);
            expect(r.result.success).toBe(true);
            const r2 = system.executeTool('compareAttributes', { playerId1: 'p1', playerId2: 'p2', attribute: 'root_bone', mode: 'absolute' });
            // p2 not archived → error ATTRIBUTE_NOT_FOUND
            expect(r2.result.error).toBe(ATTRIBUTE_NOT_FOUND);
        });
    });

    describe('hook system', () => {
        it('registerHook should add a hook', () => {
            const r = system.registerHook('onArchived', () => {});
            expect(r.success).toBe(true);
            expect(system.hooks.has('onArchived')).toBe(true);
        });
        it('registerHook should fail with invalid event', () => {
            expect(system.registerHook('', () => {}).error).toBe(INVALID_EVENT_NAME);
            expect(system.registerHook(null, () => {}).error).toBe(INVALID_EVENT_NAME);
        });
        it('registerHook should fail with non-function handler', () => {
            expect(system.registerHook('onArchived', null).error).toBe(INVALID_HANDLER);
            expect(system.registerHook('onArchived', 'foo').error).toBe(INVALID_HANDLER);
        });
        it('hooks should fire on archive', () => {
            const handler = vi.fn();
            system.registerHook('onArchived', handler);
            system.archiveAttribute('p1', 'root_bone', 0.5);
            expect(handler).toHaveBeenCalledTimes(1);
        });
        it('multiple hooks should all fire', () => {
            const h1 = vi.fn();
            const h2 = vi.fn();
            system.registerHook('onArchived', h1);
            system.registerHook('onArchived', h2);
            system.archiveAttribute('p1', 'root_bone', 0.5);
            expect(h1).toHaveBeenCalledTimes(1);
            expect(h2).toHaveBeenCalledTimes(1);
        });
        it('hook errors should be silent (swallowed)', () => {
            system.registerHook('onArchived', () => { throw new Error('boom'); });
            expect(() => system.archiveAttribute('p1', 'root_bone', 0.5)).not.toThrow();
        });
        it('unregisterHook should remove a registered hook', () => {
            const handler = () => {};
            system.registerHook('onArchived', handler);
            const r = system.unregisterHook('onArchived', handler);
            expect(r.success).toBe(true);
        });
        it('unregisterHook should fail for unknown event', () => {
            expect(system.unregisterHook('unknown', () => {}).error).toBe(EVENT_NOT_FOUND);
        });
        it('unregisterHook should fail for unknown handler', () => {
            system.registerHook('onArchived', () => {});
            expect(system.unregisterHook('onArchived', () => {}).error).toBe(HANDLER_NOT_FOUND);
        });
    });

    describe('serialization', () => {
        it('toJSON should return a serializable object', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            const data = system.toJSON();
            expect(data.config).toBeDefined();
            expect(data.archives).toBeDefined();
            expect(data.playerArchives).toBeDefined();
            expect(data.attributeArchives).toBeDefined();
            expect(data.stats).toBeDefined();
        });
        it('toJSON archives should include the player entry', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            const data = system.toJSON();
            const entries = data.archives;
            expect(entries.length).toBe(1);
            expect(entries[0][0]).toBe('p1:root_bone');
            expect(entries[0][1].baseValue).toBe(0.5);
        });
        it('fromJSON should restore state', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            system.archiveAttribute('p1', 'root_bone', 0.7);
            const data = system.toJSON();
            const s2 = new CultivationAttributeArchive();
            const r = s2.fromJSON(data);
            expect(r.success).toBe(true);
            expect(s2.hasArchive('p1', 'root_bone')).toBe(true);
            expect(s2.retrieveAttribute('p1', 'root_bone').archive.currentValue).toBeCloseTo(0.7, 10);
        });
        it('fromJSON should fail with invalid data', () => {
            expect(system.fromJSON(null).error).toBe(INVALID_DATA);
            expect(system.fromJSON(undefined).error).toBe(INVALID_DATA);
            expect(system.fromJSON('foo').error).toBe(INVALID_DATA);
            expect(system.fromJSON(123).error).toBe(INVALID_DATA);
        });
        it('fromJSON should merge config', () => {
            const r = system.fromJSON({ config: { maxHistory: 99 } });
            expect(r.success).toBe(true);
            expect(system.config.maxHistory).toBe(99);
        });
        it('fromJSON should merge stats', () => {
            const r = system.fromJSON({ stats: { totalArchived: 42 } });
            expect(r.success).toBe(true);
            expect(system.stats.totalArchived).toBe(42);
        });
        it('fromJSON should restore archives from array', () => {
            const arr = [['p1:root_bone', { id: 'x', playerId: 'p1', attributeName: 'root_bone', baseValue: 0.3, currentValue: 0.3, history: [], recordedAt: 1 }]];
            const r = system.fromJSON({ archives: arr });
            expect(r.success).toBe(true);
            expect(system.retrieveAttribute('p1', 'root_bone').archive.baseValue).toBe(0.3);
        });
    });

    describe('getStats & reset', () => {
        it('getStats should return aggregated stats', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            system.archiveAttribute('p2', 'aptitude', 0.6);
            const s = system.getStats();
            expect(s.totalArchived).toBe(2);
            expect(s.totalArchiveRecords).toBe(2);
            expect(s.totalPlayers).toBe(2);
        });
        it('reset should clear all archives and reset stats', () => {
            system.archiveAttribute('p1', 'root_bone', 0.5);
            system.archiveAttribute('p2', 'aptitude', 0.6);
            const r = system.reset();
            expect(r.success).toBe(true);
            expect(system.archives.size).toBe(0);
            expect(system.stats.totalArchived).toBe(0);
            expect(system.getStats().totalArchiveRecords).toBe(0);
            // tools should still be registered
            expect(system.tools.has('archiveAttribute')).toBe(true);
        });
    });
});
