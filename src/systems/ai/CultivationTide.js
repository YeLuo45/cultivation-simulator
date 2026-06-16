/**
 * CultivationTide.js - 修真潮汐系统
 * V743 Iteration 6/30 Round 30
 */
export class CultivationTide {
    constructor(config = {}) {
        this.config = { maxTides: config.maxTides || 20, basePower: config.basePower || 20, ...config };
        this.tides = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTides: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTide', (ctx) => this.getTide(ctx.tideId));
        this.registerTool('recruitTide', (ctx) => this.recruitTide(ctx));
    }

    recruitTide(data) {
        const id = data.id || `tide_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const tide = {
            tideId: id,
            masterId: data.masterId,
            name: data.name || `Tide-${id.slice(-5)}`,
            type: data.type || 'high',
            power: data.power || this.config.basePower,
            currents: data.currents || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.tides.set(id, tide);
        this.stats.totalTides++;
        this._triggerHook('tideRecruited', { tideId: id });
        return { success: true, tide };
    }

    getTide(id) { return this.tides.get(id) ? { ...this.tides.get(id) } : null; }
    listTides() { return Array.from(this.tides.values()).map(t => ({ ...t })); }
    listByMaster(masterId) { return Array.from(this.tides.values()).filter(t => t.masterId === masterId).map(t => ({ ...t })); }
    listLegendary() { return Array.from(this.tides.values()).filter(t => t.status === 'legendary').map(t => ({ ...t })); }

    addCurrent(tideId, current) {
        const tide = this.tides.get(tideId);
        if (!tide) return { success: false, error: 'TIDE_NOT_FOUND' };
        tide.currents.push(current);
        this._triggerHook('currentAdded', { tideId, current });
        return { success: true };
    }

    raisePower(tideId, amount = 5) {
        const tide = this.tides.get(tideId);
        if (!tide) return { success: false, error: 'TIDE_NOT_FOUND' };
        tide.power += amount;
        this._triggerHook('powerRaised', { tideId, newPower: tide.power });
        return { success: true };
    }

    levelUpTide(tideId) {
        const tide = this.tides.get(tideId);
        if (!tide) return { success: false, error: 'TIDE_NOT_FOUND' };
        tide.level++;
        this._triggerHook('tideLeveledUp', { tideId, newLevel: tide.level });
        return { success: true };
    }

    legendTide(tideId) {
        const tide = this.tides.get(tideId);
        if (!tide) return { success: false, error: 'TIDE_NOT_FOUND' };
        tide.status = 'legendary';
        this._triggerHook('tideLegendized', { tideId });
        return { success: true };
    }

    calculateTideValue(tideId) {
        const tide = this.tides.get(tideId);
        if (!tide) return 0;
        return tide.level * 100 + tide.power * 2 + tide.currents.length * 30;
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
        if (this.stats.totalTides < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTides += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { tides: Array.from(this.tides.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.tides) this.tides = new Map(data.tides);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, tideCount: this.tides.size }; }
}
