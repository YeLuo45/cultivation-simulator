/**
 * CultivationSeason.js - 修真季
 * V582 Iteration 5/20 Round 24
 *
 * 修真季系统: 管理修真季的开启、花期添加、生机提升、升级和结束。
 */

export class CultivationSeason {
    constructor(config = {}) {
        this.config = { maxSeasons: config.maxSeasons || 30, baseVitality: config.baseVitality || 20, ...config };
        this.seasons = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSeasons: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSeason', (ctx) => this.getSeason(ctx.seasonId));
        this.registerTool('openSeason', (ctx) => this.openSeason(ctx));
    }

    openSeason(data) {
        const id = data.id || `sea_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const season = {
            seasonId: id,
            recorderId: data.recorderId,
            name: data.name || 'Unnamed Season',
            type: data.type || 'spring',
            vitality: data.vitality || this.config.baseVitality,
            blooms: [],
            level: 1,
            status: 'approaching',
            createdAt: Date.now()
        };
        this.seasons.set(id, season);
        this.stats.totalSeasons++;
        this._triggerHook('seasonOpened', { seasonId: id });
        return { success: true, season };
    }

    getSeason(id) { return this.seasons.get(id) ? { ...this.seasons.get(id) } : null; }
    listSeasons() { return Array.from(this.seasons.values()).map(s => ({ ...s })); }
    listByRecorder(recorderId) { return Array.from(this.seasons.values()).filter(s => s.recorderId === recorderId).map(s => ({ ...s })); }
    listActive() { return Array.from(this.seasons.values()).filter(s => s.status === 'active').map(s => ({ ...s })); }

    addBloom(seasonId, bloom) {
        const season = this.seasons.get(seasonId);
        if (!season) return { success: false, error: 'SEASON_NOT_FOUND' };
        const entry = { name: bloom, addedAt: Date.now() };
        season.blooms.push(entry);
        if (season.status === 'approaching') season.status = 'active';
        this._triggerHook('bloomAdded', { seasonId, bloom: entry });
        return { success: true, bloom: entry };
    }

    increaseVitality(seasonId, amount = 5) {
        const season = this.seasons.get(seasonId);
        if (!season) return { success: false, error: 'SEASON_NOT_FOUND' };
        season.vitality += amount;
        if (season.status === 'approaching') season.status = 'active';
        this._triggerHook('vitalityIncreased', { seasonId, newVitality: season.vitality });
        return { success: true };
    }

    levelUpSeason(seasonId) {
        const season = this.seasons.get(seasonId);
        if (!season) return { success: false, error: 'SEASON_NOT_FOUND' };
        season.level++;
        this._triggerHook('seasonLeveledUp', { seasonId, newLevel: season.level });
        return { success: true };
    }

    retireSeason(seasonId) {
        const season = this.seasons.get(seasonId);
        if (!season) return { success: false, error: 'SEASON_NOT_FOUND' };
        season.status = 'ending';
        this._triggerHook('seasonRetired', { seasonId });
        return { success: true, season: { ...season } };
    }

    calculateSeasonValue(seasonId) {
        const season = this.seasons.get(seasonId);
        if (!season) return 0;
        return season.level * 100 + season.vitality * 2 + season.blooms.length * 30;
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
        if (this.stats.totalSeasons < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSeasons += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { seasons: Array.from(this.seasons.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.seasons) this.seasons = new Map(data.seasons);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, seasonCount: this.seasons.size }; }
}
