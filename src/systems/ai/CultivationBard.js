/**
 * CultivationBard.js - 修真诗人
 * V614 Iteration 17/20 Round 25 - Cultivation Bard
 */
export class CultivationBard {
    constructor(config = {}) {
        this.config = { maxBards: config.maxBards || 50, baseCharisma: config.baseCharisma || 20, ...config };
        this.bards = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBards: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBard', (ctx) => this.getBard(ctx.bardId));
        this.registerTool('recruitBard', (ctx) => this.recruitBard(ctx));
    }

    recruitBard(data) {
        const id = data.bardId || `brd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const bard = {
            bardId: id,
            mentorId: data.mentorId,
            name: data.name || 'Unnamed Bard',
            type: data.type || 'epic',
            charisma: data.charisma || this.config.baseCharisma,
            songs: data.songs || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.bards.set(id, bard);
        this.stats.totalBards++;
        this._triggerHook('bardRecruited', { bardId: id });
        return { success: true, bard };
    }

    getBard(id) { return this.bards.get(id) ? { ...this.bards.get(id) } : null; }
    listBards() { return Array.from(this.bards.values()).map(b => ({ ...b })); }
    listByMentor(mentorId) { return Array.from(this.bards.values()).filter(b => b.mentorId === mentorId).map(b => ({ ...b })); }
    listLegendary() { return Array.from(this.bards.values()).filter(b => b.status === 'legendary').map(b => ({ ...b })); }

    addSong(bardId, song) {
        const bard = this.bards.get(bardId);
        if (!bard) return { success: false, error: 'BARD_NOT_FOUND' };
        bard.songs.push(song);
        this._triggerHook('songAdded', { bardId, song });
        return { success: true };
    }

    increaseCharisma(bardId, amount = 5) {
        const bard = this.bards.get(bardId);
        if (!bard) return { success: false, error: 'BARD_NOT_FOUND' };
        bard.charisma += amount;
        this._triggerHook('charismaIncreased', { bardId, newCharisma: bard.charisma });
        return { success: true };
    }

    levelUpBard(bardId) {
        const bard = this.bards.get(bardId);
        if (!bard) return { success: false, error: 'BARD_NOT_FOUND' };
        bard.level++;
        this._triggerHook('bardLeveledUp', { bardId, newLevel: bard.level });
        return { success: true };
    }

    legendBard(bardId) {
        const bard = this.bards.get(bardId);
        if (!bard) return { success: false, error: 'BARD_NOT_FOUND' };
        bard.status = 'legendary';
        this._triggerHook('bardLegendized', { bardId });
        return { success: true };
    }

    calculateBardValue(bardId) {
        const bard = this.bards.get(bardId);
        if (!bard) return 0;
        return bard.level * 100 + bard.charisma * 2 + bard.songs.length * 30;
    }

    listByType(type) { return Array.from(this.bards.values()).filter(b => b.type === type).map(b => ({ ...b })); }
    listVeteran() { return Array.from(this.bards.values()).filter(b => b.status === 'veteran' || b.status === 'legendary').map(b => ({ ...b })); }

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
        if (this.stats.totalBards < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBards += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { bards: Array.from(this.bards.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.bards) this.bards = new Map(data.bards);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, bardCount: this.bards.size }; }
}
