/**
 * CultivationCycle.js - 修真周期 (Cultivation Cycle system)
 * V581 Iteration 4/20 Round 24
 */
export class CultivationCycle {
    constructor(config = {}) {
        this.config = { maxCycles: config.maxCycles || 50, baseRhythm: config.baseRhythm || 20, ...config };
        this.cycles = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCycles: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCycle', (ctx) => this.getCycle(ctx.cycleId));
        this.registerTool('openCycle', (ctx) => this.openCycle(ctx));
    }

    openCycle(data) {
        const id = data.id || `cyc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cycle = {
            cycleId: id,
            observerId: data.observerId,
            name: data.name || 'Cultivation Cycle',
            type: data.type || 'daily',
            rhythm: data.rhythm || this.config.baseRhythm,
            phases: data.phases || [],
            level: 1,
            status: 'active',
            createdAt: Date.now()
        };
        this.cycles.set(id, cycle);
        this.stats.totalCycles++;
        this._triggerHook('cycleOpened', { cycleId: id });
        return { success: true, cycle };
    }

    getCycle(id) { return this.cycles.get(id) ? { ...this.cycles.get(id) } : null; }
    listCycles() { return Array.from(this.cycles.values()).map(c => ({ ...c, phases: [...c.phases] })); }
    listByObserver(observerId) { return Array.from(this.cycles.values()).filter(c => c.observerId === observerId).map(c => ({ ...c, phases: [...c.phases] })); }
    listEternal() { return Array.from(this.cycles.values()).filter(c => c.status === 'eternal').map(c => ({ ...c, phases: [...c.phases] })); }

    addPhase(cycleId, phase) {
        const cycle = this.cycles.get(cycleId);
        if (!cycle) return { success: false, error: 'CYCLE_NOT_FOUND' };
        const ph = typeof phase === 'string' ? { name: phase, timestamp: Date.now() } : { ...phase, timestamp: phase.timestamp || Date.now() };
        cycle.phases.push(ph);
        this._triggerHook('phaseAdded', { cycleId, phase: ph, phaseCount: cycle.phases.length });
        return { success: true, phase: ph };
    }

    increaseRhythm(cycleId, amount = 5) {
        const cycle = this.cycles.get(cycleId);
        if (!cycle) return { success: false, error: 'CYCLE_NOT_FOUND' };
        cycle.rhythm += amount;
        this._triggerHook('rhythmIncreased', { cycleId, amount, newRhythm: cycle.rhythm });
        return { success: true };
    }

    levelUpCycle(cycleId) {
        const cycle = this.cycles.get(cycleId);
        if (!cycle) return { success: false, error: 'CYCLE_NOT_FOUND' };
        cycle.level++;
        this._triggerHook('cycleLeveledUp', { cycleId, newLevel: cycle.level });
        return { success: true };
    }

    eternalizeCycle(cycleId) {
        const cycle = this.cycles.get(cycleId);
        if (!cycle) return { success: false, error: 'CYCLE_NOT_FOUND' };
        cycle.status = 'eternal';
        this._triggerHook('cycleEternalized', { cycleId });
        return { success: true };
    }

    calculateCycleValue(cycleId) {
        const cycle = this.cycles.get(cycleId);
        if (!cycle) return 0;
        return cycle.level * 100 + cycle.rhythm * 2 + cycle.phases.length * 30;
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
        this.config.maxCycles += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { cycles: Array.from(this.cycles.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.cycles) this.cycles = new Map(data.cycles);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cycleCount: this.cycles.size }; }
}
