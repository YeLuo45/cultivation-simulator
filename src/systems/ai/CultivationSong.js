/**
 * CultivationSong.js - 修真歌
 * V778 Iteration 11/30 Round 31 - Cultivation Song
 */
export class CultivationSong {
    constructor(config = {}) {
        this.config = { maxSongs: config.maxSongs || 20, baseMelody: config.baseMelody || 20, ...config };
        this.songs = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSongs: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSong', (ctx) => this.getSong(ctx.songId));
        this.registerTool('recruitSong', (ctx) => this.recruitSong(ctx));
    }

    recruitSong(data) {
        const id = data.id || `sng_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const song = {
            songId: id,
            masterId: data.masterId,
            name: data.name || 'Untitled Hymn',
            type: data.type || 'folk',
            melody: data.melody || this.config.baseMelody,
            refrains: data.refrains || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.songs.set(id, song);
        this.stats.totalSongs++;
        this._triggerHook('songRecruited', { songId: id });
        return { success: true, song };
    }

    getSong(id) { return this.songs.get(id) ? { ...this.songs.get(id) } : null; }
    listSongs() { return Array.from(this.songs.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.songs.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.songs.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addRefrain(songId, refrain) {
        const song = this.songs.get(songId);
        if (!song) return { success: false, error: 'SONG_NOT_FOUND' };
        song.refrains.push(refrain);
        this._triggerHook('refrainAdded', { songId, refrain });
        return { success: true };
    }

    raiseMelody(songId, amount = 5) {
        const song = this.songs.get(songId);
        if (!song) return { success: false, error: 'SONG_NOT_FOUND' };
        song.melody += amount;
        this._triggerHook('melodyRaised', { songId, newMelody: song.melody });
        return { success: true };
    }

    levelUpSong(songId) {
        const song = this.songs.get(songId);
        if (!song) return { success: false, error: 'SONG_NOT_FOUND' };
        song.level++;
        this._triggerHook('songLeveledUp', { songId, newLevel: song.level });
        return { success: true };
    }

    legendSong(songId) {
        const song = this.songs.get(songId);
        if (!song) return { success: false, error: 'SONG_NOT_FOUND' };
        song.status = 'legendary';
        this._triggerHook('songLegendized', { songId });
        return { success: true };
    }

    calculateSongValue(songId) {
        const song = this.songs.get(songId);
        if (!song) return 0;
        return song.level * 100 + song.melody * 2 + song.refrains.length * 30;
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
        if (this.stats.totalSongs < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSongs += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { songs: Array.from(this.songs.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.songs) this.songs = new Map(data.songs);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, songCount: this.songs.size }; }
}
