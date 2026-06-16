/**
 * CultivationMist.js - 修真雾
 * V803 Iteration 6/30 Round 32
 */
export class CultivationMist {
    constructor(config = {}) {
        this.config = { maxMists: config.maxMists || 20, baseDensity: config.baseDensity || 20, ...config };
        this.mists = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMists: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMist', (ctx) => this.getMist(ctx.mistId));
        this.registerTool('recruitMist', (ctx) => this.recruitMist(ctx));
    }

    recruitMist(data) {
        const id = data.id || `mist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const mist = {
            mistId: id,
            masterId: data.masterId || 'unknown',
            name: data.name || 'Unnamed Mist',
            type: data.type || 'morning',
            density: data.density || this.config.baseDensity,
            wisps: data.wisps || [],
            level: data.level || 1,
            status: data.status || 'novice',
            recruitedAt: Date.now()
        };
        this.mists.set(id, mist);
        this.stats.totalMists++;
        this._triggerHook('mistRecruited', { mistId: id });
        return { success: true, mist };
    }

    getMist(id) { return this.mists.get(id) ? { ...this.mists.get(id) } : null; }
    listMists() { return Array.from(this.mists.values()).map(m => ({ ...m })); }
    listByMaster(masterId) { return Array.from(this.mists.values()).filter(m => m.masterId === masterId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.mists.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addWisp(mistId, wisp) {
        const mist = this.mists.get(mistId);
        if (!mist) return { success: false, error: 'MIST_NOT_FOUND' };
        mist.wisps.push(wisp);
        this._triggerHook('wispAdded', { mistId, wisp });
        return { success: true };
    }

    raiseDensity(mistId, amount = 5) {
        const mist = this.mists.get(mistId);
        if (!mist) return { success: false, error: 'MIST_NOT_FOUND' };
        mist.density += amount;
        this._triggerHook('densityRaised', { mistId, newDensity: mist.density });
        return { success: true };
    }

    levelUpMist(mistId) {
        const mist = this.mists.get(mistId);
        if (!mist) return { success: false, error: 'MIST_NOT_FOUND' };
        mist.level++;
        this._triggerHook('mistLeveledUp', { mistId, newLevel: mist.level });
        return { success: true };
    }

    legendMist(mistId) {
        const mist = this.mists.get(mistId);
        if (!mist) return { success: false, error: 'MIST_NOT_FOUND' };
        mist.status = 'legendary';
        this._triggerHook('mistLegendized', { mistId });
        return { success: true };
    }

    calculateMistValue(mistId) {
        const mist = this.mists.get(mistId);
        if (!mist) return 0;
        return mist.level * 100 + mist.density * 2 + mist.wisps.length * 30;
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
        if (this.stats.totalMists < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMists += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { mists: Array.from(this.mists.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.mists) this.mists = new Map(data.mists);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, mistCount: this.mists.size }; }
}
