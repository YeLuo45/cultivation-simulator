/**
 * CultivationSapphire.js - 修真蓝宝石系统
 * V834 Iteration 7/30 Round 33
 */
export class CultivationSapphire {
    constructor(config = {}) {
        this.config = { maxSapphires: config.maxSapphires || 20, baseDepth: config.baseDepth || 20, ...config };
        this.sapphires = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSapphires: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSapphire', (ctx) => this.getSapphire(ctx.sapphireId));
        this.registerTool('recruitSapphire', (ctx) => this.recruitSapphire(ctx));
    }

    recruitSapphire(data) {
        const id = data.sapphireId || `sapphire_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const sapphire = { sapphireId: id, masterId: data.masterId, name: data.name || 'Mystic Sapphire', type: data.type || 'divine', depth: data.depth || this.config.baseDepth, inclusions: data.inclusions || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.sapphires.set(id, sapphire);
        this.stats.totalSapphires++;
        this._triggerHook('sapphireRecruited', { sapphireId: id });
        return { success: true, sapphire };
    }

    getSapphire(id) { return this.sapphires.get(id) ? { ...this.sapphires.get(id) } : null; }
    listSapphires() { return Array.from(this.sapphires.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.sapphires.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.sapphires.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addInclusion(sapphireId, inclusion) {
        const sapphire = this.sapphires.get(sapphireId);
        if (!sapphire) return { success: false, error: 'SAPPHIRE_NOT_FOUND' };
        sapphire.inclusions.push(inclusion);
        this._triggerHook('inclusionAdded', { sapphireId, inclusion });
        return { success: true };
    }

    raiseDepth(sapphireId, amount = 5) {
        const sapphire = this.sapphires.get(sapphireId);
        if (!sapphire) return { success: false, error: 'SAPPHIRE_NOT_FOUND' };
        sapphire.depth += amount;
        this._triggerHook('depthRaised', { sapphireId, newDepth: sapphire.depth });
        return { success: true };
    }

    levelUpSapphire(sapphireId) {
        const sapphire = this.sapphires.get(sapphireId);
        if (!sapphire) return { success: false, error: 'SAPPHIRE_NOT_FOUND' };
        sapphire.level++;
        this._triggerHook('sapphireLeveledUp', { sapphireId, newLevel: sapphire.level });
        return { success: true };
    }

    legendSapphire(sapphireId) {
        const sapphire = this.sapphires.get(sapphireId);
        if (!sapphire) return { success: false, error: 'SAPPHIRE_NOT_FOUND' };
        sapphire.status = 'legendary';
        this._triggerHook('sapphireLegendized', { sapphireId });
        return { success: true };
    }

    calculateSapphireValue(sapphireId) {
        const sapphire = this.sapphires.get(sapphireId);
        if (!sapphire) return 0;
        return sapphire.level * 100 + sapphire.depth * 2 + sapphire.inclusions.length * 30;
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
        if (this.stats.totalSapphires < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSapphires += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { sapphires: Array.from(this.sapphires.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.sapphires) this.sapphires = new Map(data.sapphires);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, sapphireCount: this.sapphires.size }; }
}
