/**
 * CultivationLegalist.js - 修真法家
 * V641 Iteration 24/30 Round 26 - Cultivation Legalist
 */
export class CultivationLegalist {
    constructor(config = {}) {
        this.config = { maxLegalists: config.maxLegalists || 50, baseLaw: config.baseLaw || 20, ...config };
        this.legalists = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalLegalists: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getLegalist', (ctx) => this.getLegalist(ctx.legalistId));
        this.registerTool('recruitLegalist', (ctx) => this.recruitLegalist(ctx));
    }

    recruitLegalist(data) {
        const id = data.id || `leg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const legalist = {
            legalistId: id,
            magistrateId: data.magistrateId,
            name: data.name || 'Unnamed Legalist',
            type: data.type || 'strict',
            law: data.law || this.config.baseLaw,
            statutes: [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.legalists.set(id, legalist);
        this.stats.totalLegalists++;
        this._triggerHook('legalistRecruited', { legalistId: id });
        return { success: true, legalist };
    }

    getLegalist(id) { return this.legalists.get(id) ? { ...this.legalists.get(id) } : null; }
    listLegalists() { return Array.from(this.legalists.values()).map(l => ({ ...l })); }
    listByMagistrate(magistrateId) { return Array.from(this.legalists.values()).filter(l => l.magistrateId === magistrateId).map(l => ({ ...l })); }
    listLegendary() { return Array.from(this.legalists.values()).filter(l => l.status === 'legendary').map(l => ({ ...l })); }

    addStatute(legalistId, statute) {
        const legalist = this.legalists.get(legalistId);
        if (!legalist) return { success: false, error: 'LEGALIST_NOT_FOUND' };
        legalist.statutes.push(statute);
        this._triggerHook('statuteAdded', { legalistId, statute });
        return { success: true };
    }

    enforceLaw(legalistId, amount = 5) {
        const legalist = this.legalists.get(legalistId);
        if (!legalist) return { success: false, error: 'LEGALIST_NOT_FOUND' };
        legalist.law += amount;
        this._triggerHook('lawEnforced', { legalistId, newLaw: legalist.law });
        return { success: true };
    }

    levelUpLegalist(legalistId) {
        const legalist = this.legalists.get(legalistId);
        if (!legalist) return { success: false, error: 'LEGALIST_NOT_FOUND' };
        legalist.level++;
        this._triggerHook('legalistLeveledUp', { legalistId, newLevel: legalist.level });
        return { success: true };
    }

    legendLegalist(legalistId) {
        const legalist = this.legalists.get(legalistId);
        if (!legalist) return { success: false, error: 'LEGALIST_NOT_FOUND' };
        legalist.status = 'legendary';
        this._triggerHook('legalistLegendized', { legalistId });
        return { success: true };
    }

    calculateLegalistValue(legalistId) {
        const legalist = this.legalists.get(legalistId);
        if (!legalist) return 0;
        return legalist.level * 100 + legalist.law * 2 + legalist.statutes.length * 30;
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
        if (this.stats.totalLegalists < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxLegalists += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { legalists: Array.from(this.legalists.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.legalists) this.legalists = new Map(data.legalists);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, legalistCount: this.legalists.size }; }
}
