/**
 * CultivationJewelry.js - 修真饰系统
 * V565 Iteration 8/20 Round 23
 */
export class CultivationJewelry {
    constructor(config = {}) {
        this.config = { maxJewelries: config.maxJewelries || 50, baseBrilliance: config.baseBrilliance || 20, ...config };
        this.jewelries = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalJewelries: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getJewelry', (ctx) => this.getJewelry(ctx.jewelryId));
        this.registerTool('craftJewelry', (ctx) => this.craftJewelry(ctx));
    }

    craftJewelry(data) {
        const id = data.id || `jwl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const jewelry = {
            jewelryId: id,
            jewelerId: data.jewelerId || 'unknown_jeweler',
            name: data.name || 'unnamed_jewelry',
            type: data.type || 'necklace',
            brilliance: data.brilliance || this.config.baseBrilliance,
            gems: data.gems || [],
            level: data.level || 1,
            status: data.status || 'crafted',
            createdAt: Date.now()
        };
        this.jewelries.set(id, jewelry);
        this.stats.totalJewelries++;
        this._triggerHook('jewelryCrafted', { jewelryId: id });
        return { success: true, jewelry };
    }

    getJewelry(id) { return this.jewelries.get(id) ? { ...this.jewelries.get(id) } : null; }
    listJewelries() { return Array.from(this.jewelries.values()).map(j => ({ ...j })); }
    listByJeweler(jewelerId) { return Array.from(this.jewelries.values()).filter(j => j.jewelerId === jewelerId).map(j => ({ ...j })); }
    listLegendary() { return Array.from(this.jewelries.values()).filter(j => j.status === 'legendary').map(j => ({ ...j })); }

    addGem(jewelryId, gem) {
        const jewelry = this.jewelries.get(jewelryId);
        if (!jewelry) return { success: false, error: 'JEWELRY_NOT_FOUND' };
        jewelry.gems.push(gem);
        this._triggerHook('gemAdded', { jewelryId, gem });
        return { success: true };
    }

    increaseBrilliance(jewelryId, amount = 5) {
        const jewelry = this.jewelries.get(jewelryId);
        if (!jewelry) return { success: false, error: 'JEWELRY_NOT_FOUND' };
        jewelry.brilliance += amount;
        this._triggerHook('brillianceIncreased', { jewelryId, newBrilliance: jewelry.brilliance });
        return { success: true };
    }

    levelUpJewelry(jewelryId) {
        const jewelry = this.jewelries.get(jewelryId);
        if (!jewelry) return { success: false, error: 'JEWELRY_NOT_FOUND' };
        jewelry.level++;
        this._triggerHook('jewelryLeveledUp', { jewelryId, newLevel: jewelry.level });
        return { success: true };
    }

    legendJewelry(jewelryId) {
        const jewelry = this.jewelries.get(jewelryId);
        if (!jewelry) return { success: false, error: 'JEWELRY_NOT_FOUND' };
        jewelry.status = 'legendary';
        this._triggerHook('jewelryLegendized', { jewelryId });
        return { success: true };
    }

    calculateJewelryValue(jewelryId) {
        const jewelry = this.jewelries.get(jewelryId);
        if (!jewelry) return 0;
        return jewelry.level * 100 + jewelry.brilliance * 2 + jewelry.gems.length * 30;
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
        if (this.stats.totalJewelries < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxJewelries += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { jewelries: Array.from(this.jewelries.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.jewelries) this.jewelries = new Map(data.jewelries);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, jewelryCount: this.jewelries.size }; }
}
