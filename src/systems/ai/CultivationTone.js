/**
 * CultivationTone.js - 修真音色系统
 * V790 Iteration 23/30 Round 31
 */
export class CultivationTone {
    constructor(config = {}) {
        this.config = { maxTones: config.maxTones || 20, baseWarmth: config.baseWarmth || 20, ...config };
        this.tones = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTones: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTone', (ctx) => this.getTone(ctx.toneId));
        this.registerTool('recruitTone', (ctx) => this.recruitTone(ctx));
    }

    recruitTone(data) {
        const id = data.toneId || `tone_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const tone = {
            toneId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Tone',
            type: data.type || 'warm',
            warmth: data.warmth !== undefined ? data.warmth : this.config.baseWarmth,
            harmonics: data.harmonics || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.tones.set(id, tone);
        this.stats.totalTones++;
        this._triggerHook('toneRecruited', { toneId: id, masterId: tone.masterId });
        return { success: true, tone };
    }

    getTone(id) { return this.tones.get(id) ? { ...this.tones.get(id) } : null; }
    listTones() { return Array.from(this.tones.values()).map(t => ({ ...t })); }
    listByMaster(masterId) { return Array.from(this.tones.values()).filter(t => t.masterId === masterId).map(t => ({ ...t })); }
    listLegendary() { return Array.from(this.tones.values()).filter(t => t.status === 'legendary').map(t => ({ ...t })); }

    addHarmonic(toneId, harmonic) {
        const tone = this.tones.get(toneId);
        if (!tone) return { success: false, error: 'TONE_NOT_FOUND' };
        tone.harmonics.push(harmonic);
        this._triggerHook('harmonicAdded', { toneId, harmonic, totalHarmonics: tone.harmonics.length });
        return { success: true };
    }

    raiseWarmth(toneId, amount = 5) {
        const tone = this.tones.get(toneId);
        if (!tone) return { success: false, error: 'TONE_NOT_FOUND' };
        tone.warmth += amount;
        this._triggerHook('warmthRaised', { toneId, newWarmth: tone.warmth });
        return { success: true };
    }

    levelUpTone(toneId) {
        const tone = this.tones.get(toneId);
        if (!tone) return { success: false, error: 'TONE_NOT_FOUND' };
        tone.level++;
        this._triggerHook('toneLeveledUp', { toneId, newLevel: tone.level });
        return { success: true };
    }

    legendTone(toneId) {
        const tone = this.tones.get(toneId);
        if (!tone) return { success: false, error: 'TONE_NOT_FOUND' };
        tone.status = 'legendary';
        this._triggerHook('toneLegendized', { toneId });
        return { success: true };
    }

    calculateToneValue(toneId) {
        const tone = this.tones.get(toneId);
        if (!tone) return 0;
        return tone.level * 100 + tone.warmth * 2 + tone.harmonics.length * 30;
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
        if (this.stats.totalTones < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTones += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { tones: Array.from(this.tones.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.tones) this.tones = new Map(data.tones);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, toneCount: this.tones.size }; }
}
