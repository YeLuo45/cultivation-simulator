/**
 * SectChronicle.js - 宗门编年史
 * V470 Iteration 2/15 Round 18
 */
export class SectChronicle {
    constructor(config = {}) {
        this.config = { maxEntries: config.maxEntries || 300, baseImportance: config.baseImportance || 10, ...config };
        this.entries = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEntries: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEntry', (ctx) => this.getEntry(ctx.entryId));
        this.registerTool('recordEntry', (ctx) => this.recordEntry(ctx));
    }

    recordEntry(data) {
        const id = data.entryId || `chr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const entry = { entryId: id, sectId: data.sectId, year: data.year || 0, event: data.event || '', importance: data.importance || this.config.baseImportance, witnesses: Array.isArray(data.witnesses) ? [...data.witnesses] : [], status: 'draft', createdAt: Date.now() };
        this.entries.set(id, entry);
        this.stats.totalEntries++;
        this._triggerHook('entryRecorded', { entryId: id });
        return { success: true, entry };
    }

    getEntry(id) { return this.entries.get(id) ? { ...this.entries.get(id) } : null; }
    listEntries() { return Array.from(this.entries.values()).map(e => ({ ...e })); }
    listBySect(sectId) { return Array.from(this.entries.values()).filter(e => e.sectId === sectId).map(e => ({ ...e })); }
    listByImportance(min) { return Array.from(this.entries.values()).filter(e => e.importance >= min).map(e => ({ ...e })); }

    addWitness(entryId, witness) {
        const entry = this.entries.get(entryId);
        if (!entry) return { success: false, error: 'ENTRY_NOT_FOUND' };
        entry.witnesses.push(witness);
        this._triggerHook('witnessAdded', { entryId, witness });
        return { success: true };
    }

    increaseImportance(entryId, amount = 5) {
        const entry = this.entries.get(entryId);
        if (!entry) return { success: false, error: 'ENTRY_NOT_FOUND' };
        entry.importance += amount;
        this._triggerHook('importanceIncreased', { entryId, newImportance: entry.importance });
        return { success: true };
    }

    archiveEntry(entryId) {
        const entry = this.entries.get(entryId);
        if (!entry) return { success: false, error: 'ENTRY_NOT_FOUND' };
        entry.status = 'archived';
        this._triggerHook('entryArchived', { entryId });
        return { success: true };
    }

    calculateHistoricalValue(entryId) {
        const entry = this.entries.get(entryId);
        if (!entry) return 0;
        return entry.importance * 10 + entry.witnesses.length * 5 + entry.year / 100;
    }

    recordAll(entryId) {
        const entry = this.entries.get(entryId);
        if (!entry) return { success: false, error: 'ENTRY_NOT_FOUND' };
        entry.status = 'recorded';
        return { success: true };
    }

    listArchived() { return Array.from(this.entries.values()).filter(e => e.status === 'archived').map(e => ({ ...e })); }

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
        this.config.maxEntries += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { entries: Array.from(this.entries.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.entries) this.entries = new Map(data.entries);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, entryCount: this.entries.size }; }
}
