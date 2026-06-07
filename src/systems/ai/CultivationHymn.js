/**
 * CultivationHymn.js - 修真赞美诗系统
 * V776 Iteration 9/30 Round 31
 */
export class CultivationHymn {
    constructor(config = {}) {
        this.config = { maxHymns: config.maxHymns || 20, baseReverence: config.baseReverence || 20, ...config };
        this.hymns = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalHymns: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getHymn', (ctx) => this.getHymn(ctx.hymnId));
        this.registerTool('recruitHymn', (ctx) => this.recruitHymn(ctx));
    }

    recruitHymn(data) {
        const id = data.hymnId || `hymn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const hymn = { hymnId: id, masterId: data.masterId, name: data.name || 'Mystic Hymn', type: data.type || 'divine', reverence: data.reverence || this.config.baseReverence, praises: data.praises || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.hymns.set(id, hymn);
        this.stats.totalHymns++;
        this._triggerHook('hymnRecruited', { hymnId: id });
        return { success: true, hymn };
    }

    getHymn(id) { return this.hymns.get(id) ? { ...this.hymns.get(id) } : null; }
    listHymns() { return Array.from(this.hymns.values()).map(h => ({ ...h })); }
    listByMaster(masterId) { return Array.from(this.hymns.values()).filter(h => h.masterId === masterId).map(h => ({ ...h })); }
    listLegendary() { return Array.from(this.hymns.values()).filter(h => h.status === 'legendary').map(h => ({ ...h })); }

    addPraise(hymnId, praise) {
        const hymn = this.hymns.get(hymnId);
        if (!hymn) return { success: false, error: 'HYMN_NOT_FOUND' };
        hymn.praises.push(praise);
        this._triggerHook('praiseAdded', { hymnId, praise });
        return { success: true };
    }

    raiseReverence(hymnId, amount = 5) {
        const hymn = this.hymns.get(hymnId);
        if (!hymn) return { success: false, error: 'HYMN_NOT_FOUND' };
        hymn.reverence += amount;
        this._triggerHook('reverenceRaised', { hymnId, newReverence: hymn.reverence });
        return { success: true };
    }

    levelUpHymn(hymnId) {
        const hymn = this.hymns.get(hymnId);
        if (!hymn) return { success: false, error: 'HYMN_NOT_FOUND' };
        hymn.level++;
        this._triggerHook('hymnLeveledUp', { hymnId, newLevel: hymn.level });
        return { success: true };
    }

    legendHymn(hymnId) {
        const hymn = this.hymns.get(hymnId);
        if (!hymn) return { success: false, error: 'HYMN_NOT_FOUND' };
        hymn.status = 'legendary';
        this._triggerHook('hymnLegendized', { hymnId });
        return { success: true };
    }

    calculateHymnValue(hymnId) {
        const hymn = this.hymns.get(hymnId);
        if (!hymn) return 0;
        return hymn.level * 100 + hymn.reverence * 2 + hymn.praises.length * 30;
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
        if (this.stats.totalHymns < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxHymns += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { hymns: Array.from(this.hymns.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.hymns) this.hymns = new Map(data.hymns);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, hymnCount: this.hymns.size }; }
}
