/**
 * ExperienceTracker 单元测试
 * V277 Iteration 1/9 - NPC Self-Evolution Engine Core
 * 
 * 测试策略: 验证经验追踪器的各项功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ExperienceTracker } from '../../../systems/ai/ExperienceTracker.js';

describe('ExperienceTracker', () => {
    let tracker;

    beforeEach(() => {
        tracker = new ExperienceTracker(100);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('应该使用默认maxRecords=100创建实例', () => {
            const defaultTracker = new ExperienceTracker();
            expect(defaultTracker.maxRecords).toBe(100);
        });

        it('应该使用指定的maxRecords创建实例', () => {
            const customTracker = new ExperienceTracker(50);
            expect(customTracker.maxRecords).toBe(50);
        });

        it('应该初始化空的records Map', () => {
            expect(tracker.records).toBeInstanceOf(Map);
            expect(tracker.records.size).toBe(0);
        });
    });

    describe('track', () => {
        it('应该记录单次交互', () => {
            const npcId = 'npc_001';
            const interaction = {
                type: 'trade',
                playerAction: 'buy sword',
                npcResponse: 'Here is your sword',
                outcome: { success: true, satisfaction: 0.8 }
            };

            const result = tracker.track(npcId, interaction);

            expect(result.success).toBe(true);
            expect(result.record).toBeDefined();
            expect(result.record.npcId).toBe(npcId);
            expect(result.record.type).toBe('trade');
            expect(result.record.playerAction).toBe('buy sword');
            expect(result.record.npcResponse).toBe('Here is your sword');
            expect(result.record.outcome.success).toBe(true);
            expect(result.record.outcome.satisfaction).toBe(0.8);
        });

        it('应该使用默认的outcome值处理不完整的interaction', () => {
            const npcId = 'npc_002';
            const interaction = {
                type: 'chat',
                playerAction: 'hello'
            };

            const result = tracker.track(npcId, interaction);

            expect(result.success).toBe(true);
            expect(result.record.outcome.success).toBe(false);
            expect(result.record.outcome.satisfaction).toBe(0.5);
        });

        it('应该处理空的playerAction和npcResponse', () => {
            const npcId = 'npc_003';
            const interaction = {
                type: 'social'
            };

            const result = tracker.track(npcId, interaction);

            expect(result.success).toBe(true);
            expect(result.record.playerAction).toBe('');
            expect(result.record.npcResponse).toBe('');
        });

        it('应该为不同的NPC创建独立的记录', () => {
            const npc1 = 'npc_001';
            const npc2 = 'npc_002';
            
            tracker.track(npc1, { type: 'trade', outcome: { success: true } });
            tracker.track(npc2, { type: 'chat', outcome: { success: false } });

            const records1 = tracker.getRecords(npc1);
            const records2 = tracker.getRecords(npc2);

            expect(records1.length).toBe(1);
            expect(records2.length).toBe(1);
            expect(records1[0].type).toBe('trade');
            expect(records2[0].type).toBe('chat');
        });

        it('应该自动裁剪超过maxRecords的记录', () => {
            const npcId = 'npc_prune';
            const smallTracker = new ExperienceTracker(5);

            for (let i = 0; i < 10; i++) {
                smallTracker.track(npcId, { type: 'trade', outcome: { success: true } });
            }

            const records = smallTracker.getRecords(npcId);
            expect(records.length).toBe(5);
        });

        it('应该生成唯一的record id', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade' });
            tracker.track(npcId, { type: 'chat' });

            const records = tracker.getRecords(npcId);
            expect(records[0].id).not.toBe(records[1].id);
        });

        it('应该记录timestamp', () => {
            const npcId = 'npc_001';
            const beforeTrack = Date.now();
            const result = tracker.track(npcId, { type: 'trade' });
            const afterTrack = Date.now();

            expect(result.record.timestamp).toBeGreaterThanOrEqual(beforeTrack);
            expect(result.record.timestamp).toBeLessThanOrEqual(afterTrack);
        });
    });

    describe('getStats', () => {
        it('应该返回正确统计信息 - 空记录', () => {
            const stats = tracker.getStats('npc_empty');

            expect(stats.totalInteractions).toBe(0);
            expect(stats.successRate).toBe(0);
            expect(stats.avgSatisfaction).toBe(0);
            expect(stats.adaptationLevel).toBe(0);
            expect(stats.lastInteraction).toBeNull();
        });

        it('应该返回正确统计信息 - 单条记录', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, {
                type: 'trade',
                outcome: { success: true, satisfaction: 0.9 }
            });

            const stats = tracker.getStats(npcId);

            expect(stats.totalInteractions).toBe(1);
            expect(stats.successRate).toBe(1);
            expect(stats.avgSatisfaction).toBe(0.9);
            expect(stats.adaptationLevel).toBeGreaterThan(0);
            expect(stats.lastInteraction).not.toBeNull();
        });

        it('应该计算正确的成功率', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade', outcome: { success: true, satisfaction: 0.8 } });
            tracker.track(npcId, { type: 'trade', outcome: { success: true, satisfaction: 0.6 } });
            tracker.track(npcId, { type: 'chat', outcome: { success: false, satisfaction: 0.3 } });
            tracker.track(npcId, { type: 'trade', outcome: { success: false, satisfaction: 0.4 } });

            const stats = tracker.getStats(npcId);

            expect(stats.totalInteractions).toBe(4);
            expect(stats.successRate).toBe(0.5);
        });

        it('应该计算正确的平均满意度', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade', outcome: { success: true, satisfaction: 0.8 } });
            tracker.track(npcId, { type: 'chat', outcome: { success: true, satisfaction: 0.6 } });
            tracker.track(npcId, { type: 'combat', outcome: { success: false, satisfaction: 0.2 } });

            const stats = tracker.getStats(npcId);

            expect(stats.avgSatisfaction).toBe(0.53); // (0.8 + 0.6 + 0.2) / 3 = 0.533...
        });

        it('应该正确计算adaptationLevel', () => {
            const npcId = 'npc_001';
            
            // 10次成功交互应该得到较高的adaptationLevel
            for (let i = 0; i < 10; i++) {
                tracker.track(npcId, { type: 'trade', outcome: { success: true, satisfaction: 0.9 } });
            }

            const stats = tracker.getStats(npcId);

            expect(stats.adaptationLevel).toBeGreaterThan(1);
            expect(stats.adaptationLevel).toBeLessThanOrEqual(10);
        });

        it('应该返回最后一条交互记录', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade' });
            tracker.track(npcId, { type: 'chat' });
            tracker.track(npcId, { type: 'combat' });

            const stats = tracker.getStats(npcId);

            expect(stats.lastInteraction.type).toBe('combat');
        });
    });

    describe('prune', () => {
        it('应该保留最近maxRecords条记录', () => {
            const npcId = 'npc_001';
            const smallTracker = new ExperienceTracker(3);

            smallTracker.track(npcId, { type: 'trade', outcome: { success: true } });
            smallTracker.track(npcId, { type: 'chat', outcome: { success: true } });
            smallTracker.track(npcId, { type: 'combat', outcome: { success: true } });
            // After 3 records, adding more triggers auto-prune via track()
            smallTracker.track(npcId, { type: 'social', outcome: { success: true } });
            smallTracker.track(npcId, { type: 'task', outcome: { success: true } });

            // track() auto-prunes when exceeding maxRecords, so now we have 3 records
            // Manual prune should report 0 since track already pruned
            const result = smallTracker.prune(npcId);

            expect(result.success).toBe(true);
            expect(result.pruned).toBe(0); // track() already pruned, no additional prune needed
            expect(smallTracker.getRecords(npcId).length).toBe(3);
        });

        it('如果记录数小于maxRecords则不裁剪', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade' });
            tracker.track(npcId, { type: 'chat' });

            const result = tracker.prune(npcId);

            expect(result.success).toBe(true);
            expect(result.pruned).toBe(0);
            expect(tracker.getRecords(npcId).length).toBe(2);
        });

        it('应该支持自定义maxRecords参数', () => {
            const npcId = 'npc_001';
            const smallTracker = new ExperienceTracker(100);

            for (let i = 0; i < 15; i++) {
                smallTracker.track(npcId, { type: 'trade' });
            }

            smallTracker.prune(npcId, 5);

            expect(smallTracker.getRecords(npcId).length).toBe(5);
        });

        it('应该处理不存在的NPC', () => {
            const result = tracker.prune('npc_nonexistent');

            expect(result.success).toBe(true);
            expect(result.pruned).toBe(0);
        });
    });

    describe('clear', () => {
        it('应该清空指定NPC的记录', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade' });
            tracker.track(npcId, { type: 'chat' });

            const result = tracker.clear(npcId);

            expect(result.success).toBe(true);
            expect(tracker.getRecords(npcId).length).toBe(0);
        });

        it('应该处理不存在的NPC', () => {
            const result = tracker.clear('npc_nonexistent');

            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not found');
        });
    });

    describe('getAllNpcIds', () => {
        it('应该返回所有有记录的NPC ID', () => {
            tracker.track('npc_001', { type: 'trade' });
            tracker.track('npc_002', { type: 'chat' });
            tracker.track('npc_003', { type: 'combat' });

            const npcIds = tracker.getAllNpcIds();

            expect(npcIds.length).toBe(3);
            expect(npcIds).toContain('npc_001');
            expect(npcIds).toContain('npc_002');
            expect(npcIds).toContain('npc_003');
        });

        it('应该在没有记录时返回空数组', () => {
            const npcIds = tracker.getAllNpcIds();
            expect(npcIds).toEqual([]);
        });
    });

    describe('getRecords', () => {
        it('应该返回NPC的所有记录', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade' });
            tracker.track(npcId, { type: 'chat' });

            const records = tracker.getRecords(npcId);

            expect(records.length).toBe(2);
        });

        it('应该返回不存在的NPC的空数组', () => {
            const records = tracker.getRecords('npc_nonexistent');
            expect(records).toEqual([]);
        });
    });

    describe('getRecentRecords', () => {
        it('应该返回最近的N条记录', () => {
            const npcId = 'npc_001';
            for (let i = 0; i < 10; i++) {
                tracker.track(npcId, { type: 'trade' });
            }

            const recentRecords = tracker.getRecentRecords(npcId, 3);

            expect(recentRecords.length).toBe(3);
        });

        it('如果记录数少于N应该返回所有记录', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { type: 'trade' });
            tracker.track(npcId, { type: 'chat' });

            const recentRecords = tracker.getRecentRecords(npcId, 10);

            expect(recentRecords.length).toBe(2);
        });

        it('应该支持默认N=10', () => {
            const npcId = 'npc_001';
            for (let i = 0; i < 15; i++) {
                tracker.track(npcId, { type: 'trade' });
            }

            const recentRecords = tracker.getRecentRecords(npcId);

            expect(recentRecords.length).toBe(10);
        });
    });

    describe('getAdaptationScore', () => {
        it('应该返回0当没有记录时', () => {
            const score = tracker.getAdaptationScore('npc_empty');
            expect(score).toBe(0);
        });

        it('应该计算正确的适应度分数', () => {
            const npcId = 'npc_001';
            tracker.track(npcId, { outcome: { success: true, satisfaction: 1.0 } });
            tracker.track(npcId, { outcome: { success: true, satisfaction: 1.0 } });
            tracker.track(npcId, { outcome: { success: true, satisfaction: 1.0 } });

            const score = tracker.getAdaptationScore(npcId);

            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(1);
        });

        it('适应度分数应该在0-1之间', () => {
            const npcId = 'npc_001';
            
            for (let i = 0; i < 50; i++) {
                tracker.track(npcId, { 
                    outcome: { success: Math.random() > 0.5, satisfaction: Math.random() }
                });
            }

            const score = tracker.getAdaptationScore(npcId);

            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(1);
        });
    });
});