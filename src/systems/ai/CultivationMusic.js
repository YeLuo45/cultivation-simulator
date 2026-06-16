/**
 * CultivationMusic.js - 修真乐
 * V559 Iteration 2/20 Round 23 - Cultivation Music
 */
export class CultivationMusic {
    constructor(config = {}) {
        this.config = { maxMusic: config.maxMusic || 100, baseMelody: config.baseMelody || 20, ...config };
        this.musics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMusic: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMusic', (ctx) => this.getMusic(ctx.musicId));
        this.registerTool('composeMusic', (ctx) => this.composeMusic(ctx));
    }

    composeMusic(data) {
        const id = data.id || `mus_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const music = {
            musicId: id,
            composerId: data.composerId,
            name: data.name || 'Untitled Composition',
            type: data.type || 'ancient',
            melody: data.melody || this.config.baseMelody,
            instruments: data.instruments || [],
            level: 1,
            status: 'composing',
            composedAt: Date.now()
        };
        this.musics.set(id, music);
        this.stats.totalMusic++;
        this._triggerHook('musicComposed', { musicId: id });
        return { success: true, music };
    }

    getMusic(id) { return this.musics.get(id) ? { ...this.musics.get(id) } : null; }
    listMusic() { return Array.from(this.musics.values()).map(m => ({ ...m })); }
    listByComposer(composerId) { return Array.from(this.musics.values()).filter(m => m.composerId === composerId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.musics.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addInstrument(musicId, instrument) {
        const music = this.musics.get(musicId);
        if (!music) return { success: false, error: 'MUSIC_NOT_FOUND' };
        music.instruments.push(instrument);
        this._triggerHook('instrumentAdded', { musicId, instrument });
        return { success: true };
    }

    increaseMelody(musicId, amount = 5) {
        const music = this.musics.get(musicId);
        if (!music) return { success: false, error: 'MUSIC_NOT_FOUND' };
        music.melody += amount;
        this._triggerHook('melodyIncreased', { musicId, newMelody: music.melody });
        return { success: true };
    }

    levelUpMusic(musicId) {
        const music = this.musics.get(musicId);
        if (!music) return { success: false, error: 'MUSIC_NOT_FOUND' };
        music.level++;
        this._triggerHook('musicLeveledUp', { musicId, newLevel: music.level });
        return { success: true };
    }

    legendMusic(musicId) {
        const music = this.musics.get(musicId);
        if (!music) return { success: false, error: 'MUSIC_NOT_FOUND' };
        music.status = 'legendary';
        this._triggerHook('musicLegendized', { musicId });
        return { success: true };
    }

    calculateMusicValue(musicId) {
        const music = this.musics.get(musicId);
        if (!music) return 0;
        return music.level * 100 + music.melody * 2 + music.instruments.length * 30;
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
        if (this.stats.totalMusic < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMusic += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { musics: Array.from(this.musics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.musics) this.musics = new Map(data.musics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, musicCount: this.musics.size }; }
}
