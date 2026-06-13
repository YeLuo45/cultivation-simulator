/**
 * CultivationRoad.js - 修真路
 * V751 Iteration 14/30 Round 30
 */
export class CultivationRoad {
    constructor(config = {}) {
        this.config = { maxRoads: config.maxRoads || 20, baseSteadiness: config.baseSteadiness || 20, ...config };
        this.roads = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRoads: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRoad', (ctx) => this.getRoad(ctx.roadId));
        this.registerTool('recruitRoad', (ctx) => this.recruitRoad(ctx));
    }

    recruitRoad(data) {
        const id = data.roadId || `rd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const road = {
            roadId: id,
            masterId: data.masterId,
            name: data.name,
            type: data.type || 'main',
            steadiness: data.steadiness || this.config.baseSteadiness,
            stones: data.stones || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.roads.set(id, road);
        this.stats.totalRoads++;
        this._triggerHook('roadRecruited', { roadId: id });
        return { success: true, road };
    }

    getRoad(id) { return this.roads.get(id) ? { ...this.roads.get(id) } : null; }
    listRoads() { return Array.from(this.roads.values()).map(r => ({ ...r })); }
    listByMaster(masterId) { return Array.from(this.roads.values()).filter(r => r.masterId === masterId).map(r => ({ ...r })); }
    listLegendary() { return Array.from(this.roads.values()).filter(r => r.status === 'legendary').map(r => ({ ...r })); }

    addStone(roadId, stone) {
        const road = this.roads.get(roadId);
        if (!road) return { success: false, error: 'ROAD_NOT_FOUND' };
        road.stones.push(stone);
        this._triggerHook('stoneAdded', { roadId, stone });
        return { success: true, road: { ...road } };
    }

    raiseSteadiness(roadId, amount = 5) {
        const road = this.roads.get(roadId);
        if (!road) return { success: false, error: 'ROAD_NOT_FOUND' };
        road.steadiness += amount;
        this._triggerHook('steadinessRaised', { roadId, newSteadiness: road.steadiness });
        return { success: true, road: { ...road } };
    }

    levelUpRoad(roadId) {
        const road = this.roads.get(roadId);
        if (!road) return { success: false, error: 'ROAD_NOT_FOUND' };
        road.level++;
        this._triggerHook('roadLeveledUp', { roadId, newLevel: road.level });
        return { success: true, road: { ...road } };
    }

    legendRoad(roadId) {
        const road = this.roads.get(roadId);
        if (!road) return { success: false, error: 'ROAD_NOT_FOUND' };
        road.status = 'legendary';
        this._triggerHook('roadLegendized', { roadId });
        return { success: true, road: { ...road } };
    }

    calculateRoadValue(roadId) {
        const road = this.roads.get(roadId);
        if (!road) return 0;
        return road.level * 100 + road.steadiness * 2 + road.stones.length * 30;
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
        if (this.stats.totalRoads < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRoads += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { roads: Array.from(this.roads.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.roads) this.roads = new Map(data.roads);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, roadCount: this.roads.size }; }
}
