/**
 * CultivationPriest.js - 修真牧师系统
 * V613 Iteration 16/20 Round 25
 */
export class CultivationPriest {
    constructor(config = {}) {
        this.config = { maxPriests: config.maxPriests || 50, baseDevotion: config.baseDevotion || 20, ...config };
        this.priests = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPriests: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPriest', (ctx) => this.getPriest(ctx.priestId));
        this.registerTool('recruitPriest', (ctx) => this.recruitPriest(ctx));
    }

    recruitPriest(data) {
        const id = data.priestId || `priest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const priest = { priestId: id, bishopId: data.bishopId, name: data.name || 'Mystic Priest', type: data.type || 'light', devotion: data.devotion || this.config.baseDevotion, rites: data.rites || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.priests.set(id, priest);
        this.stats.totalPriests++;
        this._triggerHook('priestRecruited', { priestId: id });
        return { success: true, priest };
    }

    getPriest(id) { return this.priests.get(id) ? { ...this.priests.get(id) } : null; }
    listPriests() { return Array.from(this.priests.values()).map(p => ({ ...p })); }
    listByBishop(bishopId) { return Array.from(this.priests.values()).filter(p => p.bishopId === bishopId).map(p => ({ ...p })); }
    listLegendary() { return Array.from(this.priests.values()).filter(p => p.status === 'legendary').map(p => ({ ...p })); }

    addRite(priestId, rite) {
        const priest = this.priests.get(priestId);
        if (!priest) return { success: false, error: 'PRIEST_NOT_FOUND' };
        priest.rites.push(rite);
        this._triggerHook('riteAdded', { priestId, rite });
        return { success: true };
    }

    increaseDevotion(priestId, amount = 5) {
        const priest = this.priests.get(priestId);
        if (!priest) return { success: false, error: 'PRIEST_NOT_FOUND' };
        priest.devotion += amount;
        this._triggerHook('devotionIncreased', { priestId, newDevotion: priest.devotion });
        return { success: true };
    }

    levelUpPriest(priestId) {
        const priest = this.priests.get(priestId);
        if (!priest) return { success: false, error: 'PRIEST_NOT_FOUND' };
        priest.level++;
        this._triggerHook('priestLeveledUp', { priestId, newLevel: priest.level });
        return { success: true };
    }

    legendPriest(priestId) {
        const priest = this.priests.get(priestId);
        if (!priest) return { success: false, error: 'PRIEST_NOT_FOUND' };
        priest.status = 'legendary';
        this._triggerHook('priestLegendized', { priestId });
        return { success: true };
    }

    calculatePriestValue(priestId) {
        const priest = this.priests.get(priestId);
        if (!priest) return 0;
        return priest.level * 100 + priest.devotion * 2 + priest.rites.length * 30;
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
        if (this.stats.totalPriests < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPriests += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { priests: Array.from(this.priests.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.priests) this.priests = new Map(data.priests);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, priestCount: this.priests.size }; }
}
