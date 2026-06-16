/**
 * CultivationHell.js - 修真地府系统
 * V681 Iteration 4/30 Round 28
 */
export class CultivationHell {
    constructor(config = {}) {
        this.config = { maxHells: config.maxHells || 18, baseDarkness: config.baseDarkness || 20, ...config };
        this.hells = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalHells: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getHell', (ctx) => this.getHell(ctx.hellId));
        this.registerTool('recruitHell', (ctx) => this.recruitHell(ctx));
    }

    recruitHell(data) {
        if (this.hells.size >= this.config.maxHells) return { success: false, error: 'MAX_HELLS_REACHED' };
        const id = data.hellId || `hll_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const hell = {
            hellId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Hell',
            type: data.type || 'blood',
            darkness: data.darkness != null ? data.darkness : this.config.baseDarkness,
            punishments: data.punishments || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.hells.set(id, hell);
        this.stats.totalHells++;
        this._triggerHook('hellRecruited', { hellId: id, masterId: hell.masterId });
        return { success: true, hell };
    }

    getHell(id) { return this.hells.get(id) ? { ...this.hells.get(id) } : null; }
    listHells() { return Array.from(this.hells.values()).map(h => ({ ...h })); }
    listByMaster(masterId) { return Array.from(this.hells.values()).filter(h => h.masterId === masterId).map(h => ({ ...h })); }
    listLegendary() { return Array.from(this.hells.values()).filter(h => h.status === 'legendary').map(h => ({ ...h })); }

    addPunishment(hellId, punishment) {
        const hell = this.hells.get(hellId);
        if (!hell) return { success: false, error: 'HELL_NOT_FOUND' };
        hell.punishments.push(punishment);
        this._triggerHook('punishmentAdded', { hellId, punishment });
        return { success: true };
    }

    deepenDarkness(hellId, amount = 5) {
        const hell = this.hells.get(hellId);
        if (!hell) return { success: false, error: 'HELL_NOT_FOUND' };
        hell.darkness += amount;
        this._triggerHook('darknessDeepened', { hellId, newDarkness: hell.darkness });
        return { success: true };
    }

    levelUpHell(hellId) {
        const hell = this.hells.get(hellId);
        if (!hell) return { success: false, error: 'HELL_NOT_FOUND' };
        hell.level++;
        return { success: true };
    }

    legendHell(hellId) {
        const hell = this.hells.get(hellId);
        if (!hell) return { success: false, error: 'HELL_NOT_FOUND' };
        hell.status = 'legendary';
        this._triggerHook('hellLegendized', { hellId });
        return { success: true };
    }

    calculateHellValue(hellId) {
        const hell = this.hells.get(hellId);
        if (!hell) return 0;
        return hell.level * 100 + hell.darkness * 2 + hell.punishments.length * 30;
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
        if (this.stats.totalHells < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxHells += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { hells: Array.from(this.hells.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.hells) this.hells = new Map(data.hells);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, hellCount: this.hells.size }; }
}
