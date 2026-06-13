/**
 * CultivationLake.js - 修真湖系统
 * V690 Iteration 13/30 Round 28
 */
export class CultivationLake {
    constructor(config = {}) {
        this.config = { maxLakes: config.maxLakes || 15, baseDepth: config.baseDepth || 20, ...config };
        this.lakes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalLakes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getLake', (ctx) => this.getLake(ctx.lakeId));
        this.registerTool('recruitLake', (ctx) => this.recruitLake(ctx));
    }

    recruitLake(data) {
        const id = data.lakeId || `lake_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const lake = { lakeId: id, masterId: data.masterId, name: data.name || 'Unnamed Lake', type: data.type || 'earthly', depth: data.depth || this.config.baseDepth, islands: data.islands || [], level: 1, status: 'novice', createdAt: Date.now() };
        this.lakes.set(id, lake);
        this.stats.totalLakes++;
        this._triggerHook('lakeRecruited', { lakeId: id });
        return { success: true, lake };
    }

    getLake(id) { return this.lakes.get(id) ? { ...this.lakes.get(id) } : null; }
    listLakes() { return Array.from(this.lakes.values()).map(l => ({ ...l })); }
    listByMaster(masterId) { return Array.from(this.lakes.values()).filter(l => l.masterId === masterId).map(l => ({ ...l })); }
    listLegendary() { return Array.from(this.lakes.values()).filter(l => l.status === 'legendary').map(l => ({ ...l })); }

    addIsland(lakeId, island) {
        const lake = this.lakes.get(lakeId);
        if (!lake) return { success: false, error: 'LAKE_NOT_FOUND' };
        lake.islands.push(island);
        this._triggerHook('islandAdded', { lakeId, island });
        return { success: true };
    }

    deepenDepth(lakeId, amount = 5) {
        const lake = this.lakes.get(lakeId);
        if (!lake) return { success: false, error: 'LAKE_NOT_FOUND' };
        lake.depth += amount;
        this._triggerHook('depthDeepened', { lakeId, newDepth: lake.depth });
        return { success: true };
    }

    levelUpLake(lakeId) {
        const lake = this.lakes.get(lakeId);
        if (!lake) return { success: false, error: 'LAKE_NOT_FOUND' };
        lake.level++;
        this._triggerHook('lakeLeveledUp', { lakeId, newLevel: lake.level });
        return { success: true };
    }

    legendLake(lakeId) {
        const lake = this.lakes.get(lakeId);
        if (!lake) return { success: false, error: 'LAKE_NOT_FOUND' };
        lake.status = 'legendary';
        this._triggerHook('lakeLegendized', { lakeId });
        return { success: true };
    }

    calculateLakeValue(lakeId) {
        const lake = this.lakes.get(lakeId);
        if (!lake) return 0;
        return lake.level * 100 + lake.depth * 2 + lake.islands.length * 30;
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
        if (this.stats.totalLakes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxLakes += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { lakes: Array.from(this.lakes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.lakes) this.lakes = new Map(data.lakes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, lakeCount: this.lakes.size }; }
}
