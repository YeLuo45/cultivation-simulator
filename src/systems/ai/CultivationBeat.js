/**
 * CultivationBeat.js - 修真节拍系统
 * V787 Iteration 20/30 Round 31
 */
export class CultivationBeat {
    constructor(config = {}) {
        this.config = { maxBeats: config.maxBeats || 20, baseStrength: config.baseStrength || 20, ...config };
        this.beats = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBeats: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBeat', (ctx) => this.getBeat(ctx.beatId));
        this.registerTool('recruitBeat', (ctx) => this.recruitBeat(ctx));
    }

    recruitBeat(data) {
        const id = data.beatId || `bet_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const beat = {
            beatId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Beat',
            type: data.type || 'drum',
            strength: data.strength || this.config.baseStrength,
            pulses: data.pulses || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.beats.set(id, beat);
        this.stats.totalBeats++;
        this._triggerHook('beatRecruited', { beatId: id });
        return { success: true, beat };
    }

    getBeat(id) { return this.beats.get(id) ? { ...this.beats.get(id) } : null; }
    listBeats() { return Array.from(this.beats.values()).map(b => ({ ...b })); }
    listByMaster(masterId) { return Array.from(this.beats.values()).filter(b => b.masterId === masterId).map(b => ({ ...b })); }
    listLegendary() { return Array.from(this.beats.values()).filter(b => b.status === 'legendary').map(b => ({ ...b })); }

    addPulse(beatId, pulse) {
        const beat = this.beats.get(beatId);
        if (!beat) return { success: false, error: 'BEAT_NOT_FOUND' };
        beat.pulses.push(pulse);
        this._triggerHook('pulseAdded', { beatId, pulse });
        return { success: true };
    }

    raiseStrength(beatId, amount = 5) {
        const beat = this.beats.get(beatId);
        if (!beat) return { success: false, error: 'BEAT_NOT_FOUND' };
        beat.strength += amount;
        this._triggerHook('strengthRaised', { beatId, newStrength: beat.strength });
        return { success: true };
    }

    levelUpBeat(beatId) {
        const beat = this.beats.get(beatId);
        if (!beat) return { success: false, error: 'BEAT_NOT_FOUND' };
        beat.level++;
        this._triggerHook('beatLeveledUp', { beatId, newLevel: beat.level });
        return { success: true };
    }

    legendBeat(beatId) {
        const beat = this.beats.get(beatId);
        if (!beat) return { success: false, error: 'BEAT_NOT_FOUND' };
        beat.status = 'legendary';
        this._triggerHook('beatLegendized', { beatId });
        return { success: true };
    }

    calculateBeatValue(beatId) {
        const beat = this.beats.get(beatId);
        if (!beat) return 0;
        return beat.level * 100 + beat.strength * 2 + beat.pulses.length * 30;
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
        if (this.stats.totalBeats < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBeats += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { beats: Array.from(this.beats.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.beats) this.beats = new Map(data.beats);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, beatCount: this.beats.size }; }
}
