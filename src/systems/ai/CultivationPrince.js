/**
 * CultivationPrince.js - 修真王子系统
 * V732 Iteration 25/30 Round 29
 */
export class CultivationPrince {
    constructor(config = {}) {
        this.config = { maxPrinces: config.maxPrinces || 20, baseLineage: config.baseLineage || 20, ...config };
        this.princes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPrinces: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPrince', (ctx) => this.getPrince(ctx.princeId));
        this.registerTool('recruitPrince', (ctx) => this.recruitPrince(ctx));
    }

    recruitPrince(data) {
        const id = data.princeId || `prn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const prince = {
            princeId: id,
            parentId: data.parentId,
            name: data.name,
            type: data.type || 'noble',
            lineage: data.lineage || this.config.baseLineage,
            virtues: data.virtues || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.princes.set(id, prince);
        this.stats.totalPrinces++;
        this._triggerHook('princeRecruited', { princeId: id });
        return { success: true, prince };
    }

    getPrince(id) { return this.princes.get(id) ? { ...this.princes.get(id) } : null; }
    listPrinces() { return Array.from(this.princes.values()).map(p => ({ ...p })); }
    listByParent(parentId) { return Array.from(this.princes.values()).filter(p => p.parentId === parentId).map(p => ({ ...p })); }
    listLegendary() { return Array.from(this.princes.values()).filter(p => p.status === 'legendary').map(p => ({ ...p })); }

    addVirtue(princeId, virtue) {
        const prince = this.princes.get(princeId);
        if (!prince) return { success: false, error: 'PRINCE_NOT_FOUND' };
        prince.virtues.push(virtue);
        this._triggerHook('virtueAdded', { princeId, virtue });
        return { success: true };
    }

    raiseLineage(princeId, amount = 5) {
        const prince = this.princes.get(princeId);
        if (!prince) return { success: false, error: 'PRINCE_NOT_FOUND' };
        prince.lineage += amount;
        this._triggerHook('lineageRaised', { princeId, newLineage: prince.lineage });
        return { success: true };
    }

    levelUpPrince(princeId) {
        const prince = this.princes.get(princeId);
        if (!prince) return { success: false, error: 'PRINCE_NOT_FOUND' };
        prince.level++;
        this._triggerHook('princeLeveledUp', { princeId, newLevel: prince.level });
        return { success: true };
    }

    legendPrince(princeId) {
        const prince = this.princes.get(princeId);
        if (!prince) return { success: false, error: 'PRINCE_NOT_FOUND' };
        prince.status = 'legendary';
        this._triggerHook('princeLegendized', { princeId });
        return { success: true };
    }

    calculatePrinceValue(princeId) {
        const prince = this.princes.get(princeId);
        if (!prince) return 0;
        return prince.level * 100 + prince.lineage * 2 + prince.virtues.length * 30;
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
        if (this.stats.totalPrinces < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPrinces += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { princes: Array.from(this.princes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.princes) this.princes = new Map(data.princes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, princeCount: this.princes.size }; }
}
