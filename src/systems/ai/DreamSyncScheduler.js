/**
 * DreamSyncScheduler.js - NPC 梦境同步调度器
 * V288 Iteration 3/9 - Dream Sync Scheduling
 * 
 * 核心机制:
 * 1. 调度多个 NPC 的梦境同步时间
 * 2. 批量执行已调度的梦境同步
 * 3. 追踪调度状态
 */

import { DreamCollaborationProtocol } from './DreamCollaborationProtocol.js';

export class DreamSyncScheduler {
    /**
     * @param {DreamCollaborationProtocol} dreamCollaboration - 梦境协作协议
     * @param {NPCLearningMesh} npcLearningMesh - NPC 学习网络
     */
    constructor(dreamCollaboration, npcLearningMesh) {
        this.dreamCollaboration = dreamCollaboration;
        this.npcLearningMesh = npcLearningMesh;
        this.scheduledSyncs = new Map(); // npcId -> { scheduledTime, peers: [], theme, status }
        this.syncHistory = []; // 历史同步记录
        this.nextSyncId = 0;
    }

    /**
     * 生成同步 ID
     * @returns {string}
     */
    _generateSyncId() {
        this.nextSyncId += 1;
        return `sync_${Date.now()}_${this.nextSyncId}`;
    }

    /**
     * 调度梦境同步
     * @param {string} npcId - NPC ID
     * @param {string[]} peerNpcIds - 对等 NPC ID 数组
     * @param {number} delayMs - 延迟毫秒数（默认立即调度）
     * @param {string} theme - 梦境主题
     * @returns {Object} 调度结果
     */
    scheduleSync(npcId, peerNpcIds, delayMs = 0, theme = 'scheduled_dream') {
        if (!npcId) {
            return { success: false, reason: 'Invalid npcId' };
        }

        if (!Array.isArray(peerNpcIds) || peerNpcIds.length === 0) {
            return { success: false, reason: 'peerNpcIds must be a non-empty array' };
        }

        // 过滤掉不存在的 NPC
        const validPeers = peerNpcIds.filter(peerId => {
            if (peerId === npcId) return false;
            return this.npcLearningMesh.isRegistered(peerId);
        });

        if (validPeers.length === 0) {
            return { success: false, reason: 'No valid peers found' };
        }

        const scheduledTime = Date.now() + delayMs;
        const syncId = this._generateSyncId();

        const scheduleEntry = {
            id: syncId,
            npcId,
            peers: validPeers,
            theme,
            scheduledTime,
            delayMs,
            status: 'scheduled',
            createdAt: Date.now(),
            executedAt: null,
            result: null
        };

        this.scheduledSyncs.set(npcId, scheduleEntry);

        return {
            success: true,
            syncId,
            npcId,
            peers: validPeers,
            scheduledTime,
            delayMs
        };
    }

    /**
     * 批量调度多个 NPC 的梦境同步
     * @param {Array<{npcId: string, peerNpcIds: string[], delayMs?: number, theme?: string}>} schedules
     * @returns {Object} 批量调度结果
     */
    scheduleBatchSync(schedules) {
        if (!Array.isArray(schedules) || schedules.length === 0) {
            return { success: false, reason: 'schedules must be a non-empty array' };
        }

        const results = [];
        for (const schedule of schedules) {
            const result = this.scheduleSync(
                schedule.npcId,
                schedule.peerNpcIds,
                schedule.delayMs || 0,
                schedule.theme || 'scheduled_dream'
            );
            results.push(result);
        }

        const successCount = results.filter(r => r.success).length;

        return {
            success: successCount > 0,
            total: schedules.length,
            scheduled: successCount,
            results
        };
    }

    /**
     * 取消已调度的同步
     * @param {string} npcId - NPC ID
     * @returns {Object} 取消结果
     */
    cancelScheduledSync(npcId) {
        const schedule = this.scheduledSyncs.get(npcId);
        if (!schedule) {
            return { success: false, reason: 'No scheduled sync found for NPC' };
        }

        if (schedule.status !== 'scheduled') {
            return { success: false, reason: 'Sync already executed or cancelled' };
        }

        schedule.status = 'cancelled';
        schedule.cancelledAt = Date.now();

        return {
            success: true,
            cancelled: npcId,
            syncId: schedule.id
        };
    }

    /**
     * 执行所有已到期的调度同步
     * @param {Function} dreamDataProvider - 可选的数据提供函数 (npcId, peerNpcId) => dreamData
     * @returns {Object} 执行结果
     */
    executeScheduledSyncs(dreamDataProvider = null) {
        const now = Date.now();
        const toExecute = [];
        const results = [];

        // 收集所有已到期的同步
        for (const [npcId, schedule] of this.scheduledSyncs) {
            if (schedule.status === 'scheduled' && schedule.scheduledTime <= now) {
                toExecute.push({ npcId, schedule });
            }
        }

        if (toExecute.length === 0) {
            return {
                success: true,
                executed: 0,
                message: 'No scheduled syncs due for execution'
            };
        }

        // 执行每个到期的同步
        for (const { npcId, schedule } of toExecute) {
            const syncResults = [];

            for (const peerNpcId of schedule.peers) {
                // 准备梦境数据
                let sharedDreamData;
                if (dreamDataProvider) {
                    sharedDreamData = dreamDataProvider(npcId, peerNpcId);
                } else {
                    // 默认梦境数据
                    sharedDreamData = {
                        theme: schedule.theme,
                        content: `Dream collaboration between ${npcId} and ${peerNpcId}`,
                        emotion: 'collaborative',
                        keywords: ['scheduled', 'dream', 'sync'],
                        timestamp: Date.now()
                    };
                }

                const syncResult = this.dreamCollaboration.syncDream(npcId, peerNpcId, sharedDreamData);
                syncResults.push({
                    peerNpcId,
                    success: syncResult.success,
                    sessionId: syncResult.sessionId,
                    error: syncResult.reason || null
                });
            }

            // 更新调度状态
            schedule.status = 'executed';
            schedule.executedAt = Date.now();
            schedule.result = syncResults;

            const execResult = {
                syncId: schedule.id,
                npcId,
                peers: schedule.peers,
                results: syncResults,
                executedAt: schedule.executedAt
            };

            results.push(execResult);
            this.syncHistory.push(execResult);
        }

        const successCount = results.filter(r => 
            r.results && r.results.every(res => res.success)
        ).length;

        return {
            success: true,
            executed: toExecute.length,
            successful: successCount,
            results
        };
    }

    /**
     * 获取调度状态
     * @param {string} npcId - 可选的 NPC ID
     * @returns {Object} 调度状态
     */
    getSchedulerStatus(npcId = null) {
        if (npcId) {
            const schedule = this.scheduledSyncs.get(npcId);
            if (!schedule) {
                return { success: false, reason: 'No schedule found for NPC' };
            }

            return {
                success: true,
                npcId,
                schedule: {
                    id: schedule.id,
                    peers: schedule.peers,
                    theme: schedule.theme,
                    scheduledTime: schedule.scheduledTime,
                    delayMs: schedule.delayMs,
                    status: schedule.status,
                    createdAt: schedule.createdAt,
                    executedAt: schedule.executedAt
                },
                timeUntilNextSync: schedule.scheduledTime - Date.now()
            };
        }

        // 返回所有调度状态
        const allSchedules = [];
        for (const [npcId, schedule] of this.scheduledSyncs) {
            allSchedules.push({
                npcId,
                id: schedule.id,
                peers: schedule.peers,
                theme: schedule.theme,
                scheduledTime: schedule.scheduledTime,
                status: schedule.status
            });
        }

        return {
            success: true,
            totalScheduled: allSchedules.length,
            scheduled: allSchedules.filter(s => s.status === 'scheduled').length,
            executed: allSchedules.filter(s => s.status === 'executed').length,
            cancelled: allSchedules.filter(s => s.status === 'cancelled').length,
            schedules: allSchedules,
            recentHistory: this.syncHistory.slice(-10)
        };
    }

    /**
     * 获取同步历史
     * @param {number} limit - 返回条数限制
     * @returns {Object[]} 历史记录
     */
    getSyncHistory(limit = 20) {
        return this.syncHistory.slice(-limit);
    }

    /**
     * 获取下一个即将执行的同步
     * @returns {Object|null}
     */
    getNextScheduledSync() {
        let nextSync = null;
        let earliestTime = Infinity;

        for (const schedule of this.scheduledSyncs.values()) {
            if (schedule.status === 'scheduled' && schedule.scheduledTime < earliestTime) {
                earliestTime = schedule.scheduledTime;
                nextSync = {
                    npcId: schedule.npcId,
                    peers: schedule.peers,
                    theme: schedule.theme,
                    scheduledTime: schedule.scheduledTime
                };
            }
        }

        return nextSync;
    }

    /**
     * 清除所有调度数据（测试用）
     */
    clearAll() {
        this.scheduledSyncs.clear();
        this.syncHistory = [];
        this.nextSyncId = 0;
    }
}

export default DreamSyncScheduler;