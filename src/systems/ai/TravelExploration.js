/**
 * TravelExploration.js - 旅行探索
 * V444 Iteration 6/15 Round 16 - Travel Exploration
 *
 * 旅行探索系统: 管理修士的旅程规划、旅途推进、发现地点、遭遇事件。
 */

export class TravelExploration {
    constructor(config = {}) {
        this.config = { maxJourneys: config.maxJourneys || 100, baseDistance: config.baseDistance || 1000, ...config };
        this.journeys = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalJourneys: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getJourney', (ctx) => this.getJourney(ctx.journeyId));
        this.registerTool('planJourney', (ctx) => this.planJourney(ctx));
    }

    planJourney(data) {
        const id = data.id || `jny_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const journey = {
            journeyId: id,
            travelerId: data.travelerId,
            name: data.name || 'Unnamed Journey',
            destination: data.destination || 'Unknown',
            distance: data.distance || this.config.baseDistance,
            discoveries: [],
            encounters: [],
            status: 'planned',
            createdAt: Date.now()
        };
        this.journeys.set(id, journey);
        this.stats.totalJourneys++;
        this._triggerHook('journeyPlanned', { journeyId: id });
        return { success: true, journey };
    }

    getJourney(id) { return this.journeys.get(id) ? { ...this.journeys.get(id) } : null; }
    listJourneys() { return Array.from(this.journeys.values()).map(j => ({ ...j })); }
    listByTraveler(travelerId) { return Array.from(this.journeys.values()).filter(j => j.travelerId === travelerId).map(j => ({ ...j })); }
    listOngoing() { return Array.from(this.journeys.values()).filter(j => j.status === 'ongoing').map(j => ({ ...j })); }

    travelStep(journeyId, amount = 10) {
        const journey = this.journeys.get(journeyId);
        if (!journey) return { success: false, error: 'JOURNEY_NOT_FOUND' };
        if (journey.status === 'planned') journey.status = 'ongoing';
        journey.distance = Math.max(0, journey.distance - amount);
        if (journey.distance === 0 && journey.status !== 'completed') {
            journey.status = 'completed';
        }
        this._triggerHook('journeyTraveled', { journeyId, remainingDistance: journey.distance });
        return { success: true, journey: { ...journey } };
    }

    discoverPlace(journeyId, place) {
        const journey = this.journeys.get(journeyId);
        if (!journey) return { success: false, error: 'JOURNEY_NOT_FOUND' };
        const entry = { name: place, discoveredAt: Date.now() };
        journey.discoveries.push(entry);
        this._triggerHook('placeDiscovered', { journeyId, place: entry });
        return { success: true, discovery: entry };
    }

    encounter(journeyId, type) {
        const journey = this.journeys.get(journeyId);
        if (!journey) return { success: false, error: 'JOURNEY_NOT_FOUND' };
        const entry = { type, encounteredAt: Date.now() };
        journey.encounters.push(entry);
        this._triggerHook('encounterOccurred', { journeyId, encounter: entry });
        return { success: true, encounter: entry };
    }

    completeJourney(journeyId) {
        const journey = this.journeys.get(journeyId);
        if (!journey) return { success: false, error: 'JOURNEY_NOT_FOUND' };
        journey.status = 'completed';
        journey.distance = 0;
        this._triggerHook('journeyCompleted', { journeyId });
        return { success: true, journey: { ...journey } };
    }

    calculateExplorationProgress(journeyId) {
        const journey = this.journeys.get(journeyId);
        if (!journey) return 0;
        const distanceProgress = journey.distance > 0 ? (100 - journey.distance) : 100;
        return distanceProgress + journey.discoveries.length * 5 + journey.encounters.length * 3;
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
        this.config.maxJourneys += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { journeys: Array.from(this.journeys.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.journeys) this.journeys = new Map(data.journeys);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, journeyCount: this.journeys.size }; }
}
