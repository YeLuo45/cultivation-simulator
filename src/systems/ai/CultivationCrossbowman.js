/**
 * CultivationCrossbowman.js - 修真弩手
 * V621 Iteration 4/30 Round 26
 */
export class CultivationCrossbowman {
    constructor(config = {}) {
        this.config = { maxCrossbowmen: config.maxCrossbowmen || 50, baseRange: config.baseRange || 50, ...config };
        this.crossbowmen = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCrossbowmen: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCrossbowman', (ctx) => this.getCrossbowman(ctx.crossbowmanId));
        this.registerTool('recruitCrossbowman', (ctx) => this.recruitCrossbowman(ctx));
    }

    recruitCrossbowman(data) {
        const id = data.id || `cbm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const crossbowman = {
            crossbowmanId: id,
            handlerId: data.handlerId,
            name: data.name || 'Crossbowman',
            type: data.type || 'light',
            range: data.range || this.config.baseRange,
            bolts: data.bolts || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.crossbowmen.set(id, crossbowman);
        this.stats.totalCrossbowmen++;
        this._triggerHook('crossbowmanRecruited', { crossbowmanId: id });
        return { success: true, crossbowman };
    }

    getCrossbowman(id) { return this.crossbowmen.get(id) ? { ...this.crossbowmen.get(id) } : null; }
    listCrossbowmen() { return Array.from(this.crossbowmen.values()).map(c => ({ ...c })); }
    listByHandler(handlerId) { return Array.from(this.crossbowmen.values()).filter(c => c.handlerId === handlerId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.crossbowmen.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addBolt(crossbowmanId, bolt) {
        const crossbowman = this.crossbowmen.get(crossbowmanId);
        if (!crossbowman) return { success: false, error: 'CROSSBOWMAN_NOT_FOUND' };
        crossbowman.bolts.push(bolt);
        this._triggerHook('boltAdded', { crossbowmanId, bolt });
        return { success: true };
    }

    extendRange(crossbowmanId, amount = 5) {
        const crossbowman = this.crossbowmen.get(crossbowmanId);
        if (!crossbowman) return { success: false, error: 'CROSSBOWMAN_NOT_FOUND' };
        crossbowman.range += amount;
        this._triggerHook('rangeExtended', { crossbowmanId, newRange: crossbowman.range });
        return { success: true };
    }

    levelUpCrossbowman(crossbowmanId) {
        const crossbowman = this.crossbowmen.get(crossbowmanId);
        if (!crossbowman) return { success: false, error: 'CROSSBOWMAN_NOT_FOUND' };
        crossbowman.level++;
        this._triggerHook('crossbowmanLeveledUp', { crossbowmanId, newLevel: crossbowman.level });
        return { success: true };
    }

    legendCrossbowman(crossbowmanId) {
        const crossbowman = this.crossbowmen.get(crossbowmanId);
        if (!crossbowman) return { success: false, error: 'CROSSBOWMAN_NOT_FOUND' };
        crossbowman.status = 'legendary';
        this._triggerHook('crossbowmanLegendized', { crossbowmanId });
        return { success: true };
    }

    calculateCrossbowmanValue(crossbowmanId) {
        const crossbowman = this.crossbowmen.get(crossbowmanId);
        if (!crossbowman) return 0;
        return crossbowman.level * 100 + crossbowman.range * 2 + crossbowman.bolts.length * 30;
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
        if (this.stats.totalCrossbowmen < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCrossbowmen += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { crossbowmen: Array.from(this.crossbowmen.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.crossbowmen) this.crossbowmen = new Map(data.crossbowmen);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, crossbowmanCount: this.crossbowmen.size }; }
}
