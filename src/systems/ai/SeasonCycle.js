/**
 * SeasonCycle.js - 季节循环
 * V351 Iteration 3/9 Round 8
 */
export class SeasonCycle {
    constructor(config = {}) {
        this.config = { seasonDuration: config.seasonDuration || 100000, startSeason: config.startSeason || 'spring', ...config };
        this.currentSeason = this.config.startSeason;
        this.seasonLog = new Map();
        this.regionSeason = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalChanges: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSeason', () => this.currentSeason);
        this.registerTool('advanceSeason', () => this.advanceSeason());
    }

    listSeasons() { return ['spring', 'summer', 'autumn', 'winter']; }
    getCurrentSeason() { return this.currentSeason; }

    advanceSeason() {
        const seasons = this.listSeasons();
        const idx = seasons.indexOf(this.currentSeason);
        const next = seasons[(idx + 1) % seasons.length];
        this.currentSeason = next;
        this.stats.totalChanges++;
        const logId = `sl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        this.seasonLog.set(logId, { logId, from: seasons[idx], to: next, at: Date.now() });
        this._triggerHook('seasonChanged', { from: seasons[idx], to: next });
        return { success: true, currentSeason: this.currentSeason, from: seasons[idx], to: next };
    }

    setRegionSeason(regionId, season) {
        if (!this.listSeasons().includes(season)) return { success: false, error: 'INVALID_SEASON' };
        this.regionSeason.set(regionId, season);
        return { success: true };
    }

    getRegionSeason(regionId) { return this.regionSeason.get(regionId) || this.currentSeason; }

    getSeasonLog() { return Array.from(this.seasonLog.values()).map(l => ({ ...l })); }

    getSeasonEffect(season) {
        const effects = { spring: { growth: 0.2, healing: 0.1 }, summer: { fire: 0.2, energy: 0.1 }, autumn: { harvest: 0.2, wind: 0.1 }, winter: { ice: 0.2, defense: 0.1 } };
        return effects[season] || {};
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
        if (this.stats.totalChanges < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.seasonDuration = Math.max(1000, this.config.seasonDuration - 10000);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { currentSeason: this.currentSeason, seasonLog: Array.from(this.seasonLog.entries()), regionSeason: Array.from(this.regionSeason.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.currentSeason) this.currentSeason = data.currentSeason;
        if (data.seasonLog) this.seasonLog = new Map(data.seasonLog);
        if (data.regionSeason) this.regionSeason = new Map(data.regionSeason);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, currentSeason: this.currentSeason }; }
}