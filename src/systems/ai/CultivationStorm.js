/**
 * CultivationStorm.js - 修真暴 (Cultivation Storm system)
 * V808 Iteration 11/30 Round 32
 */
export class CultivationStorm {
    constructor(config = {}) {
        this.config = { maxStorms: config.maxStorms || 20, baseIntensity: config.baseIntensity || 20, ...config };
        this.storms = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalStorms: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getStorm', (ctx) => this.getStorm(ctx.stormId));
        this.registerTool('recruitStorm', (ctx) => this.recruitStorm(ctx));
    }

    recruitStorm(data) {
        const id = data.id || `strm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const storm = {
            stormId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Storm',
            type: data.type || 'thunder',
            intensity: data.intensity || this.config.baseIntensity,
            strikes: data.strikes || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.storms.set(id, storm);
        this.stats.totalStorms++;
        this._triggerHook('stormRecruited', { stormId: id });
        return { success: true, storm };
    }

    getStorm(id) { return this.storms.get(id) ? { ...this.storms.get(id) } : null; }
    listStorms() { return Array.from(this.storms.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.storms.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.storms.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addStrike(stormId, strike) {
        const storm = this.storms.get(stormId);
        if (!storm) return { success: false, error: 'STORM_NOT_FOUND' };
        storm.strikes.push(strike);
        this._triggerHook('strikeAdded', { stormId, newCount: storm.strikes.length });
        return { success: true };
    }

    raiseIntensity(stormId, amount = 5) {
        const storm = this.storms.get(stormId);
        if (!storm) return { success: false, error: 'STORM_NOT_FOUND' };
        storm.intensity += amount;
        this._triggerHook('intensityRaised', { stormId, newIntensity: storm.intensity });
        return { success: true };
    }

    levelUpStorm(stormId) {
        const storm = this.storms.get(stormId);
        if (!storm) return { success: false, error: 'STORM_NOT_FOUND' };
        storm.level++;
        this._triggerHook('stormLeveledUp', { stormId, newLevel: storm.level });
        return { success: true };
    }

    legendStorm(stormId) {
        const storm = this.storms.get(stormId);
        if (!storm) return { success: false, error: 'STORM_NOT_FOUND' };
        storm.status = 'legendary';
        this._triggerHook('stormLegendized', { stormId });
        return { success: true };
    }

    calculateStormValue(stormId) {
        const storm = this.storms.get(stormId);
        if (!storm) return 0;
        return storm.level * 100 + storm.intensity * 2 + storm.strikes.length * 30;
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
        if (this.stats.totalStorms < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxStorms += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { storms: Array.from(this.storms.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.storms) this.storms = new Map(data.storms);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, stormCount: this.storms.size }; }
}
