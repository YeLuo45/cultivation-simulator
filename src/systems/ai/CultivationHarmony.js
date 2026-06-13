/**
 * CultivationHarmony.js - 修真和声系统
 * V784 Iteration 17/30 Round 31
 */
export class CultivationHarmony {
    constructor(config = {}) {
        this.config = { maxHarmonies: config.maxHarmonies || 20, baseDepth: config.baseDepth || 20, ...config };
        this.harmonies = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalHarmonies: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getHarmony', (ctx) => this.getHarmony(ctx.harmonyId));
        this.registerTool('recruitHarmony', (ctx) => this.recruitHarmony(ctx));
    }

    recruitHarmony(data = {}) {
        const id = data.harmonyId || `hrm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const harmony = {
            harmonyId: id,
            masterId: data.masterId || 'unknown',
            name: data.name || `Harmony-${id.slice(-5)}`,
            type: data.type || 'major',
            depth: data.depth || this.config.baseDepth,
            chords: data.chords || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.harmonies.set(id, harmony);
        this.stats.totalHarmonies++;
        this._triggerHook('harmonyRecruited', { harmonyId: id });
        return { success: true, harmony };
    }

    getHarmony(id) { return this.harmonies.get(id) ? { ...this.harmonies.get(id) } : null; }
    listHarmonies() { return Array.from(this.harmonies.values()).map(h => ({ ...h })); }
    listByMaster(masterId) { return Array.from(this.harmonies.values()).filter(h => h.masterId === masterId).map(h => ({ ...h })); }
    listLegendary() { return Array.from(this.harmonies.values()).filter(h => h.status === 'legendary').map(h => ({ ...h })); }

    addChord(harmonyId, chord) {
        const harmony = this.harmonies.get(harmonyId);
        if (!harmony) return { success: false, error: 'HARMONY_NOT_FOUND' };
        harmony.chords.push(chord);
        this._triggerHook('chordAdded', { harmonyId, chord });
        return { success: true };
    }

    raiseDepth(harmonyId, amount = 5) {
        const harmony = this.harmonies.get(harmonyId);
        if (!harmony) return { success: false, error: 'HARMONY_NOT_FOUND' };
        harmony.depth += amount;
        this._triggerHook('depthRaised', { harmonyId, newDepth: harmony.depth });
        return { success: true };
    }

    levelUpHarmony(harmonyId) {
        const harmony = this.harmonies.get(harmonyId);
        if (!harmony) return { success: false, error: 'HARMONY_NOT_FOUND' };
        harmony.level++;
        this._triggerHook('harmonyLeveledUp', { harmonyId, newLevel: harmony.level });
        return { success: true };
    }

    legendHarmony(harmonyId) {
        const harmony = this.harmonies.get(harmonyId);
        if (!harmony) return { success: false, error: 'HARMONY_NOT_FOUND' };
        harmony.status = 'legendary';
        this._triggerHook('harmonyLegendized', { harmonyId });
        return { success: true };
    }

    calculateHarmonyValue(harmonyId) {
        const harmony = this.harmonies.get(harmonyId);
        if (!harmony) return 0;
        return harmony.level * 100 + harmony.depth * 2 + harmony.chords.length * 30;
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
        if (this.stats.totalHarmonies < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxHarmonies += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { harmonies: Array.from(this.harmonies.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.harmonies) this.harmonies = new Map(data.harmonies);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, harmonyCount: this.harmonies.size }; }
}
