/**
 * CultivationLibrary.js - 修真图书馆系统
 * V716 Iteration 9/30 Round 29
 */
export class CultivationLibrary {
    constructor(config = {}) {
        this.config = { maxLibraries: config.maxLibraries || 20, baseArchives: config.baseArchives || 20, ...config };
        this.libraries = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalLibraries: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getLibrary', (ctx) => this.getLibrary(ctx.libraryId));
        this.registerTool('recruitLibrary', (ctx) => this.recruitLibrary(ctx));
    }

    recruitLibrary(data) {
        const id = data.libraryId || `lib_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const library = {
            libraryId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Library',
            type: data.type || 'ancient',
            archives: data.archives || this.config.baseArchives,
            tomes: data.tomes || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.libraries.set(id, library);
        this.stats.totalLibraries++;
        this._triggerHook('libraryRecruited', { libraryId: id });
        return { success: true, library };
    }

    getLibrary(id) { return this.libraries.get(id) ? { ...this.libraries.get(id) } : null; }
    listLibraries() { return Array.from(this.libraries.values()).map(b => ({ ...b })); }
    listByMaster(masterId) { return Array.from(this.libraries.values()).filter(b => b.masterId === masterId).map(b => ({ ...b })); }
    listLegendary() { return Array.from(this.libraries.values()).filter(b => b.status === 'legendary').map(b => ({ ...b })); }

    addTome(libraryId, tome) {
        const library = this.libraries.get(libraryId);
        if (!library) return { success: false, error: 'LIBRARY_NOT_FOUND' };
        library.tomes.push(tome);
        this._triggerHook('tomeAdded', { libraryId, tome });
        return { success: true };
    }

    raiseArchives(libraryId, amount = 5) {
        const library = this.libraries.get(libraryId);
        if (!library) return { success: false, error: 'LIBRARY_NOT_FOUND' };
        library.archives += amount;
        this._triggerHook('archivesRaised', { libraryId, newArchives: library.archives });
        return { success: true };
    }

    levelUpLibrary(libraryId) {
        const library = this.libraries.get(libraryId);
        if (!library) return { success: false, error: 'LIBRARY_NOT_FOUND' };
        library.level++;
        this._triggerHook('libraryLeveledUp', { libraryId, newLevel: library.level });
        return { success: true };
    }

    legendLibrary(libraryId) {
        const library = this.libraries.get(libraryId);
        if (!library) return { success: false, error: 'LIBRARY_NOT_FOUND' };
        library.status = 'legendary';
        this._triggerHook('libraryLegendized', { libraryId });
        return { success: true };
    }

    calculateLibraryValue(libraryId) {
        const library = this.libraries.get(libraryId);
        if (!library) return 0;
        return library.level * 100 + library.archives * 2 + library.tomes.length * 30;
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
        if (this.stats.totalLibraries < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxLibraries += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { libraries: Array.from(this.libraries.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.libraries) this.libraries = new Map(data.libraries);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, libraryCount: this.libraries.size }; }
}
