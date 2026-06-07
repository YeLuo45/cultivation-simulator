/**
 * CultivationGold.js - 修真金系统
 * V856 Iteration 29/30 Round 33
 */
export class CultivationGold {
    constructor(config = {}) {
        this.config = { maxGolds: config.maxGolds || 20, baseLuster: config.baseLuster || 20, ...config };
        this.golds = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGolds: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getGold', (ctx) => this.getGold(ctx.goldId));
        this.registerTool('recruitGold', (ctx) => this.recruitGold(ctx));
    }

    recruitGold(data) {
        const id = data.id || `gld_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const gold = {
            goldId: id,
            masterId: data.masterId || 'unknown_master',
            name: data.name || 'unnamed_gold',
            type: data.type || 'pure',
            luster: data.luster || this.config.baseLuster,
            veins: data.veins || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.golds.set(id, gold);
        this.stats.totalGolds++;
        this._triggerHook('goldRecruited', { goldId: id });
        return { success: true, gold };
    }

    getGold(id) { return this.golds.get(id) ? { ...this.golds.get(id) } : null; }
    listGolds() { return Array.from(this.golds.values()).map(g => ({ ...g })); }
    listByMaster(masterId) { return Array.from(this.golds.values()).filter(g => g.masterId === masterId).map(g => ({ ...g })); }
    listLegendary() { return Array.from(this.golds.values()).filter(g => g.status === 'legendary').map(g => ({ ...g })); }

    addVein(goldId, vein) {
        const gold = this.golds.get(goldId);
        if (!gold) return { success: false, error: 'GOLD_NOT_FOUND' };
        gold.veins.push(vein);
        if (gold.veins.length >= 5) gold.status = 'veteran';
        this._triggerHook('veinAdded', { goldId, vein });
        return { success: true };
    }

    raiseLuster(goldId, amount = 5) {
        const gold = this.golds.get(goldId);
        if (!gold) return { success: false, error: 'GOLD_NOT_FOUND' };
        gold.luster += amount;
        this._triggerHook('lusterRaised', { goldId, newLuster: gold.luster });
        return { success: true };
    }

    levelUpGold(goldId) {
        const gold = this.golds.get(goldId);
        if (!gold) return { success: false, error: 'GOLD_NOT_FOUND' };
        gold.level++;
        this._triggerHook('goldLeveledUp', { goldId, newLevel: gold.level });
        return { success: true };
    }

    legendGold(goldId) {
        const gold = this.golds.get(goldId);
        if (!gold) return { success: false, error: 'GOLD_NOT_FOUND' };
        gold.status = 'legendary';
        this._triggerHook('goldLegendized', { goldId });
        return { success: true };
    }

    calculateGoldValue(goldId) {
        const gold = this.golds.get(goldId);
        if (!gold) return 0;
        return gold.level * 100 + gold.luster * 2 + gold.veins.length * 30;
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
        if (this.stats.totalGolds < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxGolds += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { golds: Array.from(this.golds.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.golds) this.golds = new Map(data.golds);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, goldCount: this.golds.size }; }
}
