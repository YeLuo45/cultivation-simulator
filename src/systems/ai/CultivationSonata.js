/**
 * CultivationSonata.js - 修真奏鸣系统
 * V795 Iteration 28/30 Round 31
 */
export class CultivationSonata {
    constructor(config = {}) {
        this.config = { maxSonatas: config.maxSonatas || 20, baseEloquence: config.baseEloquence || 20, ...config };
        this.sonatas = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSonatas: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSonata', (ctx) => this.getSonata(ctx.sonataId));
        this.registerTool('recruitSonata', (ctx) => this.recruitSonata(ctx));
    }

    recruitSonata(data) {
        const id = data.sonataId || `snt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const sonata = {
            sonataId: id,
            masterId: data.masterId,
            name: data.name || 'Mystic Sonata',
            type: data.type || 'solo',
            eloquence: data.eloquence || this.config.baseEloquence,
            themes: data.themes || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.sonatas.set(id, sonata);
        this.stats.totalSonatas++;
        this._triggerHook('sonataRecruited', { sonataId: id });
        return { success: true, sonata };
    }

    getSonata(id) { return this.sonatas.get(id) ? { ...this.sonatas.get(id) } : null; }
    listSonatas() { return Array.from(this.sonatas.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.sonatas.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.sonatas.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addTheme(sonataId, theme) {
        const sonata = this.sonatas.get(sonataId);
        if (!sonata) return { success: false, error: 'SONATA_NOT_FOUND' };
        sonata.themes.push(theme);
        this._triggerHook('themeAdded', { sonataId, theme });
        return { success: true };
    }

    raiseEloquence(sonataId, amount = 5) {
        const sonata = this.sonatas.get(sonataId);
        if (!sonata) return { success: false, error: 'SONATA_NOT_FOUND' };
        sonata.eloquence += amount;
        this._triggerHook('eloquenceRaised', { sonataId, newEloquence: sonata.eloquence });
        return { success: true };
    }

    levelUpSonata(sonataId) {
        const sonata = this.sonatas.get(sonataId);
        if (!sonata) return { success: false, error: 'SONATA_NOT_FOUND' };
        sonata.level++;
        this._triggerHook('sonataLeveledUp', { sonataId, newLevel: sonata.level });
        return { success: true };
    }

    legendSonata(sonataId) {
        const sonata = this.sonatas.get(sonataId);
        if (!sonata) return { success: false, error: 'SONATA_NOT_FOUND' };
        sonata.status = 'legendary';
        this._triggerHook('sonataLegendized', { sonataId });
        return { success: true };
    }

    calculateSonataValue(sonataId) {
        const sonata = this.sonatas.get(sonataId);
        if (!sonata) return 0;
        return sonata.level * 100 + sonata.eloquence * 2 + sonata.themes.length * 30;
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
        if (this.stats.totalSonatas < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSonatas += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { sonatas: Array.from(this.sonatas.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.sonatas) this.sonatas = new Map(data.sonatas);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, sonataCount: this.sonatas.size }; }
}
