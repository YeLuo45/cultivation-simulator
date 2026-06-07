/**
 * CultivationRiver.js - 修真河
 * V689 Iteration 12/30 Round 28 - Cultivation River
 */
export class CultivationRiver {
    constructor(config = {}) {
        this.config = { maxRivers: config.maxRivers || 20, baseFlow: config.baseFlow || 20, ...config };
        this.rivers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRivers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRiver', (ctx) => this.getRiver(ctx.riverId));
        this.registerTool('recruitRiver', (ctx) => this.recruitRiver(ctx));
    }

    recruitRiver(data) {
        const id = data.riverId || `riv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const river = {
            riverId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed River',
            type: data.type || 'earthly',
            flow: data.flow || this.config.baseFlow,
            tributaries: data.tributaries || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.rivers.set(id, river);
        this.stats.totalRivers++;
        this._triggerHook('riverRecruited', { riverId: id });
        return { success: true, river };
    }

    getRiver(id) { return this.rivers.get(id) ? { ...this.rivers.get(id) } : null; }
    listRivers() { return Array.from(this.rivers.values()).map(r => ({ ...r })); }
    listByMaster(masterId) { return Array.from(this.rivers.values()).filter(r => r.masterId === masterId).map(r => ({ ...r })); }
    listLegendary() { return Array.from(this.rivers.values()).filter(r => r.status === 'legendary').map(r => ({ ...r })); }

    addTributary(riverId, tributary) {
        const river = this.rivers.get(riverId);
        if (!river) return { success: false, error: 'RIVER_NOT_FOUND' };
        river.tributaries.push(tributary);
        this._triggerHook('tributaryAdded', { riverId, tributary });
        return { success: true };
    }

    raiseFlow(riverId, amount = 5) {
        const river = this.rivers.get(riverId);
        if (!river) return { success: false, error: 'RIVER_NOT_FOUND' };
        river.flow += amount;
        this._triggerHook('flowRaised', { riverId, newFlow: river.flow });
        return { success: true };
    }

    levelUpRiver(riverId) {
        const river = this.rivers.get(riverId);
        if (!river) return { success: false, error: 'RIVER_NOT_FOUND' };
        river.level++;
        this._triggerHook('riverLeveledUp', { riverId, newLevel: river.level });
        return { success: true };
    }

    legendRiver(riverId) {
        const river = this.rivers.get(riverId);
        if (!river) return { success: false, error: 'RIVER_NOT_FOUND' };
        river.status = 'legendary';
        this._triggerHook('riverLegendized', { riverId });
        return { success: true };
    }

    calculateRiverValue(riverId) {
        const river = this.rivers.get(riverId);
        if (!river) return 0;
        return river.level * 100 + river.flow * 2 + river.tributaries.length * 30;
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
        if (this.stats.totalRivers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRivers += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { rivers: Array.from(this.rivers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.rivers) this.rivers = new Map(data.rivers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, riverCount: this.rivers.size }; }
}
