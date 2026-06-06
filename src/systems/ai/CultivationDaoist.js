/**
 * CultivationDaoist.js - 修真道士
 * V638 Iteration 21/30 Round 26 - Cultivation Daoist
 */
export class CultivationDaoist {
    constructor(config = {}) {
        this.config = { maxDaoists: config.maxDaoists || 50, basePurity: config.basePurity || 20, ...config };
        this.daoists = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDaoists: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDaoist', (ctx) => this.getDaoist(ctx.daoistId));
        this.registerTool('recruitDaoist', (ctx) => this.recruitDaoist(ctx));
    }

    recruitDaoist(data) {
        const id = data.daoistId || `dai_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const daoist = {
            daoistId: id,
            abbotId: data.abbotId,
            name: data.name || 'Unnamed Daoist',
            type: data.type || 'earthly',
            purity: data.purity || this.config.basePurity,
            talismans: data.talismans || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.daoists.set(id, daoist);
        this.stats.totalDaoists++;
        this._triggerHook('daoistRecruited', { daoistId: id });
        return { success: true, daoist };
    }

    getDaoist(id) { return this.daoists.get(id) ? { ...this.daoists.get(id) } : null; }
    listDaoists() { return Array.from(this.daoists.values()).map(d => ({ ...d })); }
    listByAbbot(abbotId) { return Array.from(this.daoists.values()).filter(d => d.abbotId === abbotId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.daoists.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addTalisman(daoistId, talisman) {
        const daoist = this.daoists.get(daoistId);
        if (!daoist) return { success: false, error: 'DAOIST_NOT_FOUND' };
        daoist.talismans.push(talisman);
        this._triggerHook('talismanAdded', { daoistId, talisman });
        return { success: true };
    }

    raisePurity(daoistId, amount = 5) {
        const daoist = this.daoists.get(daoistId);
        if (!daoist) return { success: false, error: 'DAOIST_NOT_FOUND' };
        daoist.purity += amount;
        this._triggerHook('purityRaised', { daoistId, newPurity: daoist.purity });
        return { success: true };
    }

    levelUpDaoist(daoistId) {
        const daoist = this.daoists.get(daoistId);
        if (!daoist) return { success: false, error: 'DAOIST_NOT_FOUND' };
        daoist.level++;
        this._triggerHook('daoistLeveledUp', { daoistId, newLevel: daoist.level });
        return { success: true };
    }

    legendDaoist(daoistId) {
        const daoist = this.daoists.get(daoistId);
        if (!daoist) return { success: false, error: 'DAOIST_NOT_FOUND' };
        daoist.status = 'legendary';
        this._triggerHook('daoistLegendized', { daoistId });
        return { success: true };
    }

    calculateDaoistValue(daoistId) {
        const daoist = this.daoists.get(daoistId);
        if (!daoist) return 0;
        return daoist.level * 100 + daoist.purity * 2 + daoist.talismans.length * 30;
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
        if (this.stats.totalDaoists < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDaoists += 25;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { daoists: Array.from(this.daoists.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.daoists) this.daoists = new Map(data.daoists);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, daoistCount: this.daoists.size }; }
}
