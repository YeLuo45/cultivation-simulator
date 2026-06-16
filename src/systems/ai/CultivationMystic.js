/**
 * CultivationMystic.js - 修真神秘
 * V651 Iteration 4/30 Round 27 - Cultivation Mystic
 */
export class CultivationMystic {
    constructor(config = {}) {
        this.config = { maxMystics: config.maxMystics || 30, baseMystery: config.baseMystery || 20, ...config };
        this.mystics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMystics: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMystic', (ctx) => this.getMystic(ctx.mysticId));
        this.registerTool('recruitMystic', (ctx) => this.recruitMystic(ctx));
    }

    recruitMystic(data) {
        const id = data.mysticId || `mys_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const mystic = {
            mysticId: id,
            abbotId: data.abbotId,
            name: data.name || 'Unnamed Mystic',
            type: data.type || 'arcane',
            mystery: data.mystery || this.config.baseMystery,
            runes: data.runes || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.mystics.set(id, mystic);
        this.stats.totalMystics++;
        this._triggerHook('mysticRecruited', { mysticId: id });
        return { success: true, mystic };
    }

    getMystic(id) { return this.mystics.get(id) ? { ...this.mystics.get(id) } : null; }
    listMystics() { return Array.from(this.mystics.values()).map(m => ({ ...m })); }
    listByAbbot(abbotId) { return Array.from(this.mystics.values()).filter(m => m.abbotId === abbotId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.mystics.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addRune(mysticId, rune) {
        const mystic = this.mystics.get(mysticId);
        if (!mystic) return { success: false, error: 'MYSTIC_NOT_FOUND' };
        mystic.runes.push(rune);
        this._triggerHook('runeAdded', { mysticId, rune });
        return { success: true };
    }

    deepenMystery(mysticId, amount = 5) {
        const mystic = this.mystics.get(mysticId);
        if (!mystic) return { success: false, error: 'MYSTIC_NOT_FOUND' };
        mystic.mystery += amount;
        this._triggerHook('mysteryDeepened', { mysticId, newMystery: mystic.mystery });
        return { success: true };
    }

    levelUpMystic(mysticId) {
        const mystic = this.mystics.get(mysticId);
        if (!mystic) return { success: false, error: 'MYSTIC_NOT_FOUND' };
        mystic.level++;
        this._triggerHook('mysticLeveledUp', { mysticId, newLevel: mystic.level });
        return { success: true };
    }

    legendMystic(mysticId) {
        const mystic = this.mystics.get(mysticId);
        if (!mystic) return { success: false, error: 'MYSTIC_NOT_FOUND' };
        mystic.status = 'legendary';
        this._triggerHook('mysticLegendized', { mysticId });
        return { success: true };
    }

    calculateMysticValue(mysticId) {
        const mystic = this.mystics.get(mysticId);
        if (!mystic) return 0;
        return mystic.level * 100 + mystic.mystery * 2 + mystic.runes.length * 30;
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
        if (this.stats.totalMystics < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMystics += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { mystics: Array.from(this.mystics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.mystics) this.mystics = new Map(data.mystics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, mysticCount: this.mystics.size }; }
}
