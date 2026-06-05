/**
 * KarmaLedger.js - 业力账本
 * V369 Iteration 3/9 Round 10
 */
export class KarmaLedger {
    constructor(config = {}) {
        this.config = { maxEntries: config.maxEntries || 500, ...config };
        this.ledgers = new Map();
        this.entries = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEntries: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getLedger', (ctx) => this.getLedger(ctx.ledgerId));
        this.registerTool('addEntry', (ctx) => this.addEntry(ctx.ledgerId, ctx));
    }

    createLedger(data) {
        const id = data.id || `lg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const ledger = { ledgerId: id, owner: data.owner || 'Anonymous', totalKarma: 0, createdAt: Date.now() };
        this.ledgers.set(id, ledger);
        this._triggerHook('ledgerCreated', { ledgerId: id });
        return { success: true, ledger };
    }

    getLedger(id) { return this.ledgers.get(id) ? { ...this.ledgers.get(id) } : null; }
    listLedgers() { return Array.from(this.ledgers.values()).map(l => ({ ...l })); }

    addEntry(ledgerId, data) {
        const ledger = this.ledgers.get(ledgerId);
        if (!ledger) return { success: false, error: 'LEDGER_NOT_FOUND' };
        const id = `e_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const entry = { entryId: id, ledgerId, action: data.action || 'unknown', karma: data.karma || 0, reason: data.reason || '', createdAt: Date.now() };
        this.entries.set(id, entry);
        ledger.totalKarma += entry.karma;
        this.stats.totalEntries++;
        this._triggerHook('entryAdded', { ledgerId, entryId: id });
        return { success: true, entry };
    }

    getEntry(id) { return this.entries.get(id) ? { ...this.entries.get(id) } : null; }
    listEntries() { return Array.from(this.entries.values()).map(e => ({ ...e })); }
    listByLedger(ledgerId) { return Array.from(this.entries.values()).filter(e => e.ledgerId === ledgerId).map(e => ({ ...e })); }
    listByAction(action) { return Array.from(this.entries.values()).filter(e => e.action === action).map(e => ({ ...e })); }
    listPositive() { return Array.from(this.entries.values()).filter(e => e.karma > 0).map(e => ({ ...e })); }
    listNegative() { return Array.from(this.entries.values()).filter(e => e.karma < 0).map(e => ({ ...e })); }

    calculateNet(ledgerId) {
        const entries = this.listByLedger(ledgerId);
        return entries.reduce((sum, e) => sum + e.karma, 0);
    }

    removeEntry(entryId) {
        const entry = this.entries.get(entryId);
        if (!entry) return { success: false, error: 'ENTRY_NOT_FOUND' };
        this.entries.delete(entryId);
        const ledger = this.ledgers.get(entry.ledgerId);
        if (ledger) ledger.totalKarma -= entry.karma;
        this._triggerHook('entryRemoved', { entryId });
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

    toJSON() { return { ledgers: Array.from(this.ledgers.entries()), entries: Array.from(this.entries.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.ledgers) this.ledgers = new Map(data.ledgers);
        if (data.entries) this.entries = new Map(data.entries);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, ledgerCount: this.ledgers.size, entryCount: this.entries.size }; }
}