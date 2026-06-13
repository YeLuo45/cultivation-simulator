/**
 * CultivationPulse.js - 修真脉动系统
 * V745 Iteration 8/30 Round 30
 */
export class CultivationPulse {
    constructor(config = {}) {
        this.config = { maxPulses: config.maxPulses || 20, baseRhythm: config.baseRhythm || 20, ...config };
        this.pulses = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPulses: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPulse', (ctx) => this.getPulse(ctx.pulseId));
        this.registerTool('recruitPulse', (ctx) => this.recruitPulse(ctx));
    }

    recruitPulse(data) {
        const id = data.id || `pls_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const pulse = { pulseId: id, masterId: data.masterId, name: data.name || '无名脉动', type: data.type || 'heart', rhythm: data.rhythm || this.config.baseRhythm, beats: data.beats || [], level: 1, status: 'novice', createdAt: Date.now() };
        this.pulses.set(id, pulse);
        this.stats.totalPulses++;
        this._triggerHook('pulseRecruited', { pulseId: id });
        return { success: true, pulse };
    }

    getPulse(id) { return this.pulses.get(id) ? { ...this.pulses.get(id) } : null; }
    listPulses() { return Array.from(this.pulses.values()).map(p => ({ ...p })); }
    listByMaster(masterId) { return Array.from(this.pulses.values()).filter(p => p.masterId === masterId).map(p => ({ ...p })); }
    listLegendary() { return Array.from(this.pulses.values()).filter(p => p.status === 'legendary').map(p => ({ ...p })); }

    addBeat(pulseId, beat) {
        const pulse = this.pulses.get(pulseId);
        if (!pulse) return { success: false, error: 'PULSE_NOT_FOUND' };
        pulse.beats.push(beat);
        this._triggerHook('beatAdded', { pulseId, beat });
        return { success: true };
    }

    raiseRhythm(pulseId, amount = 5) {
        const pulse = this.pulses.get(pulseId);
        if (!pulse) return { success: false, error: 'PULSE_NOT_FOUND' };
        pulse.rhythm += amount;
        this._triggerHook('rhythmRaised', { pulseId, newRhythm: pulse.rhythm });
        return { success: true };
    }

    levelUpPulse(pulseId) {
        const pulse = this.pulses.get(pulseId);
        if (!pulse) return { success: false, error: 'PULSE_NOT_FOUND' };
        pulse.level++;
        this._triggerHook('pulseLeveledUp', { pulseId, newLevel: pulse.level });
        return { success: true };
    }

    legendPulse(pulseId) {
        const pulse = this.pulses.get(pulseId);
        if (!pulse) return { success: false, error: 'PULSE_NOT_FOUND' };
        pulse.status = 'legendary';
        this._triggerHook('pulseLegendized', { pulseId });
        return { success: true };
    }

    calculatePulseValue(pulseId) {
        const pulse = this.pulses.get(pulseId);
        if (!pulse) return 0;
        return pulse.level * 100 + pulse.rhythm * 2 + pulse.beats.length * 30;
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
        if (this.stats.totalPulses < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPulses += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { pulses: Array.from(this.pulses.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.pulses) this.pulses = new Map(data.pulses);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, pulseCount: this.pulses.size }; }
}
