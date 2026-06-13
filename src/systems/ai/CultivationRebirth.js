/**
 * CultivationRebirth.js - 修真轮回
 * V597 Iteration 20/20 FINAL Round 24
 */
export class CultivationRebirth {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxCycles: config.maxCycles || 100, baseMemory: config.baseMemory || 30, ...config };
        this.cycles = new Map();
        this.memories = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCycles: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCycle', (ctx) => this.getCycle(ctx.cycleId));
        this.registerTool('getMemories', (ctx) => this.getMemories(ctx.cycleId));
    }

    startCycle(data) {
        const id = data.id || `cyc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cycle = { cycleId: id, soulId: data.soulId || 'unknown', name: data.name || 'Unnamed Cycle', type: data.type || 'natural', memory: data.memory || this.config.baseMemory, lessons: data.lessons || [], level: data.level || 1, status: 'incarnating', startedAt: Date.now(), lastRefresh: Date.now() };
        this.cycles.set(id, cycle);
        this.memories.set(id, { identity: 50, experience: 60, wisdom: 75 });
        this.stats.totalCycles++;
        this._triggerHook('cycleStarted', { cycleId: id });
        return { success: true, cycle };
    }

    getCycle(id) { return this.cycles.get(id) ? { ...this.cycles.get(id) } : null; }
    listCycles() { return Array.from(this.cycles.values()).map(c => ({ ...c })); }
    listBySoul(soulId) { return Array.from(this.cycles.values()).filter(c => c.soulId === soulId).map(c => ({ ...c })); }
    listByType(type) { return Array.from(this.cycles.values()).filter(c => c.type === type).map(c => ({ ...c })); }
    listByMemory(min) { return Array.from(this.cycles.values()).filter(c => c.memory >= min).map(c => ({ ...c })); }
    listTop(n = 10) { return [...this.listCycles()].sort((a, b) => b.memory - a.memory).slice(0, n); }

    setMemories(cycleId, memories) {
        const current = this.memories.get(cycleId);
        if (!current) return { success: false, error: 'CYCLE_NOT_FOUND' };
        this.memories.set(cycleId, { ...current, ...memories, updatedAt: Date.now() });
        return { success: true };
    }

    getMemories(cycleId) { return this.memories.get(cycleId) ? { ...this.memories.get(cycleId) } : null; }

    refreshCycle(cycleId) {
        const cycle = this.cycles.get(cycleId);
        if (!cycle) return { success: false, error: 'CYCLE_NOT_FOUND' };
        cycle.lastRefresh = Date.now();
        this._triggerHook('cycleRefreshed', { cycleId });
        return { success: true };
    }

    deepenMemory(cycleId, amount = 10) {
        const cycle = this.cycles.get(cycleId);
        if (!cycle) return { success: false, error: 'CYCLE_NOT_FOUND' };
        cycle.memory += amount;
        this._triggerHook('memoryDeepened', { cycleId });
        return { success: true };
    }

    addLesson(cycleId, lesson) {
        const cycle = this.cycles.get(cycleId);
        if (!cycle) return { success: false, error: 'CYCLE_NOT_FOUND' };
        cycle.lessons.push(lesson);
        this._triggerHook('lessonAdded', { cycleId });
        return { success: true };
    }

    promoteCycle(cycleId) {
        const cycle = this.cycles.get(cycleId);
        if (!cycle) return { success: false, error: 'CYCLE_NOT_FOUND' };
        cycle.level++;
        this._triggerHook('cyclePromoted', { cycleId });
        return { success: true };
    }

    reincarnate(cycleId) {
        const cycle = this.cycles.get(cycleId);
        if (!cycle) return { success: false, error: 'CYCLE_NOT_FOUND' };
        cycle.status = 'reincarnated';
        this._triggerHook('cycleReincarnated', { cycleId });
        return { success: true };
    }

    ascendCycle(cycleId) {
        const cycle = this.cycles.get(cycleId);
        if (!cycle) return { success: false, error: 'CYCLE_NOT_FOUND' };
        cycle.status = 'ascended';
        this._triggerHook('cycleAscended', { cycleId });
        return { success: true };
    }

    mergeCycle(cycleId) {
        const cycle = this.cycles.get(cycleId);
        if (!cycle) return { success: false, error: 'CYCLE_NOT_FOUND' };
        cycle.status = 'merged';
        this._triggerHook('cycleMerged', { cycleId });
        return { success: true };
    }

    changeType(cycleId, newType) {
        const cycle = this.cycles.get(cycleId);
        if (!cycle) return { success: false, error: 'CYCLE_NOT_FOUND' };
        cycle.type = newType;
        this._triggerHook('typeChanged', { cycleId });
        return { success: true };
    }

    calculateRebirthValue(cycleId) {
        const cycle = this.cycles.get(cycleId);
        if (!cycle) return 0;
        return cycle.level * 100 + cycle.memory * 2 + cycle.lessons.length * 30;
    }

    deleteCycle(cycleId) {
        if (!this.cycles.has(cycleId)) return { success: false, error: 'CYCLE_NOT_FOUND' };
        this.cycles.delete(cycleId);
        this.memories.delete(cycleId);
        this._triggerHook('cycleDeleted', { cycleId });
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

    autoEvolve() {
        if (this.stats.totalCycles < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { cycles: Array.from(this.cycles.entries()), memories: Array.from(this.memories.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.cycles) this.cycles = new Map(data.cycles);
        if (data.memories) this.memories = new Map(data.memories);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cycleCount: this.cycles.size }; }
}