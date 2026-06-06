/**
 * CultivationPoetry.js - 修真诗
 * V560 Iteration 3/20 Round 23 - Cultivation Poetry
 */
export class CultivationPoetry {
    constructor(config = {}) {
        this.config = { maxPoems: config.maxPoems || 100, baseVerses: config.baseVerses || 20, ...config };
        this.poems = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPoems: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPoem', (ctx) => this.getPoem(ctx.poemId));
        this.registerTool('writePoem', (ctx) => this.writePoem(ctx));
    }

    writePoem(data) {
        const id = data.id || `poem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const poem = {
            poemId: id,
            poetId: data.poetId,
            name: data.name || 'Untitled Poem',
            type: data.type || 'free',
            verses: data.verses || this.config.baseVerses,
            themes: data.themes || [],
            level: 1,
            status: 'draft',
            writtenAt: Date.now()
        };
        this.poems.set(id, poem);
        this.stats.totalPoems++;
        this._triggerHook('poemWritten', { poemId: id });
        return { success: true, poem };
    }

    getPoem(id) { return this.poems.get(id) ? { ...this.poems.get(id) } : null; }
    listPoems() { return Array.from(this.poems.values()).map(p => ({ ...p })); }
    listByPoet(poetId) { return Array.from(this.poems.values()).filter(p => p.poetId === poetId).map(p => ({ ...p })); }
    listByType(type) { return Array.from(this.poems.values()).filter(p => p.type === type).map(p => ({ ...p })); }
    listImmortal() { return Array.from(this.poems.values()).filter(p => p.status === 'immortal').map(p => ({ ...p })); }

    addTheme(poemId, theme) {
        const poem = this.poems.get(poemId);
        if (!poem) return { success: false, error: 'POEM_NOT_FOUND' };
        poem.themes.push(theme);
        this._triggerHook('themeAdded', { poemId, theme, totalThemes: poem.themes.length });
        return { success: true };
    }

    increaseVerses(poemId, amount = 5) {
        const poem = this.poems.get(poemId);
        if (!poem) return { success: false, error: 'POEM_NOT_FOUND' };
        poem.verses += amount;
        this._triggerHook('versesIncreased', { poemId, newVerses: poem.verses });
        return { success: true };
    }

    levelUpPoem(poemId) {
        const poem = this.poems.get(poemId);
        if (!poem) return { success: false, error: 'POEM_NOT_FOUND' };
        poem.level++;
        this._triggerHook('poemLeveledUp', { poemId, newLevel: poem.level });
        return { success: true };
    }

    composePoem(poemId) {
        const poem = this.poems.get(poemId);
        if (!poem) return { success: false, error: 'POEM_NOT_FOUND' };
        poem.status = 'composed';
        this._triggerHook('poemComposed', { poemId });
        return { success: true };
    }

    immortalPoem(poemId) {
        const poem = this.poems.get(poemId);
        if (!poem) return { success: false, error: 'POEM_NOT_FOUND' };
        poem.status = 'immortal';
        this._triggerHook('poemImmortalized', { poemId });
        return { success: true };
    }

    calculatePoemValue(poemId) {
        const poem = this.poems.get(poemId);
        if (!poem) return 0;
        return poem.level * 100 + poem.verses * 2 + poem.themes.length * 30;
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
        if (this.stats.totalPoems < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPoems += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { poems: Array.from(this.poems.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.poems) this.poems = new Map(data.poems);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, poemCount: this.poems.size }; }
}
