/**
 * CultivationConcerto.js - 修真协奏系统
 * V796 Iteration 29/30 Round 31
 */
export class CultivationConcerto {
    constructor(config = {}) {
        this.config = { maxConcertos: config.maxConcertos || 20, baseBrilliance: config.baseBrilliance || 20, ...config };
        this.concertos = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalConcertos: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getConcerto', (ctx) => this.getConcerto(ctx.concertoId));
        this.registerTool('recruitConcerto', (ctx) => this.recruitConcerto(ctx));
    }

    recruitConcerto(data) {
        const id = data.concertoId || `concerto_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const concerto = { concertoId: id, masterId: data.masterId, name: data.name || 'Mystic Concerto', type: data.type || 'grand', brilliance: data.brilliance || this.config.baseBrilliance, solos: data.solos || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.concertos.set(id, concerto);
        this.stats.totalConcertos++;
        this._triggerHook('concertoRecruited', { concertoId: id });
        return { success: true, concerto };
    }

    getConcerto(id) { return this.concertos.get(id) ? { ...this.concertos.get(id) } : null; }
    listConcertos() { return Array.from(this.concertos.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.concertos.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.concertos.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addSolo(concertoId, solo) {
        const concerto = this.concertos.get(concertoId);
        if (!concerto) return { success: false, error: 'CONCERTO_NOT_FOUND' };
        concerto.solos.push(solo);
        this._triggerHook('soloAdded', { concertoId, solo });
        return { success: true };
    }

    raiseBrilliance(concertoId, amount = 5) {
        const concerto = this.concertos.get(concertoId);
        if (!concerto) return { success: false, error: 'CONCERTO_NOT_FOUND' };
        concerto.brilliance += amount;
        this._triggerHook('brillianceRaised', { concertoId, newBrilliance: concerto.brilliance });
        return { success: true };
    }

    levelUpConcerto(concertoId) {
        const concerto = this.concertos.get(concertoId);
        if (!concerto) return { success: false, error: 'CONCERTO_NOT_FOUND' };
        concerto.level++;
        return { success: true };
    }

    legendConcerto(concertoId) {
        const concerto = this.concertos.get(concertoId);
        if (!concerto) return { success: false, error: 'CONCERTO_NOT_FOUND' };
        concerto.status = 'legendary';
        this._triggerHook('concertoLegendized', { concertoId });
        return { success: true };
    }

    calculateConcertoValue(concertoId) {
        const concerto = this.concertos.get(concertoId);
        if (!concerto) return 0;
        return concerto.level * 100 + concerto.brilliance * 2 + concerto.solos.length * 30;
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
        if (this.stats.totalConcertos < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxConcertos += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { concertos: Array.from(this.concertos.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.concertos) this.concertos = new Map(data.concertos);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, concertoCount: this.concertos.size }; }
}
