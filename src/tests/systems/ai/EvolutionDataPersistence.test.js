/**
 * EvolutionDataPersistence 单元测试
 * V293 Iteration 8/9 - NPC Evolution Data Persistence
 * 
 * 测试策略: 验证数据持久化的各项功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EvolutionDataPersistence } from '../../../systems/ai/EvolutionDataPersistence.js';
import { ExperienceTracker } from '../../../systems/ai/ExperienceTracker.js';
import { SkillCrystallization } from '../../../systems/ai/SkillCrystallization.js';

describe('EvolutionDataPersistence', () => {
    let persistence;
    let experienceTracker;
    let skillCrystallization;

    beforeEach(() => {
        experienceTracker = new ExperienceTracker(100);
        skillCrystallization = new SkillCrystallization();
        persistence = new EvolutionDataPersistence(experienceTracker, skillCrystallization);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('应该使用提供的experienceTracker创建实例', () => {
            expect(persistence.experienceTracker).toBe(experienceTracker);
        });

        it('应该使用提供的skillCrystallization创建实例', () => {
            expect(persistence.skillCrystallization).toBe(skillCrystallization);
        });

        it('应该初始化空的storage Map', () => {
            expect(persistence.storage).toBeInstanceOf(Map);
            expect(persistence.storage.size).toBe(0);
        });
    });

    describe('save', () => {
        it('应该保存NPC进化数据', async () => {
            const npcId = 'npc_001';
            
            // 添加一些测试数据
            experienceTracker.track(npcId, {
                type: 'trade',
                playerAction: 'buy sword',
                npcResponse: 'Here is your sword',
                outcome: { success: true, satisfaction: 0.9 }
            });
            
            skillCrystallization.crystallize(npcId, {
                type: 'trade',
                playerAction: 'buy sword',
                npcResponse: 'Here is your sword'
            });

            const result = await persistence.save(npcId);

            expect(result.success).toBe(true);
            expect(result.npcId).toBe(npcId);
        });

        it('应该保存空的NPC数据', async () => {
            const npcId = 'npc_empty';
            const result = await persistence.save(npcId);

            expect(result.success).toBe(true);
            expect(result.npcId).toBe(npcId);
        });

        it('应该覆盖已存在的NPC数据', async () => {
            const npcId = 'npc_002';
            
            experienceTracker.track(npcId, {
                type: 'chat',
                playerAction: 'hello',
                outcome: { success: true, satisfaction: 0.5 }
            });

            await persistence.save(npcId);
            
            // 再次保存应该覆盖
            const result = await persistence.save(npcId);
            expect(result.success).toBe(true);
            expect(persistence.storage.get(npcId)).toBeDefined();
        });

        it('保存的数据应包含npcId、experience、skills和stats', async () => {
            const npcId = 'npc_003';
            experienceTracker.track(npcId, {
                type: 'trade',
                playerAction: 'buy',
                outcome: { success: true, satisfaction: 0.8 }
            });

            await persistence.save(npcId);
            const stored = persistence.storage.get(npcId);

            expect(stored.npcId).toBe(npcId);
            expect(stored.experience).toBeDefined();
            expect(stored.skills).toBeDefined();
            expect(stored.stats).toBeDefined();
            expect(stored.timestamp).toBeDefined();
        });
    });

    describe('load', () => {
        it('应该加载已保存的NPC数据', async () => {
            const npcId = 'npc_load_001';
            
            experienceTracker.track(npcId, {
                type: 'trade',
                playerAction: 'buy sword',
                outcome: { success: true, satisfaction: 0.9 }
            });

            await persistence.save(npcId);
            const loaded = await persistence.load(npcId);

            expect(loaded).toBeDefined();
            expect(loaded.npcId).toBe(npcId);
            expect(loaded.experience).toBeDefined();
            expect(loaded.stats.totalInteractions).toBe(1);
        });

        it('应该返回null对于不存在的NPC', async () => {
            const loaded = await persistence.load('non_existent_npc');
            expect(loaded).toBeNull();
        });

        it('应该加载空的NPC数据', async () => {
            const npcId = 'npc_load_empty';
            await persistence.save(npcId);
            const loaded = await persistence.load(npcId);

            expect(loaded).toBeDefined();
            expect(loaded.npcId).toBe(npcId);
            expect(loaded.experience).toEqual([]);
            expect(loaded.skills).toEqual([]);
        });
    });

    describe('saveAll', () => {
        it('应该批量保存所有NPC', async () => {
            experienceTracker.track('npc_all_1', { type: 'trade', playerAction: 'a', outcome: { success: true, satisfaction: 0.8 } });
            experienceTracker.track('npc_all_2', { type: 'chat', playerAction: 'b', outcome: { success: true, satisfaction: 0.6 } });
            experienceTracker.track('npc_all_3', { type: 'social', playerAction: 'c', outcome: { success: false, satisfaction: 0.3 } });

            const result = await persistence.saveAll();

            expect(result.saved).toBe(3);
            expect(persistence.storage.size).toBe(3);
        });

        it('应该在没有NPC时返回saved=0', async () => {
            const result = await persistence.saveAll();

            expect(result.saved).toBe(0);
        });

        it('应该包含所有关键数据字段', async () => {
            const npcId = 'npc_all_check';
            experienceTracker.track(npcId, { type: 'trade', playerAction: 'test', outcome: { success: true, satisfaction: 0.7 } });
            skillCrystallization.crystallize(npcId, { type: 'trade', playerAction: 'test', npcResponse: 'ok' });

            await persistence.saveAll();
            const stored = persistence.storage.get(npcId);

            expect(stored).toHaveProperty('npcId');
            expect(stored).toHaveProperty('experience');
            expect(stored).toHaveProperty('skills');
            expect(stored).toHaveProperty('stats');
            expect(stored).toHaveProperty('timestamp');
        });
    });

    describe('exportToJSON', () => {
        it('应该导出NPC数据为JSON字符串', async () => {
            const npcId = 'npc_export_001';
            experienceTracker.track(npcId, { type: 'trade', playerAction: 'buy', outcome: { success: true, satisfaction: 0.8 } });

            await persistence.save(npcId);
            const json = persistence.exportToJSON(npcId);

            expect(typeof json).toBe('string');
            const parsed = JSON.parse(json);
            expect(parsed.npcId).toBe(npcId);
        });

        it('应该返回错误JSON对于不存在的NPC', () => {
            const json = persistence.exportToJSON('non_existent');
            const parsed = JSON.parse(json);

            expect(parsed.error).toBe('NPC not found');
        });

        it('导出的JSON应该可以被解析', async () => {
            const npcId = 'npc_export_parse';
            experienceTracker.track(npcId, { type: 'chat', playerAction: 'hi', outcome: { success: true, satisfaction: 0.9 } });

            await persistence.save(npcId);
            const json = persistence.exportToJSON(npcId);
            const parsed = JSON.parse(json);

            expect(parsed).toHaveProperty('npcId');
            expect(parsed).toHaveProperty('experience');
            expect(parsed).toHaveProperty('stats');
        });
    });

    describe('importFromJSON', () => {
        it('应该从JSON导入数据', () => {
            const jsonData = JSON.stringify({
                npcId: 'npc_import_001',
                experience: [{ type: 'trade', playerAction: 'buy', npcResponse: 'ok', outcome: { success: true, satisfaction: 0.8 } }],
                skills: [],
                stats: { totalInteractions: 1 },
                timestamp: Date.now()
            });

            const result = persistence.importFromJSON(jsonData);

            expect(result.success).toBe(true);
            expect(persistence.has('npc_import_001')).toBe(true);
        });

        it('应该拒绝无效的JSON', () => {
            const result = persistence.importFromJSON('invalid json data');
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('应该拒绝缺少npcId的数据', () => {
            const jsonData = JSON.stringify({
                experience: [],
                skills: [],
                stats: {}
            });

            const result = persistence.importFromJSON(jsonData);
            expect(result.success).toBe(false);
            expect(result.error).toContain('npcId required');
        });

        it('导入的数据应该可以被load', () => {
            const npcId = 'npc_import_load';
            const jsonData = JSON.stringify({
                npcId,
                experience: [],
                skills: [],
                stats: { totalInteractions: 0 },
                timestamp: Date.now()
            });

            persistence.importFromJSON(jsonData);
            const loaded = persistence.load(npcId);

            expect(loaded).not.toBeNull();
        });
    });

    describe('delete', () => {
        it('应该删除指定的NPC数据', async () => {
            const npcId = 'npc_delete_001';
            await persistence.save(npcId);

            const result = persistence.delete(npcId);

            expect(result.success).toBe(true);
            expect(persistence.has(npcId)).toBe(false);
        });

        it('应该返回失败对于不存在的NPC', () => {
            const result = persistence.delete('non_existent');
            expect(result.success).toBe(false);
            expect(result.reason).toBe('NPC not found');
        });
    });

    describe('clearAll', () => {
        it('应该清空所有存储数据', async () => {
            await persistence.save('npc_clear_1');
            await persistence.save('npc_clear_2');
            await persistence.save('npc_clear_3');

            const result = persistence.clearAll();

            expect(result.success).toBe(true);
            expect(persistence.storage.size).toBe(0);
        });

        it('应该可以清空空的存储', () => {
            const result = persistence.clearAll();
            expect(result.success).toBe(true);
        });
    });

    describe('getStoredNpcIds', () => {
        it('应该返回所有已存储的NPC ID', async () => {
            await persistence.save('npc_ids_1');
            await persistence.save('npc_ids_2');
            await persistence.save('npc_ids_3');

            const ids = persistence.getStoredNpcIds();

            expect(ids).toContain('npc_ids_1');
            expect(ids).toContain('npc_ids_2');
            expect(ids).toContain('npc_ids_3');
        });

        it('应该在没有数据时返回空数组', () => {
            const ids = persistence.getStoredNpcIds();
            expect(ids).toEqual([]);
        });
    });

    describe('has', () => {
        it('应该对存在的NPC返回true', async () => {
            await persistence.save('npc_has_001');
            expect(persistence.has('npc_has_001')).toBe(true);
        });

        it('应该对不存在的NPC返回false', () => {
            expect(persistence.has('non_existent')).toBe(false);
        });
    });

    describe('getStorageStats', () => {
        it('应该返回存储统计信息', async () => {
            await persistence.save('npc_stats_1');
            await persistence.save('npc_stats_2');

            const stats = persistence.getStorageStats();

            expect(stats.totalStored).toBe(2);
            expect(stats.npcIds).toContain('npc_stats_1');
            expect(stats.npcIds).toContain('npc_stats_2');
        });

        it('应该返回totalStored=0当存储为空', () => {
            const stats = persistence.getStorageStats();
            expect(stats.totalStored).toBe(0);
            expect(stats.npcIds).toEqual([]);
        });
    });

    describe('数据完整性', () => {
        it('保存后再次load应该得到相同的数据', async () => {
            const npcId = 'npc_integrity';
            const interaction = {
                type: 'trade',
                playerAction: 'buy sword',
                npcResponse: 'Here is your sword',
                outcome: { success: true, satisfaction: 0.9 }
            };

            experienceTracker.track(npcId, interaction);
            
            await persistence.save(npcId);
            const loaded = await persistence.load(npcId);

            expect(loaded.npcId).toBe(npcId);
            expect(loaded.stats.totalInteractions).toBe(1);
        });

        it('多个NPC数据应该互不影响', async () => {
            experienceTracker.track('npc_a', { type: 'trade', playerAction: 'a', outcome: { success: true, satisfaction: 0.8 } });
            experienceTracker.track('npc_b', { type: 'chat', playerAction: 'b', outcome: { success: true, satisfaction: 0.6 } });

            await persistence.saveAll();

            const loadedA = await persistence.load('npc_a');
            const loadedB = await persistence.load('npc_b');

            expect(loadedA.stats.totalInteractions).toBe(1);
            expect(loadedB.stats.totalInteractions).toBe(1);
            expect(loadedA.experience[0].playerAction).toBe('a');
            expect(loadedB.experience[0].playerAction).toBe('b');
        });
    });
});