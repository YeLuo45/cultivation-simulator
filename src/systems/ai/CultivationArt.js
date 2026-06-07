/**
 * CultivationArt.js - 修真艺术
 * V697 Iteration 20/30 Round 28 - Cultivation Art
 */
export class CultivationArt {
    constructor(config = {}) {
        this.config = { maxArts: config.maxArts || 30, baseInspiration: config.baseInspiration || 20, ...config };
        this.arts = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalArts: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getArt', (ctx) => this.getArt(ctx.artId));
        this.registerTool('recruitArt', (ctx) => this.recruitArt(ctx));
    }

    recruitArt(data) {
        const id = data.id || `art_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const art = { artId: id, masterId: data.masterId, name: data.name || 'Untitled Art', type: data.type || 'sword', inspiration: data.inspiration || this.config.baseInspiration, works: data.works || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.arts.set(id, art);
        this.stats.totalArts++;
        this._triggerHook('artRecruited', { artId: id });
        return { success: true, art };
    }

    getArt(id) { return this.arts.get(id) ? { ...this.arts.get(id), works: [...(this.arts.get(id).works || [])] } : null; }
    listArts() { return Array.from(this.arts.values()).map(a => ({ ...a, works: [...(a.works || [])] })); }
    listByMaster(masterId) { return Array.from(this.arts.values()).filter(a => a.masterId === masterId).map(a => ({ ...a, works: [...(a.works || [])] })); }
    listLegendary() { return Array.from(this.arts.values()).filter(a => a.status === 'legendary').map(a => ({ ...a, works: [...(a.works || [])] })); }

    addWork(artId, work) {
        const art = this.arts.get(artId);
        if (!art) return { success: false, error: 'ART_NOT_FOUND' };
        art.works.push(work);
        this._triggerHook('workAdded', { artId, work });
        return { success: true };
    }

    raiseInspiration(artId, amount = 5) {
        const art = this.arts.get(artId);
        if (!art) return { success: false, error: 'ART_NOT_FOUND' };
        art.inspiration += amount;
        this._triggerHook('inspirationRaised', { artId, newInspiration: art.inspiration });
        return { success: true };
    }

    levelUpArt(artId) {
        const art = this.arts.get(artId);
        if (!art) return { success: false, error: 'ART_NOT_FOUND' };
        art.level++;
        this._triggerHook('artLeveledUp', { artId, newLevel: art.level });
        return { success: true };
    }

    legendArt(artId) {
        const art = this.arts.get(artId);
        if (!art) return { success: false, error: 'ART_NOT_FOUND' };
        art.status = 'legendary';
        this._triggerHook('artLegendized', { artId });
        return { success: true };
    }

    calculateArtValue(artId) {
        const art = this.arts.get(artId);
        if (!art) return 0;
        return art.level * 100 + art.inspiration * 2 + art.works.length * 30;
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
        if (this.stats.totalArts < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxArts += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { arts: Array.from(this.arts.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.arts) this.arts = new Map(data.arts);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, artCount: this.arts.size }; }
}
