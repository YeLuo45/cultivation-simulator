/**
 * CultivationDruid.js - 修真德鲁伊系统
 * V610 Iteration 13/20 Round 25
 */
export class CultivationDruid {
    constructor(config = {}) {
        this.config = { maxDruids: config.maxDruids || 50, baseNature: config.baseNature || 20, ...config };
        this.druids = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDruids: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDruid', (ctx) => this.getDruid(ctx.druidId));
        this.registerTool('recruitDruid', (ctx) => this.recruitDruid(ctx));
    }

    recruitDruid(data) {
        const id = data.druidId || `dru_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const druid = { druidId: id, mentorId: data.mentorId, name: data.name || 'Mystic Druid', type: data.type || 'forest', nature: data.nature || this.config.baseNature, shapes: data.shapes || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.druids.set(id, druid);
        this.stats.totalDruids++;
        this._triggerHook('druidRecruited', { druidId: id });
        return { success: true, druid };
    }

    getDruid(id) { return this.druids.get(id) ? { ...this.druids.get(id) } : null; }
    listDruids() { return Array.from(this.druids.values()).map(d => ({ ...d })); }
    listByMentor(mentorId) { return Array.from(this.druids.values()).filter(d => d.mentorId === mentorId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.druids.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addShape(druidId, shape) {
        const druid = this.druids.get(druidId);
        if (!druid) return { success: false, error: 'DRUID_NOT_FOUND' };
        druid.shapes.push(shape);
        this._triggerHook('shapeAdded', { druidId, shape });
        return { success: true };
    }

    deepenNature(druidId, amount = 5) {
        const druid = this.druids.get(druidId);
        if (!druid) return { success: false, error: 'DRUID_NOT_FOUND' };
        druid.nature += amount;
        this._triggerHook('natureDeepened', { druidId, newNature: druid.nature });
        return { success: true };
    }

    levelUpDruid(druidId) {
        const druid = this.druids.get(druidId);
        if (!druid) return { success: false, error: 'DRUID_NOT_FOUND' };
        druid.level++;
        this._triggerHook('druidLeveledUp', { druidId, newLevel: druid.level });
        return { success: true };
    }

    legendDruid(druidId) {
        const druid = this.druids.get(druidId);
        if (!druid) return { success: false, error: 'DRUID_NOT_FOUND' };
        druid.status = 'legendary';
        this._triggerHook('druidLegendized', { druidId });
        return { success: true };
    }

    calculateDruidValue(druidId) {
        const druid = this.druids.get(druidId);
        if (!druid) return 0;
        return druid.level * 100 + druid.nature * 2 + druid.shapes.length * 30;
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
        if (this.stats.totalDruids < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDruids += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { druids: Array.from(this.druids.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.druids) this.druids = new Map(data.druids);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, druidCount: this.druids.size }; }
}
