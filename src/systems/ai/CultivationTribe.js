/**
 * CultivationTribe.js - 修真部落系统
 * V592 Iteration 15/20 Round 24
 */
export class CultivationTribe {
    constructor(config = {}) {
        this.config = { maxTribes: config.maxTribes || 30, baseSpirit: config.baseSpirit || 20, ...config };
        this.tribes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTribes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTribe', (ctx) => this.getTribe(ctx.tribeId));
        this.registerTool('formTribe', (ctx) => this.formTribe(ctx));
    }

    formTribe(data) {
        const id = data.tribeId || `trb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const tribe = {
            tribeId: id,
            shamanId: data.shamanId,
            name: data.name || 'Unnamed Tribe',
            type: data.type || 'nomadic',
            spirit: data.spirit !== undefined ? data.spirit : this.config.baseSpirit,
            totems: Array.isArray(data.totems) ? [...data.totems] : [],
            level: data.level || 1,
            status: data.status || 'wandering',
            createdAt: Date.now()
        };
        this.tribes.set(id, tribe);
        this.stats.totalTribes++;
        this._triggerHook('tribeFormed', { tribeId: id, name: tribe.name });
        return { success: true, tribe };
    }

    getTribe(id) { return this.tribes.get(id) ? { ...this.tribes.get(id) } : null; }
    listTribes() { return Array.from(this.tribes.values()).map(t => ({ ...t })); }
    listByShaman(shamanId) { return Array.from(this.tribes.values()).filter(t => t.shamanId === shamanId).map(t => ({ ...t })); }
    listSettled() { return Array.from(this.tribes.values()).filter(t => t.status === 'settled' || t.status === 'eternal').map(t => ({ ...t })); }

    addTotem(tribeId, totem) {
        const tribe = this.tribes.get(tribeId);
        if (!tribe) return { success: false, error: 'TRIBE_NOT_FOUND' };
        tribe.totems.push(totem);
        this._triggerHook('totemAdded', { tribeId, totem, totemsCount: tribe.totems.length });
        return { success: true, totems: [...tribe.totems] };
    }

    increaseSpirit(tribeId, amount = 5) {
        const tribe = this.tribes.get(tribeId);
        if (!tribe) return { success: false, error: 'TRIBE_NOT_FOUND' };
        tribe.spirit += amount;
        this._triggerHook('spiritIncreased', { tribeId, newSpirit: tribe.spirit });
        return { success: true, newSpirit: tribe.spirit };
    }

    levelUpTribe(tribeId) {
        const tribe = this.tribes.get(tribeId);
        if (!tribe) return { success: false, error: 'TRIBE_NOT_FOUND' };
        tribe.level++;
        this._triggerHook('tribeLeveledUp', { tribeId, newLevel: tribe.level });
        return { success: true, newLevel: tribe.level };
    }

    eternalizeTribe(tribeId) {
        const tribe = this.tribes.get(tribeId);
        if (!tribe) return { success: false, error: 'TRIBE_NOT_FOUND' };
        tribe.status = 'eternal';
        this._triggerHook('tribeEternalized', { tribeId, status: tribe.status });
        return { success: true, status: tribe.status };
    }

    calculateTribeValue(tribeId) {
        const tribe = this.tribes.get(tribeId);
        if (!tribe) return 0;
        return tribe.level * 100 + tribe.spirit * 2 + tribe.totems.length * 30;
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
        if (this.stats.totalTribes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTribes += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { tribes: Array.from(this.tribes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.tribes) this.tribes = new Map(data.tribes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, tribeCount: this.tribes.size }; }
}
