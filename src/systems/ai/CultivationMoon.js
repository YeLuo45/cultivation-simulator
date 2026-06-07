/**
 * CultivationMoon.js - 修真月系统
 * V684 Iteration 7/30 Round 28
 *
 * 融合6大设计系统:
 * - generic-agent: 月相自循环
 * - chatdev: 月主角色协调
 * - nanobot: 月相mesh
 * - claude-code: 月相分析工具
 * - thunderbolt: 月相持久化
 * - ruflo: 月相Hook
 */

export class CultivationMoon {
    constructor(config = {}) {
        this.config = { maxMoons: config.maxMoons || 12, baseLuminosity: config.baseLuminosity || 20, ...config };
        this.moons = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMoons: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMoon', (ctx) => this.getMoon(ctx.moonId));
        this.registerTool('recruitMoon', (ctx) => this.recruitMoon(ctx));
    }

    recruitMoon(data) {
        const id = data.moonId || `mon_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const moon = {
            moonId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Moon',
            type: data.type || 'crescent',
            luminosity: data.luminosity || this.config.baseLuminosity,
            phases: data.phases || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.moons.set(id, moon);
        this.stats.totalMoons++;
        this._triggerHook('moonRecruited', { moonId: id });
        return { success: true, moon };
    }

    getMoon(id) { return this.moons.get(id) ? { ...this.moons.get(id) } : null; }
    listMoons() { return Array.from(this.moons.values()).map(m => ({ ...m })); }
    listByMaster(masterId) { return Array.from(this.moons.values()).filter(m => m.masterId === masterId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.moons.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addPhase(moonId, phase) {
        const moon = this.moons.get(moonId);
        if (!moon) return { success: false, error: 'MOON_NOT_FOUND' };
        moon.phases.push(phase);
        this._triggerHook('phaseAdded', { moonId, phase });
        return { success: true, moon: { ...moon } };
    }

    raiseLuminosity(moonId, amount = 5) {
        const moon = this.moons.get(moonId);
        if (!moon) return { success: false, error: 'MOON_NOT_FOUND' };
        moon.luminosity += amount;
        this._triggerHook('luminosityRaised', { moonId, newLuminosity: moon.luminosity });
        return { success: true, moon: { ...moon } };
    }

    levelUpMoon(moonId) {
        const moon = this.moons.get(moonId);
        if (!moon) return { success: false, error: 'MOON_NOT_FOUND' };
        moon.level++;
        this._triggerHook('moonLeveledUp', { moonId, newLevel: moon.level });
        return { success: true, moon: { ...moon } };
    }

    legendMoon(moonId) {
        const moon = this.moons.get(moonId);
        if (!moon) return { success: false, error: 'MOON_NOT_FOUND' };
        moon.status = 'legendary';
        this._triggerHook('moonLegendized', { moonId });
        return { success: true, moon: { ...moon } };
    }

    calculateMoonValue(moonId) {
        const moon = this.moons.get(moonId);
        if (!moon) return 0;
        return moon.level * 100 + moon.luminosity * 2 + moon.phases.length * 30;
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
        if (this.stats.totalMoons < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMoons += 6;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { moons: Array.from(this.moons.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.moons) this.moons = new Map(data.moons);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, moonCount: this.moons.size }; }
}
