/**
 * CultivationPitch.js - 修真音高系统
 * V791 Iteration 24/30 Round 31
 */
export class CultivationPitch {
    constructor(config = {}) {
        this.config = { maxPitches: config.maxPitches || 20, baseAltitude: config.baseAltitude || 20, ...config };
        this.pitches = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPitches: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPitch', (ctx) => this.getPitch(ctx.pitchId));
        this.registerTool('recruitPitch', (ctx) => this.recruitPitch(ctx));
    }

    recruitPitch(data) {
        const id = data.pitchId || `ptc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const pitch = {
            pitchId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Pitch',
            type: data.type || 'middle',
            altitude: data.altitude || this.config.baseAltitude,
            harmonics: data.harmonics || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.pitches.set(id, pitch);
        this.stats.totalPitches++;
        this._triggerHook('pitchRecruited', { pitchId: id });
        return { success: true, pitch };
    }

    getPitch(id) { return this.pitches.get(id) ? { ...this.pitches.get(id) } : null; }
    listPitches() { return Array.from(this.pitches.values()).map(p => ({ ...p })); }
    listByMaster(masterId) { return Array.from(this.pitches.values()).filter(p => p.masterId === masterId).map(p => ({ ...p })); }
    listLegendary() { return Array.from(this.pitches.values()).filter(p => p.status === 'legendary').map(p => ({ ...p })); }

    addHarmonic(pitchId, harmonic) {
        const pitch = this.pitches.get(pitchId);
        if (!pitch) return { success: false, error: 'PITCH_NOT_FOUND' };
        pitch.harmonics.push(harmonic);
        this._triggerHook('harmonicAdded', { pitchId, harmonic });
        return { success: true };
    }

    raiseAltitude(pitchId, amount = 5) {
        const pitch = this.pitches.get(pitchId);
        if (!pitch) return { success: false, error: 'PITCH_NOT_FOUND' };
        pitch.altitude += amount;
        this._triggerHook('altitudeRaised', { pitchId, newAltitude: pitch.altitude });
        return { success: true };
    }

    levelUpPitch(pitchId) {
        const pitch = this.pitches.get(pitchId);
        if (!pitch) return { success: false, error: 'PITCH_NOT_FOUND' };
        pitch.level++;
        this._triggerHook('pitchLeveledUp', { pitchId, newLevel: pitch.level });
        return { success: true };
    }

    legendPitch(pitchId) {
        const pitch = this.pitches.get(pitchId);
        if (!pitch) return { success: false, error: 'PITCH_NOT_FOUND' };
        pitch.status = 'legendary';
        this._triggerHook('pitchLegendized', { pitchId });
        return { success: true };
    }

    calculatePitchValue(pitchId) {
        const pitch = this.pitches.get(pitchId);
        if (!pitch) return 0;
        return pitch.level * 100 + pitch.altitude * 2 + pitch.harmonics.length * 30;
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
        if (this.stats.totalPitches < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPitches += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { pitches: Array.from(this.pitches.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.pitches) this.pitches = new Map(data.pitches);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, pitchCount: this.pitches.size }; }
}
