/**
 * CultivationSlate.js - 修真板岩系统
 * V842 Iteration 15/30 Round 33
 */
export class CultivationSlate {
    constructor(config = {}) {
        this.config = { maxSlates: config.maxSlates || 20, baseFlatness: config.baseFlatness || 20, ...config };
        this.slates = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSlates: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSlate', (ctx) => this.getSlate(ctx.slateId));
        this.registerTool('recruitSlate', (ctx) => this.recruitSlate(ctx));
    }

    recruitSlate(data = {}) {
        if (this.slates.size >= this.config.maxSlates) {
            return { success: false, error: 'MAX_Slates_REACHED' };
        }
        const id = data.slateId || `slt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const slate = {
            slateId: id,
            masterId: data.masterId || null,
            name: data.name || `Slate-${id.slice(-5)}`,
            type: data.type || 'gray',
            flatness: data.flatness !== undefined ? data.flatness : this.config.baseFlatness,
            layers: Array.isArray(data.layers) ? [...data.layers] : [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.slates.set(id, slate);
        this.stats.totalSlates++;
        this._triggerHook('slateRecruited', { slateId: id, masterId: slate.masterId });
        return { success: true, slate };
    }

    getSlate(id) { return this.slates.get(id) ? { ...this.slates.get(id) } : null; }
    listSlates() { return Array.from(this.slates.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.slates.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.slates.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addLayer(slateId, layer) {
        const slate = this.slates.get(slateId);
        if (!slate) return { success: false, error: 'SLATE_NOT_FOUND' };
        slate.layers.push(layer);
        this._triggerHook('layerAdded', { slateId, layer, totalLayers: slate.layers.length });
        return { success: true };
    }

    raiseFlatness(slateId, amount = 5) {
        const slate = this.slates.get(slateId);
        if (!slate) return { success: false, error: 'SLATE_NOT_FOUND' };
        slate.flatness += amount;
        this._triggerHook('flatnessRaised', { slateId, newFlatness: slate.flatness });
        return { success: true };
    }

    levelUpSlate(slateId) {
        const slate = this.slates.get(slateId);
        if (!slate) return { success: false, error: 'SLATE_NOT_FOUND' };
        slate.level++;
        this._triggerHook('slateLeveledUp', { slateId, newLevel: slate.level });
        return { success: true };
    }

    legendSlate(slateId) {
        const slate = this.slates.get(slateId);
        if (!slate) return { success: false, error: 'SLATE_NOT_FOUND' };
        slate.status = 'legendary';
        this._triggerHook('slateLegendized', { slateId });
        return { success: true };
    }

    calculateSlateValue(slateId) {
        const slate = this.slates.get(slateId);
        if (!slate) return 0;
        return slate.level * 100 + slate.flatness * 2 + slate.layers.length * 30;
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
        if (this.stats.totalSlates < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSlates += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { slates: Array.from(this.slates.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.slates) this.slates = new Map(data.slates);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, slateCount: this.slates.size }; }
}
