/**
 * CultivationCharcoal.js - 修真木炭系统
 * V849 Iteration 22/30 Round 33
 */
export class CultivationCharcoal {
    constructor(config = {}) {
        this.config = { maxCharcoals: config.maxCharcoals || 20, baseHeat: config.baseHeat || 20, ...config };
        this.charcoals = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCharcoals: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCharcoal', (ctx) => this.getCharcoal(ctx.charcoalId));
        this.registerTool('recruitCharcoal', (ctx) => this.recruitCharcoal(ctx));
    }

    recruitCharcoal(data) {
        const id = data.id || `chc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const charcoal = {
            charcoalId: id,
            masterId: data.masterId || 'unknown_master',
            name: data.name || 'unnamed_charcoal',
            type: data.type || 'willow',
            heat: data.heat || this.config.baseHeat,
            embers: data.embers || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.charcoals.set(id, charcoal);
        this.stats.totalCharcoals++;
        this._triggerHook('charcoalRecruited', { charcoalId: id });
        return { success: true, charcoal };
    }

    getCharcoal(id) { return this.charcoals.get(id) ? { ...this.charcoals.get(id) } : null; }
    listCharcoals() { return Array.from(this.charcoals.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.charcoals.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.charcoals.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addEmber(charcoalId, ember) {
        const charcoal = this.charcoals.get(charcoalId);
        if (!charcoal) return { success: false, error: 'CHARCOAL_NOT_FOUND' };
        charcoal.embers.push(ember);
        if (charcoal.embers.length >= 5) charcoal.status = 'veteran';
        this._triggerHook('emberAdded', { charcoalId, ember });
        return { success: true };
    }

    raiseHeat(charcoalId, amount = 5) {
        const charcoal = this.charcoals.get(charcoalId);
        if (!charcoal) return { success: false, error: 'CHARCOAL_NOT_FOUND' };
        charcoal.heat += amount;
        this._triggerHook('heatRaised', { charcoalId, newHeat: charcoal.heat });
        return { success: true };
    }

    levelUpCharcoal(charcoalId) {
        const charcoal = this.charcoals.get(charcoalId);
        if (!charcoal) return { success: false, error: 'CHARCOAL_NOT_FOUND' };
        charcoal.level++;
        this._triggerHook('charcoalLeveledUp', { charcoalId, newLevel: charcoal.level });
        return { success: true };
    }

    legendCharcoal(charcoalId) {
        const charcoal = this.charcoals.get(charcoalId);
        if (!charcoal) return { success: false, error: 'CHARCOAL_NOT_FOUND' };
        charcoal.status = 'legendary';
        this._triggerHook('charcoalLegendized', { charcoalId });
        return { success: true };
    }

    calculateCharcoalValue(charcoalId) {
        const charcoal = this.charcoals.get(charcoalId);
        if (!charcoal) return 0;
        return charcoal.level * 100 + charcoal.heat * 2 + charcoal.embers.length * 30;
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
        if (this.stats.totalCharcoals < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCharcoals += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { charcoals: Array.from(this.charcoals.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.charcoals) this.charcoals = new Map(data.charcoals);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, charcoalCount: this.charcoals.size }; }
}