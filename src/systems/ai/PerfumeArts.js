/**
 * PerfumeArts.js - 香道系统
 * V443 Iteration 5/15 Round 16
 */
export class PerfumeArts {
    constructor(config = {}) {
        this.config = { maxPerfumes: config.maxPerfumes || 200, baseLongevity: config.baseLongevity || 20, ...config };
        this.perfumes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPerfumes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPerfume', (ctx) => this.getPerfume(ctx.perfumeId));
        this.registerTool('mixPerfume', (ctx) => this.mixPerfume(ctx));
    }

    mixPerfume(data) {
        const id = data.perfumeId || `pfm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const perfume = {
            perfumeId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'unnamed_perfume',
            base: data.base || 'flower',
            notes: data.notes || [],
            longevity: data.longevity || this.config.baseLongevity,
            harmony: data.harmony || 0,
            status: 'mixed',
            mixedAt: Date.now()
        };
        this.perfumes.set(id, perfume);
        this.stats.totalPerfumes++;
        this._triggerHook('perfumeMixed', { perfumeId: id });
        return { success: true, perfume };
    }

    getPerfume(id) { return this.perfumes.get(id) ? { ...this.perfumes.get(id) } : null; }
    listPerfumes() { return Array.from(this.perfumes.values()).map(p => ({ ...p })); }
    listByBase(base) { return Array.from(this.perfumes.values()).filter(p => p.base === base).map(p => ({ ...p })); }
    listByCultivator(cultivatorId) { return Array.from(this.perfumes.values()).filter(p => p.cultivatorId === cultivatorId).map(p => ({ ...p })); }

    addNote(perfumeId, note) {
        const perfume = this.perfumes.get(perfumeId);
        if (!perfume) return { success: false, error: 'PERFUME_NOT_FOUND' };
        perfume.notes.push(note);
        this._triggerHook('noteAdded', { perfumeId, note });
        return { success: true, noteCount: perfume.notes.length };
    }

    increaseLongevity(perfumeId, amount = 5) {
        const perfume = this.perfumes.get(perfumeId);
        if (!perfume) return { success: false, error: 'PERFUME_NOT_FOUND' };
        perfume.longevity += amount;
        this._triggerHook('longevityIncreased', { perfumeId, newLongevity: perfume.longevity });
        return { success: true, newLongevity: perfume.longevity };
    }

    wearPerfume(perfumeId) {
        const perfume = this.perfumes.get(perfumeId);
        if (!perfume) return { success: false, error: 'PERFUME_NOT_FOUND' };
        perfume.status = 'worn';
        this._triggerHook('perfumeWorn', { perfumeId });
        return { success: true, status: perfume.status };
    }

    calculateFragranceQuality(perfumeId) {
        const perfume = this.perfumes.get(perfumeId);
        if (!perfume) return 0;
        return perfume.longevity * (1 + perfume.notes.length / 5) + perfume.harmony;
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
        if (this.stats.totalPerfumes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPerfumes += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { perfumes: Array.from(this.perfumes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.perfumes) this.perfumes = new Map(data.perfumes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, perfumeCount: this.perfumes.size }; }
}
