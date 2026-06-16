/**
 * CultivationDecade.js - 修真十年 (Cultivation Decade system)
 * V825 Iteration 28/30 Round 32
 */
export class CultivationDecade {
    constructor(config = {}) {
        this.config = { maxDecades: config.maxDecades || 20, baseWeight: config.baseWeight || 20, ...config };
        this.decades = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDecades: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDecade', (ctx) => this.getDecade(ctx.decadeId));
        this.registerTool('recruitDecade', (ctx) => this.recruitDecade(ctx));
    }

    recruitDecade(data) {
        const id = data.id || `dec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const decade = {
            decadeId: id,
            masterId: data.masterId,
            name: data.name || 'Cultivation Decade',
            type: data.type || 'earthly',
            weight: data.weight || this.config.baseWeight,
            years: data.years || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.decades.set(id, decade);
        this.stats.totalDecades++;
        this._triggerHook('decadeRecruited', { decadeId: id });
        return { success: true, decade };
    }

    getDecade(id) { return this.decades.get(id) ? { ...this.decades.get(id), years: [...this.decades.get(id).years] } : null; }
    listDecades() { return Array.from(this.decades.values()).map(d => ({ ...d, years: [...d.years] })); }
    listByMaster(masterId) { return Array.from(this.decades.values()).filter(d => d.masterId === masterId).map(d => ({ ...d, years: [...d.years] })); }
    listLegendary() { return Array.from(this.decades.values()).filter(d => d.status === 'legendary').map(d => ({ ...d, years: [...d.years] })); }

    addYear(decadeId, year) {
        const decade = this.decades.get(decadeId);
        if (!decade) return { success: false, error: 'DECADE_NOT_FOUND' };
        const y = typeof year === 'string' ? { name: year, timestamp: Date.now() } : { ...year, timestamp: year.timestamp || Date.now() };
        decade.years.push(y);
        this._triggerHook('yearAdded', { decadeId, year: y, yearCount: decade.years.length });
        return { success: true, year: y };
    }

    raiseWeight(decadeId, amount = 5) {
        const decade = this.decades.get(decadeId);
        if (!decade) return { success: false, error: 'DECADE_NOT_FOUND' };
        decade.weight += amount;
        this._triggerHook('weightRaised', { decadeId, amount, newWeight: decade.weight });
        return { success: true };
    }

    levelUpDecade(decadeId) {
        const decade = this.decades.get(decadeId);
        if (!decade) return { success: false, error: 'DECADE_NOT_FOUND' };
        decade.level++;
        this._triggerHook('decadeLeveledUp', { decadeId, newLevel: decade.level });
        return { success: true };
    }

    legendDecade(decadeId) {
        const decade = this.decades.get(decadeId);
        if (!decade) return { success: false, error: 'DECADE_NOT_FOUND' };
        decade.status = 'legendary';
        this._triggerHook('decadeLegendized', { decadeId });
        return { success: true };
    }

    calculateDecadeValue(decadeId) {
        const decade = this.decades.get(decadeId);
        if (!decade) return 0;
        return decade.level * 100 + decade.weight * 2 + decade.years.length * 30;
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
        if (this.stats.totalDecades < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDecades += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { decades: Array.from(this.decades.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.decades) this.decades = new Map(data.decades);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, decadeCount: this.decades.size }; }
}
