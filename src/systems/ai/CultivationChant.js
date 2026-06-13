/**
 * CultivationChant.js - 修真吟唱
 * V775 Iteration 8/30 Round 31 - Cultivation Chant
 */
export class CultivationChant {
    constructor(config = {}) {
        this.config = { maxChants: config.maxChants || 20, baseCadence: config.baseCadence || 20, ...config };
        this.chants = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalChants: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getChant', (ctx) => this.getChant(ctx.chantId));
        this.registerTool('recruitChant', (ctx) => this.recruitChant(ctx));
    }

    recruitChant(data) {
        const id = data.chantId || `chnt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const chant = {
            chantId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Chant',
            type: data.type || 'warrior',
            cadence: data.cadence || this.config.baseCadence,
            verses: data.verses || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.chants.set(id, chant);
        this.stats.totalChants++;
        this._triggerHook('chantRecruited', { chantId: id });
        return { success: true, chant };
    }

    getChant(id) { return this.chants.get(id) ? { ...this.chants.get(id) } : null; }
    listChants() { return Array.from(this.chants.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.chants.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.chants.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addVerse(chantId, verse) {
        const chant = this.chants.get(chantId);
        if (!chant) return { success: false, error: 'CHANT_NOT_FOUND' };
        chant.verses.push(verse);
        this._triggerHook('verseAdded', { chantId, verse });
        return { success: true };
    }

    raiseCadence(chantId, amount = 5) {
        const chant = this.chants.get(chantId);
        if (!chant) return { success: false, error: 'CHANT_NOT_FOUND' };
        chant.cadence += amount;
        this._triggerHook('cadenceRaised', { chantId, newCadence: chant.cadence });
        return { success: true };
    }

    levelUpChant(chantId) {
        const chant = this.chants.get(chantId);
        if (!chant) return { success: false, error: 'CHANT_NOT_FOUND' };
        chant.level++;
        this._triggerHook('chantLeveledUp', { chantId, newLevel: chant.level });
        return { success: true };
    }

    legendChant(chantId) {
        const chant = this.chants.get(chantId);
        if (!chant) return { success: false, error: 'CHANT_NOT_FOUND' };
        chant.status = 'legendary';
        this._triggerHook('chantLegendized', { chantId });
        return { success: true };
    }

    calculateChantValue(chantId) {
        const chant = this.chants.get(chantId);
        if (!chant) return 0;
        return chant.level * 100 + chant.cadence * 2 + chant.verses.length * 30;
    }

    listByType(type) { return Array.from(this.chants.values()).filter(c => c.type === type).map(c => ({ ...c })); }
    listVeteran() { return Array.from(this.chants.values()).filter(c => c.status === 'veteran' || c.status === 'legendary').map(c => ({ ...c })); }

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
        if (this.stats.totalChants < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxChants += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { chants: Array.from(this.chants.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.chants) this.chants = new Map(data.chants);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, chantCount: this.chants.size }; }
}
