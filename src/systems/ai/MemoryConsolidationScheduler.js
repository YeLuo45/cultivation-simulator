/**
 * MemoryConsolidationScheduler - NPC 记忆巩固调度器
 * V289 Iteration 4/9 - NPC Memory Consolidation Scheduler
 *
 * 核心机制:
 *   - 调度 NPC 的记忆巩固任务
 *   - 将 experience records 整理转换为 dream memories
 *   - 支持定时/周期执行
 *
 * 设计来源: thunderbolt offline-first scheduler
 */

import { MemoryPriorityQueue } from './MemoryPriorityQueue.js';

export class MemoryConsolidationScheduler {
    /**
     * @param {ExperienceTracker} experienceTracker - 经验追踪器
     * @param {DreamMemoryStore} dreamMemoryStore - 梦境记忆存储
     */
    constructor(experienceTracker, dreamMemoryStore) {
        this.experienceTracker = experienceTracker;
        this.dreamMemoryStore = dreamMemoryStore;

        // 调度的任务 Map<npcId, { interval, lastRun, nextRun }>
        this.scheduledTasks = new Map();

        // 运行中标志 Map<npcId, boolean>
        this.runningTasks = new Map();

        // 优先级队列 - 待处理的记忆
        this.priorityQueue = new MemoryPriorityQueue();

        // 历史统计
        this._history = new Map(); // npcId -> { consolidatedCount, lastConsolidation }
    }

    /**
     * 注册 NPC 的记忆巩固任务
     * @param {string} npcId - NPC ID
     * @param {number} interval - 间隔时间(ms)，默认 60000 (1分钟)
     * @returns {Object} 注册结果
     */
    scheduleConsolidation(npcId, interval = 60000) {
        if (!npcId || typeof npcId !== 'string') {
            return { success: false, reason: 'Invalid npcId' };
        }
        if (typeof interval !== 'number' || interval <= 0) {
            return { success: false, reason: 'Invalid interval' };
        }

        const now = Date.now();
        const task = {
            interval,
            lastRun: null,
            nextRun: now + interval,
            enabled: true
        };

        this.scheduledTasks.set(npcId, task);
        this.runningTasks.set(npcId, false);

        if (!this._history.has(npcId)) {
            this._history.set(npcId, {
                consolidatedCount: 0,
                lastConsolidation: null,
                totalProcessed: 0
            });
        }

        return {
            success: true,
            npcId,
            interval,
            nextRun: task.nextRun
        };
    }

    /**
     * 取消巩固任务
     * @param {string} npcId - NPC ID
     * @returns {Object} 取消结果
     */
    cancelConsolidation(npcId) {
        if (!this.scheduledTasks.has(npcId)) {
            return { success: false, reason: 'NPC not scheduled' };
        }

        this.scheduledTasks.delete(npcId);
        this.runningTasks.delete(npcId);

        return { success: true, npcId };
    }

    /**
     * 更新巩固间隔
     * @param {string} npcId - NPC ID
     * @param {number} newInterval - 新间隔时间
     * @returns {Object} 更新结果
     */
    updateInterval(npcId, newInterval) {
        if (!this.scheduledTasks.has(npcId)) {
            return { success: false, reason: 'NPC not scheduled' };
        }
        if (typeof newInterval !== 'number' || newInterval <= 0) {
            return { success: false, reason: 'Invalid interval' };
        }

        const task = this.scheduledTasks.get(npcId);
        task.interval = newInterval;
        task.nextRun = Date.now() + newInterval;

        return { success: true, npcId, interval: newInterval };
    }

    /**
     * 执行单个 NPC 的记忆巩固
     * @param {string} npcId - NPC ID
     * @param {string} playerId - 玩家 ID
     * @returns {Promise<Object>} 巩固结果
     */
    async executeConsolidation(npcId, playerId = 'default_player') {
        // 检查 NPC 是否已注册
        if (!this.scheduledTasks.has(npcId)) {
            return { success: false, reason: 'NPC not scheduled' };
        }

        // 检查是否已在运行
        if (this.runningTasks.get(npcId)) {
            return { success: false, reason: 'Consolidation already in progress' };
        }

        this.runningTasks.set(npcId, true);
        const startTime = Date.now();

        try {
            // 1. 获取 NPC 的经验记录
            const records = this.experienceTracker.getRecords(npcId);

            if (records.length === 0) {
                this.runningTasks.set(npcId, false);
                return {
                    success: true,
                    npcId,
                    processed: 0,
                    message: 'No experience records to consolidate'
                };
            }

            // 2. 处理并优先级排序
            let processed = 0;
            let failed = 0;
            const now = Date.now();

            for (const record of records) {
                try {
                    // 计算优先级: 成功率 * 满意度 * 时间因子
                    const successFactor = record.outcome?.success ? 2 : 1;
                    const satisfactionFactor = record.outcome?.satisfaction ?? 0.5;
                    const recencyFactor = Math.max(1 - (now - record.timestamp) / (7 * 24 * 60 * 60 * 1000), 0.1);
                    const priority = successFactor * satisfactionFactor * recencyFactor * 100;

                    // 提取关键词
                    const keywords = this._extractKeywords(record);

                    // 构建记忆内容
                    const content = this._buildMemoryContent(record);

                    // 加入优先级队列
                    this.priorityQueue.enqueue({
                        npcId,
                        playerId,
                        content,
                        keywords,
                        originalRecord: record
                    }, priority);

                    processed++;
                } catch (err) {
                    failed++;
                }
            }

            // 3. 批量出队并写入 DreamMemoryStore
            let written = 0;
            while (!this.priorityQueue.isEmpty()) {
                const memData = this.priorityQueue.dequeue();
                if (memData) {
                    await this.dreamMemoryStore.save(
                        memData.npcId,
                        memData.playerId,
                        memData.content,
                        memData.keywords.join(','),
                        memData.keywords
                    );
                    written++;
                }
            }

            // 4. 更新任务状态
            const task = this.scheduledTasks.get(npcId);
            task.lastRun = Date.now();
            task.nextRun = Date.now() + task.interval;

            // 5. 更新历史统计
            const history = this._history.get(npcId) || {
                consolidatedCount: 0,
                lastConsolidation: null,
                totalProcessed: 0
            };
            history.consolidatedCount++;
            history.lastConsolidation = Date.now();
            history.totalProcessed += processed;
            this._history.set(npcId, history);

            return {
                success: true,
                npcId,
                processed,
                written,
                failed,
                duration: Date.now() - startTime
            };
        } catch (err) {
            return {
                success: false,
                reason: err.message,
                npcId
            };
        } finally {
            this.runningTasks.set(npcId, false);
        }
    }

    /**
     * 执行所有已调度的巩固任务（到期任务）
     * @returns {Promise<Array>} 各 NPC 的巩固结果
     */
    async executeAllScheduled() {
        const now = Date.now();
        const results = [];

        for (const [npcId, task] of this.scheduledTasks) {
            if (!task.enabled) continue;
            if (now < task.nextRun) continue;

            const result = await this.executeConsolidation(npcId);
            results.push(result);
        }

        return results;
    }

    /**
     * 获取调度器状态
     * @returns {Object} 调度器状态
     */
    getSchedulerStatus() {
        const now = Date.now();
        const taskStatuses = [];

        for (const [npcId, task] of this.scheduledTasks) {
            taskStatuses.push({
                npcId,
                interval: task.interval,
                lastRun: task.lastRun,
                nextRun: task.nextRun,
                isDue: now >= task.nextRun,
                isRunning: this.runningTasks.get(npcId) || false,
                enabled: task.enabled
            });
        }

        return {
            totalScheduled: this.scheduledTasks.size,
            totalRunning: Array.from(this.runningTasks.values()).filter(v => v).length,
            queueSize: this.priorityQueue.size(),
            taskStatuses,
            history: Object.fromEntries(this._history)
        };
    }

    /**
     * 获取指定 NPC 的任务状态
     * @param {string} npcId - NPC ID
     * @returns {Object|null} 任务状态
     */
    getTaskStatus(npcId) {
        if (!this.scheduledTasks.has(npcId)) {
            return null;
        }

        const task = this.scheduledTasks.get(npcId);
        const history = this._history.get(npcId) || {};

        return {
            npcId,
            interval: task.interval,
            lastRun: task.lastRun,
            nextRun: task.nextRun,
            isRunning: this.runningTasks.get(npcId) || false,
            enabled: task.enabled,
            history
        };
    }

    /**
     * 启用/禁用任务
     * @param {string} npcId - NPC ID
     * @param {boolean} enabled - 是否启用
     * @returns {Object} 更新结果
     */
    setEnabled(npcId, enabled) {
        if (!this.scheduledTasks.has(npcId)) {
            return { success: false, reason: 'NPC not scheduled' };
        }

        this.scheduledTasks.get(npcId).enabled = enabled;
        return { success: true, npcId, enabled };
    }

    /**
     * 立即触发某个 NPC 的巩固（不等待 schedule）
     * @param {string} npcId - NPC ID
     * @param {string} playerId - 玩家 ID
     * @returns {Promise<Object>} 巩固结果
     */
    async triggerNow(npcId, playerId = 'default_player') {
        if (!this.scheduledTasks.has(npcId)) {
            return { success: false, reason: 'NPC not scheduled' };
        }

        // 重置下次运行时间
        const task = this.scheduledTasks.get(npcId);
        task.nextRun = Date.now() + task.interval;

        return this.executeConsolidation(npcId, playerId);
    }

    /**
     * 清空所有调度的任务
     */
    clearAll() {
        this.scheduledTasks.clear();
        this.runningTasks.clear();
        this.priorityQueue.clear();
        this._history.clear();
    }

    /**
     * 从经验记录提取关键词
     * @private
     */
    _extractKeywords(record) {
        const keywords = new Set();

        if (record.type) keywords.add(record.type);
        if (record.playerAction) {
            record.playerAction.split(/\s+/).forEach(w => {
                if (w.length > 2) keywords.add(w.toLowerCase());
            });
        }
        if (record.npcResponse) {
            record.npcResponse.split(/\s+/).forEach(w => {
                if (w.length > 2) keywords.add(w.toLowerCase());
            });
        }

        return Array.from(keywords).slice(0, 10);
    }

    /**
     * 构建记忆内容
     * @private
     */
    _buildMemoryContent(record) {
        const outcome = record.outcome?.success ? '成功' : '失败';
        const satisfaction = Math.round((record.outcome?.satisfaction ?? 0.5) * 100);
        return `[${record.type}] ${record.playerAction} → ${record.npcResponse} (${outcome}, 满意度: ${satisfaction}%)`;
    }
}

export default MemoryConsolidationScheduler;