/**
 * TreasureValuation.js - 宝物评估系统
 * V338 Iteration 8/9 Round 6
 */
export class TreasureValuation {
    constructor(config = {}) {
        this.config = { ...config };
        this.valuations = new Map();
        this.appraisals = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalValuations: 0, totalAppraisals: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getValuation', (ctx) => this.getValuation(ctx.valuationId));
        this.registerTool('listValuations', () => Array.from(this.valuations.values()).map(v => ({...v})));
    }

    appraise(itemData) {
        const id = `apr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const baseValue = itemData.baseValue || 100;
        const rarityMultiplier = (itemData.rarity === 'mythic' ? 10 : itemData.rarity === 'legendary' ? 5 : itemData.rarity === 'epic' ? 2 : itemData.rarity === 'rare' ? 1.5 : 1);
        const conditionMultiplier = (itemData.condition || 100) / 100;
        const value = Math.floor(baseValue * rarityMultiplier * conditionMultiplier);
        const appraisal = { id, itemName: itemData.name || 'Item', value, rarity: itemData.rarity || 'common', condition: itemData.condition || 100, appraisedAt: Date.now() };
        this.appraisals.set(id, appraisal);
        this.stats.totalAppraisals++;
        this._triggerHook('appraisalCompleted', { id, value });
        return { success: true, appraisal };
    }

    getAppraisal(id) { return this.appraisals.get(id) ? { ...this.appraisals.get(id) } : null; }
    listAppraisals() { return Array.from(this.appraisals.values()).map(a => ({ ...a })); }

    createValuation(itemId, data) {
        const id = `vl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const valuation = { valuationId: id, itemId, estimatedValue: data.estimatedValue || 0, marketTrend: data.marketTrend || 'stable', confidence: data.confidence || 0.5, valuedAt: Date.now() };
        this.valuations.set(id, valuation);
        this.stats.totalValuations++;
        this._triggerHook('valuationCreated', { valuationId: id });
        return { success: true, valuation };
    }

    getValuation(id) { return this.valuations.get(id) ? { ...this.valuations.get(id) } : null; }
    listValuations() { return Array.from(this.valuations.values()).map(v => ({ ...v })); }
    listByItem(itemId) { return Array.from(this.valuations.values()).filter(v => v.itemId === itemId).map(v => ({ ...v })); }

    updateValuation(valuationId, updates) {
        const valuation = this.valuations.get(valuationId);
        if (!valuation) return { success: false, error: 'VALUATION_NOT_FOUND' };
        if (updates.estimatedValue !== undefined) valuation.estimatedValue = updates.estimatedValue;
        if (updates.marketTrend !== undefined) valuation.marketTrend = updates.marketTrend;
        if (updates.confidence !== undefined) valuation.confidence = updates.confidence;
        valuation.updatedAt = Date.now();
        this._triggerHook('valuationUpdated', { valuationId });
        return { success: true, valuation: { ...valuation } };
    }

    calculateInsurance(valuationId) {
        const valuation = this.valuations.get(valuationId);
        if (!valuation) return null;
        return Math.floor(valuation.estimatedValue * 0.05);
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
        if (this.stats.totalValuations < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { valuations: Array.from(this.valuations.entries()), appraisals: Array.from(this.appraisals.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.valuations) this.valuations = new Map(data.valuations);
        if (data.appraisals) this.appraisals = new Map(data.appraisals);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, valuationCount: this.valuations.size, appraisalCount: this.appraisals.size }; }
}