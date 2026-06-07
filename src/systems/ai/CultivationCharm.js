/**
 * CultivationCharm.js - 修真符咒
 * V706 Iteration 29/30 Round 28
 */
export class CultivationCharm {
    constructor(config = {}) {
        this.config = { maxCharms: config.maxCharms || 30, baseEfficacy: config.baseEfficacy || 20, ...config };
        this.charms = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCharms: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCharm', (ctx) => this.getCharm(ctx.charmId));
        this.registerTool('recruitCharm', (ctx) => this.recruitCharm(ctx));
    }

    recruitCharm(data) {
        const id = data.charmId || `chr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const charm = { charmId: id, masterId: data.masterId, name: data.name || 'Unnamed Charm', type: data.type || 'talisman', efficacy: data.efficacy || this.config.baseEfficacy, glyphs: data.glyphs || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.charms.set(id, charm);
        this.stats.totalCharms++;
        this._triggerHook('charmRecruited', { charmId: id });
        return { success: true, charm };
    }

    getCharm(id) { return this.charms.get(id) ? { ...this.charms.get(id) } : null; }
    listCharms() { return Array.from(this.charms.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.charms.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.charms.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addGlyph(charmId, glyph) {
        const charm = this.charms.get(charmId);
        if (!charm) return { success: false, error: 'CHARM_NOT_FOUND' };
        charm.glyphs.push(glyph);
        this._triggerHook('glyphAdded', { charmId, glyph, glyphCount: charm.glyphs.length });
        return { success: true };
    }

    raiseEfficacy(charmId, amount = 5) {
        const charm = this.charms.get(charmId);
        if (!charm) return { success: false, error: 'CHARM_NOT_FOUND' };
        charm.efficacy += amount;
        this._triggerHook('efficacyRaised', { charmId, newEfficacy: charm.efficacy });
        return { success: true };
    }

    levelUpCharm(charmId) {
        const charm = this.charms.get(charmId);
        if (!charm) return { success: false, error: 'CHARM_NOT_FOUND' };
        charm.level++;
        this._triggerHook('charmLeveledUp', { charmId, newLevel: charm.level });
        return { success: true };
    }

    legendCharm(charmId) {
        const charm = this.charms.get(charmId);
        if (!charm) return { success: false, error: 'CHARM_NOT_FOUND' };
        charm.status = 'legendary';
        this._triggerHook('charmLegendized', { charmId });
        return { success: true };
    }

    calculateCharmValue(charmId) {
        const charm = this.charms.get(charmId);
        if (!charm) return 0;
        return charm.level * 100 + charm.efficacy * 2 + charm.glyphs.length * 30;
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
        if (this.stats.totalCharms < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCharms += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { charms: Array.from(this.charms.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.charms) this.charms = new Map(data.charms);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, charmCount: this.charms.size }; }
}
