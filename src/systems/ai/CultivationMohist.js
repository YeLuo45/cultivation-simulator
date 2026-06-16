/**
 * CultivationMohist.js - 修真墨家
 * V642 Iteration 25/30 Round 26
 */
export class CultivationMohist {
    constructor(config = {}) {
        this.config = { maxMohists: config.maxMohists || 50, baseLove: config.baseLove || 20, ...config };
        this.mohists = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMohists: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMohist', (ctx) => this.getMohist(ctx.mohistId));
        this.registerTool('recruitMohist', (ctx) => this.recruitMohist(ctx));
    }

    recruitMohist(data) {
        const id = data.mohistId || data.id || `moh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const mohist = {
            mohistId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Mohist',
            type: data.type || 'engineer',
            love: data.love || this.config.baseLove,
            gadgets: data.gadgets || [],
            level: data.level || 1,
            status: data.status || 'novice',
            recruitedAt: Date.now()
        };
        this.mohists.set(id, mohist);
        this.stats.totalMohists++;
        this._triggerHook('mohistRecruited', { mohistId: id });
        return { success: true, mohist };
    }

    getMohist(id) { return this.mohists.get(id) ? { ...this.mohists.get(id) } : null; }
    listMohists() { return Array.from(this.mohists.values()).map(m => ({ ...m })); }
    listByMaster(masterId) { return Array.from(this.mohists.values()).filter(m => m.masterId === masterId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.mohists.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addGadget(mohistId, gadget) {
        const mohist = this.mohists.get(mohistId);
        if (!mohist) return { success: false, error: 'MOHIST_NOT_FOUND' };
        mohist.gadgets.push(gadget);
        this._triggerHook('gadgetAdded', { mohistId, gadget });
        return { success: true };
    }

    expressLove(mohistId, amount = 5) {
        const mohist = this.mohists.get(mohistId);
        if (!mohist) return { success: false, error: 'MOHIST_NOT_FOUND' };
        mohist.love += amount;
        this._triggerHook('loveExpressed', { mohistId, newLove: mohist.love });
        return { success: true };
    }

    levelUpMohist(mohistId) {
        const mohist = this.mohists.get(mohistId);
        if (!mohist) return { success: false, error: 'MOHIST_NOT_FOUND' };
        mohist.level++;
        this._triggerHook('mohistLeveledUp', { mohistId, newLevel: mohist.level });
        return { success: true };
    }

    legendMohist(mohistId) {
        const mohist = this.mohists.get(mohistId);
        if (!mohist) return { success: false, error: 'MOHIST_NOT_FOUND' };
        mohist.status = 'legendary';
        this._triggerHook('mohistLegendized', { mohistId });
        return { success: true };
    }

    calculateMohistValue(mohistId) {
        const mohist = this.mohists.get(mohistId);
        if (!mohist) return 0;
        return mohist.level * 100 + mohist.love * 2 + mohist.gadgets.length * 30;
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
        if (this.stats.totalMohists < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMohists += 25;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { mohists: Array.from(this.mohists.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.mohists) this.mohists = new Map(data.mohists);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, mohistCount: this.mohists.size }; }
}
