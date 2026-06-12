/**
 * CultivationDreamTimeLoop.js - 修真时间循环
 * V875 Iteration 9/30 Round 34
 */
export const TIME_RANGES = ['hour', 'day', 'week'];
export const MAX_REWIND_STEPS = 10;
export const BREAK_CONDITIONS = ['realization', 'intervention', 'sacrifice', 'revelation', 'transcendence'];

export class CultivationDreamTimeLoop {
    constructor(config = {}) {
        this.config = { maxLoops: config.maxLoops || 50, maxRewind: config.maxRewind || MAX_REWIND_STEPS, ...config };
        this.loops = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEntered: 0, totalBroken: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getLoop', (ctx) => this.getLoop(ctx.loopId));
        this.registerTool('listByRange', (ctx) => this.listByRange(ctx.loopRange));
    }

    enterTimeLoop(dreamId, loopRange) {
        if (!TIME_RANGES.includes(loopRange)) return { success: false, error: 'INVALID_RANGE' };
        const id = `loop_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const loop = {
            id, dreamId, loopRange,
            iterationCount: 1, rewoundSteps: 0,
            broken: false, brokenAt: null, breakCondition: null,
            enteredAt: Date.now()
        };
        this.loops.set(id, loop);
        this.stats.totalEntered++;
        this._triggerHook('loopEntered', { id, dreamId, loopRange });
        return { success: true, loop };
    }

    getLoop(id) { return this.loops.get(id) ? { ...this.loops.get(id) } : null; }
    listLoops() { return Array.from(this.loops.values()).map(l => ({ ...l })); }
    listByRange(loopRange) { return Array.from(this.loops.values()).filter(l => l.loopRange === loopRange).map(l => ({ ...l })); }
    listByDream(dreamId) { return Array.from(this.loops.values()).filter(l => l.dreamId === dreamId).map(l => ({ ...l })); }
    listBroken() { return Array.from(this.loops.values()).filter(l => l.broken).map(l => ({ ...l })); }
    listActive() { return Array.from(this.loops.values()).filter(l => !l.broken).map(l => ({ ...l })); }

    rewindTime(loopId, steps = 1) {
        const loop = this.loops.get(loopId);
        if (!loop) return { success: false, error: 'LOOP_NOT_FOUND' };
        if (loop.broken) return { success: false, error: 'LOOP_BROKEN' };
        const safeSteps = Math.max(0, Math.min(this.config.maxRewind, steps));
        loop.rewoundSteps = safeSteps;
        loop.iterationCount++;
        loop.lastRewind = Date.now();
        this._triggerHook('timeRewound', { loopId, steps: safeSteps });
        return { success: true, iterationCount: loop.iterationCount, rewoundSteps: loop.rewoundSteps };
    }

    breakLoop(loopId, condition) {
        const loop = this.loops.get(loopId);
        if (!loop) return { success: false, error: 'LOOP_NOT_FOUND' };
        if (loop.broken) return { success: false, error: 'ALREADY_BROKEN' };
        const validCondition = BREAK_CONDITIONS.includes(condition) ? condition : 'realization';
        loop.broken = true;
        loop.brokenAt = Date.now();
        loop.breakCondition = validCondition;
        this.stats.totalBroken++;
        this._triggerHook('loopBroken', { loopId, condition: validCondition });
        return { success: true, condition: validCondition };
    }

    incrementIteration(loopId) {
        const loop = this.loops.get(loopId);
        if (!loop) return { success: false, error: 'LOOP_NOT_FOUND' };
        loop.iterationCount++;
        return { success: true, iterationCount: loop.iterationCount };
    }

    getMaxRewind() { return Math.min(this.config.maxRewind, MAX_REWIND_STEPS); }

    deleteLoop(loopId) {
        if (!this.loops.has(loopId)) return { success: false, error: 'LOOP_NOT_FOUND' };
        this.loops.delete(loopId);
        this._triggerHook('loopDeleted', { loopId });
        return { success: true };
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

    toJSON() { return { loops: Array.from(this.loops.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.loops) this.loops = new Map(data.loops);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, loopCount: this.loops.size }; }
}
