/**
 * MusicCultivation.js - 音律修炼
 * V424 Iteration 1/15 Round 15 - Music Cultivation
 */
export class MusicCultivation {
    constructor(config = {}) {
        this.config = { maxCompositions: config.maxCompositions || 200, baseResonance: config.baseResonance || 20, ...config };
        this.compositions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCompositions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getComposition', (ctx) => this.getComposition(ctx.compositionId));
        this.registerTool('composeMusic', (ctx) => this.composeMusic(ctx));
    }

    composeMusic(data) {
        const id = data.id || `mus_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const composition = { compositionId: id, cultivatorId: data.cultivatorId, name: data.name || 'Untitled Melody', instrument: data.instrument || 'guzheng', tempo: data.tempo || 120, melody: data.melody || 50, resonance: data.resonance || this.config.baseResonance, mastery: 0, status: 'composed', composedAt: Date.now() };
        this.compositions.set(id, composition);
        this.stats.totalCompositions++;
        this._triggerHook('musicComposed', { compositionId: id });
        return { success: true, composition };
    }

    getComposition(id) { return this.compositions.get(id) ? { ...this.compositions.get(id) } : null; }
    listCompositions() { return Array.from(this.compositions.values()).map(c => ({ ...c })); }
    listByInstrument(instrument) { return Array.from(this.compositions.values()).filter(c => c.instrument === instrument).map(c => ({ ...c })); }
    listByCultivator(cultivatorId) { return Array.from(this.compositions.values()).filter(c => c.cultivatorId === cultivatorId).map(c => ({ ...c })); }

    practiceMusic(compositionId, amount = 5) {
        const composition = this.compositions.get(compositionId);
        if (!composition) return { success: false, error: 'COMPOSITION_NOT_FOUND' };
        composition.mastery += amount;
        this._triggerHook('musicPracticed', { compositionId, newMastery: composition.mastery });
        return { success: true };
    }

    tuneMusic(compositionId, newTempo) {
        const composition = this.compositions.get(compositionId);
        if (!composition) return { success: false, error: 'COMPOSITION_NOT_FOUND' };
        composition.tempo = newTempo;
        this._triggerHook('musicTuned', { compositionId, newTempo: composition.tempo });
        return { success: true };
    }

    performMusic(compositionId) {
        const composition = this.compositions.get(compositionId);
        if (!composition) return { success: false, error: 'COMPOSITION_NOT_FOUND' };
        composition.status = 'performed';
        this._triggerHook('musicPerformed', { compositionId });
        return { success: true };
    }

    calculateHarmony(compositionId) {
        const composition = this.compositions.get(compositionId);
        if (!composition) return 0;
        return composition.resonance * (1 + composition.mastery / 100) + composition.melody;
    }

    listHarmonic() { return this.listByResonance(50); }

    listByResonance(min) { return Array.from(this.compositions.values()).filter(c => c.resonance >= min).map(c => ({ ...c })); }

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
        if (this.stats.totalCompositions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCompositions += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { compositions: Array.from(this.compositions.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.compositions) this.compositions = new Map(data.compositions);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, compositionCount: this.compositions.size }; }
}
