/**
 * CultivationEra.js - 修真纪元系统
 * V579 Iteration 2/20 Round 24
 */
export class CultivationEra {
    constructor(config = {}) {
        this.config = { maxEras: config.maxEras || 30, baseDuration: config.baseDuration || 20, ...config };
        this.eras = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEras: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEra', (ctx) => this.getEra(ctx.eraId));
        this.registerTool('openEra', (ctx) => this.openEra(ctx));
    }

    openEra(data) {
        const id = data.eraId || `era_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const era = {
            eraId: id,
            chroniclerId: data.chroniclerId,
            name: data.name || 'Unnamed Era',
            type: data.type || 'mythic',
            duration: data.duration || this.config.baseDuration,
            events: data.events || [],
            level: 1,
            status: 'dawning',
            createdAt: Date.now()
        };
        this.eras.set(id, era);
        this.stats.totalEras++;
        this._triggerHook('eraOpened', { eraId: id });
        return { success: true, era };
    }

    getEra(id) { return this.eras.get(id) ? { ...this.eras.get(id) } : null; }
    listEras() { return Array.from(this.eras.values()).map(e => ({ ...e })); }
    listByChronicler(chroniclerId) { return Array.from(this.eras.values()).filter(e => e.chroniclerId === chroniclerId).map(e => ({ ...e })); }
    listEnding() { return Array.from(this.eras.values()).filter(e => e.status === 'ending').map(e => ({ ...e })); }

    addEvent(eraId, event) {
        const era = this.eras.get(eraId);
        if (!era) return { success: false, error: 'ERA_NOT_FOUND' };
        era.events.push(event);
        this._triggerHook('eventAdded', { eraId, event });
        return { success: true };
    }

    increaseDuration(eraId, amount = 5) {
        const era = this.eras.get(eraId);
        if (!era) return { success: false, error: 'ERA_NOT_FOUND' };
        era.duration += amount;
        this._triggerHook('durationIncreased', { eraId, newDuration: era.duration });
        return { success: true };
    }

    levelUpEra(eraId) {
        const era = this.eras.get(eraId);
        if (!era) return { success: false, error: 'ERA_NOT_FOUND' };
        era.level++;
        this._triggerHook('eraLeveledUp', { eraId, newLevel: era.level });
        return { success: true };
    }

    endEra(eraId) {
        const era = this.eras.get(eraId);
        if (!era) return { success: false, error: 'ERA_NOT_FOUND' };
        era.status = 'ending';
        this._triggerHook('eraEnded', { eraId });
        return { success: true };
    }

    calculateEraValue(eraId) {
        const era = this.eras.get(eraId);
        if (!era) return 0;
        return era.level * 100 + era.duration * 2 + era.events.length * 30;
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
        if (this.stats.totalEras < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxEras += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { eras: Array.from(this.eras.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.eras) this.eras = new Map(data.eras);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, eraCount: this.eras.size }; }
}
