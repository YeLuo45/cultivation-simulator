/**
 * CultivationBrewer.js - 修真酿造系统
 * V709 Iteration 2/30 Round 29
 */
export class CultivationBrewer {
    constructor(config = {}) {
        this.config = { maxBrewers: config.maxBrewers || 30, baseBrewing: config.baseBrewing || 20, ...config };
        this.brewers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBrewers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBrewer', (ctx) => this.getBrewer(ctx.brewerId));
        this.registerTool('recruitBrewer', (ctx) => this.recruitBrewer(ctx));
    }

    recruitBrewer(data) {
        const id = data.brewerId || `brw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const brewer = {
            brewerId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Brewer',
            type: data.type || 'wine',
            brewing: data.brewing || this.config.baseBrewing,
            brews: data.brews || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.brewers.set(id, brewer);
        this.stats.totalBrewers++;
        this._triggerHook('brewerRecruited', { brewerId: id });
        return { success: true, brewer };
    }

    getBrewer(id) { return this.brewers.get(id) ? { ...this.brewers.get(id) } : null; }
    listBrewers() { return Array.from(this.brewers.values()).map(b => ({ ...b })); }
    listByMaster(masterId) { return Array.from(this.brewers.values()).filter(b => b.masterId === masterId).map(b => ({ ...b })); }
    listLegendary() { return Array.from(this.brewers.values()).filter(b => b.status === 'legendary').map(b => ({ ...b })); }

    addBrew(brewerId, brew) {
        const brewer = this.brewers.get(brewerId);
        if (!brewer) return { success: false, error: 'BREWER_NOT_FOUND' };
        brewer.brews.push(brew);
        this._triggerHook('brewAdded', { brewerId, brew });
        return { success: true };
    }

    raiseBrewing(brewerId, amount = 5) {
        const brewer = this.brewers.get(brewerId);
        if (!brewer) return { success: false, error: 'BREWER_NOT_FOUND' };
        brewer.brewing += amount;
        this._triggerHook('brewingRaised', { brewerId, newBrewing: brewer.brewing });
        return { success: true };
    }

    levelUpBrewer(brewerId) {
        const brewer = this.brewers.get(brewerId);
        if (!brewer) return { success: false, error: 'BREWER_NOT_FOUND' };
        brewer.level++;
        this._triggerHook('brewerLeveledUp', { brewerId, newLevel: brewer.level });
        return { success: true };
    }

    legendBrewer(brewerId) {
        const brewer = this.brewers.get(brewerId);
        if (!brewer) return { success: false, error: 'BREWER_NOT_FOUND' };
        brewer.status = 'legendary';
        this._triggerHook('brewerLegendized', { brewerId });
        return { success: true };
    }

    calculateBrewerValue(brewerId) {
        const brewer = this.brewers.get(brewerId);
        if (!brewer) return 0;
        return brewer.level * 100 + brewer.brewing * 2 + brewer.brews.length * 30;
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
        if (this.stats.totalBrewers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBrewers += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { brewers: Array.from(this.brewers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.brewers) this.brewers = new Map(data.brewers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, brewerCount: this.brewers.size }; }
}
