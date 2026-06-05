/**
 * DayNightCycle.js - 昼夜循环
 * V354 Iteration 6/9 Round 8
 */
export class DayNightCycle {
    constructor(config = {}) {
        this.config = { dayLength: config.dayLength || 24000, startPhase: config.startPhase || 'day', ...config };
        this.currentTime = 0;
        this.phase = this.config.startPhase;
        this.phaseLog = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTransitions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPhase', () => this.phase);
        this.registerTool('advance', (ctx) => this.advance(ctx.amount || 1000));
    }

    listPhases() { return ['day', 'night', 'dawn', 'dusk']; }
    getPhase() { return this.phase; }
    getTime() { return this.currentTime; }

    advance(amount) {
        this.currentTime += amount;
        const dayProgress = this.currentTime % this.config.dayLength;
        this.phase = this._calculatePhase(dayProgress);
        if (this.currentTime > 0 && this.currentTime % this.config.dayLength === 0) {
            const logId = `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            this.phaseLog.set(logId, { logId, phase: this.phase, time: this.currentTime });
            this.stats.totalTransitions++;
            this._triggerHook('phaseChanged', { phase: this.phase });
        }
        return { success: true, phase: this.phase, time: this.currentTime };
    }

    _calculatePhase(progress) {
        const ratio = progress / this.config.dayLength;
        if (ratio < 0.25) return 'dawn';
        if (ratio < 0.5) return 'day';
        if (ratio < 0.75) return 'dusk';
        return 'night';
    }

    setTime(time) {
        this.currentTime = time;
        this.phase = this._calculatePhase(time % this.config.dayLength);
        return { success: true, phase: this.phase };
    }

    getPhaseEffect(phase) {
        const effects = { day: { visibility: 1.0 }, night: { stealth: 0.5, vision: -0.3 }, dawn: { transition: 0.5 }, dusk: { transition: 0.5 } };
        return effects[phase] || {};
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
        if (this.stats.totalTransitions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.dayLength = Math.max(1000, this.config.dayLength - 1000);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { currentTime: this.currentTime, phase: this.phase, phaseLog: Array.from(this.phaseLog.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.currentTime !== undefined) this.currentTime = data.currentTime;
        if (data.phase) this.phase = data.phase;
        if (data.phaseLog) this.phaseLog = new Map(data.phaseLog);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, currentTime: this.currentTime, phase: this.phase }; }
}