/**
 * CultivationNoon.js - 修真正午
 * V819 Iteration 22/30 Round 32 - Cultivation Noon
 */
export class CultivationNoon {
    constructor(config = {}) {
        this.config = { maxNoons: config.maxNoons || 20, baseBrightness: config.baseBrightness || 20, ...config };
        this.noons = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalNoons: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getNoon', (ctx) => this.getNoon(ctx.noonId));
        this.registerTool('recruitNoon', (ctx) => this.recruitNoon(ctx));
    }

    recruitNoon(data) {
        const id = data.noonId || `noon_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const noon = {
            noonId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Noon',
            type: data.type || 'midday',
            brightness: data.brightness || this.config.baseBrightness,
            heats: data.heats || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.noons.set(id, noon);
        this.stats.totalNoons++;
        this._triggerHook('noonRecruited', { noonId: id });
        return { success: true, noon };
    }

    getNoon(id) { return this.noons.get(id) ? { ...this.noons.get(id) } : null; }
    listNoons() { return Array.from(this.noons.values()).map(n => ({ ...n })); }
    listByMaster(masterId) { return Array.from(this.noons.values()).filter(n => n.masterId === masterId).map(n => ({ ...n })); }
    listLegendary() { return Array.from(this.noons.values()).filter(n => n.status === 'legendary').map(n => ({ ...n })); }

    addHeat(noonId, heat) {
        const noon = this.noons.get(noonId);
        if (!noon) return { success: false, error: 'NOON_NOT_FOUND' };
        noon.heats.push(heat);
        this._triggerHook('heatAdded', { noonId, heat });
        return { success: true };
    }

    raiseBrightness(noonId, amount = 5) {
        const noon = this.noons.get(noonId);
        if (!noon) return { success: false, error: 'NOON_NOT_FOUND' };
        noon.brightness += amount;
        this._triggerHook('brightnessRaised', { noonId, newBrightness: noon.brightness });
        return { success: true };
    }

    levelUpNoon(noonId) {
        const noon = this.noons.get(noonId);
        if (!noon) return { success: false, error: 'NOON_NOT_FOUND' };
        noon.level++;
        this._triggerHook('noonLeveledUp', { noonId, newLevel: noon.level });
        return { success: true };
    }

    legendNoon(noonId) {
        const noon = this.noons.get(noonId);
        if (!noon) return { success: false, error: 'NOON_NOT_FOUND' };
        noon.status = 'legendary';
        this._triggerHook('noonLegendized', { noonId });
        return { success: true };
    }

    calculateNoonValue(noonId) {
        const noon = this.noons.get(noonId);
        if (!noon) return 0;
        return noon.level * 100 + noon.brightness * 2 + noon.heats.length * 30;
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
        if (this.stats.totalNoons < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxNoons += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { noons: Array.from(this.noons.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.noons) this.noons = new Map(data.noons);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, noonCount: this.noons.size }; }
}
