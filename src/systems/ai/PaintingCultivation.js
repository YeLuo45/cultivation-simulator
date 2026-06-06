/**
 * PaintingCultivation.js - 画道系统
 * V425 Iteration 2/15 Round 15
 */
export class PaintingCultivation {
    constructor(config = {}) {
        this.config = { maxPaintings: config.maxPaintings || 200, baseBrushwork: config.baseBrushwork || 20, ...config };
        this.paintings = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPaintings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPainting', (ctx) => this.getPainting(ctx.paintingId));
        this.registerTool('createPainting', (ctx) => this.createPainting(ctx));
    }

    createPainting(data) {
        const id = data.id || `pnt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const painting = {
            paintingId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'Untitled Painting',
            type: data.type || 'landscape',
            brushwork: data.brushwork || this.config.baseBrushwork,
            color: data.color || '#000000',
            dao: data.dao || '',
            status: data.status || 'draft',
            createdAt: Date.now()
        };
        this.paintings.set(id, painting);
        this.stats.totalPaintings++;
        this._triggerHook('paintingCreated', { paintingId: id });
        return { success: true, painting };
    }

    getPainting(id) { return this.paintings.get(id) ? { ...this.paintings.get(id) } : null; }
    listPaintings() { return Array.from(this.paintings.values()).map(p => ({ ...p })); }
    listByType(type) { return Array.from(this.paintings.values()).filter(p => p.type === type).map(p => ({ ...p })); }
    listByCultivator(cultivatorId) { return Array.from(this.paintings.values()).filter(p => p.cultivatorId === cultivatorId).map(p => ({ ...p })); }
    listByStatus(status) { return Array.from(this.paintings.values()).filter(p => p.status === status).map(p => ({ ...p })); }

    refinePainting(paintingId, amount = 5) {
        const painting = this.paintings.get(paintingId);
        if (!painting) return { success: false, error: 'PAINTING_NOT_FOUND' };
        painting.brushwork += amount;
        this._triggerHook('paintingRefined', { paintingId, newBrushwork: painting.brushwork });
        return { success: true, painting: { ...painting } };
    }

    paintPainting(paintingId, color) {
        const painting = this.paintings.get(paintingId);
        if (!painting) return { success: false, error: 'PAINTING_NOT_FOUND' };
        painting.color = color;
        this._triggerHook('paintApplied', { paintingId, color });
        return { success: true, painting: { ...painting } };
    }

    completePainting(paintingId) {
        const painting = this.paintings.get(paintingId);
        if (!painting) return { success: false, error: 'PAINTING_NOT_FOUND' };
        painting.status = 'completed';
        this._triggerHook('paintingCompleted', { paintingId });
        return { success: true, painting: { ...painting } };
    }

    calculateDaoInsight(paintingId) {
        const painting = this.paintings.get(paintingId);
        if (!painting) return 0;
        return painting.brushwork * (1 + painting.color.length / 10) + painting.dao.length;
    }

    listCompleted() { return this.listByStatus('completed'); }

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
        if (this.stats.totalPaintings < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPaintings += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { paintings: Array.from(this.paintings.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.paintings) this.paintings = new Map(data.paintings);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, paintingCount: this.paintings.size }; }
}
