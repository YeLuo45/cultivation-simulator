/**
 * CultivationMud.js - 修真泥系统
 * V846 Iteration 19/30 Round 33
 */
export class CultivationMud {
    constructor(config = {}) {
        this.config = { maxMuds: config.maxMuds || 20, baseViscosity: config.baseViscosity || 20, ...config };
        this.muds = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMuds: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMud', (ctx) => this.getMud(ctx.mudId));
        this.registerTool('recruitMud', (ctx) => this.recruitMud(ctx));
    }

    recruitMud(data = {}) {
        if (this.muds.size >= this.config.maxMuds) {
            return { success: false, error: 'MAX_MUDS_REACHED' };
        }
        const id = data.mudId || `mud_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const mud = {
            mudId: id,
            masterId: data.masterId || null,
            name: data.name || `Mud-${id.slice(-5)}`,
            type: data.type || 'river',
            viscosity: data.viscosity !== undefined ? data.viscosity : this.config.baseViscosity,
            footprints: Array.isArray(data.footprints) ? [...data.footprints] : [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.muds.set(id, mud);
        this.stats.totalMuds++;
        this._triggerHook('mudRecruited', { mudId: id, masterId: mud.masterId });
        return { success: true, mud };
    }

    getMud(id) { return this.muds.get(id) ? { ...this.muds.get(id) } : null; }
    listMuds() { return Array.from(this.muds.values()).map(m => ({ ...m })); }
    listByMaster(masterId) { return Array.from(this.muds.values()).filter(m => m.masterId === masterId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.muds.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addFootprint(mudId, footprint) {
        const mud = this.muds.get(mudId);
        if (!mud) return { success: false, error: 'MUD_NOT_FOUND' };
        mud.footprints.push(footprint);
        this._triggerHook('footprintAdded', { mudId, footprint, totalFootprints: mud.footprints.length });
        return { success: true };
    }

    raiseViscosity(mudId, amount = 5) {
        const mud = this.muds.get(mudId);
        if (!mud) return { success: false, error: 'MUD_NOT_FOUND' };
        mud.viscosity += amount;
        this._triggerHook('viscosityRaised', { mudId, newViscosity: mud.viscosity });
        return { success: true };
    }

    levelUpMud(mudId) {
        const mud = this.muds.get(mudId);
        if (!mud) return { success: false, error: 'MUD_NOT_FOUND' };
        mud.level++;
        this._triggerHook('mudLeveledUp', { mudId, newLevel: mud.level });
        return { success: true };
    }

    legendMud(mudId) {
        const mud = this.muds.get(mudId);
        if (!mud) return { success: false, error: 'MUD_NOT_FOUND' };
        mud.status = 'legendary';
        this._triggerHook('mudLegendized', { mudId });
        return { success: true };
    }

    calculateMudValue(mudId) {
        const mud = this.muds.get(mudId);
        if (!mud) return 0;
        return mud.level * 100 + mud.viscosity * 2 + mud.footprints.length * 30;
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
        if (this.stats.totalMuds < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMuds += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { muds: Array.from(this.muds.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.muds) this.muds = new Map(data.muds);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, mudCount: this.muds.size }; }
}
