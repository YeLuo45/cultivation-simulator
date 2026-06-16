/**
 * CultivationUnderworld.js - 修真冥界系统
 * V682 Iteration 5/30 Round 28 - Cultivation Underworld
 */

export class CultivationUnderworld {
    constructor(config = {}) {
        this.config = { maxUnderworlds: config.maxUnderworlds || 10, baseDeath: config.baseDeath || 20, ...config };
        this.underworlds = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalUnderworlds: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getUnderworld', (ctx) => this.getUnderworld(ctx.underworldId));
        this.registerTool('recruitUnderworld', (ctx) => this.recruitUnderworld(ctx));
    }

    recruitUnderworld(data) {
        const id = data.underworldId || `und_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const underworld = {
            underworldId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Underworld',
            type: data.type || 'shadow',
            death: data.death || this.config.baseDeath,
            judges: data.judges || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.underworlds.set(id, underworld);
        this.stats.totalUnderworlds++;
        this._triggerHook('underworldRecruited', { underworldId: id });
        return { success: true, underworld };
    }

    getUnderworld(id) { return this.underworlds.get(id) ? { ...this.underworlds.get(id) } : null; }
    listUnderworlds() { return Array.from(this.underworlds.values()).map(u => ({ ...u })); }
    listByMaster(masterId) { return Array.from(this.underworlds.values()).filter(u => u.masterId === masterId).map(u => ({ ...u })); }
    listLegendary() { return Array.from(this.underworlds.values()).filter(u => u.status === 'legendary').map(u => ({ ...u })); }

    addJudge(underworldId, judge) {
        const underworld = this.underworlds.get(underworldId);
        if (!underworld) return { success: false, error: 'UNDERWORLD_NOT_FOUND' };
        underworld.judges.push(judge);
        this._triggerHook('judgeAdded', { underworldId, judge });
        return { success: true, underworld: { ...underworld } };
    }

    deepenDeath(underworldId, amount = 5) {
        const underworld = this.underworlds.get(underworldId);
        if (!underworld) return { success: false, error: 'UNDERWORLD_NOT_FOUND' };
        underworld.death += amount;
        this._triggerHook('deathDeepened', { underworldId, newDeath: underworld.death });
        return { success: true };
    }

    levelUpUnderworld(underworldId) {
        const underworld = this.underworlds.get(underworldId);
        if (!underworld) return { success: false, error: 'UNDERWORLD_NOT_FOUND' };
        underworld.level++;
        this._triggerHook('underworldLeveledUp', { underworldId, newLevel: underworld.level });
        return { success: true };
    }

    legendUnderworld(underworldId) {
        const underworld = this.underworlds.get(underworldId);
        if (!underworld) return { success: false, error: 'UNDERWORLD_NOT_FOUND' };
        underworld.status = 'legendary';
        this._triggerHook('underworldLegendized', { underworldId });
        return { success: true };
    }

    calculateUnderworldValue(underworldId) {
        const underworld = this.underworlds.get(underworldId);
        if (!underworld) return 0;
        return underworld.level * 100 + underworld.death * 2 + underworld.judges.length * 30;
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
        if (this.stats.totalUnderworlds < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxUnderworlds += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { underworlds: Array.from(this.underworlds.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.underworlds) this.underworlds = new Map(data.underworlds);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, underworldCount: this.underworlds.size }; }
}
