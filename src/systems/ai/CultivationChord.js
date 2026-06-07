/**
 * CultivationChord.js - 修真和弦系统
 * V789 Iteration 22/30 Round 31
 */
export class CultivationChord {
    constructor(config = {}) {
        this.config = { maxChords: config.maxChords || 20, baseResonance: config.baseResonance || 20, ...config };
        this.chords = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalChords: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getChord', (ctx) => this.getChord(ctx.chordId));
        this.registerTool('recruitChord', (ctx) => this.recruitChord(ctx));
    }

    recruitChord(data) {
        if (this.chords.size >= this.config.maxChords) {
            return { success: false, error: 'MAX_CHORDS_REACHED' };
        }
        const id = data.chordId || `chord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const chord = {
            chordId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed-chord',
            type: data.type || 'major',
            resonance: data.resonance !== undefined ? data.resonance : this.config.baseResonance,
            notes: data.notes || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.chords.set(id, chord);
        this.stats.totalChords++;
        this._triggerHook('chordRecruited', { chordId: id, masterId: chord.masterId });
        return { success: true, chord };
    }

    getChord(id) { return this.chords.get(id) ? { ...this.chords.get(id) } : null; }
    listChords() { return Array.from(this.chords.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.chords.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.chords.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addNote(chordId, note) {
        const chord = this.chords.get(chordId);
        if (!chord) return { success: false, error: 'CHORD_NOT_FOUND' };
        chord.notes.push(note);
        this._triggerHook('noteAdded', { chordId, note, notes: chord.notes.length });
        return { success: true };
    }

    raiseResonance(chordId, amount = 5) {
        const chord = this.chords.get(chordId);
        if (!chord) return { success: false, error: 'CHORD_NOT_FOUND' };
        chord.resonance += amount;
        this._triggerHook('resonanceRaised', { chordId, newResonance: chord.resonance });
        return { success: true };
    }

    levelUpChord(chordId) {
        const chord = this.chords.get(chordId);
        if (!chord) return { success: false, error: 'CHORD_NOT_FOUND' };
        chord.level++;
        this._triggerHook('chordLeveledUp', { chordId, newLevel: chord.level });
        return { success: true };
    }

    legendChord(chordId) {
        const chord = this.chords.get(chordId);
        if (!chord) return { success: false, error: 'CHORD_NOT_FOUND' };
        chord.status = 'legendary';
        this._triggerHook('chordLegendized', { chordId });
        return { success: true };
    }

    calculateChordValue(chordId) {
        const chord = this.chords.get(chordId);
        if (!chord) return 0;
        return chord.level * 100 + chord.resonance * 2 + chord.notes.length * 30;
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
        if (this.stats.totalChords < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxChords += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { chords: Array.from(this.chords.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.chords) this.chords = new Map(data.chords);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, chordCount: this.chords.size }; }
}
