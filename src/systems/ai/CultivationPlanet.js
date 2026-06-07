/**
 * CultivationPlanet.js - 修真行星系统
 * V687 Iteration 10/30 Round 28 - Cultivation Planet
 *
 * 融合6大设计系统:
 * - generic-agent: 行星自循环
 * - chatdev: 行星主协调
 * - nanobot: 卫星mesh
 * - claude-code: 行星分析工具
 * - thunderbolt: 行星持久化
 * - ruflo: 行星Hook
 */

export class CultivationPlanet {
    constructor(config = {}) {
        this.config = { maxPlanets: config.maxPlanets || 15, baseMass: config.baseMass || 20, ...config };
        this.planets = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPlanets: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPlanet', (ctx) => this.getPlanet(ctx.planetId));
        this.registerTool('recruitPlanet', (ctx) => this.recruitPlanet(ctx));
    }

    recruitPlanet(data) {
        const id = data.planetId || `pln_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const planet = {
            planetId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Planet',
            type: data.type || 'rocky',
            mass: data.mass || this.config.baseMass,
            moons: data.moons || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.planets.set(id, planet);
        this.stats.totalPlanets++;
        this._triggerHook('planetRecruited', { planetId: id });
        return { success: true, planet };
    }

    getPlanet(id) { return this.planets.get(id) ? { ...this.planets.get(id) } : null; }
    listPlanets() { return Array.from(this.planets.values()).map(p => ({ ...p })); }
    listByMaster(masterId) { return Array.from(this.planets.values()).filter(p => p.masterId === masterId).map(p => ({ ...p })); }
    listLegendary() { return Array.from(this.planets.values()).filter(p => p.status === 'legendary').map(p => ({ ...p })); }

    addMoon(planetId, moon) {
        const planet = this.planets.get(planetId);
        if (!planet) return { success: false, error: 'PLANET_NOT_FOUND' };
        planet.moons.push(moon);
        this._triggerHook('moonAdded', { planetId, moon });
        return { success: true, planet: { ...planet } };
    }

    raiseMass(planetId, amount = 5) {
        const planet = this.planets.get(planetId);
        if (!planet) return { success: false, error: 'PLANET_NOT_FOUND' };
        planet.mass += amount;
        this._triggerHook('massRaised', { planetId, newMass: planet.mass });
        return { success: true };
    }

    levelUpPlanet(planetId) {
        const planet = this.planets.get(planetId);
        if (!planet) return { success: false, error: 'PLANET_NOT_FOUND' };
        planet.level++;
        this._triggerHook('planetLeveledUp', { planetId, newLevel: planet.level });
        return { success: true };
    }

    legendPlanet(planetId) {
        const planet = this.planets.get(planetId);
        if (!planet) return { success: false, error: 'PLANET_NOT_FOUND' };
        planet.status = 'legendary';
        this._triggerHook('planetLegendized', { planetId });
        return { success: true };
    }

    calculatePlanetValue(planetId) {
        const planet = this.planets.get(planetId);
        if (!planet) return 0;
        return planet.level * 100 + planet.mass * 2 + planet.moons.length * 30;
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
        if (this.stats.totalPlanets < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPlanets += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { planets: Array.from(this.planets.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.planets) this.planets = new Map(data.planets);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, planetCount: this.planets.size }; }
}
