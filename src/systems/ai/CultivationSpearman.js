/**
 * CultivationSpearman.js - 修真枪兵
 * V619 Iteration 2/30 Round 26
 */
export class CultivationSpearman {
    constructor(config = {}) {
        this.config = { maxSpearmen: config.maxSpearmen || 50, basePrecision: config.basePrecision || 20, ...config };
        this.spearmen = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSpearmen: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSpearman', (ctx) => this.getSpearman(ctx.spearmanId));
        this.registerTool('recruitSpearman', (ctx) => this.recruitSpearman(ctx));
    }

    recruitSpearman(data) {
        const id = data.id || `spr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const spearman = {
            spearmanId: id,
            commanderId: data.commanderId,
            name: data.name || 'Spearman',
            type: data.type || 'lance',
            precision: data.precision || this.config.basePrecision,
            spears: data.spears || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.spearmen.set(id, spearman);
        this.stats.totalSpearmen++;
        this._triggerHook('spearmanRecruited', { spearmanId: id });
        return { success: true, spearman };
    }

    getSpearman(id) { return this.spearmen.get(id) ? { ...this.spearmen.get(id) } : null; }
    listSpearmen() { return Array.from(this.spearmen.values()).map(s => ({ ...s })); }
    listByCommander(commanderId) { return Array.from(this.spearmen.values()).filter(s => s.commanderId === commanderId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.spearmen.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addSpear(spearmanId, spear) {
        const spearman = this.spearmen.get(spearmanId);
        if (!spearman) return { success: false, error: 'SPEARMAN_NOT_FOUND' };
        spearman.spears.push(spear);
        this._triggerHook('spearAdded', { spearmanId, spear });
        return { success: true };
    }

    improvePrecision(spearmanId, amount = 5) {
        const spearman = this.spearmen.get(spearmanId);
        if (!spearman) return { success: false, error: 'SPEARMAN_NOT_FOUND' };
        spearman.precision += amount;
        this._triggerHook('precisionImproved', { spearmanId, newPrecision: spearman.precision });
        return { success: true };
    }

    levelUpSpearman(spearmanId) {
        const spearman = this.spearmen.get(spearmanId);
        if (!spearman) return { success: false, error: 'SPEARMAN_NOT_FOUND' };
        spearman.level++;
        this._triggerHook('spearmanLeveledUp', { spearmanId, newLevel: spearman.level });
        return { success: true };
    }

    legendSpearman(spearmanId) {
        const spearman = this.spearmen.get(spearmanId);
        if (!spearman) return { success: false, error: 'SPEARMAN_NOT_FOUND' };
        spearman.status = 'legendary';
        this._triggerHook('spearmanLegendized', { spearmanId });
        return { success: true };
    }

    calculateSpearmanValue(spearmanId) {
        const spearman = this.spearmen.get(spearmanId);
        if (!spearman) return 0;
        return spearman.level * 100 + spearman.precision * 2 + spearman.spears.length * 30;
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
        if (this.stats.totalSpearmen < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSpearmen += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { spearmen: Array.from(this.spearmen.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.spearmen) this.spearmen = new Map(data.spearmen);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, spearmanCount: this.spearmen.size }; }
}
