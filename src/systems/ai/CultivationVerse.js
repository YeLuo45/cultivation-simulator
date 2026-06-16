/**
 * CultivationVerse.js - 修真诗系统
 * V780 Iteration 13/30 Round 31
 */
export class CultivationVerse {
    constructor(config = {}) {
        this.config = { maxVerses: config.maxVerses || 20, baseRhyme: config.baseRhyme || 20, ...config };
        this.verses = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalVerses: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getVerse', (ctx) => this.getVerse(ctx.verseId));
        this.registerTool('recruitVerse', (ctx) => this.recruitVerse(ctx));
    }

    recruitVerse(data) {
        if (this.verses.size >= this.config.maxVerses) return { success: false, error: 'MAX_VERSES_REACHED' };
        const id = data.verseId || `vrs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const verse = {
            verseId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed-verse',
            type: data.type || 'lyric',
            rhyme: data.rhyme !== undefined ? data.rhyme : this.config.baseRhyme,
            stanzas: data.stanzas || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.verses.set(id, verse);
        this.stats.totalVerses++;
        this._triggerHook('verseRecruited', { verseId: id });
        return { success: true, verse };
    }

    getVerse(id) { return this.verses.get(id) ? { ...this.verses.get(id) } : null; }
    listVerses() { return Array.from(this.verses.values()).map(v => ({ ...v })); }
    listByMaster(masterId) { return Array.from(this.verses.values()).filter(v => v.masterId === masterId).map(v => ({ ...v })); }
    listLegendary() { return Array.from(this.verses.values()).filter(v => v.status === 'legendary').map(v => ({ ...v })); }

    addStanza(verseId, stanza) {
        const verse = this.verses.get(verseId);
        if (!verse) return { success: false, error: 'VERSE_NOT_FOUND' };
        verse.stanzas.push(stanza);
        this._triggerHook('stanzaAdded', { verseId, stanza });
        return { success: true };
    }

    raiseRhyme(verseId, amount = 5) {
        const verse = this.verses.get(verseId);
        if (!verse) return { success: false, error: 'VERSE_NOT_FOUND' };
        verse.rhyme += amount;
        this._triggerHook('rhymeRaised', { verseId, newRhyme: verse.rhyme });
        return { success: true };
    }

    levelUpVerse(verseId) {
        const verse = this.verses.get(verseId);
        if (!verse) return { success: false, error: 'VERSE_NOT_FOUND' };
        verse.level++;
        if (verse.level >= 5 && verse.status === 'novice') verse.status = 'veteran';
        this._triggerHook('verseLeveledUp', { verseId, newLevel: verse.level });
        return { success: true };
    }

    legendVerse(verseId) {
        const verse = this.verses.get(verseId);
        if (!verse) return { success: false, error: 'VERSE_NOT_FOUND' };
        verse.status = 'legendary';
        this._triggerHook('verseLegendized', { verseId });
        return { success: true };
    }

    calculateVerseValue(verseId) {
        const verse = this.verses.get(verseId);
        if (!verse) return 0;
        return verse.level * 100 + verse.rhyme * 2 + verse.stanzas.length * 30;
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
        if (this.stats.totalVerses < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxVerses += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { verses: Array.from(this.verses.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.verses) this.verses = new Map(data.verses);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, verseCount: this.verses.size }; }
}
