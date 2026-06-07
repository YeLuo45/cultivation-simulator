/**
 * CultivationDusk.js - 修真黄昏系统
 * V816 Iteration 19/30 Round 32
 */
export class CultivationDusk {
    constructor(config = {}) {
        this.config = { maxDusks: config.maxDusks || 20, baseShadow: config.baseShadow || 20, ...config };
        this.dusks = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDusks: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDusk', (ctx) => this.getDusk(ctx.duskId));
        this.registerTool('recruitDusk', (ctx) => this.recruitDusk(ctx));
    }

    recruitDusk(data) {
        const id = data.duskId || `dsk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const dusk = {
            duskId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Dusk',
            type: data.type || 'early',
            shadow: data.shadow || this.config.baseShadow,
            afterglows: data.afterglows || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.dusks.set(id, dusk);
        this.stats.totalDusks++;
        this._triggerHook('duskRecruited', { duskId: id });
        return { success: true, dusk };
    }

    getDusk(id) { return this.dusks.get(id) ? { ...this.dusks.get(id) } : null; }
    listDusks() { return Array.from(this.dusks.values()).map(d => ({ ...d })); }
    listByMaster(masterId) { return Array.from(this.dusks.values()).filter(d => d.masterId === masterId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.dusks.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addAfterglow(duskId, afterglow) {
        const dusk = this.dusks.get(duskId);
        if (!dusk) return { success: false, error: 'DUSK_NOT_FOUND' };
        dusk.afterglows.push(afterglow);
        this._triggerHook('afterglowAdded', { duskId, afterglow });
        return { success: true };
    }

    raiseShadow(duskId, amount = 5) {
        const dusk = this.dusks.get(duskId);
        if (!dusk) return { success: false, error: 'DUSK_NOT_FOUND' };
        dusk.shadow += amount;
        this._triggerHook('shadowRaised', { duskId, newShadow: dusk.shadow });
        return { success: true };
    }

    levelUpDusk(duskId) {
        const dusk = this.dusks.get(duskId);
        if (!dusk) return { success: false, error: 'DUSK_NOT_FOUND' };
        dusk.level++;
        this._triggerHook('duskLeveledUp', { duskId, newLevel: dusk.level });
        return { success: true };
    }

    legendDusk(duskId) {
        const dusk = this.dusks.get(duskId);
        if (!dusk) return { success: false, error: 'DUSK_NOT_FOUND' };
        dusk.status = 'legendary';
        this._triggerHook('duskLegendized', { duskId });
        return { success: true };
    }

    calculateDuskValue(duskId) {
        const dusk = this.dusks.get(duskId);
        if (!dusk) return 0;
        return dusk.level * 100 + dusk.shadow * 2 + dusk.afterglows.length * 30;
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
        if (this.stats.totalDusks < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDusks += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { dusks: Array.from(this.dusks.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.dusks) this.dusks = new Map(data.dusks);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, duskCount: this.dusks.size }; }
}
