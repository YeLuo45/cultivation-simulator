/**
 * SectCulture.js - 宗门文化
 * V486 Iteration 3/15 Round 19 - Sect Culture
 */
export class SectCulture {
    constructor(config = {}) {
        this.config = { maxCultures: config.maxCultures || 50, baseCustoms: config.baseCustoms || 1, ...config };
        this.cultures = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCultures: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCulture', (ctx) => this.getCulture(ctx.cultureId));
        this.registerTool('cultivateCulture', (ctx) => this.cultivateCulture(ctx));
    }

    cultivateCulture(data) {
        const id = data.id || `cul_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const culture = { cultureId: id, sectId: data.sectId, name: data.name, type: data.type || 'scholarly', customs: data.customs ? [...data.customs] : [], members: data.members || 0, status: 'growing', createdAt: Date.now() };
        this.cultures.set(id, culture);
        this.stats.totalCultures++;
        this._triggerHook('cultureCultivated', { cultureId: id });
        return { success: true, culture };
    }

    getCulture(id) { return this.cultures.get(id) ? { ...this.cultures.get(id), customs: [...(this.cultures.get(id).customs || [])] } : null; }
    listCultures() { return Array.from(this.cultures.values()).map(c => ({ ...c, customs: [...(c.customs || [])] })); }
    listBySect(sectId) { return Array.from(this.cultures.values()).filter(c => c.sectId === sectId).map(c => ({ ...c, customs: [...(c.customs || [])] })); }
    listByType(type) { return Array.from(this.cultures.values()).filter(c => c.type === type).map(c => ({ ...c, customs: [...(c.customs || [])] })); }

    addCustom(cultureId, custom) {
        const culture = this.cultures.get(cultureId);
        if (!culture) return { success: false, error: 'CULTURE_NOT_FOUND' };
        if (!culture.customs) culture.customs = [];
        culture.customs.push(custom);
        if (culture.customs.length >= 10) culture.status = 'flourishing';
        this._triggerHook('customAdded', { cultureId, custom });
        return { success: true, customs: [...culture.customs] };
    }

    recruitMember(cultureId, member) {
        const culture = this.cultures.get(cultureId);
        if (!culture) return { success: false, error: 'CULTURE_NOT_FOUND' };
        culture.members++;
        this._triggerHook('memberRecruited', { cultureId, member, total: culture.members });
        return { success: true, members: culture.members };
    }

    legendaryStatus(cultureId) {
        const culture = this.cultures.get(cultureId);
        if (!culture) return { success: false, error: 'CULTURE_NOT_FOUND' };
        culture.status = 'legendary';
        this._triggerHook('cultureLegendary', { cultureId });
        return { success: true, status: culture.status };
    }

    calculateCulturalValue(cultureId) {
        const culture = this.cultures.get(cultureId);
        if (!culture) return 0;
        return (culture.customs ? culture.customs.length : 0) * 10 + culture.members * 3;
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
        if (this.stats.totalCultures < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCultures += 25;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { cultures: Array.from(this.cultures.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.cultures) this.cultures = new Map(data.cultures);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cultureCount: this.cultures.size }; }
}
