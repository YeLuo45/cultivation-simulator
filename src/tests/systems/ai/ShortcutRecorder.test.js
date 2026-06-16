/**
 * ShortcutRecorder 单元测试
 * V280 Iteration 4/9 - IER Experience Refinement Engine
 * 
 * 测试策略: 验证交互捷径记录器的各项功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ShortcutRecorder } from '../../../systems/ai/ShortcutRecorder.js';

describe('ShortcutRecorder', () => {
    let shortcutRecorder;

    beforeEach(() => {
        shortcutRecorder = new ShortcutRecorder();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('应该初始化shortcuts Map为空', () => {
            expect(shortcutRecorder.shortcuts).toBeInstanceOf(Map);
            expect(shortcutRecorder.shortcuts.size).toBe(0);
        });
    });

    describe('record', () => {
        it('应该记录新的交互捷径', () => {
            const result = shortcutRecorder.record('npc_001', 'buy sword', 'Here is your sword', 1);

            expect(result.success).toBe(true);
            expect(result.isUpdate).toBe(false);
            expect(result.shortcut).toBeDefined();
            expect(result.shortcut.npcId).toBe('npc_001');
            expect(result.shortcut.playerAction).toBe('buy sword');
            expect(result.shortcut.npcResponse).toBe('Here is your sword');
            expect(result.shortcut.successCount).toBe(1);
        });

        it('应该更新已存在的捷径的成功次数', () => {
            shortcutRecorder.record('npc_001', 'buy sword', 'Here is your sword', 1);
            const result = shortcutRecorder.record('npc_001', 'buy sword', 'Here is your sword', 5);

            expect(result.success).toBe(true);
            expect(result.isUpdate).toBe(true);
            // incrementSuccess adds 1 each time, so 1 + 1 = 2
            expect(result.shortcut.successCount).toBe(2);
        });

        it('应该对不同NPC创建独立的捷径', () => {
            shortcutRecorder.record('npc_001', 'buy sword', 'Here is your sword', 1);
            shortcutRecorder.record('npc_002', 'buy potion', 'Here is your potion', 1);

            const shortcuts1 = shortcutRecorder.getShortcuts('npc_001');
            const shortcuts2 = shortcutRecorder.getShortcuts('npc_002');

            expect(shortcuts1.length).toBe(1);
            expect(shortcuts2.length).toBe(1);
            expect(shortcuts1[0].playerAction).toBe('buy sword');
            expect(shortcuts2[0].playerAction).toBe('buy potion');
        });

        it('应该使用默认successCount=1', () => {
            const result = shortcutRecorder.record('npc_001', 'buy item', 'Done');

            expect(result.shortcut.successCount).toBe(1);
        });
    });

    describe('getShortcuts', () => {
        it('应该返回NPC的所有捷径', () => {
            shortcutRecorder.record('npc_001', 'buy sword', 'Here is your sword', 1);
            shortcutRecorder.record('npc_001', 'buy potion', 'Here is your potion', 2);
            shortcutRecorder.record('npc_001', 'buy armor', 'Here is your armor', 3);

            const shortcuts = shortcutRecorder.getShortcuts('npc_001');

            expect(shortcuts.length).toBe(3);
        });

        it('应该按优先级和成功次数排序', () => {
            shortcutRecorder.record('npc_001', 'low item', 'Low response', 1);
            shortcutRecorder.record('npc_001', 'high item', 'High response', 10);
            shortcutRecorder.record('npc_001', 'medium item', 'Medium response', 5);

            const shortcuts = shortcutRecorder.getShortcuts('npc_001');

            expect(shortcuts[0].playerAction).toBe('high item');
            expect(shortcuts[1].playerAction).toBe('medium item');
            expect(shortcuts[2].playerAction).toBe('low item');
        });

        it('应该对不存在的NPC返回空数组', () => {
            const shortcuts = shortcutRecorder.getShortcuts('npc_unknown');
            expect(shortcuts).toEqual([]);
        });
    });

    describe('findShortcut', () => {
        it('应该精确匹配玩家动作', () => {
            shortcutRecorder.record('npc_001', 'buy sword', 'Here is your sword', 5);

            const found = shortcutRecorder.findShortcut('npc_001', 'buy sword');

            expect(found).not.toBeNull();
            expect(found.playerAction).toBe('buy sword');
        });

        it('应该返回null当没有匹配时', () => {
            shortcutRecorder.record('npc_001', 'buy sword', 'Here is your sword', 5);

            const found = shortcutRecorder.findShortcut('npc_001', 'buy nonexistent');

            expect(found).toBeNull();
        });

        it('应该支持部分匹配', () => {
            shortcutRecorder.record('npc_001', 'buy expensive sword', 'Here is your sword', 5);

            const found = shortcutRecorder.findShortcut('npc_001', 'buy expensive');

            expect(found).not.toBeNull();
            expect(found.playerAction).toBe('buy expensive sword');
        });

        it('应该更新useCount和lastUsed', () => {
            shortcutRecorder.record('npc_001', 'buy sword', 'Here is your sword', 5);
            const found = shortcutRecorder.findShortcut('npc_001', 'buy sword');

            expect(found.useCount).toBe(1);
            expect(found.lastUsed).not.toBeNull();
        });
    });

    describe('boost', () => {
        it('应该提升低优先级捷径到中优先级', () => {
            const result = shortcutRecorder.record('npc_001', 'buy sword', 'Here is your sword', 1);
            const shortcutId = result.shortcut.id;
            
            const boostResult = shortcutRecorder.boost(shortcutId);

            expect(boostResult.success).toBe(true);
            expect(boostResult.shortcut.priority).toBe('medium');
        });

        it('应该提升中优先级捷径到高优先级', () => {
            const result = shortcutRecorder.record('npc_001', 'buy sword', 'Here is your sword', 5);
            const shortcutId = result.shortcut.id;
            
            const boostResult = shortcutRecorder.boost(shortcutId);

            expect(boostResult.success).toBe(true);
            expect(boostResult.shortcut.priority).toBe('high');
        });

        it('应该对不存在的捷径返回错误', () => {
            const result = shortcutRecorder.boost('shortcut_unknown');

            expect(result.success).toBe(false);
            expect(result.reason).toBe('Shortcut not found');
        });
    });

    describe('removeShortcut', () => {
        it('应该删除指定捷径', () => {
            const result = shortcutRecorder.record('npc_001', 'buy sword', 'Here is your sword', 1);
            const shortcutId = result.shortcut.id;

            const removeResult = shortcutRecorder.removeShortcut('npc_001', shortcutId);

            expect(removeResult.success).toBe(true);
            expect(shortcutRecorder.getShortcuts('npc_001').length).toBe(0);
        });

        it('应该对不存在的捷径返回错误', () => {
            const result = shortcutRecorder.removeShortcut('npc_001', 'shortcut_unknown');

            expect(result.success).toBe(false);
            expect(result.reason).toBe('Shortcut not found');
        });
    });

    describe('clear', () => {
        it('应该清除NPC的所有捷径', () => {
            shortcutRecorder.record('npc_001', 'buy sword', 'Here is your sword', 1);
            shortcutRecorder.record('npc_001', 'buy potion', 'Here is your potion', 1);

            const result = shortcutRecorder.clear('npc_001');

            expect(result.success).toBe(true);
            expect(shortcutRecorder.getShortcuts('npc_001')).toEqual([]);
        });

        it('应该对不存在的NPC返回错误', () => {
            const result = shortcutRecorder.clear('npc_unknown');

            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not found');
        });
    });

    describe('getStats', () => {
        it('应该返回正确的统计数据', () => {
            shortcutRecorder.record('npc_001', 'buy sword', 'Here is your sword', 10);
            shortcutRecorder.record('npc_001', 'buy potion', 'Here is your potion', 5);
            shortcutRecorder.record('npc_001', 'buy armor', 'Here is your armor', 1);

            const stats = shortcutRecorder.getStats('npc_001');

            expect(stats.totalShortcuts).toBe(3);
            expect(stats.highPriority).toBe(1);
            expect(stats.mediumPriority).toBe(1);
            expect(stats.lowPriority).toBe(1);
            expect(stats.avgSuccessCount).toBeCloseTo(16 / 3, 2);
        });

        it('应该对没有捷径的NPC返回空统计', () => {
            const stats = shortcutRecorder.getStats('npc_unknown');

            expect(stats.totalShortcuts).toBe(0);
            expect(stats.avgSuccessCount).toBe(0);
            expect(stats.mostUsed).toBeNull();
        });
    });

    describe('getAllNpcIds', () => {
        it('应该返回所有有捷径的NPC ID', () => {
            shortcutRecorder.record('npc_001', 'buy sword', 'Sword response', 1);
            shortcutRecorder.record('npc_002', 'buy potion', 'Potion response', 1);
            shortcutRecorder.record('npc_003', 'buy armor', 'Armor response', 1);

            const npcIds = shortcutRecorder.getAllNpcIds();

            expect(npcIds.length).toBe(3);
            expect(npcIds).toContain('npc_001');
            expect(npcIds).toContain('npc_002');
            expect(npcIds).toContain('npc_003');
        });

        it('应该对没有捷径的情况返回空数组', () => {
            const npcIds = shortcutRecorder.getAllNpcIds();
            expect(npcIds).toEqual([]);
        });
    });

    describe('getHighPriorityShortcuts', () => {
        it('应该只返回高优先级捷径', () => {
            shortcutRecorder.record('npc_001', 'high item', 'High response', 10);
            shortcutRecorder.record('npc_001', 'medium item', 'Medium response', 5);
            shortcutRecorder.record('npc_001', 'low item', 'Low response', 1);

            const highPriority = shortcutRecorder.getHighPriorityShortcuts('npc_001');

            expect(highPriority.length).toBe(1);
            expect(highPriority[0].playerAction).toBe('high item');
        });

        it('应该对没有高优先级捷径的NPC返回空数组', () => {
            shortcutRecorder.record('npc_001', 'low item', 'Low response', 1);

            const highPriority = shortcutRecorder.getHighPriorityShortcuts('npc_001');

            expect(highPriority).toEqual([]);
        });
    });

    describe('优先级计算', () => {
        it('成功次数>=10应该为高优先级', () => {
            const result = shortcutRecorder.record('npc_001', 'item', 'response', 10);

            expect(result.shortcut.priority).toBe('high');
        });

        it('成功次数5-9应该为中优先级', () => {
            const result = shortcutRecorder.record('npc_001', 'item', 'response', 5);

            expect(result.shortcut.priority).toBe('medium');
        });

        it('成功次数<5应该为低优先级', () => {
            const result = shortcutRecorder.record('npc_001', 'item', 'response', 4);

            expect(result.shortcut.priority).toBe('low');
        });

        it('incrementSuccess应该更新优先级', () => {
            const result = shortcutRecorder.record('npc_001', 'item', 'response', 1);
            expect(result.shortcut.priority).toBe('low');

            // incrementSuccess adds 1, so 1 + 1 = 2 (still low, needs 5 for medium)
            shortcutRecorder.record('npc_001', 'item', 'response', 3);
            const updated = shortcutRecorder.getShortcuts('npc_001')[0];
            // 1 initial + 1 increment = 2, still low priority
            expect(updated.priority).toBe('low');
            expect(updated.successCount).toBe(2);
        });
    });
});