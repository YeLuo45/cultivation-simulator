/**
 * EvolutionAutoBackup.js - NPC进化数据自动备份
 * V293 Iteration 8/9 - NPC Evolution Data Persistence
 * 
 * 核心机制：
 * 1. 启动自动备份
 * 2. 停止自动备份
 * 3. 手动触发备份
 * 4. 获取备份状态
 */

import EvolutionDataPersistence from './EvolutionDataPersistence.js';

/**
 * EvolutionAutoBackup - NPC进化数据自动备份系统
 * 基于EvolutionDataPersistence实现定时自动备份
 */
export class EvolutionAutoBackup {
    /**
     * @param {EvolutionDataPersistence} persistence - 数据持久化实例
     */
    constructor(persistence) {
        this.persistence = persistence;
        this.autoBackupInterval = null;
        this.lastBackupTime = null;
        this.backupCount = 0;
    }

    /**
     * 启动自动备份
     * @param {number} intervalMs - 备份间隔（毫秒）
     */
    startAutoBackup(intervalMs) {
        if (this.autoBackupInterval) {
            this.stopAutoBackup();
        }
        this.autoBackupInterval = setInterval(() => this.triggerBackup(), intervalMs);
    }

    /**
     * 停止自动备份
     */
    stopAutoBackup() {
        if (this.autoBackupInterval) {
            clearInterval(this.autoBackupInterval);
            this.autoBackupInterval = null;
        }
    }

    /**
     * 手动触发备份
     * @returns {Object} 备份结果
     */
    triggerBackup() {
        this.persistence.saveAll().then(() => {
            this.lastBackupTime = Date.now();
            this.backupCount++;
        });
        return { success: true, backupTime: Date.now() };
    }

    /**
     * 获取备份状态
     * @returns {Object} 备份状态信息
     */
    getBackupStatus() {
        return {
            isRunning: this.autoBackupInterval !== null,
            lastBackupTime: this.lastBackupTime,
            backupCount: this.backupCount
        };
    }

    /**
     * 同步触发备份（等待完成）
     * @returns {Promise<Object>} 备份结果
     */
    async triggerBackupSync() {
        const result = await this.persistence.saveAll();
        this.lastBackupTime = Date.now();
        this.backupCount++;
        return { success: true, backupTime: this.lastBackupTime, ...result };
    }

    /**
     * 重置备份计数
     */
    resetBackupCount() {
        this.backupCount = 0;
    }

    /**
     * 检查是否正在运行
     * @returns {boolean} 是否正在运行
     */
    isRunning() {
        return this.autoBackupInterval !== null;
    }

    /**
     * 获取距上次备份的时间（毫秒）
     * @returns {number|null} 毫秒数或null
     */
    getTimeSinceLastBackup() {
        if (!this.lastBackupTime) return null;
        return Date.now() - this.lastBackupTime;
    }
}

export default EvolutionAutoBackup;