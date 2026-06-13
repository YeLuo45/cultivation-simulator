/**
 * CultivationAdventure.js - 修真冒险
 * V569 Iteration 12/20 Round 23
 *
 * 修真冒险系统: 管理修士冒险的规划、推进、发现地点、征服冒险。
 */

export class CultivationAdventure {
    constructor(config = {}) {
        this.config = { maxAdventures: config.maxAdventures || 50, baseChallenge: config.baseChallenge || 20, ...config };
        this.adventures = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAdventures: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getAdventure', (ctx) => this.getAdventure(ctx.adventureId));
        this.registerTool('startAdventure', (ctx) => this.startAdventure(ctx));
    }

    startAdventure(data) {
        const id = data.id || `adv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const adventure = {
            adventureId: id,
            leaderId: data.leaderId,
            name: data.name || 'Unnamed Adventure',
            type: data.type || 'exploration',
            challenge: data.challenge || this.config.baseChallenge,
            locations: [],
            level: 1,
            status: 'planned',
            createdAt: Date.now()
        };
        this.adventures.set(id, adventure);
        this.stats.totalAdventures++;
        this._triggerHook('adventureStarted', { adventureId: id });
        return { success: true, adventure };
    }

    getAdventure(id) { return this.adventures.get(id) ? { ...this.adventures.get(id) } : null; }
    listAdventures() { return Array.from(this.adventures.values()).map(a => ({ ...a })); }
    listByLeader(leaderId) { return Array.from(this.adventures.values()).filter(a => a.leaderId === leaderId).map(a => ({ ...a })); }
    listOngoing() { return Array.from(this.adventures.values()).filter(a => a.status === 'ongoing').map(a => ({ ...a })); }

    addLocation(adventureId, location) {
        const adventure = this.adventures.get(adventureId);
        if (!adventure) return { success: false, error: 'ADVENTURE_NOT_FOUND' };
        const entry = { name: location, addedAt: Date.now() };
        adventure.locations.push(entry);
        if (adventure.status === 'planned') adventure.status = 'ongoing';
        this._triggerHook('locationAdded', { adventureId, location: entry });
        return { success: true, location: entry };
    }

    increaseChallenge(adventureId, amount = 5) {
        const adventure = this.adventures.get(adventureId);
        if (!adventure) return { success: false, error: 'ADVENTURE_NOT_FOUND' };
        adventure.challenge += amount;
        if (adventure.status === 'planned') adventure.status = 'ongoing';
        this._triggerHook('challengeIncreased', { adventureId, newChallenge: adventure.challenge });
        return { success: true };
    }

    levelUpAdventure(adventureId) {
        const adventure = this.adventures.get(adventureId);
        if (!adventure) return { success: false, error: 'ADVENTURE_NOT_FOUND' };
        adventure.level++;
        this._triggerHook('adventureLeveledUp', { adventureId, newLevel: adventure.level });
        return { success: true };
    }

    conquerAdventure(adventureId) {
        const adventure = this.adventures.get(adventureId);
        if (!adventure) return { success: false, error: 'ADVENTURE_NOT_FOUND' };
        adventure.status = 'conquered';
        this._triggerHook('adventureConquered', { adventureId });
        return { success: true, adventure: { ...adventure } };
    }

    calculateAdventureValue(adventureId) {
        const adventure = this.adventures.get(adventureId);
        if (!adventure) return 0;
        return adventure.level * 100 + adventure.challenge * 2 + adventure.locations.length * 30;
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
        if (this.stats.totalAdventures < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxAdventures += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { adventures: Array.from(this.adventures.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.adventures) this.adventures = new Map(data.adventures);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, adventureCount: this.adventures.size }; }
}
