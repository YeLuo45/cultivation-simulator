/**
 * AdventureJournal.js - 冒险日志系统
 * V337 Iteration 7/9 Round 6
 */
export class AdventureJournal {
    constructor(config = {}) {
        this.config = { maxEntries: config.maxEntries || 500, ...config };
        this.entries = new Map();
        this.journals = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEntries: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEntry', (ctx) => this.getEntry(ctx.entryId));
        this.registerTool('listEntries', () => Array.from(this.entries.values()).map(e => ({...e})));
    }

    createJournal(data) {
        const id = data.id || `jrn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const journal = { journalId: id, name: data.name || 'Journal', adventurerId: data.adventurerId, entries: [], createdAt: Date.now() };
        this.journals.set(id, journal);
        this._triggerHook('journalCreated', { journalId: id });
        return { success: true, journal };
    }

    getJournal(id) { return this.journals.get(id) ? { ...this.journals.get(id) } : null; }
    listJournals() { return Array.from(this.journals.values()).map(j => ({ ...j })); }
    listJournalsByAdventurer(adventurerId) { return Array.from(this.journals.values()).filter(j => j.adventurerId === adventurerId).map(j => ({ ...j })); }

    addEntry(journalId, data) {
        const journal = this.journals.get(journalId);
        if (!journal) return { success: false, error: 'JOURNAL_NOT_FOUND' };
        const id = data.id || `ent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const entry = { entryId: id, journalId, type: data.type || 'note', title: data.title || 'Untitled', content: data.content || '', tags: data.tags || [], createdAt: Date.now() };
        this.entries.set(id, entry);
        journal.entries.push(id);
        this.stats.totalEntries++;
        this._triggerHook('entryAdded', { journalId, entryId: id });
        return { success: true, entry };
    }

    getEntry(id) { return this.entries.get(id) ? { ...this.entries.get(id) } : null; }
    listEntries(journalId) {
        if (journalId) return Array.from(this.entries.values()).filter(e => e.journalId === journalId).map(e => ({ ...e }));
        return Array.from(this.entries.values()).map(e => ({ ...e }));
    }
    listEntriesByTag(tag) { return Array.from(this.entries.values()).filter(e => e.tags.includes(tag)).map(e => ({ ...e })); }
    listEntriesByType(type) { return Array.from(this.entries.values()).filter(e => e.type === type).map(e => ({ ...e })); }

    updateEntry(entryId, updates) {
        const entry = this.entries.get(entryId);
        if (!entry) return { success: false, error: 'ENTRY_NOT_FOUND' };
        if (updates.title !== undefined) entry.title = updates.title;
        if (updates.content !== undefined) entry.content = updates.content;
        if (updates.tags !== undefined) entry.tags = updates.tags;
        entry.updatedAt = Date.now();
        this._triggerHook('entryUpdated', { entryId });
        return { success: true, entry: { ...entry } };
    }

    deleteEntry(entryId) {
        const entry = this.entries.get(entryId);
        if (!entry) return { success: false, error: 'ENTRY_NOT_FOUND' };
        const journal = this.journals.get(entry.journalId);
        if (journal) journal.entries = journal.entries.filter(id => id !== entryId);
        this.entries.delete(entryId);
        this._triggerHook('entryDeleted', { entryId });
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
        if (this.stats.totalEntries < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxEntries += 100;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { entries: Array.from(this.entries.entries()), journals: Array.from(this.journals.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.entries) this.entries = new Map(data.entries);
        if (data.journals) this.journals = new Map(data.journals);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, entryCount: this.entries.size, journalCount: this.journals.size }; }
}