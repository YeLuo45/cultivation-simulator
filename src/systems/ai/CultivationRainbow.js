/**
 * CultivationRainbow.js - 修真虹 (Cultivation Rainbow)
 * V811 Iteration 14/30 Round 32 - Cultivation Rainbow
 */
export class CultivationRainbow {
    constructor(config = {}) {
        this.config = { maxRainbows: config.maxRainbows || 20, baseBrilliance: config.baseBrilliance || 20, ...config };
        this.rainbows = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRainbows: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRainbow', (ctx) => this.getRainbow(ctx.rainbowId));
        this.registerTool('recruitRainbow', (ctx) => this.recruitRainbow(ctx));
    }

    recruitRainbow(data) {
        const id = data.id || `rbw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const rainbow = {
            rainbowId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed-rainbow',
            type: data.type || 'solar',
            brilliance: data.brilliance || this.config.baseBrilliance,
            arcs: data.arcs || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.rainbows.set(id, rainbow);
        this.stats.totalRainbows++;
        this._triggerHook('rainbowRecruited', { rainbowId: id });
        return { success: true, rainbow };
    }

    getRainbow(id) { return this.rainbows.get(id) ? { ...this.rainbows.get(id) } : null; }
    listRainbows() { return Array.from(this.rainbows.values()).map(r => ({ ...r })); }
    listByMaster(masterId) { return Array.from(this.rainbows.values()).filter(r => r.masterId === masterId).map(r => ({ ...r })); }
    listLegendary() { return Array.from(this.rainbows.values()).filter(r => r.status === 'legendary').map(r => ({ ...r })); }

    addArc(rainbowId, arc) {
        const rainbow = this.rainbows.get(rainbowId);
        if (!rainbow) return { success: false, error: 'RAINBOW_NOT_FOUND' };
        rainbow.arcs.push(arc);
        this._triggerHook('arcAdded', { rainbowId, arc });
        return { success: true };
    }

    raiseBrilliance(rainbowId, amount = 5) {
        const rainbow = this.rainbows.get(rainbowId);
        if (!rainbow) return { success: false, error: 'RAINBOW_NOT_FOUND' };
        rainbow.brilliance += amount;
        this._triggerHook('brillianceRaised', { rainbowId, newBrilliance: rainbow.brilliance });
        return { success: true };
    }

    levelUpRainbow(rainbowId) {
        const rainbow = this.rainbows.get(rainbowId);
        if (!rainbow) return { success: false, error: 'RAINBOW_NOT_FOUND' };
        rainbow.level++;
        this._triggerHook('rainbowLeveledUp', { rainbowId, newLevel: rainbow.level });
        return { success: true };
    }

    legendRainbow(rainbowId) {
        const rainbow = this.rainbows.get(rainbowId);
        if (!rainbow) return { success: false, error: 'RAINBOW_NOT_FOUND' };
        rainbow.status = 'legendary';
        this._triggerHook('rainbowLegendized', { rainbowId });
        return { success: true };
    }

    calculateRainbowValue(rainbowId) {
        const rainbow = this.rainbows.get(rainbowId);
        if (!rainbow) return 0;
        return rainbow.level * 100 + rainbow.brilliance * 2 + rainbow.arcs.length * 30;
    }

    listVeteran() { return Array.from(this.rainbows.values()).filter(r => r.status === 'veteran').map(r => ({ ...r })); }

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
        if (this.stats.totalRainbows < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRainbows += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { rainbows: Array.from(this.rainbows.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.rainbows) this.rainbows = new Map(data.rainbows);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, rainbowCount: this.rainbows.size }; }
}
