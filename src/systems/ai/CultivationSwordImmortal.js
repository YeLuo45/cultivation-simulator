/**
 * CultivationSwordImmortal.js - 修真剑仙
 * V634 Iteration 17/30 Round 26 - Cultivation Sword Immortal
 */
export class CultivationSwordImmortal {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxSwordImmortals: config.maxSwordImmortals || 20, baseImmortality: config.baseImmortality || 20, ...config };
        this.swordimmortals = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSwordImmortals: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSwordImmortal', (ctx) => this.getSwordImmortal(ctx.immortalId));
        this.registerTool('recruitSwordImmortal', (ctx) => this.recruitSwordImmortal(ctx));
    }

    recruitSwordImmortal(data) {
        const id = data.id || `si_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const swordImmortal = { immortalId: id, masterId: data.masterId || 'unknown', name: data.name || 'Unnamed Sword Immortal', type: data.type || 'celestial', immortality: data.immortality || this.config.baseImmortality, swordArts: data.swordArts || [], level: data.level || 1, status: 'novice', recruitedAt: Date.now() };
        this.swordimmortals.set(id, swordImmortal);
        this.stats.totalSwordImmortals++;
        this._triggerHook('swordImmortalRecruited', { immortalId: id });
        return { success: true, swordImmortal };
    }

    getSwordImmortal(id) { return this.swordimmortals.get(id) ? { ...this.swordimmortals.get(id) } : null; }
    listSwordImmortals() { return Array.from(this.swordimmortals.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.swordimmortals.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listByType(type) { return Array.from(this.swordimmortals.values()).filter(s => s.type === type).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.swordimmortals.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }
    listByImmortality(min) { return Array.from(this.swordimmortals.values()).filter(s => s.immortality >= min).map(s => ({ ...s })); }
    listTop(n = 10) { return [...this.listSwordImmortals()].sort((a, b) => b.immortality - a.immortality).slice(0, n); }

    addSwordArt(immortalId, art) {
        const swordImmortal = this.swordimmortals.get(immortalId);
        if (!swordImmortal) return { success: false, error: 'SWORDIMMORTAL_NOT_FOUND' };
        swordImmortal.swordArts.push(art);
        this._triggerHook('swordArtAdded', { immortalId });
        return { success: true };
    }

    deepenImmortality(immortalId, amount = 5) {
        const swordImmortal = this.swordimmortals.get(immortalId);
        if (!swordImmortal) return { success: false, error: 'SWORDIMMORTAL_NOT_FOUND' };
        swordImmortal.immortality += amount;
        this._triggerHook('immortalityDeepened', { immortalId });
        return { success: true };
    }

    levelUpSwordImmortal(immortalId) {
        const swordImmortal = this.swordimmortals.get(immortalId);
        if (!swordImmortal) return { success: false, error: 'SWORDIMMORTAL_NOT_FOUND' };
        swordImmortal.level++;
        this._triggerHook('swordImmortalLeveledUp', { immortalId });
        return { success: true };
    }

    legendSwordImmortal(immortalId) {
        const swordImmortal = this.swordimmortals.get(immortalId);
        if (!swordImmortal) return { success: false, error: 'SWORDIMMORTAL_NOT_FOUND' };
        swordImmortal.status = 'legendary';
        this._triggerHook('swordImmortalLegendized', { immortalId });
        return { success: true };
    }

    calculateSwordImmortalValue(immortalId) {
        const swordImmortal = this.swordimmortals.get(immortalId);
        if (!swordImmortal) return 0;
        return swordImmortal.level * 100 + swordImmortal.immortality * 2 + swordImmortal.swordArts.length * 30;
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
        if (this.stats.totalSwordImmortals < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { swordimmortals: Array.from(this.swordimmortals.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.swordimmortals) this.swordimmortals = new Map(data.swordimmortals);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, swordImmortalCount: this.swordimmortals.size }; }
}
