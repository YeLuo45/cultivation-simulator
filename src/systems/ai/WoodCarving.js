/**
 * WoodCarving.js - 木雕系统
 * V516 Iteration 18/20 Round 20
 */
export class WoodCarving {
    constructor(config = {}) {
        this.config = { maxCarvings: config.maxCarvings || 100, baseDetail: config.baseDetail || 10, ...config };
        this.carvings = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCarvings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCarving', (ctx) => this.getCarving(ctx.carvingId));
        this.registerTool('carveWood', (ctx) => this.carveWood(ctx));
    }

    carveWood(data) {
        const id = data.id || `crv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const carving = {
            carvingId: id,
            carverId: data.carverId || 'unknown_carver',
            name: data.name || 'unnamed_carving',
            type: data.type || 'figure',
            detail: data.detail || this.config.baseDetail,
            materials: data.materials || [],
            status: data.status || 'raw',
            startedAt: Date.now()
        };
        this.carvings.set(id, carving);
        this.stats.totalCarvings++;
        this._triggerHook('carvingStarted', { carvingId: id });
        return { success: true, carving };
    }

    getCarving(id) { return this.carvings.get(id) ? { ...this.carvings.get(id) } : null; }
    listCarvings() { return Array.from(this.carvings.values()).map(c => ({ ...c })); }
    listByCarver(carverId) { return Array.from(this.carvings.values()).filter(c => c.carverId === carverId).map(c => ({ ...c })); }
    listMastered() { return Array.from(this.carvings.values()).filter(c => c.status === 'mastered').map(c => ({ ...c })); }

    addMaterial(carvingId, material) {
        const carving = this.carvings.get(carvingId);
        if (!carving) return { success: false, error: 'CARVING_NOT_FOUND' };
        carving.materials.push(material);
        if (carving.materials.length >= 2) carving.status = 'sculpted';
        this._triggerHook('materialAdded', { carvingId, material });
        return { success: true };
    }

    refineDetail(carvingId, amount = 5) {
        const carving = this.carvings.get(carvingId);
        if (!carving) return { success: false, error: 'CARVING_NOT_FOUND' };
        carving.detail += amount;
        this._triggerHook('detailRefined', { carvingId, newDetail: carving.detail });
        return { success: true };
    }

    masterCarving(carvingId) {
        const carving = this.carvings.get(carvingId);
        if (!carving) return { success: false, error: 'CARVING_NOT_FOUND' };
        carving.status = 'mastered';
        this._triggerHook('carvingMastered', { carvingId });
        return { success: true };
    }

    calculateCarvingValue(carvingId) {
        const carving = this.carvings.get(carvingId);
        if (!carving) return 0;
        return carving.detail * 10 + carving.materials.length * 5;
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
        if (this.stats.totalCarvings < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCarvings += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { carvings: Array.from(this.carvings.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.carvings) this.carvings = new Map(data.carvings);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, carvingCount: this.carvings.size }; }
}
