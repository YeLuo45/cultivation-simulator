/**
 * CultivationMantra.js - 道真言系统
 * V533 Iteration 15/20 Round 21 - Cultivation Mantra
 */

export class CultivationMantra {
    constructor(config = {}) {
        this.config = { maxMantras: config.maxMantras || 100, baseResonance: config.baseResonance || 20, ...config };
        this.mantras = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMantras: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMantra', (ctx) => this.getMantra(ctx.mantraId));
        this.registerTool('chantMantra', (ctx) => this.chantMantra(ctx));
    }

    chantMantra(data) {
        const id = data.mantraId || `mtr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const mantra = {
            mantraId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'Unnamed Mantra',
            type: data.type || 'truth',
            resonance: data.resonance || this.config.baseResonance,
            syllables: data.syllables || [],
            level: 1,
            status: 'silent',
            createdAt: Date.now()
        };
        this.mantras.set(id, mantra);
        this.stats.totalMantras++;
        this._triggerHook('mantraChanted', { mantraId: id });
        return { success: true, mantra };
    }

    getMantra(id) { return this.mantras.get(id) ? { ...this.mantras.get(id) } : null; }
    listMantras() { return Array.from(this.mantras.values()).map(m => ({ ...m })); }
    listByCultivator(cultivatorId) { return Array.from(this.mantras.values()).filter(m => m.cultivatorId === cultivatorId).map(m => ({ ...m })); }
    listResonating() { return Array.from(this.mantras.values()).filter(m => m.status === 'resonating').map(m => ({ ...m })); }

    addSyllable(mantraId, syllable) {
        const mantra = this.mantras.get(mantraId);
        if (!mantra) return { success: false, error: 'MANTRA_NOT_FOUND' };
        mantra.syllables.push(syllable);
        this._triggerHook('syllableAdded', { mantraId, syllable });
        return { success: true, mantra: { ...mantra } };
    }

    increaseResonance(mantraId, amount = 5) {
        const mantra = this.mantras.get(mantraId);
        if (!mantra) return { success: false, error: 'MANTRA_NOT_FOUND' };
        mantra.resonance += amount;
        this._triggerHook('resonanceIncreased', { mantraId, newResonance: mantra.resonance });
        return { success: true };
    }

    levelUpMantra(mantraId) {
        const mantra = this.mantras.get(mantraId);
        if (!mantra) return { success: false, error: 'MANTRA_NOT_FOUND' };
        mantra.level++;
        this._triggerHook('mantraLeveledUp', { mantraId, newLevel: mantra.level });
        return { success: true };
    }

    resonateMantra(mantraId) {
        const mantra = this.mantras.get(mantraId);
        if (!mantra) return { success: false, error: 'MANTRA_NOT_FOUND' };
        mantra.status = 'resonating';
        this._triggerHook('mantraResonated', { mantraId });
        return { success: true };
    }

    calculateMantraPower(mantraId) {
        const mantra = this.mantras.get(mantraId);
        if (!mantra) return 0;
        return mantra.level * 100 + mantra.resonance * 2 + mantra.syllables.length * 30;
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
        if (this.stats.totalMantras < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMantras += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { mantras: Array.from(this.mantras.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.mantras) this.mantras = new Map(data.mantras);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, mantraCount: this.mantras.size }; }
}
