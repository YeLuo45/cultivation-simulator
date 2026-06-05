/**
 * CultivationArt.js - 功法系统
 * V398 Iteration 5/15 Round 13
 */
export class CultivationArt {
    constructor(config = {}) {
        this.config = { maxArts: config.maxArts || 200, basePower: config.basePower || 10, ...config };
        this.arts = new Map();
        this.practices = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalArts: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getArt', (ctx) => this.getArt(ctx.artId));
        this.registerTool('createArt', (ctx) => this.createArt(ctx));
    }

    createArt(data) {
        const id = data.id || `art_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const art = { artId: id, name: data.name || 'Cultivation Art', element: data.element || 'none', grade: data.grade || 'common', power: data.power || this.config.basePower, mastery: 0, createdAt: Date.now() };
        this.arts.set(id, art);
        this.stats.totalArts++;
        this._triggerHook('artCreated', { artId: id });
        return { success: true, art };
    }

    getArt(id) { return this.arts.get(id) ? { ...this.arts.get(id) } : null; }
    listArts() { return Array.from(this.arts.values()).map(a => ({ ...a })); }
    listByElement(element) { return Array.from(this.arts.values()).filter(a => a.element === element).map(a => ({ ...a })); }
    listByGrade(grade) { return Array.from(this.arts.values()).filter(a => a.grade === grade).map(a => ({ ...a })); }

    practice(artId, cultivatorId, amount = 5) {
        const art = this.arts.get(artId);
        if (!art) return { success: false, error: 'ART_NOT_FOUND' };
        art.mastery += amount;
        const id = `prc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const practice = { practiceId: id, artId, cultivatorId, amount, practicedAt: Date.now() };
        this.practices.set(id, practice);
        this._triggerHook('artPracticed', { artId, cultivatorId });
        return { success: true, art: { ...art } };
    }

    getPractice(id) { return this.practices.get(id) ? { ...this.practices.get(id) } : null; }
    listPractices() { return Array.from(this.practices.values()).map(p => ({ ...p })); }
    listPracticesByArt(artId) { return Array.from(this.practices.values()).filter(p => p.artId === artId).map(p => ({ ...p })); }
    listPracticesByCultivator(cultivatorId) { return Array.from(this.practices.values()).filter(p => p.cultivatorId === cultivatorId).map(p => ({ ...p })); }

    calculatePower(artId) {
        const art = this.arts.get(artId);
        if (!art) return 0;
        return art.power + art.mastery * 2;
    }

    listMastered(threshold = 50) { return Array.from(this.arts.values()).filter(a => a.mastery >= threshold).map(a => ({ ...a })); }

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
        if (this.stats.totalArts < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxArts += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { arts: Array.from(this.arts.entries()), practices: Array.from(this.practices.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.arts) this.arts = new Map(data.arts);
        if (data.practices) this.practices = new Map(data.practices);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, artCount: this.arts.size }; }
}