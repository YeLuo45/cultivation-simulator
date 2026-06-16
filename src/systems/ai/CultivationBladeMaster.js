/**
 * CultivationBladeMaster.js - 修真刀圣系统
 * V635 Iteration 18/30 Round 26
 */
export class CultivationBladeMaster {
    constructor(config = {}) {
        this.config = { maxBladeMasters: config.maxBladeMasters || 30, baseBladeAura: config.baseBladeAura || 20, ...config };
        this.blademasters = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBladeMasters: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBladeMaster', (ctx) => this.getBladeMaster(ctx.masterId));
        this.registerTool('recruitBladeMaster', (ctx) => this.recruitBladeMaster(ctx));
    }

    recruitBladeMaster(data) {
        const id = data.masterId || `bdm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const master = {
            masterId: id,
            masterId2: data.masterId2 || null,
            name: data.name || `BladeMaster_${id.slice(-5)}`,
            type: data.type || 'single',
            bladeAura: data.bladeAura !== undefined ? data.bladeAura : this.config.baseBladeAura,
            blades: data.blades || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.blademasters.set(id, master);
        this.stats.totalBladeMasters++;
        this._triggerHook('bladeMasterRecruited', { masterId: id });
        return { success: true, master };
    }

    getBladeMaster(id) { return this.blademasters.get(id) ? { ...this.blademasters.get(id) } : null; }
    listBladeMasters() { return Array.from(this.blademasters.values()).map(b => ({ ...b })); }
    listByMaster(masterId2) { return Array.from(this.blademasters.values()).filter(b => b.masterId2 === masterId2).map(b => ({ ...b })); }
    listLegendary() { return Array.from(this.blademasters.values()).filter(b => b.status === 'legendary').map(b => ({ ...b })); }

    addBlade(masterId, blade) {
        const master = this.blademasters.get(masterId);
        if (!master) return { success: false, error: 'BLADE_MASTER_NOT_FOUND' };
        master.blades.push(blade);
        this._triggerHook('bladeAdded', { masterId, blade });
        return { success: true };
    }

    sharpenAura(masterId, amount = 5) {
        const master = this.blademasters.get(masterId);
        if (!master) return { success: false, error: 'BLADE_MASTER_NOT_FOUND' };
        master.bladeAura += amount;
        this._triggerHook('auraSharpened', { masterId, newBladeAura: master.bladeAura });
        return { success: true };
    }

    levelUpBladeMaster(masterId) {
        const master = this.blademasters.get(masterId);
        if (!master) return { success: false, error: 'BLADE_MASTER_NOT_FOUND' };
        master.level++;
        this._triggerHook('bladeMasterLeveledUp', { masterId, newLevel: master.level });
        return { success: true };
    }

    legendBladeMaster(masterId) {
        const master = this.blademasters.get(masterId);
        if (!master) return { success: false, error: 'BLADE_MASTER_NOT_FOUND' };
        master.status = 'legendary';
        this._triggerHook('bladeMasterLegendized', { masterId });
        return { success: true };
    }

    calculateBladeMasterValue(masterId) {
        const master = this.blademasters.get(masterId);
        if (!master) return 0;
        return master.level * 100 + master.bladeAura * 2 + master.blades.length * 30;
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
        if (this.stats.totalBladeMasters < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBladeMasters += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { blademasters: Array.from(this.blademasters.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.blademasters) this.blademasters = new Map(data.blademasters);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, bladeMasterCount: this.blademasters.size }; }
}
