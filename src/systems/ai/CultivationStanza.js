/**
 * CultivationStanza.js - 修真段系统
 * V781 Iteration 14/30 Round 31
 */
export class CultivationStanza {
    constructor(config = {}) {
        this.config = { maxStanzas: config.maxStanzas || 20, baseDepth: config.baseDepth || 20, ...config };
        this.stanzas = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalStanzas: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getStanza', (ctx) => this.getStanza(ctx.stanzaId));
        this.registerTool('recruitStanza', (ctx) => this.recruitStanza(ctx));
    }

    recruitStanza(data) {
        const id = data.id || `stn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const stanza = {
            stanzaId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Stanza',
            type: data.type || 'quatrain',
            depth: data.depth || this.config.baseDepth,
            lines: data.lines || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.stanzas.set(id, stanza);
        this.stats.totalStanzas++;
        this._triggerHook('stanzaRecruited', { stanzaId: id });
        return { success: true, stanza };
    }

    getStanza(id) { return this.stanzas.get(id) ? { ...this.stanzas.get(id) } : null; }
    listStanzas() { return Array.from(this.stanzas.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.stanzas.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.stanzas.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addLine(stanzaId, line) {
        const stanza = this.stanzas.get(stanzaId);
        if (!stanza) return { success: false, error: 'STANZA_NOT_FOUND' };
        stanza.lines.push(line);
        this._triggerHook('lineAdded', { stanzaId, newLine: line, totalLines: stanza.lines.length });
        return { success: true };
    }

    raiseDepth(stanzaId, amount = 5) {
        const stanza = this.stanzas.get(stanzaId);
        if (!stanza) return { success: false, error: 'STANZA_NOT_FOUND' };
        stanza.depth += amount;
        this._triggerHook('depthRaised', { stanzaId, newDepth: stanza.depth });
        return { success: true };
    }

    levelUpStanza(stanzaId) {
        const stanza = this.stanzas.get(stanzaId);
        if (!stanza) return { success: false, error: 'STANZA_NOT_FOUND' };
        stanza.level++;
        this._triggerHook('stanzaLeveledUp', { stanzaId, newLevel: stanza.level });
        return { success: true };
    }

    legendStanza(stanzaId) {
        const stanza = this.stanzas.get(stanzaId);
        if (!stanza) return { success: false, error: 'STANZA_NOT_FOUND' };
        stanza.status = 'legendary';
        this._triggerHook('stanzaLegendized', { stanzaId });
        return { success: true };
    }

    calculateStanzaValue(stanzaId) {
        const stanza = this.stanzas.get(stanzaId);
        if (!stanza) return 0;
        return stanza.level * 100 + stanza.depth * 2 + stanza.lines.length * 30;
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
        if (this.stats.totalStanzas < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxStanzas += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { stanzas: Array.from(this.stanzas.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.stanzas) this.stanzas = new Map(data.stanzas);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, stanzaCount: this.stanzas.size }; }
}
