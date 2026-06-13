/**
 * CultivationElder.js - 修真长老
 * V664 Iteration 17/30 Round 27 - Cultivation Elder
 */
export class CultivationElder {
    constructor(config = {}) {
        this.config = { maxElders: config.maxElders || 20, baseWisdom: config.baseWisdom || 20, ...config };
        this.elders = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalElders: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getElder', (ctx) => this.getElder(ctx.elderId));
        this.registerTool('recruitElder', (ctx) => this.recruitElder(ctx));
    }

    recruitElder(data) {
        const id = data.elderId || `eld_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const elder = {
            elderId: id,
            sectId: data.sectId,
            name: data.name || 'Unnamed Elder',
            type: data.type || 'inner',
            wisdom: data.wisdom || this.config.baseWisdom,
            decrees: data.decrees || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.elders.set(id, elder);
        this.stats.totalElders++;
        this._triggerHook('elderRecruited', { elderId: id });
        return { success: true, elder };
    }

    getElder(id) { return this.elders.get(id) ? { ...this.elders.get(id) } : null; }
    listElders() { return Array.from(this.elders.values()).map(e => ({ ...e })); }
    listBySect(sectId) { return Array.from(this.elders.values()).filter(e => e.sectId === sectId).map(e => ({ ...e })); }
    listLegendary() { return Array.from(this.elders.values()).filter(e => e.status === 'legendary').map(e => ({ ...e })); }

    addDecree(elderId, decree) {
        const elder = this.elders.get(elderId);
        if (!elder) return { success: false, error: 'ELDER_NOT_FOUND' };
        elder.decrees.push(decree);
        this._triggerHook('decreeAdded', { elderId, decree });
        return { success: true };
    }

    deepenWisdom(elderId, amount = 5) {
        const elder = this.elders.get(elderId);
        if (!elder) return { success: false, error: 'ELDER_NOT_FOUND' };
        elder.wisdom += amount;
        this._triggerHook('wisdomDeepened', { elderId, newWisdom: elder.wisdom });
        return { success: true };
    }

    levelUpElder(elderId) {
        const elder = this.elders.get(elderId);
        if (!elder) return { success: false, error: 'ELDER_NOT_FOUND' };
        elder.level++;
        this._triggerHook('elderLeveledUp', { elderId, newLevel: elder.level });
        return { success: true };
    }

    legendElder(elderId) {
        const elder = this.elders.get(elderId);
        if (!elder) return { success: false, error: 'ELDER_NOT_FOUND' };
        elder.status = 'legendary';
        this._triggerHook('elderLegendized', { elderId });
        return { success: true };
    }

    calculateElderValue(elderId) {
        const elder = this.elders.get(elderId);
        if (!elder) return 0;
        return elder.level * 100 + elder.wisdom * 2 + elder.decrees.length * 30;
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
        if (this.stats.totalElders < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxElders += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { elders: Array.from(this.elders.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.elders) this.elders = new Map(data.elders);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, elderCount: this.elders.size }; }
}
