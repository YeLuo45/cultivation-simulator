/**
 * CultivationLuck.js - 修真运气
 * V741 Iteration 4/30 Round 30
 */
export class CultivationLuck {
    constructor(config = {}) {
        this.config = { maxLucks: config.maxLucks || 20, baseChance: config.baseChance || 20, ...config };
        this.lucks = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalLucks: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getLuck', (ctx) => this.getLuck(ctx.luckId));
        this.registerTool('recruitLuck', (ctx) => this.recruitLuck(ctx));
    }

    recruitLuck(data) {
        const id = data.id || `luck_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const luck = {
            luckId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed',
            type: data.type || 'fortune',
            chance: data.chance || this.config.baseChance,
            charms: data.charms || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.lucks.set(id, luck);
        this.stats.totalLucks++;
        this._triggerHook('luckRecruited', { luckId: id });
        return { success: true, luck };
    }

    getLuck(id) { return this.lucks.get(id) ? { ...this.lucks.get(id) } : null; }
    listLucks() { return Array.from(this.lucks.values()).map(l => ({ ...l })); }
    listByMaster(masterId) { return Array.from(this.lucks.values()).filter(l => l.masterId === masterId).map(l => ({ ...l })); }
    listLegendary() { return Array.from(this.lucks.values()).filter(l => l.status === 'legendary').map(l => ({ ...l })); }

    addCharm(luckId, charm) {
        const luck = this.lucks.get(luckId);
        if (!luck) return { success: false, error: 'LUCK_NOT_FOUND' };
        luck.charms.push(charm);
        if (luck.charms.length >= 3 && luck.status === 'novice') luck.status = 'veteran';
        this._triggerHook('charmAdded', { luckId, charm });
        return { success: true };
    }

    raiseChance(luckId, amount = 5) {
        const luck = this.lucks.get(luckId);
        if (!luck) return { success: false, error: 'LUCK_NOT_FOUND' };
        luck.chance += amount;
        this._triggerHook('chanceRaised', { luckId, newChance: luck.chance });
        return { success: true };
    }

    levelUpLuck(luckId) {
        const luck = this.lucks.get(luckId);
        if (!luck) return { success: false, error: 'LUCK_NOT_FOUND' };
        luck.level++;
        this._triggerHook('luckLeveledUp', { luckId, newLevel: luck.level });
        return { success: true };
    }

    legendLuck(luckId) {
        const luck = this.lucks.get(luckId);
        if (!luck) return { success: false, error: 'LUCK_NOT_FOUND' };
        luck.status = 'legendary';
        this._triggerHook('luckLegendized', { luckId });
        return { success: true };
    }

    calculateLuckValue(luckId) {
        const luck = this.lucks.get(luckId);
        if (!luck) return 0;
        return luck.level * 100 + luck.chance * 2 + luck.charms.length * 30;
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
        if (this.stats.totalLucks < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxLucks += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { lucks: Array.from(this.lucks.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.lucks) this.lucks = new Map(data.lucks);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, luckCount: this.lucks.size }; }
}
