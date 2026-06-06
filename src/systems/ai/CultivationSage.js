/**
 * CultivationSage.js - 修真智者
 * V648 Iteration 1/30 Round 27 - Cultivation Sage
 */
export class CultivationSage {
    constructor(config = {}) {
        this.config = { maxSages: config.maxSages || 50, baseWisdom: config.baseWisdom || 20, ...config };
        this.sages = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSages: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSage', (ctx) => this.getSage(ctx.sageId));
        this.registerTool('recruitSage', (ctx) => this.recruitSage(ctx));
    }

    recruitSage(data) {
        const id = data.sageId || `sag_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const sage = {
            sageId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Sage',
            type: data.type || 'wisdom',
            wisdom: data.wisdom || this.config.baseWisdom,
            scrolls: data.scrolls || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.sages.set(id, sage);
        this.stats.totalSages++;
        this._triggerHook('sageRecruited', { sageId: id });
        return { success: true, sage };
    }

    getSage(id) { return this.sages.get(id) ? { ...this.sages.get(id) } : null; }
    listSages() { return Array.from(this.sages.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.sages.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.sages.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addScroll(sageId, scroll) {
        const sage = this.sages.get(sageId);
        if (!sage) return { success: false, error: 'SAGE_NOT_FOUND' };
        sage.scrolls.push(scroll);
        this._triggerHook('scrollAdded', { sageId, scroll });
        return { success: true };
    }

    deepenWisdom(sageId, amount = 5) {
        const sage = this.sages.get(sageId);
        if (!sage) return { success: false, error: 'SAGE_NOT_FOUND' };
        sage.wisdom += amount;
        this._triggerHook('wisdomDeepened', { sageId, newWisdom: sage.wisdom });
        return { success: true };
    }

    levelUpSage(sageId) {
        const sage = this.sages.get(sageId);
        if (!sage) return { success: false, error: 'SAGE_NOT_FOUND' };
        sage.level++;
        this._triggerHook('sageLeveledUp', { sageId, newLevel: sage.level });
        return { success: true };
    }

    legendSage(sageId) {
        const sage = this.sages.get(sageId);
        if (!sage) return { success: false, error: 'SAGE_NOT_FOUND' };
        sage.status = 'legendary';
        this._triggerHook('sageLegendized', { sageId });
        return { success: true };
    }

    calculateSageValue(sageId) {
        const sage = this.sages.get(sageId);
        if (!sage) return 0;
        return sage.level * 100 + sage.wisdom * 2 + sage.scrolls.length * 30;
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
        if (this.stats.totalSages < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSages += 25;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { sages: Array.from(this.sages.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.sages) this.sages = new Map(data.sages);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, sageCount: this.sages.size }; }
}
