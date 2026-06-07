/**
 * CultivationShrine.js - 修真祠庙
 * V715 Iteration 8/30 Round 29
 */
export class CultivationShrine {
    constructor(config = {}) {
        this.config = { maxShrines: config.maxShrines || 20, baseWorship: config.baseWorship || 20, ...config };
        this.shrines = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalShrines: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getShrine', (ctx) => this.getShrine(ctx.shrineId));
        this.registerTool('recruitShrine', (ctx) => this.recruitShrine(ctx));
    }

    recruitShrine(data) {
        const id = data.id || `shr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const shrine = { shrineId: id, masterId: data.masterId, name: data.name || 'unnamed-shrine', type: data.type || 'ancestor', worship: data.worship || this.config.baseWorship, relics: data.relics || [], level: 1, status: 'novice', createdAt: Date.now() };
        this.shrines.set(id, shrine);
        this.stats.totalShrines++;
        this._triggerHook('shrineRecruited', { shrineId: id });
        return { success: true, shrine };
    }

    getShrine(id) { return this.shrines.get(id) ? { ...this.shrines.get(id) } : null; }
    listShrines() { return Array.from(this.shrines.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.shrines.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.shrines.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addRelic(shrineId, relic) {
        const shrine = this.shrines.get(shrineId);
        if (!shrine) return { success: false, error: 'SHRINE_NOT_FOUND' };
        shrine.relics.push(relic);
        this._triggerHook('relicAdded', { shrineId, relic });
        return { success: true };
    }

    raiseWorship(shrineId, amount = 5) {
        const shrine = this.shrines.get(shrineId);
        if (!shrine) return { success: false, error: 'SHRINE_NOT_FOUND' };
        shrine.worship += amount;
        this._triggerHook('worshipRaised', { shrineId, amount, newWorship: shrine.worship });
        return { success: true };
    }

    levelUpShrine(shrineId) {
        const shrine = this.shrines.get(shrineId);
        if (!shrine) return { success: false, error: 'SHRINE_NOT_FOUND' };
        shrine.level++;
        this._triggerHook('shrineLeveledUp', { shrineId, newLevel: shrine.level });
        return { success: true };
    }

    legendShrine(shrineId) {
        const shrine = this.shrines.get(shrineId);
        if (!shrine) return { success: false, error: 'SHRINE_NOT_FOUND' };
        shrine.status = 'legendary';
        this._triggerHook('shrineLegendized', { shrineId, status: shrine.status });
        return { success: true };
    }

    calculateShrineValue(shrineId) {
        const shrine = this.shrines.get(shrineId);
        if (!shrine) return 0;
        return shrine.level * 100 + shrine.worship * 2 + shrine.relics.length * 30;
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
        if (this.stats.totalShrines < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxShrines += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { shrines: Array.from(this.shrines.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.shrines) this.shrines = new Map(data.shrines);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, shrineCount: this.shrines.size }; }
}
