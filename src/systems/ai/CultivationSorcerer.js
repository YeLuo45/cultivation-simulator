/**
 * CultivationSorcerer.js - 修真术士系统
 * V625 Iteration 8/30 Round 26
 */
export class CultivationSorcerer {
    constructor(config = {}) {
        this.config = { maxSorcerers: config.maxSorcerers || 50, baseArcane: config.baseArcane || 20, ...config };
        this.sorcerers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSorcerers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSorcerer', (ctx) => this.getSorcerer(ctx.sorcererId));
        this.registerTool('recruitSorcerer', (ctx) => this.recruitSorcerer(ctx));
    }

    recruitSorcerer(data) {
        const id = data.sorcererId || `sor_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const sorcerer = {
            sorcererId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Sorcerer',
            type: data.type || 'storm',
            arcane: data.arcane || this.config.baseArcane,
            spells: data.spells || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.sorcerers.set(id, sorcerer);
        this.stats.totalSorcerers++;
        this._triggerHook('sorcererRecruited', { sorcererId: id });
        return { success: true, sorcerer };
    }

    getSorcerer(id) { return this.sorcerers.get(id) ? { ...this.sorcerers.get(id) } : null; }
    listSorcerers() { return Array.from(this.sorcerers.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.sorcerers.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.sorcerers.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addSpell(sorcererId, spell) {
        const sorcerer = this.sorcerers.get(sorcererId);
        if (!sorcerer) return { success: false, error: 'SORCERER_NOT_FOUND' };
        sorcerer.spells.push(spell);
        this._triggerHook('spellAdded', { sorcererId, spell });
        return { success: true };
    }

    increaseArcane(sorcererId, amount = 5) {
        const sorcerer = this.sorcerers.get(sorcererId);
        if (!sorcerer) return { success: false, error: 'SORCERER_NOT_FOUND' };
        sorcerer.arcane += amount;
        this._triggerHook('arcaneIncreased', { sorcererId, newArcane: sorcerer.arcane });
        return { success: true };
    }

    levelUpSorcerer(sorcererId) {
        const sorcerer = this.sorcerers.get(sorcererId);
        if (!sorcerer) return { success: false, error: 'SORCERER_NOT_FOUND' };
        sorcerer.level++;
        this._triggerHook('sorcererLeveledUp', { sorcererId, newLevel: sorcerer.level });
        return { success: true };
    }

    legendSorcerer(sorcererId) {
        const sorcerer = this.sorcerers.get(sorcererId);
        if (!sorcerer) return { success: false, error: 'SORCERER_NOT_FOUND' };
        sorcerer.status = 'legendary';
        this._triggerHook('sorcererLegendized', { sorcererId });
        return { success: true };
    }

    calculateSorcererValue(sorcererId) {
        const sorcerer = this.sorcerers.get(sorcererId);
        if (!sorcerer) return 0;
        return sorcerer.level * 100 + sorcerer.arcane * 2 + sorcerer.spells.length * 30;
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
        if (this.stats.totalSorcerers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSorcerers += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { sorcerers: Array.from(this.sorcerers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.sorcerers) this.sorcerers = new Map(data.sorcerers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, sorcererCount: this.sorcerers.size }; }
}
