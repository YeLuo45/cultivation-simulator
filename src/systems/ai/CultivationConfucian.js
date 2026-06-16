/**
 * CultivationConfucian.js - 修真儒者
 * V639 Iteration 22/30 Round 26 - Cultivation Confucian
 */
export class CultivationConfucian {
    constructor(config = {}) {
        this.config = { maxConfucians: config.maxConfucians || 50, baseVirtue: config.baseVirtue || 20, ...config };
        this.confucians = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalConfucians: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getConfucian', (ctx) => this.getConfucian(ctx.confucianId));
        this.registerTool('recruitConfucian', (ctx) => this.recruitConfucian(ctx));
    }

    recruitConfucian(data) {
        const id = data.id || `conf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const confucian = { confucianId: id, masterId: data.masterId, name: data.name || 'Unnamed Confucian', type: data.type || 'literary', virtue: data.virtue || this.config.baseVirtue, classics: [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.confucians.set(id, confucian);
        this.stats.totalConfucians++;
        this._triggerHook('confucianRecruited', { confucianId: id });
        return { success: true, confucian };
    }

    getConfucian(id) { return this.confucians.get(id) ? { ...this.confucians.get(id) } : null; }
    listConfucians() { return Array.from(this.confucians.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.confucians.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.confucians.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addClassic(confucianId, classic) {
        const confucian = this.confucians.get(confucianId);
        if (!confucian) return { success: false, error: 'CONFUCIAN_NOT_FOUND' };
        confucian.classics.push(classic);
        this._triggerHook('classicAdded', { confucianId, classic });
        return { success: true };
    }

    buildVirtue(confucianId, amount = 5) {
        const confucian = this.confucians.get(confucianId);
        if (!confucian) return { success: false, error: 'CONFUCIAN_NOT_FOUND' };
        confucian.virtue += amount;
        this._triggerHook('virtueBuilt', { confucianId, newVirtue: confucian.virtue });
        return { success: true };
    }

    levelUpConfucian(confucianId) {
        const confucian = this.confucians.get(confucianId);
        if (!confucian) return { success: false, error: 'CONFUCIAN_NOT_FOUND' };
        confucian.level++;
        this._triggerHook('confucianLeveledUp', { confucianId, newLevel: confucian.level });
        return { success: true };
    }

    legendConfucian(confucianId) {
        const confucian = this.confucians.get(confucianId);
        if (!confucian) return { success: false, error: 'CONFUCIAN_NOT_FOUND' };
        confucian.status = 'legendary';
        this._triggerHook('confucianLegendized', { confucianId });
        return { success: true };
    }

    calculateConfucianValue(confucianId) {
        const confucian = this.confucians.get(confucianId);
        if (!confucian) return 0;
        return confucian.level * 100 + confucian.virtue * 2 + confucian.classics.length * 30;
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
        if (this.stats.totalConfucians < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxConfucians += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { confucians: Array.from(this.confucians.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.confucians) this.confucians = new Map(data.confucians);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, confucianCount: this.confucians.size }; }
}
