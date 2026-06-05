/**
 * TimeFlowEngine.js - 时间流动引擎
 * V349 Iteration 1/9 Round 8 - Time Flow Engine
 *
 * 融合6大设计系统:
 * - generic-agent: 时间自循环
 * - chatdev: 时间协调
 * - nanobot: 时间节点mesh
 * - claude-code: 时间分析工具
 * - thunderbolt: 时间快照持久化
 * - ruflo: 时间Hook事件
 */

export class TimeFlowEngine {
    constructor(config = {}) {
        this.config = { baseTime: config.baseTime || Date.now(), timeScale: config.timeScale || 1, maxTimers: config.maxTimers || 100, ...config };
        this.currentTime = this.config.baseTime;
        this.timers = new Map();
        this.events = new Map();
        this.history = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAdvances: 0, totalTimers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCurrentTime', () => this.currentTime);
        this.registerTool('advance', (ctx) => this.advance(ctx.amount || 1000));
    }

    advance(amount) {
        this.currentTime += amount * this.config.timeScale;
        this.stats.totalAdvances++;
        this._triggerHook('timeAdvanced', { currentTime: this.currentTime, amount });
        const triggered = this._processTimers();
        return { success: true, currentTime: this.currentTime, triggered };
    }

    _processTimers() {
        const triggered = [];
        for (const [id, timer] of this.timers) {
            if (timer.active && timer.fireTime <= this.currentTime) {
                timer.active = false;
                this._triggerHook('timerFired', { timerId: id, eventId: timer.eventId });
                triggered.push({ timerId: id, eventId: timer.eventId });
            }
        }
        return triggered;
    }

    setTime(time) {
        this.currentTime = time;
        this._triggerHook('timeSet', { currentTime: time });
        return { success: true, currentTime: this.currentTime };
    }

    createEvent(data) {
        const id = data.id || `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const event = { eventId: id, name: data.name || 'Event', description: data.description || '', startTime: data.startTime || this.currentTime, duration: data.duration || 1000, createdAt: Date.now() };
        this.events.set(id, event);
        this._triggerHook('eventCreated', { eventId: id });
        return { success: true, event };
    }

    getEvent(id) { return this.events.get(id) ? { ...this.events.get(id) } : null; }
    listEvents() { return Array.from(this.events.values()).map(e => ({ ...e })); }
    listActiveEvents() { return Array.from(this.events.values()).filter(e => e.startTime <= this.currentTime && e.startTime + e.duration > this.currentTime).map(e => ({ ...e })); }

    scheduleTimer(eventId, fireTime) {
        if (this.timers.size >= this.config.maxTimers) return { success: false, error: 'MAX_TIMERS_REACHED' };
        const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const timer = { timerId: id, eventId, fireTime, active: true, scheduledAt: this.currentTime };
        this.timers.set(id, timer);
        this.stats.totalTimers++;
        this._triggerHook('timerScheduled', { timerId: id, eventId });
        return { success: true, timer };
    }

    cancelTimer(timerId) {
        const timer = this.timers.get(timerId);
        if (!timer) return { success: false, error: 'TIMER_NOT_FOUND' };
        timer.active = false;
        this._triggerHook('timerCancelled', { timerId });
        return { success: true };
    }

    getTimer(id) { return this.timers.get(id) ? { ...this.timers.get(id) } : null; }
    listTimers() { return Array.from(this.timers.values()).map(t => ({ ...t })); }
    listActiveTimers() { return Array.from(this.timers.values()).filter(t => t.active).map(t => ({ ...t })); }

    snapshot() {
        const snapshot = { time: this.currentTime, events: this.listEvents(), timers: this.listTimers(), timestamp: Date.now() };
        this.history.set(`snap_${Date.now()}`, snapshot);
        this._triggerHook('snapshotTaken', { time: this.currentTime });
        return snapshot;
    }

    getHistory() { return Array.from(this.history.values()); }

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
        if (this.stats.totalAdvances < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.timeScale *= 1.2;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { currentTime: this.currentTime, timers: Array.from(this.timers.entries()), events: Array.from(this.events.entries()), history: Array.from(this.history.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (typeof data.currentTime === 'number') this.currentTime = data.currentTime;
        if (data.timers) this.timers = new Map(data.timers);
        if (data.events) this.events = new Map(data.events);
        if (data.history) this.history = new Map(data.history);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, currentTime: this.currentTime, timerCount: this.timers.size, eventCount: this.events.size }; }
}