/**
 * CultivationHunter.js - 修真猎人
 * V611 Iteration 14/20 Round 25
 */
export class CultivationHunter {
    constructor(config = {}) {
        this.config = { maxHunters: config.maxHunters || 50, baseTracking: config.baseTracking || 20, ...config };
        this.hunters = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalHunters: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getHunter', (ctx) => this.getHunter(ctx.hunterId));
        this.registerTool('recruitHunter', (ctx) => this.recruitHunter(ctx));
    }

    recruitHunter(data) {
        const id = data.id || `hnt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const hunter = {
            hunterId: id,
            rangerId: data.rangerId,
            name: data.name || 'Hunter',
            type: data.type || 'beast',
            tracking: data.tracking || this.config.baseTracking,
            trophies: data.trophies || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.hunters.set(id, hunter);
        this.stats.totalHunters++;
        this._triggerHook('hunterRecruited', { hunterId: id });
        return { success: true, hunter };
    }

    getHunter(id) { return this.hunters.get(id) ? { ...this.hunters.get(id) } : null; }
    listHunters() { return Array.from(this.hunters.values()).map(h => ({ ...h })); }
    listByRanger(rangerId) { return Array.from(this.hunters.values()).filter(h => h.rangerId === rangerId).map(h => ({ ...h })); }
    listLegendary() { return Array.from(this.hunters.values()).filter(h => h.status === 'legendary').map(h => ({ ...h })); }

    addTrophy(hunterId, trophy) {
        const hunter = this.hunters.get(hunterId);
        if (!hunter) return { success: false, error: 'HUNTER_NOT_FOUND' };
        hunter.trophies.push(trophy);
        this._triggerHook('trophyAdded', { hunterId, trophy });
        return { success: true };
    }

    sharpenTracking(hunterId, amount = 5) {
        const hunter = this.hunters.get(hunterId);
        if (!hunter) return { success: false, error: 'HUNTER_NOT_FOUND' };
        hunter.tracking += amount;
        this._triggerHook('trackingSharpened', { hunterId, newTracking: hunter.tracking });
        return { success: true };
    }

    levelUpHunter(hunterId) {
        const hunter = this.hunters.get(hunterId);
        if (!hunter) return { success: false, error: 'HUNTER_NOT_FOUND' };
        hunter.level++;
        this._triggerHook('hunterLeveledUp', { hunterId, newLevel: hunter.level });
        return { success: true };
    }

    legendHunter(hunterId) {
        const hunter = this.hunters.get(hunterId);
        if (!hunter) return { success: false, error: 'HUNTER_NOT_FOUND' };
        hunter.status = 'legendary';
        this._triggerHook('hunterLegendized', { hunterId });
        return { success: true };
    }

    calculateHunterValue(hunterId) {
        const hunter = this.hunters.get(hunterId);
        if (!hunter) return 0;
        return hunter.level * 100 + hunter.tracking * 2 + hunter.trophies.length * 30;
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
        if (this.stats.totalHunters < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxHunters += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { hunters: Array.from(this.hunters.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.hunters) this.hunters = new Map(data.hunters);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, hunterCount: this.hunters.size }; }
}
