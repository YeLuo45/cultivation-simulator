/**
 * CultivationMountain.js - 修真山系统
 * V688 Iteration 11/30 Round 28
 */
export class CultivationMountain {
    constructor(config = {}) {
        this.config = { maxMountains: config.maxMountains || 20, baseAltitude: config.baseAltitude || 20, ...config };
        this.mountains = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMountains: 0, legendaryCount: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMountain', (ctx) => this.getMountain(ctx.mountainId));
        this.registerTool('recruitMountain', (ctx) => this.recruitMountain(ctx));
    }

    recruitMountain(data) {
        if (this.mountains.size >= this.config.maxMountains) return { success: false, error: 'MAX_MOUNTAINS_REACHED' };
        const id = data.mountainId || `mtn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const mountain = { mountainId: id, masterId: data.masterId, name: data.name || 'unnamed', type: data.type || 'jade', altitude: data.altitude || this.config.baseAltitude, peaks: data.peaks || [], level: 1, status: 'novice', createdAt: Date.now() };
        this.mountains.set(id, mountain);
        this.stats.totalMountains++;
        this._triggerHook('mountainRecruited', { mountainId: id });
        return { success: true, mountain };
    }

    getMountain(id) { return this.mountains.get(id) ? { ...this.mountains.get(id) } : null; }
    listMountains() { return Array.from(this.mountains.values()).map(m => ({ ...m })); }
    listByMaster(masterId) { return Array.from(this.mountains.values()).filter(m => m.masterId === masterId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.mountains.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addPeak(mountainId, peak) {
        const mountain = this.mountains.get(mountainId);
        if (!mountain) return { success: false, error: 'MOUNTAIN_NOT_FOUND' };
        mountain.peaks.push(peak);
        this._triggerHook('peakAdded', { mountainId, peak });
        return { success: true };
    }

    raiseAltitude(mountainId, amount = 5) {
        const mountain = this.mountains.get(mountainId);
        if (!mountain) return { success: false, error: 'MOUNTAIN_NOT_FOUND' };
        mountain.altitude += amount;
        this._triggerHook('altitudeRaised', { mountainId, newAltitude: mountain.altitude });
        return { success: true };
    }

    levelUpMountain(mountainId) {
        const mountain = this.mountains.get(mountainId);
        if (!mountain) return { success: false, error: 'MOUNTAIN_NOT_FOUND' };
        mountain.level++;
        this._triggerHook('mountainLeveledUp', { mountainId, newLevel: mountain.level });
        return { success: true };
    }

    legendMountain(mountainId) {
        const mountain = this.mountains.get(mountainId);
        if (!mountain) return { success: false, error: 'MOUNTAIN_NOT_FOUND' };
        mountain.status = 'legendary';
        this.stats.legendaryCount++;
        this._triggerHook('mountainLegendized', { mountainId });
        return { success: true };
    }

    calculateMountainValue(mountainId) {
        const mountain = this.mountains.get(mountainId);
        if (!mountain) return 0;
        return mountain.level * 100 + mountain.altitude * 2 + (mountain.peaks ? mountain.peaks.length : 0) * 30;
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
        if (this.stats.totalMountains < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMountains += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { mountains: Array.from(this.mountains.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.mountains) this.mountains = new Map(data.mountains);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, mountainCount: this.mountains.size }; }
}
