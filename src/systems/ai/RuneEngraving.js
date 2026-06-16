/**
 * RuneEngraving.js - 符文雕刻系统
 * V507 Iteration 9/20 Round 20
 */
export class RuneEngraving {
    constructor(config = {}) {
        this.config = { maxRunes: config.maxRunes || 200, basePrecision: config.basePrecision || 15, ...config };
        this.runes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRunes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRune', (ctx) => this.getRune(ctx.runeId));
        this.registerTool('engraveRune', (ctx) => this.engraveRune(ctx));
    }

    engraveRune(data) {
        const id = data.runeId || `rune_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const rune = {
            runeId: id,
            engraverId: data.engraverId,
            name: data.name || 'Unnamed Rune',
            type: data.type || 'fire',
            precision: data.precision || this.config.basePrecision,
            materials: data.materials || [],
            status: 'draft',
            createdAt: Date.now()
        };
        this.runes.set(id, rune);
        this.stats.totalRunes++;
        this._triggerHook('runeEngraved', { runeId: id });
        return { success: true, rune };
    }

    getRune(id) { return this.runes.get(id) ? { ...this.runes.get(id) } : null; }
    listRunes() { return Array.from(this.runes.values()).map(r => ({ ...r })); }
    listByEngraver(engraverId) { return Array.from(this.runes.values()).filter(r => r.engraverId === engraverId).map(r => ({ ...r })); }
    listByType(type) { return Array.from(this.runes.values()).filter(r => r.type === type).map(r => ({ ...r })); }
    listMastered() { return Array.from(this.runes.values()).filter(r => r.status === 'mastered').map(r => ({ ...r })); }

    addMaterial(runeId, material) {
        const rune = this.runes.get(runeId);
        if (!rune) return { success: false, error: 'RUNE_NOT_FOUND' };
        rune.materials.push(material);
        this._triggerHook('materialAdded', { runeId, material });
        return { success: true };
    }

    refineRune(runeId, amount = 5) {
        const rune = this.runes.get(runeId);
        if (!rune) return { success: false, error: 'RUNE_NOT_FOUND' };
        rune.precision += amount;
        if (rune.status === 'draft') rune.status = 'engraved';
        this._triggerHook('runeRefined', { runeId, newPrecision: rune.precision });
        return { success: true };
    }

    masterRune(runeId) {
        const rune = this.runes.get(runeId);
        if (!rune) return { success: false, error: 'RUNE_NOT_FOUND' };
        rune.status = 'mastered';
        this._triggerHook('runeMastered', { runeId });
        return { success: true };
    }

    calculateRunePower(runeId) {
        const rune = this.runes.get(runeId);
        if (!rune) return 0;
        return rune.precision * 10 + rune.materials.length * 20;
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
        if (this.stats.totalRunes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRunes += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { runes: Array.from(this.runes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.runes) this.runes = new Map(data.runes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, runeCount: this.runes.size }; }
}
