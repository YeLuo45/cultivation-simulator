/**
 * CultivationCadence.js - 修真节奏系统
 * V785 Iteration 18/30 Round 31
 */
export class CultivationCadence {
    constructor(config = {}) {
        this.config = { maxCadences: config.maxCadences || 20, baseRhythm: config.baseRhythm || 20, ...config };
        this.cadences = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCadences: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCadence', (ctx) => this.getCadence(ctx.cadenceId));
        this.registerTool('recruitCadence', (ctx) => this.recruitCadence(ctx));
    }

    recruitCadence(data) {
        const id = data.cadenceId || `cdc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cadence = {
            cadenceId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Cadence',
            type: data.type || 'calm',
            rhythm: data.rhythm || this.config.baseRhythm,
            beats: data.beats || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.cadences.set(id, cadence);
        this.stats.totalCadences++;
        this._triggerHook('cadenceRecruited', { cadenceId: id });
        return { success: true, cadence };
    }

    getCadence(id) { return this.cadences.get(id) ? { ...this.cadences.get(id) } : null; }
    listCadences() { return Array.from(this.cadences.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.cadences.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.cadences.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addBeat(cadenceId, beat) {
        const cadence = this.cadences.get(cadenceId);
        if (!cadence) return { success: false, error: 'CADENCE_NOT_FOUND' };
        cadence.beats.push(beat);
        this._triggerHook('beatAdded', { cadenceId, beat });
        return { success: true };
    }

    raiseRhythm(cadenceId, amount = 5) {
        const cadence = this.cadences.get(cadenceId);
        if (!cadence) return { success: false, error: 'CADENCE_NOT_FOUND' };
        cadence.rhythm += amount;
        this._triggerHook('rhythmRaised', { cadenceId, newRhythm: cadence.rhythm });
        return { success: true };
    }

    levelUpCadence(cadenceId) {
        const cadence = this.cadences.get(cadenceId);
        if (!cadence) return { success: false, error: 'CADENCE_NOT_FOUND' };
        cadence.level++;
        this._triggerHook('cadenceLeveledUp', { cadenceId, newLevel: cadence.level });
        return { success: true };
    }

    legendCadence(cadenceId) {
        const cadence = this.cadences.get(cadenceId);
        if (!cadence) return { success: false, error: 'CADENCE_NOT_FOUND' };
        cadence.status = 'legendary';
        this._triggerHook('cadenceLegendized', { cadenceId });
        return { success: true };
    }

    calculateCadenceValue(cadenceId) {
        const cadence = this.cadences.get(cadenceId);
        if (!cadence) return 0;
        return cadence.level * 100 + cadence.rhythm * 2 + cadence.beats.length * 30;
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
        if (this.stats.totalCadences < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCadences += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { cadences: Array.from(this.cadences.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.cadences) this.cadences = new Map(data.cadences);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cadenceCount: this.cadences.size }; }
}
