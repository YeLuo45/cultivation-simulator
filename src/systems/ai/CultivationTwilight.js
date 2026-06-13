/**
 * CultivationTwilight.js - 修真暮光系统
 * V817 Iteration 20/30 Round 32
 */
export class CultivationTwilight {
    constructor(config = {}) {
        this.config = { maxTwilights: config.maxTwilights || 20, baseMystery: config.baseMystery || 20, ...config };
        this.twilights = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTwilights: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTwilight', (ctx) => this.getTwilight(ctx.twilightId));
        this.registerTool('recruitTwilight', (ctx) => this.recruitTwilight(ctx));
    }

    recruitTwilight(data) {
        const id = data.twilightId || `twl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const twilight = {
            twilightId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Twilight',
            type: data.type || 'civil',
            mystery: data.mystery || this.config.baseMystery,
            omens: data.omens || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.twilights.set(id, twilight);
        this.stats.totalTwilights++;
        this._triggerHook('twilightRecruited', { twilightId: id });
        return { success: true, twilight };
    }

    getTwilight(id) { return this.twilights.get(id) ? { ...this.twilights.get(id) } : null; }
    listTwilights() { return Array.from(this.twilights.values()).map(t => ({ ...t })); }
    listByMaster(masterId) { return Array.from(this.twilights.values()).filter(t => t.masterId === masterId).map(t => ({ ...t })); }
    listLegendary() { return Array.from(this.twilights.values()).filter(t => t.status === 'legendary').map(t => ({ ...t })); }

    addOmen(twilightId, omen) {
        const twilight = this.twilights.get(twilightId);
        if (!twilight) return { success: false, error: 'TWILIGHT_NOT_FOUND' };
        twilight.omens.push(omen);
        this._triggerHook('omenAdded', { twilightId, omen });
        return { success: true };
    }

    raiseMystery(twilightId, amount = 5) {
        const twilight = this.twilights.get(twilightId);
        if (!twilight) return { success: false, error: 'TWILIGHT_NOT_FOUND' };
        twilight.mystery += amount;
        this._triggerHook('mysteryRaised', { twilightId, newMystery: twilight.mystery });
        return { success: true };
    }

    levelUpTwilight(twilightId) {
        const twilight = this.twilights.get(twilightId);
        if (!twilight) return { success: false, error: 'TWILIGHT_NOT_FOUND' };
        twilight.level++;
        this._triggerHook('twilightLeveledUp', { twilightId, newLevel: twilight.level });
        return { success: true };
    }

    legendTwilight(twilightId) {
        const twilight = this.twilights.get(twilightId);
        if (!twilight) return { success: false, error: 'TWILIGHT_NOT_FOUND' };
        twilight.status = 'legendary';
        this._triggerHook('twilightLegendized', { twilightId });
        return { success: true };
    }

    calculateTwilightValue(twilightId) {
        const twilight = this.twilights.get(twilightId);
        if (!twilight) return 0;
        return twilight.level * 100 + twilight.mystery * 2 + twilight.omens.length * 30;
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
        if (this.stats.totalTwilights < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTwilights += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { twilights: Array.from(this.twilights.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.twilights) this.twilights = new Map(data.twilights);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, twilightCount: this.twilights.size }; }
}
