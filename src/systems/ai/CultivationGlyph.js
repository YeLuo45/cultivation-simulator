/**
 * CultivationGlyph.js - 修真符文系统
 * V761 Iteration 24/30 Round 30 - Cultivation Glyph
 */

export class CultivationGlyph {
    constructor(config = {}) {
        this.config = { maxGlyphs: config.maxGlyphs || 20, baseDepth: config.baseDepth || 20, ...config };
        this.glyphs = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGlyphs: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getGlyph', (ctx) => this.getGlyph(ctx.glyphId));
        this.registerTool('recruitGlyph', (ctx) => this.recruitGlyph(ctx));
    }

    recruitGlyph(data) {
        const id = data.glyphId || `gly_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const glyph = {
            glyphId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Glyph',
            type: data.type || 'arcane',
            depth: data.depth || this.config.baseDepth,
            strokes: data.strokes || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.glyphs.set(id, glyph);
        this.stats.totalGlyphs++;
        this._triggerHook('glyphRecruited', { glyphId: id });
        return { success: true, glyph };
    }

    getGlyph(id) { return this.glyphs.get(id) ? { ...this.glyphs.get(id) } : null; }
    listGlyphs() { return Array.from(this.glyphs.values()).map(g => ({ ...g })); }
    listByMaster(masterId) { return Array.from(this.glyphs.values()).filter(g => g.masterId === masterId).map(g => ({ ...g })); }
    listLegendary() { return Array.from(this.glyphs.values()).filter(g => g.status === 'legendary').map(g => ({ ...g })); }

    addStroke(glyphId, stroke) {
        const glyph = this.glyphs.get(glyphId);
        if (!glyph) return { success: false, error: 'GLYPH_NOT_FOUND' };
        glyph.strokes.push(stroke);
        this._triggerHook('strokeAdded', { glyphId, stroke });
        return { success: true, glyph: { ...glyph } };
    }

    raiseDepth(glyphId, amount = 5) {
        const glyph = this.glyphs.get(glyphId);
        if (!glyph) return { success: false, error: 'GLYPH_NOT_FOUND' };
        glyph.depth += amount;
        this._triggerHook('depthRaised', { glyphId, newDepth: glyph.depth });
        return { success: true };
    }

    levelUpGlyph(glyphId) {
        const glyph = this.glyphs.get(glyphId);
        if (!glyph) return { success: false, error: 'GLYPH_NOT_FOUND' };
        glyph.level++;
        this._triggerHook('glyphLeveledUp', { glyphId, newLevel: glyph.level });
        return { success: true };
    }

    legendGlyph(glyphId) {
        const glyph = this.glyphs.get(glyphId);
        if (!glyph) return { success: false, error: 'GLYPH_NOT_FOUND' };
        glyph.status = 'legendary';
        this._triggerHook('glyphLegendized', { glyphId });
        return { success: true };
    }

    calculateGlyphValue(glyphId) {
        const glyph = this.glyphs.get(glyphId);
        if (!glyph) return 0;
        return glyph.level * 100 + glyph.depth * 2 + glyph.strokes.length * 30;
    }

    listByType(type) { return Array.from(this.glyphs.values()).filter(g => g.type === type).map(g => ({ ...g })); }
    listVeteran() { return Array.from(this.glyphs.values()).filter(g => g.status === 'veteran').map(g => ({ ...g })); }

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
        if (this.stats.totalGlyphs < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxGlyphs += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { glyphs: Array.from(this.glyphs.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.glyphs) this.glyphs = new Map(data.glyphs);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, glyphCount: this.glyphs.size }; }
}
