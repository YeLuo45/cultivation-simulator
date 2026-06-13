/**
 * EventScheduler.js - 事件调度
 * V389 Iteration 5/9 Round 12
 */
export class EventScheduler {
    constructor(config = {}) {
        this.config = { maxTasks: config.maxTasks || 200, ...config };
        this.tasks = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTasks: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTask', (ctx) => this.getTask(ctx.taskId));
        this.registerTool('scheduleTask', (ctx) => this.scheduleTask(ctx));
    }

    scheduleTask(data) {
        const id = data.id || `tsk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const task = { taskId: id, name: data.name || 'Task', executeAt: data.executeAt || Date.now() + 1000, payload: data.payload || {}, status: 'pending', createdAt: Date.now() };
        this.tasks.set(id, task);
        this.stats.totalTasks++;
        this._triggerHook('taskScheduled', { taskId: id });
        return { success: true, task };
    }

    getTask(id) { return this.tasks.get(id) ? { ...this.tasks.get(id) } : null; }
    listTasks() { return Array.from(this.tasks.values()).map(t => ({ ...t })); }
    listPending() { return Array.from(this.tasks.values()).filter(t => t.status === 'pending').map(t => ({ ...t })); }
    listExecuted() { return Array.from(this.tasks.values()).filter(t => t.status === 'executed').map(t => ({ ...t })); }
    listDue(now) {
        const ts = now || Date.now();
        return Array.from(this.tasks.values()).filter(t => t.status === 'pending' && t.executeAt <= ts).map(t => ({ ...t }));
    }

    executeTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) return { success: false, error: 'TASK_NOT_FOUND' };
        if (task.status !== 'pending') return { success: false, error: 'TASK_NOT_PENDING' };
        task.status = 'executed';
        task.executedAt = Date.now();
        this._triggerHook('taskExecuted', { taskId });
        return { success: true, task };
    }

    cancelTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) return { success: false, error: 'TASK_NOT_FOUND' };
        task.status = 'cancelled';
        this._triggerHook('taskCancelled', { taskId });
        return { success: true };
    }

    executeDueTasks() {
        const dueTasks = this.listDue();
        let count = 0;
        for (const t of dueTasks) { this.executeTask(t.taskId); count++; }
        return { success: true, executed: count };
    }

    countByStatus() {
        const counts = { pending: 0, executed: 0, cancelled: 0 };
        for (const t of this.tasks.values()) {
            if (counts[t.status] !== undefined) counts[t.status]++;
        }
        return counts;
    }

    registerTool(name, handler) { this.tools.set(name, { name, handler }); }
    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try { return { success: true, result: tool.handler(context || {}) }; }
        catch (e) { return { success: false, error: e.message }; }
    }
    listTools() { return Array.from(this.tools.keys()); }

    registerHook(event, handler) {
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(handler);
        return () => { const arr = this.hooks.get(event); if (arr) { const idx = arr.indexOf(handler); if (idx >= 0) arr.splice(idx, 1); } };
    }
    _triggerHook(event, data) {
        const handlers = this.hooks.get(event);
        if (!handlers) return;
        for (const h of handlers) { try { h(data); } catch (e) {} }
    }

    autoEvolve() {
        if (this.stats.totalTasks < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTasks += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { tasks: Array.from(this.tasks.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.tasks) this.tasks = new Map(data.tasks);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, taskCount: this.tasks.size }; }
}