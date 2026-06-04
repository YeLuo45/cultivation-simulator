/**
 * EvolutionAutoBackup 单元测试
 * V293 Iteration 8/9 - NPC Evolution Data Persistence
 * 
 * 测试策略: 验证自动备份的各项功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EvolutionAutoBackup } from '../../../systems/ai/EvolutionAutoBackup.js';
import { EvolutionDataPersistence } from '../../../systems/ai/EvolutionDataPersistence.js';
import { ExperienceTracker } from '../../../systems/ai/ExperienceTracker.js';
import { SkillCrystallization } from '../../../systems/ai/SkillCrystallization.js';

describe('EvolutionAutoBackup', () => {
    let autoBackup;
    let persistence;
    let experienceTracker;
    let skillCrystallization;

    beforeEach(() => {
        experienceTracker = new ExperienceTracker(100);
        skillCrystallization = new SkillCrystallization();
        persistence = new EvolutionDataPersistence(experienceTracker, skillCrystallization);
        autoBackup = new EvolutionAutoBackup(persistence);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        if (autoBackup.autoBackupInterval) {
            clearInterval(autoBackup.autoBackupInterval);
            autoBackup.autoBackupInterval = null;
        }
    });

    describe('constructor', () => {
        it('应该使用提供的persistence创建实例', () => {
            expect(autoBackup.persistence).toBe(persistence);
        });

        it('应该初始化autoBackupInterval为null', () => {
            expect(autoBackup.autoBackupInterval).toBeNull();
        });

        it('应该初始化lastBackupTime为null', () => {
            expect(autoBackup.lastBackupTime).toBeNull();
        });

        it('应该初始化backupCount为0', () => {
            expect(autoBackup.backupCount).toBe(0);
        });
    });

    describe('startAutoBackup', () => {
        it('应该设置autoBackupInterval', () => {
            autoBackup.startAutoBackup(1000);
            expect(autoBackup.autoBackupInterval).not.toBeNull();
        });

        it('应该可以重新设置备份间隔', () => {
            autoBackup.startAutoBackup(1000);
            const firstInterval = autoBackup.autoBackupInterval;

            autoBackup.startAutoBackup(2000);

            expect(autoBackup.autoBackupInterval).not.toBe(firstInterval);
        });

        it('应该先停止旧的再启动新的', () => {
            const clearSpy = vi.spyOn(global, 'clearInterval');
            autoBackup.startAutoBackup(1000);
            
            autoBackup.startAutoBackup(2000);

            expect(clearSpy).toHaveBeenCalled();
        });

        it('启动后getBackupStatus应该显示isRunning=true', () => {
            autoBackup.startAutoBackup(1000);
            const status = autoBackup.getBackupStatus();

            expect(status.isRunning).toBe(true);
        });
    });

    describe('stopAutoBackup', () => {
        it('应该清除autoBackupInterval', () => {
            autoBackup.startAutoBackup(1000);
            autoBackup.stopAutoBackup();

            expect(autoBackup.autoBackupInterval).toBeNull();
        });

        it('应该设置isRunning=false', () => {
            autoBackup.startAutoBackup(1000);
            autoBackup.stopAutoBackup();
            const status = autoBackup.getBackupStatus();

            expect(status.isRunning).toBe(false);
        });

        it('在未启动时调用应该不报错', () => {
            expect(() => autoBackup.stopAutoBackup()).not.toThrow();
        });

        it('停止后可以重新启动', () => {
            autoBackup.startAutoBackup(1000);
            autoBackup.stopAutoBackup();
            autoBackup.startAutoBackup(500);

            expect(autoBackup.isRunning()).toBe(true);
        });
    });

    describe('triggerBackup', () => {
        it('应该返回成功结果', () => {
            const result = autoBackup.triggerBackup();

            expect(result.success).toBe(true);
            expect(result.backupTime).toBeDefined();
        });

        it('应该调用persistence.saveAll', async () => {
            const saveAllSpy = vi.spyOn(persistence, 'saveAll');
            autoBackup.triggerBackup();

            // wait for async saveAll
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(saveAllSpy).toHaveBeenCalled();
        });

        it('应该增加backupCount', async () => {
            autoBackup.triggerBackup();
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(autoBackup.backupCount).toBeGreaterThan(0);
        });

        it('应该更新lastBackupTime', async () => {
            autoBackup.triggerBackup();
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(autoBackup.lastBackupTime).not.toBeNull();
        });

        it('应该返回backupTime时间戳', () => {
            const before = Date.now();
            const result = autoBackup.triggerBackup();
            const after = Date.now();

            expect(result.backupTime).toBeGreaterThanOrEqual(before);
            expect(result.backupTime).toBeLessThanOrEqual(after);
        });
    });

    describe('triggerBackupSync', () => {
        it('应该同步返回成功结果', async () => {
            const result = await autoBackup.triggerBackupSync();

            expect(result.success).toBe(true);
            expect(result.backupTime).toBeDefined();
        });

        it('应该等待saveAll完成', async () => {
            const result = await autoBackup.triggerBackupSync();

            expect(result.saved).toBeDefined();
        });

        it('应该增加backupCount', async () => {
            await autoBackup.triggerBackupSync();
            expect(autoBackup.backupCount).toBe(1);
        });

        it('应该更新lastBackupTime', async () => {
            await autoBackup.triggerBackupSync();
            expect(autoBackup.lastBackupTime).not.toBeNull();
        });

        it('连续调用应该累加backupCount', async () => {
            await autoBackup.triggerBackupSync();
            await autoBackup.triggerBackupSync();
            await autoBackup.triggerBackupSync();

            expect(autoBackup.backupCount).toBe(3);
        });
    });

    describe('getBackupStatus', () => {
        it('未启动时应该显示isRunning=false', () => {
            const status = autoBackup.getBackupStatus();
            expect(status.isRunning).toBe(false);
        });

        it('启动后应该显示isRunning=true', () => {
            autoBackup.startAutoBackup(10000);
            const status = autoBackup.getBackupStatus();

            expect(status.isRunning).toBe(true);
        });

        it('应该返回lastBackupTime', () => {
            autoBackup.lastBackupTime = 12345678;
            const status = autoBackup.getBackupStatus();

            expect(status.lastBackupTime).toBe(12345678);
        });

        it('应该返回backupCount', () => {
            autoBackup.backupCount = 5;
            const status = autoBackup.getBackupStatus();

            expect(status.backupCount).toBe(5);
        });
    });

    describe('resetBackupCount', () => {
        it('应该将backupCount重置为0', () => {
            autoBackup.backupCount = 10;
            autoBackup.resetBackupCount();

            expect(autoBackup.backupCount).toBe(0);
        });

        it('应该在status中反映', () => {
            autoBackup.backupCount = 5;
            autoBackup.resetBackupCount();
            const status = autoBackup.getBackupStatus();

            expect(status.backupCount).toBe(0);
        });
    });

    describe('isRunning', () => {
        it('未启动时应该返回false', () => {
            expect(autoBackup.isRunning()).toBe(false);
        });

        it('启动后应该返回true', () => {
            autoBackup.startAutoBackup(10000);
            expect(autoBackup.isRunning()).toBe(true);
        });

        it('停止后应该返回false', () => {
            autoBackup.startAutoBackup(10000);
            autoBackup.stopAutoBackup();
            expect(autoBackup.isRunning()).toBe(false);
        });
    });

    describe('getTimeSinceLastBackup', () => {
        it('未备份时应该返回null', () => {
            expect(autoBackup.getTimeSinceLastBackup()).toBeNull();
        });

        it('应该返回距上次备份的毫秒数', async () => {
            autoBackup.lastBackupTime = Date.now() - 5000;
            const time = autoBackup.getTimeSinceLastBackup();

            expect(time).toBeGreaterThanOrEqual(5000);
            expect(time).toBeLessThan(6000);
        });
    });

    

    describe('备份数据正确性', () => {
        it('triggerBackupSync应该保存正确的NPC数据', async () => {
            experienceTracker.track('npc_backup_1', { type: 'trade', playerAction: 'buy', outcome: { success: true, satisfaction: 0.8 } });
            experienceTracker.track('npc_backup_2', { type: 'chat', playerAction: 'hello', outcome: { success: true, satisfaction: 0.9 } });

            await autoBackup.triggerBackupSync();

            const loaded1 = await persistence.load('npc_backup_1');
            const loaded2 = await persistence.load('npc_backup_2');

            expect(loaded1.stats.totalInteractions).toBe(1);
            expect(loaded2.stats.totalInteractions).toBe(1);
        });

        it('多次triggerBackupSync应该保存最新的数据', async () => {
            const npcId = 'npc_update';
            experienceTracker.track(npcId, { type: 'trade', playerAction: 'first', outcome: { success: true, satisfaction: 0.5 } });

            await autoBackup.triggerBackupSync();

            experienceTracker.track(npcId, { type: 'trade', playerAction: 'second', outcome: { success: true, satisfaction: 0.9 } });

            await autoBackup.triggerBackupSync();

            const loaded = await persistence.load(npcId);
            expect(loaded.stats.totalInteractions).toBe(2);
        });
    });
});