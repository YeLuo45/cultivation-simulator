/**
 * CultivationPierce.js - 修真刺穿
 * V734 Iteration 27/30 Round 29 - Cultivation Pierce
 */
export class CultivationPierce {
    constructor(config = {}) {
        this.config = { maxPierces: config.maxPierces || 30, baseSharpness: config.baseSharpness || 20, ...config };
        this.pierces = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPierces: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPierce', (ctx) => this.getPierce(ctx.pierceId));
        this.registerTool('recruitPierce', (ctx) => this.recruitPierce(ctx));
    }

    recruitPierce(data) {
        const id = data.id || `prc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const pierce = {
            pierceId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Pierce',
            type: data.type || 'arrow',
            sharpness: data.sharpness || this.config.baseSharpness,
            penetrations: data.penetrations || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.pierces.set(id, pierce);
        this.stats.totalPierces++;
        this._triggerHook('pierceRecruited', { pierceId: id });
        return { success: true, pierce };
    }

    getPierce(id) { return this.pierces.get(id) ? { ...this.pierces.get(id) } : null; }
    listPierces() { return Array.from(this.pierces.values()).map(p => ({ ...p })); }
    listByMaster(masterId) { return Array.from(this.pierces.values()).filter(p => p.masterId === masterId).map(p => ({ ...p })); }
    listByType(type) { return Array.from(this.pierces.values()).filter(p => p.type === type).map(p => ({ ...p })); }
    listLegendary() { return Array.from(this.pierces.values()).filter(p => p.status === 'legendary').map(p => ({ ...p })); }

    addPenetration(pierceId, penetration) {
        const pierce = this.pierces.get(pierceId);
        if (!pierce) return { success: false, error: 'PIERCE_NOT_FOUND' };
        pierce.penetrations.push(penetration);
        this._triggerHook('penetrationAdded', { pierceId, penetration });
        return { success: true };
    }

    raiseSharpness(pierceId, amount = 5) {
        const pierce = this.pierces.get(pierceId);
        if (!pierce) return { success: false, error: 'PIERCE_NOT_FOUND' };
        pierce.sharpness += amount;
        this._triggerHook('sharpnessRaised', { pierceId, newSharpness: pierce.sharpness });
        return { success: true };
    }

    levelUpPierce(pierceId) {
        const pierce = this.pierces.get(pierceId);
        if (!pierce) return { success: false, error: 'PIERCE_NOT_FOUND' };
        pierce.level++;
        this._triggerHook('pierceLeveledUp', { pierceId, newLevel: pierce.level });
        return { success: true };
    }

    veteranPierce(pierceId) {
        const pierce = this.pierces.get(pierceId);
        if (!pierce) return { success: false, error: 'PIERCE_NOT_FOUND' };
        pierce.status = 'veteran';
        this._triggerHook('pierceVeteranized', { pierceId });
        return { success: true };
    }

    legendPierce(pierceId) {
        const pierce = this.pierces.get(pierceId);
        if (!pierce) return { success: false, error: 'PIERCE_NOT_FOUND' };
        pierce.status = 'legendary';
        this._triggerHook('pierceLegendized', { pierceId });
        return { success: true };
    }

    calculatePierceValue(pierceId) {
        const pierce = this.pierces.get(pierceId);
        if (!pierce) return 0;
        return pierce.level * 100 + pierce.sharpness * 2 + pierce.penetrations.length * 30;
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
        if (this.stats.totalPierces < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPierces += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { pierces: Array.from(this.pierces.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.pierces) this.pierces = new Map(data.pierces);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, pierceCount: this.pierces.size }; }
}
