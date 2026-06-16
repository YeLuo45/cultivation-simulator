/**
 * CultivationThief.js - 修真小偷
 * V612 Iteration 15/20 Round 25 - Cultivation Thief
 */

export class CultivationThief {
    constructor(config = {}) {
        this.config = { maxThieves: config.maxThieves || 50, baseAgility: config.baseAgility || 20, ...config };
        this.thieves = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalThieves: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getThief', (ctx) => this.getThief(ctx.thiefId));
        this.registerTool('recruitThief', (ctx) => this.recruitThief(ctx));
    }

    recruitThief(data = {}) {
        const id = data.thiefId || `thf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const thief = {
            thiefId: id,
            contactId: data.contactId,
            name: data.name || 'Shadow Hand',
            type: data.type || 'pickpocket',
            agility: data.agility !== undefined ? data.agility : this.config.baseAgility,
            loot: data.loot || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.thieves.set(id, thief);
        this.stats.totalThieves++;
        this._triggerHook('thiefRecruited', { thiefId: id });
        return { success: true, thief };
    }

    getThief(id) { return this.thieves.get(id) ? { ...this.thieves.get(id) } : null; }
    listThieves() { return Array.from(this.thieves.values()).map(t => ({ ...t })); }
    listByContact(contactId) { return Array.from(this.thieves.values()).filter(t => t.contactId === contactId).map(t => ({ ...t })); }
    listLegendary() { return Array.from(this.thieves.values()).filter(t => t.status === 'legendary').map(t => ({ ...t })); }

    addLoot(thiefId, item) {
        const thief = this.thieves.get(thiefId);
        if (!thief) return { success: false, error: 'THIEF_NOT_FOUND' };
        thief.loot.push(item);
        this._triggerHook('lootAdded', { thiefId, item });
        return { success: true, thief: { ...thief } };
    }

    increaseAgility(thiefId, amount = 5) {
        const thief = this.thieves.get(thiefId);
        if (!thief) return { success: false, error: 'THIEF_NOT_FOUND' };
        thief.agility += amount;
        this._triggerHook('agilityIncreased', { thiefId, newAgility: thief.agility });
        return { success: true };
    }

    levelUpThief(thiefId) {
        const thief = this.thieves.get(thiefId);
        if (!thief) return { success: false, error: 'THIEF_NOT_FOUND' };
        thief.level++;
        this._triggerHook('thiefLeveledUp', { thiefId, newLevel: thief.level });
        return { success: true };
    }

    legendThief(thiefId) {
        const thief = this.thieves.get(thiefId);
        if (!thief) return { success: false, error: 'THIEF_NOT_FOUND' };
        thief.status = 'legendary';
        this._triggerHook('thiefLegendized', { thiefId });
        return { success: true };
    }

    calculateThiefValue(thiefId) {
        const thief = this.thieves.get(thiefId);
        if (!thief) return 0;
        return thief.level * 100 + thief.agility * 2 + thief.loot.length * 30;
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
        if (this.stats.totalThieves < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxThieves += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { thieves: Array.from(this.thieves.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.thieves) this.thieves = new Map(data.thieves);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, thiefCount: this.thieves.size }; }
}
