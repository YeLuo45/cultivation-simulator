/**
 * TimeOnTaskAnalyzer.js - 任务时长分析器
 * V952 P-20260614-005 Iteration 5/30 Round 37 Direction E 灵犀镜
 *
 * 核心机制 (thunderbolt + generic-agent time budget):
 * - 玩家每类任务花费时间追踪
 * - 平均/最大/最小/总时长
 * - 异常长任务告警 (>2x avg)
 * - 时间效率评分
 */

export const TASK_CATEGORIES = ['cultivate', 'combat', 'trade', 'social', 'explore', 'craft', 'tutorial', 'menu'];
export const ANOMALY_MULTIPLIER = 2.0;  // 任务时长 > 2x avg 视为异常
export const DEFAULT_MAX_TASKS = 500;

export class TimeOnTaskAnalyzer {
    constructor(config = {}) {
        this.config = {
            maxTasks: config.maxTasks !== undefined ? config.maxTasks : DEFAULT_MAX_TASKS,
            anomalyMultiplier: config.anomalyMultiplier !== undefined ? config.anomalyMultiplier : ANOMALY_MULTIPLIER,
            ...config,
        };
        this.tasks = new Map();        // taskId -> { playerId, category, durationMs, startedAt, endedAt }
        this.playerTasks = new Map();  // playerId -> Map<category, taskId[]>
        this.hooks = new Map();
        this.stats = { totalTracked: 0, totalAnomalies: 0 };
    }

    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }

    trackTask(playerId, category, durationMs) {
        if (!playerId || !TASK_CATEGORIES.includes(category)) return null;
        if (typeof durationMs !== 'number' || durationMs < 0) return null;
        const id = `tsk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const now = Date.now();
        const task = {
            id, playerId, category, durationMs,
            startedAt: now - durationMs,
            endedAt: now,
        };
        this.tasks.set(id, task);
        if (!this.playerTasks.has(playerId)) this.playerTasks.set(playerId, new Map());
        const cmap = this.playerTasks.get(playerId);
        if (!cmap.has(category)) cmap.set(category, []);
        cmap.get(category).push(id);
        if (cmap.get(category).length > this.config.maxTasks) cmap.get(category).shift();
        this.stats.totalTracked++;
        if (this._isAnomaly(playerId, category, durationMs)) {
            this.stats.totalAnomalies++;
            this._emit('anomaly', { task, playerId, category, durationMs });
        }
        this._emit('tracked', task);
        return task;
    }

    _tasksFor(playerId, category) {
        const cmap = this.playerTasks.get(playerId);
        if (!cmap) return [];
        const ids = cmap.get(category) || [];
        return ids.map(id => this.tasks.get(id)).filter(Boolean);
    }

    _isAnomaly(playerId, category, durationMs) {
        const list = this._tasksFor(playerId, category);
        if (list.length < 3) return false;
        const avg = list.reduce((s, t) => s + t.durationMs, 0) / list.length;
        return durationMs > avg * this.config.anomalyMultiplier;
    }

    getCategoryStats(playerId, category) {
        const list = this._tasksFor(playerId, category);
        if (list.length === 0) return { count: 0, totalMs: 0, avgMs: 0, minMs: 0, maxMs: 0 };
        const total = list.reduce((s, t) => s + t.durationMs, 0);
        const min = list.reduce((m, t) => t.durationMs < m ? t.durationMs : m, list[0].durationMs);
        const max = list.reduce((m, t) => t.durationMs > m ? t.durationMs : m, list[0].durationMs);
        return {
            count: list.length,
            totalMs: total,
            avgMs: total / list.length,
            minMs: min,
            maxMs: max,
        };
    }

    detectAnomalies(playerId, category) {
        const list = this._tasksFor(playerId, category);
        if (list.length < 3) return [];
        const avg = list.reduce((s, t) => s + t.durationMs, 0) / list.length;
        const threshold = avg * this.config.anomalyMultiplier;
        return list.filter(t => t.durationMs > threshold).map(t => ({
            taskId: t.id,
            durationMs: t.durationMs,
            thresholdMs: threshold,
            overshootFactor: threshold > 0 ? t.durationMs / threshold : 0,
        }));
    }

    efficiencyScore(playerId) {
        let total = 0, count = 0;
        for (const c of TASK_CATEGORIES) {
            const s = this.getCategoryStats(playerId, c);
            if (s.count > 0) { total += s.avgMs; count++; }
        }
        if (count === 0) return 1.0;
        const overallAvg = total / count;
        // Lower time = higher efficiency, normalize to 1.0 at 0ms, 0.5 at 60s, 0 at 600s+
        const minutes = overallAvg / 60000;
        return Math.max(0, 1 - minutes / 10);
    }

    getTask(taskId) { return this.tasks.get(taskId) || null; }

    report(playerId) {
        const byCategory = {};
        let totalCount = 0, totalMs = 0;
        for (const c of TASK_CATEGORIES) {
            const s = this.getCategoryStats(playerId, c);
            byCategory[c] = { ...s, anomalies: this.detectAnomalies(playerId, c) };
            totalCount += s.count;
            totalMs += s.totalMs;
        }
        return {
            playerId, totalCount, totalMs,
            avgPerTaskMs: totalCount > 0 ? totalMs / totalCount : 0,
            byCategory,
            efficiencyScore: this.efficiencyScore(playerId),
        };
    }

    reset() {
        this.tasks.clear();
        this.playerTasks.clear();
        this.stats = { totalTracked: 0, totalAnomalies: 0 };
    }
}
