/**
 * SoulArts.js - 灵魂术
 * V420 Iteration 12/15 Round 14 - Soul Arts
 */
export class SoulArts {
    constructor(config = {}) {
        this.config = { maxArts: config.maxArts || 150, baseSoulPower: config.baseSoulPower || 30, ...config };
        this.arts = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalArts: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getArt', (ctx) => this.getArt(ctx.artId));
        this.registerTool('learnArt', (ctx) => this.learnArt(ctx));
    }

    learnArt(data) {
        const id = data.artId || `sa_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const art = {
            artId: id,
            name: data.name || 'Soul Art',
            type: data.type || 'attack',
            soulPower: data.soulPower || this.config.baseSoulPower,
            targetType: data.targetType || 'single',
            element: data.element || 'none',
            mastery: 0,
            status: 'learned',
            learnedAt: Date.now()
        };
        this.arts.set(id, art);
        this.stats.totalArts++;
        this._triggerHook('artLearned', { artId: id });
        return { success: true, art };
    }

    getArt(artId) { return this.arts.get(artId) ? { ...this.arts.get(artId) } : null; }
    listArts() { return Array.from(this.arts.values()).map(a => ({ ...a })); }
    listByType(type) { return Array.from(this.arts.values()).filter(a => a.type === type).map(a => ({ ...a })); }
    listByElement(element) { return Array.from(this.arts.values()).filter(a => a.element === element).map(a => ({ ...a })); }

    practiceArt(artId, amount = 5) {
        const art = this.arts.get(artId);
        if (!art) return { success: false, error: 'ART_NOT_FOUND' };
        art.mastery += amount;
        this._triggerHook('artPracticed', { artId, newMastery: art.mastery });
        return { success: true };
    }

    upgradeArt(artId) {
        const art = this.arts.get(artId);
        if (!art) return { success: false, error: 'ART_NOT_FOUND' };
        art.soulPower += 10;
        art.status = 'upgraded';
        this._triggerHook('artUpgraded', { artId, newSoulPower: art.soulPower });
        return { success: true };
    }

    castArt(artId) {
        const art = this.arts.get(artId);
        if (!art) return { success: false, error: 'ART_NOT_FOUND' };
        art.status = 'casted';
        this._triggerHook('artCast', { artId });
        return { success: true };
    }

    calculateSoulPower(artId) {
        const art = this.arts.get(artId);
        if (!art) return 0;
        return art.soulPower * (1 + art.mastery / 100) + (art.element || '').length;
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
