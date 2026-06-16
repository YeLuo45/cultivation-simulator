/**
 * CosmicEvents.js - 宇宙异象
 * V355 Iteration 7/9 Round 8
 */
export class CosmicEvents {
    constructor(config = {}) {
        this.config = { maxEvents: config.maxEvents || 100, basePower: config.basePower || 10, ...config };
        this.events = new Map();
        this.omen = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEvents: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const types = [
            { typeId: 'comet', name: 'Comet Pass', power: 50, effect: { luck: 2 } },
            { typeId: 'eclipse', name: 'Solar Eclipse', power: 100, effect: { dark: 1 } },
            { typeId: 'meteor', name: 'Meteor Shower', power: 200, effect: { destruction: 2 } },
            { typeId: 'aurora', name: 'Aurora', power: 30, effect: { enlightenment: 1 } }
        ];
        for (const t of types) this.config[`type_${t.typeId}`] = t;
    }

    _registerDefaultTools() {
        this.registerTool('getEvent', (ctx) => this.getEvent(ctx.eventId));
        this.registerTool('createEvent', (ctx) => this.createEvent(ctx));
    }

    createEvent(data) {
        const id = data.id || `ce_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const type = this.config[`type_${data.typeId}`];
        const event = { eventId: id, typeId: data.typeId || 'comet', name: data.name || (type?.name || 'Event'), power: data.power || (type?.power || this.config.basePower), effect: data.effect || (type?.effect || {}), occurredAt: Date.now() };
        this.events.set(id, event);
        this.stats.totalEvents++;
        this._triggerHook('cosmicEventOccurred', { eventId: id, typeId: event.typeId });
        return { success: true, event };
    }

    getEvent(id) { return this.events.get(id) ? { ...this.events.get(id) } : null; }
    listEvents() { return Array.from(this.events.values()).map(e => ({ ...e })); }
    listByType(typeId) { return Array.from(this.events.values()).filter(e => e.typeId === typeId).map(e => ({ ...e })); }
    listCosmicTypes() { return Object.keys(this.config).filter(k => k.startsWith('type_')).map(k => k.replace('type_', '')); }

    createOmen(data) {
        const id = data.id || `om_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const omen = { omenId: id, typeId: data.typeId, region: data.region || 'all', strength: data.strength || 1, createdAt: Date.now() };
        this.omen.set(id, omen);
        this._triggerHook('omenCreated', { omenId: id });
        return { success: true, omen };
    }

    getOmen(id) { return this.omen.get(id) ? { ...this.omen.get(id) } : null; }
    listOmens() { return Array.from(this.omen.values()).map(o => ({ ...o })); }
    listOmensByRegion(region) { return Array.from(this.omen.values()).filter(o => o.region === region).map(o => ({ ...o })); }

    calculateTotalPower() {
        return Array.from(this.events.values()).reduce((sum, e) => sum + e.power, 0);
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
        if (this.stats.totalEvents < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.basePower += 5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { events: Array.from(this.events.entries()), omen: Array.from(this.omen.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.events) this.events = new Map(data.events);
        if (data.omen) this.omen = new Map(data.omen);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, eventCount: this.events.size, omenCount: this.omen.size }; }
}