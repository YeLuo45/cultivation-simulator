/**
 * CultivationJourney.js - 修真旅途
 * V453 Iteration 15/15 FINAL Round 16
 */
export class CultivationJourney {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxJourney: config.maxJourney || 100, baseStamina: config.baseStamina || 100, ...config };
        this.journeys = new Map();
        this.metrics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalJourneys: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getJourney', (ctx) => this.getJourney(ctx.journeyId));
        this.registerTool('getMetrics', (ctx) => this.getMetrics(ctx.journeyId));
    }

    startJourney(data) {
        const id = data.id || `cj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const journey = { journeyId: id, name: data.name || 'Cultivation Journey', cultivatorId: data.cultivatorId, realm: data.realm || 'mortal', tribulationsPassed: 0, realmsAttained: 0, treasuresFound: 0, enemiesDefeated: 0, dao: data.dao || 'none', status: 'in-progress', startedAt: Date.now(), lastRefresh: Date.now() };
        this.journeys.set(id, journey);
        this.metrics.set(id, { stamina: this.config.baseStamina, qi: 50, daoInsight: 0, karmic: 0, comprehension: 0 });
        this.stats.totalJourneys++;
        this._triggerHook('journeyStarted', { journeyId: id });
        return { success: true, journey };
    }

    getJourney(id) { return this.journeys.get(id) ? { ...this.journeys.get(id) } : null; }
    listJourneys() { return Array.from(this.journeys.values()).map(j => ({ ...j })); }
    listByCultivator(cultivatorId) { return Array.from(this.journeys.values()).filter(j => j.cultivatorId === cultivatorId).map(j => ({ ...j })); }
    listByStatus(status) { return Array.from(this.journeys.values()).filter(j => j.status === status).map(j => ({ ...j })); }

    setMetrics(journeyId, metrics) {
        const current = this.metrics.get(journeyId);
        if (!current) return { success: false, error: 'JOURNEY_NOT_FOUND' };
        this.metrics.set(journeyId, { ...current, ...metrics, updatedAt: Date.now() });
        return { success: true };
    }

    getMetrics(journeyId) { return this.metrics.get(journeyId) ? { ...this.metrics.get(journeyId) } : null; }

    refreshJourney(journeyId) {
        const journey = this.journeys.get(journeyId);
        if (!journey) return { success: false, error: 'JOURNEY_NOT_FOUND' };
        journey.lastRefresh = Date.now();
        this._triggerHook('journeyRefreshed', { journeyId });
        return { success: true };
    }

    passTribulation(journeyId) {
        const journey = this.journeys.get(journeyId);
        if (!journey) return { success: false, error: 'JOURNEY_NOT_FOUND' };
        journey.tribulationsPassed++;
        if (journey.tribulationsPassed % 3 === 0) journey.realmsAttained++;
        this._triggerHook('tribulationPassed', { journeyId });
        return { success: true };
    }

    findTreasure(journeyId) {
        const journey = this.journeys.get(journeyId);
        if (!journey) return { success: false, error: 'JOURNEY_NOT_FOUND' };
        journey.treasuresFound++;
        this._triggerHook('treasureFound', { journeyId });
        return { success: true };
    }

    defeatEnemy(journeyId) {
        const journey = this.journeys.get(journeyId);
        if (!journey) return { success: false, error: 'JOURNEY_NOT_FOUND' };
        journey.enemiesDefeated++;
        this._triggerHook('enemyDefeated', { journeyId });
        return { success: true };
    }

    completeJourney(journeyId) {
        const journey = this.journeys.get(journeyId);
        if (!journey) return { success: false, error: 'JOURNEY_NOT_FOUND' };
        journey.status = 'completed';
        this._triggerHook('journeyCompleted', { journeyId });
        return { success: true };
    }

    calculateCultivationProgress(journeyId) {
        const journey = this.journeys.get(journeyId);
        if (!journey) return 0;
        return journey.tribulationsPassed * 10 + journey.realmsAttained * 100 + journey.treasuresFound * 2 + journey.enemiesDefeated * 3 + journey.dao.length;
    }

    deleteJourney(journeyId) {
        if (!this.journeys.has(journeyId)) return { success: false, error: 'JOURNEY_NOT_FOUND' };
        this.journeys.delete(journeyId);
        this.metrics.delete(journeyId);
        this._triggerHook('journeyDeleted', { journeyId });
        return { success: true };
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
        if (this.stats.totalJourneys < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { journeys: Array.from(this.journeys.entries()), metrics: Array.from(this.metrics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.journeys) this.journeys = new Map(data.journeys);
        if (data.metrics) this.metrics = new Map(data.metrics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, journeyCount: this.journeys.size }; }
}