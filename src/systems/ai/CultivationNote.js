/**
 * CultivationNote.js - 修真音符系统
 * V788 Iteration 21/30 Round 31
 */
export class CultivationNote {
    constructor(config = {}) {
        this.config = { maxNotes: config.maxNotes || 20, baseClarity: config.baseClarity || 20, ...config };
        this.notes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalNotes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getNote', (ctx) => this.getNote(ctx.noteId));
        this.registerTool('recruitNote', (ctx) => this.recruitNote(ctx));
    }

    recruitNote(data) {
        if (this.notes.size >= this.config.maxNotes) {
            return { success: false, error: 'MAX_NOTES_REACHED' };
        }
        const id = data.noteId || `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const note = {
            noteId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed-note',
            type: data.type || 'do',
            clarity: data.clarity !== undefined ? data.clarity : this.config.baseClarity,
            tones: data.tones || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.notes.set(id, note);
        this.stats.totalNotes++;
        this._triggerHook('noteRecruited', { noteId: id, masterId: note.masterId });
        return { success: true, note };
    }

    getNote(id) { return this.notes.get(id) ? { ...this.notes.get(id) } : null; }
    listNotes() { return Array.from(this.notes.values()).map(n => ({ ...n })); }
    listByMaster(masterId) { return Array.from(this.notes.values()).filter(n => n.masterId === masterId).map(n => ({ ...n })); }
    listLegendary() { return Array.from(this.notes.values()).filter(n => n.status === 'legendary').map(n => ({ ...n })); }

    addTone(noteId, tone) {
        const note = this.notes.get(noteId);
        if (!note) return { success: false, error: 'NOTE_NOT_FOUND' };
        note.tones.push(tone);
        this._triggerHook('toneAdded', { noteId, tone, tones: note.tones.length });
        return { success: true };
    }

    raiseClarity(noteId, amount = 5) {
        const note = this.notes.get(noteId);
        if (!note) return { success: false, error: 'NOTE_NOT_FOUND' };
        note.clarity += amount;
        this._triggerHook('clarityRaised', { noteId, newClarity: note.clarity });
        return { success: true };
    }

    levelUpNote(noteId) {
        const note = this.notes.get(noteId);
        if (!note) return { success: false, error: 'NOTE_NOT_FOUND' };
        note.level++;
        this._triggerHook('noteLeveledUp', { noteId, newLevel: note.level });
        return { success: true };
    }

    legendNote(noteId) {
        const note = this.notes.get(noteId);
        if (!note) return { success: false, error: 'NOTE_NOT_FOUND' };
        note.status = 'legendary';
        this._triggerHook('noteLegendized', { noteId });
        return { success: true };
    }

    calculateNoteValue(noteId) {
        const note = this.notes.get(noteId);
        if (!note) return 0;
        return note.level * 100 + note.clarity * 2 + note.tones.length * 30;
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
        if (this.stats.totalNotes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxNotes += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { notes: Array.from(this.notes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.notes) this.notes = new Map(data.notes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, noteCount: this.notes.size }; }
}
