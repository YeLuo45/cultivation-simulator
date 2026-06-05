/**
 * ReputationSystem.js - 声望系统
 * V344 Iteration 5/9 Round 7
 */
export class ReputationSystem {
    constructor(config = {}) {
        this.config = { maxReputation: config.maxReputation || 10000, baseReputation: config.baseReputation || 0, ...config };
        this.cultivators = new Map();
        this.factions = new Map();
        this.events = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEvents: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCultivator', (ctx) => this.getCultivator(ctx.cultivatorId));
        this.registerTool('addReputation', (ctx) => this.addReputation(ctx.cultivatorId, ctx.amount, ctx.reason));
    }

    registerFaction(data) {
        const id = data.id || `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const faction = { factionId: id, name: data.name || 'Faction', members: new Set(), reputation: 0 };
        this.factions.set(id, faction);
        return { success: true, faction };
    }

    getFaction(id) { return this.factions.get(id) ? { ...this.factions.get(id), members: Array.from(this.factions.get(id).members) } : null; }
    listFactions() { return Array.from(this.factions.values()).map(f => ({ ...f, members: Array.from(f.members) })); }

    registerCultivator(data) {
        const id = data.id || `cv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cultivator = { cultivatorId: id, name: data.name || 'Anonymous', reputation: data.reputation || this.config.baseReputation, rank: 'novice', factionId: data.factionId || null, joinedAt: Date.now() };
        this.cultivators.set(id, cultivator);
        if (data.factionId && this.factions.has(data.factionId)) {
            this.factions.get(data.factionId).members.add(id);
        }
        return { success: true, cultivator };
    }

    getCultivator(id) { return this.cultivators.get(id) ? { ...this.cultivators.get(id) } : null; }
    listCultivators() { return Array.from(this.cultivators.values()).map(c => ({ ...c })); }
    listByFaction(factionId) { return Array.from(this.cultivators.values()).filter(c => c.factionId === factionId).map(c => ({ ...c })); }

    addReputation(cultivatorId, amount, reason) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        cultivator.reputation = Math.max(0, Math.min(this.config.maxReputation, cultivator.reputation + amount));
        cultivator.rank = this._calculateRank(cultivator.reputation);
        const eventId = `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const event = { eventId, cultivatorId, amount, reason: reason || '', newReputation: cultivator.reputation, timestamp: Date.now() };
        this.events.set(eventId, event);
        this.stats.totalEvents++;
        this._triggerHook('reputationChanged', { cultivatorId, newReputation: cultivator.reputation, rank: cultivator.rank });
        return { success: true, cultivator: { ...cultivator }, event };
    }

    _calculateRank(rep) {
        if (rep >= 8000) return 'legend';
        if (rep >= 4000) return 'master';
        if (rep >= 1000) return 'elite';
        if (rep >= 100) return 'notable';
        if (rep >= 10) return 'known';
        return 'novice';
    }

    getEvents(cultivatorId) {
        return Array.from(this.events.values()).filter(e => e.cultivatorId === cultivatorId).map(e => ({ ...e }));
    }

    joinFaction(cultivatorId, factionId) {
        const cultivator = this.cultivators.get(cultivatorId);
        const faction = this.factions.get(factionId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        if (!faction) return { success: false, error: 'FACTION_NOT_FOUND' };
        if (cultivator.factionId && this.factions.has(cultivator.factionId)) {
            this.factions.get(cultivator.factionId).members.delete(cultivatorId);
        }
        cultivator.factionId = factionId;
        faction.members.add(cultivatorId);
        this._triggerHook('factionJoined', { cultivatorId, factionId });
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
        if (this.stats.totalEvents < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxReputation += 1000;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { cultivators: Array.from(this.cultivators.entries()), factions: Array.from(this.factions.entries()).map(([k, v]) => [k, { ...v, members: Array.from(v.members) }]), events: Array.from(this.events.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.cultivators) this.cultivators = new Map(data.cultivators);
        if (data.factions) this.factions = new Map(data.factions.map(([k, v]) => [k, { ...v, members: new Set(v.members || []) }]));
        if (data.events) this.events = new Map(data.events);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cultivatorCount: this.cultivators.size, factionCount: this.factions.size }; }
}