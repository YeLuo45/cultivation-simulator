/**
 * CultivationSun.js - 修真日
 * V685 Iteration 8/30 Round 28 - Cultivation Sun
 */
export class CultivationSun {
    constructor(config = {}) {
        this.config = { maxSuns: config.maxSuns || 10, baseRadiance: config.baseRadiance || 20, ...config };
        this.suns = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSuns: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSun', (ctx) => this.getSun(ctx.sunId));
        this.registerTool('recruitSun', (ctx) => this.recruitSun(ctx));
    }

    recruitSun(data) {
        const id = data.sunId || `sun_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const sun = {
            sunId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Sun',
            type: data.type || 'noon',
            radiance: data.radiance || this.config.baseRadiance,
            flares: data.flares || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.suns.set(id, sun);
        this.stats.totalSuns++;
        this._triggerHook('sunRecruited', { sunId: id });
        return { success: true, sun };
    }

    getSun(id) { return this.suns.get(id) ? { ...this.suns.get(id) } : null; }
    listSuns() { return Array.from(this.suns.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.suns.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.suns.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addFlare(sunId, flare) {
        const sun = this.suns.get(sunId);
        if (!sun) return { success: false, error: 'SUN_NOT_FOUND' };
        sun.flares.push(flare);
        this._triggerHook('flareAdded', { sunId, flare });
        return { success: true };
    }

    raiseRadiance(sunId, amount = 5) {
        const sun = this.suns.get(sunId);
        if (!sun) return { success: false, error: 'SUN_NOT_FOUND' };
        sun.radiance += amount;
        this._triggerHook('radianceRaised', { sunId, newRadiance: sun.radiance });
        return { success: true };
    }

    levelUpSun(sunId) {
        const sun = this.suns.get(sunId);
        if (!sun) return { success: false, error: 'SUN_NOT_FOUND' };
        sun.level++;
        this._triggerHook('sunLeveledUp', { sunId, newLevel: sun.level });
        return { success: true };
    }

    legendSun(sunId) {
        const sun = this.suns.get(sunId);
        if (!sun) return { success: false, error: 'SUN_NOT_FOUND' };
        sun.status = 'legendary';
        this._triggerHook('sunLegendized', { sunId });
        return { success: true };
    }

    calculateSunValue(sunId) {
        const sun = this.suns.get(sunId);
        if (!sun) return 0;
        return sun.level * 100 + sun.radiance * 2 + sun.flares.length * 30;
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
        if (this.stats.totalSuns < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSuns += 5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { suns: Array.from(this.suns.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.suns) this.suns = new Map(data.suns);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, sunCount: this.suns.size }; }
}
