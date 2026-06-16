/**
 * CultivationChorus.js - 修真合唱系统
 * V782 Iteration 15/30 Round 31
 */
export class CultivationChorus {
    constructor(config = {}) {
        this.config = { maxChoruses: config.maxChoruses || 20, baseHarmony: config.baseHarmony || 20, ...config };
        this.choruses = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalChoruses: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getChorus', (ctx) => this.getChorus(ctx.chorusId));
        this.registerTool('recruitChorus', (ctx) => this.recruitChorus(ctx));
    }

    recruitChorus(data) {
        const id = data.chorusId || `chorus_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const chorus = { chorusId: id, masterId: data.masterId, name: data.name || 'Mystic Chorus', type: data.type || 'sacred', harmony: data.harmony || this.config.baseHarmony, voices: data.voices || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.choruses.set(id, chorus);
        this.stats.totalChoruses++;
        this._triggerHook('chorusRecruited', { chorusId: id });
        return { success: true, chorus };
    }

    getChorus(id) { return this.choruses.get(id) ? { ...this.choruses.get(id) } : null; }
    listChoruses() { return Array.from(this.choruses.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.choruses.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.choruses.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addVoice(chorusId, voice) {
        const chorus = this.choruses.get(chorusId);
        if (!chorus) return { success: false, error: 'CHORUS_NOT_FOUND' };
        chorus.voices.push(voice);
        this._triggerHook('voiceAdded', { chorusId, voice });
        return { success: true };
    }

    raiseHarmony(chorusId, amount = 5) {
        const chorus = this.choruses.get(chorusId);
        if (!chorus) return { success: false, error: 'CHORUS_NOT_FOUND' };
        chorus.harmony += amount;
        this._triggerHook('harmonyRaised', { chorusId, newHarmony: chorus.harmony });
        return { success: true };
    }

    levelUpChorus(chorusId) {
        const chorus = this.choruses.get(chorusId);
        if (!chorus) return { success: false, error: 'CHORUS_NOT_FOUND' };
        chorus.level++;
        this._triggerHook('chorusLeveledUp', { chorusId, newLevel: chorus.level });
        return { success: true };
    }

    legendChorus(chorusId) {
        const chorus = this.choruses.get(chorusId);
        if (!chorus) return { success: false, error: 'CHORUS_NOT_FOUND' };
        chorus.status = 'legendary';
        this._triggerHook('chorusLegendized', { chorusId });
        return { success: true };
    }

    calculateChorusValue(chorusId) {
        const chorus = this.choruses.get(chorusId);
        if (!chorus) return 0;
        return chorus.level * 100 + chorus.harmony * 2 + chorus.voices.length * 30;
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
        if (this.stats.totalChoruses < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxChoruses += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { choruses: Array.from(this.choruses.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.choruses) this.choruses = new Map(data.choruses);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, chorusCount: this.choruses.size }; }
}
