/**
 * CultivationDuelist.js - 修真剑客
 * V659 Iteration 12/30 Round 27
 */
export class CultivationDuelist {
    constructor(config = {}) {
        this.config = { maxDuelists: config.maxDuelists || 30, baseElegance: config.baseElegance || 20, ...config };
        this.duelists = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDuelists: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDuelist', (ctx) => this.getDuelist(ctx.duelistId));
        this.registerTool('recruitDuelist', (ctx) => this.recruitDuelist(ctx));
    }

    recruitDuelist(data) {
        const id = data.id || `duel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const duelist = { duelistId: id, masterId: data.masterId || null, name: data.name || 'Anonymous', type: data.type || 'rapier', elegance: data.elegance || this.config.baseElegance, swords: data.swords || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.duelists.set(id, duelist);
        this.stats.totalDuelists++;
        this._triggerHook('duelistRecruited', { duelistId: id });
        return { success: true, duelist };
    }

    getDuelist(id) { return this.duelists.get(id) ? { ...this.duelists.get(id) } : null; }
    listDuelists() { return Array.from(this.duelists.values()).map(d => ({ ...d })); }
    listByMaster(masterId) { return Array.from(this.duelists.values()).filter(d => d.masterId === masterId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.duelists.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addSword(duelistId, sword) {
        const duelist = this.duelists.get(duelistId);
        if (!duelist) return { success: false, error: 'DUELIST_NOT_FOUND' };
        const swordName = (sword && typeof sword === 'object') ? (sword.name || 'sword') : sword;
        duelist.swords.push({ name: swordName, addedAt: Date.now() });
        this._triggerHook('swordAdded', { duelistId, sword: swordName });
        return { success: true };
    }

    raiseElegance(duelistId, amount = 5) {
        const duelist = this.duelists.get(duelistId);
        if (!duelist) return { success: false, error: 'DUELIST_NOT_FOUND' };
        duelist.elegance += amount;
        this._triggerHook('eleganceRaised', { duelistId, newElegance: duelist.elegance });
        return { success: true };
    }

    levelUpDuelist(duelistId) {
        const duelist = this.duelists.get(duelistId);
        if (!duelist) return { success: false, error: 'DUELIST_NOT_FOUND' };
        duelist.level++;
        this._triggerHook('duelistLeveledUp', { duelistId, newLevel: duelist.level });
        return { success: true };
    }

    legendDuelist(duelistId) {
        const duelist = this.duelists.get(duelistId);
        if (!duelist) return { success: false, error: 'DUELIST_NOT_FOUND' };
        duelist.status = 'legendary';
        this._triggerHook('duelistLegendized', { duelistId });
        return { success: true };
    }

    calculateDuelistValue(duelistId) {
        const duelist = this.duelists.get(duelistId);
        if (!duelist) return 0;
        return duelist.level * 100 + duelist.elegance * 2 + duelist.swords.length * 30;
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
        if (this.stats.totalDuelists < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDuelists += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { duelists: Array.from(this.duelists.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.duelists) this.duelists = new Map(data.duelists);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, duelistCount: this.duelists.size }; }
}
