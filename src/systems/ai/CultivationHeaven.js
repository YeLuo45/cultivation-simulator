/**
 * CultivationHeaven.js - 修真天界
 * V680 Iteration 3/30 Round 28 - Cultivation Heaven
 */
export class CultivationHeaven {
    constructor(config = {}) {
        this.config = { maxHeavens: config.maxHeavens || 9, baseDivinity: config.baseDivinity || 20, ...config };
        this.heavens = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalHeavens: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getHeaven', (ctx) => this.getHeaven(ctx.heavenId));
        this.registerTool('recruitHeaven', (ctx) => this.recruitHeaven(ctx));
    }

    recruitHeaven(data) {
        const id = data.heavenId || `hv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const heaven = {
            heavenId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Heaven',
            type: data.type || 'first',
            divinity: data.divinity || this.config.baseDivinity,
            mandates: data.mandates || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.heavens.set(id, heaven);
        this.stats.totalHeavens++;
        this._triggerHook('heavenRecruited', { heavenId: id });
        return { success: true, heaven };
    }

    getHeaven(id) { return this.heavens.get(id) ? { ...this.heavens.get(id) } : null; }
    listHeavens() { return Array.from(this.heavens.values()).map(h => ({ ...h })); }
    listByMaster(masterId) { return Array.from(this.heavens.values()).filter(h => h.masterId === masterId).map(h => ({ ...h })); }
    listLegendary() { return Array.from(this.heavens.values()).filter(h => h.status === 'legendary').map(h => ({ ...h })); }

    addMandate(heavenId, mandate) {
        const heaven = this.heavens.get(heavenId);
        if (!heaven) return { success: false, error: 'HEAVEN_NOT_FOUND' };
        heaven.mandates.push(mandate);
        this._triggerHook('mandateAdded', { heavenId, mandate });
        return { success: true };
    }

    raiseDivinity(heavenId, amount = 5) {
        const heaven = this.heavens.get(heavenId);
        if (!heaven) return { success: false, error: 'HEAVEN_NOT_FOUND' };
        heaven.divinity += amount;
        this._triggerHook('divinityRaised', { heavenId, newDivinity: heaven.divinity });
        return { success: true };
    }

    levelUpHeaven(heavenId) {
        const heaven = this.heavens.get(heavenId);
        if (!heaven) return { success: false, error: 'HEAVEN_NOT_FOUND' };
        heaven.level++;
        this._triggerHook('heavenLeveledUp', { heavenId, newLevel: heaven.level });
        return { success: true };
    }

    legendHeaven(heavenId) {
        const heaven = this.heavens.get(heavenId);
        if (!heaven) return { success: false, error: 'HEAVEN_NOT_FOUND' };
        heaven.status = 'legendary';
        this._triggerHook('heavenLegendized', { heavenId });
        return { success: true };
    }

    calculateHeavenValue(heavenId) {
        const heaven = this.heavens.get(heavenId);
        if (!heaven) return 0;
        return heaven.level * 100 + heaven.divinity * 2 + heaven.mandates.length * 30;
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
        if (this.stats.totalHeavens < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxHeavens += 5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { heavens: Array.from(this.heavens.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.heavens) this.heavens = new Map(data.heavens);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, heavenCount: this.heavens.size }; }
}
