/**
 * CultivationDance.js - 修真舞
 * V561 Iteration 4/20 Round 23 - Cultivation Dance
 */
export class CultivationDance {
    constructor(config = {}) {
        this.config = { maxDances: config.maxDances || 50, baseGrace: config.baseGrace || 20, ...config };
        this.dances = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDances: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDance', (ctx) => this.getDance(ctx.danceId));
        this.registerTool('learnDance', (ctx) => this.learnDance(ctx));
    }

    learnDance(data) {
        const id = data.id || `dnc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const dance = {
            danceId: id,
            dancerId: data.dancerId,
            name: data.name || 'Untitled Dance',
            type: data.type || 'sword',
            grace: data.grace || this.config.baseGrace,
            moves: data.moves || [],
            level: 1,
            status: 'learning',
            learnedAt: Date.now()
        };
        this.dances.set(id, dance);
        this.stats.totalDances++;
        this._triggerHook('danceLearned', { danceId: id });
        return { success: true, dance };
    }

    getDance(id) { return this.dances.get(id) ? { ...this.dances.get(id) } : null; }
    listDances() { return Array.from(this.dances.values()).map(d => ({ ...d })); }
    listByDancer(dancerId) { return Array.from(this.dances.values()).filter(d => d.dancerId === dancerId).map(d => ({ ...d })); }
    listDivine() { return Array.from(this.dances.values()).filter(d => d.status === 'divine').map(d => ({ ...d })); }

    addMove(danceId, move) {
        const dance = this.dances.get(danceId);
        if (!dance) return { success: false, error: 'DANCE_NOT_FOUND' };
        dance.moves.push(move);
        this._triggerHook('moveAdded', { danceId, move });
        return { success: true };
    }

    increaseGrace(danceId, amount = 5) {
        const dance = this.dances.get(danceId);
        if (!dance) return { success: false, error: 'DANCE_NOT_FOUND' };
        dance.grace += amount;
        this._triggerHook('graceIncreased', { danceId, newGrace: dance.grace });
        return { success: true };
    }

    levelUpDance(danceId) {
        const dance = this.dances.get(danceId);
        if (!dance) return { success: false, error: 'DANCE_NOT_FOUND' };
        dance.level++;
        this._triggerHook('danceLeveledUp', { danceId, newLevel: dance.level });
        return { success: true };
    }

    divineDance(danceId) {
        const dance = this.dances.get(danceId);
        if (!dance) return { success: false, error: 'DANCE_NOT_FOUND' };
        dance.status = 'divine';
        this._triggerHook('danceDivinified', { danceId });
        return { success: true };
    }

    calculateDanceValue(danceId) {
        const dance = this.dances.get(danceId);
        if (!dance) return 0;
        return dance.level * 100 + dance.grace * 2 + dance.moves.length * 30;
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
        if (this.stats.totalDances < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDances += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { dances: Array.from(this.dances.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.dances) this.dances = new Map(data.dances);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, danceCount: this.dances.size }; }
}
