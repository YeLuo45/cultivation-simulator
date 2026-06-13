/**
 * CultivationRune.js - 修真卢恩系统
 * V762 Iteration 25/30 Round 30 - Cultivation Rune
 */

export class CultivationRune {
    constructor(config = {}) {
        this.config = { maxRunes: config.maxRunes || 20, basePower: config.basePower || 20, ...config };
        this.runes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRunes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRune', (ctx) => this.getRune(ctx.runeId));
        this.registerTool('recruitRune', (ctx) => this.recruitRune(ctx));
    }

    recruitRune(data) {
        const id = data.runeId || `run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const rune = {
            runeId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Rune',
            type: data.type || 'elder',
            power: data.power || this.config.basePower,
            engravings: data.engravings || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.runes.set(id, rune);
        this.stats.totalRunes++;
        this._triggerHook('runeRecruited', { runeId: id });
        return { success: true, rune };
    }

    getRune(id) { return this.runes.get(id) ? { ...this.runes.get(id) } : null; }
    listRunes() { return Array.from(this.runes.values()).map(r => ({ ...r })); }
    listByMaster(masterId) { return Array.from(this.runes.values()).filter(r => r.masterId === masterId).map(r => ({ ...r })); }
    listLegendary() { return Array.from(this.runes.values()).filter(r => r.status === 'legendary').map(r => ({ ...r })); }

    addEngraving(runeId, engraving) {
        const rune = this.runes.get(runeId);
        if (!rune) return { success: false, error: 'RUNE_NOT_FOUND' };
        rune.engravings.push(engraving);
        this._triggerHook('engravingAdded', { runeId, engraving });
        return { success: true, rune: { ...rune } };
    }

    raisePower(runeId, amount = 5) {
        const rune = this.runes.get(runeId);
        if (!rune) return { success: false, error: 'RUNE_NOT_FOUND' };
        rune.power += amount;
        this._triggerHook('powerRaised', { runeId, newPower: rune.power });
        return { success: true };
    }

    levelUpRune(runeId) {
        const rune = this.runes.get(runeId);
        if (!rune) return { success: false, error: 'RUNE_NOT_FOUND' };
        rune.level++;
        this._triggerHook('runeLeveledUp', { runeId, newLevel: rune.level });
        return { success: true };
    }

    legendRune(runeId) {
        const rune = this.runes.get(runeId);
        if (!rune) return { success: false, error: 'RUNE_NOT_FOUND' };
        rune.status = 'legendary';
        this._triggerHook('runeLegendized', { runeId });
        return { success: true };
    }

    calculateRuneValue(runeId) {
        const rune = this.runes.get(runeId);
        if (!rune) return 0;
        return rune.level * 100 + rune.power * 2 + rune.engravings.length * 30;
    }

    listByType(type) { return Array.from(this.runes.values()).filter(r => r.type === type).map(r => ({ ...r })); }
    listVeteran() { return Array.from(this.runes.values()).filter(r => r.status === 'veteran').map(r => ({ ...r })); }

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
        if (this.stats.totalRunes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRunes += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { runes: Array.from(this.runes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.runes) this.runes = new Map(data.runes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, runeCount: this.runes.size }; }
}
