/**
 * CultivationBlessing.js - 修真祝福系统
 * V704 Iteration 27/30 Round 28
 */
export class CultivationBlessing {
    constructor(config = {}) {
        this.config = { maxBlessings: config.maxBlessings || 20, baseGrace: config.baseGrace || 20, ...config };
        this.blessings = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBlessings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBlessing', (ctx) => this.getBlessing(ctx.blessingId));
        this.registerTool('recruitBlessing', (ctx) => this.recruitBlessing(ctx));
    }

    recruitBlessing(data) {
        const id = data.blessingId || `bls_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const blessing = { blessingId: id, masterId: data.masterId, name: data.name || 'Divine Blessing', type: data.type || 'divine', grace: data.grace || this.config.baseGrace, sanctities: data.sanctities || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.blessings.set(id, blessing);
        this.stats.totalBlessings++;
        this._triggerHook('blessingRecruited', { blessingId: id });
        return { success: true, blessing };
    }

    getBlessing(id) { return this.blessings.get(id) ? { ...this.blessings.get(id) } : null; }
    listBlessings() { return Array.from(this.blessings.values()).map(b => ({ ...b })); }
    listByMaster(masterId) { return Array.from(this.blessings.values()).filter(b => b.masterId === masterId).map(b => ({ ...b })); }
    listLegendary() { return Array.from(this.blessings.values()).filter(b => b.status === 'legendary').map(b => ({ ...b })); }

    addSanctity(blessingId, sanctity) {
        const blessing = this.blessings.get(blessingId);
        if (!blessing) return { success: false, error: 'BLESSING_NOT_FOUND' };
        blessing.sanctities.push(sanctity);
        this._triggerHook('sanctityAdded', { blessingId, sanctity });
        return { success: true };
    }

    raiseGrace(blessingId, amount = 5) {
        const blessing = this.blessings.get(blessingId);
        if (!blessing) return { success: false, error: 'BLESSING_NOT_FOUND' };
        blessing.grace += amount;
        this._triggerHook('graceRaised', { blessingId, newGrace: blessing.grace });
        return { success: true };
    }

    levelUpBlessing(blessingId) {
        const blessing = this.blessings.get(blessingId);
        if (!blessing) return { success: false, error: 'BLESSING_NOT_FOUND' };
        blessing.level++;
        this._triggerHook('blessingLeveledUp', { blessingId, newLevel: blessing.level });
        return { success: true };
    }

    legendBlessing(blessingId) {
        const blessing = this.blessings.get(blessingId);
        if (!blessing) return { success: false, error: 'BLESSING_NOT_FOUND' };
        blessing.status = 'legendary';
        this._triggerHook('blessingLegendized', { blessingId });
        return { success: true };
    }

    calculateBlessingValue(blessingId) {
        const blessing = this.blessings.get(blessingId);
        if (!blessing) return 0;
        return blessing.level * 100 + blessing.grace * 2 + blessing.sanctities.length * 30;
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
        if (this.stats.totalBlessings < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBlessings += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { blessings: Array.from(this.blessings.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.blessings) this.blessings = new Map(data.blessings);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, blessingCount: this.blessings.size }; }
}
