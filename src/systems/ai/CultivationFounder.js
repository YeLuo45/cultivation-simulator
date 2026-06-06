/**
 * CultivationFounder.js - 修真祖师
 * V666 Iteration 19/30 Round 27 - Cultivation Founder
 */
export class CultivationFounder {
    constructor(config = {}) {
        this.config = { maxFounders: config.maxFounders || 5, baseLegacy: config.baseLegacy || 20, ...config };
        this.founders = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFounders: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getFounder', (ctx) => this.getFounder(ctx.founderId));
        this.registerTool('recruitFounder', (ctx) => this.recruitFounder(ctx));
    }

    recruitFounder(data) {
        const id = data.founderId || `fnd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const founder = {
            founderId: id,
            sectId: data.sectId,
            name: data.name || 'Unnamed Founder',
            type: data.type || 'original',
            legacy: data.legacy || this.config.baseLegacy,
            techniques: data.techniques || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.founders.set(id, founder);
        this.stats.totalFounders++;
        this._triggerHook('founderRecruited', { founderId: id });
        return { success: true, founder };
    }

    getFounder(id) { return this.founders.get(id) ? { ...this.founders.get(id) } : null; }
    listFounders() { return Array.from(this.founders.values()).map(f => ({ ...f })); }
    listBySect(sectId) { return Array.from(this.founders.values()).filter(f => f.sectId === sectId).map(f => ({ ...f })); }
    listLegendary() { return Array.from(this.founders.values()).filter(f => f.status === 'legendary').map(f => ({ ...f })); }

    addTechnique(founderId, technique) {
        const founder = this.founders.get(founderId);
        if (!founder) return { success: false, error: 'FOUNDER_NOT_FOUND' };
        founder.techniques.push(technique);
        this._triggerHook('techniqueAdded', { founderId, technique });
        return { success: true };
    }

    strengthenLegacy(founderId, amount = 5) {
        const founder = this.founders.get(founderId);
        if (!founder) return { success: false, error: 'FOUNDER_NOT_FOUND' };
        founder.legacy += amount;
        this._triggerHook('legacyStrengthened', { founderId, newLegacy: founder.legacy });
        return { success: true };
    }

    levelUpFounder(founderId) {
        const founder = this.founders.get(founderId);
        if (!founder) return { success: false, error: 'FOUNDER_NOT_FOUND' };
        founder.level++;
        this._triggerHook('founderLeveledUp', { founderId, newLevel: founder.level });
        return { success: true };
    }

    legendFounder(founderId) {
        const founder = this.founders.get(founderId);
        if (!founder) return { success: false, error: 'FOUNDER_NOT_FOUND' };
        founder.status = 'legendary';
        this._triggerHook('founderLegendized', { founderId });
        return { success: true };
    }

    calculateFounderValue(founderId) {
        const founder = this.founders.get(founderId);
        if (!founder) return 0;
        return founder.level * 100 + founder.legacy * 2 + founder.techniques.length * 30;
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
        if (this.stats.totalFounders < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxFounders += 5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { founders: Array.from(this.founders.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.founders) this.founders = new Map(data.founders);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, founderCount: this.founders.size }; }
}
