/**
 * CultivationBuddhist.js - 修真佛修
 * V640 Iteration 23/30 Round 26
 */
export class CultivationBuddhist {
    constructor(config = {}) {
        this.config = { maxBuddhists: config.maxBuddhists || 50, baseKarma: config.baseKarma || 20, ...config };
        this.buddhists = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBuddhists: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBuddhist', (ctx) => this.getBuddhist(ctx.buddhistId));
        this.registerTool('recruitBuddhist', (ctx) => this.recruitBuddhist(ctx));
    }

    recruitBuddhist(data) {
        const id = data.buddhistId || `bud_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const buddhist = { buddhistId: id, abbotId: data.abbotId, name: data.name || 'Anonymous Monk', type: data.type || 'chan', karma: data.karma || this.config.baseKarma, sutras: data.sutras || [], level: 1, status: 'novice', createdAt: Date.now() };
        this.buddhists.set(id, buddhist);
        this.stats.totalBuddhists++;
        this._triggerHook('buddhistRecruited', { buddhistId: id });
        return { success: true, buddhist };
    }

    getBuddhist(id) { return this.buddhists.get(id) ? { ...this.buddhists.get(id) } : null; }
    listBuddhists() { return Array.from(this.buddhists.values()).map(b => ({ ...b })); }
    listByAbbot(abbotId) { return Array.from(this.buddhists.values()).filter(b => b.abbotId === abbotId).map(b => ({ ...b })); }
    listLegendary() { return Array.from(this.buddhists.values()).filter(b => b.status === 'legendary').map(b => ({ ...b })); }

    addSutra(buddhistId, sutra) {
        const buddhist = this.buddhists.get(buddhistId);
        if (!buddhist) return { success: false, error: 'BUDDHIST_NOT_FOUND' };
        buddhist.sutras.push(sutra);
        this._triggerHook('sutraAdded', { buddhistId, sutra });
        return { success: true };
    }

    gainKarma(buddhistId, amount = 5) {
        const buddhist = this.buddhists.get(buddhistId);
        if (!buddhist) return { success: false, error: 'BUDDHIST_NOT_FOUND' };
        buddhist.karma += amount;
        this._triggerHook('karmaGained', { buddhistId, amount: buddhist.karma });
        return { success: true };
    }

    levelUpBuddhist(buddhistId) {
        const buddhist = this.buddhists.get(buddhistId);
        if (!buddhist) return { success: false, error: 'BUDDHIST_NOT_FOUND' };
        buddhist.level++;
        this._triggerHook('buddhistLeveledUp', { buddhistId, newLevel: buddhist.level });
        return { success: true };
    }

    legendBuddhist(buddhistId) {
        const buddhist = this.buddhists.get(buddhistId);
        if (!buddhist) return { success: false, error: 'BUDDHIST_NOT_FOUND' };
        buddhist.status = 'legendary';
        this._triggerHook('buddhistLegendized', { buddhistId });
        return { success: true };
    }

    calculateBuddhistValue(buddhistId) {
        const buddhist = this.buddhists.get(buddhistId);
        if (!buddhist) return 0;
        return buddhist.level * 100 + buddhist.karma * 2 + buddhist.sutras.length * 30;
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
        if (this.stats.totalBuddhists < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBuddhists += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { buddhists: Array.from(this.buddhists.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.buddhists) this.buddhists = new Map(data.buddhists);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, buddhistCount: this.buddhists.size }; }
}
