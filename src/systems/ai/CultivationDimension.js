/**
 * CultivationDimension.js - 修真维度
 * V679 Iteration 2/30 Round 28
 *
 * 融合6大设计系统:
 * - generic-agent: 维度自循环
 * - chatdev: 维度角色协调
 * - nanobot: 维度mesh
 * - claude-code: 维度分析工具
 * - thunderbolt: 维度持久化
 * - ruflo: 维度Hook
 */

export class CultivationDimension {
    constructor(config = {}) {
        this.config = { maxDimensions: config.maxDimensions || 20, baseDepth: config.baseDepth || 20, ...config };
        this.dimensions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDimensions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDimension', (ctx) => this.getDimension(ctx.dimensionId));
        this.registerTool('recruitDimension', (ctx) => this.recruitDimension(ctx));
    }

    recruitDimension(data) {
        const id = data.id || `dim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const dimension = {
            dimensionId: id,
            masterId: data.masterId,
            name: data.name || 'Cultivation Dimension',
            type: data.type || 'spatial',
            depth: data.depth !== undefined ? data.depth : this.config.baseDepth,
            portals: data.portals || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.dimensions.set(id, dimension);
        this.stats.totalDimensions++;
        this._triggerHook('dimensionRecruited', { dimensionId: id });
        return { success: true, dimension };
    }

    getDimension(id) { return this.dimensions.get(id) ? { ...this.dimensions.get(id) } : null; }
    listDimensions() { return Array.from(this.dimensions.values()).map(d => ({ ...d })); }
    listByMaster(masterId) { return Array.from(this.dimensions.values()).filter(d => d.masterId === masterId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.dimensions.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addPortal(dimensionId, portal) {
        const dimension = this.dimensions.get(dimensionId);
        if (!dimension) return { success: false, error: 'DIMENSION_NOT_FOUND' };
        dimension.portals.push(portal);
        this._triggerHook('portalAdded', { dimensionId, portal });
        return { success: true };
    }

    deepenDepth(dimensionId, amount = 5) {
        const dimension = this.dimensions.get(dimensionId);
        if (!dimension) return { success: false, error: 'DIMENSION_NOT_FOUND' };
        dimension.depth += amount;
        this._triggerHook('depthDeepened', { dimensionId, newDepth: dimension.depth });
        return { success: true };
    }

    levelUpDimension(dimensionId) {
        const dimension = this.dimensions.get(dimensionId);
        if (!dimension) return { success: false, error: 'DIMENSION_NOT_FOUND' };
        dimension.level++;
        this._triggerHook('dimensionLeveledUp', { dimensionId, newLevel: dimension.level });
        return { success: true };
    }

    legendDimension(dimensionId) {
        const dimension = this.dimensions.get(dimensionId);
        if (!dimension) return { success: false, error: 'DIMENSION_NOT_FOUND' };
        dimension.status = 'legendary';
        this._triggerHook('dimensionLegendized', { dimensionId });
        return { success: true };
    }

    calculateDimensionValue(dimensionId) {
        const dimension = this.dimensions.get(dimensionId);
        if (!dimension) return 0;
        return dimension.level * 100 + dimension.depth * 2 + dimension.portals.length * 30;
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
        if (this.stats.totalDimensions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDimensions += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { dimensions: Array.from(this.dimensions.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.dimensions) this.dimensions = new Map(data.dimensions);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, dimensionCount: this.dimensions.size }; }
}
