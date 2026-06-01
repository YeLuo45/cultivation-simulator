/**
 * 多线程并行修炼服务
 * generic-agent自主目标追求 - 多线程目标驱动修炼
 * thunderbolt pipeline反馈 - 多线程调度与同步
 */

import { MultiRealmPipelineService } from './MultiRealmPipelineService.js';
import { SectManagementService } from '../../sect/services/SectManagementService.js';

// 线程优先级
export const THREAD_PRIORITY = {
    CRITICAL: 0,   // 关键路径 - 突破/生死关头
    HIGH: 1,       // 高优先级 - 境界提升
    NORMAL: 2,     // 普通 - 常规修炼
    LOW: 3         // 低优先级 - 辅助/休闲
};

// 线程状态
export const THREAD_STATUS = {
    RUNNING: 'running',
    SUSPENDED: 'suspended',
    COMPLETED: 'completed',
    FAILED: 'failed',
    BLOCKED: 'blocked'
};

// 线程类型
const THREAD_TYPES = {
    CULTIVATION: 'cultivation',     // 境界修炼线程
    COMBAT: 'combat',               // 战斗训练线程
    EXPLORATION: 'exploration',     // 探索线程
    ALCHEMY: 'alchemy',             // 炼丹线程
    FORMATION: 'formation',         // 阵法修炼
    SOCIAL: 'social'                 // 社交/任务线程
};

export class ParallelCultivationService {
    constructor(gameState) {
        this.gameState = gameState;
        this.threadState = gameState.parallelCultivation || this.initThreadState();
        this.pipeline = new MultiRealmPipelineService(gameState);
        this.sect = new SectManagementService(gameState);
    }

    initThreadState() {
        const state = {
            threads: {},     // threadId -> ThreadState
            nextThreadId: 1,
            activeCount: 0,
            maxThreads: 5,
            lastScheduleTime: null,
            schedulePolicy: 'priority',  // priority | round_robin | resource_balanced
            totalCultivationTime: 0
        };
        this.gameState.parallelCultivation = state;
        return state;
    }

    init(gameState) {
        this.threadState = gameState.parallelCultivation || this.initThreadState();
        this.pipeline.init(gameState);
        this.sect.init(gameState);
        return this;
    }

    /**
     * 创建修炼线程
     */
    createThread({ name, type, priority = THREAD_PRIORITY.NORMAL, target, maxDuration, dependencies = [] }) {
        if (this.threadState.activeCount >= this.threadState.maxThreads) {
            return { success: false, error: '已达最大线程数限制' };
        }

        const threadId = `thread_${this.threadState.nextThreadId++}`;
        
        const thread = {
            id: threadId,
            name,
            type,
            priority,
            status: THREAD_STATUS.RUNNING,
            target,              // 目标进度或境界
            currentProgress: 0,
            maxDuration,         // 最大修炼时长(ms)
            elapsedTime: 0,
            startTime: Date.now(),
            lastUpdateTime: Date.now(),
            dependencies,        // 依赖的线程ID
            subGoals: [],        // 子目标
            result: null,        // 完成结果
            resourceCost: { spiritStones: 0,精力: 0 },
            spawnChild: null     // 孕育的子线程
        };

        this.threadState.threads[threadId] = thread;
        this.threadState.activeCount++;
        this.threadState.lastScheduleTime = Date.now();

        return { success: true, thread };
    }

    /**
     * 创建子目标线程
     */
    createSubGoal(parentThreadId, { name, type, priority, target, maxDuration }) {
        const parent = this.threadState.threads[parentThreadId];
        if (!parent) return { success: false, error: '父线程不存在' };

        const subGoal = this.createThread({ name, type, priority, target, maxDuration, dependencies: [parentThreadId] });
        if (subGoal.success) {
            parent.subGoals.push(subGoal.thread.id);
            parent.spawnChild = subGoal.thread.id;
        }

        return subGoal;
    }

    /**
     * 暂停线程
     */
    suspendThread(threadId) {
        const thread = this.threadState.threads[threadId];
        if (!thread) return { success: false, error: '线程不存在' };
        if (thread.status !== THREAD_STATUS.RUNNING) return { success: false, error: '线程不在运行状态' };

        thread.status = THREAD_STATUS.SUSPENDED;
        this.threadState.activeCount--;
        thread.suspendedAt = Date.now();

        return { success: true, thread };
    }

    /**
     * 恢复线程
     */
    resumeThread(threadId) {
        const thread = this.threadState.threads[threadId];
        if (!thread) return { success: false, error: '线程不存在' };
        if (thread.status !== THREAD_STATUS.SUSPENDED) return { success: false, error: '线程未暂停' };

        thread.status = THREAD_STATUS.RUNNING;
        this.threadState.activeCount++;
        const pausedDuration = Date.now() - thread.suspendedAt;
        thread.elapsedTime += pausedDuration;
        thread.lastUpdateTime = Date.now();

        return { success: true, thread };
    }

    /**
     * 终止线程
     */
    terminateThread(threadId) {
        const thread = this.threadState.threads[threadId];
        if (!thread) return { success: false, error: '线程不存在' };

        thread.status = THREAD_STATUS.FAILED;
        thread.endTime = Date.now();
        if (thread.status === THREAD_STATUS.RUNNING) this.threadState.activeCount--;

        return { success: true, thread };
    }

    /**
     * 更新线程进度
     * @param {string} threadId - 线程ID
     * @param {number} deltaTime - 时间增量(ms)
     */
    updateThread(threadId, deltaTime) {
        const thread = this.threadState.threads[threadId];
        if (!thread || thread.status !== THREAD_STATUS.RUNNING) return null;

        thread.elapsedTime += deltaTime;
        const now = Date.now();

        // 根据线程类型计算进度
        let progressGain = this.calculateProgress(thread, deltaTime);
        thread.currentProgress += progressGain;

        // 消耗资源
        this.consumeThreadResources(thread, deltaTime);

        // 检查完成条件
        if (thread.currentProgress >= thread.target) {
            thread.status = THREAD_STATUS.COMPLETED;
            thread.result = { success: true, completionTime: thread.elapsedTime };
            thread.completedAt = now;
            this.threadState.activeCount--;
            return thread;
        }

        // 检查超时
        if (thread.maxDuration && thread.elapsedTime >= thread.maxDuration) {
            thread.status = THREAD_STATUS.COMPLETED;
            thread.result = { success: true, completionTime: thread.elapsedTime, timedOut: true };
            thread.completedAt = now;
            this.threadState.activeCount--;
            return thread;
        }

        thread.lastUpdateTime = now;
        return null;  // 未完成
    }

    /**
     * 根据线程类型计算进度增益
     */
    calculateProgress(thread, deltaTime) {
        const baseProgress = deltaTime / 1000; // 每秒1点基础进度

        // 类型加成
        const typeMultipliers = {
            cultivation: 1.5,
            combat: 1.2,
            exploration: 1.0,
            alchemy: 0.8,
            formation: 0.9,
            social: 0.7
        };

        // 优先级加成
        const priorityMultipliers = {
            [THREAD_PRIORITY.CRITICAL]: 2.0,
            [THREAD_PRIORITY.HIGH]: 1.5,
            [THREAD_PRIORITY.NORMAL]: 1.0,
            [THREAD_PRIORITY.LOW]: 0.6
        };

        const typeMultiplier = typeMultipliers[thread.type] || 1.0;
        const priorityMultiplier = priorityMultipliers[thread.priority] || 1.0;

        return baseProgress * typeMultiplier * priorityMultiplier;
    }

    /**
     * 消耗线程资源
     */
    consumeThreadResources(thread, deltaTime) {
        const resourceRate = {
            cultivation: { spiritStones: 0.01, 精力: 0.02 },
            combat: { spiritStones: 0.02, 精力: 0.05 },
            exploration: { spiritStones: 0.01, 精力: 0.01 },
            alchemy: { spiritStones: 0.05, 精力: 0.03 },
            formation: { spiritStones: 0.03, 精力: 0.02 },
            social: { spiritStones: 0.005, 精力: 0.01 }
        };

        const rates = resourceRate[thread.type] || { spiritStones: 0.01, 精力: 0.01 };
        thread.resourceCost.spiritStones += rates.spiritStones * (deltaTime / 1000);
        thread.resourceCost['精力'] += rates['精力'] * (deltaTime / 1000);
    }

    /**
     * 调度所有运行中的线程
     */
    scheduleAll(deltaTime) {
        const runningThreads = Object.values(this.threadState.threads)
            .filter(t => t.status === THREAD_STATUS.RUNNING)
            .sort((a, b) => a.priority - b.priority);  // 优先级低的先调度

        const results = [];
        for (const thread of runningThreads) {
            const result = this.updateThread(thread.id, deltaTime);
            results.push({ threadId: thread.id, result });
        }

        this.threadState.totalCultivationTime += deltaTime;
        return results;
    }

    /**
     * 获取线程状态摘要
     */
    getThreadSummary() {
        const threads = Object.values(this.threadState.threads);
        return {
            total: threads.length,
            running: threads.filter(t => t.status === THREAD_STATUS.RUNNING).length,
            suspended: threads.filter(t => t.status === THREAD_STATUS.SUSPENDED).length,
            completed: threads.filter(t => t.status === THREAD_STATUS.COMPLETED).length,
            failed: threads.filter(t => t.status === THREAD_STATUS.FAILED).length,
            activeCount: this.threadState.activeCount,
            maxThreads: this.threadState.maxThreads
        };
    }

    /**
     * 设置调度策略
     */
    setSchedulePolicy(policy) {
        if (!['priority', 'round_robin', 'resource_balanced'].includes(policy)) {
            return { success: false, error: '无效调度策略' };
        }
        this.threadState.schedulePolicy = policy;
        return { success: true, policy };
    }

    // ========== MCP工具 ==========

    /**
     * MCP: 创建修炼线程
     */
    mcpCreateThread({ name, type, priority, target, maxDuration }) {
        return this.createThread({ name, type, priority, target, maxDuration });
    }

    /**
     * MCP: 创建子目标线程
     */
    mcpCreateSubGoal({ parentThreadId, name, type, priority, target, maxDuration }) {
        return this.createSubGoal(parentThreadId, { name, type, priority, target, maxDuration });
    }

    /**
     * MCP: 暂停线程
     */
    mcpSuspendThread({ threadId }) {
        return this.suspendThread(threadId);
    }

    /**
     * MCP: 恢复线程
     */
    mcpResumeThread({ threadId }) {
        return this.resumeThread(threadId);
    }

    /**
     * MCP: 终止线程
     */
    mcpTerminateThread({ threadId }) {
        return this.terminateThread(threadId);
    }

    /**
     * MCP: 推进线程时间
     */
    mcpTickThreads({ deltaTime }) {
        const results = this.scheduleAll(deltaTime);
        const summary = this.getThreadSummary();
        return {
            success: true,
            results: results.map(r => ({
                threadId: r.threadId,
                completed: !!r.result,
                progress: r.result ? null : this.threadState.threads[r.threadId]?.currentProgress
            })),
            summary
        };
    }

    /**
     * MCP: 获取所有线程状态
     */
    mcpGetAllThreads() {
        return {
            success: true,
            summary: this.getThreadSummary(),
            schedulePolicy: this.threadState.schedulePolicy,
            threads: Object.values(this.threadState.threads).map(t => ({
                id: t.id,
                name: t.name,
                type: t.type,
                priority: t.priority,
                status: t.status,
                progress: `${t.currentProgress.toFixed(1)}/${t.target}`,
                progressRatio: (t.currentProgress / t.target * 100).toFixed(1) + '%',
                elapsedTime: t.elapsedTime,
                resourceCost: t.resourceCost
            }))
        };
    }

    /**
     * MCP: 设置调度策略
     */
    mcpSetSchedulePolicy({ policy }) {
        return this.setSchedulePolicy(policy);
    }
}

export { ParallelCultivationService as default };
