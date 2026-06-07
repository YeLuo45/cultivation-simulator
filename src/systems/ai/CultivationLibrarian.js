/**
 * CultivationLibrarian.js - 修真图书系统
 * V712 Iteration 5/30 Round 29
 */
export class CultivationLibrarian {
    constructor(config = {}) {
        this.config = { maxLibrarians: config.maxLibrarians || 20, baseKnowledge: config.baseKnowledge || 20, ...config };
        this.librarians = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalLibrarians: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getLibrarian', (ctx) => this.getLibrarian(ctx.librarianId));
        this.registerTool('recruitLibrarian', (ctx) => this.recruitLibrarian(ctx));
    }

    recruitLibrarian(data) {
        const id = data.librarianId || `lbr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const librarian = {
            librarianId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Librarian',
            type: data.type || 'ancient',
            knowledge: data.knowledge || this.config.baseKnowledge,
            scrolls: data.scrolls || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.librarians.set(id, librarian);
        this.stats.totalLibrarians++;
        this._triggerHook('librarianRecruited', { librarianId: id });
        return { success: true, librarian };
    }

    getLibrarian(id) { return this.librarians.get(id) ? { ...this.librarians.get(id) } : null; }
    listLibrarians() { return Array.from(this.librarians.values()).map(b => ({ ...b })); }
    listByMaster(masterId) { return Array.from(this.librarians.values()).filter(b => b.masterId === masterId).map(b => ({ ...b })); }
    listLegendary() { return Array.from(this.librarians.values()).filter(b => b.status === 'legendary').map(b => ({ ...b })); }

    addScroll(librarianId, scroll) {
        const librarian = this.librarians.get(librarianId);
        if (!librarian) return { success: false, error: 'LIBRARIAN_NOT_FOUND' };
        librarian.scrolls.push(scroll);
        this._triggerHook('scrollAdded', { librarianId, scroll });
        return { success: true };
    }

    raiseKnowledge(librarianId, amount = 5) {
        const librarian = this.librarians.get(librarianId);
        if (!librarian) return { success: false, error: 'LIBRARIAN_NOT_FOUND' };
        librarian.knowledge += amount;
        this._triggerHook('knowledgeRaised', { librarianId, newKnowledge: librarian.knowledge });
        return { success: true };
    }

    levelUpLibrarian(librarianId) {
        const librarian = this.librarians.get(librarianId);
        if (!librarian) return { success: false, error: 'LIBRARIAN_NOT_FOUND' };
        librarian.level++;
        this._triggerHook('librarianLeveledUp', { librarianId, newLevel: librarian.level });
        return { success: true };
    }

    legendLibrarian(librarianId) {
        const librarian = this.librarians.get(librarianId);
        if (!librarian) return { success: false, error: 'LIBRARIAN_NOT_FOUND' };
        librarian.status = 'legendary';
        this._triggerHook('librarianLegendized', { librarianId });
        return { success: true };
    }

    calculateLibrarianValue(librarianId) {
        const librarian = this.librarians.get(librarianId);
        if (!librarian) return 0;
        return librarian.level * 100 + librarian.knowledge * 2 + librarian.scrolls.length * 30;
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
        if (this.stats.totalLibrarians < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxLibrarians += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { librarians: Array.from(this.librarians.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.librarians) this.librarians = new Map(data.librarians);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, librarianCount: this.librarians.size }; }
}
