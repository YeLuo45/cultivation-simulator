/**
 * CultivationDuelist.js - 修真决斗者
 * V546 Iteration 9/20 Round 22
 */
export class CultivationDuelist {
    constructor(config = {}) {
        this.config = { maxDuelists: config.maxDuelists || 100, baseSkill: config.baseSkill || 20, ...config };
        this.duelists = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDuelists: 0, totalVictories: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDuelist', (ctx) => this.getDuelist(ctx.duelistId));
        this.registerTool('registerDuelist', (ctx) => this.registerDuelist(ctx));
    }

    registerDuelist(data) {
        const id = data.duelistId || data.id || `due_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const duelist = {
            duelistId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'Unnamed Duelist',
            type: data.type || 'sword',
            skill: data.skill !== undefined ? data.skill : this.config.baseSkill,
            victories: data.victories || [],
            level: data.level || 1,
            status: data.status || 'rookie',
            createdAt: Date.now()
        };
        this.duelists.set(id, duelist);
        this.stats.totalDuelists++;
        this._triggerHook('duelistRegistered', { duelistId: id });
        return { success: true, duelist };
    }

    getDuelist(duelistId) { return this.duelists.get(duelistId) ? { ...this.duelists.get(duelistId) } : null; }
    listDuelists() { return Array.from(this.duelists.values()).map(d => ({ ...d })); }
    listByCultivator(cultivatorId) { return Array.from(this.duelists.values()).filter(d => d.cultivatorId === cultivatorId).map(d => ({ ...d })); }
    listMasters() { return Array.from(this.duelists.values()).filter(d => d.status === 'master' || d.status === 'legend').map(d => ({ ...d })); }

    addVictory(duelistId, victory) {
        const duelist = this.duelists.get(duelistId);
        if (!duelist) return { success: false, error: 'DUELIST_NOT_FOUND' };
        const victoryEntry = {
            victoryId: victory.victoryId || `v_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            opponentId: victory.opponentId,
            date: victory.date || Date.now(),
            reward: victory.reward || 0
        };
        duelist.victories.push(victoryEntry);
        this.stats.totalVictories++;
        this._triggerHook('victoryAdded', { duelistId, victoryId: victoryEntry.victoryId });
        return { success: true, victory: victoryEntry };
    }

    increaseSkill(duelistId, amount = 5) {
        const duelist = this.duelists.get(duelistId);
        if (!duelist) return { success: false, error: 'DUELIST_NOT_FOUND' };
        duelist.skill += amount;
        this._triggerHook('skillIncreased', { duelistId, newSkill: duelist.skill });
        return { success: true, newSkill: duelist.skill };
    }

    levelUpDuelist(duelistId) {
        const duelist = this.duelists.get(duelistId);
        if (!duelist) return { success: false, error: 'DUELIST_NOT_FOUND' };
        duelist.level++;
        this._triggerHook('duelistLeveledUp', { duelistId, newLevel: duelist.level });
        return { success: true, newLevel: duelist.level };
    }

    markLegend(duelistId) {
        const duelist = this.duelists.get(duelistId);
        if (!duelist) return { success: false, error: 'DUELIST_NOT_FOUND' };
        duelist.status = 'legend';
        this._triggerHook('duelistMarkedLegend', { duelistId });
        return { success: true };
    }

    calculateDuelistPower(duelistId) {
        const duelist = this.duelists.get(duelistId);
        if (!duelist) return 0;
        return duelist.level * 100 + duelist.skill * 2 + duelist.victories.length * 30;
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
        this.config.maxDuelists += 25;
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
