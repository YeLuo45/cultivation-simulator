/**
 * CultivationDawn.js - 修真黎明系统
 * V815 Iteration 18/30 Round 32
 */
export class CultivationDawn {
    constructor(config = {}) {
        this.config = { maxDawns: config.maxDawns || 20, baseLight: config.baseLight || 20, ...config };
        this.dawns = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDawns: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDawn', (ctx) => this.getDawn(ctx.dawnId));
        this.registerTool('recruitDawn', (ctx) => this.recruitDawn(ctx));
    }

    recruitDawn(data) {
        const id = data.dawnId || `dwn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const dawn = {
            dawnId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Dawn',
            type: data.type || 'early',
            light: data.light || this.config.baseLight,
            visions: data.visions || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.dawns.set(id, dawn);
        this.stats.totalDawns++;
        this._triggerHook('dawnRecruited', { dawnId: id });
        return { success: true, dawn };
    }

    getDawn(id) { return this.dawns.get(id) ? { ...this.dawns.get(id) } : null; }
    listDawns() { return Array.from(this.dawns.values()).map(d => ({ ...d })); }
    listByMaster(masterId) { return Array.from(this.dawns.values()).filter(d => d.masterId === masterId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.dawns.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addVision(dawnId, vision) {
        const dawn = this.dawns.get(dawnId);
        if (!dawn) return { success: false, error: 'DAWN_NOT_FOUND' };
        dawn.visions.push(vision);
        this._triggerHook('visionAdded', { dawnId, vision });
        return { success: true };
    }

    raiseLight(dawnId, amount = 5) {
        const dawn = this.dawns.get(dawnId);
        if (!dawn) return { success: false, error: 'DAWN_NOT_FOUND' };
        dawn.light += amount;
        this._triggerHook('lightRaised', { dawnId, newLight: dawn.light });
        return { success: true };
    }

    levelUpDawn(dawnId) {
        const dawn = this.dawns.get(dawnId);
        if (!dawn) return { success: false, error: 'DAWN_NOT_FOUND' };
        dawn.level++;
        this._triggerHook('dawnLeveledUp', { dawnId, newLevel: dawn.level });
        return { success: true };
    }

    legendDawn(dawnId) {
        const dawn = this.dawns.get(dawnId);
        if (!dawn) return { success: false, error: 'DAWN_NOT_FOUND' };
        dawn.status = 'legendary';
        this._triggerHook('dawnLegendized', { dawnId });
        return { success: true };
    }

    calculateDawnValue(dawnId) {
        const dawn = this.dawns.get(dawnId);
        if (!dawn) return 0;
        return dawn.level * 100 + dawn.light * 2 + dawn.visions.length * 30;
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
        if (this.stats.totalDawns < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDawns += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { dawns: Array.from(this.dawns.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.dawns) this.dawns = new Map(data.dawns);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, dawnCount: this.dawns.size }; }
}
