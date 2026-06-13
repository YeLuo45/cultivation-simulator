/**
 * CultivationDeath.js - 修真死亡系统
 * V596 Iteration 19/20 Round 24 - Cultivation Death
 */

export class CultivationDeath {
    constructor(config = {}) {
        this.config = { maxDeaths: config.maxDeaths || 50, baseKarma: config.baseKarma || 20, ...config };
        this.deaths = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDeaths: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDeath', (ctx) => this.getDeath(ctx.deathId));
        this.registerTool('recordDeath', (ctx) => this.recordDeath(ctx));
    }

    recordDeath(data) {
        const id = data.deathId || `dth_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const death = {
            deathId: id,
            escortId: data.escortId,
            name: data.name || 'Unnamed Soul',
            type: data.type || 'natural',
            karma: data.karma || this.config.baseKarma,
            regrets: data.regrets || [],
            level: 1,
            status: 'departed',
            createdAt: Date.now()
        };
        this.deaths.set(id, death);
        this.stats.totalDeaths++;
        this._triggerHook('deathRecorded', { deathId: id });
        return { success: true, death };
    }

    getDeath(id) { return this.deaths.get(id) ? { ...this.deaths.get(id) } : null; }
    listDeaths() { return Array.from(this.deaths.values()).map(d => ({ ...d })); }
    listByEscort(escortId) { return Array.from(this.deaths.values()).filter(d => d.escortId === escortId).map(d => ({ ...d })); }
    listEternal() { return Array.from(this.deaths.values()).filter(d => d.status === 'eternal').map(d => ({ ...d })); }

    addRegret(deathId, regret) {
        const death = this.deaths.get(deathId);
        if (!death) return { success: false, error: 'DEATH_NOT_FOUND' };
        death.regrets.push(regret);
        this._triggerHook('regretAdded', { deathId, regret });
        return { success: true, death: { ...death } };
    }

    settleKarma(deathId, amount = 5) {
        const death = this.deaths.get(deathId);
        if (!death) return { success: false, error: 'DEATH_NOT_FOUND' };
        death.karma += amount;
        this._triggerHook('karmaSettled', { deathId, newKarma: death.karma });
        return { success: true };
    }

    levelUpDeath(deathId) {
        const death = this.deaths.get(deathId);
        if (!death) return { success: false, error: 'DEATH_NOT_FOUND' };
        death.level++;
        this._triggerHook('deathLeveledUp', { deathId, newLevel: death.level });
        return { success: true };
    }

    eternalizeDeath(deathId) {
        const death = this.deaths.get(deathId);
        if (!death) return { success: false, error: 'DEATH_NOT_FOUND' };
        death.status = 'eternal';
        this._triggerHook('deathEternalized', { deathId });
        return { success: true };
    }

    calculateDeathValue(deathId) {
        const death = this.deaths.get(deathId);
        if (!death) return 0;
        return death.level * 100 + death.karma * 2 + death.regrets.length * 30;
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
        if (this.stats.totalDeaths < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDeaths += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { deaths: Array.from(this.deaths.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.deaths) this.deaths = new Map(data.deaths);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, deathCount: this.deaths.size }; }
}
