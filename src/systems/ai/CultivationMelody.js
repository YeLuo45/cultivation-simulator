/**
 * CultivationMelody.js - 修真旋律系统
 * V783 Iteration 16/30 Round 31
 */
export class CultivationMelody {
    constructor(config = {}) {
        this.config = { maxMelodies: config.maxMelodies || 20, baseSweetness: config.baseSweetness || 20, ...config };
        this.melodies = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMelodies: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMelody', (ctx) => this.getMelody(ctx.melodyId));
        this.registerTool('recruitMelody', (ctx) => this.recruitMelody(ctx));
    }

    recruitMelody(data) {
        const id = data.melodyId || `mld_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const melody = {
            melodyId: id,
            masterId: data.masterId,
            name: data.name || 'Mystic Melody',
            type: data.type || 'sacred',
            sweetness: data.sweetness || this.config.baseSweetness,
            phrases: data.phrases || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.melodies.set(id, melody);
        this.stats.totalMelodies++;
        this._triggerHook('melodyRecruited', { melodyId: id });
        return { success: true, melody };
    }

    getMelody(id) { return this.melodies.get(id) ? { ...this.melodies.get(id) } : null; }
    listMelodies() { return Array.from(this.melodies.values()).map(m => ({ ...m })); }
    listByMaster(masterId) { return Array.from(this.melodies.values()).filter(m => m.masterId === masterId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.melodies.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addPhrase(melodyId, phrase) {
        const melody = this.melodies.get(melodyId);
        if (!melody) return { success: false, error: 'MELODY_NOT_FOUND' };
        melody.phrases.push(phrase);
        this._triggerHook('phraseAdded', { melodyId, phrase });
        return { success: true };
    }

    raiseSweetness(melodyId, amount = 5) {
        const melody = this.melodies.get(melodyId);
        if (!melody) return { success: false, error: 'MELODY_NOT_FOUND' };
        melody.sweetness += amount;
        this._triggerHook('sweetnessRaised', { melodyId, newSweetness: melody.sweetness });
        return { success: true };
    }

    levelUpMelody(melodyId) {
        const melody = this.melodies.get(melodyId);
        if (!melody) return { success: false, error: 'MELODY_NOT_FOUND' };
        melody.level++;
        this._triggerHook('melodyLeveledUp', { melodyId, newLevel: melody.level });
        return { success: true };
    }

    legendMelody(melodyId) {
        const melody = this.melodies.get(melodyId);
        if (!melody) return { success: false, error: 'MELODY_NOT_FOUND' };
        melody.status = 'legendary';
        this._triggerHook('melodyLegendized', { melodyId });
        return { success: true };
    }

    calculateMelodyValue(melodyId) {
        const melody = this.melodies.get(melodyId);
        if (!melody) return 0;
        return melody.level * 100 + melody.sweetness * 2 + melody.phrases.length * 30;
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
        if (this.stats.totalMelodies < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMelodies += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { melodies: Array.from(this.melodies.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.melodies) this.melodies = new Map(data.melodies);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, melodyCount: this.melodies.size }; }
}
