/**
 * CultivationArena.js - 修真竞技场
 * V543 Iteration 6/20 Round 22
 */
export class CultivationArena {
    constructor(config = {}) {
        this.config = { maxArenas: config.maxArenas || 50, baseRating: config.baseRating || 1000, ...config };
        this.arenas = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalArenas: 0, totalMatches: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getArena', (ctx) => this.getArena(ctx.arenaId));
        this.registerTool('openArena', (ctx) => this.openArena(ctx));
    }

    openArena(data) {
        const id = data.arenaId || data.id || `arn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const arena = {
            arenaId: id,
            ownerId: data.ownerId,
            name: data.name || 'Untitled Arena',
            type: data.type || 'pvp',
            rating: data.rating !== undefined ? data.rating : this.config.baseRating,
            matches: [],
            level: 1,
            status: 'active',
            createdAt: Date.now()
        };
        this.arenas.set(id, arena);
        this.stats.totalArenas++;
        this._triggerHook('arenaOpened', { arenaId: id });
        return { success: true, arena };
    }

    getArena(arenaId) { return this.arenas.get(arenaId) ? { ...this.arenas.get(arenaId) } : null; }
    listArenas() { return Array.from(this.arenas.values()).map(a => ({ ...a })); }
    listByOwner(ownerId) { return Array.from(this.arenas.values()).filter(a => a.ownerId === ownerId).map(a => ({ ...a })); }
    listActive() { return Array.from(this.arenas.values()).filter(a => a.status === 'active').map(a => ({ ...a })); }

    addMatch(arenaId, match) {
        const arena = this.arenas.get(arenaId);
        if (!arena) return { success: false, error: 'ARENA_NOT_FOUND' };
        const matchEntry = {
            matchId: match.matchId || `mt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            opponentId: match.opponentId,
            result: match.result || 'pending',
            score: match.score || 0,
            playedAt: Date.now()
        };
        arena.matches.push(matchEntry);
        this.stats.totalMatches++;
        this._triggerHook('matchAdded', { arenaId, matchId: matchEntry.matchId });
        return { success: true, match: matchEntry };
    }

    increaseRating(arenaId, amount = 5) {
        const arena = this.arenas.get(arenaId);
        if (!arena) return { success: false, error: 'ARENA_NOT_FOUND' };
        arena.rating += amount;
        if (arena.rating >= 2000 && arena.status === 'active') arena.status = 'legendary';
        this._triggerHook('ratingIncreased', { arenaId, newRating: arena.rating });
        return { success: true, newRating: arena.rating };
    }

    levelUpArena(arenaId) {
        const arena = this.arenas.get(arenaId);
        if (!arena) return { success: false, error: 'ARENA_NOT_FOUND' };
        arena.level++;
        this._triggerHook('arenaLeveledUp', { arenaId, newLevel: arena.level });
        return { success: true, newLevel: arena.level };
    }

    closeArena(arenaId) {
        const arena = this.arenas.get(arenaId);
        if (!arena) return { success: false, error: 'ARENA_NOT_FOUND' };
        arena.status = 'closed';
        this._triggerHook('arenaClosed', { arenaId });
        return { success: true };
    }

    calculateArenaPower(arenaId) {
        const arena = this.arenas.get(arenaId);
        if (!arena) return 0;
        return arena.level * 100 + arena.rating * 2 + arena.matches.length * 30;
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
        if (this.stats.totalArenas < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxArenas += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { arenas: Array.from(this.arenas.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.arenas) this.arenas = new Map(data.arenas);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, arenaCount: this.arenas.size }; }
}
