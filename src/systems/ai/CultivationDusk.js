/**
 * CultivationDusk.js - 修真暮系统
 * V584 Iteration 7/20 Round 24
 */
export class CultivationDusk {
    constructor(config = {}) {
        this.config = { maxDusks: config.maxDusks || 30, baseShadow: config.baseShadow || 20, ...config };
        this.dusks = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDusks: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDusk', (ctx) => this.getDusk(ctx.duskId));
        this.registerTool('openDusk', (ctx) => this.openDusk(ctx));
    }

    openDusk(data) {
        const id = data.duskId || `dsk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const dusk = {
            duskId: id,
            observerId: data.observerId,
            name: data.name || 'Unnamed Dusk',
            type: data.type || 'golden',
            shadow: data.shadow || this.config.baseShadow,
            visions: data.visions || [],
            level: 1,
            status: 'approaching',
            createdAt: Date.now()
        };
        this.dusks.set(id, dusk);
        this.stats.totalDusks++;
        this._triggerHook('duskOpened', { duskId: id });
        return { success: true, dusk };
    }

    getDusk(id) { return this.dusks.get(id) ? { ...this.dusks.get(id) } : null; }
    listDusks() { return Array.from(this.dusks.values()).map(d => ({ ...d })); }
    listByObserver(observerId) { return Array.from(this.dusks.values()).filter(d => d.observerId === observerId).map(d => ({ ...d })); }
    listActive() { return Array.from(this.dusks.values()).filter(d => d.status === 'active' || d.status === 'eternal').map(d => ({ ...d })); }

    addVision(duskId, vision) {
        const dusk = this.dusks.get(duskId);
        if (!dusk) return { success: false, error: 'DUSK_NOT_FOUND' };
        dusk.visions.push(vision);
        this._triggerHook('visionAdded', { duskId, vision });
        return { success: true };
    }

    deepenShadow(duskId, amount = 5) {
        const dusk = this.dusks.get(duskId);
        if (!dusk) return { success: false, error: 'DUSK_NOT_FOUND' };
        dusk.shadow += amount;
        this._triggerHook('shadowDeepened', { duskId, newShadow: dusk.shadow });
        return { success: true };
    }

    levelUpDusk(duskId) {
        const dusk = this.dusks.get(duskId);
        if (!dusk) return { success: false, error: 'DUSK_NOT_FOUND' };
        dusk.level++;
        this._triggerHook('duskLeveledUp', { duskId, newLevel: dusk.level });
        return { success: true };
    }

    eternalizeDusk(duskId) {
        const dusk = this.dusks.get(duskId);
        if (!dusk) return { success: false, error: 'DUSK_NOT_FOUND' };
        dusk.status = 'eternal';
        this._triggerHook('duskEternalized', { duskId });
        return { success: true };
    }

    calculateDuskValue(duskId) {
        const dusk = this.dusks.get(duskId);
        if (!dusk) return 0;
        return dusk.level * 100 + dusk.shadow * 2 + dusk.visions.length * 30;
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
