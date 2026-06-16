/**
 * CultivationImmortal.js - 修真仙人
 * V669 Iteration 22/30 Round 27 - Cultivation Immortal
 */
export class CultivationImmortal {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxImmortals: config.maxImmortals || 10, baseImmortality: config.baseImmortality || 20, ...config };
        this.immortals = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalImmortals: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getImmortal', (ctx) => this.getImmortal(ctx.immortalId));
        this.registerTool('recruitImmortal', (ctx) => this.recruitImmortal(ctx));
    }

    recruitImmortal(data) {
        const id = data.id || `imm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const immortal = { immortalId: id, elderId: data.elderId || 'unknown', name: data.name || 'Unnamed Immortal', type: data.type || 'celestial', immortality: data.immortality || this.config.baseImmortality, spells: data.spells || [], level: data.level || 1, status: 'novice', recruitedAt: Date.now() };
        this.immortals.set(id, immortal);
        this.stats.totalImmortals++;
        this._triggerHook('immortalRecruited', { immortalId: id });
        return { success: true, immortal };
    }

    getImmortal(id) { return this.immortals.get(id) ? { ...this.immortals.get(id) } : null; }
    listImmortals() { return Array.from(this.immortals.values()).map(i => ({ ...i })); }
    listByElder(elderId) { return Array.from(this.immortals.values()).filter(i => i.elderId === elderId).map(i => ({ ...i })); }
    listByType(type) { return Array.from(this.immortals.values()).filter(i => i.type === type).map(i => ({ ...i })); }
    listLegendary() { return Array.from(this.immortals.values()).filter(i => i.status === 'legendary').map(i => ({ ...i })); }
    listByImmortality(min) { return Array.from(this.immortals.values()).filter(i => i.immortality >= min).map(i => ({ ...i })); }
    listTop(n = 10) { return [...this.listImmortals()].sort((a, b) => b.immortality - a.immortality).slice(0, n); }

    addSpell(immortalId, spell) {
        const immortal = this.immortals.get(immortalId);
        if (!immortal) return { success: false, error: 'IMMORTAL_NOT_FOUND' };
        immortal.spells.push(spell);
        this._triggerHook('spellAdded', { immortalId });
        return { success: true };
    }

    deepenImmortality(immortalId, amount = 5) {
        const immortal = this.immortals.get(immortalId);
        if (!immortal) return { success: false, error: 'IMMORTAL_NOT_FOUND' };
        immortal.immortality += amount;
        this._triggerHook('immortalityDeepened', { immortalId });
        return { success: true };
    }

    levelUpImmortal(immortalId) {
        const immortal = this.immortals.get(immortalId);
        if (!immortal) return { success: false, error: 'IMMORTAL_NOT_FOUND' };
        immortal.level++;
        this._triggerHook('immortalLeveledUp', { immortalId });
        return { success: true };
    }

    legendImmortal(immortalId) {
        const immortal = this.immortals.get(immortalId);
        if (!immortal) return { success: false, error: 'IMMORTAL_NOT_FOUND' };
        immortal.status = 'legendary';
        this._triggerHook('immortalLegendized', { immortalId });
        return { success: true };
    }

    calculateImmortalValue(immortalId) {
        const immortal = this.immortals.get(immortalId);
        if (!immortal) return 0;
        return immortal.level * 100 + immortal.immortality * 2 + immortal.spells.length * 30;
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
        if (this.stats.totalImmortals < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { immortals: Array.from(this.immortals.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.immortals) this.immortals = new Map(data.immortals);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, immortalCount: this.immortals.size }; }
}
